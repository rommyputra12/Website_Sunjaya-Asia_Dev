import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { translations } from "./translations";
import { useAssets } from "../context/AssetContext";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

const CONTENT_CACHE = "sunjaya_content_v1";
const toOverrides = (rows) => {
  const map = { en: {}, id: {} };
  rows.forEach((b) => {
    if (!b.key) return;
    if ((b.value ?? "") !== "") map.en[b.key] = b.value;
    if ((b.value_id ?? "") !== "") map.id[b.key] = b.value_id;
  });
  return map;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("sunjaya_lang") || "en");
  // CMS text overrides: { "hero.line1": "...", ... } (EN-first; ID overrides come in a later phase)
  // Last CMS payload is cached locally so returning visitors see CMS text instantly (refreshed in background)
  const cached = (() => { try { return JSON.parse(localStorage.getItem(CONTENT_CACHE) || "null"); } catch { return null; } })();
  const [blocks, setBlocks] = useState(() => cached || []);
  const [overrides, setOverrides] = useState(() => toOverrides(cached || []));
  const [contentReady, setContentReady] = useState(!!cached);
  const { byKey } = useAssets();

  useEffect(() => {
    localStorage.setItem("sunjaya_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await axios.get(`${API}/content`);
        if (cancelled) return;
        setOverrides(toOverrides(r.data || []));
        setBlocks(r.data || []);
        try { localStorage.setItem(CONTENT_CACHE, JSON.stringify(r.data || [])); } catch { /* quota */ }
      } catch {
        // silently fall back to bundled translations
      } finally {
        if (!cancelled) setContentReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const t = (path, fallback) => {
    // Asset-bound texts (e.g. subsidiary cards) are edited in the Images tab
    const parts0 = path.split(".");
    if (parts0.length === 3 && parts0[0] === "subsidiary") {
      const meta = byKey[parts0[1]]?.meta?.[parts0[2]];
      if (meta) {
        let v = lang === "id" ? (meta.id || meta.en) : meta.en;
        if (v && (parts0[2] === "city" || parts0[2] === "country") && v.includes(",")) {
          const c = v.split(",");
          v = (parts0[2] === "city" ? c[0] : c.slice(1).join(",")).trim();
        }
        if (v) return v;
      }
    }
    const ov = overrides[lang]?.[path];
    if (ov) return ov;
    const parts = path.split(".");
    let cur = translations[lang];
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return fallback ?? path;
    }
    if (cur === undefined || cur === null || cur === path) return fallback ?? path;
    return cur;
  };

  // List CMS blocks whose key starts with prefix, sorted by sort_order
  const listBlocks = (prefix) =>
    blocks
      .filter((b) => b.key.startsWith(prefix))
      .sort((a, b) => (a.sort_order ?? 100) - (b.sort_order ?? 100));

  // JSON list stored in a CMS block (EN value, optional ID value_id); falls back to the given default
  const tl = (key, fallback) => {
    const b = blocks.find((x) => x.key === key);
    for (const raw of [lang === "id" ? b?.value_id : null, b?.value]) {
      try { const arr = JSON.parse(raw || ""); if (Array.isArray(arr) && arr.length) return arr; } catch { /* use next */ }
    }
    return fallback;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, tl, blocks, listBlocks, contentReady }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
