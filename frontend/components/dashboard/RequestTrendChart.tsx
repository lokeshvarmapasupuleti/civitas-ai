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
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] flex items-center justify-center">
        <div className="text-red-400 text-sm border border-red-500/20 bg-red-950/20 px-4 py-2 rounded-xl">
          Failed to load request trend chart. Please check API connection.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[400px] flex flex-col justify-center items-center gap-2 animate-pulse">
        <Loader2 className="animate-spin text-blue-500" size={32} />
        <span className="text-slate-400 text-sm">Loading trend data...</span>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
      <div className="flex justify-between items-start gap-4">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <TrendingUp className="text-blue-500" size={22} />
            Citizen Demand Timeline
          </h2>
          <p className="text-xs text-slate-400 mt-1">Monthly trend of incoming development requests</p>
        </div>
        <div className="bg-slate-950/60 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-blue-400 max-w-[280px]">
          {trendDesc}
        </div>
      </div>

      <div className="h-[280px] mt-6 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={stats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis dataKey="month" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", borderRadius: "10px" }}
              labelStyle={{ color: "#fff", fontWeight: "bold" }}
              itemStyle={{ color: "#3b82f6" }}
            />
            <Area type="monotone" dataKey="requests" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRequests)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
