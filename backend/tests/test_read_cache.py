# Read-cache (sb_select) performance + invalidation tests for /api/content and /api/assets
import os
import time
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
HDR = {"X-Admin-Token": "sunjaya-admin-2026-secret", "Content-Type": "application/json"}


def _timed(url):
    t = time.time()
    r = requests.get(url, timeout=30)
    return r, time.time() - t


class TestCachePerf:
    @pytest.mark.parametrize("path", ["/api/content", "/api/assets"])
    def test_repeat_calls_fast(self, path):
        _timed(BASE_URL + path)  # warm
        times = []
        for _ in range(5):
            r, dt = _timed(BASE_URL + path)
            assert r.status_code == 200
            assert isinstance(r.json(), list) and len(r.json()) > 0
            times.append(dt)
        print(path, [round(x, 3) for x in times])
        assert sorted(times)[2] < 0.8  # median under 800ms through proxy


class TestContentInvalidation:
    def test_update_reflects_immediately_then_restore(self):
        rows = requests.get(f"{BASE_URL}/api/content").json()
        blk = next(b for b in rows if b["key"] == "about.title")
        orig = blk["value"]
        try:
            r = requests.put(f"{BASE_URL}/api/content/{blk['id']}", headers=HDR, json={"value": orig + " X"})
            assert r.status_code == 200 and r.json()["value"] == orig + " X"
            rows2 = requests.get(f"{BASE_URL}/api/content").json()
            assert next(b for b in rows2 if b["key"] == "about.title")["value"] == orig + " X"
        finally:
            requests.put(f"{BASE_URL}/api/content/{blk['id']}", headers=HDR, json={"value": orig})
        rows3 = requests.get(f"{BASE_URL}/api/content").json()
        assert next(b for b in rows3 if b["key"] == "about.title")["value"] == orig

    def test_create_delete_invalidates(self):
        r = requests.post(f"{BASE_URL}/api/content", headers=HDR,
                          json={"key": "TEST_cache.key", "value": "TEST_val", "page": "other"})
        assert r.status_code == 200
        cid = r.json()["id"]
        try:
            rows = requests.get(f"{BASE_URL}/api/content").json()
            assert any(b["key"] == "TEST_cache.key" for b in rows)
        finally:
            d = requests.delete(f"{BASE_URL}/api/content/{cid}", headers=HDR)
            assert d.status_code == 200
        rows = requests.get(f"{BASE_URL}/api/content").json()
        assert not any(b["key"] == "TEST_cache.key" for b in rows)


class TestAssetInvalidation:
    def test_asset_alt_update_reflects(self):
        assets = requests.get(f"{BASE_URL}/api/assets").json()
        a = assets[0]
        orig = a.get("alt")
        try:
            r = requests.put(f"{BASE_URL}/api/assets/{a['id']}", headers=HDR, json={"alt": (orig or "") + " TESTX"})
            assert r.status_code == 200, r.text
            got = next(x for x in requests.get(f"{BASE_URL}/api/assets").json() if x["id"] == a["id"])
            assert got["alt"] == (orig or "") + " TESTX"
        finally:
            requests.put(f"{BASE_URL}/api/assets/{a['id']}", headers=HDR, json={"alt": orig or ""})
        got = next(x for x in requests.get(f"{BASE_URL}/api/assets").json() if x["id"] == a["id"])
        assert (got["alt"] or "") == (orig or "")
