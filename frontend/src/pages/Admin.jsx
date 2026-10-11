import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "sonner";

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
const emptyLoc = { city: "", country: "", role: "", lat: 0, lng: 0, color: "#C86230", order: 100, published: true, photo_url: "", description: "" };

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
              <img src={asset.url} alt={asset.alt || asset.key} className="w-full h-full object-contain pointer-events-none" draggable={false} />
              {/* crosshair */}
              <div className="absolute w-6 h-6 -ml-3 -mt-3 pointer-events-none" style={{ left: `${fx}%`, top: `${fy}%` }}>
                <div className="absolute inset-0 rounded-full border-2 border-copper bg-copper/20" />
                <div className="absolute left-1/2 top-1/2 w-1 h-1 -ml-0.5 -mt-0.5 rounded-full bg-copper" />
              </div>
            </div>
            <p className="mt-2 font-mono text-[9px] text-ash">Focal: {fx.toFixed(0)}% × {fy.toFixed(0)}%</p>

            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mt-4 mb-2">2 · Zoom</p>
            <div className="flex items-center gap-3">
              <input type="range" min="1" max="2.5" step="0.05" value={zoom} onChange={(e) => setZoom(parseFloat(e.target.value))}
                data-testid="focal-zoom" className="flex-1 accent-[#B87F3D]" />
              <span className="font-mono text-[10px] text-bone w-10">{zoom.toFixed(2)}×</span>
            </div>
          </div>

          {/* Live previews */}
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-2">3 · Preview hasil di slot layout</p>
            <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Kartu (4:3) — subsidiary grid</p>
            <div className="relative aspect-[4/3] bg-obsidian border border-white/10 overflow-hidden mb-3">
              <img src={asset.url} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
            </div>
            <p className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash/70 mb-1">Banner lebar (21:9) — hero / background</p>
            <div className="relative aspect-[21/9] bg-obsidian border border-white/10 overflow-hidden">
              <img src={asset.url} alt="" className="absolute inset-0 w-full h-full object-cover" style={previewStyle} draggable={false} />
            </div>
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
  { id: "home_subsidiaries", label: "Home — Subsidiaries Grid" },
  { id: "pillars_page", label: "Pillars Page — Slides" },
  { id: "about_page", label: "About Page" },
  { id: "footer", label: "Footer" },
  { id: "other", label: "Custom Uploads" },
];
const sectionIndex = (id) => {
  const i = IMAGE_SECTIONS.findIndex((s) => s.id === id);
  return i === -1 ? IMAGE_SECTIONS.length : i;
};
const sectionLabel = (id) => IMAGE_SECTIONS.find((s) => s.id === id)?.label || id;

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

  const addNew = async (e) => {
    e.preventDefault();
    if (!newKey.trim() || !newFile) { toast.error("Provide a key and a file"); return; }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", newFile);
      fd.append("key", newKey.trim());
      fd.append("section", newSection);
      // order is automatic: appended at the end of its section
      const inSection = items.filter((a) => (a.section || "other") === newSection).length;
      fd.append("sort_order", String(100 + inSection));
      await client.post("/assets", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(`Added "${newKey.trim()}"`);
      setNewKey(""); setNewFile(null); setNewSection("other");
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
  Object.values(groups).forEach((arr) => arr.sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100) || a.key.localeCompare(b.key)));
  const orderedSections = Object.keys(groups).sort((a, b) => sectionIndex(a) - sectionIndex(b) || a.localeCompare(b));

  const inputCls = "w-full h-8 bg-obsidian border border-white/15 px-2 font-mono text-[11px] text-bone focus:border-copper focus:outline-none";

  return (
    <div data-testid="images-panel">
      {/* Add new asset */}
      <form onSubmit={addNew} className="bg-ink border border-white/10 p-5 mb-10 grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">New asset key</label>
          <input value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. home_new_banner"
            data-testid="new-asset-key" className={`${inputCls} h-10`} />
        </div>
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Section</label>
          <select value={newSection} onChange={(e) => setNewSection(e.target.value)} data-testid="new-asset-section" className={`${inputCls} h-10`}>
            {IMAGE_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
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
      </form>

      {/* Grouped by section in page order */}
      {orderedSections.map((secId) => (
        <div key={secId} className="mb-10" data-testid={`image-section-${secId}`}>
          <div className="flex items-center gap-4 mb-4">
            <h3 className="font-mono text-[11px] tracking-[0.24em] uppercase text-copper">{sectionLabel(secId)}</h3>
            <div className="flex-1 h-px bg-white/10" />
            <span className="font-mono text-[9px] text-ash">{groups[secId].length} image{groups[secId].length > 1 ? "s" : ""}</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {groups[secId].map((a) => (
              <div key={a.id} data-testid={`asset-card-${a.key}`} className="bg-ink border border-white/10 overflow-hidden flex flex-col">
                <button
                  type="button"
                  onClick={() => setEditing(a)}
                  data-testid={`asset-thumb-${a.key}`}
                  title="Klik untuk preview & atur posisi crop"
                  className="relative aspect-[4/3] bg-obsidian overflow-hidden flex items-center justify-center group cursor-pointer">
                  <img src={a.url} alt={a.alt || a.key} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" loading="lazy" />
                  <span className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/50 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition-opacity font-mono text-[9px] tracking-[0.2em] uppercase text-bone border border-copper bg-obsidian/70 px-3 py-1.5">Edit crop</span>
                  </span>
                </button>
                <div className="p-3 flex flex-col gap-2 flex-1">
                  <div className="font-mono text-[11px] text-copper tracking-wide break-all">{a.key}</div>
                  <div className="font-mono text-[9px] text-ash">
                    {a.width && a.height ? `${a.width}×${a.height}` : "—"}
                    {(a.focal_x !== 50 || a.focal_y !== 50 || (a.zoom && a.zoom !== 1)) && (
                      <span className="text-copper"> · focal {Math.round(a.focal_x ?? 50)}×{Math.round(a.focal_y ?? 50)}{a.zoom && a.zoom !== 1 ? ` · ${a.zoom}×` : ""}</span>
                    )}
                  </div>
                  <input
                    defaultValue={a.alt || ""}
                    onBlur={(e) => { if (e.target.value !== (a.alt || "")) saveMeta({ ...a }, { alt: e.target.value }, "Alt saved"); }}
                    placeholder="Alt text…"
                    className={inputCls} />
                  <select
                    defaultValue={a.section || "other"}
                    onChange={(e) => saveMeta({ ...a }, { section: e.target.value }, "Section updated")}
                    title="Section"
                    className={inputCls}>
                    {IMAGE_SECTIONS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </select>
                  <div className="flex gap-2 mt-auto pt-1">
                    <label className={`flex-1 text-center cursor-pointer h-8 leading-8 border border-white/15 font-mono text-[9px] tracking-[0.18em] uppercase ${busyKey === a.key ? "opacity-50" : "text-bone hover:border-copper hover:text-copper"} transition-colors`}>
                      {busyKey === a.key ? "…" : "Replace"}
                      <input type="file" accept="image/*" className="hidden" disabled={busyKey === a.key}
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) replaceImage(a.key, f); e.target.value = ""; }} />
                    </label>
                    <button onClick={() => remove(a)} className="h-8 px-3 border border-red-500/30 text-red-400 font-mono text-[9px] tracking-[0.18em] uppercase hover:bg-red-500/10 transition-colors">Del</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
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

/* ================= LOCATIONS ================= */
const LocationsPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyLoc);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await axios.get(`${API}/locations`, { params: { published_only: false } });
    setItems(r.data || []);
  };
  useEffect(() => { refresh(); }, []);

  const upd = (k) => (e) => setForm({ ...form, [k]: e.target.type === "checkbox" ? e.target.checked : (e.target.type === "number" ? Number(e.target.value) : e.target.value) });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingId) { await client.put(`/locations/${editingId}`, form); toast.success("Location updated"); }
      else { await client.post("/locations", form); toast.success("Location added"); }
      setForm(emptyLoc); setEditingId(null); await refresh();
    } catch (err) { toast.error(err?.response?.data?.detail || "Save failed"); }
    finally { setBusy(false); }
  };

  const edit = (l) => { setEditingId(l.id); setForm({ ...l }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const del = async (id) => { if (!window.confirm("Delete?")) return; try { await client.delete(`/locations/${id}`); toast.success("Deleted"); await refresh(); } catch { toast.error("Delete failed"); } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      <form onSubmit={save} className="lg:col-span-5 border border-white/10 p-8 bg-ink space-y-4 h-fit sticky top-24">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">{editingId ? "Edit Location" : "New Location"}</div>
        <Field label="City" value={form.city} onChange={upd("city")} required id="city" />
        <Field label="Country" value={form.country} onChange={upd("country")} required id="country" />
        <Field label="Role / Description" value={form.role} onChange={upd("role")} required id="role" />
        <div>
          <label className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">Popup Description (optional)</label>
          <textarea value={form.description || ""} onChange={upd("description")} rows={3} id="description" className="w-full bg-obsidian border border-white/15 px-3 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none resize-none" placeholder="Longer description shown in the globe popup card" />
        </div>
        <Field label="Photo URL (optional)" value={form.photo_url || ""} onChange={upd("photo_url")} id="photo_url" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="Latitude" type="number" step="0.0001" min="-90" max="90" value={form.lat} onChange={upd("lat")} id="lat" required />
          <Field label="Longitude" type="number" step="0.0001" min="-180" max="180" value={form.lng} onChange={upd("lng")} id="lng" required />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">Pin color</label>
            <input type="color" value={form.color} onChange={upd("color")} className="w-full h-11 bg-obsidian border border-white/15 cursor-pointer" />
          </div>
          <Field label="Sort order" type="number" value={form.order} onChange={upd("order")} id="order" />
        </div>
        <label className="flex items-center gap-3 font-mono text-xs text-bone">
          <input type="checkbox" checked={form.published} onChange={upd("published")} /> Published
        </label>
        <div className="text-[10px] font-mono text-smoke leading-relaxed border-t border-white/10 pt-3">
          Enter real geographic coordinates. Pins are placed on an interactive world map on the public page.
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} className="flex-1 h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">{editingId ? "Update" : "Add Location"}</button>
          {editingId && <button type="button" onClick={() => { setForm(emptyLoc); setEditingId(null); }} className="h-12 px-4 border border-white/15 font-mono text-[11px] tracking-[0.22em] uppercase text-ash">Cancel</button>}
        </div>
      </form>
      <div className="lg:col-span-7">
        <div className="border-t border-white/10">
          {items.length === 0 && <p className="py-8 font-mono text-xs text-ash">No custom locations yet. The public site shows default locations from the corporate profile until you add your own.</p>}
          {items.map((l) => (
            <div key={l.id} className="py-6 border-b border-white/10 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-8">
                <div className="flex gap-2 items-center mb-1">
                  <span className="w-3 h-3 rounded-full" style={{ background: l.color }} />
                  <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash">{l.country}</span>
                  <span className={`font-mono text-[10px] px-2 py-0.5 tracking-[0.2em] ${l.published ? "bg-copper text-obsidian" : "border border-white/20 text-ash"}`}>{l.published ? "LIVE" : "HIDDEN"}</span>
                </div>
                <h3 className="font-serif text-2xl text-bone tracking-tight leading-tight">{l.city}</h3>
                <p className="text-bone/70 text-sm mt-1">{l.role}</p>
                <p className="font-mono text-[10px] text-smoke mt-1">lat: {l.lat}° · lng: {l.lng}° · order: {l.order}</p>
              </div>
              <div className="col-span-4 flex justify-end gap-2">
                <button onClick={() => edit(l)} className="h-9 px-3 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-bone hover:border-copper hover:text-copper transition-colors">Edit</button>
                <button onClick={() => del(l.id)} className="h-9 px-3 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-bone hover:border-destructive hover:text-destructive transition-colors">Delete</button>
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
