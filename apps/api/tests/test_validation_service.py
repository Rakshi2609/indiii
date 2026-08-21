import io
import pytest
from app.models.document import DocumentStatus
from app.models.record import Evidence, LandRecord
from app.models.validation import IssueSeverity, IssueType, ValidationStatus
from app.services.validation_service import validation_service


def test_validation_rule_checks():
    # 1. Clean valid record
    clean_record = LandRecord(
        document_id=1,
        state="Maharashtra",
        district="Pune",
        taluk="Haveli",
        village="Wagholi",
        survey_number="142",
        total_area=1.50,
        cultivable_area=1.45,
        uncultivable_area=0.05,
        area_unit="hectares",
        owners_data=[
            {"name_english": "Ramesh Patil", "share_percentage": 50.0, "mutation_entry_number": "M-101"},
            {"name_english": "Suresh Patil", "share_percentage": 50.0, "mutation_entry_number": "M-101"}
        ],
        mutations_data=[
            {"mutation_number": "M-101", "type": "Inheritance"}
        ],
        encumbrances_data=[],
        evidence_items=[
            Evidence(field_name="survey_number", extracted_value="142", confidence_score=0.98),
            Evidence(field_name="village", extracted_value="Wagholi", confidence_score=0.96)
        ]
    )

    issues, score, status_str = validation_service.validate_record(clean_record)
    assert len(issues) == 0
    assert score >= 0.95
    assert status_str == "VERIFIED_CLEAR"

    # 2. Defective record (Missing survey, area mismatch, low confidence)
    bad_record = LandRecord(
        document_id=2,
        state="Maharashtra",
        district="Unknown District",
        taluk=None,
        village="Unknown Village",
        survey_number="0",
        total_area=1.50,
        cultivable_area=1.00,
        uncultivable_area=0.00,  # Unbalanced: 1.00 != 1.50
        area_unit="hectares",
        owners_data=[],
        encumbrances_data=[{"type": "Bank Boja", "status": "Active", "amount_inr": 200000}],
        evidence_items=[
            Evidence(field_name="survey_number", extracted_value="0", confidence_score=0.55)
        ]
    )

    bad_issues, bad_score, bad_status = validation_service.validate_record(bad_record)
    assert len(bad_issues) >= 4
    assert any(i["severity"] == IssueSeverity.CRITICAL for i in bad_issues)
    assert bad_status == "REJECTED_CRITICAL"
    assert bad_score < 0.60


def test_end_to_end_validation_endpoint(client):
    # 1. Upload a document
    file_bytes = b"%PDF-1.4 sample satbara deed for validation engine testing"
    files = [("files", ("satbara_val_test.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]

    # 2. Process document (triggering OCR + Extraction + Validation)
    proc_res = client.post(f"/api/documents/{doc_id}/process?sync=true")
    assert proc_res.status_code == 202

    # 3. Retrieve record and check validation results
    record_res = client.get(f"/api/records/by-document/{doc_id}")
    assert record_res.status_code == 200
    rec_data = record_res.json()
    record_id = rec_data["id"]

    assert "overall_confidence_score" in rec_data
    assert "validation_status" in rec_data
    assert "validation_results" in rec_data
    assert isinstance(rec_data["validation_results"], list)

    # 4. Trigger validation manually via POST /api/records/{id}/validate
    val_trigger_res = client.post(f"/api/records/{record_id}/validate")
    assert val_trigger_res.status_code == 200
    val_data = val_trigger_res.json()
    assert val_data["record_id"] == record_id
    assert "summary" in val_data
    assert val_data["summary"]["record_id"] == record_id

    # 5. If there are validation issues, test resolving one
    if val_data["summary"]["issues"]:
        first_issue_id = val_data["summary"]["issues"][0]["id"]
        patch_res = client.patch(
            f"/api/records/{record_id}/validation/{first_issue_id}",
            json={"status": "RESOLVED", "description": "Resolved by field verification officer."}
        )
        assert patch_res.status_code == 200
        assert patch_res.json()["status"] == "RESOLVED"
