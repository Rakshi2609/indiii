import pytest
from app.models.parcel import Parcel
from app.models.record import Evidence, LandRecord
from app.models.validation import IssueSeverity, IssueType
from app.services.validation_service import validation_service
from app.services.gis_service import gis_service


def test_rule_checks_missing_mandatory_fields():
    # Record with missing survey number and village
    record = LandRecord(
        document_id=1,
        state="Maharashtra",
        district=None,
        taluk=None,
        village=None,
        survey_number="",
        total_area=2.50,
        cultivable_area=2.50,
        uncultivable_area=0.0,
        area_unit="hectares",
        owners_data=[{"name_english": "Test Owner"}],
        evidence_items=[]
    )

    issues, score, status_str = validation_service.validate_record(record)
    field_names = [i["field_name"] for i in issues]
    assert "survey_number" in field_names
    assert "village" in field_names
    assert score < 0.80


def test_area_arithmetic_balance_check():
    # Extent mismatch: 2.00 + 1.00 != 5.00
    record = LandRecord(
        document_id=2,
        state="Karnataka",
        district="Bengaluru Rural",
        taluk="Devanahalli",
        village="Kundana",
        survey_number="104",
        total_area=5.00,
        cultivable_area=2.00,
        uncultivable_area=1.00,
        area_unit="hectares",
        owners_data=[{"name_english": "Kempe Gowda"}],
        evidence_items=[
            Evidence(field_name="survey_number", extracted_value="104", confidence_score=0.98),
            Evidence(field_name="total_area", extracted_value="5.00", confidence_score=0.95)
        ]
    )

    issues, score, status_str = validation_service.validate_record(record)
    area_issues = [i for i in issues if i["field_name"] == "area_balance"]
    assert len(area_issues) == 1
    assert area_issues[0]["severity"] in [IssueSeverity.HIGH, IssueSeverity.MEDIUM]


def test_gis_discrepancy_detection_logic():
    # Parcel area 1.50 Ha vs Deed Extracted Area 2.50 Ha (> 5% discrepancy)
    record = LandRecord(
        document_id=3,
        survey_number="142/2A",
        village="Wagholi",
        district="Pune",
        state="Maharashtra",
        total_area=2.50,
        area_unit="hectares"
    )

    parcel = Parcel(
        id=101,
        survey_number="142/2A",
        village="Wagholi",
        district="Pune",
        state="Maharashtra",
        area=1.50
    )

    conflict = gis_service.check_spatial_discrepancy(record=record, parcel=parcel)
    assert conflict is not None
    assert conflict["issue_type"] == IssueType.GIS_CONFLICT
    assert conflict["field_name"] == "spatial_area_discrepancy"
    assert "Spatial boundary discrepancy" in conflict["description"]
