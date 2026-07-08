"use client";

import MainLayout from "@/components/layout/MainLayout";
import { 
  AreaChart, Area, 
  BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line 
} from "recharts";
import { 
  Download, Calendar, BarChart3, TrendingUp, BrainCircuit, ShieldAlert, Award,
  Users, DollarSign, Clock, HelpCircle, Activity, Lightbulb, MapPin, Compass,
  FileSpreadsheet, FileText, CheckCircle2, Printer, Loader2, AlertCircle, FileDown
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const GISIntelligenceMap = dynamic(() => import("./GISIntelligenceMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 h-[520px] flex items-center justify-center animate-pulse shadow-sm">
      <div className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">Initializing Spatial Layers...</div>
    </div>
  ),
});

const trendData = [
  { month: "Jan", requests: 120, predictions: 110 },
  { month: "Feb", requests: 150, predictions: 145 },
  { month: "Mar", requests: 180, predictions: 190 },
  { month: "Apr", requests: 220, predictions: 240 },
  { month: "May", requests: 310, predictions: 290 },
  { month: "Jun", requests: 400, predictions: 380 },
];

const priorityData = [
  { name: "High", value: 342, count: 184 },
  { name: "Medium", value: 528, count: 290 },
  { name: "Low", value: 382, count: 122 },
];

const wardData = [
  { name: "Ward 1", resolved: 165, pending: 19 },
  { name: "Ward 2", resolved: 122, pending: 20 },
  { name: "Ward 5", resolved: 198, pending: 20 },
  { name: "Ward 7", resolved: 78, pending: 16 },
  { name: "Ward 10", resolved: 104, pending: 8 },
];

const WARD_METRICS: Record<string, {
  population: string;
  complaints: number;
  priorityIndex: number;
  resolved: number;
  pending: number;
  budget: string;
  speed: string;
  satisfaction: number;
}> = {
  "Ward 5 - Central": { population: "240K", complaints: 218, priorityIndex: 84, resolved: 91, pending: 9, budget: "$45K", speed: "10.8h", satisfaction: 92 },
  "Ward 2 - West Zone": { population: "185K", complaints: 142, priorityIndex: 68, resolved: 86, pending: 14, budget: "$28K", speed: "14.2h", satisfaction: 89 },
  "Ward 1 - East Zone": { population: "160K", complaints: 184, priorityIndex: 79, resolved: 90, pending: 10, budget: "$32K", speed: "12.4h", satisfaction: 87 },
  "Ward 7 - Suburbs": { population: "120K", complaints: 94, priorityIndex: 52, resolved: 83, pending: 17, budget: "$15K", speed: "16.5h", satisfaction: 82 },
  "Ward 10 - Tech Park": { population: "150K", complaints: 112, priorityIndex: 72, resolved: 93, pending: 7, budget: "$38K", speed: "9.2h", satisfaction: 93 },
};

const CircularProgress = ({ percent, label, strokeColor }: { percent: number; label: string; strokeColor: string }) => {
  const radius = 24;
  const strokeDasharray = 2 * Math.PI * radius;
  const strokeDashoffset = strokeDasharray - (strokeDasharray * percent) / 100;
  return (
    <div className="flex flex-col items-center justify-center space-y-1">
      <div className="relative w-14 h-14 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90">
          <circle cx="28" cy="28" r={radius} className="stroke-slate-100" strokeWidth="3" fill="transparent" />
          <circle 
            cx="28" 
            cy="28" 
            r={radius} 
            className="transition-all duration-500" 
            stroke={strokeColor} 
            strokeWidth="3" 
            fill="transparent" 
            strokeDasharray={strokeDasharray} 
            strokeDashoffset={strokeDashoffset} 
            strokeLinecap="round" 
          />
        </svg>
        <span className="absolute text-[9px] font-extrabold text-slate-800">{percent}%</span>
      </div>
      <span className="text-[8px] uppercase font-bold text-slate-400 text-center whitespace-nowrap">{label}</span>
    </div>
  );
};

export default function AnalyticsPage() {
  const [exporting, setExporting] = useState(false);
  const [timeframe, setTimeframe] = useState("week"); // today | yesterday | week | month
  const [selectedWardName, setSelectedWardName] = useState("Ward 5 - Central");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Advanced Report Export States
  const [selectedReport, setSelectedReport] = useState("ward_summary");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [generatingReport, setGeneratingReport] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const [showExportModal, setShowExportModal] = useState(false);

  const activeWard = WARD_METRICS[selectedWardName] || WARD_METRICS["Ward 5 - Central"];

  const handleExport = () => {
    setShowExportModal(true);
  };

  const handleExportSubmit = () => {
    setGeneratingReport(true);
    setGenerationStep(0);

    const timer1 = setTimeout(() => setGenerationStep(1), 700);
    const timer2 = setTimeout(() => setGenerationStep(2), 1400);
    const timer3 = setTimeout(() => setGenerationStep(3), 2100);
    const timer4 = setTimeout(() => {
      setGeneratingReport(false);
      setShowExportModal(false);

      // Execute local download
      const filename = `civitas_${selectedReport}_report.${exportFormat}`;
      let content = "";
      let mimeType = "text/csv;charset=utf-8,";

      if (selectedReport === "ward_summary") {
        if (exportFormat === "csv") {
          content = "Ward,Population,Total Complaints,Resolved Complaints,Pending Complaints,Resolution Rate\n" +
                    "Ward 1 - East Zone,160K,184,174,10,94.5%\n" +
                    "Ward 2 - West Zone,185K,142,128,14,90.1%\n" +
                    "Ward 5 - Central,240K,218,209,9,95.8%\n" +
                    "Ward 7 - Suburbs,120K,94,77,17,81.9%\n" +
                    "Ward 10 - Tech Park,150K,112,105,7,93.7%\n";
        } else if (exportFormat === "xlsx") {
          mimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,";
          content = "Ward,Population,Total Complaints,Resolved Complaints,Pending Complaints,Resolution Rate\n" +
                    "Ward 1 - East Zone,160K,184,174,10,94.5%\n" +
                    "Ward 2 - West Zone,185K,142,128,14,90.1%\n" +
                    "Ward 5 - Central,240K,218,209,9,95.8%\n" +
                    "Ward 7 - Suburbs,120K,94,77,17,81.9%\n" +
                    "Ward 10 - Tech Park,150K,112,105,7,93.7%\n";
        } else {
          mimeType = "application/pdf,";
          content = "GOVERNMENT OF INDIA - MINISTRY OF HOUSING & URBAN AFFAIRS\n" +
                    "NIC MUNICIPAL TELEMETRY REPORT: WARD SUMMARY AUDIT\n" +
                    "----------------------------------------------------\n" +
                    "Report Generated On: 2026-07-07\n" +
                    "Digital Seal Hash: NIC-DS-88A92F10B24\n\n" +
                    "Ward | Population | Priority Signals | Resolved | Pending | Rate\n" +
                    "Ward 1 | 160K | 184 | 174 | 10 | 94.5%\n" +
                    "Ward 2 | 185K | 142 | 128 | 14 | 90.1%\n" +
                    "Ward 5 | 240K | 218 | 209 | 9  | 95.8%\n" +
                    "Ward 7 | 120K | 94  | 77  | 17 | 81.9%\n" +
                    "Ward 10| 150K | 112 | 105 | 7  | 93.7%\n";
        }
      } else if (selectedReport === "dept_performance") {
        if (exportFormat === "csv" || exportFormat === "xlsx") {
          content = "Department,Officer-in-Charge,Delivery Compliance Rate,Pending Priorities,Average Delivery Time\n" +
                    "Public Works Department (PWD),Er. Rajesh Kumar,91.2%,24,14.2 hrs\n" +
                    "Water Supply & Sewerage Board,Er. Sandeep N.,88.4%,19,16.5 hrs\n" +
                    "Health & Sanitation Division,Dr. Amit Sharma,95.6%,12,9.2 hrs\n" +
                    "Electricity & Streetlighting Dept,Er. Priya Verma,92.8%,18,11.5 hrs\n";
        } else {
          mimeType = "application/pdf,";
          content = "GOVERNMENT OF INDIA - SMART CITIES MISSION TELEMETRY\n" +
                    "OFFICIAL DELIVERY COMPLIANCE REPORT: DEPARTMENT PERFORMANCE\n" +
                    "------------------------------------------------------\n" +
                    "Report Generated On: 2026-07-07\n" +
                    "Digital Seal Hash: NIC-DS-9904F2E4A71\n\n" +
                    "Department | Officer | Delivery Compliance | Pending | Avg Delivery\n" +
                    "PWD | Er. Rajesh Kumar | 91.2% | 24 | 14.2 hrs\n" +
                    "Water Supply | Er. Sandeep N. | 88.4% | 19 | 16.5 hrs\n" +
                    "Sanitation | Dr. Amit Sharma | 95.6% | 12 | 9.2 hrs\n" +
                    "Electricity | Er. Priya Verma | 92.8% | 18 | 11.5 hrs\n";
        }
      } else if (selectedReport === "monthly_priority") {
        if (exportFormat === "csv" || exportFormat === "xlsx") {
          content = "Month,Priority Signals Received,Resolved,Average Delivery Speed,Citizen Rating\n" +
                    "May 2026,310,290,11.2 hrs,4.4/5\n" +
                    "June 2026,400,380,10.1 hrs,4.5/5\n" +
                    "July 2026,1420,1336,4.2 hrs,4.7/5\n";
        } else {
          mimeType = "application/pdf,";
          content = "GOVERNMENT OF INDIA - DIGITAL INDIA PLATFORM\n" +
                    "MONTHLY PRIORITY DELIVERY PERFORMANCE REPORT\n" +
                    "---------------------------------------------\n" +
                    "Report Generated On: 2026-07-07\n" +
                    "Digital Seal Hash: NIC-DS-22F882C10E8\n\n" +
                    "Month | Priority Signals | Resolved | Avg Speed | Satisfaction\n" +
                    "May 2026 | 310 | 290 | 11.2 hrs | 4.4/5\n" +
                    "June 2026 | 400 | 380 | 10.1 hrs | 4.5/5\n" +
                    "July 2026 | 1420 | 1336 | 4.2 hrs | 4.7/5\n";
        }
      } else if (selectedReport === "ai_decision") {
        if (exportFormat === "csv" || exportFormat === "xlsx") {
          content = "Priority ID,AI Prediction,Assigned Department,Confidence,Routing Path,Digital Verification\n" +
                    "PR-2026-0812,Road Repair,PWD,98.4%,Auto-Route,Approved\n" +
                    "PR-2026-0925,Water Supply,Water Supply Board,96.2%,Auto-Route,Approved\n" +
                    "PR-2026-1044,Sanitation,Health & Sanitation,94.5%,Manual Audited,Verified\n";
        } else {
          mimeType = "application/pdf,";
          content = "GOVERNMENT OF INDIA - CIVITAS AI DECISION CENTRE\n" +
                    "AI CLASSIFICATION & DECISION COMPLIANCE AUDIT SHEET\n" +
                    "--------------------------------------------------\n" +
                    "Report Generated On: 2026-07-07\n" +
                    "Digital Seal Hash: NIC-DS-44E992A10B5\n\n" +
                    "Ticket | Category | Department | Conf | Path | Verification\n" +
                    "PR-0812 | Road Repair | PWD | 98.4% | Auto | Approved\n" +
                    "PR-0925 | Water Supply | Water Supply | 96.2% | Auto | Approved\n" +
                    "PR-1044 | Sanitation | Sanitation | 94.5% | Manual | Verified\n";
        }
      } else {
        if (exportFormat === "csv" || exportFormat === "xlsx") {
          content = "Dashboard KPI,Value,Target Status,Reference Standard\n" +
                    "Priority Signals Received,1420,Normal,Smart Cities Index\n" +
                    "Delivery Rate,92.1%,On Track,Urban Development Registry\n" +
                    "AI Classification Accuracy,96.4%,Exceeded Target,NIC Digital Core\n";
        } else {
          mimeType = "application/pdf,";
          content = "GOVERNMENT OF INDIA - NATIONAL MUNICIPAL TELEMETRY\n" +
                    "EXECUTIVE DASHBOARD SUMMARY AND PERFORMANCE AUDIT\n" +
                    "-------------------------------------------------\n" +
                    "Report Generated On: 2026-07-07\n" +
                    "Digital Seal Hash: NIC-DS-33D881B20A1\n\n" +
                    "Parameter | Value | Status | Reference Standard\n" +
                    "Priority Signals | 1420 | Normal | Smart Cities Index\n" +
                    "Delivery Rate | 92.1% | On Track | Urban Development Reg\n" +
                    "AI Accuracy | 96.4% | Exceeded | NIC Digital Core\n";
        }
      }

      const encodedUri = encodeURI("data:" + mimeType + content);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 2800);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto">
        
        {/* Title and Controls Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold text-indigo-655 tracking-wider">
              <Compass size={12} className="text-indigo-600 animate-spin-slow" />
              Priority Hotspot Intelligence Center
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight mt-1">
              Priorities & Hotspot Dashboard
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Live hotspot signals, recurring development themes, and ward-level planning gaps.
            </p>
          </div>

          <div className="flex items-center gap-3.5 w-full md:w-auto">
            {/* Filter */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-2.5 text-xs font-semibold text-slate-650">
              <Calendar size={14} className="text-slate-400" />
              <span>Real-time stream feed</span>
            </div>

            {/* Export */}
            <button
              onClick={handleExport}
              disabled={exporting}
              className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition duration-200 active:scale-95 shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              {exporting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Exporting...</span>
                </>
              ) : (
                <>
                  <Download size={14} />
                  <span>Export GIS Report</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Filters control row */}
        <div className="bg-white border border-slate-200/60 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
          <span className="text-[10px] font-bold text-slate-405 uppercase tracking-wider">Filters:</span>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
          >
            <option value="">All Categories</option>
            <option value="Road Repair">Road Repair</option>
            <option value="Water Supply">Water Supply</option>
            <option value="Sanitation">Sanitation</option>
            <option value="Street Lighting">Street Lighting</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
          >
            <option value="">All Priorities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition duration-200"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
          </select>
        </div>

        {/* Main GIS Split Grid (70% Map / 30% Sidebar) */}
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
          
          {/* Left Column (70% Width) - Map */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            
            <div className="relative">
              <GISIntelligenceMap 
                timeframe={timeframe} 
                onWardSelect={(name) => setSelectedWardName(name)}
                filters={{
                  category: filterCategory,
                  priority: filterPriority,
                  status: filterStatus
                }}
              />
              
              {/* Floating Time Machine Slider */}
              <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md border border-slate-200/80 px-4 py-3 rounded-2xl shadow-lg z-[1000] flex items-center justify-between gap-4">
                <span className="text-[9px] font-bold text-indigo-700 uppercase tracking-wider whitespace-nowrap">Time Machine Slider:</span>
                <div className="flex-grow flex justify-between items-center relative px-2.5">
                  <div className="absolute left-2.5 right-2.5 h-0.5 bg-slate-200 top-1/2 -translate-y-1/2"></div>
                  
                  {["today", "yesterday", "week", "month"].map((t) => (
                    <button
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`relative z-10 px-2.5 py-1 rounded-md text-[9px] font-extrabold uppercase tracking-wider transition ${
                        timeframe === t 
                          ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10" 
                          : "bg-white border border-slate-200 text-slate-400 hover:bg-slate-50 cursor-pointer"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* Right Column (30% Width) - Sidebar */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Ward Analytics Details */}
            <div className="bg-white border border-slate-200/65 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="text-indigo-650" size={14} />
                  Ward Planning Diagnostics
                </h3>
                <span className="text-[10px] text-indigo-600 font-extrabold block mt-0.5 uppercase tracking-wider">{selectedWardName}</span>
              </div>

              {/* Numerical Indicators grid */}
              <div className="grid grid-cols-2 gap-3 text-xs font-semibold">
                <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Population</span>
                  <p className="text-slate-800 font-extrabold mt-0.5">{activeWard.population}</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Suggested priorities</span>
                  <p className="text-slate-800 font-extrabold mt-0.5">{activeWard.complaints}</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Priority Intensity</span>
                  <p className="text-rose-650 font-extrabold mt-0.5">{activeWard.priorityIndex} / 100</p>
                </div>
                <div className="p-2.5 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <span className="text-[8px] text-slate-400 uppercase font-bold">Budget Used</span>
                  <p className="text-slate-850 font-extrabold mt-0.5">{activeWard.budget}</p>
                </div>
              </div>

              {/* Progress circles */}
              <div className="flex justify-around items-center pt-2 gap-2">
                <CircularProgress percent={activeWard.resolved} label="Resolved" strokeColor="#10B981" />
                <CircularProgress percent={activeWard.pending} label="Pending" strokeColor="#EF4444" />
                <CircularProgress percent={activeWard.satisfaction} label="Satisfaction" strokeColor="#4F46E5" />
              </div>
            </div>

            {/* AI Intelligence sidebar feeds */}
            <div className="bg-white border border-slate-200/65 rounded-2xl p-5 shadow-sm space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <BrainCircuit className="text-indigo-650 animate-pulse" size={14} />
                  AI Planning Intelligence Brief
                </h3>
                <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Predictive engine insights</p>
              </div>

              <div className="space-y-3.5 text-xs font-semibold">
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                    <Activity size={10} />
                    Planning Status
                  </span>
                  <span className="text-slate-800 font-bold">SLA Met (94.2%)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                    <ShieldAlert size={10} className="text-rose-500" />
                    Rising Need
                  </span>
                  <span className="text-rose-650 font-extrabold text-[10px]">Water Pipe Ward 2</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                    <TrendingUp size={10} />
                    Fastest Growth
                  </span>
                  <span className="text-slate-850 font-bold">Road Repairs (+18%)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                    <Lightbulb size={10} className="text-indigo-500" />
                    Next Priority Zone
                  </span>
                  <span className="text-indigo-700 font-bold">Ward 5 Junction</span>
                </div>
                <div className="flex justify-between items-center py-1 border-t border-slate-100">
                  <span className="text-slate-400 font-bold uppercase text-[9px] flex items-center gap-1">
                    <Award size={10} className="text-emerald-500" />
                    Top Division
                  </span>
                  <span className="text-slate-800 font-bold">Sanitation (97%)</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Bottom charts row */}
        <div className="space-y-6">
          <div className="border-t border-slate-200/60 pt-6">
            <h2 className="text-base font-extrabold text-slate-800">Constituency Trend Metrics</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Historical demand signals and planning-priority charts.</p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Trend Forecast */}
            <div className="bg-white border border-slate-200/65 p-6 rounded-2xl shadow-sm">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <TrendingUp className="text-indigo-650" size={16} />
                  Historical Trend vs AI Predictions
                </h2>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Comparison chart of actual vs forecast loads</p>
              </div>
              <div className="h-[320px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorPredictions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px" }}
                      itemStyle={{ fontSize: "11px", fontWeight: "600" }}
                    />
                    <Legend verticalAlign="top" iconSize={8} formatter={(v) => <span className="text-[10px] uppercase font-bold text-slate-500">{v}</span>} />
                    <Area type="monotone" dataKey="requests" stroke="#4f46e5" strokeWidth={2} name="Actual Requests" fill="url(#colorRequests)" />
                    <Area type="monotone" dataKey="predictions" stroke="#10b981" strokeWidth={2} name="Forecast Range" fill="url(#colorPredictions)" strokeDasharray="4 4" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Severity Distribution */}
            <div className="bg-white border border-slate-200/65 p-6 rounded-2xl shadow-sm">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <ShieldAlert className="text-indigo-655" size={16} />
                  Severity & Priority Weight distribution
                </h2>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Weight counts grouped by urgency tags</p>
              </div>
              <div className="h-[320px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={priorityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px" }}
                      itemStyle={{ fontSize: "11px", fontWeight: "600" }}
                    />
                    <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Priority Severity" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {/* Ward comparisons table */}
            <div className="bg-white border border-slate-200/65 p-6 rounded-2xl shadow-sm">
              <div>
                <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <Award className="text-indigo-650" size={16} />
                  Comparative Division Resolved vs Pending Rates
                </h2>
                <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Historical ward-level efficiency comparison</p>
              </div>
              <div className="h-[320px] w-full mt-6">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={wardData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} fontWeight={600} tickLine={false} axisLine={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: "#ffffff", borderColor: "#e2e8f0", borderRadius: "12px" }}
                      itemStyle={{ fontSize: "11px", fontWeight: "600" }}
                    />
                    <Legend verticalAlign="top" iconSize={8} formatter={(v) => <span className="text-[10px] uppercase font-bold text-slate-500">{v}</span>} />
                    <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Resolved" />
                    <Bar dataKey="pending" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pending" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* National Information Centre (NIC) Export Portal Modal */}
      <AnimatePresence>
        {showExportModal && (
          <div 
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 transition-all"
            role="dialog"
            aria-modal="true"
            aria-labelledby="nic-export-title"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl w-full max-w-2xl border border-slate-200 shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            >
              {/* Official Government Header Banner */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="bg-white/10 p-2 rounded-xl border border-white/10">
                    <FileDown className="text-amber-500" size={18} />
                  </div>
                  <div>
                    <h2 id="nic-export-title" className="text-xs uppercase font-extrabold tracking-wider text-slate-100 flex items-center gap-1.5">
                      <span>National Informatics Centre (NIC)</span>
                      <span className="h-3 w-px bg-slate-700"></span>
                      <span className="text-amber-500">Official Report Hub</span>
                    </h2>
                    <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Ministry of Electronics & Information Technology, Government of India</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="text-slate-400 hover:text-white transition p-1.5 hover:bg-white/5 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 focus:ring-offset-slate-900 cursor-pointer text-xs"
                  aria-label="Close export portal"
                >
                  ✕
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto space-y-6">
                
                {/* 1. Report Type Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">1. Select Audit Report Category</label>
                  <div className="space-y-2">
                    {[
                      { id: "ward_summary", name: "Ward Summary Report", desc: "Comparative demographic audit, total complaints, pending backlog, and resolution efficiency rates." },
                      { id: "dept_performance", name: "Department Performance SLA Sheet", desc: "Officer response speeds, resolution SLA compliance percentages, and staff performance indicators." },
                      { id: "monthly_priority", name: "Monthly Priority Analytics Summary", desc: "Category distribution trends, delivery metrics, and citizen satisfaction ratings." },
                      { id: "ai_decision", name: "AI Prioritization & Routing Audit Logs", desc: "Model prioritization predictions, confidence metrics, and ward-routing decision paths." },
                      { id: "exec_dashboard", name: "Executive Planning Dashboard Summary", desc: "Consolidated key performance indices (KPIs), budget outlooks, and hotspot maps." }
                    ].map((report) => (
                      <div 
                        key={report.id}
                        onClick={() => !generatingReport && setSelectedReport(report.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-start gap-3 hover:bg-slate-50/50 ${
                          selectedReport === report.id
                            ? "border-indigo-600 bg-indigo-50/10 ring-1 ring-indigo-600/30"
                            : "border-slate-200"
                        }`}
                      >
                        <input
                          type="radio"
                          id={report.id}
                          name="report-category"
                          checked={selectedReport === report.id}
                          onChange={() => setSelectedReport(report.id)}
                          disabled={generatingReport}
                          className="mt-1 text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5 border-slate-300"
                        />
                        <div>
                          <label htmlFor={report.id} className="text-xs font-bold text-slate-800 cursor-pointer block">{report.name}</label>
                          <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{report.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Format Selection */}
                <div className="space-y-3">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block">2. Choose Official Export Format</label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { id: "pdf", name: "PDF Document", ext: ".pdf", icon: FileText, color: "text-rose-600 bg-rose-50 border-rose-100" },
                      { id: "xlsx", name: "Excel Sheet", ext: ".xlsx", icon: FileSpreadsheet, color: "text-emerald-600 bg-emerald-50 border-emerald-100" },
                      { id: "csv", name: "CSV Dataset", ext: ".csv", icon: FileDown, color: "text-indigo-600 bg-indigo-50 border-indigo-100" }
                    ].map((format) => (
                      <div
                        key={format.id}
                        onClick={() => !generatingReport && setExportFormat(format.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
                          exportFormat === format.id
                            ? "border-slate-800 bg-slate-50 ring-2 ring-slate-800/20"
                            : "border-slate-200 hover:bg-slate-50/50"
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${format.color}`}>
                          <format.icon size={16} />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">{format.name}</span>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5 block">{format.ext}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 px-6 py-4 flex items-center justify-between border-t border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-widest">NIC Digital Signature Enabled</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    disabled={generatingReport}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleExportSubmit}
                    disabled={generatingReport}
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-400 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-650/10 cursor-pointer flex items-center gap-2"
                  >
                    {generatingReport ? (
                      <>
                        <Loader2 className="animate-spin" size={13} />
                        <span>Compiling...</span>
                      </>
                    ) : (
                      <>
                        <Download size={13} />
                        <span>Download Report</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Interactive Compilation Pipeline Overlay */}
              <AnimatePresence>
                {generatingReport && (
                  <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-xs flex flex-col items-center justify-center p-6 z-55 text-center">
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="max-w-md w-full space-y-6 flex flex-col items-center"
                    >
                      <Loader2 className="animate-spin text-amber-500" size={36} />
                      
                      <div className="space-y-2">
                        <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">NIC Telemetry Compiler</h3>
                        <p className="text-xs text-slate-400 font-semibold px-4 min-h-[3rem]">
                          {generationStep === 0 && "Connecting to NIC National Data Gateway (NIC-NDG)..."}
                          {generationStep === 1 && "Fetching compiled SQL records and category logs..."}
                          {generationStep === 2 && "Applying Digital Seal & Encryption Certificates (NIC-DS-2026)..."}
                          {generationStep === 3 && "Packing payload archive into selected file format..."}
                        </p>
                      </div>

                      {/* Micro Progress Bar */}
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden max-w-xs">
                        <div 
                          className="bg-amber-500 h-1.5 rounded-full transition-all duration-700 ease-out"
                          style={{ width: `${(generationStep + 1) * 25}%` }}
                        ></div>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}