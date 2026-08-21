import io
import pytest
from app.core.security import create_access_token, get_password_hash
from app.models.user import User, UserRole
from app.services.audit_service import audit_service


def test_audit_service_event_logging(db_session):
    # 1. Log test event
    log_entry = audit_service.log_event(
        db=db_session,
        action="CONFIG_UPDATE",
        resource_type="SYSTEM",
        resource_id="1",
        user_id=None,
        old_value={"timeout": 30},
        new_value={"timeout": 60},
        ip_address="127.0.0.1"
    )
    assert log_entry.id is not None
    assert log_entry.action == "CONFIG_UPDATE"

    # 2. Retrieve via get_audit_logs
    logs_res = audit_service.get_audit_logs(db=db_session, action="CONFIG_UPDATE")
    assert logs_res.total >= 1
    assert logs_res.items[0].resource_type == "SYSTEM"


def test_get_audit_endpoint(client, db_session):
    # Process deed to generate audit events
    file_bytes = b"%PDF-1.4 sample deed for audit logging"
    files = [("files", ("audit_sample.pdf", io.BytesIO(file_bytes), "application/pdf"))]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]
    client.post(f"/api/documents/{doc_id}/process?sync=true")

    # Fetch audit logs
    audit_res = client.get("/api/audit")
    assert audit_res.status_code == 200
    data = audit_res.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] >= 1
    actions = [item["action"] for item in data["items"]]
    assert "DOCUMENT_UPLOAD" in actions


def test_rbac_role_restriction(client, db_session):
    # 1. Create a Viewer user
    viewer = User(
        email="viewer@revenue.gov.in",
        hashed_password=get_password_hash("ViewerSecret123"),
        full_name="Junior Viewer",
        role=UserRole.VIEWER,
        is_active=True
    )
    db_session.add(viewer)
    db_session.commit()
    db_session.refresh(viewer)

    # 2. Generate token for Viewer
    viewer_token = create_access_token(subject=viewer.id, extra_claims={"role": UserRole.VIEWER.value})
    headers = {"Authorization": f"Bearer {viewer_token}"}

    # 3. Viewer attempts to access Admin-only /api/audit
    res = client.get("/api/audit", headers=headers)
    assert res.status_code == 403
    assert "Operation not permitted" in res.json()["detail"]

    # 4. Create an Admin user
    admin = User(
        email="admin@revenue.gov.in",
        hashed_password=get_password_hash("AdminSecret123"),
        full_name="Super Admin",
        role=UserRole.ADMIN,
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)

    admin_token = create_access_token(subject=admin.id, extra_claims={"role": UserRole.ADMIN.value})
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 5. Admin accesses /api/audit successfully
    admin_res = client.get("/api/audit", headers=admin_headers)
    assert admin_res.status_code == 200
