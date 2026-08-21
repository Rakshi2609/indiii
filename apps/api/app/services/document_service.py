from datetime import datetime, timezone
import logging
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.ai.router import DocumentAIProvider, get_document_ai_provider
from app.db.database import SessionLocal
from app.models.document import Document, DocumentStatus
from app.services.extraction_service import extraction_service
from app.services.validation_service import validation_service

logger = logging.getLogger(__name__)


class DocumentProcessingService:
    """Service orchestrating document OCR, Indian language AI extraction, schema mapping, and validation."""

    async def process_document(
        self,
        document_id: int,
        db: Session,
        provider_name: str = "sarvam",
        document_type: Optional[str] = None
    ) -> Document:
        """
        Process a document through the complete Land AI pipeline:
        1. Status -> PROCESSING
        2. Sarvam Document AI OCR extraction
        3. Schema mapping and evidence generation (ExtractionService)
        4. Rule-based consistency and confidence scoring (ValidationService)
        5. Status -> COMPLETED
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

            # Step 4: Persist structured LandRecord and Evidence layer
            record = extraction_service.extract_and_persist_record(
                doc=doc,
                raw_data=extracted_data,
                db=db
            )

            # Step 5: Automatically run validation engine & confidence scoring
            validation_service.validate_and_persist_record(
                record=record,
                db=db
            )

            # Step 6: Update document status to COMPLETED and persist results
            doc.status = DocumentStatus.COMPLETED
            doc.extracted_data = extracted_data
            doc.processed_at = datetime.now(timezone.utc)
            doc.error_message = None
            db.commit()
            db.refresh(doc)
            logger.info(f"Document {document_id} and Record {record.id} successfully COMPLETED & VALIDATED.")
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
