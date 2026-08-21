import logging
from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.record import Evidence, LandRecord
from app.models.validation import IssueSeverity, IssueType, ValidationResult, ValidationStatus
from app.schemas.validation import ValidationResultResponse, ValidationSummary
from app.services.duplicate_service import duplicate_service
from app.services.gis_service import gis_service
from app.services.ownership_service import ownership_service

logger = logging.getLogger(__name__)


class ValidationService:
    """
    Automated validation engine for land records: runs cross-field consistency rules,
    area balance formulas, ownership chain mutations, duplicate detection, GIS spatial discrepancies,
    and evidence confidence scans.
    """

    def validate_record(
        self,
        record: LandRecord,
        db: Optional[Session] = None
    ) -> Tuple[List[Dict[str, Any]], float, str]:
        """
        Execute deterministic rule-based checks, ownership chain audits, duplicate scans, and GIS checks on a LandRecord.
        Returns: (issues_list, overall_confidence_score, validation_status)
        """
        issues: List[Dict[str, Any]] = []

        # -------------------------------------------------------------
        # 1. Mandatory Fields & Identification Checks
        # -------------------------------------------------------------
        if not record.survey_number or record.survey_number in ["0", "", "None", "null"]:
            issues.append({
                "issue_type": IssueType.RULE,
                "field_name": "survey_number",
                "expected_value": "Valid Survey / Khasra number",
                "extracted_value": str(record.survey_number),
                "severity": IssueSeverity.CRITICAL,
                "description": "Missing or invalid mandatory Survey Number / Khasra Number."
            })

        if not record.village or "Unknown" in record.village:
            issues.append({
                "issue_type": IssueType.RULE,
                "field_name": "village",
                "expected_value": "Recognized revenue village name",
                "extracted_value": str(record.village),
                "severity": IssueSeverity.HIGH,
                "description": "Revenue village is missing or unverified."
            })

        if not record.district or "Unknown" in record.district:
            issues.append({
                "issue_type": IssueType.RULE,
                "field_name": "district",
                "expected_value": "Valid district name",
                "extracted_value": str(record.district),
                "severity": IssueSeverity.HIGH,
                "description": "Administrative district name is missing or unverified."
            })

        # -------------------------------------------------------------
        # 2. Area Balance and Positivity Checks
        # -------------------------------------------------------------
        if record.total_area is None or record.total_area <= 0:
            issues.append({
                "issue_type": IssueType.RULE,
                "field_name": "total_area",
                "expected_value": "> 0.0",
                "extracted_value": str(record.total_area),
                "severity": IssueSeverity.HIGH,
                "description": "Total land area must be a strictly positive quantity."
            })
        else:
            # Check sub-area arithmetic (Cultivable + Pot Kharaba == Total Area)
            if record.cultivable_area is not None and record.uncultivable_area is not None:
                computed_sum = round(record.cultivable_area + record.uncultivable_area, 4)
                reported_total = round(record.total_area, 4)
                if abs(computed_sum - reported_total) > 0.01:
                    issues.append({
                        "issue_type": IssueType.RULE,
                        "field_name": "area_balance",
                        "expected_value": f"{reported_total} {record.area_unit}",
                        "extracted_value": f"{computed_sum} {record.area_unit} (Cultivable: {record.cultivable_area} + Pot Kharaba: {record.uncultivable_area})",
                        "severity": IssueSeverity.MEDIUM,
                        "description": "Area sum mismatch: Cultivable area and Pot Kharaba do not balance with reported Total Area."
                    })

        # -------------------------------------------------------------
        # 3. Ownership & Share Proportion Checks
        # -------------------------------------------------------------
        owners = record.owners_data or []
        if not owners:
            issues.append({
                "issue_type": IssueType.RULE,
                "field_name": "owners",
                "expected_value": "At least 1 registered land occupant / owner",
                "extracted_value": "0 owners found",
                "severity": IssueSeverity.HIGH,
                "description": "No registered land owners or khatadars identified in record."
            })
        else:
            percentages = [o.get("share_percentage") for o in owners if o.get("share_percentage") is not None]
            if len(percentages) == len(owners) and len(owners) > 0:
                total_percentage = sum(percentages)
                if abs(total_percentage - 100.0) > 1.0:
                    issues.append({
                        "issue_type": IssueType.RULE,
                        "field_name": "ownership_shares",
                        "expected_value": "100.0%",
                        "extracted_value": f"{total_percentage}%",
                        "severity": IssueSeverity.MEDIUM,
                        "description": f"Aggregate ownership shares total {total_percentage}%, expected 100.0%."
                    })

        # -------------------------------------------------------------
        # 4. Ownership Chain & Mutation Continuity (OwnershipService)
        # -------------------------------------------------------------
        ownership_issues = ownership_service.analyze_ownership_chain(record)
        issues.extend(ownership_issues)

        # -------------------------------------------------------------
        # 5. Duplicate & Collision Detection (DuplicateDetectionService)
        # -------------------------------------------------------------
        if db is not None:
            duplicate_issues = duplicate_service.detect_duplicates(record, db)
            issues.extend(duplicate_issues)

        # -------------------------------------------------------------
        # 6. GIS Spatial Discrepancy & Cadastral Checks (GISService)
        # -------------------------------------------------------------
        if db is not None:
            spatial_issues = gis_service.validate_spatial_alignment(record, db)
            issues.extend(spatial_issues)

        # -------------------------------------------------------------
        # 7. Evidence Confidence & OCR Quality Checks
        # -------------------------------------------------------------
        evidence_items = record.evidence_items or []
        confidences: List[float] = []
        for ev in evidence_items:
            confidences.append(ev.confidence_score)
            if ev.confidence_score < 0.70:
                issues.append({
                    "issue_type": IssueType.RULE,
                    "field_name": ev.field_name,
                    "expected_value": "Confidence >= 0.85",
                    "extracted_value": f"{ev.confidence_score:.2f} ({ev.extracted_value})",
                    "severity": IssueSeverity.HIGH,
                    "description": f"Low OCR extraction confidence ({ev.confidence_score:.2f}) for field '{ev.field_name}'."
                })
            elif ev.confidence_score < 0.85:
                issues.append({
                    "issue_type": IssueType.RULE,
                    "field_name": ev.field_name,
                    "expected_value": "Confidence >= 0.85",
                    "extracted_value": f"{ev.confidence_score:.2f} ({ev.extracted_value})",
                    "severity": IssueSeverity.LOW,
                    "description": f"Marginal OCR confidence ({ev.confidence_score:.2f}) for field '{ev.field_name}'."
                })

        # -------------------------------------------------------------
        # 8. Encumbrance & Boja Active Charge Alerts
        # -------------------------------------------------------------
        encumbrances = record.encumbrances_data or []
        for enc in encumbrances:
            if enc.get("status") in ["Active", "Active / Unreleased", "Pending"]:
                issues.append({
                    "issue_type": IssueType.DB_MATCH,
                    "field_name": "encumbrance",
                    "expected_value": "No active lien / charge",
                    "extracted_value": f"{enc.get('type')}: INR {enc.get('amount_inr', 0):,.2f} ({enc.get('institution', 'Bank')})",
                    "severity": IssueSeverity.MEDIUM,
                    "description": f"Active encumbrance detected: {enc.get('type')} of INR {enc.get('amount_inr', 0):,.2f} registered at {enc.get('institution')}."
                })

        # -------------------------------------------------------------
        # 9. Overall Confidence & Health Score Calculation
        # -------------------------------------------------------------
        base_confidence = (sum(confidences) / len(confidences)) if confidences else 0.95

        penalties = 0.0
        for issue in issues:
            sev = issue["severity"]
            if sev == IssueSeverity.CRITICAL:
                penalties += 0.25
            elif sev == IssueSeverity.HIGH:
                penalties += 0.12
            elif sev == IssueSeverity.MEDIUM:
                penalties += 0.04
            elif sev == IssueSeverity.LOW:
                penalties += 0.01

        final_score = max(0.0, min(1.0, round(base_confidence - penalties, 3)))

        if any(i["severity"] == IssueSeverity.CRITICAL for i in issues):
            val_status = "REJECTED_CRITICAL"
        elif any(i["severity"] == IssueSeverity.HIGH for i in issues):
            val_status = "FLAGGED_FOR_REVIEW"
        elif any(i["severity"] == IssueSeverity.MEDIUM for i in issues):
            val_status = "VERIFIED_WITH_WARNINGS"
        else:
            val_status = "VERIFIED_CLEAR"

        return issues, final_score, val_status

    def validate_and_persist_record(
        self,
        record: LandRecord,
        db: Session
    ) -> Tuple[LandRecord, ValidationSummary]:
        """
        Run validation checks, persist ValidationResult records in DB,
        and update the LandRecord's overall_confidence_score and validation_status.
        """
        raw_issues, confidence_score, val_status = self.validate_record(record, db)

        # Update LandRecord summary fields
        record.overall_confidence_score = confidence_score
        record.validation_status = val_status

        # Clear existing validation results for this record
        db.query(ValidationResult).filter(ValidationResult.record_id == record.id).delete()

        persisted_results: List[ValidationResult] = []
        critical_c = 0
        high_c = 0
        med_c = 0
        low_c = 0

        for item in raw_issues:
            v_res = ValidationResult(
                record_id=record.id,
                issue_type=item["issue_type"],
                field_name=item["field_name"],
                expected_value=item.get("expected_value"),
                extracted_value=item.get("extracted_value"),
                severity=item["severity"],
                status=ValidationStatus.PENDING,
                description=item.get("description")
            )
            db.add(v_res)
            persisted_results.append(v_res)

            sev = item["severity"]
            if sev == IssueSeverity.CRITICAL:
                critical_c += 1
            elif sev == IssueSeverity.HIGH:
                high_c += 1
            elif sev == IssueSeverity.MEDIUM:
                med_c += 1
            elif sev == IssueSeverity.LOW:
                low_c += 1

        db.commit()
        db.refresh(record)

        summary = ValidationSummary(
            record_id=record.id,
            overall_confidence_score=confidence_score,
            validation_status=val_status,
            total_issues=len(persisted_results),
            critical_count=critical_c,
            high_count=high_c,
            medium_count=med_c,
            low_count=low_c,
            issues=[ValidationResultResponse.model_validate(p) for p in persisted_results]
        )

        logger.info(
            f"Record {record.id} validated with ownership, duplicate & GIS checks: score={confidence_score}, status={val_status}, issues={len(persisted_results)}"
        )
        return record, summary


# Singleton instance
validation_service = ValidationService()
