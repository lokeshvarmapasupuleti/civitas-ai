"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { BrainCircuit } from "lucide-react";
import { motion } from "framer-motion";

export default function PriorityDistributionChart() {
  const data = [
    { name: "High Priority", value: 342, color: "#ef4444" },
    { name: "Medium Priority", value: 528, color: "#f59e0b" },
    { name: "Low Priority", value: 382, color: "#4f46e5" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.15 }}
      className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[360px]"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <BrainCircuit className="text-rose-600" size={16} />
          Priority Distribution
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Real-time status assessment by AI models</p>
      </div>

      <div className="h-[210px] w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={70}
              paddingAngle={4}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
              itemStyle={{ fontSize: "11px", fontWeight: "600" }}
            />
            <Legend
              verticalAlign="bottom"
              iconType="circle"
              iconSize={8}
              formatter={(value) => <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{value}</span>}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
