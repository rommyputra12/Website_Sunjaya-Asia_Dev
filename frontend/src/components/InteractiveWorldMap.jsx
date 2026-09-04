import React, { useEffect, useState, useCallback } from "react";
import { geoEqualEarth, geoPath } from "d3-geo";
import { feature as topoFeature } from "topojson-client";
import { DEFAULT_LOCATIONS, SUBSIDIARIES } from "../data/content";

const GEO_URL = "/geo/countries-110m.json";

export const INFRA_HUBS = [
  { city: "Panama", country: "Panama", role: "Infrastructure Hub", lat: 8.9824, lng: -79.5199, color: "#B892FF" },
  { city: "Switzerland", country: "Switzerland", role: "Infrastructure Hub", lat: 47.3769, lng: 8.5417, color: "#B892FF" },
];

const COMPANIES_BY_CITY = SUBSIDIARIES.reduce((acc, s) => {
  const city = s.city.split(",")[0].trim();
  if (!acc[city]) acc[city] = [];
  acc[city].push(s.name);
  return acc;
}, {});

const ALL_PINS = [...DEFAULT_LOCATIONS, ...INFRA_HUBS];

// Pre-computed label offsets to prevent overlap
const LABEL_OFFSET = {
  Singapore: { dx: -14, dy: -10, anchor: "end" },
  Batam: { dx: 16, dy: 2, anchor: "start" },
  Jakarta: { dx: 0, dy: 22, anchor: "middle" },
  Balikpapan: { dx: 14, dy: 12, anchor: "start" },
  Dubai: { dx: 14, dy: -6, anchor: "start" },
  Beijing: { dx: 14, dy: -6, anchor: "start" },
  Delaware: { dx: -14, dy: 14, anchor: "end" },
  Panama: { dx: 12, dy: -6, anchor: "start" },
  Switzerland: { dx: 12, dy: -6, anchor: "start" },
};

export const InteractiveWorldMap = () => {
  const [geographies, setGeographies] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch(GEO_URL)
      .then((r) => r.json())
      .then((topo) => {
        if (cancelled) return;
        const geo = topoFeature(topo, topo.objects.countries);
        setGeographies(geo.features);
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  // Equal Earth projection — lightweight, no rotation state, landscape-friendly
  const projection = geoEqualEarth()
    .scale(180)
    .translate([480, 260]);

  const pathGen = geoPath(projection);

  const projectPoint = useCallback(
    ([lng, lat]) => projection([lng, lat]),
    [projection],
  );

  const hq = DEFAULT_LOCATIONS.find((l) => l.city.toLowerCase() === "singapore");

  const handlePinClick = useCallback((pin) => {
    setSelected((prev) => (prev && prev.city === pin.city ? null : pin));
  }, []);

  if (!geographies) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-mono text-sm text-copper/60 tracking-[0.2em] uppercase">Loading map…</span>
      </div>
    );
  }

  const hqPt = projectPoint([hq.lng, hq.lat]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <svg
        viewBox="0 0 960 520"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <pattern id="lg-grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(200,98,48,0.04)" strokeWidth="0.4" />
          </pattern>
        </defs>
        <rect x="0" y="0" width="960" height="520" fill="url(#lg-grid)" />

        {/* Country shapes */}
        {geographies.map((geo, i) => {
          const name = geo.properties?.name || "";
          const isPolar = name === "Antarctica" || name === "Greenland";
          const fill = isPolar ? "#082a3d" : "#0d3149";
          const stroke = isPolar ? "#14405a" : "#1c4a68";
          const d = pathGen(geo);
          if (!d) return null;
          return (
            <path
              key={i}
              d={d}
              fill={fill}
              stroke={stroke}
              strokeWidth={0.35}
              style={{ pointerEvents: "none" }}
            />
          );
        })}

        {/* Dashed connection lines from HQ to all other pins */}
        {hq && ALL_PINS.filter((l) => l.city.toLowerCase() !== "singapore").map((l) => {
          const from = hqPt;
          const to = projectPoint([l.lng, l.lat]);
          if (!from || !to) return null;
          const midX = (from[0] + to[0]) / 2;
          const midY = (from[1] + to[1]) / 2;
          const dx = to[0] - from[0];
          const dy = to[1] - from[1];
          const dist = Math.sqrt(dx * dx + dy * dy);
          const curve = Math.min(dist * 0.25, 50);
          const nx = -dy / (dist || 1);
          const ny = dx / (dist || 1);
          const cpX = midX + nx * curve;
          const cpY = midY + ny * curve;
          const arc = `M ${from[0]} ${from[1]} Q ${cpX} ${cpY} ${to[0]} ${to[1]}`;
          const isInfra = INFRA_HUBS.some((h) => h.city === l.city);
          const color = isInfra ? "#B892FF" : "#FFA765";
          return (
            <path
              key={`conn-${l.city}`}
              d={arc}
              fill="none"
              stroke={color}
              strokeWidth={0.6}
              strokeLinecap="round"
              strokeDasharray="4 6"
              opacity={0.5}
              className="map-connector"
            />
          );
        })}

        {/* Pins — colored blinking dots */}
        {ALL_PINS.map((loc) => {
          const pt = projectPoint([loc.lng, loc.lat]);
          if (!pt) return null;
          const off = LABEL_OFFSET[loc.city] || { dx: 10, dy: -4, anchor: "start" };
          const isHQ = loc.city.toLowerCase() === "singapore";
          const isInfra = INFRA_HUBS.some((h) => h.city === loc.city);
          const isSelected = selected && selected.city === loc.city;
          const companies = COMPANIES_BY_CITY[loc.city];

          return (
            <g
              key={loc.city}
              transform={`translate(${pt[0]}, ${pt[1]})`}
              style={{ cursor: "pointer" }}
              onClick={() => handlePinClick(loc)}
            >
              {/* Blinking outer ring */}
              <circle r="5" fill="none" stroke={loc.color} strokeWidth="1" opacity="0.5" className="pin-pulse" />
              {isHQ && (
                <circle r="8" fill="none" stroke={loc.color} strokeWidth="1" opacity="0.35" className="pin-pulse pin-pulse--delay" />
              )}
              {/* Solid dot */}
              <circle r={isHQ ? 4.5 : 3.5} fill={loc.color} stroke="#051e2b" strokeWidth="0.8" className="pin-blink" />
              <circle r={isHQ ? 1.5 : 1.2} fill="#051e2b" />

              {/* City label */}
              <text
                x={off.dx}
                y={off.dy}
                textAnchor={off.anchor}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: isHQ ? "11px" : "10px",
                  fill: isSelected ? loc.color : "#F3F3F1",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  fontWeight: isHQ ? 600 : 400,
                  pointerEvents: "none",
                  paintOrder: "stroke",
                  stroke: "#051e2b",
                  strokeWidth: "3px",
                  strokeLinejoin: "round",
                }}
              >
                {loc.city}{isHQ ? " · HQ" : isInfra ? " · INFRA" : ""}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Detail card — expands when a pin is clicked */}
      {selected && (
        <div
          className="absolute top-4 left-4 w-72 border border-white/20 bg-obsidian/95 backdrop-blur-md px-5 py-4 shadow-lg z-30"
          style={{ borderLeftColor: selected.color, borderLeftWidth: "3px" }}
        >
          <button
            onClick={() => setSelected(null)}
            className="absolute top-2 right-2 w-6 h-6 grid place-items-center text-bone/60 hover:text-bone transition-colors"
            aria-label="Close"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <line x1="2" y1="2" x2="10" y2="10" />
              <line x1="10" y1="2" x2="2" y2="10" />
            </svg>
          </button>
          <div className="font-mono text-[10px] tracking-[0.22em] uppercase" style={{ color: selected.color }}>
            {selected.country}
          </div>
          <div className="font-serif text-xl text-bone leading-tight mt-1">{selected.city}</div>
          <div className="mt-2 font-mono text-[10px] text-ash leading-relaxed">{selected.role}</div>
          {COMPANIES_BY_CITY[selected.city] && (
            <ul className="mt-3 space-y-1">
              {COMPANIES_BY_CITY[selected.city].map((name) => (
                <li key={name} className="font-mono text-[10px] leading-snug text-copper">{name}</li>
              ))}
            </ul>
          )}
          <div className="mt-3 pt-2 border-t border-white/10 font-mono text-[9px] text-smoke">
            {selected.lat.toFixed(4)}°, {selected.lng.toFixed(4)}°
          </div>
        </div>
      )}

      {/* Legend — bottom right */}
      <div className="absolute bottom-3 right-3 border border-white/15 bg-obsidian/70 backdrop-blur-md px-3 py-2 hidden md:block z-20">
        <div className="font-mono text-[10px] tracking-[0.22em] uppercase text-copper mb-1.5">Locations</div>
        <div className="flex flex-col gap-0.5 text-[10px] font-mono text-bone">
          {DEFAULT_LOCATIONS.map((l) => (
            <div key={l.city} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color }} />
              {l.city}
            </div>
          ))}
          {INFRA_HUBS.map((h) => (
            <div key={h.city} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rotate-45" style={{ background: h.color }} />
              {h.city}
              <span className="text-[8px] tracking-[0.18em] text-ash">· INFRA</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="absolute bottom-3 left-3 font-mono text-[9px] tracking-[0.22em] uppercase text-copper/70 z-20 pointer-events-none">
        Click any pin
      </div>
    </div>
  );
};
