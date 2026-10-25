import React, { useState } from "react";
import { useLang } from "../i18n/LanguageContext";
import { Reveal } from "../components/motion/Reveal";
import AssetImg from "../components/AssetImg";
import { ABOUT_TEXT, ABOUT_LISTS } from "../data/aboutDefaults";
import { Fmt, splitAlign } from "../components/FormattedText";
import { Building2, ChevronRight, Layers, Workflow } from "lucide-react";

const EDGE_ICONS = [Building2, Layers, Workflow];

const EdgeCard = ({ ci, col }) => {
  const Icon = EDGE_ICONS[ci % EDGE_ICONS.length];
  return (
    <div data-testid={`edge-card-${ci}`} className="edge-card group relative overflow-hidden rounded-[10px] p-7 md:p-8 transition-[transform,box-shadow] duration-500 hover:-translate-y-1">
      <span aria-hidden="true" className="absolute top-0 left-0 h-[3px] w-full origin-left scale-x-0 bg-gradient-to-r from-copper to-copper/30 transition-transform duration-500 group-hover:scale-x-100" />
      <span aria-hidden="true" className="absolute right-5 top-3 font-serif text-6xl md:text-7xl leading-none text-copper/15 select-none">{String(ci + 1).padStart(2, "0")}</span>
      <span className="relative grid place-items-center w-12 h-12 rounded-full border border-copper/40 text-copper transition-colors duration-500 group-hover:bg-copper group-hover:text-white">
        <Icon size={22} strokeWidth={1.6} />
      </span>
      <h3 data-testid={`edge-col-title-${ci}`} className="relative mt-6 font-serif text-xl md:text-2xl text-bone tracking-tight leading-snug">{col.title}</h3>
      <ul className="relative mt-5 pt-5 border-t edge-divider space-y-3">
        {col.items.map((it, i) => (
          <li key={i} data-testid={`edge-item-${ci}-${i}`} className="group/item flex gap-2.5 items-start">
            <ChevronRight aria-hidden="true" size={16} strokeWidth={2.4} className="mt-[3px] flex-shrink-0 text-copper transition-transform duration-300 group-hover/item:translate-x-0.5" />
            <span className="text-bone text-sm leading-[1.6] transition-colors duration-300 group-hover/item:text-copper group-hover/item:font-semibold">{it.text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

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
                <div className="flex items-center gap-5">
                  <span data-testid="about-overline" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper whitespace-nowrap">{t("about.overline")}</span>
                  <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-copper/70 to-transparent" />
                </div>
                <h1 data-testid="about-title" className="tight-reveal mt-6 pl-5 border-l-2 border-copper font-serif text-lg md:text-xl leading-[1.4] tracking-[-0.015em] text-bone">
                  {t("about.title")}
                </h1>
                <div aria-hidden="true" className="mt-8 flex items-center gap-3">
                  <span className="w-2 h-2 rotate-45 border border-copper" />
                  <span className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-copper via-copper/40 to-transparent" />
                </div>
                <div data-testid="about-body" className="mt-8 space-y-6 text-bone/85 text-sm md:text-base leading-[1.8]">
                  {(contentReady ? bodyParas : []).map((para, i) => <p key={i} data-testid={`about-para-${i}`} className={`${i === 0 ? "text-bone" : ""} ${para.align === "justify" ? "text-left md:text-justify" : ""}`} style={para.align === "justify" ? undefined : { textAlign: para.align }}><Fmt text={para.text} /></p>)}
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
          <div className="flex items-center gap-4">
            <span data-testid="about-overline-mobile" className="font-mono text-lg font-bold tracking-[0.24em] uppercase text-copper whitespace-nowrap">{t("about.overline")}</span>
            <span aria-hidden="true" className="h-px flex-1 bg-gradient-to-r from-copper/70 to-transparent" />
          </div>
          <h1 data-testid="about-title-mobile" className="tight-reveal mt-5 pl-4 border-l-2 border-copper font-serif text-base leading-[1.4] tracking-[-0.015em] text-bone">
            {t("about.title")}
          </h1>
          <div aria-hidden="true" className="mt-6 flex items-center gap-3">
            <span className="w-2 h-2 rotate-45 border border-copper" />
            <span className="h-[2px] flex-1 rounded-full bg-gradient-to-r from-copper via-copper/40 to-transparent" />
          </div>
          <div data-testid="about-body-mobile" className="mt-6 space-y-5 text-bone/85 text-sm leading-[1.8]">
            {(contentReady ? bodyParas : []).map((para, i) => <p key={i} data-testid={`about-para-mobile-${i}`} className={`${i === 0 ? "text-bone" : ""} ${para.align === "justify" ? "text-left md:text-justify" : ""}`} style={para.align === "justify" ? undefined : { textAlign: para.align }}><Fmt text={para.text} /></p>)}
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

      {/* Company History — high-tech framed 16:9 infographic */}
      <section id="company-history" data-testid="about-history" className="history-tech relative mt-16 overflow-hidden scroll-mt-20">
        <div aria-hidden="true" className="history-grid absolute inset-0" />
        <div data-testid="about-history-frame" className="history-fit relative mx-auto px-6 md:px-0 py-14 md:py-10">
          <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-8 mb-7 md:mb-6">
            <div className="shrink-0">
              <span data-testid="about-history-kicker" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.history.kicker")}</span>
              <div className="mt-1.5 flex items-center gap-2 font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-ash">
                <span className="relative flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-copper animate-ping opacity-60" /><span className="relative w-2 h-2 rounded-full bg-copper" /></span>
                <span data-testid="about-history-since">{t("about.history.since")}</span>
              </div>
            </div>
            <span aria-hidden="true" className="hidden md:block h-px flex-1 mb-3 bg-gradient-to-r from-copper/70 via-white/15 to-transparent" />
            <div className="md:text-right md:max-w-[46%]">
              <span data-testid="about-journey-kicker" className="font-mono text-[10px] md:text-xs font-semibold tracking-[0.24em] uppercase text-copper">{t("about.history.journey_kicker")}</span>
              <p data-testid="about-journey-text" className="font-serif text-base md:text-xl text-bone tracking-tight mt-1 leading-snug">{t("about.history.journey")}</p>
            </div>
          </div>
          <div className="relative p-2 md:p-3">
            {["top-0 left-0 border-t-2 border-l-2", "top-0 right-0 border-t-2 border-r-2", "bottom-0 left-0 border-b-2 border-l-2", "bottom-0 right-0 border-b-2 border-r-2"].map((c) => (
              <span key={c} aria-hidden="true" className={`absolute w-6 h-6 md:w-9 md:h-9 border-copper ${c}`} />
            ))}
            <div data-testid="about-history-image" className="relative aspect-video overflow-hidden border border-white/10 bg-ink">
              <AssetImg k="aboutCompanyHistory" sizes="(max-width: 768px) 100vw, 1440px" fetchPriority="high" alt="Sunjaya Asia Group company history timeline" className="absolute inset-0 w-full h-full object-cover" />
              <span aria-hidden="true" className="history-scan absolute inset-x-0 h-px" />
            </div>
          </div>
          <div aria-hidden="true" className="history-ruler mt-3 h-2 mx-2 md:mx-3" />
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
        <div id="competitive-edge" data-testid="about-edge" className="mt-32 -mx-6 md:-mx-10 px-6 md:px-10 py-20 md:py-24 section-light scroll-mt-20">
          <div className="mb-12 md:mb-16">
            <span data-testid="about-edge-kicker" className="font-mono text-lg md:text-2xl font-bold tracking-[0.24em] uppercase text-copper">{t("about.edge.kicker")}</span>
            <h2 data-testid="about-edge-title" className="font-serif text-2xl md:text-4xl text-bone mt-3 tracking-tight leading-[1.15]">
              {[t("about.edge.title"), t("about.edge.highlight")].filter(Boolean).join(" ")}
            </h2>
            <p data-testid="about-edge-desc" className="mt-5 md:mt-6 w-full text-bone/80 text-base md:text-lg leading-relaxed text-left md:text-justify">
              <Fmt text={t("about.edge.desc")} />
            </p>
            <div aria-hidden="true" className="mt-8 h-[2px] w-full rounded-full bg-gradient-to-r from-copper via-copper/50 to-transparent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {edgeCols.map((col, ci) => <EdgeCard key={ci} ci={ci} col={col} />)}
          </div>
        </div>

      </div>
    </div>
  );
}
