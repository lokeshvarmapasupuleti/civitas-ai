"use client";

import { useEffect, useState } from "react";
import { Search, Bell, Sun, Compass, RefreshCw, Loader2, Sparkles, Check, MailOpen, BellOff, LogOut, Key, UserCheck } from "lucide-react";
import { usePathname } from "next/navigation";

interface UserProfile {
  name: string;
  role: string;
  roleLabel: string;
  clearances: string[];
}

const PIPELINE_STAGES = [
  "Ingesting priority submission...",
  "Running NLP demand classification...",
  "Calculating urgency and impact...",
  "Routing to the relevant department...",
  "Broadcasting planning alerts...",
  "Demo priority submitted successfully!"
];

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  category: "Critical" | "Department" | "Citizen" | "AI";
  timeGroup: "Today" | "Yesterday" | "Earlier";
  timeLabel: string;
  read: boolean;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: "notif-1",
    title: "High-priority need escalated",
    description: "Critical development need escalated automatically to the district planning desk.",
    category: "Critical",
    timeGroup: "Today",
    timeLabel: "10m ago",
    read: false
  },
  {
    id: "notif-2",
    title: "AI detected a duplicate priority signal",
    description: "A similar road repair request was flagged in Ward 5 and linked to the existing planning case.",
    category: "AI",
    timeGroup: "Today",
    timeLabel: "2h ago",
    read: false
  },
  {
    id: "notif-3",
    title: "Road works assigned in Ward 8",
    description: "Implementation task routed for the paving corridor near Civil Hospital Road.",
    category: "Department",
    timeGroup: "Yesterday",
    timeLabel: "1d ago",
    read: true
  },
  {
    id: "notif-4",
    title: "Planning budget approved for urgent works",
    description: "Contingency allocation authorized for the storm sewer repair corridor.",
    category: "Critical",
    timeGroup: "Yesterday",
    timeLabel: "1d ago",
    read: true
  },
  {
    id: "notif-5",
    title: "Water access restored in Ward 3",
    description: "Pump repairs completed and service continuity restored for nearby streets.",
    category: "Citizen",
    timeGroup: "Earlier",
    timeLabel: "3d ago",
    read: true
  },
  {
    id: "notif-6",
    title: "Monthly planning brief generated",
    description: "Constituency demand and project trend report published to the planning records.",
    category: "AI",
    timeGroup: "Earlier",
    timeLabel: "5d ago",
    read: true
  }
];

export default function Navbar() {
  const pathname = usePathname();
  const [demoActive, setDemoActive] = useState(false);
  const [showPipeline, setShowPipeline] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const [presentationActive, setPresentationActive] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      const handlePresentation = () => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPresentationActive(localStorage.getItem("civitas_presentation_mode") === "true");
      };
      window.addEventListener("civitas_presentation_change", handlePresentation);
      return () => window.removeEventListener("civitas_presentation_change", handlePresentation);
    }
  }, []);

  const togglePresentationMode = () => {
    const nextVal = !presentationActive;
    if (typeof window !== "undefined") {
      localStorage.setItem("civitas_presentation_mode", nextVal ? "true" : "false");
      window.dispatchEvent(new Event("civitas_presentation_change"));
    }
    setPresentationActive(nextVal);
  };
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  // Notification center states
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [filterCategory, setFilterCategory] = useState<string>("All");

  // User Profile permissions states
  const [profile, setProfile] = useState<UserProfile | null>({
    name: "Lokesh Varma",
    role: "commissioner",
    roleLabel: "Planning Lead",
    clearances: ["Review Priority Signals", "Approve Allocations", "Export Planning Reports", "Moderate Development Requests", "Access AI Copilot"],
  });

  const loadProfile = () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("civitas_user_profile");
      if (stored) {
        try {
          setProfile(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      } else {
        setProfile({
          name: "Lokesh Varma",
          role: "commissioner",
          roleLabel: "Planning Lead",
          clearances: ["Review Priority Signals", "Approve Allocations", "Export Planning Reports", "Moderate Development Requests", "Access AI Copilot"],
        });
      }
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDemoActive(localStorage.getItem("civitas_demo_mode") === "true");
    }
    loadProfile();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.addEventListener("civitas_auth_change", loadProfile);
      return () => window.removeEventListener("civitas_auth_change", loadProfile);
    }
  }, []);

  // Sync Demo Mode grievance as an unread critical notification
  useEffect(() => {
    if (demoActive) {
      const demoNotifExists = notifications.some(n => n.id === "notif-demo");
      if (!demoNotifExists) {
        const demoNotif: NotificationItem = {
          id: "notif-demo",
          title: "New Priority Signal Received",
          description: "AI successfully routed the road repair request to the relevant implementation hub.",
          category: "Critical",
          timeGroup: "Today",
          timeLabel: "Just now",
          read: false
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setNotifications(prev => [demoNotif, ...prev]);
      }
    } else {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setNotifications(prev => prev.filter(n => n.id !== "notif-demo"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demoActive]);

  const getBreadcrumbs = () => {
    if (!pathname || pathname === "/") return ["Civitas AI", "Landing Page"];
    const paths = pathname.split("/").filter(Boolean);
    return [
      "Civitas AI",
      ...paths.map(
        (p) =>
          p.charAt(0).toUpperCase() + p.slice(1).replace("-", " ")
      ),
    ];
  };

  const breadcrumbs = getBreadcrumbs();

  const startDemoSimulation = () => {
    setShowPipeline(true);
    setPipelineStep(0);
    setToastMsg("");

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      if (currentStep < PIPELINE_STAGES.length) {
        setPipelineStep(currentStep);
      } else {
        clearInterval(interval);
        
        const demoGrievance = {
          id: "CIV-8204-GJ",
          category: "Road Repair",
          ward: "Ward 5 - Central",
          description: "Critical pothole cluster detected on the main highway corridor near Civil Hospital, causing immediate safety hazard for public transport buses.",
          date: "2026-07-07",
          sentiment: "Critical/Angry",
          status: "Pending",
          reporter_name: "Rajesh Patel",
          audio_path: null,
          image_path: null
        };

        if (typeof window !== "undefined") {
          localStorage.setItem("civitas_demo_mode", "true");
          localStorage.setItem("civitas_demo_grievance", JSON.stringify(demoGrievance));
          window.dispatchEvent(new Event("civitas_demo_change"));
        }

        setDemoActive(true);
        setShowPipeline(false);
        setToastMsg("New Priority Signal Detected");
        setTimeout(() => setToastMsg(""), 3500);
      }
    }, 600);
  };

  const toggleDemoMode = () => {
    if (demoActive) {
      if (typeof window !== "undefined") {
        localStorage.setItem("civitas_demo_mode", "false");
        localStorage.removeItem("civitas_demo_grievance");
        window.dispatchEvent(new Event("civitas_demo_change"));
      }
      setDemoActive(false);
      setToastMsg("Demo Mode Disabled");
      setTimeout(() => setToastMsg(""), 2000);
    } else {
      startDemoSimulation();
    }
  };

  const restartDemo = (e: React.MouseEvent) => {
    e.stopPropagation();
    startDemoSimulation();
  };

  // Notification actions
  const handleMarkAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications.filter(n => {
    if (filterCategory === "All") return true;
    return n.category === filterCategory;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case "Critical": return "bg-red-50 text-red-700 border-red-155";
      case "AI": return "bg-indigo-50 text-indigo-755 border-indigo-150";
      case "Citizen": return "bg-emerald-50 text-emerald-700 border-emerald-150";
      case "Department": default: return "bg-slate-50 text-slate-655 border-slate-200";
    }
  };

  // Sign out / Switch Profile Helper
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.setItem("civitas_auth_logged_in", "false");
      localStorage.removeItem("civitas_user_role");
      localStorage.removeItem("civitas_user_name");
      localStorage.removeItem("civitas_user_profile");
      window.dispatchEvent(new Event("civitas_auth_change"));
      window.dispatchEvent(new Event("civitas_demo_change"));
    }
    setShowProfileDropdown(false);
  };

  // Get Initials for profile circle
  const getInitials = (fullName: string | undefined) => {
    if (!fullName) return "MP";
    return fullName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-8 sticky top-0 z-40 shadow-xs">
      
      {/* Left side: Breadcrumbs */}
      <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-500">
        <Compass size={14} className="text-slate-400" />
        {breadcrumbs.map((crumb, i) => (
          <div key={crumb} className="flex items-center gap-2">
            {i > 0 && <span className="text-slate-300 font-normal">/</span>}
            <span
              className={
                i === breadcrumbs.length - 1
                  ? "text-slate-800 font-extrabold"
                  : "hover:text-slate-750 transition"
              }
            >
              {crumb === "Submit" ? "Citizen Requests" : crumb}
            </span>
          </div>
        ))}
      </div>

      {/* Floating Pipeline Overlay */}
      {showPipeline && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white border border-slate-200 rounded-xl p-6 shadow-2xl flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-indigo-650" size={32} />
            <div className="text-center space-y-1">
              <h3 className="text-sm font-extrabold text-slate-850">AI Priority Processing</h3>
              <p className="text-[10px] text-indigo-655 font-bold uppercase tracking-wider">{PIPELINE_STAGES[pipelineStep]}</p>
            </div>
            <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-600 h-full transition-all duration-300"
                style={{ width: `${((pipelineStep + 1) / PIPELINE_STAGES.length) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Alert Banner */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 border border-slate-800 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider animate-in slide-in-from-top duration-300">
          <Sparkles size={14} className="text-indigo-400 animate-pulse" />
          <span>{toastMsg}</span>
          {toastMsg.includes("Detected") && (
            <span className="text-[9px] text-indigo-300 font-mono ml-2">CIV-8204-GJ</span>
          )}
        </div>
      )}

      {/* Right side: Controls */}
      <div className="flex items-center gap-4">
        
        {/* Search Bar */}
        <div className="relative hidden md:block w-44 lg:w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={13} />
          <input
            type="text"
            placeholder="Search telemetry..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-1.5 text-[11px] font-semibold text-slate-800 focus:outline-none"
          />
        </div>

        {/* Demo Mode Controller Widget */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1">
          <button
            onClick={toggleDemoMode}
            className={`px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
              demoActive 
                ? "bg-indigo-50 text-indigo-755 border border-indigo-100" 
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${demoActive ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`}></span>
            Demo Mode
          </button>

          {demoActive && (
            <button
              onClick={restartDemo}
              className="p-1 text-slate-400 hover:text-slate-655 hover:bg-white rounded transition cursor-pointer"
              title="Restart priority simulation"
            >
              <RefreshCw size={11} className="animate-spin-slow" />
            </button>
          )}
        </div>

        {/* Presentation Mode Widget */}
        <button
          onClick={togglePresentationMode}
          className={`px-3 py-2 border rounded-xl text-[9px] font-extrabold uppercase tracking-wider transition cursor-pointer flex items-center gap-1.5 ${
            presentationActive 
              ? "bg-indigo-50 border-indigo-200 text-indigo-755 font-bold" 
              : "bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-555"
          }`}
          title="Toggle Presentation Mode"
        >
          <span>📺</span>
          <span>Presentation Mode</span>
        </button>

        {/* Mock Theme Toggle */}
        <button className="p-2 bg-slate-50 border border-slate-200 text-slate-555 rounded-xl hover:bg-slate-100 transition cursor-pointer" title="Light Theme Active">
          <Sun size={14} />
        </button>

        {/* Notifications Center */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-555 rounded-xl transition cursor-pointer"
          >
            <Bell size={14} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full text-[8px] font-extrabold w-4 h-4 flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Detailed Notification Center Panel */}
          {showNotifications && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-250 rounded-xl shadow-xl p-4 space-y-3 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div>
                  <h4 className="font-extrabold uppercase tracking-wider text-slate-800 text-[10px]">Command Alerts Center</h4>
                  <p className="text-[8px] text-slate-455 font-bold uppercase mt-0.5">Municipal Grid Monitoring</p>
                </div>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllRead}
                    className="text-[9px] font-extrabold uppercase text-indigo-650 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <MailOpen size={10} />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Filters list row */}
              <div className="flex gap-1 overflow-x-auto pb-1.5 scrollbar-thin">
                {["All", "Critical", "Department", "Citizen", "AI"].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-2 py-0.5 text-[8px] font-extrabold uppercase rounded border transition cursor-pointer flex-shrink-0 ${
                      filterCategory === cat
                        ? "bg-indigo-600 text-white border-indigo-650"
                        : "bg-slate-50 text-slate-450 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Categorized Notifications list */}
              <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                {filteredNotifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 space-y-1.5">
                    <BellOff size={16} className="mx-auto text-slate-300" />
                    <p className="text-[9px] font-bold uppercase tracking-wider">No matching alerts found</p>
                  </div>
                ) : (
                  ["Today", "Yesterday", "Earlier"].map(group => {
                    const groupItems = filteredNotifications.filter(n => n.timeGroup === group);
                    if (groupItems.length === 0) return null;

                    return (
                      <div key={group} className="space-y-2">
                        <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-50 pb-0.5">{group}</span>
                        {groupItems.map(item => (
                          <div 
                            key={item.id} 
                            className={`p-2.5 border rounded-lg transition relative flex flex-col justify-between ${
                              item.read 
                                ? "bg-slate-50/30 border-slate-150" 
                                : "bg-indigo-50/10 border-indigo-100/60 ring-l-2 ring-indigo-550"
                            }`}
                          >
                            <div className="flex justify-between items-start gap-1">
                              <span className="font-bold text-[11px] text-slate-800 leading-tight pr-3">{item.title}</span>
                              <span className="text-[7px] text-slate-400 font-bold whitespace-nowrap">{item.timeLabel}</span>
                            </div>

                            <p className="text-[10px] text-slate-500 leading-normal mt-1 pr-4">{item.description}</p>

                            <div className="flex justify-between items-center mt-2">
                              <span className={`text-[7px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${getCategoryColor(item.category)}`}>
                                {item.category}
                              </span>

                              {!item.read && (
                                <button
                                  onClick={() => handleMarkAsRead(item.id)}
                                  className="text-slate-400 hover:text-indigo-650 p-0.5 rounded hover:bg-slate-100 transition cursor-pointer"
                                  title="Mark as read"
                                >
                                  <Check size={11} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Credential dropdown */}
        <div className="relative">
          <button 
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
            className="flex items-center gap-2.5 pl-3 border-l border-slate-200 hover:opacity-90 transition cursor-pointer text-left"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-650 flex items-center justify-center text-white font-extrabold text-[10px] shadow-sm">
              {getInitials(profile?.name)}
            </div>
            <div className="hidden sm:block">
              <h4 className="text-[10px] font-extrabold text-slate-850 leading-tight">{profile?.name}</h4>
              <p className="text-[8px] font-bold text-slate-450 uppercase tracking-wider mt-0.5">{profile?.roleLabel}</p>
            </div>
          </button>

          {/* Permissions UI & Switch Profile dropdown */}
          {showProfileDropdown && (
            <div className="absolute right-0 mt-3 w-76 bg-white border border-slate-250 rounded-xl shadow-xl p-4 space-y-4 z-50 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-150">
              
              <div className="border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-extrabold text-xs">
                    {getInitials(profile?.name)}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-slate-850">{profile?.name}</h5>
                    <span className="inline-block mt-0.5 px-1.5 py-0.2 text-[7px] font-extrabold uppercase bg-indigo-50 text-indigo-755 border border-indigo-150 rounded">
                      {profile?.role.replace("_", " ")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Permissions List UI */}
              <div className="space-y-2">
                <span className="text-[8px] font-bold text-slate-450 uppercase tracking-wider flex items-center gap-1">
                  <Key size={10} className="text-slate-400" />
                  Active Security Clearances
                </span>
                <div className="bg-slate-50 border border-slate-200/60 rounded-lg p-2.5 space-y-1.5 max-h-32 overflow-y-auto">
                  {profile?.clearances?.map((clearance: string) => (
                    <div key={clearance} className="flex items-start gap-1.5 text-[9px] font-semibold text-slate-600">
                      <UserCheck size={10} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{clearance}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sign out and switch role controls */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-1.5">
                <button
                  onClick={handleLogout}
                  className="w-full py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[9px] font-extrabold uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <LogOut size={10} />
                  <span>Switch Security Role</span>
                </button>
              </div>

            </div>
          )}
        </div>

      </div>
    </header>
  );
}