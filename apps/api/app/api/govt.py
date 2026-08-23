import logging
import secrets
import json
from pathlib import Path
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, Header, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.models.record import LandRecord

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Government Open API Integration"])

# Persistent store for keys
KEYS_FILE = Path("/home/appu/sih26/data/api_keys.json")
KEYS_FILE.parent.mkdir(parents=True, exist_ok=True)
DEFAULT_KEY = "govt_sih_open_api_key_2026"

def load_keys() -> List[str]:
    if not KEYS_FILE.exists():
        try:
            with open(KEYS_FILE, "w") as f:
                json.dump([DEFAULT_KEY], f)
            return [DEFAULT_KEY]
        except Exception:
            return [DEFAULT_KEY]
    try:
        with open(KEYS_FILE, "r") as f:
            return json.load(f)
    except Exception:
        return [DEFAULT_KEY]

def save_keys(keys: List[str]):
    try:
        with open(KEYS_FILE, "w") as f:
            json.dump(keys, f)
    except Exception as e:
        logger.error(f"Failed to save API keys: {e}")

def verify_api_key(
    api_key: Optional[str] = Query(None, description="API Key for Government Integration"),
    x_api_key: Optional[str] = Header(None, alias="X-API-Key")
):
    key = api_key or x_api_key
    if not key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="API Key is missing. Please provide api_key query parameter or X-API-Key header."
        )
    
    valid_keys = load_keys()
    if key not in valid_keys:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid API Key."
        )
    return key

@router.post("/keys/generate", response_class=JSONResponse)
def generate_new_api_key():
    """Generate a new secure API key and save it persistently."""
    new_key = f"govt_key_{secrets.token_hex(16)}"
    keys = load_keys()
    keys.append(new_key)
    save_keys(keys)
    return {
        "status": "success",
        "message": "New API Key generated successfully",
        "api_key": new_key
    }

@router.get("/keys", response_class=JSONResponse)
def list_api_keys():
    """Retrieve all active government API keys."""
    return {
        "status": "success",
        "keys": load_keys()
    }

@router.get("/verify", response_class=JSONResponse)
def get_govt_record(
    code: Optional[str] = Query(None, description="Verification code (corresponds to Document ID, Record ID, or Survey Number)"),
    api_key: str = Depends(verify_api_key),
    db: Session = Depends(get_db)
):
    """
    Open API route to verify and retrieve database values for land record(s).
    If code is not provided, returns all land records in the database.
    """
    # If no verification code is provided, return all records
    if not code:
        records = db.query(LandRecord).all()
        formatted_records = []
        for record in records:
            formatted_records.append({
                "id": record.id,
                "document_id": record.document_id,
                "administrative": {
                    "state": record.state,
                    "district": record.district,
                    "taluk": record.taluk,
                    "village": record.village,
                    "sub_registrar_office": record.sub_registrar_office
                },
                "land": {
                    "survey_number": record.survey_number,
                    "hissa_number": record.hissa_number,
                    "gat_number": record.gat_number,
                    "khata_number": record.khata_number,
                    "total_area": record.total_area,
                    "area_unit": record.area_unit,
                    "land_tenure": record.land_tenure,
                    "assessment_tax": record.assessment_tax
                },
                "owners": record.owners_data or [],
                "mutations": record.mutations_data or [],
                "encumbrances": record.encumbrances_data or [],
                "validation_status": record.validation_status,
                "overall_confidence_score": record.overall_confidence_score,
                "created_at": record.created_at.isoformat() if record.created_at else None
            })
        return {
            "status": "success",
            "count": len(formatted_records),
            "records": formatted_records
        }

    record = None
    
    # Check if code is numeric for ID/Document ID lookup
    if code.isdigit():
        val = int(code)
        record = db.query(LandRecord).filter(
            (LandRecord.id == val) | (LandRecord.document_id == val)
        ).first()
        
    if not record:
        # Fallback to Survey Number matching
        record = db.query(LandRecord).filter(
            LandRecord.survey_number == code
        ).first()

    if not record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No document/record found matching verification code '{code}'."
        )

    return {
        "status": "success",
        "verification_code": code,
        "record": {
            "id": record.id,
            "document_id": record.document_id,
            "administrative": {
                "state": record.state,
                "district": record.district,
                "taluk": record.taluk,
                "village": record.village,
                "sub_registrar_office": record.sub_registrar_office
            },
            "land": {
                "survey_number": record.survey_number,
                "hissa_number": record.hissa_number,
                "gat_number": record.gat_number,
                "khata_number": record.khata_number,
                "total_area": record.total_area,
                "area_unit": record.area_unit,
                "land_tenure": record.land_tenure,
                "assessment_tax": record.assessment_tax
            },
            "owners": record.owners_data or [],
            "mutations": record.mutations_data or [],
            "encumbrances": record.encumbrances_data or [],
            "validation_status": record.validation_status,
            "overall_confidence_score": record.overall_confidence_score,
            "created_at": record.created_at.isoformat() if record.created_at else None
        }
    }
