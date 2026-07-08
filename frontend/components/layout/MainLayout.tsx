"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Lock, ArrowRight, UserCheck, AlertTriangle, Key, Loader2, Sparkles, Building, Landmark } from "lucide-react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

interface UserProfile {
  name: string;
  role: "citizen" | "ward_officer" | "department_officer" | "commissioner" | "admin";
  roleLabel: string;
  department?: string;
  ward?: string;
  clearances: string[];
}

const ROLE_PROFILES: Record<string, UserProfile> = {
  citizen: {
    name: "Rajesh Patel",
    role: "citizen",
    roleLabel: "Citizen Portal Access",
    clearances: ["File Grievance Requests", "Track Public Timeline", "View Public GIS Map"],
  },
  ward_officer: {
    name: "Vikram Sarabhai",
    role: "ward_officer",
    roleLabel: "Ward 5 Supervisor",
    ward: "Ward 5 - Central",
    clearances: ["Moderate Ward Grievances", "Update SLA Milestones", "Access AI Chat Copilot"],
  },
  department_officer: {
    name: "S. K. Sharma",
    role: "department_officer",
    roleLabel: "A.E.E. Grade-1 (PWD)",
    department: "Public Works Department (PWD)",
    clearances: ["Authorize Department Budgets", "Moderate Infrastructure Tickets", "Access AI Chat Copilot"],
  },
  commissioner: {
    name: "Lokesh Varma",
    role: "commissioner",
    roleLabel: "Municipal Commissioner",
    clearances: ["Master Override Controls", "Budget Re-allocation", "Full Analytics Export", "Moderate All Tickets", "Access AI Chat Copilot"],
  },
  admin: {
    name: "NIC Sysadmin Unit",
    role: "admin",
    roleLabel: "System Administrator",
    clearances: ["Modify Access Policies", "System Log Analytics", "Manage Dashboard Integrations", "Database Access & Audit Logs"],
  }
};

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedRoleKey, setSelectedRoleKey] = useState<string>("commissioner");
  
  const [loginStep, setLoginStep] = useState<"role" | "otp" | "loading">("role");
  const [credentialInput, setCredentialInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpCountdown, setOtpCountdown] = useState(30);
  const [presentationActive, setPresentationActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const active = localStorage.getItem("civitas_presentation_mode") === "true";
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentationActive(active);
      if (active) {
        document.body.classList.add("presentation-mode");
      } else {
        document.body.classList.remove("presentation-mode");
      }

      const handlePresentation = () => {
        const isPresenting = localStorage.getItem("civitas_presentation_mode") === "true";
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPresentationActive(isPresenting);
        if (isPresenting) {
          document.body.classList.add("presentation-mode");
        } else {
          document.body.classList.remove("presentation-mode");
        }
      };

      window.addEventListener("civitas_presentation_change", handlePresentation);
      return () => window.removeEventListener("civitas_presentation_change", handlePresentation);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
    if (typeof window !== "undefined") {
      const loggedIn = localStorage.getItem("civitas_auth_logged_in") === "true";
      const token = localStorage.getItem("civitas_auth_token");
      if (loggedIn && !token) {
        localStorage.setItem("civitas_auth_logged_in", "false");
        setIsLoggedIn(false);
      } else {
        setIsLoggedIn(loggedIn);
      }
    }
  }, []);

  // Timer logic for simulated OTP countdown
  useEffect(() => {
    if (loginStep === "otp" && otpCountdown > 0) {
      const timer = setTimeout(() => setOtpCountdown(prev => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [loginStep, otpCountdown]);

  if (!isClient) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-xs font-bold text-slate-400 uppercase tracking-widest">
        Verifying Government Security Tokens...
      </div>
    );
  }

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialInput.trim()) return;
    setLoginStep("loading");
    setTimeout(() => {
      setLoginStep("otp");
      setOtpCountdown(30);
      setOtpInput("123456"); // Pre-filled mock OTP for smooth auditing
    }, 800);
  };

  const ROLE_CREDENTIALS: Record<string, { username: string; password: string }> = {
    citizen: { username: "citizen_lokesh", password: "citizenPassword123" },
    ward_officer: { username: "officer_rajesh", password: "officerPassword123" },
    department_officer: { username: "dept_officer_priya", password: "deptPassword123" },
    commissioner: { username: "commissioner_amit", password: "commissionerPassword123" },
    admin: { username: "admin_system", password: "adminPassword123" }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginStep("loading");
    try {
      const credentials = ROLE_CREDENTIALS[selectedRoleKey];
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
      
      const response = await fetch(`${apiBaseUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(credentials)
      });
      
      if (!response.ok) {
        throw new Error("Failed to authenticate with backend Parichay registry");
      }
      
      const data = await response.json();
      const token = data.access_token;
      
      if (typeof window !== "undefined") {
        const profile = ROLE_PROFILES[selectedRoleKey];
        localStorage.setItem("civitas_auth_logged_in", "true");
        localStorage.setItem("civitas_auth_token", token);
        localStorage.setItem("civitas_user_role", profile.role);
        localStorage.setItem("civitas_user_name", profile.name);
        localStorage.setItem("civitas_user_profile", JSON.stringify(profile));
        window.dispatchEvent(new Event("civitas_auth_change"));
        window.dispatchEvent(new Event("civitas_demo_change")); // Trigger UI updates
      }
      setIsLoggedIn(true);
      setLoginStep("role");
    } catch (err) {
      console.error("SSO Auth error:", err);
      alert("SSO Identity registry authentication failure. Make sure the backend server is running.");
      setLoginStep("role");
    }
  };

  // Secure Sign Out Helper
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("civitas_auth_logged_in", "false");
      localStorage.removeItem("civitas_auth_token");
      localStorage.removeItem("civitas_user_role");
      localStorage.removeItem("civitas_user_name");
      localStorage.removeItem("civitas_user_profile");
      window.dispatchEvent(new Event("civitas_auth_change"));
      window.dispatchEvent(new Event("civitas_demo_change"));
    }
    setIsLoggedIn(false);
  };

  // Check Role Permissions based on paths
  const activeRole = (typeof window !== "undefined" ? localStorage.getItem("civitas_user_role") : "commissioner") || "commissioner";
  
  const isRestricted = () => {
    if (activeRole === "admin" || activeRole === "commissioner") return false;
    
    // Citizens cannot view review queues or assistant page
    if (activeRole === "citizen") {
      if (pathname === "/review" || pathname === "/assistant") return true;
    }
    
    // Ward Officers can access dashboard, analytics, submit, assistant, review (for their ward)
    // Dept Officers can access PWD metrics
    return false;
  };

  // Government Single Sign-On (Parichay Smart-SSO Gateway) Page
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col font-sans relative overflow-hidden select-none">
        
        {/* National Informatics Centre Top Banner */}
        <div className="bg-slate-950 border-b border-slate-800 py-2.5 px-6 flex justify-between items-center text-[10px] font-bold text-slate-400 tracking-wider">
          <div className="flex items-center gap-2">
            <span className="text-amber-500 font-extrabold uppercase">Government of India</span>
            <span className="text-slate-700">|</span>
            <span>Ministry of Electronics & Information Technology (MeitY)</span>
          </div>
          <div className="flex items-center gap-1.5 uppercase text-indigo-400 font-extrabold">
            <ShieldCheck size={11} />
            <span>NIC Secure Sign-On Portal</span>
          </div>
        </div>

        {/* Outer Login Body Frame */}
        <div className="flex-1 flex items-center justify-center p-6 relative z-10">
          
          <div className="w-full max-w-lg bg-slate-950 border border-slate-850 rounded-2xl p-6 shadow-2xl space-y-6 relative">
            
            {/* National Crest & Smart Cities Mission Emblems */}
            <div className="flex justify-between items-center border-b border-slate-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  <Landmark size={20} className="text-indigo-400" />
                </div>
                <div>
                  <h2 className="text-xs font-extrabold uppercase text-slate-100 tracking-wider leading-tight">Parichay Smart-SSO</h2>
                  <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">National Single Sign-On Platform</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2 bg-indigo-950/40 border border-indigo-900/50 rounded-xl px-3 py-1">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-pulse"></span>
                <span className="text-[9px] font-extrabold uppercase text-indigo-300 tracking-wider">Smart Cities Mission</span>
              </div>
            </div>

            {/* Step 1: Role Configuration selection */}
            {loginStep === "role" && (
              <form onSubmit={handleSendOTP} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Select Security Role Profile</label>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(ROLE_PROFILES).map(([key, profile]) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setSelectedRoleKey(key)}
                        className={`p-3 border rounded-xl flex flex-col justify-between text-left transition cursor-pointer ${
                          selectedRoleKey === key
                            ? "bg-indigo-950/30 border-indigo-650 text-slate-100 ring-1 ring-indigo-650"
                            : "bg-slate-900/40 border-slate-850 text-slate-400 hover:bg-slate-900/80 hover:text-slate-200"
                        }`}
                      >
                        <span className="font-extrabold text-[11px] capitalize">{key.replace("_", " ")}</span>
                        <span className="text-[8px] opacity-75 font-semibold mt-1 leading-normal">{profile.roleLabel}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    {selectedRoleKey === "citizen" ? "Aadhaar / Mobile Number" : "Government Email Address (@nic.in / @gov.in)"}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Lock size={12} />
                    </span>
                    <input
                      type={selectedRoleKey === "citizen" ? "text" : "email"}
                      required
                      placeholder={selectedRoleKey === "citizen" ? "Enter Aadhaar or 10-digit mobile" : "officer-id@nic.in"}
                      value={credentialInput}
                      onChange={(e) => setCredentialInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-xs text-slate-200 font-bold placeholder-slate-600 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-650 border border-indigo-600 text-white rounded-xl font-extrabold uppercase tracking-wider text-[10px] hover:bg-indigo-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-indigo-900/20"
                >
                  <span>Request Secure OTP</span>
                  <ArrowRight size={12} />
                </button>
              </form>
            )}

            {/* Step 2: OTP Verification panel */}
            {loginStep === "otp" && (
              <form onSubmit={handleVerifyOTP} className="space-y-4 text-xs">
                <div className="bg-indigo-950/20 border border-indigo-900/40 p-4 rounded-xl space-y-1 text-center">
                  <p className="text-[10px] font-extrabold uppercase text-indigo-300">Simulated Secure OTP Dispatched</p>
                  <p className="text-[9px] text-slate-450 leading-relaxed font-semibold">
                    Sent to credentials registered with {ROLE_PROFILES[selectedRoleKey].name}.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Enter Verification Code</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500">
                      <Key size={12} />
                    </span>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpInput}
                      onChange={(e) => setOtpInput(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-850 rounded-xl pl-9 pr-4 py-2.5 text-center text-sm font-extrabold tracking-widest text-slate-200 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-650 border border-emerald-600 text-white rounded-xl font-extrabold uppercase tracking-wider text-[10px] hover:bg-emerald-600 transition flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-900/20"
                >
                  <UserCheck size={12} />
                  <span>Verify OTP & Sign In</span>
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setLoginStep("role")}
                    className="text-[9px] font-extrabold uppercase text-slate-500 hover:text-slate-400 underline"
                  >
                    Change Credentials
                  </button>
                </div>
              </form>
            )}

            {/* Simulated Authenticating Load step */}
            {loginStep === "loading" && (
              <div className="py-8 flex flex-col items-center justify-center space-y-4">
                <Loader2 className="animate-spin text-indigo-400" size={32} />
                <div className="text-center space-y-1">
                  <p className="text-[10px] font-extrabold uppercase text-slate-100 tracking-wider">Validating Credentials</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-wider">Connecting to NIC parichay registry...</p>
                </div>
              </div>
            )}

            <div className="border-t border-slate-850 pt-4 text-center">
              <p className="text-[8px] text-slate-600 font-extrabold uppercase tracking-widest">
                This is a secure Government system. Unauthorized entry is strictly prohibited and subject to legal prosecution.
              </p>
            </div>

          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 border-t border-slate-850 py-3 text-center text-[9px] font-bold text-slate-500 uppercase tracking-wider">
          Managed by National Informatics Centre (NIC) &bull; Civitas AI v2.5.4
        </div>

      </div>
    );
  }

  // Access Restriction Policy Guard screen
  if (isRestricted()) {
    return (
      <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
        <Sidebar />

        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />

          <main className="p-8 flex-grow flex items-center justify-center">
            <div className="w-full max-w-md bg-white border border-red-200 rounded-2xl p-6 shadow-md flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-red-650">
                <AlertTriangle size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-850 uppercase tracking-wide">Access Policy Restriction</h3>
                <p className="text-[10px] text-slate-450 font-bold uppercase tracking-wider">Security clearance insufficient</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                Your role <strong className="text-slate-800 uppercase text-[10px]">{activeRole}</strong> is restricted from accessing the <strong className="text-indigo-650">{pathname}</strong> environment under Government Data Protection Regulations.
              </p>
              <div className="w-full border-t border-slate-100 pt-4 flex flex-col gap-2">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition cursor-pointer"
                >
                  Switch Security Role
                </button>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // Regular Authorized App Interface Layout
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900 relative">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />

        {presentationActive && (
          <div className="bg-indigo-950 text-indigo-300 border-b border-indigo-900 py-2 px-8 flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest animate-pulse z-30">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
              <span>Live Projection Screen Optimization Active</span>
            </div>
            <div className="text-slate-450 font-bold">
              Demo Session Active
            </div>
          </div>
        )}

        <main className={`${presentationActive ? "p-12 pb-24" : "p-8"} flex-grow transition-all duration-300`}>
          {children}
        </main>

        {presentationActive && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded-full px-6 py-3.5 flex items-center gap-6 shadow-2xl text-[9px] font-extrabold uppercase tracking-widest text-slate-450">
            <Link href="/dashboard" className={`hover:text-slate-100 transition ${pathname === "/dashboard" ? "text-indigo-400" : ""}`}>
              Dashboard
            </Link>
            <Link href="/analytics" className={`hover:text-slate-100 transition ${pathname === "/analytics" ? "text-indigo-400" : ""}`}>
              GIS Map
            </Link>
            <Link href="/review" className={`hover:text-slate-100 transition ${pathname === "/review" ? "text-indigo-400" : ""}`}>
              Review Centre
            </Link>
            <Link href="/submit" className={`hover:text-slate-100 transition ${pathname === "/submit" ? "text-indigo-400" : ""}`}>
              Redress Portal
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}