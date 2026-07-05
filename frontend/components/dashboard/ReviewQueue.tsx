"use client";

import { useEffect, useState } from "react";
import { api, Recommendation } from "@/lib/api";

export default function ReviewQueue() {
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
        console.error("Error loading review queue:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[482px] flex items-center justify-center">
        <div className="text-red-400 text-sm border border-red-500/20 bg-red-950/20 px-4 py-2 rounded-xl">
          Failed to load review queue. Please check server.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[482px] flex flex-col justify-center gap-4 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-800 rounded-xl p-4 flex justify-between">
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-800 rounded w-1/2"></div>
                <div className="h-3 bg-slate-800 rounded w-1/4"></div>
              </div>
              <div className="h-6 w-16 bg-slate-800 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[482px] flex flex-col justify-between shadow-xl transition-all duration-300 hover:border-slate-700/50">
      <div>
        <h2 className="text-xl font-semibold text-white">
          Review Queue
        </h2>

        <div className="mt-5 space-y-4 overflow-y-auto max-h-[360px] pr-1">
          {recommendations.map((item, index) => {
            const isApproved = item.score > 90;
            const status = isApproved ? "Approved" : "Pending";
            
            return (
              <div
                key={item.title + index}
                className="border border-slate-800 rounded-xl p-4 flex justify-between items-center bg-slate-950/20 hover:bg-slate-950/60 transition-all duration-200"
              >
                <div>
                  <h3 className="text-white font-medium text-sm md:text-base">
                    {item.title}
                  </h3>

                  <p className="text-slate-400 text-xs mt-1">
                    {item.ward}
                  </p>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isApproved
                      ? "bg-green-600/10 text-green-400 border border-green-500/20"
                      : "bg-yellow-600/10 text-yellow-400 border border-yellow-500/20"
                  }`}
                >
                  {status}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
