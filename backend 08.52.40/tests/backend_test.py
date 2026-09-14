"""
Backend API tests for Sunjaya Asia Group.
Covers: /api/health, /api/contact (public POST + admin GET), /api/admin/verify,
/api/news CRUD, language filter, published filter.
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://enterprise-portal-98.preview.emergentagent.com").rstrip("/")
ADMIN_TOKEN = "sunjaya-admin-2026-secret"
API = f"{BASE_URL}/api"


@pytest.fixture(scope="session")
def admin_headers():
    return {"X-Admin-Token": ADMIN_TOKEN}


# ---------- Health ----------
def test_health():
    r = requests.get(f"{API}/health", timeout=15)
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True
    assert "ts" in data


# ---------- Admin verify ----------
def test_admin_verify_wrong_token():
    r = requests.post(f"{API}/admin/verify", headers={"X-Admin-Token": "wrong-token"}, timeout=15)
    assert r.status_code == 401


def test_admin_verify_no_token():
    r = requests.post(f"{API}/admin/verify", timeout=15)
    assert r.status_code == 401


def test_admin_verify_correct_token(admin_headers):
    r = requests.post(f"{API}/admin/verify", headers=admin_headers, timeout=15)
    assert r.status_code == 200
    assert r.json() == {"ok": True}


# ---------- Contact ----------
@pytest.fixture(scope="session")
def created_contact():
    unique = uuid.uuid4().hex[:8]
    payload = {
        "name": f"TEST_User_{unique}",
        "email": f"TEST_{unique}@example.com",
        "company": "TEST Corp",
        "subject": f"TEST subject {unique}",
        "message": "This is a test message for backend testing.",
        "inquiry_type": "general",
    }
    r = requests.post(f"{API}/contact", json=payload, timeout=30)
    assert r.status_code == 200, f"POST /api/contact failed: {r.status_code} {r.text}"
    data = r.json()
    assert "id" in data
    assert "created_at" in data
    assert data["email"] == payload["email"]
    assert data["name"] == payload["name"]
    return data


def test_contact_post_valid(created_contact):
    assert created_contact["id"]
    assert created_contact["subject"].startswith("TEST subject")


def test_contact_post_missing_email():
    payload = {
        "name": "TEST_NoEmail",
        "subject": "Missing email test",
        "message": "This should fail validation.",
    }
    r = requests.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 422


def test_contact_post_invalid_email():
    payload = {
        "name": "TEST_BadEmail",
        "email": "not-an-email",
        "subject": "Invalid email test",
        "message": "This should fail.",
    }
    r = requests.post(f"{API}/contact", json=payload, timeout=15)
    assert r.status_code == 422


def test_contact_list_without_token():
    r = requests.get(f"{API}/contact", timeout=15)
    assert r.status_code == 401


def test_contact_list_wrong_token():
    r = requests.get(f"{API}/contact", headers={"X-Admin-Token": "wrong"}, timeout=15)
    assert r.status_code == 401


def test_contact_list_admin(admin_headers, created_contact):
    r = requests.get(f"{API}/contact", headers=admin_headers, timeout=15)
    assert r.status_code == 200
    items = r.json()
    assert isinstance(items, list)
    ids = [it["id"] for it in items]
    assert created_contact["id"] in ids


# ---------- News CRUD ----------
def _make_news_payload(lang="en", published=True, tag=""):
    unique = uuid.uuid4().hex[:8]
    return {
        "title": f"TEST News {tag} {unique}",
        "excerpt": f"Excerpt {unique}",
        "body": f"Body of TEST news {unique}. Lorem ipsum dolor sit amet.",
        "category": "Press Release",
        "language": lang,
        "published": published,
    }


def test_news_create_requires_admin():
    r = requests.post(f"{API}/news", json=_make_news_payload(), timeout=15)
    assert r.status_code == 401


def test_news_update_requires_admin(admin_headers):
    # Create first
    r = requests.post(f"{API}/news", json=_make_news_payload(tag="upd-auth"), headers=admin_headers, timeout=15)
    assert r.status_code == 200
    nid = r.json()["id"]
    # Attempt unauthorized update
    r2 = requests.put(f"{API}/news/{nid}", json=_make_news_payload(tag="upd-auth-2"), timeout=15)
    assert r2.status_code == 401
    # Cleanup
    requests.delete(f"{API}/news/{nid}", headers=admin_headers, timeout=15)


def test_news_delete_requires_admin(admin_headers):
    r = requests.post(f"{API}/news", json=_make_news_payload(tag="del-auth"), headers=admin_headers, timeout=15)
    assert r.status_code == 200
    nid = r.json()["id"]
    r2 = requests.delete(f"{API}/news/{nid}", timeout=15)
    assert r2.status_code == 401
    # Cleanup
    requests.delete(f"{API}/news/{nid}", headers=admin_headers, timeout=15)


def test_news_full_crud_flow(admin_headers):
    # Create
    payload = _make_news_payload(tag="crud")
    r = requests.post(f"{API}/news", json=payload, headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    art = r.json()
    nid, slug = art["id"], art["slug"]
    assert art["title"] == payload["title"]
    assert art["language"] == "en"
    assert art["published"] is True

    # GET list
    r = requests.get(f"{API}/news", timeout=15)
    assert r.status_code == 200
    assert nid in [x["id"] for x in r.json()]

    # GET by slug
    r = requests.get(f"{API}/news/{slug}", timeout=15)
    assert r.status_code == 200
    assert r.json()["id"] == nid

    # PUT update
    updated = {**payload, "title": payload["title"] + " (updated)"}
    r = requests.put(f"{API}/news/{nid}", json=updated, headers=admin_headers, timeout=15)
    assert r.status_code == 200
    assert r.json()["title"].endswith("(updated)")

    # Verify persisted
    r = requests.get(f"{API}/news/{slug}", timeout=15)
    assert r.status_code == 200
    assert r.json()["title"].endswith("(updated)")

    # DELETE
    r = requests.delete(f"{API}/news/{nid}", headers=admin_headers, timeout=15)
    assert r.status_code == 200

    # Verify gone
    r = requests.get(f"{API}/news", timeout=15)
    assert nid not in [x["id"] for x in r.json()]

    r = requests.get(f"{API}/news/{slug}", timeout=15)
    assert r.status_code == 404


def test_news_language_filter(admin_headers):
    en_payload = _make_news_payload(lang="en", tag="lang-en")
    id_payload = _make_news_payload(lang="id", tag="lang-id")

    r_en = requests.post(f"{API}/news", json=en_payload, headers=admin_headers, timeout=15)
    r_id = requests.post(f"{API}/news", json=id_payload, headers=admin_headers, timeout=15)
    assert r_en.status_code == 200 and r_id.status_code == 200
    en_id = r_en.json()["id"]
    id_id = r_id.json()["id"]

    try:
        r = requests.get(f"{API}/news?language=en", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert all(x["language"] == "en" for x in items)
        assert en_id in [x["id"] for x in items]
        assert id_id not in [x["id"] for x in items]

        r = requests.get(f"{API}/news?language=id", timeout=15)
        assert r.status_code == 200
        items = r.json()
        assert all(x["language"] == "id" for x in items)
        assert id_id in [x["id"] for x in items]
        assert en_id not in [x["id"] for x in items]
    finally:
        requests.delete(f"{API}/news/{en_id}", headers=admin_headers, timeout=15)
        requests.delete(f"{API}/news/{id_id}", headers=admin_headers, timeout=15)


# ---------- Locations CRUD (lat/lng schema) ----------
def _make_location_payload(tag=""):
    unique = uuid.uuid4().hex[:6]
    return {
        "city": f"TEST_City_{tag}_{unique}",
        "country": f"TEST_Country_{tag}",
        "role": f"TEST role {unique}",
        "lat": 1.2345,
        "lng": 103.567,
        "color": "#C86230",
        "order": 999,
        "published": True,
    }


def test_locations_create_requires_admin():
    r = requests.post(f"{API}/locations", json=_make_location_payload(tag="noauth"), timeout=15)
    assert r.status_code == 401


def test_locations_public_list_ok():
    r = requests.get(f"{API}/locations", timeout=15)
    # Should be 200 or 500 if stale x/y docs exist; we accept only 200
    assert r.status_code == 200, r.text
    assert isinstance(r.json(), list)


def test_locations_lat_out_of_range(admin_headers):
    payload = _make_location_payload(tag="badlat")
    payload["lat"] = 91.0
    r = requests.post(f"{API}/locations", json=payload, headers=admin_headers, timeout=15)
    assert r.status_code == 422


def test_locations_lng_out_of_range(admin_headers):
    payload = _make_location_payload(tag="badlng")
    payload["lng"] = -181.0
    r = requests.post(f"{API}/locations", json=payload, headers=admin_headers, timeout=15)
    assert r.status_code == 422


def test_locations_full_crud_flow(admin_headers):
    payload = _make_location_payload(tag="crud")
    # CREATE
    r = requests.post(f"{API}/locations", json=payload, headers=admin_headers, timeout=15)
    assert r.status_code == 200, r.text
    loc = r.json()
    lid = loc["id"]
    assert loc["city"] == payload["city"]
    assert loc["lat"] == payload["lat"]
    assert loc["lng"] == payload["lng"]

    try:
        # GET list (public) — verify present
        r = requests.get(f"{API}/locations", timeout=15)
        assert r.status_code == 200
        ids = [x["id"] for x in r.json()]
        assert lid in ids

        # UPDATE
        updated = {**payload, "role": payload["role"] + " (updated)", "lat": 2.3456}
        r = requests.put(f"{API}/locations/{lid}", json=updated, headers=admin_headers, timeout=15)
        assert r.status_code == 200
        assert r.json()["role"].endswith("(updated)")
        assert r.json()["lat"] == 2.3456

        # verify persistence via list
        r = requests.get(f"{API}/locations", timeout=15)
        loc2 = next((x for x in r.json() if x["id"] == lid), None)
        assert loc2 is not None
        assert loc2["role"].endswith("(updated)")
    finally:
        # DELETE
        r = requests.delete(f"{API}/locations/{lid}", headers=admin_headers, timeout=15)
        assert r.status_code == 200

        # verify gone
        r = requests.get(f"{API}/locations", timeout=15)
        assert lid not in [x["id"] for x in r.json()]


def test_locations_delete_requires_admin(admin_headers):
    # Create then attempt unauth delete
    r = requests.post(f"{API}/locations", json=_make_location_payload(tag="delauth"), headers=admin_headers, timeout=15)
    assert r.status_code == 200
    lid = r.json()["id"]
    r2 = requests.delete(f"{API}/locations/{lid}", timeout=15)
    assert r2.status_code == 401
    # cleanup
    requests.delete(f"{API}/locations/{lid}", headers=admin_headers, timeout=15)


def test_contact_list_sorted_desc(admin_headers):
    # Create two contacts and verify newer one comes first
    import time
    p1 = {"name": "TEST_Sort_A", "email": "TEST_a@example.com", "subject": "A", "message": "first"}
    r1 = requests.post(f"{API}/contact", json=p1, timeout=15)
    assert r1.status_code == 200
    id1 = r1.json()["id"]
    time.sleep(1.1)
    p2 = {"name": "TEST_Sort_B", "email": "TEST_b@example.com", "subject": "B", "message": "second"}
    r2 = requests.post(f"{API}/contact", json=p2, timeout=15)
    assert r2.status_code == 200
    id2 = r2.json()["id"]

    r = requests.get(f"{API}/contact", headers=admin_headers, timeout=15)
    assert r.status_code == 200
    ids = [x["id"] for x in r.json()]
    # id2 should appear before id1
    assert ids.index(id2) < ids.index(id1)


def test_news_published_filter(admin_headers):
    draft_payload = _make_news_payload(published=False, tag="draft")
    r = requests.post(f"{API}/news", json=draft_payload, headers=admin_headers, timeout=15)
    assert r.status_code == 200
    draft_id = r.json()["id"]

    try:
        # Default excludes draft
        r = requests.get(f"{API}/news", timeout=15)
        assert r.status_code == 200
        assert draft_id not in [x["id"] for x in r.json()]

        # published_only=false includes draft
        r = requests.get(f"{API}/news?published_only=false", timeout=15)
        assert r.status_code == 200
        assert draft_id in [x["id"] for x in r.json()]
    finally:
        requests.delete(f"{API}/news/{draft_id}", headers=admin_headers, timeout=15)
