from abc import ABC, abstractmethod
import logging
from typing import Any, Dict, Optional, Type

logger = logging.getLogger(__name__)


class DocumentAIProvider(ABC):
    """
    Abstract base class establishing the contract for Document AI Providers
    (Sarvam Vision, Mistral Document OCR, Gemini Multi-modal, etc.).
    """

    @property
    @abstractmethod
    def provider_name(self) -> str:
        """Name of the AI provider."""
        pass

    @abstractmethod
    async def extract_information(
        self,
        file_path: str,
        mime_type: str,
        document_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract structured revenue intelligence and OCR text from a land document.
        Returns a standardized schema containing:
        - document_type
        - survey_number / khasra_number
        - hissa_number / sub_division
        - location (state, district, taluk, village)
        - extent / area (cultivable, uncultivable, unit)
        - land_tenure
        - owners (list of owner entities, shares, mutation IDs)
        - encumbrances (bank mortgages, disputes, court orders)
        - raw_text / ocr_transcript
        - confidence_score
        """
        pass

    @abstractmethod
    async def is_available(self) -> bool:
        """Check whether the provider has valid API credentials and is available."""
        pass


# Global provider registry
_PROVIDERS: Dict[str, Type[DocumentAIProvider]] = {}


def register_provider(name: str):
    """Decorator to register a DocumentAIProvider class."""
    def decorator(cls: Type[DocumentAIProvider]):
        _PROVIDERS[name.lower()] = cls
        return cls
    return decorator


def get_document_ai_provider(name: str = "sarvam") -> DocumentAIProvider:
    """Factory function to resolve and instantiate a DocumentAIProvider."""
    normalized_name = name.lower()
    
    # Lazy import to avoid circular dependencies
    if "sarvam" not in _PROVIDERS:
        from app.ai.sarvam import SarvamProvider  # noqa: F401

    if normalized_name not in _PROVIDERS:
        logger.warning(
            f"Provider '{name}' not found in registry. Defaulting to 'sarvam'."
        )
        normalized_name = "sarvam"

    provider_class = _PROVIDERS[normalized_name]
    return provider_class()
