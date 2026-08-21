from datetime import datetime
import json
from typing import Any, Dict, Optional
from geoalchemy2 import Geometry
from geoalchemy2.shape import to_shape, from_shape
import shapely.geometry
from sqlalchemy import (
    String, Integer, Float, DateTime, ForeignKey, func, Text
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy.types import TypeDecorator

from app.db.base import Base


class SpatialPolygon(TypeDecorator):
    """
    Adaptive spatial geometry type:
    - Uses GeoAlchemy2 PostGIS Polygon on PostgreSQL
    - Falls back to Text on SQLite test environments
    """
    impl = Text
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == "postgresql":
            return dialect.type_descriptor(
                Geometry(geometry_type="POLYGON", srid=4326, spatial_index=False)
            )
        return dialect.type_descriptor(Text())


class Parcel(Base):
    """
    Spatial Cadastral Parcel model representing GIS survey boundaries
    with PostGIS polygon geometries and linked LandRecord references.
    """
    __tablename__ = "parcels"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    survey_number: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    village: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    district: Mapped[str] = mapped_column(String(100), default="Pune", nullable=False)
    state: Mapped[str] = mapped_column(String(100), default="Maharashtra", nullable=False)
    area: Mapped[float] = mapped_column(Float, nullable=False, doc="Calculated or GIS recorded area in hectares")
    
    # Adaptive PostGIS / GeoJSON geometry column
    geometry: Mapped[Optional[Any]] = mapped_column(SpatialPolygon(), nullable=True)

    # Serialized GeoJSON polygon string for portable JSON exchange
    geojson_str: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    land_record_id: Mapped[Optional[int]] = mapped_column(
        Integer,
        ForeignKey("land_records.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False
    )

    # Relationship to LandRecord
    land_record = relationship("LandRecord", backref="parcels", lazy="joined")

    def get_geojson_dict(self) -> Dict[str, Any]:
        """Convert geometry to GeoJSON dictionary."""
        if self.geojson_str:
            try:
                return json.loads(self.geojson_str)
            except Exception:
                pass

        if self.geometry is not None:
            try:
                if isinstance(self.geometry, str):
                    return json.loads(self.geometry)
                shape = to_shape(self.geometry)
                return shapely.geometry.mapping(shape)
            except Exception:
                pass

        # Default fallback polygon around Wagholi, Pune
        return {
            "type": "Polygon",
            "coordinates": [[
                [73.9780, 18.5780],
                [73.9820, 18.5780],
                [73.9820, 18.5820],
                [73.9780, 18.5820],
                [73.9780, 18.5780]
            ]]
        }

    def __repr__(self) -> str:
        return f"<Parcel(id={self.id}, survey_number='{self.survey_number}', village='{self.village}', area={self.area}ha)>"
