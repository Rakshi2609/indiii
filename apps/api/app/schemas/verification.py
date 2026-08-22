from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

from app.models.audit import VerificationAction
from app.schemas.record import LandRecordResponse
from app.schemas.validation import ValidationResultResponse


class VerificationQueueItem(BaseModel):
    record_id: int
    document_id: int
    filename: str
    original_name: str
    state: str
    district: str
    village: str
    survey_number: str
    overall_confidence_score: float
    validation_status: str
    total_issues: int
    critical_issues: int
    has_conflicts: bool = False
    has_missing_details: bool = False
    missing_fields: List[str] = Field(default_factory=list)
    created_at: datetime


class VerificationQueueResponse(BaseModel):
    total: int
    pending_count: int
    items: List[VerificationQueueItem]


class VerificationDetailResponse(BaseModel):
    record: LandRecordResponse
    document_file_url: str
    mime_type: str
    original_name: str
    file_size: int
    requires_attention: bool
    audit_history: List["VerificationAuditLogResponse"] = Field(default_factory=list)


class VerificationApproveRequest(BaseModel):
    notes: Optional[str] = Field(None, description="Officer verification remarks")


class VerificationCorrectionRequest(BaseModel):
    corrected_fields: Dict[str, Any] = Field(
        ...,
        description="Key-value mapping of corrected fields (e.g. {'survey_number': '142/2A', 'total_area': 1.50})"
    )
    notes: Optional[str] = Field(None, description="Explanation for corrections")


class VerificationRejectRequest(BaseModel):
    reason: str = Field(..., description="Mandatory reason for rejection")
    notes: Optional[str] = Field(None, description="Additional context or legal citations")


class VerificationActionResponse(BaseModel):
    message: str
    record_id: int
    action: VerificationAction
    previous_status: str
    new_status: str
    audit_log_id: int
    timestamp: datetime


class VerificationAuditLogResponse(BaseModel):
    id: int
    record_id: int
    officer_id: Optional[int] = None
    officer_name: Optional[str] = None
    action: VerificationAction
    original_values: Optional[Dict[str, Any]] = None
    corrected_values: Optional[Dict[str, Any]] = None
    notes: Optional[str] = None
    created_at: datetime

    model_config = {
        "from_attributes": True
    }


# Resolve forward references
VerificationDetailResponse.model_rebuild()
