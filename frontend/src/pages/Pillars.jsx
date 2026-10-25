import React from "react";
import { useLang } from "../i18n/LanguageContext";
import { PILLARS } from "../data/content";
import AssetImg from "../components/AssetImg";
import { Fmt } from "../components/FormattedText";

const DIVISIONS = {
  "01": [
    { name: "Assets & Wealth Management", desc: "Strategic fund management, digital asset liquidity, trade financing, AI-enhanced compliance and global mobility services for institutional clients." },
    { name: "Plantation Development", desc: "Premium vegetables, spices, multi-variety banana, sugarcane and precision agriculture on ESG-compliant land using drone-monitored operations." },
    { name: "Downstream Integration", desc: "Agricultural processing, banana fiber composites, sugar refining, bioethanol, cold-chain logistics and certified export operations." },
    { name: "Urban Development", desc: "Master-planned smart cities with IoT and 5G infrastructure, LEED green buildings, integrated transit, mixed-use districts and smart utilities." },
    { name: "Modern Transportation Hub", desc: "Deep-water seaports (50,000 DWT), integrated dry-port and rail terminals, smart highway networks, EV fleet management and digital logistics platforms." },
  ],
  "02": [
    { name: "Gold & Precious Metal Trading", desc: "End-to-end procurement, LBMA-grade refining, secure logistics, and institutional placement of gold ore, doré, fine gold, and precious gemstones across global markets." },
    { name: "Agro-Commodity Trading", desc: "International trading of vanilla, spices, coconut, banana, cocoa, coffee and palm oil (with RSPO-certified derivatives) through integrated supply chains and certified logistics." },
    { name: "Livestock & Food Security", desc: "Vertically integrated egg production, poultry, dairy and meat processing supported by automated systems and cold-chain distribution." },
    { name: "Heavy Equipment & Vessel Trading", desc: "EV mining trucks, electric heavy equipment, RoRo vessels, tankers, tugs and business aviation — with financing and after-sales support." },
  ],
  "03": [
    { name: "Evowaste · Zero-X Technology", desc: "Commercial-scale waste destruction system engineered for total elimination with zero emissions and efficient resource recovery. Winner of the APEA 2025 Fast Enterprise Award. Over 360 modules deployed across 16 countries." },
    { name: "Evosmart ESS & Power Generations", desc: "Proprietary smart energy infrastructure. Large-scale 180MWh energy storage integrated with solar power generation and hybrid battery clustering for industrial and municipal demand." },
    { name: "Biotechnology", desc: "Applied biological research for agricultural productivity, healthcare and large-scale ecological restoration across the region." },
    { name: "IT: Hyperione (Security Intelligence), Drone Technology, and Defense & Military Technology", desc: "Next-generation security intelligence platform (Hyperione) with comprehensive data integration, advanced analytics & AI, military-grade secure infrastructure, and real-time command centers — combined with drone and unmanned systems, advanced weapons platforms (fighter jets, armored vehicles, naval vessels, missile defence), Defence Electronics & C4ISR, cybersecurity & electronic warfare, and defence logistics & MRO across land, sea, and air domains." },
  ],
};

export default function Pillars() {
  const { t, listBlocks } = useLang();
  // Build divisions per pillar dynamically from CMS content blocks (name + desc pairs),
  // falling back to the bundled DIVISIONS when the CMS has none.
  const divisionsFor = (num) => {
    const names = listBlocks(`pillar.${num}.div.`).filter((b) => b.key.endsWith(".name"));
    if (names.length === 0) return DIVISIONS[num] || [];
    return names.map((nb) => {
      const base = nb.key.replace(/\.name$/, "");
      const desc = t(base + ".desc", (listBlocks(base + ".desc")[0] || {}).value || "");
      return { name: t(nb.key, nb.value), desc };
    });
  };
  return (
    <div data-testid="pillars-page" className="pt-28 md:pt-32 pb-24">
      <div className="max-w-[1400px] mx-auto px-6 md:px-10">
        <header className="mb-16 md:mb-24">
          <span className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("manifesto.overline")}</span>
          <h1 data-testid="pillars-intro" className="font-serif text-lg md:text-2xl leading-[1.5] tracking-[-0.01em] text-bone/90 mt-4 w-full text-justify hyphens-auto">
            <Fmt text={t("manifesto.title")} />
          </h1>
        </header>

        {PILLARS.map((p) => (
          <section key={p.num} id={`pillar-${p.num}`} data-testid={`pillar-section-${p.num}`} className="mb-24 md:mb-36 scroll-mt-24">
            <div className="flex items-end gap-5 md:gap-8 border-b border-white/10 pb-6 md:pb-8">
              <span className="chapter-num text-[clamp(3rem,7vw,6rem)] leading-none">{p.num}</span>
              <div className="pb-1 md:pb-2">
                <div className="font-mono text-[11px] md:text-xs font-semibold tracking-[0.22em] uppercase text-copper mb-2">{t(`pillar.${p.num}.kicker`, p.kicker)}</div>
                <h2 data-testid={`pillar-title-${p.num}`} className="font-serif text-3xl md:text-5xl text-bone tracking-tight leading-[1.05]">{t(`pillar.${p.num}.title`, p.title)}</h2>
              </div>
            </div>
            <p data-testid={`pillar-body-${p.num}`} className="mt-6 md:mt-8 w-full text-justify hyphens-auto text-bone/80 text-sm md:text-base leading-[1.8]">
              <Fmt text={t(`pillar.${p.num}.body`, p.body)} />
            </p>

            <div data-testid={`pillar-photo-${p.num}`} className="relative mt-10 md:mt-12 w-full aspect-video overflow-hidden border border-white/10 bg-ink">
              <AssetImg k={`pillarsPage${p.num}`} sizes="(max-width: 1400px) 100vw, 1400px" alt={t(`pillar.${p.num}.title`, p.title)} className="absolute inset-0 h-full w-full object-cover" />
            </div>

            <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-2 gap-px bg-white/10 border border-white/10">
              {divisionsFor(p.num).map((d, i, arr) => (
                <article key={`${p.num}-${i}`} data-testid={`pillar-division-${p.num}-${i}`} className={`bg-obsidian p-6 md:p-8 transition-colors ${arr.length % 2 && i === arr.length - 1 ? "md:col-span-2" : ""} duration-300 hover:bg-ink`}>
                  <span className="font-mono text-[11px] tracking-[0.22em] text-copper">{p.num}.{i + 1}</span>
                  <h3 className="mt-2 font-serif text-lg md:text-xl text-bone tracking-tight leading-snug">{d.name}</h3>
                  <p className="mt-3 text-bone/70 text-sm leading-[1.75]"><Fmt text={d.desc} /></p>
                </article>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
