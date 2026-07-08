"use client";

import { useEffect, useState } from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { api, MonthlyStat } from "@/lib/api";
import { TrendingUp, Loader2 } from "lucide-react";

export default function RequestTrendChart() {
  const [stats, setStats] = useState<MonthlyStat[]>([]);
  const [trendDesc, setTrendDesc] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.getAnalytics()
      .then((data) => {
        setStats(data.stats || []);
        setTrendDesc(data.trend_description || "");
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading request trend stats:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[400px] flex items-center justify-center shadow-sm">
        <div className="text-red-650 text-sm border border-red-200 bg-red-50 px-4 py-2 rounded-xl">
          Failed to load request trend chart. Please check API connection.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 h-[400px] flex flex-col justify-center items-center gap-2 animate-pulse shadow-sm">
        <Loader2 className="animate-spin text-indigo-500" size={28} />
        <span className="text-slate-400 text-sm font-semibold">Loading trend data...</span>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="text-indigo-600" size={16} />
            Citizen Demand Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">Monthly trend of incoming development requests</p>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl px-4 py-2 text-xs text-indigo-700 font-semibold max-w-[280px]">
          {trendDesc}
        </div>
      </div>

      <div className="h-[280px] mt-6 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
            <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              labelStyle={{ color: "#0f172a", fontWeight: "bold", fontSize: "12px" }}
              itemStyle={{ color: "#4f46e5", fontWeight: "600", fontSize: "12px" }}
            />
            <Area type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorRequests)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
