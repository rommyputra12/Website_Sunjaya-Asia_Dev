import { useEffect, useState } from "react";
import { DEFAULT_LOCATIONS } from "../data/content";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const FALLBACK_INFRA = [
  { city: "Panama", country: "Panama", role: "Infrastructure Hub", lat: 8.9824, lng: -79.5199, color: "#B892FF", type: "infra" },
  { city: "Switzerland", country: "Switzerland", role: "Infrastructure Hub", lat: 47.3769, lng: 8.5417, color: "#B892FF", type: "infra" },
];

const normalize = (l) => ({
  ...l,
  type: l.type || (l.city?.toLowerCase() === "singapore" ? "hq" : "branch"),
});

export const FALLBACK_LOCATIONS = [...DEFAULT_LOCATIONS, ...FALLBACK_INFRA].map(normalize);

let cache = null;
let pending = null;

const load = () => {
  if (!pending) {
    pending = fetch(`${API}/locations?published_only=true`)
      .then((r) => r.json())
      .then((data) => {
        cache = Array.isArray(data) && data.length > 0 ? data.map(normalize) : FALLBACK_LOCATIONS;
        return cache;
      })
      .catch(() => FALLBACK_LOCATIONS);
  }
  return pending;
};

// Shared published locations (branches + HQ + infra) for every map on the site
export const useLocations = () => {
  const [locations, setLocations] = useState(cache || FALLBACK_LOCATIONS);
  useEffect(() => {
    let alive = true;
    load().then((d) => { if (alive) setLocations(d); });
    return () => { alive = false; };
  }, []);
  return locations;
};

export const isHQ = (l) => l.type === "hq";
export const isInfra = (l) => l.type === "infra";
