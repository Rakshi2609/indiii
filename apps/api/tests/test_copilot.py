import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.main import app
from app.db.database import get_db
from app.schemas.copilot import CopilotQueryRequest
from app.services.copilot_service import copilot_service


@pytest.fixture
def client():
    return TestClient(app)


def test_copilot_intent_parsing():
    """Test natural language intent and entity extraction."""
    intent1 = copilot_service.parse_query_intent("How much land does Nishu own?")
    assert "Nishu Kumar" in intent1["target_owners"]
    assert intent1["is_aggregation"] is True

    intent2 = copilot_service.parse_query_intent("Which of my properties have discrepancies?")
    assert intent2["filter_discrepancies"] is True
    assert intent2["intent_type"] == "DISCREPANCY_ANALYSIS"

    intent3 = copilot_service.parse_query_intent("Show my land in Karnataka")
    assert "Karnataka" in intent3["target_states"]

    intent4 = copilot_service.parse_query_intent("Give me the ownership history of Survey 142/2B")
    assert "142/2B" in intent4["target_surveys"]
    assert intent4["filter_timeline"] is True


def test_copilot_query_api_nishu(client):
    """Test query endpoint for multi-state land ownership aggregation."""
    payload = {"query": "How much land does Nishu own?"}
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["data_found"] is True
    assert "Nishu" in data["answer"] or "properties" in data["answer"].lower()
    assert data["aggregates"]["total_properties"] >= 1
    assert data["aggregates"]["total_area_acres"] > 0
    assert len(data["sources"]) >= 1
    assert len(data["properties"]) >= 1
    # Check clickable link structure
    assert data["sources"][0]["route"].startswith("/verification/")


def test_copilot_query_api_discrepancies(client):
    """Test query endpoint for area discrepancy detection."""
    payload = {"query": "Which of my properties need attention?"}
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["data_found"] is True
    assert data["requires_review"] is True
    assert len(data["warnings"]) >= 1
    # Discrepancy details must be present
    flagged = [p for p in data["properties"] if p["has_discrepancy"]]
    assert len(flagged) >= 1


def test_copilot_query_api_no_data_guard(client):
    """Test strict No-Hallucination guard when query matches no database records."""
    payload = {"query": "Show land owned by Tony Stark in Avengers Tower"}
    response = client.post("/api/copilot/query", json=payload)
    assert response.status_code == 200
    data = response.json()

    assert data["data_found"] is False
    assert "couldn't find enough verified information" in data["answer"].lower()
    assert len(data["sources"]) == 0
    assert len(data["properties"]) == 0


def test_copilot_suggestions_api(client):
    """Test suggestions list endpoint."""
    response = client.get("/api/copilot/suggestions")
    assert response.status_code == 200
    items = response.json()
    assert isinstance(items, list)
    assert len(items) >= 5
    assert any("Nishu" in item["query"] for item in items)


def test_copilot_empty_query_error(client):
    """Test error handling for blank query."""
    response = client.post("/api/copilot/query", json={"query": "   "})
    assert response.status_code == 400
