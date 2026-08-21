import io
import pytest
from app.ai.gemini import GeminiProvider
from app.ai.mistral import MistralProvider
from app.ai.router import AIRouter, get_document_ai_provider
from app.ai.sarvam import SarvamProvider
from app.models.document import Document, DocumentStatus


@pytest.mark.asyncio
async def test_mistral_provider_extraction(tmp_path):
    sample_file = tmp_path / "test_mistral.pdf"
    sample_file.write_bytes(b"%PDF-1.4 sample content for mistral")

    provider = MistralProvider()
    assert provider.provider_name.startswith("Mistral OCR")
    
    result = await provider.extract_information(
        file_path=str(sample_file),
        mime_type="application/pdf",
        document_type="7/12_extract"
    )
    assert result is not None
    assert "revenue_identifiers" in result
    assert result["revenue_identifiers"]["survey_number"] == "142"
    assert "evidence_bounding_boxes" in result
    assert len(result["evidence_bounding_boxes"]) > 0


@pytest.mark.asyncio
async def test_gemini_provider_extraction(tmp_path):
    sample_file = tmp_path / "test_gemini.jpg"
    sample_file.write_bytes(b"\xFF\xD8\xFF\xE0 sample jpeg content for gemini")

    provider = GeminiProvider()
    assert "Gemini" in provider.provider_name

    result = await provider.extract_information(
        file_path=str(sample_file),
        mime_type="image/jpeg",
        document_type="7/12_extract"
    )
    assert result is not None
    assert "revenue_identifiers" in result
    assert result["revenue_identifiers"]["survey_number"] == "142"
    assert "reasoning_notes" in result


@pytest.mark.asyncio
async def test_ai_router_fallback_chain(tmp_path, monkeypatch):
    sample_file = tmp_path / "fallback_sample.pdf"
    sample_file.write_bytes(b"%PDF-1.4 dummy deed")

    # Simulate Sarvam throwing a catastrophic network exception
    async def mock_failing_sarvam(self, file_path, mime_type, document_type=None):
        raise ConnectionError("Sarvam upstream gateway timeout 504")

    monkeypatch.setattr(SarvamProvider, "extract_information", mock_failing_sarvam)

    # Trigger fallback
    result, winning_provider, attempts = await AIRouter.extract_with_fallback(
        file_path=str(sample_file),
        mime_type="application/pdf",
        document_type="7/12_extract",
        preferred_provider="sarvam"
    )

    assert winning_provider == "mistral"
    assert "sarvam" in attempts
    assert "mistral" in attempts
    assert result["revenue_identifiers"]["survey_number"] == "142"
    assert result["_routing_metadata"]["fallback_triggered"] is True


@pytest.mark.asyncio
async def test_ai_router_high_accuracy_ensemble(tmp_path):
    sample_file = tmp_path / "ensemble_sample.pdf"
    sample_file.write_bytes(b"%PDF-1.4 dummy deed for ensemble")

    result = await AIRouter.extract_with_ensemble(
        file_path=str(sample_file),
        mime_type="application/pdf",
        document_type="7/12_extract",
        providers=["sarvam", "mistral"]
    )

    assert result is not None
    assert "_model_comparison" in result
    comparison = result["_model_comparison"]
    assert "overall_agreement_score" in comparison
    assert comparison["overall_agreement_score"] >= 0.75
    assert len(comparison["compared_models"]) == 2


def test_end_to_end_high_accuracy_processing_api(client, db_session):
    # Upload deed
    file_bytes = b"%PDF-1.4 high accuracy deed payload"
    files = [("files", ("ensemble_deed.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]

    # Process in high_accuracy mode
    process_payload = {
        "provider": "sarvam",
        "document_type": "7/12_extract",
        "mode": "high_accuracy"
    }
    res = client.post(f"/api/documents/{doc_id}/process?sync=true", json=process_payload)
    assert res.status_code in [200, 202]
    data = res.json()
    assert data["status"] == "COMPLETED"
    assert "_model_comparison" in data["extracted_data"]
    assert data["extracted_data"]["_routing_metadata"]["mode"] == "high_accuracy_ensemble"
