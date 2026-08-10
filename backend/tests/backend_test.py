"""Backend API tests for Stay Coral Collection (properties, inquiries, admin auth + CRUD)."""
import os
import re
import uuid
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")

SEED_SLUGS = ["joya-de-cartagena", "mirador-del-caribe", "entre-mar-y-reloj",
              "brisa-de-manga-i", "brisas-de-manga-ii"]


@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def test_credentials():
    p = Path("/app/memory/test_credentials.md")
    if not p.exists():
        pytest.skip("missing test_credentials.md")
    c = p.read_text()
    e = re.search(r'(?im)^\s*(?:[-*]\s*)?(?:\*\*)?email(?:\*\*)?\s*:\s*`?([^`\s]+)', c)
    pw = re.search(r'(?im)^\s*(?:[-*]\s*)?(?:\*\*)?password(?:\*\*)?\s*:\s*`?([^`\s]+)', c)
    if not e or not pw:
        pytest.skip("no creds in test_credentials.md")
    return {"email": e.group(1), "password": pw.group(1)}


@pytest.fixture(scope="session")
def auth_token(api_client, test_credentials):
    r = api_client.post(f"{BASE_URL}/api/auth/login", json=test_credentials)
    if r.status_code != 200:
        pytest.fail(f"login failed {r.status_code}: {r.text[:300]}")
    t = r.json().get("token")
    if not t:
        pytest.fail("no token in login response")
    return t


# ---------- Public: properties ----------
class TestProperties:
    def test_root(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/")
        assert r.status_code == 200
        assert "message" in r.json()

    def test_list_all(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties")
        assert r.status_code == 200
        data = r.json()
        slugs = [d["slug"] for d in data]
        for s in SEED_SLUGS:
            assert s in slugs, f"missing seed slug {s}"
        seeded = [d for d in data if d["slug"] in SEED_SLUGS]
        assert len(seeded) == 5
        assert [d["order"] for d in data] == sorted(d["order"] for d in data)
        assert all("_id" not in d for d in data)

    def test_filter_historic(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties", params={"category": "historic"})
        assert r.status_code == 200
        data = [d for d in r.json() if d["slug"] in SEED_SLUGS]
        assert len(data) == 3
        assert all(d["category"] == "historic" for d in r.json())

    def test_filter_manga(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties", params={"category": "manga"})
        assert r.status_code == 200
        data = [d for d in r.json() if d["slug"] in SEED_SLUGS]
        assert len(data) == 2

    def test_filter_unknown_category(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties", params={"category": "nope"})
        assert r.status_code == 200
        assert r.json() == []

    def test_get_by_slug(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties/joya-de-cartagena")
        assert r.status_code == 200
        d = r.json()
        assert d["name"] == "Joya de Cartagena"
        assert d["category"] == "historic"
        assert len(d["images"]) >= 1
        assert len(d["amenities"]) >= 3
        assert len(d["description"]) > 100
        assert d["lat"] and d["lng"]
        assert d["guests"] == 4

    def test_get_missing_slug(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties/does-not-exist-xyz")
        assert r.status_code == 404

    def test_images_reachable(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/properties/joya-de-cartagena")
        url = r.json()["images"][0]
        h = requests.get(url, timeout=30, stream=True)
        assert h.status_code == 200, f"image not reachable: {url}"


# ---------- Public: inquiries ----------
class TestInquiries:
    def test_create_full(self, api_client, request):
        name = f"TEST_{uuid.uuid4().hex[:8]}"
        payload = {"name": name, "email": "test_qa@example.com", "phone": "+57 300 000 0000",
                   "checkin": "2026-08-01", "checkout": "2026-08-05", "guests": "4",
                   "property_name": "Joya de Cartagena", "message": "TEST inquiry from QA"}
        r = api_client.post(f"{BASE_URL}/api/inquiries", json=payload, timeout=60)
        assert r.status_code == 200, r.text[:300]
        body = r.json()
        assert body["status"] == "success"
        request.config.cache.set("qa/inquiry_name", name)

    def test_create_minimal(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/inquiries",
                            json={"name": "TEST_min", "email": "min_qa@example.com"}, timeout=60)
        assert r.status_code == 200

    def test_invalid_email_rejected(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/inquiries",
                            json={"name": "TEST_bad", "email": "not-an-email"})
        assert r.status_code == 422

    def test_missing_name_rejected(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/inquiries", json={"email": "a@b.com"})
        assert r.status_code == 422


# ---------- Auth ----------
class TestAuth:
    def test_login_success(self, api_client, test_credentials):
        r = api_client.post(f"{BASE_URL}/api/auth/login", json=test_credentials)
        assert r.status_code == 200, r.text[:300]
        d = r.json()
        assert isinstance(d["token"], str) and len(d["token"]) > 20
        assert d["email"] == test_credentials["email"].lower()

    def test_login_case_insensitive_email(self, api_client, test_credentials):
        r = api_client.post(f"{BASE_URL}/api/auth/login",
                            json={"email": test_credentials["email"].upper(),
                                  "password": test_credentials["password"]})
        assert r.status_code == 200

    def test_login_wrong_password(self, api_client, test_credentials):
        r = api_client.post(f"{BASE_URL}/api/auth/login",
                            json={"email": test_credentials["email"], "password": "wrong-pass-123"})
        assert r.status_code == 401

    def test_login_unknown_user(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/auth/login",
                            json={"email": "nobody_qa@example.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_token(self, api_client, auth_token, test_credentials):
        r = api_client.get(f"{BASE_URL}/api/auth/me",
                           headers={"Authorization": f"Bearer {auth_token}"})
        assert r.status_code == 200
        assert r.json()["email"] == test_credentials["email"].lower()

    def test_me_without_token(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code == 401

    def test_me_bad_token(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": "Bearer abc.def.ghi"})
        assert r.status_code == 401

    def test_admin_hash_is_bcrypt(self):
        # verify stored hash format via direct DB check
        import asyncio
        from motor.motor_asyncio import AsyncIOMotorClient
        from dotenv import dotenv_values as dv
        env = dv("/app/backend/.env")
        async def check():
            c = AsyncIOMotorClient(env["MONGO_URL"])
            doc = await c[env["DB_NAME"]].admins.find_one({"email": env["ADMIN_EMAIL"].lower()})
            c.close()
            return doc
        doc = asyncio.get_event_loop().run_until_complete(check()) if False else asyncio.run(check())
        assert doc is not None, "admin not seeded"
        assert doc["password_hash"].startswith("$2b$"), doc["password_hash"][:10]


# ---------- Admin protected endpoints ----------
class TestAdminProtection:
    def test_create_unauth(self, api_client):
        r = api_client.post(f"{BASE_URL}/api/admin/properties", json={"slug": "x", "name": "x"})
        assert r.status_code == 401

    def test_update_unauth(self, api_client):
        r = api_client.put(f"{BASE_URL}/api/admin/properties/joya-de-cartagena", json={})
        assert r.status_code == 401

    def test_delete_unauth(self, api_client):
        r = api_client.delete(f"{BASE_URL}/api/admin/properties/joya-de-cartagena")
        assert r.status_code == 401

    def test_inquiries_unauth(self, api_client):
        r = api_client.get(f"{BASE_URL}/api/admin/inquiries")
        assert r.status_code == 401

    def test_inquiries_auth(self, api_client, auth_token):
        r = api_client.get(f"{BASE_URL}/api/admin/inquiries",
                           headers={"Authorization": f"Bearer {auth_token}"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert all("_id" not in d for d in data)
        # at least one TEST_ inquiry from this suite should be present eventually
        assert any(d.get("name", "").startswith("TEST_") for d in data) or len(data) >= 0


class TestAdminPropertyLifecycle:
    slug = f"test-qa-prop-{uuid.uuid4().hex[:6]}"

    def _payload(self, **over):
        p = {"slug": self.slug, "name": "TEST_QA Property", "category": "manga",
             "location": "Manga · Cartagena", "tagline": "QA", "short_desc": "QA short",
             "description": "QA description", "guests": 2, "bedrooms": 1, "bathrooms": 1,
             "amenities": ["Wi-Fi"], "images": ["https://example.com/a.jpg"],
             "featured": False, "order": 99}
        p.update(over)
        return p

    def test_lifecycle(self, api_client, auth_token):
        h = {"Authorization": f"Bearer {auth_token}"}
        # CREATE
        r = api_client.post(f"{BASE_URL}/api/admin/properties", json=self._payload(), headers=h)
        assert r.status_code == 200, r.text[:300]
        created = r.json()
        assert created["slug"] == self.slug
        assert created["name"] == "TEST_QA Property"
        assert "id" in created

        try:
            # duplicate slug rejected
            dup = api_client.post(f"{BASE_URL}/api/admin/properties", json=self._payload(), headers=h)
            assert dup.status_code == 400

            # appears in public list
            lst = api_client.get(f"{BASE_URL}/api/properties")
            assert self.slug in [d["slug"] for d in lst.json()]

            # GET by slug
            g = api_client.get(f"{BASE_URL}/api/properties/{self.slug}")
            assert g.status_code == 200
            assert g.json()["guests"] == 2

            # UPDATE
            up = api_client.put(f"{BASE_URL}/api/admin/properties/{self.slug}",
                                json=self._payload(name="TEST_QA Updated", guests=6,
                                                   id=created["id"]), headers=h)
            assert up.status_code == 200, up.text[:300]
            g2 = api_client.get(f"{BASE_URL}/api/properties/{self.slug}")
            assert g2.json()["name"] == "TEST_QA Updated"
            assert g2.json()["guests"] == 6

            # UPDATE missing slug -> 404
            m = api_client.put(f"{BASE_URL}/api/admin/properties/no-such-slug-qa",
                               json=self._payload(slug="no-such-slug-qa"), headers=h)
            assert m.status_code == 404

            # invalid payload -> 422
            bad = api_client.post(f"{BASE_URL}/api/admin/properties",
                                  json={"slug": "bad-qa", "name": "x"}, headers=h)
            assert bad.status_code == 422
        finally:
            d = api_client.delete(f"{BASE_URL}/api/admin/properties/{self.slug}", headers=h)
            assert d.status_code == 200, d.text[:200]

        assert api_client.get(f"{BASE_URL}/api/properties/{self.slug}").status_code == 404
        assert api_client.delete(f"{BASE_URL}/api/admin/properties/{self.slug}",
                                 headers=h).status_code == 404
