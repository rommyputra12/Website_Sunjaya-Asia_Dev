import React from "react";
import { Globe2 } from "lucide-react";

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

export const countryCode = (name) => NAME_TO_CODE[(name || "").trim().toLowerCase()];

export const CountryFlag = ({ country, size = 22 }) => {
  const code = countryCode(country);
  return (
    <span data-testid={`flag-${code || "unknown"}`} className="country-flag relative inline-grid place-items-center shrink-0 overflow-hidden rounded-full" style={{ width: size, height: size }}>
      {code
        ? <img src={`https://flagcdn.com/w80/${code}.png`} alt={`${country} flag`} loading="lazy" className="w-full h-full object-cover" />
        : <Globe2 size={size * 0.6} strokeWidth={1.6} className="text-copper" />}
    </span>
  );
};
