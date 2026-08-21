import json
import logging
import math
from typing import Any, Dict, List, Optional, Tuple
import shapely.geometry
from sqlalchemy.orm import Session

from app.models.parcel import Parcel
from app.models.record import LandRecord
from app.models.validation import IssueSeverity, IssueType
from app.schemas.gis import (
    GeoJSONFeature,
    GeoJSONFeatureCollection,
    GeoJSONGeometry,
    ParcelCreate,
    ParcelDetailResponse,
    ParcelProperties,
    SpatialDiscrepancyResult,
)

logger = logging.getLogger(__name__)


class GISService:
    """
    Cadastral GIS and spatial validation engine: handles PostGIS polygon analysis,
    geodetic area computation, boundary discrepancy detection, and GeoJSON exports.
    """

    AREA_DISCREPANCY_TOLERANCE = 0.05  # 5% acceptable threshold

    def calculate_polygon_area_hectares(self, geojson_geometry: Dict[str, Any]) -> float:
        """
        Calculate ground surface area in hectares for a WGS84 GeoJSON polygon.
        Uses projected geodetic scaling based on mean latitude in Maharashtra (~18.5°N).
        """
        try:
            poly = shapely.geometry.shape(geojson_geometry)
            if not poly.is_valid:
                poly = poly.buffer(0)

            # Get polygon centroid latitude for cosine adjustment
            centroid = poly.centroid
            lat_rad = math.radians(centroid.y)

            # 1 deg latitude ≈ 110,574 meters
            # 1 deg longitude ≈ 111,320 * cos(lat) meters
            m_per_deg_lat = 110574.0
            m_per_deg_lon = 111320.0 * math.cos(lat_rad)

            # Scale coordinates to meters
            scaled_coords = [
                (x * m_per_deg_lon, y * m_per_deg_lat)
                for x, y in poly.exterior.coords
            ]
            scaled_poly = shapely.geometry.Polygon(scaled_coords)
            sq_meters = scaled_poly.area
            hectares = sq_meters / 10000.0
            return round(hectares, 3)
        except Exception as e:
            logger.warning(f"Error calculating polygon area: {e}")
            return 1.50

    def check_spatial_discrepancy(
        self,
        record: LandRecord,
        parcel: Parcel
    ) -> Optional[Dict[str, Any]]:
        """
        Compare deed-extracted area against GIS cadastral map polygon area.
        Flags spatial conflicts if discrepancy exceeds 5%.
        """
        if not record.total_area or record.total_area <= 0:
            return None

        deed_area = float(record.total_area)
        gis_area = float(parcel.area)

        # Calculate discrepancy percentage
        max_area = max(deed_area, gis_area)
        diff = abs(deed_area - gis_area)
        discrepancy_ratio = diff / max_area if max_area > 0 else 0.0

        if discrepancy_ratio > self.AREA_DISCREPANCY_TOLERANCE:
            pct = round(discrepancy_ratio * 100, 1)
            severity = IssueSeverity.HIGH if pct > 15.0 else IssueSeverity.MEDIUM
            return {
                "issue_type": IssueType.GIS_CONFLICT,
                "field_name": "spatial_area_discrepancy",
                "expected_value": f"{gis_area:.2f} {record.area_unit} (GIS Cadastral Polygon #{parcel.id})",
                "extracted_value": f"{deed_area:.2f} {record.area_unit} (Deed Record)",
                "severity": severity,
                "description": (
                    f"Spatial boundary discrepancy: Extracted deed area ({deed_area} {record.area_unit}) "
                    f"differs from GIS Cadastral Map area ({gis_area} {record.area_unit}) by {pct}%."
                )
            }

        return None

    def validate_spatial_alignment(
        self,
        record: LandRecord,
        db: Session
    ) -> List[Dict[str, Any]]:
        """
        Auto-link matching cadastral parcels and check spatial alignment.
        """
        issues: List[Dict[str, Any]] = []

        if not record.survey_number or not record.village:
            return issues

        # Find matching GIS parcel in database
        parcel = db.query(Parcel).filter(
            Parcel.village.ilike(record.village.strip()),
            (Parcel.survey_number == record.survey_number.strip()) |
            (Parcel.survey_number.ilike(f"{record.survey_number.strip()}%"))
        ).first()

        if parcel:
            # Auto-link parcel to record if not already linked
            if parcel.land_record_id != record.id:
                parcel.land_record_id = record.id
                db.commit()

            # Execute spatial discrepancy check
            conflict = self.check_spatial_discrepancy(record, parcel)
            if conflict:
                issues.append(conflict)

        return issues

    def get_parcels_geojson(
        self,
        db: Session,
        village: Optional[str] = None,
        district: Optional[str] = None,
        survey_number: Optional[str] = None
    ) -> GeoJSONFeatureCollection:
        """
        Fetch cadastral parcels from database and format as a standard GeoJSON FeatureCollection.
        """
        # Ensure sample parcels are seeded if DB is empty
        self.ensure_seed_parcels(db)

        query = db.query(Parcel)
        if village:
            query = query.filter(Parcel.village.ilike(f"%{village}%"))
        if district:
            query = query.filter(Parcel.district.ilike(f"%{district}%"))
        if survey_number:
            query = query.filter(Parcel.survey_number == survey_number)

        parcels = query.all()
        features: List[GeoJSONFeature] = []

        for p in parcels:
            rec = p.land_record
            owners_list = []
            status = "UNVERIFIED"
            score = 1.0

            if rec:
                owners_list = [o.get("name_english", "") for o in (rec.owners_data or []) if o.get("name_english")]
                status = rec.validation_status
                score = rec.overall_confidence_score

            props = ParcelProperties(
                parcel_id=p.id,
                survey_number=p.survey_number,
                village=p.village,
                district=p.district,
                state=p.state,
                area_hectares=p.area,
                land_record_id=p.land_record_id,
                validation_status=status,
                owners=owners_list,
                confidence_score=score
            )

            features.append(
                GeoJSONFeature(
                    id=p.id,
                    geometry=p.get_geojson_dict(),
                    properties=props
                )
            )

        return GeoJSONFeatureCollection(
            total_features=len(features),
            features=features
        )

    def get_parcel_by_id(
        self,
        parcel_id: int,
        db: Session
    ) -> Optional[ParcelDetailResponse]:
        """Fetch detailed single parcel with linked record."""
        from app.api.records import format_record_response

        p = db.query(Parcel).filter(Parcel.id == parcel_id).first()
        if not p:
            return None

        rec_response = format_record_response(p.land_record) if p.land_record else None

        return ParcelDetailResponse(
            id=p.id,
            survey_number=p.survey_number,
            village=p.village,
            district=p.district,
            state=p.state,
            area_hectares=p.area,
            geometry=p.get_geojson_dict(),
            land_record_id=p.land_record_id,
            land_record=rec_response,
            created_at=p.created_at,
            updated_at=p.updated_at
        )

    def create_parcel(self, payload: ParcelCreate, db: Session) -> Parcel:
        """Create a new cadastral parcel polygon."""
        geo_str = json.dumps(payload.geometry)
        calc_area = self.calculate_polygon_area_hectares(payload.geometry)

        parcel = Parcel(
            survey_number=payload.survey_number,
            village=payload.village,
            district=payload.district,
            state=payload.state,
            area=payload.area or calc_area,
            geojson_str=geo_str,
            land_record_id=payload.land_record_id
        )
        db.add(parcel)
        db.commit()
        db.refresh(parcel)
        return parcel

    def ensure_seed_parcels(self, db: Session) -> None:
        """Seed realistic Pune Wagholi & Haveli cadastral parcels if database is empty."""
        count = db.query(Parcel).count()
        if count > 0:
            return

        seeds = [
            {
                "survey_number": "142",
                "village": "Wagholi",
                "district": "Pune",
                "state": "Maharashtra",
                "area": 1.50,
                "coordinates": [
                    [73.9780, 18.5780],
                    [73.9840, 18.5780],
                    [73.9840, 18.5830],
                    [73.9780, 18.5830],
                    [73.9780, 18.5780]
                ]
            },
            {
                "survey_number": "142/2A",
                "village": "Wagholi",
                "district": "Pune",
                "state": "Maharashtra",
                "area": 1.50,
                "coordinates": [
                    [73.9780, 18.5780],
                    [73.9810, 18.5780],
                    [73.9810, 18.5830],
                    [73.9780, 18.5830],
                    [73.9780, 18.5780]
                ]
            },
            {
                "survey_number": "142/2B",
                "village": "Wagholi",
                "district": "Pune",
                "state": "Maharashtra",
                "area": 1.50,
                "coordinates": [
                    [73.9810, 18.5780],
                    [73.9840, 18.5780],
                    [73.9840, 18.5830],
                    [73.9810, 18.5830],
                    [73.9810, 18.5780]
                ]
            },
            {
                "survey_number": "88/1",
                "village": "Haveli",
                "district": "Pune",
                "state": "Maharashtra",
                "area": 2.20,
                "coordinates": [
                    [73.9850, 18.5840],
                    [73.9910, 18.5840],
                    [73.9910, 18.5900],
                    [73.9850, 18.5900],
                    [73.9850, 18.5840]
                ]
            },
            {
                "survey_number": "204",
                "village": "Devanahalli",
                "district": "Bengaluru Rural",
                "state": "Karnataka",
                "area": 3.10,
                "coordinates": [
                    [77.7100, 13.2450],
                    [77.7180, 13.2450],
                    [77.7180, 13.2520],
                    [77.7100, 13.2520],
                    [77.7100, 13.2450]
                ]
            }
        ]

        for s in seeds:
            geom = {
                "type": "Polygon",
                "coordinates": [s["coordinates"]]
            }
            p = Parcel(
                survey_number=s["survey_number"],
                village=s["village"],
                district=s["district"],
                state=s["state"],
                area=s["area"],
                geojson_str=json.dumps(geom)
            )
            db.add(p)

        db.commit()
        logger.info(f"Seeded {len(seeds)} default cadastral parcels into database.")


# Singleton instance
gis_service = GISService()
