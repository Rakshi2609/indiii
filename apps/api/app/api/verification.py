import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_optional_current_user
from app.db.database import get_db
from app.models.audit import VerificationAction
from app.models.user import User, UserRole
from app.schemas.verification import (
    VerificationActionResponse,
    VerificationApproveRequest,
    VerificationCorrectionRequest,
    VerificationDetailResponse,
    VerificationQueueResponse,
    VerificationRejectRequest,
)
from app.services.audit_service import audit_service
from app.services.verification_service import verification_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Human Verification & Active Learning"])


@router.get(
    "/queue",
    response_model=VerificationQueueResponse,
    summary="List land records awaiting human verification"
)
def get_verification_queue_endpoint(
    status_filter: Optional[str] = Query(None, description="Filter by validation status"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
) -> VerificationQueueResponse:
    """Retrieve queue of land records prioritizing flagged or low-confidence records."""
    return verification_service.get_verification_queue(
        db=db,
        status_filter=status_filter,
        skip=skip,
        limit=limit
    )


@router.get(
    "/{record_id}",
    response_model=VerificationDetailResponse,
    summary="Fetch full verification workspace data for a record"
)
def get_verification_detail_endpoint(
    record_id: int,
    db: Session = Depends(get_db)
) -> VerificationDetailResponse:
    """Retrieve complete side-by-side inspection data: file stream, structured entities, citations, and validation issues."""
    return verification_service.get_verification_detail(record_id=record_id, db=db)


@router.post(
    "/{record_id}/approve",
    response_model=VerificationActionResponse,
    summary="Approve extracted record without changes"
)
def approve_record_endpoint(
    record_id: int,
    request: Request,
    payload: Optional[VerificationApproveRequest] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> VerificationActionResponse:
    """Mark record as officially verified by a revenue/verification officer."""
    officer_id = current_user.id if current_user else None
    notes = payload.notes if payload else "Approved by verification officer."

    record, audit_log = verification_service.approve_record(
        record_id=record_id,
        officer_id=officer_id,
        notes=notes,
        db=db
    )

    # General system audit log
    audit_service.log_event(
        db=db,
        action="RECORD_APPROVE",
        resource_type="RECORD",
        resource_id=record.id,
        user_id=officer_id,
        old_value=audit_log.original_values,
        new_value={"validation_status": record.validation_status, "notes": notes},
        ip_address=request.client.host if request.client else None
    )

    return VerificationActionResponse(
        message="Record successfully approved and verified.",
        record_id=record.id,
        action=VerificationAction.APPROVE,
        previous_status=audit_log.original_values.get("validation_status", "UNKNOWN"),
        new_status=record.validation_status,
        audit_log_id=audit_log.id,
        timestamp=audit_log.created_at
    )


@router.post(
    "/{record_id}/correct",
    response_model=VerificationActionResponse,
    summary="Apply human corrections to extracted fields and verify"
)
def correct_record_endpoint(
    record_id: int,
    request: Request,
    payload: VerificationCorrectionRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> VerificationActionResponse:
    """
    Apply officer-edited field corrections, resolve validation flags,
    and persist correction audit diff for model retraining.
    """
    officer_id = current_user.id if current_user else None

    record, audit_log = verification_service.correct_record(
        record_id=record_id,
        corrected_fields=payload.corrected_fields,
        officer_id=officer_id,
        notes=payload.notes,
        db=db
    )

    # General system audit log
    audit_service.log_event(
        db=db,
        action="RECORD_CORRECT",
        resource_type="RECORD",
        resource_id=record.id,
        user_id=officer_id,
        old_value=audit_log.original_values,
        new_value=audit_log.corrected_values,
        ip_address=request.client.host if request.client else None
    )

    return VerificationActionResponse(
        message=f"Record updated with {len(payload.corrected_fields)} corrected field(s) and marked verified.",
        record_id=record.id,
        action=VerificationAction.CORRECT,
        previous_status=audit_log.original_values.get("validation_status", "UNKNOWN"),
        new_status=record.validation_status,
        audit_log_id=audit_log.id,
        timestamp=audit_log.created_at
    )


@router.post(
    "/{record_id}/reject",
    response_model=VerificationActionResponse,
    summary="Reject land record with rationale"
)
def reject_record_endpoint(
    record_id: int,
    request: Request,
    payload: VerificationRejectRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> VerificationActionResponse:
    """Mark a record as rejected due to severe defect, illegibility, or detected fraud."""
    officer_id = current_user.id if current_user else None

    record, audit_log = verification_service.reject_record(
        record_id=record_id,
        officer_id=officer_id,
        reason=payload.reason,
        notes=payload.notes,
        db=db
    )

    # General system audit log
    audit_service.log_event(
        db=db,
        action="RECORD_REJECT",
        resource_type="RECORD",
        resource_id=record.id,
        user_id=officer_id,
        old_value=audit_log.original_values,
        new_value=audit_log.corrected_values,
        ip_address=request.client.host if request.client else None
    )

    return VerificationActionResponse(
        message="Record successfully rejected.",
        record_id=record.id,
        action=VerificationAction.REJECT,
        previous_status=audit_log.original_values.get("validation_status", "UNKNOWN"),
        new_status=record.validation_status,
        audit_log_id=audit_log.id,
        timestamp=audit_log.created_at
    )
