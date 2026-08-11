"""Tests for booking engine, availability, admin bookings, reviews CRUD and new property fields."""
import os
from datetime import date, timedelta

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"

SLUG = "joya-de-cartagena"
ADMIN_EMAIL = "cp21investements@gmail.com"
ADMIN_PASSWORD = "Jipocapoipo07!"


def d(offset_days):
    return (date.today() + timedelta(days=offset_days)).isoformat()


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.fail(f"Admin login failed {r.status_code}: {r.text[:300]}")
    tok = r.json().get("token")
    assert tok
    return tok


@pytest.fixture(scope="module")
def admin(client, token):
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json", "Authorization": f"Bearer {token}"})
    return s


# ---------- Availability ----------
class TestAvailability:
    def test_availability_shape(self, client):
        r = client.get(f"{API}/properties/{SLUG}/availability")
        assert r.status_code == 200
        data = r.json()
        assert "blocked" in data and isinstance(data["blocked"], list)
        for b in data["blocked"]:
            assert set(b.keys()) == {"start", "end"}

    def test_availability_unknown_slug_404(self, client):
        r = client.get(f"{API}/properties/nope-not-real/availability")
        assert r.status_code == 404

    def test_reviews_public_endpoint(self, client):
        r = client.get(f"{API}/properties/{SLUG}/reviews")
        assert r.status_code == 200
        assert isinstance(r.json(), list)


# ---------- Property new fields ----------
class TestPropertyFields:
    def test_persist_new_fields(self, admin, client):
        cur = client.get(f"{API}/properties/{SLUG}").json()
        payload = {**cur, "price_night": 650000, "cleaning_fee": 80000,
                   "currency": "COP", "ical_url": "https://example.com/TEST_calendar.ics"}
        r = admin.put(f"{API}/admin/properties/{SLUG}", json=payload)
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["price_night"] == 650000
        assert body["cleaning_fee"] == 80000
        assert body["currency"] == "COP"
        got = client.get(f"{API}/properties/{SLUG}").json()
        assert got["price_night"] == 650000
        assert got["cleaning_fee"] == 80000
        assert got["ical_url"] == "https://example.com/TEST_calendar.ics"
        assert got["id"] == cur["id"]
        # restore ical_url only (price stays per request)
        admin.put(f"{API}/admin/properties/{SLUG}", json={**got, "ical_url": None})
        after = client.get(f"{API}/properties/{SLUG}").json()
        assert after["ical_url"] in (None, "")
        assert after["price_night"] == 650000

    def test_property_update_requires_auth(self, client):
        cur = client.get(f"{API}/properties/{SLUG}").json()
        r = client.put(f"{API}/admin/properties/{SLUG}", json=cur)
        assert r.status_code == 401


# ---------- Bookings ----------
class TestBookings:
    created = []

    def _payload(self, ci, co, **kw):
        p = {"property_slug": SLUG, "name": "TEST_Booker", "email": "test_booker@example.com",
             "phone": "+57 300 0000000", "checkin": ci, "checkout": co, "guests": 2,
             "message": "TEST automated"}
        p.update(kw)
        return p

    def test_reject_past_dates(self, client):
        r = client.post(f"{API}/bookings", json=self._payload(d(-10), d(-5)))
        assert r.status_code == 400, r.text

    def test_reject_checkout_before_checkin(self, client):
        r = client.post(f"{API}/bookings", json=self._payload(d(40), d(40)))
        assert r.status_code == 400, r.text

    def test_unknown_property_404(self, client):
        r = client.post(f"{API}/bookings", json=self._payload(d(40), d(43), property_slug="nope-not-real"))
        assert r.status_code == 404

    def test_invalid_email_422(self, client):
        r = client.post(f"{API}/bookings", json=self._payload(d(40), d(43), email="not-an-email"))
        assert r.status_code == 422

    def test_create_conflict_and_admin_flow(self, client, admin):
        ci, co = d(120), d(123)
        r = client.post(f"{API}/bookings", json=self._payload(ci, co))
        assert r.status_code == 200, r.text
        body = r.json()
        assert body["status"] == "success"
        bid = body["id"]
        TestBookings.created.append(bid)
        assert body["nights"] == 3
        prop = client.get(f"{API}/properties/{SLUG}").json()
        expected = 3 * prop["price_night"] + prop["cleaning_fee"] if prop["price_night"] else 0
        assert body["total"] == expected

        # blocked in availability
        blocked = client.get(f"{API}/properties/{SLUG}/availability").json()["blocked"]
        assert {"start": ci, "end": co} in blocked

        # overlapping -> 409
        r2 = client.post(f"{API}/bookings", json=self._payload(d(121), d(125)))
        assert r2.status_code == 409, r2.text

        # admin listing
        lst = admin.get(f"{API}/admin/bookings")
        assert lst.status_code == 200
        rec = next((b for b in lst.json() if b["id"] == bid), None)
        assert rec is not None
        assert rec["status"] == "pending"
        assert rec["property_name"] == prop["name"]
        assert rec["nights"] == 3
        assert "_id" not in rec

        # approve
        assert admin.put(f"{API}/admin/bookings/{bid}", json={"status": "approved"}).status_code == 200
        rec = next(b for b in admin.get(f"{API}/admin/bookings").json() if b["id"] == bid)
        assert rec["status"] == "approved"
        assert {"start": ci, "end": co} in client.get(f"{API}/properties/{SLUG}/availability").json()["blocked"]

        # reject frees dates
        assert admin.put(f"{API}/admin/bookings/{bid}", json={"status": "rejected"}).status_code == 200
        assert {"start": ci, "end": co} not in client.get(f"{API}/properties/{SLUG}/availability").json()["blocked"]

        # same dates bookable again
        r3 = client.post(f"{API}/bookings", json=self._payload(ci, co))
        assert r3.status_code == 200, r3.text
        nid = r3.json()["id"]
        TestBookings.created.append(nid)
        admin.put(f"{API}/admin/bookings/{nid}", json={"status": "rejected"})

    def test_invalid_status_400(self, admin):
        if not TestBookings.created:
            pytest.skip("no booking created")
        r = admin.put(f"{API}/admin/bookings/{TestBookings.created[0]}", json={"status": "bogus"})
        assert r.status_code == 400

    def test_unknown_booking_404(self, admin):
        r = admin.put(f"{API}/admin/bookings/does-not-exist", json={"status": "approved"})
        assert r.status_code == 404

    def test_admin_bookings_requires_auth(self, client):
        assert client.get(f"{API}/admin/bookings").status_code == 401


# ---------- Reviews CRUD ----------
class TestReviews:
    def test_review_crud(self, admin, client):
        payload = {"property_slug": SLUG, "name": "TEST_Guest", "country": "USA",
                   "rating": 5, "month": "Marzo 2026", "text": "TEST review text"}
        r = admin.post(f"{API}/admin/reviews", json=payload)
        assert r.status_code == 200, r.text
        rev = r.json()
        assert "_id" not in rev
        rid = rev["id"]
        assert rev["name"] == "TEST_Guest"
        assert rev["rating"] == 5

        pub = client.get(f"{API}/properties/{SLUG}/reviews").json()
        assert any(x["id"] == rid for x in pub)

        upd = {**payload, "name": "TEST_Guest_Updated", "rating": 4}
        assert admin.put(f"{API}/admin/reviews/{rid}", json=upd).status_code == 200
        pub = client.get(f"{API}/properties/{SLUG}/reviews").json()
        got = next(x for x in pub if x["id"] == rid)
        assert got["name"] == "TEST_Guest_Updated"
        assert got["rating"] == 4

        assert admin.delete(f"{API}/admin/reviews/{rid}").status_code == 200
        pub = client.get(f"{API}/properties/{SLUG}/reviews").json()
        assert not any(x["id"] == rid for x in pub)

    def test_review_auth_required(self, client):
        assert client.post(f"{API}/admin/reviews", json={"property_slug": SLUG, "name": "x", "text": "y"}).status_code == 401
        assert client.get(f"{API}/admin/reviews").status_code == 401

    def test_delete_unknown_review_404(self, admin):
        assert admin.delete(f"{API}/admin/reviews/nope").status_code == 404

    def test_update_unknown_review_404(self, admin):
        r = admin.put(f"{API}/admin/reviews/nope", json={"property_slug": SLUG, "name": "a", "text": "b"})
        assert r.status_code == 404


# ---------- Auth playbook checks ----------
class TestAuthBasics:
    def test_login_wrong_password_401(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pass-123"})
        assert r.status_code == 401

    def test_me_endpoint(self, admin):
        r = admin.get(f"{API}/auth/me")
        assert r.status_code == 200
        assert r.json()["email"] == ADMIN_EMAIL.lower()

    def test_bad_token_401(self, client):
        r = client.get(f"{API}/auth/me", headers={"Authorization": "Bearer garbage"})
        assert r.status_code == 401
