import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";
import { LocationsPanel } from "../components/admin/LocationsPanel";
import { ContentPanel } from "../components/admin/ContentPanel";
import { SUBSIDIARIES } from "../data/content";
import { PARTNER_CATEGORIES, LOGO_TONES, LogoImg } from "../components/home/PartnersSection";
import { BulkLogoUpload } from "../components/admin/BulkLogoUpload";
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, useSortable, rectSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { toCdnUrl, variantUrl } from "../lib/media";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;
const TOKEN_KEY = "sunjaya_admin_token";

const errMsg = (err, fallback = "Request failed") => {
  const d = err?.response?.data?.detail;
  if (!d) return fallback;
  if (typeof d === "string") return d;
  if (Array.isArray(d)) return d.map((e) => `${(e.loc || []).join(".")}: ${e.msg}`).join(" · ");
  return fallback;
};

const emptyNews = { title: "", excerpt: "", body: "", category: "Press Release", cover_image: "", published: true, language: "en" };

export default function Admin() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState(null);
  const [tab, setTab] = useState("news");

  const client = axios.create({ baseURL: API, headers: { Authorization: token ? `Bearer ${token}` : "" } });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        const r = await client.get("/auth/me");
        setMe(r.data);
        setAuthed(true);
      } catch {
        setAuthed(false);
        setMe(null);
        localStorage.removeItem(TOKEN_KEY);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    const email = e.target.email.value.trim();
    const password = e.target.password.value;
    try {
      const r = await axios.post(`${API}/auth/login`, { email, password });
      setToken(r.data.token);
      setMe(r.data.user);
      localStorage.setItem(TOKEN_KEY, r.data.token);
      toast.success(`Welcome, ${r.data.user.name}`);
    } catch (err) {
      toast.error(errMsg(err, "Invalid email or password"));
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setMe(null);
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div data-testid="admin-login" className="pt-32 pb-24 min-h-screen">
        <Toaster theme="dark" position="bottom-right" />
        <div className="max-w-md mx-auto px-6">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">CMS Access</span>
          <h1 className="font-serif text-4xl text-bone mt-3 tracking-tight">Administrator</h1>
          <p className="mt-4 text-ash font-mono text-xs tracking-wide">Sign in with your CMS account to manage the website.</p>
          <form onSubmit={login} className="mt-8 space-y-4">
            <input name="email" type="email" required autoComplete="username" data-testid="admin-email-input" placeholder="Email" className="w-full h-12 bg-ink border border-white/15 px-4 font-mono text-sm text-bone focus:border-copper focus:outline-none" />
            <input name="password" type="password" required autoComplete="current-password" data-testid="admin-token-input" placeholder="Password" className="w-full h-12 bg-ink border border-white/15 px-4 font-mono text-sm text-bone focus:border-copper focus:outline-none" />
            <button type="submit" data-testid="admin-login-submit" className="w-full h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.24em] uppercase hover:bg-copper-hi transition-colors">Sign in</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="admin-page" className="pt-32 pb-24">
      <Toaster theme="dark" position="bottom-right" />
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">CMS</span>
            <h1 className="font-serif text-5xl text-bone mt-2 tracking-tight">Content Management</h1>
            {me && <p className="mt-2 font-mono text-[10px] tracking-[0.18em] uppercase text-ash" data-testid="admin-identity">{me.name || me.email} · {me.role}</p>}
          </div>
          <button onClick={logout} data-testid="admin-logout" className="h-10 px-4 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">Sign out</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-px bg-white/10 border border-white/10 mb-10 w-fit flex-wrap">
          {[
            { k: "news", label: "News" },
            { k: "locations", label: "Locations" },
            { k: "images", label: "Images" },
            { k: "content", label: "Content" },
            { k: "inquiries", label: "Inquiries" },
            ...(me?.role === "superadmin" ? [{ k: "users", label: "Users" }] : []),
          ].map((tb) => (
            <button
              key={tb.k}
              onClick={() => setTab(tb.k)}
              data-testid={`admin-tab-${tb.k}`}
              className={`h-11 px-6 font-mono text-[10px] tracking-[0.22em] uppercase transition-colors ${
                tab === tb.k ? "bg-copper text-obsidian" : "bg-obsidian text-ash hover:text-bone"
              }`}
            >
              {tb.label}
            </button>
          ))}
        </div>

        {tab === "news" && <NewsPanel client={client} />}
        {tab === "locations" && <LocationsPanel client={client} />}
        {tab === "images" && <ImagesPanel client={client} />}
        {tab === "content" && <ContentPanel client={client} />}
        {tab === "inquiries" && <InquiriesPanel client={client} />}
        {tab === "users" && me?.role === "superadmin" && <UsersPanel client={client} me={me} />}
      </div>
    </div>
  );
}

/* ================= USERS (superadmin only) ================= */
const UsersPanel = ({ client, me }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "editor" });
  const [saving, setSaving] = useState(false);
  const [resetId, setResetId] = useState(null);
  const [resetPw, setResetPw] = useState("");

  const refresh = async () => {
    try {
      const r = await client.get("/auth/users");
      setItems(r.data || []);
    } catch (e) {
      toast.error(errMsg(e, "Failed to load users"));
    }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const addUser = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await client.post("/auth/users", form);
      toast.success(`User "${form.email}" created`);
      setForm({ name: "", email: "", password: "", role: "editor" });
      await refresh();
    } catch (err) {
      toast.error(errMsg(err, "Failed to create user"));
    } finally {
      setSaving(false);
    }
  };

  const patchUser = async (id, update, msg) => {
    try {
      await client.put(`/auth/users/${id}`, update);
      toast.success(msg);
      await refresh();
    } catch (e) {
      toast.error(errMsg(e, "Update failed"));
    }
  };

  const removeUser = async (u) => {
    if (!window.confirm(`Delete user "${u.email}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/auth/users/${u.id}`);
      toast.success("User deleted");
      await refresh();
    } catch (e) {
      toast.error(errMsg(e, "Delete failed"));
    }
  };

  const inputCls = "h-10 bg-obsidian border border-white/15 px-3 font-mono text-sm text-bone focus:border-copper focus:outline-none";

  return (
    <div data-testid="users-panel">
      {/* Add user */}
      <form onSubmit={addUser} className="bg-ink border border-white/10 p-5 mb-8 grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Name</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} data-testid="new-user-name" placeholder="Full name" className={`w-full ${inputCls}`} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Email</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} data-testid="new-user-email" placeholder="user@sunjayaasia.com" className={`w-full ${inputCls}`} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Password (min 8)</label>
          <input required type="password" minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} data-testid="new-user-password" placeholder="••••••••" className={`w-full ${inputCls}`} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Role</label>
          <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} data-testid="new-user-role" className={`w-full ${inputCls}`}>
            <option value="editor">Editor</option>
            <option value="superadmin">Super Admin</option>
          </select>
        </div>
        <button type="submit" disabled={saving} data-testid="new-user-submit"
          className="h-10 px-6 bg-copper text-obsidian font-mono text-[10px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">
          {saving ? "Adding…" : "Add user"}
        </button>
      </form>

      {/* Users table */}
      <div className="border border-white/10">
        <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-ink font-mono text-[9px] tracking-[0.2em] uppercase text-ash">
          <div className="col-span-3">Name</div>
          <div className="col-span-3">Email</div>
          <div className="col-span-2">Role</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>
        {items.map((u) => (
          <div key={u.id} data-testid={`user-row-${u.email}`} className="grid grid-cols-12 gap-2 px-4 py-3 border-t border-white/10 items-center">
            <div className="col-span-3 text-sm text-bone font-mono">{u.name}</div>
            <div className="col-span-3 text-xs text-ash font-mono break-all">{u.email}</div>
            <div className="col-span-2">
              <span className={`font-mono text-[9px] tracking-[0.18em] uppercase px-2 py-1 border ${u.role === "superadmin" ? "border-copper/40 text-copper" : "border-white/15 text-ash"}`}>{u.role}</span>
            </div>
            <div className="col-span-1">
              <span className={`font-mono text-[9px] tracking-[0.18em] uppercase ${u.active ? "text-green-400" : "text-red-400"}`}>{u.active ? "Active" : "Off"}</span>
            </div>
            <div className="col-span-3 flex justify-end gap-2 flex-wrap">
              <button onClick={() => patchUser(u.id, { active: !u.active }, u.active ? "User deactivated" : "User activated")}
                data-testid={`user-toggle-${u.email}`}
                className="h-8 px-3 border border-white/15 font-mono text-[9px] tracking-[0.15em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">
                {u.active ? "Deactivate" : "Activate"}
              </button>
              <button onClick={() => patchUser(u.id, { role: u.role === "superadmin" ? "editor" : "superadmin" }, "Role updated")}
                className="h-8 px-3 border border-white/15 font-mono text-[9px] tracking-[0.15em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">
                {u.role === "superadmin" ? "Make editor" : "Make admin"}
              </button>
              {resetId === u.id ? (
                <span className="flex gap-1">
                  <input type="password" minLength={8} value={resetPw} onChange={(e) => setResetPw(e.target.value)} placeholder="New password"
                    data-testid={`user-reset-input-${u.email}`}
                    className="h-8 w-32 bg-obsidian border border-white/15 px-2 font-mono text-[11px] text-bone focus:border-copper focus:outline-none" />
                  <button onClick={async () => { await patchUser(u.id, { password: resetPw }, "Password reset"); setResetId(null); setResetPw(""); }}
                    data-testid={`user-reset-submit-${u.email}`}
                    className="h-8 px-2 bg-copper text-obsidian font-mono text-[9px] uppercase">OK</button>
                  <button onClick={() => { setResetId(null); setResetPw(""); }} className="h-8 px-2 border border-white/15 text-ash font-mono text-[9px]">✕</button>
                </span>
              ) : (
                <button onClick={() => setResetId(u.id)} data-testid={`user-reset-${u.email}`}
                  className="h-8 px-3 border border-white/15 font-mono text-[9px] tracking-[0.15em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">Reset PW</button>
              )}
              {u.email !== me?.email && (
                <button onClick={() => removeUser(u)} data-testid={`user-delete-${u.email}`}
                  className="h-8 px-3 border border-red-500/30 text-red-400 font-mono text-[9px] tracking-[0.15em] uppercase hover:bg-red-500/10 transition-colors">Del</button>
              )}
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-ash font-mono text-xs px-4 py-6">No users found.</p>}
      </div>
    </div>
  );
};

/* ================= FOCAL POINT EDITOR MODAL ================= */
const FocalEditorModal = ({ asset, client, onClose, onSaved }) => {
  const [fx, setFx] = useState(asset.focal_x ?? 50);
  const [fy, setFy] = useState(asset.focal_y ?? 50);
  const [zoom, setZoom] = useState(asset.zoom ?? 1);
  const [saving, setSaving] = useState(false);
  const dragging = React.useRef(false);
  const pickerRef = React.useRef(null);

  const setFromPointer = (e) => {
    const r = pickerRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    setFx(Math.round(x * 10) / 10);
    setFy(Math.round(y * 10) / 10);
  };

  const save = async () => {
    setSaving(true);
    try {
      await client.put(`/assets/${asset.id}`, { alt: asset.alt, focal_x: fx, focal_y: fy, zoom });
      toast.success("Focal point saved — live on the site");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(errMsg(e, "Save failed"));
    } finally {
      setSaving(false);
    }
  };

  const previewStyle = {
    objectPosition: `${fx}% ${fy}%`,
    ...(zoom !== 1 ? { transform: `scale(${zoom})`, transformOrigin: `${fx}% ${fy}%` } : {}),
  };

  return (
    <div className="fixed inset-0 z-[100] bg-obsidian/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={onClose} data-testid="focal-editor-modal">
      <div className="bg-ink border border-white/15 w-full max-w-4xl max-h-[92vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div>
            <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-copper">Adjust display</span>
            <h3 className="font-mono text-sm text-bone mt-1 break-all">{asset.key}</h3>
          </div>
          <button onClick={onClose} className="h-8 w-8 border border-white/15 text-ash hover:text-copper hover:border-copper font-mono">✕</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
          {/* Focal picker — click/drag on the full image */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-2">1 · Klik / geser titik fokus pada gambar</p>
            <div
              ref={pickerRef}
              data-testid="focal-picker"
              className="relative bg-obsidian border border-white/10 cursor-crosshair select-none overflow-hidden max-h-[46vh] mx-auto"
              style={{ aspectRatio: asset.width && asset.height ? `${asset.width}/${asset.height}` : "4/3" }}
              onPointerDown={(e) => { dragging.current = true; e.target.setPointerCapture?.(e.pointerId); setFromPointer(e); }}
              onPointerMove={(e) => { if (dragging.current) setFromPointer(e); }}
              onPointerUp={() => { dragging.current = false; }}
            >
              <img src={variantUrl(asset, 1280)} alt={asset.alt || asset.key} className="w-full h-full object-contain pointer-events-none" draggable={false} />
              {/* crosshair */}
              <div className="absolute w-6 h-6 -ml-3 -mt-3 pointer-events-none" style={{ left: `${fx}%`, top: `${fy}%` }}>
                <div className="absolute inset-0 rounded-full border-2 border-copper bg-copper/20" />
                <div className="absolute left-1/2 top-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full bg-copper" />
              </div>
            </div>
            <p className="mt-2 font-mono text-[9px] text-ash">Focal: {fx.toFixed(0)}% × {fy.toFixed(0)}%</p>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mt-4 mb-2">2 · Zoom</p>
            <div className="flex items-center gap-3">
              <input type="range" min={asset.section === "home_partners" ? 0.5 : 1} max="2.5" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
                data-testid="focal-zoom" className="flex-1 accent-[#B87F3D]" />
              <span className="font-mono text-[10px] text-bone w-10">{zoom.toFixed(2)}×</span>
            </div>
          </div>

          {/* Live previews */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-2">3 · Preview hasil di slot layout</p>
            {asset.section === "home_partners" ? (
              <>
                <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Kotak logo carousel (Home)</p>
                <div data-testid="focal-logo-preview" className="relative aspect-[13/6] w-full max-w-xs bg-[#0c2635] border border-white/10 overflow-hidden">
                  <div className="absolute inset-3"><LogoImg asset={{ ...asset, focal_x: fx, focal_y: fy, zoom }} /></div>
                </div>
              </>
            ) : ["foundation_slide", "core_slide", "future_slide"].includes(asset.key) ? (<>
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Desktop — halaman Pillars (landscape 21:9, lebar penuh)</p>
              <div data-testid="focal-pillar-desktop-preview" className="relative aspect-[21/9] bg-ink border border-white/10 overflow-hidden mb-3">
                <img src={variantUrl(asset, 1280)} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
              </div>
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Mobile — halaman Pillars (16:10)</p>
              <div data-testid="focal-pillar-mobile-preview" className="relative aspect-[16/10] w-56 bg-ink border border-white/10 overflow-hidden">
                <img src={variantUrl(asset, 1280)} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
              </div>
              {asset.width && asset.height && asset.width / asset.height < 1.6 && (
                <p data-testid="focal-pillar-portrait-warning" className="mt-3 font-mono text-[9px] leading-relaxed text-copper">
                  Gambar ini belum landscape ({asset.width}×{asset.height}). Gunakan foto landscape (disarankan minimal 2560×1100) agar tidak banyak terpotong.
                </p>
              )}
            </>) : asset.key === "about_banner" ? (<>
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Desktop — About (foto 55% kiri, teks di kanan)</p>
              <div data-testid="focal-about-desktop-preview" className="relative aspect-[1920/926] bg-obsidian border border-white/10 overflow-hidden mb-3">
                <div className="absolute inset-y-0 left-0 w-[55%] overflow-hidden">
                  <img src={variantUrl(asset, 1280)} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
                </div>
                <div className="absolute left-[58%] right-[8%] top-[14%] space-y-1.5" aria-hidden="true">
                  <div className="h-1.5 w-1/2 bg-copper/80" />
                  <div className="h-1 w-3/4 bg-bone/70" />
                  {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="h-[3px] w-full bg-bone/25" style={{ marginTop: i === 0 ? 10 : undefined }} />)}
                </div>
              </div>
              <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Mobile — About (kotak 1:1)</p>
              <div data-testid="focal-about-mobile-preview" className="relative aspect-square w-40 bg-obsidian border border-white/10 overflow-hidden">
                <img src={variantUrl(asset, 1280)} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
              </div>
            </>) : (<>
            <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Kartu (4:3) — subsidiary grid</p>
            <div className="relative aspect-[4/3] bg-obsidian border border-white/10 overflow-hidden mb-3">
              <img src={variantUrl(asset, 1280)} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
            </div>
            <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Banner lebar (21:9) — hero / background</p>
            <div className="relative aspect-[21/9] bg-obsidian border border-white/10 overflow-hidden">
              <img src={variantUrl(asset, 1280)} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
            </div>
            </>)}
            <p className="mt-3 text-[10px] text-ash leading-relaxed">Bagian yang ditandai titik tembaga akan selalu terlihat di semua ukuran slot (desktop &amp; mobile).</p>
          </div>
        </div>

        <div className="flex gap-3 px-5 py-4 border-t border-white/10">
          <button onClick={save} disabled={saving} data-testid="focal-save"
            className="h-10 px-6 bg-copper text-obsidian font-mono text-[10px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">
            {saving ? "Saving…" : "Save"}
          </button>
          <button onClick={() => { setFx(50); setFy(50); setZoom(1); }} data-testid="focal-reset"
            className="h-10 px-4 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">
            Reset
          </button>
          <button onClick={onClose} className="h-10 px-4 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-ash hover:text-bone transition-colors ml-auto">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

/* ================= IMAGES (asset manager, grouped by page section) ================= */
const IMAGE_SECTIONS = [
  { id: "nav", label: "Navbar & Brand" },
  { id: "home_hero", label: "Home — Hero Cover" },
  { id: "home_pillars_intro", label: "Home — Pillars Intro Background" },
  { id: "home_pillar_sections", label: "Home — Pillar Sections (01–03)" },
  { id: "home_subsidiaries_bg", label: "Home — Subsidiaries Background" },
  { id: "home_subsidiaries", label: "Home — Subsidiaries Grid" },
  { id: "home_partners", label: "Home — Partners, Vendors & Customers Logos" },
  { id: "pillars_page", label: "Pillars Page — Slides" },
  { id: "about_page", label: "About Page" },
  { id: "footer", label: "Footer" },
  { id: "other", label: "Custom Uploads" },
];
const sectionIndex = (id) => {
  const i = IMAGE_SECTIONS.findIndex((s) => s.id === id);
  return i === -1 ? IMAGE_SECTIONS.length : i;
};
// Empty-state uploader for the optional Home Subsidiaries background
const SubsBgUpload = ({ client, onDone }) => {
  const [busy, setBusy] = useState(false);
  const upload = async (file) => {
    if (!file) return;
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("file", file); fd.append("key", "home_subsidiaries_bg"); fd.append("section", "home_subsidiaries_bg"); fd.append("sort_order", "100");
      await client.post("/assets", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Background uploaded"); await onDone();
    } catch (err) { toast.error(errMsg(err, "Upload failed")); } finally { setBusy(false); }
  };
  return (
    <label data-testid="subs-bg-upload" className="flex flex-col items-center justify-center gap-2 border border-dashed border-copper/40 bg-ink p-8 cursor-pointer hover:border-copper transition-colors">
      <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">{busy ? "Uploading…" : "Upload background image"}</span>
      <span className="font-mono text-[9px] text-ash">Opsional — tanpa gambar, section memakai warna gading. Gambar otomatis dipudarkan 60% dengan lapisan gading.</span>
      <input type="file" accept="image/*" className="hidden" disabled={busy} data-testid="subs-bg-file" onChange={(e) => upload(e.target.files?.[0])} />
    </label>
  );
};

const sectionLabel = (id) => IMAGE_SECTIONS.find((s) => s.id === id)?.label || id;

// Card slot titles: ordered by tier (branch -> subsidiary -> affiliate), then CMS sort order
const TIER_RANK = { affiliate: 1 }; // branches & subsidiaries share one numbered group; affiliates always last
const tierOf = (key) => SUBSIDIARIES.find((x) => x.id === key)?.tier;
const slotLabel = (asset, groupAssets) => {
  const ordered = [...groupAssets].sort((a, b) =>
    (TIER_RANK[tierOf(a.key)] ?? 1) - (TIER_RANK[tierOf(b.key)] ?? 1) || (a.sort_order ?? 100) - (b.sort_order ?? 100));
  const pos = ordered.findIndex((a) => a.id === asset.id);
  if (pos < 0) return asset.key;
  return tierOf(asset.key) === "affiliate"
    ? `Affiliate ${pos + 1 - ordered.filter((a) => tierOf(a.key) !== "affiliate").length}`
    : `Subsidiaries ${pos + 1}`;
};

// Editable overlay texts for subsidiary cards (stored in asset.meta)
const CARD_TEXT_FIELDS = [
  ["tag", "Tag kecil (atas)"],
  ["city", "Kota"],
  ["country", "Negara"],
  ["role", "Role / Fungsi"],
  ["name", "Nama Perusahaan (judul)"],
  ["sector", "Bidang / Sector (bawah)"],
];

const SubCardTextForm = ({ asset, inputCls, onSave }) => {
  const [showId, setShowId] = useState(() => Object.values(asset.meta || {}).some((v) => v?.id));
  const meta = asset.meta || {};
  const def = SUBSIDIARIES.find((x) => x.id === asset.key) || {};
  const cityParts = (def.city || "").split(",");
  const defaults = { tag: def.tag, city: (cityParts[0] || "").trim(), country: (cityParts[1] || "").trim(), role: def.role, name: def.name, sector: def.sector };
  const saveField = (f, lang, value) => {
    const next = { ...meta, [f]: { ...meta[f], [lang]: value } };
    if (!next[f].en && !next[f].id) delete next[f];
    onSave(next, f === "name" ? { alt: value || defaults.name || asset.key } : undefined);
  };
  return (
    <div data-testid={`subcard-form-${asset.key}`} className="border-t border-white/10 mt-1 pt-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-copper">Teks kartu</span>
        <button onClick={() => setShowId(!showId)} data-testid={`subcard-id-toggle-${asset.key}`}
          className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash hover:text-copper transition-colors">
          {showId ? "− Sembunyikan ID" : "+ Terjemahan ID"}
        </button>
      </div>
      {CARD_TEXT_FIELDS.map(([f, label]) => (
        <div key={f}>
          <label className="block font-mono text-[8px] tracking-[0.2em] uppercase text-ash/70 mb-1">{label}</label>
          <input defaultValue={meta[f]?.en || ""} placeholder={defaults[f] || ""} onBlur={(e) => saveField(f, "en", e.target.value)}
            onInput={f === "name" ? (e) => { e.target.value = e.target.value.toUpperCase(); } : undefined}
            data-testid={`subcard-input-${asset.key}-${f}`} className={inputCls} />
          {showId && (
            <input defaultValue={meta[f]?.id || ""} placeholder={`${defaults[f] || ""} (ID)`} onBlur={(e) => saveField(f, "id", e.target.value)}
              data-testid={`subcard-input-${asset.key}-${f}-id`} className={`${inputCls} mt-1 border-copper/30`} />
          )}
        </div>
      ))}
    </div>
  );
};

const AssetCard = ({ a, draggable, children }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: a.id, disabled: !draggable });
  return (
    <div ref={setNodeRef} data-testid={`asset-card-${a.key}`}
      style={{ transform: CSS.Transform.toString(transform), transition, zIndex: isDragging ? 40 : undefined }}
      className={`bg-ink border overflow-hidden flex flex-col relative ${isDragging ? "border-copper shadow-2xl" : "border-white/10"}`}>
      {draggable && (
        <button {...attributes} {...listeners} data-testid={`asset-drag-${a.key}`} title="Geser untuk mengubah urutan"
          className="absolute top-2 right-2 z-20 w-7 h-7 grid place-items-center bg-obsidian/80 border border-white/20 text-ash hover:text-copper hover:border-copper cursor-grab active:cursor-grabbing transition-colors touch-none">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><circle cx="3" cy="2.5" r="1.2"/><circle cx="9" cy="2.5" r="1.2"/><circle cx="3" cy="6" r="1.2"/><circle cx="9" cy="6" r="1.2"/><circle cx="3" cy="9.5" r="1.2"/><circle cx="9" cy="9.5" r="1.2"/></svg>
        </button>
      )}
      {children}
    </div>
  );
};

const ImagesPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const [busyKey, setBusyKey] = useState(null);
  const [newKey, setNewKey] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [newSection, setNewSection] = useState("other");
  const [uploading, setUploading] = useState(false);
  const [editing, setEditing] = useState(null); // asset being focal-edited

  const refresh = async () => {
    try {
      const r = await client.get("/assets");
      setItems(r.data || []);
    } catch (e) {
      toast.error(errMsg(e, "Failed to load images"));
    }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);

  const replaceImage = async (key, file) => {
    if (!file) return;
    setBusyKey(key);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("key", key);
      await client.post("/assets", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Updated "${key}"`);
      await refresh();
    } catch (e) {
      toast.error(errMsg(e, "Upload failed"));
    } finally {
      setBusyKey(null);
    }
  };

  const saveMeta = async (asset, patch, msg = "Saved") => {
    try {
      await client.put(`/assets/${asset.id}`, { alt: asset.alt, ...patch });
      toast.success(msg);
      await refresh();
    } catch (e) {
      toast.error(errMsg(e, "Save failed"));
    }
  };

  const remove = async (asset) => {
    if (!window.confirm(`Delete image "${asset.key}"? This cannot be undone.`)) return;
    try {
      await client.delete(`/assets/${asset.id}`);
      toast.success("Image deleted");
      await refresh();
    } catch (e) {
      toast.error(errMsg(e, "Delete failed"));
    }
  };

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const persistOrder = async (ordered) => {
    const updates = ordered.map((a, i) => ({ ...a, sort_order: i + 1 }));
    setItems((prev) => prev.map((a) => updates.find((u) => u.id === a.id) || a));
    try {
      await Promise.all(updates.map((u) => client.put(`/assets/${u.id}`, { sort_order: u.sort_order })));
      toast.success("Urutan kartu tersimpan");
      await refresh();
    } catch (e) {
      toast.error(errMsg(e, "Gagal menyimpan urutan"));
      await refresh();
    }
  };

  const onDragEnd = (e) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const act = items.find((a) => a.id === active.id);
    const sec = act?.section;
    const grp = (groups[sec] || []).filter((a) => sec !== "home_partners" || (a.meta?.category || "partner") === (act.meta?.category || "partner"));
    const from = grp.findIndex((a) => a.id === active.id);
    const to = grp.findIndex((a) => a.id === over.id);
    if (from < 0 || to < 0) return;
    persistOrder(arrayMove(grp, from, to));
  };


  const addPointer = async (num, blocks) => {
    const nums = blocks.map((b) => b.key.match(/^pillar\.\d+\.div\.(\d+)\.name$/)).filter(Boolean).map((m) => Number(m[1]));
    const next = (nums.length ? Math.max(...nums) : 0) + 1;
    const nn = String(next).padStart(2, "0");
    const maxSort = Math.max(0, ...blocks.map((b) => b.sort_order ?? 0));
    const base = `pillar.${num}.div.${nn}`;
    try {
      await client.post("/content", { key: `${base}.name`, page: "pillars", section: `pillar_${num}`, sort_order: maxSort + 10, label: `Pillar ${num}.${next} — Name`, type: "text", value: "New pointer" });
      await client.post("/content", { key: `${base}.desc`, page: "pillars", section: `pillar_${num}`, sort_order: maxSort + 20, label: `Pillar ${num}.${next} — Description`, type: "textarea", value: "" });
      toast.success(`Pointer ${num}.${next} added`);
      await refresh();
    } catch (err) { toast.error(errMsg(err, "Failed to add pointer")); }
  };

  const removePointer = async (nameBlock, blocks) => {
    const base = nameBlock.key.replace(/\.name$/, "");
    if (!window.confirm(`Delete pointer "${nameBlock.value}" (name + description)?`)) return;
    try {
      for (const b of blocks.filter((x) => x.key === `${base}.name` || x.key === `${base}.desc`)) await client.delete(`/content/${b.id}`);
      toast.success("Pointer deleted");
      await refresh();
    } catch (err) { toast.error(errMsg(err, "Delete failed")); }
  };

  const addNew = async (e) => {
    e.preventDefault();
    const autoKey = !newKey.trim() && newSection === "home_partners" ? `logo_${Date.now().toString(36)}` : newKey.trim();
    if (!autoKey || !newFile) { toast.error("Provide a key and a file"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", newFile);
      fd.append("key", autoKey);
      fd.append("section", newSection);
      // order is automatic: appended at the end of its section
      const inSection = items.filter((a) => (a.section || "other") === newSection).length;
      fd.append("sort_order", String(100 + inSection));
      await client.post("/assets", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Added "${autoKey}"`);
      setNewKey(""); setNewFile(null);
      e.target.reset();
      await refresh();
    } catch (err) {
      toast.error(errMsg(err, "Upload failed"));
    } finally {
      setUploading(false);
    }
  };

  // group by section, ordered by page order
  const groups = {};
  items.forEach((a) => {
    const s = a.section || "other";
    (groups[s] = groups[s] || []).push(a);
  });
  Object.entries(groups).forEach(([sec, arr]) => arr.sort((a, b) =>
    sec === "home_subsidiaries"
      ? (TIER_RANK[tierOf(a.key)] ?? 1) - (TIER_RANK[tierOf(b.key)] ?? 1) || (a.sort_order ?? 100) - (b.sort_order ?? 100)
      : (a.sort_order ?? 100) - (b.sort_order ?? 100) || a.key.localeCompare(b.key)));
  if (!groups.home_partners) groups.home_partners = []; // logo section always available for uploads
  if (!groups.home_subsidiaries_bg) groups.home_subsidiaries_bg = []; // optional background slot
  const catOf = (a) => a.meta?.category || "partner";
  const subGroups = (secId) => secId !== "home_partners"
    ? [{ id: null, items: groups[secId] }]
    : PARTNER_CATEGORIES.map((c, i) => ({ id: c.id, n: i + 1, label: c.label, items: groups[secId].filter((a) => catOf(a) === c.id) }));
  const orderedSections = Object.keys(groups).sort((a, b) => sectionIndex(a) - sectionIndex(b) || a.localeCompare(b));

  const inputCls = "w-full h-8 bg-obsidian border border-white/15 px-2 font-mono text-[11px] text-bone focus:border-copper focus:outline-none";

  return (
    <div data-testid="images-panel">
      {/* Add new asset */}
      <form onSubmit={addNew} className={`bg-ink border border-white/10 p-5 mb-10 grid grid-cols-1 gap-4 items-end ${newSection === "home_partners" ? "md:grid-cols-3" : "md:grid-cols-4"}`}>
        {newSection === "home_partners" ? null : (
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">New asset key</label>
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. home_new_banner"
            data-testid="new-asset-key" className={`${inputCls} h-10`} />
        </div>
        )}
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Section</label>
          <select value={newSection} onChange={(e) => setNewSection(e.target.value)} data-testid="new-asset-section" className={`${inputCls} h-10`}>
            {IMAGE_SECTIONS.filter((s) => s.id !== "home_partners").map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
        {newSection === "home_partners" ? (
          <BulkLogoUpload client={client} existingCount={items.filter((a) => a.section === "home_partners").length} onDone={refresh} />
        ) : (<>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Image file</label>
          <input type="file" accept="image/*" onChange={(e) => setNewFile(e.target.files?.[0] || null)}
            data-testid="new-asset-file"
            className="w-full text-xs text-ash file:mr-3 file:py-2 file:px-3 file:border-0 file:bg-copper file:text-obsidian file:font-mono file:text-[10px] file:uppercase file:tracking-wider" />
        </div>
        <button type="submit" disabled={uploading} data-testid="new-asset-submit"
          className="h-10 px-6 bg-copper text-obsidian font-mono text-[10px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">
          {uploading ? "Uploading…" : "Add image"}
        </button>
        </>)}
      </form>

      {/* Grouped by section in page order */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} autoScroll={false} onDragEnd={onDragEnd}>
      {orderedSections.map((secId) => (
        <div key={secId} className="mb-10" data-testid={`image-section-${secId}`}>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="font-mono text-[11px] tracking-[0.24em] uppercase text-copper">{sectionLabel(secId)}</h3>
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[9px] text-ash">{groups[secId].length} image{groups[secId].length > 1 ? "s" : ""}</span>
          </div>
          {secId === "home_subsidiaries_bg" && !groups[secId].length && <SubsBgUpload client={client} onDone={refresh} />}
          {secId === "home_partners" && (
            <div className="mb-5 border border-copper/30 bg-ink p-4">
              <BulkLogoUpload client={client} existingCount={groups[secId].length} onDone={refresh} />
            </div>
          )}
          {subGroups(secId).map((sg) => (
          <div key={sg.id || "all"} className={sg.id ? "mb-6" : ""} data-testid={sg.id ? `logo-group-${sg.id}` : undefined}>
          {sg.id && (
            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-[#7FC8EE] font-bold">Kelompok {sg.n} · {sg.label}</span>
              <span className="font-mono text-[9px] text-ash">{sg.items.length} logo</span>
            </div>
          )}
          <SortableContext items={sg.items.map((a) => a.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {sg.id && sg.items.length === 0 && <p className="col-span-full font-mono text-[10px] text-ash">Belum ada logo di kelompok ini.</p>}
            {sg.items.map((a, idx) => (
              <AssetCard key={a.id} a={a} draggable={secId === "home_subsidiaries" || secId === "home_partners"}>
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  data-testid={`asset-thumb-${a.key}`}
                  title="Klik untuk preview & atur posisi crop"
                  className="relative aspect-[4/3] bg-obsidian overflow-hidden flex items-center justify-center group cursor-pointer">
                  {a.section === "home_partners"
                    ? <div className="absolute inset-8"><LogoImg asset={{ ...a, focal_x: 50, focal_y: 50, zoom: 1 }} /></div>
                    : <img src={toCdnUrl(a.url)} alt={a.alt || a.key} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />}
                  <span className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] tracking-[0.2em] uppercase text-bone border border-copper bg-obsidian/70 px-3 py-1.5">Edit crop</span>
                  </span>
                </button>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  {(a.section || "other") === "home_subsidiaries" ? (
                    <div data-testid={`asset-title-${a.key}`} className="font-mono text-[11px] text-copper tracking-wide">
                      {slotLabel(a, groups["home_subsidiaries"])}
                      {a.meta?.name?.en && <span className="text-bone"> — {a.meta.name.en}</span>}
                    </div>
                  ) : a.section === "home_partners" ? (
                    <div data-testid={`asset-title-${a.key}`} className="font-mono text-[11px] text-copper tracking-wide uppercase break-words">
                      <span className="text-ash">#{idx + 1} · </span>{a.alt || a.key}
                    </div>
                  ) : (
                    <div className="font-mono text-[11px] text-copper tracking-wide break-all">{a.key}</div>
                  )}
                  <div className="font-mono text-[9px] text-ash">
                    {a.width && a.height ? `${a.width}×${a.height}` : "—"}
                    {(a.focal_x !== 50 || a.focal_y !== 50 || (a.zoom && a.zoom !== 1)) && (
                      <span className="text-copper"> · focal {Math.round(a.focal_x ?? 50)}×{Math.round(a.focal_y ?? 50)}{a.zoom && a.zoom !== 1 ? ` · ${a.zoom}×` : ""}</span>
                    )}
                  </div>
                  {!["home_subsidiaries", "home_partners"].includes(a.section || "other") && (
                  <select
                    defaultValue={a.section || "other"}
                    onChange={(e) => saveMeta({ ...a }, { section: e.target.value }, "Section updated")}
                    title="Section"
                    className={inputCls}>
                    {IMAGE_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  )}
                  {a.section === "home_partners" && (
                    <div className="space-y-2" data-testid={`logo-form-${a.key}`}>
                      <select value={a.meta?.category || "partner"} data-testid={`logo-category-${a.key}`}
                        onChange={(e) => saveMeta({ ...a }, { meta: { ...(a.meta || {}), category: e.target.value } }, "Kategori tersimpan")} className={inputCls}>
                        {PARTNER_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
                      </select>
                      <select value={a.meta?.tone || "white"} data-testid={`logo-tone-${a.key}`}
                        onChange={(e) => saveMeta({ ...a }, { meta: { ...(a.meta || {}), tone: e.target.value } }, "Tampilan logo tersimpan")} className={inputCls}>
                        {Object.entries(LOGO_TONES).map(([id, t]) => <option key={id} value={id}>Tampilan: {t.label}</option>)}
                      </select>
                      {a.meta?.tone === "mono" && (
                        <label className="flex items-center gap-2 font-mono text-[9px] text-ash" title="Geser kiri: lebih banyak area jadi transparan. Geser kanan: lebih banyak area jadi putih.">
                          <span className="shrink-0">Ambang putih</span>
                          <input type="range" min="-30" max="30" step="2" defaultValue={Number(a.meta?.mono_adj) || 0} data-testid={`logo-mono-adj-${a.key}`} className="flex-1 accent-copper"
                            onPointerUp={(e) => saveMeta({ ...a }, { meta: { ...(a.meta || {}), mono_adj: Number(e.target.value) } }, "Ambang tersimpan")}
                            onKeyUp={(e) => saveMeta({ ...a }, { meta: { ...(a.meta || {}), mono_adj: Number(e.target.value) } }, "Ambang tersimpan")} />
                          <span className="w-6 text-right">{Number(a.meta?.mono_adj) || 0}</span>
                        </label>
                      )}
                      <input defaultValue={a.alt || ""} placeholder="Nama brand / perusahaan / instansi" data-testid={`logo-name-${a.key}`}
                        onBlur={(e) => { const v = e.target.value.toUpperCase(); if (v !== (a.alt || "")) saveMeta({ ...a }, { alt: v }, "Nama tersimpan"); }} className={`${inputCls} uppercase`} />
                    </div>
                  )}
                  {(a.section || "other") === "home_subsidiaries" && (
                    <SubCardTextForm asset={a} inputCls={inputCls} onSave={(meta, extra) => saveMeta({ ...a }, { meta, ...extra }, "Teks kartu tersimpan")} />
                  )}
                  <div className="flex gap-2 mt-auto pt-1">
                    <label className={`flex-1 text-center cursor-pointer h-8 leading-8 border border-white/15 font-mono text-[9px] tracking-[0.18em] uppercase ${busyKey === a.key ? "opacity-50" : "text-bone hover:border-copper hover:text-copper"} transition-colors`}>
                      {busyKey === a.key ? "…" : "Replace"}
                      <input type="file" accept="image/*" data-testid={`asset-replace-${a.key}`} className="hidden" disabled={busyKey === a.key}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceImage(a.key, f); e.target.value = ""; }} />
                    </label>
                    {a.in_use ? (
                      <span data-testid={`asset-in-use-${a.key}`} title="Used on the website — use Replace instead of deleting" className="h-8 px-2 leading-8 border border-copper/40 text-copper font-mono text-[8px] tracking-[0.16em] uppercase cursor-not-allowed">Used on site</span>
                    ) : (
                      <button data-testid={`asset-delete-${a.key}`} onClick={() => remove(a)} className="h-8 px-3 border border-red-500/30 text-red-400 font-mono text-[9px] tracking-[0.18em] uppercase hover:bg-red-500/10 transition-colors">Del</button>
                    )}
                  </div>
                </div>
              </AssetCard>
            ))}
          </div>
          </SortableContext>
          </div>
          ))}
        </div>
      ))}
      </DndContext>
      {items.length === 0 && <p className="text-ash font-mono text-xs mt-6">No images yet.</p>}

      {editing && (
        <FocalEditorModal
          asset={editing}
          client={client}
          onClose={() => setEditing(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
};

/* ================= NEWS ================= */
const NEWS_TEXT_LABELS = { "news.title": "Judul halaman", "news.sub": "Sub-judul", "news.empty": "Pesan saat kosong", "news.read": "Tombol baca", "news.back": "Tombol kembali" };

// Static texts of the News page, edited here instead of the Content tab
const NewsPageTexts = ({ client }) => {
  const [blocks, setBlocks] = useState([]);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    client.get("/content").then((r) => setBlocks((r.data || []).filter((b) => b.page === "news"))).catch(() => {});
  }, [client]);
  const save = async (b, field, value) => {
    if (value === (b[field] || "")) return;
    try {
      await client.put(`/content/${b.id}`, { [field]: value });
      setBlocks((prev) => prev.map((x) => (x.id === b.id ? { ...x, [field]: value } : x)));
      toast.success("Teks tersimpan");
    } catch (e) { toast.error(errMsg(e, "Gagal menyimpan")); }
  };
  if (!blocks.length) return null;
  const cls = "w-full h-10 bg-obsidian border border-white/15 px-3 font-mono text-xs text-bone focus:border-copper focus:outline-none";
  return (
    <div data-testid="news-page-texts" className="lg:col-span-12 border border-white/10 bg-ink">
      <button onClick={() => setOpen(!open)} data-testid="news-page-texts-toggle"
        className="w-full flex items-center justify-between px-6 py-4 font-mono text-[10px] tracking-[0.24em] uppercase text-copper hover:bg-white/5 transition-colors">
        Teks Halaman News <span className="text-ash">{open ? "−" : "+"}</span>
      </button>
      {open && (
        <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {blocks.map((b) => (
            <div key={b.id}>
              <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">{NEWS_TEXT_LABELS[b.key] || b.label || b.key}</label>
              <div className="grid grid-cols-2 gap-2">
                <input defaultValue={b.value || ""} placeholder="EN" onBlur={(e) => save(b, "value", e.target.value)} data-testid={`news-text-${b.key}`} className={cls} />
                <input defaultValue={b.value_id || ""} placeholder="ID" onBlur={(e) => save(b, "value_id", e.target.value)} data-testid={`news-text-${b.key}-id`} className={cls} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const NewsPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyNews);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await axios.get(`${API}/news`, { params: { published_only: false } });
    setItems(r.data || []);
  };

  useEffect(() => { refresh(); }, []);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) {
        await client.put(`/news/${editingId}`, form);
        toast.success("Article updated");
      } else {
        await client.post("/news", form);
        toast.success("Article published");
      }
      setForm(emptyNews);
      setEditingId(null);
      await refresh();
    } catch (err) {
      toast.error(err?.response?.data?.detail || "Save failed");
    } finally {
      setBusy(false);
    }
  };

  const edit = (n) => {
    setEditingId(n.id);
    setForm({ title: n.title, excerpt: n.excerpt, body: n.body, category: n.category, cover_image: n.cover_image || "", published: n.published, language: n.language });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const del = async (id) => {
    if (!window.confirm("Delete this article?")) return;
    try { await client.delete(`/news/${id}`); toast.success("Deleted"); await refresh(); }
    catch { toast.error("Delete failed"); }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <NewsPageTexts client={client} />
      <form onSubmit={save} data-testid="admin-form" className="lg:col-span-5 border border-white/10 p-8 bg-ink space-y-4 h-fit sticky top-24">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">{editingId ? "Edit Article" : "New Article"}</div>
        <Field label="Title" value={form.title} onChange={upd("title")} required id="title" />
        <Field label="Excerpt" value={form.excerpt} onChange={upd("excerpt")} required id="excerpt" />
        <Field label="Category" value={form.category} onChange={upd("category")} id="category" />
        <Field label="Cover image URL" value={form.cover_image} onChange={upd("cover_image")} id="cover" />
        <div>
          <label className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">Language</label>
          <select value={form.language} onChange={upd("language")} className="w-full h-11 bg-obsidian border border-white/15 px-3 font-mono text-sm text-bone focus:border-copper focus:outline-none">
            <option value="en">English</option>
            <option value="id">Bahasa Indonesia</option>
          </select>
        </div>
        <div>
          <label className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">Body</label>
          <textarea value={form.body} onChange={upd("body")} rows={10} required data-testid="admin-body" className="w-full bg-obsidian border border-white/15 px-3 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none resize-none" />
        </div>
        <label className="flex items-center gap-3 font-mono text-xs text-bone">
          <input type="checkbox" checked={form.published} onChange={upd("published")} data-testid="admin-published" /> Published
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} data-testid="admin-save" className="flex-1 h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">{editingId ? "Update" : "Publish"}</button>
          {editingId && <button type="button" onClick={() => { setForm(emptyNews); setEditingId(null); }} className="h-12 px-4 border border-white/15 font-mono text-[11px] tracking-[0.22em] uppercase text-ash">Cancel</button>}
        </div>
      </form>
      <div className="lg:col-span-7">
        <div className="border-t border-white/10">
          {items.length === 0 && <p className="py-8 font-mono text-xs text-ash">No articles yet.</p>}
          {items.map((n) => (
            <div key={n.id} className="py-6 border-b border-white/10 grid grid-cols-12 gap-4 items-start">
              <div className="col-span-8">
                <div className="flex gap-2 items-center mb-1">
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash">{n.category}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 tracking-[0.2em] ${n.published ? "bg-copper text-obsidian" : "border border-white/20 text-ash"}`}>{n.published ? "LIVE" : "DRAFT"}</span>
                  <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">{n.language}</span>
                </div>
                <h3 className="font-serif text-2xl text-bone tracking-tight leading-tight">{n.title}</h3>
                <p className="text-bone/70 text-sm mt-1">{n.excerpt}</p>
              </div>
              <div className="col-span-4 flex justify-end gap-2">
                <button onClick={() => edit(n)} className="h-9 px-3 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-bone hover:border-copper hover:text-copper transition-colors">Edit</button>
                <button onClick={() => del(n.id)} className="h-9 px-3 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-bone hover:border-destructive hover:text-destructive transition-colors">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ================= INQUIRIES ================= */
const InquiriesPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      try { const r = await client.get("/contact"); setItems(r.data || []); }
      catch { toast.error("Failed to load inquiries"); }
      finally { setLoading(false); }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <div className="font-mono text-xs text-ash">Loading…</div>;
  if (items.length === 0) return <div className="border border-white/10 p-8 font-mono text-xs text-ash">No inquiries yet.</div>;

  return (
    <div className="border-t border-white/10">
      {items.map((c) => (
        <div key={c.id} className="py-6 border-b border-white/10 grid grid-cols-12 gap-4 items-start">
          <div className="col-span-9">
            <div className="flex gap-2 items-center mb-1">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">{c.inquiry_type}</span>
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash">{new Date(c.created_at).toLocaleString()}</span>
            </div>
            <h3 className="font-serif text-xl text-bone tracking-tight">{c.subject}</h3>
            <p className="mt-1 text-bone/70 text-sm">{c.message}</p>
            <p className="mt-2 font-mono text-[11px] text-ash">
              {c.name} · <a className="text-copper" href={`mailto:${c.email}`}>{c.email}</a>{c.company ? ` · ${c.company}` : ""}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const Field = ({ label, id, ...props }) => (
  <div>
    <label htmlFor={id} className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">{label}</label>
    <input id={id} data-testid={`admin-${id}`} {...props} className="w-full h-11 bg-obsidian border border-white/15 px-3 font-mono text-sm text-bone focus:border-copper focus:outline-none" />
  </div>
);
