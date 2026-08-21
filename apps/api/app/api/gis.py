import logging
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.gis import (
    GeoJSONFeatureCollection,
    ParcelCreate,
    ParcelDetailResponse,
)
from app.services.gis_service import gis_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["GIS & Cadastral Mapping"])


@router.get(
    "",
    response_model=GeoJSONFeatureCollection,
    summary="Fetch parcel polygons as GeoJSON FeatureCollection"
)
def get_parcels_geojson_endpoint(
    village: Optional[str] = Query(None, description="Filter by revenue village"),
    district: Optional[str] = Query(None, description="Filter by district"),
    survey_number: Optional[str] = Query(None, description="Filter by survey number"),
    db: Session = Depends(get_db)
) -> GeoJSONFeatureCollection:
    """Retrieve cadastral parcel boundaries in standard RFC 7946 GeoJSON format."""
    return gis_service.get_parcels_geojson(
        db=db,
        village=village,
        district=district,
        survey_number=survey_number
    )


@router.get(
    "/{parcel_id}",
    response_model=ParcelDetailResponse,
    summary="Fetch specific parcel and its linked digital land record"
)
def get_parcel_detail_endpoint(
    parcel_id: int,
    db: Session = Depends(get_db)
) -> ParcelDetailResponse:
    """Fetch single parcel polygon coordinates, calculated area, and associated land record details."""
    parcel = gis_service.get_parcel_by_id(parcel_id=parcel_id, db=db)
    if not parcel:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cadastral parcel with ID {parcel_id} not found."
        )
    return parcel


@router.post(
    "",
    response_model=ParcelDetailResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create or seed a cadastral parcel polygon"
)
def create_parcel_endpoint(
    payload: ParcelCreate,
    db: Session = Depends(get_db)
) -> ParcelDetailResponse:
    """Register a new cadastral survey parcel with polygon coordinates."""
    created = gis_service.create_parcel(payload=payload, db=db)
    return gis_service.get_parcel_by_id(parcel_id=created.id, db=db)
