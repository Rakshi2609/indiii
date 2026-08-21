from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.audit import VerificationAction, VerificationAuditLog
from app.models.document import Document
from app.models.record import LandRecord
from app.models.validation import IssueSeverity, ValidationResult, ValidationStatus
from app.schemas.record import LandRecordResponse
from app.schemas.verification import (
    VerificationAuditLogResponse,
    VerificationDetailResponse,
    VerificationQueueItem,
    VerificationQueueResponse,
)
from app.services.validation_service import validation_service

logger = logging.getLogger(__name__)


class VerificationService:
    """
    Handles officer verification workflows, human-in-the-loop field corrections,
    audit trail logging, and Active Learning feedback capture.
    """

    def get_verification_queue(
        self,
        db: Session,
        status_filter: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> VerificationQueueResponse:
        """
        Fetch records requiring human officer review (e.g. flagged with warnings, conflicts, or low confidence).
        """
        query = db.query(LandRecord)

        if status_filter:
            query = query.filter(LandRecord.validation_status == status_filter)

        total = query.count()
        # Order items needing attention first (flagged or lower confidence)
        items = query.order_by(
            LandRecord.overall_confidence_score.asc(),
            LandRecord.created_at.desc()
        ).offset(skip).limit(limit).all()

        queue_items: List[VerificationQueueItem] = []
        pending_count = 0

        for r in items:
            doc = r.document
            v_results = r.validation_results or []
            crit_count = sum(1 for v in v_results if v.severity == IssueSeverity.CRITICAL and v.status == ValidationStatus.PENDING)
            
            if r.validation_status not in ["VERIFIED_MANUAL", "VERIFIED_CORRECTED"]:
                pending_count += 1

            queue_items.append(
                VerificationQueueItem(
                    record_id=r.id,
                    document_id=r.document_id,
                    filename=doc.filename if doc else "unknown",
                    original_name=doc.original_name if doc else "Unknown Deed",
                    state=r.state,
                    district=r.district,
                    village=r.village,
                    survey_number=r.survey_number,
                    overall_confidence_score=r.overall_confidence_score,
                    validation_status=r.validation_status,
                    total_issues=len(v_results),
                    critical_issues=crit_count,
                    created_at=r.created_at
                )
            )

        return VerificationQueueResponse(
            total=total,
            pending_count=pending_count,
            items=queue_items
        )

    def get_verification_detail(
        self,
        record_id: int,
        db: Session
    ) -> VerificationDetailResponse:
        """Fetch detailed record metadata, original file link, evidence, and audit logs."""
        from app.api.records import format_record_response

        record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Land record with ID {record_id} not found."
            )

        doc = record.document
        if not doc:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Associated document for record {record_id} not found."
            )

        # Build formatted record response
        formatted_record = format_record_response(record)

        # Audit history
        audit_records = db.query(VerificationAuditLog).filter(
            VerificationAuditLog.record_id == record_id
        ).order_by(VerificationAuditLog.created_at.desc()).all()

        audit_responses = []
        for a in audit_records:
            officer_name = a.officer.full_name or a.officer.email if a.officer else "Reviewing Officer"
            audit_responses.append(
                VerificationAuditLogResponse(
                    id=a.id,
                    record_id=a.record_id,
                    officer_id=a.officer_id,
                    officer_name=officer_name,
                    action=a.action,
                    original_values=a.original_values,
                    corrected_values=a.corrected_values,
                    notes=a.notes,
                    created_at=a.created_at
                )
            )

        requires_attention = (
            record.overall_confidence_score < 0.85
            or record.validation_status in ["FLAGGED_FOR_REVIEW", "REJECTED_CRITICAL", "VERIFIED_WITH_WARNINGS"]
        )

        return VerificationDetailResponse(
            record=formatted_record,
            document_file_url=f"/api/documents/{doc.id}/file",
            mime_type=doc.mime_type,
            original_name=doc.original_name,
            file_size=doc.file_size,
            requires_attention=requires_attention,
            audit_history=audit_responses
        )

    def approve_record(
        self,
        record_id: int,
        officer_id: Optional[int],
        notes: Optional[str],
        db: Session
    ) -> Tuple[LandRecord, VerificationAuditLog]:
        """Approve and mark a land record as verified by officer."""
        record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Land record with ID {record_id} not found."
            )

        previous_status = record.validation_status
        record.validation_status = "VERIFIED_MANUAL"
        record.overall_confidence_score = 1.0

        # Mark all pending validation results as resolved
        for v in (record.validation_results or []):
            if v.status == ValidationStatus.PENDING:
                v.status = ValidationStatus.RESOLVED
                v.description = f"{v.description or ''} (Resolved via Officer Approval)"

        audit_entry = VerificationAuditLog(
            record_id=record.id,
            officer_id=officer_id,
            action=VerificationAction.APPROVE,
            original_values={"validation_status": previous_status},
            corrected_values={"validation_status": "VERIFIED_MANUAL"},
            notes=notes or "Approved by verification officer without edits."
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(record)
        db.refresh(audit_entry)

        logger.info(f"Record {record.id} APPROVED by officer {officer_id}.")
        return record, audit_entry

    def correct_record(
        self,
        record_id: int,
        corrected_fields: Dict[str, Any],
        officer_id: Optional[int],
        notes: Optional[str],
        db: Session
    ) -> Tuple[LandRecord, VerificationAuditLog]:
        """Apply human corrections to a land record and log diff in audit trail."""
        record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Land record with ID {record_id} not found."
            )

        previous_status = record.validation_status
        original_diff: Dict[str, Any] = {}
        applied_diff: Dict[str, Any] = {}

        # Allowed updatable top-level fields
        direct_fields = {
            "state", "district", "taluk", "village", "sub_registrar_office",
            "survey_number", "hissa_number", "gat_number", "khata_number",
            "total_area", "cultivable_area", "uncultivable_area", "area_unit",
            "land_tenure", "assessment_tax", "owners_data", "mutations_data", "encumbrances_data"
        }

        for key, val in corrected_fields.items():
            if key in direct_fields:
                old_val = getattr(record, key, None)
                if old_val != val:
                    original_diff[key] = old_val
                    applied_diff[key] = val
                    setattr(record, key, val)

        # Mark all pending validation results as resolved
        for v in (record.validation_results or []):
            if v.status == ValidationStatus.PENDING:
                v.status = ValidationStatus.RESOLVED
                v.description = f"{v.description or ''} (Resolved via Officer Correction)"

        record.validation_status = "VERIFIED_CORRECTED"
        record.overall_confidence_score = 1.0

        audit_entry = VerificationAuditLog(
            record_id=record.id,
            officer_id=officer_id,
            action=VerificationAction.CORRECT,
            original_values=original_diff or {"validation_status": previous_status},
            corrected_values=applied_diff or {"validation_status": "VERIFIED_CORRECTED"},
            notes=notes or "Corrected and verified by officer."
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(record)
        db.refresh(audit_entry)

        logger.info(f"Record {record.id} CORRECTED & VERIFIED by officer {officer_id} (Diff: {list(applied_diff.keys())}).")
        return record, audit_entry

    def reject_record(
        self,
        record_id: int,
        officer_id: Optional[int],
        reason: str,
        notes: Optional[str],
        db: Session
    ) -> Tuple[LandRecord, VerificationAuditLog]:
        """Reject a record as fraudulent, illegible, or non-viable."""
        record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
        if not record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Land record with ID {record_id} not found."
            )

        previous_status = record.validation_status
        record.validation_status = "REJECTED_MANUAL"

        audit_entry = VerificationAuditLog(
            record_id=record.id,
            officer_id=officer_id,
            action=VerificationAction.REJECT,
            original_values={"validation_status": previous_status},
            corrected_values={"validation_status": "REJECTED_MANUAL", "rejection_reason": reason},
            notes=f"Rejection Reason: {reason}\n{notes or ''}".strip()
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(record)
        db.refresh(audit_entry)

        logger.info(f"Record {record.id} REJECTED by officer {officer_id}. Reason: {reason}")
        return record, audit_entry


# Singleton instance
verification_service = VerificationService()
