import React, { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const pinIcon = (color) => L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:${color};border:3px solid #051e2b;box-shadow:0 0 0 2px ${color}80,0 2px 8px rgba(0,0,0,.5)"></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const round = (n) => +n.toFixed(4);

const ClickToSet = ({ onChange }) => {
  useMapEvents({ click: (e) => onChange(round(e.latlng.lat), round(e.latlng.lng)) });
  return null;
};

const FlyTo = ({ pos }) => {
  const map = useMap();
  useEffect(() => {
    if (!pos) return;
    const c = map.getCenter();
    if (Math.abs(c.lat - pos[0]) > 0.0005 || Math.abs(c.lng - pos[1]) > 0.0005) {
      map.flyTo(pos, Math.max(map.getZoom(), 10), { duration: 0.8 });
    }
  }, [pos, map]);
  return null;
};

// Mini map: shows the pin, click anywhere or drag the pin to set coordinates
export const LocationMapPicker = ({ lat, lng, color, onChange }) => {
  const has = lat !== "" && lng !== "" && !Number.isNaN(+lat) && !Number.isNaN(+lng);
  const pos = useMemo(() => (has ? [+lat, +lng] : null), [has, lat, lng]);
  const icon = useMemo(() => pinIcon(color || "#FF6A3D"), [color]);

  return (
    <div data-testid="loc-map-preview" className="relative h-56 border border-white/15 overflow-hidden">
      <MapContainer center={pos || [15, 100]} zoom={pos ? 10 : 2} minZoom={2} worldCopyJump scrollWheelZoom className="h-full w-full" style={{ background: "#0d3149" }}>
        <TileLayer
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />
        <ClickToSet onChange={onChange} />
        <FlyTo pos={pos} />
        {pos && (
          <Marker position={pos} icon={icon} draggable
            eventHandlers={{ dragend: (e) => { const p = e.target.getLatLng(); onChange(round(p.lat), round(p.lng)); } }} />
        )}
      </MapContainer>
      <div className="absolute top-2 right-2 z-[500] pointer-events-none font-mono text-[9px] tracking-[0.18em] uppercase bg-obsidian/80 text-copper px-2 py-1">
        Click map or drag pin to adjust
      </div>
    </div>
  );
};
