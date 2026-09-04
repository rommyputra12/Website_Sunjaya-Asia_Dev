import React from "react";
import { useLang } from "../i18n/LanguageContext";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import { PILLARS, IMAGES } from "../data/content";

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
  const { t } = useLang();
  return (
    <div data-testid="pillars-page" className="pt-32 pb-24">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="mb-24">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">{t("manifesto.overline")}</span>
          <h1 className="font-serif text-2xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-bone mt-3 max-w-4xl">
            <LineReveal text={t("manifesto.title")} />
          </h1>
        </div>

        {PILLARS.map((p, idx) => (
          <section key={p.num} id={`pillar-${p.num}`} className="mb-32 md:mb-40 scroll-mt-20">
            <Reveal>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end mb-12 border-b border-white/10 pb-8">
                <div className="md:col-span-2">
                  <span className="chapter-num text-[clamp(2.5rem,6vw,5rem)]">{p.num}</span>
                </div>
                <div className="md:col-span-6">
                  <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">{p.kicker}</div>
                  <h2 className="font-serif text-2xl md:text-3xl text-bone tracking-tight leading-[1.15]">{p.title}</h2>
                </div>
                <div className="md:col-span-4 text-bone/80 text-base leading-relaxed text-justify">
                  {p.body}
                </div>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
              <Reveal className="md:col-span-5" delay={0.1}>
                <div className="relative sticky top-24 overflow-hidden bg-[#051e2b] border border-white/10" style={{ height: "calc(100vh - 7rem)" }}>
                  <img
                    src={IMAGES[p.image]}
                    alt={p.title}
                    className="absolute inset-0 h-full w-full object-contain"
                    style={{ filter: "grayscale(0.2) contrast(1.1)" }}
                  />
                </div>
              </Reveal>
              <div className="md:col-span-7 space-y-px bg-white/10">
                {DIVISIONS[p.num].map((d, i) => (
                  <Reveal key={d.name} delay={i * 0.05}>
                    <div className="bg-obsidian p-6 md:p-8 group hover:bg-ink transition-colors">
                      <div className="flex items-baseline gap-4 mb-3">
                        <span className="font-mono text-[10px] tracking-[0.22em] text-copper">{p.num}.{i + 1}</span>
                        <h3 className="font-serif text-2xl md:text-3xl text-bone tracking-tight">{d.name}</h3>
                      </div>
                      <p className="text-bone/75 text-sm md:text-base leading-relaxed">{d.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
