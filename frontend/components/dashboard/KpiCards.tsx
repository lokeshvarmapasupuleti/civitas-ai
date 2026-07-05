"use client";

import { useEffect, useState } from "react";
import { Users, BrainCircuit, MapPinned, Clock3 } from "lucide-react";
import { api } from "@/lib/api";

export default function KpiCards() {
  const [kpis, setKpis] = useState({
    citizen_requests: 0,
    ai_recommendations: 0,
    demand_hotspots: 0,
    pending_reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getAnalytics()
      .then((data) => {
        setKpis(data.kpis);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading KPIs:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const cards = [
    {
      title: "Citizen Requests",
      value: loading ? "..." : kpis.citizen_requests.toLocaleString(),
      icon: Users,
      color: "text-blue-400",
    },
    {
      title: "AI Recommendations",
      value: loading ? "..." : kpis.ai_recommendations.toLocaleString(),
      icon: BrainCircuit,
      color: "text-green-400",
    },
    {
      title: "Demand Hotspots",
      value: loading ? "..." : kpis.demand_hotspots.toLocaleString(),
      icon: MapPinned,
      color: "text-red-400",
    },
    {
      title: "Pending Reviews",
      value: loading ? "..." : kpis.pending_reviews.toLocaleString(),
      icon: Clock3,
      color: "text-yellow-400",
    },
  ];

  if (error) {
    return (
      <div className="bg-red-950/20 border border-red-500/20 rounded-2xl p-4 text-red-400 text-sm">
        Failed to load dashboard metrics from backend API. Please check server connection.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <div
            key={card.title}
            className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 transition-all duration-300 hover:border-slate-700/50 hover:-translate-y-0.5"
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-slate-400 text-sm">
                  {card.title}
                </p>

                <h2 className="text-3xl font-bold text-white mt-2">
                  {card.value}
                </h2>
              </div>

              <div className="p-3 bg-slate-950/40 rounded-xl">
                <Icon
                  size={28}
                  className={card.color}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}