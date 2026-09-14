import React from "react";
import { ComposableMap, Geographies, Geography, Marker, Line as RSMLine } from "react-simple-maps";
import { DEFAULT_LOCATIONS } from "../data/content";

const GEO_URL = "/geo/countries-110m.json";

// Per-city label offsets prevent overlap in dense regions.
// Batam gets a small display offset so it sits side-by-side with the Singapore HQ pin without overlap.
const LABEL = {
  Singapore: { dx: -16, dy: -14, anchor: "end" },
  Batam:     { dx: 0,   dy: 20,  anchor: "middle", displayOff: { x: 22, y: 0 } },
  Jakarta:   { dx: 0,   dy: 24,  anchor: "middle" },
  Balikpapan:{ dx: 14,  dy: 14,  anchor: "start" },
  Dubai:     { dx: 14,  dy: -6,  anchor: "start" },
  Beijing:   { dx: 14,  dy: -6,  anchor: "start" },
  Delaware:  { dx: -14, dy: 12,  anchor: "end" },
};

// Faint, proportional country watermarks — sit above the geographies as editorial ghosts.
const COUNTRY_LABELS = [
  { name: "UNITED STATES", lng: -98, lat: 48, size: 22 },
  { name: "UAE",           lng: 54,  lat: 21, size: 20 },
  { name: "CHINA",         lng: 104, lat: 36, size: 22 },
  { name: "INDONESIA",     lng: 130, lat: -9, size: 18 },
];

// Infrastructure hubs — different visual (square marker), still pulsing, still connected via dashed arcs.
export const INFRA_HUBS = [
  { city: "Panama",      country: "Panama",      role: "Infrastructure Hub", lat: 8.9824,  lng: -79.5199, color: "#B892FF" },
  { city: "Switzerland", country: "Switzerland", role: "Infrastructure Hub", lat: 47.3769, lng: 8.5417,   color: "#B892FF" },
];

const INFRA_LABEL = {
  Panama:      { dx: 12, dy: -6, anchor: "start" },
  Switzerland: { dx: 12, dy: -6, anchor: "start" },
};

// Filled to frame — with dashed arcs connecting every branch to Singapore HQ.
export const StaticWorldMap = ({ locations = DEFAULT_LOCATIONS }) => {
  const hq = locations.find((l) => l.city.toLowerCase() === "singapore");

  return (
    <div className="absolute inset-0">
      <ComposableMap
        projection="geoAzimuthalEquidistant"
        projectionConfig={{ scale: 230, rotate: [0, -90, -100] }}
        width={1920}
        height={1080}
        style={{ width: "100%", height: "100%", pointerEvents: "none" }}
      >
        <defs>
          <pattern id="grid2" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(200,98,48,0.05)" strokeWidth="0.5" />
          </pattern>
          <radialGradient id="spot2" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="rgba(200,98,48,0.10)" />
            <stop offset="100%" stopColor="rgba(200,98,48,0)" />
          </radialGradient>
        </defs>
        <rect x="0" y="0" width="1920" height="1080" fill="url(#grid2)" />
        <rect x="0" y="0" width="1920" height="1080" fill="url(#spot2)" />

        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => {
              const name = geo.properties?.name || "";
              // Antarctica gets its own muted, icy tint to differentiate the polar cap
              const isPolar = name === "Antarctica" || name === "Greenland";
              const fill = isPolar ? "#082a3d" : "#0d3149";
              const stroke = isPolar ? "#14405a" : "#1c4a68";
              return (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  style={{
                    default: { fill, stroke, strokeWidth: 0.45, outline: "none" },
                    hover:   { fill, outline: "none" },
                    pressed: { fill, outline: "none" },
                  }}
                />
              );
            })
          }
        </Geographies>

        {/* Editorial country watermarks — rendered above geographies so land regions like China/UAE are visible */}
        {COUNTRY_LABELS.map((c) => (
          <Marker key={`wm-${c.name}`} coordinates={[c.lng, c.lat]}>
            <text
              textAnchor="middle"
              style={{
                fontFamily: "'IBM Plex Mono', monospace",
                fontSize: `${c.size}px`,
                fill: "rgba(200,98,48,0.35)",
                letterSpacing: "0.24em",
                fontWeight: 500,
                textTransform: "uppercase",
                paintOrder: "stroke",
                stroke: "rgba(5,30,43,0.8)",
                strokeWidth: "2px",
                strokeLinejoin: "round",
              }}
            >
              {c.name}
            </text>
          </Marker>
        ))}

        {/* Branch connector arcs from every branch to Singapore HQ — glow underlay + animated dash overlay */}
        {hq && locations
          .filter((l) => l.city.toLowerCase() !== "singapore")
          .map((l) => (
            <g key={`hq-${l.city}`}>
              {/* Soft glow underlay — wide, low opacity to feel like light */}
              <RSMLine
                from={[hq.lng, hq.lat]}
                to={[l.lng, l.lat]}
                stroke="#FFA765"
                strokeWidth={3.5}
                strokeLinecap="round"
                strokeOpacity="0.10"
              />
              {/* Solid thin trail */}
              <RSMLine
                from={[hq.lng, hq.lat]}
                to={[l.lng, l.lat]}
                stroke="#FFA765"
                strokeWidth={0.55}
                strokeLinecap="round"
                strokeOpacity="0.35"
              />
              {/* Animated dashed flow on top */}
              <RSMLine
                from={[hq.lng, hq.lat]}
                to={[l.lng, l.lat]}
                stroke="#FFD9B3"
                strokeWidth={1}
                strokeLinecap="round"
                strokeDasharray="6 10"
                strokeOpacity="0.85"
                className="map-connector"
              />
            </g>
          ))}

        {/* Infrastructure hub connectors — softer violet with the same layered treatment */}
        {hq && INFRA_HUBS.map((h) => (
          <g key={`infra-${h.city}`}>
            <RSMLine
              from={[hq.lng, hq.lat]}
              to={[h.lng, h.lat]}
              stroke="#B892FF"
              strokeWidth={3.5}
              strokeLinecap="round"
              strokeOpacity="0.10"
            />
            <RSMLine
              from={[hq.lng, hq.lat]}
              to={[h.lng, h.lat]}
              stroke="#B892FF"
              strokeWidth={0.55}
              strokeLinecap="round"
              strokeOpacity="0.30"
            />
            <RSMLine
              from={[hq.lng, hq.lat]}
              to={[h.lng, h.lat]}
              stroke="#DFCEFF"
              strokeWidth={1}
              strokeLinecap="round"
              strokeDasharray="4 12"
              strokeOpacity="0.85"
              className="map-connector map-connector--infra"
            />
          </g>
        ))}

        {/* Infrastructure hub pins — square markers to differentiate from branches */}
        {INFRA_HUBS.map((h) => {
          const off = INFRA_LABEL[h.city] || { dx: 12, dy: -6, anchor: "start" };
          return (
            <Marker key={`infra-pin-${h.city}`} coordinates={[h.lng, h.lat]}>
              {/* Pulsing outer ring */}
              <circle r="6" fill="none" stroke={h.color} strokeWidth="1.2" opacity="0.55">
                <animate attributeName="r" from="5" to="18" dur="2.4s" begin="0.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" from="0.55" to="0" dur="2.4s" begin="0.5s" repeatCount="indefinite" />
              </circle>
              {/* Square marker, rotated 45deg for a diamond look */}
              <rect x="-5" y="-5" width="10" height="10" transform="rotate(45)" fill={h.color} stroke="#051e2b" strokeWidth="1.3">
                <animate attributeName="opacity" values="1;0.55;1" dur="1.8s" repeatCount="indefinite" />
              </rect>
              <rect x="-1.6" y="-1.6" width="3.2" height="3.2" transform="rotate(45)" fill="#051e2b" />
              <text
                x={off.dx}
                y={off.dy}
                textAnchor={off.anchor}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "11px",
                  fill: "#F3F3F1",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  paintOrder: "stroke",
                  stroke: "#051e2b",
                  strokeWidth: "3.5px",
                  strokeLinejoin: "round",
                }}
              >
                {h.city}
              </text>
              <text
                x={off.dx}
                y={off.dy + 12}
                textAnchor={off.anchor}
                style={{
                  fontFamily: "'IBM Plex Mono', monospace",
                  fontSize: "8.5px",
                  fill: h.color,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  fontWeight: 400,
                  paintOrder: "stroke",
                  stroke: "#051e2b",
                  strokeWidth: "3px",
                  strokeLinejoin: "round",
                }}
              >
                Infrastructure
              </text>
            </Marker>
          );
        })}

        {locations.map((loc) => {
          const off = LABEL[loc.city] || { dx: 12, dy: -4, anchor: "start" };
          const isHQ = loc.city.toLowerCase() === "singapore";
          const displayOff = off.displayOff;
          return (
            <Marker key={loc.city} coordinates={[loc.lng, loc.lat]}>
              {/* Leader line from true geographic position to the visually shifted pin (Batam only) */}
              {displayOff && (
                <line
                  x1="0"
                  y1="0"
                  x2={displayOff.x}
                  y2={displayOff.y}
                  stroke={loc.color}
                  strokeOpacity="0.7"
                  strokeWidth="0.9"
                  strokeDasharray="2 2"
                />
              )}
              {/* Small anchor dot at true coordinates when displayOff is used */}
              {displayOff && (
                <circle r="1.6" fill={loc.color} opacity="0.75" />
              )}

              <g transform={displayOff ? `translate(${displayOff.x}, ${displayOff.y})` : undefined}>
                {/* Pulsing outer ring — blinks for every pin */}
                <circle r="6" fill="none" stroke={loc.color} strokeWidth="1.2" opacity="0.55">
                  <animate attributeName="r" from="5" to="18" dur="2.2s" begin="0s" repeatCount="indefinite" />
                  <animate attributeName="opacity" from="0.55" to="0" dur="2.2s" begin="0s" repeatCount="indefinite" />
                </circle>
                {isHQ && (
                  <circle r="10" fill="none" stroke={loc.color} strokeWidth="1.2" opacity="0.4">
                    <animate attributeName="r" from="8" to="26" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                    <animate attributeName="opacity" from="0.5" to="0" dur="2.2s" begin="1.1s" repeatCount="indefinite" />
                  </circle>
                )}
                <circle r={isHQ ? 8 : 6} fill={loc.color} stroke="#051e2b" strokeWidth="1.4">
                  <animate attributeName="opacity" values="1;0.55;1" dur="1.6s" repeatCount="indefinite" />
                </circle>
                <circle r={isHQ ? 2.6 : 2} fill="#051e2b" />

                <text
                  x={off.dx}
                  y={off.dy}
                  textAnchor={off.anchor}
                  style={{
                    fontFamily: "'IBM Plex Mono', monospace",
                    fontSize: isHQ ? "12px" : "11px",
                    fill: "#F3F3F1",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontWeight: isHQ ? 600 : 400,
                    paintOrder: "stroke",
                    stroke: "#051e2b",
                    strokeWidth: "3.5px",
                    strokeLinejoin: "round",
                  }}
                >
                  {loc.city}{isHQ ? " · HQ" : ""}
                </text>
              </g>
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};
