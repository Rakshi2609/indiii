import logging
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from app.models.document import Document
from app.models.record import Evidence, LandRecord
from app.schemas.record import (
    AdministrativeInfo,
    EncumbranceInfo,
    EvidenceSchema,
    LandInfo,
    MutationInfo,
    OwnerInfo,
    StructuredLandRecord,
)

logger = logging.getLogger(__name__)


class ExtractionService:
    """
    Transforms raw AI/OCR outputs into strictly typed LandRecord domain models
    and generates field-level evidence records for explainability.
    """

    def map_raw_to_structured(self, raw_data: Dict[str, Any]) -> StructuredLandRecord:
        """Parse raw AI dictionary into validated domain schemas."""
        # 1. Administrative
        loc = raw_data.get("location", {})
        admin_info = AdministrativeInfo(
            state=loc.get("state") or "Maharashtra",
            district=loc.get("district") or "Unknown District",
            taluk=loc.get("taluk"),
            village=loc.get("village") or "Unknown Village",
            sub_registrar_office=loc.get("sub_registrar_office")
        )

        # 2. Land Information
        rev = raw_data.get("revenue_identifiers", {})
        area_tenure = raw_data.get("area_and_tenure", {})
        land_info = LandInfo(
            survey_number=rev.get("survey_number") or rev.get("khasra_number") or "0",
            hissa_number=rev.get("hissa_number"),
            gat_number=rev.get("gat_number"),
            khata_number=rev.get("khata_number"),
            total_area=area_tenure.get("total_area_hectares") or area_tenure.get("total_area"),
            cultivable_area=area_tenure.get("cultivable_area_hectares") or area_tenure.get("cultivable_area"),
            uncultivable_area=area_tenure.get("pot_kharaba_uncultivable_hectares") or area_tenure.get("uncultivable_area"),
            area_unit=area_tenure.get("area_unit") or "hectares",
            land_tenure=area_tenure.get("land_tenure"),
            assessment_tax=area_tenure.get("assessment_tax_inr") or area_tenure.get("assessment_tax"),
            irrigation_type=area_tenure.get("irrigation_type")
        )

        # 3. Owners
        owners_list: List[OwnerInfo] = []
        for o in raw_data.get("owners", []):
            owners_list.append(
                OwnerInfo(
                    name_english=o.get("name_english") or o.get("name") or "Unknown Owner",
                    name_indic=o.get("name_indic"),
                    gender=o.get("gender"),
                    share_fraction=o.get("share_fraction") or o.get("share"),
                    share_percentage=o.get("share_percentage"),
                    mutation_entry_number=o.get("mutation_entry_number") or o.get("mutation_number"),
                    aadhaar_hash_matched=o.get("aadhaar_hash_matched")
                )
            )

        # 4. Mutations
        mutations_list: List[MutationInfo] = []
        for m in raw_data.get("mutation_history", []):
            mutations_list.append(
                MutationInfo(
                    mutation_number=m.get("mutation_number") or "M-0",
                    date=m.get("date"),
                    type=m.get("type"),
                    status=m.get("status"),
                    details=m.get("details")
                )
            )

        # 5. Encumbrances / Charges
        encumbrances_list: List[EncumbranceInfo] = []
        for e in raw_data.get("encumbrances_and_charges", []):
            encumbrances_list.append(
                EncumbranceInfo(
                    type=e.get("type") or "Charge",
                    institution=e.get("institution"),
                    amount_inr=float(e.get("amount_inr") or 0.0) if e.get("amount_inr") is not None else None,
                    date_registered=e.get("date_registered") or e.get("date"),
                    mutation_number=e.get("mutation_number"),
                    status=e.get("status")
                )
            )

        # 6. Generate Explainability Evidence items
        prov_conf = raw_data.get("extraction_confidence")
        consensus_score = raw_data.get("_consensus", {}).get("overall_agreement_score")
        
        if prov_conf is not None:
            confidence = float(prov_conf)
        elif consensus_score is not None:
            confidence = float(consensus_score)
        else:
            confidence = None  # UNKNOWN

        transcript = raw_data.get("ocr_transcript_sample", "")
        evidence_list: List[EvidenceSchema] = [
            EvidenceSchema(
                field_name="survey_number",
                extracted_value=str(land_info.survey_number),
                confidence_score=confidence,
                source_text=f"भूमापन क्रमांक / Survey No: {land_info.survey_number}",
                bounding_box={"page": 1, "region": "header_identifiers"}
            ),
            EvidenceSchema(
                field_name="village",
                extracted_value=str(admin_info.village),
                confidence_score=confidence,
                source_text=f"गाव / Village: {admin_info.village}",
                bounding_box={"page": 1, "region": "admin_block"}
            ),
            EvidenceSchema(
                field_name="district",
                extracted_value=str(admin_info.district),
                confidence_score=confidence,
                source_text=f"जिल्हा / District: {admin_info.district}",
                bounding_box={"page": 1, "region": "admin_block"}
            ),
            EvidenceSchema(
                field_name="total_area",
                extracted_value=f"{land_info.total_area} {land_info.area_unit}",
                confidence_score=confidence,
                source_text=f"एकूण क्षेत्र: {land_info.total_area} {land_info.area_unit}",
                bounding_box={"page": 1, "region": "area_table"}
            ),
            EvidenceSchema(
                field_name="land_tenure",
                extracted_value=str(land_info.land_tenure or "Occupant"),
                confidence_score=confidence,
                source_text=f"भोगवटादार वर्ग / Tenure: {land_info.land_tenure}",
                bounding_box={"page": 1, "region": "tenure_column"}
            )
        ]

        # Add owner evidence
        for idx, owner in enumerate(owners_list):
            evidence_list.append(
                EvidenceSchema(
                    field_name=f"owner_{idx + 1}_name",
                    extracted_value=f"{owner.name_english} ({owner.name_indic or ''})",
                    confidence_score=confidence,
                    source_text=f"खातेदाराचे नाव: {owner.name_indic or owner.name_english}",
                    bounding_box={"page": 1, "region": f"owner_row_{idx + 1}"}
                )
            )

        return StructuredLandRecord(
            administrative=admin_info,
            land=land_info,
            owners=owners_list,
            mutations=mutations_list,
            encumbrances=encumbrances_list,
            evidence=evidence_list
        )

    def extract_and_persist_record(
        self,
        doc: Document,
        raw_data: Dict[str, Any],
        db: Session
    ) -> LandRecord:
        """
        Map raw AI payload and persist LandRecord + Evidence records in PostgreSQL.
        """
        structured = self.map_raw_to_structured(raw_data)

        # Check if record already exists for this document
        record = db.query(LandRecord).filter(LandRecord.document_id == doc.id).first()
        if not record:
            record = LandRecord(document_id=doc.id)
            db.add(record)

        # Populate Administrative fields
        record.state = structured.administrative.state
        record.district = structured.administrative.district
        record.taluk = structured.administrative.taluk
        record.village = structured.administrative.village
        record.sub_registrar_office = structured.administrative.sub_registrar_office

        # Populate Land fields
        record.survey_number = structured.land.survey_number
        record.hissa_number = structured.land.hissa_number
        record.gat_number = structured.land.gat_number
        record.khata_number = structured.land.khata_number
        record.total_area = structured.land.total_area
        record.cultivable_area = structured.land.cultivable_area
        record.uncultivable_area = structured.land.uncultivable_area
        record.area_unit = structured.land.area_unit
        record.land_tenure = structured.land.land_tenure
        record.assessment_tax = structured.land.assessment_tax

        # Populate Structured JSON collections
        record.owners_data = [o.model_dump() for o in structured.owners]
        record.mutations_data = [m.model_dump() for m in structured.mutations]
        record.encumbrances_data = [e.model_dump() for e in structured.encumbrances]
        record.raw_extracted_payload = raw_data

        db.flush()

        # Re-create Evidence rows
        db.query(Evidence).filter(Evidence.record_id == record.id).delete()
        for ev in structured.evidence:
            db.add(
                Evidence(
                    record_id=record.id,
                    field_name=ev.field_name,
                    extracted_value=ev.extracted_value,
                    confidence_score=ev.confidence_score,
                    source_text=ev.source_text,
                    bounding_box=ev.bounding_box
                )
            )

        db.commit()
        db.refresh(record)
        logger.info(
            f"LandRecord {record.id} and {len(structured.evidence)} Evidence items persisted for Document {doc.id}."
        )
        return record


# Singleton instance
extraction_service = ExtractionService()
