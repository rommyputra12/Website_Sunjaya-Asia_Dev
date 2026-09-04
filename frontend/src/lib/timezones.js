// Maps IANA timezone IDs to standard timezone abbreviations.
// For zones with DST, the abbreviation depends on whether DST is currently active.
// Falls back to the longOffset format ("GMT+7") if the timezone is not in the map.

const TZ_MAP = {
  // Indonesia
  "Asia/Jakarta": "WIB",
  "Asia/Pontianak": "WIB",
  "Asia/Makassar": "WITA",
  "Asia/Bali": "WITA",
  "Asia/Kupang": "WITA",
  "Asia/Jayapura": "WIT",

  // Southeast Asia
  "Asia/Singapore": "SGT",
  "Asia/Kuala_Lumpur": "MYT",
  "Asia/Kuching": "MYT",
  "Asia/Bangkok": "ICT",
  "Asia/Ho_Chi_Minh": "ICT",
  "Asia/Phnom_Penh": "ICT",
  "Asia/Vientiane": "ICT",
  "Asia/Manila": "PHT",
  "Asia/Brunei": "BNT",
  "Asia/Jakarta": "WIB",

  // East Asia
  "Asia/Tokyo": "JST",
  "Asia/Seoul": "KST",
  "Asia/Shanghai": "CST",
  "Asia/Hong_Kong": "HKT",
  "Asia/Taipei": "CST",
  "Asia/Macau": "CST",

  // South Asia
  "Asia/Kolkata": "IST",
  "Asia/Colombo": "IST",
  "Asia/Dhaka": "BST",
  "Asia/Karachi": "PKT",
  "Asia/Dubai": "GST",

  // Oceania
  "Australia/Sydney": { std: "AEST", dst: "AEDT" },
  "Australia/Melbourne": { std: "AEST", dst: "AEDT" },
  "Australia/Brisbane": "AEST",
  "Australia/Perth": "AWST",
  "Australia/Adelaide": { std: "ACST", dst: "ACDT" },
  "Pacific/Auckland": { std: "NZST", dst: "NZDT" },
  "Pacific/Honolulu": "HST",
  "Pacific/Guam": "ChST",

  // North America
  "America/New_York": { std: "EST", dst: "EDT" },
  "America/Detroit": { std: "EST", dst: "EDT" },
  "America/Chicago": { std: "CST", dst: "CDT" },
  "America/Denver": { std: "MST", dst: "MDT" },
  "America/Phoenix": "MST",
  "America/Los_Angeles": { std: "PST", dst: "PDT" },
  "America/Anchorage": { std: "AKST", dst: "AKDT" },
  "America/Toronto": { std: "EST", dst: "EDT" },
  "America/Vancouver": { std: "PST", dst: "PDT" },
  "America/Mexico_City": "CST",
  "America/Bogota": "COT",
  "America/Lima": "PET",
  "America/Santiago": { std: "CLT", dst: "CLST" },

  // South America
  "America/Sao_Paulo": { std: "BRT", dst: "BRST" },
  "America/Argentina/Buenos_Aires": "ART",
  "America/Guyana": "GYT",

  // Europe
  "Europe/London": { std: "GMT", dst: "BST" },
  "Europe/Dublin": { std: "GMT", dst: "IST" },
  "Europe/Paris": { std: "CET", dst: "CEST" },
  "Europe/Berlin": { std: "CET", dst: "CEST" },
  "Europe/Madrid": { std: "CET", dst: "CEST" },
  "Europe/Rome": { std: "CET", dst: "CEST" },
  "Europe/Amsterdam": { std: "CET", dst: "CEST" },
  "Europe/Brussels": { std: "CET", dst: "CEST" },
  "Europe/Zurich": { std: "CET", dst: "CEST" },
  "Europe/Vienna": { std: "CET", dst: "CEST" },
  "Europe/Warsaw": { std: "CET", dst: "CEST" },
  "Europe/Athens": { std: "EET", dst: "EEST" },
  "Europe/Istanbul": "+03",
  "Europe/Moscow": "MSK",
  "Europe/Helsinki": { std: "EET", dst: "EEST" },

  // Africa
  "Africa/Johannesburg": "SAST",
  "Africa/Cairo": "EET",
  "Africa/Lagos": "WAT",
  "Africa/Nairobi": "EAT",
  "Africa/Casablanca": "+01",

  // Middle East
  "Asia/Tehran": "+0330",
  "Asia/Riyadh": "+03",
  "Asia/Qatar": "+03",
  "Asia/Jerusalem": { std: "IST", dst: "IDT" },

  // UTC
  "UTC": "UTC",
  "Etc/UTC": "UTC",
};

function isDST(timezone) {
  const now = new Date();
  const jan = new Date(now.getFullYear(), 0, 1);
  const jul = new Date(now.getFullYear(), 6, 1);
  try {
    const fmt = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" });
    const janOffset = parseOffset(fmt.formatToParts(jan));
    const julOffset = parseOffset(fmt.formatToParts(jul));
    const curOffset = parseOffset(fmt.formatToParts(now));
    return Math.max(janOffset, julOffset) !== Math.min(janOffset, julOffset) && curOffset === Math.max(janOffset, julOffset);
  } catch {
    return false;
  }
}

function parseOffset(parts) {
  const tz = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT+0";
  const m = tz.match(/GMT([+-])(\d{1,2}):?(\d{2})?/);
  if (!m) return 0;
  const sign = m[1] === "-" ? -1 : 1;
  return sign * (parseInt(m[2], 10) * 60 + (parseInt(m[3] || "0", 10)));
}

export function tzAbbrev(timezone) {
  const entry = TZ_MAP[timezone];
  if (!entry) {
    // Fallback: use longOffset from the browser
    try {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: timezone, timeZoneName: "longOffset" }).formatToParts(new Date());
      const v = parts.find((p) => p.type === "timeZoneName")?.value ?? "";
      return v.replace("GMT", "UTC");
    } catch {
      return "LOCAL";
    }
  }
  if (typeof entry === "string") return entry;
  return isDST(timezone) ? entry.dst : entry.std;
}
