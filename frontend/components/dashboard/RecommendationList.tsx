"use client";

import { useEffect, useState } from "react";
import { api, Recommendation } from "@/lib/api";
import { BrainCircuit } from "lucide-react";

export default function RecommendationList() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getRecommendations()
      .then((data) => {
        setRecommendations(data.slice(0, 4) || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading recommendations:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[518px] flex items-center justify-center shadow-sm">
        <div className="text-red-600 text-sm border border-red-200 bg-red-50 px-4 py-2 rounded-xl">
          Failed to load AI recommendations. Please check server.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[518px] flex flex-col justify-center gap-4 animate-pulse shadow-sm">
        <div className="h-6 w-32 bg-slate-100 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-3/4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
                <div className="h-3 bg-slate-100 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/65 rounded-2xl p-6 flex flex-col justify-between h-[518px] shadow-sm">
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BrainCircuit className="text-indigo-650" size={16} />
          AI Recommendations
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Suggested actions based on citizen requirements</p>

        <div className="mt-5 space-y-3.5">
          {recommendations.map((item, index) => (
            <div
              key={item.title + index}
              className="border border-slate-100 rounded-xl p-4 hover:bg-slate-50 transition-all duration-200 cursor-pointer"
            >
              <h3 className="text-slate-800 font-bold text-xs leading-tight">
                {item.title}
              </h3>

              <div className="flex justify-between items-center mt-2.5">
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">{item.ward}</span>

                <span className="text-[9px] font-extrabold text-indigo-700 bg-indigo-50 border border-indigo-100/50 px-2 py-0.5 rounded-full">
                  Score {item.score}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
