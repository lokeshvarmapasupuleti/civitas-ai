"use client";

import { useEffect, useState } from "react";
import { MessageSquare, BrainCircuit, AlertTriangle, ShieldCheck, Clock3, Smile } from "lucide-react";
import { api } from "@/lib/api";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";

function AnimatedNumber({ value, suffix = "", decimals = 0 }: { value: number; suffix?: string; decimals?: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, (latest) => {
    return latest.toFixed(decimals).toLocaleString() + suffix;
  });

  useEffect(() => {
    const controls = animate(count, value, { duration: 1.2, ease: "easeOut" });
    return controls.stop;
  }, [value, count, decimals]);

  return <motion.span>{rounded}</motion.span>;
}

const Sparkline = ({ values, strokeColor }: { values: number[]; strokeColor: string }) => {
  const points = values.map((val, i) => `${(i * 12).toFixed(1)},${(25 - (val / 100) * 20).toFixed(1)}`).join(" ");
  return (
    <svg className="w-14 h-6 overflow-visible" viewBox="0 0 60 25">
      <polyline
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
};

export default function KpiCards() {
  const [kpis, setKpis] = useState({
    citizen_requests: 0,
    ai_recommendations: 0,
    demand_hotspots: 0,
    pending_reviews: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [presentationActive, setPresentationActive] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const loadKpis = () => {
    setLoading(true);
    api.getAnalytics()
      .then((data) => {
        const stats = { 
          ...data.kpis,
          citizen_requests: data.kpis.citizen_requests + (typeof window !== "undefined" && localStorage.getItem("civitas_demo_mode") === "true" ? 1 : 0),
          pending_reviews: data.kpis.pending_reviews + (typeof window !== "undefined" && localStorage.getItem("civitas_demo_mode") === "true" ? 1 : 0)
        };
        setKpis(stats);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading KPIs:", err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadKpis();
    if (typeof window !== "undefined") {
      const handleDemo = () => loadKpis();
      window.addEventListener("civitas_demo_change", handleDemo);
      
      setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      const handlePresentation = () => {
        setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      };
      window.addEventListener("civitas_presentation_change", handlePresentation);

      return () => {
        window.removeEventListener("civitas_demo_change", handleDemo);
        window.removeEventListener("civitas_presentation_change", handlePresentation);
      };
    }
  }, []);

  useEffect(() => {
    if (presentationActive) {
      const interval = setInterval(() => {
        setFocusedIndex(prev => (prev + 1) % 6);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [presentationActive]);

  const cards = [
    {
      title: "Total Requests",
      value: kpis.citizen_requests,
      decimals: 0,
      suffix: "",
      icon: MessageSquare,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-100/50",
      trend: "+12.4%",
      isPositive: true,
      sparklineData: [25, 45, 30, 65, 55, 80],
      compareText: "vs last Tuesday"
    },
    {
      title: "Critical Requests",
      value: Math.round(kpis.citizen_requests * 0.28),
      decimals: 0,
      suffix: "",
      icon: AlertTriangle,
      color: "text-rose-600",
      bgColor: "bg-rose-50 border-rose-100/50",
      trend: "-5.2%",
      isPositive: true, // Lower is positive for critical issues
      sparklineData: [75, 60, 50, 42, 38, 28],
      compareText: "vs last week"
    },
    {
      title: "AI Accuracy",
      value: 96.4,
      decimals: 1,
      suffix: "%",
      icon: BrainCircuit,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-100/50",
      trend: "+0.8%",
      isPositive: true,
      sparklineData: [92, 93, 95, 94, 96, 96.4],
      compareText: "vs past month"
    },
    {
      title: "Resolution Rate",
      value: 92.1,
      decimals: 1,
      suffix: "%",
      icon: ShieldCheck,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-100/50",
      trend: "+1.5%",
      isPositive: true,
      sparklineData: [88, 89, 91, 90, 92, 92.1],
      compareText: "vs last week"
    },
    {
      title: "Average response",
      value: 4.2,
      decimals: 1,
      suffix: "h",
      icon: Clock3,
      color: "text-amber-600",
      bgColor: "bg-amber-50 border-amber-100/50",
      trend: "-18.3%",
      isPositive: true, // Faster is better
      sparklineData: [6.8, 5.5, 5.0, 4.8, 4.5, 4.2],
      compareText: "vs last week"
    },
    {
      title: "Satisfaction",
      value: 94.0,
      decimals: 0,
      suffix: "%",
      icon: Smile,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50 border-indigo-100/50",
      trend: "+2.1%",
      isPositive: true,
      sparklineData: [91, 92, 93, 92, 94, 94],
      compareText: "vs last month"
    }
  ];

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-655 text-sm">
        Failed to load dashboard metrics from backend API. Please check server connection.
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 transition-all duration-300 ${presentationActive ? 'gap-8' : 'gap-6'}`}>
      {cards.map((card, i) => {
        const Icon = card.icon;
        const strokeColor = card.title.includes("Critical") ? "#F43F5E" : card.title.includes("Resolution") ? "#10B981" : "#4F46E5";

        const isFocused = presentationActive && focusedIndex === i;

        return (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.06 }}
            key={card.title}
            className={`bg-white border rounded-2xl transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 shadow-sm flex flex-col justify-between ${
              presentationActive ? 'p-7' : 'p-5'
            } ${
              isFocused
                ? 'border-indigo-600 ring-4 ring-indigo-650/15 scale-[1.04] bg-indigo-50/5 z-10'
                : 'border-slate-200/65'
            }`}
          >
            {/* Header info */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-405 text-[10px] font-extrabold uppercase tracking-wider">
                  {card.title}
                </p>

                <h2 className="text-2xl font-extrabold text-slate-800 mt-2.5 tracking-tight">
                  {loading ? (
                    "..."
                  ) : (
                    <AnimatedNumber value={card.value} suffix={card.suffix} decimals={card.decimals} />
                  )}
                </h2>
              </div>

              <div className={`p-2 rounded-xl border ${card.bgColor}`}>
                <Icon
                  size={16}
                  className={card.color}
                />
              </div>
            </div>

            {/* Sparkline & Trend */}
            <div className="flex justify-between items-end pt-1">
              <div className="flex flex-col">
                <span className={`text-[10px] font-extrabold flex items-center ${
                  card.isPositive ? "text-emerald-650" : "text-amber-500"
                }`}>
                  {card.trend}
                </span>
                <span className="text-[9px] text-slate-400 font-semibold mt-0.5 whitespace-nowrap">
                  {card.compareText}
                </span>
              </div>

              <div className="opacity-80">
                <Sparkline values={card.sparklineData} strokeColor={strokeColor} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}