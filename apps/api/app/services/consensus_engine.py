import logging
from typing import Any, Dict, List, Optional
from rapidfuzz import fuzz

logger = logging.getLogger(__name__)

class ConsensusEngine:
    """
    Consensus Engine that compares independent OCR/document extractions (Sarvam + Mistral)
    field-by-field, computes agreement and confidence, and reports conflicts.
    """

    COMPARED_FIELDS = [
        "document_type",
        "survey_number",
        "subdivision_number",
        "village",
        "district",
        "taluk",
        "total_area",
        "land_type",
        "mutation_number",
        "mutation_date",
        "registration_number",
        "document_date",
        "ownership_shares",
        "encumbrance_information"
    ]

    def run_consensus(
        self,
        sarvam_data: Dict[str, Any],
        mistral_data: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Compare extraction fields between Sarvam and Mistral."""
        field_consensus = {}
        disagreements_count = 0
        agreements_count = 0

        # Normalization and extraction helpers
        def get_field_value(data: Dict[str, Any], field: str) -> Any:
            if field == "document_type":
                return data.get("document_type")
            elif field == "survey_number":
                return data.get("revenue_identifiers", {}).get("survey_number") or data.get("revenue_identifiers", {}).get("khasra_number")
            elif field == "subdivision_number":
                return data.get("revenue_identifiers", {}).get("hissa_number") or data.get("revenue_identifiers", {}).get("sub_division_number")
            elif field == "village":
                return data.get("location", {}).get("village")
            elif field == "district":
                return data.get("location", {}).get("district")
            elif field == "taluk":
                return data.get("location", {}).get("taluk")
            elif field == "total_area":
                return data.get("area_and_tenure", {}).get("total_area_hectares") or data.get("area_and_tenure", {}).get("total_area")
            elif field == "land_type":
                return data.get("area_and_tenure", {}).get("land_tenure") or data.get("area_and_tenure", {}).get("land_type")
            elif field == "mutation_number":
                # Get the latest mutation number from history
                mutations = data.get("mutation_history", [])
                return mutations[-1].get("mutation_number") if mutations else None
            elif field == "mutation_date":
                mutations = data.get("mutation_history", [])
                return mutations[-1].get("date") if mutations else None
            elif field == "registration_number":
                return data.get("revenue_identifiers", {}).get("stamp_serial_number") or data.get("revenue_identifiers", {}).get("registration_number")
            elif field == "document_date":
                return data.get("area_and_tenure", {}).get("deed_date") or data.get("area_and_tenure", {}).get("document_date")
            elif field == "ownership_shares":
                owners = data.get("owners", [])
                shares = [str(o.get("share_fraction") or o.get("share_percentage") or "") for o in owners]
                return ",".join(sorted([s for s in shares if s])) or None
            elif field == "encumbrance_information":
                encs = data.get("encumbrances_and_charges", [])
                return ",".join(sorted([e.get("type", "") for e in encs])) or None
            return None

        for field in self.COMPARED_FIELDS:
            s_val = get_field_value(sarvam_data, field)
            m_val = get_field_value(mistral_data, field)

            # Standardize None/empty values to null strings for comparison
            s_str = str(s_val).strip() if s_val is not None else ""
            m_str = str(m_val).strip() if m_val is not None else ""

            agreement = False
            # Fuzzy match text fields, exact match numeric/identifiers
            if s_str == "" and m_str == "":
                # Two missing values are not corroboration.  Keep this field
                # unassessed so an all-empty OCR result cannot score 100%.
                agreement = None
                confidence = None
            elif s_str == "" or m_str == "":
                agreement = False
                confidence = 0.5
            elif field in ["survey_number", "subdivision_number", "total_area", "mutation_number"]:
                # Exact matching for critical indicators
                agreement = (s_str.lower() == m_str.lower())
                confidence = 0.98 if agreement else 0.40
            else:
                ratio = fuzz.ratio(s_str.lower(), m_str.lower())
                agreement = ratio >= 85
                confidence = round(ratio / 100.0, 2)

            if agreement is True:
                agreements_count += 1
            elif agreement is False:
                disagreements_count += 1

            field_consensus[field] = {
                "field": field,
                "sarvam_value": s_val,
                "mistral_value": m_val,
                "agreement": agreement,
                "confidence": confidence,
                "evidence": [
                    f"Sarvam: {s_val}",
                    f"Mistral: {m_val}"
                ]
            }

        # Calculate consensus score
        comparable_fields = agreements_count + disagreements_count
        consensus_score = round(agreements_count / comparable_fields, 3) if comparable_fields else None

        # Flag fields that disagree (status = CONFLICT)
        conflicts = {}
        for f, details in field_consensus.items():
            if details["agreement"] is False:
                conflicts[f] = {
                    "status": "CONFLICT",
                    "values": {
                        "sarvam": details["sarvam_value"],
                        "mistral": details["mistral_value"]
                    },
                    "reason": f"Discrepancy in field '{f}' between Sarvam and Mistral.",
                    "requires_review": True
                }

        return {
            "overall_agreement_score": consensus_score,
            "agreed_count": agreements_count,
            "disagreed_count": disagreements_count,
            "field_consensus": field_consensus,
            "conflicts": conflicts
        }

# Singleton instance
consensus_engine = ConsensusEngine()
