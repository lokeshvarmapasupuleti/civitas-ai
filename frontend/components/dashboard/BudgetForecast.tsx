"use client";

import { motion } from "framer-motion";
import { Landmark, AlertCircle, Percent } from "lucide-react";

interface BudgetSplit {
  name: string;
  amount: string;
  percentage: number;
}

const BUDGET_SPLITS: BudgetSplit[] = [
  { name: "Public Works (PWD)", amount: "₹6,87,500", percentage: 55 },
  { name: "Health & Family Services", amount: "₹2,25,000", percentage: 18 },
  { name: "Sanitation & Cleaning", amount: "₹1,50,000", percentage: 12 },
  { name: "Transit & Traffic", amount: "₹1,12,500", percentage: 9 },
  { name: "Education & Literacy", amount: "₹75,000", percentage: 6 },
];

export default function BudgetForecast() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white border border-slate-200/65 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-[450px]"
    >
      <div>
        <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
          <Landmark className="text-indigo-650" size={16} />
          Budget Forecast
        </h2>
        <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Executive resource splits and emergency contingency forecasts</p>
      </div>

      {/* Main metrics overview */}
      <div className="grid grid-cols-3 gap-3 mt-4 text-center text-xs font-semibold">
        <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex flex-col items-center">
          <span className="text-indigo-600 font-extrabold text-xs mb-1">₹</span>
          <span className="text-[8px] text-slate-400 uppercase font-bold">Monthly Budget</span>
          <p className="text-slate-850 font-extrabold mt-0.5">₹1.25 Cr</p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex flex-col items-center">
          <AlertCircle size={14} className="text-rose-600 mb-1" />
          <span className="text-[8px] text-slate-400 uppercase font-bold">Contingency Buffer</span>
          <p className="text-slate-850 font-extrabold mt-0.5">₹34.0 L</p>
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-xl flex flex-col items-center">
          <Percent size={14} className="text-indigo-600 mb-1" />
          <span className="text-[8px] text-slate-400 uppercase font-bold">Infrastructure</span>
          <p className="text-slate-850 font-extrabold mt-0.5">55%</p>
        </div>
      </div>

      {/* Split Bars */}
      <div className="mt-5 space-y-3.5 flex-grow overflow-y-auto pr-1">
        <h3 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Department Allocations</h3>
        {BUDGET_SPLITS.map((split) => (
          <div key={split.name} className="space-y-1 text-xs font-semibold">
            <div className="flex justify-between items-center text-slate-700">
              <span className="font-bold text-slate-800 truncate max-w-[170px]">{split.name}</span>
              <span className="text-[10px] text-slate-500 font-bold">{split.amount} ({split.percentage}%)</span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-650 h-full rounded-full transition-all duration-500" 
                style={{ width: `${split.percentage}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
