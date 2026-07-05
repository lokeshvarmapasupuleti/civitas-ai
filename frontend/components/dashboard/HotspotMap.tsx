"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { api, Hotspot } from "@/lib/api";

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[518px] flex items-center justify-center">
        <div className="text-red-400 text-sm border border-red-500/20 bg-red-950/20 px-4 py-2 rounded-xl">
          Failed to load geospatial hotspots. Please verify connection.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 h-[518px] flex items-center justify-center animate-pulse">
        <div className="text-slate-400 text-lg font-medium">Loading geospatial hotspots...</div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
      <h2 className="text-xl font-semibold mb-4 text-white">
        Demand Hotspots
      </h2>

      <MapContainer
        center={[22.3039, 70.8022]}
        zoom={12}
        style={{
          height: "450px",
          width: "100%",
          borderRadius: "14px",
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
            radius={15}
            pathOptions={{
              color: spot.color,
              fillColor: spot.color,
              fillOpacity: 0.6,
            }}
          >
            <Popup>
              <strong>{spot.name}</strong>

              <br />

              Citizen Requests: {spot.requests}
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
    </div>
  );
}