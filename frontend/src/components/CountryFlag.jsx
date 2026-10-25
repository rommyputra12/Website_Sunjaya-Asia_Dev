import React from "react";
import { Globe2 } from "lucide-react";

// Free flag-icons library (MIT), every country; each SVG is a separate file loaded only when shown
const FLAG_FILES = import.meta.glob("../../../node_modules/flag-icons/flags/1x1/*.svg", { query: "?no-inline", import: "default", eager: true });
const FLAG_URL = Object.fromEntries(Object.entries(FLAG_FILES).map(([p, url]) => [p.split("/").pop().replace(".svg", ""), url]));

const ALIASES = { uae: "ae", usa: "us", "united states of america": "us", us: "us", uk: "gb", "great britain": "gb", korea: "kr", "south korea": "kr", "hong kong": "hk", prc: "cn" };

// Country name → ISO code, built once from the browser's region names
const NAME_TO_CODE = (() => {
  const map = { ...ALIASES };
  try {
    const dn = new Intl.DisplayNames(["en"], { type: "region" });
    const A = 65;
    for (let i = 0; i < 26; i++) for (let j = 0; j < 26; j++) {
      const code = String.fromCharCode(A + i, A + j);
      const name = dn.of(code);
      if (name && name !== code) map[name.toLowerCase()] = code.toLowerCase();
    }
  } catch { /* old browsers: aliases only */ }
  return map;
})();

export const countryCode = (name) => {
  const n = (name || "").trim().toLowerCase();
  const inner = (n.match(/\(([^)]+)\)/) || [])[1];
  return NAME_TO_CODE[n] || NAME_TO_CODE[n.replace(/\s*\([^)]*\)\s*/g, " ").trim()] || (inner && NAME_TO_CODE[inner.trim()]);
};

export const CountryFlag = ({ country, size = 22 }) => {
  const code = countryCode(country);
  const src = code && FLAG_URL[code];
  return (
    <span data-testid={`flag-${code || "unknown"}`} className="country-flag relative inline-grid place-items-center shrink-0 overflow-hidden rounded-full ring-1 ring-black/15 shadow-[0_1px_3px_rgba(12,25,34,0.18)]" style={{ width: size, height: size }}>
      {src
        ? <img src={src} alt={`${country} flag`} loading="lazy" className="w-full h-full object-cover" />
        : <Globe2 size={size * 0.6} strokeWidth={1.6} className="text-copper" />}
    </span>
  );
};
