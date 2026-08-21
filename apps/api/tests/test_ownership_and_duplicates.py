import io
import pytest
from app.models.record import Evidence, LandRecord
from app.models.validation import IssueSeverity, IssueType
from app.services.duplicate_service import duplicate_service
from app.services.ownership_service import ownership_service
from app.services.validation_service import validation_service


def test_ownership_name_normalization():
    assert ownership_service.normalize_name("Shri Ramesh Shankarrao Patil") == "ramesh shankarrao patil"
    assert ownership_service.normalize_name("Smt. Sunita Ramesh Patil") == "sunita ramesh patil"
    assert ownership_service.normalize_name("Late Govind Rao") == "govind rao"


def test_entity_match_score():
    score_exact = ownership_service.calculate_entity_match_score("Ramesh Patil", "Shri Ramesh Patil")
    assert score_exact >= 0.95

    score_similar = ownership_service.calculate_entity_match_score(
        "Ramesh Shankarrao Patil",
        "Ramesh S Patil"
    )
    assert score_similar >= 0.70

    score_different = ownership_service.calculate_entity_match_score("Ramesh Patil", "Vikram Deshmukh")
    assert score_different < 0.35
    assert score_similar > (score_different * 2)


def test_ownership_chain_analysis():
    # Record with valid mutation links
    rec_valid = LandRecord(
        document_id=1,
        state="Maharashtra",
        district="Pune",
        village="Wagholi",
        survey_number="142",
        owners_data=[
            {"name_english": "Ramesh Patil", "mutation_entry_number": "M-4512"}
        ],
        mutations_data=[
            {"mutation_number": "M-4512", "type": "Partition"}
        ]
    )
    issues_valid = ownership_service.analyze_ownership_chain(rec_valid)
    assert len(issues_valid) == 0

    # Record with unlinked / missing mutation link
    rec_unlinked = LandRecord(
        document_id=2,
        state="Maharashtra",
        district="Pune",
        village="Wagholi",
        survey_number="142",
        owners_data=[
            {"name_english": "Ramesh Patil", "mutation_entry_number": "M-9999"}  # Not in mutations
        ],
        mutations_data=[
            {"mutation_number": "M-4512", "type": "Partition"}
        ]
    )
    issues_unlinked = ownership_service.analyze_ownership_chain(rec_unlinked)
    assert len(issues_unlinked) == 1
    assert issues_unlinked[0]["severity"] == IssueSeverity.HIGH
    assert "M-9999" in issues_unlinked[0]["description"]


def test_duplicate_record_similarity_calculation():
    rec1 = LandRecord(
        document_id=1,
        state="Maharashtra",
        district="Pune",
        village="Wagholi",
        survey_number="142",
        hissa_number="2B",
        total_area=1.50,
        owners_data=[{"name_english": "Ramesh Shankarrao Patil"}]
    )

    # Near identical duplicate record
    rec2 = LandRecord(
        document_id=2,
        state="Maharashtra",
        district="Pune",
        village="Wagholi",
        survey_number="142",
        hissa_number="2B",
        total_area=1.50,
        owners_data=[{"name_english": "Ramesh S Patil"}]
    )

    similarity, factors = duplicate_service.calculate_record_similarity(rec1, rec2)
    assert similarity >= 0.85
    assert "Same Village" in factors
    assert "Identical Survey/Hissa (142/2B)" in factors


def test_end_to_end_duplicate_detection_api(client):
    # 1. Upload first deed for Survey 142
    file1 = b"%PDF-1.4 original deed for survey 142"
    files1 = [("files", ("deed_first.pdf", io.BytesIO(file1), "application/pdf"))]
    upload_res1 = client.post("/api/documents/upload", files=files1)
    doc_id1 = upload_res1.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id1}/process?sync=true")

    # 2. Upload second conflicting deed for the same Survey 142 in Wagholi
    file2 = b"%PDF-1.4 second conflicting deed for survey 142"
    files2 = [("files", ("deed_duplicate.pdf", io.BytesIO(file2), "application/pdf"))]
    upload_res2 = client.post("/api/documents/upload", files=files2)
    doc_id2 = upload_res2.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id2}/process?sync=true")

    # 3. Retrieve second record and verify duplicate collision flag
    rec_res2 = client.get(f"/api/records/by-document/{doc_id2}")
    assert rec_res2.status_code == 200
    rec_data2 = rec_res2.json()

    # Verify duplicate issues in validation results
    val_issues = rec_data2["validation_results"]
    duplicate_flags = [v for v in val_issues if "duplicate" in v["field_name"] or "collision" in v["field_name"]]
    assert len(duplicate_flags) >= 1
    assert duplicate_flags[0]["issue_type"] == "DB_MATCH"
    assert "duplicate" in duplicate_flags[0]["description"].lower() or "double registration" in duplicate_flags[0]["description"].lower()
