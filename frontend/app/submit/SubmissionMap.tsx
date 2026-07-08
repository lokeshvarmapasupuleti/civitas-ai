"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";

const WARD_COORDS: Record<string, [number, number]> = {
  "Ward 1": [22.3080, 70.8010],
  "Ward 2": [22.3015, 70.7920],
  "Ward 3": [22.2980, 70.8120],
  "Ward 4": [22.3120, 70.8250],
  "Ward 5": [22.2890, 70.7990],
  "Ward 6": [22.3039, 70.8022],
  "Ward 7": [22.3210, 70.8150],
  "Ward 8": [22.2750, 70.7890],
  "Ward 9": [22.2920, 70.8350],
  "Ward 10": [22.3150, 70.7790],
  "Ward 11": [22.3350, 70.8050],
  "Ward 12": [22.2650, 70.8190]
};

function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 14, { animate: true });
  }, [center, map]);
  return null;
}

export default function SubmissionMap({ selectedWard }: { selectedWard: string }) {
  const defaultCenter: [number, number] = [22.3039, 70.8022];
  const center = WARD_COORDS[selectedWard] || defaultCenter;

  const markerIcon = typeof window !== "undefined" ? L.divIcon({
    html: `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-indigo-400 opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3 w-3 bg-indigo-600 border-2 border-white shadow"></span>
      </div>
    `,
    className: "custom-leaflet-marker",
    iconSize: [16, 16]
  }) : null;

  return (
    <div className="h-44 w-full rounded-xl overflow-hidden border border-slate-200">
      <MapContainer
        center={center}
        zoom={13}
        zoomControl={false}
        style={{ height: "100%", width: "100%" }}
      >
        <ChangeView center={center} />
        <TileLayer
          attribution='&copy; CartoDB'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {markerIcon && <Marker position={center} icon={markerIcon} />}
      </MapContainer>
    </div>
  );
}
