import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { IMAGES, LOGO } from "../data/content";
import { toCdnUrl } from "../lib/media";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

// Map the camelCase keys used across the codebase (content.js) to DB asset keys
export const ASSET_DB_KEYS = {
  logo: "logo",
  cover: "cover",
  foundationSlide: "foundation_slide",
  coreSlide: "core_slide",
  futureSlide: "future_slide",
  pillarsPageBanner: "pillars_page_banner",
  pillarsPage01: "pillars_page_01",
  pillarsPage02: "pillars_page_02",
  pillarsPage03: "pillars_page_03",
  sti: "sti",
  sac: "sac",
  sae: "sae",
  agi: "agi",
  ecs: "ecs",
  sm: "sm",
  tsn: "tsn",
  san: "san",
  kgi: "kgi",
  homeSubsBg: "home_subsidiaries_bg",
  homePillar01Bg: "home_pillar_01_bg",
  homePillar02Bg: "home_pillar_02_bg",
  homePillar03Bg: "home_pillar_03_bg",
  bgBusinessPillars: "bg_business_pillars",
  bgFooter: "bg_footer",
  aboutBanner: "about_banner",
  aboutCompanyHistory: "about_company_history",
  footerCall: "footer_call",
  footerEmail: "footer_email",
  footerInstagram: "footer_instagram",
  footerLinkedin: "footer_linkedin",
};

// Fallback URLs (from content.js) keyed by the same camelCase keys
const FALLBACK_URLS = { ...IMAGES, logo: LOGO };

const AssetContext = createContext({ byKey: {}, ready: false });

const ASSET_CACHE = "sunjaya_assets_v1";

export const AssetProvider = ({ children }) => {
  // Cached asset list lets images start loading at first paint on repeat visits (refreshed in background)
  const cached = (() => { try { return JSON.parse(localStorage.getItem(ASSET_CACHE) || "null"); } catch { return null; } })();
  const [assets, setAssets] = useState(() => cached || []);
  const [ready, setReady] = useState(!!cached);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await axios.get(`${API}/assets`, { timeout: 6000 });
        if (!cancelled) setAssets(r.data || []);
        try { localStorage.setItem(ASSET_CACHE, JSON.stringify(r.data || [])); } catch { /* quota */ }
      } catch {
        // silently fall back to static URLs
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const byKey = useMemo(() => {
    const dbByKey = {};
    assets.forEach((a) => { dbByKey[a.key] = a; });
    const map = {};
    Object.entries(ASSET_DB_KEYS).forEach(([camelKey, dbKey]) => {
      const a = dbByKey[dbKey];
      map[camelKey] = {
        url: toCdnUrl(a?.url) || FALLBACK_URLS[camelKey],
        focal_x: a?.focal_x ?? 50,
        focal_y: a?.focal_y ?? 50,
        zoom: a?.zoom ?? 1,
        width: a?.width,
        alt: a?.alt || camelKey,
        meta: a?.meta || {},
        sort_order: a?.sort_order ?? 100,
      };
    });
    return map;
  }, [assets]);

  return (
    <AssetContext.Provider value={{ byKey, ready, assets }}>
      {children}
    </AssetContext.Provider>
  );
};

export const useAssets = () => useContext(AssetContext);
