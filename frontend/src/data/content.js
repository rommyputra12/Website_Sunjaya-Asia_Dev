// High-quality reference photography matching the compositions in the
// official Sunjaya Asia Group corporate profile PDF (V.2.2026).
// Assets prefixed with "customer-assets-*" are user-uploaded references curated for the brand.
const USER = {
  logo: "/images/SUNJAYA_2026_-_OFFICIAL_1_(Light)_Small.png",
  foundationBanner: "/images/foundation_banner.webp",
  foundationSlide: "/images/01_Foundation_Pillars_New2026 copy.jpg",
  futureSlide: "/images/03_The_Future_Pillar_02.36.31 copy.jpg",
  coverPort1: "/images/cover_sunjaya_1.jpg",
  coverPort2: "/images/cover_sunjaya_2.png",
  coverPort3: "/images/cover_sunjaya_3.webp",
  cityScape: "/images/city_scape.webp",
  plantationDev: "/images/plantation_dev.png",
  modernTransport: "/images/modern_transport.png",
  assetsMgmt: "/images/assets_mgmt.png",
  industrial: "/images/industrial.png",
  anXinBanner: "/images/anxin_banner.webp",
};

export const LOGO = USER.logo;

export const IMAGES = {
  // Cover / hero
  cover: USER.coverPort2,
  coverAlt1: USER.coverPort2,
  coverAlt2: USER.coverPort1,
  // Section banners (official Sunjaya pillar slides)
  foundationBanner: USER.foundationBanner,
  foundationSlide: USER.foundationSlide,
  coreSlide: "/images/02_The_Core_Pillars_03.01.48.png",
  futureSlide: "/images/03_The_Future_Pillar_02.36.31 copy.jpg",
  // Foundation sub-activities
  wealth: USER.assetsMgmt,
  plantation: USER.plantationDev,
  downstream: USER.industrial,
  urban: USER.cityScape,
  transport: USER.modernTransport,
  foundation: USER.foundationSlide,
  // Core
  core: "/images/02_The_Core_Pillars_03.01.48.png",
  gold: "/images/gold.jpg",
  agro: "/images/agro.jpg",
  livestock: "/images/livestock.jpg",
  heavy: "/images/heavy.jpg",
  jet: "/images/jet.jpg",
  // Future
  evowaste: "/images/evowaste.png",
  // Modern environmental / energy / waste management system for Sunjaya Teknologi
  evosmart: "/images/evosmart.jpg",
  sti: "/images/Subsidiaries_Sunjaya_Teknologi_Indonesia.png",
  sac: "/images/Subsidiaries_Sunjaya_America.png",
  sae: "/images/Subsidiaries_Sunjaya_Emirates.jpeg",
  hyperione: "/images/hyperione.jpg",
  defense: "/images/defense.jpg",
  // Defense / drone / military technology for Sunjaya An Xin
  military: USER.anXinBanner,
  // Media / entertainment for Sunjaya Music
  music: "/images/music.jpg",
  // Software / platforms for Teknologi Sosial Nusantara
  software: "/images/software.jpg",
  // Spice / commodity market for Sunjaya Emirates commodity distribution
  commodities: "/images/commodities.jpg",
  // Warehouse / containers FTZ for Allwyn Group
  warehouse: "/images/warehouse.jpg",
  future: USER.futureSlide,
  partnership: USER.assetsMgmt,
  competitive: USER.industrial,
  businessPillars: "/images/3_Business_Pillars.jpg",
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
    image: "warehouse",
    tier: "subsidiary",
  },
  {
    id: "ecs",
    name: "ECS INDO DISTRIBUSI",
    role: "IT & Peripherals Distribution",
    city: "Jakarta, Indonesia",
    sector: "Information Technology",
    tag: "IT Peripherals Distribution",
    image: "hyperione",
    tier: "subsidiary",
  },
  {
    id: "sm",
    name: "SUNJAYA MUSIC",
    role: "Digital & Entertainment",
    city: "Jakarta, Indonesia",
    sector: "Media & Culture",
    tag: "Digital Media & Entertainment",
    image: "music",
    tier: "subsidiary",
  },
  {
    id: "tsn",
    name: "TEKNOLOGI SOSIAL NUSANTARA",
    role: "Software Development",
    city: "Jakarta, Indonesia",
    sector: "Software / Platforms",
    tag: "Software Development",
    image: "software",
    tier: "subsidiary",
  },
  {
    id: "san",
    name: "SUNJAYA AN XIN",
    role: "Military Technology & Distribution",
    city: "Beijing, China",
    sector: "Defense & Military Technology (JV)",
    tag: "Military Technology · Affiliate",
    image: "military",
    tier: "affiliate",
  },
  {
    id: "kgi",
    name: "KINDRED GROUP INDONESIA",
    role: "Technology Distribution",
    city: "Jakarta, Indonesia",
    sector: "Technology Distribution",
    tag: "Technology Distribution · Affiliate",
    image: "evosmart",
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
