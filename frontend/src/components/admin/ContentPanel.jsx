import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { translations } from "../../i18n/translations";
import { DEFAULT_OFFICES, MAX_OFFICES, OFFICES_KEY, parseOffices } from "../../data/offices";

const errMsg = (err, fb) => (typeof err?.response?.data?.detail === "string" ? err.response.data.detail : fb);
const inputCls = "w-full bg-obsidian border border-white/15 px-3 py-2 font-mono text-[12px] text-bone focus:border-copper focus:outline-none";
const lbl = "block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5";
const defaultOf = (key) => key.split(".").reduce((c, p) => (c && typeof c === "object" ? c[p] : undefined), translations.en) || "";

const f = (key, label, type = "text") => ({ key, label, type });
const stat = (n, id, name) => [f(`stats.value.${id}`, `Statistik ${n} — Angka (${name})`), f(`stats.${id}`, `Statistik ${n} — Keterangan`)];

// Only fields listed here are editable; everything else (nav, form labels, copyright…) is locked
const SCHEMA = [
  { page: "home", label: "Home Page", sections: [
    { id: "hero", label: "Hero (Banner Utama)", fields: [f("hero.overline", "Teks kecil atas"), f("hero.line1", "Judul baris 1"), f("hero.line2", "Judul baris 2"), f("hero.sub", "Deskripsi", "textarea"), f("hero.cta_primary", "Tombol utama"), f("hero.cta_secondary", "Tombol kedua")] },
    { id: "pillars_intro", label: "Business Pillars Intro", fields: [f("manifesto.overline", "Teks kecil atas"), f("manifesto.title_pre", "Judul", "textarea"), f("manifesto.title_highlight", "Judul (highlight)"),
      f("manifesto.ch1_title", "Pilar 1 — Judul"), f("manifesto.ch1_desc", "Pilar 1 — Deskripsi", "textarea"), f("manifesto.ch2_title", "Pilar 2 — Judul"), f("manifesto.ch2_desc", "Pilar 2 — Deskripsi", "textarea"), f("manifesto.ch3_title", "Pilar 3 — Judul"), f("manifesto.ch3_desc", "Pilar 3 — Deskripsi", "textarea")] },
    { id: "stats", label: "Statistik", fields: [...stat(1, "modules", "Products"), ...stat(2, "projects", "Projects"), ...stat(3, "countries", "Countries"), ...stat(4, "contract", "Program")] },
    { id: "global_presence", label: "Global Presence", fields: [f("presence.kicker", "Teks kecil atas"), f("presence.title", "Judul", "textarea"), f("presence.titleHighlight", "Judul (highlight)"), f("presence.sub", "Deskripsi", "textarea"),
      f("presence.stats.branches", "Label statistik — Branches"), f("presence.stats.clients", "Label statistik — Affiliates/Infra"), f("presence.stats.countries", "Label statistik — Countries"), f("presence.cta", "Tombol"), f("presence.hub", "Label hub")] },
  ] },
  { page: "pillars", label: "Pillars Page", sections: [
    { id: "intro", label: "Intro", fields: [f("manifesto.title", "Judul intro", "textarea")] },
    ...["01", "02", "03"].map((n, i) => ({ id: `pillar_${n}`, label: `Pillar ${n} — ${["The Foundation", "The Core", "The Future"][i]}`, pointers: n,
      fields: [f(`pillar.${n}.kicker`, "Kicker"), f(`pillar.${n}.title`, "Judul"), f(`pillar.${n}.body`, "Deskripsi", "textarea")] })),
  ] },
  { page: "about", label: "About Page", sections: [
    { id: "about", label: "Tentang Kami", fields: [f("about.overline", "Teks kecil atas"), f("about.title", "Judul", "textarea"), f("about.body1", "Paragraf 1", "textarea"), f("about.body2", "Paragraf 2", "textarea")] },
  ] },
  { page: "contact", label: "Contact Page", sections: [
    { id: "contact", label: "Header & Pesan", fields: [f("contact.title", "Judul"), f("contact.sub", "Deskripsi", "textarea"), f("contact.success", "Pesan setelah terkirim", "textarea")] },
  ] },
  { page: "footer", label: "Footer", sections: [
    { id: "footer", label: "Tagline & Perusahaan", fields: [f("footer.tagline", "Tagline besar"), f("footer.description", "Deskripsi singkat", "textarea"), f("footer.company", "Nama perusahaan")] },
    { id: "offices", label: `Kantor & Kontak (maks. ${MAX_OFFICES})`, offices: true },
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

const BiField = ({ label, type, block, placeholder, onSave, testid, onDelete }) => {
  const [showId, setShowId] = useState(!!block?.value_id);
  const Tag = type === "textarea" ? "textarea" : "input";
  const extra = type === "textarea" ? { rows: 3 } : {};
  return (
    <div data-testid={`content-block-${testid}`} className="bg-obsidian/40 border border-white/10 p-3">
      <div className="flex items-center justify-between mb-1.5">
        <span className="font-mono text-[10px] tracking-[0.12em] text-bone">{label}</span>
        <span className="flex items-center gap-3">
          <button type="button" onClick={() => setShowId(!showId)} className="font-mono text-[8px] tracking-[0.18em] uppercase text-ash hover:text-copper">{showId ? "− ID" : "+ ID"}</button>
          {onDelete && <button type="button" onClick={onDelete} data-testid={`remove-pointer-${testid}`} className="text-red-400/70 hover:text-red-400"><Trash2 size={12} /></button>}
        </span>
      </div>
      <div className={`grid gap-2 ${showId ? "md:grid-cols-2" : ""}`}>
        <Tag {...extra} key={`en-${block?.value}`} defaultValue={block?.value || ""} placeholder={placeholder} data-testid={`content-input-${testid}`}
          onBlur={(e) => e.target.value !== (block?.value || "") && onSave({ value: e.target.value })} className={`${inputCls} resize-y`} />
        {showId && (
          <Tag {...extra} key={`id-${block?.value_id}`} defaultValue={block?.value_id || ""} placeholder="Bahasa Indonesia (opsional)" data-testid={`content-input-${testid}-id`}
            onBlur={(e) => e.target.value !== (block?.value_id || "") && onSave({ value_id: e.target.value })} className={`${inputCls} resize-y border-copper/30`} />
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

const OfficesEditor = ({ items, upsert }) => {
  const block = items.find((b) => b.key === OFFICES_KEY);
  const [list, setList] = useState(parseOffices(block?.value) || DEFAULT_OFFICES);
  useEffect(() => { setList(parseOffices(block?.value) || DEFAULT_OFFICES); }, [block?.value]);
  const persist = (next) => upsert(OFFICES_KEY, { block, page: "footer", section: "offices", label: "Kantor & Kontak", type: "json" }, { value: JSON.stringify(next) });
  const setField = (i, k, v) => setList((l) => l.map((o, j) => (j === i ? { ...o, [k]: v } : o)));
  const fields = [["label", "Judul kantor (mis. Head Quarter · Singapore)"], ["line1", "Alamat baris 1"], ["line2", "Alamat baris 2"], ["phone", "Nomor telepon"]];
  return (
    <div className="space-y-3" data-testid="offices-editor">
      <p className="font-mono text-[10px] text-ash">Kantor pertama tampil sebagai Head Quarter (atas), sisanya berjajar di bawah. Ikon telepon otomatis.</p>
      {list.map((o, i) => (
        <div key={i} data-testid={`office-${i}`} className="border border-white/10 p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-copper">{i === 0 ? "Kantor 1 — Head Quarter" : `Kantor ${i + 1}`}</span>
            {list.length > 1 && <button onClick={() => { const n = list.filter((_, j) => j !== i); setList(n); persist(n); }} data-testid={`office-remove-${i}`} className="text-red-400/70 hover:text-red-400"><Trash2 size={12} /></button>}
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {fields.map(([k, l]) => (
              <div key={k}>
                <label className={lbl}>{l}</label>
                <input value={o[k] || ""} onChange={(e) => setField(i, k, e.target.value)} onBlur={() => persist(list)} data-testid={`office-${i}-${k}`} className={inputCls} />
              </div>
            ))}
          </div>
        </div>
      ))}
      {list.length < MAX_OFFICES && (
        <button onClick={() => { const n = [...list, { label: "New Office", line1: "", line2: "", phone: "" }]; setList(n); persist(n); }} data-testid="office-add"
          className="h-9 px-4 border border-copper/60 text-copper font-mono text-[9px] tracking-[0.2em] uppercase hover:bg-copper hover:text-obsidian transition-colors inline-flex items-center gap-2"><Plus size={12} /> Tambah Kantor</button>
      )}
    </div>
  );
};

const Accordion = ({ title, count, level = 0, children, testid }) => {
  const [open, setOpen] = useState(false);
  return (
    <div data-testid={testid} className={level === 0 ? "border border-white/10 bg-ink mb-3" : "border-t border-white/10"}>
      <button onClick={() => setOpen(!open)} data-testid={`${testid}-toggle`}
        className={`w-full flex items-center justify-between text-left hover:bg-white/5 transition-colors ${level === 0 ? "px-5 py-4" : "px-5 py-3 pl-8"}`}>
        <span className={`font-mono uppercase ${level === 0 ? "text-[11px] tracking-[0.24em] text-copper" : "text-[10px] tracking-[0.2em] text-bone"}`}>
          {title}{count != null && <span className="text-ash ml-2">· {count}</span>}
        </span>
        <ChevronDown size={14} className={`text-ash transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className={level === 0 ? "" : "px-5 pl-8 pb-5 space-y-3"}>{children}</div>}
    </div>
  );
};

export const ContentPanel = ({ client }) => {
  const [items, setItems] = useState([]);
  const refresh = async () => {
    try { const r = await client.get("/content"); setItems(r.data || []); }
    catch (e) { toast.error(errMsg(e, "Gagal memuat konten")); }
  };
  useEffect(() => { refresh(); /* eslint-disable-next-line */ }, []);
  const upsert = useUpsert(client, refresh);
  const byKey = Object.fromEntries(items.map((b) => [b.key, b]));

  return (
    <div data-testid="content-panel">
      <p className="text-ash font-mono text-xs max-w-2xl mb-6">Klik halaman lalu section untuk mengedit. Perubahan langsung tayang. Kolom ID (Bahasa Indonesia) opsional — jika kosong memakai teks bawaan.</p>
      {SCHEMA.map((pg) => (
        <Accordion key={pg.page} title={pg.label} count={pg.sections.length} testid={`content-page-${pg.page}`}>
          {pg.sections.map((sec) => (
            <Accordion key={sec.id} level={1} title={sec.label} testid={`content-section-${sec.id}`}>
              {sec.offices ? <OfficesEditor items={items} upsert={upsert} /> : (
                <>
                  {sec.fields.map((fd, i) => (
                    <BiField key={fd.key} label={fd.label} type={fd.type} block={byKey[fd.key]} placeholder={defaultOf(fd.key)} testid={fd.key}
                      onSave={(p) => upsert(fd.key, { block: byKey[fd.key], page: pg.page, section: sec.id, label: fd.label, type: fd.type, sort: i + 1 }, p)} />
                  ))}
                  {sec.pointers && <Pointers num={sec.pointers} items={items.filter((b) => b.section === sec.id)} client={client} refresh={refresh} upsert={upsert} />}
                </>
              )}
            </Accordion>
          ))}
        </Accordion>
      ))}
    </div>
  );
};
