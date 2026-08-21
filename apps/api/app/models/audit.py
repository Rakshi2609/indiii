from datetime import datetime
from enum import Enum
from typing import Any, Dict, Optional
from sqlalchemy import (
    String, Integer, DateTime, Enum as SAEnum, ForeignKey, Text, JSON, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class VerificationAction(str, Enum):
    APPROVE = "APPROVE"
    CORRECT = "CORRECT"
    REJECT = "REJECT"


class VerificationAuditLog(Base):
    """
    Audit log tracking all human verification actions, officer decisions,
    field corrections, and rationales for compliance and AI active learning.
    """
    __tablename__ = "verification_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    record_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("land_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    officer_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action: Mapped[VerificationAction] = mapped_column(
        SAEnum(VerificationAction, name="verification_action", native_enum=False),
        nullable=False,
        index=True
    )
    original_values: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    corrected_values: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationships
    record = relationship("LandRecord", backref="audit_logs")
    officer = relationship("User", backref="verification_actions", lazy="joined")

    def __repr__(self) -> str:
        return f"<VerificationAuditLog(id={self.id}, record_id={self.record_id}, action='{self.action}')>"


class AuditLog(Base):
    """
    Enterprise system audit log tracking all actions, data alterations,
    resource accesses, and security events across the Land AI platform.
    """
    __tablename__ = "system_audit_logs"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    user_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )
    action: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    resource_type: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    resource_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    old_value: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    new_value: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)
    ip_address: Mapped[Optional[str]] = mapped_column(String(45), nullable=True)
    
    timestamp: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # Relationship
    user = relationship("User", backref="system_audit_logs", lazy="joined")

    def __repr__(self) -> str:
        return f"<AuditLog(id={self.id}, action='{self.action}', resource='{self.resource_type}:{self.resource_id}')>"
