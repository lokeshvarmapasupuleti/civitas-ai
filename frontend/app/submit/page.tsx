"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { MessageSquare, Plus, Search, Filter, X, Check, Loader2, AlertCircle } from "lucide-react";
import { api, Submission } from "@/lib/api";

const CATEGORIES = [
  "Healthcare Access",
  "Sanitation",
  "Road Repair",
  "Street Lighting",
  "Water Supply",
  "Public Transport"
];

const WARDS = Array.from({ length: 12 }, (_, i) => `Ward ${i + 1}`);

export default function SubmitPage() {
  const [requests, setRequests] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formReporter, setFormReporter] = useState("");
  const [formCategory, setFormCategory] = useState("Healthcare Access");
  const [formWard, setFormWard] = useState("Ward 1");
  const [formDescription, setFormDescription] = useState("");
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

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
    loadSubmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() && !audioFile && !imageFile) {
      setSubmitError("Please write a description, upload a voice clip, or attach a photo.");
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess(false);

    try {
      // 1. Submit request
      const newSub = await api.submitSubmission({
        category: formCategory,
        ward: formWard,
        description: formDescription || undefined,
        reporter_name: formReporter.trim() || undefined,
        audio_file: audioFile,
        image_file: imageFile,
      });

      // 2. Trigger AI processing pipeline
      await api.processAISubmission(newSub.id);

      setSubmitSuccess(true);
      setFormDescription("");
      setFormReporter("");
      setAudioFile(null);
      setImageFile(null);
      setImagePreview(null);
      
      // Reload list and close modal
      loadSubmissions();
      setTimeout(() => {
        setIsModalOpen(false);
        setSubmitSuccess(false);
      }, 1500);

    } catch (err: any) {
      console.error("Error submitting request:", err);
      setSubmitError(err.message || "Something went wrong while submitting request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter list
  const filteredRequests = requests.filter((req) => {
    const matchesSearch = 
      req.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.reporter_name && req.reporter_name.toLowerCase().includes(searchQuery.toLowerCase()));
      
    const matchesCategory = filterCategory === "" || req.category === filterCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center gap-2">
              <MessageSquare className="text-blue-500" size={32} />
              Citizen Requests
            </h1>
            <p className="text-slate-400 mt-2">
              Browse, filter, and track development demands submitted by constituency residents.
            </p>
          </div>

          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition duration-200 shadow-[0_0_15px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"
          >
            <Plus size={20} />
            Submit New Request
          </button>
        </div>

        {/* Requests Table Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          {/* Header Controls */}
          <div className="p-6 border-b border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
            <h2 className="text-xl font-semibold text-white">Recent Requests</h2>
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Search requests..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-blue-500 transition duration-200"
                />
              </div>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-blue-500 transition duration-200"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table content */}
          {error ? (
            <div className="p-12 text-center text-red-400">
              <AlertCircle className="mx-auto mb-2 text-red-500" size={36} />
              <p>Failed to load citizen requests. Please ensure API server is active.</p>
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
              <Loader2 className="animate-spin text-blue-500" size={32} />
              <p>Fetching database records...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <p>No citizen requests match your search criteria.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 text-sm font-semibold uppercase tracking-wider border-b border-slate-800">
                    <th className="px-6 py-4">Request ID</th>
                    <th className="px-6 py-4">Category</th>
                    <th className="px-6 py-4">Ward</th>
                    <th className="px-6 py-4">Sentiment</th>
                    <th className="px-6 py-4">Submitted Date</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850">
                  {filteredRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-slate-800/50 transition duration-200">
                      <td className="px-6 py-4 font-mono text-blue-400 font-semibold">{request.id}</td>
                      <td className="px-6 py-4 text-white font-medium">{request.category}</td>
                      <td className="px-6 py-4 text-slate-350">{request.ward}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
                            request.sentiment === "Critical/Angry" || request.sentiment === "Emergency"
                              ? "bg-red-950/50 border-red-500/30 text-red-400"
                              : request.sentiment === "Concerned"
                              ? "bg-amber-950/50 border-amber-500/30 text-amber-400"
                              : "bg-slate-950 border-slate-800 text-slate-400"
                          }`}
                        >
                          {request.sentiment}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-400 text-sm">{request.date}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${
                            request.status === "Completed"
                              ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                              : request.status === "Approved" || request.status === "In Progress"
                              ? "bg-blue-600/10 text-blue-400 border border-blue-500/20"
                              : "bg-amber-600/10 text-amber-400 border border-amber-500/20"
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

          <div className="p-4 bg-slate-950/50 flex justify-between items-center text-sm text-slate-400 border-t border-slate-800">
            <span>Showing {filteredRequests.length} of {requests.length} requests</span>
          </div>
        </div>
      </div>

      {/* Submit New Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-slate-800 bg-slate-950/50">
              <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                <MessageSquare className="text-blue-500" />
                Submit New Request
              </h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-lg transition"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body / Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {submitError && (
                <div className="flex items-center gap-2 bg-red-950/40 border border-red-500/30 text-red-400 p-3 rounded-xl text-sm">
                  <AlertCircle size={18} />
                  <span>{submitError}</span>
                </div>
              )}

              {submitSuccess && (
                <div className="flex items-center gap-2 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 p-3 rounded-xl text-sm">
                  <Check size={18} />
                  <span>Submission successful! AI Pipeline triggered.</span>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5">Reporter Name (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Ramesh Patel"
                  value={formReporter}
                  onChange={(e) => setFormReporter(e.target.value)}
                  disabled={isSubmitting || submitSuccess}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition duration-200 disabled:opacity-60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5">Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    disabled={isSubmitting || submitSuccess}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition duration-200 disabled:opacity-60"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5">Ward</label>
                  <select
                    value={formWard}
                    onChange={(e) => setFormWard(e.target.value)}
                    disabled={isSubmitting || submitSuccess}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition duration-200 disabled:opacity-60"
                  >
                    {WARDS.map(w => (
                      <option key={w} value={w}>{w}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-350 mb-1.5">Description</label>
                <textarea
                  rows={4}
                  placeholder="Provide details about the issue (Hindi or Gujarati supported)..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  disabled={isSubmitting || submitSuccess}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 transition duration-200 disabled:opacity-60 resize-none"
                />
              </div>

              {/* Multimodal Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5">Voice Audio Recording / File</label>
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null;
                      setAudioFile(file);
                    }}
                    disabled={isSubmitting || submitSuccess}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:cursor-pointer"
                  />
                  {audioFile && (
                    <p className="text-[10px] text-blue-400 mt-1">✔ Attached: {audioFile.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-350 mb-1.5">Photo Attachment (OCR Scannable)</label>
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
                      } else {
                        setImagePreview(null);
                      }
                    }}
                    disabled={isSubmitting || submitSuccess}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white text-xs focus:outline-none focus:border-blue-500 file:mr-3 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-600/20 file:text-blue-400 hover:file:bg-blue-600/30 file:cursor-pointer"
                  />
                  {imagePreview && (
                    <div className="mt-2 relative w-16 h-16 rounded border border-slate-800 overflow-hidden">
                      <img src={imagePreview} alt="Upload preview" className="object-cover w-full h-full" />
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setImagePreview(null);
                        }}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition cursor-pointer"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-5 py-2 border border-slate-800 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 text-sm font-medium transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || submitSuccess}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition duration-200 active:scale-95 disabled:opacity-70 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Processing AI...
                    </>
                  ) : (
                    "Submit"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}