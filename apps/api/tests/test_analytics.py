import io
import pytest
from app.services.analytics_service import analytics_service


def test_analytics_overview_endpoint(client):
    # 1. Process sample document
    file_bytes = b"%PDF-1.4 sample deed for analytics testing"
    files = [("files", ("analytics_sample.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id}/process?sync=true")

    # 2. Query Analytics Overview
    res = client.get("/api/analytics/overview")
    assert res.status_code == 200
    data = res.json()

    assert "total_documents" in data
    assert "total_records_extracted" in data
    assert "digitization_progress_pct" in data
    assert "average_confidence_score" in data
    assert data["total_documents"] >= 1
    assert data["total_records_extracted"] >= 1


def test_district_analytics_endpoint(client):
    res = client.get("/api/analytics/districts")
    assert res.status_code == 200
    data = res.json()

    assert "total_districts" in data
    assert "districts" in data
    assert len(data["districts"]) >= 1

    first = data["districts"][0]
    assert "district" in first
    assert "progress_percentage" in first
    assert "total_area_hectares" in first


def test_conflict_analytics_endpoint(client):
    res = client.get("/api/analytics/conflicts")
    assert res.status_code == 200
    data = res.json()

    assert "total_conflicts" in data
    assert "by_severity" in data
    assert "by_type" in data
    assert "breakdown" in data
