import io
import pytest
from app.ai.sarvam import SarvamProvider
from app.models.document import DocumentStatus
from app.models.record import Evidence, LandRecord
from app.services.extraction_service import extraction_service


def test_extraction_service_schema_mapping():
    provider = SarvamProvider()
    mock_raw = provider._generate_domain_mock("satbara_wagholi.pdf", "7/12_extract")

    structured = extraction_service.map_raw_to_structured(mock_raw)

    # Validate Administrative
    assert structured.administrative.state == "Maharashtra"
    assert structured.administrative.district == "Pune"
    assert structured.administrative.taluk == "Haveli"
    assert structured.administrative.village == "Wagholi"

    # Validate Land
    assert structured.land.survey_number == "142"
    assert structured.land.hissa_number == "2B"
    assert structured.land.total_area == 1.50
    assert "Bhogwata" in structured.land.land_tenure

    # Validate Ownership
    assert len(structured.owners) == 2
    assert structured.owners[0].name_english == "Ramesh Shankarrao Patil"
    assert structured.owners[0].share_fraction == "1/2"

    # Validate Mutations & Encumbrances
    assert len(structured.mutations) == 3
    assert len(structured.encumbrances) == 1
    assert structured.encumbrances[0].amount_inr == 500000.0

    # Validate Explainability Evidence
    assert len(structured.evidence) >= 5
    field_names = [e.field_name for e in structured.evidence]
    assert "survey_number" in field_names
    assert "village" in field_names
    assert "total_area" in field_names
    assert "land_tenure" in field_names


def test_end_to_end_extraction_and_records_api(client):
    # 1. Upload a revenue document
    file_bytes = b"%PDF-1.4 sample satbara deed for schema extraction"
    files = [("files", ("satbara_haveli_142.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    assert upload_res.status_code == 201
    doc_id = upload_res.json()["documents"][0]["id"]

    # 2. Trigger AI processing synchronously (this executes Sarvam Vision AI + ExtractionService)
    proc_res = client.post(
        f"/api/documents/{doc_id}/process?sync=true",
        json={"provider": "sarvam", "document_type": "7/12_extract"}
    )
    assert proc_res.status_code == 202
    assert proc_res.json()["status"] == "COMPLETED"

    # 3. Retrieve structured LandRecord by document ID
    by_doc_res = client.get(f"/api/records/by-document/{doc_id}")
    assert by_doc_res.status_code == 200
    record_data = by_doc_res.json()
    record_id = record_data["id"]

    assert record_data["document_id"] == doc_id
    assert record_data["administrative"]["village"] == "Wagholi"
    assert record_data["land"]["survey_number"] == "142"
    assert len(record_data["owners"]) == 2
    assert len(record_data["evidence"]) >= 5

    # 4. List all records with filter
    list_res = client.get("/api/records?village=Wagholi&survey_number=142")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert list_data["total"] >= 1
    assert list_data["items"][0]["administrative"]["village"] == "Wagholi"

    # 5. Fetch explainability evidence endpoint
    ev_res = client.get(f"/api/records/{record_id}/evidence")
    assert ev_res.status_code == 200
    evidence_list = ev_res.json()
    assert len(evidence_list) >= 5
    assert all("confidence_score" in e and "field_name" in e for e in evidence_list)
