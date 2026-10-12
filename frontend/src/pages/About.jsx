import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import AssetImg from "../components/AssetImg";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../components/ui/dialog";
import RichText from "../components/RichText";
import { ABOUT_TEXT, ABOUT_LISTS } from "../data/aboutDefaults";

export default function About() {
  const { t: tr, tl } = useLang();
  const t = (k) => tr(k, ABOUT_TEXT[k]);
  const L = (k) => tl(k, ABOUT_LISTS[k]);
  const identity = L("about.identity");
  const timeline = L("about.timeline.items");
  const edgeCols = [1, 2, 3].map((n) => ({ title: t(`about.edge.col${n}`), items: L(`about.edge.list${n}`) }));
  const [partnershipOpen, setPartnershipOpen] = useState(false);
  return (
    <div data-testid="about-page" className="pb-24">
      {/* About the Group — hero section */}
      <div className="pt-[72px] md:pt-[88px]">

        {/* Mobile: banner image on top */}
        <div className="md:hidden w-full h-52 overflow-hidden">
          <AssetImg k="aboutBanner" alt="Sunjaya Asia Group office" className="w-full h-full object-cover" />
        </div>

        {/* Desktop: full background image */}
        <div className="hidden md:block relative">
          <AssetImg k="aboutBanner" alt="Sunjaya Asia Group office" className="absolute inset-0 w-full h-full object-cover" />
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
              <div id="about-identity" className={`grid gap-px bg-white/10 border border-white/10 translate-y-1/2 ${["grid-cols-1", "grid-cols-2", "grid-cols-3", "grid-cols-4"][Math.min(identity.length, 4) - 1]}`}>
                {identity.map((k) => (
                  <div key={k.label} className="bg-obsidian/95 backdrop-blur-sm p-6">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-2">{k.label}</div>
                    <div className="font-serif text-xl md:text-2xl text-bone tracking-tight">{k.value}</div>
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
              {identity.map((k) => (
                <div key={k.label} className="bg-obsidian p-4">
                  <div className="font-mono text-[9px] tracking-[0.22em] uppercase text-copper mb-1">{k.label}</div>
                  <div className="font-serif text-base text-bone tracking-tight">{k.value}</div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>

      {/* Company History — light section slice hosting the boardroom photo at 16:9 with dark-azure gradient */}
      <section id="company-history" className="section-light mt-16">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 py-16 md:py-20">
          <div className="flex items-baseline justify-between mb-8">
            <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">{t("about.history.kicker")}</span>
            <span className="hidden md:inline font-mono text-[10px] tracking-[0.22em] uppercase text-ash">{t("about.history.since")}</span>
          </div>
          <Reveal>
            <div className="relative aspect-[16/9] overflow-hidden clip-frame border border-black/10">
              <AssetImg k="aboutCompanyHistory" alt="Sunjaya Asia Group company history timeline" className="w-full h-full object-cover" />
            </div>
            <div className="mt-6 max-w-lg">
              <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper">{t("about.history.journey_kicker")}</span>
              <p className="font-serif text-lg md:text-xl text-ink tracking-tight mt-2">{t("about.history.journey")}</p>
            </div>
          </Reveal>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 mt-24">
        {/* Timeline */}
        <div id="timeline" className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10 scroll-mt-24">
          <div className="md:col-span-4">
            <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">{t("about.timeline.kicker")}</span>
            <h2 className="font-serif text-2xl md:text-3xl text-bone mt-3 tracking-tight">{t("about.timeline.title")}</h2>
          </div>
        </div>

        <div className="border-t border-white/10">
          {timeline.map((m, i) => (
            <Reveal key={`${m.year}-${i}`} delay={i * 0.05}>
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
        <div id="competitive-edge" className="mt-32 -mx-6 md:-mx-10 px-6 md:px-10 py-24 section-light scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-5">
              <span className="font-mono text-base md:text-lg tracking-[0.28em] uppercase text-copper">{t("about.edge.kicker")}</span>
              <h2 className="font-serif text-xl md:text-3xl text-bone mt-3 tracking-tight leading-[1.15]">
                <LineReveal text={t("about.edge.title")} />
                <br />
                <span className="font-italic-accent text-copper"><LineReveal text={t("about.edge.highlight")} delay={0.2} /></span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 self-end">
              <p className="text-bone/80 text-lg leading-relaxed">
                <RichText text={t("about.edge.desc")} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {edgeCols.map((col, ci) => (
              <div key={ci} className="bg-obsidian p-8">
                <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-4">{col.title}</div>
                <ul className="space-y-3">
                  {col.items.map((it, i) => (
                    <li key={i} className="flex gap-3 items-baseline">
                      <span className="w-3 h-px bg-copper flex-shrink-0 translate-y-1" />
                      <span className="text-bone text-sm">{it.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Partnership CTA */}
        <Reveal>
          <div id="partnership" className="mt-32 border border-copper/40 p-10 md:p-16 bg-gradient-to-br from-ink to-obsidian">
            <span className="font-mono text-sm md:text-base tracking-[0.24em] uppercase text-copper">{t("about.partner.kicker")}</span>
            <p className="font-sans text-xl md:text-3xl text-bone mt-4 leading-[1.3] tracking-tight max-w-5xl">
              <RichText text={t("about.partner.text")} accentClass="font-sans text-copper" />
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <button
                onClick={() => setPartnershipOpen(true)}
                className="inline-flex items-center gap-3 px-6 h-12 bg-copper text-obsidian font-mono text-[11px] tracking-[0.2em] uppercase hover:bg-copper-hi transition-colors"
              >
                {t("about.partner.cta")}
              </button>
              <span className="inline-flex items-center gap-3 px-6 h-12 border border-white/25 text-bone font-mono text-xs tracking-[0.15em]">
                OR EMAIL TO: {t("about.partner.email")}
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
