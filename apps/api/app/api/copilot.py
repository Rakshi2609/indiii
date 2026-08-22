import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Request, status
from sqlalchemy.orm import Session

from app.api.deps import get_optional_current_user
from app.db.database import get_db
from app.models.user import User
from app.schemas.copilot import (
    CopilotQueryRequest,
    CopilotQueryResponse,
    CopilotSuggestionItem,
)
from app.services.audit_service import audit_service
from app.services.copilot_service import copilot_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Land AI Copilot & Chatbot"])


@router.post(
    "/query",
    response_model=CopilotQueryResponse,
    status_code=status.HTTP_200_OK,
    summary="Query the Land AI Copilot (Database-Grounded & Mistral Reasoned)"
)
async def query_copilot(
    request_body: CopilotQueryRequest,
    http_request: Request,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> CopilotQueryResponse:
    """
    Execute strict Database-First Land Record Search, Deterministic Aggregation,
    and Mistral Grounded Reasoning.
    Mistral NEVER answers from pretrained knowledge; all facts are anchored in the verified database.
    """
    if not request_body.query or not request_body.query.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty."
        )

    # Propagate user role for RBAC if authenticated
    if current_user and not request_body.user_role:
        request_body.user_role = current_user.role.value if hasattr(current_user.role, "value") else str(current_user.role)

    # Process query
    response = await copilot_service.process_query(db=db, request=request_body)

    # Audit Log the intelligence interaction
    try:
        audit_service.log_event(
            db=db,
            action="COPILOT_QUERY",
            resource_type="INTELLIGENCE",
            resource_id=0,
            user_id=current_user.id if current_user else None,
            new_value={
                "query": request_body.query,
                "data_found": response.data_found,
                "records_matched": response.execution_trace.get("db_records_matched", 0),
                "intent_type": response.intent.get("intent_type")
            },
            ip_address=http_request.client.host if http_request.client else None
        )
    except Exception as e:
        logger.warning(f"Failed to log copilot audit event: {e}")

    return response


@router.get(
    "/suggestions",
    response_model=List[CopilotSuggestionItem],
    summary="Get curated suggested queries for Land AI Copilot"
)
def get_copilot_suggestions() -> List[CopilotSuggestionItem]:
    """Returns curated enterprise query prompts to explore the database."""
    return [
        CopilotSuggestionItem(
            category="Ownership & Totals",
            query="How much land does Nishu own?",
            description="Multi-state aggregate total acres, property count & state breakdown",
            icon="Layers"
        ),
        CopilotSuggestionItem(
            category="Discrepancies & Alerts",
            query="Which of my properties need attention?",
            description="Identify area mismatches between deeds and Cadastral GIS satellite polygons",
            icon="AlertTriangle"
        ),
        CopilotSuggestionItem(
            category="Regional Exploration",
            query="Show my land in Karnataka",
            description="List and summarize all verified properties situated in Karnataka",
            icon="Compass"
        ),
        CopilotSuggestionItem(
            category="Comparative Analytics",
            query="Which property has the largest area?",
            description="Find the highest acreage parcel with survey and village location",
            icon="BarChart3"
        ),
        CopilotSuggestionItem(
            category="Historical Lineage",
            query="Give me the ownership history of Survey 142/2B",
            description="Trace mutation entries, succession records, and title chain transfers",
            icon="GitFork"
        ),
        CopilotSuggestionItem(
            category="Encumbrance Check",
            query="Are there any mortgage encumbrances on my land?",
            description="Inspect active bank liens, loans, and charge registers across records",
            icon="ShieldCheck"
        ),
        CopilotSuggestionItem(
            category="Verification Status",
            query="Which properties are still pending verification?",
            description="Find revenue records awaiting officer review and statutory approval",
            icon="FileCheck2"
        ),
        CopilotSuggestionItem(
            category="Multi-State Comparison",
            query="How many properties do I have across all states?",
            description="Count and summarize land holdings in Karnataka, Telangana, AP, Tamil Nadu, and Maharashtra",
            icon="MapPin"
        ),
    ]


@router.post(
    "/seed-demo",
    status_code=status.HTTP_200_OK,
    summary="Pre-seed multi-state demo land records for Copilot exploration"
)
def seed_demo_records(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Explicitly seed demo records if database is empty."""
    copilot_service.seed_demo_data_if_empty(db)
    return {"message": "Demo Land Records & Cadastral Parcels initialized successfully."}
