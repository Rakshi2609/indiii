import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import get_db, SessionLocal
from app.models.user import User, UserRole
from app.models.record import LandRecord
from app.services.owner_service import owner_service


def test_seed_demo_accounts_api(client):
    """Verify demo accounts can be initialized."""
    response = client.post("/api/auth/seed-demo-users")
    assert response.status_code == 200
    data = response.json()
    assert "accounts" in data
    assert any(a["email"] == "nishu@demo.landai" and a["role"] == "OWNER" for a in data["accounts"])
    assert any(a["email"] == "officer@demo.landai" and a["role"] == "REVENUE_OFFICER" for a in data["accounts"])


def test_owner_json_login(client):
    """Test JSON payload login for Demo Owner."""
    payload = {
        "email": "nishu@demo.landai",
        "password": "LandAI@123"
    }
    response = client.post("/api/auth/login-json", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
    assert data["user"]["email"] == "nishu@demo.landai"
    assert data["user"]["role"] == "OWNER"


def test_revenue_officer_json_login(client):
    """Test JSON payload login for Demo Revenue Officer."""
    payload = {
        "email": "officer@demo.landai",
        "password": "LandAI@123"
    }
    response = client.post("/api/auth/login-json", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "officer@demo.landai"
    assert data["user"]["role"] == "REVENUE_OFFICER"


def test_owner_overview_api(client):
    """Test owner overview dashboard metrics."""
    # Login as owner
    login_res = client.post("/api/auth/login-json", json={"email": "nishu@demo.landai", "password": "LandAI@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/owner/overview", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["total_properties"] >= 1
    assert data["total_area_acres"] > 0
    assert data["total_regions_count"] >= 1
    assert isinstance(data["state_distribution"], dict)
    assert len(data["state_distribution"]) >= 1


def test_owner_properties_api(client):
    """Test owner property list retrieval with filtering and search."""
    login_res = client.post("/api/auth/login-json", json={"email": "nishu@demo.landai", "password": "LandAI@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 1. All properties
    res1 = client.get("/api/owner/properties", headers=headers)
    assert res1.status_code == 200
    props = res1.json()
    assert isinstance(props, list)
    assert len(props) >= 1

    # 2. Filter by state
    res2 = client.get("/api/owner/properties?state=Karnataka", headers=headers)
    assert res2.status_code == 200
    k_props = res2.json()
    assert all(p["state"] == "Karnataka" for p in k_props)

    # 3. Filter by search
    res3 = client.get("/api/owner/properties?search=Wagholi", headers=headers)
    assert res3.status_code == 200
    w_props = res3.json()
    assert all("wagholi" in p["village"].lower() or "wagholi" in p["survey_number"].lower() for p in w_props)


def test_owner_property_detail_api(client):
    """Test owner property detail retrieval."""
    login_res = client.post("/api/auth/login-json", json={"email": "nishu@demo.landai", "password": "LandAI@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    props_res = client.get("/api/owner/properties", headers=headers)
    first_prop_id = props_res.json()[0]["id"]

    response = client.get(f"/api/owner/properties/{first_prop_id}", headers=headers)
    assert response.status_code == 200
    data = response.json()

    assert data["id"] == first_prop_id
    assert "survey_number" in data
    assert "village" in data
    assert "state" in data
    assert "ownership_history" in data
    assert len(data["ownership_history"]) >= 1


def test_owner_history_api(client):
    """Test chronological owner history timeline endpoint."""
    login_res = client.post("/api/auth/login-json", json={"email": "nishu@demo.landai", "password": "LandAI@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = client.get("/api/owner/history", headers=headers)
    assert response.status_code == 200
    events = response.json()
    assert isinstance(events, list)
    assert len(events) >= 1
    # Check that events have valid titles and non-empty descriptions
    assert all(e["title"] and e["description"] for e in events)


def test_owner_documents_and_gis_api(client):
    """Test owner documents and GIS parcels endpoints."""
    login_res = client.post("/api/auth/login-json", json={"email": "nishu@demo.landai", "password": "LandAI@123"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    doc_res = client.get("/api/owner/documents", headers=headers)
    assert doc_res.status_code == 200
    docs = doc_res.json()
    assert isinstance(docs, list)

    gis_res = client.get("/api/owner/gis", headers=headers)
    assert gis_res.status_code == 200
    geojson = gis_res.json()
    assert geojson["type"] == "FeatureCollection"
    assert "features" in geojson
