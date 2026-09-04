import React, { useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import Marquee from "react-fast-marquee";
import { useLang } from "../i18n/LanguageContext";
import { LineReveal, Reveal, CharReveal } from "../components/motion/Reveal";
import { IMAGES, STATS, PILLARS, SUBSIDIARIES, DEFAULT_LOCATIONS } from "../data/content";
import { StaticWorldMap } from "../components/StaticWorldMap";
import Globe3D, { INFRA_HUBS } from "../components/Globe3D";
import { tzAbbrev } from "../lib/timezones";
import { Star } from "lucide-react";

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

export default function Home() {
  const { t } = useLang();
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const parallaxScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);
  const parallaxOpacity = useTransform(scrollYProgress, [0.5, 1], [1, 0]);

  return (
    <div data-testid="home-page">
      {/* HERO */}
      <section ref={heroRef} className="relative pt-20 md:pt-24 overflow-hidden isolate flex flex-col">
        {/* Parallax image — displayed at 100% (no overlays); text uses shadow effects for legibility */}
        <div className="absolute inset-0 z-0 overflow-hidden hero-banner-enter">
        <motion.div
          style={{
            y: parallaxY,
            scale: parallaxScale,
            opacity: parallaxOpacity,
            backgroundImage: `url(${IMAGES.cover})`,
            backgroundPosition: "center center",
            backgroundSize: "cover",
            backgroundRepeat: "no-repeat",
          }}
          className="absolute inset-0"
        />
        </div>

        {/* Above-the-fold — white line sits just below the hero content */}
        <div className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-10 w-full flex flex-col">
          {/* Top spacer — small proportional gap below the navbar */}
          <div className="h-[4vh] md:h-[5vh] shrink-0" />
          {/* Top row */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.8 }}
            className="flex flex-col-reverse md:flex-row md:items-center md:justify-between gap-2 md:gap-0 mb-8 md:mb-10"
          >
            <span className="hero-overline-glow font-mono text-[10px] tracking-[0.24em] uppercase text-white text-center md:text-left">
              <CharReveal text={t("hero.overline")} delay={0.2} />
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

          <div className="mt-5 md:mt-6 grid grid-cols-1 md:grid-cols-12 gap-6">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              className="md:col-span-6 md:col-start-6 text-bone text-[13px] md:text-xl leading-[1.45] tracking-[-0.005em] max-w-xl font-serif font-light hero-body-glow text-justify md:text-left"
            >
              {t("hero.sub")}
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.7, duration: 0.9 }}
            className="mt-10 md:mt-12 flex flex-wrap gap-3"
          >
            <Link
              to="/pillars#pillar-01"
              data-testid="hero-cta-primary"
              className="group relative inline-flex items-center gap-2 px-5 h-10 md:px-7 md:h-12 rounded-full bg-gradient-to-br from-copper-hi to-copper text-obsidian font-mono text-[10px] md:text-xs tracking-[0.18em] uppercase font-bold shadow-[0_8px_30px_-6px_rgba(184,127,61,0.6)] hover:shadow-[0_12px_40px_-6px_rgba(184,127,61,0.8)] hover:-translate-y-0.5 transition-all duration-500 ease-out overflow-hidden"
            >
              <span className="relative z-10">{t("hero.cta_primary")}</span>
              <span className="relative z-10 transition-transform duration-500 group-hover:translate-x-1">→</span>
              <span className="absolute inset-0 bg-white/20 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-700 ease-out" />
            </Link>
            <Link
              to="/contact"
              data-testid="hero-cta-secondary"
              className="group inline-flex items-center gap-2 px-5 h-10 md:px-7 md:h-12 rounded-full bg-obsidian/70 backdrop-blur-md border border-white/40 text-bone font-mono text-[10px] md:text-xs tracking-[0.18em] uppercase font-semibold shadow-[0_2px_12px_rgba(5,30,43,0.5)] hover:border-copper hover:text-copper hover:-translate-y-0.5 hover:shadow-[0_8px_30px_-8px_rgba(184,127,61,0.4)] transition-all duration-500 ease-out"
            >
              {t("hero.cta_secondary")}
              <span className="transition-transform duration-500 group-hover:translate-x-1">→</span>
            </Link>
          </motion.div>

          {/* Gap so the white line sits below the Discover button, stats start just under it */}
          <div className="mt-14 md:mt-20" />
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ delay: 2.0, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="w-full h-px bg-white/40 origin-left"
          />
        </div>

        {/* Stats 01–04 — fade up into view on scroll */}
        <div
          className="relative z-10 max-w-[1440px] mx-auto px-6 md:px-10 w-full pt-8 md:pt-10 pb-10 md:pb-14 grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-8 items-start justify-items-center"
        >
          {STATS.map((s, i) => (
            <motion.div
              key={s.key}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-[280px] min-w-0"
            >
              <div className="flex items-start gap-1 font-mono uppercase tracking-[0.14em] text-bone font-semibold min-h-[2.6em]">
                <span className="shrink-0 text-[10px] md:text-xs text-copper leading-snug">0{i + 1}</span>
                <span className="shrink-0 text-[10px] md:text-xs text-copper leading-snug">·</span>
                <span className="flex-1 text-[10px] md:text-xs leading-snug line-clamp-2">{t(`stats.${s.key}`)}</span>
              </div>
              <div className="mt-3 flex items-baseline gap-1">
                <span className="shrink-0 text-[10px] md:text-xs leading-snug invisible">0{i + 1}</span>
                <span className="shrink-0 text-[10px] md:text-xs leading-snug invisible">·</span>
                <span className="font-serif text-2xl md:text-3xl text-white tracking-tight leading-none whitespace-nowrap drop-shadow-[0_2px_10px_rgba(5,30,43,0.9)]">{s.value}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* BUSINESS PILLAR INTRO — full viewport, 1 screen including fixed nav */}
      <section className="snap-section relative h-screen overflow-hidden bg-azure border-t border-copper/40">
        <img
          src="/images/Section_Business_Pillars.jpg"
          alt="Business pillars background"
          className="absolute inset-0 h-full w-full object-cover object-[62%_center] md:object-center"
        />
        {/* Top gradient for title legibility */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-obsidian/60 via-obsidian/20 to-transparent pointer-events-none" />
        {/* Title overlay — top center, aligned above the middle pillar box (The Core) */}
        <div className="relative z-10 w-full max-w-[1600px] mx-auto px-6 md:px-10 pt-24 md:pt-28">
          <Reveal>
            <div className="md:ml-[42%]">
              <span className="font-mono text-lg md:text-xl tracking-[0.28em] uppercase text-copper font-bold">Business Pillars</span>
            </div>
            <p className="mt-3 md:ml-[42%] text-bone/90 text-sm md:text-base leading-[1.7] tracking-wide text-justify">
              Sunjaya Asia Group Limited is a leading multi-sector investment holding corporation driving global progress and sustainable development. Leveraging our strong track record in international trade, we connect essential global resources with high-impact technology.
            </p>
            <p className="mt-4 md:ml-[42%] mb-6 text-bone/90 text-sm md:text-base leading-[1.7] tracking-wide text-justify">
              Operating through interconnected global hubs, the Group manages a diverse commercial portfolio across <span className="font-bold text-copper">3 (three) synergistic strategic pillars:</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* PILLARS — each pillar is its own full-viewport section */}
      {PILLARS.map((p, i) => {
        const flip = i % 2 === 1;
        const TextCol = (
          <Reveal className="md:col-span-6" delay={0}>
            <div className="flex items-start gap-4 md:gap-6 mt-6 md:mt-10">
              <span className="chapter-num text-[clamp(2.5rem,5vw,4.5rem)]">{p.num}</span>
              <div className="pt-1 flex-1 min-w-0">
                <div className="border-b-2 border-copper pb-3 mb-4">
                  <div className="font-mono text-[10px] md:text-xs tracking-[0.22em] uppercase text-obsidian mb-2 font-bold">{p.kicker}</div>
                  <h3 className="font-serif text-[1.5rem] md:text-[2rem] text-bone tracking-tight leading-[1.15]">{p.title}</h3>
                </div>
                <p className="text-bone/80 text-sm md:text-base leading-[1.65] max-w-2xl text-justify">{p.body}</p>
                <ul className="mt-5 space-y-2.5 [&>li]:text-sm md:[&>li]:text-base [&>li]:tracking-wide">
                  {p.lines.map((l) => (
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
          <Reveal className="md:col-span-6" delay={0.15}>
            <div className="w-full flex flex-col items-center">
              {/* 4:5 portrait — fills available height, chapter + button sit below */}
              <div className="relative aspect-[4/5] h-[calc(100vh-10.5rem)] max-w-full overflow-hidden">
                <img
                  src={IMAGES[p.image]}
                  alt={p.title}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{ filter: "grayscale(0.3) contrast(1.15)" }}
                  onError={(event) => { event.currentTarget.style.display = "none"; }}
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
          <section key={p.num} id={`pillar-${p.num}`} className="snap-section section-light relative h-screen pt-20 md:pt-24 flex items-center overflow-hidden border-t border-copper/40">
            {(p.num === "01" || p.num === "02" || p.num === "03") && (
              <>
                <img
                  src={p.num === "01"
                    ? "/images/Background_01_Foundation_Pillar.jpeg"
                    : p.num === "02"
                      ? "/images/02_Core_Background_Website.jpeg"
                      : "/images/03_Future_Background_Website.png"}
                  alt=""
                  aria-hidden="true"
                  className="absolute inset-0 h-full w-full object-cover object-center opacity-[0.55] mix-blend-multiply"
                />
                <div className="absolute inset-0 bg-white/60 pointer-events-none" />
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

      {/* SUBSIDIARIES TEASER — snap section, all content fits one screen */}
      <section className="snap-section section-light border-t border-copper/40 h-screen pt-20 md:pt-24 flex flex-col overflow-hidden">
        <div className="max-w-[1600px] mx-auto px-6 md:px-10 w-full flex-1 flex flex-col justify-center py-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-2 mb-4 md:mb-5">
            <Reveal className="max-w-4xl">
              <span className="font-mono text-lg md:text-xl tracking-[0.28em] uppercase text-copper font-bold">Subsidiaries & Affiliates</span>
              <h2 className="font-serif text-base md:text-xl leading-[1.15] tracking-[-0.02em] text-bone mt-1.5">A group of specialised companies driving every pillar.</h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[#1d538f] text-xs md:text-sm leading-[1.35] md:text-right md:max-w-[44rem]">
                Our subsidiaries and strategic affiliates operate across waste technology, energy storage, capital markets, distribution, IT, defense and media.
              </p>
            </Reveal>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 md:gap-3 flex-1 min-h-0">
            {SUBSIDIARIES.slice(0, 6).map((s, i) => (
              <Reveal key={s.id} delay={i * 0.05} className="min-h-0">
                <div className="on-photo group relative block bg-obsidian h-full min-h-0 overflow-hidden rounded-sm">
                  <img
                    src={IMAGES[s.image]}
                    alt={s.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-obsidian/90 via-obsidian/40 to-transparent" />
                  <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-obsidian/70 to-transparent" />

                  <div className="relative z-10 h-full p-3 md:p-4 flex flex-col justify-between">
                    <div className="flex items-center gap-2 text-photo-shadow">
                      <span className="w-1.5 h-1.5 rounded-full bg-copper" />
                      <span className="font-mono text-[8px] md:text-[9px] tracking-[0.22em] uppercase">{s.tag}</span>
                    </div>

                    <div className="text-photo-shadow">
                      <div className="font-mono text-[8px] md:text-[9px] tracking-[0.22em] uppercase text-copper mb-0.5">{s.city}</div>
                      <h3 className="font-mono text-[10px] md:text-xs tracking-[0.08em] leading-snug uppercase">{s.name}</h3>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-3 md:mt-4 flex justify-center shrink-0">
            <Link
              to="/subsidiaries"
              data-testid="home-subs-link"
              className="group relative inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full border border-[#2576ae]/50 bg-[#2576ae]/15 backdrop-blur-md text-[#2576ae] hover:text-white transition-all duration-400 font-mono text-[10px] md:text-[11px] tracking-[0.22em] uppercase font-semibold w-fit overflow-hidden"
            >
              <span className="absolute inset-0 bg-[#2576ae] origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500 ease-out" />
              <span className="relative z-10">View all subsidiaries</span>
              <svg className="relative z-10 transition-transform duration-400 group-hover:translate-x-1" width="14" height="14" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="9" x2="15" y2="9" />
                <polyline points="11,5 15,9 11,13" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* GLOBAL PRESENCE — "Being There Wherever" style: 3D globe centerpiece + headline + stats */}
      <section className="snap-section relative min-h-screen pt-20 md:pt-24 flex flex-col overflow-hidden bg-bone border-t border-copper/30">
        <div className="absolute inset-0 pointer-events-none bg-bone" />

        {/* Headline + stats row */}
        <div className="relative max-w-[1600px] mx-auto px-6 md:px-10 w-full pt-6 md:pt-8 z-10">
          {/* Kicker — heading position at the top */}
          <Reveal>
            <span className="font-mono text-lg md:text-xl tracking-[0.28em] uppercase text-copper font-bold">{t("presence.kicker")}</span>
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
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-copper leading-none">7</span>
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-obsidian/50 mt-1.5 max-w-[7rem] leading-tight">{t("presence.stats.branches")}</span>
                </div>
                <div className="flex flex-col border-l border-copper/30 pl-6 md:pl-10">
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-copper leading-none">2</span>
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-obsidian/50 mt-1.5 max-w-[7rem] leading-tight">{t("presence.stats.clients")}</span>
                </div>
                <div className="flex flex-col border-l border-copper/30 pl-6 md:pl-10">
                  <span className="font-serif text-3xl md:text-4xl lg:text-5xl text-copper leading-none">7</span>
                  <span className="font-mono text-[9px] md:text-[10px] tracking-[0.18em] uppercase text-obsidian/50 mt-1.5 max-w-[7rem] leading-tight">{t("presence.stats.countries")}</span>
                </div>
              </div>
              <Reveal delay={0.2} className="mt-2 md:mt-3">
                <div className="font-mono text-[10px] md:text-[11px] tracking-[0.2em] uppercase text-azure-hi">
                  9 cities · 7 countries
                </div>
              </Reveal>
            </Reveal>
          </div>
        </div>

        {/* 3D Globe centerpiece — transparent background, globe overflows without affecting content */}
        <Reveal className="relative flex-1 min-h-[55vh] md:min-h-0 px-4 md:px-6 pt-2 md:pt-4 pb-6 md:pb-8" delay={0.12}>
          <div className="relative w-full h-full max-w-[1600px] mx-auto" style={{ minHeight: 420 }}>
            <Globe3D />

              {/* Locations panel — adapted from Subsidiaries map legend, restyled for light bg */}
              <div className="absolute bottom-32 md:bottom-40 left-6 md:left-10 z-10 border border-copper/30 bg-white/80 backdrop-blur-md px-5 py-4 shadow-md rounded-lg">
                <div className="font-mono text-xs tracking-[0.22em] uppercase text-copper mb-2.5 font-bold">Locations</div>
                <div className="flex flex-col gap-1.5">
                  {DEFAULT_LOCATIONS.map((l) => (
                    <div key={l.city} className="flex items-center gap-2.5 font-mono text-sm text-obsidian">
                      <span className="w-2 h-2 rounded-full" style={{ background: l.color }} />
                      {l.city}
                    </div>
                  ))}
                  {INFRA_HUBS.map((h) => (
                    <div key={h.city} className="flex items-center gap-2.5 font-mono text-sm text-obsidian">
                      <span className="w-2 h-2 rotate-45" style={{ background: h.color }} />
                      {h.city}
                      <span className="text-[10px] tracking-[0.18em] text-obsidian/50">· INFRA</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom-left hub label + CTA */}
              <div className="absolute bottom-5 left-6 md:left-10 z-10 flex flex-col gap-2">
                <div className="font-mono text-xs md:text-sm tracking-[0.2em] uppercase text-copper font-bold">
                  {t("presence.hub")}
                </div>
                <Link
                  to="/subsidiaries#global-presence"
                  className="group inline-flex items-center gap-2 px-4 py-2 border border-copper/60 bg-white/80 backdrop-blur-md hover:bg-copper hover:border-copper transition-all duration-300 w-fit rounded-md"
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
    </div>
  );
}
