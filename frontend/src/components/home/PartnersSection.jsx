import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAssets } from "../../context/AssetContext";
import { useLang } from "../../i18n/LanguageContext";
import RichText from "../RichText";
import { Reveal } from "../motion/Reveal";
import { ABOUT_TEXT } from "../../data/aboutDefaults";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { variantUrl } from "../../lib/media";

// Categories are for CMS grouping only — each becomes one marquee row (no label shown publicly)
export const PARTNER_CATEGORIES = [
  { id: "vendor", label: "Brand — Producer/Produsen, Principals, Supplier, Distributor" },
  { id: "partner", label: "Partners — Affiliates/JO Company, Investors, Government, Departments, Organizations" },
  { id: "customer", label: "Customers / Clients" },
];
const CAT_RANK = Object.fromEntries(PARTNER_CATEGORIES.map((c, i) => [c.id, i]));

// Display tone so every logo reads on the dark background; original colours return on hover
export const LOGO_TONES = {
  white: { label: "Putih (auto)", filter: "brightness(0) invert(1)" },
  invert: { label: "Invert (latar terang)", filter: "grayscale(1) invert(1)", blend: "screen" },
  gray: { label: "Grayscale", filter: "grayscale(1) brightness(1.3)" },
  dark: { label: "Gelap", filter: "brightness(0) invert(0.15)" },
  original: { label: "Warna asli", filter: "none" },
  mono: { label: "Monokrom putih (detail tetap)", filter: "none" },
  light: { label: "Logo asli putih/terang", filter: "none", hover: "brightness(0) invert(0.15)" },
};

// Logo fitted to its tile, honouring the CMS crop (focal point + zoom) and display tone
// "Monokrom putih": colours -> solid white; neutral greys split at an auto (Otsu) threshold:
// lighter than it (white/silver) -> transparent cut-out, darker -> white. adj shifts the threshold.
const monoCache = new Map();
const otsu = (hist, n) => {
  let sum = 0; for (let v = 0; v < 256; v++) sum += v * hist[v];
  let sB = 0, wB = 0, best = 0, t = 128;
  for (let v = 0; v < 256; v++) {
    wB += hist[v]; if (!wB) continue; const wF = n - wB; if (!wF) break;
    sB += v * hist[v]; const d = sB / wB - (sum - sB) / wF, between = wB * wF * d * d;
    if (between > best) { best = between; t = v; }
  }
  return t / 255;
};
// Trim transparent margins (and optionally apply "Monokrom putih") once per image; cached by URL.
// Mono: colours -> white; neutral greys split at an auto (Otsu) threshold: lighter -> cut-out, darker -> white.
const processLogo = (url, mono, adj = 0) => {
  const key = `${url}|${mono ? adj : "-"}`;
  if (monoCache.has(key)) return monoCache.get(key);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const sc = Math.min(1, 900 / Math.max(img.width, img.height));
        const W = Math.round(img.width * sc), H = Math.round(img.height * sc);
        const c = document.createElement("canvas"); c.width = W; c.height = H;
        const ctx = c.getContext("2d"); ctx.drawImage(img, 0, 0, W, H);
        const all = ctx.getImageData(0, 0, W, H).data;
        let x0 = W, y0 = H, x1 = -1, y1 = -1;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (all[(y * W + x) * 4 + 3] > 16) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
        if (x1 < 0) { x0 = 0; y0 = 0; x1 = W - 1; y1 = H - 1; }
        const w = x1 - x0 + 1, h = y1 - y0 + 1;
        const t = document.createElement("canvas"); t.width = w; t.height = h;
        const tc = t.getContext("2d"); tc.drawImage(c, x0, y0, w, h, 0, 0, w, h);
        const orig = t.toDataURL("image/png");
        let monoSrc = null;
        if (mono) {
          const id = tc.getImageData(0, 0, w, h), d = id.data;
          const hist = new Uint32Array(256); let n = 0;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i], g = d[i + 1], b = d[i + 2];
            if (d[i + 3] > 128 && Math.max(r, g, b) - Math.min(r, g, b) < 51) { hist[Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b)]++; n++; }
          }
          const pct = (q) => { let acc = 0; for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= q * n) return v / 255; } return 1; };
          const hi = n > 50 ? pct(0.98) : 1;
          const th = (n > 50 && hi - pct(0.05) > 0.35 ? otsu(hist, n) : hi - 0.175) + adj / 100;
          const soft = 0.06;
          for (let i = 0; i < d.length; i += 4) {
            const r = d[i] / 255, g = d[i + 1] / 255, b = d[i + 2] / 255;
            const sat = Math.max(r, g, b) - Math.min(r, g, b);
            const f = sat >= 0.2 ? 1 : Math.min(1, Math.max(0, (th + soft - (0.2126 * r + 0.7152 * g + 0.0722 * b)) / (2 * soft)));
            d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = Math.round(d[i + 3] * f);
          }
          tc.putImageData(id, 0, 0);
          monoSrc = t.toDataURL("image/png");
        }
        resolve({ orig, mono: monoSrc, ratio: w / h });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  monoCache.set(key, p);
  return p;
};

const useLogo = (url, mono, adj) => {
  const [res, setRes] = useState(null);
  useEffect(() => { let live = true; processLogo(url, mono, adj).then((r) => live && setRes(r || "fail")); return () => { live = false; }; }, [url, mono, adj]);
  return res;
};

// Optical sizing inside a 2:1 tile: equal visual weight for every logo shape.
// Square/tall logos get less height, wide logos never touch the edges. Values are % of the tile.
const LOGO_FILL = 0.78;
const opticalBox = (ratio) => {
  const h = Math.min(LOGO_FILL, 0.62 * Math.pow(ratio, -0.4)); // share of tile height
  const w = Math.min(LOGO_FILL, (h * ratio) / 2);             // share of tile width (tile is 2:1)
  return { w: w * 100, h: (Math.min(h, (w * 2) / ratio)) * 100 };
};

export const LogoImg = ({ asset, style }) => {
  const isMono = asset.meta?.tone === "mono";
  const cdnUrl = variantUrl(asset, 640);
  const res = useLogo(cdnUrl, isMono, Number(asset.meta?.mono_adj) || 0);
  const tone = LOGO_TONES[asset.meta?.tone] || LOGO_TONES.white;
  const zoom = asset.zoom ?? 1;
  const ready = res && res !== "fail";
  const box = ready ? opticalBox(res.ratio) : { w: LOGO_FILL * 100, h: LOGO_FILL * 100 };
  const wrap = { width: `${box.w}%`, height: `${box.h}%`, transform: `translate(-50%, -50%) scale(${zoom})`, ...style };
  const cls = "absolute inset-0 w-full h-full object-contain";
  const src = ready ? res.orig : cdnUrl;
  return (
    <div data-testid="partner-logo-box" className="absolute left-1/2 top-1/2" style={wrap}>
      {isMono && ready && res.mono ? (
        <>
          <img src={res.mono} alt="" aria-hidden="true" draggable={false} className={`logo-mono-proc ${cls}`} />
          <img src={src} alt={asset.alt || asset.key} draggable={false} data-tone="mono" className={`logo-mono-orig ${cls}`} />
        </>
      ) : (
        <img src={src} alt={asset.alt || asset.key} loading="lazy" draggable={false} data-tone={asset.meta?.tone || "white"}
          className={`logo-tone ${cls} ${isMono && !ready && res !== "fail" ? "opacity-0" : ""}`}
          style={{ "--logo-filter": isMono ? "none" : tone.filter, "--logo-hover": tone.hover || "none", mixBlendMode: isMono ? undefined : tone.blend }} />
      )}
    </div>
  );
};

export const PARTNER_TEXT = {
  "home.partners.kicker": "Partners & Global Alliances",
  "home.partners.title": "Collaborating with global industry leaders, government stakeholders, R&D institutions, technology pioneers, and civil society organizations.",
};

// One infinitely scrolling row of logos (list duplicated for a seamless loop)
// One infinitely scrolling row; constant speed (px/s) on every row, GPU-composited for smoothness
const TILE_W = 248; // px incl. gap (md)
const LogoRow = ({ id, logos, reverse }) => {
  const loop = Array.from({ length: Math.max(1, Math.ceil(8 / logos.length)) }, () => logos).flat();
  const tileW = typeof window !== "undefined" && window.matchMedia("(min-width: 768px)").matches ? TILE_W : 208;
  const duration = (loop.length * tileW) / 40; // 40px per second on every screen
  return (
    <div data-testid={`partners-row-${id}`} className="relative overflow-hidden marquee-mask">
      <div className="logo-track flex w-max" style={{ animationDuration: `${duration}s`, animationDirection: reverse ? "reverse" : "normal" }}>
        {[0, 1].map((dup) => (
          <div key={dup} aria-hidden={dup === 1} className="flex shrink-0 gap-4 md:gap-6 pr-4 md:pr-6">
            {loop.map((l, i) => (
              <div key={i} tabIndex={dup ? -1 : 0} className="group w-48 md:w-56 shrink-0 flex flex-col items-center gap-2 outline-none focus-visible:outline-none cursor-pointer">
                <div data-testid="partner-logo-tile" className="logo-tile relative aspect-[2/1] w-full overflow-hidden rounded-[10px] border border-white/10">
                  <div className="absolute inset-[3px]"><LogoImg asset={l} /></div>
                </div>
                {l.alt && <span data-testid="partner-logo-name" className="font-mono text-[9px] md:text-[10px] tracking-[0.14em] uppercase text-bone/70 group-hover:text-copper group-hover:font-semibold group-focus-within:text-copper group-focus-within:font-semibold text-center leading-tight line-clamp-2 transition-colors duration-300">{l.alt}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const PartnersSection = () => {
  const { assets = [] } = useAssets();
  const { t: tr } = useLang();
  const t = (k) => tr(k, PARTNER_TEXT[k] ?? ABOUT_TEXT[k]);
  const [open, setOpen] = useState(false);
  // CMS order: Brand group → Partners → Customers, each by its own number; publicly mixed (no category labels)
  const logos = assets.filter((a) => a.section === "home_partners")
    .sort((a, b) => (CAT_RANK[a.meta?.category || "partner"] ?? 9) - (CAT_RANK[b.meta?.category || "partner"] ?? 9) || (a.sort_order ?? 100) - (b.sort_order ?? 100) || a.key.localeCompare(b.key));
  const rowCount = logos.length >= 9 ? 3 : logos.length >= 4 ? 2 : logos.length ? 1 : 0;
  const per = Math.ceil(logos.length / (rowCount || 1));
  const rows = Array.from({ length: rowCount }, (_, i) => ({ id: `row${i + 1}`, logos: logos.slice(i * per, (i + 1) * per) })).filter((r) => r.logos.length);

  return (
    <section id="partners" data-testid="home-partners" className="snap-section relative min-h-screen pt-24 md:pt-28 pb-16 flex flex-col justify-center overflow-hidden bg-obsidian border-t border-copper/30">
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 w-full">
        {rows.length > 0 && (
          <>
            <Reveal>
              <span className="font-mono text-lg md:text-xl tracking-[0.28em] uppercase text-copper font-bold">{t("home.partners.kicker")}</span>
              <h2 className="font-serif text-base md:text-xl leading-[1.35] tracking-[-0.02em] text-bone/90 mt-2 max-w-3xl">{t("home.partners.title")}</h2>
            </Reveal>
            <div className="mt-8 md:mt-10 space-y-6 md:space-y-8">
              {rows.map((r, i) => <LogoRow key={r.id} id={r.id} logos={r.logos} reverse={i % 2 === 1} />)}
            </div>
          </>
        )}

        <Reveal>
          <div id="partnership" data-testid="partnership-box"
            className={`${rows.length ? "mt-12 md:mt-16" : ""} group/box relative overflow-hidden border border-white/10 bg-[#0a2231]`}>
            {/* accents */}
            <span className="absolute left-0 top-0 h-full w-[3px] bg-gradient-to-b from-copper via-copper/40 to-transparent" />
            <span className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-copper/10 blur-3xl transition-opacity duration-700 group-hover/box:opacity-80" />
            <span className="pointer-events-none absolute inset-0 opacity-[0.06]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

            <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center p-7 md:p-10 lg:p-12">
              <div className="lg:col-span-8">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-copper" />
                  <span className="font-mono text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-copper">{t("about.partner.kicker")}</span>
                </div>
                <p className="mt-5 font-serif text-lg md:text-xl lg:text-[1.7rem] text-bone/90 leading-[1.45] tracking-[-0.01em] max-w-3xl">
                  <RichText text={t("about.partner.text")} accentClass="italic text-copper" />
                </p>
              </div>

              <div className="lg:col-span-4 flex flex-col gap-3 lg:border-l lg:border-white/10 lg:pl-10">
                <button onClick={() => setOpen(true)} data-testid="partnership-cta"
                  className="group/btn inline-flex items-center justify-between gap-4 h-12 px-5 bg-copper text-obsidian font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase hover:bg-copper-hi transition-colors">
                  <span>{t("about.partner.cta").replace(/\s*→\s*$/, "")}</span>
                  <span className="transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
                </button>
                <a href={`mailto:${t("about.partner.email")}`} data-testid="partnership-email"
                  className="group/mail flex flex-col gap-1 px-5 py-3 border border-white/15 hover:border-copper/60 transition-colors">
                  <span className="font-mono text-[9px] tracking-[0.24em] uppercase text-ash">Or email us</span>
                  <span className="font-mono text-xs md:text-[13px] text-bone group-hover/mail:text-copper transition-colors">{t("about.partner.email")}</span>
                </a>
              </div>
            </div>
          </div>
        </Reveal>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-xl bg-ink border-copper/30">
          <DialogHeader>
            <DialogTitle className="font-mono text-sm tracking-[0.24em] uppercase text-copper">Send Request for Partnership</DialogTitle>
            <DialogDescription className="font-serif text-bone/80 text-base leading-relaxed">
              Tell us about your initiative — our team will get back to you.
            </DialogDescription>
          </DialogHeader>
          <Link to="/contact" onClick={() => setOpen(false)} className="inline-flex justify-center items-center h-11 bg-copper text-obsidian font-mono text-[11px] tracking-[0.2em] uppercase">Go to contact form →</Link>
        </DialogContent>
      </Dialog>
    </section>
  );
};

export default PartnersSection;
