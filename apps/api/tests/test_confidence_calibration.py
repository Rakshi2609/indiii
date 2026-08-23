from app.models.record import Evidence, LandRecord
from app.services.extraction_service import extraction_service
from app.services.validation_service import validation_service
from app.services.consensus_engine import consensus_engine
from app.ai.sarvam import SarvamProvider


def test_himachal_stamp_document_is_evidence_normalized_and_capped_low():
    """A degraded Devanagari legal document must not inherit land-record certainty."""
    raw = {
        "document_type": "Unknown",
        "detected_language": {"primary": "unknown", "name": "Unknown", "confidence": None},
        "ocr_transcript_sample": "भारत सरकार हिमाचल प्रदेश यह कानूनी दस्तावेज है",
        "quality_assessment": {"quality": "CRITICAL"},
    }
    structured = extraction_service.map_raw_to_structured(raw)
    assert structured.administrative.state == "Himachal Pradesh"

    record = LandRecord(
        state=structured.administrative.state,
        district="Unknown District",
        village="Unknown Village",
        survey_number="0",
        total_area=None,
        owners_data=[],
        raw_extracted_payload=raw,
    )
    issues, score, status = validation_service.validate_record(record)

    assert score <= 0.20
    assert status == "REJECTED_CRITICAL"
    assert {"document_type", "language", "survey_number", "owners", "total_area"}.issubset(
        {issue["field_name"] for issue in issues}
    )


def test_complete_maharashtra_record_keeps_field_evidence_confidence():
    """A complete, evidence-backed 7/12 record is not capped by the new guardrails."""
    record = LandRecord(
        state="Maharashtra",
        district="Pune",
        village="Wagholi",
        survey_number="142",
        total_area=1.5,
        owners_data=[{"name_english": "Ramesh Patil"}],
        raw_extracted_payload={
            "document_type": "7/12_extract",
            "detected_language": {"primary": "mr", "name": "Marathi", "script": "Devanagari", "confidence": 0.98},
            "quality_assessment": {"quality": "GOOD"},
        },
        evidence_items=[Evidence(field_name="survey_number", extracted_value="142", confidence_score=0.96)],
    )
    _, score, status = validation_service.validate_record(record)

    assert score >= 0.90
    assert status == "VERIFIED_CLEAR"


def test_missing_values_are_not_provider_consensus():
    result = consensus_engine.run_consensus({}, {})
    assert result["overall_agreement_score"] is None
    assert result["agreed_count"] == 0


def test_sarvam_result_envelope_keeps_provider_fields():
    parsed = SarvamProvider()._parse_sarvam_extract_output(
        {"result": {"document_type": "Sale Deed", "state": "HIMACHAL PRADESH", "detected_language": "Hindi"}},
        "document.png",
        None,
    )
    assert parsed["document_type"] == "Sale Deed"
    assert parsed["location"]["state"] == "HIMACHAL PRADESH"
    assert parsed["detected_language"]["name"] == "Hindi"
