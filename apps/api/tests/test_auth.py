from app.core.security import verify_password, get_password_hash, create_access_token
from app.models.user import UserRole


def test_password_hashing():
    password = "secret_password_123"
    hashed = get_password_hash(password)
    assert hashed != password
    assert verify_password(password, hashed) is True
    assert verify_password("wrong_password", hashed) is False


def test_jwt_token_generation():
    token = create_access_token(
        subject="1",
        extra_claims={"email": "officer@land.gov.in", "role": UserRole.LAND_OFFICER.value}
    )
    assert isinstance(token, str)
    assert len(token) > 20


def test_register_and_login_flow(client):
    # 1. Register a Land Officer
    register_payload = {
        "email": "land.officer@landai.gov.in",
        "password": "strongpassword123",
        "full_name": "Rajesh Kumar",
        "role": "LAND_OFFICER"
    }
    reg_response = client.post("/api/auth/register", json=register_payload)
    assert reg_response.status_code == 201
    user_data = reg_response.json()
    assert user_data["email"] == "land.officer@landai.gov.in"
    assert user_data["role"] == "LAND_OFFICER"
    assert "id" in user_data

    # 2. Login via OAuth2 password form
    login_data = {
        "username": "land.officer@landai.gov.in",
        "password": "strongpassword123"
    }
    login_response = client.post("/api/auth/login", data=login_data)
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["user"]["role"] == "LAND_OFFICER"

    # 3. Retrieve profile using Bearer token
    headers = {"Authorization": f"Bearer {token_data['access_token']}"}
    me_response = client.get("/api/auth/me", headers=headers)
    assert me_response.status_code == 200
    me_data = me_response.json()
    assert me_data["email"] == "land.officer@landai.gov.in"
    assert me_data["full_name"] == "Rajesh Kumar"


def test_login_invalid_credentials(client):
    login_data = {
        "username": "nonexistent@landai.gov.in",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 401
    assert "Incorrect email or password" in response.json()["detail"]


def test_all_rbac_roles_supported(client):
    roles = [
        UserRole.ADMIN,
        UserRole.MANAGER,
        UserRole.LAND_OFFICER,
        UserRole.VERIFICATION_OFFICER,
        UserRole.GIS_OFFICER,
        UserRole.VIEWER
    ]

    for role in roles:
        email = f"{role.value.lower()}@landai.gov.in"
        res = client.post(
            "/api/auth/register",
            json={
                "email": email,
                "password": "password123",
                "full_name": f"Test {role.value}",
                "role": role.value
            }
        )
        assert res.status_code == 201
        assert res.json()["role"] == role.value

from fastapi import Depends
from app.api.deps import require_roles
from app.main import app

# Add a test protected route dynamically for RBAC verification
@app.get("/api/test-admin-only", tags=["Testing"])
def admin_only_endpoint(user = Depends(require_roles([UserRole.ADMIN, UserRole.LAND_OFFICER]))):
    return {"message": f"Welcome {user.email}", "role": user.role.value}


def test_rbac_access_control(client):
    # 1. Register a Viewer and Land Officer
    client.post("/api/auth/register", json={
        "email": "viewer@landai.gov.in",
        "password": "password123",
        "role": "VIEWER"
    })
    client.post("/api/auth/register", json={
        "email": "officer@landai.gov.in",
        "password": "password123",
        "role": "LAND_OFFICER"
    })

    # 2. Get tokens
    viewer_token = client.post("/api/auth/login", data={"username": "viewer@landai.gov.in", "password": "password123"}).json()["access_token"]
    officer_token = client.post("/api/auth/login", data={"username": "officer@landai.gov.in", "password": "password123"}).json()["access_token"]

    # 3. Viewer should be forbidden (403)
    viewer_res = client.get("/api/test-admin-only", headers={"Authorization": f"Bearer {viewer_token}"})
    assert viewer_res.status_code == 403
    assert "Operation not permitted" in viewer_res.json()["detail"]

    # 4. Land Officer should be allowed (200)
    officer_res = client.get("/api/test-admin-only", headers={"Authorization": f"Bearer {officer_token}"})
    assert officer_res.status_code == 200
    assert officer_res.json()["role"] == "LAND_OFFICER"
