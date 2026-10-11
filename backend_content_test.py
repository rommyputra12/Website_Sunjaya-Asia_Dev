#!/usr/bin/env python3
"""
Comprehensive test suite for Text CMS (content_blocks) API
Tests the NEW content blocks backend for Sunjaya Asia Group site
"""
import requests
import sys
import io
from PIL import Image

# Configuration
BASE_URL = "https://code-sync-145.preview.emergentagent.com/api"
ADMIN_EMAIL = "admin@sunjayaasia.com"
ADMIN_PASSWORD = "sunjaya-superadmin-2026"

# Test tracking
tests_passed = 0
tests_failed = 0
test_results = []

def log_test(name, passed, details=""):
    global tests_passed, tests_failed
    if passed:
        tests_passed += 1
        status = "✅ PASS"
    else:
        tests_failed += 1
        status = "❌ FAIL"
    result = f"{status}: {name}"
    if details:
        result += f" - {details}"
    print(result)
    test_results.append({"name": name, "passed": passed, "details": details})

def get_jwt_token():
    """Login and get JWT token"""
    print("\n=== AUTHENTICATION ===")
    url = f"{BASE_URL}/auth/login"
    payload = {"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD}
    try:
        r = requests.post(url, json=payload, timeout=30)
        if r.status_code == 200:
            data = r.json()
            token = data.get("token")
            user = data.get("user", {})
            log_test("Login with superadmin credentials", True, 
                    f"Got JWT token, role={user.get('role')}")
            return token
        else:
            log_test("Login with superadmin credentials", False, 
                    f"Status {r.status_code}: {r.text[:200]}")
            return None
    except Exception as e:
        log_test("Login with superadmin credentials", False, str(e))
        return None

def test_get_content_public():
    """Test 1: GET /api/content (public, no auth)"""
    print("\n=== TEST 1: GET /api/content (PUBLIC) ===")
    url = f"{BASE_URL}/content"
    try:
        r = requests.get(url, timeout=30)
        if r.status_code != 200:
            log_test("GET /api/content returns 200", False, f"Status {r.status_code}")
            return None
        
        log_test("GET /api/content returns 200", True)
        
        data = r.json()
        if not isinstance(data, list):
            log_test("Response is array", False, f"Got {type(data)}")
            return None
        
        log_test("Response is array", True)
        
        count = len(data)
        if count < 69:
            log_test("Array has >= 69 items", False, f"Got {count} items")
            return None
        
        log_test("Array has >= 69 items", True, f"Got {count} items")
        
        # Check required fields
        if data:
            first = data[0]
            required_fields = ["id", "key", "value", "page", "section"]
            missing = [f for f in required_fields if f not in first]
            if missing:
                log_test("Each item has required fields", False, f"Missing: {missing}")
            else:
                log_test("Each item has required fields", True, 
                        f"Fields: {', '.join(required_fields)}")
        
        # Check for specific keys
        keys_to_find = ["hero.line1", "stats.value.modules", "footer.addr_sg_line1", "presence.cta"]
        found_keys = {item["key"] for item in data}
        
        for key in keys_to_find:
            if key in found_keys:
                log_test(f"Key '{key}' exists", True)
            else:
                log_test(f"Key '{key}' exists", False, "Not found in response")
        
        return data
    
    except Exception as e:
        log_test("GET /api/content", False, str(e))
        return None

def test_update_hero_line1(token, content_list):
    """Test 2: Update hero.line1, verify persistence, then revert"""
    print("\n=== TEST 2: UPDATE hero.line1 (TEST & REVERT) ===")
    
    if not token:
        log_test("Update hero.line1 (skipped - no token)", False, "No JWT token")
        return
    
    if not content_list:
        log_test("Update hero.line1 (skipped - no content list)", False, "No content list")
        return
    
    # Find hero.line1
    hero_block = None
    for item in content_list:
        if item.get("key") == "hero.line1":
            hero_block = item
            break
    
    if not hero_block:
        log_test("Find hero.line1 block", False, "Not found in content list")
        return
    
    block_id = hero_block["id"]
    original_value = hero_block.get("value", "")
    log_test("Find hero.line1 block", True, f"ID={block_id}, original='{original_value}'")
    
    headers = {"Authorization": f"Bearer {token}"}
    url = f"{BASE_URL}/content/{block_id}"
    
    # Step 1: Update to TEST OVERRIDE
    try:
        r = requests.put(url, json={"value": "TEST OVERRIDE"}, headers=headers, timeout=30)
        if r.status_code != 200:
            log_test("PUT hero.line1 to 'TEST OVERRIDE'", False, 
                    f"Status {r.status_code}: {r.text[:200]}")
            return
        
        data = r.json()
        if data.get("value") != "TEST OVERRIDE":
            log_test("PUT hero.line1 to 'TEST OVERRIDE'", False, 
                    f"Value is '{data.get('value')}' not 'TEST OVERRIDE'")
            return
        
        log_test("PUT hero.line1 to 'TEST OVERRIDE'", True, "Value updated correctly")
    except Exception as e:
        log_test("PUT hero.line1 to 'TEST OVERRIDE'", False, str(e))
        return
    
    # Step 2: Verify persistence with GET
    try:
        r = requests.get(f"{BASE_URL}/content", timeout=30)
        if r.status_code != 200:
            log_test("GET /api/content to verify persistence", False, f"Status {r.status_code}")
        else:
            data = r.json()
            hero_updated = next((item for item in data if item.get("key") == "hero.line1"), None)
            if hero_updated and hero_updated.get("value") == "TEST OVERRIDE":
                log_test("Verify 'TEST OVERRIDE' persisted", True, "Value confirmed in GET")
            else:
                log_test("Verify 'TEST OVERRIDE' persisted", False, 
                        f"Value is '{hero_updated.get('value') if hero_updated else 'NOT FOUND'}'")
    except Exception as e:
        log_test("GET /api/content to verify persistence", False, str(e))
    
    # Step 3: REVERT to original value (CRITICAL - MUST REVERT)
    revert_value = "The Power"  # As specified in review request
    try:
        r = requests.put(url, json={"value": revert_value}, headers=headers, timeout=30)
        if r.status_code != 200:
            log_test(f"REVERT hero.line1 to '{revert_value}'", False, 
                    f"Status {r.status_code}: {r.text[:200]}")
            print(f"⚠️  WARNING: Failed to revert hero.line1! Manual intervention needed.")
            return
        
        data = r.json()
        if data.get("value") != revert_value:
            log_test(f"REVERT hero.line1 to '{revert_value}'", False, 
                    f"Value is '{data.get('value')}' not '{revert_value}'")
            print(f"⚠️  WARNING: Failed to revert hero.line1! Manual intervention needed.")
            return
        
        log_test(f"REVERT hero.line1 to '{revert_value}'", True, "✅ REVERTED SUCCESSFULLY")
    except Exception as e:
        log_test(f"REVERT hero.line1 to '{revert_value}'", False, str(e))
        print(f"⚠️  WARNING: Failed to revert hero.line1! Manual intervention needed.")

def test_create_update_delete_block(token):
    """Test 3: Create qa_test.block, update it, then delete it"""
    print("\n=== TEST 3: CREATE/UPDATE/DELETE qa_test.block ===")
    
    if not token:
        log_test("Create/Update/Delete test block (skipped)", False, "No JWT token")
        return
    
    headers = {"Authorization": f"Bearer {token}"}
    
    # Step 1: Create qa_test.block
    payload = {
        "key": "qa_test.block",
        "value": "hello",
        "page": "other",
        "section": "general",
        "label": "QA Test"
    }
    
    try:
        r = requests.post(f"{BASE_URL}/content", json=payload, headers=headers, timeout=30)
        if r.status_code != 200:
            log_test("POST /api/content create qa_test.block", False, 
                    f"Status {r.status_code}: {r.text[:200]}")
            return
        
        data = r.json()
        block_id = data.get("id")
        if not block_id:
            log_test("POST /api/content create qa_test.block", False, "No ID in response")
            return
        
        if data.get("value") != "hello":
            log_test("POST /api/content create qa_test.block", False, 
                    f"Value is '{data.get('value')}' not 'hello'")
            return
        
        log_test("POST /api/content create qa_test.block", True, f"ID={block_id}, value='hello'")
    except Exception as e:
        log_test("POST /api/content create qa_test.block", False, str(e))
        return
    
    # Step 2: Verify it exists in GET /api/content
    try:
        r = requests.get(f"{BASE_URL}/content", timeout=30)
        if r.status_code != 200:
            log_test("GET /api/content contains qa_test.block", False, f"Status {r.status_code}")
        else:
            data = r.json()
            qa_block = next((item for item in data if item.get("key") == "qa_test.block"), None)
            if qa_block:
                log_test("GET /api/content contains qa_test.block", True, 
                        f"Found with value='{qa_block.get('value')}'")
            else:
                log_test("GET /api/content contains qa_test.block", False, "Not found")
    except Exception as e:
        log_test("GET /api/content contains qa_test.block", False, str(e))
    
    # Step 3: Update value to "hello2"
    try:
        r = requests.put(f"{BASE_URL}/content/{block_id}", 
                        json={"value": "hello2"}, headers=headers, timeout=30)
        if r.status_code != 200:
            log_test("PUT qa_test.block value to 'hello2'", False, 
                    f"Status {r.status_code}: {r.text[:200]}")
        else:
            data = r.json()
            if data.get("value") == "hello2":
                log_test("PUT qa_test.block value to 'hello2'", True, "Value updated")
            else:
                log_test("PUT qa_test.block value to 'hello2'", False, 
                        f"Value is '{data.get('value')}' not 'hello2'")
    except Exception as e:
        log_test("PUT qa_test.block value to 'hello2'", False, str(e))
    
    # Step 4: DELETE qa_test.block
    try:
        r = requests.delete(f"{BASE_URL}/content/{block_id}", headers=headers, timeout=30)
        if r.status_code != 200:
            log_test("DELETE qa_test.block", False, f"Status {r.status_code}: {r.text[:200]}")
        else:
            log_test("DELETE qa_test.block", True, "Deleted successfully")
    except Exception as e:
        log_test("DELETE qa_test.block", False, str(e))
        return
    
    # Step 5: Verify it's gone
    try:
        r = requests.get(f"{BASE_URL}/content", timeout=30)
        if r.status_code != 200:
            log_test("Verify qa_test.block is gone", False, f"Status {r.status_code}")
        else:
            data = r.json()
            qa_block = next((item for item in data if item.get("key") == "qa_test.block"), None)
            if qa_block:
                log_test("Verify qa_test.block is gone", False, "Still exists in list")
            else:
                log_test("Verify qa_test.block is gone", True, "Confirmed deleted")
    except Exception as e:
        log_test("Verify qa_test.block is gone", False, str(e))

def test_auth_required():
    """Test 4: Verify auth is required for POST/PUT/DELETE"""
    print("\n=== TEST 4: AUTH REQUIRED FOR MUTATIONS ===")
    
    # POST without token
    try:
        r = requests.post(f"{BASE_URL}/content", 
                         json={"key": "test", "value": "test"}, timeout=30)
        if r.status_code == 401:
            log_test("POST /api/content without token returns 401", True)
        else:
            log_test("POST /api/content without token returns 401", False, 
                    f"Got status {r.status_code}")
    except Exception as e:
        log_test("POST /api/content without token returns 401", False, str(e))
    
    # PUT without token (use a dummy ID)
    try:
        r = requests.put(f"{BASE_URL}/content/00000000-0000-0000-0000-000000000000", 
                        json={"value": "test"}, timeout=30)
        if r.status_code == 401:
            log_test("PUT /api/content/{id} without token returns 401", True)
        else:
            log_test("PUT /api/content/{id} without token returns 401", False, 
                    f"Got status {r.status_code}")
    except Exception as e:
        log_test("PUT /api/content/{id} without token returns 401", False, str(e))
    
    # DELETE without token
    try:
        r = requests.delete(f"{BASE_URL}/content/00000000-0000-0000-0000-000000000000", 
                           timeout=30)
        if r.status_code == 401:
            log_test("DELETE /api/content/{id} without token returns 401", True)
        else:
            log_test("DELETE /api/content/{id} without token returns 401", False, 
                    f"Got status {r.status_code}")
    except Exception as e:
        log_test("DELETE /api/content/{id} without token returns 401", False, str(e))

def test_regression(token):
    """Test 5: Regression tests for other endpoints"""
    print("\n=== TEST 5: REGRESSION TESTS ===")
    
    # GET /api/assets
    try:
        r = requests.get(f"{BASE_URL}/assets", timeout=30)
        if r.status_code == 200:
            log_test("GET /api/assets returns 200", True, f"{len(r.json())} assets")
        else:
            log_test("GET /api/assets returns 200", False, f"Status {r.status_code}")
    except Exception as e:
        log_test("GET /api/assets returns 200", False, str(e))
    
    # GET /api/news
    try:
        r = requests.get(f"{BASE_URL}/news", timeout=30)
        if r.status_code == 200:
            log_test("GET /api/news returns 200", True, f"{len(r.json())} news items")
        else:
            log_test("GET /api/news returns 200", False, f"Status {r.status_code}")
    except Exception as e:
        log_test("GET /api/news returns 200", False, str(e))
    
    # GET /api/locations
    try:
        r = requests.get(f"{BASE_URL}/locations", timeout=30)
        if r.status_code == 200:
            log_test("GET /api/locations returns 200", True, f"{len(r.json())} locations")
        else:
            log_test("GET /api/locations returns 200", False, f"Status {r.status_code}")
    except Exception as e:
        log_test("GET /api/locations returns 200", False, str(e))
    
    # GET /api/health
    try:
        r = requests.get(f"{BASE_URL}/health", timeout=30)
        if r.status_code == 200:
            log_test("GET /api/health returns 200", True)
        else:
            log_test("GET /api/health returns 200", False, f"Status {r.status_code}")
    except Exception as e:
        log_test("GET /api/health returns 200", False, str(e))
    
    # POST /api/assets with JWT Bearer token (verify Bearer auth works)
    if not token:
        log_test("POST /api/assets with Bearer token (skipped)", False, "No JWT token")
        return
    
    print("\n--- Testing POST /api/assets with Bearer token ---")
    
    # Create a small test PNG (1x1 pixel)
    img = Image.new('RGB', (1, 1), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='PNG')
    img_bytes.seek(0)
    
    headers = {"Authorization": f"Bearer {token}"}
    files = {"file": ("test_bearer_auth.png", img_bytes, "image/png")}
    data = {"key": "test_bearer_auth", "alt": "Test Bearer Auth"}
    
    asset_id = None
    try:
        r = requests.post(f"{BASE_URL}/assets", headers=headers, files=files, 
                         data=data, timeout=60)
        if r.status_code == 200:
            response_data = r.json()
            asset_id = response_data.get("id")
            log_test("POST /api/assets with Bearer token", True, 
                    f"Asset uploaded, ID={asset_id}")
        else:
            log_test("POST /api/assets with Bearer token", False, 
                    f"Status {r.status_code}: {r.text[:200]}")
    except Exception as e:
        log_test("POST /api/assets with Bearer token", False, str(e))
    
    # Delete the test asset
    if asset_id:
        try:
            r = requests.delete(f"{BASE_URL}/assets/{asset_id}", headers=headers, timeout=30)
            if r.status_code == 200:
                log_test("DELETE test asset (cleanup)", True, "Test asset removed")
            else:
                log_test("DELETE test asset (cleanup)", False, 
                        f"Status {r.status_code}: {r.text[:200]}")
        except Exception as e:
            log_test("DELETE test asset (cleanup)", False, str(e))

def main():
    print("=" * 80)
    print("TEXT CMS (content_blocks) BACKEND TEST SUITE")
    print("Sunjaya Asia Group - FASE 1")
    print("=" * 80)
    
    # Get JWT token
    token = get_jwt_token()
    
    # Test 1: GET /api/content (public)
    content_list = test_get_content_public()
    
    # Test 2: Update hero.line1 and revert
    test_update_hero_line1(token, content_list)
    
    # Test 3: Create/Update/Delete test block
    test_create_update_delete_block(token)
    
    # Test 4: Auth required
    test_auth_required()
    
    # Test 5: Regression tests
    test_regression(token)
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80)
    print(f"Total tests: {tests_passed + tests_failed}")
    print(f"✅ Passed: {tests_passed}")
    print(f"❌ Failed: {tests_failed}")
    
    if tests_failed > 0:
        print("\n⚠️  FAILED TESTS:")
        for result in test_results:
            if not result["passed"]:
                print(f"  - {result['name']}: {result['details']}")
    
    print("=" * 80)
    
    return 0 if tests_failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
