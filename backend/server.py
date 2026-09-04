from fastapi import FastAPI, APIRouter, HTTPException, Header, Depends
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
import httpx
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase
SUPABASE_URL = os.environ.get("SUPABASE_URL", "")
SUPABASE_KEY = os.environ.get("SUPABASE_ANON_KEY", "")
SB_HEADERS = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
}

# Emergent Email
EMAIL_BASE_URL = "https://integrations.emergentagent.com"
EMAIL_KEY = os.environ.get("EMERGENT_EMAIL_KEY", "")
EMAIL_FROM_NAME = os.environ.get("EMAIL_FROM_NAME", "Sunjaya Asia Group")
CONTACT_RECIPIENT = os.environ.get("CONTACT_RECIPIENT", "info@sunjayaasia.com")
ADMIN_TOKEN = os.environ.get("ADMIN_TOKEN", "change-me")

app = FastAPI(title="Sunjaya Asia Group API")
api_router = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


# ============ SUPABASE HELPERS ============

async def sb_select(table: str, filters: dict | None = None, order: str | None = None, limit: int = 200) -> list:
    """Query rows from Supabase via REST API."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    if filters:
        for k, v in filters.items():
            url += f"&{k}=eq.{v}"
    if order:
        url += f"&order={order}"
    url += f"&limit={limit}"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(url, headers=SB_HEADERS)
        r.raise_for_status()
        return r.json()


async def sb_select_one(table: str, filters: dict) -> dict | None:
    """Query a single row."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*&limit=1"
    for k, v in filters.items():
        url += f"&{k}=eq.{v}"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.get(url, headers=SB_HEADERS)
        r.raise_for_status()
        data = r.json()
        return data[0] if data else None


async def sb_insert(table: str, row: dict) -> dict:
    """Insert a row and return it."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?select=*"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.post(url, headers={**SB_HEADERS, "Prefer": "return=representation"}, json=row)
        r.raise_for_status()
        return r.json()[0]


async def sb_update(table: str, row_id: str, update: dict) -> dict | None:
    """Update a row by id and return it."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}&select=*"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.patch(url, headers={**SB_HEADERS, "Prefer": "return=representation"}, json=update)
        r.raise_for_status()
        data = r.json()
        return data[0] if data else None


async def sb_delete(table: str, row_id: str) -> bool:
    """Delete a row by id."""
    url = f"{SUPABASE_URL}/rest/v1/{table}?id=eq.{row_id}"
    async with httpx.AsyncClient(timeout=30) as c:
        r = await c.delete(url, headers=SB_HEADERS)
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


def require_admin(x_admin_token: Optional[str] = Header(default=None)):
    if not x_admin_token or x_admin_token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return True


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


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)
