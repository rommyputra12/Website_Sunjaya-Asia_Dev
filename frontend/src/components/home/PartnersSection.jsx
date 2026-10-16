import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAssets } from "../../context/AssetContext";
import { useLang } from "../../i18n/LanguageContext";
import RichText from "../RichText";
import { Reveal } from "../motion/Reveal";
import { ABOUT_TEXT } from "../../data/aboutDefaults";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";

export const PARTNER_CATEGORIES = [
  { id: "partner", key: "home.partners.cat_partner", label: "Strategic Partners" },
  { id: "vendor", key: "home.partners.cat_vendor", label: "Vendors" },
  { id: "customer", key: "home.partners.cat_customer", label: "Customers" },
];

const PARTNER_TEXT = {
  "home.partners.kicker": "Partners & Clients",
  "home.partners.title": "Trusted by leaders across industries.",
  ...Object.fromEntries(PARTNER_CATEGORIES.map((c) => [c.key, c.label])),
};

// One infinitely scrolling row of logos (list duplicated for a seamless loop)
const LogoRow = ({ label, logos, reverse }) => {
  const loop = logos.length < 6 ? [...logos, ...logos, ...logos] : logos;
  const duration = Math.max(20, loop.length * 4);
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-3 md:gap-6 items-center" data-testid={`partners-row-${label}`}>
      <div className="md:col-span-2 font-mono text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-copper">{label}</div>
      <div className="md:col-span-10 relative overflow-hidden marquee-mask">
        <div className="flex w-max gap-6 md:gap-10 hover:[animation-play-state:paused]"
          style={{ animation: `logo-marquee ${duration}s linear infinite${reverse ? " reverse" : ""}` }}>
          {[0, 1].map((dup) => loop.map((l, i) => (
            <div key={`${dup}-${i}`} aria-hidden={dup === 1} className="group h-16 md:h-20 w-36 md:w-44 shrink-0 grid place-items-center bg-white/[0.04] border border-white/10 px-4">
              <img src={l.url} alt={l.alt || l.key} loading="lazy"
                className="max-h-10 md:max-h-12 max-w-full object-contain grayscale brightness-[1.8] opacity-70 group-hover:grayscale-0 group-hover:brightness-100 group-hover:opacity-100 transition-[filter,opacity] duration-300" />
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
              <h2 className="font-serif text-base md:text-xl leading-[1.15] tracking-[-0.02em] text-bone mt-1.5">{t("home.partners.title")}</h2>
            </Reveal>
            <div className="mt-8 md:mt-10 space-y-6 md:space-y-8">
              {rows.map((r, i) => <LogoRow key={r.id} label={t(r.key)} logos={r.logos} reverse={i % 2 === 1} />)}
            </div>
          </>
        )}

        <Reveal>
          <div id="partnership" className={`${rows.length ? "mt-12 md:mt-16" : ""} border border-copper/40 p-8 md:p-14 bg-gradient-to-br from-ink to-obsidian`}>
            <span className="font-mono text-sm md:text-base tracking-[0.24em] uppercase text-copper">{t("about.partner.kicker")}</span>
            <p className="font-sans text-lg md:text-3xl text-bone mt-4 leading-[1.3] tracking-tight max-w-5xl">
              <RichText text={t("about.partner.text")} accentClass="font-sans text-copper" />
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={() => setOpen(true)} data-testid="partnership-cta"
                className="inline-flex items-center gap-3 px-6 h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-copper-hi transition-colors">
                {t("about.partner.cta")}
              </button>
              <a href={`mailto:${t("about.partner.email")}`} className="inline-flex items-center gap-3 px-6 h-12 border border-white/25 text-bone font-mono text-xs tracking-[0.15em] hover:border-copper transition-colors">
                OR EMAIL TO: {t("about.partner.email")}
              </a>
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
