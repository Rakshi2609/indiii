import logging
from typing import Any, Dict, List, Tuple
from sqlalchemy.orm import Session
from rapidfuzz import fuzz

from app.models.record import LandRecord
from app.models.validation import IssueSeverity, IssueType
from app.services.ownership_service import ownership_service

logger = logging.getLogger(__name__)


class DuplicateDetectionService:
    """
    Constructs multi-factor land record fingerprints and scans for potential duplicates,
    conflicting deed registrations, and double-encumbrances across the registry.
    """

    DUPLICATE_SIMILARITY_THRESHOLD = 0.80

    def calculate_record_similarity(
        self,
        rec1: LandRecord,
        rec2: LandRecord
    ) -> Tuple[float, List[str]]:
        """
        Calculate multi-factor similarity between two land records.
        Returns: (composite_similarity_score, matched_factors)
        """
        matched_factors: List[str] = []

        # 1. Administrative Location Match (Weight: 0.25)
        loc_score = 0.0
        v1 = (rec1.village or "").lower().strip()
        v2 = (rec2.village or "").lower().strip()
        d1 = (rec1.district or "").lower().strip()
        d2 = (rec2.district or "").lower().strip()

        if v1 and v2 and v1 == v2:
            loc_score += 0.70
            matched_factors.append("Same Village")
        elif v1 and v2 and fuzz.ratio(v1, v2) > 85:
            loc_score += 0.50
            matched_factors.append("Fuzzy Village Match")

        if d1 and d2 and d1 == d2:
            loc_score += 0.30

        # 2. Survey / Parcel Identifier Match (Weight: 0.35)
        survey_score = 0.0
        s1 = (rec1.survey_number or "").strip()
        s2 = (rec2.survey_number or "").strip()
        h1 = (rec1.hissa_number or "").strip()
        h2 = (rec2.hissa_number or "").strip()

        if s1 and s2 and s1 == s2:
            if h1 and h2 and h1 == h2:
                survey_score = 1.0
                matched_factors.append(f"Identical Survey/Hissa ({s1}/{h1})")
            elif not h1 and not h2:
                survey_score = 1.0
                matched_factors.append(f"Identical Survey ({s1})")
            else:
                survey_score = 0.80
                matched_factors.append(f"Same Survey Root ({s1})")

        # 3. Ownership Entity Comparison (Weight: 0.25)
        owner_score = 0.0
        owners1 = [o.get("name_english", "") for o in (rec1.owners_data or []) if o.get("name_english")]
        owners2 = [o.get("name_english", "") for o in (rec2.owners_data or []) if o.get("name_english")]

        if owners1 and owners2:
            best_owner_matches = []
            for o1 in owners1:
                _, score = ownership_service.find_best_match(o1, owners2)
                best_owner_matches.append(score)
            avg_owner_match = sum(best_owner_matches) / len(best_owner_matches)
            owner_score = avg_owner_match
            if avg_owner_match > 0.85:
                matched_factors.append(f"High Owner Match ({int(avg_owner_match * 100)}%)")

        # 4. Area Tolerance Match (Weight: 0.15)
        area_score = 0.0
        if rec1.total_area and rec2.total_area and rec1.total_area > 0 and rec2.total_area > 0:
            max_area = max(rec1.total_area, rec2.total_area)
            diff = abs(rec1.total_area - rec2.total_area)
            diff_ratio = diff / max_area
            if diff_ratio < 0.02:  # within 2%
                area_score = 1.0
                matched_factors.append("Matching Extent Area (±2%)")
            elif diff_ratio < 0.08:  # within 8%
                area_score = 0.70
                matched_factors.append("Approximate Area Match")

        # Composite Weighted Score
        composite = (
            (loc_score * 0.25) +
            (survey_score * 0.35) +
            (owner_score * 0.25) +
            (area_score * 0.15)
        )
        return round(composite, 3), matched_factors

    def detect_duplicates(
        self,
        record: LandRecord,
        db: Session,
        threshold: float = DUPLICATE_SIMILARITY_THRESHOLD
    ) -> List[Dict[str, Any]]:
        """
        Scan database records to find potential duplicates or double registration conflicts.
        """
        issues: List[Dict[str, Any]] = []

        if not record.survey_number or not record.village:
            return issues

        # Query candidates in the same village or same survey number
        candidates = db.query(LandRecord).filter(
            LandRecord.id != record.id,
            (LandRecord.village == record.village) | (LandRecord.survey_number == record.survey_number)
        ).all()

        for candidate in candidates:
            # Skip if comparing against the exact same uploaded document
            if candidate.document_id == record.document_id:
                continue

            similarity, factors = self.calculate_record_similarity(record, candidate)

            # Check 1: Exact Survey + Village Collision (High Double Registration Risk)
            if (
                candidate.village.lower() == record.village.lower()
                and candidate.survey_number == record.survey_number
            ):
                hissa_match = (candidate.hissa_number or "") == (record.hissa_number or "")
                severity = IssueSeverity.CRITICAL if hissa_match else IssueSeverity.HIGH

                issues.append({
                    "issue_type": IssueType.DB_MATCH,
                    "field_name": "duplicate_survey_collision",
                    "expected_value": "Unique Survey Registration",
                    "extracted_value": f"Matches Record #{candidate.id} (Doc #{candidate.document_id})",
                    "severity": severity,
                    "description": (
                        f"Potential double registration / duplicate deed: Survey '{record.survey_number}' "
                        f"in village '{record.village}' is already registered in Record #{candidate.id} "
                        f"(Factors: {', '.join(factors)}, Similarity: {int(similarity * 100)}%)."
                    )
                })

            # Check 2: High Overall Fingerprint Similarity (>= threshold)
            elif similarity >= threshold:
                issues.append({
                    "issue_type": IssueType.DB_MATCH,
                    "field_name": "high_similarity_fingerprint",
                    "expected_value": "Distinct Land Record",
                    "extracted_value": f"Similarity {int(similarity * 100)}% with Record #{candidate.id}",
                    "severity": IssueSeverity.MEDIUM,
                    "description": (
                        f"Potential duplicate record detected: {int(similarity * 100)}% similarity with Record #{candidate.id}. "
                        f"Matching factors: {', '.join(factors)}."
                    )
                })

        return issues


# Singleton instance
duplicate_service = DuplicateDetectionService()
