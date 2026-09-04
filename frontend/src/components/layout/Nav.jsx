import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useLang } from "../../i18n/LanguageContext";
import { LOGO } from "../../data/content";

const Logo = () => (
  <Link
    to="/"
    data-testid="nav-logo"
    className="flex items-center gap-3 group"
  >
    <img
      src={LOGO}
      alt=""
      className="w-16 h-16 md:w-20 md:h-20 object-contain transition-transform duration-500 group-hover:scale-105 -mt-1"
      style={{ mixBlendMode: "normal" }}
    />
    <span className="text-bone text-sm md:text-base font-bold tracking-[0.14em] uppercase whitespace-nowrap nav-hero-glow" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      Sunjaya Asia Group
    </span>
  </Link>
);

const links = [
  { to: "/", key: "home" },
  { to: "/about", key: "about" },
  { to: "/pillars", key: "pillars" },
  { to: "/subsidiaries", key: "subsidiaries" },
  { to: "/news", key: "news" },
  { to: "/contact", key: "contact" },
];

const LIGHT_PAGES = ["/contact", "/subsidiaries", "/news", "/about"];

export const Nav = () => {
  const { lang, setLang, t } = useLang();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLightPage = LIGHT_PAGES.some((p) => location.pathname === p || location.pathname.startsWith(p + "/"));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  // On light pages, always show the dark chrome so text is legible
  const chromeActive = scrolled || isLightPage;

  return (
    <header
      data-testid="site-nav"
      className={`fixed top-0 inset-x-0 z-50 transition-[background,border] duration-500 ${
        chromeActive ? "bg-obsidian/95 backdrop-blur-xl border-b border-white/10" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="max-w-[1600px] mx-auto px-6 md:px-10 h-20 md:h-24 flex items-center justify-between">
        <Logo />

        <nav className="hidden lg:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.key}
              to={l.to}
              end={l.to === "/"}
              data-testid={`nav-link-${l.key}`}
              className={({ isActive }) =>
                `nav-link font-mono text-[11px] tracking-[0.18em] uppercase transition-colors duration-300 ${
                  isActive
                    ? "text-copper nav-link-active"
                    : chromeActive
                      ? "text-ash hover:text-bone"
                      : "text-bone font-semibold hover:text-copper nav-hero-glow"
                }`
              }
            >
              {t(`nav.${l.key}`)}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className={`hidden md:flex items-center border border-white/30 ${chromeActive ? "" : "bg-obsidian/75 backdrop-blur-md shadow-[0_2px_12px_rgba(5,30,43,0.5)]"}`}>
            <button
              data-testid="lang-en"
              onClick={() => setLang("en")}
              className={`px-3 h-8 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors ${
                lang === "en" ? "bg-copper text-obsidian" : "text-ash hover:text-bone"
              }`}
            >
              EN
            </button>
            <button
              data-testid="lang-id"
              onClick={() => setLang("id")}
              className={`px-3 h-8 font-mono text-[10px] tracking-[0.2em] uppercase transition-colors border-l border-white/15 ${
                lang === "id" ? "bg-copper text-obsidian" : "text-ash hover:text-bone"
              }`}
            >
              ID
            </button>
          </div>

          <button
            data-testid="nav-toggle"
            className="lg:hidden w-10 h-10 border border-white/15 grid place-items-center"
            onClick={() => setOpen(!open)}
            aria-label="Menu"
          >
            <div className="flex flex-col gap-1.5">
              <span className={`block w-4 h-px bg-bone transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
              <span className={`block w-4 h-px bg-bone transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
            </div>
          </button>
        </div>
      </div>

      {open && (
        <div className="lg:hidden border-t border-white/10 bg-obsidian">
          <div className="px-6 py-6 flex flex-col gap-4">
            {links.map((l) => (
              <NavLink
                key={l.key}
                to={l.to}
                end={l.to === "/"}
                data-testid={`nav-mobile-${l.key}`}
                className={({ isActive }) =>
                  `nav-link font-mono text-xs tracking-[0.2em] uppercase ${isActive ? "text-copper nav-link-active" : "text-bone"}`
                }
              >
                {t(`nav.${l.key}`)}
              </NavLink>
            ))}
            <div className="flex gap-2 pt-4 border-t border-white/10">
              <button onClick={() => setLang("en")} className={`px-3 h-8 border border-white/15 font-mono text-[10px] tracking-[0.2em] ${lang === "en" ? "bg-copper text-obsidian" : "text-ash"}`}>EN</button>
              <button onClick={() => setLang("id")} className={`px-3 h-8 border border-white/15 font-mono text-[10px] tracking-[0.2em] ${lang === "id" ? "bg-copper text-obsidian" : "text-ash"}`}>ID</button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
