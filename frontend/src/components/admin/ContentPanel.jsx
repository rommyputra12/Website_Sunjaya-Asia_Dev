import React, { useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, ExternalLink, Plus, Search, Trash2, X } from "lucide-react";
import { translations } from "../../i18n/translations";
import { DEFAULT_OFFICES, MAX_OFFICES, OFFICES_KEY } from "../../data/offices";
import { ABOUT_TEXT, ABOUT_LISTS } from "../../data/aboutDefaults";
import { PreviewCtx, SectionPreview } from "./ContentPreview";
import { useLocations } from "../../hooks/useLocations";

const errMsg = (err, fb) => (typeof err?.response?.data?.detail === "string" ? err.response.data.detail : fb);
const inputCls = "w-full bg-obsidian border border-white/15 px-3 py-2 font-mono text-[12px] text-bone focus:border-copper focus:outline-none";
const lbl = "block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5";
const defaultOf = (key) => key.split(".").reduce((c, p) => (c && typeof c === "object" ? c[p] : undefined), translations.en) || ABOUT_TEXT[key] || "";
const lst = (key, label, fields, extra = {}) => ({ key, label, fields, defaults: ABOUT_LISTS[key] || extra.defaults, ...extra });
const ACCENT_HINT = "Tulis *kata* untuk warna oranye";

const f = (key, label, type = "text") => ({ key, label, type });
const stat = (n, id, name) => [f(`stats.value.${id}`, `Statistik ${n} — Angka (${name})`), f(`stats.${id}`, `Statistik ${n} — Keterangan`)];

// Only fields listed here are editable; everything else (nav, form labels, copyright…) is locked
const SCHEMA = [
  { page: "home", label: "Home Page", sections: [
    { id: "hero", url: "/#hero", label: "Hero (Banner Utama)", fields: [f("hero.overline", "Teks kecil atas"), f("hero.line1", "Judul baris 1"), f("hero.line2", "Judul baris 2"), f("hero.sub", "Deskripsi", "textarea"), f("hero.cta_primary", "Tombol utama"), f("hero.cta_secondary", "Tombol kedua")] },
    { id: "pillars_intro", url: "/#business-pillars", label: "Business Pillars Intro", fields: [f("home.pillars_intro.kicker", "Judul kecil (Business Pillars)"), f("home.pillars_intro.para1", "Paragraf 1", "textarea"),
      f("home.pillars_intro.para2", "Paragraf 2", "textarea"), f("home.pillars_intro.highlight", "Teks highlight (oranye, akhir paragraf 2)")] },
    { id: "subsidiaries_teaser", url: "/#subsidiaries-teaser", label: "Subsidiaries & Affiliates (Teaser)", fields: [f("home.subs.kicker", "Judul kecil"), f("home.subs.title", "Judul"), f("home.subs.desc", "Deskripsi", "textarea"), f("home.subs.cta", "Tombol")] },
    { id: "stats", url: "/#stats", label: "Statistik", fields: [...stat(1, "modules", "Products"), ...stat(2, "projects", "Projects"), ...stat(3, "countries", "Countries"), ...stat(4, "contract", "Program")] },
    { id: "global_presence", url: "/#global-presence", label: "Global Presence", fields: [f("presence.kicker", "Teks kecil atas"), f("presence.title", "Judul", "textarea"), f("presence.titleHighlight", "Judul (highlight)"), f("presence.sub", "Deskripsi (tampil di halaman Subsidiaries)", "textarea"),
      { ...f("presence.stats.branches", "Label statistik — Branches"), auto: "branches" }, { ...f("presence.stats.clients", "Label statistik — Affiliates/Infra"), auto: "clients" }, { ...f("presence.stats.countries", "Label statistik — Countries"), auto: "countries" }, f("presence.cta", "Tombol"), f("presence.hub", "Label hub")] },
  ] },
  { page: "pillars", label: "Pillars Page", sections: [
    { id: "intro", url: "/pillars", label: "Intro", fields: [f("manifesto.overline", "Teks kecil atas"), f("manifesto.title", "Judul intro", "textarea")] },
    ...["01", "02", "03"].map((n, i) => ({ id: `pillar_${n}`, url: `/pillars#pillar-${n}`, label: `Pillar ${n} — ${["The Foundation", "The Core", "The Future"][i]}`, pointers: n,
      fields: [f(`pillar.${n}.kicker`, "Kicker"), f(`pillar.${n}.title`, "Judul"), f(`pillar.${n}.body`, "Deskripsi", "textarea")] })),
  ] },
  { page: "about", label: "About Page", sections: [
    { id: "about", url: "/about", label: "Tentang Kami", fields: [f("about.overline", "Teks kecil atas"), f("about.title", "Judul", "textarea"), f("about.body1", "Paragraf 1", "textarea"), f("about.body2", "Paragraf 2", "textarea")] },
    { id: "about_identity", url: "/about", label: "Identitas Perusahaan (Kotak UEN, Established…)", fields: [],
      lists: [lst("about.identity", "Kotak identitas", [["label", "Label (mis. UEN)"], ["value", "Isi"]], { max: 4, itemLabel: "Kotak", sortable: true })] },
    { id: "about_history", url: "/about#company-history", label: "Company History", fields: [f("about.history.kicker", "Judul section"), f("about.history.since", "Teks kanan (Since…)"), f("about.history.journey_kicker", "Judul kecil di bawah foto"), f("about.history.journey", "Kalimat di bawah foto")] },
    { id: "about_timeline", url: "/about#timeline", label: "Timeline", fields: [f("about.timeline.kicker", "Judul section"), f("about.timeline.title", "Sub-judul")],
      lists: [lst("about.timeline.items", "Milestone", [["year", "Tahun"], ["title", "Judul"], ["body", "Deskripsi", "textarea"]], { itemLabel: "Milestone", sortable: true })] },
    { id: "about_edge", url: "/about#competitive-edge", label: "Competitive Edge", fields: [f("about.edge.kicker", "Judul section"), f("about.edge.title", "Judul baris 1"), f("about.edge.highlight", "Judul baris 2 (oranye)"), { ...f("about.edge.desc", "Deskripsi", "textarea"), hintText: ACCENT_HINT },
      f("about.edge.col1", "Kolom 1 — Judul"), f("about.edge.col2", "Kolom 2 — Judul"), f("about.edge.col3", "Kolom 3 — Judul")],
      lists: [1, 2, 3].map((n) => lst(`about.edge.list${n}`, `Kolom ${n} — Daftar`, [["text", "Teks"]], { itemLabel: "Baris", sortable: true })) },
    { id: "about_partner", url: "/about#partnership", label: "Strategic Partnership (CTA)", fields: [f("about.partner.kicker", "Judul kecil"), { ...f("about.partner.text", "Kalimat utama (Enter = baris baru)", "textarea"), hintText: ACCENT_HINT }, f("about.partner.cta", "Tombol"), f("about.partner.email", "Email")] },
  ] },
  { page: "contact", label: "Contact Page", sections: [
    { id: "contact", url: "/contact", label: "Header & Pesan", fields: [f("contact.title", "Judul"), f("contact.sub", "Deskripsi", "textarea"), f("contact.success", "Pesan setelah terkirim", "textarea")] },
  ] },
  { page: "footer", label: "Footer", sections: [
    { id: "footer", url: "/#site-footer", label: "Tagline & Perusahaan", fields: [f("footer.tagline", "Tagline besar"), f("footer.description", "Deskripsi singkat", "textarea"), f("footer.company", "Nama perusahaan")] },
    { id: "offices", url: "/#site-footer", label: `Kantor & Kontak (maks. ${MAX_OFFICES})`, fields: [],
      lists: [{ key: OFFICES_KEY, label: "Kantor", defaults: DEFAULT_OFFICES, max: MAX_OFFICES, itemLabel: "Kantor", sortable: true, note: "Kantor 1 tampil sebagai Head Quarter; ikon telepon otomatis",
        itemTitle: (i) => (i === 0 ? "Kantor 1 — Head Quarter" : `Kantor ${i + 1}`), fields: [["label", "Judul kantor"], ["line1", "Alamat baris 1"], ["line2", "Alamat baris 2"], ["phone", "Nomor telepon"]] }] },
  ] },
];

const useUpsert = (client, refresh) => async (key, meta, patch) => {
  try {
    if (meta.block) await client.put(`/content/${meta.block.id}`, patch);
    else await client.post("/content", { key, page: meta.page, section: meta.section, label: meta.label, type: meta.type, sort_order: meta.sort ?? 100, value: "", value_id: "", ...patch });
    toast.success(`Tersimpan: ${meta.label}`);
    await refresh();
  } catch (e) { toast.error(errMsg(e, "Gagal menyimpan")); }
};

const BiField = ({ label, type, block, placeholder, onSave, testid, onDelete, hint }) => {
  const [showId, setShowId] = useState(!!block?.value_id);
  const { setActive, setDraft, active } = useContext(PreviewCtx);
  const focus = () => setActive(testid);
  const [dirty, setDirty] = useState({});
  const mark = (fld, v) => setDirty((d) => ({ ...d, [fld]: v !== (block?.[fld] || "") }));
  const isDirty = dirty.value || dirty.value_id;
  const len = Math.max((block?.value || "").length, (placeholder || "").length);
  const multi = type === "textarea" || len > 70;
  const Tag = multi ? "textarea" : "input";
  const extra = multi ? { rows: Math.min(8, Math.max(2, Math.ceil(len / 85) + 1)) } : {};
  return (
    <div data-testid={`content-block-${testid}`} className={`bg-obsidian/40 border p-3 transition-colors ${active === testid ? "border-copper/70" : "border-white/10"}`}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] tracking-[0.12em] text-ash">{label}{hint && <span data-testid={`auto-hint-${testid}`} className="ml-2 normal-case text-[#7FC8EE]">{hint}</span>}</span>
        <span className="flex items-center gap-3">
          {isDirty && <span data-testid={`unsaved-${testid}`} className="flex items-center gap-1 font-mono text-[8px] tracking-[0.14em] uppercase text-amber-400"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />belum tersimpan</span>}
          <button type="button" onClick={() => setShowId(!showId)} className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash hover:text-copper">{showId ? "− ID" : "+ ID"}</button>
          {onDelete && <button type="button" onClick={onDelete} data-testid={`remove-pointer-${testid}`} className="text-red-400/70 hover:text-red-400"><Trash2 size={12} /></button>}
        </span>
      </div>
      <div className={`grid gap-2 ${showId ? "md:grid-cols-2" : ""}`}>
        <Tag {...extra} key={`en-${block?.value}`} defaultValue={block?.value || ""} placeholder={placeholder} data-testid={`content-input-${testid}`} onFocus={focus} onChange={(e) => { setDraft(testid, e.target.value); mark("value", e.target.value); }}
          onBlur={(e) => { if (e.target.value !== (block?.value || "")) onSave({ value: e.target.value }); setDirty((d) => ({ ...d, value: false })); }} className={`${inputCls} resize-y`} />
        {showId && (
          <Tag {...extra} key={`id-${block?.value_id}`} defaultValue={block?.value_id || ""} placeholder="Bahasa Indonesia (opsional)" data-testid={`content-input-${testid}-id`} onFocus={focus} onChange={(e) => mark("value_id", e.target.value)}
            onBlur={(e) => { if (e.target.value !== (block?.value_id || "")) onSave({ value_id: e.target.value }); setDirty((d) => ({ ...d, value_id: false })); }} className={`${inputCls} resize-y border-copper/30`} />
        )}
      </div>
    </div>
  );
};

const Pointers = ({ num, items, client, refresh, upsert }) => {
  const re = new RegExp(`^pillar\\.${num}\\.div\\.(\\d+)\\.name$`);
  const names = items.filter((b) => re.test(b.key)).sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
  const add = async () => {
    const next = Math.max(0, ...names.map((b) => +b.key.match(re)[1])) + 1;
    const nn = String(next).padStart(2, "0");
    const sort = Math.max(0, ...items.map((b) => b.sort_order ?? 0));
    try {
      await client.post("/content", { key: `pillar.${num}.div.${nn}.name`, page: "pillars", section: `pillar_${num}`, sort_order: sort + 10, label: `Pillar ${num}.${next} — Name`, type: "text", value: "New pointer" });
      await client.post("/content", { key: `pillar.${num}.div.${nn}.desc`, page: "pillars", section: `pillar_${num}`, sort_order: sort + 20, label: `Pillar ${num}.${next} — Description`, type: "textarea", value: "" });
      toast.success("Pointer ditambahkan"); await refresh();
    } catch (e) { toast.error(errMsg(e, "Gagal menambah pointer")); }
  };
  const remove = async (nb) => {
    if (!window.confirm(`Hapus pointer "${nb.value}"?`)) return;
    const base = nb.key.replace(/\.name$/, "");
    try {
      for (const b of items.filter((x) => x.key === `${base}.name` || x.key === `${base}.desc`)) await client.delete(`/content/${b.id}`);
      toast.success("Pointer dihapus"); await refresh();
    } catch (e) { toast.error(errMsg(e, "Gagal menghapus")); }
  };
  return (
    <div className="mt-4">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-copper">Pointers ({names.length})</span>
        <button onClick={add} data-testid={`add-pointer-pillar_${num}`} className="h-8 px-3 border border-copper/60 text-copper font-mono text-[9px] tracking-[0.2em] uppercase hover:bg-copper hover:text-obsidian transition-colors">+ Tambah Pointer</button>
      </div>
      <div className="space-y-3">
        {names.map((nb, i) => {
          const desc = items.find((b) => b.key === nb.key.replace(/\.name$/, ".desc"));
          return (
            <div key={nb.id} className="border border-white/10 p-3 space-y-2">
              <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash">Pointer {i + 1}</div>
              <BiField label="Nama" block={nb} testid={nb.key} onDelete={() => remove(nb)} onSave={(p) => upsert(nb.key, { block: nb, label: `Pointer ${i + 1} — Nama` }, p)} />
              <BiField label="Deskripsi" type="textarea" block={desc} testid={nb.key.replace(/\.name$/, ".desc")}
                onSave={(p) => upsert(nb.key.replace(/\.name$/, ".desc"), { block: desc, page: "pillars", section: `pillar_${num}`, label: `Pointer ${i + 1} — Deskripsi`, type: "textarea" }, p)} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Generic editor for a JSON list stored in one CMS block (offices, timeline, identity boxes…)
const ListEditor = ({ items, upsert, list: cfg, page, section }) => {
  const { setActive, setDraft } = useContext(PreviewCtx);
  const block = items.find((b) => b.key === cfg.key);
  const parse = (raw) => { try { const a = JSON.parse(raw || ""); return Array.isArray(a) && a.length ? a : null; } catch { return null; } };
  const [list, setList] = useState(parse(block?.value) || cfg.defaults);
  const [dirtyIdx, setDirtyIdx] = useState(null);
  useEffect(() => { setList(parse(block?.value) || cfg.defaults); }, [block?.value]); // eslint-disable-line react-hooks/exhaustive-deps
  const persist = (next) => upsert(cfg.key, { block, page, section, label: cfg.label, type: "json" }, { value: JSON.stringify(next) });
  const update = (n, idx = null) => { setList(n); setDraft(cfg.key, JSON.stringify(n)); setDirtyIdx(idx); };
  const move = (i, d) => { const n = [...list]; [n[i], n[i + d]] = [n[i + d], n[i]]; update(n); persist(n); };
  const blank = Object.fromEntries(cfg.fields.map(([k]) => [k, ""]));
  const tid = cfg.key.replace(/\./g, "-");
  return (
    <div className="space-y-3" data-testid={`list-${tid}`}>
      <div className="flex items-center justify-between">
        <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-copper">{cfg.label} ({list.length}{cfg.max ? `/${cfg.max}` : ""})</span>
        {cfg.note && <span className="font-mono text-[9px] text-ash">{cfg.note}</span>}
      </div>
      {list.map((o, i) => (
        <div key={i} data-testid={`${tid}-item-${i}`} className="border border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#7FC8EE] flex items-center gap-3">{cfg.itemTitle ? cfg.itemTitle(i) : `${cfg.itemLabel || "Item"} ${i + 1}`}
              {dirtyIdx === i && <span data-testid={`unsaved-${tid}-${i}`} className="flex items-center gap-1 text-[8px] text-amber-400 normal-case tracking-[0.14em]"><span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />belum tersimpan</span>}</span>
            <span className="flex items-center gap-2 text-ash">
              {cfg.sortable && i > 0 && <button onClick={() => move(i, -1)} title="Naik" className="hover:text-copper"><ChevronUp size={13} /></button>}
              {cfg.sortable && i < list.length - 1 && <button onClick={() => move(i, 1)} title="Turun" className="hover:text-copper"><ChevronDown size={13} /></button>}
              {list.length > 1 && <button onClick={() => { const n = list.filter((_, j) => j !== i); update(n); persist(n); }} data-testid={`${tid}-remove-${i}`} className="text-red-400/70 hover:text-red-400"><Trash2 size={12} /></button>}
            </span>
          </div>
          <div className={`grid gap-2 ${cfg.fields.length > 1 ? "md:grid-cols-2" : ""}`}>
            {cfg.fields.map(([k, l, type]) => {
              const Tag = type === "textarea" ? "textarea" : "input";
              return (
                <div key={k} className={type === "textarea" ? "md:col-span-2" : ""}>
                  <label className={lbl}>{l}</label>
                  <Tag rows={type === "textarea" ? 3 : undefined} value={o[k] || ""} data-testid={`${tid}-${i}-${k}`}
                    onChange={(e) => update(list.map((x, j) => (j === i ? { ...x, [k]: e.target.value } : x)), i)}
                    onFocus={() => setActive(`${cfg.key}-${i}`)} onBlur={() => { if (dirtyIdx === i) persist(list); setDirtyIdx(null); }}
                    className={`${inputCls} resize-y`} />
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {(!cfg.max || list.length < cfg.max) && (
        <button onClick={() => { const n = [...list, blank]; update(n); persist(n); }} data-testid={`${tid}-add`}
          className="h-9 px-4 border border-copper/60 text-copper font-mono text-[9px] tracking-[0.2em] uppercase hover:bg-copper hover:text-obsidian transition-colors inline-flex items-center gap-2"><Plus size={12} /> Tambah {cfg.itemLabel || "Item"}</button>
      )}
    </div>
  );
};

const Accordion = ({ title, count, level = 0, children, testid, forceOpen, href }) => {
  const [openState, setOpen] = useState(false);
  const open = forceOpen || openState;
  return (
    <div data-testid={testid} className={level === 0 ? "border border-white/10 bg-ink mb-3" : "border-t border-white/10"}>
      <div className={`flex items-center hover:bg-white/5 transition-colors ${level === 0 ? "px-5" : "px-5 pl-8"}`}>
        <button onClick={() => setOpen(!openState)} data-testid={`${testid}-toggle`} className={`flex-1 flex items-center justify-between text-left ${level === 0 ? "py-4" : "py-3"}`}>
          <span className={`font-mono uppercase ${level === 0 ? "text-[11px] tracking-[0.24em] text-copper" : "text-[10px] tracking-[0.2em] text-[#7FC8EE] font-bold"}`}>
            {title}{count != null && <span className="text-ash ml-2">· {count}</span>}
          </span>
          <ChevronDown size={14} className={`text-ash transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>
        {href && (
          <a href={href} target="_blank" rel="noopener noreferrer" data-testid={`${testid}-view`} title="Buka bagian ini di situs"
            className="ml-4 inline-flex items-center gap-1.5 h-7 px-2.5 border border-white/15 font-mono text-[8px] tracking-[0.18em] uppercase text-ash hover:text-copper hover:border-copper transition-colors">
            <ExternalLink size={11} /> View on site
          </a>
        )}
      </div>
      {open && <div className={level === 0 ? "" : "px-5 pl-8 pb-5"}>{children}</div>}
    </div>
  );
};

const matchText = (q, ...vals) => vals.some((v) => (v || "").toLowerCase().includes(q));

export const ContentPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const refresh = async () => {
    try { const r = await client.get("/content"); setItems(r.data || []); }
    catch (e) { toast.error(errMsg(e, "Gagal memuat konten")); }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);
  const upsert = useUpsert(client, refresh);
  const byKey = Object.fromEntries(items.map((b) => [b.key, b]));
  const [draft, setDraftMap] = useState({});
  const [active, setActive] = useState(null);
  const setDraft = (k, v) => setDraftMap((d) => ({ ...d, [k]: v }));
  const [query, setQuery] = useState("");
  const locs = useLocations();
  const infra = locs.filter((l) => l.type === "infra").length;
  const counts = { branches: locs.length - infra, clients: infra, countries: new Set(locs.map((l) => (l.country || "").trim().toLowerCase())).size };
  const AUTO_DESC = { branches: "HQ + Branch", clients: "Infrastructure Hub", countries: "negara unik" };
  const [version, setVersion] = useState(0);
  useEffect(() => { setVersion((v) => v + 1); }, [items]);
  const q = query.trim().toLowerCase();
  const fieldHit = (fd) => matchText(q, fd.label, fd.key, byKey[fd.key]?.value, byKey[fd.key]?.value_id, defaultOf(fd.key));
  const sectionFields = (pg, sec) => {
    if (!q || matchText(q, sec.label, pg.label)) return sec.fields;
    return (sec.fields || []).filter(fieldHit);
  };
  const sectionHit = (pg, sec) => {
    if (!q || matchText(q, sec.label, pg.label)) return true;
    if ((sec.lists || []).some((l) => matchText(q, byKey[l.key]?.value || JSON.stringify(l.defaults)))) return true;
    if (sec.pointers && items.some((b) => b.section === sec.id && matchText(q, b.value, b.value_id))) return true;
    return sectionFields(pg, sec).length > 0;
  };
  useEffect(() => { setDraftMap({}); }, [items]);

  return (
    <PreviewCtx.Provider value={{ draft, setDraft, active, setActive, byKey, counts, version }}>
    <div data-testid="content-panel">
      <p className="text-ash font-mono text-xs max-w-2xl mb-4">Klik halaman lalu section untuk mengedit. Perubahan tersimpan otomatis saat keluar dari kolom. Kolom ID (Bahasa Indonesia) opsional — jika kosong memakai teks bawaan.</p>
      <div className="relative mb-6 max-w-xl">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ash" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Cari teks, mis. 'Discover' atau 'Jakarta'…" data-testid="content-search"
          className="w-full h-11 bg-obsidian border border-white/15 pl-9 pr-9 font-mono text-xs text-bone focus:border-copper focus:outline-none" />
        {query && <button onClick={() => setQuery("")} data-testid="content-search-clear" className="absolute right-3 top-1/2 -translate-y-1/2 text-ash hover:text-copper"><X size={14} /></button>}
      </div>
      {q && SCHEMA.every((pg) => !pg.sections.some((sec) => sectionHit(pg, sec))) && <p data-testid="content-search-empty" className="font-mono text-xs text-ash mb-6">Tidak ada teks yang cocok dengan "{query}".</p>}
      {SCHEMA.filter((pg) => pg.sections.some((sec) => sectionHit(pg, sec))).map((pg) => (
        <Accordion key={pg.page} title={pg.label} count={pg.sections.length} testid={`content-page-${pg.page}`} forceOpen={!!q}>
          {pg.sections.filter((sec) => sectionHit(pg, sec)).map((sec) => (
            <Accordion key={sec.id} level={1} title={sec.label} testid={`content-section-${sec.id}`} forceOpen={!!q} href={sec.url}>
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-7 space-y-3">
              {(
                <>
                  {sectionFields(pg, sec).map((fd, i) => (
                    <BiField key={fd.key} label={fd.label} type={fd.type} block={byKey[fd.key]} placeholder={defaultOf(fd.key)} testid={fd.key}
                      hint={fd.auto ? `(angka otomatis dari Locations — ${AUTO_DESC[fd.auto]}: ${counts[fd.auto]})` : fd.hintText && `(${fd.hintText})`}
                      onSave={(p) => upsert(fd.key, { block: byKey[fd.key], page: pg.page, section: sec.id, label: fd.label, type: fd.type, sort: i + 1 }, p)} />
                  ))}
                  {(sec.lists || []).map((l) => <ListEditor key={l.key} list={l} items={items} upsert={upsert} page={pg.page} section={sec.id} />)}
                  {sec.pointers && <Pointers num={sec.pointers} items={items.filter((b) => b.section === sec.id)} client={client} refresh={refresh} upsert={upsert} />}
                </>
              )}
              </div>
              <div className="lg:col-span-5 lg:self-stretch"><SectionPreview sectionId={sec.id} url={sec.url} /></div>
              </div>
            </Accordion>
          ))}
        </Accordion>
      ))}
    </div>
    </PreviewCtx.Provider>
  );
};
