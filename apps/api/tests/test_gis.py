import json
import pytest
from app.models.parcel import Parcel
from app.models.record import LandRecord
from app.models.validation import IssueSeverity, IssueType
from app.services.gis_service import gis_service


def test_polygon_area_calculation():
    # Square polygon around Wagholi, Pune (~0.003 deg ≈ 330m x 330m ≈ 10.8 hectares)
    geom = {
        "type": "Polygon",
        "coordinates": [[
            [73.9780, 18.5780],
            [73.9810, 18.5780],
            [73.9810, 18.5810],
            [73.9780, 18.5810],
            [73.9780, 18.5780]
        ]]
    }
    area_ha = gis_service.calculate_polygon_area_hectares(geom)
    assert area_ha > 0.0
    assert 5.0 < area_ha < 20.0


def test_spatial_discrepancy_detection():
    # 1. Matching area (1.50 Ha deed vs 1.52 Ha GIS -> ~1.3% diff -> No conflict)
    rec_ok = LandRecord(
        document_id=1,
        village="Wagholi",
        survey_number="142/2A",
        total_area=1.50,
        area_unit="hectares"
    )
    parcel_ok = Parcel(
        id=1,
        survey_number="142/2A",
        village="Wagholi",
        area=1.52
    )
    conflict_ok = gis_service.check_spatial_discrepancy(rec_ok, parcel_ok)
    assert conflict_ok is None

    # 2. Conflicting area (1.50 Ha deed vs 2.10 Ha GIS -> 28.5% diff -> GIS_CONFLICT issue)
    parcel_bad = Parcel(
        id=2,
        survey_number="142/2A",
        village="Wagholi",
        area=2.10
    )
    conflict_bad = gis_service.check_spatial_discrepancy(rec_ok, parcel_bad)
    assert conflict_bad is not None
    assert conflict_bad["issue_type"] == IssueType.GIS_CONFLICT
    assert conflict_bad["severity"] == IssueSeverity.HIGH
    assert "Spatial boundary discrepancy" in conflict_bad["description"]


def test_get_parcels_geojson_api(client):
    # Fetch GeoJSON FeatureCollection
    res = client.get("/api/parcels")
    assert res.status_code == 200
    data = res.json()
    assert data["type"] == "FeatureCollection"
    assert data["total_features"] >= 1
    assert len(data["features"]) >= 1

    first_feat = data["features"][0]
    assert first_feat["type"] == "Feature"
    assert "geometry" in first_feat
    assert "properties" in first_feat
    assert "survey_number" in first_feat["properties"]
    assert "area_hectares" in first_feat["properties"]


def test_create_and_get_parcel_detail_api(client):
    # 1. Create a new parcel
    new_parcel_payload = {
        "survey_number": "999/1",
        "village": "Wagholi",
        "district": "Pune",
        "state": "Maharashtra",
        "area": 2.50,
        "geometry": {
            "type": "Polygon",
            "coordinates": [[
                [73.9700, 18.5700],
                [73.9750, 18.5700],
                [73.9750, 18.5750],
                [73.9700, 18.5750],
                [73.9700, 18.5700]
            ]]
        }
    }
    create_res = client.post("/api/parcels", json=new_parcel_payload)
    assert create_res.status_code == 201
    created_data = create_res.json()
    parcel_id = created_data["id"]
    assert created_data["survey_number"] == "999/1"

    # 2. Get parcel by ID
    get_res = client.get(f"/api/parcels/{parcel_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == parcel_id
    assert get_res.json()["village"] == "Wagholi"
