import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { LocationMapPicker } from "./LocationMapPicker";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;
const CUSTOM = "__custom";

const ISO = "AF AL DZ AD AO AG AR AM AU AT AZ BS BH BD BB BY BE BZ BJ BT BO BA BW BR BN BG BF BI KH CM CA CV CF TD CL CN CO KM CG CD CR CI HR CU CY CZ DK DJ DM DO EC EG SV GQ ER EE SZ ET FJ FI FR GA GM GE DE GH GR GD GT GN GW GY HT HN HK HU IS IN ID IR IQ IE IL IT JM JP JO KZ KE KI KW KG LA LV LB LS LR LY LI LT LU MO MG MW MY MV ML MT MH MR MU MX FM MD MC MN ME MA MZ MM NA NR NP NL NZ NI NE NG KP MK NO OM PK PW PS PA PG PY PE PH PL PT PR QA RO RU RW KN LC VC WS SM ST SA SN RS SC SL SG SK SI SB SO ZA KR SS ES LK SD SR SE CH SY TW TJ TZ TH TL TG TO TT TN TR TM TV UG UA AE GB US UY UZ VU VA VE VN YE ZM ZW".split(" ");
const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const COUNTRIES = ISO.map((code) => ({ code, name: regionNames.of(code) })).sort((a, b) => a.name.localeCompare(b.name));
const ALIASES = { UAE: "AE", USA: "US", UK: "GB" };
const codeFor = (name) => ALIASES[name?.trim()] || COUNTRIES.find((c) => c.name.toLowerCase() === (name || "").trim().toLowerCase())?.code;

const TYPES = [
  { id: "hq", label: "Headquarters", color: "#3EC4FF" },
  { id: "branch", label: "Branch", color: "#FF6A3D" },
  { id: "infra", label: "Infrastructure Hub", color: "#B892FF" },
];
const ROLE_PRESETS = ["Holding & Headquarters", "Regional Office", "Distribution & Operational Hub", "Distribution Hub", "Operational Hub", "Infrastructure Hub", "Representative Office", "Strategic Market Operations", "Assets Management"];

const emptyLoc = { city: "", country: "", role: "", lat: "", lng: "", color: "#FF6A3D", order: 100, published: true, photo_url: "", description: "", type: "branch" };
const inputCls = "w-full h-11 bg-obsidian border border-white/15 px-3 font-mono text-sm text-bone focus:border-copper focus:outline-none";
const labelCls = "block font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2";
const errMsg = (err, fb) => (typeof err?.response?.data?.detail === "string" ? err.response.data.detail : fb);

// Dropdown with a "Custom…" option that reveals a free-text input
const SelectOrCustom = ({ label, id, value, options, onChange, required }) => {
  const known = options.some((o) => o.value === value);
  const [custom, setCustom] = useState(!!value && !known);
  useEffect(() => { if (value && !options.some((o) => o.value === value)) setCustom(true); }, [value, options]);
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <select data-testid={`loc-${id}-select`} value={custom ? CUSTOM : value} required={required && !custom}
        onChange={(e) => { if (e.target.value === CUSTOM) { setCustom(true); onChange(""); } else { setCustom(false); onChange(e.target.value); } }}
        className={inputCls}>
        <option value="">— Select —</option>
        {options.map((o) => <option key={o.key || o.value} value={o.value}>{o.label}</option>)}
        <option value={CUSTOM}>+ Custom…</option>
      </select>
      {custom && (
        <input data-testid={`loc-${id}-custom`} value={value} required={required} onChange={(e) => onChange(e.target.value)}
          placeholder={`Type custom ${label.toLowerCase()}`} className={`${inputCls} mt-2`} />
      )}
    </div>
  );
};

// City autocomplete via OpenStreetMap (backend proxy); fills lat/lng automatically
const CityPicker = ({ client, value, country, onPick, onType }) => {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const timer = useRef(null);

  const search = (q) => {
    clearTimeout(timer.current);
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    timer.current = setTimeout(async () => {
      setLoading(true);
      try {
        const code = codeFor(country);
        const r = await client.get("/geo/search", { params: { q: code ? q : `${q} ${country || ""}`.trim(), country: code } });
        setResults(r.data || []); setOpen(true);
      } catch { setResults([]); }
      finally { setLoading(false); setSearched(true); }
    }, 450);
  };

  return (
    <div className="relative">
      <label className={labelCls}>City {loading && <span className="text-copper normal-case tracking-normal">· searching…</span>}</label>
      <input data-testid="loc-city-input" value={value} required autoComplete="off"
        onChange={(e) => { onType(e.target.value); search(e.target.value); }}
        onFocus={() => results.length && setOpen(true)} onBlur={() => setTimeout(() => setOpen(false), 200)}
        placeholder={country ? `Search a city in ${country}…` : "Pick a country first, then type a city…"} className={inputCls} />
      {open && results.length > 0 && (
        <ul data-testid="loc-city-results" className="absolute z-40 left-0 right-0 mt-1 max-h-64 overflow-y-auto bg-ink border border-copper/40 shadow-xl">
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" data-testid={`loc-city-option-${i}`} onMouseDown={() => { onPick(r); setOpen(false); }}
                className="w-full text-left px-3 py-2 hover:bg-copper/15 border-b border-white/5">
                <div className="font-mono text-xs text-bone">{r.name}</div>
                <div className="font-mono text-[10px] text-ash truncate">{r.display}</div>
              </button>
            </li>
          ))}
        </ul>
      )}
      {searched && !loading && results.length === 0 && value.trim().length >= 2 && (
        <p data-testid="loc-city-notfound" className="mt-2 font-mono text-[10px] text-amber-400 leading-relaxed">
          City not found — keep the name as typed and fill the coordinates below manually.
        </p>
      )}
    </div>
  );
};

const CoordsInput = ({ form, setForm }) => {
  const [paste, setPaste] = useState("");
  const applyPaste = (v) => {
    setPaste(v);
    const m = v.match(/(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)/);
    if (m && Math.abs(+m[1]) <= 90 && Math.abs(+m[2]) <= 180) setForm((f) => ({ ...f, lat: +m[1], lng: +m[2] }));
  };
  return (
    <div className="border border-white/10 p-4 space-y-3">
      <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">Coordinates</div>
      <div>
        <label className={labelCls}>Paste from Google Maps (optional)</label>
        <input data-testid="loc-coords-paste" value={paste} onChange={(e) => applyPaste(e.target.value)} placeholder="e.g. -6.2088, 106.8456" className={inputCls} />
        <p className="mt-1.5 font-mono text-[9px] text-smoke leading-relaxed">Google Maps → right-click the spot → click the coordinates (copied) → paste here.</p>
      </div>
      <LocationMapPicker lat={form.lat} lng={form.lng} color={form.color} onChange={(lat, lng) => setForm((f) => ({ ...f, lat, lng }))} />
      <div className="grid grid-cols-2 gap-3">
        {["lat", "lng"].map((k) => (
          <div key={k}>
            <label className={labelCls}>{k === "lat" ? "Latitude" : "Longitude"}</label>
            <input data-testid={`admin-${k}`} type="number" step="any" required min={k === "lat" ? -90 : -180} max={k === "lat" ? 90 : 180}
              value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value === "" ? "" : Number(e.target.value) }))} className={inputCls} />
          </div>
        ))}
      </div>
    </div>
  );
};

const LocationRow = ({ l, onEdit, onDelete }) => (
  <div data-testid={`loc-row-${l.city}`} className="py-6 border-b border-white/10 grid grid-cols-12 gap-4 items-center">
    <div className="col-span-8">
      <div className="flex gap-2 items-center mb-1 flex-wrap">
        <span className={`w-3 h-3 ${l.type === "infra" ? "rotate-45" : "rounded-full"}`} style={{ background: l.color }} />
        <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash">{l.country}</span>
        <span className="font-mono text-[10px] px-2 py-0.5 tracking-[0.2em] uppercase border border-copper/40 text-copper">{TYPES.find((t) => t.id === l.type)?.label || l.type}</span>
        <span className={`font-mono text-[10px] px-2 py-0.5 tracking-[0.2em] ${l.published ? "bg-copper text-obsidian" : "border border-white/20 text-ash"}`}>{l.published ? "LIVE" : "HIDDEN"}</span>
      </div>
      <h3 className="font-serif text-2xl text-bone tracking-tight leading-tight">{l.city}</h3>
      <p className="text-bone/70 text-sm mt-1">{l.role}</p>
      <p className="font-mono text-[10px] text-smoke mt-1">lat: {l.lat}° · lng: {l.lng}° · order: {l.order}</p>
    </div>
    <div className="col-span-4 flex justify-end gap-2">
      <button data-testid={`loc-edit-${l.city}`} onClick={() => onEdit(l)} className="h-9 px-3 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-bone hover:border-copper hover:text-copper transition-colors">Edit</button>
      <button data-testid={`loc-delete-${l.city}`} onClick={() => onDelete(l.id)} className="h-9 px-3 border border-white/15 font-mono text-[10px] tracking-[0.22em] uppercase text-bone hover:border-destructive hover:text-destructive transition-colors">Delete</button>
    </div>
  </div>
);

export const LocationsPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(emptyLoc);
  const [editingId, setEditingId] = useState(null);
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    const r = await axios.get(`${API}/locations`, { params: { published_only: false } });
    setItems(r.data || []);
  };
  useEffect(() => { refresh(); }, []);

  const set = (k) => (v) => setForm((f) => ({ ...f, [k]: v }));
  const countryOpts = useMemo(() => {
    const extra = [...new Set(items.map((l) => l.country))].filter((c) => !COUNTRIES.some((x) => x.name === c));
    return [...extra.map((c) => ({ value: c, label: `${c} (in use)` })), ...COUNTRIES.map((c) => ({ value: c.name, label: c.name, key: c.code }))];
  }, [items]);
  const roleOpts = useMemo(() => [...new Set([...ROLE_PRESETS, ...items.map((l) => l.role)])].map((r) => ({ value: r, label: r })), [items]);

  const setType = (type) => setForm((f) => ({ ...f, type, color: TYPES.find((t) => t.id === type)?.color || f.color, role: f.role || (type === "infra" ? "Infrastructure Hub" : f.role) }));
  const pickCity = (r) => setForm((f) => ({ ...f, city: r.name || r.city, lat: +r.lat.toFixed(4), lng: +r.lng.toFixed(4), country: f.country || r.country || "" }));

  const save = async (e) => {
    e.preventDefault();
    if (form.lat === "" || form.lng === "") { toast.error("Coordinates are required"); return; }
    setBusy(true);
    try {
      if (editingId) { await client.put(`/locations/${editingId}`, form); toast.success("Location updated"); }
      else { await client.post("/locations", form); toast.success("Location added"); }
      setForm(emptyLoc); setEditingId(null); await refresh();
    } catch (err) { toast.error(errMsg(err, "Save failed")); }
    finally { setBusy(false); }
  };

  const edit = (l) => { setEditingId(l.id); setForm({ ...emptyLoc, ...l, photo_url: l.photo_url || "", description: l.description || "" }); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const del = async (id) => { if (!window.confirm("Delete?")) return; try { await client.delete(`/locations/${id}`); toast.success("Deleted"); await refresh(); } catch { toast.error("Delete failed"); } };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" data-testid="locations-panel">
      <form onSubmit={save} data-testid="loc-form" className="lg:col-span-5 border border-white/10 p-8 bg-ink space-y-4 h-fit">
        <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">{editingId ? "Edit Location" : "New Location"}</div>
        <div>
          <label className={labelCls}>Type</label>
          <select data-testid="loc-type-select" value={form.type} onChange={(e) => setType(e.target.value)} className={inputCls}>
            {TYPES.map((t) => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>
        <SelectOrCustom label="Country" id="country" value={form.country} options={countryOpts} onChange={set("country")} required />
        <CityPicker client={client} value={form.city} country={form.country} onPick={pickCity} onType={set("city")} />
        <CoordsInput form={form} setForm={setForm} />
        <SelectOrCustom label="Role / Description" id="role" value={form.role} options={roleOpts} onChange={set("role")} required />
        <div>
          <label className={labelCls}>Popup Description (optional)</label>
          <textarea value={form.description} onChange={(e) => set("description")(e.target.value)} rows={3} className="w-full bg-obsidian border border-white/15 px-3 py-3 font-mono text-sm text-bone focus:border-copper focus:outline-none resize-none" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelCls}>Pin color</label>
            <input type="color" data-testid="loc-color" value={form.color} onChange={(e) => set("color")(e.target.value)} className="w-full h-11 bg-obsidian border border-white/15 cursor-pointer" />
          </div>
          <div>
            <label className={labelCls}>Sort order</label>
            <input type="number" data-testid="loc-order" value={form.order} onChange={(e) => set("order")(Number(e.target.value))} className={inputCls} />
          </div>
        </div>
        <label className="flex items-center gap-3 font-mono text-xs text-bone">
          <input type="checkbox" data-testid="loc-published" checked={form.published} onChange={(e) => set("published")(e.target.checked)} /> Published
        </label>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={busy} data-testid="loc-save" className="flex-1 h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">{editingId ? "Update" : "Add Location"}</button>
          {editingId && <button type="button" onClick={() => { setForm(emptyLoc); setEditingId(null); }} className="h-12 px-4 border border-white/15 font-mono text-[11px] tracking-[0.22em] uppercase text-ash">Cancel</button>}
        </div>
      </form>
      <div className="lg:col-span-7">
        <div className="border-t border-white/10">
          {items.length === 0 && <p className="py-8 font-mono text-xs text-ash">No locations yet.</p>}
          {items.map((l) => <LocationRow key={l.id} l={l} onEdit={edit} onDelete={del} />)}
        </div>
      </div>
    </div>
  );
};
