# Company (subsidiary/affiliate) CMS add/delete + locked-asset protection
import io, os, time
import pytest, requests
from PIL import Image

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
H = {"X-Admin-Token": "sunjaya-admin-2026-secret"}
REAL = {"sti", "sac", "sae", "agi", "ecs", "sm", "tsn", "san", "kgi"}


def _assets():
    r = requests.get(f"{BASE_URL}/api/assets", timeout=30)
    assert r.status_code == 200
    return r.json()


def _png():
    b = io.BytesIO(); Image.new("RGB", (64, 48), (120, 60, 20)).save(b, "PNG"); return b.getvalue()


def test_real_companies_present():
    keys = {a["key"] for a in _assets() if a["section"] == "home_subsidiaries"}
    assert REAL <= keys


def test_real_company_cards_not_in_use():
    for a in _assets():
        if a["key"] in REAL:
            assert a["in_use"] is False, a["key"]


@pytest.mark.parametrize("key", ["cover", "logo"])
def test_locked_site_asset_delete_409(key):
    a = next(x for x in _assets() if x["key"] == key)
    assert a["in_use"] is True
    r = requests.delete(f"{BASE_URL}/api/assets/{a['id']}", headers=H, timeout=30)
    assert r.status_code == 409
    assert any(x["id"] == a["id"] for x in _assets())


def test_add_company_then_delete():
    key = f"co_qa{int(time.time())}"
    r = requests.post(f"{BASE_URL}/api/assets", headers=H, timeout=60,
                      files={"file": ("t.png", _png(), "image/png")},
                      data={"key": key, "section": "home_subsidiaries", "alt": "TEST QA"})
    assert r.status_code in (200, 201), r.text
    aid = r.json()["id"]
    try:
        assert r.json()["section"] == "home_subsidiaries"
        got = next(x for x in _assets() if x["id"] == aid)
        assert got["key"] == key and got["in_use"] is False
    finally:
        d = requests.delete(f"{BASE_URL}/api/assets/{aid}", headers=H, timeout=30)
    assert d.status_code == 200 and d.json().get("ok") is True
    assert not any(x["id"] == aid for x in _assets())
