from datetime import datetime
from typing import Any, Dict, List, Optional
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
    extracted_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    processed_at: Optional[datetime] = None


class DocumentResponse(DocumentBase):
    id: int
    filename: str
    file_path: str
    uploader_id: Optional[int] = None
    extracted_data: Optional[Dict[str, Any]] = None
    error_message: Optional[str] = None
    processed_at: Optional[datetime] = None
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


class DocumentProcessRequest(BaseModel):
    provider: Optional[str] = Field(default="sarvam", description="AI provider to use for extraction ('sarvam', 'mistral', 'gemini')")
    document_type: Optional[str] = Field(default="7/12_extract", description="Revenue document type hint")
    mode: Optional[str] = Field(default="standard", description="Processing mode: 'standard' (fallback router), 'high_accuracy' (ensemble comparison), or 'single'")


class DocumentProcessResponse(BaseModel):
    message: str
    document_id: int
    status: DocumentStatus
    extracted_data: Optional[Dict[str, Any]] = None
