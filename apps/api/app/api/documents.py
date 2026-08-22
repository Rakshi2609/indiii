import logging
import os
from typing import Annotated, Any, Dict, List, Optional
from fastapi import APIRouter, BackgroundTasks, Depends, File, Form, HTTPException, Query, Request, UploadFile, status
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.deps import get_optional_current_user
from app.db.database import get_db
from app.models.document import Document, DocumentStatus
from app.models.record import LandRecord
from app.models.user import User, UserRole
from app.schemas.document import (
    DocumentListResponse,
    DocumentProcessRequest,
    DocumentProcessResponse,
    DocumentResponse,
    DocumentUploadBatchResponse
)
from app.services.audit_service import audit_service
from app.services.document_service import background_process_document, document_service
from app.services.storage_service import StorageService, storage_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Documents"])


@router.post(
    "/upload",
    response_model=DocumentUploadBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload one or multiple land revenue documents"
)
async def upload_documents(
    request: Request,
    files: List[UploadFile] = File(..., description="Single or batch files (PDF, JPG, PNG, TIFF)"),
    processing_mode: Optional[str] = Form("standard", description="Processing mode: 'standard' (fallback) or 'high_accuracy' (ensemble)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> DocumentUploadBatchResponse:
    """
    Upload land revenue documents (7/12 extracts, RTCs, sale deeds, Jamabandi).
    Files are stored on disk, registered with PENDING status, and logged in audit trail.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided for upload."
        )

    # Restrict upload privilege from citizens/owners
    if current_user and current_user.role in [UserRole.OWNER, UserRole.VIEWER]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access Denied: Citizens and Land Owners are not authorized to upload or ingest revenue records. Ingestion is reserved for authorized Revenue Officers and System Administrators."
        )

    saved_documents: List[DocumentResponse] = []
    uploader_id = current_user.id if current_user else None
    client_ip = request.client.host if request.client else None

    for file in files:
        stored_filename, file_path, file_size, mime_type = await storage_service.save_file(file)

        doc_record = Document(
            filename=stored_filename,
            original_name=file.filename or "unknown_document",
            file_path=file_path,
            file_size=file_size,
            mime_type=mime_type,
            status=DocumentStatus.PENDING,
            uploader_id=uploader_id
        )
        db.add(doc_record)
        db.commit()
        db.refresh(doc_record)

        # Audit Logging
        audit_service.log_event(
            db=db,
            action="DOCUMENT_UPLOAD",
            resource_type="DOCUMENT",
            resource_id=doc_record.id,
            user_id=uploader_id,
            new_value={
                "filename": stored_filename,
                "original_name": file.filename,
                "file_size": file_size,
                "mime_type": mime_type,
                "processing_mode": processing_mode
            },
            ip_address=client_ip
        )

        saved_documents.append(DocumentResponse.model_validate(doc_record))

    return DocumentUploadBatchResponse(
        message=f"Successfully uploaded {len(saved_documents)} document(s).",
        uploaded_count=len(saved_documents),
        documents=saved_documents
    )


@router.get(
    "",
    response_model=DocumentListResponse,
    summary="List all uploaded documents"
)
def list_documents(
    status_filter: Optional[DocumentStatus] = Query(None, alias="status", description="Filter by status"),
    skip: int = Query(0, ge=0, description="Pagination offset"),
    limit: int = Query(50, ge=1, le=100, description="Items per page"),
    db: Session = Depends(get_db)
) -> DocumentListResponse:
    """Retrieve all uploaded documents with optional status filtering and pagination."""
    query = db.query(Document)

    if status_filter:
        query = query.filter(Document.status == status_filter)

    total = query.count()
    items = query.order_by(Document.created_at.desc()).offset(skip).limit(limit).all()

    return DocumentListResponse(
        total=total,
        items=[DocumentResponse.model_validate(item) for item in items]
    )


@router.get(
    "/{document_id}",
    response_model=DocumentResponse,
    summary="Get document details and extraction result by ID"
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """Retrieve document metadata along with extracted structured intelligence."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    return DocumentResponse.model_validate(doc)


@router.get(
    "/{document_id}/file",
    summary="Stream raw document image / PDF file"
)
def get_document_file(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Serve the raw document file directly to the frontend for human verification viewing."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    if not os.path.exists(doc.file_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document file not found on disk storage."
        )

    return FileResponse(
        path=doc.file_path,
        media_type=doc.mime_type or "application/octet-stream",
        filename=doc.original_name
    )


@router.post(
    "/{document_id}/process",
    response_model=DocumentProcessResponse,
    status_code=status.HTTP_202_ACCEPTED,
    summary="Trigger Document AI processing (Sarvam, Mistral, Gemini with Fallback or High Accuracy)"
)
async def process_document_endpoint(
    document_id: int,
    background_tasks: BackgroundTasks,
    request: Optional[DocumentProcessRequest] = None,
    sync: bool = Query(False, description="If true, processes synchronously and waits for result"),
    db: Session = Depends(get_db)
) -> DocumentProcessResponse:
    """
    Trigger Document AI OCR & information extraction.
    Supports multi-model automatic fallback (Sarvam -> Mistral -> Gemini) and
    High-Accuracy multi-model ensemble comparison mode.
    """
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    provider_name = request.provider if request and request.provider else "sarvam"
    doc_type = request.document_type if request and request.document_type else "7/12_extract"
    mode = request.mode if request and request.mode else "standard"

    if sync:
        processed_doc = await document_service.process_document(
            document_id=document_id,
            db=db,
            provider_name=provider_name,
            document_type=doc_type,
            mode=mode
        )
        return DocumentProcessResponse(
            message=f"Document processing completed successfully in '{mode}' mode.",
            document_id=processed_doc.id,
            status=processed_doc.status,
            extracted_data=processed_doc.extracted_data
        )
    else:
        doc.status = DocumentStatus.PROCESSING
        db.commit()
        db.refresh(doc)

        background_tasks.add_task(
            background_process_document,
            document_id=document_id,
            provider_name=provider_name,
            document_type=doc_type,
            mode=mode
        )

        return DocumentProcessResponse(
            message=f"Document processing task scheduled in background (mode: {mode}).",
            document_id=doc.id,
            status=DocumentStatus.PROCESSING,
            extracted_data=None
        )


@router.get(
    "/{document_id}/extraction",
    response_model=Dict[str, Any],
    summary="Get raw extracted land record JSON"
)
def get_document_extraction(
    document_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Retrieve raw structured revenue data extracted by Document AI."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    if doc.status != DocumentStatus.COMPLETED or not doc.extracted_data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Extraction is not completed yet. Current status: {doc.status}"
        )
    return doc.extracted_data


@router.delete(
    "/reset/demo",
    status_code=status.HTTP_200_OK,
    summary="Reset all demo documents and records"
)
def reset_demo_documents(
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> dict:
    """Wipe all uploaded documents and extracted land records for demo reset."""
    docs = db.query(Document).all()
    count = len(docs)
    for doc in docs:
        storage_service.delete_file(doc.filename)
        rec = db.query(LandRecord).filter(LandRecord.document_id == doc.id).first()
        if rec:
            db.delete(rec)
        db.delete(doc)
    db.commit()

    # Audit logging
    audit_service.log_event(
        db=db,
        action="DEMO_RESET",
        resource_type="SYSTEM",
        resource_id=0,
        user_id=current_user.id if current_user else None,
        new_value={"deleted_documents_count": count},
        ip_address=request.client.host if request.client else None
    )

    return {"message": f"Successfully reset demo state. Removed {count} document(s) and records."}


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete document and its stored file"
)
def delete_document(
    document_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> dict:
    """Delete a document record and clean up the underlying file and associated records."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    # Delete associated land record if any
    rec = db.query(LandRecord).filter(LandRecord.document_id == doc.id).first()
    if rec:
        db.delete(rec)

    storage_service.delete_file(doc.filename)
    db.delete(doc)
    db.commit()

    # Audit logging
    audit_service.log_event(
        db=db,
        action="DOCUMENT_DELETE",
        resource_type="DOCUMENT",
        resource_id=document_id,
        user_id=current_user.id if current_user else None,
        old_value={"filename": doc.filename, "original_name": doc.original_name},
        ip_address=request.client.host if request.client else None
    )

    return {"message": f"Document {document_id} deleted successfully."}
