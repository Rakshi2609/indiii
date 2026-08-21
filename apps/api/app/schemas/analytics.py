from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class AnalyticsOverviewResponse(BaseModel):
    total_documents: int
    total_documents_processed: int
    total_documents_pending: int
    total_documents_failed: int
    total_records_extracted: int
    total_records_verified: int
    total_records_flagged: int
    total_records_rejected: int
    fields_requiring_review: int
    validation_conflicts_count: int
    critical_conflicts_count: int
    average_confidence_score: float = Field(..., ge=0.0, le=1.0)
    digitization_progress_pct: float = Field(..., ge=0.0, le=100.0)
    last_updated: datetime


class DistrictProgressItem(BaseModel):
    state: str
    district: str
    total_records: int
    verified_records: int
    flagged_records: int
    progress_percentage: float
    total_area_hectares: float


class DistrictAnalyticsResponse(BaseModel):
    total_districts: int
    districts: List[DistrictProgressItem]


class ConflictBreakdownItem(BaseModel):
    issue_type: str
    severity: str
    count: int


class ConflictAnalyticsResponse(BaseModel):
    total_conflicts: int
    by_severity: Dict[str, int]
    by_type: Dict[str, int]
    breakdown: List[ConflictBreakdownItem]
