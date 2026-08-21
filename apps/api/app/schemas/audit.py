from datetime import datetime
from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class AuditLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    old_value: Optional[Dict[str, Any]] = None
    new_value: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None


class AuditLogCreate(AuditLogBase):
    user_id: Optional[int] = None


class AuditLogResponse(AuditLogBase):
    id: int
    user_id: Optional[int] = None
    user_name: Optional[str] = None
    user_email: Optional[str] = None
    user_role: Optional[str] = None
    timestamp: datetime

    model_config = {
        "from_attributes": True
    }


class AuditLogListResponse(BaseModel):
    total: int
    items: List[AuditLogResponse]
