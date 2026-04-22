"""Backend tests for Óptica Ari API"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://optica-ari.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@opticaari.com"
ADMIN_PASSWORD = "OpticaAri2026!"


@pytest.fixture(scope="session")
def token():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, r.text
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}"}


# ---------- Products ----------
def test_list_products_no_id():
    r = requests.get(f"{API}/products", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) >= 15
    for p in items:
        assert "_id" not in p
        assert "id" in p and "name" in p and "price" in p


def test_filter_by_style_clasico():
    r = requests.get(f"{API}/products", params={"style": "Clásico"}, timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert all(p["style"] == "Clásico" for p in items)


def test_filter_by_type_sol():
    r = requests.get(f"{API}/products", params={"type": "Sol"}, timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert all(p["type"] == "Sol" for p in items)


def test_filter_featured():
    r = requests.get(f"{API}/products", params={"featured": "true"}, timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert len(items) > 0
    assert all(p["featured"] is True for p in items)


def test_get_single_product():
    items = requests.get(f"{API}/products", timeout=15).json()
    pid = items[0]["id"]
    r = requests.get(f"{API}/products/{pid}", timeout=15)
    assert r.status_code == 200
    assert r.json()["id"] == pid


def test_get_product_not_found():
    r = requests.get(f"{API}/products/nonexistent-id", timeout=15)
    assert r.status_code == 404


# ---------- Quotes ----------
def test_create_quote_no_auth():
    items = requests.get(f"{API}/products", timeout=15).json()
    payload = {
        "name": "TEST_Cliente",
        "phone": "9995106899",
        "email": "test@example.com",
        "message": "Cotización",
        "items": [{"product_id": items[0]["id"], "quantity": 2}],
    }
    r = requests.post(f"{API}/quotes", json=payload, timeout=15)
    assert r.status_code == 200
    assert r.json().get("ok") is True


# ---------- Auth ----------
def test_login_success():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == ADMIN_EMAIL
    assert isinstance(data["token"], str) and len(data["token"]) > 10


def test_login_wrong_password():
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_me_with_token(auth_headers):
    r = requests.get(f"{API}/auth/me", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL


def test_me_without_token():
    r = requests.get(f"{API}/auth/me", timeout=15)
    assert r.status_code in (401, 403)


def test_admin_products_without_token():
    r = requests.post(f"{API}/admin/products", json={}, timeout=15)
    assert r.status_code in (401, 403)


def test_admin_quotes_requires_auth(auth_headers):
    r = requests.get(f"{API}/admin/quotes", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)

    r2 = requests.get(f"{API}/admin/quotes", timeout=15)
    assert r2.status_code in (401, 403)


def test_admin_transactions(auth_headers):
    r = requests.get(f"{API}/admin/transactions", headers=auth_headers, timeout=15)
    assert r.status_code == 200
    assert isinstance(r.json(), list)


# ---------- Admin CRUD ----------
def test_product_create_update_delete(auth_headers):
    payload = {
        "name": "TEST_Product",
        "brand": "TestBrand",
        "description": "desc",
        "price": 100.5,
        "image": "https://example.com/i.jpg",
        "style": "Moderno",
        "type": "Sol",
        "gender": "Unisex",
        "stock": 5,
        "featured": False,
    }
    r = requests.post(f"{API}/admin/products", json=payload, headers=auth_headers, timeout=15)
    assert r.status_code == 200
    prod = r.json()
    pid = prod["id"]
    assert prod["name"] == "TEST_Product"

    # GET verifies persistence
    r2 = requests.get(f"{API}/products/{pid}", timeout=15)
    assert r2.status_code == 200
    assert r2.json()["price"] == 100.5

    # UPDATE
    r3 = requests.put(f"{API}/admin/products/{pid}", json={"price": 200.0, "name": "TEST_Updated"}, headers=auth_headers, timeout=15)
    assert r3.status_code == 200
    assert r3.json()["price"] == 200.0

    r4 = requests.get(f"{API}/products/{pid}", timeout=15)
    assert r4.json()["name"] == "TEST_Updated"
    assert r4.json()["price"] == 200.0

    # DELETE
    r5 = requests.delete(f"{API}/admin/products/{pid}", headers=auth_headers, timeout=15)
    assert r5.status_code == 200

    r6 = requests.get(f"{API}/products/{pid}", timeout=15)
    assert r6.status_code == 404


# ---------- Checkout ----------
def test_checkout_session_success():
    items = requests.get(f"{API}/products", timeout=15).json()
    payload = {
        "items": [{"product_id": items[0]["id"], "quantity": 1}],
        "origin_url": BASE_URL,
        "customer_name": "TEST_Customer",
        "customer_email": "test@example.com",
    }
    r = requests.post(f"{API}/checkout/session", json=payload, timeout=30)
    assert r.status_code == 200, r.text
    data = r.json()
    assert "url" in data and data["url"].startswith("http")
    assert "session_id" in data
    return data["session_id"]


def test_checkout_empty_items():
    r = requests.post(f"{API}/checkout/session", json={"items": [], "origin_url": BASE_URL}, timeout=15)
    assert r.status_code == 400


def test_checkout_invalid_product():
    r = requests.post(
        f"{API}/checkout/session",
        json={"items": [{"product_id": "nonexistent", "quantity": 1}], "origin_url": BASE_URL},
        timeout=15,
    )
    assert r.status_code == 404


def test_checkout_status():
    items = requests.get(f"{API}/products", timeout=15).json()
    r = requests.post(
        f"{API}/checkout/session",
        json={"items": [{"product_id": items[0]["id"], "quantity": 1}], "origin_url": BASE_URL},
        timeout=30,
    )
    session_id = r.json()["session_id"]
    r2 = requests.get(f"{API}/checkout/status/{session_id}", timeout=20)
    assert r2.status_code == 200
    assert r2.json()["session_id"] == session_id
