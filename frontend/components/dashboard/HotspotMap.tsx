"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { api, Hotspot } from "@/lib/api";
import { MapPinned } from "lucide-react";

export default function HotspotMap() {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getAnalytics()
      .then((data) => {
        setHotspots(data.hotspots || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading hotspots:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[518px] flex items-center justify-center shadow-sm">
        <div className="text-red-600 text-sm border border-red-200 bg-red-50 px-4 py-2 rounded-xl">
          Failed to load geospatial hotspots. Please verify connection.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-5 border border-slate-200 h-[518px] flex items-center justify-center animate-pulse shadow-sm">
        <div className="text-slate-400 text-sm font-semibold">Loading geospatial hotspots...</div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/65 rounded-2xl p-5 shadow-sm">
      <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
        <MapPinned className="text-blue-600" size={18} />
        Demand Hotspots
      </h2>

      <div className="relative">
        <MapContainer
          center={[22.3039, 70.8022]}
          zoom={12}
          style={{
            height: "440px",
            width: "100%",
            borderRadius: "14px",
            border: "1px solid rgba(226, 232, 240, 0.8)",
          }}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {hotspots.map((spot) => (
            <CircleMarker
              key={spot.name}
              center={spot.position}
              radius={12}
              pathOptions={{
                color: spot.color,
                fillColor: spot.color,
                fillOpacity: 0.5,
                weight: 2,
              }}
            >
              <Popup>
                <div className="font-sans text-xs p-1">
                  <strong className="text-slate-800 text-sm font-bold block mb-1">{spot.name}</strong>
                  <span className="text-slate-500 font-semibold">Requests Count: </span>
                  <span className="text-blue-600 font-extrabold">{spot.requests}</span>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>

        {/* Floating Legend */}
        <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-md border border-slate-200/80 px-3 py-2.5 rounded-xl text-[10px] uppercase font-bold tracking-wider space-y-1.5 shadow-lg z-[1000] text-slate-650">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>Critical demands</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>Concerned demands</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span>Standard demands</span>
          </div>
        </div>
      </div>
    </div>
  );
}