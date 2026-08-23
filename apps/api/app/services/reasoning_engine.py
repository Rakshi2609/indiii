import logging
import httpx
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session
from app.models.record import LandRecord
from app.models.validation import ValidationResult, IssueSeverity
from app.core.config import settings

logger = logging.getLogger(__name__)

class ReasoningEngine:
    """
    Reasoning Layer that processes validation results and evidence records
    to produce structured, non-hallucinated explanations and recommended actions.
    """

    MISTRAL_API_URL = "https://api.mistral.ai/v1/chat/completions"
    MISTRAL_MODEL = "mistral-small-latest"

    async def generate_reasoning(
        self,
        record: LandRecord,
        db: Session
    ) -> Dict[str, Any]:
        """
        Analyze land record conflicts and validation issues to construct an evidence-grounded report.
        """
        # Fetch validation results
        validation_results = db.query(ValidationResult).filter(ValidationResult.record_id == record.id).all()
        
        # Build facts context from validation results and record properties
        facts = []
        highest_severity = "LOW"
        has_critical = False
        has_high = False
        has_medium = False
        
        for vr in validation_results:
            facts.append({
                "field": vr.field_name,
                "issue_type": vr.issue_type,
                "severity": vr.severity,
                "description": vr.description,
                "extracted_value": vr.extracted_value,
                "expected_value": vr.expected_value
            })
            if vr.severity == IssueSeverity.CRITICAL:
                has_critical = True
            elif vr.severity == IssueSeverity.HIGH:
                has_high = True
            elif vr.severity == IssueSeverity.MEDIUM:
                has_medium = True

        if has_critical:
            highest_severity = "CRITICAL"
        elif has_high:
            highest_severity = "HIGH"
        elif has_medium:
            highest_severity = "MEDIUM"

        # Check if we can use Mistral LLM for rich formatting/reasoning
        mistral_available = bool(settings.MISTRAL_API_KEY and not settings.MISTRAL_API_KEY.startswith("your_"))
        
        if mistral_available:
            try:
                return await self._call_mistral_reasoning(record, facts, highest_severity)
            except Exception as e:
                logger.error(f"Reasoning LLM call failed: {e}. Falling back to deterministic rule-based reasoning.")
                return self._generate_deterministic_reasoning(record, facts, highest_severity)
        else:
            logger.info("MISTRAL_API_KEY not configured. Generating deterministic reasoning report.")
            return self._generate_deterministic_reasoning(record, facts, highest_severity)

    async def _call_mistral_reasoning(
        self,
        record: LandRecord,
        facts: List[Dict[str, Any]],
        highest_severity: str
    ) -> Dict[str, Any]:
        """Call Mistral Chat API to generate evidence-grounded reasoning."""
        headers = {
            "Authorization": f"Bearer {settings.MISTRAL_API_KEY}",
            "Content-Type": "application/json"
        }
        
        prompt = (
            f"You are a Senior Land Revenue Auditor. Analyze the following audit facts for survey number '{record.survey_number}' "
            f"in village '{record.village}', district '{record.district}', state '{record.state}'.\n"
            f"Audit Facts / Issues:\n"
            f"{facts}\n\n"
            f"Produce a structured reasoning report. Follow these rules:\n"
            f"1. Never invent any new facts or speculate outside the provided audit facts.\n"
            f"2. Never use the word 'Fraud' or 'Forgery' unless explicitly stated in the inputs. Use 'Potential discrepancy', 'Requires verification', or 'High-risk inconsistency' instead.\n"
            f"3. Return strictly valid JSON matching this schema:\n"
            f"{{\n"
            f'  "finding": "Short summary of findings",\n'
            f'  "severity": "CRITICAL, HIGH, MEDIUM, or LOW",\n'
            f'  "evidence": ["list of factual evidence statements"],\n'
            f'  "reason": "Detailed explanation of the discrepancy",\n'
            f'  "action": "Recommended verification actions for the officer"\n'
            f"}}"
        )

        payload = {
            "model": self.MISTRAL_MODEL,
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.0,
            "response_format": {"type": "json_object"}
        }

        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(self.MISTRAL_API_URL, headers=headers, json=payload)
            if response.status_code == 200:
                content = response.json()["choices"][0]["message"]["content"]
                import json
                return json.loads(content)
            else:
                response.raise_for_status()

        raise RuntimeError("Failed to retrieve reasoning from Mistral.")

    def _generate_deterministic_reasoning(
        self,
        record: LandRecord,
        facts: List[Dict[str, Any]],
        highest_severity: str
    ) -> Dict[str, Any]:
        """Fallback to deterministic rule-based formatting to prevent hallucinations and key dependency failure."""
        evidence_list = []
        reasons = []
        actions = []

        if not facts:
            return {
                "finding": "Land record is verified clear.",
                "severity": "LOW",
                "evidence": ["All deterministic validation rules passed successfully."],
                "reason": "No area mismatches, ownership gaps, chronological conflicts, duplicate registration hits, or GIS overlaps detected.",
                "action": "Proceed with regular administrative approval."
            }

        for f in facts:
            evidence_list.append(f"Field '{f['field']}' has extracted value '{f['extracted_value']}' (expected '{f['expected_value']}')")
            reasons.append(f.get("description", ""))
            
            # Formulate action
            field = f['field']
            if "area" in field or "balance" in field:
                actions.append("Re-verify land extent area calculations against the physical survey/tippani documents.")
            elif "owner" in field:
                actions.append("Request identity validation via official registry lookup or co-sharer partition deeds.")
            elif "gis" in field or "spatial" in field:
                actions.append("Conduct a joint physical survey to re-verify spatial geometry borders and GIS polygon overlay.")
            elif "date" in field or "chronology" in field:
                actions.append("Verify dates with the sub-registrar office registration books.")
            elif "duplicate" in field:
                actions.append("Investigate potential double-registration or duplicate files under the same survey/hissa index.")
            else:
                actions.append(f"Perform manual check of field '{field}'.")

        # Deduplicate actions
        actions = list(dict.fromkeys(actions))
        if not actions:
            actions = ["Conduct standard manual document verification."]

        return {
            "finding": f"Detected {len(facts)} land record inconsistencies.",
            "severity": highest_severity,
            "evidence": evidence_list,
            "reason": "; ".join(reasons),
            "action": "; ".join(actions)
        }

# Singleton instance
reasoning_engine = ReasoningEngine()
