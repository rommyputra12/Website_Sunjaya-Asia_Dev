import React, { useEffect, useState } from "react";
import axios from "axios";
import { Reveal, LineReveal } from "../components/motion/Reveal";
import { useLang } from "../i18n/LanguageContext";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

export default function News() {
  const { t, lang } = useLang();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const r = await axios.get(`${API}/news`, { params: { language: lang } });
        setItems(Array.isArray(r.data) ? r.data : []);
      } catch (e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [lang]);

  if (selected) {
    return (
      <div data-testid="news-detail" className="pt-32 pb-24">
        <div className="max-w-[1000px] mx-auto px-6 md:px-10">
          <button onClick={() => setSelected(null)} className="font-mono text-[11px] tracking-[0.22em] uppercase text-copper hover:text-copper-hi mb-8">
            ← {t("news.back")}
          </button>
          <span className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash">{selected.category}</span>
          <h1 className="font-serif text-xl md:text-2xl text-bone tracking-tight leading-[1.15] mt-3">{selected.title}</h1>
          <p className="font-mono text-xs text-ash mt-6">{new Date(selected.created_at).toLocaleDateString()}</p>
          {selected.cover_image && (
            <div className="mt-10 aspect-[16/9] overflow-hidden clip-frame">
              <img src={selected.cover_image} alt="" className="w-full h-full object-cover" />
            </div>
          )}
          <div className="mt-10 text-bone/85 text-lg leading-[1.75] whitespace-pre-wrap font-serif">
            {selected.body}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="news-page" className="pt-32 pb-24 section-light">
      <div className="max-w-[1600px] mx-auto px-6 md:px-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-16">
          <div className="md:col-span-6">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-copper">Insights</span>
            <h1 className="font-serif text-2xl md:text-4xl leading-[1.1] tracking-[-0.02em] text-bone mt-3">
              <LineReveal text={t("news.title")} />
            </h1>
          </div>
          <div className="md:col-span-5 md:col-start-8 self-end">
            <p className="text-bone/80 text-lg leading-relaxed">{t("news.sub")}</p>
          </div>
        </div>

        {loading ? (
          <div className="font-mono text-xs text-ash">Loading…</div>
        ) : items.length === 0 ? (
          <div className="border border-white/10 p-16 text-center">
            <p className="font-mono text-sm text-ash tracking-wide">{t("news.empty")}</p>
          </div>
        ) : (
          <div className="border-t border-white/10">
            {items.map((n, i) => (
              <Reveal key={n.id} delay={i * 0.05}>
                <button
                  data-testid={`news-item-${n.slug}`}
                  onClick={() => setSelected(n)}
                  className="w-full text-left group grid grid-cols-12 gap-4 items-start py-10 border-b border-white/10 hover:bg-ink/50 transition-colors"
                >
                  <span className="col-span-2 md:col-span-1 font-mono text-[10px] tracking-[0.2em] text-copper">0{i + 1}</span>
                  <div className="col-span-10 md:col-span-7">
                    <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-ash mb-2">{n.category}</div>
                    <h2 className="font-serif text-xl md:text-2xl text-bone tracking-tight leading-tight group-hover:text-copper transition-colors">{n.title}</h2>
                    <p className="mt-3 text-bone/75 text-sm leading-relaxed max-w-2xl">{n.excerpt}</p>
                  </div>
                  <div className="col-span-12 md:col-span-3 font-mono text-[11px] text-ash">
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                  <span className="hidden md:block col-span-1 text-right font-mono text-copper group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
