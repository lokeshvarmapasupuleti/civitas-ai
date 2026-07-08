"use client";

import { motion } from "framer-motion";
import { Clock, ShieldAlert, AlertTriangle, Sparkles, UserCheck, CheckCircle2 } from "lucide-react";

interface EventItem {
  time: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  color: string;
  bgColor: string;
}

const EVENTS: EventItem[] = [
  {
    time: "08:20 AM",
    title: "High Priority Road Damage Detected",
    description: "Ward 5 visual telemetry system reported a major route hazard.",
    icon: AlertTriangle,
    color: "text-rose-600",
    bgColor: "bg-rose-50 border-rose-100/50",
  },
  {
    time: "08:42 AM",
    title: "Water Supply Line Disruption",
    description: "Pressure anomaly logged by sensors in Ward 2 distribution hubs.",
    icon: ShieldAlert,
    color: "text-amber-600",
    bgColor: "bg-amber-50 border-amber-100/50",
  },
  {
    time: "09:05 AM",
    title: "AI Recommendation Generated",
    description: "Automated suggestion triggered for dispatching sanitation crew.",
    icon: Sparkles,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100/50",
  },
  {
    time: "09:12 AM",
    title: "Emergency Department Routed",
    description: "Water Supply division assigned to repair request #8204.",
    icon: UserCheck,
    color: "text-indigo-600",
    bgColor: "bg-indigo-50 border-indigo-100/50",
  },
  {
    time: "09:45 AM",
    title: "Complaint Status Resolved",
    description: "Task feedback validation uploaded by field engineer.",
    icon: CheckCircle2,
    color: "text-emerald-600",
    bgColor: "bg-emerald-50 border-emerald-100/50",
  },
];

export default function CriticalEventsTimeline() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Clock className="text-indigo-600" size={16} />
          Recent Critical Events
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Live streaming log of system events</p>
      </div>

      <div className="mt-5 flex-grow overflow-y-auto pr-1 space-y-4 relative pl-4 border-l border-slate-100">
        {EVENTS.map((event, index) => {
          return (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.08 }}
              key={event.time + index}
              className="relative space-y-1.5"
            >
              {/* Timeline Bullet */}
              <div className="absolute -left-[24px] top-1.5 flex h-4 w-4 items-center justify-center">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-600"></span>
                </span>
              </div>

              {/* Event Body */}
              <div className="flex justify-between items-start gap-2">
                <h3 className="text-xs font-extrabold text-slate-800 group-hover:text-indigo-600 transition">
                  {event.title}
                </h3>
                <span className="text-[9px] font-bold text-slate-400 whitespace-nowrap bg-slate-50 border border-slate-105 rounded-md px-1.5 py-0.5">
                  {event.time}
                </span>
              </div>
              <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">
                {event.description}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
