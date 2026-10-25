import React, { useEffect, useState } from "react";
import axios from "axios";
import { Reveal } from "../components/motion/Reveal";
import { SUBSIDIARIES, DEFAULT_LOCATIONS } from "../data/content";
import AssetImg from "../components/AssetImg";
import { InteractiveWorldMap } from "../components/InteractiveWorldMap";
import { useLang } from "../i18n/LanguageContext";
import { useAssets } from "../context/AssetContext";
import { Fmt } from "../components/FormattedText";

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


const CompanyCard = ({ s, num, priority = false, showRole = false }) => {
  const { t } = useLang();
  const color = colorForCity(s.city);
  return (
    <article data-testid={`sub-card-${s.id}`} className="sub-card group relative flex flex-col overflow-hidden rounded-[12px] transition-[transform,box-shadow,border-color] duration-500 hover:-translate-y-1">
      <div className="on-photo relative aspect-[3/2] overflow-hidden bg-obsidian">
        <AssetImg
          k={s.image}
          sizes="(max-width: 768px) 100vw, 50vw"
          loading={priority ? "eager" : "lazy"}
          fetchPriority={priority ? "high" : "auto"}
          alt={t(`subsidiary.${s.id}.name`, s.name)}
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-obsidian/70 to-transparent" />
        <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between text-photo-shadow">
          <span className="sub-chip flex items-center gap-2 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
            <span className="font-mono text-[10px] tracking-[0.22em] uppercase">{t(`subsidiary.${s.id}.tag`, s.tag)}</span>
          </span>
          <span className="sub-chip rounded-full px-2.5 py-1 font-mono text-[10px] tracking-[0.22em]">{String(num).padStart(2, "0")}</span>
        </div>
      </div>
      <span aria-hidden="true" className="h-[2px] w-full origin-left scale-x-0 bg-gradient-to-r from-copper to-copper/30 transition-transform duration-500 group-hover:scale-x-100" />
      <div className="flex flex-1 flex-col px-6 pt-5 pb-5">
        <div className="flex items-center gap-2 font-mono text-[10px] tracking-[0.22em] uppercase text-ash">
          <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
          {t(`subsidiary.${s.id}.city`, s.city)}
        </div>
        <h3 className="mt-2 font-mono text-sm md:text-base lg:text-lg tracking-[0.08em] leading-snug uppercase text-bone">{t(`subsidiary.${s.id}.name`, s.name)}</h3>
        {showRole && (
          <div className="mt-1.5 font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-ash">
            {t(`subsidiary.${s.id}.country`, s.city.split(",")[1]?.trim() || "")}{s.city.includes(",") ? " · " : ""}{t(`subsidiary.${s.id}.role`, s.role)}
          </div>
        )}
        <div className="mt-auto pt-4">
          <div className="pt-3 border-t sub-divider flex items-center justify-between gap-3">
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-bone/80">{t(`subsidiary.${s.id}.sector`, s.sector)}</span>
            <span className="text-copper transition-transform duration-500 group-hover:translate-x-1" aria-hidden="true">→</span>
          </div>
        </div>
      </div>
    </article>
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
      {/* Dark Azure intro — heading + paragraph only */}
      <div data-testid="subsidiaries-intro" className="bg-azure pt-32 pb-16 md:pb-20">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10">
          <div className="flex items-center gap-4 md:gap-5">
            <span className="font-mono text-sm md:text-lg font-bold tracking-[0.2em] md:tracking-[0.28em] uppercase text-copper md:whitespace-nowrap">Subsidiaries & Affiliates</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-copper/70 to-transparent" />
          </div>
          <h1 data-testid="subsidiaries-title" className="mt-7 pl-5 border-l-2 border-copper font-serif text-xl md:text-3xl leading-[1.25] tracking-[-0.02em] text-bone">
            An Integrated Ecosystem <span className="text-copper">of Industry Pioneers</span>
          </h1>
          <div aria-hidden="true" className="mt-8 flex items-center gap-3">
            <span className="w-2 h-2 rotate-45 border border-copper" />
            <span className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-copper via-copper/40 to-transparent" />
          </div>
          <p data-testid="subsidiaries-desc" className="mt-8 text-ash text-base md:text-lg leading-[1.8] w-full text-left md:text-justify">
                Sunjaya Asia Group powers a diversified network of specialized operating units and strategic affiliates engineered to lead key global markets. From <strong className="font-bold italic text-bone">Capital &amp; Wealth Management</strong> and <strong className="font-bold italic text-bone">Environmental &amp; Green Energy</strong> to <strong className="font-bold italic text-bone">Global Commodities Trade</strong>, <strong className="font-bold italic text-bone">IT Product Development</strong>, and <strong className="font-bold italic text-bone">Defense &amp; Military Technology</strong>, our ecosystem combines strategic capital, cutting-edge technology, and operational excellence to deliver high-impact solutions worldwide.
          </p>
        </div>
      </div>

      {/* Light section — cards + summary + global presence */}
      <div className="section-light pb-24">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 pt-16 md:pt-20">

        {/* Subsidiary + affiliate cards in one grid — auto-sorted: Branch first, affiliates continue numbering */}
        <div data-testid="subsidiary-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {orderCards(subsidiaryCards).map((s, i) => <CompanyCard key={s.id} s={s} num={i + 1} priority={i < 2} showRole />)}
          {orderCards(affiliateCards).map((s, i) => <CompanyCard key={s.id} s={s} num={AFF_START + i} />)}
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
                            <div className="font-serif text-base md:text-lg text-bone tracking-tight leading-tight">{t(`subsidiary.${s.id}.name`, s.name)}</div>
                            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mt-0.5">{placeOf(s)}</div>
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
                            <div className="font-serif text-base md:text-lg text-bone tracking-tight leading-tight">{t(`subsidiary.${s.id}.name`, s.name)}</div>
                            <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ash mt-0.5">{placeOf(s)}</div>
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
