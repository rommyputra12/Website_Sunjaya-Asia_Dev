import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAssets } from "../../context/AssetContext";
import { useLang } from "../../i18n/LanguageContext";
import RichText from "../RichText";
import { Reveal } from "../motion/Reveal";
import { ABOUT_TEXT } from "../../data/aboutDefaults";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

// Categories are for CMS grouping only — each becomes one marquee row (no label shown publicly)
export const PARTNER_CATEGORIES = [
  { id: "partner", label: "Partners — Affiliates/JO Company, Investors, Government, Departments, Organizations" },
  { id: "vendor", label: "Brand — Producer/Produsen, Principals, Supplier, Distributor" },
  { id: "customer", label: "Customers / Clients" },
];

// Display tone so every logo reads on the dark background; original colours return on hover
export const LOGO_TONES = {
  white: { label: "Putih (auto)", filter: "brightness(0) invert(1)" },
  invert: { label: "Invert (latar terang)", filter: "grayscale(1) invert(1)", blend: "screen" },
  gray: { label: "Grayscale", filter: "grayscale(1) brightness(1.3)" },
  dark: { label: "Gelap", filter: "brightness(0) invert(0.15)" },
  original: { label: "Warna asli", filter: "none" },
};

// Logo fitted to its tile, honouring the CMS crop (focal point + zoom) and display tone
export const LogoImg = ({ asset, style }) => {
  const tone = LOGO_TONES[asset.meta?.tone] || LOGO_TONES.white;
  const fx = asset.focal_x ?? 50, fy = asset.focal_y ?? 50, zoom = asset.zoom ?? 1;
  return (
    <img src={asset.url} alt={asset.alt || asset.key} loading="lazy" draggable={false} data-tone={asset.meta?.tone || "white"}
      className="logo-tone absolute inset-0 w-full h-full object-contain"
      style={{ "--logo-filter": tone.filter, mixBlendMode: tone.blend, objectPosition: `${fx}% ${fy}%`, transform: `scale(${zoom})`, transformOrigin: `${fx}% ${fy}%`, ...style }} />
  );
};

const PARTNER_TEXT = {
  "home.partners.kicker": "Partners & Global Alliances",
  "home.partners.title": "Collaborating with global industry leaders, government stakeholders, R&D institutions, technology pioneers, and civil society organizations.",
};

// One infinitely scrolling row of logos (list duplicated for a seamless loop)
const LogoRow = ({ id, logos, reverse }) => {
  const loop = logos.length < 6 ? [...logos, ...logos, ...logos] : logos;
  const duration = Math.max(20, loop.length * 4);
  return (
    <div data-testid={`partners-row-${id}`}>
      <div className="relative overflow-hidden marquee-mask">
        <div className="flex w-max gap-6 md:gap-10 hover:[animation-play-state:paused]"
          style={{ animation: `logo-marquee ${duration}s linear infinite${reverse ? " reverse" : ""}` }}>
          {[0, 1].map((dup) => loop.map((l, i) => (
            <div key={`${dup}-${i}`} aria-hidden={dup === 1} className="group w-44 md:w-56 shrink-0 flex flex-col items-center gap-2">
              <div data-testid="partner-logo-tile" className="relative aspect-[13/6] w-full overflow-hidden bg-[#0c2635] border border-white/10 group-hover:border-copper/50 transition-colors duration-300">
                <div className="absolute inset-2 md:inset-3 opacity-90 group-hover:opacity-100 transition-opacity duration-300"><LogoImg asset={l} /></div>
              </div>
              {l.alt && <span className="font-mono text-[9px] md:text-[10px] tracking-[0.14em] uppercase text-bone/60 group-hover:text-bone text-center leading-tight line-clamp-2 transition-colors">{l.alt}</span>}
            </div>
          )))}
        </div>
      </div>
    </div>
  );
};

export const PartnersSection = () => {
  const { assets = [] } = useAssets();
  const { t: tr } = useLang();
  const t = (k) => tr(k, PARTNER_TEXT[k] ?? ABOUT_TEXT[k]);
  const [open, setOpen] = useState(false);
  const logos = assets.filter((a) => a.section === "home_partners").sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100));
  const rows = PARTNER_CATEGORIES.map((c) => ({ ...c, logos: logos.filter((l) => (l.meta?.category || "partner") === c.id) })).filter((r) => r.logos.length);

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
