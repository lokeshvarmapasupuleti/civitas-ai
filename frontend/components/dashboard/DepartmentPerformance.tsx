"use client";

import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

interface DepartmentMetric {
  name: string;
  completion: number;
  avgTime: string;
  workload: number;
  efficiency: number;
}

const DEPARTMENTS: DepartmentMetric[] = [
  { name: "Roads & Highways (PWD)", completion: 91, avgTime: "8.4h", workload: 14, efficiency: 94 },
  { name: "Water Supply & Sewerage", completion: 86, avgTime: "12.0h", workload: 8, efficiency: 88 },
  { name: "Sanitation & Solid Waste", completion: 95, avgTime: "4.2h", workload: 22, efficiency: 97 },
  { name: "Electricity & Lighting", completion: 89, avgTime: "6.5h", workload: 11, efficiency: 91 },
  { name: "Traffic Management", completion: 92, avgTime: "5.8h", workload: 6, efficiency: 93 },
  { name: "Healthcare Services", completion: 96, avgTime: "3.5h", workload: 5, efficiency: 98 },
  { name: "Public Education Services", completion: 88, avgTime: "24.0h", workload: 3, efficiency: 86 },
];

export default function DepartmentPerformance() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.18 }}
      className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Building2 className="text-indigo-650" size={16} />
          Department Performance
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Service response metrics and workload weights</p>
      </div>

      <div className="mt-5 flex-grow overflow-y-auto pr-1 space-y-3.5">
        {DEPARTMENTS.map((dept) => (
          <div key={dept.name} className="space-y-1 text-xs font-semibold">
            {/* Header info */}
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-bold text-slate-800 truncate max-w-[180px]">{dept.name}</span>
              <span className="text-[10px] text-indigo-600 font-extrabold">{dept.completion}% Complete</span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${dept.completion}%` }}
              ></div>
            </div>

            {/* Sub telemetry details */}
            <div className="flex justify-between items-center text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              <span>Avg SLA: {dept.avgTime}</span>
              <span>Workload: {dept.workload} tasks</span>
              <span className="text-emerald-650">AI Efficiency: {dept.efficiency}%</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
