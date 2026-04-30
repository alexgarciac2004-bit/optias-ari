"""Backend tests for Appointments feature - Óptica Ari"""
import os
import pytest
import requests
from datetime import datetime, timedelta

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://optica-ari.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@opticaari.com"
ADMIN_PASSWORD = "OpticaAri2026!"


def _next_weekday(days_ahead=14):
    d = datetime.utcnow().date() + timedelta(days=days_ahead)
    while d.weekday() == 6:
        d += timedelta(days=1)
    return d.strftime("%Y-%m-%d")


def _next_sunday():
    d = datetime.utcnow().date() + timedelta(days=1)
    while d.weekday() != 6:
        d += timedelta(days=1)
    return d.strftime("%Y-%m-%d")


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def admin_token(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
    assert r.status_code == 200, f"login failed {r.status_code} {r.text}"
    return r.json()["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Services ----------
class TestServices:
    def test_list_services(self, s):
        r = s.get(f"{BASE_URL}/api/appointments/services", timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list) and len(data) == 4
        for item in data:
            assert "name" in item and "duration_min" in item
            assert isinstance(item["duration_min"], int)


# ---------- Availability ----------
class TestAvailability:
    def test_weekday_slots(self, s):
        date = _next_weekday()
        r = s.get(f"{BASE_URL}/api/appointments/availability", params={"date": date}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["closed"] is False
        # 9-14 = 10 slots (9:00..13:30), 15-19 = 8 slots (15:00..18:30); but 14:00 included? gen says h<end_h
        # Combined ~ 10 + 8 = 18 slots total ; allow margin since some may be taken
        assert len(data["slots"]) >= 15
        assert "09:00" in data["slots"] or "09:00" in data.get("taken", [])

    def test_sunday_closed(self, s):
        date = _next_sunday()
        r = s.get(f"{BASE_URL}/api/appointments/availability", params={"date": date}, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert data["closed"] is True
        assert data["slots"] == []

    def test_invalid_date(self, s):
        r = s.get(f"{BASE_URL}/api/appointments/availability", params={"date": "not-a-date"}, timeout=15)
        assert r.status_code == 400


# ---------- Create appointment ----------
class TestCreateAppointment:
    def test_create_success_and_taken(self, s):
        date = _next_weekday(days_ahead=21)
        # find a free slot
        avail = s.get(f"{BASE_URL}/api/appointments/availability", params={"date": date}, timeout=15).json()
        time_slot = avail["slots"][0]
        payload = {
            "customer_name": "TEST_Cliente",
            "customer_phone": "5551234567",
            "customer_email": "test@example.com",
            "service": "Examen visual completo",
            "date": date,
            "time": time_slot,
            "notes": "test booking",
        }
        r = s.post(f"{BASE_URL}/api/appointments", json=payload, timeout=15)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["ok"] is True
        appt = data["appointment"]
        assert appt["status"] == "pending"
        assert appt["date"] == date and appt["time"] == time_slot
        # Verify availability now lists it as taken
        avail2 = s.get(f"{BASE_URL}/api/appointments/availability", params={"date": date}, timeout=15).json()
        assert time_slot in avail2["taken"]
        assert time_slot not in avail2["slots"]
        pytest.created_id = data["id"]
        pytest.created_date = date
        pytest.created_time = time_slot

    def test_conflict_409(self, s):
        date = pytest.created_date
        time_slot = pytest.created_time
        payload = {
            "customer_name": "TEST_Other",
            "customer_phone": "5559999999",
            "service": "Examen visual completo",
            "date": date,
            "time": time_slot,
        }
        r = s.post(f"{BASE_URL}/api/appointments", json=payload, timeout=15)
        assert r.status_code == 409

    def test_sunday_400(self, s):
        date = _next_sunday()
        payload = {
            "customer_name": "TEST_Sun",
            "customer_phone": "555",
            "service": "Examen visual completo",
            "date": date,
            "time": "10:00",
        }
        r = s.post(f"{BASE_URL}/api/appointments", json=payload, timeout=15)
        assert r.status_code == 400

    def test_invalid_service_400(self, s):
        date = _next_weekday(days_ahead=22)
        payload = {
            "customer_name": "TEST_X",
            "customer_phone": "555",
            "service": "Servicio Inexistente",
            "date": date,
            "time": "10:00",
        }
        r = s.post(f"{BASE_URL}/api/appointments", json=payload, timeout=15)
        assert r.status_code == 400

    def test_invalid_time_400(self, s):
        date = _next_weekday(days_ahead=23)
        payload = {
            "customer_name": "TEST_T",
            "customer_phone": "555",
            "service": "Ajuste y mantenimiento",
            "date": date,
            "time": "08:00",
        }
        r = s.post(f"{BASE_URL}/api/appointments", json=payload, timeout=15)
        assert r.status_code == 400


# ---------- Admin endpoints ----------
class TestAdminAppointments:
    def test_list_no_auth(self, s):
        r = s.get(f"{BASE_URL}/api/admin/appointments", timeout=15)
        assert r.status_code in (401, 403)

    def test_list_with_auth(self, admin_headers):
        r = requests.get(f"{BASE_URL}/api/admin/appointments", headers=admin_headers, timeout=15)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        ids = [a["id"] for a in data]
        assert pytest.created_id in ids

    def test_update_status(self, admin_headers):
        r = requests.put(
            f"{BASE_URL}/api/admin/appointments/{pytest.created_id}",
            headers=admin_headers,
            json={"status": "confirmed"},
            timeout=15,
        )
        assert r.status_code == 200
        assert r.json()["status"] == "confirmed"

    def test_update_invalid_status(self, admin_headers):
        r = requests.put(
            f"{BASE_URL}/api/admin/appointments/{pytest.created_id}",
            headers=admin_headers,
            json={"status": "garbage"},
            timeout=15,
        )
        assert r.status_code == 400

    def test_delete(self, admin_headers):
        r = requests.delete(
            f"{BASE_URL}/api/admin/appointments/{pytest.created_id}",
            headers=admin_headers,
            timeout=15,
        )
        assert r.status_code == 200
        # second delete -> 404
        r2 = requests.delete(
            f"{BASE_URL}/api/admin/appointments/{pytest.created_id}",
            headers=admin_headers,
            timeout=15,
        )
        assert r2.status_code == 404


# ---------- Sanity: existing flows ----------
class TestSanity:
    def test_products(self, s):
        r = s.get(f"{BASE_URL}/api/products", timeout=15)
        assert r.status_code == 200 and len(r.json()) > 0

    def test_login(self, s):
        r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=15)
        assert r.status_code == 200 and "token" in r.json()
