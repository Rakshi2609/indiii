from abc import ABC, abstractmethod
import asyncio
import logging
from typing import Any, Dict, List, Optional, Tuple, Type

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


def _ensure_providers_loaded():
    """Ensure all provider modules are imported and registered."""
    if "sarvam" not in _PROVIDERS:
        try:
            from app.ai.sarvam import SarvamProvider  # noqa: F401
        except ImportError:
            pass
    if "mistral" not in _PROVIDERS:
        try:
            from app.ai.mistral import MistralProvider  # noqa: F401
        except ImportError:
            pass
    if "gemini" not in _PROVIDERS:
        try:
            from app.ai.gemini import GeminiProvider  # noqa: F401
        except ImportError:
            pass


def get_document_ai_provider(name: str = "sarvam") -> DocumentAIProvider:
    """Factory function to resolve and instantiate a DocumentAIProvider."""
    _ensure_providers_loaded()
    normalized_name = name.lower()

    if normalized_name not in _PROVIDERS:
        logger.warning(
            f"Provider '{name}' not found in registry. Defaulting to 'sarvam'."
        )
        normalized_name = "sarvam"

    provider_class = _PROVIDERS[normalized_name]
    return provider_class()


class AIRouter:
    """
    Intelligent AI Model Router handling:
    1. Automatic Fallback: Sarvam Vision 1.5 -> Mistral OCR -> Gemini 1.5 Pro.
    2. High-Accuracy Multi-Model Ensemble: Parallel execution and discrepancy analysis.
    """

    DEFAULT_FALLBACK_CHAIN = ["sarvam", "mistral", "gemini"]

    @classmethod
    async def extract_with_fallback(
        cls,
        file_path: str,
        mime_type: str,
        document_type: Optional[str] = None,
        preferred_provider: str = "sarvam",
        custom_chain: Optional[List[str]] = None
    ) -> Tuple[Dict[str, Any], str, List[str]]:
        """
        Attempt extraction starting from preferred provider, automatically
        falling back through the chain on failure.
        """
        _ensure_providers_loaded()
        chain = custom_chain or cls.DEFAULT_FALLBACK_CHAIN

        # Prioritize preferred_provider if specified
        ordered_chain: List[str] = []
        if preferred_provider in chain:
            ordered_chain.append(preferred_provider)
            for p in chain:
                if p != preferred_provider:
                    ordered_chain.append(p)
        else:
            ordered_chain = list(chain)

        attempted: List[str] = []
        last_error: Optional[Exception] = None

        for provider_name in ordered_chain:
            attempted.append(provider_name)
            try:
                provider = get_document_ai_provider(provider_name)
                logger.info(f"Attempting document extraction with provider: {provider.provider_name}")
                result = await provider.extract_information(
                    file_path=file_path,
                    mime_type=mime_type,
                    document_type=document_type
                )
                if result:
                    # Enrich result with routing telemetry
                    result["_routing_metadata"] = {
                        "winning_provider": provider_name,
                        "attempts": attempted,
                        "fallback_triggered": len(attempted) > 1
                    }
                    return result, provider_name, attempted
            except Exception as e:
                logger.warning(
                    f"Provider '{provider_name}' failed for {file_path}: {e}. Trying fallback..."
                )
                last_error = e

        if last_error:
            raise RuntimeError(
                f"All AI providers in fallback chain {ordered_chain} failed. Last error: {last_error}"
            )
        raise RuntimeError("No AI providers were executed.")

    @classmethod
    async def extract_with_ensemble(
        cls,
        file_path: str,
        mime_type: str,
        document_type: Optional[str] = None,
        providers: Optional[List[str]] = None
    ) -> Dict[str, Any]:
        """
        High-Accuracy Mode: Query multiple models in parallel (Sarvam + Mistral),
        cross-check extracted entities, compute agreement scores, and flag any discrepancies.
        """
        target_providers = providers or ["sarvam", "mistral"]
        _ensure_providers_loaded()

        tasks = []
        for p_name in target_providers:
            provider = get_document_ai_provider(p_name)
            tasks.append(provider.extract_information(file_path, mime_type, document_type))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        successful_results: Dict[str, Dict[str, Any]] = {}
        for p_name, res in zip(target_providers, results):
            if isinstance(res, dict):
                successful_results[p_name] = res
            else:
                logger.warning(f"Ensemble member '{p_name}' encountered error: {res}")

        if not successful_results:
            # Fallback to single provider with full fallback
            single_res, _, _ = await cls.extract_with_fallback(file_path, mime_type, document_type)
            return single_res

        # Pick primary result (Sarvam if available, else first successful)
        primary_key = "sarvam" if "sarvam" in successful_results else list(successful_results.keys())[0]
        final_result = dict(successful_results[primary_key])

        # Cross-model discrepancy check
        comparison = cls._compare_model_outputs(successful_results)
        final_result["_model_comparison"] = comparison
        final_result["_routing_metadata"] = {
            "mode": "high_accuracy_ensemble",
            "participating_providers": list(successful_results.keys()),
            "agreement_score": comparison["overall_agreement_score"]
        }

        return final_result

    @classmethod
    def _compare_model_outputs(
        cls,
        results_map: Dict[str, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Compare revenue identifiers and area metrics across models."""
        provider_names = list(results_map.keys())
        if len(provider_names) < 2:
            return {
                "overall_agreement_score": 1.0,
                "discrepancies": [],
                "compared_models": provider_names
            }

        p1, p2 = provider_names[0], provider_names[1]
        r1, r2 = results_map[p1], results_map[p2]

        discrepancies = []
        agreed_points = 0
        total_points = 4

        # 1. Survey Number Check
        s1 = r1.get("revenue_identifiers", {}).get("survey_number", "").strip().lower()
        s2 = r2.get("revenue_identifiers", {}).get("survey_number", "").strip().lower()
        if s1 and s2 and s1 == s2:
            agreed_points += 1
        elif s1 or s2:
            discrepancies.append({
                "field": "survey_number",
                f"{p1}_value": s1,
                f"{p2}_value": s2,
                "note": "Survey number mismatch between models"
            })

        # 2. Area Check
        a1 = float(r1.get("area_and_tenure", {}).get("total_area_hectares", 0.0) or 0.0)
        a2 = float(r2.get("area_and_tenure", {}).get("total_area_hectares", 0.0) or 0.0)
        if abs(a1 - a2) < 0.01:
            agreed_points += 1
        else:
            discrepancies.append({
                "field": "total_area_hectares",
                f"{p1}_value": a1,
                f"{p2}_value": a2,
                "note": f"Area difference: {abs(a1 - a2):.3f} Ha"
            })

        # 3. Village Check
        v1 = r1.get("location", {}).get("village", "").strip().lower()
        v2 = r2.get("location", {}).get("village", "").strip().lower()
        if v1 and v2 and v1 == v2:
            agreed_points += 1
        elif v1 or v2:
            discrepancies.append({
                "field": "village",
                f"{p1}_value": v1,
                f"{p2}_value": v2,
                "note": "Village name mismatch between models"
            })

        # 4. Owners Count Check
        o1 = len(r1.get("owners", []))
        o2 = len(r2.get("owners", []))
        if o1 == o2:
            agreed_points += 1
        else:
            discrepancies.append({
                "field": "owners_count",
                f"{p1}_value": o1,
                f"{p2}_value": o2,
                "note": f"Owner entity count difference ({o1} vs {o2})"
            })

        score = round(agreed_points / total_points, 3)

        return {
            "overall_agreement_score": score,
            "agreed_checks": f"{agreed_points}/{total_points}",
            "discrepancies": discrepancies,
            "compared_models": provider_names
        }
