import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { translations } from "./translations";
import { useAssets } from "../context/AssetContext";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("sunjaya_lang") || "en");
  // CMS text overrides: { "hero.line1": "...", ... } (EN-first; ID overrides come in a later phase)
  const [overrides, setOverrides] = useState({ en: {}, id: {} });
  const [blocks, setBlocks] = useState([]);
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

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, blocks, listBlocks }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
