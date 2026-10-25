import { useMemo } from "react";
import { SUBSIDIARIES } from "../data/content";
import { useAssets } from "../context/AssetContext";

const TIER_ORDER = { branch: 0, subsidiary: 1, affiliate: 2 };
const en = (m, f) => (m?.[f]?.en || "").trim();

// Companies = every card uploaded in CMS Images → Subsidiaries; static data only fills defaults
export const buildCompanies = (assets) => {
  const cards = (assets || []).filter((a) => a.section === "home_subsidiaries");
  if (!cards.length) return SUBSIDIARIES;
  return cards.map((a) => {
    const def = SUBSIDIARIES.find((x) => x.id === a.key) || {};
    const m = a.meta || {};
    const [dCity = "", dCountry = ""] = (def.city || "").split(",").map((x) => x.trim());
    const city = en(m, "city").split(",")[0].trim() || dCity;
    const country = en(m, "country") || dCountry;
    return {
      ...def,
      id: a.key,
      image: a.key,
      name: def.name || en(m, "name") || a.alt || a.key,
      tag: def.tag || en(m, "tag"),
      role: def.role || en(m, "role"),
      sector: def.sector || en(m, "sector"),
      city: [city, country].filter(Boolean).join(", "),
      tier: m.tier || def.tier || "subsidiary",
      sort_order: a.sort_order ?? 100,
    };
  });
};

export const sortByTier = (list) => [...list].sort((a, b) => (TIER_ORDER[a.tier] ?? 9) - (TIER_ORDER[b.tier] ?? 9));

export const useCompanies = () => {
  const { assets } = useAssets();
  return useMemo(() => buildCompanies(assets), [assets]);
};
