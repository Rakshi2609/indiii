from datetime import datetime
from typing import Any, Dict, List, Optional
from sqlalchemy import (
    String, Integer, Float, DateTime, ForeignKey, Text, JSON, func
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class LandRecord(Base):
    __tablename__ = "land_records"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    document_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("documents.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True
    )

    # Administrative Grouping
    state: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    taluk: Mapped[Optional[str]] = mapped_column(String(100), nullable=True, index=True)
    village: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    sub_registrar_office: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)

    # Land Identifiers & Measurements Grouping
    survey_number: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    hissa_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gat_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    khata_number: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    total_area: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    cultivable_area: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    uncultivable_area: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    area_unit: Mapped[str] = mapped_column(String(50), default="hectares", nullable=False)
    land_tenure: Mapped[Optional[str]] = mapped_column(String(150), nullable=True)
    assessment_tax: Mapped[Optional[float]] = mapped_column(Float, nullable=True)

    # Structured Payloads (Owners, Mutations, Encumbrances)
    owners_data: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    mutations_data: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    encumbrances_data: Mapped[Optional[List[Dict[str, Any]]]] = mapped_column(JSON, nullable=True)
    raw_extracted_payload: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    # Timestamps
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

    # Relationships
    document = relationship("Document", backref="land_record", lazy="joined")
    evidence_items = relationship(
        "Evidence",
        back_populates="record",
        cascade="all, delete-orphan",
        lazy="selectin"
    )

    def __repr__(self) -> str:
        return f"<LandRecord(id={self.id}, survey='{self.survey_number}', village='{self.village}', district='{self.district}')>"


class Evidence(Base):
    """
    Evidence model storing field-level citations, source text fragments,
    confidence scores, and bounding boxes for complete AI explainability and auditability.
    """
    __tablename__ = "evidence"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    record_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("land_records.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    field_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    extracted_value: Mapped[str] = mapped_column(Text, nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=1.0, nullable=False)
    source_text: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    bounding_box: Mapped[Optional[Dict[str, Any]]] = mapped_column(JSON, nullable=True)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )

    # Relationship
    record = relationship("LandRecord", back_populates="evidence_items")

    def __repr__(self) -> str:
        return f"<Evidence(id={self.id}, field='{self.field_name}', confidence={self.confidence_score})>"
