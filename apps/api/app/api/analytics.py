import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import get_db
from app.schemas.analytics import (
    AnalyticsOverviewResponse,
    ConflictAnalyticsResponse,
    DistrictAnalyticsResponse,
)
from app.services.analytics_service import analytics_service

logger = logging.getLogger(__name__)
router = APIRouter(tags=["Analytics & Intelligence Dashboard"])


@router.get(
    "/overview",
    response_model=AnalyticsOverviewResponse,
    summary="Get core executive KPIs and digitization metrics"
)
def get_analytics_overview_endpoint(
    db: Session = Depends(get_db)
) -> AnalyticsOverviewResponse:
    """Retrieve top-level platform statistics: processed documents, verification rates, and conflict counts."""
    return analytics_service.get_overview_metrics(db=db)


@router.get(
    "/districts",
    response_model=DistrictAnalyticsResponse,
    summary="Get district-wise cadastral digitization progress"
)
def get_district_analytics_endpoint(
    db: Session = Depends(get_db)
) -> DistrictAnalyticsResponse:
    """Retrieve district-level land record coverage, verified counts, and total hectares digitized."""
    return analytics_service.get_district_analytics(db=db)


@router.get(
    "/conflicts",
    response_model=ConflictAnalyticsResponse,
    summary="Get breakdown of validation conflicts by severity and type"
)
def get_conflict_analytics_endpoint(
    db: Session = Depends(get_db)
) -> ConflictAnalyticsResponse:
    """Retrieve aggregated breakdown of rule violations, duplicate collisions, and GIS mismatches."""
    return analytics_service.get_conflict_analytics(db=db)
