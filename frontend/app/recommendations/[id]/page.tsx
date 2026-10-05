"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import MainLayout from "@/components/layout/MainLayout";
import { 
  Sparkles, Share2, Download, CheckCircle2, Shield, MapPin, 
  Calendar, Clock, AlertTriangle, ArrowRight, Play, Mic, FileText, 
  Search, Filter, ChevronLeft, ChevronRight, X, Info, Layers, Maximize2,
  Check, MessageSquare, BrainCircuit, Activity
} from "lucide-react";
import { api, Recommendation, Submission } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const HotspotMap = dynamic(() => import("@/components/dashboard/HotspotMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-900 rounded-xl border border-slate-800 h-[380px] flex items-center justify-center animate-pulse">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loading Geospatial Terrain...</span>
    </div>
  ),
});

export default function RecommendationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const recId = params?.id as string;

  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Evidence Modal states
  const [activeMediaModal, setActiveMediaModal] = useState<{
    type: "image" | "audio" | "scan" | "video";
    title: string;
    content: string;
  } | null>(null);

  // Audio simulation state
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Related citizen submissions
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    // Load recommendations and find matching ID or fallback
    api.getRecommendations()
      .then((data) => {
        const found = data.find((r) => String(r.id) === recId) || data[0] || {
          id: 1,
          title: "Build Primary Health Centre",
          ward: "Ward 6",
          score: 95,
          budget: "₹48 Lakhs",
          impact: "18,000 people",
          completion_time: "12 months",
          risk_level: "Medium",
          ai_reasoning: "AI identified 421 similar citizen requests from Ward 6 over the last 60 days. Existing healthcare facilities are over 6 km away, affecting approximately 18,000 residents."
        };
        setRecommendation(found);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading recommendation details:", err);
        // Fallback demo object
        setRecommendation({
          id: Number(recId) || 1,
          title: "Build Primary Health Centre",
          ward: "Ward 6",
          score: 95,
          budget: "₹48 Lakhs",
          impact: "18,000 people",
          completion_time: "12 months",
          risk_level: "Medium",
          ai_reasoning: "AI identified 421 similar citizen requests from Ward 6 over the last 60 days. Existing healthcare facilities are over 6 km away, affecting approximately 18,000 residents."
        });
        setLoading(false);
      });

    // Load citizen requests
    api.getSubmissions()
      .then((subs) => setSubmissions(subs || []))
      .catch(() => setSubmissions([]));
  }, [recId]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAction = (status: string) => {
    setActionStatus(status);
    triggerToast(`Recommendation successfully marked as '${status}' in Municipal Ledger.`);
  };

  const handleExportPDF = () => {
    triggerToast("Generating Executive PDF Brief for Parliamentary Office...");
    setTimeout(() => {
      const csvContent = `data:text/csv;charset=utf-8,RECOMMENDATION BRIEF\nID,${recommendation?.id}\nTitle,${recommendation?.title}\nWard,${recommendation?.ward}\nPriority Score,${recommendation?.score}/100\nBudget,${recommendation?.budget}\nImpact,${recommendation?.impact}\n`;
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `civitas_recommendation_${recommendation?.id || 1}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, 1200);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Loading AI Intelligence Report...</span>
        </div>
      </MainLayout>
    );
  }

  const score = recommendation?.score || 95;
  const strokeDashoffset = 552.9 * (1 - score / 100);

  const filteredSubs = submissions.filter(s => 
    s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.id.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  return (
    <MainLayout>
      <div className="space-y-8 max-w-[1600px] mx-auto relative pb-20">
        
        {/* Floating Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, x: "-50%" }}
              animate={{ opacity: 1, y: 0, x: "-50%" }}
              exit={{ opacity: 0, y: -20, x: "-50%" }}
              className="fixed top-6 left-1/2 z-50 bg-slate-900 text-white px-6 py-3.5 rounded-xl shadow-2xl flex items-center gap-2.5 text-xs font-bold uppercase tracking-wider border border-slate-700"
            >
              <CheckCircle2 size={16} className="text-emerald-400" />
              <span>{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Media Preview Modal */}
        <AnimatePresence>
          {activeMediaModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900 border border-slate-800 text-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl relative"
              >
                <button
                  onClick={() => setActiveMediaModal(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
                >
                  <X size={16} />
                </button>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                  <Shield size={14} />
                  Official Evidence Attachment Log
                </div>
                <h3 className="text-base font-extrabold">{activeMediaModal.title}</h3>
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-xs font-semibold text-slate-300 leading-relaxed">
                  {activeMediaModal.content}
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setActiveMediaModal(null)}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl"
                  >
                    Close Preview
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Breadcrumb & Header Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900 border border-slate-800/80 p-6 rounded-2xl text-white shadow-xl">
          <div>
            <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              <span onClick={() => router.push("/dashboard")} className="hover:text-white cursor-pointer">Dashboard</span>
              <ChevronRight size={12} />
              <span onClick={() => router.push("/recommendations")} className="hover:text-white cursor-pointer">Recommendations</span>
              <ChevronRight size={12} />
              <span className="text-indigo-400">{recommendation?.title}</span>
            </nav>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
              <Sparkles className="text-indigo-400 animate-pulse" size={24} />
              AI Recommendation Command Center
            </h1>
            <p className="text-xs text-slate-400 font-semibold mt-1">
              Explainable AI-powered project recommendation based on multidimensional citizen demand.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                triggerToast("Direct URL link copied to clipboard!");
              }}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition border border-slate-700 flex items-center gap-2 cursor-pointer"
            >
              <Share2 size={14} />
              Share
            </button>
            <button
              onClick={handleExportPDF}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-2 cursor-pointer active:scale-95"
            >
              <Download size={14} />
              Export Brief
            </button>
          </div>
        </div>

        {/* Top Section: Main Recommendation Card & Financial Sidebar */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Main Card (8 cols) */}
          <div className="col-span-12 lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-xl text-white space-y-8">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-indigo-600/10 blur-[100px] rounded-full"></div>
            
            <div className="flex flex-col sm:flex-row gap-8 items-center relative z-10">
              {/* Circular Gauge Score */}
              <div className="flex-shrink-0 relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-slate-800"
                    cx="88"
                    cy="88"
                    r="76"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                  />
                  <circle
                    className="text-indigo-500 transition-all duration-1000 ease-out"
                    cx="88"
                    cy="88"
                    r="76"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="12"
                    strokeDasharray="477.5"
                    strokeDashoffset={477.5 * (1 - score / 100)}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-4xl font-extrabold text-indigo-400 tracking-tight">{score}</span>
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400">Score</span>
                </div>
              </div>

              {/* Title & Dimensional Progress Meters */}
              <div className="flex-grow space-y-5">
                <div>
                  <span className="inline-block px-3 py-1 bg-teal-500/10 text-teal-400 border border-teal-500/20 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2">
                    CRITICAL PRIORITY &bull; WARD SECTOR
                  </span>
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">{recommendation?.title}</h2>
                  <p className="text-xs text-slate-400 font-semibold mt-0.5">{recommendation?.ward}, Central District Cluster</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3 text-xs">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Citizen Demand</span>
                      <span className="text-indigo-400">40/40</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Urgency Index</span>
                      <span className="text-indigo-400">18/20</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[90%]"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Infrastructure Gap</span>
                      <span className="text-teal-400">20/20</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 w-full"></div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase">
                      <span>Demographic Need</span>
                      <span className="text-teal-400">9/10</span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-400 w-[90%]"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Reasoning Box */}
            <div className="p-1 rounded-xl bg-gradient-to-r from-indigo-600 to-teal-400 shadow-lg">
              <div className="bg-slate-950 p-5 rounded-[10px] flex gap-4 items-start">
                <Sparkles className="text-teal-400 flex-shrink-0 mt-0.5" size={20} />
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-teal-400 uppercase tracking-wider">AI Contextual Reasoning</h3>
                  <p className="text-slate-300 text-xs font-medium leading-relaxed">
                    {recommendation?.ai_reasoning} High correlation identified between local health petition density and lack of municipal facilities.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Financial & Impact Matrix Sidebar (4 cols) */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 text-white space-y-6 shadow-xl">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider border-b border-slate-800 pb-3">
                Financial & Impact Matrix
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-semibold">Estimated Budget</span>
                  <span className="text-sm font-extrabold text-indigo-400">{recommendation?.budget}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <span className="text-slate-400 font-semibold">Expected Beneficiaries</span>
                  <span className="text-sm font-extrabold text-white">{recommendation?.impact}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <span className="text-slate-400 font-semibold">Est. Completion SLA</span>
                  <span className="text-sm font-extrabold text-white">{recommendation?.completion_time}</span>
                </div>
                <div className="flex items-center justify-between border-t border-slate-800/60 pt-3">
                  <span className="text-slate-400 font-semibold">Risk Classification</span>
                  <span className="px-2.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg text-[10px] font-extrabold uppercase">
                    {recommendation?.risk_level} Risk
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                {actionStatus ? (
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold rounded-xl text-center uppercase tracking-wider">
                    Status: {actionStatus}
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => handleAction("Approved")}
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-extrabold uppercase tracking-wider rounded-xl shadow-lg shadow-indigo-600/20 transition cursor-pointer active:scale-95"
                    >
                      Approve Recommendation
                    </button>
                    <button
                      onClick={() => handleAction("Under Review")}
                      className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer border border-slate-700"
                    >
                      Request Detailed Audit
                    </button>
                    <button
                      onClick={() => handleAction("Rejected")}
                      className="w-full py-2.5 hover:bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
                    >
                      Reject Recommendation
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Middle Section: Hotspot Map & Timeline */}
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <MapPin size={14} className="text-teal-400" />
                Geospatial Ward Hotspots ({recommendation?.ward})
              </h3>
            </div>
            <HotspotMap />
          </div>

          <div className="col-span-12 lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-white flex flex-col justify-between space-y-6">
            <div>
              <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Citizen Requests Over Time</h3>
                <span className="text-[10px] font-extrabold text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20">+24% vs Last Quarter</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-2 font-semibold">Monthly volume distribution of filed priorities in {recommendation?.ward}.</p>
            </div>

            {/* Simple CSS Bar Chart */}
            <div className="h-44 flex items-end gap-3 pb-2 pt-4">
              {[
                { month: "Jan", height: "40%" },
                { month: "Feb", height: "65%" },
                { month: "Mar", height: "85%" },
                { month: "Apr", height: "45%" },
                { month: "May", height: "95%" },
                { month: "Jun", height: "100%", active: true }
              ].map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                  <div 
                    style={{ height: m.height }} 
                    className={`w-full rounded-t transition-all ${
                      m.active 
                        ? "bg-indigo-500 shadow-lg shadow-indigo-500/30" 
                        : "bg-slate-800 group-hover:bg-slate-700"
                    }`}
                  ></div>
                  <span className={`text-[10px] font-bold ${m.active ? "text-indigo-400" : "text-slate-500"}`}>{m.month}</span>
                </div>
              ))}
            </div>

            <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-[10px] text-slate-400 font-semibold flex items-center gap-2">
              <Info size={14} className="text-teal-400 flex-shrink-0" />
              <span>Unusual spike detected in May following the monsoon infrastructure assessment.</span>
            </div>
          </div>
        </div>

        {/* Evidence Gallery Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <FileText size={16} className="text-indigo-600" />
              Ground Evidence Gallery
            </h3>
            <span className="text-[10px] font-extrabold uppercase text-slate-400">4 Attachment Modalities Logged</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Image Evidence */}
            <div 
              onClick={() => setActiveMediaModal({
                type: "image",
                title: "Clinic Overcrowding Onsite Photograph",
                content: "High-resolution photo logged by Ward Inspector showing cramped waiting area at Ward 6 primary clinic."
              })}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-700 transition group shadow-lg"
            >
              <div className="h-36 bg-slate-950 relative flex items-center justify-center border-b border-slate-800">
                <span className="material-symbols-outlined text-slate-600 text-5xl group-hover:scale-110 transition-transform">photo_camera</span>
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-indigo-600 text-white rounded text-[9px] font-extrabold uppercase">IMAGE</span>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-white">Clinic Overcrowding Photo</p>
                <p className="text-[10px] font-semibold text-slate-400">Submitted by Ward Inspector &bull; 2 days ago</p>
              </div>
            </div>

            {/* Voice Recording */}
            <div 
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between cursor-pointer hover:border-slate-700 transition shadow-lg border-l-4 border-l-teal-400"
            >
              <div className="flex justify-between items-start">
                <Mic className="text-teal-400" size={24} />
                <span className="px-2 py-0.5 bg-teal-500/20 text-teal-400 rounded text-[9px] font-extrabold uppercase">VOICE</span>
              </div>
              <div className="space-y-1 my-3">
                <p className="text-xs font-bold text-white">Resident Voice Petition</p>
                <p className="text-[10px] font-semibold text-slate-400">Transcribed Audio (0:45s)</p>
              </div>
              <div className="space-y-1">
                <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className={`h-full bg-teal-400 ${isPlayingAudio ? "w-2/3 animate-pulse" : "w-1/3"}`}></div>
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-400">
                  <span>{isPlayingAudio ? "Playing..." : "Click to Play"}</span>
                  <span>0:45</span>
                </div>
              </div>
            </div>

            {/* Scanned Petition */}
            <div 
              onClick={() => setActiveMediaModal({
                type: "scan",
                title: "Community Signed Petition Scan",
                content: "Official petition signed by 150+ Ward 6 residents requesting immediate primary healthcare infrastructure."
              })}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-700 transition group shadow-lg"
            >
              <div className="h-36 bg-slate-950 relative flex items-center justify-center border-b border-slate-800">
                <FileText className="text-indigo-400 text-5xl group-hover:scale-110 transition-transform" size={48} />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-amber-500 text-slate-950 rounded text-[9px] font-extrabold uppercase">SCAN</span>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-white">Community Petition Scan</p>
                <p className="text-[10px] font-semibold text-slate-400">Signed by 150+ residents</p>
              </div>
            </div>

            {/* Video Audit */}
            <div 
              onClick={() => setActiveMediaModal({
                type: "video",
                title: "Drone Access Route Audit",
                content: "Aerial drone footage inspecting road connectivity and transport availability to healthcare centers."
              })}
              className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden cursor-pointer hover:border-slate-700 transition group shadow-lg"
            >
              <div className="h-36 bg-slate-950 relative flex items-center justify-center border-b border-slate-800">
                <Play className="text-white fill-white opacity-80 group-hover:scale-110 transition-transform" size={40} />
                <span className="absolute top-2 left-2 px-2 py-0.5 bg-red-600 text-white rounded text-[9px] font-extrabold uppercase">VIDEO</span>
              </div>
              <div className="p-4 space-y-1">
                <p className="text-xs font-bold text-white">Access Route Drone Audit</p>
                <p className="text-[10px] font-semibold text-slate-400">Drone survey footage from Site A</p>
              </div>
            </div>

          </div>
        </section>

        {/* Related Citizen Requests Table */}
        <section className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm space-y-0">
          <div className="p-5 border-b border-slate-150 flex justify-between items-center">
            <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Relevant Citizen Requests ({recommendation?.ward})</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input
                type="text"
                placeholder="Search requests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs font-semibold focus:outline-none w-56"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-semibold">
              <thead className="bg-slate-50 border-b border-slate-150 text-slate-400 uppercase text-[10px] font-extrabold">
                <tr>
                  <th className="px-6 py-3">Code</th>
                  <th className="px-6 py-3">Category</th>
                  <th className="px-6 py-3">Ward</th>
                  <th className="px-6 py-3">Sentiment</th>
                  <th className="px-6 py-3">Filing Date</th>
                  <th className="px-6 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredSubs.length > 0 ? (
                  filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 transition">
                      <td className="px-6 py-3.5 font-mono text-indigo-600 font-extrabold">{sub.id}</td>
                      <td className="px-6 py-3.5 font-bold text-slate-800">{sub.category}</td>
                      <td className="px-6 py-3.5">{sub.ward}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 border border-red-100 rounded-full text-[9px] font-extrabold">
                          {sub.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-400">{sub.date}</td>
                      <td className="px-6 py-3.5 text-right">
                        <button 
                          onClick={() => router.push("/review")}
                          className="text-indigo-600 hover:underline font-bold text-[10px] uppercase"
                        >
                          View Review Queue
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-400">
                      No citizen requests match current query.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* Floating AI Assistant FAB */}
        <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
          <button
            onClick={() => router.push("/assistant")}
            className="w-14 h-14 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full shadow-2xl flex items-center justify-center group active:scale-90 transition cursor-pointer"
            title="Open AI Planning Assistant"
          >
            <Sparkles size={24} className="group-hover:rotate-12 transition-transform" />
          </button>
        </div>

      </div>
    </MainLayout>
  );
}
