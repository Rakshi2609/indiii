import logging
import re
from typing import Any, Dict, List, Optional, Tuple
from rapidfuzz import fuzz

from app.models.record import LandRecord
from app.models.validation import IssueSeverity, IssueType

logger = logging.getLogger(__name__)

# Primary salutations, prefixes, and titles in Indian records
SALUTATIONS_REGEX = re.compile(
    r"\b(shri|smt|shrimati|sau|late|mr|mrs|dr|kumari|pandit|sri|srimathi|adv|advocate)\b",
    re.IGNORECASE
)


class OwnershipService:
    """
    Analyzes ownership continuity, entity resolution, and mutation cross-referencing
    using normalized fuzzy matching algorithms (RapidFuzz).
    """

    def normalize_name(self, name: str) -> str:
        """
        Normalize entity name: removes salutations, punctuation, and extra whitespace,
        normalizing to lowercase tokens.
        """
        if not name:
            return ""

        # Remove honorifics and salutations
        cleaned = SALUTATIONS_REGEX.sub(" ", name.lower())
        # Remove non-alphanumeric characters except spaces
        cleaned = re.sub(r"[^\w\s]", " ", cleaned)
        # Collapse multiple whitespaces
        tokens = [t.strip() for t in cleaned.split() if t.strip()]
        return " ".join(tokens)

    def calculate_entity_match_score(self, name1: str, name2: str) -> float:
        """
        Calculate an Entity Match Score (0.0 to 1.0) using blended fuzzy matching metrics
        (token set ratio, token sort ratio, and partial ratio).
        """
        n1 = self.normalize_name(name1)
        n2 = self.normalize_name(name2)

        if not n1 or not n2:
            return 0.0

        if n1 == n2:
            return 1.0

        token_set = fuzz.token_set_ratio(n1, n2) / 100.0
        token_sort = fuzz.token_sort_ratio(n1, n2) / 100.0
        ratio = fuzz.ratio(n1, n2) / 100.0

        # Weighted blend giving high priority to token set (handles middle names/initials)
        blended = (token_set * 0.50) + (token_sort * 0.35) + (ratio * 0.15)
        return round(blended, 3)

    def find_best_match(
        self,
        target_name: str,
        candidate_names: List[str]
    ) -> Tuple[Optional[str], float]:
        """Find the closest candidate name and its match score."""
        best_name = None
        best_score = 0.0

        for candidate in candidate_names:
            score = self.calculate_entity_match_score(target_name, candidate)
            if score > best_score:
                best_score = score
                best_name = candidate

        return best_name, best_score

    def analyze_ownership_chain(self, record: LandRecord) -> List[Dict[str, Any]]:
        """
        Cross-reference current owners against mutation histories and title chain endorsements.
        Flags unmutated transfers, missing links, and entity spelling discrepancies.
        """
        issues: List[Dict[str, Any]] = []
        owners = record.owners_data or []
        mutations = record.mutations_data or []

        if not owners:
            return issues

        registered_mutation_ids = {
            m.get("mutation_number", "").strip()
            for m in mutations
            if m.get("mutation_number")
        }

        for idx, owner in enumerate(owners):
            owner_name = owner.get("name_english", "")
            mutation_ref = (owner.get("mutation_entry_number") or "").strip()

            # 1. If mutation records exist on the record, check validity
            if mutation_ref and registered_mutation_ids:
                if mutation_ref not in registered_mutation_ids:
                    issues.append({
                        "issue_type": IssueType.RULE,
                        "field_name": f"owner_{idx + 1}_mutation",
                        "expected_value": f"Certified Mutation '{mutation_ref}' in mutation ledger",
                        "extracted_value": f"Unlinked Mutation '{mutation_ref}' for {owner_name}",
                        "severity": IssueSeverity.HIGH,
                        "description": f"Owner '{owner_name}' cites mutation entry '{mutation_ref}', but no matching record exists in the historical mutation ledger."
                    })

            # 2. Check for suspicious incomplete names (e.g. single letter)
            norm_name = self.normalize_name(owner_name)
            if len(norm_name) < 3:
                issues.append({
                    "issue_type": IssueType.RULE,
                    "field_name": f"owner_{idx + 1}_name",
                    "expected_value": "Full name with surname / patronymic",
                    "extracted_value": owner_name,
                    "severity": IssueSeverity.MEDIUM,
                    "description": f"Incomplete or single-character owner name '{owner_name}' detected. Verify against primary Aadhaar/PAN record."
                })

        return issues


# Singleton instance
ownership_service = OwnershipService()
