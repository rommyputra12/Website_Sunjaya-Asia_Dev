import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import { Monitor, Phone, Smartphone, Star } from "lucide-react";
import { translations } from "../../i18n/translations";
import { DEFAULT_OFFICES, OFFICES_KEY, parseOffices } from "../../data/offices";
import { ABOUT_TEXT } from "../../data/aboutDefaults";
import { PARTNER_TEXT } from "../home/PartnersSection";
import { Fmt } from "../FormattedText";

export const PreviewCtx = createContext({ draft: {}, active: null, byKey: {} });

const FALLBACK = {
  "footer.description": "Empowering global industries by bridging essential resources with next-generation technology, sustainable infrastructure, and transformative enterprise solutions.",
  "footer.company": "Sunjaya Asia Group Limited",
  ...ABOUT_TEXT,
  ...PARTNER_TEXT,
};
const defaultOf = (key) => key.split(".").reduce((c, p) => (c && typeof c === "object" ? c[p] : undefined), translations.en) || FALLBACK[key] || "";

const useVal = () => {
  const { draft, byKey } = useContext(PreviewCtx);
  return (key) => draft[key] ?? (byKey[key]?.value || defaultOf(key));
};

// Text bound to a CMS key; highlighted when its field is focused
const T = ({ k, as: Tag = "span", className = "" }) => {
  const { active } = useContext(PreviewCtx);
  const val = useVal()(k);
  const on = active === k;
  return (
    <Tag data-testid={`preview-${k}`} className={`${className} transition-colors duration-200 rounded-[2px] ${on ? "bg-copper/30 outline outline-1 outline-copper text-white" : ""}`}>
      {val ? <Fmt text={val} /> : <span className="opacity-40 italic">(kosong)</span>}
    </Tag>
  );
};

const Frame = ({ children, light, className = "" }) => (
  <div className={`relative overflow-hidden border border-white/15 p-4 text-[9px] leading-snug ${light ? "bg-[#eef3f6] text-obsidian" : "bg-[#051e2b] text-bone"} ${className}`}>
    {children}
  </div>
);
const Btn = ({ k, ghost }) => (
  <span className={`inline-block px-2 py-1 font-mono text-[7px] tracking-[0.15em] uppercase rounded-full ${ghost ? "border border-white/40" : "bg-copper text-obsidian font-bold"}`}><T k={k} /></span>
);
const Kicker = ({ k, light }) => <T k={k} as="div" className={`font-mono text-[8px] tracking-[0.22em] uppercase font-bold ${light ? "text-copper" : "text-copper"}`} />;

const Hero = () => (
  <Frame className="min-h-[220px] bg-gradient-to-br from-[#051e2b] to-[#0d3149]">
    <T k="hero.overline" as="div" className="font-mono text-[7px] tracking-[0.2em] uppercase text-bone/70" />
    <div className="mt-3 font-serif text-[22px] leading-[1] tracking-tight"><T k="hero.line1" as="div" /><T k="hero.line2" as="div" className="italic text-copper" /></div>
    <T k="hero.sub" as="p" className="mt-3 text-bone/75 max-w-[85%]" />
    <div className="mt-3 flex gap-2"><Btn k="hero.cta_primary" /><Btn k="hero.cta_secondary" ghost /></div>
  </Frame>
);

const PillarsIntro = () => (
  <Frame className="min-h-[200px] bg-[#0b3550]">
    <div className="ml-[30%]">
      <Kicker k="home.pillars_intro.kicker" />
      <T k="home.pillars_intro.para1" as="p" className="mt-2 text-bone/90 text-justify" />
      <p className="mt-2 text-bone/90"><T k="home.pillars_intro.para2" /> <T k="home.pillars_intro.highlight" className="font-bold text-copper" /></p>
    </div>
    <div className="mt-4 ml-[30%] grid grid-cols-3 gap-1 opacity-50">{["01", "02", "03"].map((n) => <div key={n} className="h-8 rounded bg-sky-400/30 grid place-items-center font-bold">{n}</div>)}</div>
  </Frame>
);

const SubsTeaser = () => (
  <Frame light>
    <div className="flex justify-between gap-3">
      <div><Kicker k="home.subs.kicker" light /><T k="home.subs.title" as="div" className="mt-1 font-serif text-[12px]" /></div>
      <T k="home.subs.desc" as="p" className="text-[#1d538f] text-right max-w-[45%]" />
    </div>
    <div className="mt-3 grid grid-cols-3 gap-1">{[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="h-10 bg-obsidian/70 rounded-sm" />)}</div>
    <div className="mt-3 text-center"><Btn k="home.subs.cta" /></div>
  </Frame>
);

const Stats = () => (
  <Frame className="bg-[#0d3149]">
    <div className="grid grid-cols-2 gap-3">
      {["modules", "projects", "countries", "contract"].map((id, i) => (
        <div key={id}>
          <div className="font-mono text-[7px] uppercase tracking-[0.14em] text-copper">0{i + 1} · <T k={`stats.${id}`} className="text-bone" /></div>
          <T k={`stats.value.${id}`} as="div" className="mt-1 font-serif text-[16px] text-white" />
        </div>
      ))}
    </div>
  </Frame>
);

const Presence = () => {
  const { counts = {} } = useContext(PreviewCtx);
  return (
  <Frame light>
    <Kicker k="presence.kicker" light />
    <div className="mt-2 font-serif text-[14px] leading-tight"><T k="presence.title" /> <T k="presence.titleHighlight" className="text-copper italic" /></div>
    <T k="presence.sub" as="p" className="mt-2 text-obsidian/70" />
    <div className="mt-3 grid grid-cols-3 gap-2">
      {["branches", "clients", "countries"].map((id) => (
        <div key={id}><div className="font-serif text-[14px] text-copper">{counts[id]}</div><T k={`presence.stats.${id}`} className="font-mono text-[7px] uppercase text-obsidian/60" /></div>
      ))}
    </div>
    <div className="mt-3 flex items-center justify-between"><T k="presence.hub" className="font-mono text-[7px] uppercase text-obsidian/60" /><Btn k="presence.cta" /></div>
  </Frame>
  );
};

const PillarsPageIntro = () => (
  <Frame><Kicker k="manifesto.overline" /><T k="manifesto.title" as="div" className="mt-2 font-serif text-[15px] leading-tight" /></Frame>
);

const Pillar = ({ num }) => {
  const { byKey, draft } = useContext(PreviewCtx);
  const re = new RegExp(`^pillar\\.${num}\\.div\\.\\d+\\.name$`);
  const keys = [...new Set([...Object.keys(byKey), ...Object.keys(draft)])].filter((k) => re.test(k)).sort();
  return (
    <Frame light className="bg-white/90">
      <div className="flex gap-2">
        <span className="font-serif text-[22px] text-copper leading-none">{num}</span>
        <div className="flex-1">
          <div className="border-b border-copper pb-1 mb-2"><T k={`pillar.${num}.kicker`} as="div" className="font-mono text-[7px] uppercase tracking-[0.2em] font-bold" /><T k={`pillar.${num}.title`} as="div" className="font-serif text-[14px]" /></div>
          <T k={`pillar.${num}.body`} as="p" className="text-obsidian/75 text-justify" />
          <ul className="mt-2 space-y-1">
            {keys.map((k) => <li key={k} className="flex gap-1 font-mono text-[8px] font-bold"><Star className="w-2.5 h-2.5 text-copper fill-copper shrink-0" strokeWidth={0} /><T k={k} /></li>)}
          </ul>
        </div>
      </div>
    </Frame>
  );
};

const About = () => (
  <Frame>
    <Kicker k="about.overline" />
    <T k="about.title" as="div" className="mt-2 font-serif text-[15px] leading-tight" />
    <T k="about.body1" as="p" className="mt-2 text-bone/80" />
    <T k="about.body2" as="p" className="mt-2 text-bone/80" />
  </Frame>
);

const Contact = () => (
  <Frame>
    <T k="contact.title" as="div" className="font-serif text-[18px]" />
    <T k="contact.sub" as="p" className="mt-2 text-bone/80" />
    <div className="mt-3 grid grid-cols-2 gap-1 opacity-40">{[1, 2, 3, 4].map((i) => <div key={i} className="h-4 border-b border-white/30" />)}</div>
    <div className="mt-3 border border-copper/50 p-2 text-copper">✓ <T k="contact.success" /></div>
  </Frame>
);

const FooterTop = () => (
  <Frame className="bg-[#071d27]">
    <T k="footer.tagline" as="div" className="font-serif italic text-[20px] leading-none" />
    <T k="footer.description" as="p" className="mt-2 ml-8 border-l border-copper/70 pl-2 text-white/70" />
    <T k="footer.company" as="div" className="mt-3 pt-2 border-t border-white/15 font-mono text-[9px] tracking-[0.2em] uppercase font-bold" />
  </Frame>
);

const Offices = () => {
  const { draft, byKey, active } = useContext(PreviewCtx);
  const list = parseOffices(draft[OFFICES_KEY] ?? byKey[OFFICES_KEY]?.value) || DEFAULT_OFFICES;
  const Office = ({ o, i }) => (
    <div data-testid={`preview-office-${i}`} className={`p-1 rounded-[2px] transition-colors ${active === `office-${i}` ? "bg-copper/30 outline outline-1 outline-copper" : ""}`}>
      <div className="font-mono text-[7px] tracking-[0.14em] uppercase text-copper">{o.label}</div>
      <div className="text-white/80">{o.line1}</div><div className="text-white/80">{o.line2}</div>{o.country && <div className="text-white/80">{o.country}</div>}
      {o.phone && <div className="mt-1 flex items-center gap-1 text-white/80"><Phone className="w-2.5 h-2.5 text-copper" />{o.phone}</div>}
    </div>
  );
  const [hq, ...rest] = list;
  return (
    <Frame className="bg-[#071d27]">
      {hq && <Office o={hq} i={0} />}
      {rest.length > 0 && <div className={`mt-3 grid gap-2 grid-cols-${rest.length}`} style={{ gridTemplateColumns: `repeat(${rest.length}, minmax(0,1fr))` }}>{rest.map((o, i) => <Office key={i} o={o} i={i + 1} />)}</div>}
    </Frame>
  );
};

const Partners = () => (
  <Frame>
    <Kicker k="home.partners.kicker" />
    <T k="home.partners.title" as="p" className="mt-1 font-serif text-[11px] text-bone/90 max-w-[85%]" />
    {[0, 1, 2].map((r) => (
      <div key={r} className="mt-2 grid grid-cols-5 gap-1 opacity-50">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="h-6 rounded-[3px] border border-white/15 bg-[#0c2635]" />)}</div>
    ))}
  </Frame>
);

const PartnerCta = () => (
  <Frame className="bg-[#0a2231] border-l-2 border-l-copper">
    <Kicker k="about.partner.kicker" />
    <T k="about.partner.text" as="p" className="mt-2 font-serif text-[11px] text-bone/90 whitespace-pre-line" />
    <div className="mt-3 flex items-center gap-2"><Btn k="about.partner.cta" /><T k="about.partner.email" className="font-mono text-[8px] text-bone/80" /></div>
  </Frame>
);

const MAP = {
  partners: Partners, about_partner: PartnerCta,
  hero: Hero, pillars_intro: PillarsIntro, subsidiaries_teaser: SubsTeaser, stats: Stats, global_presence: Presence, intro: PillarsPageIntro,
  about: About, contact: Contact, footer: FooterTop, offices: Offices,
};

// Desktop/HP choice shared by every section preview (remembered in localStorage)
const DEVICE_KEY = "cms-preview-device";
const useDevice = () => {
  const [device, setDevice] = useState(() => localStorage.getItem(DEVICE_KEY) || "desktop");
  useEffect(() => {
    const on = () => setDevice(localStorage.getItem(DEVICE_KEY) || "desktop");
    window.addEventListener("cms-preview-device", on);
    return () => window.removeEventListener("cms-preview-device", on);
  }, []);
  const set = (d) => { localStorage.setItem(DEVICE_KEY, d); window.dispatchEvent(new Event("cms-preview-device")); };
  return [device, set];
};

const DEVICES = { desktop: { w: 1440, h: 810 }, mobile: { w: 390, h: 844 } };

// Real capture: the live page scaled down inside an iframe, scrolled to the section anchor
const LiveFrame = ({ url, version, device }) => {
  const box = useRef(null);
  const [w, setW] = useState(560);
  useEffect(() => {
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width));
    if (box.current) ro.observe(box.current);
    return () => ro.disconnect();
  }, []);
  const d = DEVICES[device];
  const mobile = device === "mobile";
  const scale = mobile ? Math.min(0.62, (w - 24) / d.w) : w / d.w;
  const iframe = (
    <iframe key={`${version}-${device}`} title="Live preview" src={url} data-testid="preview-live-iframe" loading="lazy"
      className="absolute top-0 left-0 origin-top-left pointer-events-none" style={{ width: d.w, height: d.h, transform: `scale(${scale})` }} />
  );
  return (
    <div ref={box} data-testid={`preview-live-${device}`} className={`relative w-full overflow-hidden ${mobile ? "flex justify-center py-3 bg-black/20 border border-white/10" : "border border-white/15 bg-obsidian"}`} style={mobile ? undefined : { height: d.h * scale }}>
      {mobile ? (
        <div className="relative rounded-[22px] border-[6px] border-[#1b2a33] shadow-[0_10px_30px_-12px_rgba(0,0,0,.8)] overflow-hidden bg-obsidian" style={{ width: d.w * scale + 12, height: d.h * scale + 12 }}>
          <span className="absolute top-1 left-1/2 -translate-x-1/2 z-10 h-1.5 w-12 rounded-full bg-[#1b2a33]" />
          <div className="relative w-full h-full">{iframe}</div>
        </div>
      ) : iframe}
    </div>
  );
};

export const SectionPreview = ({ sectionId, url, keys = [] }) => {
  const { version, active, draft } = useContext(PreviewCtx);
  const [mode, setMode] = useState("live");
  const [device, setDevice] = useDevice();
  const m = sectionId.match(/^pillar_(\d+)$/);
  const C = m ? () => <Pillar num={m[1]} /> : MAP[sectionId];
  // Switch to the instant mock while typing so unsaved edits are visible
  useEffect(() => { if (C && keys.includes(active) && draft[active] !== undefined) setMode("mock"); }, [active, draft]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!C && !url) return null;
  const tab = (id, label) => (
    <button onClick={() => setMode(id)} data-testid={`preview-mode-${id}-${sectionId}`}
      className={`px-2 py-1 font-mono text-[8px] tracking-[0.18em] uppercase transition-colors ${mode === id ? "bg-copper text-obsidian" : "text-ash hover:text-copper"}`}>{label}</button>
  );
  return (
    <div data-testid={`preview-${sectionId}`} className="lg:sticky lg:top-24">
      <div className="flex items-center justify-between mb-2">
        <span className="font-mono text-[9px] tracking-[0.22em] uppercase text-ash">Preview</span>
        <span className="flex items-center gap-2">
          {mode === "live" && url && (
            <span className="flex border border-white/15">
              {[["desktop", Monitor, "Desktop"], ["mobile", Smartphone, "HP"]].map(([id, Icon, label]) => (
                <button key={id} onClick={() => setDevice(id)} title={label} aria-label={`Preview ${label}`} data-testid={`preview-device-${id}-${sectionId}`}
                  className={`px-2 py-1 transition-colors ${device === id ? "bg-copper text-obsidian" : "text-ash hover:text-copper"}`}><Icon className="w-3 h-3" /></button>
              ))}
            </span>
          )}
          <span className="flex border border-white/15">{url && tab("live", "Tampilan asli")}{C && tab("mock", "Highlight edit")}</span>
        </span>
      </div>
      {mode === "live" && url ? <LiveFrame url={url} version={version} device={device} /> : <C />}
      <p className="mt-2 font-mono text-[8px] text-smoke">
        {mode === "live" && url ? "Tampilan asli situs — diperbarui setelah teks tersimpan." : "Klik sebuah field — bagian yang diedit disorot oranye, berubah langsung saat mengetik."}
      </p>
    </div>
  );
};
