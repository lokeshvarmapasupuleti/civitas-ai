"use client";

import { useEffect, useState } from "react";
import { Lightbulb, TrendingUp, AlertTriangle, CheckCircle2 } from "lucide-react";
import { api, Recommendation } from "@/lib/api";

export default function RecentInsights() {
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
        console.error("Error loading insights:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  if (error) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 h-[482px] flex items-center justify-center">
        <div className="text-red-400 text-sm border border-red-500/20 bg-red-950/20 px-4 py-2 rounded-xl">
          Failed to load recent insights. Please verify connection.
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
            <div key={i} className="border border-slate-800 rounded-xl p-4 flex gap-4">
              <div className="h-10 w-10 bg-slate-800 rounded-lg flex-shrink-0 animate-pulse bg-slate-850"></div>
              <div className="space-y-2 flex-grow">
                <div className="h-4 bg-slate-800 rounded w-1/3"></div>
                <div className="h-3 bg-slate-800 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getStyleForIndex = (index: number) => {
    const styles = [
      {
        icon: TrendingUp,
        color: "text-amber-400",
        bgColor: "bg-amber-400/10",
        borderColor: "border-amber-400/20",
      },
      {
        icon: Lightbulb,
        color: "text-blue-400",
        bgColor: "bg-blue-400/10",
        borderColor: "border-blue-400/20",
      },
      {
        icon: AlertTriangle,
        color: "text-red-400",
        bgColor: "bg-red-400/10",
        borderColor: "border-red-400/20",
      },
      {
        icon: CheckCircle2,
        color: "text-emerald-400",
        bgColor: "bg-emerald-400/10",
        borderColor: "border-emerald-400/20",
      },
    ];
    return styles[index % styles.length];
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl transition-all duration-300 hover:border-slate-700/50 flex flex-col justify-between h-[482px]">
      <div>
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <Lightbulb className="text-blue-400 animate-pulse" size={22} />
          Recent Insights
        </h2>

        <div className="mt-5 space-y-4 overflow-y-auto max-h-[360px] pr-1">
          {recommendations.map((item, index) => {
            const style = getStyleForIndex(index);
            const Icon = style.icon;
            return (
              <div
                key={item.title + index}
                className={`flex gap-4 p-4 border rounded-xl bg-slate-950/40 hover:bg-slate-950/80 transition-all duration-300 ${style.borderColor} group`}
              >
                <div className={`p-2 rounded-lg self-start transition-transform duration-300 group-hover:scale-110 ${style.bgColor} ${style.color}`}>
                  <Icon size={20} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-white font-medium text-sm md:text-base transition-colors duration-300 group-hover:text-blue-200">
                    {item.title}
                  </h3>
                  <p className="text-slate-400 text-xs md:text-sm leading-relaxed">
                    {item.ai_reasoning}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}