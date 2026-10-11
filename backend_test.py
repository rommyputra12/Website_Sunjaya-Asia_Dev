#!/usr/bin/env python3
"""
Backend API Tests for Sunjaya Asia Group - Image CMS + Supabase Migration
Tests the new Assets API endpoints with Supabase Storage integration.
"""

import requests
import io
from PIL import Image
import sys

# Configuration
BASE_URL = "https://code-sync-145.preview.emergentagent.com/api"
ADMIN_TOKEN = "sunjaya-admin-2026-secret"
ADMIN_HEADERS = {"X-Admin-Token": ADMIN_TOKEN}

# Test results tracking
test_results = []
test_asset_id = None
test_asset_url = None


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
    img = Image.new('RGB', (100, 100), color='red')
    buf = io.BytesIO()
    img.save(buf, format='PNG')
    buf.seek(0)
    return buf


def create_test_txt():
    """Create a small text file (non-image) for validation test"""
    return io.BytesIO(b"This is a text file, not an image")


print("=" * 80)
print("BACKEND API TESTS - IMAGE CMS + SUPABASE MIGRATION")
print("=" * 80)
print(f"Base URL: {BASE_URL}")
print(f"Admin Token: {ADMIN_TOKEN[:20]}...")
print("=" * 80)
print()

# ============================================================================
# STEP 1: GET /api/assets (no auth) - expect 200 and >= 25 items
# ============================================================================
print("STEP 1: GET /api/assets (public, no auth)")
print("-" * 80)
try:
    response = requests.get(f"{BASE_URL}/assets", timeout=30)
    
    if response.status_code == 200:
        assets = response.json()
        
        # Check if it's a list
        if not isinstance(assets, list):
            log_test(1, "GET /api/assets returns JSON array", False, 
                    f"Expected list, got {type(assets)}")
        else:
            # Check count
            count = len(assets)
            if count >= 25:
                log_test(1, f"GET /api/assets returns >= 25 items", True, 
                        f"Found {count} assets")
            else:
                log_test(1, f"GET /api/assets returns >= 25 items", False, 
                        f"Found only {count} assets, expected >= 25")
            
            # Check structure of first few items
            if count > 0:
                sample = assets[0]
                has_id = "id" in sample
                has_key = "key" in sample
                has_url = "url" in sample
                
                if has_id and has_key and has_url:
                    log_test(1, "Assets have required fields (id, key, url)", True,
                            f"Sample: id={sample.get('id')}, key={sample.get('key')[:30]}...")
                else:
                    log_test(1, "Assets have required fields (id, key, url)", False,
                            f"Missing fields - id:{has_id}, key:{has_key}, url:{has_url}")
                
                # Check if URLs contain supabase.co
                supabase_urls = [a for a in assets if "supabase.co/storage/v1/object/public/website-images" in a.get("url", "")]
                if len(supabase_urls) == count:
                    log_test(1, "All asset URLs contain supabase.co/storage/v1/object/public/website-images", True,
                            f"All {count} URLs are Supabase URLs")
                else:
                    log_test(1, "All asset URLs contain supabase.co/storage/v1/object/public/website-images", False,
                            f"Only {len(supabase_urls)}/{count} URLs are Supabase URLs")
                
                # Test a few URLs by HTTP GET
                print("\n    Testing direct image URLs...")
                test_urls = assets[:3]  # Test first 3
                for i, asset in enumerate(test_urls):
                    url = asset.get("url")
                    try:
                        img_response = requests.get(url, timeout=10)
                        content_type = img_response.headers.get("Content-Type", "")
                        is_image = "image/" in content_type
                        
                        if img_response.status_code == 200 and is_image:
                            log_test(1, f"Direct URL test [{i+1}/3]: {asset.get('key')[:30]}", True,
                                    f"Status: {img_response.status_code}, Type: {content_type}")
                        else:
                            log_test(1, f"Direct URL test [{i+1}/3]: {asset.get('key')[:30]}", False,
                                    f"Status: {img_response.status_code}, Type: {content_type}")
                    except Exception as e:
                        log_test(1, f"Direct URL test [{i+1}/3]: {asset.get('key')[:30]}", False,
                                f"Error: {str(e)}")
    else:
        log_test(1, "GET /api/assets returns 200", False, 
                f"Status: {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(1, "GET /api/assets", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 2: POST /api/assets WITHOUT admin header - expect 401
# ============================================================================
print("STEP 2: POST /api/assets WITHOUT admin header (expect 401)")
print("-" * 80)
try:
    png_file = create_test_png()
    files = {"file": ("test.png", png_file, "image/png")}
    data = {"key": "test_unauthorized", "alt": "Test"}
    
    response = requests.post(f"{BASE_URL}/assets", files=files, data=data, timeout=30)
    
    if response.status_code == 401:
        log_test(2, "POST /api/assets without admin header returns 401", True,
                f"Status: {response.status_code}")
    else:
        log_test(2, "POST /api/assets without admin header returns 401", False,
                f"Expected 401, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(2, "POST /api/assets without admin header", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 3: POST /api/assets WITH admin header - expect 200 with supabase URL
# ============================================================================
print("STEP 3: POST /api/assets WITH admin header (valid upload)")
print("-" * 80)
try:
    png_file = create_test_png()
    files = {"file": ("test_cms_upload.png", png_file, "image/png")}
    data = {"key": "test_cms_upload", "alt": "Test CMS"}
    
    response = requests.post(f"{BASE_URL}/assets", files=files, data=data, 
                           headers=ADMIN_HEADERS, timeout=30)
    
    if response.status_code == 200:
        asset = response.json()
        test_asset_id = asset.get("id")
        test_asset_url = asset.get("url")
        
        has_url = "url" in asset
        is_supabase = "supabase.co" in test_asset_url if test_asset_url else False
        
        if has_url and is_supabase:
            log_test(3, "POST /api/assets with admin header returns 200 with Supabase URL", True,
                    f"Asset ID: {test_asset_id}, URL: {test_asset_url[:80]}...")
            
            # Test the returned URL
            print("\n    Testing returned URL...")
            try:
                img_response = requests.get(test_asset_url, timeout=10)
                content_type = img_response.headers.get("Content-Type", "")
                
                if img_response.status_code == 200 and "image/" in content_type:
                    log_test(3, "Returned URL is accessible and returns image", True,
                            f"Status: {img_response.status_code}, Type: {content_type}")
                else:
                    log_test(3, "Returned URL is accessible and returns image", False,
                            f"Status: {img_response.status_code}, Type: {content_type}")
            except Exception as e:
                log_test(3, "Returned URL is accessible", False, f"Error: {str(e)}")
        else:
            log_test(3, "POST /api/assets returns valid response", False,
                    f"has_url: {has_url}, is_supabase: {is_supabase}")
    else:
        log_test(3, "POST /api/assets with admin header returns 200", False,
                f"Status: {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(3, "POST /api/assets with admin header", False, f"Exception: {str(e)}")

print()

# ============================================================================
# STEP 4: PUT /api/assets/{id} WITH admin header - update alt text
# ============================================================================
print("STEP 4: PUT /api/assets/{id} WITH admin header (update alt)")
print("-" * 80)
if test_asset_id:
    try:
        payload = {"alt": "Updated Alt"}
        response = requests.put(f"{BASE_URL}/assets/{test_asset_id}", 
                              json=payload, headers=ADMIN_HEADERS, timeout=30)
        
        if response.status_code == 200:
            asset = response.json()
            alt = asset.get("alt")
            
            if alt == "Updated Alt":
                log_test(4, "PUT /api/assets/{id} updates alt text", True,
                        f"Alt text updated to: '{alt}'")
            else:
                log_test(4, "PUT /api/assets/{id} updates alt text", False,
                        f"Expected 'Updated Alt', got '{alt}'")
        else:
            log_test(4, "PUT /api/assets/{id} returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test(4, "PUT /api/assets/{id}", False, f"Exception: {str(e)}")
else:
    log_test(4, "PUT /api/assets/{id}", False, "Skipped - no test asset ID from step 3")

print()

# ============================================================================
# STEP 5: GET /api/assets again - confirm test asset is present with updated alt
# ============================================================================
print("STEP 5: GET /api/assets again (verify test asset with updated alt)")
print("-" * 80)
if test_asset_id:
    try:
        response = requests.get(f"{BASE_URL}/assets", timeout=30)
        
        if response.status_code == 200:
            assets = response.json()
            test_asset = next((a for a in assets if a.get("key") == "test_cms_upload"), None)
            
            if test_asset:
                alt = test_asset.get("alt")
                if alt == "Updated Alt":
                    log_test(5, "Test asset 'test_cms_upload' present with updated alt", True,
                            f"Found asset with alt: '{alt}'")
                else:
                    log_test(5, "Test asset has updated alt text", False,
                            f"Expected 'Updated Alt', got '{alt}'")
            else:
                log_test(5, "Test asset 'test_cms_upload' present in list", False,
                        "Asset not found in list")
        else:
            log_test(5, "GET /api/assets returns 200", False,
                    f"Status: {response.status_code}")
            
    except Exception as e:
        log_test(5, "GET /api/assets", False, f"Exception: {str(e)}")
else:
    log_test(5, "GET /api/assets verification", False, "Skipped - no test asset ID from step 3")

print()

# ============================================================================
# STEP 6: DELETE /api/assets/{id} WITH admin header - expect 200
# ============================================================================
print("STEP 6: DELETE /api/assets/{id} WITH admin header")
print("-" * 80)
if test_asset_id:
    try:
        response = requests.delete(f"{BASE_URL}/assets/{test_asset_id}", 
                                 headers=ADMIN_HEADERS, timeout=30)
        
        if response.status_code == 200:
            log_test(6, "DELETE /api/assets/{id} returns 200", True,
                    f"Status: {response.status_code}")
            
            # Verify the asset is gone from the list
            print("\n    Verifying asset is removed from list...")
            list_response = requests.get(f"{BASE_URL}/assets", timeout=30)
            if list_response.status_code == 200:
                assets = list_response.json()
                test_asset = next((a for a in assets if a.get("key") == "test_cms_upload"), None)
                
                if test_asset is None:
                    log_test(6, "Test asset 'test_cms_upload' removed from list", True,
                            "Asset not found in list (as expected)")
                else:
                    log_test(6, "Test asset 'test_cms_upload' removed from list", False,
                            "Asset still present in list")
            
            # Try to access the URL (should fail)
            if test_asset_url:
                print("\n    Verifying URL is no longer accessible...")
                try:
                    url_response = requests.get(test_asset_url, timeout=10)
                    # Supabase returns 400 or 404 for deleted objects
                    if url_response.status_code in [400, 404]:
                        log_test(6, "Deleted asset URL returns 400/404", True,
                                f"Status: {url_response.status_code} (expected)")
                    else:
                        log_test(6, "Deleted asset URL returns 400/404", False,
                                f"Status: {url_response.status_code} (still accessible)")
                except Exception as e:
                    log_test(6, "Deleted asset URL check", False, f"Error: {str(e)}")
        else:
            log_test(6, "DELETE /api/assets/{id} returns 200", False,
                    f"Status: {response.status_code}, Body: {response.text[:200]}")
            
    except Exception as e:
        log_test(6, "DELETE /api/assets/{id}", False, f"Exception: {str(e)}")
else:
    log_test(6, "DELETE /api/assets/{id}", False, "Skipped - no test asset ID from step 3")

print()

# ============================================================================
# STEP 7: Validation - POST non-image file - expect 415
# ============================================================================
print("STEP 7: POST /api/assets with non-image file (expect 415)")
print("-" * 80)
try:
    txt_file = create_test_txt()
    files = {"file": ("test.txt", txt_file, "text/plain")}
    data = {"key": "test_invalid", "alt": "Test"}
    
    response = requests.post(f"{BASE_URL}/assets", files=files, data=data, 
                           headers=ADMIN_HEADERS, timeout=30)
    
    if response.status_code == 415:
        log_test(7, "POST /api/assets with non-image returns 415", True,
                f"Status: {response.status_code}")
    else:
        log_test(7, "POST /api/assets with non-image returns 415", False,
                f"Expected 415, got {response.status_code}, Body: {response.text[:200]}")
        
except Exception as e:
    log_test(7, "POST /api/assets with non-image", False, f"Exception: {str(e)}")

print()

# ============================================================================
# ADDITIONAL: Verify existing endpoints still work
# ============================================================================
print("ADDITIONAL: Verify existing endpoints still work")
print("-" * 80)

# Test GET /api/news
try:
    response = requests.get(f"{BASE_URL}/news", timeout=30)
    if response.status_code == 200:
        log_test("A1", "GET /api/news returns 200", True, f"Status: {response.status_code}")
    else:
        log_test("A1", "GET /api/news returns 200", False, 
                f"Status: {response.status_code}, Body: {response.text[:200]}")
except Exception as e:
    log_test("A1", "GET /api/news", False, f"Exception: {str(e)}")

# Test GET /api/locations
try:
    response = requests.get(f"{BASE_URL}/locations", timeout=30)
    if response.status_code == 200:
        log_test("A2", "GET /api/locations returns 200", True, f"Status: {response.status_code}")
    else:
        log_test("A2", "GET /api/locations returns 200", False, 
                f"Status: {response.status_code}, Body: {response.text[:200]}")
except Exception as e:
    log_test("A2", "GET /api/locations", False, f"Exception: {str(e)}")

# Test GET /api/health
try:
    response = requests.get(f"{BASE_URL}/health", timeout=30)
    if response.status_code == 200:
        log_test("A3", "GET /api/health returns 200", True, f"Status: {response.status_code}")
    else:
        log_test("A3", "GET /api/health returns 200", False, 
                f"Status: {response.status_code}, Body: {response.text[:200]}")
except Exception as e:
    log_test("A3", "GET /api/health", False, f"Exception: {str(e)}")

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
    sys.exit(0)
else:
    print(f"❌ {failed} TEST(S) FAILED")
    sys.exit(1)
