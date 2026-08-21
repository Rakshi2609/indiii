import logging
from typing import Annotated, List, Optional
from fastapi import APIRouter, Depends, File, HTTPException, Query, UploadFile, status
from sqlalchemy.orm import Session

from app.api.deps import oauth2_scheme
import jwt
from app.core.config import settings
from app.db.database import get_db
from app.models.document import Document, DocumentStatus
from app.models.user import User
from app.schemas.document import (
    DocumentListResponse,
    DocumentResponse,
    DocumentUploadBatchResponse
)
from app.services.storage_service import StorageService, storage_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Documents"])


def get_optional_current_user(
    db: Annotated[Session, Depends(get_db)],
    token: Annotated[Optional[str], Depends(oauth2_scheme)] = None
) -> Optional[User]:
    """Optionally resolve authenticated user if Bearer token is provided."""
    if not token:
        return None
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET,
            algorithms=[settings.JWT_ALGORITHM]
        )
        user_id = payload.get("sub")
        if user_id:
            return db.query(User).filter(User.id == int(user_id)).first()
    except Exception:
        pass
    return None


@router.post(
    "/upload",
    response_model=DocumentUploadBatchResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload one or multiple land revenue documents"
)
async def upload_documents(
    files: List[UploadFile] = File(..., description="Single or batch files (PDF, JPG, PNG, TIFF)"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> DocumentUploadBatchResponse:
    """
    Upload land revenue documents (7/12 extracts, RTCs, sale deeds, Jamabandi).
    Files are stored in local/object storage and queued with PENDING status for OCR extraction.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No files provided for upload."
        )

    saved_documents: List[DocumentResponse] = []
    uploader_id = current_user.id if current_user else None

    for file in files:
        # Save file to storage
        stored_filename, file_path, file_size, mime_type = await storage_service.save_file(file)

        # Create database record
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
    """Retrieve all uploaded documents with optional filtering and pagination."""
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
    summary="Get document details by ID"
)
def get_document(
    document_id: int,
    db: Session = Depends(get_db)
) -> DocumentResponse:
    """Retrieve a single document by its database ID."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )
    return DocumentResponse.model_validate(doc)


@router.delete(
    "/{document_id}",
    status_code=status.HTTP_200_OK,
    summary="Delete document and its stored file"
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db)
) -> dict:
    """Delete a document record and remove the associated file from disk."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Document with ID {document_id} not found."
        )

    # Delete physical file from disk
    storage_service.delete_file(doc.filename)

    db.delete(doc)
    db.commit()

    return {"message": f"Document {document_id} deleted successfully."}
