from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.validation import IssueSeverity, IssueType, ValidationStatus


class ValidationResultBase(BaseModel):
    issue_type: IssueType = IssueType.RULE
    field_name: str
    expected_value: Optional[str] = None
    extracted_value: Optional[str] = None
    severity: IssueSeverity = IssueSeverity.MEDIUM
    status: ValidationStatus = ValidationStatus.PENDING
    description: Optional[str] = None


class ValidationResultCreate(ValidationResultBase):
    record_id: int


class ValidationResultUpdate(BaseModel):
    status: Optional[ValidationStatus] = None
    description: Optional[str] = None


class ValidationResultResponse(ValidationResultBase):
    id: int
    record_id: int
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class ValidationSummary(BaseModel):
    record_id: int
    overall_confidence_score: float = Field(ge=0.0, le=1.0)
    validation_status: str
    total_issues: int
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    issues: List[ValidationResultResponse] = Field(default_factory=list)


class ValidationTriggerResponse(BaseModel):
    message: str
    record_id: int
    overall_confidence_score: float
    validation_status: str
    total_issues_found: int
    summary: ValidationSummary
