from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.schemas.record import LandRecordResponse


class GeoJSONGeometry(BaseModel):
    type: str = "Polygon"
    coordinates: List[Any]


class ParcelProperties(BaseModel):
    parcel_id: int
    survey_number: str
    village: str
    district: str
    state: str
    area_hectares: float
    land_record_id: Optional[int] = None
    validation_status: Optional[str] = "UNVERIFIED"
    owners: List[str] = Field(default_factory=list)
    confidence_score: Optional[float] = 1.0


class GeoJSONFeature(BaseModel):
    type: str = "Feature"
    id: Optional[int] = None
    geometry: Dict[str, Any]
    properties: ParcelProperties


class GeoJSONFeatureCollection(BaseModel):
    type: str = "FeatureCollection"
    total_features: int
    features: List[GeoJSONFeature]


class ParcelCreate(BaseModel):
    survey_number: str
    village: str
    district: str = "Pune"
    state: str = "Maharashtra"
    area: float = Field(..., description="Area in hectares")
    geometry: Dict[str, Any] = Field(
        ...,
        description="GeoJSON Polygon geometry dictionary"
    )
    land_record_id: Optional[int] = None


class ParcelDetailResponse(BaseModel):
    id: int
    survey_number: str
    village: str
    district: str
    state: str
    area_hectares: float
    geometry: Dict[str, Any]
    land_record_id: Optional[int] = None
    land_record: Optional[LandRecordResponse] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class SpatialDiscrepancyResult(BaseModel):
    has_discrepancy: bool
    survey_number: str
    village: str
    extracted_area: Optional[float] = None
    gis_calculated_area: Optional[float] = None
    discrepancy_percentage: float = 0.0
    issue_description: Optional[str] = None
