"use client";

import React from "react";
import { 
  ShieldCheck, AlertCircle, HelpCircle, X, Search 
} from "lucide-react";

// Border Radius, Spacing, and Shadow tokens are standard Tailwind classes:
// border-radius: rounded-xl
// spacing: p-4, p-6, space-y-4, gap-4
// shadows: shadow-xs, border border-slate-200/80

/* ==========================================================================
   1. PageHeader & SectionHeader
   ========================================================================== */
interface PageHeaderProps {
  title: string;
  subtitle: string;
  category?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, category, actions }: PageHeaderProps) {
  return (
    <div className="bg-white border-l-4 border-l-orange-500 border border-slate-200 p-5 rounded-xl shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div className="space-y-1">
        {category && (
          <div className="text-[9px] uppercase font-bold tracking-wider text-orange-600">{category}</div>
        )}
        <h1 className="text-xl font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
          <ShieldCheck className="text-indigo-650" size={20} />
          {title}
        </h1>
        <p className="text-xs text-slate-500 font-semibold">{subtitle}</p>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="border-b border-slate-200 pb-2 mb-4">
      <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{title}</h2>
      {subtitle && <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtitle}</p>}
    </div>
  );
}

/* ==========================================================================
   2. InfoCard & MetricCard & StatCard
   ========================================================================== */
export function InfoCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 shadow-xs ${className}`}>
      {children}
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  trend?: string;
  trendType?: "up" | "down" | "neutral";
}

export function MetricCard({ title, value, subtext, trend, trendType = "neutral" }: MetricCardProps) {
  const trendColor = trendType === "up" 
    ? "text-emerald-600" 
    : trendType === "down" 
    ? "text-red-600" 
    : "text-slate-500";

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-1.5">
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
      <div className="flex items-baseline justify-between">
        <p className="text-2xl font-extrabold text-slate-800 tracking-tight">{value}</p>
        {trend && <span className={`text-[10px] font-bold ${trendColor}`}>{trend}</span>}
      </div>
      {subtext && <p className="text-[10px] text-slate-400 font-semibold">{subtext}</p>}
    </div>
  );
}

export function GovernmentStatCard({ title, value, subtext }: { title: string; value: string | number; subtext: string }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">{title}</p>
      <p className="text-lg font-extrabold text-slate-800 mt-1">{value}</p>
      <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{subtext}</p>
    </div>
  );
}

/* ==========================================================================
   3. StatusBadge & PriorityBadge
   ========================================================================== */
export function StatusBadge({ status }: { status: string }) {
  let colors = "bg-slate-50 border-slate-200 text-slate-655";
  if (status === "Completed" || status === "Resolved") {
    colors = "bg-emerald-50 border-emerald-100 text-emerald-700";
  } else if (status === "In Progress" || status === "Approved") {
    colors = "bg-indigo-50 border-indigo-100 text-indigo-755";
  } else if (status === "Pending") {
    colors = "bg-amber-50 border-amber-100 text-amber-700";
  } else if (status === "Rejected") {
    colors = "bg-red-50 border-red-100 text-red-750";
  }

  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${colors}`}>
      {status}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  let colors = "bg-slate-50 border-slate-200 text-slate-655";
  if (priority.toLowerCase() === "critical" || priority.toLowerCase() === "high" || priority.toLowerCase() === "emergency") {
    colors = "bg-red-50 border-red-100 text-red-700";
  } else if (priority.toLowerCase() === "medium" || priority.toLowerCase() === "concerned") {
    colors = "bg-amber-50 border-amber-100 text-amber-705";
  } else {
    colors = "bg-slate-50 border-slate-200 text-slate-550";
  }

  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-extrabold border uppercase tracking-wider ${colors}`}>
      {priority}
    </span>
  );
}

/* ==========================================================================
   4. LoadingSkeleton & EmptyState
   ========================================================================== */
export function LoadingSkeleton({ className = "h-40" }: { className?: string }) {
  return (
    <div className={`bg-white border border-slate-200 rounded-xl p-5 space-y-4 animate-pulse shadow-xs ${className}`}>
      <div className="h-4 bg-slate-100 rounded w-1/4"></div>
      <div className="space-y-2">
        <div className="h-3 bg-slate-100 rounded w-full"></div>
        <div className="h-3 bg-slate-100 rounded w-5/6"></div>
      </div>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-12 text-center text-slate-450 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col items-center justify-center space-y-2">
      <HelpCircle size={24} className="text-slate-300" />
      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-slate-450 font-semibold">{description}</p>
    </div>
  );
}

/* ==========================================================================
   5. SearchBar & FilterBar & ActionToolbar
   ========================================================================== */
interface SearchBarProps {
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
}

export function SearchBar({ value, onChange, placeholder = "Search logs..." }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-850 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
      />
    </div>
  );
}

export function FilterBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50/50 p-4 border border-slate-150 rounded-xl">
      {children}
    </div>
  );
}

export function ActionToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-slate-500">
      {children}
    </div>
  );
}

/* ==========================================================================
   6. GovernmentButton & Form Fields
   ========================================================================== */
interface GovernmentButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  children: React.ReactNode;
}

export function GovernmentButton({ variant = "secondary", children, className = "", ...props }: GovernmentButtonProps) {
  let styleClasses = "border border-slate-250 hover:bg-slate-50 text-slate-655";
  if (variant === "primary") {
    styleClasses = "bg-indigo-650 hover:bg-indigo-600 text-white shadow-xs border border-indigo-700";
  } else if (variant === "danger") {
    styleClasses = "bg-red-50 border border-red-150 hover:bg-red-100/50 text-red-700";
  }

  return (
    <button
      className={`px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-lg transition active:scale-97 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed ${styleClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface GovernmentFormFieldProps {
  label: string;
  error?: string;
  children: React.ReactNode;
}

export function GovernmentFormField({ label, error, children }: GovernmentFormFieldProps) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-bold uppercase tracking-wider text-slate-450">{label}</label>
      {children}
      {error && (
        <p className="text-[10px] text-red-600 font-semibold flex items-center gap-1">
          <AlertCircle size={10} />
          {error}
        </p>
      )}
    </div>
  );
}

/* ==========================================================================
   7. TimelineCard & InfoPanel
   ========================================================================== */
export function TimelineCard({ step, title, subtext, status }: { step: string; title: string; subtext: string; status: "completed" | "active" | "pending" }) {
  const dotColor = status === "completed" 
    ? "bg-emerald-500" 
    : status === "active" 
    ? "bg-indigo-600 animate-pulse" 
    : "bg-slate-200";

  return (
    <div className="relative pl-4 space-y-0.5">
      <span className={`absolute left-0 top-1 w-2.5 h-2.5 rounded-full ring-4 ring-white ${dotColor}`}></span>
      <span className="text-[8px] text-slate-400 font-extrabold uppercase">{step}</span>
      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{title}</h4>
      <p className="text-[10px] text-slate-450 font-semibold leading-relaxed">{subtext}</p>
    </div>
  );
}

export function InfoPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-slate-50 border border-slate-150 p-4 rounded-xl space-y-3">
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block border-b border-slate-200 pb-1.5">{title}</span>
      <div className="text-xs font-semibold text-slate-700 space-y-2">{children}</div>
    </div>
  );
}

/* ==========================================================================
   8. GovernmentTable & ConfirmationDialog & Dialogs
   ========================================================================== */
interface GovernmentTableProps {
  headers: string[];
  children: React.ReactNode;
}

export function GovernmentTable({ headers, children }: GovernmentTableProps) {
  return (
    <div className="overflow-x-auto border border-slate-200 rounded-xl">
      <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
        <thead>
          <tr className="bg-slate-50 text-slate-400 text-[9px] font-extrabold uppercase tracking-wider border-b border-slate-200">
            {headers.map((h, i) => (
              <th key={i} className="px-5 py-3">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {children}
        </tbody>
      </table>
    </div>
  );
}

export function ConfirmationDialog({ isOpen, title, subId, onClose, onConfirm, children }: {
  isOpen: boolean;
  title: string;
  subId?: string;
  onClose: () => void;
  onConfirm: () => void;
  children?: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-tight flex items-center gap-1.5">
              <ShieldCheck className="text-indigo-650" size={16} />
              {title}
            </h3>
            {subId && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Ref Code: {subId}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition p-1 hover:bg-slate-100 rounded">
            <X size={16} />
          </button>
        </div>

        {children && <div className="space-y-3">{children}</div>}

        <div className="flex gap-2 justify-end pt-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-lg transition shadow-md"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export function GovernmentDialog({ isOpen, title, onClose, children }: {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl flex flex-col">
        <div className="flex justify-between items-center p-5 border-b border-slate-100 bg-slate-50/50">
          <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">{title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 hover:bg-slate-100 rounded transition">
            <X size={18} />
          </button>
        </div>
        <div className="p-5 space-y-4 overflow-y-auto max-h-[70vh] text-xs">
          {children}
        </div>
      </div>
    </div>
  );
}
