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
  const [tab, setTab] = useState("news");

  const client = axios.create({ baseURL: API, headers: { "X-Admin-Token": token } });

  useEffect(() => {
    if (!token) return;
    (async () => {
      try {
        await client.post("/admin/verify");
        setAuthed(true);
      } catch {
        setAuthed(false);
        localStorage.removeItem(TOKEN_KEY);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const login = async (e) => {
    e.preventDefault();
    const val = e.target.token.value.trim();
    try {
      await axios.post(`${API}/admin/verify`, {}, { headers: { "X-Admin-Token": val } });
      setToken(val);
      localStorage.setItem(TOKEN_KEY, val);
      toast.success("Access granted");
    } catch {
      toast.error("Invalid admin token");
    }
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setToken("");
    setAuthed(false);
  };

  if (!authed) {
    return (
      <div data-testid="admin-login" className="pt-32 pb-24 min-h-screen">
        <Toaster theme="dark" position="bottom-right" />
        <div className="max-w-md mx-auto px-6">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">CMS Access</span>
          <h1 className="font-serif text-4xl text-bone mt-3 tracking-tight">Administrator</h1>
          <p className="mt-4 text-ash font-mono text-xs tracking-wide">Enter your admin token to manage the CMS.</p>
          <form onSubmit={login} className="mt-8 space-y-4">
            <input name="token" type="password" required data-testid="admin-token-input" placeholder="Admin token" className="w-full h-12 bg-ink border border-white/15 px-4 font-mono text-sm text-bone focus:border-copper focus:outline-none" />
            <button type="submit" data-testid="admin-login-submit" className="w-full h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.24em] uppercase hover:bg-copper-hi transition-colors">Enter</button>
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
          </div>
          <button onClick={logout} data-testid="admin-logout" className="h-10 px-4 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">Sign out</button>
        </div>

        {/* Tabs */}
        <div className="flex gap-px bg-white/10 border border-white/10 mb-10 w-fit">
          {[
            { k: "news", label: "News" },
            { k: "locations", label: "Locations" },
            { k: "inquiries", label: "Inquiries" },
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
        {tab === "inquiries" && <InquiriesPanel client={client} />}
      </div>
    </div>
  );
}

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
