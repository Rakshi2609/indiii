import logging
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.record import Evidence, LandRecord
from app.schemas.record import (
    AdministrativeInfo,
    EncumbranceInfo,
    EvidenceSchema,
    LandInfo,
    LandRecordListResponse,
    LandRecordResponse,
    MutationInfo,
    OwnerInfo
)

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Land Records"])


def format_record_response(record: LandRecord) -> LandRecordResponse:
    """Format SQLAlchemy LandRecord ORM object into typed LandRecordResponse schema."""
    admin_info = AdministrativeInfo(
        state=record.state,
        district=record.district,
        taluk=record.taluk,
        village=record.village,
        sub_registrar_office=record.sub_registrar_office
    )
    land_info = LandInfo(
        survey_number=record.survey_number,
        hissa_number=record.hissa_number,
        gat_number=record.gat_number,
        khata_number=record.khata_number,
        total_area=record.total_area,
        cultivable_area=record.cultivable_area,
        uncultivable_area=record.uncultivable_area,
        area_unit=record.area_unit,
        land_tenure=record.land_tenure,
        assessment_tax=record.assessment_tax
    )
    owners = [OwnerInfo(**o) for o in (record.owners_data or [])]
    mutations = [MutationInfo(**m) for m in (record.mutations_data or [])]
    encumbrances = [EncumbranceInfo(**e) for e in (record.encumbrances_data or [])]
    evidence_items = [
        EvidenceSchema(
            id=ev.id,
            field_name=ev.field_name,
            extracted_value=ev.extracted_value,
            confidence_score=ev.confidence_score,
            source_text=ev.source_text,
            bounding_box=ev.bounding_box
        )
        for ev in (record.evidence_items or [])
    ]

    return LandRecordResponse(
        id=record.id,
        document_id=record.document_id,
        administrative=admin_info,
        land=land_info,
        owners=owners,
        mutations=mutations,
        encumbrances=encumbrances,
        evidence=evidence_items,
        created_at=record.created_at,
        updated_at=record.updated_at
    )


@router.get("", response_model=LandRecordListResponse, summary="List all structured land records")
def list_records(
    state: Optional[str] = Query(None, description="Filter by state"),
    district: Optional[str] = Query(None, description="Filter by district"),
    village: Optional[str] = Query(None, description="Filter by village"),
    survey_number: Optional[str] = Query(None, description="Filter by survey number"),
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db)
) -> LandRecordListResponse:
    """Retrieve structured land revenue records with spatial and administrative filters."""
    query = db.query(LandRecord)

    if state:
        query = query.filter(LandRecord.state.ilike(f"%{state}%"))
    if district:
        query = query.filter(LandRecord.district.ilike(f"%{district}%"))
    if village:
        query = query.filter(LandRecord.village.ilike(f"%{village}%"))
    if survey_number:
        query = query.filter(LandRecord.survey_number == survey_number)

    total = query.count()
    items = query.order_by(LandRecord.created_at.desc()).offset(skip).limit(limit).all()

    return LandRecordListResponse(
        total=total,
        items=[format_record_response(r) for r in items]
    )


@router.get("/{record_id}", response_model=LandRecordResponse, summary="Get structured land record by ID")
def get_record(
    record_id: int,
    db: Session = Depends(get_db)
) -> LandRecordResponse:
    """Retrieve a single land record including all ownership, mutation, encumbrance, and evidence data."""
    record = db.query(LandRecord).filter(LandRecord.id == record_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Land record with ID {record_id} not found."
        )
    return format_record_response(record)


@router.get("/by-document/{document_id}", response_model=LandRecordResponse, summary="Get land record for a document")
def get_record_by_document(
    document_id: int,
    db: Session = Depends(get_db)
) -> LandRecordResponse:
    """Retrieve the structured land record associated with a given uploaded document ID."""
    record = db.query(LandRecord).filter(LandRecord.document_id == document_id).first()
    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No structured land record found for document ID {document_id}."
        )
    return format_record_response(record)


@router.get("/{record_id}/evidence", response_model=List[EvidenceSchema], summary="Get explainability evidence for a record")
def get_record_evidence(
    record_id: int,
    db: Session = Depends(get_db)
) -> List[EvidenceSchema]:
    """Retrieve all explainability citations, source quotes, and bounding coordinates for a record."""
    evidence_list = db.query(Evidence).filter(Evidence.record_id == record_id).all()
    return [
        EvidenceSchema(
            id=ev.id,
            field_name=ev.field_name,
            extracted_value=ev.extracted_value,
            confidence_score=ev.confidence_score,
            source_text=ev.source_text,
            bounding_box=ev.bounding_box
        )
        for ev in evidence_list
    ]
