"use client";

import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { 
  BrainCircuit, Send, Copy, Check, ChevronDown, ChevronUp, Sparkles, Loader2, 
  ArrowRight, Share2, Trash2, Download, Paperclip, Mic, Image as ImageIcon, MapPin,
  Search, MessageSquare, Pin, FolderOpen, AlertTriangle, ShieldCheck, Heart, Terminal,
  Plus
} from "lucide-react";
import { api, AssistantResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  sender: "user" | "assistant";
  text: string;
  response?: AssistantResponse;
}

const CATEGORIES = [
  { name: "Priority Signals", count: 12 },
  { name: "Road Infrastructure", count: 8 },
  { name: "Water Access", count: 5 },
  { name: "Sanitation", count: 14 },
  { name: "Budget Needs", count: 3 },
  { name: "Planning Briefs", count: 7 }
];

const SUGGESTED_PROMPTS = [
  "Summarize today's priorities",
  "Generate ward planning brief",
  "Predict next hotspot",
  "Show unresolved needs",
  "Analyze sanitation demand",
  "Explain AI recommendation",
  "Generate budget outlook"
];

function parseInlineMarkdown(text: string) {
  const parts = text.split(/(\*\*[\s\S]*?\*\*|`[\s\S]*?`)/g);
  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={idx} className="font-extrabold text-slate-900">{part.slice(2, -2)}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return <code key={idx} className="px-1.5 py-0.5 bg-slate-100 text-slate-800 rounded font-mono text-[10px] border border-slate-200">{part.slice(1, -1)}</code>;
    }
    return part;
  });
}

function formatCopilotText(text: string) {
  if (!text) return null;

  const blocks = text.split(/(```[\s\S]*?```)/g);

  return blocks.map((block, bIdx) => {
    if (block.startsWith("```") && block.endsWith("```")) {
      const code = block.slice(3, -3).trim();
      return (
        <pre key={bIdx} className="bg-slate-900 text-slate-100 p-4 rounded-xl font-mono text-[10px] overflow-x-auto my-3 border border-slate-800 shadow-inner">
          <code>{code}</code>
        </pre>
      );
    }

    if (block.includes("|") && block.includes("\n")) {
      const lines = block.split("\n").filter(l => l.trim() !== "");
      const isTable = lines.every(line => line.startsWith("|") && line.endsWith("|"));
      if (isTable && lines.length > 1) {
        const rows = lines.map(line => line.split("|").map(cell => cell.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1));
        const headers = rows[0];
        const dataRows = rows.slice(2);
        return (
          <div key={bIdx} className="overflow-x-auto my-3 border border-slate-200/85 rounded-xl shadow-xs">
            <table className="min-w-full divide-y divide-slate-200 text-xs font-semibold text-slate-700">
              <thead className="bg-slate-50/50">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} className="px-4 py-2 text-left font-extrabold uppercase text-[9px] text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {dataRows.map((row, rIdx) => (
                  <tr key={rIdx}>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-4 py-2 text-slate-800 font-semibold">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    const lines = block.split("\n");
    return lines.map((line, lIdx) => {
      if (line.startsWith("### ")) {
        return <h3 key={lIdx} className="text-sm font-extrabold text-slate-850 mt-3 mb-1">{line.slice(4)}</h3>;
      }
      if (line.startsWith("## ")) {
        return <h2 key={lIdx} className="text-base font-extrabold text-slate-850 mt-4 mb-2">{line.slice(3)}</h2>;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <ul key={lIdx} className="list-disc pl-4 my-1 space-y-0.5 text-xs text-slate-700 font-semibold">
            <li>{parseInlineMarkdown(line.slice(2))}</li>
          </ul>
        );
      }
      return <p key={lIdx} className="my-1.5 text-xs leading-relaxed">{parseInlineMarkdown(line)}</p>;
    });
  });
}

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<Record<number, boolean>>({});
  const [searchSidebar, setSearchSidebar] = useState("");

  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { sender: "user", text: trimmed }]);
    setQuery("");
    setLoading(true);

    try {
      const response = await api.queryAssistant(trimmed);
      setMessages((prev) => [...prev, { 
        sender: "assistant", 
        text: response.answer,
        response 
      }]);
    } catch (err: unknown) {
      console.error(err);
      setMessages((prev) => [...prev, { 
        sender: "assistant", 
        text: "Error: Failed to query the assistant backend. Please ensure the API server is active." 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const toggleExpand = (index: number) => {
    setExpandedData((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const latestAssistantMsg = [...messages].reverse().find(msg => msg.sender === "assistant");

  return (
    <MainLayout>
      <div className="grid grid-cols-1 xl:grid-cols-10 gap-6 h-[calc(100vh-12rem)] max-w-[1600px] mx-auto">
        
        {/* LEFT SIDEBAR (Sidebar controls) */}
        <div className="xl:col-span-2 bg-white border border-slate-200/60 rounded-3xl p-4 flex flex-col space-y-4 h-full hidden xl:flex">
          <button 
            onClick={() => setMessages([])}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-600/10 cursor-pointer active:scale-98"
          >
            <Plus className="w-3.5 h-3.5" />
            New Chat Session
          </button>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-450" size={13} />
            <input
              type="text"
              placeholder="Search chat logs..."
              value={searchSidebar}
              onChange={(e) => setSearchSidebar(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-500 transition"
            />
          </div>

          {/* Categories List */}
          <div className="flex-grow overflow-y-auto space-y-4">
            <div className="space-y-1.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1.5">Focus Domains</span>
              <div className="space-y-1">
                {CATEGORIES.map((cat) => (
                  <div 
                    key={cat.name} 
                    className="flex justify-between items-center px-2 py-1.5 text-xs font-semibold text-slate-655 hover:bg-slate-50 rounded-lg transition cursor-pointer"
                  >
                    <span className="flex items-center gap-2">
                      <FolderOpen size={13} className="text-slate-400" />
                      {cat.name}
                    </span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-md">{cat.count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pinned Chats */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider pl-1.5">Pinned Sessions</span>
              <div className="space-y-1 text-xs font-semibold text-slate-650">
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition cursor-pointer">
                  <Pin size={12} className="text-indigo-600 rotate-45" />
                  <span className="truncate">Ward 5 Sanitation Gaps</span>
                </div>
                <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-slate-50 rounded-lg transition cursor-pointer">
                  <Pin size={12} className="text-indigo-600 rotate-45" />
                  <span className="truncate">Q3 PWD Infrastructure</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE CHAT CONTAINER */}
        <div className="xl:col-span-6 bg-white border border-slate-200/60 rounded-3xl flex flex-col overflow-hidden shadow-sm h-full">
          
          {/* Top Info Header Bar */}
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/20 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="p-2 bg-indigo-50 border border-indigo-100/50 text-indigo-650 rounded-xl">
                <BrainCircuit size={18} />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-extrabold text-slate-800">Civitas AI Copilot</h2>
                  <span className="bg-indigo-50 text-indigo-700 border border-indigo-150 px-1.5 py-0.2 rounded-md text-[8px] font-bold uppercase tracking-wider">v2.1</span>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                  <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider">Online &bull; Core Engine Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setMessages([])}
                className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Clear current log"
              >
                <Trash2 size={15} />
              </button>
              <button 
                className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Share Chat"
              >
                <Share2 size={15} />
              </button>
              <button 
                className="p-2 text-slate-400 hover:text-slate-655 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                title="Export Chat"
              >
                <Download size={15} />
              </button>
            </div>
          </div>

          {/* Message view window */}
          <div className="flex-grow p-6 overflow-y-auto space-y-6">
            <AnimatePresence>
              {messages.length === 0 ? (
                // Empty state view
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-6"
                >
                  <div className="p-4 bg-indigo-50 border border-indigo-100 text-indigo-650 rounded-3xl shadow-sm animate-bounce">
                    <BrainCircuit size={32} />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-800">{"Ask anything about community priorities and development needs."}</h2>
                    <p className="text-slate-450 text-[10px] font-bold uppercase tracking-wider mt-1.5 leading-relaxed">
                      AI assistant compiles planning signals, forecasts investment needs, and highlights the most urgent constituency gaps.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 w-full pt-1.5 text-xs text-slate-550 font-bold">
                    <div className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl cursor-pointer transition text-center" onClick={() => handleSend("Which ward has the highest healthcare demand?")}>Healthcare priorities</div>
                    <div className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-xl cursor-pointer transition text-center" onClick={() => handleSend("Summarize water-related needs.")}>Water needs</div>
                  </div>
                </motion.div>
              ) : (
                <div className="space-y-6">
                  {messages.map((msg, index) => {
                    const isUser = msg.sender === "user";
                    return (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={index}
                        className={`flex gap-3.5 ${isUser ? "justify-end" : "justify-start"}`}
                      >
                        {/* AI Copilot avatar */}
                        {!isUser && (
                          <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-md shadow-indigo-600/10 border border-indigo-500/20">
                            AI
                          </div>
                        )}

                        <div className="flex flex-col space-y-1.5 max-w-[85%]">
                          <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400 pl-1">
                            {isUser ? "Constituency Lead" : "Copilot Engine"}
                          </span>

                          <div
                            className={`rounded-3xl p-4 border text-xs font-semibold leading-relaxed shadow-sm/5 ${
                              isUser
                                ? "bg-gradient-to-r from-indigo-600 to-indigo-500 border-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-600/10"
                                : "bg-slate-50 border-slate-200 text-slate-800 rounded-tl-none"
                            }`}
                          >
                            <div className="whitespace-pre-wrap font-sans">
                              {formatCopilotText(msg.text)}
                            </div>

                            {/* Actions panel */}
                            {!isUser && (
                              <div className="flex gap-3 items-center justify-end mt-4 pt-2 border-t border-slate-150 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                                <span className="mr-auto font-mono text-[9px] text-slate-450 tracking-normal normal-case">
                                  Confidence: {msg.response?.confidence ? `${msg.response.confidence * 100}%` : "100%"}
                                </span>
                                <button
                                  onClick={() => copyToClipboard(msg.text, index)}
                                  className="p-1 hover:text-slate-700 hover:bg-slate-200/50 rounded transition cursor-pointer flex items-center gap-1"
                                >
                                  {copiedIndex === index ? <Check size={12} /> : <Copy size={12} />}
                                  <span>{copiedIndex === index ? "Copied!" : "Copy"}</span>
                                </button>
                                {msg.response?.data && (
                                  <button
                                    onClick={() => toggleExpand(index)}
                                    className="p-1 hover:text-slate-700 hover:bg-slate-200/50 rounded transition cursor-pointer flex items-center gap-1"
                                  >
                                    {expandedData[index] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                    <span>{expandedData[index] ? "Hide Data" : "Inspect Data"}</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Data details block */}
                          {!isUser && msg.response?.data && expandedData[index] && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              className="w-full mt-2 p-4 bg-slate-900 text-emerald-450 border border-slate-800 rounded-xl overflow-x-auto text-[9px] font-mono shadow-inner"
                            >
                              <pre className="text-emerald-400">{JSON.stringify(msg.response.data, null, 2)}</pre>
                            </motion.div>
                          )}

                          {/* Suggested prompts followups */}
                          {!isUser && msg.response?.suggested_followups && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {msg.response.suggested_followups.map((followup) => (
                                <button
                                  key={followup}
                                  onClick={() => handleSend(followup)}
                                  className="px-3.5 py-1.5 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-500 hover:text-slate-800 rounded-full transition cursor-pointer active:scale-95 shadow-sm/5 flex items-center gap-1"
                                >
                                  {followup}
                                  <ArrowRight size={10} className="text-slate-450" />
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* User Avatar */}
                        {isUser && (
                          <div className="w-8 h-8 rounded-xl bg-indigo-650 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-md shadow-indigo-600/10 border border-indigo-500/20">
                            MP
                          </div>
                        )}
                      </motion.div>
                    );
                  })}

                  {/* Loading panel */}
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex gap-3.5 justify-start"
                    >
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-[10px] flex-shrink-0 shadow-md shadow-indigo-600/10">
                        AI
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">Copilot Engine</span>
                        <div className="flex gap-2.5 items-center p-4 bg-slate-50 border border-slate-105 rounded-3xl rounded-tl-none justify-center">
                          <Loader2 className="animate-spin text-indigo-600" size={14} />
                          <span className="text-[10px] font-extrabold text-slate-450 uppercase tracking-wider flex items-center gap-1.5">
                            Synthesizing planning insight
                            <span className="h-4 w-1 bg-indigo-650 animate-pulse"></span>
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={chatEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Suggestion Chips and Input box */}
          <div className="p-4 border-t border-slate-150 bg-slate-50/20 flex-shrink-0 space-y-3.5">
            {/* Prompt macro suggestions */}
            <div className="flex gap-2 overflow-x-auto pb-1 max-w-3xl mx-auto scrollbar-none">
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  onClick={() => handleSend(prompt)}
                  className="px-3 py-1.5 bg-white border border-slate-200 hover:border-slate-350 hover:bg-slate-50 text-[10px] font-extrabold uppercase tracking-wider text-slate-455 hover:text-slate-800 rounded-full transition cursor-pointer active:scale-95 shadow-sm/5 flex-shrink-0"
                >
                  {prompt}
                </button>
              ))}
            </div>

            {/* Input card frame */}
            <div className="relative max-w-3xl mx-auto border border-slate-200/80 rounded-2xl bg-white shadow-sm flex flex-col p-2 space-y-2">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(query);
                  }
                }}
                disabled={loading}
                rows={1}
                placeholder="Ask Civitas AI Copilot about constituency priorities..."
                className="w-full bg-transparent p-2 text-xs font-semibold text-slate-800 focus:outline-none resize-none disabled:opacity-60"
              />
              
              {/* Controls bar */}
              <div className="flex justify-between items-center pt-1.5 border-t border-slate-100">
                <div className="flex items-center gap-1.5 text-slate-400">
                  <button className="p-2 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Attach Media">
                    <ImageIcon size={14} />
                  </button>
                  <button className="p-2 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Attach Voice">
                    <Mic size={14} />
                  </button>
                  <button className="p-2 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Attach File">
                    <Paperclip size={14} />
                  </button>
                  <button className="p-2 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer" title="Attach GPS Location">
                    <MapPin size={14} />
                  </button>
                </div>

                <button 
                  onClick={() => handleSend(query)}
                  disabled={loading || !query.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition disabled:opacity-50 cursor-pointer active:scale-95 shadow-md shadow-indigo-600/10"
                >
                  <Send size={12} />
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT AI CONTEXT PANEL */}
        <div className="xl:col-span-2 space-y-4 overflow-y-auto h-full hidden xl:flex flex-col">
          
          {/* Conversation Insights panel */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-4 space-y-3 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <BrainCircuit size={14} className="text-indigo-650" />
                Query Context
              </h3>
              <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Dynamic model variables</p>
            </div>

            <div className="space-y-3.5 text-xs font-semibold">
              <div className="flex justify-between items-center">
                <span className="text-[9px] uppercase font-bold text-slate-400">Class Target</span>
                <span className="text-slate-800 font-bold">{latestAssistantMsg?.response?.query_type || "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-[9px] uppercase font-bold text-slate-400">Confidence</span>
                <span className="text-indigo-600 font-extrabold">{latestAssistantMsg?.response?.confidence ? `${latestAssistantMsg.response.confidence * 100}%` : "N/A"}</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="text-[9px] uppercase font-bold text-slate-400">Topic Area</span>
                <span className="text-slate-800 font-bold">{latestAssistantMsg?.response?.query_type === "recommendations" ? "Recommendations" : "Statistics"}</span>
              </div>
            </div>
          </div>

          {/* AI Intelligence parameters */}
          <div className="bg-white border border-slate-200/60 rounded-3xl p-4 space-y-3 shadow-sm">
            <div>
              <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Terminal size={14} className="text-indigo-650" />
                Copilot Memory
              </h3>
              <p className="text-[8px] text-slate-400 uppercase font-bold tracking-wider">Historical query references</p>
            </div>
            <div className="text-[9px] text-slate-450 leading-relaxed font-semibold">
              The model retains planning context from community records and priority signals, surfacing the most urgent development needs.
            </div>
          </div>

        </div>

      </div>
    </MainLayout>
  );
}