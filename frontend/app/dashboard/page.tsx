"use client";

import MainLayout from "@/components/layout/MainLayout";
import KpiCards from "@/components/dashboard/KpiCards";
import dynamic from "next/dynamic";
import RecommendationList from "@/components/dashboard/RecommendationList";
import RecentInsights from "@/components/dashboard/RecentInsights";
import ReviewQueue from "@/components/dashboard/ReviewQueue";
import RequestTrendChart from "@/components/dashboard/RequestTrendChart";
import PriorityDistributionChart from "@/components/dashboard/PriorityDistributionChart";
import WardPerformanceTable from "@/components/dashboard/WardPerformanceTable";
import CriticalEventsTimeline from "@/components/dashboard/CriticalEventsTimeline";
import DepartmentPerformance from "@/components/dashboard/DepartmentPerformance";
import BudgetForecast from "@/components/dashboard/BudgetForecast";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Calendar, Clock, MessageSquare, BrainCircuit, 
  BarChart3, FileSpreadsheet, ClipboardList, Download, Check, Loader2 
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";

const HotspotMap = dynamic(() => import("@/components/dashboard/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 h-[518px] flex items-center justify-center animate-pulse shadow-sm">
      <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">Loading geospatial hotspots...</div>
    </div>
  ),
});
export default function DashboardPage() {
  const [greeting, setGreeting] = useState("Good morning");
  const [currentTime, setCurrentTime] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  
  // Quick Action Simulation States
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);

  const [roleGreeting, setRoleGreeting] = useState("Commissioner");
  const [presentationActive, setPresentationActive] = useState(false);
  
  useEffect(() => {
    const updateRoleGreeting = () => {
      if (typeof window !== "undefined") {
        const activeRole = localStorage.getItem("civitas_user_role");
        const name = localStorage.getItem("civitas_user_name") || "Lokesh Varma";
        
        switch (activeRole) {
          case "citizen":
            setRoleGreeting(`Citizen (${name})`);
            break;
          case "ward_officer":
            setRoleGreeting(`Ward Officer (${name})`);
            break;
          case "department_officer":
            setRoleGreeting(`Dept Officer (${name})`);
            break;
          case "admin":
            setRoleGreeting(`Administrator (${name})`);
            break;
          case "commissioner":
          default:
            setRoleGreeting(`Commissioner (${name})`);
            break;
        }
      }
    };

    updateRoleGreeting();
    if (typeof window !== "undefined") {
      window.addEventListener("civitas_auth_change", updateRoleGreeting);
      
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      const handlePresentation = () => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      };
      window.addEventListener("civitas_presentation_change", handlePresentation);

      return () => {
        window.removeEventListener("civitas_auth_change", updateRoleGreeting);
        window.removeEventListener("civitas_presentation_change", handlePresentation);
      };
    }
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const date = new Date();
      
      // Update greeting
      const hours = date.getHours();
      if (hours < 12) setGreeting("Good Morning");
      else if (hours < 17) setGreeting("Good Afternoon");
      else setGreeting("Good Evening");

      // Update ticking clock
      setCurrentTime(date.toLocaleTimeString(undefined, {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true
      }));

      // Update date format
      setCurrentDate(date.toLocaleDateString(undefined, {
        weekday: "long",
        year: "numeric",
        month: "short",
        day: "numeric"
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    setReportSuccess(false);
    setTimeout(() => {
      setIsGeneratingReport(false);
      setReportSuccess(true);
      setTimeout(() => setReportSuccess(false), 2000);
    }, 1500);
  };

  const handleExportDashboard = () => {
    setIsExporting(true);
    setExportSuccess(false);
    setTimeout(() => {
      setIsExporting(false);
      setExportSuccess(true);
      
      // Mock CSV generation
      const csvContent = "data:text/csv;charset=utf-8,KPI,Value\nTotal Requests,1420\nCritical Requests,84\nResolution Rate,92.1%\n";
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", "civitas_dashboard_report.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setTimeout(() => setExportSuccess(false), 2000);
    }, 1500);
  };

  return (
    <MainLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto">
        
        {/* Command Center Title Greeting */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm"
        >
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              <div className="flex items-center gap-1.5 text-[10px] uppercase font-extrabold text-indigo-650 tracking-wider">
                <Sparkles size={12} className="animate-pulse text-indigo-600" />
                Live People’s Priorities Desk
              </div>
            </div>
            
            <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight mt-2.5">
              {greeting}, {roleGreeting}
            </h1>
            <p className="text-xs text-slate-455 font-semibold mt-1">
              AI Planning Intelligence Platform &bull; Constituency Priority Board
            </p>
          </div>

          {/* Clock and Calendar widgets */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full xl:w-auto">
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-semibold text-slate-550 flex-1 sm:flex-initial">
              <Calendar size={14} className="text-slate-400" />
              <span>{currentDate || "Loading date..."}</span>
            </div>
            <div className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-xl px-4 py-3 text-xs font-bold text-indigo-600 font-mono flex-1 sm:flex-initial">
              <Clock size={14} className="text-indigo-500" />
              <span>{currentTime || "00:00:00 AM"}</span>
            </div>
          </div>
        </motion.div>

        {/* Quick Action Navigation Macros */}
        <div className={`grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 transition-all duration-300 ${presentationActive ? 'hidden' : ''}`}>
          <Link href="/submit">
            <div className="bg-white border border-slate-200/65 hover:border-indigo-500/40 p-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex flex-col justify-between h-28 cursor-pointer group">
              <span className="p-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl self-start group-hover:scale-105 transition-transform duration-200">
                <MessageSquare size={16} />
              </span>
              <span className="text-xs font-bold text-slate-700 mt-2">Share a Priority</span>
            </div>
          </Link>
          <Link href="/assistant">
            <div className="bg-white border border-slate-200/65 hover:border-indigo-500/40 p-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex flex-col justify-between h-28 cursor-pointer group">
              <span className="p-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl self-start group-hover:scale-105 transition-transform duration-200">
                <BrainCircuit size={16} />
              </span>
              <span className="text-xs font-bold text-slate-700 mt-2">AI Assistant</span>
            </div>
          </Link>
          <Link href="/analytics">
            <div className="bg-white border border-slate-200/65 hover:border-indigo-500/40 p-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex flex-col justify-between h-28 cursor-pointer group">
              <span className="p-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl self-start group-hover:scale-105 transition-transform duration-200">
                <BarChart3 size={16} />
              </span>
              <span className="text-xs font-bold text-slate-700 mt-2">Analytics</span>
            </div>
          </Link>

          {/* Action trigger: Generate report */}
          <div 
            onClick={handleGenerateReport}
            className="bg-white border border-slate-200/65 hover:border-indigo-500/40 p-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex flex-col justify-between h-28 cursor-pointer group"
          >
            <span className="p-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl self-start group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              {isGeneratingReport ? (
                <Loader2 size={16} className="animate-spin text-indigo-600" />
              ) : reportSuccess ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <FileSpreadsheet size={16} />
              )}
            </span>
            <span className="text-xs font-bold text-slate-700 mt-2">
              {isGeneratingReport ? "Generating..." : reportSuccess ? "Report Created!" : "Generate Report"}
            </span>
          </div>

          <Link href="/review">
            <div className="bg-white border border-slate-200/65 hover:border-indigo-500/40 p-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex flex-col justify-between h-28 cursor-pointer group">
              <span className="p-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl self-start group-hover:scale-105 transition-transform duration-200">
                <ClipboardList size={16} />
              </span>
              <span className="text-xs font-bold text-slate-700 mt-2">Review Queue</span>
            </div>
          </Link>

          {/* Action trigger: Export Dashboard */}
          <div 
            onClick={handleExportDashboard}
            className="bg-white border border-slate-200/65 hover:border-indigo-500/40 p-4 rounded-xl shadow-sm hover:shadow transition duration-200 flex flex-col justify-between h-28 cursor-pointer group"
          >
            <span className="p-2.5 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl self-start group-hover:scale-105 transition-transform duration-200 flex items-center justify-center">
              {isExporting ? (
                <Loader2 size={16} className="animate-spin text-indigo-600" />
              ) : exportSuccess ? (
                <Check size={16} className="text-emerald-600" />
              ) : (
                <Download size={16} />
              )}
            </span>
            <span className="text-xs font-bold text-slate-700 mt-2">
              {isExporting ? "Exporting..." : exportSuccess ? "Downloaded CSV!" : "Export Dashboard"}
            </span>
          </div>
        </div>

        {/* Top KPI Cards Row */}
        <KpiCards />

        {/* AI Brief, Budget Splits & Critical Timeline row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <RecentInsights />
          <DepartmentPerformance />
          <BudgetForecast />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className={presentationActive ? "xl:col-span-3" : "xl:col-span-2"}>
            <HotspotMap />
          </div>
          <div className={presentationActive ? "hidden" : ""}>
            <CriticalEventsTimeline />
          </div>
        </div>

        {/* City Overview Grid Section */}
        <div className="space-y-6">
          <div className="border-t border-slate-200/60 pt-6">
            <h2 className="text-base font-extrabold text-slate-800">Constituency Priorities & Analytics</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Comparative analytics of ward-level needs, project demand, and planning trends.</p>
          </div>

          {/* Core Analytics Grids */}
          <div className={`grid grid-cols-1 ${presentationActive ? 'xl:grid-cols-1 gap-10' : 'xl:grid-cols-2 gap-6'}`}>
            <RequestTrendChart />
            <PriorityDistributionChart />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className={presentationActive ? "xl:col-span-3" : "xl:col-span-2"}>
              <WardPerformanceTable />
            </div>
            <div className={presentationActive ? "hidden" : ""}>
              <RecommendationList />
            </div>
          </div>

          {/* Audit Queue block */}
          <div className={`grid grid-cols-1 gap-6 ${presentationActive ? 'hidden' : ''}`}>
            <ReviewQueue />
          </div>
        </div>
      </div>

      {/* Floating generation overlays */}
      <AnimatePresence>
        {isGeneratingReport && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-250 shadow-2xl flex flex-col items-center text-center space-y-4"
            >
              <Loader2 className="animate-spin text-indigo-600" size={32} />
              <div>
                <h3 className="text-sm font-extrabold text-slate-850">Generating Executive Summary</h3>
                <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">Collecting Ward records & AI Analytics</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MainLayout>
  );
}