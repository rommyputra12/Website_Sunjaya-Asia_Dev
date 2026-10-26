import React from "react";
import { motion } from "framer-motion";
import { useLang } from "../../i18n/LanguageContext";

const CARDS = [
  { num: "01", title: "The Foundation", sub: "Macro Capital Investment & Infrastructure", shift: "mr-8" },
  { num: "02", title: "The Core", sub: "Global Commodity Trading & Supply Chain Optimization", shift: "ml-8" },
  { num: "03", title: "The Future", sub: "Next-Generation Technology Development", shift: "mr-8" },
];

// Mobile-only floating glass cards under the Business Pillars intro; tap scrolls to the pillar
export const PillarFloatCards = () => {
  const { t } = useLang();
  const go = (num) => document.getElementById(`pillar-${num}`)?.scrollIntoView({ behavior: "smooth" });
  return (
    <div data-testid="home-pillar-cards" className="md:hidden mt-2 mb-10 flex flex-col gap-4">
      {CARDS.map((c, i) => (
        <motion.button
          key={c.num}
          type="button"
          onClick={() => go(c.num)}
          data-testid={`home-pillar-card-${c.num}`}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.4 }}
          transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
          className={`${c.shift} pillar-float group relative overflow-hidden rounded-xl border border-white/15 border-l-2 border-l-copper bg-obsidian/55 backdrop-blur-xl px-5 py-4 text-left shadow-[0_18px_40px_-12px_rgba(0,0,0,0.7)] active:scale-[0.98] transition-transform`}
          style={{ animationDelay: `${i * 0.8}s` }}
        >
          <span className="absolute -top-10 -right-10 h-28 w-28 rounded-full bg-copper/20 blur-2xl pointer-events-none" />
          <span className="flex items-baseline gap-3">
            <span className="font-italic-accent text-3xl text-copper-hi leading-none">{c.num}</span>
            <span className="font-serif text-lg text-white tracking-tight">{t(`home.pillars_intro.card${c.num}_title`, c.title)}</span>
            <span className="ml-auto font-mono text-xs text-copper transition-transform group-active:translate-x-1">→</span>
          </span>
          <span className="mt-2 block font-mono text-[10px] tracking-[0.1em] uppercase text-bone/80 leading-relaxed">
            {t(`home.pillars_intro.card${c.num}_sub`, c.sub)}
          </span>
        </motion.button>
      ))}
    </div>
  );
};
