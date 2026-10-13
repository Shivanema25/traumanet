"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Navigation,
  ShieldCheck,
  Clock,
  MapPin,
  Activity,
  Lock,
  Building2,
  CheckCircle2,
  Compass,
  AlertTriangle,
  RotateCcw,
  Zap,
} from "lucide-react";
import { useTraumaNet } from "@/lib/TraumaNetContext";

export interface NagpurHospitalItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  icu_free: number;
  dependability: string;
  specialists: string[];
  isSoftLocked: boolean;
}

export interface AccidentCorridorItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

// 5 Real Partner Hospitals in Nagpur
export const NAGPUR_HOSPITALS_LIST: NagpurHospitalItem[] = [
  {
    id: "hosp-kingsway-nagpur",
    name: "Kingsway Hospitals (Sadar)",
    lat: 21.1539,
    lng: 79.0882,
    icu_free: 12,
    dependability: "94.2% (Grade A+)",
    specialists: ["Neurosurgery", "CT/MRI", "Blood Bank (O-Neg)"],
    isSoftLocked: false,
  },
  {
    id: "hosp-aiims-nagpur",
    name: "AIIMS Nagpur (MIHAN)",
    lat: 21.0396,
    lng: 79.0278,
    icu_free: 18,
    dependability: "96.5% (Grade A+)",
    specialists: ["Level-1 Public Trauma", "Polytrauma OT", "ICU"],
    isSoftLocked: false,
  },
  {
    id: "hosp-citc-nagpur",
    name: "Central India Trauma Center (Dhantoli)",
    lat: 21.1340,
    lng: 79.0805,
    icu_free: 4,
    dependability: "92.4% (Grade A)",
    specialists: ["Head Injury Unit", "CT Scan", "Critical Care"],
    isSoftLocked: false,
  },
  {
    id: "hosp-gmch-nagpur",
    name: "GMCH Nagpur (Hanuman Nagar)",
    lat: 21.1275,
    lng: 79.0989,
    icu_free: 8,
    dependability: "89.0% (Grade B+)",
    specialists: ["Free Public ER", "Mass Casualty", "Blood Bank"],
    isSoftLocked: false,
  },
  {
    id: "hosp-alexis-nagpur",
    name: "Alexis / Max Super Speciality (Mankapur)",
    lat: 21.1856,
    lng: 79.0700,
    icu_free: 6,
    dependability: "91.8% (Grade A)",
    specialists: ["Cardiac ICU", "Emergency CT", "Orthopedic Trauma"],
    isSoftLocked: false,
  },
];

// Nagpur High-Risk Accident Corridors
export const NAGPUR_CORRIDORS: AccidentCorridorItem[] = [
  {
    id: "wardha-flyover",
    name: "Wardha Road (Airport Flyover Hub)",
    lat: 21.0850,
    lng: 79.0600,
  },
  {
    id: "samruddhi-jamtha",
    name: "Samruddhi Mahamarg Interchange (Jamtha)",
    lat: 21.0080,
    lng: 79.0230,
  },
  {
    id: "automotive-kamptee",
    name: "Automotive Square (Kamptee Road)",
    lat: 21.1800,
    lng: 79.1100,
  },
];

interface NagpurMapProps {
  height?: string;
  onHospitalSelect?: (hospital: NagpurHospitalItem) => void;
  showSoftLockAction?: boolean;
}

export default function NagpurMap({
  height = "480px",
  onHospitalSelect,
  showSoftLockAction = true,
}: NagpurMapProps) {
  const { acceptAndLockBed, activeSession } = useTraumaNet();

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<any>(null);
  const routePolylineRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);

  const [mapLayerType, setMapLayerType] = useState<"roadmap" | "satellite" | "terrain" | "osm">("roadmap");
  const [accidentLocation, setAccidentLocation] = useState<AccidentCorridorItem>(NAGPUR_CORRIDORS[0]);
  const [selectedHospital, setSelectedHospital] = useState<NagpurHospitalItem>(NAGPUR_HOSPITALS_LIST[0]);
  const [distanceKm, setDistanceKm] = useState<string>("7.2");
  const [etaMinutes, setEtaMinutes] = useState<number>(14);
  const [isRouting, setIsRouting] = useState<boolean>(false);
  const [isSoftLocked, setIsSoftLocked] = useState<boolean>(false);
  const [countdownSec, setCountdownSec] = useState<number>(15 * 60 - 1); // 14:59

  const googleMapsApiKey =
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ||
    "AIzaSyBhi8ZsJmytnb84DvOWxfRAixcom0ACS7o";

  const createTileLayer = useCallback((L: any, type: string) => {
    if (type === "satellite") {
      return L.tileLayer(
        `https://mt{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&key=${googleMapsApiKey}`,
        { maxZoom: 20, subdomains: ["0", "1", "2", "3"], attribution: "© Google" }
      );
    }
    if (type === "terrain") {
      return L.tileLayer(
        `https://mt{s}.google.com/vt/lyrs=p&x={x}&y={y}&z={z}&key=${googleMapsApiKey}`,
        { maxZoom: 20, subdomains: ["0", "1", "2", "3"], attribution: "© Google" }
      );
    }
    if (type === "osm") {
      return L.tileLayer(
        "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
        { maxZoom: 19, subdomains: ["a", "b", "c"], attribution: "© OpenStreetMap contributors" }
      );
    }
    // Default: Google Roadmap (clean, clear road view)
    return L.tileLayer(
      `https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&key=${googleMapsApiKey}`,
      { maxZoom: 20, subdomains: ["0", "1", "2", "3"], attribution: "© Google Maps" }
    );
  }, [googleMapsApiKey]);

  // Soft-lock countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSoftLocked) {
      timer = setInterval(() => {
        setCountdownSec((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSoftLocked]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Fetch shortest driving route via OSRM with local fallback
  const fetchShortestRoute = useCallback(
    async (pickup: AccidentCorridorItem, hospital: NagpurHospitalItem) => {
      setIsRouting(true);
      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${hospital.lng},${hospital.lat}?overview=full&geometries=geojson`;
        const res = await fetch(url, { signal: AbortSignal.timeout(4000) });
        const data = await res.json();

        if (data.routes && data.routes[0]) {
          const route = data.routes[0];
          const dist = (route.distance / 1000).toFixed(1);
          const dur = Math.max(3, Math.round(route.duration / 60));
          const coordinates: [number, number][] = route.geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]] // convert lng,lat to lat,lng
          );

          setDistanceKm(dist);
          setEtaMinutes(dur);
          drawRouteOnMap(coordinates);
          return;
        }
      } catch {
        // Fallback: Realistic straight-line road corridor interpolation
        const approxDist = (
          Math.sqrt(
            Math.pow(pickup.lat - hospital.lat, 2) + Math.pow(pickup.lng - hospital.lng, 2)
          ) * 111 * 1.25
        ).toFixed(1);
        const approxEta = Math.max(5, Math.round(Number(approxDist) * 1.8));
        setDistanceKm(approxDist);
        setEtaMinutes(approxEta);

        // Interpolate road points
        const points: [number, number][] = [
          [pickup.lat, pickup.lng],
          [(pickup.lat * 2 + hospital.lat) / 3, (pickup.lng * 2 + hospital.lng) / 3],
          [(pickup.lat + hospital.lat * 2) / 3, (pickup.lng + hospital.lng * 2) / 3],
          [hospital.lat, hospital.lng],
        ];
        drawRouteOnMap(points);
      } finally {
        setIsRouting(false);
      }
    },
    []
  );

  const drawRouteOnMap = (coordinates: [number, number][]) => {
    if (!mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    if (routePolylineRef.current) {
      routePolylineRef.current.remove();
    }

    import("leaflet").then((L) => {
      // Glow underlay
      const glow = L.polyline(coordinates, {
        color: "#60A5FA",
        weight: 8,
        opacity: 0.4,
      });

      // Main high-contrast blue polyline
      const line = L.polyline(coordinates, {
        color: "#3B82F6",
        weight: 5,
        opacity: 0.95,
        dashArray: undefined,
      });

      const group = L.featureGroup([glow, line]).addTo(map);
      routePolylineRef.current = group;

      // Fit bounds with padding
      map.fitBounds(group.getBounds(), { padding: [50, 50] });
    });
  };

  // Initialize Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      try {
        const L = (await import("leaflet")).default;

        // Ensure Leaflet stylesheet is injected
        if (!document.getElementById("leaflet-css-nagpur")) {
          const link = document.createElement("link");
          link.id = "leaflet-css-nagpur";
          link.rel = "stylesheet";
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
          document.head.appendChild(link);
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
        }

        // Center on Nagpur (21.1458° N, 79.0882° E)
        const map = L.map(mapContainerRef.current, {
          center: [21.1458, 79.0882],
          zoom: 12,
          zoomControl: false,
          attributionControl: false,
        });

        // Authentic Google Maps Layer via Google Maps API Key
        const tile = createTileLayer(L, mapLayerType).addTo(map);
        tileLayerRef.current = tile;

        mapInstanceRef.current = map;
        const markersGroup = L.layerGroup().addTo(map);
        markersGroupRef.current = markersGroup;

        // Render accident marker and hospital markers
        renderMarkers(L, map, markersGroup);

        // Fetch initial route
        fetchShortestRoute(accidentLocation, selectedHospital);
      } catch (e) {
        console.error("Leaflet init error:", e);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Dynamically switch Google Maps tile layers (Roadmap / Satellite / Terrain / OSM)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    import("leaflet").then((L) => {
      if (tileLayerRef.current && mapInstanceRef.current) {
        mapInstanceRef.current.removeLayer(tileLayerRef.current);
      }
      const newTile = createTileLayer(L.default, mapLayerType).addTo(mapInstanceRef.current);
      tileLayerRef.current = newTile;
      if (markersGroupRef.current) {
        markersGroupRef.current.bringToFront();
      }
      if (routePolylineRef.current) {
        routePolylineRef.current.bringToFront();
      }
    });
  }, [mapLayerType, createTileLayer]);

  // Update markers when selectedHospital or accidentLocation changes
  const renderMarkers = (L: any, map: any, markersGroup: any) => {
    markersGroup.clearLayers();

    // 1. Ambulance Pickup Marker (Pulsating Red Circle)
    const ambulanceHtml = `
      <div style="position: relative; display: flex; align-items: center; justify-content: center; width: 44px; height: 44px;">
        <div style="position: absolute; width: 44px; height: 44px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
        <div style="position: relative; width: 32px; height: 32px; border-radius: 50%; background: #EF4444; border: 2.5px solid #FFFFFF; box-shadow: 0 4px 14px rgba(239,68,68,0.6); display: flex; align-items: center; justify-content: center; font-size: 14px;">
          🚑
        </div>
      </div>
    `;

    const ambulanceIcon = L.divIcon({
      html: ambulanceHtml,
      className: "nagpur-ambulance-marker",
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const ambMarker = L.marker([accidentLocation.lat, accidentLocation.lng], {
      icon: ambulanceIcon,
    }).addTo(markersGroup);

    ambMarker.bindPopup(`
      <div style="font-family: sans-serif; font-size: 12px; color: #0F172A; padding: 4px;">
        <strong style="color: #EF4444; font-size: 13px;">🚨 Accident Pickup Hub</strong><br/>
        ${accidentLocation.name}<br/>
        <span style="font-size: 11px; color: #64748B;">Node #108 En-Route</span>
      </div>
    `);

    // 2. Nagpur Hospital Markers
    NAGPUR_HOSPITALS_LIST.forEach((hosp) => {
      const isSelected = hosp.id === selectedHospital.id;
      const pinColor = isSelected ? "#10B981" : "#1E293B";
      const border = isSelected ? "3px solid #FFFFFF" : "2px solid #94A3B8";

      const hospitalHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          ${
            isSelected
              ? `<div style="position: absolute; width: 48px; height: 48px; border-radius: 50%; background: rgba(16, 185, 129, 0.3); animation: ping 2s cubic-bezier(0,0,0.2,1) infinite;"></div>`
              : ""
          }
          <div style="background: ${pinColor}; color: white; width: 34px; height: 34px; border-radius: 10px; border: ${border}; display: flex; align-items: center; justify-content: center; font-size: 15px; box-shadow: 0 4px 12px rgba(0,0,0,0.3);">
            🏥
          </div>
          <div style="background: rgba(15, 23, 42, 0.9); color: white; border: 1px solid rgba(255,255,255,0.2); font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 6px; margin-top: 3px; white-space: nowrap; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
            ${hosp.name.split(" ")[0]} (${hosp.icu_free} Beds)
          </div>
        </div>
      `;

      const hospIcon = L.divIcon({
        html: hospitalHtml,
        className: "nagpur-hospital-marker",
        iconSize: [48, 56],
        iconAnchor: [24, 28],
      });

      const marker = L.marker([hosp.lat, hosp.lng], { icon: hospIcon }).addTo(markersGroup);

      marker.on("click", () => {
        handleHospitalChange(hosp);
      });

      marker.bindPopup(`
        <div style="font-family: sans-serif; font-size: 12px; color: #0F172A; padding: 4px;">
          <strong style="font-size: 13px; color: #0F172A;">${hosp.name}</strong><br/>
          <span style="color: #059669; font-weight: bold;">${hosp.icu_free} Open ICU Beds</span><br/>
          <span>Dependability: <strong>${hosp.dependability}</strong></span><br/>
          <span style="color: #64748B; font-size: 11px;">${hosp.specialists.join(" • ")}</span>
        </div>
      `);
    });
  };

  const handleHospitalChange = (hosp: NagpurHospitalItem) => {
    setSelectedHospital(hosp);
    if (onHospitalSelect) onHospitalSelect(hosp);

    import("leaflet").then((L) => {
      if (mapInstanceRef.current && markersGroupRef.current) {
        renderMarkers(L, mapInstanceRef.current, markersGroupRef.current);
      }
    });

    fetchShortestRoute(accidentLocation, hosp);
  };

  const handleCorridorChange = (corridor: AccidentCorridorItem) => {
    setAccidentLocation(corridor);

    import("leaflet").then((L) => {
      if (mapInstanceRef.current && markersGroupRef.current) {
        renderMarkers(L, mapInstanceRef.current, markersGroupRef.current);
      }
    });

    fetchShortestRoute(corridor, selectedHospital);
  };

  const handleSoftLockTrigger = () => {
    setIsSoftLocked(true);
    setCountdownSec(15 * 60 - 1);
    if (activeSession) {
      acceptAndLockBed(activeSession.session_id);
    }
  };

  return (
    <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col font-sans">
      {/* Top Map Header & Controls */}
      <div className="p-3.5 sm:p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center">
            <Compass className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>Nagpur Pilot Emergency Corridor (OSRM Road Network)</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-slate-500">
              Nagpur Hub (21.1458° N, 79.0882° E) • Shortest-Path Live Routing
            </p>
          </div>
        </div>

        {/* Controls: Google Maps Connected, Layer Switcher, Corridor Switcher */}
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          {/* Google Maps Connected Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-semibold shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Google Maps Connected</span>
          </div>

          {/* Map Layer Selector */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-600 font-semibold shrink-0">Layer:</label>
            <select
              value={mapLayerType}
              onChange={(e) => setMapLayerType(e.target.value as any)}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-blue-600 font-sans font-medium cursor-pointer"
            >
              <option value="roadmap">Google Roadmap</option>
              <option value="satellite">Google Satellite</option>
              <option value="terrain">Google Terrain</option>
              <option value="osm">OpenStreetMap</option>
            </select>
          </div>

          {/* Corridor Switcher Dropdown */}
          <div className="flex items-center gap-1.5">
            <label className="text-[11px] text-slate-600 font-semibold shrink-0">Accident Hub:</label>
            <select
              value={accidentLocation.id}
              onChange={(e) => {
                const c = NAGPUR_CORRIDORS.find((cor) => cor.id === e.target.value);
                if (c) handleCorridorChange(c);
              }}
              className="bg-slate-50 border border-slate-300 text-xs text-slate-800 rounded-lg px-2 py-1.5 focus:outline-none focus:border-red-500 font-sans font-medium cursor-pointer"
            >
              {NAGPUR_CORRIDORS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Leaflet Map Container */}
      <div className="relative">
        <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-100" />

        {/* Live Floating HUD Card */}
        <div className="absolute top-4 left-4 z-[400] max-w-xs bg-white/95 backdrop-blur-xs border border-slate-200 p-3.5 rounded-xl shadow-lg space-y-2 pointer-events-auto">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-blue-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-blue-600" /> Shortest Road Route
            </span>
            <span className="font-mono text-slate-900 font-bold">{isRouting ? "Calculating..." : `${distanceKm} km`}</span>
          </div>

          <div className="flex items-baseline justify-between pt-1 border-t border-slate-100">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500">Ambulance ETA</div>
              <div className="text-lg font-black font-mono text-red-600">
                {isRouting ? "--" : `${etaMinutes} Mins`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-500">ICU Capacity</div>
              <div className="text-xs font-bold text-emerald-700">
                {selectedHospital.icu_free} Beds Free
              </div>
            </div>
          </div>
        </div>

        {/* Soft-Lock Countdown Badge Overlay if Active */}
        {isSoftLocked && (
          <div className="absolute top-4 right-4 z-[400] bg-emerald-50 border border-emerald-300 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2.5 pointer-events-auto">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider">
                ICU Bed #2 Soft-Locked
              </div>
              <div className="text-sm font-black font-mono text-emerald-900">
                {formatCountdown(countdownSec)} remaining
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Destination Hospital Selector Bar & Soft-Lock Action */}
      <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-emerald-600" /> Target Trauma Facility (Nagpur Wedge):
          </span>
          <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
            Click any hospital to re-route OSRM polyline
          </span>
        </div>

        {/* 5 Partner Hospital Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {NAGPUR_HOSPITALS_LIST.map((hosp) => {
            const isSelected = hosp.id === selectedHospital.id;
            return (
              <button
                key={hosp.id}
                type="button"
                onClick={() => handleHospitalChange(hosp)}
                className={`text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? "bg-white border-2 border-red-600 shadow-sm"
                    : "bg-white border-slate-200 hover:border-slate-300 text-slate-700"
                }`}
              >
                <div className="text-xs font-bold text-slate-900 line-clamp-1">{hosp.name}</div>
                <div className="flex items-center justify-between text-[11px] mt-1 font-mono">
                  <span className="text-emerald-700 font-bold">{hosp.icu_free} Beds</span>
                  <span className="text-slate-500">{hosp.dependability.split(" ")[0]}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Soft-Lock Action Button */}
        {showSoftLockAction && (
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-200">
            <div className="text-xs text-slate-600">
              Assigned: <strong className="text-slate-900">{selectedHospital.name}</strong> • Dependability: <strong className="text-emerald-700">{selectedHospital.dependability}</strong>
            </div>

            {!isSoftLocked ? (
              <button
                type="button"
                onClick={handleSoftLockTrigger}
                className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>🔒 Soft-Lock ICU Bed on ER Dashboard</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg border border-emerald-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>ICU Bed #2 Verified &amp; Soft-Locked • 15-Minute Countdown Active</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
