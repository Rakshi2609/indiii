import io
from app.models.document import DocumentStatus


def test_upload_single_pdf_document(client):
    # Create mock PDF file
    file_content = b"%PDF-1.4 mock pdf binary content for land record 7/12 extract"
    files = [
        ("files", ("satbara_extract_142.pdf", io.BytesIO(file_content), "application/pdf"))
    ]

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["uploaded_count"] == 1
    assert len(data["documents"]) == 1

    doc = data["documents"][0]
    assert doc["original_name"] == "satbara_extract_142.pdf"
    assert doc["mime_type"] == "application/pdf"
    assert doc["status"] == "PENDING"
    assert doc["file_size"] == len(file_content)
    assert "id" in doc


def test_upload_batch_documents(client):
    files = [
        ("files", ("survey_map_1.jpg", io.BytesIO(b"\xff\xd8\xff mock jpg 1"), "image/jpeg")),
        ("files", ("cadastral_sketch.png", io.BytesIO(b"\x89PNG mock png 2"), "image/png")),
        ("files", ("title_deed_1995.pdf", io.BytesIO(b"%PDF-1.5 deed pdf"), "application/pdf")),
    ]

    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 201
    data = response.json()
    assert data["uploaded_count"] == 3
    assert len(data["documents"]) == 3
    names = [d["original_name"] for d in data["documents"]]
    assert "survey_map_1.jpg" in names
    assert "cadastral_sketch.png" in names
    assert "title_deed_1995.pdf" in names


def test_upload_unsupported_file_type(client):
    files = [
        ("files", ("malicious_script.exe", io.BytesIO(b"executable content"), "application/x-msdownload"))
    ]
    response = client.post("/api/documents/upload", files=files)
    assert response.status_code == 400
    assert "Unsupported file format" in response.json()["detail"]


def test_list_documents(client):
    # Upload 2 test documents
    files = [
        ("files", ("ror_doc_1.pdf", io.BytesIO(b"%PDF-1.4 ror 1"), "application/pdf")),
        ("files", ("ror_doc_2.pdf", io.BytesIO(b"%PDF-1.4 ror 2"), "application/pdf")),
    ]
    client.post("/api/documents/upload", files=files)

    # List all documents
    response = client.get("/api/documents")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "items" in data
    assert data["total"] >= 2
    assert isinstance(data["items"], list)


def test_get_and_delete_document(client):
    # 1. Upload a document
    file_content = b"%PDF-1.4 to be deleted deed document"
    files = [
        ("files", ("temporary_deed.pdf", io.BytesIO(file_content), "application/pdf"))
    ]
    upload_res = client.post("/api/documents/upload", files=files)
    doc_id = upload_res.json()["documents"][0]["id"]

    # 2. Get document by ID
    get_res = client.get(f"/api/documents/{doc_id}")
    assert get_res.status_code == 200
    assert get_res.json()["id"] == doc_id
    assert get_res.json()["original_name"] == "temporary_deed.pdf"

    # 3. Delete document
    del_res = client.delete(f"/api/documents/{doc_id}")
    assert del_res.status_code == 200

    # 4. Verify 404 after deletion
    get_again = client.get(f"/api/documents/{doc_id}")
    assert get_again.status_code == 404


def test_upload_with_authenticated_user(client):
    # Register user and get JWT
    client.post("/api/auth/register", json={
        "email": "doc.officer@landai.gov.in",
        "password": "password123",
        "role": "LAND_OFFICER"
    })
    token = client.post("/api/auth/login", data={
        "username": "doc.officer@landai.gov.in",
        "password": "password123"
    }).json()["access_token"]

    # Upload with Auth header
    files = [
        ("files", ("officer_uploaded_deed.pdf", io.BytesIO(b"%PDF-1.4 officer deed"), "application/pdf"))
    ]
    headers = {"Authorization": f"Bearer {token}"}
    response = client.post("/api/documents/upload", files=files, headers=headers)
    assert response.status_code == 201
    doc = response.json()["documents"][0]
    assert doc["uploader_id"] is not None
