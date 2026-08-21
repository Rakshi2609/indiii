import logging
import os
from pathlib import Path
from typing import Any, Dict, Optional
import httpx

from app.core.config import settings
from app.ai.router import DocumentAIProvider, register_provider

logger = logging.getLogger(__name__)


@register_provider("sarvam")
class SarvamProvider(DocumentAIProvider):
    """
    Sarvam Vision / Document AI integration for Indian language land record extraction
    (supports Hindi, Marathi, Gujarati, Kannada, Tamil, Telugu, Bengali, Punjabi, etc.).
    """

    BASE_URL = "https://api.sarvam.ai"

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.SARVAM_API_KEY

    @property
    def provider_name(self) -> str:
        return "Sarvam Vision AI"

    async def is_available(self) -> bool:
        """Returns True if a real API key is configured."""
        return bool(self.api_key and not self.api_key.startswith("your_"))

    async def extract_information(
        self,
        file_path: str,
        mime_type: str,
        document_type: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Extract land record intelligence using Sarvam Document AI API,
        or fall back to domain-informed simulation if API key is not configured.
        """
        path = Path(file_path)
        if not path.exists():
            raise FileNotFoundError(f"File not found for OCR extraction: {file_path}")

        if await self.is_available():
            try:
                return await self._call_sarvam_api(path, mime_type, document_type)
            except Exception as e:
                logger.error(f"Sarvam API call failed: {e}. Falling back to simulation mode.")
                return self._generate_domain_mock(path.name, document_type)
        else:
            logger.info("SARVAM_API_KEY not configured. Using Sarvam Document AI simulation.")
            return self._generate_domain_mock(path.name, document_type)

    async def _call_sarvam_api(
        self,
        path: Path,
        mime_type: str,
        document_type: Optional[str]
    ) -> Dict[str, Any]:
        """Perform real HTTP call to Sarvam Document AI service."""
        url = f"{self.BASE_URL}/document-ai/extract"
        headers = {
            "api-subscription-key": self.api_key,
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            with open(path, "rb") as f:
                files = {"file": (path.name, f, mime_type)}
                data = {
                    "document_type": document_type or "land_record",
                    "language_code": "auto"
                }
                response = await client.post(url, headers=headers, files=files, data=data)
                response.raise_for_status()
                return response.json()

    def _generate_domain_mock(self, filename: str, document_type: Optional[str] = None) -> Dict[str, Any]:
        """
        Generate high-fidelity domain intelligence mock extraction conforming to
        Indian Land Revenue administration standards (7/12 Satbara, RTC, Jamabandi).
        """
        return {
            "provider": "Sarvam Vision AI (Simulated)",
            "ocr_engine_version": "sarvam-doc-v2.1",
            "document_type": document_type or "7/12_extract_satbara",
            "detected_language": {
                "primary": "mr",
                "name": "Marathi / Devanagari",
                "confidence": 0.982
            },
            "revenue_identifiers": {
                "survey_number": "142",
                "hissa_number": "2B",
                "gat_number": "Gat-142/2B",
                "khata_number": "481"
            },
            "location": {
                "state": "Maharashtra",
                "district": "Pune",
                "taluk": "Haveli",
                "village": "Wagholi",
                "sub_registrar_office": "Haveli-SRO-4"
            },
            "area_and_tenure": {
                "total_area_hectares": 1.50,
                "cultivable_area_hectares": 1.45,
                "pot_kharaba_uncultivable_hectares": 0.05,
                "equivalent_acres": 3.706,
                "land_tenure": "Bhogwata Class 1 (Occupant Class 1 - Freehold)",
                "assessment_tax_inr": 48.50,
                "irrigation_type": "Jirayat (Dry crop / Non-irrigated)"
            },
            "owners": [
                {
                    "name_english": "Ramesh Shankarrao Patil",
                    "name_indic": "रमेश शंकरराव पाटील",
                    "gender": "Male",
                    "share_fraction": "1/2",
                    "share_percentage": 50.0,
                    "mutation_entry_number": "M-4512",
                    "aadhaar_hash_matched": True
                },
                {
                    "name_english": "Suresh Shankarrao Patil",
                    "name_indic": "सुरेश शंकरराव पाटील",
                    "gender": "Male",
                    "share_fraction": "1/2",
                    "share_percentage": 50.0,
                    "mutation_entry_number": "M-4512",
                    "aadhaar_hash_matched": True
                }
            ],
            "encumbrances_and_charges": [
                {
                    "type": "Bank Mortgage / Bhoomi Liens",
                    "institution": "Bank of Maharashtra, Wagholi Branch",
                    "amount_inr": 500000,
                    "date_registered": "2021-04-15",
                    "mutation_number": "M-6201",
                    "status": "Active / Unreleased"
                }
            ],
            "mutation_history": [
                {
                    "mutation_number": "M-3104",
                    "date": "1994-08-12",
                    "type": "Warisan (Inheritance by succession)",
                    "status": "Certified"
                },
                {
                    "mutation_number": "M-4512",
                    "date": "2008-01-20",
                    "type": "Hakkasod / Partition Deed",
                    "status": "Certified"
                },
                {
                    "mutation_number": "M-6201",
                    "date": "2021-04-15",
                    "type": "Bank Boja / Mortgage Endorsement",
                    "status": "Certified"
                }
            ],
            "dispute_and_risk_analysis": {
                "overall_risk_score": 0.15,
                "risk_level": "LOW",
                "flags": [
                    {
                        "category": "ENCUMBRANCE",
                        "severity": "MEDIUM",
                        "description": "Active bank charge of INR 5,00,000 recorded in other rights column."
                    }
                ]
            },
            "ocr_transcript_sample": "गाव नमुना सात ( अधिकार अभिलेख पत्रक ) गाव: वाघोली, तालुका: हवेली, जिल्हा: पुणे. भूमापन क्रमांक व उपविभाग: १४२/२ब. एकूण क्षेत्र: १.५० हेक्टर आर.",
            "extraction_confidence": 0.965
        }
