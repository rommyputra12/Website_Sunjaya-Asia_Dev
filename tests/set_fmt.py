import json, os, requests
# Apply formatted test values to a few rich fields (restore afterwards with restore_content.py)
BASE = os.environ["REACT_APP_BACKEND_URL"].rstrip("/")
H = {"X-Admin-Token": "sunjaya-admin-2026-secret"}
cur = {b["key"]: b for b in requests.get(f"{BASE}/api/content").json()}
vals = {
 "hero.sub": "[align=center]A **global** investment _powerhouse_ ++converging++ [c=sky]Wealth[/c] and more.",
 "contact.sub": "[align=right]For **partnerships**, [c=copper]investment[/c] — reach out.",
 "pillar.01.body": "[align=justify]A ++financial catalyst++ for _sustainable_ **economic** [c=gray]progress[/c].",
 "footer.description": "**Bold** footer with [c=ivory]ivory[/c].",
}
for k, v in vals.items():
    c = cur.get(k)
    if not c: print("missing", k); continue
    print(k, requests.put(f"{BASE}/api/content/{c['id']}", headers=H, json={"value": v}).status_code)
