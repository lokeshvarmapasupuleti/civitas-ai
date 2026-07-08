"use client";

import { ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

const wardData = [
  { name: "Ward 1 - East Zone", requests: 184, resolved: 165, rate: "89.6%", speed: "12.4h" },
  { name: "Ward 2 - West Zone", requests: 142, resolved: 122, rate: "85.9%", speed: "14.2h" },
  { name: "Ward 5 - Central", requests: 218, resolved: 198, rate: "90.8%", speed: "10.8h" },
  { name: "Ward 7 - Suburbs", requests: 94, resolved: 78, rate: "83.0%", speed: "16.5h" },
  { name: "Ward 10 - Tech Park", requests: 112, resolved: 104, rate: "92.8%", speed: "9.2h" },
];

export default function WardPerformanceTable() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[360px]"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <ShieldCheck className="text-indigo-600" size={16} />
          Ward Performance
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Efficiency metrics of development projects</p>
      </div>

      <div className="overflow-y-auto mt-4 flex-grow pr-1">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-extrabold uppercase tracking-wider text-[9px] pb-2">
              <th className="py-2">Ward Name</th>
              <th className="py-2 text-center">Requests</th>
              <th className="py-2 text-center">Resolved</th>
              <th className="py-2 text-center">Resolution</th>
              <th className="py-2 text-center">Avg Speed</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 font-semibold text-slate-700">
            {wardData.map((ward) => (
              <tr key={ward.name} className="hover:bg-slate-50/50 transition">
                <td className="py-2.5 font-bold text-slate-800">{ward.name}</td>
                <td className="py-2.5 text-center text-slate-500">{ward.requests}</td>
                <td className="py-2.5 text-center text-slate-500">{ward.resolved}</td>
                <td className="py-2.5 text-center font-bold text-emerald-600">{ward.rate}</td>
                <td className="py-2.5 text-center font-bold text-indigo-600">{ward.speed}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
