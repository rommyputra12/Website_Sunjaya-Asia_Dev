import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import { IMAGES } from "../data/content";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";

const TIMELINE = [
  { year: "2013", title: "Sunjaya-Asia Established", body: "Founded on May 20, 2013 in Indonesia — operating in mining, plantation, heavy equipment and industrial supply sectors." },
  { year: "2014 — 2018", title: "Strategic Partnerships", body: "Formed reseller and distributor partnerships with top global industrial brands across Asia-Pacific." },
  { year: "2019 — 2020", title: "Sector Pivot", body: "Pivoted from resource extraction into environmental technology, IT (Teknologi Sosial Nusantara) and entertainment." },
  { year: "2020 — 2022", title: "R&D and Validation", body: "Deep groundwork in research and development. Validated proprietary technology through sales and implementation across multiple countries." },
  { year: "2023", title: "New Brand Launches", body: "Launched Kindred Group Indonesia (KGI), Sunjaya Technology and the Evowaste & Evosmart brands." },
  { year: "2025", title: "Holding & Landmark Contract", body: "Established Sunjaya Asia Group Limited holding in Singapore (restructured May 6, 2025). Evowaste secured a landmark USD 65M waste management contract in Indonesia and won the APEA 2025 Fast Enterprise Award." },
  { year: "2026 →", title: "Global Expansion", body: "Establishing Sunjaya Emirates LLC and the Sunjaya An Xin joint venture. Local-government partnerships for infrastructure investment. 360+ modules deployed across 16+ countries." },
];

const COMPETITIVE_EDGE = {
  digital: {
    title: "Digital Transformation",
    industries: [
      "Public Sector & Government",
      "Energy & Environment",
      "Defense & National Security",
      "Infrastructure & Utilities",
      "Agriculture & Commodities",
      "Enterprise & Financial Services",
    ],
    ecosystem: [
      "Information & Communication Technology",
      "Defense & Military Technology",
      "Waste Management Technology",
    ],
    services: [
      "System Integrator",
      "IT Security",
      "Data Center",
      "Data, AI & IoT",
      "National Security Operating System",
      "Military Equipment",
      "Defense Infrastructure & Satellites",
      "Waste Management System",
      "Operator Training",
      "Waste Monitoring System",
    ],
  },
};

export default function About() {
  const { t } = useLang();
  const [partnershipOpen, setPartnershipOpen] = useState(false);
  return (
    <div data-testid="about-page" className="pb-24">
      {/* About the Group — hero section */}
      <div className="pt-[72px] md:pt-[88px]">

        {/* Mobile: banner image on top */}
        <div className="md:hidden w-full h-52 overflow-hidden">
          <div
            role="img"
            aria-label="Sunjaya Asia Group office"
            className="w-full h-full bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/Banner_About_our_Group.jpg')", backgroundPosition: "center center", backgroundSize: "cover" }}
          />
        </div>

        {/* Desktop: full background image */}
        <div className="hidden md:block relative">
          <div
            role="img"
            aria-label="Sunjaya Asia Group office"
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{ backgroundImage: "url('/images/Banner_About_our_Group.jpg')", backgroundPosition: "center center", backgroundSize: "cover" }}
          />
          {/* Gradient at bottom to ensure corporate identity grid is legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#051e2b]/30" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian/80 to-transparent" />

          <div className="relative max-w-[1600px] mx-auto px-10 pt-20 pb-0">
            {/* Title + body stacked on the right, aligned vertically */}
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-5 col-start-8">
                <span className="font-mono text-lg tracking-[0.28em] uppercase text-copper">{t("about.overline")}</span>
                <h1 className="font-serif text-3xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-bone mt-3">
                  <LineReveal text={t("about.title")} />
                </h1>
                {/* Body text pushed down so title has breathing room */}
                <div className="mt-10 space-y-5 text-bone/90 text-sm md:text-base leading-[1.75]">
                  <Reveal delay={0.1}><p>{t("about.body1")}</p></Reveal>
                  <Reveal delay={0.15}><p>{t("about.body2")}</p></Reveal>
                </div>
              </div>
            </div>
          </div>

          {/* Corporate identity — anchored to the bottom edge of the banner */}
          <Reveal>
            <div className="relative max-w-[1600px] mx-auto px-10 pb-0 mt-24">
              <div className="grid grid-cols-4 gap-px bg-white/10 border border-white/10 translate-y-1/2">
                {[
                  { l: "Established", v: "May 20, 2013 · Indonesia" },
                  { l: "Restructured", v: "May 6, 2025 · Singapore" },
                  { l: "Company Category", v: "Private Co. Limited by Shares" },
                  { l: "UEN", v: "202519572R" },
                ].map((k) => (
                  <div key={k.l} className="bg-obsidian/95 backdrop-blur-sm p-6">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-2">{k.l}</div>
                    <div className="font-serif text-xl md:text-2xl text-bone tracking-tight">{k.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          {/* Spacer so the translated grid doesn't overlap the next section */}
          <div className="pb-16" />
        </div>

        {/* Mobile: text section below banner */}
        <div className="md:hidden px-6 pt-10 pb-12 bg-obsidian">
          <span className="font-mono text-sm tracking-[0.28em] uppercase text-copper">{t("about.overline")}</span>
          <h1 className="font-serif text-2xl leading-[1.15] tracking-[-0.02em] text-bone mt-3">
            <LineReveal text={t("about.title")} />
          </h1>
          <div className="mt-6 space-y-4 text-bone/85 text-sm leading-[1.75]">
            <Reveal delay={0.1}><p>{t("about.body1")}</p></Reveal>
            <Reveal delay={0.15}><p>{t("about.body2")}</p></Reveal>
          </div>
          {/* Mobile corporate identity */}
          <Reveal>
            <div className="mt-10 grid grid-cols-2 gap-px bg-white/10 border border-white/10">
              {[
                { l: "Established", v: "May 20, 2013 · Indonesia" },
                { l: "Restructured", v: "May 6, 2025 · Singapore" },
                { l: "Company Category", v: "Private Co. Limited by Shares" },
                { l: "UEN", v: "202519572R" },
              ].map((k) => (
                <div key={k.l} className="bg-obsidian p-4">
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-copper mb-1">{k.l}</div>
                  <div className="font-serif text-base text-bone tracking-tight">{k.v}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Company History — light section slice hosting the boardroom photo at 16:9 with dark-azure gradient */}
      <section className="section-light mt-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="flex items-baseline justify-between mb-8">
            <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">Company History</span>
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.22em] uppercase text-ash">Since 2013</span>
          </div>
          <Reveal>
            <div className="relative aspect-[16/9] overflow-hidden clip-frame border border-black/10">
              <div
                role="img"
                aria-label="Sunjaya Asia Group company history timeline"
                className="w-full h-full bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: "url('/images/Company_History_-_About%20copy%20copy.jpg?v=2')" }}
              />
            </div>
            <div className="mt-6 max-w-lg">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">Our Journey</span>
              <p className="font-serif text-lg md:text-xl text-ink tracking-tight mt-2">Where global capital meets industrial execution.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 mt-24">
        {/* Timeline */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10">
          <div className="md:col-span-4">
            <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">Timeline</span>
            <h2 className="font-serif text-2xl md:text-3xl text-bone mt-3 tracking-tight">A decade of growth.</h2>
          </div>
        </div>

        <div className="border-t border-white/10">
          {TIMELINE.map((m, i) => (
            <Reveal key={m.year} delay={i * 0.05}>
              <div className="grid grid-cols-12 gap-4 py-8 border-b border-white/10 items-start hover:bg-ink/50 transition-colors">
                <div className="col-span-3 md:col-span-2">
                  <span className="chapter-num text-2xl md:text-4xl whitespace-nowrap">{m.year}</span>
                </div>
                <div className="col-span-9 md:col-span-4">
                  <h3 className="font-serif text-xl md:text-2xl text-bone tracking-tight leading-tight">{m.title}</h3>
                </div>
                <p className="col-span-12 md:col-span-6 text-bone/75 text-sm md:text-base leading-relaxed">{m.body}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Competitive Edge (LIGHT SECTION) */}
        <div className="mt-32 -mx-6 md:-mx-10 px-6 md:px-10 py-24 section-light">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-5">
              <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">Competitive Edge</span>
              <h2 className="font-serif text-xl md:text-3xl text-bone mt-3 tracking-tight leading-[1.15]">
                <LineReveal text="Digital & Green" />
                <br />
                <span className="font-italic-accent text-copper"><LineReveal text="Transformation." delay={0.2} /></span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 self-end">
              <p className="text-bone/80 text-lg leading-relaxed">
                A four-stage doctrine — <span className="text-copper">Define · Design · Deploy · Develop</span> — applied across critical industries with a proprietary product and solution ecosystem.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            <div className="bg-obsidian p-8">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-4">Industry Expertise</div>
              <ul className="space-y-3">
                {COMPETITIVE_EDGE.digital.industries.map((i) => (
                  <li key={i} className="flex gap-3 items-baseline">
                    <span className="w-3 h-px bg-copper flex-shrink-0 translate-y-1" />
                    <span className="text-bone text-sm">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-obsidian p-8">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-4">Product & Solution Ecosystem</div>
              <ul className="space-y-3">
                {COMPETITIVE_EDGE.digital.ecosystem.map((i) => (
                  <li key={i} className="flex gap-3 items-baseline">
                    <span className="w-3 h-px bg-copper flex-shrink-0 translate-y-1" />
                    <span className="text-bone text-sm">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-obsidian p-8">
              <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-4">End-to-End Services</div>
              <ul className="space-y-3">
                {COMPETITIVE_EDGE.digital.services.map((i) => (
                  <li key={i} className="flex gap-3 items-baseline">
                    <span className="w-3 h-px bg-copper flex-shrink-0 translate-y-1" />
                    <span className="text-bone text-sm">{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Partnership CTA */}
        <Reveal>
          <div className="mt-32 border border-copper/40 p-10 md:p-16 bg-gradient-to-br from-ink to-obsidian">
            <span className="font-mono text-sm md:text-base tracking-[0.24em] uppercase text-copper">Strategic Partnership Access</span>
            <p className="font-sans text-xl md:text-3xl text-bone mt-4 leading-[1.3] tracking-tight max-w-5xl">
              <span className="block">We are positioned to partner, invest, and facilitate financing</span>
              <span className="block">for major initiatives in <em className="font-sans text-copper">industrialization</em>, <em className="font-sans text-copper">urban development</em>,</span>
              <span className="block"><em className="font-sans text-copper">waste and water management</em>, <em className="font-sans text-copper">renewable energy</em>, and <em className="font-sans text-copper">digital transformation</em>.</span>
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setPartnershipOpen(true)}
                className="inline-flex items-center gap-3 px-6 h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-copper-hi transition-colors"
              >
                Send Request for Partnership →
              </button>
              <span className="inline-flex items-center gap-3 px-6 h-12 border border-white/25 text-bone font-mono text-xs tracking-[0.15em]">
                OR EMAIL TO: info@sunjayaasia.com
              </span>
            </div>
          </div>
        </Reveal>

        {/* Partnership Request Panel — placeholder */}
        <Dialog open={partnershipOpen} onOpenChange={setPartnershipOpen}>
          <DialogContent className="max-w-xl bg-ink border-copper/30">
            <DialogHeader>
              <DialogTitle className="font-mono text-sm tracking-[0.24em] uppercase text-copper">Send Request for Partnership</DialogTitle>
              <DialogDescription className="font-serif text-bone/80 text-base leading-relaxed">
                This partnership request form is being prepared. Please check back soon.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
