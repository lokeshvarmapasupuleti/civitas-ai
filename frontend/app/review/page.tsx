"use client";

import { useEffect, useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { FileText, Volume2, Image as ImageIcon, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { api, Submission } from "@/lib/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function ReviewPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "media">("all");

  useEffect(() => {
    api.getSubmissions()
      .then((data) => {
        setSubmissions(data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading submissions for review:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  const filteredSubmissions = submissions.filter((sub) => {
    if (activeTab === "media") {
      return !!sub.audio_path || !!sub.image_path;
    }
    return true;
  });

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="text-emerald-500" size={32} />
            Citizen Submission Audit
          </h1>
          <p className="text-slate-400 mt-2">
            Inspect original audio recordings, scanned image petitions, and AI pipeline transcription outcomes.
          </p>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b border-slate-800 gap-6 text-sm">
          <button
            onClick={() => setActiveTab("all")}
            className={`pb-3 font-semibold transition ${
              activeTab === "all" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"
            } cursor-pointer`}
          >
            All Submissions ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab("media")}
            className={`pb-3 font-semibold transition ${
              activeTab === "media" ? "text-emerald-400 border-b-2 border-emerald-500" : "text-slate-400 hover:text-white"
            } cursor-pointer`}
          >
            Voice & Photos Only ({submissions.filter(s => s.audio_path || s.image_path).length})
          </button>
        </div>

        {/* Audit Feed */}
        {loading ? (
          <div className="p-12 text-center text-slate-400 flex flex-col items-center justify-center gap-2">
            <Loader2 className="animate-spin text-emerald-500" size={32} />
            <p>Loading audit feed...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center text-red-400 bg-red-950/20 border border-red-500/20 rounded-2xl">
            Failed to load submission audit feed. Please check server connections.
          </div>
        ) : filteredSubmissions.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/60 border border-slate-800 rounded-2xl">
            No submissions found matching the criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredSubmissions.map((sub) => (
              <div
                key={sub.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-6 shadow-xl transition duration-300"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-850 pb-4 mb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="font-mono text-emerald-400 font-semibold text-base">{sub.id}</span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-350">
                        {sub.category}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-950 border border-slate-800 text-slate-350">
                        {sub.ward}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Submitted: {sub.date} | Reporter: {sub.reporter_name || "Anonymous"}</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.sentiment === "Critical/Angry" || sub.sentiment === "Emergency"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : sub.sentiment === "Concerned"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-slate-950 text-slate-400 border border-slate-800"
                      }`}
                    >
                      Sentiment: {sub.sentiment}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        sub.status === "Completed"
                          ? "bg-emerald-600/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-amber-600/10 text-amber-400 border border-amber-500/20"
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Left: Processed Text Description */}
                  <div className="lg:col-span-2 space-y-3">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <FileText size={16} className="text-emerald-500" />
                      Compiled Pipeline Input
                    </h3>
                    <div className="bg-slate-950/80 border border-slate-850 rounded-xl p-4 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                      {sub.description}
                    </div>
                  </div>

                  {/* Right: Attached Original Media */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sparkles size={16} className="text-emerald-500 animate-pulse" />
                      Original Media Audit
                    </h3>

                    {/* Audio Player */}
                    {sub.audio_path ? (
                      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-blue-400">
                          <Volume2 size={16} />
                          <span>Voice Recording Clip</span>
                        </div>
                        <audio
                          controls
                          src={`${API_BASE_URL}${sub.audio_path}`}
                          className="w-full h-8 mt-2 accent-emerald-500"
                        />
                      </div>
                    ) : null}

                    {/* Image Viewer */}
                    {sub.image_path ? (
                      <div className="bg-slate-950/40 border border-slate-850 rounded-xl p-4 space-y-2">
                        <div className="flex items-center gap-2 text-xs font-medium text-amber-400">
                          <ImageIcon size={16} />
                          <span>Scanned Photo Document</span>
                        </div>
                        <div className="mt-2 rounded-lg border border-slate-800 overflow-hidden bg-slate-900 flex justify-center items-center h-48 cursor-zoom-in group relative">
                          <img
                            src={`${API_BASE_URL}${sub.image_path}`}
                            alt="Scanned petition"
                            className="object-contain w-full h-full transition duration-300 group-hover:scale-105"
                          />
                        </div>
                      </div>
                    ) : null}

                    {!sub.audio_path && !sub.image_path ? (
                      <div className="bg-slate-950/40 border border-slate-850 border-dashed rounded-xl p-6 text-center text-xs text-slate-500">
                        No audio clips or image files attached. Text submission only.
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}