from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends, UploadFile, File, Form
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
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

async def sb_select(table: str, filters: dict | None = None, order: str | None = None, limit: int = 200, svc: bool = False) -> list:
    """Query rows from Supabase via REST API. svc=True uses the service-role key."""
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
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(url, headers={**hdrs, "Prefer": "return=representation"}, json=row)
        r.raise_for_status()
        return r.json()[0]


async def sb_update(table: str, row_id: str, update: dict, svc: bool = False) -> dict | None:
    """Update a row by id and return it."""
    hdrs = SB_SERVICE_HEADERS if svc else SB_HEADERS
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}&select=*"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.patch(url, headers={**hdrs, "Prefer": "return=representation"}, json=update)
        r.raise_for_status()
        data = r.json()
        return data[0] if data else None


async def sb_delete(table: str, row_id: str, svc: bool = False) -> bool:
    """Delete a row by id."""
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


@api_router.post("/auth/login")
async def auth_login(payload: LoginIn):
    await _seed_superadmin_if_empty()
    user = await sb_select_one("admin_users", {"email": payload.email.strip().lower()}, svc=True)
    if not user or not verify_password(payload.password, user.get("password_hash", "")):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
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
    result = []
    for it in items:
        result.append(LocationOut(
            id=str(it["id"]),
            city=it["city"],
            country=it["country"],
            role=it["role"],
            lat=it["lat"],
            lng=it["lng"],
            color=it.get("color", "#C86230"),
            order=it.get("order", 100),
            published=it.get("published", True),
            created_at=fmt_ts(it.get("created_at")),
            photo_url=it.get("photo_url"),
            description=it.get("description"),
        ))
    return result


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
    }
    inserted = await sb_insert("locations", row)
    return LocationOut(
        id=str(inserted["id"]),
        city=inserted["city"],
        country=inserted["country"],
        role=inserted["role"],
        lat=inserted["lat"],
        lng=inserted["lng"],
        color=inserted.get("color", "#C86230"),
        order=inserted.get("order", 100),
        published=inserted.get("published", True),
        created_at=fmt_ts(inserted.get("created_at")),
        photo_url=inserted.get("photo_url"),
        description=inserted.get("description"),
    )


@api_router.put("/locations/{loc_id}", response_model=LocationOut, dependencies=[Depends(require_admin)])
async def update_location(loc_id: str, payload: LocationIn):
    existing = await sb_select_one("locations", {"id": loc_id})
    if not existing:
        raise HTTPException(404, "Not found")
    update = payload.model_dump(exclude_unset=True)
    updated = await sb_update("locations", loc_id, update)
    if not updated:
        raise HTTPException(404, "Not found")
    return LocationOut(
        id=str(updated["id"]),
        city=updated["city"],
        country=updated["country"],
        role=updated["role"],
        lat=updated["lat"],
        lng=updated["lng"],
        color=updated.get("color", "#C86230"),
        order=updated.get("order", 100),
        published=updated.get("published", True),
        created_at=fmt_ts(updated.get("created_at")),
        photo_url=updated.get("photo_url"),
        description=updated.get("description"),
    )


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


class AssetMetaIn(BaseModel):
    model_config = ConfigDict(extra="ignore")
    alt: Optional[str] = None
    section: Optional[str] = None
    sort_order: Optional[int] = None
    focal_x: Optional[float] = None
    focal_y: Optional[float] = None
    zoom: Optional[float] = None


def _asset_public_url(object_name: str) -> str:
    return f"{SUPABASE_URL}/storage/v1/object/public/{SUPABASE_BUCKET}/{_urlquote(object_name, safe='')}"


def _asset_row_to_out(it: dict) -> AssetOut:
    return AssetOut(
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
    return [_asset_row_to_out(it) for it in items]


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
    orig = (file.filename or "").strip().replace("/", "_").replace("\\", "_")
    object_name = orig if orig else f"{key}{ext}"

    width = height = None
    try:
        from PIL import Image, ImageFile
        import io as _io
        ImageFile.LOAD_TRUNCATED_IMAGES = True
        im = Image.open(_io.BytesIO(data)); im.load()
        width, height = im.size
    except Exception:
        pass

    storage_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{_urlquote(object_name, safe='')}"
    async with httpx.AsyncClient(timeout=120) as c:
        up = await c.post(
            storage_url,
            headers={**{k: v for k, v in SB_SERVICE_HEADERS.items() if k != "Content-Type"},
                     "Content-Type": content_type, "x-upsert": "true",
                     "Cache-Control": "public, max-age=31536000"},
            content=data,
        )
        if up.status_code >= 300:
            raise HTTPException(502, f"Storage upload failed: {up.text[:200]}")

    public_url = _asset_public_url(object_name)
    row = {"key": key, "url": public_url, "alt": alt, "width": width, "height": height,
           "section": (section or "other"), "sort_order": sort_order if sort_order is not None else 100,
           "updated_at": now_iso()}
    url = f"{SUPABASE_URL}/rest/v1/assets?on_conflict=key"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(url, headers={**SB_SERVICE_HEADERS,
                         "Prefer": "resolution=merge-duplicates,return=representation"}, json=row)
        if r.status_code >= 300 and "PGRST204" in r.text:
            # section/sort_order/focal columns not migrated yet — retry without them
            for f in ("section", "sort_order", "focal_x", "focal_y", "zoom"):
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
    update = {"alt": payload.alt, "updated_at": now_iso()}
    if payload.section is not None:
        update["section"] = payload.section
    if payload.sort_order is not None:
        update["sort_order"] = payload.sort_order
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


@api_router.delete("/assets/{asset_id}", dependencies=[Depends(require_admin)])
async def delete_asset(asset_id: str):
    """Admin: delete an asset (storage object best-effort + DB row)."""
    existing = await sb_select_one("assets", {"id": asset_id})
    if not existing:
        raise HTTPException(404, "Asset not found")
    # derive object name from the stored public url
    url = existing.get("url", "")
    marker = f"/public/{SUPABASE_BUCKET}/"
    if marker in url:
        from urllib.parse import unquote
        object_name = unquote(url.split(marker, 1)[1])
        storage_url = f"{SUPABASE_URL}/storage/v1/object/{SUPABASE_BUCKET}/{_urlquote(object_name, safe='')}"
        try:
            async with httpx.AsyncClient(timeout=30) as c:
                await c.delete(storage_url, headers={k: v for k, v in SB_SERVICE_HEADERS.items() if k != "Content-Type"})
        except Exception as e:
            logger.warning(f"Storage delete failed (continuing): {e}")
    await sb_delete("assets", asset_id)
    return {"ok": True}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
