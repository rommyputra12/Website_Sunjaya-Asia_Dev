import React from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Mail, Phone, Link as Linkedin, Drama as Instagram } from "lucide-react";
import { useLang } from "../../i18n/LanguageContext";

const SOCIALS = [
  { href: "https://www.linkedin.com/company/sunjayaasiagroup/", icon: Linkedin, label: "LinkedIn", external: true },
  { href: "https://www.instagram.com/sunjaya.group", icon: Instagram, label: "Instagram", external: true },
  { to: "/contact", icon: Mail, label: "Email" },
  { to: "/contact", icon: Phone, label: "Phone" },
];

export const Footer = () => {
  const { t } = useLang();

  return (
    <footer data-testid="site-footer" className="snap-section relative h-[100svh] overflow-hidden bg-[#071d27] text-bone">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/Footer_Background_04.31.05.jpg')" }}
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
                Empowering global industries by bridging essential resources with next-generation technology, sustainable infrastructure, and transformative enterprise solutions.
              </p>

              <div className="mt-8 w-fit border-t border-white/15 pt-3 md:mt-10 md:pt-4 lg:mt-12 lg:pt-5">
                <div className="mb-3 font-mono text-[15px] tracking-[0.2em] uppercase text-white font-bold sm:mb-4 sm:text-base">Sunjaya Asia Group Limited</div>
                <div className="text-[11px] leading-[1.4] text-white/80 sm:text-xs">
                  <div>
                    <div className="mb-1 font-mono text-[11px] tracking-[0.16em] uppercase text-copper sm:text-xs">Head Quarter · Registered Office</div>
                    <p>{t("footer.addr_sg_line1")}</p>
                    <p>{t("footer.addr_sg_line2")}</p>
                    <a href="tel:+6531080411" className="mt-2 flex items-center gap-2 text-[11px] leading-[1.4] text-white/80 transition-colors hover:text-copper sm:text-xs">
                      <Phone className="h-3.5 w-3.5 shrink-0 text-copper" strokeWidth={1.5} />
                      +65 3108 0411
                    </a>
                  </div>
                  <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-8">
                    <div>
                      <div className="mb-1 font-mono text-[11px] tracking-[0.16em] uppercase text-copper sm:text-xs">Branch & Central Hub · Indonesia</div>
                      <p>{t("footer.addr_id_line1")}<sup className="text-[0.6em]">th</sup>, Kawasan Mega Kuningan</p>
                      <p>{t("footer.addr_id_line2")}</p>
                      <a href="tel:+622121689411" className="mt-2 flex items-center gap-2 text-[11px] leading-[1.4] text-white/80 transition-colors hover:text-copper sm:text-xs">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-copper" strokeWidth={1.5} />
                        +62 21 2168 9411
                      </a>
                    </div>
                    <div>
                      <div className="mb-1 font-mono text-[11px] tracking-[0.16em] uppercase text-copper sm:text-xs">Branch Investment Hub · United States</div>
                      <p>8 The Green, Ste A, Suite B</p>
                      <p>Dover, DE 19901, Kent County, Delaware, United States</p>
                      <a href="tel:+13022489559" className="mt-2 flex items-center gap-2 text-[11px] leading-[1.4] text-white/80 transition-colors hover:text-copper sm:text-xs">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-copper" strokeWidth={1.5} />
                        +1 302 248 9559
                      </a>
                    </div>
                  </div>
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

          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {SOCIALS.map((s) => {
              const cls = "group flex h-6 w-6 items-center justify-center rounded-full border border-white/20 text-white/70 transition-all hover:border-copper hover:text-copper hover:bg-copper/10 sm:h-7 sm:w-7";
              const inner = <s.icon className="h-3 w-3" strokeWidth={1.5} />;
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
          <p>Est. 2013 · Restructured 2025</p>
        </div>
      </div>
    </footer>
  );
};
