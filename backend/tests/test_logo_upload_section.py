# Partner logo upload: section preservation on replace + crop meta persistence
import io
import os
import time
import pytest
import requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


def _png(color=(200, 30, 30, 255), size=(260, 120)):
    b = io.BytesIO()
    Image.new("RGBA", size, color).save(b, "PNG")
    return b.getvalue()


@pytest.fixture(scope="module")
def client():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@sunjayaasia.com", "password": "sunjaya-superadmin-2026"})
    if r.status_code != 200:
        pytest.skip("login failed")
    s.headers["Authorization"] = f"Bearer {r.json()['token']}"
    return s


@pytest.fixture(scope="module")
def logo(client):
    key = f"TEST_logo_{int(time.time())}"
    r = client.post(f"{BASE_URL}/api/assets", files={"file": (f"{key}.png", _png(), "image/png")},
                    data={"key": key, "section": "home_partners", "sort_order": "150"})
    assert r.status_code == 200, r.text
    a = r.json()
    r2 = client.put(f"{BASE_URL}/api/assets/{a['id']}", json={"alt": "TEST API Logo", "meta": {"category": "vendor", "tone": "white"}})
    assert r2.status_code == 200, r2.text
    yield a
    client.delete(f"{BASE_URL}/api/assets/{a['id']}")


def _get(client, key):
    for a in client.get(f"{BASE_URL}/api/assets").json():
        if a["key"] == key:
            return a


def test_upload_in_partners(client, logo):
    a = _get(client, logo["key"])
    assert a["section"] == "home_partners"
    assert a["alt"] == "TEST API Logo"
    assert a["meta"]["category"] == "vendor"


def test_replace_without_section_keeps_section(client, logo):
    r = client.post(f"{BASE_URL}/api/assets", files={"file": (f"{logo['key']}_v2.png", _png((20, 200, 20, 255)), "image/png")},
                    data={"key": logo["key"]})
    assert r.status_code == 200, r.text
    assert r.json()["section"] == "home_partners"
    a = _get(client, logo["key"])
    assert a["section"] == "home_partners"
    assert a["alt"] == "TEST API Logo"
    assert a["sort_order"] == 150
    assert (a.get("meta") or {}).get("category") == "vendor"


def test_zoom_persist(client, logo):
    r = client.put(f"{BASE_URL}/api/assets/{logo['id']}", json={"alt": "TEST API Logo", "focal_x": 50, "focal_y": 50, "zoom": 1.8})
    assert r.status_code == 200, r.text
    a = _get(client, logo["key"])
    assert abs(a["zoom"] - 1.8) < 0.01
    assert a["section"] == "home_partners"
    assert (a.get("meta") or {}).get("category") == "vendor"


def test_upload_no_auth(client):
    r = requests.post(f"{BASE_URL}/api/assets", files={"file": ("x.png", _png(), "image/png")}, data={"key": "TEST_noauth"})
    assert r.status_code in (401, 403)
