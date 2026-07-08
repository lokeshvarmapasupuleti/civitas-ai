"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  MessageSquare,
  BrainCircuit,
  MapPinned,
  CheckSquare,
  ShieldCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  Server,
  Activity
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const menuItems = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Citizen Requests",
    href: "/submit",
    icon: MessageSquare,
  },
  {
    name: "Review Queue",
    href: "/review",
    icon: CheckSquare,
  },
  {
    name: "AI Recommendations",
    href: "/recommendations",
    icon: BrainCircuit,
  },
  {
    name: "Demand Hotspots",
    href: "/analytics",
    icon: MapPinned,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeWorkspace, setActiveWorkspace] = useState("Legislative HQ");
  const [presentationActive, setPresentationActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      const handlePresentation = () => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      };
      window.addEventListener("civitas_presentation_change", handlePresentation);
      return () => window.removeEventListener("civitas_presentation_change", handlePresentation);
    }
  }, []);

  if (presentationActive) {
    return null;
  }

  return (
    <motion.aside
      animate={{ width: isCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="h-screen bg-slate-900 border-r border-slate-800 p-4 flex flex-col justify-between sticky top-0 z-50 flex-shrink-0"
    >
      <div className="space-y-6">
        {/* Brand Header / Workspace Switcher */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mt-2">
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-2.5"
              >
                <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h1 className="text-xs font-extrabold text-white tracking-tight leading-none">Civitas AI</h1>
                  <select
                    value={activeWorkspace}
                    onChange={(e) => setActiveWorkspace(e.target.value)}
                    className="text-[9px] font-bold text-slate-450 uppercase tracking-wider bg-transparent border-0 p-0 pr-4 focus:ring-0 mt-1 cursor-pointer focus:outline-none"
                  >
                    <option value="Legislative HQ" className="bg-slate-900 text-white">Legislative HQ</option>
                    <option value="Municipal Div" className="bg-slate-900 text-white">Municipal Div</option>
                  </select>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {isCollapsed && (
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10 mx-auto">
              <ShieldCheck size={18} />
            </div>
          )}

          {/* Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 bg-slate-800 text-slate-400 hover:text-white rounded-lg border border-slate-700/50 hover:bg-slate-700 transition cursor-pointer"
          >
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1.5 pt-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 relative group cursor-pointer ${
                  isActive
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/15 border border-indigo-500/20"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white border border-transparent"
                }`}
              >
                <Icon size={16} className={`transition-transform duration-350 ${isActive ? "text-white animate-pulse" : "text-slate-500 group-hover:text-white group-hover:scale-105"}`} />
                {!isCollapsed && <span className="truncate">{item.name}</span>}
                {isActive && !isCollapsed && (
                  <span className="absolute right-3 w-1.5 h-1.5 bg-white rounded-full"></span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Status Card */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        {/* AI Status Card */}
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-slate-955 border border-slate-800 rounded-xl p-3.5 space-y-2.5"
            >
              <div className="flex items-center gap-2 text-[9px] uppercase font-bold text-slate-450">
                <Server size={12} className="text-emerald-500 animate-pulse" />
                AI Inference Engine
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-350">
                <span>Core Status:</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  <Activity size={10} className="animate-ping" />
                  Active
                </span>
              </div>
              <div className="flex justify-between items-center text-[10px] font-bold text-slate-350">
                <span>Confidence:</span>
                <span className="text-indigo-500">99.8% Acc</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Link href="/assistant">
          <button className={`w-full py-2.5 px-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-[10px] font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/10 transition duration-300 flex items-center justify-center gap-2 border border-indigo-400/20 cursor-pointer ${
            pathname === "/assistant" ? "ring-2 ring-indigo-400 bg-indigo-700" : ""
          }`}>
            <BrainCircuit size={14} className="animate-pulse text-indigo-200" />
            {!isCollapsed && <span>AI Insight Assist</span>}
          </button>
        </Link>

        <Link
          href="#"
          className="flex items-center gap-3 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all duration-300"
        >
          <Settings size={14} />
          {!isCollapsed && <span>Settings</span>}
        </Link>
      </div>
    </motion.aside>
  );
}