import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import AssetImg from "../components/AssetImg";
import { ABOUT_TEXT, ABOUT_LISTS } from "../data/aboutDefaults";
import { Fmt, splitAlign } from "../components/FormattedText";

export default function About() {
  const { t: tr, tl, contentReady } = useLang();
  const t = (k) => tr(k, ABOUT_TEXT[k]);
  const L = (k) => tl(k, ABOUT_LISTS[k]);
  const identity = L("about.identity");
  const timeline = L("about.timeline.items");
  // Each CMS line break starts a new paragraph so spacing stays identical after edits
  const bodyParas = [t("about.body1"), t("about.body2")].flatMap((v) => {
    const { align, body } = splitAlign(v);
    return body.split(/\n+/).map((x) => x.trim()).filter(Boolean).map((x) => ({ text: x, align }));
  });
  const edgeCols = [1, 2, 3].map((n) => ({ title: t(`about.edge.col${n}`), items: L(`about.edge.list${n}`) }));
  return (
    <div data-testid="about-page" className="pb-24">
      {/* About the Group — hero section */}
      <div className="pt-[72px] md:pt-[88px]">

        {/* Mobile: banner image on top */}
        <div data-testid="about-banner-photo-mobile" className="md:hidden relative w-full aspect-square overflow-hidden">
          <AssetImg k="aboutBanner" alt="Sunjaya Asia Group office" className="absolute inset-0 w-full h-full object-cover" />
        </div>

        {/* Desktop: photo on the left half, solid background on the right half behind the text */}
        <div className="hidden md:block relative bg-obsidian">
          <div data-testid="about-banner-photo" className="absolute inset-y-0 left-0 w-[55%] overflow-hidden">
            <AssetImg k="aboutBanner" alt="Sunjaya Asia Group office" sizes="55vw" className="absolute inset-0 w-full h-full object-cover" />
            {/* Bottom fade keeps the corporate identity grid legible */}
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-obsidian/80 to-transparent" />
          </div>

          <div className="relative max-w-[1600px] mx-auto px-10 pt-20 pb-0">
            {/* Title + body stacked on the right, aligned vertically */}
            <div className="grid grid-cols-12 gap-10">
              <div className="col-span-5 col-start-8">
                <span data-testid="about-overline" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.overline")}</span>
                <h1 data-testid="about-title" className="tight-reveal font-serif text-lg md:text-xl leading-[1.3] tracking-[-0.02em] text-bone mt-3">
                  {t("about.title")}
                </h1>
                {/* Body text pushed down so title has breathing room */}
                <div data-testid="about-body" className="mt-10 space-y-8 text-bone/90 text-sm md:text-base leading-[1.75]">
                  {(contentReady ? bodyParas : []).map((para, i) => <p key={i} data-testid={`about-para-${i}`} className={para.align === "justify" ? "text-left md:text-justify" : ""} style={para.align === "justify" ? undefined : { textAlign: para.align }}><Fmt text={para.text} /></p>)}
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
          <span data-testid="about-overline-mobile" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.overline")}</span>
          <h1 data-testid="about-title-mobile" className="tight-reveal font-serif text-base leading-[1.3] tracking-[-0.02em] text-bone mt-3">
            {t("about.title")}
          </h1>
          <div data-testid="about-body-mobile" className="mt-6 space-y-6 text-bone/85 text-sm leading-[1.75]">
            {(contentReady ? bodyParas : []).map((para, i) => <p key={i} data-testid={`about-para-mobile-${i}`} className={para.align === "justify" ? "text-left md:text-justify" : ""} style={para.align === "justify" ? undefined : { textAlign: para.align }}><Fmt text={para.text} /></p>)}
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
        <div data-testid="about-history-frame" className="history-fit mx-auto px-6 md:px-0 py-16 md:py-10">
          <div className="flex items-baseline justify-between mb-8 md:mb-6">
            <span data-testid="about-history-kicker" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.history.kicker")}</span>
            <span data-testid="about-history-since" className="hidden md:inline font-mono text-sm tracking-[0.22em] uppercase text-ash">{t("about.history.since")}</span>
          </div>
          <div>
            <div data-testid="about-history-image" className="relative aspect-video overflow-hidden clip-frame border border-black/10 bg-ink">
              <AssetImg k="aboutCompanyHistory" sizes="(max-width: 768px) 100vw, 80vw" alt="Sunjaya Asia Group company history timeline" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="mt-6 md:mt-5 max-w-lg">
              <span data-testid="about-journey-kicker" className="font-mono text-xs md:text-sm font-semibold tracking-[0.22em] uppercase text-copper">{t("about.history.journey_kicker")}</span>
              <p className="font-serif text-lg md:text-xl text-ink tracking-tight mt-2">{t("about.history.journey")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-[1600px] mx-auto px-6 md:px-10 mt-24">
        {/* Timeline */}
        <div id="timeline" className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-10 scroll-mt-24">
          <div className="md:col-span-4">
            <span data-testid="about-timeline-kicker" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.timeline.kicker")}</span>
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
                <p className="col-span-12 md:col-span-6 text-bone/75 text-sm md:text-base leading-relaxed"><Fmt text={m.body} /></p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* Competitive Edge (LIGHT SECTION) */}
        <div id="competitive-edge" className="mt-32 -mx-6 md:-mx-10 px-6 md:px-10 py-24 section-light scroll-mt-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
            <div className="md:col-span-5">
              <span data-testid="about-edge-kicker" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.edge.kicker")}</span>
              <h2 className="font-serif text-xl md:text-3xl text-bone mt-3 tracking-tight leading-[1.15]">
                <LineReveal text={t("about.edge.title")} />
                <br />
                <span className="font-italic-accent text-copper"><LineReveal text={t("about.edge.highlight")} delay={0.2} /></span>
              </h2>
            </div>
            <div className="md:col-span-6 md:col-start-7 self-end">
              <p className="text-bone/80 text-lg leading-relaxed">
                <Fmt text={t("about.edge.desc")} />
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-white/10 border border-white/10">
            {edgeCols.map((col, ci) => (
              <div key={ci} className="bg-obsidian p-8">
                <div data-testid={`edge-col-title-${ci}`} className="font-mono text-sm md:text-base font-bold tracking-[0.18em] uppercase text-copper mb-5">{col.title}</div>
                <ul className="space-y-3">
                  {col.items.map((it, i) => (
                    <li key={i} data-testid={`edge-item-${ci}-${i}`} className="flex gap-3 items-start">
                      <span className="h-5 flex items-center flex-shrink-0" aria-hidden="true">
                        <span className="w-1.5 h-1.5 rotate-45 bg-copper" />
                      </span>
                      <span className="text-bone text-sm leading-5">{it.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
