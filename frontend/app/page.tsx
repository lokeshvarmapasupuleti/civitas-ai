"use client";

import Link from "next/link";
import { 
  ShieldCheck, ArrowRight, MapPin, Building, Activity, FileText, 
  CheckCircle2, Users, Settings, BrainCircuit, Globe, BarChart3, HelpCircle
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col justify-between">
      
      {/* Top Government of India Header Bar */}
      <div className="bg-slate-900 text-[10px] text-slate-300 py-1.5 px-6 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex justify-between items-center font-bold tracking-wider uppercase">
          <div className="flex items-center gap-3">
            <span>Government of India</span>
            <span className="text-slate-500">|</span>
            <span>Ministry of Housing and Urban Affairs</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline">Smart Cities Mission</span>
            <span>Digital India</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="bg-white border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-600/10">
              <ShieldCheck size={20} />
            </div>
            <div>
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-orange-655">National Portal</div>
              <h1 className="text-sm font-extrabold text-slate-850 tracking-tight leading-none mt-0.5">Civitas AI Governance</h1>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-wider text-slate-500">
            <a href="#stats" className="hover:text-indigo-600 transition">Metrics</a>
            <a href="#modules" className="hover:text-indigo-600 transition">Modules</a>
            <a href="#how-it-works" className="hover:text-indigo-600 transition">How it Works</a>
            <a href="#benefits" className="hover:text-indigo-600 transition">Benefits</a>
          </nav>

          <div className="flex items-center gap-3">
            <Link 
              href="/submit" 
              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
            >
              Share a Priority
            </Link>
            <Link 
              href="/dashboard"
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer"
            >
              Open Planning Desk
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-16 md:py-24 bg-white border-b border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full text-[10px] font-extrabold uppercase tracking-wider text-indigo-755">
              <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-ping"></span>
              National AI Priorities & Planning Intelligence System
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-slate-850 tracking-tight leading-tight">
              AI-Powered Planning for People’s Priorities
            </h1>
            
            <p className="text-base text-slate-500 max-w-2xl leading-relaxed font-semibold">
              Helping elected representatives and departments understand what citizens need most, prioritize development projects, and plan smarter interventions with Artificial Intelligence.
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link 
                href="/dashboard"
                className="px-6 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition shadow-lg shadow-indigo-600/15 cursor-pointer active:scale-95"
              >
                Open Planning Desk
              </Link>
              <Link 
                href="/submit"
                className="px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-800 border border-slate-250 text-xs font-bold uppercase tracking-wider rounded-xl transition cursor-pointer"
              >
                Share a Priority
              </Link>
            </div>
          </div>

          {/* Abstract Civic Map illustration */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-6 w-full max-w-sm space-y-4 shadow-sm relative">
              <div className="flex justify-between items-center border-b border-slate-150 pb-2">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">NIC Live Node Grid</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              </div>
              
              {/* Graphic grid representing city structure */}
              <div className="grid grid-cols-4 gap-2 h-36">
                {Array.from({ length: 16 }).map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`rounded-lg border transition duration-300 flex items-center justify-center ${
                      idx === 2 || idx === 7 || idx === 13
                        ? "bg-red-50 border-red-200 text-red-500"
                        : idx === 5 || idx === 10
                        ? "bg-indigo-50 border-indigo-200 text-indigo-500"
                        : "bg-white border-slate-100"
                    }`}
                  >
                    {idx === 2 && <Building size={14} />}
                    {idx === 5 && <MapPin size={14} />}
                    {idx === 10 && <BrainCircuit size={14} />}
                  </div>
                ))}
              </div>

              <div className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Geospatial Ward Density Map Log
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Statistics Row */}
      <section id="stats" className="bg-slate-900 text-white py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-5 gap-8 text-center">
          <div className="space-y-1">
            <h4 className="text-3xl font-extrabold tracking-tight">12+</h4>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Municipal Depts</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-extrabold tracking-tight">150K+</h4>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Citizen Priorities</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-extrabold tracking-tight text-emerald-400">96.4%</h4>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Classification Accuracy</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-extrabold tracking-tight text-indigo-400">4.2 hrs</h4>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Avg Response Time</p>
          </div>
          <div className="space-y-1">
            <h4 className="text-3xl font-extrabold tracking-tight text-orange-400">92%</h4>
            <p className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider">Resolution Rate</p>
          </div>
        </div>
      </section>

      {/* Platform Modules Cards */}
      <section id="modules" className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-left border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-slate-850 uppercase tracking-tight">Official System Modules</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Secure modules designed for planning and delivery</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link 
            href="/submit" 
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:border-indigo-500 transition duration-300 space-y-4 group block cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650 w-fit">
              <Users size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition">Community Priorities</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Share development needs and local concerns with ward-level mapping and landmark context.
            </p>
          </Link>

          <Link 
            href="/review" 
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:border-indigo-500 transition duration-300 space-y-4 group block cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650 w-fit">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition">Planning Review Centre</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Dedicated review queues with AI priority flags, ward context, and planning notes for decision makers.
            </p>
          </Link>

          <Link 
            href="/dashboard" 
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:border-indigo-500 transition duration-300 space-y-4 group block cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650 w-fit">
              <Building size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition">Planning Dashboard</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Decision support metrics on recurring needs, hotspot clusters, department demand, and project readiness.
            </p>
          </Link>

          <Link 
            href="/analytics" 
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:border-indigo-500 transition duration-300 space-y-4 group block cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650 w-fit">
              <MapPin size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition">Hotspot Intelligence</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Visual map layers showing rising development needs, repeated themes, and priority hotspots by ward.
            </p>
          </Link>

          <Link 
            href="/assistant" 
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:border-indigo-500 transition duration-300 space-y-4 group block cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650 w-fit">
              <BrainCircuit size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition">AI Planning Advisor</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              AI-guided planning support that summarizes demand patterns and suggests next steps for constituency projects.
            </p>
          </Link>

          <Link 
            href="/analytics" 
            className="bg-white border border-slate-200 p-6 rounded-xl shadow-xs hover:border-indigo-500 transition duration-300 space-y-4 group block cursor-pointer"
          >
            <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-lg text-indigo-650 w-fit">
              <BarChart3 size={18} />
            </div>
            <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-tight group-hover:text-indigo-600 transition">Planning Analytics</h3>
            <p className="text-slate-500 text-xs font-semibold leading-relaxed">
              Ward statistics, demand diagnostics, and budget forecasting for development planning.
            </p>
          </Link>
        </div>
      </section>

      {/* How it works Timeline */}
      <section id="how-it-works" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <div className="text-left border-b border-slate-200 pb-3">
            <h2 className="text-xl font-extrabold text-slate-850 uppercase tracking-tight">Planning Workflow</h2>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">End-to-end pathway for turning citizen input into actionable projects</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 gap-6 relative">
            {[
              { step: "01", title: "Lodge Grievance", desc: "Citizen files details & GPS cords via portal." },
              { step: "02", title: "AI Analysis", desc: "Extracts keywords and flags urgency priority." },
              { step: "03", title: "Routing", desc: "Automated routing to corresponding PWD wing." },
              { step: "04", title: "Officer Review", desc: "Commissioner inspects details & logs notes." },
              { step: "05", title: "Resolution", desc: "Engineering cell dispatched to fix issue." },
              { step: "06", title: "Feedback", desc: "Citizen rates action SLA timelines." }
            ].map((stepObj) => (
              <div key={stepObj.step} className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 shadow-2xs">
                <span className="text-indigo-600 text-sm font-black">{stepObj.step}</span>
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">{stepObj.title}</h4>
                <p className="text-[10px] text-slate-450 leading-relaxed font-semibold">{stepObj.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section id="benefits" className="py-20 max-w-7xl mx-auto px-6 w-full space-y-12">
        <div className="text-left border-b border-slate-200 pb-3">
          <h2 className="text-xl font-extrabold text-slate-850 uppercase tracking-tight">System Benefits</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">Regional advantages across stakeholders</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-orange-655">For Citizens</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Simplified 5-step lodging portal, automated confirmation receipts, and visual tracking maps.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-indigo-755">For Officers</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              3-panel workspace queue with direct AI recommendation cards and internal inspection tools.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-indigo-755">For Commissioners</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              Executive KPI meters tracking budget forecasts, SLA timelines, and citizen satisfaction ratings.
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-emerald-700">For Smart Cities</h3>
            <p className="text-xs text-slate-500 leading-relaxed font-semibold">
              GIS hotspot tracking, infrastructure health analytics, and data-driven budget planning.
            </p>
          </div>
        </div>
      </section>

      {/* Footer in Official Government Style */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 px-6 border-t border-slate-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-white">
              <ShieldCheck className="text-indigo-500" size={24} />
              <span className="font-extrabold text-sm uppercase tracking-wider">Civitas AI Platform</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Designed and built under the Smart Cities Mission framework for modern AI governance.
            </p>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Useful Links</h4>
            <ul className="space-y-2 text-[10px]">
              <li><a href="#" className="hover:text-white transition">Ministry of Urban Affairs</a></li>
              <li><a href="#" className="hover:text-white transition">Digital India Portal</a></li>
              <li><a href="#" className="hover:text-white transition">National Informatics Centre</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Policies</h4>
            <ul className="space-y-2 text-[10px]">
              <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition">Accessibility Statement</a></li>
              <li><a href="#" className="hover:text-white transition">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white text-xs font-bold uppercase tracking-wider mb-3">Support</h4>
            <p className="text-[10px] leading-relaxed">
              NIC Helpdesk: 1800-111-222<br />
              Email: support-civitas@nic.in<br />
              Version: 3.1.0-GOI
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto border-t border-slate-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between text-[9px] text-slate-550 font-bold uppercase tracking-wider">
          <span>&copy; {new Date().getFullYear()} Ministry of Housing & Urban Affairs. All rights reserved.</span>
          <span className="mt-2 sm:mt-0 flex items-center gap-2">
            <Globe size={10} />
            National Informatics Centre Grid (NIC)
          </span>
        </div>
      </footer>

    </div>
  );
}