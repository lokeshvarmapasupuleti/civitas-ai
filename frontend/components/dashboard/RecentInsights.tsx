"use client";

import { motion } from "framer-motion";
import { Sparkles, TrendingUp, AlertTriangle, CloudRain, CheckCircle2, Zap } from "lucide-react";

interface BriefItem {
  text: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}

const BRIEF_ITEMS: BriefItem[] = [
  {
    text: "Road infrastructure complaints increased by 18% in Ward 5.",
    icon: TrendingUp,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-100/50",
  },
  {
    text: "Ward 6 telemetry logs indicate critical sanitation overflow risks.",
    icon: AlertTriangle,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100/50",
  },
  {
    text: "Water supply pipeline load is expected to rise by 25% due to weather.",
    icon: CloudRain,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100/50",
  },
  {
    text: "Ward-level drainage maintenance backlog reduced by 12% today.",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100/50",
  },
  {
    text: "AI models forecast a spike in grid-level power load queries tomorrow.",
    icon: Zap,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100/50",
  },
];

export default function RecentInsights() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Sparkles className="text-indigo-650 animate-pulse" size={16} />
          {"Today's AI Executive Brief"}
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Automated machine learning intelligence summaries</p>
      </div>

      <div className="mt-5 flex-grow overflow-y-auto pr-1 space-y-3.5">
        {BRIEF_ITEMS.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              key={index}
              className={`flex gap-3.5 p-3.5 border border-slate-105 rounded-xl bg-white hover:bg-slate-50/50 transition duration-200 group cursor-pointer`}
            >
              <div className={`p-2.5 rounded-xl self-start transition-transform group-hover:scale-105 flex-shrink-0 ${item.bgColor} ${item.color}`}>
                <Icon size={16} />
              </div>
              <div className="text-xs text-slate-700 font-bold leading-relaxed">
                {item.text}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}