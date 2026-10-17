import React, { useState } from "react";
import { toast } from "sonner";
import { Trash2, Upload } from "lucide-react";
import { PARTNER_CATEGORIES, LOGO_TONES } from "../home/PartnersSection";

// Samples the image: transparent → white silhouette, light background → inverted, dark background → grayscale
export const detectTone = (file) => new Promise((resolve) => {
  const img = new Image();
  const url = URL.createObjectURL(file);
  img.onload = () => {
    try {
      const c = document.createElement("canvas");
      const w = (c.width = 64), h = (c.height = Math.max(1, Math.round((64 * img.height) / img.width) || 64));
      const ctx = c.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      const d = ctx.getImageData(0, 0, w, h).data;
      let transparent = 0, edgeLum = 0, edgeN = 0, inkLum = 0, inkN = 0;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4;
        if (d[i + 3] < 30) transparent++;
        else { inkLum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; inkN++; }
        if (x === 0 || y === 0 || x === w - 1 || y === h - 1) { edgeLum += 0.2126 * d[i] + 0.7152 * d[i + 1] + 0.0722 * d[i + 2]; edgeN++; }
      }
      if (transparent / (w * h) > 0.08) resolve(inkN && inkLum / inkN > 215 ? "light" : "white");
      else resolve(edgeLum / edgeN > 140 ? "invert" : "gray");
    } catch { resolve("white"); }
    URL.revokeObjectURL(url);
  };
  img.onerror = () => { URL.revokeObjectURL(url); resolve("white"); };
  img.src = url;
});

const nameFromFile = (f) => f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim().toUpperCase();
const cls = "w-full h-9 bg-obsidian border border-white/15 px-2 font-mono text-[11px] text-bone focus:border-copper focus:outline-none";

export const BulkLogoUpload = ({ client, existingCount, onDone }) => {
  const [rows, setRows] = useState([]);
  const [category, setCategory] = useState("vendor");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);

  const addFiles = async (files) => {
    const list = await Promise.all([...files].map(async (file) => ({
      file, preview: URL.createObjectURL(file), name: nameFromFile(file), category, tone: await detectTone(file),
    })));
    setRows((r) => [...r, ...list]);
  };
  const set = (i, k, v) => setRows((r) => r.map((x, j) => (j === i ? { ...x, [k]: v } : x)));

  const uploadAll = async () => {
    setBusy(true); setProgress(0);
    let ok = 0;
    for (const [i, r] of rows.entries()) {
      try {
        const fd = new FormData();
        fd.append("file", r.file);
        fd.append("key", `logo_${Date.now().toString(36)}_${i}`);
        fd.append("section", "home_partners");
        fd.append("sort_order", String(100 + existingCount + i));
        const res = await client.post("/assets", fd, { headers: { "Content-Type": "multipart/form-data" } });
        await client.put(`/assets/${res.data.id}`, { alt: (r.name.trim() || r.file.name).toUpperCase(), meta: { category: r.category, tone: r.tone } });
        ok++;
      } catch (e) { toast.error(`Gagal: ${r.file.name}`); }
      setProgress(i + 1);
    }
    toast.success(`${ok} logo ter-upload`);
    rows.forEach((r) => URL.revokeObjectURL(r.preview));
    setRows([]); setBusy(false); onDone();
  };

  return (
    <div data-testid="bulk-logo-upload" className="md:col-span-full space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="block font-mono text-[9px] tracking-[0.2em] uppercase text-ash mb-1.5">Kategori default</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} data-testid="bulk-default-category" className={cls}>
            {PARTNER_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </div>
        <label className="md:col-span-2 h-20 border border-dashed border-copper/50 grid place-items-center cursor-pointer hover:bg-copper/5 transition-colors"
          onDragOver={(e) => e.preventDefault()} onDrop={(e) => { e.preventDefault(); addFiles(e.dataTransfer.files); }}>
          <span className="flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] uppercase text-copper"><Upload size={14} /> Pilih / drop banyak logo sekaligus</span>
          <input type="file" accept="image/*" multiple className="hidden" data-testid="bulk-logo-files" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </label>
      </div>

      {rows.length > 0 && (
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} data-testid={`bulk-row-${i}`} className="grid grid-cols-12 gap-3 items-center border border-white/10 p-2">
              <div className="col-span-2 h-14 bg-[#0a2433] grid place-items-center p-2">
                <img src={r.preview} alt="" className="max-h-10 max-w-full object-contain" style={{ filter: LOGO_TONES[r.tone]?.filter, mixBlendMode: LOGO_TONES[r.tone]?.blend }} />
              </div>
              <input value={r.name} onChange={(e) => set(i, "name", e.target.value)} placeholder="Nama" data-testid={`bulk-name-${i}`} className={`${cls} col-span-4 uppercase`} />
              <select value={r.category} onChange={(e) => set(i, "category", e.target.value)} data-testid={`bulk-category-${i}`} className={`${cls} col-span-3`}>
                {PARTNER_CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label.split(" —")[0]}</option>)}
              </select>
              <select value={r.tone} onChange={(e) => set(i, "tone", e.target.value)} data-testid={`bulk-tone-${i}`} className={`${cls} col-span-2`}>
                {Object.entries(LOGO_TONES).map(([id, t]) => <option key={id} value={id}>{t.label}</option>)}
              </select>
              <button type="button" onClick={() => setRows((x) => x.filter((_, j) => j !== i))} className="col-span-1 justify-self-center text-red-400/70 hover:text-red-400"><Trash2 size={14} /></button>
            </div>
          ))}
          <button type="button" onClick={uploadAll} disabled={busy} data-testid="bulk-upload-submit"
            className="h-10 px-6 bg-copper text-obsidian font-mono text-[10px] tracking-[0.22em] uppercase hover:bg-copper-hi transition-colors disabled:opacity-50">
            {busy ? `Uploading ${progress}/${rows.length}…` : `Upload ${rows.length} logo`}
          </button>
        </div>
      )}
    </div>
  );
};

export default BulkLogoUpload;
