import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE = "https://sunjayaasia.com";
const BRAND = "Sunjaya Asia Group";
const DEFAULT_DESC = "The global investment holding driving sustainable advancement across capital, green energy, global trade, technology and defense.";

const PAGES = {
  "/": { title: `${BRAND} — The Power of Innovations`, desc: DEFAULT_DESC },
  "/about": { title: `About Us — ${BRAND}`, desc: "Discover Sunjaya Asia Group: our journey since 2013, our competitive edge in digital & green transformation, corporate identity and certifications." },
  "/pillars": { title: `Business Pillars — ${BRAND}`, desc: "Three strategic pillars — The Foundation, The Core and The Future — bridging world-class capital, industry and high-impact technology." },
  "/subsidiaries": { title: `Subsidiaries & Affiliates — ${BRAND}`, desc: "An integrated ecosystem of subsidiaries and affiliates in capital & wealth management, green energy, global commodities trade, IT and defense technology." },
  "/news": { title: `News & Insights — ${BRAND}`, desc: "The latest news, announcements and insights from Sunjaya Asia Group and its global network of companies." },
  "/contact": { title: `Contact Us — ${BRAND}`, desc: "Get in touch with Sunjaya Asia Group for partnerships, investment and business inquiries across our international offices." },
  "/legal": { title: `Legal — ${BRAND}`, desc: "Privacy policy, terms of use and legal information of Sunjaya Asia Group." },
};

const setMeta = (attr, key, value) => {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", value);
};

const setCanonical = (href) => {
  let el = document.head.querySelector('link[rel="canonical"]');
  if (!el) { el = document.createElement("link"); el.setAttribute("rel", "canonical"); document.head.appendChild(el); }
  el.setAttribute("href", href);
};

// Per-route title, description, canonical & share tags (no visual change)
export const RouteSeo = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    const base = "/" + (pathname.split("/")[1] || "");
    const page = PAGES[base] || PAGES["/"];
    const isPrivate = base === "/admin" || base === "/download";
    const url = `${SITE}${pathname === "/" ? "/" : pathname.replace(/\/+$/, "")}`;
    document.title = isPrivate ? `CMS — ${BRAND}` : page.title;
    setMeta("name", "description", page.desc);
    setMeta("name", "robots", isPrivate ? "noindex, nofollow" : "index, follow, max-image-preview:large");
    setMeta("property", "og:title", isPrivate ? BRAND : page.title.replace(` — The Power of Innovations`, ""));
    setMeta("property", "og:description", page.desc);
    setMeta("property", "og:url", url);
    setMeta("name", "twitter:title", page.title);
    setMeta("name", "twitter:description", page.desc);
    setCanonical(url);
  }, [pathname]);
  return null;
};
