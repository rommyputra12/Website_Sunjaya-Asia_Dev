import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { translations } from "./translations";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("sunjaya_lang") || "en");
  // CMS text overrides: { "hero.line1": "...", ... } (EN-first; ID overrides come in a later phase)
  const [overrides, setOverrides] = useState({ en: {}, id: {} });
  const [blocks, setBlocks] = useState([]);

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
        const map = { en: {}, id: {} };
        (r.data || []).forEach((b) => {
          if (!b.key) return;
          if ((b.value ?? "") !== "") map.en[b.key] = b.value;
          if ((b.value_id ?? "") !== "") map.id[b.key] = b.value_id;
        });
        setOverrides(map);
        setBlocks(r.data || []);
      } catch {
        // silently fall back to bundled translations
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const t = (path, fallback) => {
    // CMS override applies to the default (EN) copy
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

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, blocks, listBlocks }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
