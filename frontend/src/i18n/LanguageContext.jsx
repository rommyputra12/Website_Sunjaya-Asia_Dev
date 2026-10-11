import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { translations } from "./translations";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("sunjaya_lang") || "en");
  // CMS text overrides: { "hero.line1": "...", ... } (EN-first; ID overrides come in a later phase)
  const [overrides, setOverrides] = useState({});

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
        const map = {};
        (r.data || []).forEach((b) => {
          if (b.key && (b.value ?? "") !== "") map[b.key] = b.value;
        });
        setOverrides(map);
      } catch {
        // silently fall back to bundled translations
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const t = (path, fallback) => {
    // CMS override applies to the default (EN) copy
    if (lang === "en" && overrides[path] !== undefined && overrides[path] !== "") {
      return overrides[path];
    }
    const parts = path.split(".");
    let cur = translations[lang];
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return fallback ?? path;
    }
    if (cur === undefined || cur === null || cur === path) return fallback ?? path;
    return cur;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
