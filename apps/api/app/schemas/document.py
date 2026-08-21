from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

from app.models.document import DocumentStatus


class DocumentBase(BaseModel):
    original_name: str
    mime_type: str
    file_size: int = Field(ge=0, description="File size in bytes")
    status: DocumentStatus = DocumentStatus.PENDING


class DocumentCreate(DocumentBase):
    filename: str
    file_path: str
    uploader_id: Optional[int] = None


class DocumentUpdate(BaseModel):
    status: Optional[DocumentStatus] = None
    original_name: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: int
    filename: str
    file_path: str
    uploader_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }


class DocumentListResponse(BaseModel):
    total: int
    items: List[DocumentResponse]


class DocumentUploadBatchResponse(BaseModel):
    message: str
    uploaded_count: int
    documents: List[DocumentResponse]
