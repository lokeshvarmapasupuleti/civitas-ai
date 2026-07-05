"use client";

import { useEffect, useState } from "react";
import { api, Recommendation } from "@/lib/api";

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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[518px] flex items-center justify-center">
        <div className="text-red-400 text-sm border border-red-500/20 bg-red-950/20 px-4 py-2 rounded-xl">
          Failed to load AI recommendations. Please check server.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[518px] flex flex-col justify-center gap-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="h-4 bg-slate-800 rounded w-3/4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-slate-800 rounded w-1/4"></div>
                <div className="h-3 bg-slate-800 rounded w-1/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between h-[518px]">
      <div>
        <h2 className="text-xl font-semibold text-white">
          AI Recommendations
        </h2>

        <div className="mt-5 space-y-4">
          {recommendations.map((item, index) => (
            <div
              key={item.title + index}
              className="border border-slate-800 rounded-xl p-4 bg-slate-950/20 hover:bg-slate-950/60 transition-all duration-200"
            >
              <h3 className="text-white font-medium text-sm md:text-base">
                {item.title}
              </h3>

              <div className="flex justify-between mt-2 text-sm text-slate-400">
                <span>{item.ward}</span>

                <span className="text-green-400 font-semibold">
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
