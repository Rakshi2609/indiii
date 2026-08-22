import json
import logging
from typing import Any, Dict, List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, get_optional_current_user
from app.db.database import get_db
from app.models.parcel import Parcel
from app.models.user import User, UserRole
from app.schemas.owner import (
    OwnerDocumentItem,
    OwnerHistoryEventItem,
    OwnerOverviewResponse,
    OwnerPropertyDetailResponse,
    OwnerPropertyListItem,
)
from app.services.owner_service import owner_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Owner Land Vault & Personal Land Intelligence"])


def resolve_owner_or_fallback_user(
    db: Session,
    current_user: Optional[User]
) -> User:
    """
    If authenticated, returns current user.
    For local development or demo convenience if token is missing, falls back to Nishu demo user.
    """
    if current_user:
        return current_user

    # Fallback to Nishu demo account
    from app.api.auth import ensure_demo_users_seeded
    ensure_demo_users_seeded(db)

    demo_user = db.query(User).filter(User.email == "nishu@demo.landai").first()
    if not demo_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required."
        )
    return demo_user


@router.get(
    "/overview",
    response_model=OwnerOverviewResponse,
    summary="Get owner land portfolio overview metrics"
)
def get_owner_overview(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> OwnerOverviewResponse:
    """
    Returns deterministic portfolio statistics for the authenticated land owner:
    Total properties, total acreage, state distribution, discrepancies, and verified status.
    """
    user = resolve_owner_or_fallback_user(db, current_user)
    return owner_service.get_owner_overview(db=db, user=user)


@router.get(
    "/properties",
    response_model=List[OwnerPropertyListItem],
    summary="List all properties in the owner's land vault"
)
def get_owner_properties(
    state: Optional[str] = Query(None, description="Filter by state (e.g. Karnataka, Maharashtra)"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (all, verified, attention)"),
    search: Optional[str] = Query(None, description="Search by survey number, village, or district"),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> List[OwnerPropertyListItem]:
    """Retrieve filtered and searched property cards for the authenticated owner."""
    user = resolve_owner_or_fallback_user(db, current_user)
    return owner_service.get_owner_properties_list(
        db=db,
        user=user,
        state_filter=state,
        status_filter=status_filter,
        search=search
    )


@router.get(
    "/properties/{id}",
    response_model=OwnerPropertyDetailResponse,
    summary="Get single property details with document, GIS & history"
)
def get_owner_property_detail(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> OwnerPropertyDetailResponse:
    """
    Fetch comprehensive verified record detail for a single property.
    Enforces RBAC: Land owners can only view properties they own.
    """
    user = resolve_owner_or_fallback_user(db, current_user)
    return owner_service.get_owner_property_detail(db=db, user=user, property_id=id)


@router.get(
    "/properties/{id}/history",
    response_model=List[OwnerHistoryEventItem],
    summary="Get chronological ownership and mutation timeline for a property"
)
def get_property_history(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> List[OwnerHistoryEventItem]:
    """
    Returns strict, database-grounded chronological mutation and title lineage.
    Zero hallucination guarantee.
    """
    user = resolve_owner_or_fallback_user(db, current_user)
    detail = owner_service.get_owner_property_detail(db=db, user=user, property_id=id)
    return detail.ownership_history


@router.get(
    "/properties/{id}/documents",
    response_model=List[OwnerDocumentItem],
    summary="Get associated deed documents for a property"
)
def get_property_documents(
    id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> List[OwnerDocumentItem]:
    """Returns uploaded original deed documents for this property."""
    user = resolve_owner_or_fallback_user(db, current_user)
    # verify ownership first
    owner_service.get_owner_property_detail(db=db, user=user, property_id=id)
    all_docs = owner_service.get_owner_documents(db=db, user=user)
    return [d for d in all_docs if d.linked_record_id == id]


@router.get(
    "/history",
    response_model=List[OwnerHistoryEventItem],
    summary="Get combined chronological ownership history across all owned properties"
)
def get_all_owner_history(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> List[OwnerHistoryEventItem]:
    """Returns chronological title lineage across the owner's entire portfolio."""
    user = resolve_owner_or_fallback_user(db, current_user)
    return owner_service.get_all_owner_history(db=db, user=user)


@router.get(
    "/documents",
    response_model=List[OwnerDocumentItem],
    summary="Get all original deed documents in the owner's vault"
)
def get_all_owner_documents(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> List[OwnerDocumentItem]:
    """Returns all verified deeds associated with the authenticated owner."""
    user = resolve_owner_or_fallback_user(db, current_user)
    return owner_service.get_owner_documents(db=db, user=user)


@router.get(
    "/gis",
    summary="Get GeoJSON FeatureCollection of owner's cadastral parcels"
)
def get_owner_gis_parcels(
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
) -> Dict[str, Any]:
    """Returns GeoJSON FeatureCollection of only the parcels owned by the authenticated owner."""
    user = resolve_owner_or_fallback_user(db, current_user)
    records = owner_service.get_owner_records(db, user)
    rec_ids = {r.id for r in records}

    parcels = db.query(Parcel).filter(Parcel.land_record_id.in_(rec_ids)).all() if rec_ids else []

    features = []
    for p in parcels:
        geom = json.loads(p.geojson_str) if p.geojson_str else None
        features.append({
            "type": "Feature",
            "id": p.id,
            "geometry": geom,
            "properties": {
                "id": p.id,
                "survey_number": p.survey_number,
                "village": p.village,
                "district": p.district,
                "state": p.state,
                "area_ha": p.area,
                "area_acres": round(p.area * 2.47105, 2) if p.area else None,
                "land_record_id": p.land_record_id
            }
        })

    return {
        "type": "FeatureCollection",
        "features": features
    }
