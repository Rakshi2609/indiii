from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class OwnerOverviewResponse(BaseModel):
    owner_name: str = Field(description="Full name of authenticated property owner")
    total_properties: int = Field(default=0, description="Total verified land parcels owned")
    total_area_ha: float = Field(default=0.0, description="Total land area in hectares")
    total_area_acres: float = Field(default=0.0, description="Total land area in acres")
    total_regions_count: int = Field(default=0, description="Count of distinct administrative districts/regions")
    regions_list: List[str] = Field(default_factory=list, description="List of district names with holdings")
    verified_properties_count: int = Field(default=0, description="Properties with verified legal status")
    review_required_count: int = Field(default=0, description="Properties flagged for review or discrepancy")
    gis_discrepancies_count: int = Field(default=0, description="Properties with deed vs GIS boundary variance >5%")
    total_encumbrance_value_inr: float = Field(default=0.0, description="Total active mortgage/lien value in INR")
    state_distribution: Dict[str, int] = Field(default_factory=dict, description="Property count grouped by state")


class OwnerPropertyListItem(BaseModel):
    id: int = Field(description="Authoritative LandRecord ID")
    document_id: Optional[int] = None
    survey_number: str
    hissa_number: Optional[str] = None
    gat_number: Optional[str] = None
    village: str
    taluk: Optional[str] = None
    district: str
    state: str
    total_area_ha: Optional[float] = None
    total_area_acres: Optional[float] = None
    area_unit: str = "hectares"
    land_tenure: Optional[str] = None
    validation_status: str
    has_discrepancy: bool = False
    discrepancy_details: Optional[str] = None
    gis_area_ha: Optional[float] = None
    mutation_count: int = 0
    encumbrances: List[str] = Field(default_factory=list)
    last_ownership_event: Optional[str] = None


class OwnerHistoryEventItem(BaseModel):
    id: str
    record_id: int
    property_title: str
    survey_number: str
    village: str
    state: str
    event_year: Optional[int] = None
    event_date: Optional[str] = None
    event_type: str = Field(description="SETTLEMENT, MUTATION, INHERITANCE, MORTGAGE, SALE, CURRENT")
    title: str
    description: str
    mutation_number: Optional[str] = None
    parties_involved: Optional[str] = None
    supporting_document_id: Optional[int] = None
    supporting_document_name: Optional[str] = None


class OwnerDocumentItem(BaseModel):
    id: int
    filename: str
    original_name: str
    file_size: int
    mime_type: str
    status: str
    linked_record_id: Optional[int] = None
    linked_survey: Optional[str] = None
    linked_village: Optional[str] = None
    linked_state: Optional[str] = None
    created_at: str


class OwnerPropertyDetailResponse(BaseModel):
    id: int
    document_id: Optional[int] = None
    state: str
    district: str
    taluk: Optional[str] = None
    village: str
    survey_number: str
    hissa_number: Optional[str] = None
    gat_number: Optional[str] = None
    khata_number: Optional[str] = None
    total_area: Optional[float] = None
    cultivable_area: Optional[float] = None
    uncultivable_area: Optional[float] = None
    area_acres: Optional[float] = None
    area_unit: str = "hectares"
    land_tenure: Optional[str] = None
    owners: List[Dict[str, Any]] = Field(default_factory=list)
    validation_status: str
    overall_confidence_score: float = 1.0
    has_discrepancy: bool = False
    discrepancy_details: Optional[str] = None
    gis_parcel: Optional[Dict[str, Any]] = None
    ownership_history: List[OwnerHistoryEventItem] = Field(default_factory=list)
    encumbrances: List[Dict[str, Any]] = Field(default_factory=list)
    document: Optional[Dict[str, Any]] = None
