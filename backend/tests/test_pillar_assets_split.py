# Regression: Home pillar assets (portrait) vs Pillars page assets (landscape) are separate; safe-delete blocks in-use assets
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")


@pytest.fixture(scope="module")
def assets():
    r = requests.get(f"{BASE_URL}/api/assets", timeout=30)
    assert r.status_code == 200
    return {a["key"]: a for a in r.json()}


@pytest.fixture(scope="module")
def token():
    r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": "admin@sunjayaasia.com", "password": "sunjaya-superadmin-2026"}, timeout=30)
    if r.status_code != 200:
        pytest.skip("login failed")
    d = r.json()
    return d.get("token") or d.get("access_token")


@pytest.mark.parametrize("key", ["foundation_slide", "core_slide", "future_slide"])
def test_home_pillar_portrait(assets, key):
    a = assets[key]
    assert a["section"] == "home_pillar_sections"
    assert a["width"] < a["height"]


@pytest.mark.parametrize("key", ["pillars_page_01", "pillars_page_02", "pillars_page_03"])
def test_pillars_page_assets_section(assets, key):
    assert assets[key]["section"] == "pillars_page"
    assert assets[key]["in_use"] is True


def test_pillars_page_landscape_and_distinct(assets):
    for k in ["pillars_page_01", "pillars_page_02"]:
        assert assets[k]["width"] / assets[k]["height"] == pytest.approx(16 / 9, rel=0.01)
    home_urls = {assets[k]["url"] for k in ["foundation_slide", "core_slide", "future_slide"]}
    for k in ["pillars_page_01", "pillars_page_02", "pillars_page_03"]:
        assert assets[k]["url"] not in home_urls


def test_delete_in_use_blocked(assets, token):
    r = requests.delete(f"{BASE_URL}/api/assets/{assets['pillars_page_01']['id']}", headers={"Authorization": f"Bearer {token}"}, timeout=30)
    assert r.status_code == 409
    assert "used on the website" in r.json()["detail"]


def test_delete_requires_auth(assets):
    r = requests.delete(f"{BASE_URL}/api/assets/{assets['pillars_page_01']['id']}", timeout=30)
    assert r.status_code == 401
