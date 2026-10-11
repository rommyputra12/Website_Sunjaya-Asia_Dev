#!/usr/bin/env python3
"""
Backend API Tests for Sunjaya Asia Group - Multi-User CMS Authentication
Tests the new JWT-based authentication system with email+password login.
"""

import requests
import io
from PIL import Image
import sys
import json

# Configuration
BASE_URL = "https://code-sync-145.preview.emergentagent.com/api"
LEGACY_TOKEN = "sunjaya-admin-2026-secret"

# Test credentials (from /app/memory/test_credentials.md)
SUPERADMIN_EMAIL = "admin@sunjayaasia.com"
SUPERADMIN_PASSWORD = "sunjaya-superadmin-2026"
EDITOR_EMAIL = "editor@sunjayaasia.com"
EDITOR_PASSWORD = "editorpass123"

# Test user to create/delete
QA_EDITOR_EMAIL = "qaeditor@sunjayaasia.com"
QA_EDITOR_PASSWORD = "qapass1234"
QA_EDITOR_NAME = "QA Editor"

# Test results tracking
test_results = []
superadmin_token = None
editor_token = None
qaeditor_token = None
qaeditor_id = None
qa_asset_id = None


def log_test(step, description, passed, details=""):
    """Log test result"""
    status = "✅ PASS" if passed else "❌ FAIL"
    result = f"{status} | Step {step}: {description}"
    if details:
        result += f"\n    Details: {details}"
    print(result)
    test_results.append({"step": step, "description": description, "passed": passed, "details": details})
    return passed


def create_test_png():
    """Create a small valid PNG image in memory"""
    img = Image.new('RGB', (10, 10), color='blue')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


print("=" * 80)
print("BACKEND API TESTS - MULTI-USER CMS AUTHENTICATION")
print("=" * 80)
print(f"Base URL: {BASE_URL}")
print(f"Superadmin: {SUPERADMIN_EMAIL}")
print(f"Editor: {EDITOR_EMAIL}")
print(f"QA Test User: {QA_EDITOR_EMAIL}")
print("=" * 80)
print()

# ============================================================================
# STEP 1: POST /api/auth/login with superadmin credentials
# Expected: 200 with token and user object (role: superadmin)
# ============================================================================
print("STEP 1: POST /api/auth/login with superadmin credentials")
print("-" * 80)
try:
    payload = {"email": SUPERADMIN_EMAIL, "password": SUPERADMIN_PASSWORD}
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
    
    if response.status_code == 200:
        data = response.json()
        has_token = "token" in data
        has_user = "user" in data
        
        if has_token and has_user:
            superadmin_token = data["token"]
            user = data["user"]
            role = user.get("role")
            email = user.get("email")
            
            if role == "superadmin" and email == SUPERADMIN_EMAIL:
                log_test(1, "Login as superadmin returns 200 with token and user (role: superadmin)", True,
                        f"Token: {superadmin_token[:30]}..., Role: {role}, Email: {email}")
            else:
                log_test(1, "Login response has correct role and email", False,
                        f"Expected role='superadmin' email='{SUPERADMIN_EMAIL}', got role='{role}' email='{email}'")
        else:
            log_test(1, "Login response has token and user", False,
                    f"has_token: {has_token}, has_user: {has_user}")
    else:
        log_test(1, "POST /api/auth/login with superadmin returns 200", False,
                f"Status: {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(1, "POST /api/auth/login with superadmin", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 2: POST /api/auth/login with WRONG password
# Expected: 401
# ============================================================================
print("STEP 2: POST /api/auth/login with WRONG password")
print("-" * 80)
try:
    payload = {"email": SUPERADMIN_EMAIL, "password": "wrong-password-123"}
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
    
    if response.status_code == 401:
        log_test(2, "Login with wrong password returns 401", True,
                f"Status: {response.status_code}")
    else:
        log_test(2, "Login with wrong password returns 401", False,
                f"Expected 401, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(2, "POST /api/auth/login with wrong password", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 3: GET /api/auth/me with superadmin JWT Bearer token
# Expected: 200 with email and role
# ============================================================================
print("STEP 3: GET /api/auth/me with superadmin JWT Bearer token")
print("-" * 80)
if superadmin_token:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        response = requests.get(f"{BASE_URL}/auth/me", headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            email = data.get("email")
            role = data.get("role")
            
            if email == SUPERADMIN_EMAIL and role == "superadmin":
                log_test(3, "GET /api/auth/me with Bearer token returns 200 with email+role", True,
                        f"Email: {email}, Role: {role}")
            else:
                log_test(3, "GET /api/auth/me returns correct email and role", False,
                        f"Expected email='{SUPERADMIN_EMAIL}' role='superadmin', got email='{email}' role='{role}'")
        else:
            log_test(3, "GET /api/auth/me with Bearer token returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test(3, "GET /api/auth/me with Bearer token", False, f"Exception: {str(e)}")
else:
    log_test(3, "GET /api/auth/me", False, "Skipped - no superadmin token from step 1")

print()

# ============================================================================
# STEP 4: GET /api/auth/me WITHOUT token
# Expected: 401
# ============================================================================
print("STEP 4: GET /api/auth/me WITHOUT token")
print("-" * 80)
try:
    response = requests.get(f"{BASE_URL}/auth/me", timeout=30)
    
    if response.status_code == 401:
        log_test(4, "GET /api/auth/me without token returns 401", True,
                f"Status: {response.status_code}")
    else:
        log_test(4, "GET /api/auth/me without token returns 401", False,
                f"Expected 401, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(4, "GET /api/auth/me without token", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 5: GET /api/auth/users with superadmin JWT
# Expected: 200 with array of users, NO password_hash field
# ============================================================================
print("STEP 5: GET /api/auth/users with superadmin JWT")
print("-" * 80)
if superadmin_token:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        response = requests.get(f"{BASE_URL}/auth/users", headers=headers, timeout=30)
        
        if response.status_code == 200:
            users = response.json()
            
            if isinstance(users, list):
                log_test(5, "GET /api/auth/users returns array", True,
                        f"Found {len(users)} users")
                
                # Check that NO user has password_hash field
                users_with_password = [u for u in users if "password_hash" in u]
                if len(users_with_password) == 0:
                    log_test(5, "CRITICAL: No user contains 'password_hash' field", True,
                            f"Verified all {len(users)} users have no password_hash exposed")
                else:
                    log_test(5, "CRITICAL: No user contains 'password_hash' field", False,
                            f"SECURITY ISSUE: {len(users_with_password)} users expose password_hash!")
            else:
                log_test(5, "GET /api/auth/users returns array", False,
                        f"Expected list, got {type(users)}")
        else:
            log_test(5, "GET /api/auth/users with superadmin JWT returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test(5, "GET /api/auth/users", False, f"Exception: {str(e)}")
else:
    log_test(5, "GET /api/auth/users", False, "Skipped - no superadmin token from step 1")

print()

# ============================================================================
# STEP 6a: POST /api/auth/users create qaeditor
# Expected: 200 with new user
# ============================================================================
print("STEP 6a: POST /api/auth/users create qaeditor")
print("-" * 80)
if superadmin_token:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        payload = {
            "name": QA_EDITOR_NAME,
            "email": QA_EDITOR_EMAIL,
            "password": QA_EDITOR_PASSWORD,
            "role": "editor"
        }
        response = requests.post(f"{BASE_URL}/auth/users", json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            user = response.json()
            qaeditor_id = user.get("id")
            email = user.get("email")
            role = user.get("role")
            
            if email == QA_EDITOR_EMAIL and role == "editor":
                log_test("6a", "POST /api/auth/users creates qaeditor successfully", True,
                        f"User ID: {qaeditor_id}, Email: {email}, Role: {role}")
            else:
                log_test("6a", "Created user has correct email and role", False,
                        f"Expected email='{QA_EDITOR_EMAIL}' role='editor', got email='{email}' role='{role}'")
        else:
            log_test("6a", "POST /api/auth/users returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("6a", "POST /api/auth/users create qaeditor", False, f"Exception: {str(e)}")
else:
    log_test("6a", "POST /api/auth/users", False, "Skipped - no superadmin token from step 1")

print()

# ============================================================================
# STEP 6b: POST /api/auth/users with DUPLICATE email
# Expected: 409
# ============================================================================
print("STEP 6b: POST /api/auth/users with duplicate email")
print("-" * 80)
if superadmin_token:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        payload = {
            "name": "Duplicate User",
            "email": QA_EDITOR_EMAIL,  # Same email as step 6a
            "password": "somepassword",
            "role": "editor"
        }
        response = requests.post(f"{BASE_URL}/auth/users", json=payload, headers=headers, timeout=30)
        
        if response.status_code == 409:
            log_test("6b", "POST /api/auth/users with duplicate email returns 409", True,
                    f"Status: {response.status_code}")
        else:
            log_test("6b", "POST /api/auth/users with duplicate email returns 409", False,
                    f"Expected 409, got {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("6b", "POST /api/auth/users with duplicate email", False, f"Exception: {str(e)}")
else:
    log_test("6b", "POST /api/auth/users duplicate", False, "Skipped - no superadmin token from step 1")

print()

# ============================================================================
# STEP 7: POST /api/auth/login as qaeditor
# Expected: 200 with token and user (role: editor)
# ============================================================================
print("STEP 7: POST /api/auth/login as qaeditor")
print("-" * 80)
try:
    payload = {"email": QA_EDITOR_EMAIL, "password": QA_EDITOR_PASSWORD}
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
    
    if response.status_code == 200:
        data = response.json()
        has_token = "token" in data
        has_user = "user" in data
        
        if has_token and has_user:
            qaeditor_token = data["token"]
            user = data["user"]
            role = user.get("role")
            email = user.get("email")
            
            if role == "editor" and email == QA_EDITOR_EMAIL:
                log_test(7, "Login as qaeditor returns 200 with token and user (role: editor)", True,
                        f"Token: {qaeditor_token[:30]}..., Role: {role}, Email: {email}")
            else:
                log_test(7, "Login response has correct role and email", False,
                        f"Expected role='editor' email='{QA_EDITOR_EMAIL}', got role='{role}' email='{email}'")
        else:
            log_test(7, "Login response has token and user", False,
                    f"has_token: {has_token}, has_user: {has_user}")
    else:
        log_test(7, "POST /api/auth/login as qaeditor returns 200", False,
                f"Status: {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(7, "POST /api/auth/login as qaeditor", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 8a: GET /api/auth/users with EDITOR JWT
# Expected: 403 (superadmin only)
# ============================================================================
print("STEP 8a: GET /api/auth/users with EDITOR JWT (expect 403)")
print("-" * 80)
if qaeditor_token:
    try:
        headers = {"Authorization": f"Bearer {qaeditor_token}"}
        response = requests.get(f"{BASE_URL}/auth/users", headers=headers, timeout=30)
        
        if response.status_code == 403:
            log_test("8a", "GET /api/auth/users with editor JWT returns 403 (superadmin only)", True,
                    f"Status: {response.status_code}")
        else:
            log_test("8a", "GET /api/auth/users with editor JWT returns 403", False,
                    f"Expected 403, got {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("8a", "GET /api/auth/users with editor JWT", False, f"Exception: {str(e)}")
else:
    log_test("8a", "GET /api/auth/users with editor JWT", False, "Skipped - no qaeditor token from step 7")

print()

# ============================================================================
# STEP 8b: GET /api/assets with EDITOR JWT
# Expected: 200 (public endpoint)
# ============================================================================
print("STEP 8b: GET /api/assets with EDITOR JWT (public endpoint)")
print("-" * 80)
if qaeditor_token:
    try:
        headers = {"Authorization": f"Bearer {qaeditor_token}"}
        response = requests.get(f"{BASE_URL}/assets", headers=headers, timeout=30)
        
        if response.status_code == 200:
            log_test("8b", "GET /api/assets with editor JWT returns 200 (public)", True,
                    f"Status: {response.status_code}")
        else:
            log_test("8b", "GET /api/assets with editor JWT returns 200", False,
                    f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("8b", "GET /api/assets with editor JWT", False, f"Exception: {str(e)}")
else:
    log_test("8b", "GET /api/assets with editor JWT", False, "Skipped - no qaeditor token from step 7")

print()

# ============================================================================
# STEP 8c: POST /api/assets with EDITOR JWT
# Expected: 200 (editor CAN manage content)
# ============================================================================
print("STEP 8c: POST /api/assets with EDITOR JWT (editor can manage content)")
print("-" * 80)
if qaeditor_token:
    try:
        headers = {"Authorization": f"Bearer {qaeditor_token}"}
        png_file = create_test_png()
        files = {"file": ("qa_editor_img.png", png_file, "image/png")}
        data = {"key": "qa_editor_img", "alt": "QA Editor Test Image"}
        
        response = requests.post(f"{BASE_URL}/assets", files=files, data=data, 
                               headers=headers, timeout=30)
        
        if response.status_code == 200:
            asset = response.json()
            qa_asset_id = asset.get("id")
            log_test("8c", "POST /api/assets with editor JWT returns 200 (editor can manage content)", True,
                    f"Status: {response.status_code}, Asset ID: {qa_asset_id}")
        else:
            log_test("8c", "POST /api/assets with editor JWT returns 200", False,
                    f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("8c", "POST /api/assets with editor JWT", False, f"Exception: {str(e)}")
else:
    log_test("8c", "POST /api/assets with editor JWT", False, "Skipped - no qaeditor token from step 7")

print()

# ============================================================================
# STEP 9a: PUT /api/auth/users/{qaeditor_id} with superadmin JWT - deactivate
# Expected: 200
# ============================================================================
print("STEP 9a: PUT /api/auth/users/{qaeditor_id} deactivate with superadmin JWT")
print("-" * 80)
if superadmin_token and qaeditor_id:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        payload = {"active": False}
        response = requests.put(f"{BASE_URL}/auth/users/{qaeditor_id}", 
                              json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            user = response.json()
            active = user.get("active")
            if active == False:
                log_test("9a", "PUT /api/auth/users/{id} deactivate returns 200", True,
                        f"Status: {response.status_code}, Active: {active}")
            else:
                log_test("9a", "User is deactivated", False,
                        f"Expected active=False, got active={active}")
        else:
            log_test("9a", "PUT /api/auth/users/{id} returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("9a", "PUT /api/auth/users deactivate", False, f"Exception: {str(e)}")
else:
    log_test("9a", "PUT /api/auth/users deactivate", False, 
            f"Skipped - missing superadmin_token={bool(superadmin_token)} or qaeditor_id={qaeditor_id}")

print()

# ============================================================================
# STEP 9b: POST /api/auth/login as deactivated qaeditor
# Expected: 403 (deactivated)
# ============================================================================
print("STEP 9b: POST /api/auth/login as deactivated qaeditor (expect 403)")
print("-" * 80)
try:
    payload = {"email": QA_EDITOR_EMAIL, "password": QA_EDITOR_PASSWORD}
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
    
    if response.status_code == 403:
        log_test("9b", "Login as deactivated qaeditor returns 403", True,
                f"Status: {response.status_code}")
    else:
        log_test("9b", "Login as deactivated qaeditor returns 403", False,
                f"Expected 403, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("9b", "POST /api/auth/login as deactivated user", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 9c: PUT /api/auth/users/{qaeditor_id} with superadmin JWT - reactivate
# Expected: 200
# ============================================================================
print("STEP 9c: PUT /api/auth/users/{qaeditor_id} reactivate with superadmin JWT")
print("-" * 80)
if superadmin_token and qaeditor_id:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        payload = {"active": True}
        response = requests.put(f"{BASE_URL}/auth/users/{qaeditor_id}", 
                              json=payload, headers=headers, timeout=30)
        
        if response.status_code == 200:
            user = response.json()
            active = user.get("active")
            if active == True:
                log_test("9c", "PUT /api/auth/users/{id} reactivate returns 200", True,
                        f"Status: {response.status_code}, Active: {active}")
            else:
                log_test("9c", "User is reactivated", False,
                        f"Expected active=True, got active={active}")
        else:
            log_test("9c", "PUT /api/auth/users/{id} returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("9c", "PUT /api/auth/users reactivate", False, f"Exception: {str(e)}")
else:
    log_test("9c", "PUT /api/auth/users reactivate", False, 
            f"Skipped - missing superadmin_token={bool(superadmin_token)} or qaeditor_id={qaeditor_id}")

print()

# ============================================================================
# STEP 10a: DELETE /api/auth/users/{qaeditor_id} with superadmin JWT
# Expected: 200
# ============================================================================
print("STEP 10a: DELETE /api/auth/users/{qaeditor_id} with superadmin JWT")
print("-" * 80)
if superadmin_token and qaeditor_id:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        response = requests.delete(f"{BASE_URL}/auth/users/{qaeditor_id}", 
                                 headers=headers, timeout=30)
        
        if response.status_code == 200:
            log_test("10a", "DELETE /api/auth/users/{id} returns 200", True,
                    f"Status: {response.status_code}")
        else:
            log_test("10a", "DELETE /api/auth/users/{id} returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("10a", "DELETE /api/auth/users", False, f"Exception: {str(e)}")
else:
    log_test("10a", "DELETE /api/auth/users", False, 
            f"Skipped - missing superadmin_token={bool(superadmin_token)} or qaeditor_id={qaeditor_id}")

print()

# ============================================================================
# STEP 10b: POST /api/auth/login as deleted qaeditor
# Expected: 401 (user not found)
# ============================================================================
print("STEP 10b: POST /api/auth/login as deleted qaeditor (expect 401)")
print("-" * 80)
try:
    payload = {"email": QA_EDITOR_EMAIL, "password": QA_EDITOR_PASSWORD}
    response = requests.post(f"{BASE_URL}/auth/login", json=payload, timeout=30)
    
    if response.status_code == 401:
        log_test("10b", "Login as deleted qaeditor returns 401", True,
                f"Status: {response.status_code}")
    else:
        log_test("10b", "Login as deleted qaeditor returns 401", False,
                f"Expected 401, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("10b", "POST /api/auth/login as deleted user", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 11a: Regression - POST /api/assets with legacy X-Admin-Token header
# Expected: 200 (backwards compatible)
# ============================================================================
print("STEP 11a: Regression - POST /api/assets with legacy X-Admin-Token header")
print("-" * 80)
try:
    headers = {"X-Admin-Token": LEGACY_TOKEN}
    png_file = create_test_png()
    files = {"file": ("qa_legacy_img.png", png_file, "image/png")}
    data = {"key": "qa_legacy_img", "alt": "QA Legacy Test Image"}
    
    response = requests.post(f"{BASE_URL}/assets", files=files, data=data, 
                           headers=headers, timeout=30)
    
    if response.status_code == 200:
        asset = response.json()
        legacy_asset_id = asset.get("id")
        log_test("11a", "POST /api/assets with legacy X-Admin-Token returns 200 (backwards compatible)", True,
                f"Status: {response.status_code}, Asset ID: {legacy_asset_id}")
    else:
        log_test("11a", "POST /api/assets with legacy X-Admin-Token returns 200", False,
                f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("11a", "POST /api/assets with legacy token", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 11b: Regression - DELETE /api/assets with legacy X-Admin-Token header
# Expected: 200
# ============================================================================
print("STEP 11b: Regression - DELETE /api/assets with legacy X-Admin-Token header")
print("-" * 80)
if 'legacy_asset_id' in locals():
    try:
        headers = {"X-Admin-Token": LEGACY_TOKEN}
        response = requests.delete(f"{BASE_URL}/assets/{legacy_asset_id}", 
                                 headers=headers, timeout=30)
        
        if response.status_code == 200:
            log_test("11b", "DELETE /api/assets with legacy X-Admin-Token returns 200", True,
                    f"Status: {response.status_code}")
        else:
            log_test("11b", "DELETE /api/assets with legacy X-Admin-Token returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test("11b", "DELETE /api/assets with legacy token", False, f"Exception: {str(e)}")
else:
    log_test("11b", "DELETE /api/assets with legacy token", False, "Skipped - no legacy asset from step 11a")

print()

# ============================================================================
# STEP 11c: Regression - POST /api/assets with NO auth
# Expected: 401
# ============================================================================
print("STEP 11c: Regression - POST /api/assets with NO auth (expect 401)")
print("-" * 80)
try:
    png_file = create_test_png()
    files = {"file": ("test_no_auth.png", png_file, "image/png")}
    data = {"key": "test_no_auth", "alt": "Test"}
    
    response = requests.post(f"{BASE_URL}/assets", files=files, data=data, timeout=30)
    
    if response.status_code == 401:
        log_test("11c", "POST /api/assets with NO auth returns 401", True,
                f"Status: {response.status_code}")
    else:
        log_test("11c", "POST /api/assets with NO auth returns 401", False,
                f"Expected 401, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("11c", "POST /api/assets with NO auth", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 11d: Regression - GET /api/news (public endpoint)
# Expected: 200
# ============================================================================
print("STEP 11d: Regression - GET /api/news (public endpoint)")
print("-" * 80)
try:
    response = requests.get(f"{BASE_URL}/news", timeout=30)
    
    if response.status_code == 200:
        log_test("11d", "GET /api/news returns 200", True,
                f"Status: {response.status_code}")
    else:
        log_test("11d", "GET /api/news returns 200", False,
                f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("11d", "GET /api/news", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 11e: Regression - GET /api/locations (public endpoint)
# Expected: 200
# ============================================================================
print("STEP 11e: Regression - GET /api/locations (public endpoint)")
print("-" * 80)
try:
    response = requests.get(f"{BASE_URL}/locations", timeout=30)
    
    if response.status_code == 200:
        log_test("11e", "GET /api/locations returns 200", True,
                f"Status: {response.status_code}")
    else:
        log_test("11e", "GET /api/locations returns 200", False,
                f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("11e", "GET /api/locations", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 11f: Regression - GET /api/health (public endpoint)
# Expected: 200
# ============================================================================
print("STEP 11f: Regression - GET /api/health (public endpoint)")
print("-" * 80)
try:
    response = requests.get(f"{BASE_URL}/health", timeout=30)
    
    if response.status_code == 200:
        log_test("11f", "GET /api/health returns 200", True,
                f"Status: {response.status_code}")
    else:
        log_test("11f", "GET /api/health returns 200", False,
                f"Expected 200, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test("11f", "GET /api/health", False, f"Exception: {str(e)}")

print()

# ============================================================================
# CLEANUP: Delete qa_editor_img asset if created
# ============================================================================
print("CLEANUP: Delete qa_editor_img asset")
print("-" * 80)
if superadmin_token and qa_asset_id:
    try:
        headers = {"Authorization": f"Bearer {superadmin_token}"}
        response = requests.delete(f"{BASE_URL}/assets/{qa_asset_id}", 
                                 headers=headers, timeout=30)
        
        if response.status_code == 200:
            print(f"✅ Cleanup successful - deleted qa_editor_img asset (ID: {qa_asset_id})")
        else:
            print(f"⚠️  Cleanup warning - could not delete qa_editor_img asset: {response.status_code}")
            
    except Exception as e:
        print(f"⚠️  Cleanup warning - exception deleting qa_editor_img: {str(e)}")
else:
    print("ℹ️  Cleanup skipped - no qa_editor_img asset to delete")

print()

# ============================================================================
# SUMMARY
# ============================================================================
print("=" * 80)
print("TEST SUMMARY")
print("=" * 80)

passed = sum(1 for r in test_results if r["passed"])
total = len(test_results)
failed = total - passed

print(f"Total Tests: {total}")
print(f"Passed: {passed}")
print(f"Failed: {failed}")
print()

if failed > 0:
    print("FAILED TESTS:")
    for r in test_results:
        if not r["passed"]:
            print(f"  ❌ Step {r['step']}: {r['description']}")
            if r["details"]:
                print(f"     {r['details']}")
    print()

if failed == 0:
    print("✅ ALL TESTS PASSED!")
    print()
    print("CRITICAL SAFETY VERIFICATION:")
    print("✅ Never deleted or deactivated admin@sunjayaasia.com")
    print("✅ Never deleted or deactivated editor@sunjayaasia.com")
    print("✅ Only created/modified/deleted qaeditor@sunjayaasia.com (test user)")
    print("✅ Only created/deleted qa_editor_img and qa_legacy_img assets (test assets)")
    sys.exit(0)
else:
    print(f"❌ {failed} TEST(S) FAILED")
    sys.exit(1)
