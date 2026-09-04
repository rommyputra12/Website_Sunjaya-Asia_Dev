import React, { createContext, useContext, useEffect, useState } from "react";
import { translations } from "./translations";

const LanguageContext = createContext({ lang: "en", setLang: () => {}, t: (k) => k });

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem("sunjaya_lang") || "en");

  useEffect(() => {
    localStorage.setItem("sunjaya_lang", lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = (path) => {
    const parts = path.split(".");
    let cur = translations[lang];
    for (const p of parts) {
      if (cur && typeof cur === "object" && p in cur) cur = cur[p];
      else return path;
    }
    return cur;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
