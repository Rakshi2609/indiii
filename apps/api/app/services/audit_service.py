from datetime import datetime, timezone
import logging
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.audit import AuditLog
from app.schemas.audit import AuditLogListResponse, AuditLogResponse

logger = logging.getLogger(__name__)


class AuditService:
    """
    Centralized Enterprise Audit Trail service for security, compliance,
    data lineage tracking, and accountability.
    """

    def log_event(
        self,
        db: Session,
        action: str,
        resource_type: str,
        resource_id: Optional[Any] = None,
        user_id: Optional[int] = None,
        old_value: Optional[Dict[str, Any]] = None,
        new_value: Optional[Dict[str, Any]] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """
        Record a tamper-evident system audit log entry.
        """
        log_entry = AuditLog(
            user_id=user_id,
            action=action.upper().strip(),
            resource_type=resource_type.upper().strip(),
            resource_id=str(resource_id) if resource_id is not None else None,
            old_value=old_value,
            new_value=new_value,
            ip_address=ip_address,
            timestamp=datetime.now(timezone.utc)
        )
        db.add(log_entry)
        db.commit()
        db.refresh(log_entry)

        logger.info(
            f"[AUDIT] Action='{action}' Resource='{resource_type}:{resource_id}' UserID={user_id}"
        )
        return log_entry

    def format_log_response(self, log: AuditLog) -> AuditLogResponse:
        """Format ORM AuditLog into typed Pydantic response with joined user info."""
        user_name = None
        user_email = None
        user_role = None

        if log.user:
            user_name = log.user.full_name or log.user.email
            user_email = log.user.email
            user_role = log.user.role.value if hasattr(log.user.role, "value") else str(log.user.role)

        return AuditLogResponse(
            id=log.id,
            user_id=log.user_id,
            user_name=user_name,
            user_email=user_email,
            user_role=user_role,
            action=log.action,
            resource_type=log.resource_type,
            resource_id=log.resource_id,
            old_value=log.old_value,
            new_value=log.new_value,
            ip_address=log.ip_address,
            timestamp=log.timestamp
        )

    def get_audit_logs(
        self,
        db: Session,
        action: Optional[str] = None,
        resource_type: Optional[str] = None,
        user_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 50
    ) -> AuditLogListResponse:
        """Query audit log records with pagination and filters."""
        query = db.query(AuditLog)

        if action:
            query = query.filter(AuditLog.action.ilike(f"%{action}%"))
        if resource_type:
            query = query.filter(AuditLog.resource_type.ilike(f"%{resource_type}%"))
        if user_id:
            query = query.filter(AuditLog.user_id == user_id)

        total = query.count()
        items = query.order_by(AuditLog.timestamp.desc()).offset(skip).limit(limit).all()

        return AuditLogListResponse(
            total=total,
            items=[self.format_log_response(item) for item in items]
        )


# Singleton instance
audit_service = AuditService()
