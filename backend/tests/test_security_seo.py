# Security headers, CORS, login brute-force lockout, robots/sitemap (iteration 27)
import os
import uuid
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
PREVIEW_ORIGIN = BASE_URL


# --- Security headers
class TestSecurityHeaders:
    def test_headers_on_public_api(self):
        r = requests.get(f"{BASE_URL}/api/")
        h = r.headers
        assert h.get("x-content-type-options") == "nosniff"
        assert h.get("x-frame-options") == "DENY"
        assert h.get("referrer-policy") == "strict-origin-when-cross-origin"
        assert "max-age=31536000" in h.get("strict-transport-security", "")

    def test_auth_no_store(self):
        r = requests.get(f"{BASE_URL}/api/auth/me")
        assert r.status_code in (401, 403)
        assert "no-store" in r.headers.get("cache-control", "")
        assert r.headers.get("x-frame-options") == "DENY"

    def test_login_401_no_store(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": f"qa-hdr-{uuid.uuid4().hex[:6]}@example.com", "password": "x"})
        assert r.status_code == 401
        assert "no-store" in r.headers.get("cache-control", "")


# --- CORS
class TestCORS:
    @pytest.mark.parametrize("origin", ["https://sunjayaasia.com", "https://www.sunjayaasia.com"])
    def test_allowed_prod(self, origin):
        r = requests.get(f"{BASE_URL}/api/", headers={"Origin": origin})
        assert r.headers.get("access-control-allow-origin") == origin
        assert r.headers.get("access-control-allow-credentials") == "true"

    def test_allowed_preview(self):
        r = requests.get(f"{BASE_URL}/api/", headers={"Origin": PREVIEW_ORIGIN})
        assert r.headers.get("access-control-allow-origin") == PREVIEW_ORIGIN

    def test_evil_get(self):
        r = requests.get(f"{BASE_URL}/api/", headers={"Origin": "https://evil.com"})
        assert "access-control-allow-origin" not in {k.lower() for k in r.headers}

    def test_evil_preflight(self):
        r = requests.options(f"{BASE_URL}/api/auth/login", headers={
            "Origin": "https://evil.com", "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"})
        assert r.headers.get("access-control-allow-origin") != "https://evil.com"
        assert r.headers.get("access-control-allow-origin") != "*"

    def test_good_preflight(self):
        r = requests.options(f"{BASE_URL}/api/auth/login", headers={
            "Origin": "https://sunjayaasia.com", "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "content-type"})
        assert r.status_code == 200
        assert r.headers.get("access-control-allow-origin") == "https://sunjayaasia.com"


# --- Brute force lockout (fake email only)
class TestBruteForce:
    def test_lockout_after_5(self):
        email = f"qa-lock-{uuid.uuid4().hex[:8]}@example.com"
        codes = []
        for _ in range(5):
            r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "wrong"})
            codes.append(r.status_code)
        assert codes == [401] * 5, codes
        r6 = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "wrong"})
        assert r6.status_code == 429
        assert r6.json()["detail"] == "Too many failed attempts. Try again in 15 minute(s)."
        # case-insensitive email still locked
        r7 = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email.upper(), "password": "wrong"})
        assert r7.status_code == 429

    def test_other_email_not_affected(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": f"qa-free-{uuid.uuid4().hex[:8]}@example.com", "password": "wrong"})
        assert r.status_code == 401

    def test_xff_spoof_bypass(self):
        """Probe: does a client-supplied X-Forwarded-For reset the lock identity?"""
        email = f"qa-xff-{uuid.uuid4().hex[:8]}@example.com"
        for _ in range(5):
            requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "wrong"})
        r = requests.post(f"{BASE_URL}/api/auth/login", json={"email": email, "password": "wrong"},
                          headers={"X-Forwarded-For": "1.2.3.4"})
        print("XFF spoof status:", r.status_code)
        assert r.status_code == 429, "Lockout bypassable by spoofing X-Forwarded-For"


# --- Real admin login (1 attempt only)
class TestRealLogin:
    def test_superadmin_login(self):
        r = requests.post(f"{BASE_URL}/api/auth/login",
                          json={"email": "admin@sunjayaasia.com", "password": "sunjaya-superadmin-2026"})
        assert r.status_code == 200, r.text
        d = r.json()
        assert d["user"]["role"] == "superadmin"
        me = requests.get(f"{BASE_URL}/api/auth/me", headers={"Authorization": f"Bearer {d['token']}"})
        assert me.status_code == 200
        assert me.json()["email"] == "admin@sunjayaasia.com"


# --- robots / sitemap
class TestSeoFiles:
    def test_robots(self):
        r = requests.get(f"{BASE_URL}/robots.txt")
        assert r.status_code == 200
        assert "text/plain" in r.headers.get("content-type", "")
        assert "Sitemap: https://sunjayaasia.com/sitemap.xml" in r.text
        assert "Disallow: /admin" in r.text

    def test_sitemap(self):
        r = requests.get(f"{BASE_URL}/sitemap.xml")
        assert r.status_code == 200
        assert "xml" in r.headers.get("content-type", "")
        for p in ["/", "/about", "/pillars", "/subsidiaries", "/news", "/contact", "/legal"]:
            assert f"<loc>https://sunjayaasia.com{p}</loc>" in r.text
        assert "/admin" not in r.text

    def test_index_jsonld(self):
        r = requests.get(f"{BASE_URL}/")
        assert '"@type": "Organization"' in r.text
        assert '"@type": "WebSite"' in r.text
        assert "fonts.googleapis.com/css2?family=Bricolage" in r.text
