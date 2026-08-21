import io
import pytest
from app.ai.router import DocumentAIProvider, get_document_ai_provider
from app.ai.sarvam import SarvamProvider
from app.models.document import Document, DocumentStatus
from app.services.document_service import document_service


def test_provider_registration_and_resolution():
    provider = get_document_ai_provider("sarvam")
    assert isinstance(provider, DocumentAIProvider)
    assert isinstance(provider, SarvamProvider)
    assert provider.provider_name == "Sarvam Vision AI"


@pytest.mark.asyncio
async def test_sarvam_provider_extract_information(tmp_path):
    # Create a temporary mock revenue document file
    sample_file = tmp_path / "mock_712_satbara.pdf"
    sample_file.write_bytes(b"%PDF-1.4 Mock Satbara Document Content for Haveli Wagholi")

    provider = SarvamProvider()
    result = await provider.extract_information(
        file_path=str(sample_file),
        mime_type="application/pdf",
        document_type="7/12_extract"
    )

    assert "revenue_identifiers" in result
    assert result["revenue_identifiers"]["survey_number"] == "142"
    assert result["location"]["village"] == "Wagholi"
    assert len(result["owners"]) >= 2
    assert "encumbrances_and_charges" in result
    assert "mutation_history" in result
    assert result["extraction_confidence"] > 0.90


def test_document_process_endpoint_sync(client):
    # 1. Upload a document
    file_bytes = b"%PDF-1.4 test satbara for sync processing"
    files = [("files", ("satbara_haveli_142.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["documents"][0]["id"]

    # 2. Process document synchronously
    process_res = client.post(
        f"/api/documents/{doc_id}/process?sync=true",
        json={"provider": "sarvam", "document_type": "7/12_extract"}
    )
    assert process_res.status_code == 202
    data = process_res.json()
    assert data["status"] == "COMPLETED"
    assert data["document_id"] == doc_id
    assert data["extracted_data"] is not None
    assert data["extracted_data"]["revenue_identifiers"]["survey_number"] == "142"

    # 3. Retrieve extraction via direct endpoint
    ext_res = client.get(f"/api/documents/{doc_id}/extraction")
    assert ext_res.status_code == 200
    ext_data = ext_res.json()
    assert ext_data["location"]["district"] == "Pune"
    assert ext_data["location"]["village"] == "Wagholi"


def test_document_process_endpoint_background(client):
    # 1. Upload a document
    file_bytes = b"%PDF-1.4 test satbara for background processing"
    files = [("files", ("satbara_bg_142.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]

    # 2. Process document via background task
    process_res = client.post(
        f"/api/documents/{doc_id}/process",
        json={"provider": "sarvam", "document_type": "7/12_extract"}
    )
    assert process_res.status_code == 202
    data = process_res.json()
    assert data["document_id"] == doc_id
    assert data["status"] == "PROCESSING"


def test_process_nonexistent_document(client):
    res = client.post("/api/documents/99999/process")
    assert res.status_code == 404
