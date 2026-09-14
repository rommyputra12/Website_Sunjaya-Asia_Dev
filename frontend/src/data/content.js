const USER = {
  logo: "/images/logo_sunjaya.png",
  foundationSlide: "/images/pillar_foundation.jpg",
  futureSlide: "/images/pillar_future.jpg",
  cover: "/images/cover_sunjaya.png",
};

export const LOGO = USER.logo;

export const IMAGES = {
  cover: USER.cover,
  foundationSlide: USER.foundationSlide,
  coreSlide: "/images/pillar_core.png",
  futureSlide: USER.futureSlide,
  // Subsidiary photos
  sti: "/images/Subsidiaries_Sunjaya_Teknologi_Indonesia.png",
  sac: "/images/Subsidiaries_Sunjaya_America.png",
  sae: "/images/Subsidiaries_Sunjaya_Emirates.jpeg",
  agi: "/images/Subsidiaries_Allwyn_Group_Indonesia.jpeg",
  ecs: "/images/Subsidiaries_ECS_Indo_Distribusi.jpeg",
  sm: "/images/Subsidiaries_Sunjaya_Music.jpg",
  tsn: "/images/Subsidiaries_Teknologi_Sosial_Nusantara.jpg",
  san: "/images/Subsidiaries_Sunjaya_An_Xin.jpg",
  kgi: "/images/Subsidiaries_Kindred_Group_Indonesia.png",
};

export const STATS = [
  { value: "360+", key: "modules" },
  { value: "150+", key: "projects" },
  { value: "16+", key: "countries" },
  { value: "USD 750 Million+", key: "contract" },
];

export const SUBSIDIARIES = [
  {
    id: "sti",
    name: "SUNJAYA TEKNOLOGI INDONESIA",
    role: "Branch & Operation Hub",
    city: "Jakarta, Indonesia",
    sector: "Environmental Technology / Energy",
    tag: "Branch & Operation Hub",
    image: "sti",
    tier: "branch",
  },
  {
    id: "sac",
    name: "SUNJAYA AMERICA CORP",
    role: "Branch & Investment Hub",
    city: "Delaware, United States",
    sector: "Capital / Investment Vehicle",
    tag: "Branch & Investment Hub",
    image: "sac",
    tier: "branch",
  },
  {
    id: "sae",
    name: "SUNJAYA EMIRATES LLC",
    role: "Branch & Distribution Hub",
    city: "Dubai, UAE",
    sector: "Trading / Distribution",
    tag: "Branch & Commodity Distribution Hub",
    image: "sae",
    tier: "branch",
  },
  {
    id: "agi",
    name: "ALLWYN GROUP INDONESIA",
    role: "FTZ Distribution Hub",
    city: "Batam, Indonesia",
    sector: "Free Trade Zone",
    tag: "Indo FTZ Hub",
    image: "agi",
    tier: "subsidiary",
  },
  {
    id: "ecs",
    name: "ECS INDO DISTRIBUSI",
    role: "IT & Peripherals Distribution",
    city: "Jakarta, Indonesia",
    sector: "Information Technology",
    tag: "IT Peripherals Distribution",
    image: "ecs",
    tier: "subsidiary",
  },
  {
    id: "sm",
    name: "SUNJAYA MUSIC",
    role: "Digital & Entertainment",
    city: "Jakarta, Indonesia",
    sector: "Media & Culture",
    tag: "Digital Media & Entertainment",
    image: "sm",
    tier: "subsidiary",
  },
  {
    id: "tsn",
    name: "TEKNOLOGI SOSIAL NUSANTARA",
    role: "Software Development",
    city: "Jakarta, Indonesia",
    sector: "Software / Platforms",
    tag: "Software Development",
    image: "tsn",
    tier: "subsidiary",
  },
  {
    id: "san",
    name: "SUNJAYA AN XIN",
    role: "Military Technology & Distribution",
    city: "Beijing, China",
    sector: "Defense & Military Technology (JV)",
    tag: "Military Technology · Affiliate",
    image: "san",
    tier: "affiliate",
  },
  {
    id: "kgi",
    name: "KINDRED GROUP INDONESIA",
    role: "Technology Distribution",
    city: "Jakarta, Indonesia",
    sector: "Technology Distribution",
    tag: "Technology Distribution · Affiliate",
    image: "kgi",
    tier: "affiliate",
  },
];

// Default/fallback locations shown when the CMS is empty.
// Coordinates are actual latitude/longitude sourced from the corporate profile PDF.
export const DEFAULT_LOCATIONS = [
  { city: "Singapore", country: "Singapore", role: "Holding & Headquarters", lat: 1.3521, lng: 103.8198, color: "#3EC4FF", order: 1 },
  { city: "Jakarta", country: "Indonesia", role: "Indonesia Distribution & Operational Hub", lat: -6.2088, lng: 106.8456, color: "#FF6A3D", order: 2 },
  { city: "Batam", country: "Indonesia", role: "FTZ Distribution Hub", lat: 1.1301, lng: 104.0530, color: "#FF6A3D", order: 3 },
  { city: "Balikpapan", country: "Indonesia", role: "East Indonesia Operations", lat: -1.2379, lng: 116.8529, color: "#FF6A3D", order: 4 },
  { city: "Dubai", country: "UAE", role: "Middle East Distribution & Operational Hub", lat: 25.2048, lng: 55.2708, color: "#8BFF63", order: 5 },
  { city: "Delaware", country: "USA", role: "America Distribution Hub & Assets Management", lat: 39.0000, lng: -75.5000, color: "#8BFF63", order: 6 },
  { city: "Beijing", country: "China", role: "Strategic Market Operations", lat: 39.9042, lng: 116.4074, color: "#FFB84D", order: 7 },
];

export const PILLARS = [
  {
    num: "01",
    title: "The Foundation",
    kicker: "MACRO CAPITAL INVESTMENT & INFRASTRUCTURE",
    image: "foundationSlide",
    lines: [
      "Assets & Wealth Management",
      "Plantation Development",
      "Downstream Integration",
      "Urban Development",
      "Modern Transportation Hub",
    ],
    body: "A financial catalyst for sustainable economic progress, Sunjaya Asia Group drives long-term institutional stability, multi-generational wealth preservation, and global competitiveness through strategic capital allocation and large-scale development.",
  },
  {
    num: "02",
    title: "The Core",
    kicker: "Global Commodity Trading",
    image: "coreSlide",
    lines: [
      "Gold & Precious Metal Trading",
      "Agro-Commodity Trading",
      "Livestock & Food Security",
      "Heavy Equipment & Vessel Trading",
    ],
    body: "A global force in international trade, Sunjaya Asia Group secures strategic precious metals, expands industrial agriculture, and operates integrated livestock ecosystems—fortifying critical supply chains and national food security worldwide",
  },
  {
    num: "03",
    title: "The Future",
    kicker: "Next-Generation Technology Development",
    image: "futureSlide",
    lines: [
      "Evowaste — Zero-X Technology",
      "Evosmart ESS & Power Generations",
      "Biotechnology",
      "IT: Hyperione (Security Intelligence), Drone Technology, and Defense & Military Technology",
    ],
    body: "Sunjaya Asia Group developed and owns next-generation technology platforms — from zero-emission waste destruction and large-scale energy storage, to advanced biotechnology and integrated defense systems, building the critical infrastructure that powers sustainable industrialization and national resilience.",
  },
];

export const CERTS = [
  "ISO 9001:2015",
  "ISO 14001:2015",
  "ISO 45001:2018",
  "ISO/IEC 27001:2022",
  "ISO 14067:2018",
  "APEA 2025 · Fast Enterprise",
  "LBMA · Compliant",
  "HACCP · Halal",
];
