import json, os, sys, requests
# Restore CMS content blocks to snapshot values (/tmp/content_orig.json) for given keys
BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
H = {"X-Admin-Token": "sunjaya-admin-2026-secret"}
orig = {b["key"]: b for b in json.load(open("/tmp/content_orig.json"))}
cur = {b["key"]: b for b in requests.get(f"{BASE}/api/content").json()}
keys = sys.argv[1:] or list(orig)
for k in keys:
    o, c = orig.get(k), cur.get(k)
    if not o:
        print("not in snapshot", k); continue
    if c and (c["value"] != o["value"] or c.get("value_id", "") != o.get("value_id", "")):
        r = requests.put(f"{BASE}/api/content/{c['id']}", headers=H, json={"value": o["value"], "value_id": o.get("value_id", "")})
        print("restored", k, r.status_code)
cur = {b["key"]: b for b in requests.get(f"{BASE}/api/content").json()}
diff = [k for k in orig if k in cur and (cur[k]["value"] != orig[k]["value"] or cur[k].get("value_id", "") != orig[k].get("value_id", ""))]
extra = [k for k in cur if k not in orig]
print("remaining diffs:", diff, "new keys:", extra)
