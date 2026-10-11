"""
Review request tests:
- /api/locations returns 9 items, each with 'type' (hq=Singapore, infra=Panama/Switzerland, else branch)
- /api/geo/search requires Bearer token; returns list w/ lat/lng
- /api/content POST/PUT with value_id persists; GET returns value_id
"""
import os
import uuid
import pytest
import requests

BASE_URL = (os.environ.get("REACT_APP_BACKEND_URL") or "https://code-sync-145.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"
ADMIN_EMAIL = "admin@sunjayaasia.com"
ADMIN_PASSWORD = "sunjaya-superadmin-2026"
EDITOR_EMAIL = "editor@sunjayaasia.com"
EDITOR_PASSWORD = "editorpass123"
LEGACY_TOKEN = "sunjaya-admin-2026-secret"


@pytest.fixture(scope="module")
def jwt_token():
    # Try superadmin first, fallback to editor (both pass require_admin)
    r = requests.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}, timeout=20)
    if r.status_code == 200:
        return r.json().get("token")
    r = requests.post(f"{API}/auth/login", json={"email": EDITOR_EMAIL, "password": EDITOR_PASSWORD}, timeout=20)
    assert r.status_code == 200, f"both logins failed: {r.status_code} {r.text}"
    return r.json().get("token")


@pytest.fixture(scope="module")
def bearer_headers(jwt_token):
    return {"Authorization": f"Bearer {jwt_token}"}


@pytest.fixture(scope="module")
def legacy_headers():
    return {"X-Admin-Token": LEGACY_TOKEN}


# ---------- Locations ----------
def test_locations_has_9_with_types():
    r = requests.get(f"{API}/locations", timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    # Every item must have a 'type' field
    for it in items:
        assert "type" in it, f"missing type on {it.get('city')}"
        assert it["type"] in ("hq", "infra", "branch")

    cities = {it["city"]: it["type"] for it in items}
    # Expected count 9
    assert len(items) == 9, f"Expected 9 locations, got {len(items)}: {list(cities.keys())}"
    # Singapore = hq
    assert cities.get("Singapore") == "hq", f"Singapore type: {cities.get('Singapore')}"
    # Panama & Switzerland = infra
    # These may be stored as 'Panama City' / 'Zurich' etc. Check for a Panama & Swiss entry.
    panama = [c for c, t in cities.items() if "panama" in c.lower()]
    swiss = [c for c, t in cities.items() if c.lower() in ("switzerland", "zurich", "geneva", "zug", "bern")]
    assert panama, f"No Panama location found. cities={list(cities.keys())}"
    assert swiss, f"No Switzerland location found. cities={list(cities.keys())}"
    for c in panama + swiss:
        assert cities[c] == "infra", f"{c} should be infra, got {cities[c]}"
    # others = branch (non-hq/infra)
    others = [c for c, t in cities.items() if c != "Singapore" and c not in panama + swiss]
    for c in others:
        assert cities[c] == "branch", f"{c} should be branch, got {cities[c]}"


# ---------- geo/search ----------
def test_geo_search_requires_auth():
    r = requests.get(f"{API}/geo/search", params={"q": "Surabaya", "country": "ID"}, timeout=15)
    assert r.status_code == 401


def test_geo_search_with_bearer(bearer_headers):
    r = requests.get(f"{API}/geo/search", params={"q": "Surabaya", "country": "ID"},
                     headers=bearer_headers, timeout=25)
    assert r.status_code == 200, r.text
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1
    first = data[0]
    assert "lat" in first and "lng" in first
    assert isinstance(first["lat"], (int, float))
    assert isinstance(first["lng"], (int, float))
    # Surabaya roughly -7.26, 112.74
    assert -8 < first["lat"] < -6
    assert 112 < first["lng"] < 114


def test_geo_search_with_legacy_token(legacy_headers):
    # legacy X-Admin-Token also accepted by require_admin
    r = requests.get(f"{API}/geo/search", params={"q": "Osaka", "country": "JP"},
                     headers=legacy_headers, timeout=25)
    assert r.status_code == 200
    data = r.json()
    assert isinstance(data, list)
    assert len(data) >= 1


# ---------- content value_id ----------
def test_content_value_id_create_and_update(legacy_headers):
    unique = uuid.uuid4().hex[:8]
    key = f"test.review.{unique}"
    payload = {"key": key, "value": "English TEST", "value_id": "Indonesian TEST", "page": "other"}
    r = requests.post(f"{API}/content", json=payload, headers=legacy_headers, timeout=15)
    assert r.status_code == 200, r.text
    created = r.json()
    assert created["key"] == key
    assert created["value"] == "English TEST"
    assert created["value_id"] == "Indonesian TEST"
    cid = created["id"]

    try:
        # GET verifies persistence
        r = requests.get(f"{API}/content", timeout=15)
        assert r.status_code == 200
        found = next((x for x in r.json() if x["key"] == key), None)
        assert found is not None
        assert found["value_id"] == "Indonesian TEST"

        # PUT update value_id
        r = requests.put(f"{API}/content/{cid}",
                         json={"key": key, "value": "English TEST", "value_id": "Updated ID TEST"},
                         headers=legacy_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["value_id"] == "Updated ID TEST"

        # Verify persisted
        r = requests.get(f"{API}/content", timeout=15)
        found = next((x for x in r.json() if x["key"] == key), None)
        assert found and found["value_id"] == "Updated ID TEST"
    finally:
        requests.delete(f"{API}/content/{cid}", headers=legacy_headers, timeout=15)
