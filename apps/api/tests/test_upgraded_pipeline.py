import pytest
import numpy as np
from unittest.mock import MagicMock, patch
from app.services.document_image_pipeline import document_image_pipeline
from app.services.consensus_engine import consensus_engine
from app.services.validation_service import validation_service
from app.services.reasoning_engine import reasoning_engine
from app.models.record import LandRecord
from app.models.validation import IssueSeverity

def test_image_quality_assessment():
    # 1. Clean document image with texture/text-like lines
    img_clean = np.ones((1000, 1000, 3), dtype=np.uint8) * 255
    for i in range(100, 900, 40):
        img_clean[i:i+10, 100:900] = 0
    res_clean = document_image_pipeline.assess_quality(img_clean)
    assert res_clean["quality"] in ["GOOD", "FAIR"]

    # 2. Blurry/low-contrast document
    img_blur = np.zeros((100, 100, 3), dtype=np.uint8)
    res_blur = document_image_pipeline.assess_quality(img_blur)
    assert res_blur["quality"] == "CRITICAL"
    assert res_blur["blur_score"] < 50


def test_ocr_consensus_matching():
    # 7. Conflicting OCR
    sarvam = {
        "document_type": "7/12_extract",
        "revenue_identifiers": {"survey_number": "142"},
        "location": {"village": "Wagholi", "district": "Pune"},
        "area_and_tenure": {"total_area_hectares": 1.50}
    }
    mistral = {
        "document_type": "7/12_extract",
        "revenue_identifiers": {"survey_number": "143"},  # Mismatch
        "location": {"village": "Wagholi", "district": "Pune"},
        "area_and_tenure": {"total_area_hectares": 1.90}  # Mismatch
    }

    res = consensus_engine.run_consensus(sarvam, mistral)
    assert res["overall_agreement_score"] < 1.0
    assert "survey_number" in res["conflicts"]
    assert "total_area" in res["conflicts"]


def test_validation_engine_rules():
    # 8. Missing Owner
    record = LandRecord(
        survey_number="142",
        village="Wagholi",
        district="Pune",
        state="Maharashtra",
        total_area=1.50,
        cultivable_area=1.00,
        uncultivable_area=0.50,
        owners_data=[]
    )
    issues, _, status = validation_service.validate_record(record)
    assert any("owners" in i["field_name"] for i in issues)
    assert status == "FLAGGED_FOR_REVIEW"

    # 9. Ownership share != 100%
    record.owners_data = [
        {"name_english": "Ramesh", "share_percentage": 50.0},
        {"name_english": "Suresh", "share_percentage": 40.0}  # Total 90%
    ]
    issues, _, _ = validation_service.validate_record(record)
    assert any("ownership_shares" in i["field_name"] for i in issues)

    # 10. Area mismatch (Cultivable + Uncultivable != Total Area)
    record.uncultivable_area = 0.20 # Total 1.20 vs 1.50
    issues, _, _ = validation_service.validate_record(record)
    assert any("area_balance" in i["field_name"] for i in issues)

    # 12. Malformed survey number
    record.survey_number = "abcde-12345"
    issues, _, _ = validation_service.validate_record(record)
    assert any("survey_number" in i["field_name"] for i in issues)


@pytest.mark.asyncio
async def test_reasoning_engine_grounding():
    # 11. Test explainable reasoning layer returns correct format without hallucinating
    record = LandRecord(
        survey_number="142",
        village="Wagholi",
        district="Pune",
        state="Maharashtra",
        total_area=1.50,
        owners_data=[{"name_english": "Ramesh"}]
    )
    
    mock_db = MagicMock()
    # Mock validation results
    mock_db.query.return_value.filter.return_value.all.return_value = [
        MagicMock(field_name="area_balance", issue_type="RULE", severity=IssueSeverity.HIGH, expected_value="1.5", extracted_value="1.2", description="Area mismatch")
    ]

    res = await reasoning_engine.generate_reasoning(record, mock_db)
    assert "finding" in res
    assert "severity" in res
    assert "evidence" in res
    assert "reason" in res
    assert "action" in res
    assert "Fraud" not in res["reason"]
