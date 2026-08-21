import io
import pytest
from app.models.audit import VerificationAction, VerificationAuditLog
from app.models.record import LandRecord
from app.models.user import User, UserRole
from app.services.verification_service import verification_service


def test_verification_queue_and_details(client):
    # 1. Upload & Process a document
    file_content = b"%PDF-1.4 sample deed for verification testing"
    files = [("files", ("verif_deed.pdf", io.BytesIO(file_content), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id}/process?sync=true")

    # 2. Get record ID
    rec_res = client.get(f"/api/records/by-document/{doc_id}")
    assert rec_res.status_code == 200
    record_id = rec_res.json()["id"]

    # 3. Query verification queue
    queue_res = client.get("/api/verification/queue")
    assert queue_res.status_code == 200
    queue_data = queue_res.json()
    assert queue_data["total"] >= 1
    queue_item = next((item for item in queue_data["items"] if item["record_id"] == record_id), None)
    assert queue_item is not None
    assert queue_item["survey_number"] == "142"

    # 4. Fetch verification workspace details
    detail_res = client.get(f"/api/verification/{record_id}")
    assert detail_res.status_code == 200
    detail_data = detail_res.json()
    assert detail_data["record"]["id"] == record_id
    assert "/api/documents/" in detail_data["document_file_url"]
    assert "administrative" in detail_data["record"]
    assert "evidence" in detail_data["record"]


def test_approve_record_workflow(client):
    # 1. Setup document & record
    file_content = b"%PDF-1.4 deed for approval test"
    files = [("files", ("approval_test.pdf", io.BytesIO(file_content), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id}/process?sync=true")
    rec_id = client.get(f"/api/records/by-document/{doc_id}").json()["id"]

    # 2. Approve record
    app_res = client.post(
        f"/api/verification/{rec_id}/approve",
        json={"notes": "All boundaries and khatadars manually cross-verified."}
    )
    assert app_res.status_code == 200
    app_data = app_res.json()
    assert app_data["action"] == "APPROVE"
    assert app_data["new_status"] == "VERIFIED_MANUAL"

    # 3. Check detail endpoint shows audit history
    detail_res = client.get(f"/api/verification/{rec_id}")
    assert len(detail_res.json()["audit_history"]) >= 1
    assert detail_res.json()["audit_history"][0]["action"] == "APPROVE"


def test_correct_record_workflow(client):
    # 1. Setup document & record
    file_content = b"%PDF-1.4 deed for correction test"
    files = [("files", ("correction_test.pdf", io.BytesIO(file_content), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id}/process?sync=true")
    rec_id = client.get(f"/api/records/by-document/{doc_id}").json()["id"]

    # 2. Apply corrections to survey number and total area
    correction_payload = {
        "corrected_fields": {
            "survey_number": "142/3A",
            "total_area": 1.75,
            "village": "Wagholi Khurd"
        },
        "notes": "Survey number adjusted based on village map cross-reference."
    }
    corr_res = client.post(f"/api/verification/{rec_id}/correct", json=correction_payload)
    assert corr_res.status_code == 200
    corr_data = corr_res.json()
    assert corr_data["action"] == "CORRECT"
    assert corr_data["new_status"] == "VERIFIED_CORRECTED"

    # 3. Verify record was updated in database
    rec_updated = client.get(f"/api/records/{rec_id}").json()
    assert rec_updated["land"]["survey_number"] == "142/3A"
    assert rec_updated["land"]["total_area"] == 1.75
    assert rec_updated["administrative"]["village"] == "Wagholi Khurd"


def test_reject_record_workflow(client):
    # 1. Setup document & record
    file_content = b"%PDF-1.4 deed for reject test"
    files = [("files", ("reject_test.pdf", io.BytesIO(file_content), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id}/process?sync=true")
    rec_id = client.get(f"/api/records/by-document/{doc_id}").json()["id"]

    # 2. Reject record
    rej_res = client.post(
        f"/api/verification/{rec_id}/reject",
        json={"reason": "Fraudulent seal detected", "notes": "Seal does not match Sub-Registrar records."}
    )
    assert rej_res.status_code == 200
    rej_data = rej_res.json()
    assert rej_data["action"] == "REJECT"
    assert rej_data["new_status"] == "REJECTED_MANUAL"

    # 3. Verify status on record
    rec_data = client.get(f"/api/records/{rec_id}").json()
    assert rec_data["validation_status"] == "REJECTED_MANUAL"
