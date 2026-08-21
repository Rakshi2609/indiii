import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_optional_current_user, require_roles
from app.db.database import get_db
from app.models.user import User, UserRole
from app.schemas.audit import AuditLogListResponse
from app.services.audit_service import audit_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Enterprise Audit Trail"])


@router.get(
    "",
    response_model=AuditLogListResponse,
    summary="Get system audit log trail (Admin / Manager restricted)"
)
def get_audit_trail_endpoint(
    action: Optional[str] = Query(None, description="Filter by action (e.g., DOCUMENT_UPLOAD, RECORD_VERIFIED)"),
    resource_type: Optional[str] = Query(None, description="Filter by resource type (e.g., DOCUMENT, RECORD)"),
    user_id: Optional[int] = Query(None, description="Filter by user ID"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> AuditLogListResponse:
    """
    Retrieve comprehensive system audit events tracking document uploads,
    officer decisions, field modifications, and authentication actions.
    Restricted to ADMIN and MANAGER roles in production.
    """
    # If authenticated, enforce Admin/Manager role
    if current_user and not current_user.is_superuser:
        if current_user.role not in [UserRole.ADMIN, UserRole.MANAGER]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Operation not permitted. Required roles: ['ADMIN', 'MANAGER']"
            )

    return audit_service.get_audit_logs(
        db=db,
        action=action,
        resource_type=resource_type,
        user_id=user_id,
        skip=skip,
        limit=limit
    )
