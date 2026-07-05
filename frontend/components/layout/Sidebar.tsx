"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  MessageSquare,
  BrainCircuit,
  MapPinned,
  BarChart3,
  CheckSquare,
} from "lucide-react";

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
    name: "AI Recommendations",
    href: "/recommendations",
    icon: BrainCircuit,
  },
  {
    name: "Demand Hotspots",
    href: "/analytics",
    icon: MapPinned,
  },
  {
    name: "Review Queue",
    href: "/review",
    icon: CheckSquare,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 h-screen bg-slate-900 border-r border-slate-800 p-6">
      <h1 className="text-2xl font-bold text-white">
        People's Priorities
      </h1>

      <p className="text-slate-400 text-sm mt-2">
        AI Planning Platform
      </p>

      <nav className="mt-10 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                pathname === item.href
                  ? "bg-blue-600 text-white"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <Icon size={20} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 border-t border-slate-800/60 pt-6">
        <Link href="/assistant">
          <button className={`w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-sm font-semibold rounded-xl shadow-lg transition duration-200 flex items-center justify-center gap-2 border border-indigo-400/20 ${
            pathname === "/assistant" ? "ring-2 ring-indigo-400 bg-indigo-700" : ""
          }`}>
            <BrainCircuit size={18} className="animate-pulse text-indigo-200" />
            AI Insight Assist
          </button>
        </Link>
      </div>
    </aside>
  );
}