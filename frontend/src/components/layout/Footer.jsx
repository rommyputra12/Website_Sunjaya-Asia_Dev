import React from "react";
import { ADMIN_PATH } from "../../lib/adminPath";
import { Link, useNavigate } from "react-router-dom";
import { ArrowUpRight, Phone } from "lucide-react";
import { useLang } from "../../i18n/LanguageContext";
import AssetImg from "../AssetImg";
import { useOffices, telHref } from "../../data/offices";
import { Fmt } from "../FormattedText";

const SOCIALS = [
  { href: "https://www.linkedin.com/company/sunjayaasiagroup/", imageKey: "footerLinkedin", label: "LinkedIn", external: true },
  { href: "https://www.instagram.com/sunjaya.group", imageKey: "footerInstagram", label: "Instagram", external: true },
  { to: "/contact", imageKey: "footerEmail", label: "Email" },
  { to: "/contact", imageKey: "footerCall", label: "Call center" },
];

const OfficeBlock = ({ o, i }) => (
  <div data-testid={`footer-office-${i}`} className="min-w-0">
    <div data-testid={`footer-office-label-${i}`} className="mb-1 font-mono text-[11px] tracking-[0.16em] sm:tracking-[0.1em] lg:tracking-[0.16em] uppercase text-copper sm:whitespace-nowrap sm:text-xs">{o.label}</div>
    {o.line1 && <p>{o.line1}</p>}
    {o.line2 && <p>{o.line2}</p>}
    {o.country && <p>{o.country}</p>}
    {o.phone && (
      <a href={telHref(o.phone)} className="mt-2 flex items-center gap-2 text-[11px] leading-[1.4] text-white/80 transition-colors hover:text-copper sm:text-xs">
        <Phone className="h-3.5 w-3.5 shrink-0 text-copper" strokeWidth={1.5} />
        {o.phone}
      </a>
    )}
  </div>
);

export const Footer = () => {
  const { t } = useLang();
  const [hq, ...branches] = useOffices();
  const navigate = useNavigate();
  const secretRef = React.useRef({ count: 0, timer: null });

  const handleSecret = () => {
    const s = secretRef.current;
    s.count += 1;
    clearTimeout(s.timer);
    if (s.count >= 5) {
      s.count = 0;
      navigate(ADMIN_PATH);
      return;
    }
    s.timer = setTimeout(() => { s.count = 0; }, 2000);
  };

  return (
    <footer id="site-footer" data-testid="site-footer" className="snap-section relative h-[100svh] overflow-hidden bg-[#071d27] text-bone">
      <AssetImg
        k="bgFooter"
        alt=""
        className="absolute inset-0 w-full h-full object-cover"
        aria-hidden="true"
      />

      <div className="relative mx-auto flex h-full w-full max-w-[1920px] flex-col px-5 pt-4 pb-4 sm:px-8 sm:pt-5 sm:pb-5 md:px-10 md:pt-6 md:pb-6 lg:px-14 lg:pt-7 lg:pb-7">
        <div className="grid min-h-0 flex-1 grid-cols-1 items-end gap-4 sm:gap-5 md:gap-6 lg:gap-10">
          <div className="flex min-h-0 flex-col justify-end pb-1">
            <div>
              <h2 className="max-w-none font-elegant-serif text-[clamp(2.4rem,5vw,6rem)] leading-[0.95] tracking-[-0.02em] text-bone">
                {t("footer.tagline")}
              </h2>
              <p className="mt-3 ml-32 max-w-[min(100%,540px)] border-l border-copper/70 pl-5 text-[11px] leading-[1.5] text-white/70 sm:ml-36 sm:pl-6 sm:text-xs lg:ml-40 lg:pl-7 lg:text-sm">
                <Fmt text={t("footer.description", "Empowering global industries by bridging essential resources with next-generation technology, sustainable infrastructure, and transformative enterprise solutions.")} />
              </p>

              <div className="mt-8 w-fit max-w-full border-t border-white/15 pt-3 md:mt-10 md:pt-4 lg:mt-12 lg:pt-5">
                <div className="mb-3 font-mono text-[15px] tracking-[0.2em] uppercase text-white font-bold sm:mb-4 sm:text-base">{t("footer.company", "Sunjaya Asia Group Limited")}</div>
                <div className="text-[11px] leading-[1.4] text-white/80 sm:text-xs">
                  {hq && <OfficeBlock o={hq} i={0} />}
                  {branches.length > 0 && (
                    <div className={`mt-10 grid grid-cols-1 gap-4 sm:gap-8 ${branches.length === 1 ? "" : branches.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
                      {branches.map((o, i) => <OfficeBlock key={i} o={o} i={i + 1} />)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-end justify-between gap-4 pt-6 sm:pt-7 md:pt-8 lg:pt-10">
          <div className="w-fit">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-1.5 rounded-full bg-copper px-3.5 py-1.5 font-mono text-[9px] font-bold tracking-[0.16em] uppercase text-[#071d27] shadow-[0_0_0_0_rgba(200,126,51,0.5)] transition-all duration-300 hover:shadow-[0_0_0_4px_rgba(200,126,51,0.25)] hover:brightness-110 sm:px-4 sm:py-2 sm:text-[10px]"
            >
              Contact Us
              <ArrowUpRight className="h-3 w-3 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5" strokeWidth={2} />
            </Link>
            <div className="mt-4 border-t border-white/15 pt-3 sm:pt-4">
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-white/55 font-bold sm:text-xs">Legal</div>
              <nav className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5 sm:gap-x-5">
                {[
                  { slug: "data-protection", label: "Data Protection Policy" },
                  { slug: "cookie-statement", label: "Cookie Statement" },
                  { slug: "terms-of-use", label: "Terms of Use" },
                  { slug: "investor-relations", label: "Investor Relations" },
                ].map((p) => (
                  <Link
                    key={p.slug}
                    to={`/legal/${p.slug}`}
                    className="group flex items-center gap-1 font-mono text-[10px] tracking-[0.1em] uppercase text-white/85 transition-colors hover:text-copper sm:text-[11px]"
                  >
                    <span>{p.label}</span>
                    <ArrowUpRight className="h-3 w-3 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" strokeWidth={1.5} />
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {SOCIALS.map((s) => {
              const cls = "group flex h-6 w-6 items-center justify-center rounded-full overflow-hidden transition-all duration-300 hover:scale-110 sm:h-7 sm:w-7";
              const inner = (
                <AssetImg
                  k={s.imageKey}
                  sizes="96px"
                  alt={s.label}
                  className="h-full w-full object-cover"
                />
              );
              if (s.external) {
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cls}
                  >
                    {inner}
                  </a>
                );
              }
              return (
                <Link key={s.label} to={s.to} aria-label={s.label} className={cls}>
                  {inner}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex shrink-0 flex-col gap-1.5 border-t border-white/15 pt-3 font-mono text-[8px] tracking-[0.13em] uppercase text-white/50 sm:flex-row sm:items-center sm:justify-between sm:pt-4 sm:text-[9px]">
          <p>{t("footer.copy")}</p>
          <p
            onClick={handleSecret}
            data-testid="secret-admin-trigger"
            title="Sunjaya Asia Group"
            className="cursor-default select-none"
          >Est. 2013 · Restructured 2025</p>
        </div>
      </div>
    </footer>
  );
};
