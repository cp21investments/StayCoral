"""Tests for photo upload / image serving endpoints (POST /api/admin/upload, GET /api/images/{path})."""
import io
import os
import re
from pathlib import Path

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")

PNG_1PX = bytes.fromhex(
    "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4"
    "890000000a49444154789c63000100000500010d0a2db40000000049454e44ae426082"
)


@pytest.fixture(scope="module")
def creds():
    content = Path("/app/memory/test_credentials.md").read_text()
    email = re.search(r"(?im)^\s*[-*]?\s*Email\s*:\s*`?(\S+)", content).group(1)
    pwd = re.search(r"(?im)^\s*[-*]?\s*Password\s*:\s*`?(\S+)", content).group(1)
    return {"email": email, "password": pwd}


@pytest.fixture(scope="module")
def token(creds):
    r = requests.post(f"{BASE_URL}/api/auth/login", json=creds, timeout=30)
    if r.status_code != 200:
        pytest.fail(f"login failed {r.status_code} {r.text[:300]}")
    tok = r.json().get("token") or r.json().get("access_token")
    assert tok, f"no token in {r.json()}"
    return tok


class TestUpload:
    def test_upload_requires_auth(self):
        r = requests.post(f"{BASE_URL}/api/admin/upload",
                          files={"file": ("TEST_a.png", PNG_1PX, "image/png")}, timeout=60)
        assert r.status_code in (401, 403), r.text[:300]

    def test_upload_rejects_non_image(self, token):
        r = requests.post(f"{BASE_URL}/api/admin/upload",
                          headers={"Authorization": f"Bearer {token}"},
                          files={"file": ("TEST_notes.txt", b"hello", "text/plain")}, timeout=60)
        assert r.status_code == 400, r.text[:300]
        assert "image" in r.json().get("detail", "").lower()

    def test_upload_and_serve_image(self, token):
        r = requests.post(f"{BASE_URL}/api/admin/upload",
                          headers={"Authorization": f"Bearer {token}"},
                          files={"file": ("TEST_pixel.png", PNG_1PX, "image/png")}, timeout=120)
        assert r.status_code == 200, r.text[:300]
        url = r.json().get("url")
        assert isinstance(url, str) and url.startswith("/api/images/stay-coral/properties/"), url
        assert url.endswith(".png")

        g = requests.get(f"{BASE_URL}{url}", timeout=60)
        assert g.status_code == 200, g.text[:200]
        assert g.headers.get("Content-Type", "").startswith("image/"), g.headers
        assert len(g.content) == len(PNG_1PX)

    def test_serve_unknown_image_404(self):
        g = requests.get(f"{BASE_URL}/api/images/stay-coral/properties/does-not-exist-qa.png", timeout=60)
        assert g.status_code == 404, g.status_code

    def test_serve_path_traversal_blocked(self):
        g = requests.get(f"{BASE_URL}/api/images/other-app/secret.png", timeout=60)
        assert g.status_code == 404, g.status_code


class TestImagesPersistence:
    """Saving a property must persist the images array (PUT then GET)."""

    def test_property_images_roundtrip(self, token):
        slug = "joya-de-cartagena"
        h = {"Authorization": f"Bearer {token}"}
        orig = requests.get(f"{BASE_URL}/api/properties/{slug}", timeout=30)
        if orig.status_code == 404:
            pytest.skip(f"{slug} not seeded")
        assert orig.status_code == 200
        original = orig.json()
        original_images = list(original.get("images", []))

        up = requests.post(f"{BASE_URL}/api/admin/upload", headers=h,
                           files={"file": ("TEST_pixel2.png", PNG_1PX, "image/png")}, timeout=120)
        assert up.status_code == 200, up.text[:300]
        new_url = up.json()["url"]

        payload = {k: v for k, v in original.items() if k != "_id"}
        payload["images"] = original_images + [new_url]
        put = requests.put(f"{BASE_URL}/api/admin/properties/{slug}", headers=h, json=payload, timeout=60)
        assert put.status_code == 200, put.text[:300]

        got = requests.get(f"{BASE_URL}/api/properties/{slug}", timeout=30).json()
        assert got["images"] == original_images + [new_url]
        assert "_id" not in got

        # restore original images
        payload["images"] = original_images
        restore = requests.put(f"{BASE_URL}/api/admin/properties/{slug}", headers=h, json=payload, timeout=60)
        assert restore.status_code == 200
        final = requests.get(f"{BASE_URL}/api/properties/{slug}", timeout=30).json()
        assert final["images"] == original_images
