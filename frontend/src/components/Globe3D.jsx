import React, { useRef, useEffect, useState, useMemo, useCallback } from "react";
import Globe from "react-globe.gl";
import * as THREE from "three";
import { feature } from "topojson-client";
import { DEFAULT_LOCATIONS, SUBSIDIARIES } from "../data/content";

const API = `${import.meta.env.VITE_BACKEND_URL}/api`;

const COLORS = {
  atmosphere: "#4A90D9",
  ocean: "#e8f0f5",
  land: "#c8d6e5",
  landStroke: "#a0b8cc",
};

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

const SEEK_DURATION = 1800;
const HOLD_DURATION = 3500;
const GLOBE_SCALE = 1.6;
const GLOBE_OFFSET_Y = -70;
const ROTATE_SPEED = 1.4;

export const Globe3D = ({ locations: propLocations }) => {
  const globeEl = useRef();
  const containerRef = useRef(null);
  const cardRef = useRef(null);
  const [dims, setDims] = useState({ width: 800, height: 800 });
  const [mounted, setMounted] = useState(false);
  const [countries, setCountries] = useState([]);
  const [locations, setLocations] = useState(propLocations || DEFAULT_LOCATIONS);
  const [activeIdx, setActiveIdx] = useState(0);
  const [inView, setInView] = useState(false);

  const activeIdxRef = useRef(0);
  activeIdxRef.current = activeIdx;
  const allPointsRef = useRef([]);
  const dimsRef = useRef(dims);
  dimsRef.current = dims;

  // Interaction state machine: "auto" | "seeking" | "holding"
  const modeRef = useRef("auto");
  const seekingRef = useRef(false);
  const holdUntilRef = useRef(0);
  const resumeTimeoutRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.15 }
    );
    io.observe(containerRef.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch(`${API}/locations?published_only=true`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data) && data.length > 0) setLocations(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/geo/countries-110m.json")
      .then((r) => r.json())
      .then((topo) => {
        const fc = feature(topo, topo.objects.countries);
        setCountries(fc.features);
      })
      .catch(() => setCountries([]));
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const el = containerRef.current;
      if (!el) return;
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (w > 0 && h > 0) setDims({ width: w, height: h });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, [mounted]);

  useEffect(() => {
    if (!globeEl.current) return;
    const g = globeEl.current;
    const controls = g.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = ROTATE_SPEED;
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI / 3.5;
    controls.maxPolarAngle = Math.PI / 1.5;
    controls.rotateSpeed = 1.2;

    const scene = g.scene();
    scene.add(new THREE.AmbientLight(0xffffff, 0.9));
    const dir = new THREE.DirectionalLight(0xffffff, 0.6);
    dir.position.set(1, 1, 1);
    scene.add(dir);

    g.pointOfView({ lat: 5, lng: 110, altitude: 0.22 }, 0);
  }, [mounted]);

  useEffect(() => {
    if (!globeEl.current) return;
    globeEl.current.controls().autoRotate = inView && modeRef.current === "auto";
  }, [inView]);

  // Cleanup pending timeouts on unmount
  useEffect(() => {
    return () => {
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, []);

  const clearResumeTimeout = useCallback(() => {
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
      resumeTimeoutRef.current = null;
    }
  }, []);

  const resumeAuto = useCallback(() => {
    modeRef.current = "auto";
    seekingRef.current = false;
    holdUntilRef.current = 0;
    if (globeEl.current) {
      const c = globeEl.current.controls();
      c.autoRotate = true;
      c.autoRotateSpeed = ROTATE_SPEED;
    }
  }, []);

  // Bottom dot click: globe spins to the point, holds, then resumes
  const seekToPoint = useCallback((idx) => {
    const pts = allPointsRef.current;
    const pt = pts[idx];
    if (!pt || !globeEl.current) return;

    clearResumeTimeout();
    seekingRef.current = true;
    modeRef.current = "seeking";
    activeIdxRef.current = idx;
    setActiveIdx(idx);
    globeEl.current.controls().autoRotate = false;
    const currentAltitude = globeEl.current.pointOfView().altitude;
    globeEl.current.pointOfView(
      { lat: pt.lat, lng: pt.lng, altitude: currentAltitude },
      SEEK_DURATION
    );

    // After the spin completes, hold the card for a few seconds
    resumeTimeoutRef.current = setTimeout(() => {
      seekingRef.current = false;
      modeRef.current = "holding";
      holdUntilRef.current = Date.now() + HOLD_DURATION;

      // After the hold, resume auto-rotation from where we left off
      resumeTimeoutRef.current = setTimeout(() => {
        resumeAuto();
      }, HOLD_DURATION);
    }, SEEK_DURATION);
  }, [clearResumeTimeout, resumeAuto]);

  // Globe point click: show card immediately, pause, then resume
  const handlePointClick = useCallback((d) => {
    const idx = allPointsRef.current.findIndex((p) => p._id === d._id);
    if (idx >= 0) {
      clearResumeTimeout();
      modeRef.current = "holding";
      seekingRef.current = false;
      holdUntilRef.current = Date.now() + HOLD_DURATION;
      activeIdxRef.current = idx;
      setActiveIdx(idx);
      if (globeEl.current) globeEl.current.controls().autoRotate = false;

      resumeTimeoutRef.current = setTimeout(() => {
        resumeAuto();
      }, HOLD_DURATION);
    }
  }, [clearResumeTimeout, resumeAuto]);

  const allPoints = useMemo(
    () => [...locations, ...INFRA_HUBS],
    [locations]
  );

  const pointsData = useMemo(
    () =>
      allPoints.map((l, i) => ({
        ...l,
        _id: l.id || `loc-${i}`,
        isHQ: l.city.toLowerCase() === "singapore",
        isInfra: INFRA_HUBS.some((h) => h.city === l.city),
      })),
    [allPoints]
  );

  allPointsRef.current = pointsData;

  const activeLocation = useMemo(
    () => pointsData[activeIdx] || null,
    [pointsData, activeIdx]
  );

  // rAF loop: in auto mode, pick the most camera-facing point; in seeking/holding
  // mode, stick with the selected point. Position the card next to it.
  useEffect(() => {
    if (!inView) return;
    let raf;
    const tmpVec = new THREE.Vector3();
    const update = () => {
      const g = globeEl.current;
      const card = cardRef.current;
      const pts = allPointsRef.current;
      const d = dimsRef.current;
      if (g && card && pts && pts.length > 0) {
        const camera = g.camera();
        const toCam = camera.position.clone().normalize();

        const seeking = seekingRef.current;
        const holding = Date.now() < holdUntilRef.current;
        const isManual = seeking || holding;

        let bestIdx;
        if (isManual) {
          bestIdx = activeIdxRef.current;
        } else {
          let bestDot = -Infinity;
          bestIdx = activeIdxRef.current;
          for (let i = 0; i < pts.length; i++) {
            const c = g.getCoords(pts[i].lat, pts[i].lng, 0.025);
            tmpVec.set(c.x, c.y, c.z).normalize();
            const dot = tmpVec.dot(toCam);
            if (dot > bestDot) { bestDot = dot; bestIdx = i; }
          }
          if (bestIdx !== activeIdxRef.current) {
            activeIdxRef.current = bestIdx;
            setActiveIdx(bestIdx);
          }
        }

        const pt = pts[bestIdx];
        const coords = g.getCoords(pt.lat, pt.lng, 0.025);
        tmpVec.set(coords.x, coords.y, coords.z);
        const toPoint = tmpVec.clone().normalize();
        const facing = toPoint.dot(toCam) > 0.25;

        if (facing) {
          tmpVec.project(camera);
          const px = (tmpVec.x * 0.5 + 0.5) * d.width;
          const py = (-tmpVec.y * 0.5 + 0.5) * d.height;
          const cx = (d.width - d.width * GLOBE_SCALE) / 2 + px * GLOBE_SCALE;
          const cy = (d.height - d.height * GLOBE_SCALE) / 2 + py * GLOBE_SCALE + GLOBE_OFFSET_Y;
          const onRight = cx > d.width / 2;
          card.style.display = "block";
          card.style.left = onRight ? `${cx - 10}px` : `${cx + 10}px`;
          card.style.top = `${cy}px`;
          card.style.transform = onRight
            ? "translate(-100%, -50%)"
            : "translate(0, -50%)";
        } else {
          card.style.display = "none";
        }
      }
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => cancelAnimationFrame(raf);
  }, [inView]);

  // Dashed arcs from HQ. Far points relay through nearest neighbour.
  const RELAY_FROM = {
    Delaware: "Switzerland",
    Panama: "Delaware",
  };

  const arcsData = useMemo(() => {
    const hq = locations.find((l) => l.city.toLowerCase() === "singapore");
    if (!hq) return [];
    return allPoints
      .filter((l) => l.city.toLowerCase() !== "singapore")
      .map((l) => {
        let startLat = hq.lat;
        let startLng = hq.lng;
        const relayCity = RELAY_FROM[l.city];
        if (relayCity) {
          const relay = allPoints.find((p) => p.city === relayCity);
          if (relay) {
            startLat = relay.lat;
            startLng = relay.lng;
          }
        }
        return {
          startLat, startLng,
          endLat: l.lat, endLng: l.lng,
          color: l.color || "#FFA765",
        };
      });
  }, [allPoints, locations]);

  // 3D pin: visible sphere + halo + invisible larger hit area for clicking
  const objectThreeObject = useCallback((d) => {
    const color = new THREE.Color(d.color || "#E85D2F");

    const dot = new THREE.Mesh(
      new THREE.SphereGeometry(d.isHQ ? 0.5 : 0.42, 24, 24),
      new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 1.1,
        roughness: 0.25,
        metalness: 0.1,
      })
    );

    const halo = new THREE.Mesh(
      new THREE.RingGeometry(0.62, 0.82, 32),
      new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 0.5,
        side: THREE.DoubleSide,
      })
    );
    halo.position.set(0, 0, -0.02);
    halo.rotation.x = Math.PI / 2;

    const hit = new THREE.Mesh(
      new THREE.SphereGeometry(1.4, 12, 12),
      new THREE.MeshBasicMaterial({ visible: false })
    );

    const group = new THREE.Group();
    group.add(dot, halo, hit);
    const scale = d.isHQ ? 6.5 : 5.8;
    group.scale.set(scale, scale, scale);
    return group;
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center"
      style={{ minWidth: "100%", minHeight: "100%" }}
    >
      {mounted && inView && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ transform: `translateY(${GLOBE_OFFSET_Y}px) scale(${GLOBE_SCALE})`, transformOrigin: "center center" }}
        >
        <Globe
          ref={globeEl}
          width={dims.width}
          height={dims.height}
          backgroundColor="rgba(0,0,0,0)"
          showGlobe={true}
          showAtmosphere={true}
          atmosphereColor={COLORS.atmosphere}
          atmosphereAltitude={0.15}
          showGraticules={false}
          globeMaterial={
            new THREE.MeshPhongMaterial({
              color: COLORS.ocean,
              shininess: 8,
              specular: new THREE.Color("#b0d0e8"),
              emissive: new THREE.Color("#d0e8f0"),
              emissiveIntensity: 0.2,
            })
          }
          polygonsData={countries}
          polygonGeoJsonGeometry={(d) => d.geometry}
          polygonCapColor={() => COLORS.land}
          polygonSideColor={() => "rgba(200,214,229,0.4)"}
          polygonStrokeColor={() => "rgba(92,116,138,0.78)"}
          polygonAltitude={0.005}
          objectsData={pointsData}
          objectLat={(d) => d.lat}
          objectLng={(d) => d.lng}
          objectAltitude={0.025}
          objectThreeObject={objectThreeObject}
          onObjectClick={handlePointClick}
          arcsData={arcsData}
          arcStartLat={(d) => d.startLat}
          arcStartLng={(d) => d.startLng}
          arcEndLat={(d) => d.endLat}
          arcEndLng={(d) => d.endLng}
          arcColor={() => "rgba(184,127,61,0.85)"}
          arcAltitude={0.22}
          arcStroke={0.6}
          arcDashLength={0.08}
          arcDashGap={0.06}
          arcDashAnimateTime={1800}
          arcsTransitionDuration={0}
        />
        </div>
      )}

      {activeLocation && (
        <div
          key={activeLocation._id}
          ref={cardRef}
          className="absolute z-30 pointer-events-none"
          style={{
            display: "none",
            animation: "globePop 0.4s ease",
          }}
        >
          <div
            className="bg-white rounded-lg overflow-hidden shadow-xl"
            style={{
              width: 200,
              borderLeft: `3px solid ${activeLocation.color || "#E85D2F"}`,
            }}
          >
            <div className="px-4 pt-3 pb-3">
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ background: activeLocation.color || "#E85D2F" }}
                />
                <span className="font-mono text-[8px] tracking-[0.18em] uppercase text-gray-400 font-semibold">
                  {activeLocation.isHQ
                    ? "Headquarters"
                    : activeLocation.isInfra
                    ? "Infrastructure"
                    : "Branch"}
                </span>
              </div>
              <div className="text-base font-bold text-gray-900 leading-tight">
                {activeLocation.city}
              </div>
              <div className="text-[11px] text-gray-500 leading-snug mt-0.5">
                {activeLocation.role}
              </div>
              {COMPANIES_BY_CITY[activeLocation.city] && (
                <div className="mt-2 pt-2 border-t border-gray-100">
                  {COMPANIES_BY_CITY[activeLocation.city].map((name) => (
                    <div
                      key={name}
                      className="font-mono text-[9px] text-gray-600 leading-snug"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom dots — click to spin globe to that location */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5">
        {pointsData.slice(0, Math.min(pointsData.length, 9)).map((p, i) => (
          <button
            key={p._id}
            onClick={() => seekToPoint(i)}
            className="w-2 h-2 rounded-full transition-all duration-300"
            style={{
              background: i === activeIdx ? (p.color || "#E85D2F") : "#ccc",
              opacity: i === activeIdx ? 1 : 0.4,
              transform: i === activeIdx ? "scale(1.4)" : "scale(1)",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
            aria-label={p.city}
          />
        ))}
      </div>

      <style>{`
        @keyframes globePop {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default Globe3D;
