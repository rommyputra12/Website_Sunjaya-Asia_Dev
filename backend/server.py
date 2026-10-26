from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, UploadFile, File, Form, Request
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import json
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
from jose import jwt, JWTError


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SUPABASE_SERVICE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY", "") or SUPABASE_KEY
SUPABASE_BUCKET = os.environ.get("SUPABASE_STORAGE_BUCKET", "website-images")
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}
SB_SERVICE_HEADERS = {
    "apikey": SUPABASE_SERVICE_KEY,
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
}

# Emergent Email
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Sunjaya Asia Group")
CONTACT_RECIPIENT = os.environ.get("CONTACT_RECIPIENT", "info@sunjayaasia.com")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "change-me")
JWT_SECRET = os.environ.get("JWT_SECRET", "dev-secret-change-me")
JWT_ALG = "HS256"
JWT_EXPIRE_HOURS = 12
SUPER_ADMIN_EMAIL = os.environ.get("SUPER_ADMIN_EMAIL", "")
SUPER_ADMIN_PASSWORD = os.environ.get("SUPER_ADMIN_PASSWORD", "")

app = FastAPI(title="Sunjaya Asia Group API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============ SUPABASE HELPERS ============

# Short-lived read cache (per table) so public pages don't wait on a Supabase round-trip every request.
# Any write through sb_insert/sb_update/sb_delete clears that table's entries.
_READ_CACHE: dict = {}
_READ_TTL = 60.0


def _cache_clear(table: str):
    for k in [k for k in _READ_CACHE if k[0] == table]:
        _READ_CACHE.pop(k, None)


async def sb_select(table: str, filters: dict | None = None, order: str | None = None, limit: int = 200, svc: bool = False) -> list:
    """Query rows from Supabase via REST API. svc=True uses the service-role key."""
    import time as _t
    ck = (table, json.dumps(filters, sort_keys=True, default=str), order, limit, svc)
    hit = _READ_CACHE.get(ck)
    if hit and _t.monotonic() - hit[0] < _READ_TTL:
        return [dict(r) for r in hit[1]]
    rows = await _sb_select_raw(table, filters, order, limit, svc)
    _READ_CACHE[ck] = (_t.monotonic(), rows)
    return [dict(r) for r in rows]


async def _sb_select_raw(table: str, filters: dict | None, order: str | None, limit: int, svc: bool) -> list:
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    if filters:
        for k, v in filters.items():
            url += f"&{k}=eq.{v}"
    if order:
        url += f"&order={order}"
    url += f"&limit={limit}"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(url, headers=hdrs)
        r.raise_for_status()
        return r.json()


async def sb_select_one(table: str, filters: dict, svc: bool = False) -> dict | None:
    """Query a single row."""
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
    for k, v in filters.items():
        url += f"&{k}=eq.{v}"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(url, headers=hdrs)
        r.raise_for_status()
        data = r.json()
        return data[0] if data else None


async def sb_insert(table: str, row: dict, svc: bool = False) -> dict:
    """Insert a row and return it."""
    _cache_clear(table)
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(url, headers={**hdrs, "Prefer": "return=representation"}, json=row)
        r.raise_for_status()
        return r.json()[0]


async def sb_update(table: str, row_id: str, update: dict, svc: bool = False) -> dict | None:
    """Update a row by id and return it."""
    _cache_clear(table)
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}&select=*"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.patch(url, headers={**hdrs, "Prefer": "return=representation"}, json=update)
        r.raise_for_status()
        data = r.json()
        return data[0] if data else None


async def sb_delete(table: str, row_id: str, svc: bool = False) -> bool:
    """Delete a row by id."""
    _cache_clear(table)
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.delete(url, headers=hdrs)
        r.raise_for_status()
        return True


# ============ MODELS ============

class ContactIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=1, max_length=200)
    email: EmailStr
    company: Optional[str] = None
    subject: str = Field(min_length=1, max_length=300)
    message: str = Field(min_length=1, max_length=5000)
    inquiry_type: Optional[str] = "general"


class ContactOut(BaseModel):
    id: str
    name: str
    email: str
    company: Optional[str] = None
    subject: str
    message: str
    inquiry_type: str
    created_at: str


class NewsIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    title: str = Field(min_length=1, max_length=300)
    slug: Optional[str] = None
    excerpt: str = Field(min_length=1, max_length=500)
    body: str = Field(min_length=1)
    category: str = "Press Release"
    cover_image: Optional[str] = None
    published: bool = True
    language: str = "en"


class NewsOut(BaseModel):
    id: str
    title: str
    slug: str
    excerpt: str
    body: str
    category: str
    cover_image: Optional[str] = None
    published: bool
    language: str
    created_at: str
    updated_at: str


class LocationIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    city: str = Field(min_length=1, max_length=100)
    country: str = Field(min_length=1, max_length=100)
    role: str = Field(min_length=1, max_length=200)
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    color: Optional[str] = "#C86230"
    order: Optional[int] = 100
    published: bool = True
    photo_url: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = "branch"


class LocationOut(BaseModel):
    id: str
    city: str
    country: str
    role: str
    lat: float
    lng: float
    color: str
    order: int
    published: bool
    created_at: str
    photo_url: Optional[str] = None
    description: Optional[str] = None
    type: str = "branch"


def _loc_out(it: dict) -> "LocationOut":
    return LocationOut(
        id=str(it["id"]), city=it["city"], country=it["country"], role=it["role"],
        lat=it["lat"], lng=it["lng"], color=it.get("color") or "#C86230",
        order=it.get("order", 100), published=it.get("published", True),
        created_at=fmt_ts(it.get("created_at")), photo_url=it.get("photo_url"),
        description=it.get("description"), type=it.get("type") or "branch",
    )


# ============ HELPERS ============

def slugify(text: str) -> str:
    import re
    text = text.lower().strip()
    text = re.sub(r'[^a-z0-9\s-]', '', text)
    text = re.sub(r'[\s]+', '-', text)
    return text[:80] or uuid.uuid4().hex[:8]


# ============ AUTH (JWT multi-user + legacy admin token) ============

def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(pw.encode(), hashed.encode())
    except Exception:
        return False


def create_token(user: dict) -> str:
    payload = {
        "sub": str(user["id"]),
        "email": user["email"],
        "name": user.get("name", ""),
        "role": user.get("role", "editor"),
        "exp": datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRE_HOURS),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)


def decode_token(token: str) -> dict | None:
    try:
        return jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
    except JWTError:
        return None


def require_admin(x_admin_token: Optional[str] = Header(default=None), authorization: Optional[str] = Header(default=None)):
    """Accept a JWT Bearer token (multi-user) OR the legacy X-Admin-Token."""
    if authorization and authorization.startswith("Bearer "):
        payload = decode_token(authorization[7:])
        if payload:
            return payload
    if x_admin_token and x_admin_token == ADMIN_TOKEN:
        return {"sub": "legacy-admin", "name": "Legacy Admin", "role": "superadmin", "legacy": True}
    raise HTTPException(status_code=401, detail="Unauthorized")


def require_superadmin(x_admin_token: Optional[str] = Header(default=None), authorization: Optional[str] = Header(default=None)):
    payload = require_admin(x_admin_token, authorization)
    if payload.get("role") != "superadmin":
        raise HTTPException(status_code=403, detail="Superadmin only")
    return payload


def fmt_ts(val) -> str:
    """Normalize a timestamp to ISO string."""
    if val is None:
        return now_iso()
    if isinstance(val, str):
        return val
    return val.isoformat()


async def send_contact_email(payload: ContactIn) -> Optional[str]:
    if not EMAIL_KEY:
        logger.warning("EMERGENT_EMAIL_KEY not set — skipping email send")
        return None
    html = f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family: Arial, sans-serif; background:#f5f5f5; padding:24px;">
      <tr><td>
        <table width="600" align="center" cellpadding="0" cellspacing="0" style="background:#0A0A0A; color:#F3F3F1; border:1px solid #222;">
          <tr><td style="padding:24px; border-bottom:1px solid #222;">
            <div style="font-family: 'Courier New', monospace; color:#C86230; font-size:11px; letter-spacing:2px;">SUNJAYA ASIA GROUP · NEW INQUIRY</div>
            <h2 style="margin:12px 0 0; font-family: Georgia, serif; font-weight:400; font-size:24px;">{payload.subject}</h2>
          </td></tr>
          <tr><td style="padding:24px;">
            <table cellpadding="8" cellspacing="0" width="100%" style="font-size:14px; line-height:1.5;">
              <tr><td style="color:#A0A09B; width:120px;">FROM</td><td style="color:#F3F3F1;">{payload.name}</td></tr>
              <tr><td style="color:#A0A09B;">EMAIL</td><td style="color:#F3F3F1;">{payload.email}</td></tr>
              <tr><td style="color:#A0A09B;">COMPANY</td><td style="color:#F3F3F1;">{payload.company or '—'}</td></tr>
              <tr><td style="color:#A0A09B;">TYPE</td><td style="color:#F3F3F1;">{payload.inquiry_type}</td></tr>
            </table>
            <div style="margin-top:24px; padding-top:24px; border-top:1px solid #222; color:#F3F3F1; font-size:14px; line-height:1.7; white-space:pre-wrap;">{payload.message}</div>
          </td></tr>
          <tr><td style="padding:16px 24px; border-top:1px solid #222; color:#666; font-size:11px; font-family: 'Courier New', monospace;">
            THE POWER OF INNOVATIONS · SINGAPORE · JAKARTA
          </td></tr>
        </table>
      </td></tr>
    </table>
    """
    body = {
        "to": [CONTACT_RECIPIENT],
        "subject": f"[Sunjaya Asia] {payload.subject}",
        "html": html,
        "from_name": EMAIL_FROM_NAME,
        "contact_email": payload.email,
    }
    try:
        async with httpx.AsyncClient(timeout=30) as c:
            r = await c.post(f"{EMAIL_BASE_URL}/api/v1/email/send", headers={"X-Email-Key": EMAIL_KEY}, json=body)
        r.raise_for_status()
        return r.json().get("id")
    except httpx.HTTPStatusError as e:
        logger.error(f"Email send failed: {e.response.status_code} {e.response.text}")
        return None
    except Exception as e:
        logger.error(f"Email send error: {e}")
        return None


# ============ ROUTES ============

@api_router.get("/")
async def root():
    return {"message": "Sunjaya Asia Group API", "status": "operational"}


@api_router.get("/health")
async def health():
    return {"ok": True, "ts": now_iso()}


# ---- Contact ----
@api_router.post("/contact", response_model=ContactOut)
async def create_contact(payload: ContactIn):
    row = {
        "name": payload.name,
        "email": str(payload.email),
        "company": payload.company,
        "subject": payload.subject,
        "message": payload.message,
        "inquiry_type": payload.inquiry_type or "general",
    }
    inserted = await sb_insert("contacts", row)
    doc = {**inserted, "id": str(inserted["id"]), "created_at": fmt_ts(inserted.get("created_at"))}
    email_id = await send_contact_email(payload)
    logger.info(f"Contact received {doc['id']} email_id={email_id}")
    return ContactOut(**doc)


@api_router.get("/contact", response_model=List[ContactOut], dependencies=[Depends(require_admin)])
async def list_contacts():
    items = await sb_select("contacts", order="created_at.desc", limit=500)
    result = []
    for it in items:
        result.append(ContactOut(
            id=str(it["id"]),
            name=it["name"],
            email=it["email"],
            company=it.get("company"),
            subject=it["subject"],
            message=it["message"],
            inquiry_type=it.get("inquiry_type", "general"),
            created_at=fmt_ts(it.get("created_at")),
        ))
    return result


# ---- News CMS ----
@api_router.get("/news", response_model=List[NewsOut])
async def list_news(language: Optional[str] = None, published_only: bool = True):
    filters = {}
    if published_only:
        filters["published"] = "true"
    if language:
        filters["language"] = language
    items = await sb_select("news", filters=filters, order="created_at.desc", limit=200)
    result = []
    for it in items:
        result.append(NewsOut(
            id=str(it["id"]),
            title=it["title"],
            slug=it["slug"],
            excerpt=it["excerpt"],
            body=it["body"],
            category=it.get("category", "Press Release"),
            cover_image=it.get("cover_image"),
            published=it.get("published", True),
            language=it.get("language", "en"),
            created_at=fmt_ts(it.get("created_at")),
            updated_at=fmt_ts(it.get("updated_at")),
        ))
    return result


@api_router.get("/news/{slug}", response_model=NewsOut)
async def get_news(slug: str):
    item = await sb_select_one("news", {"slug": slug})
    if not item:
        raise HTTPException(404, "Not found")
    return NewsOut(
        id=str(item["id"]),
        title=item["title"],
        slug=item["slug"],
        excerpt=item["excerpt"],
        body=item["body"],
        category=item.get("category", "Press Release"),
        cover_image=item.get("cover_image"),
        published=item.get("published", True),
        language=item.get("language", "en"),
        created_at=fmt_ts(item.get("created_at")),
        updated_at=fmt_ts(item.get("updated_at")),
    )


@api_router.post("/news", response_model=NewsOut, dependencies=[Depends(require_admin)])
async def create_news(payload: NewsIn):
    slug = payload.slug or slugify(payload.title)
    existing = await sb_select_one("news", {"slug": slug})
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
    row = {
        "title": payload.title,
        "slug": slug,
        "excerpt": payload.excerpt,
        "body": payload.body,
        "category": payload.category,
        "cover_image": payload.cover_image,
        "published": payload.published,
        "language": payload.language,
    }
    inserted = await sb_insert("news", row)
    return NewsOut(
        id=str(inserted["id"]),
        title=inserted["title"],
        slug=inserted["slug"],
        excerpt=inserted["excerpt"],
        body=inserted["body"],
        category=inserted.get("category", "Press Release"),
        cover_image=inserted.get("cover_image"),
        published=inserted.get("published", True),
        language=inserted.get("language", "en"),
        created_at=fmt_ts(inserted.get("created_at")),
        updated_at=fmt_ts(inserted.get("updated_at")),
    )


@api_router.put("/news/{news_id}", response_model=NewsOut, dependencies=[Depends(require_admin)])
async def update_news(news_id: str, payload: NewsIn):
    existing = await sb_select_one("news", {"id": news_id})
    if not existing:
        raise HTTPException(404, "Not found")
    update = payload.model_dump(exclude_unset=True)
    if "slug" in update and not update["slug"]:
        update["slug"] = slugify(payload.title)
    update["updated_at"] = now_iso()
    updated = await sb_update("news", news_id, update)
    if not updated:
        raise HTTPException(404, "Not found")
    return NewsOut(
        id=str(updated["id"]),
        title=updated["title"],
        slug=updated["slug"],
        excerpt=updated["excerpt"],
        body=updated["body"],
        category=updated.get("category", "Press Release"),
        cover_image=updated.get("cover_image"),
        published=updated.get("published", True),
        language=updated.get("language", "en"),
        created_at=fmt_ts(updated.get("created_at")),
        updated_at=fmt_ts(updated.get("updated_at")),
    )


@api_router.delete("/news/{news_id}", dependencies=[Depends(require_admin)])
async def delete_news(news_id: str):
    await sb_delete("news", news_id)
    return {"ok": True}


@api_router.post("/admin/verify", dependencies=[Depends(require_admin)])
async def admin_verify():
    return {"ok": True}


# ============ AUTH & USER MANAGEMENT (multi-user CMS) ============

class LoginIn(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    active: bool
    created_at: Optional[str] = None


class UserIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=8, max_length=200)
    role: str = "editor"
    active: bool = True


class UserUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    name: Optional[str] = Field(None, min_length=1, max_length=120)
    role: Optional[str] = None
    active: Optional[bool] = None
    password: Optional[str] = Field(None, min_length=8, max_length=200)


def _user_to_out(it: dict) -> UserOut:
    return UserOut(
        id=str(it["id"]), name=it["name"], email=it["email"],
        role=it.get("role", "editor"), active=bool(it.get("active", True)),
        created_at=fmt_ts(it.get("created_at")),
    )


async def _seed_superadmin_if_empty():
    """Create the super admin from env when the admin_users table is empty."""
    users = await sb_select("admin_users", limit=1, svc=True)
    if users:
        return
    if not SUPER_ADMIN_EMAIL or not SUPER_ADMIN_PASSWORD:
        logger.warning("admin_users empty and SUPER_ADMIN_* env not set — cannot seed")
        return
    row = {
        "name": "Super Admin",
        "email": SUPER_ADMIN_EMAIL.strip().lower(),
        "password_hash": hash_password(SUPER_ADMIN_PASSWORD),
        "role": "superadmin",
        "active": True,
    }
    await sb_insert("admin_users", row, svc=True)
    logger.info(f"Seeded super admin: {SUPER_ADMIN_EMAIL}")


LOGIN_MAX_FAILS = 5
LOGIN_LOCK = timedelta(minutes=15)
_attempts_db = AsyncIOMotorClient(os.environ["MONGO_URL"])[os.environ["DB_NAME"]].login_attempts


def _client_ip(request: Request) -> str:
    fwd = request.headers.get("x-forwarded-for", "")
    return fwd.split(",")[0].strip() or (request.client.host if request.client else "unknown")


async def _login_locked(ident: str) -> Optional[int]:
    """Minutes left if this ip:email is locked out, else None. Fails open if the attempts store is down."""
    try:
        doc = await _attempts_db.find_one({"identifier": ident})
    except Exception as e:  # noqa: BLE001
        logger.warning(f"login_attempts unavailable: {e}")
        return None
    until = doc and doc.get("locked_until")
    if until and until.replace(tzinfo=timezone.utc) > datetime.now(timezone.utc):
        return max(1, int((until.replace(tzinfo=timezone.utc) - datetime.now(timezone.utc)).total_seconds() // 60) + 1)
    return None


async def _record_login_fail(ident: str):
    now = datetime.now(timezone.utc)
    try:
        doc = await _attempts_db.find_one({"identifier": ident}) or {}
        expired = doc.get("locked_until") and doc["locked_until"].replace(tzinfo=timezone.utc) <= now
        count = 1 if expired else doc.get("count", 0) + 1
        upd = {"identifier": ident, "count": count, "last_failed": now, "expires_at": now + LOGIN_LOCK,
               "locked_until": now + LOGIN_LOCK if count >= LOGIN_MAX_FAILS else None}
        await _attempts_db.update_one({"identifier": ident}, {"$set": upd}, upsert=True)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"login_attempts unavailable: {e}")


@api_router.post("/auth/login")
async def auth_login(payload: LoginIn, request: Request):
    await _seed_superadmin_if_empty()
    email = payload.email.strip().lower()
    ident = f"{_client_ip(request)}:{email}"
    mins = await _login_locked(ident)
    if mins:
        raise HTTPException(status_code=429, detail=f"Too many failed attempts. Try again in {mins} minute(s).")
    user = await sb_select_one("admin_users", {"email": email}, svc=True)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        await _record_login_fail(ident)
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    try:
        await _attempts_db.delete_one({"identifier": ident})
    except Exception:  # noqa: BLE001
        pass
    return {"token": create_token(user), "user": _user_to_out(user).model_dump()}


@api_router.get("/auth/me")
async def auth_me(payload: dict = Depends(require_admin)):
    return {"sub": payload.get("sub"), "name": payload.get("name"), "email": payload.get("email"), "role": payload.get("role"), "legacy": payload.get("legacy", False)}


@api_router.get("/auth/users", response_model=List[UserOut], dependencies=[Depends(require_superadmin)])
async def list_users():
    users = await sb_select("admin_users", order="created_at.asc", limit=500, svc=True)
    return [_user_to_out(u) for u in users]


@api_router.post("/auth/users", response_model=UserOut, dependencies=[Depends(require_superadmin)])
async def create_user(payload: UserIn):
    email = payload.email.strip().lower()
    existing = await sb_select_one("admin_users", {"email": email}, svc=True)
    if existing:
        raise HTTPException(status_code=409, detail="Email already registered")
    if payload.role not in ("superadmin", "editor"):
        raise HTTPException(status_code=400, detail="Role must be 'superadmin' or 'editor'")
    row = {
        "name": payload.name.strip(), "email": email,
        "password_hash": hash_password(payload.password),
        "role": payload.role, "active": payload.active,
    }
    created = await sb_insert("admin_users", row, svc=True)
    return _user_to_out(created)


@api_router.put("/auth/users/{user_id}", response_model=UserOut, dependencies=[Depends(require_superadmin)])
async def update_user(user_id: str, payload: UserUpdate):
    existing = await sb_select_one("admin_users", {"id": user_id}, svc=True)
    if not existing:
        raise HTTPException(404, "User not found")
    update = {"updated_at": now_iso()}
    if payload.name is not None:
        update["name"] = payload.name.strip()
    if payload.role is not None:
        if payload.role not in ("superadmin", "editor"):
            raise HTTPException(400, "Role must be 'superadmin' or 'editor'")
        update["role"] = payload.role
    if payload.active is not None:
        update["active"] = payload.active
    if payload.password:
        update["password_hash"] = hash_password(payload.password)
    updated = await sb_update("admin_users", user_id, update, svc=True)
    if not updated:
        raise HTTPException(404, "User not found")
    return _user_to_out(updated)


@api_router.delete("/auth/users/{user_id}", dependencies=[Depends(require_superadmin)])
async def delete_user(user_id: str, payload: dict = Depends(require_superadmin)):
    if str(user_id) == str(payload.get("sub")):
        raise HTTPException(400, "You cannot delete your own account")
    existing = await sb_select_one("admin_users", {"id": user_id}, svc=True)
    if not existing:
        raise HTTPException(404, "User not found")
    await sb_delete("admin_users", user_id, svc=True)
    return {"ok": True}


# ---- Locations CMS ----
@api_router.get("/locations", response_model=List[LocationOut])
async def list_locations(published_only: bool = True):
    filters = {}
    if published_only:
        filters["published"] = "true"
    items = await sb_select("locations", filters=filters, order="order.asc", limit=200)
    return [_loc_out(it) for it in items]


@api_router.post("/locations", response_model=LocationOut, dependencies=[Depends(require_admin)])
async def create_location(payload: LocationIn):
    row = {
        "city": payload.city,
        "country": payload.country,
        "role": payload.role,
        "lat": payload.lat,
        "lng": payload.lng,
        "color": payload.color or "#C86230",
        "order": payload.order or 100,
        "published": payload.published,
        "photo_url": payload.photo_url,
        "description": payload.description,
        "type": payload.type or "branch",
    }
    inserted = await sb_insert("locations", row)
    return _loc_out(inserted)


@api_router.put("/locations/{loc_id}", response_model=LocationOut, dependencies=[Depends(require_admin)])
async def update_location(loc_id: str, payload: LocationIn):
    existing = await sb_select_one("locations", {"id": loc_id})
    if not existing:
        raise HTTPException(404, "Not found")
    update = payload.model_dump(exclude_unset=True)
    updated = await sb_update("locations", loc_id, update)
    if not updated:
        raise HTTPException(404, "Not found")
    return _loc_out(updated)


@api_router.get("/geo/search", dependencies=[Depends(require_admin)])
async def geo_search(q: str, country: Optional[str] = None):
    params = {"q": q, "format": "jsonv2", "limit": 8, "addressdetails": 1, "accept-language": "en"}
    if country:
        params["countrycodes"] = country.lower()
    async with httpx.AsyncClient(timeout=10) as c:
        r = await c.get("https://nominatim.openstreetmap.org/search", params=params,
                        headers={"User-Agent": "SunjayaAsiaCMS/1.0 (admin@sunjayaasia.com)"})
    if r.status_code != 200:
        raise HTTPException(502, "Geocoding service unavailable")
    out = []
    for it in r.json():
        addr = it.get("address", {})
        city = addr.get("city") or addr.get("town") or addr.get("municipality") or addr.get("county") or addr.get("state") or it.get("name")
        out.append({"name": it.get("name") or city, "city": city, "country": addr.get("country"),
                    "country_code": (addr.get("country_code") or "").upper(),
                    "display": it.get("display_name"), "lat": float(it["lat"]), "lng": float(it["lon"])})
    return out


@api_router.delete("/locations/{loc_id}", dependencies=[Depends(require_admin)])
async def delete_location(loc_id: str):
    await sb_delete("locations", loc_id)
    return {"ok": True}


# ============ ASSETS (image registry + Supabase Storage) ============

from urllib.parse import quote as _urlquote

ASSET_MIME_EXT = {
    "image/jpeg": ".jpg", "image/jpg": ".jpg", "image/png": ".png",
    "image/webp": ".webp", "image/gif": ".gif", "image/svg+xml": ".svg",
}
MAX_ASSET_BYTES = 20 * 1024 * 1024
MAX_IMAGE_DIM = 2560
WEBP_QUALITY = 82
SKIP_COMPRESS_BYTES = 300 * 1024
# Asset keys rendered by the public website (mirror of frontend ASSET_DB_KEYS)
SITE_ASSET_KEYS = {
    "logo", "cover", "foundation_slide", "core_slide", "future_slide", "pillars_page_banner", "pillars_page_01", "pillars_page_02", "pillars_page_03", "sti", "sac", "sae", "agi",
    "ecs", "sm", "tsn", "san", "kgi", "home_pillar_01_bg", "home_pillar_02_bg", "home_pillar_03_bg",
    "bg_business_pillars", "bg_footer", "about_banner", "about_company_history", "footer_call",
    "footer_email", "footer_instagram", "footer_linkedin",
}


def _compress_image(data: bytes, content_type: str):
    """Resize to MAX_IMAGE_DIM and re-encode as WebP; keeps original if not smaller."""
    if content_type in ("image/gif", "image/svg+xml"):
        return data, content_type, None
    from PIL import Image, ImageOps
    import io as _io
    im = Image.open(_io.BytesIO(data))
    im.load()
    im = ImageOps.exif_transpose(im)
    size = im.size
    needs_resize = max(size) > MAX_IMAGE_DIM
    if not needs_resize and len(data) <= SKIP_COMPRESS_BYTES:
        return data, content_type, size
    if needs_resize:
        im.thumbnail((MAX_IMAGE_DIM, MAX_IMAGE_DIM), Image.LANCZOS)
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    buf = _io.BytesIO()
    im.save(buf, "WEBP", quality=90 if has_alpha else WEBP_QUALITY, method=6)
    out = buf.getvalue()
    if not needs_resize and len(out) >= len(data):
        return data, content_type, size
    return out, "image/webp", im.size


def _trim_transparent(data: bytes, content_type: str) -> bytes:
    """Crop empty transparent margins so logos fill their tile."""
    if content_type in ("image/gif", "image/svg+xml"):
        return data
    try:
        from PIL import Image
        import io as _io
        im = Image.open(_io.BytesIO(data)); im.load()
        if im.mode not in ("RGBA", "LA"):
            return data
        bbox = im.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
        if not bbox or bbox == (0, 0, *im.size):
            return data
        pad = max(2, int(max(bbox[2] - bbox[0], bbox[3] - bbox[1]) * 0.02))
        bbox = (max(0, bbox[0] - pad), max(0, bbox[1] - pad), min(im.width, bbox[2] + pad), min(im.height, bbox[3] + pad))
        buf = _io.BytesIO(); im.crop(bbox).save(buf, "PNG")
        return buf.getvalue()
    except Exception:
        return data


VARIANT_WIDTHS = (640, 1280, 2560)
VARIANT_QUALITY = 88  # resized copies keep fine text (infographics) crisp
LOGO_SECTION = "home_partners"


def _variant_name(object_name: str, w: int) -> str:
    stem = object_name.rsplit(".", 1)[0]
    return f"{stem}@{w}.webp"


def _make_variants(data: bytes, content_type: str, section: str | None) -> list:
    """Smaller WebP copies for responsive srcset: 640/1280 for photos, only 640 for partner logos."""
    if content_type in ("image/gif", "image/svg+xml"):
        return []
    from PIL import Image
    import io as _io
    im = Image.open(_io.BytesIO(data)); im.load()
    has_alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if has_alpha else "RGB")
    widths = (640,) if section == LOGO_SECTION else VARIANT_WIDTHS
    out = []
    for w in widths:
        if im.width <= w:
            # largest size: still re-encode heavy non-WebP originals at native width
            if w == widths[-1] and len(widths) > 1 and len(data) > 1024 * 1024:
                buf = _io.BytesIO(); im.save(buf, "WEBP", quality=90 if has_alpha else WEBP_QUALITY, method=6)
                if len(buf.getvalue()) < len(data):
                    out.append((im.width, buf.getvalue()))
            continue
        v = im.copy(); v.thumbnail((w, 100000), Image.LANCZOS)
        buf = _io.BytesIO(); v.save(buf, "WEBP", quality=90 if has_alpha else VARIANT_QUALITY, method=6)
        out.append((w, buf.getvalue()))
    return out


async def _put_object(c: httpx.AsyncClient, object_name: str, data: bytes, content_type: str):
    up = await c.post(
        f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{_urlquote(object_name, safe='')}",
        headers={**{k: v for k, v in SB_SERVICE_HEADERS.items() if k != "Content-Type"},
                 "Content-Type": content_type, "x-upsert": "true", "Cache-Control": "public, max-age=31536000"},
        content=data,
    )
    if up.status_code >= 300:
        raise HTTPException(502, f"Storage upload failed: {up.text[:200]}")


async def _upload_variants(c: httpx.AsyncClient, object_name: str, data: bytes, content_type: str, section: str | None) -> list:
    variants = []
    for w, vdata in _make_variants(data, content_type, section):
        name = _variant_name(object_name, w)
        await _put_object(c, name, vdata, "image/webp")
        variants.append({"w": w, "url": _asset_public_url(name)})
    return variants


async def _asset_usage() -> set:
    """URLs referenced by news covers and location photos."""
    urls = set()
    for table, col in (("news", "cover_image"), ("locations", "photo_url")):
        try:
            for it in await sb_select(table, limit=1000):
                if it.get(col):
                    urls.add(it[col])
        except Exception:
            pass
    return urls


class AssetOut(BaseModel):
    id: str
    key: str
    url: str
    alt: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    section: Optional[str] = "other"
    sort_order: Optional[int] = 100
    focal_x: Optional[float] = 50.0
    focal_y: Optional[float] = 50.0
    zoom: Optional[float] = 1.0
    created_at: Optional[str] = None
    updated_at: Optional[str] = None
    in_use: bool = False
    meta: Optional[dict] = {}


class AssetMetaIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    alt: Optional[str] = None
    section: Optional[str] = None
    sort_order: Optional[int] = None
    focal_x: Optional[float] = None
    focal_y: Optional[float] = None
    zoom: Optional[float] = None
    meta: Optional[dict] = None


def _asset_public_url(object_name: str) -> str:
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{_urlquote(object_name, safe='')}"


def _is_locked_key(it: dict) -> bool:
    # Subsidiary company cards can be removed from the CMS; other site slots are locked
    return it["key"] in SITE_ASSET_KEYS and (it.get("section") or "other") != "home_subsidiaries"


def _asset_row_to_out(it: dict, used_urls: set | None = None) -> AssetOut:
    return AssetOut(
        in_use=_is_locked_key(it) or it.get("url") in (used_urls or set()),
        meta=it.get("meta") or {},
        id=str(it["id"]), key=it["key"], url=it["url"], alt=it.get("alt"),
        width=it.get("width"), height=it.get("height"),
        section=it.get("section") or "other",
        sort_order=it.get("sort_order") if it.get("sort_order") is not None else 100,
        focal_x=it.get("focal_x") if it.get("focal_x") is not None else 50.0,
        focal_y=it.get("focal_y") if it.get("focal_y") is not None else 50.0,
        zoom=it.get("zoom") if it.get("zoom") is not None else 1.0,
        created_at=fmt_ts(it.get("created_at")), updated_at=fmt_ts(it.get("updated_at")),
    )


@api_router.get("/assets", response_model=List[AssetOut])
async def list_assets():
    """Public: all image assets as key -> url registry for the frontend."""
    items = await sb_select("assets", order="sort_order.asc", limit=500)
    used = await _asset_usage()
    return [_asset_row_to_out(it, used) for it in items]


@api_router.post("/assets", response_model=AssetOut, dependencies=[Depends(require_admin)])
async def upload_asset(
    file: UploadFile = File(...),
    key: str = Form(...),
    alt: Optional[str] = Form(None),
    section: Optional[str] = Form(None),
    sort_order: Optional[int] = Form(None),
):
    """Admin: upload (or replace) an image for a given asset key."""
    key = (key or "").strip()
    if not key:
        raise HTTPException(400, "Asset key is required")
    content_type = (file.content_type or "").lower()
    ext = ASSET_MIME_EXT.get(content_type)
    if not ext:
        raise HTTPException(415, "Only JPEG, PNG, WebP, GIF, SVG images are accepted")
    data = await file.read(MAX_ASSET_BYTES + 1)
    if len(data) > MAX_ASSET_BYTES:
        raise HTTPException(413, "Image exceeds 20MB limit")

    # Preserve the original filename when provided (keeps Supabase organised like the repo),
    # otherwise derive a stable name from the key.
    existing = (await sb_select("assets", filters={"key": key}, limit=1, svc=True) or [None])[0]
    width = height = None
    try:
        if (section or (existing or {}).get("section")) == "home_partners":
            data = _trim_transparent(data, content_type)
        data, content_type, dims = _compress_image(data, content_type)
        if dims:
            width, height = dims
        ext = ASSET_MIME_EXT.get(content_type, ext)
    except Exception as e:
        logger.warning(f"image compression skipped: {e}")
    orig = (file.filename or "").strip().replace("/", "_").replace("\\", "_")
    stem = orig.rsplit(".", 1)[0] if orig else key
    object_name = f"{stem}-{uuid.uuid4().hex[:8]}{ext}"  # unique: avoids overwriting/stale cache

    final_section = section or (existing or {}).get("section") or "other"
    async with httpx.AsyncClient(timeout=120) as c:
        await _put_object(c, object_name, data, content_type)
        try:
            variants = await _upload_variants(c, object_name, data, content_type, final_section)
        except Exception as e:
            logger.warning(f"variant generation skipped: {e}")
            variants = []

    public_url = _asset_public_url(object_name)
    # On replace keep the existing section / order / alt unless explicitly provided
    row = {"key": key, "url": public_url, "width": width, "height": height,
           "alt": alt if alt is not None else (existing or {}).get("alt"),
           "section": section or (existing or {}).get("section") or "other",
           "sort_order": sort_order if sort_order is not None else (existing or {}).get("sort_order", 100),
           "meta": {**((existing or {}).get("meta") or {}), "_variants": variants},
           "updated_at": now_iso()}
    url = f"{SUPABASE_URL}/rest/v1/assets?on_conflict=key"
    _cache_clear("assets")
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(url, headers={**SB_SERVICE_HEADERS,
                         "Prefer": "resolution=merge-duplicates,return=representation"}, json=row)
        if r.status_code >= 300 and "PGRST204" in r.text:
            # section/sort_order/focal columns not migrated yet — retry without them
            for f in ("section", "sort_order", "focal_x", "focal_y", "zoom", "meta"):
                row.pop(f, None)
            r = await c.post(url, headers={**SB_SERVICE_HEADERS,
                             "Prefer": "resolution=merge-duplicates,return=representation"}, json=row)
        if r.status_code >= 300:
            raise HTTPException(502, f"Asset metadata save failed: {r.text[:200]}")
        return _asset_row_to_out(r.json()[0])


@api_router.put("/assets/{asset_id}", response_model=AssetOut, dependencies=[Depends(require_admin)])
async def update_asset_meta(asset_id: str, payload: AssetMetaIn):
    """Admin: update the metadata (alt text / section / order) of an asset."""
    existing = await sb_select_one("assets", {"id": asset_id})
    if not existing:
        raise HTTPException(404, "Asset not found")
    update = {"updated_at": now_iso()}
    if payload.alt is not None:
        update["alt"] = payload.alt
    if payload.section is not None:
        update["section"] = payload.section
    if payload.sort_order is not None:
        update["sort_order"] = payload.sort_order
    if payload.meta is not None:
        sys_variants = (existing.get("meta") or {}).get("_variants")
        update["meta"] = {**payload.meta, **({"_variants": sys_variants} if sys_variants is not None else {})}
    focal = {}
    for f in ("focal_x", "focal_y", "zoom"):
        v = getattr(payload, f, None)
        if v is not None:
            focal[f] = v
    update.update(focal)
    try:
        updated = await sb_update("assets", asset_id, update)
    except httpx.HTTPStatusError as e:
        if focal and "PGRST204" in e.response.text:
            # focal columns not migrated yet — retry without them
            for f in focal:
                update.pop(f, None)
            updated = await sb_update("assets", asset_id, update)
            logger.warning("focal columns missing in assets table — saved without focal data")
        else:
            raise
    if not updated:
        raise HTTPException(404, "Asset not found")
    return _asset_row_to_out(updated)


@api_router.post("/assets/backfill-variants", dependencies=[Depends(require_admin)])
async def backfill_variants(force: bool = False, key: Optional[str] = None):
    """Admin: one-time generation of responsive variants for existing images."""
    from urllib.parse import unquote
    marker = f"/public/{SUPABASE_BUCKET}/"
    done, skipped, failed = [], 0, []
    async with httpx.AsyncClient(timeout=120) as c:
        for it in await sb_select("assets", limit=500, svc=True):
            meta = it.get("meta") or {}
            url = it.get("url") or ""
            if (key and it.get("key") != key) or (not force and "_variants" in meta) or marker not in url:
                skipped += 1
                continue
            try:
                r = await c.get(url)
                r.raise_for_status()
                ctype = (r.headers.get("content-type") or "").split(";")[0].lower()
                object_name = unquote(url.split(marker, 1)[1])
                variants = await _upload_variants(c, object_name, r.content, ctype, it.get("section"))
                await sb_update("assets", str(it["id"]), {"meta": {**meta, "_variants": variants}}, svc=True)
                done.append({"key": it["key"], "variants": [v["w"] for v in variants]})
            except Exception as e:
                failed.append({"key": it["key"], "error": str(e)[:120]})
    return {"processed": len(done), "skipped": skipped, "failed": failed, "items": done}


@api_router.delete("/assets/{asset_id}", dependencies=[Depends(require_admin)])
async def delete_asset(asset_id: str):
    """Admin: delete an asset (storage object best-effort + DB row)."""
    existing = await sb_select_one("assets", {"id": asset_id})
    if not existing:
        raise HTTPException(404, "Asset not found")
    if _is_locked_key(existing) or existing.get("url") in await _asset_usage():
        raise HTTPException(409, "This image is used on the website. Use Replace instead of deleting it.")
    # derive object name from the stored public url
    url = existing.get("url", "")
    marker = f"/public/{SUPABASE_BUCKET}/"
    if marker in url:
        from urllib.parse import unquote
        object_name = unquote(url.split(marker, 1)[1])
        storage_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{_urlquote(object_name, safe='')}"
        try:
            async with httpx.AsyncClient(timeout=30) as c:
                hdr = {k: v for k, v in SB_SERVICE_HEADERS.items() if k != "Content-Type"}
                await c.delete(storage_url, headers=hdr)
                for v in (existing.get("meta") or {}).get("_variants") or []:
                    vname = unquote(v["url"].split(marker, 1)[1])
                    await c.delete(f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{_urlquote(vname, safe='')}", headers=hdr)
        except Exception as e:
            logger.warning(f"Storage delete failed (continuing): {e}")
    await sb_delete("assets", asset_id)
    return {"ok": True}


# ============ CONTENT BLOCKS (editable text CMS) ============

class ContentOut(BaseModel):
    id: str
    key: str
    value: Optional[str] = ""
    value_id: Optional[str] = ""
    page: Optional[str] = "other"
    section: Optional[str] = "general"
    sort_order: Optional[int] = 100
    label: Optional[str] = None
    type: Optional[str] = "text"
    updated_at: Optional[str] = None


class ContentIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    key: str = Field(min_length=1, max_length=200)
    value: Optional[str] = ""
    value_id: Optional[str] = ""
    page: Optional[str] = "other"
    section: Optional[str] = "general"
    sort_order: Optional[int] = 100
    label: Optional[str] = None
    type: Optional[str] = "text"


class ContentUpdate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    value: Optional[str] = None
    value_id: Optional[str] = None
    label: Optional[str] = None
    page: Optional[str] = None
    section: Optional[str] = None
    sort_order: Optional[int] = None
    type: Optional[str] = None


def _content_to_out(it: dict) -> ContentOut:
    return ContentOut(
        id=str(it["id"]), key=it["key"], value=it.get("value") or "", value_id=it.get("value_id") or "",
        page=it.get("page") or "other", section=it.get("section") or "general",
        sort_order=it.get("sort_order") if it.get("sort_order") is not None else 100,
        label=it.get("label"), type=it.get("type") or "text",
        updated_at=fmt_ts(it.get("updated_at")),
    )


@api_router.get("/content", response_model=List[ContentOut])
async def list_content():
    """Public: all editable text blocks (key -> value) for the frontend."""
    items = await sb_select("content_blocks", order="sort_order.asc", limit=1000)
    return [_content_to_out(it) for it in items]


@api_router.post("/content", response_model=ContentOut, dependencies=[Depends(require_admin)])
async def create_content(payload: ContentIn):
    key = payload.key.strip()
    existing = await sb_select_one("content_blocks", {"key": key})
    row = {
        "key": key, "value": payload.value or "", "value_id": payload.value_id or "", "page": payload.page or "other",
        "section": payload.section or "general",
        "sort_order": payload.sort_order if payload.sort_order is not None else 100,
        "label": payload.label, "type": payload.type or "text", "updated_at": now_iso(),
    }
    if existing:
        updated = await sb_update("content_blocks", existing["id"], row)
        return _content_to_out(updated)
    created = await sb_insert("content_blocks", row)
    return _content_to_out(created)


@api_router.put("/content/{content_id}", response_model=ContentOut, dependencies=[Depends(require_admin)])
async def update_content(content_id: str, payload: ContentUpdate):
    existing = await sb_select_one("content_blocks", {"id": content_id})
    if not existing:
        raise HTTPException(404, "Content block not found")
    update = {"updated_at": now_iso()}
    for f in ("value", "value_id", "label", "page", "section", "sort_order", "type"):
        v = getattr(payload, f, None)
        if v is not None:
            update[f] = v
    updated = await sb_update("content_blocks", content_id, update)
    return _content_to_out(updated)


@api_router.delete("/content/{content_id}", dependencies=[Depends(require_admin)])
async def delete_content(content_id: str):
    existing = await sb_select_one("content_blocks", {"id": content_id})
    if not existing:
        raise HTTPException(404, "Content block not found")
    await sb_delete("content_blocks", content_id)
    return {"ok": True}


app.include_router(api_router)


@app.on_event("startup")
async def _login_attempt_indexes():
    try:
        await _attempts_db.create_index("identifier", unique=True)
        await _attempts_db.create_index("expires_at", expireAfterSeconds=0)
    except Exception as e:  # noqa: BLE001
        logger.warning(f"login_attempts index setup skipped: {e}")


SECURITY_HEADERS = {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    "Cross-Origin-Opener-Policy": "same-origin",
}


@app.middleware("http")
async def _security_headers(request: Request, call_next):
    response = await call_next(request)
    for k, v in SECURITY_HEADERS.items():
        response.headers.setdefault(k, v)
    if request.url.path.startswith("/api/auth") or request.url.path.startswith("/api/admin"):
        response.headers["Cache-Control"] = "no-store"
    return response


app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[o.strip() for o in os.environ['CORS_ORIGINS'].split(',') if o.strip()],
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Admin-Token"],
)
