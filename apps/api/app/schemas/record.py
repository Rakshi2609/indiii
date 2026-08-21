from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.validation import ValidationResultResponse


# 1. Administrative Domain
class AdministrativeInfo(BaseModel):
    state: str
    district: str
    taluk: Optional[str] = None
    village: str
    sub_registrar_office: Optional[str] = None


# 2. Land & Boundary Measurements Domain
class LandInfo(BaseModel):
    survey_number: str
    hissa_number: Optional[str] = None
    gat_number: Optional[str] = None
    khata_number: Optional[str] = None
    total_area: Optional[float] = None
    cultivable_area: Optional[float] = None
    uncultivable_area: Optional[float] = None
    area_unit: str = "hectares"
    land_tenure: Optional[str] = None
    assessment_tax: Optional[float] = None
    irrigation_type: Optional[str] = None


# 3. Ownership Domain
class OwnerInfo(BaseModel):
    name_english: str
    name_indic: Optional[str] = None
    gender: Optional[str] = None
    share_fraction: Optional[str] = None
    share_percentage: Optional[float] = None
    mutation_entry_number: Optional[str] = None
    aadhaar_hash_matched: Optional[bool] = None


# 4. Mutation Ledger Domain
class MutationInfo(BaseModel):
    mutation_number: str
    date: Optional[str] = None
    type: Optional[str] = None
    status: Optional[str] = None
    details: Optional[str] = None


# 5. Registration & Encumbrances Domain
class EncumbranceInfo(BaseModel):
    type: str
    institution: Optional[str] = None
    amount_inr: Optional[float] = None
    date_registered: Optional[str] = None
    mutation_number: Optional[str] = None
    status: Optional[str] = None


# 6. Field-Level Evidence & Explainability Layer
class EvidenceSchema(BaseModel):
    id: Optional[int] = None
    field_name: str
    extracted_value: str
    confidence_score: float = Field(default=1.0, ge=0.0, le=1.0)
    source_text: Optional[str] = None
    bounding_box: Optional[Dict[str, Any]] = None

    model_config = {
        "from_attributes": True
    }


# Consolidated Structured Schema
class StructuredLandRecord(BaseModel):
    administrative: AdministrativeInfo
    land: LandInfo
    owners: List[OwnerInfo] = Field(default_factory=list)
    mutations: List[MutationInfo] = Field(default_factory=list)
    encumbrances: List[EncumbranceInfo] = Field(default_factory=list)
    evidence: List[EvidenceSchema] = Field(default_factory=list)


# API Responses
class LandRecordResponse(BaseModel):
    id: int
    document_id: int
    administrative: AdministrativeInfo
    land: LandInfo
    owners: List[OwnerInfo] = Field(default_factory=list)
    mutations: List[MutationInfo] = Field(default_factory=list)
    encumbrances: List[EncumbranceInfo] = Field(default_factory=list)
    evidence: List[EvidenceSchema] = Field(default_factory=list)
    validation_results: List[ValidationResultResponse] = Field(default_factory=list)
    overall_confidence_score: float = 1.0
    validation_status: str = "VALIDATED"
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class LandRecordListResponse(BaseModel):
    total: int
    items: List[LandRecordResponse]
