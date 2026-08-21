from datetime import datetime, timezone
import logging
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.ai.router import DocumentAIProvider, get_document_ai_provider
from app.db.database import SessionLocal
from app.models.document import Document, DocumentStatus

logger = logging.getLogger(__name__)


class DocumentProcessingService:
    """Service orchestrating document OCR, Indian language AI extraction, and status transitions."""

    async def process_document(
        self,
        document_id: int,
        db: Session,
        provider_name: str = "sarvam",
        document_type: Optional[str] = None
    ) -> Document:
        """
        Process a document using the specified AI provider.
        Manages state transitions: PENDING -> PROCESSING -> COMPLETED / FAILED.
        """
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document with ID {document_id} does not exist.")

        # Step 1: Update status to PROCESSING
        doc.status = DocumentStatus.PROCESSING
        doc.error_message = None
        db.commit()
        db.refresh(doc)
        logger.info(f"Document {document_id} transitioned to PROCESSING status.")

        try:
            # Step 2: Resolve AI Provider (Sarvam Vision by default)
            provider: DocumentAIProvider = get_document_ai_provider(provider_name)
            logger.info(f"Extracting intelligence for Document {document_id} using {provider.provider_name}...")

            # Step 3: Extract structured land revenue data
            extracted_data: Dict[str, Any] = await provider.extract_information(
                file_path=doc.file_path,
                mime_type=doc.mime_type,
                document_type=document_type
            )

            # Step 4: Update status to COMPLETED and persist results
            doc.status = DocumentStatus.COMPLETED
            doc.extracted_data = extracted_data
            doc.processed_at = datetime.now(timezone.utc)
            doc.error_message = None
            db.commit()
            db.refresh(doc)
            logger.info(f"Document {document_id} successfully COMPLETED extraction.")
            return doc

        except Exception as exc:
            logger.error(f"Processing failed for Document {document_id}: {exc}", exc_info=True)
            doc.status = DocumentStatus.FAILED
            doc.error_message = str(exc)
            doc.processed_at = datetime.now(timezone.utc)
            db.commit()
            db.refresh(doc)
            raise


# Singleton instance
document_service = DocumentProcessingService()


async def background_process_document(
    document_id: int,
    provider_name: str = "sarvam",
    document_type: Optional[str] = None
) -> None:
    """Standalone background task handler with independent DB session."""
    db: Session = SessionLocal()
    try:
        await document_service.process_document(
            document_id=document_id,
            db=db,
            provider_name=provider_name,
            document_type=document_type
        )
    except Exception as e:
        logger.error(f"Background document processing encountered an error: {e}")
    finally:
        db.close()
