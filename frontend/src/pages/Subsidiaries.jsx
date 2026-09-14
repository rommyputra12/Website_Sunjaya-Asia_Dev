import React, { useEffect, useState } from "react";
import axios from "axios";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import { SUBSIDIARIES, IMAGES, DEFAULT_LOCATIONS, CERTS } from "../data/content";
import { INFRA_HUBS, InteractiveWorldMap } from "../components/InteractiveWorldMap";
import { useLang } from "../i18n/LanguageContext";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const TIER_ORDER = { branch: 0, subsidiary: 1, affiliate: 2 };

const CITY_COLOR = Object.fromEntries(DEFAULT_LOCATIONS.map((l) => [l.city, l.color]));
const colorForCity = (cityField) => CITY_COLOR[cityField.split(",")[0].trim()] || "#C86230";

const sortedCompanies = [...SUBSIDIARIES].sort(
  (a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9),
);

const subsidiaryCards = sortedCompanies.filter((s) => s.tier !== "affiliate");
const affiliateCards = sortedCompanies.filter((s) => s.tier === "affiliate");

const extractCountry = (city) => {
  const parts = city.split(",");
  return parts[parts.length - 1].trim();
};

const groupByCountry = (items) => {
  const map = new Map();
  items.forEach((s) => {
    const country = extractCountry(s.city);
    if (!map.has(country)) map.set(country, []);
    map.get(country).push(s);
  });
  return Array.from(map.entries()).map(([country, companies]) => ({
    country,
    companies,
  }));
};

const COUNTRY_GROUPS = groupByCountry(subsidiaryCards);
const AFFILIATE_GROUPS = groupByCountry(affiliateCards);

export default function Subsidiaries() {
  const { t } = useLang();
  const [locations, setLocations] = useState(DEFAULT_LOCATIONS);

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${API}/locations`);
        if (Array.isArray(r.data) && r.data.length > 0) setLocations(r.data);
      } catch { /* keep defaults */ }
    })();
  }, []);


  return (
    <div data-testid="subsidiaries-page">
      {/* Dark Azure intro — heading + paragraph only */}
      <div className="bg-azure pt-32 pb-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-x-10 gap-y-6 items-start">
            <div className="md:col-span-5">
              <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">Subsidiaries & Affiliates</span>
              <h1 className="font-serif text-xl md:text-3xl leading-[1.18] tracking-[-0.02em] text-bone mt-8">
                <LineReveal text="An Integrated Ecosystem" delay={0} />
                <br />
                <span className="font-italic-accent text-copper"><LineReveal text="of Industry Pioneers" delay={0.3} /></span>
              </h1>
            </div>
            <div className="md:col-span-7 md:col-start-6 self-start md:pt-[3.75rem]">
              <p className="text-ash text-base md:text-lg leading-[1.75] w-full text-justify">
                Sunjaya Asia Group powers a diversified network of specialized operating units and strategic affiliates engineered to lead key global markets. From <strong className="font-bold italic text-bone">Capital &amp; Wealth Management</strong> and <strong className="font-bold italic text-bone">Environmental &amp; Green Energy</strong> to <strong className="font-bold italic text-bone">Global Commodities Trade</strong>, <strong className="font-bold italic text-bone">IT Product Development</strong>, and <strong className="font-bold italic text-bone">Defense &amp; Military Technology</strong>, our ecosystem combines strategic capital, cutting-edge technology, and operational excellence to deliver high-impact solutions worldwide.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Light section — cards + summary + global presence */}
      <div className="section-light pb-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-20">

        {/* Subsidiary photo boxes — auto-sorted: Branch first, then other subsidiaries */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-px bg-white/10 border border-white/10">
          {subsidiaryCards.map((s, i) => {
            const spans = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3", "md:col-span-4", "md:col-span-2"];
            const heights = ["aspect-[3/2]", "aspect-[3/2]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[3/2]", "aspect-[3/2]", "aspect-[16/9]", "aspect-[4/5]"];
            return (
              <Reveal key={s.id} className={spans[i % spans.length]} delay={i * 0.05}>
                <article data-testid={`sub-card-${s.id}`} className={`on-photo group relative bg-obsidian overflow-hidden ${heights[i % heights.length]} h-full`}>
                  <img
                    src={IMAGES[s.image]}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-obsidian/70 to-transparent" />

                  <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between text-photo-shadow">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorForCity(s.city) }} />
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{s.tag}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.22em]">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="absolute bottom-5 left-6 right-6 z-10 text-photo-shadow">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: colorForCity(s.city) }}>{s.city}</div>
                    <h3 className="font-mono text-sm md:text-base lg:text-lg tracking-[0.08em] leading-snug uppercase">{s.name}</h3>
                    <div className="mt-3 pt-3 border-t border-white/25 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{s.sector}</span>
                      <span
                        className="text-copper group-hover:translate-x-1 transition-transform duration-500"
                        style={{ textShadow: "0 1px 4px rgba(5,30,43,0.9)" }}
                        aria-hidden="true"
                      >→</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        {/* Affiliate photo boxes — auto-sorted: Sunjaya-named affiliates first */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-px bg-white/10 border border-white/10 mt-px">
          {affiliateCards.map((s, i) => {
            const spans = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2"];
            const heights = ["aspect-[3/2]", "aspect-[3/2]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/5]"];
            return (
              <Reveal key={s.id} className={spans[i % spans.length]} delay={i * 0.05}>
                <article data-testid={`sub-card-${s.id}`} className={`on-photo group relative bg-obsidian overflow-hidden ${heights[i % heights.length]} h-full`}>
                  <img
                    src={IMAGES[s.image]}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-obsidian/70 to-transparent" />

                  <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between text-photo-shadow">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorForCity(s.city) }} />
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{s.tag}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.22em]">{String(i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="absolute bottom-5 left-6 right-6 z-10 text-photo-shadow">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: colorForCity(s.city) }}>{s.city}</div>
                    <h3 className="font-mono text-sm md:text-base lg:text-lg tracking-[0.08em] leading-snug uppercase">{s.name}</h3>
                    <div className="mt-3 pt-3 border-t border-white/25 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{s.sector}</span>
                      <span
                        className="text-copper group-hover:translate-x-1 transition-transform duration-500"
                        style={{ textShadow: "0 1px 4px rgba(5,30,43,0.9)" }}
                        aria-hidden="true"
                      >→</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-16 pt-8 border-t border-white/10" data-testid="subsidiaries-summary">
            {/* Parent Company */}
            <div className="mb-10" data-testid="parent-company-block">
              <span className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper">Parent Company</span>
              <p className="font-serif text-base md:text-lg text-bone mt-3 tracking-tight leading-tight uppercase">SUNJAYA ASIA GROUP PTE. LTD.</p>
              <p className="mt-1 font-mono text-[10px] tracking-[0.2em] uppercase text-ash">Singapore · Holding</p>
            </div>

            {/* Subsidiaries grouped by country */}
            <div id="subsidiaries-list" data-testid="subsidiaries-list" className="scroll-mt-20">
              <h2 className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper mb-6">Subsidiaries</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {COUNTRY_GROUPS.map((group) => (
                  <div key={group.country} data-testid={`country-group-${group.country}`}>
                    <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-azure-hi mb-4 pb-2 border-b border-white/10">{group.country}</h3>
                    <ul className="space-y-3">
                      {group.companies.map((s) => (
                        <li key={s.id} className="flex items-start gap-2">
                          <span className="text-copper font-mono text-[10px] tracking-[0.2em] shrink-0 mt-1.5">·</span>
                          <div>
                            <div className="font-serif text-base md:text-lg text-bone tracking-tight leading-tight">{s.name}</div>
                            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mt-0.5">{s.city}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Affiliates grouped by country */}
            <div className="mt-10" data-testid="affiliates-list">
              <h2 className="font-mono text-[11px] tracking-[0.28em] uppercase text-copper mb-6">Affiliates</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {AFFILIATE_GROUPS.map((group) => (
                  <div key={group.country} data-testid={`affiliate-group-${group.country}`}>
                    <h3 className="font-mono text-[10px] tracking-[0.22em] uppercase text-azure-hi mb-4 pb-2 border-b border-white/10">{group.country}</h3>
                    <ul className="space-y-3">
                      {group.companies.map((s) => (
                        <li key={s.id} className="flex items-start gap-2">
                          <span className="text-copper font-mono text-[10px] tracking-[0.2em] shrink-0 mt-1.5">·</span>
                          <div>
                            <div className="font-serif text-base md:text-lg text-bone tracking-tight leading-tight">{s.name}</div>
                            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mt-0.5">{s.city}</div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
      </div>

      {/* Global Presence — dark section with landscape map */}
      <div id="global-presence" className="bg-azure pb-24 pt-4 scroll-mt-20">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
          <div className="md:col-span-6">
            <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">Global Presence</span>
            <h2 className="font-serif text-2xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-bone mt-3">
              <LineReveal text="Operational" />
              <br />
              <span className="font-italic-accent text-copper"><LineReveal text="footprint." delay={0.25} /></span>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 self-end">
            <p className="text-bone/80 text-lg leading-relaxed">{t("presence.sub")}</p>
          </div>
        </div>

        <Reveal>
          <div data-testid="presence-map" className="relative w-full overflow-hidden border border-white/10 bg-azure-lo">
            {/* Landscape aspect ratio — wide enough for detail card to expand without clipping */}
            <div className="relative w-full" style={{ aspectRatio: "16 / 7" }}>
              <InteractiveWorldMap />
            </div>
          </div>
        </Reveal>
      </div>
      </div>

      {/* Certifications */}
      <div className="section-light border-t border-white/10 overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-5 flex flex-col md:flex-row md:items-center gap-3 md:gap-16">
          <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper shrink-0">Certifications</span>
          <div className="flex-1 flex flex-wrap gap-x-8 gap-y-2 md:pl-8">
            {CERTS.map((c) => (
              <span key={c} className="font-mono text-[11px] md:text-xs tracking-[0.2em] uppercase text-ash">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
