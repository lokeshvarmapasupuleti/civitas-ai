"use client";

import { useEffect, useState } from "react";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { 
  Search, ZoomIn, ZoomOut, Maximize, Moon, Sun, Layers, Navigation 
} from "lucide-react";

interface ComplaintItem {
  id: string;
  ward: string;
  category: string;
  priority: string;
  submitted: string;
  department: string;
  status: string;
  recommendation: string;
  confidence: number;
  resolution: string;
  position: [number, number];
  image: string | null;
  timeframe: string; // 'today' | 'yesterday' | 'week' | 'month'
}

const MOCK_COMPLAINTS: ComplaintItem[] = [
  {
    id: "CIV-8924",
    ward: "Ward 5 - Central",
    category: "Road Repair",
    priority: "High",
    submitted: "2026-07-06",
    department: "Public Works Department (PWD)",
    status: "In Progress",
    recommendation: "Re-pave structural segment immediately",
    confidence: 96,
    resolution: "24 Hours",
    position: [22.3080, 70.8010],
    image: "https://images.unsplash.com/photo-1515162305285-0293e4767cc2?w=150&auto=format&fit=crop&q=60",
    timeframe: "yesterday"
  },
  {
    id: "CIV-8201",
    ward: "Ward 2 - West Zone",
    category: "Water Supply",
    priority: "Critical",
    submitted: "2026-07-07",
    department: "Municipal Water Board",
    status: "Pending",
    recommendation: "Reroute pressure bypass valves",
    confidence: 98,
    resolution: "12 Hours",
    position: [22.3015, 70.7920],
    image: "https://images.unsplash.com/photo-1542013936693-8848e5744255?w=150&auto=format&fit=crop&q=60",
    timeframe: "today"
  },
  {
    id: "CIV-7405",
    ward: "Ward 1 - East Zone",
    category: "Sanitation",
    priority: "Medium",
    submitted: "2026-07-05",
    department: "Sanitation & Waste Division",
    status: "Completed",
    recommendation: "Schedule trash bin collection updates",
    confidence: 92,
    resolution: "48 Hours",
    position: [22.2980, 70.8120],
    image: null,
    timeframe: "week"
  },
  {
    id: "CIV-6209",
    ward: "Ward 7 - Suburbs",
    category: "Street Lighting",
    priority: "Low",
    submitted: "2026-07-04",
    department: "Electrical Division",
    status: "In Progress",
    recommendation: "Install LED replacement fixtures",
    confidence: 89,
    resolution: "72 Hours",
    position: [22.3120, 70.8250],
    image: null,
    timeframe: "week"
  },
  {
    id: "CIV-5192",
    ward: "Ward 10 - Tech Park",
    category: "Public Transport",
    priority: "High",
    submitted: "2026-06-25",
    department: "Transit & Traffic Board",
    status: "Pending",
    recommendation: "Increase transit dispatch peak loads",
    confidence: 95,
    resolution: "24 Hours",
    position: [22.2890, 70.7990],
    image: "https://images.unsplash.com/photo-1494515426402-f1980ae7a01d?w=150&auto=format&fit=crop&q=60",
    timeframe: "month"
  }
];

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom, { animate: true });
  }, [center, zoom, map]);
  return null;
}

interface GISMapProps {
  timeframe: string;
  onWardSelect: (wardName: string) => void;
  filters: {
    category: string;
    priority: string;
    status: string;
  };
}

export default function GISIntelligenceMap({ timeframe, onWardSelect, filters }: GISMapProps) {
  const [mapCenter, setMapCenter] = useState<[number, number]>([22.3039, 70.8022]);
  const [mapZoom, setMapZoom] = useState(12);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [demoActive, setDemoActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDemoActive(localStorage.getItem("civitas_demo_mode") === "true");
      const handleDemo = () => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setDemoActive(localStorage.getItem("civitas_demo_mode") === "true");
      };
      window.addEventListener("civitas_demo_change", handleDemo);
      return () => window.removeEventListener("civitas_demo_change", handleDemo);
    }
  }, []);

  // Custom marker anchors setup
  const createMarkerIcon = (priority: string) => {
    const isCritical = priority.toLowerCase() === "critical" || priority.toLowerCase() === "high";
    const colorClass = isCritical ? "bg-rose-600" : priority.toLowerCase() === "medium" ? "bg-amber-500" : "bg-indigo-600";
    const pingClass = isCritical ? "bg-rose-400" : priority.toLowerCase() === "medium" ? "bg-amber-400" : "bg-indigo-400";
    
    const htmlString = `
      <div class="relative flex items-center justify-center">
        <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full ${pingClass} opacity-75"></span>
        <span class="relative inline-flex rounded-full h-3.5 w-3.5 ${colorClass} border-2 border-white shadow-md"></span>
      </div>
    `;

    return L.divIcon({
      html: htmlString,
      className: "custom-leaflet-marker",
      iconSize: [20, 20]
    });
  };

  // Filter complaints based on Time Machine + Category/Priority search filters
  const baseComplaints = [...MOCK_COMPLAINTS];
  if (demoActive) {
    baseComplaints.push({
      id: "CIV-8204-GJ",
      ward: "Ward 5 - Central",
      category: "Road Repair",
      priority: "Critical",
      submitted: "2026-07-07",
      department: "Public Works Department (PWD)",
      status: "Pending",
      recommendation: "Deploy PWD road repair cell immediately",
      confidence: 96,
      resolution: "24 Hours",
      position: [22.2890, 70.7990],
      image: null,
      timeframe: "today"
    });
  }

  const filteredComplaints = baseComplaints.filter((comp) => {
    // 1. Time machine filter
    if (timeframe === "today" && comp.timeframe !== "today") return false;
    if (timeframe === "yesterday" && comp.timeframe !== "today" && comp.timeframe !== "yesterday") return false;
    if (timeframe === "week" && comp.timeframe === "month") return false;

    // 2. Control bar dropdown filters
    if (filters.category && comp.category !== filters.category) return false;
    if (filters.priority && comp.priority !== filters.priority) return false;
    if (filters.status && comp.status !== filters.status) return false;

    // 3. Search query filters
    if (searchQuery.trim() !== "") {
      const matchText = searchQuery.toLowerCase();
      const match = 
        comp.id.toLowerCase().includes(matchText) ||
        comp.ward.toLowerCase().includes(matchText) ||
        comp.category.toLowerCase().includes(matchText);
      if (!match) return false;
    }

    return true;
  });

  const handleLocateMe = () => {
    setMapCenter([22.3039, 70.8022]);
    setMapZoom(13);
  };

  return (
    <div className="bg-white border border-slate-200/65 rounded-2xl p-5 shadow-sm relative flex flex-col h-[520px]">
      
      {/* Top Floating Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 z-[999]">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search Ward or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition"
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Tile toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition cursor-pointer"
            title="Toggle theme layer"
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Locate me */}
          <button
            onClick={handleLocateMe}
            className="p-2 border border-slate-200 hover:bg-slate-50 rounded-xl text-slate-500 transition cursor-pointer"
            title="Recenter Map"
          >
            <Navigation size={14} />
          </button>

          {/* Overlay layers */}
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`p-2 border rounded-xl transition cursor-pointer flex items-center gap-1.5 text-xs font-bold ${
              showHeatmap 
                ? "bg-indigo-50 border-indigo-200 text-indigo-700" 
                : "border-slate-200 hover:bg-slate-50 text-slate-500"
            }`}
          >
            <Layers size={14} />
            <span>Heatmap</span>
          </button>
        </div>
      </div>

      {/* Leaflet map frame */}
      <div className="relative flex-grow rounded-xl overflow-hidden border border-slate-200/80">
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          zoomControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <MapController center={mapCenter} zoom={mapZoom} />

          <TileLayer
            attribution='&copy; CartoDB'
            url={
              isDarkMode 
                ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            }
          />

          {filteredComplaints.map((comp) => (
            <Marker
              key={comp.id}
              position={comp.position}
              icon={createMarkerIcon(comp.priority)}
              eventHandlers={{
                click: () => onWardSelect(comp.ward)
              }}
            >
              <Popup>
                <div className="font-sans text-xs p-2 max-w-[260px] space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-1.5">
                    <span className="font-bold text-slate-800">{comp.id}</span>
                    <span className={`px-1.5 py-0.2 rounded text-[8px] font-extrabold uppercase ${
                      comp.priority.toLowerCase() === "critical" || comp.priority.toLowerCase() === "high"
                        ? "bg-red-50 text-red-750"
                        : "bg-amber-50 text-amber-700"
                    }`}>{comp.priority}</span>
                  </div>

                  <div className="space-y-1 text-slate-655 font-semibold leading-relaxed">
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Ward:</span> {comp.ward}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Category:</span> {comp.category}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Agency:</span> {comp.department}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Submitted:</span> {comp.submitted}</p>
                    <p><span className="text-slate-400 font-bold uppercase text-[9px] mr-1">Status:</span> {comp.status}</p>
                    <p className="text-indigo-650 border-t border-slate-100 pt-1.5 mt-1 font-bold">
                      <span className="text-slate-400 font-bold uppercase text-[9px] mr-1">AI Action:</span> {comp.recommendation}
                    </p>
                    <p className="text-[10px] text-slate-500 font-bold">
                      Confidence Score: <span className="text-indigo-600">{comp.confidence}%</span> &bull; SLA: {comp.resolution}
                    </p>
                  </div>

                  {comp.image && (
                    <div className="w-full h-20 rounded-lg overflow-hidden border border-slate-100 mt-2">
                      <img src={comp.image} alt="Evidence document" className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>

        {/* Custom Zoom Buttons absolute overlays */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-1.5">
          <button
            onClick={() => setMapZoom(prev => Math.min(18, prev + 1))}
            className="p-2 bg-white/95 border border-slate-200/80 hover:bg-slate-50 rounded-xl text-slate-500 shadow-md transition cursor-pointer"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={() => setMapZoom(prev => Math.max(8, prev - 1))}
            className="p-2 bg-white/95 border border-slate-200/80 hover:bg-slate-50 rounded-xl text-slate-500 shadow-md transition cursor-pointer"
          >
            <ZoomOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
