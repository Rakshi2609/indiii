from datetime import datetime, timezone
import logging
from typing import Any, Dict, Optional
from sqlalchemy.orm import Session

from app.ai.router import AIRouter, DocumentAIProvider, get_document_ai_provider
from app.db.database import SessionLocal
from app.models.document import Document, DocumentStatus
from app.services.extraction_service import extraction_service
from app.services.validation_service import validation_service
from app.services.document_image_pipeline import document_image_pipeline
from app.services.consensus_engine import consensus_engine
from app.services.reasoning_engine import reasoning_engine

logger = logging.getLogger(__name__)


class DocumentProcessingService:
    """
    Service orchestrating document OCR, Indian language AI extraction,
    multi-model fallback routing, schema mapping, and validation.
    """

    async def process_document(
        self,
        document_id: int,
        db: Session,
        provider_name: str = "sarvam",
        document_type: Optional[str] = None,
        mode: str = "standard"
    ) -> Document:
        """
        Process a document through the complete Land AI pipeline:
        1. Status -> PROCESSING
        2. Image Quality Assessment & Adaptive Preprocessing
        3. AI Extraction with Fallback / High-Accuracy Multi-Model Ensemble
        4. Schema mapping and evidence generation (ExtractionService)
        5. Rule-based consistency and confidence scoring (ValidationService)
        6. Explainable Reasoning Layer (ReasoningEngine)
        7. Status -> COMPLETED
        """
        doc = db.query(Document).filter(Document.id == document_id).first()
        if not doc:
            raise ValueError(f"Document with ID {document_id} does not exist.")

        # Step 1: Update status to PROCESSING
        doc.status = DocumentStatus.PROCESSING
        doc.error_message = None
        db.commit()
        db.refresh(doc)
        logger.info(f"Document {document_id} transitioned to PROCESSING status (Mode: {mode}).")

        try:
            # Step 2: Quality Assessment & Adaptive Image Preprocessing
            quality_metrics = {}
            applied_filters = []
            try:
                logger.info(f"Running Image Quality Assessment and Adaptive Preprocessing for Document {document_id}...")
                quality_metrics, processed_path, applied_filters = document_image_pipeline.process_file(doc.file_path)
                # Reassign file path so downstream extraction consumes enhanced version
                doc.file_path = processed_path
                logger.info(f"Document {document_id} preprocessed successfully. Applied filters: {applied_filters}")
            except Exception as img_err:
                logger.error(f"Image pipeline failed for Document {document_id}: {img_err}", exc_info=True)
                quality_metrics = {
                    "quality": "UNKNOWN",
                    "error": str(img_err)
                }

            # Step 3: Multi-Model Routing & Extraction
            if mode == "high_accuracy":
                logger.info(f"High-Accuracy Mode triggered for Document {document_id}. Executing AIRouter ensemble (Sarvam + Mistral)...")
                extracted_data = await AIRouter.extract_with_ensemble(
                    file_path=doc.file_path,
                    mime_type=doc.mime_type,
                    document_type=document_type,
                    providers=["sarvam", "mistral"]
                )
            elif mode == "single":
                provider = get_document_ai_provider(provider_name)
                logger.info(f"Single Provider Mode ({provider.provider_name}) for Document {document_id}...")
                extracted_data = await provider.extract_information(
                    file_path=doc.file_path,
                    mime_type=doc.mime_type,
                    document_type=document_type
                )
            else:
                # Default "standard" mode with automatic fallback chain: Sarvam -> Mistral -> Gemini
                logger.info(f"Standard Fallback Mode for Document {document_id} (Preferred: {provider_name})...")
                extracted_data, winning_provider, attempts = await AIRouter.extract_with_fallback(
                    file_path=doc.file_path,
                    mime_type=doc.mime_type,
                    document_type=document_type,
                    preferred_provider=provider_name
                )
                logger.info(f"Extraction fulfilled by '{winning_provider}' after attempts: {attempts}")

            # Embed image quality and filters telemetry
            extracted_data["quality_assessment"] = quality_metrics
            extracted_data["applied_filters"] = applied_filters

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

            # Step 6: Generate Explainable Reasoning Layer
            logger.info(f"Generating grounded reasoning report for Record {record.id}...")
            reasoning_res = await reasoning_engine.generate_reasoning(record, db)
            extracted_data["reasoning_report"] = reasoning_res

            # Step 7: Update document status to COMPLETED and persist results
            doc.status = DocumentStatus.COMPLETED
            doc.extracted_data = extracted_data
            doc.processed_at = datetime.now(timezone.utc)
            doc.error_message = None
            
            # Save final changes
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
    document_type: Optional[str] = None,
    mode: str = "standard"
) -> None:
    """Standalone background task handler with independent DB session."""
    db: Session = SessionLocal()
    try:
        await document_service.process_document(
            document_id=document_id,
            db=db,
            provider_name=provider_name,
            document_type=document_type,
            mode=mode
        )
    except Exception as e:
        logger.error(f"Background document processing encountered an error: {e}")
    finally:
        db.close()
