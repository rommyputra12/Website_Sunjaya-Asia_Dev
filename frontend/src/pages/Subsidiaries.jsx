import React, { useEffect, useState } from "react";
import axios from "axios";
import { Reveal } from "../components/motion/Reveal";
import { SUBSIDIARIES, DEFAULT_LOCATIONS } from "../data/content";
import AssetImg from "../components/AssetImg";
import { InteractiveWorldMap } from "../components/InteractiveWorldMap";
import { useLang } from "../i18n/LanguageContext";
import { useAssets } from "../context/AssetContext";
import { Fmt } from "../components/FormattedText";
import { LineArt } from "../components/LineArt";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const TIER_ORDER = { branch: 0, subsidiary: 1, affiliate: 2 };

const CITY_COLOR = Object.fromEntries(DEFAULT_LOCATIONS.map((l) => [l.city, l.color]));
const colorForCity = (cityField) => CITY_COLOR[cityField.split(",")[0].trim()] || "#C86230";

const sortedCompanies = [...SUBSIDIARIES].sort(
  (a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9),
);

const subsidiaryCards = sortedCompanies.filter((s) => s.tier !== "affiliate");
const affiliateCards = sortedCompanies.filter((s) => s.tier === "affiliate");
const AFF_START = subsidiaryCards.length + 1; // affiliates continue numbering after all branches

const extractCountry = (city) => {
  const parts = city.split(",");
  return parts[parts.length - 1].trim();
};

const groupByCountry = (items, countryOf = (s) => extractCountry(s.city)) => {
  const map = new Map();
  items.forEach((s) => {
    const country = countryOf(s);
    if (!map.has(country)) map.set(country, []);
    map.get(country).push(s);
  });
  return Array.from(map.entries()).map(([country, companies]) => ({
    country,
    companies,
  }));
};


const SumHeading = ({ title, count }) => (
  <div className="flex items-center gap-4 md:gap-5 mb-8">
    <h2 className="font-mono text-base md:text-xl font-bold tracking-[0.24em] uppercase text-copper whitespace-nowrap">{title}</h2>
    {count != null && <span className="font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-ash whitespace-nowrap">{String(count).padStart(2, "0")} {count === 1 ? "entity" : "entities"}</span>}
  </div>
);

const focusCard = (id) => {
  const el = document.querySelector(`[data-testid="sub-card-${id}"]`);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "center" });
  el.classList.remove("card-flash");
  void el.offsetWidth;
  el.classList.add("card-flash");
  setTimeout(() => el.classList.remove("card-flash"), 2600);
};

const CompanyGroups = ({ id, testid, title, groups, cols, prefix, placeOf }) => {
  const { t } = useLang();
  const total = groups.reduce((n, g) => n + g.companies.length, 0);
  return (
    <div id={id} data-testid={testid || id} className="scroll-mt-20">
      <div aria-hidden="true" className="my-12 md:my-14 h-px w-full bg-gradient-to-r from-copper/60 via-copper/25 to-transparent" />
      <SumHeading title={title} count={total} />
      <div className={`grid grid-cols-1 ${cols} gap-x-10 gap-y-10`}>
        {groups.map((group) => (
          <div key={group.country} data-testid={`${prefix}-${group.country}`}>
            <div className="flex items-baseline justify-between gap-3 pb-3 mb-5 border-b sum-line">
              <h3 className="flex items-center gap-2.5 font-serif text-lg md:text-xl text-bone tracking-tight">
                <span aria-hidden="true" className="w-1.5 h-1.5 rotate-45 bg-copper" />{group.country}
              </h3>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-ash">{group.companies.length} {group.companies.length === 1 ? "company" : "companies"}</span>
            </div>
            <ul className="space-y-4">
              {group.companies.map((s) => (
                <li key={s.id}>
                <button type="button" data-testid={`summary-item-${s.id}`} onClick={() => focusCard(s.id)} title="Lihat kartu perusahaan" className="group/co flex items-start gap-3 text-left cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-copper rounded-sm">
                  <span className="relative mt-[9px] flex w-2 h-2 shrink-0">
                    <span className="absolute inset-0 rounded-full opacity-0 scale-100 transition-[opacity,transform] duration-500 group-hover/co:opacity-40 group-hover/co:scale-[2.2]" style={{ background: colorForCity(s.city) }} />
                    <span className="relative w-2 h-2 rounded-full" style={{ background: colorForCity(s.city) }} />
                  </span>
                  <div className="min-w-0">
                    <div className="relative inline-block font-serif text-base md:text-lg text-bone tracking-tight leading-tight transition-colors duration-300 group-hover/co:text-copper">
                      {t(`subsidiary.${s.id}.name`, s.name)}
                      <span aria-hidden="true" className="absolute left-0 -bottom-1 h-[1.5px] w-full origin-left scale-x-0 bg-gradient-to-r from-copper to-copper/30 transition-transform duration-500 group-hover/co:scale-x-100" />
                    </div>
                    <div className="font-mono text-[9px] md:text-[10px] tracking-[0.2em] uppercase text-ash mt-1.5">{placeOf(s)}</div>
                  </div>
                </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default function Subsidiaries() {
  const { t } = useLang();
  const { byKey } = useAssets();
  const cmsOrder = (s) => byKey[s.image]?.sort_order ?? 100;
  const orderCards = (arr) => [...arr].sort((a, b) => cmsOrder(a) - cmsOrder(b));
  // Country lists use the CMS card texts (Images tab) so edits show here too
  const countryOf = (s) => t(`subsidiary.${s.id}.country`, extractCountry(s.city));
  const placeOf = (s) => [t(`subsidiary.${s.id}.city`, s.city.split(",")[0].trim()), countryOf(s)].filter(Boolean).join(", ");
  const COUNTRY_GROUPS = groupByCountry(orderCards(subsidiaryCards), countryOf);
  const AFFILIATE_GROUPS = groupByCountry(orderCards(affiliateCards), countryOf);


  return (
    <div data-testid="subsidiaries-page">
      {/* Dark Azure intro — kicker, subtitle, paragraph over modern line art */}
      <div data-testid="subsidiaries-intro" className="relative overflow-hidden bg-azure pt-32 pb-16 md:pt-36 md:pb-20">
        <LineArt className="absolute inset-y-0 right-0 w-full md:w-[70%] h-full opacity-90" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-[#051e2b] via-[#051e2b]/85 to-transparent" />
        <div className="relative max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="max-w-3xl">
            <span data-testid="subsidiaries-kicker" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">Subsidiaries & Affiliates</span>
            <h1 data-testid="subsidiaries-title" className="mt-4 font-serif text-xl md:text-3xl leading-[1.2] tracking-[-0.02em] text-bone">
              An Integrated Ecosystem of Industry Pioneers
            </h1>
            <p data-testid="subsidiaries-desc" className="mt-6 md:mt-8 text-ash text-sm md:text-base leading-[1.85] text-left md:text-justify">
              Sunjaya Asia Group powers a diversified network of specialized operating units and strategic affiliates engineered to lead key global markets. From <strong className="font-bold italic text-bone">Capital &amp; Wealth Management</strong> and <strong className="font-bold italic text-bone">Environmental &amp; Green Energy</strong> to <strong className="font-bold italic text-bone">Global Commodities Trade</strong>, <strong className="font-bold italic text-bone">IT Product Development</strong>, and <strong className="font-bold italic text-bone">Defense &amp; Military Technology</strong>, our ecosystem combines strategic capital, cutting-edge technology, and operational excellence to deliver high-impact solutions worldwide.
            </p>
          </div>
        </div>
      </div>

      {/* Light section — cards + summary + global presence */}
      <div className="section-light pb-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-20">

        {/* Subsidiary photo boxes — auto-sorted: Branch first, then other subsidiaries */}
        <div data-testid="subsidiary-grid" className="grid grid-cols-1 md:grid-cols-6 gap-px bg-white/10 border border-white/10">
          {orderCards(subsidiaryCards).map((s, i) => {
            const spans = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2", "md:col-span-3", "md:col-span-3", "md:col-span-4", "md:col-span-2"];
            const heights = ["aspect-[3/2]", "aspect-[3/2]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[3/2]", "aspect-[3/2]", "aspect-[16/9]", "aspect-[4/5]"];
            return (
              <div key={s.id} className={spans[i % spans.length]}>
                <article data-testid={`sub-card-${s.id}`} className={`on-photo group relative bg-obsidian overflow-hidden ${heights[i % heights.length]} h-full`}>
                  <AssetImg
                    k={s.image}
                    sizes="(max-width: 768px) 100vw, 50vw"
                    loading={i < 2 ? "eager" : "lazy"}
                    fetchPriority={i < 2 ? "high" : "auto"}
                    alt={t(`subsidiary.${s.id}.name`, s.name)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-obsidian/70 to-transparent" />

                  <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between text-photo-shadow">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorForCity(s.city) }} />
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{t(`subsidiary.${s.id}.tag`, s.tag)}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.22em]">{String(s.tier === "affiliate" ? AFF_START + i : i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="absolute bottom-5 left-6 right-6 z-10 text-photo-shadow">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: colorForCity(s.city) }}>{t(`subsidiary.${s.id}.city`, s.city)}</div>
                    <h3 className="font-mono text-sm md:text-base lg:text-lg tracking-[0.08em] leading-snug uppercase">{t(`subsidiary.${s.id}.name`, s.name)}</h3>
                    <div className="mt-1.5 font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-bone/75">
                      {t(`subsidiary.${s.id}.country`, s.city.split(",")[1]?.trim() || "")}{s.city.includes(",") ? " · " : ""}{t(`subsidiary.${s.id}.role`, s.role)}
                    </div>
                    <div className="mt-3 pt-3 border-t border-white/25 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{t(`subsidiary.${s.id}.sector`, s.sector)}</span>
                      <span
                        className="text-copper group-hover:translate-x-1 transition-transform duration-500"
                        style={{ textShadow: "0 1px 4px rgba(5,30,43,0.9)" }}
                        aria-hidden="true"
                      >→</span>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        {/* Affiliate photo boxes — auto-sorted: Sunjaya-named affiliates first */}
        <div data-testid="affiliate-grid" className="grid grid-cols-1 md:grid-cols-6 gap-px bg-white/10 border border-white/10 mt-px">
          {orderCards(affiliateCards).map((s, i) => {
            const spans = ["md:col-span-3", "md:col-span-3", "md:col-span-2", "md:col-span-2", "md:col-span-2"];
            const heights = ["aspect-[3/2]", "aspect-[3/2]", "aspect-[4/5]", "aspect-[4/5]", "aspect-[4/5]"];
            return (
              <div key={s.id} className={spans[i % spans.length]}>
                <article data-testid={`sub-card-${s.id}`} className={`on-photo group relative bg-obsidian overflow-hidden ${heights[i % heights.length]} h-full`}>
                  <AssetImg
                    k={s.image}
                    sizes="(max-width: 768px) 100vw, 33vw"
                    alt={t(`subsidiary.${s.id}.name`, s.name)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-obsidian/70 to-transparent" />

                  <div className="absolute top-5 left-5 right-5 z-10 flex items-center justify-between text-photo-shadow">
                    <div className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full" style={{ background: colorForCity(s.city) }} />
                      <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{t(`subsidiary.${s.id}.tag`, s.tag)}</span>
                    </div>
                    <span className="font-mono text-[10px] tracking-[0.22em]">{String(s.tier === "affiliate" ? AFF_START + i : i + 1).padStart(2, "0")}</span>
                  </div>

                  <div className="absolute bottom-5 left-6 right-6 z-10 text-photo-shadow">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase mb-1" style={{ color: colorForCity(s.city) }}>{t(`subsidiary.${s.id}.city`, s.city)}</div>
                    <h3 className="font-mono text-sm md:text-base lg:text-lg tracking-[0.08em] leading-snug uppercase">{t(`subsidiary.${s.id}.name`, s.name)}</h3>
                    <div className="mt-3 pt-3 border-t border-white/25 flex items-center justify-between gap-3">
                      <span className="font-mono text-[10px] tracking-[0.2em] uppercase">{t(`subsidiary.${s.id}.sector`, s.sector)}</span>
                      <span
                        className="text-copper group-hover:translate-x-1 transition-transform duration-500"
                        style={{ textShadow: "0 1px 4px rgba(5,30,43,0.9)" }}
                        aria-hidden="true"
                      >→</span>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
        </div>

        <Reveal>
          <div className="mt-20 md:mt-24" data-testid="subsidiaries-summary">
            {/* Parent Company */}
            <div data-testid="parent-company-block" className="relative">
              <SumHeading title="Parent Company" />
              <div className="group/pc flex flex-col gap-2">
                <p className="font-serif text-base md:text-lg text-bone tracking-tight leading-tight uppercase transition-colors duration-300 group-hover/pc:text-copper">SUNJAYA ASIA GROUP PTE. LTD.</p>
                <div className="flex items-center gap-3">
                  <span aria-hidden="true" className="w-6 h-px bg-copper/60" />
                  <span className="font-mono text-[10px] md:text-[11px] tracking-[0.24em] uppercase text-copper/90">Singapore · Holding</span>
                </div>
              </div>
            </div>

            <CompanyGroups id="subsidiaries-list" title="Subsidiaries" groups={COUNTRY_GROUPS} cols="md:grid-cols-3" prefix="country-group" placeOf={placeOf} />
            <CompanyGroups title="Affiliates" testid="affiliates-list" groups={AFFILIATE_GROUPS} cols="md:grid-cols-2" prefix="affiliate-group" placeOf={placeOf} />
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
              Operational
              <br />
              <span className="font-italic-accent text-copper">footprint.</span>
            </h2>
          </div>
          <div className="md:col-span-5 md:col-start-8 self-end">
            <p className="text-bone/80 text-lg leading-relaxed"><Fmt text={t("presence.sub")} /></p>
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
    </div>
  );
}
