"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  MessageSquare, Plus, Search, X, Check, Loader2, AlertCircle, 
  Sparkles, Calendar, Clock, Building, ArrowRight, Clipboard,
  MapPin, Navigation, Info, Upload, Trash2, FileText, Download,
  Volume2, ChevronRight, CheckCircle2, Mic, Landmark, Smartphone, Globe, Mail,
  ShieldCheck, HelpCircle
} from "lucide-react";
import { api, Submission } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

const SubmissionMap = dynamic(() => import("./SubmissionMap"), {
  ssr: false,
  loading: () => (
    <div className="bg-slate-100 rounded-xl h-44 flex items-center justify-center animate-pulse">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Loading Map Frame...</span>
    </div>
  )
});

const CATEGORIES_MAPPING = [
  { name: "Road Repair", label: "Roads & Highways", desc: "Potholes, road cuts, maintenance" },
  { name: "Water Supply", label: "Water Infrastructure", desc: "Leaks, pressure loss, contamination" },
  { name: "Street Lighting", label: "Electrical & Lighting", desc: "Streetlight repair, cable hazards" },
  { name: "Sanitation", label: "Sanitation & Drainage", desc: "Sewage overflow, garbage clearing" },
  { name: "Public Transport", label: "Transit & Traffic", desc: "Bus shelters, road signs, traffic flow" },
  { name: "Healthcare Access", label: "Healthcare & Safety", desc: "Primary health center access" }
];

const STATES = ["Gujarat", "Maharashtra", "Delhi", "Karnataka", "Tamil Nadu"];
const DISTRICTS = ["Rajkot", "Ahmedabad", "Surat", "Vadodara", "Jamnagar"];
const CITIES = ["Rajkot", "Gondal", "Morbi", "Jetpur"];
const WARDS = Array.from({ length: 12 }, (_, i) => `Ward ${i + 1}`);

const PIPELINE_STAGES = [
  "Receiving Complaint",
  "Extracting Information",
  "Classifying Department",
  "Checking Similar Cases",
  "Calculating Priority",
  "Estimating Resources",
  "Assigning Responsible Department",
  "Generating Executive Summary",
  "Preparing Acknowledgement"
];

const getDepartmentForCategory = (category: string) => {
  switch (category) {
    case "Healthcare Access":
      return "Department of Health & Family Welfare";
    case "Sanitation":
      return "Urban Sanitation & Waste Management Department";
    case "Road Repair":
      return "Public Works Department (PWD)";
    case "Street Lighting":
      return "Electrical Division & Energy Department";
    case "Water Supply":
      return "Municipal Water Supply & Sewerage Board";
    case "Public Transport":
      return "Transit Authority & Road Traffic Board";
    default:
      return "General Municipal Administration Division";
  }
};

const getResolutionTimeForPriority = (priority: string) => {
  switch (priority.toLowerCase()) {
    case "high":
    case "critical":
    case "emergency":
      return "24 Hours (SLA Target)";
    case "medium":
    case "concerned":
      return "3-5 Business Days (SLA Target)";
    case "low":
    default:
      return "7-10 Business Days (SLA Target)";
  }
};

export default function SubmitPage() {
  const [requests, setRequests] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Tab selector: "wizard" | "history"
  const [activeTab, setActiveTab] = useState<"wizard" | "history">("wizard");

  // Wizard Step counter
  const [wizardStep, setWizardStep] = useState(1);

  // Step 1: Citizen details
  const [citizenName, setCitizenName] = useState("");
  const [citizenPhone, setCitizenPhone] = useState("");
  const [citizenEmail, setCitizenEmail] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("English");

  // Step 2: Location details
  const [selectedState, setSelectedState] = useState("Gujarat");
  const [selectedDistrict, setSelectedDistrict] = useState("Rajkot");
  const [selectedCity, setSelectedCity] = useState("Rajkot");
  const [formWard, setFormWard] = useState("Ward 1");
  const [addressLine, setAddressLine] = useState("");
  const [landmark, setLandmark] = useState("");

  // Step 3: Complaint details & uploads
  const [complaintTitle, setComplaintTitle] = useState("");
  const [formCategory, setFormCategory] = useState("Healthcare Access");
  const [formDescription, setFormDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // AI Pipeline review states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [pipelineStep, setPipelineStep] = useState(0);
  const [simulationComplete, setSimulationComplete] = useState(false);

  const [submittedResponse, setSubmittedResponse] = useState<{
    id: string;
    category: string;
    priority: string;
    department: string;
    resolutionTime: string;
    confidence: number;
    budgetCategory: string;
    responsibleOfficer: string;
  } | null>(null);

  const loadSubmissions = () => {
    setLoading(true);
    api.getSubmissions()
      .then((data) => {
        setRequests(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading submissions:", err);
        setError(true);
        setLoading(false);
      });
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadSubmissions();
  }, []);

  // Timer simulation for AI Review
  useEffect(() => {
    if (wizardStep !== 4 || !isSubmitting) return;

    let timer: NodeJS.Timeout;
    const runSimulation = () => {
      setPipelineStep((prev) => {
        if (prev < PIPELINE_STAGES.length - 1) {
          timer = setTimeout(runSimulation, 500);
          return prev + 1;
        } else {
          setSimulationComplete(true);
          return prev;
        }
      });
    };

    timer = setTimeout(runSimulation, 500);
    return () => clearTimeout(timer);
  }, [wizardStep, isSubmitting]);

  const handleStartReview = async () => {
    if (!formDescription.trim()) {
      setSubmitError("Please provide a detailed description of the development need.");
      return;
    }

    setSubmitError("");
    setWizardStep(4);
    setIsSubmitting(true);
    setPipelineStep(0);
    setSimulationComplete(false);

    try {
      const newSub = await api.submitSubmission({
        category: formCategory,
        ward: formWard,
        description: `${complaintTitle ? `[${complaintTitle}] ` : ""}${formDescription}`,
        reporter_name: citizenName.trim() || undefined,
        audio_file: audioFile,
        image_file: imageFile,
      });

      const pipelineRes = await api.processAISubmission(newSub.id);
      
      const priorityLabel = pipelineRes.priority.priority_score >= 4 
        ? "High" 
        : pipelineRes.priority.priority_score >= 2.5 
        ? "Medium" 
        : "Low";

      const confidencePercent = Math.round(pipelineRes.priority.confidence * 100) || 94;

      setSubmittedResponse({
        id: newSub.id,
        category: pipelineRes.category || formCategory,
        priority: priorityLabel,
        department: getDepartmentForCategory(pipelineRes.category || formCategory),
        resolutionTime: getResolutionTimeForPriority(priorityLabel),
        confidence: confidencePercent,
        budgetCategory: "Municipal Maintenance Fund (A-Class)",
        responsibleOfficer: `Assistant Executive Engineer (${priorityLabel === "High" ? "Grade-1" : "Grade-2"})`
      });

      loadSubmissions();

    } catch (err: unknown) {
      console.error(err);
      setSubmitError("Error routing to the AI pipeline. Please verify details.");
      setWizardStep(3);
      setIsSubmitting(false);
    }
  };

  const handleLocateMe = () => {
    setAddressLine("Collector Office Compound, Rajkot Central");
    setLandmark("Near National Informatics Centre");
  };

  const handleDownloadAcknowledgement = () => {
    if (!submittedResponse) return;
    const csvContent = `data:text/csv;charset=utf-8,ACKNOWLEDGEMENT RECEIPT\nPriority Reference,${submittedResponse.id}\nApplicant,${citizenName || "Anonymous"}\nPhone,${citizenPhone || "N/A"}\nWard,${formWard}\nDepartment,${submittedResponse.department}\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `receipt_${submittedResponse.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleResetWizard = () => {
    setWizardStep(1);
    setCitizenName("");
    setCitizenPhone("");
    setCitizenEmail("");
    setAddressLine("");
    setLandmark("");
    setComplaintTitle("");
    setFormDescription("");
    setAudioFile(null);
    setImageFile(null);
    setImagePreview(null);
    setSubmittedResponse(null);
    setSubmitError("");
  };

  const appendSuggestion = (text: string) => {
    setFormDescription(prev => prev + (prev ? " " : "") + text);
  };

  return (
    <MainLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Government Style Header with Emblem Space */}
        <div className="bg-white border-l-4 border-l-orange-500 border border-slate-200 p-5 rounded-xl shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex gap-4 items-center">
            <span className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl font-bold text-xs uppercase tracking-wider">
              GOI
            </span>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-orange-600">Smart Cities Mission &bull; National Portal</div>
              <h1 className="text-xl font-extrabold text-slate-800 tracking-tight mt-0.5">
                AI Priorities Intake & Planning System
              </h1>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">
                Official portal for collecting constituency priorities and guiding development planning.
              </p>
            </div>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 flex-shrink-0">
            <button
              onClick={() => setActiveTab("wizard")}
              className={`px-4 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                activeTab === "wizard" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              Share a Priority
            </button>
            <button
              onClick={() => setActiveTab("history")}
              className={`px-4 py-1.5 text-xs font-bold rounded transition cursor-pointer ${
                activeTab === "history" ? "bg-white text-indigo-700 shadow-xs" : "text-slate-500 hover:text-slate-850"
              }`}
            >
              Priority Log
            </button>
          </div>
        </div>

        {activeTab === "wizard" ? (
          // Guided Government service wizard
          <div className="space-y-6">
            
            {/* Step Wizard Progress line */}
            <div className="bg-white border border-slate-200 p-4 rounded-xl flex justify-between items-center text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {[
                { step: 1, label: "Applicant" },
                { step: 2, label: "Location" },
                { step: 3, label: "Priority" },
                { step: 4, label: "AI Review" },
                { step: 5, label: "Receipt" }
              ].map((item, idx) => (
                <div key={item.step} className="flex items-center gap-2 flex-1 justify-center last:flex-initial">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center border text-[9px] transition ${
                    wizardStep === item.step 
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : wizardStep > item.step 
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                      : "bg-slate-50 border-slate-200 text-slate-400"
                  }`}>
                    {wizardStep > item.step ? <Check size={10} /> : item.step}
                  </span>
                  <span className={wizardStep === item.step ? "text-indigo-700" : "hidden sm:inline"}>{item.label}</span>
                  {idx < 4 && <ChevronRight size={12} className="text-slate-200 flex-grow max-w-[30px] hidden sm:block" />}
                </div>
              ))}
            </div>

            {/* Steps Content Area */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[380px]">
              
              {submitError && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-semibold mb-4 animate-in fade-in">
                  <AlertCircle size={16} />
                  <span>{submitError}</span>
                </div>
              )}

              {/* Step 1: Citizen Details */}
              {wizardStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Landmark className="text-indigo-600" size={16} />
                      Applicant Information
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Please provide valid contact information for official communications</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        Full Name (Optional)
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rajesh Kumar"
                        value={citizenName}
                        onChange={(e) => setCitizenName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5 flex items-center gap-1.5">
                        <Smartphone size={12} className="text-slate-400" />
                        Mobile Number
                      </label>
                      <input
                        type="tel"
                        placeholder="e.g. +91 98765 43210"
                        value={citizenPhone}
                        onChange={(e) => setCitizenPhone(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5 flex items-center gap-1.5">
                        <Mail size={12} className="text-slate-400" />
                        Email Address
                      </label>
                      <input
                        type="email"
                        placeholder="e.g. rajesh@nic.in"
                        value={citizenEmail}
                        onChange={(e) => setCitizenEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-455 mb-1.5 flex items-center gap-1.5">
                        <Globe size={12} className="text-slate-400" />
                        Preferred Communication Language
                      </label>
                      <select
                        value={preferredLanguage}
                        onChange={(e) => setPreferredLanguage(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-855 text-xs font-semibold focus:outline-none focus:border-indigo-500 transition"
                      >
                        <option value="English">English</option>
                        <option value="Hindi">हिन्दी (Hindi)</option>
                        <option value="Gujarati">ગુજરાતી (Gujarati)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-indigo-600/10 active:scale-95"
                    >
                      Next: Location
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Locationpicker */}
              {wizardStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <MapPin className="text-indigo-650" size={16} />
                      Geospatial Location Mapping
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Demarcate the exact location bounds of the issue</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">State</label>
                          <select
                            value={selectedState}
                            onChange={(e) => setSelectedState(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none"
                          >
                            {STATES.map(st => (
                              <option key={st} value={st}>{st}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">District</label>
                          <select
                            value={selectedDistrict}
                            onChange={(e) => setSelectedDistrict(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none"
                          >
                            {DISTRICTS.map(dst => (
                              <option key={dst} value={dst}>{dst}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">City</label>
                          <select
                            value={selectedCity}
                            onChange={(e) => setSelectedCity(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-2 text-slate-800 text-xs font-semibold focus:outline-none"
                          >
                            {CITIES.map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Constituency Ward</label>
                          <select
                            value={formWard}
                            onChange={(e) => setFormWard(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold focus:outline-none"
                          >
                            {WARDS.map(w => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Nearby Landmark</label>
                          <input
                            type="text"
                            placeholder="e.g. Near Bus Stand"
                            value={landmark}
                            onChange={(e) => setLandmark(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 text-xs font-semibold focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Address Line</label>
                          <button
                            type="button"
                            onClick={handleLocateMe}
                            className="text-[9px] font-extrabold uppercase text-indigo-700 flex items-center gap-1 hover:text-indigo-500 cursor-pointer"
                          >
                            <Navigation size={10} />
                            Auto-Fill Address
                          </button>
                        </div>
                        <input
                          type="text"
                          placeholder="e.g. NIC Road, Civil Lines, Rajkot"
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Map Placement Preview</label>
                      <SubmissionMap selectedWard={formWard} />
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setWizardStep(1)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-500 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={() => setWizardStep(3)}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Next: Details
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Grievance Details & uploads */}
              {wizardStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                      <Landmark className="text-indigo-650" size={16} />
                      Priority Details & Uploads
                    </h2>
                    <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-wider">Provide details and attach photo or voice evidence for planning review</p>
                  </div>

                  {/* Categories picker */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Priority Category</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {CATEGORIES_MAPPING.map((cat) => (
                        <div
                          key={cat.name}
                          onClick={() => setFormCategory(cat.name)}
                          className={`p-3.5 border rounded-2xl cursor-pointer transition flex flex-col justify-between h-20 ${
                            formCategory === cat.name 
                              ? "bg-indigo-50 border-indigo-200 text-indigo-700 shadow-xs" 
                              : "border-slate-200 hover:bg-slate-50 text-slate-550"
                          }`}
                        >
                          <span className="text-xs font-bold">{cat.label}</span>
                          <span className="text-[9px] text-slate-400 mt-1">{cat.desc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Complaint Title */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority Title / Subject</label>
                    <input
                      type="text"
                      placeholder="e.g. Major pothole blockage on NIC lane"
                      value={complaintTitle}
                      onChange={(e) => setComplaintTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-850 text-xs font-semibold focus:outline-none"
                    />
                  </div>

                  {/* Details Description */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Development Need</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the development need in detail..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-slate-850 text-xs font-semibold focus:outline-none resize-none"
                    />
                    <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                      <span>Counter: {formDescription.length} characters</span>
                      <span>Min recommended: 10 chars</span>
                    </div>
                  </div>

                  {/* Writing helpers */}
                  <div className="space-y-2">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Writing Assistance Chips</span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button" onClick={() => appendSuggestion("Immediate municipal attention is requested.")} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-[9px] font-bold uppercase rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer">Request Action</button>
                      <button type="button" onClick={() => appendSuggestion("The issue poses a high safety threat at night.")} className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-[9px] font-bold uppercase rounded-md text-slate-500 hover:bg-slate-100 cursor-pointer">Night Safety</button>
                    </div>
                  </div>

                  {/* Upload sections */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    {/* Photo document */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Upload Image Evidence</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50 rounded-2xl p-4 cursor-pointer transition h-32 relative">
                        {imagePreview ? (
                          <div className="w-full h-full relative group">
                            <img src={imagePreview} alt="Upload preview" className="object-cover w-full h-full rounded-lg" />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setImageFile(null);
                                setImagePreview(null);
                              }}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 cursor-pointer"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload className="text-slate-400 mb-1" size={20} />
                            <span className="text-[9px] font-bold text-slate-500">Drag Image File here</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setImageFile(file);
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setImagePreview(reader.result as string);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>

                    {/* Audio note */}
                    <div className="space-y-2">
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Upload Voice Recording</label>
                      <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-indigo-500/50 hover:bg-slate-50 rounded-2xl p-4 cursor-pointer transition h-32 relative">
                        {audioFile ? (
                          <div className="text-center space-y-1">
                            <Volume2 className="text-indigo-600" size={20} />
                            <span className="text-[9px] font-bold text-indigo-700 max-w-[150px] truncate">{audioFile.name}</span>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setAudioFile(null);
                              }}
                              className="text-[9px] text-red-600 hover:underline cursor-pointer block"
                            >
                              Remove file
                            </button>
                          </div>
                        ) : (
                          <>
                            <Mic className="text-slate-400 mb-1" size={20} />
                            <span className="text-[9px] font-bold text-slate-500">Attach Voice Note</span>
                          </>
                        )}
                        <input
                          type="file"
                          accept="audio/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0] || null;
                            setAudioFile(file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setWizardStep(2)}
                      className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-550 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleStartReview}
                      disabled={formDescription.trim().length < 10}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
                    >
                      Submit for Planning Review
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: AI Governance Review & Decision Report */}
              {wizardStep === 4 && (
                <div className="space-y-6">
                  {!simulationComplete ? (
                    // Subtle government loader
                    <div className="space-y-6 flex flex-col items-center justify-center py-8">
                      <Loader2 className="animate-spin text-indigo-600" size={32} />
                      <div className="text-center space-y-1">
                        <h3 className="text-sm font-extrabold text-slate-850">Processing planning priorities</h3>
                        <p className="text-[10px] text-indigo-650 font-bold uppercase tracking-wider">{PIPELINE_STAGES[pipelineStep]}</p>
                      </div>
                    </div>
                  ) : (
                    // Government Report card
                    <div className="space-y-6 animate-in fade-in duration-300">
                      <div className="flex justify-between items-center pb-3 border-b border-slate-150">
                        <div className="flex items-center gap-2">
                          <span className="p-2 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-xl">
                            <CheckCircle2 size={18} />
                          </span>
                          <div>
                            <h3 className="text-sm font-extrabold text-slate-850">AI Governance Assessment Report</h3>
                            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Priority Ref: {submittedResponse?.id}</p>
                          </div>
                        </div>
                      </div>

                      {/* Diagnostic values */}
                      <div className="bg-slate-50 border border-slate-250 p-5 rounded-2xl space-y-4 text-xs font-semibold text-slate-700">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Assigned Department</p>
                            <p className="text-slate-800 font-extrabold mt-0.5">{submittedResponse?.department}</p>
                          </div>
                          <div>
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Priority Status</p>
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border mt-1 ${
                              submittedResponse?.priority === "High" ? "bg-red-50 text-red-700 border-red-100" : "bg-amber-50 text-amber-700 border-amber-100"
                            }`}>{submittedResponse?.priority}</span>
                          </div>
                          <div className="border-t border-slate-200/60 pt-3">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Resolution SLA Target</p>
                            <p className="text-slate-800 font-extrabold mt-0.5">{submittedResponse?.resolutionTime}</p>
                          </div>
                          <div className="border-t border-slate-200/60 pt-3">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Model Confidence</p>
                            <p className="text-indigo-650 font-extrabold mt-0.5">{submittedResponse?.confidence}% Match</p>
                          </div>
                          <div className="border-t border-slate-200/60 pt-3">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Budget Classification</p>
                            <p className="text-slate-800 font-extrabold mt-0.5">{submittedResponse?.budgetCategory}</p>
                          </div>
                          <div className="border-t border-slate-200/60 pt-3">
                            <p className="text-[9px] text-slate-400 uppercase font-bold">Responsible Authority</p>
                            <p className="text-slate-800 font-extrabold mt-0.5">{submittedResponse?.responsibleOfficer}</p>
                          </div>
                        </div>

                        <div className="border-t border-slate-200/60 pt-4">
                          <p className="text-[9px] text-slate-400 uppercase font-bold">Executive planning recommendations</p>
                          <p className="text-slate-700 mt-1 font-bold leading-relaxed">
                            Based on NLP extraction rules, this ticket matches historical road maintenance priority targets. It is recommended to dispatch the PWD engineering cell for onsite inspection within 24 hours.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-3 justify-end pt-4 border-t border-slate-100">
                        <button
                          onClick={() => setWizardStep(3)}
                          className="px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-550 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          Modify Priority
                        </button>
                        <button
                          onClick={() => setWizardStep(5)}
                          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition cursor-pointer shadow-md shadow-indigo-600/10 active:scale-95 flex items-center gap-1.5"
                        >
                          Save Priority
                          <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 5: Submission Complete Success screen */}
              {wizardStep === 5 && (
                <div className="space-y-6 flex flex-col items-center justify-center py-8 text-center animate-in zoom-in-95 duration-200">
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-full">
                    <CheckCircle2 size={36} />
                  </div>

                  <div className="space-y-1.5">
                    <h3 className="text-lg font-extrabold text-slate-850">Priority Registered Successfully</h3>
                    <p className="text-[10px] text-slate-450 uppercase font-extrabold tracking-wider">Acknowledge Code: {submittedResponse?.id}</p>
                  </div>

                  {/* QR Code generator placeholder */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center shadow-inner">
                    <span className="text-[8px] text-slate-400 uppercase font-extrabold mb-2.5">Digital verification receipt</span>
                    <svg className="w-24 h-24" viewBox="0 0 100 100">
                      <rect width="100" height="100" fill="#ffffff" />
                      {/* Custom grid QR code shape patterns */}
                      <rect x="10" y="10" width="20" height="20" fill="#0f172a" />
                      <rect x="15" y="15" width="10" height="10" fill="#ffffff" />
                      <rect x="70" y="10" width="20" height="20" fill="#0f172a" />
                      <rect x="75" y="15" width="10" height="10" fill="#ffffff" />
                      <rect x="10" y="70" width="20" height="20" fill="#0f172a" />
                      <rect x="15" y="75" width="10" height="10" fill="#ffffff" />
                      {/* Random pixel squares */}
                      <rect x="40" y="20" width="10" height="10" fill="#0f172a" />
                      <rect x="50" y="40" width="15" height="15" fill="#0f172a" />
                      <rect x="35" y="60" width="10" height="20" fill="#0f172a" />
                      <rect x="65" y="75" width="15" height="10" fill="#0f172a" />
                    </svg>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm pt-4 border-t border-slate-100">
                    <button
                      onClick={handleDownloadAcknowledgement}
                      className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 border border-slate-200 hover:bg-slate-50 text-slate-550 text-xs font-bold rounded-xl transition cursor-pointer"
                    >
                      <Download size={14} />
                      Get Receipt
                    </button>
                    <button
                      onClick={handleResetWizard}
                      className="flex-1 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer active:scale-95 animate-in"
                    >
                      Add Another Priority
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        ) : (
          // Grievance Logs list
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {error ? (
              <div className="p-12 text-center text-red-655">
                <AlertCircle className="mx-auto mb-2 text-red-500" size={32} />
                <p className="font-semibold text-sm">Failed to load grievance records.</p>
              </div>
            ) : loading ? (
              <div className="p-12 text-center text-slate-450 flex flex-col items-center justify-center gap-2">
                <Loader2 className="animate-spin text-indigo-600" size={28} />
                <p className="text-xs font-semibold">Loading registry tables...</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-semibold text-slate-700">
                  <thead>
                    <tr className="bg-slate-50/50 text-slate-400 text-[9px] font-extrabold uppercase tracking-wider border-b border-slate-100">
                      <th className="px-6 py-4">Reference Code</th>
                      <th className="px-6 py-4">Redress Category</th>
                      <th className="px-6 py-4">Constituency Division</th>
                      <th className="px-6 py-4">Priority Status</th>
                      <th className="px-6 py-4">Filing Date</th>
                      <th className="px-6 py-4">Action Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {requests.map((request) => (
                      <tr key={request.id} className="hover:bg-slate-50/40 transition">
                        <td className="px-6 py-4 font-mono text-indigo-600 font-extrabold">{request.id}</td>
                        <td className="px-6 py-4 text-slate-800 font-bold">{request.category}</td>
                        <td className="px-6 py-4 text-slate-500">{request.ward}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              request.sentiment === "Critical/Angry" || request.sentiment === "Emergency"
                                ? "bg-red-50 border-red-100 text-red-700"
                                : request.sentiment === "Concerned"
                                ? "bg-amber-50 border-amber-100 text-amber-700"
                                : "bg-slate-50 border-slate-100 text-slate-655"
                            }`}
                          >
                            {request.sentiment}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-[10px]">{request.date}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-extrabold border ${
                              request.status === "Completed"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : request.status === "Approved" || request.status === "In Progress"
                                ? "bg-indigo-50 border-indigo-100 text-indigo-755"
                                : "bg-amber-50 border-amber-100 text-amber-700"
                            }`}
                          >
                            {request.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </MainLayout>
  );
}