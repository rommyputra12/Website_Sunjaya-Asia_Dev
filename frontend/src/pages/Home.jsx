import React, { useRef } from "react";
import { CountUp } from "../components/CountUp";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import { useLang } from "../i18n/LanguageContext";
import { LineReveal, Reveal, CharReveal } from "../components/motion/Reveal";
import { STATS, PILLARS } from "../data/content";
import { useCompanies } from "../lib/companies";
import { useLocations } from "../hooks/useLocations";
import { useAssets } from "../context/AssetContext";
import PartnersSection from "../components/home/PartnersSection";
import AssetImg from "../components/AssetImg";
import { StaticWorldMap } from "../components/StaticWorldMap";
import Globe3D from "../components/Globe3D";
import { tzAbbrev } from "../lib/timezones";
import { Star } from "lucide-react";
import { Fmt, splitAlign } from "../components/FormattedText";

const HeroClock = () => {
  const [display, setDisplay] = React.useState("");

  React.useEffect(() => {
    let timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const formatTime = () => {
      const tz = tzAbbrev(timezone);
      try {
        const parts = new Intl.DateTimeFormat("en-GB", {
          timeZone: timezone,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).formatToParts(new Date());
        const hh = parts.find((p) => p.type === "hour")?.value ?? "00";
        const mm = parts.find((p) => p.type === "minute")?.value ?? "00";
        const ss = parts.find((p) => p.type === "second")?.value ?? "00";
        setDisplay(`${hh}:${mm}:${ss} ${tz}`);
      } catch {
        const d = new Date();
        setDisplay(d.toTimeString().slice(0, 8) + " " + tz);
      }
    };

    formatTime();
    const id = setInterval(formatTime, 1000);

    fetch("https://ipapi.co/json/")
      .then((r) => r.json())
      .then((data) => {
        if (data && data.timezone) {
          timezone = data.timezone;
          formatTime();
        }
      })
      .catch(() => {});

    return () => clearInterval(id);
  }, []);

  return <span className="font-mono text-[10px] tracking-[0.22em] text-white uppercase whitespace-nowrap">{display}</span>;
};

const PILLARS_INTRO = {
  kicker: "Business Pillars",
  para1: "Sunjaya Asia Group Limited is a leading multi-sector investment holding corporation driving global progress and sustainable development. Leveraging our strong track record in international trade, we connect essential global resources with high-impact technology.",
  para2: "Operating through interconnected global hubs, the Group manages a diverse commercial portfolio across",
  highlight: "3 (three) synergistic strategic pillars:",
};

const SUBS_TEASER = {
  kicker: "Subsidiaries & Affiliates",
  title: "A group of specialised companies driving every pillar.",
  desc: "Our subsidiaries and strategic affiliates operate across waste technology, energy storage, capital markets, distribution, IT, defense and media.",
  cta: "View all subsidiaries",
};

export default function Home() {
  const { t, listBlocks } = useLang();
  // Pillar pointers come from the same CMS blocks as the Pillars page
  const pillarLines = (p) => {
    const names = listBlocks(`pillar.${p.num}.div.`).filter((b) => b.key.endsWith(".name"));
    return names.length ? names.map((b) => t(b.key, b.value)) : p.lines;
  };
  const { byKey, ready: assetsReady } = useAssets();
  const subCards = [...useCompanies()].sort((a, b) => (a.tier === "affiliate") - (b.tier === "affiliate")).sort((a, b) => (byKey[a.image]?.sort_order ?? 100) - (byKey[b.image]?.sort_order ?? 100));
  const locations = useLocations();
  const infraCount = locations.filter((l) => l.type === "infra").length;
  const countryCount = new Set(locations.map((l) => l.country.trim().toLowerCase())).size;
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const parallaxOpacity = useTransform(scrollYProgress, [0.5, 1], [1, 0]);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} id="hero" className="relative pt-20 md:pt-24 overflow-hidden isolate flex flex-col">
        {/* Parallax image — displayed at 100% (no overlays); text uses shadow effects for legibility */}
        <div key={assetsReady ? "ready" : "wait"} className={`absolute inset-0 z-0 overflow-hidden ${assetsReady ? "hero-banner-enter" : "opacity-0"}`}>
        <motion.div
          style={{ y: parallaxY, scale: parallaxScale, opacity: parallaxOpacity }}
          className="absolute inset-0"
        >
          <AssetImg k="cover" alt="Sunjaya Asia Group" className={`w-full h-full object-cover ${byKey.homeCoverMobile?.url ? "hidden md:block" : ""}`} loading="eager" />
          {byKey.homeCoverMobile?.url && <AssetImg k="homeCoverMobile" alt="Sunjaya Asia Group" data-testid="home-cover-mobile" sizes="100vw" className="md:hidden w-full h-full object-cover" loading="eager" />}
        </motion.div>
        </div>

        {/* Above-the-fold — white line sits just below the hero content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-10 w-full flex flex-col">
          {/* Top spacer — small proportional gap below the navbar */}
          <div className="h-0 md:h-[3vh] shrink-0" />
          {/* Top row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-8 md:gap-0 mb-6 md:mb-8"
          >
            <span data-testid="hero-overline" className="hero-overline-glow font-mono text-[10px] tracking-[0.24em] uppercase text-white text-center md:text-left">
              <span className="hidden md:inline"><CharReveal text={t("hero.overline")} delay={0.2} /></span>
              <span className="md:hidden flex flex-col items-center gap-1.5">
                {t("hero.overline").split(/\s+[—–-]\s+/).map((line, i) => (
                  <span key={i} className="block"><CharReveal text={line} delay={0.2 + i * 0.3} /></span>
                ))}
              </span>
            </span>
            <span className="hero-overline-glow self-end md:self-auto"><HeroClock /></span>
          </motion.div>

          {/* Kinetic hero */}
          <h1 className="font-italic-accent text-bone hero-text-glow tracking-[-0.015em] leading-[1.02] mt-2 md:mt-4" style={{ fontSize: "clamp(3rem, 7vw, 6rem)" }}>
            <span className="block text-bone">
              <LineReveal text={t("hero.line1")} delay={0.35} />
            </span>
            <span className="block text-copper hero-copper-glow" style={{ transform: "translate(3vw, -0.22em)" }}>
              <LineReveal text={t("hero.line2")} delay={0.75} />
            </span>
          </h1>

          <div className="mt-8 md:mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-6 md:col-start-6 text-bone text-[13px] md:text-xl leading-[1.55] md:leading-[1.45] tracking-[-0.005em] max-w-xl min-h-[5.8em] md:min-h-[5.8em] font-serif font-light hero-body-glow text-left"
            >
              <Fmt text={t("hero.sub")} />
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.9 }}
            className="mt-14 md:mt-10 flex flex-col sm:flex-row sm:flex-wrap gap-3"
          >
            <Link
              to="/about#company-history"
              data-testid="hero-cta-primary"
              className="group relative inline-flex items-center justify-center gap-2 px-5 h-12 md:px-7 rounded-full bg-gradient-to-br from-copper-hi to-copper text-obsidian font-mono text-[10px] md:text-xs tracking-[0.18em] uppercase font-bold shadow-[0_8px_30px_-6px_rgba(184,127,61,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(184,127,61,0.8)] hover:-translate-y-0.5 transition-all duration-500 ease-out overflow-hidden"
            >
              <span className="relative z-10">{t("hero.cta_primary")}</span>
              <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">→</span>
              <span className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
            </Link>
            <Link
              to="/contact"
              data-testid="hero-cta-secondary"
              className="group inline-flex items-center justify-center gap-2 px-5 h-12 md:px-7 rounded-full bg-obsidian/70 backdrop-blur-md border border-white/40 text-bone font-mono text-[10px] md:text-xs tracking-[0.18em] uppercase font-semibold shadow-[0_2px_12px_rgba(5,30,43,0.5)] hover:border-copper hover:text-copper hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(184,127,61,0.4)] transition-all duration-500 ease-out"
            >
              {t("hero.cta_secondary")}
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* Gap so the white line sits below the Discover button, stats start just under it */}
          <div className="mt-12 md:mt-12" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.0, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-white/40 origin-left"
          />
        </div>

        {/* Stats 01–04 — fade up into view on scroll */}
        <div id="stats"
          className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-10 w-full pt-6 md:pt-8 pb-8 md:pb-10 grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-7 md:gap-x-5 md:gap-y-8 items-stretch md:items-start justify-items-stretch md:justify-items-center"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              data-testid={`hero-stat-${s.key}`}
              className="w-full md:max-w-[280px] min-w-0 text-left"
            >
              <div className="flex items-start justify-start gap-1 text-[9px] md:text-base leading-snug md:leading-normal font-mono uppercase tracking-[0.04em] md:tracking-[0.14em] text-bone font-semibold min-h-[2.75em] md:min-h-[2.6em] stat-shadow">
                <span className="shrink-0 text-[9px] md:text-xs text-copper leading-snug">0{i + 1}</span>
                <span className="shrink-0 text-[9px] md:text-xs text-copper leading-snug"> · </span>
                <span className="flex-1 text-[9px] md:text-xs leading-snug md:line-clamp-2 "> {t(`stats.${s.key}`)}</span>
              </div>
              <div className="mt-2 md:mt-3 flex items-baseline justify-center md:justify-start gap-1">
                <span className="hidden md:inline shrink-0 text-xs leading-snug invisible">0{i + 1}</span>
                <span className="hidden md:inline shrink-0 text-xs leading-snug invisible">·</span>
                <CountUp delay={0.25 + i * 0.12} data-testid={`hero-stat-value-${s.key}`} value={t(`stats.value.${s.key}`, s.value)} className="font-serif text-[1rem] min-[400px]:text-[1.1rem] sm:text-2xl md:text-3xl text-white tracking-tight leading-none whitespace-nowrap tabular-nums stat-shadow-lg" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BUSINESS PILLAR INTRO — min full viewport, grows if content is taller */}
      <section id="business-pillars" className="snap-section relative md:min-h-screen overflow-hidden bg-azure border-t border-copper/40">
        <AssetImg
          k="bgBusinessPillars"
          className="hidden md:block absolute inset-0 h-full w-full object-cover"
        />
        {/* Top gradient for title legibility */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-obsidian/60 via-obsidian/20 to-transparent pointer-events-none" />
        {/* Title overlay — top center, aligned above the middle pillar box (The Core) */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-10 pt-14 md:pt-28 pb-4 md:pb-0">
          <Reveal>
            <div className="md:ml-[42%]">
              <span className="font-mono text-base md:text-xl tracking-[0.22em] md:tracking-[0.28em] uppercase text-copper font-bold">{t("home.pillars_intro.kicker", PILLARS_INTRO.kicker)}</span>
              <span data-testid="home-pillars-copper-line" className="mt-3 block h-px w-64 md:w-96 bg-gradient-to-r from-copper via-copper/60 to-transparent" />
            </div>
            <p lang="en" className="mt-4 md:ml-[42%] text-bone/90 text-[13px] md:text-base leading-[1.75] md:leading-[1.7] tracking-normal md:tracking-wide text-justify [text-justify:inter-word] hyphens-auto md:hyphens-manual">
              <Fmt text={t("home.pillars_intro.para1", PILLARS_INTRO.para1)} />
            </p>
            <p lang="en" className="mt-4 md:ml-[42%] mb-6 text-bone/90 text-[13px] md:text-base leading-[1.75] md:leading-[1.7] tracking-normal md:tracking-wide text-justify [text-justify:inter-word] hyphens-auto md:hyphens-manual" style={{ textAlign: splitAlign(t("home.pillars_intro.para2", PILLARS_INTRO.para2)).align }}>
              <Fmt inline text={t("home.pillars_intro.para2", PILLARS_INTRO.para2)} /> <span className="font-bold text-copper">{t("home.pillars_intro.highlight", PILLARS_INTRO.highlight)}</span>
            </p>
          </Reveal>
        </div>
        <AssetImg k={byKey.homePillarsMobileBanner?.url ? "homePillarsMobileBanner" : "bgBusinessPillars"} alt="Business Pillars" data-testid="home-pillars-mobile-img" sizes="100vw" className="md:hidden relative z-10 block w-full h-auto" />
      </section>

      {/* PILLARS — each pillar is its own full-viewport section */}
      {PILLARS.map((p, i) => {
        const flip = i % 2 === 1;
        const TextCol = (
          <Reveal className="order-1 md:order-none md:col-span-6" delay={0}>
            <div className="flex items-start gap-4 md:gap-6 mt-2 md:mt-6">
              <span className="chapter-num text-[clamp(2.5rem,5vw,4.5rem)]">{p.num}</span>
              <div className="pt-1 flex-1 min-w-0">
                <div className="border-b-2 border-copper pb-3 mb-4">
                  <div className="font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-obsidian mb-2 font-bold">{t(`pillar.${p.num}.kicker`, p.kicker)}</div>
                  <h3 className="font-serif text-[1.5rem] md:text-[2rem] text-bone tracking-tight leading-[1.15]">{t(`pillar.${p.num}.title`, p.title)}</h3>
                </div>
                <p className="text-bone/80 text-sm md:text-base leading-[1.65] max-w-2xl text-left md:text-justify"><Fmt text={t(`pillar.${p.num}.body`, p.body)} /></p>
                <ul className="mt-5 space-y-2.5 [&>li]:text-sm md:[&>li]:text-base [&>li]:tracking-wide">
                  {pillarLines(p).map((l) => (
                    <li key={l} className="flex items-start gap-2.5 font-mono text-[11px] md:text-xs text-bone font-bold">
                      <Star className="w-3.5 h-3.5 text-copper shrink-0 fill-copper mt-[2px]" strokeWidth={0} />
                      {l}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        );
        const ImageCol = (
          <Reveal className="order-2 md:order-none md:col-span-6" delay={0.15}>
            <div className="w-full flex flex-col items-center">
              {/* Full image visible — no cropping, chapter + button sit below */}
              <div className="relative w-full h-[36vh] md:h-[calc(100vh-11.5rem)] max-w-full overflow-hidden flex items-center justify-center">
                <AssetImg
                  k={p.image}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  alt={p.title}
                  className="relative z-10 block max-h-full max-w-full object-contain"
                  style={{ filter: "grayscale(0.3) contrast(1.15)" }}
                />
              </div>
              <div className="flex w-full items-center gap-3 pt-3">
                {flip ? (
                  <>
                    <span className="whitespace-nowrap font-mono text-[9px] md:text-[10px] tracking-[0.16em] md:tracking-[0.22em] uppercase text-bone font-bold select-none">Chapter {p.num}</span>
                    <Link
                      to={`/pillars#pillar-${p.num}`}
                      className="group/btn relative inline-flex items-center gap-1.5 px-3 py-1.5 md:gap-2 md:px-5 md:py-2 rounded-full bg-gradient-to-br from-copper-hi to-copper text-obsidian font-mono text-[9px] md:text-[11px] tracking-[0.12em] md:tracking-[0.18em] uppercase font-bold whitespace-nowrap shadow-[0_8px_30px_-6px_rgba(184,127,61,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(184,127,61,0.9)] hover:-translate-y-0.5 transition-all duration-500 ease-out overflow-hidden cursor-pointer"
                    >
                      <span className="relative z-10">Explore Our {p.title.replace("The ", "")}</span>
                      <span className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1">→</span>
                      <span className="absolute inset-0 bg-white/25 origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
                    </Link>
                  </>
                ) : (
                  <>
                    <span className="ml-auto whitespace-nowrap font-mono text-[9px] md:text-[10px] tracking-[0.16em] md:tracking-[0.22em] uppercase text-bone font-bold select-none">Chapter {p.num}</span>
                    <Link
                      to={`/pillars#pillar-${p.num}`}
                      className="group/btn relative inline-flex items-center gap-1.5 px-3 py-1.5 md:gap-2 md:px-5 md:py-2 rounded-full bg-gradient-to-br from-copper-hi to-copper text-obsidian font-mono text-[9px] md:text-[11px] tracking-[0.12em] md:tracking-[0.18em] uppercase font-bold whitespace-nowrap shadow-[0_8px_30px_-6px_rgba(184,127,61,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(184,127,61,0.9)] hover:-translate-y-0.5 transition-all duration-500 ease-out overflow-hidden cursor-pointer"
                    >
                      <span className="relative z-10">Explore Our {p.title.replace("The ", "")}</span>
                      <span className="relative z-10 transition-transform duration-500 group-hover/btn:translate-x-1">→</span>
                      <span className="absolute inset-0 bg-white/25 origin-left scale-x-0 group-hover/btn:scale-x-100 transition-transform duration-700 ease-out" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </Reveal>
        );
        return (
          <section key={p.num} id={`pillar-${p.num}`} className="snap-section section-light relative md:min-h-screen pt-14 md:pt-24 pb-12 md:pb-0 flex items-center overflow-hidden border-t border-copper/40">
            {(p.num === "01" || p.num === "02" || p.num === "03") && (
              <>
                <AssetImg
                  k={p.num === "01"
                    ? "homePillar01Bg"
                    : p.num === "02"
                      ? "homePillar02Bg"
                      : "homePillar03Bg"}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover opacity-[0.5]"
                />
                <div data-testid={`pillar-${p.num}-ivory-fade`} className="absolute inset-0 bg-[#F9F5EB]/60 pointer-events-none" />
              </>
            )}
            <div className="absolute inset-0 pointer-events-none" />
            <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 w-full">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8 items-start">
                {flip ? <>{ImageCol}{TextCol}</> : <>{TextCol}{ImageCol}</>}
              </div>
            </div>
          </section>
        );
      })}

      {/* SUBSIDIARIES TEASER — grid fills available space (big photos) with a min-height floor so cards never squash or spill over the button */}
      <section id="subsidiaries-teaser" className="snap-section section-light relative border-t border-copper/40 md:min-h-screen pt-14 md:pt-24 pb-10 md:pb-0 flex flex-col overflow-hidden">
        {byKey.homeSubsBg?.url && (
          <>
            <AssetImg k="homeSubsBg" alt="" data-testid="home-subs-bg" className="absolute inset-0 h-full w-full object-cover opacity-[0.5] pointer-events-none" />
            <div className="absolute inset-0 bg-[#F9F5EB]/60 pointer-events-none" />
          </>
        )}
        <div className="relative z-10 max-w-[1700px] mx-auto px-4 md:px-8 w-full flex-1 flex flex-col justify-center pt-4 md:pt-6 pb-2 md:pb-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4 mb-5 md:mb-6">
            <Reveal className="max-w-4xl">
              <span className="font-mono text-base md:text-xl tracking-[0.22em] md:tracking-[0.28em] uppercase text-copper font-bold">{t("home.subs.kicker", SUBS_TEASER.kicker)}</span>
              <h2 className="font-serif text-base md:text-xl leading-[1.15] tracking-[-0.02em] text-bone mt-1.5">{t("home.subs.title", SUBS_TEASER.title)}</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[#1d538f] text-xs md:text-sm leading-[1.35] md:text-right md:max-w-[40rem]">
                <Fmt text={t("home.subs.desc", SUBS_TEASER.desc)} />
              </p>
            </Reveal>
          </div>

          <div className="grid flex-1 md:min-h-[480px] grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[210px] md:[grid-auto-rows:1fr]">
            {subCards.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05} className="h-full">
                <Link to="/subsidiaries" data-testid={`home-sub-card-${s.id}`} className="on-photo group relative block bg-obsidian h-full overflow-hidden rounded-sm cursor-pointer ring-0 hover:ring-2 hover:ring-copper/70 transition-shadow duration-300">
                  <AssetImg
                    k={s.image}
                    sizes="(max-width: 768px) 50vw, 33vw"
                    alt={t(`subsidiary.${s.id}.name`, s.name)}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-obsidian/70 to-transparent" />

                  <div className="relative z-10 h-full p-3 md:p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-photo-shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                      <span className="font-mono text-[8px] md:text-[9px] tracking-[0.22em] uppercase">{t(`subsidiary.${s.id}.tag`, s.tag)}</span>
                    </div>

                    <div className="text-photo-shadow">
                      <div className="font-mono text-[8px] md:text-[9px] tracking-[0.22em] uppercase text-copper mb-0.5">{t(`subsidiary.${s.id}.city`, s.city)}</div>
                      <h3 className="font-mono text-[11px] md:text-xs tracking-[0.06em] md:tracking-[0.08em] leading-snug uppercase">{t(`subsidiary.${s.id}.name`, s.name)}</h3>
                      <div className="mt-1 font-mono text-[7px] md:text-[8px] tracking-[0.16em] uppercase text-bone/70">
                        {t(`subsidiary.${s.id}.country`, s.city.split(",")[1]?.trim() || "")}{s.city.includes(",") ? " · " : ""}{t(`subsidiary.${s.id}.role`, s.role)}
                      </div>
                    </div>
                  </div>
                </Link>
              </Reveal>
            ))}
          </div>

          <div className="mt-4 md:mt-5 flex justify-center shrink-0">
            <Link
              to="/subsidiaries"
              data-testid="home-subs-link"
              className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-copper/60 bg-[#F9F5EB]/85 backdrop-blur-md text-copper hover:text-[#F9F5EB] hover:border-copper shadow-[0_6px_18px_-10px_rgba(200,98,48,.6)] transition-[color,border-color] duration-500 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase font-semibold w-fit overflow-hidden"
            >
              <span className="absolute inset-0 bg-copper origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10">{t("home.subs.cta", SUBS_TEASER.cta)}</span>
              <svg className="relative z-10 transition-transform duration-400 group-hover:translate-x-1" width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="9" x2="15" y2="9" />
                <polyline points="11,5 15,9 11,13" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* GLOBAL PRESENCE — "Being There Wherever" style: 3D globe centerpiece + headline + stats */}
      <section id="global-presence" className="snap-section relative min-h-screen pt-20 md:pt-24 flex flex-col overflow-hidden bg-[rgb(var(--light-bg))] border-t border-copper/30">
        <div className="absolute inset-0 pointer-events-none bg-[rgb(var(--light-bg))]" />

        {/* Headline + stats row */}
        <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 w-full pt-4 md:pt-6 z-10">
          {/* Kicker — heading position at the top */}
          <Reveal>
            <span className="font-mono text-base md:text-xl tracking-[0.22em] md:tracking-[0.28em] uppercase text-copper font-bold">{t("presence.kicker")}</span>
          </Reveal>
          {/* Subtitle + stats aligned in a row below the kicker */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-8 mt-4 md:mt-6">
            <Reveal delay={0.08} className="md:max-w-2xl">
              <h2 className="font-serif text-sm md:text-base lg:text-lg leading-[1.3] tracking-[-0.01em] text-obsidian">
                {t("presence.title")}{t("presence.titleHighlight") && " "}
                {t("presence.titleHighlight") && <span className="text-copper italic">{t("presence.titleHighlight")}</span>}
              </h2>
            </Reveal>

            {/* Stat counters — FPT-style big numbers */}
            <Reveal delay={0.16} className="flex flex-col items-end shrink-0">
              <div className="flex gap-6 md:gap-10">
                <div className="flex flex-col">
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-copper leading-none" data-testid="stat-branches">{locations.length - infraCount}</span>
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-obsidian/50 mt-1.5 max-w-[7rem] leading-tight">{t("presence.stats.branches")}</span>
                </div>
                <div className="flex flex-col border-l border-copper/30 pl-6 md:pl-10">
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-copper leading-none" data-testid="stat-infra">{infraCount}</span>
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-obsidian/50 mt-1.5 max-w-[7rem] leading-tight">{t("presence.stats.clients")}</span>
                </div>
                <div className="flex flex-col border-l border-copper/30 pl-6 md:pl-10">
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-copper leading-none" data-testid="stat-countries">{countryCount}</span>
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-obsidian/50 mt-1.5 max-w-[7rem] leading-tight">{t("presence.stats.countries")}</span>
                </div>
              </div>
              <Reveal delay={0.2} className="mt-2 md:mt-3">
                <div className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-azure-hi">
                  {locations.length} cities · {countryCount} countries
                </div>
              </Reveal>
            </Reveal>
          </div>
        </div>

        {/* 3D Globe centerpiece — transparent background, globe overflows without affecting content */}
        <Reveal className="relative flex-1 min-h-[44vh] md:min-h-0 px-4 md:px-6 pt-2 md:pt-4 pb-0 md:pb-2 flex flex-col" delay={0.12}>
          <div className="relative w-full flex-1 max-w-[1600px] mx-auto min-h-[320px] md:min-h-[400px]">
            <Globe3D />

              {/* Locations panel — adapted from Subsidiaries map legend, restyled for light bg */}
              <div className="absolute bottom-28 md:bottom-32 left-4 md:left-10 z-10 border border-copper/30 bg-[#F9F5EB]/85 backdrop-blur-md px-4 py-3 md:px-5 md:py-4 shadow-md rounded-lg max-w-[70vw] md:max-w-none">
                <div className="font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-copper mb-2 md:mb-2.5 font-bold">Locations</div>
                <div data-testid="home-locations-list" className="flex flex-col gap-1 md:gap-1.5 max-h-[22vh] md:max-h-[34vh] overflow-y-auto overscroll-contain pr-2">
                  {locations.map((l) => (
                    <div key={l.id || l.city} className="flex items-center gap-2 md:gap-2.5 font-mono text-xs md:text-sm text-obsidian shrink-0">
                      <span className={`w-2 h-2 ${l.type === "infra" ? "rotate-45" : "rounded-full"}`} style={{ background: l.color }} />
                      {l.city}
                      {l.type === "infra" && <span className="text-[10px] tracking-[0.18em] text-obsidian/50">· INFRA</span>}
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom-left hub label + CTA */}
              <div className="absolute bottom-12 md:bottom-4 left-4 md:left-10 z-10 flex flex-col gap-2">
                <div className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-copper font-bold">
                  {t("presence.hub")}
                </div>
                <Link
                  to="/subsidiaries#global-presence"
                  className="group inline-flex items-center gap-2 px-4 py-2 border border-copper/60 bg-[#F9F5EB]/85 backdrop-blur-md hover:bg-copper hover:border-copper transition-all duration-300 w-fit rounded-md"
                >
                  <span className="font-mono text-[10px] md:text-xs tracking-[0.2em] uppercase text-copper group-hover:text-white transition-colors font-bold">
                    {t("presence.cta")}
                  </span>
                  <svg width="16" height="16" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-copper group-hover:text-white transition-colors">
                    <line x1="3" y1="9" x2="15" y2="9" />
                    <polyline points="11,5 15,9 11,13" />
                  </svg>
                </Link>
              </div>
          </div>
        </Reveal>
      </section>

      <PartnersSection />
    </div>
  );
}
