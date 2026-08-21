from datetime import datetime
from enum import Enum
from typing import Optional
from sqlalchemy import (
    String, Integer, Float, DateTime, Enum as SAEnum, ForeignKey, Text, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class IssueType(str, Enum):
    RULE = "RULE"
    DB_MATCH = "DB_MATCH"
    GIS_CONFLICT = "GIS_CONFLICT"


class IssueSeverity(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class ValidationStatus(str, Enum):
    PENDING = "PENDING"
    RESOLVED = "RESOLVED"
    IGNORED = "IGNORED"


class ValidationResult(Base):
    """
    Stores validation issues, conflict detections, and data integrity checks
    for an extracted LandRecord.
    """
    __tablename__ = "validation_results"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    record_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("land_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    issue_type: Mapped[IssueType] = mapped_column(
        SAEnum(IssueType, name="issue_type", native_enum=False),
        default=IssueType.RULE,
        nullable=False,
        index=True
    )
    field_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    expected_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    extracted_value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    severity: Mapped[IssueSeverity] = mapped_column(
        SAEnum(IssueSeverity, name="issue_severity", native_enum=False),
        default=IssueSeverity.MEDIUM,
        nullable=False,
        index=True
    )
    status: Mapped[ValidationStatus] = mapped_column(
        SAEnum(ValidationStatus, name="validation_status", native_enum=False),
        default=ValidationStatus.PENDING,
        nullable=False,
        index=True
    )
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationship
    record = relationship("LandRecord", back_populates="validation_results")

    def __repr__(self) -> str:
        return f"<ValidationResult(id={self.id}, field='{self.field_name}', severity='{self.severity}', status='{self.status}')>"
