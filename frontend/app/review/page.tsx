"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  FileText, Volume2, Image as ImageIcon, CheckCircle2, Loader2, Sparkles, 
  Search, Filter, ChevronLeft, ChevronRight, Check, X as XIcon, Eye, Paperclip, 
  AlertTriangle, RefreshCw, Download, Shield, MapPin, Clock, Building, Calendar,
  Activity, ArrowRight, UserCheck, AlertOctagon, CornerDownRight, Landmark
} from "lucide-react";
import * as Lucide from "lucide-react";

import { api, Submission } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

const CATEGORIES = ["Road Infrastructure", "Water Supply", "Solid Waste Management", "Street Lighting", "Healthcare Services"];
const WARDS = Array.from({ length: 12 }, (_, i) => `Ward ${i + 1}`);
const DEPARTMENTS = [
  "Public Works Department (PWD)",
  "Municipal Water Supply Board",
  "Urban Sanitation Division",
  "Electrical & Energy Division",
  "Health & Family Welfare Division"
];

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [officerName, setOfficerName] = useState("Lokesh Varma");
  const [officerRole, setOfficerRole] = useState("Municipal Commissioner");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const activeRole = localStorage.getItem("civitas_user_role") || "commissioner";
      const name = localStorage.getItem("civitas_user_name") || "Lokesh Varma";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOfficerName(name);
      
      const roleLabels: Record<string, string> = {
        citizen: "Citizen Profile",
        ward_officer: "Ward Officer",
        department_officer: "Dept Officer (PWD)",
        commissioner: "Municipal Commissioner",
        admin: "Administrator"
      };
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setOfficerRole(roleLabels[activeRole] || "Municipal Commissioner");
    }
  }, []);
  
  // 3-panel workspace state
  const [selectedSub, setSelectedSub] = useState<Submission | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedWard, setSelectedWard] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  
  // Custom Filter toggles
  const [onlyHighPriority, setOnlyHighPriority] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [onlyEscalated, setOnlyEscalated] = useState(false);

  // Action states & Modal Confirmations
  const [actions, setActions] = useState<Record<string, string>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    type: "approve" | "reject" | "escalate" | "inspection" | "forward" | null;
    subId: string | null;
  }>({ type: null, subId: null });

  const [internalNotes, setInternalNotes] = useState("");
  const [assignedOfficer, setAssignedOfficer] = useState("A. K. Mehta (Chief Engineer)");

  const loadSubmissions = () => {
    setLoading(true);
    api.getSubmissions()
      .then((data) => {
        let list = [...(data || [])];
        if (typeof window !== "undefined" && localStorage.getItem("civitas_demo_mode") === "true") {
          const demoSubStr = localStorage.getItem("civitas_demo_grievance");
          if (demoSubStr) {
            try {
              const demoSub = JSON.parse(demoSubStr);
              list = [demoSub, ...list];
            } catch (e) {
              console.error(e);
            }
          }
        }
        setSubmissions(list);
        if (list.length > 0) {
          setSelectedSub(list[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading submissions for review:", err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubmissions();
    if (typeof window !== "undefined") {
      const handleDemo = () => loadSubmissions();
      window.addEventListener("civitas_demo_change", handleDemo);
      return () => window.removeEventListener("civitas_demo_change", handleDemo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleActionConfirm = () => {
    if (!confirmDialog.subId || !confirmDialog.type) return;
    const subId = confirmDialog.subId;
    const actionType = confirmDialog.type;

    let displayMsg = "";
    if (actionType === "approve") {
      setActions(prev => ({ ...prev, [subId]: "Approved" }));
      displayMsg = `Grievance Reference ${subId} successfully verified & approved for municipal budget.`;
    } else if (actionType === "reject") {
      setActions(prev => ({ ...prev, [subId]: "Rejected" }));
      displayMsg = `Grievance Reference ${subId} marked as invalid/rejected.`;
    } else if (actionType === "escalate") {
      setActions(prev => ({ ...prev, [subId]: "Escalated" }));
      displayMsg = `Grievance Reference ${subId} escalated to Secretariat level.`;
    } else if (actionType === "inspection") {
      setActions(prev => ({ ...prev, [subId]: "Inspection Scheduled" }));
      displayMsg = `Site inspection successfully logged for Grievance ${subId}.`;
    } else if (actionType === "forward") {
      setActions(prev => ({ ...prev, [subId]: "Forwarded" }));
      displayMsg = `Grievance ${subId} forwarded to ${assignedOfficer}.`;
    }

    triggerToast(displayMsg);
    setConfirmDialog({ type: null, subId: null });
    setInternalNotes("");
  };

  const handleExportCSV = () => {
    const csvContent = `data:text/csv;charset=utf-8,Officer Review Report\nPending cases,${submissions.length}\nDepartment,Urban Development Authority\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `officer_review_report.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter calculations
  const filtered = submissions.filter(sub => {
    const matchesSearch = sub.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (sub.reporter_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesWard = selectedWard ? sub.ward === selectedWard : true;
    const matchesDept = selectedDept ? getDepartmentForCategory(sub.category).includes(selectedDept) : true;
    const matchesCategory = selectedCategory ? sub.category === selectedCategory : true;
    
    // Status filters
    const currentStatus = actions[sub.id] || sub.status;
    const matchesStatus = selectedStatus ? currentStatus === selectedStatus : true;

    // Checkbox toggles
    const isCritical = sub.sentiment === "Critical/Angry" || sub.sentiment === "Emergency";
    const matchesHigh = onlyHighPriority ? isCritical : true;
    const matchesPendingToggle = onlyPending ? currentStatus === "Pending" : true;
    const matchesEscalatedToggle = onlyEscalated ? currentStatus === "Escalated" : true;

    return matchesSearch && matchesWard && matchesDept && matchesCategory && matchesStatus && matchesHigh && matchesPendingToggle && matchesEscalatedToggle;
  });

  const getDepartmentForCategory = (category: string) => {
    if (category.includes("Water")) return "Municipal Water Supply Board";
    if (category.includes("Light")) return "Electrical & Energy Division";
    if (category.includes("Sanitation") || category.includes("Solid")) return "Urban Sanitation Division";
    if (category.includes("Health")) return "Health & Family Welfare Division";
    return "Public Works Department (PWD)";
  };

  const getResolutionTimeForPriority = (sentiment: string) => {
    if (sentiment === "Critical/Angry" || sentiment === "Emergency") {
      return "24 Hours (SLA Target)";
    }
    if (sentiment === "Concerned") {
      return "3-5 Business Days (SLA Target)";
    }
    return "7-10 Business Days (SLA Target)";
  };

  const getPriorityScore = (sentiment: string) => {
    if (sentiment === "Critical/Angry" || sentiment === "Emergency") return { label: "Critical", score: 87, color: "text-red-600 bg-red-50 border-red-100" };
    if (sentiment === "Concerned") return { label: "Medium", score: 58, color: "text-amber-600 bg-amber-50 border-amber-100" };
    return { label: "Low", score: 32, color: "text-slate-500 bg-slate-50 border-slate-200" };
  };

  return (
    <MainLayout>
      <div className="space-y-6 relative">
        
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-6 left-1/2 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider border border-slate-800"
            >
              <Lucide.CheckCircle2 size={16} className="text-emerald-500" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Dynamic Modal Dialog Confirmations */}
        <AnimatePresence>
          {confirmDialog.type && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="w-full max-w-md bg-white border border-slate-200 rounded-xl overflow-hidden shadow-2xl p-6 space-y-4"
              >
                <div>
                  <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-tight flex items-center gap-1.5">
                    <Lucide.Shield size={16} className="text-indigo-600" />
                    Confirm Official Action: {confirmDialog.type}
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-1">Grievance Code ID: {confirmDialog.subId}</p>
                </div>

                {confirmDialog.type === "forward" && (
                  <div className="space-y-2">
                    <label className="block text-[10px] font-bold uppercase text-slate-400">Select Department Authority</label>
                    <select
                      value={assignedOfficer}
                      onChange={(e) => setAssignedOfficer(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-bold focus:outline-none"
                    >
                      <option value="A. K. Mehta (Chief Engineer)">A. K. Mehta (Chief Engineer - PWD)</option>
                      <option value="S. R. Patel (Ward Supervisor)">S. R. Patel (Ward Supervisor - Sanitation)</option>
                      <option value="Dr. V. Joshi (Health Officer)">Dr. V. Joshi (Health Officer - Medical)</option>
                    </select>
                  </div>
                )}

                <div className="space-y-1">
                  <label className="block text-[10px] font-bold uppercase text-slate-400">Internal Audit Remarks (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Enter audit logs or decision reasoning..."
                    value={internalNotes}
                    onChange={(e) => setInternalNotes(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none resize-none"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <button
                    onClick={() => setConfirmDialog({ type: null, subId: null })}
                    className="px-3.5 py-2 border border-slate-200 hover:bg-slate-50 text-slate-500 text-[10px] font-bold uppercase rounded-lg transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleActionConfirm}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold uppercase rounded-lg transition shadow-md shadow-indigo-600/10 active:scale-95"
                  >
                    Authorize Action
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Command Center Dashboard Header */}
        <div className="bg-white border-l-4 border-l-orange-500 border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="text-[9px] uppercase font-bold tracking-wider text-orange-600">Smart Cities Command Center &bull; Officer Panel</div>
            <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5 flex items-center gap-2">
              <Lucide.Shield className="text-indigo-600" size={20} />
              Officer Grievance Review & Decision Centre
            </h1>
            <p className="text-xs text-slate-500 font-semibold mt-0.5">
              Verify real-time citizens submission feeds, inspect NLP priority thresholds, and authorize PWD actions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadSubmissions}
              className="p-2 border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 rounded-xl transition cursor-pointer"
              title="Refresh Queue"
            >
              <Lucide.RefreshCw size={14} />
            </button>
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-655 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <Lucide.Download size={14} />
              Export Log
            </button>
          </div>
        </div>

        {/* Executive Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Assigned Jurisdiction</p>
            <p className="text-sm font-extrabold text-slate-800 mt-1">Rajkot Municipal Zone</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Pending Grievances</p>
            <p className="text-sm font-extrabold text-slate-800 mt-1">{submissions.length} Active Records</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Critical Escalations</p>
            <p className="text-sm font-extrabold text-red-655 mt-1">
              {submissions.filter(s => s.sentiment === "Critical/Angry" || s.sentiment === "Emergency").length} Red Alerts
            </p>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Audit Officer Grade</p>
            <p className="text-sm font-extrabold text-indigo-700 mt-1">{officerRole}</p>
          </div>
        </div>

        {/* 3-Panel Workspace Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Panel 1: Filter & Search Settings (Left - 3 columns) */}
          <div className="lg:col-span-3 bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider pb-2 border-b border-slate-100 flex items-center gap-1.5">
              <Lucide.Filter size={14} className="text-indigo-650" />
              Jurisdiction Filters
            </h3>

            {/* Keyword Search */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-450">Search Logs</label>
              <div className="relative">
                <Lucide.Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
                <input
                  type="text"
                  placeholder="Grievance Code / Name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none"
                />
              </div>
            </div>

            {/* Ward Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-450">Administrative Ward</label>
              <select
                value={selectedWard}
                onChange={(e) => setSelectedWard(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">All Municipal Wards</option>
                {WARDS.map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>

            {/* Department Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-455">Municipal Department</label>
              <select
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">All Divisions</option>
                {DEPARTMENTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-455">Filing Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Selector */}
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase text-slate-455">Action Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs font-semibold focus:outline-none"
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Approved">Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Escalated">Escalated</option>
              </select>
            </div>

            {/* Toggle checkboxes */}
            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-655 select-none">
                <input
                  type="checkbox"
                  checked={onlyHighPriority}
                  onChange={(e) => setOnlyHighPriority(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Critical Red Alerts Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-655 select-none">
                <input
                  type="checkbox"
                  checked={onlyPending}
                  onChange={(e) => setOnlyPending(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Pending Audits Only</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-655 select-none">
                <input
                  type="checkbox"
                  checked={onlyEscalated}
                  onChange={(e) => setOnlyEscalated(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-650 focus:ring-indigo-500 h-3.5 w-3.5 cursor-pointer"
                />
                <span>Escalated Level Only</span>
              </label>
            </div>

            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedWard("");
                setSelectedDept("");
                setSelectedCategory("");
                setSelectedStatus("");
                setOnlyHighPriority(false);
                setOnlyPending(false);
                setOnlyEscalated(false);
              }}
              className="w-full py-2 border border-slate-200 hover:bg-slate-50 text-slate-550 text-[10px] font-extrabold uppercase rounded-lg tracking-wider cursor-pointer"
            >
              Reset All Filters
            </button>
          </div>

          {/* Panel 2: Grievance Queue (Center - 5 columns) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center pb-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Lucide.Activity size={14} className="text-indigo-600 animate-pulse" />
                Live Submission Queue ({filtered.length})
              </h3>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3 animate-pulse h-40">
                    <div className="h-3.5 bg-slate-100 rounded w-1/3"></div>
                    <div className="h-3 bg-slate-100 rounded w-full"></div>
                    <div className="h-3 bg-slate-100 rounded w-4/5"></div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-700 bg-red-50 border border-red-200 rounded-xl font-bold text-xs">
                Failed to pull review queue records.
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-450 bg-white border border-slate-200 rounded-xl shadow-xs font-semibold text-xs">
                No active municipal complaints match current filters.
              </div>
            ) : (
              <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                {filtered.map((sub) => {
                  const priObj = getPriorityScore(sub.sentiment);
                  const isActive = selectedSub?.id === sub.id;
                  const currentStatus = actions[sub.id] || sub.status;
                  const isCritical = sub.sentiment === "Critical/Angry" || sub.sentiment === "Emergency";

                  return (
                    <div
                      key={sub.id}
                      onClick={() => setSelectedSub(sub)}
                      className={`p-4 bg-white border rounded-xl cursor-pointer transition shadow-xs flex flex-col justify-between h-48 relative ${
                        isActive 
                          ? "border-indigo-600 ring-1 ring-indigo-500" 
                          : isCritical 
                          ? "border-red-200 hover:border-red-400 bg-red-50/10" 
                          : "border-slate-200 hover:bg-slate-50/40"
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Title Row */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <span className="font-mono text-indigo-650 font-extrabold text-[11px]">{sub.id}</span>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{sub.category}</p>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {/* Attachment icons */}
                            {sub.image_path && <ImageIcon size={12} className="text-amber-500" />}
                            {sub.audio_path && <Volume2 size={12} className="text-indigo-600" />}
                            
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${priObj.color}`}>
                              {priObj.label}
                            </span>
                          </div>
                        </div>

                        {/* Description snippet */}
                        <p className="text-slate-650 text-xs font-bold line-clamp-2 leading-relaxed">
                          {sub.description}
                        </p>
                      </div>

                      {/* Footer Row */}
                      <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-[10px] font-semibold text-slate-400">
                        <span>Ward: {sub.ward}</span>
                        <div className="flex items-center gap-2">
                          <span>{sub.date}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[8px] border ${
                            currentStatus === "Approved" 
                              ? "bg-emerald-50 text-emerald-700 border-emerald-100"
                              : currentStatus === "Rejected"
                              ? "bg-red-50 text-red-700 border-red-100"
                              : "bg-slate-50 text-slate-550 border-slate-200"
                          }`}>
                            {currentStatus}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Panel 3: AI Decision Panel (Right - 4 columns) */}
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6">
            {selectedSub ? (
              <div className="space-y-6 animate-in fade-in duration-200">
                
                {/* Panel Header */}
                <div className="pb-3 border-b border-slate-150">
                  <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <Lucide.Shield size={14} className="text-indigo-755" />
                    AI Redress Recommendation
                  </h3>
                  <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Reference ID: {selectedSub.id}</p>
                </div>

                {/* AI parameters report card */}
                <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-150 rounded-xl text-xs font-semibold text-slate-700">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Confidence Score</span>
                    <span className="text-indigo-650 font-extrabold">94% Level</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Estimated Budget</span>
                    <span className="text-slate-800 font-bold">14,200 INR (Est.)</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Resolution Target</span>
                    <span className="text-slate-800 font-bold">{getResolutionTimeForPriority(selectedSub.sentiment)}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-t border-slate-100 pt-2">
                    <span className="text-[9px] text-slate-400 font-bold uppercase">Risk Category</span>
                    <span className="text-slate-800 font-bold">Medium Priority Hazard</span>
                  </div>
                </div>

                {/* Complaint Summary transcript */}
                <div className="space-y-2">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Citizen Petition Transcript</span>
                  <p className="text-slate-700 text-xs font-bold bg-slate-50 p-3 rounded-lg border border-slate-100 leading-relaxed max-h-32 overflow-y-auto">
                    {selectedSub.description}
                  </p>
                </div>

                {/* Audio/Image attachments if present */}
                {(selectedSub.image_path || selectedSub.audio_path) && (
                  <div className="space-y-3 border-t border-slate-100 pt-4">
                    <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Attached Evidence Logs</span>
                    {selectedSub.image_path && (
                      <div className="rounded-lg overflow-hidden border border-slate-200 h-28 bg-slate-50 relative group">
                        <img 
                          src={`${API_BASE_URL}${selectedSub.image_path}`} 
                          alt="Grievance file proof" 
                          className="object-contain w-full h-full"
                        />
                      </div>
                    )}
                    {selectedSub.audio_path && (
                      <audio 
                        controls 
                        src={`${API_BASE_URL}${selectedSub.audio_path}`} 
                        className="w-full h-8 mt-1 accent-indigo-650"
                      />
                    )}
                  </div>
                )}

                {/* Vertical Audit Activity Timeline */}
                <div className="space-y-3 border-t border-slate-100 pt-4">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Administrative Milestones</span>
                  <div className="space-y-3 relative pl-3.5 before:absolute before:left-1 before:top-1 before:bottom-1 before:w-[1px] before:bg-slate-200">
                    <div className="relative text-[10px] font-bold text-slate-700">
                      <span className="absolute -left-[18px] top-0.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                      <p>Complaint Filed & Registered</p>
                      <span className="text-[8px] text-slate-400 font-semibold">{selectedSub.date}</span>
                    </div>
                    <div className="relative text-[10px] font-bold text-slate-700">
                      <span className="absolute -left-[18px] top-0.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
                      <p>AI Classification & SLA Assignment</p>
                      <span className="text-[8px] text-slate-400 font-semibold">94% Confidence</span>
                    </div>
                    <div className="relative text-[10px] font-bold text-slate-450">
                      <span className="absolute -left-[18px] top-0.5 w-2 h-2 rounded-full bg-slate-200 ring-2 ring-white"></span>
                      <p>Onsite Inspection Dispatch</p>
                      <span className="text-[8px] text-slate-400 font-semibold">Awaiting Authorization</span>
                    </div>
                  </div>
                </div>

                {/* Officer actions panel */}
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block mb-1">Redress Decisions</span>
                  
                  {actions[selectedSub.id] ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-lg text-center uppercase tracking-wider">
                      Authorized: {actions[selectedSub.id]}
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setConfirmDialog({ type: "reject", subId: selectedSub.id })}
                        className="py-2 border border-slate-250 hover:bg-red-50 text-slate-600 hover:text-red-700 text-[10px] font-bold uppercase rounded-lg transition"
                      >
                        Reject Case
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ type: "approve", subId: selectedSub.id })}
                        className="py-2 bg-indigo-650 hover:bg-indigo-600 text-white text-[10px] font-bold uppercase rounded-lg transition shadow-sm shadow-indigo-600/10"
                      >
                        Approve Case
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ type: "escalate", subId: selectedSub.id })}
                        className="py-2 border border-slate-200 hover:bg-slate-50 text-slate-550 text-[10px] font-bold uppercase rounded-lg transition"
                      >
                        Escalate
                      </button>
                      <button
                        onClick={() => setConfirmDialog({ type: "forward", subId: selectedSub.id })}
                        className="py-2 border border-slate-200 hover:bg-slate-50 text-slate-550 text-[10px] font-bold uppercase rounded-lg transition"
                      >
                        Forward
                      </button>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="text-center py-12 text-slate-400 space-y-2">
                <Lucide.Shield size={24} className="mx-auto text-slate-300" />
                <p className="text-xs font-bold uppercase tracking-wider">No Grievance Selected</p>
                <p className="text-[10px] text-slate-400">Select any municipal card from the center queue feed to run governance audits.</p>
              </div>
            )}
          </div>

        </div>

      </div>
    </MainLayout>
  );
}