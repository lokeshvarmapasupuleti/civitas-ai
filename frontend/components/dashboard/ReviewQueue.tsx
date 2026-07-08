"use client";

import { useEffect, useState } from "react";
import { api, Recommendation } from "@/lib/api";
import { CheckSquare } from "lucide-react";

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
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[482px] flex items-center justify-center shadow-sm">
        <div className="text-red-600 text-sm border border-red-200 bg-red-50 px-4 py-2 rounded-xl">
          Failed to load review queue. Please check server.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[482px] flex flex-col justify-center gap-4 animate-pulse shadow-sm">
        <div className="h-6 w-32 bg-slate-100 rounded"></div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="border border-slate-100 rounded-xl p-4 flex justify-between">
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-100 rounded w-1/2"></div>
                <div className="h-3 bg-slate-100 rounded w-1/4"></div>
              </div>
              <div className="h-6 w-16 bg-slate-100 rounded-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/65 rounded-2xl p-6 h-[482px] flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-300">
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <CheckSquare className="text-indigo-600" size={16} />
          Review Queue
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Demands awaiting legislative approval and project launch</p>

        <div className="mt-5 space-y-4 overflow-y-auto max-h-[350px] pr-1">
          {recommendations.map((item, index) => {
            const isApproved = item.score > 90;
            const status = isApproved ? "Approved" : "Pending";
            
            return (
              <div
                key={item.title + index}
                className="border border-slate-105 rounded-xl p-4 flex justify-between items-center hover:bg-slate-50 transition-all duration-200 cursor-pointer"
              >
                <div>
                  <h3 className="text-slate-800 font-bold text-xs leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-[9px] uppercase font-bold tracking-wider text-slate-400 mt-1">
                    {item.ward}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                    isApproved
                      ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                      : "bg-amber-50 text-amber-700 border-amber-100"
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
