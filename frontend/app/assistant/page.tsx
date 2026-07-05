"use client";

import { useState, useRef, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { BrainCircuit, Send, Copy, Check, ChevronDown, ChevronUp, Loader2, Sparkles } from "lucide-react";
import { api, AssistantResponse } from "@/lib/api";

interface Message {
  sender: "user" | "assistant";
  text: string;
  response?: AssistantResponse;
}

const SUGGESTED_PROMPTS = [
  "Which ward has the highest healthcare demand?",
  "Why should the MP approve this project?",
  "Show top recommendations.",
  "Summarize water-related complaints.",
  "How many road repair complaints were submitted this month?",
  "Category distribution"
];

export default function AssistantPage() {
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [expandedData, setExpandedData] = useState<Record<number, boolean>>({});

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

    // Add user message
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
    } catch (err: any) {
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

  return (
    <MainLayout>
      <div className="h-[calc(100vh-10rem)] flex flex-col">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-white flex items-center gap-2">
            <BrainCircuit className="text-purple-500 animate-pulse" size={32} />
            AI Insight Assist
          </h1>
          <p className="text-slate-400 mt-2">
            Query the AI to analyze constituency data, generate reports, or identify development trends.
          </p>
        </div>

        {/* Chat Area Container */}
        <div className="flex-grow bg-slate-900 border border-slate-800 rounded-2xl flex flex-col overflow-hidden shadow-xl">
          {/* Message List */}
          <div className="flex-1 p-6 overflow-y-auto space-y-6">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col justify-center items-center text-center max-w-md mx-auto space-y-4">
                <div className="p-4 bg-purple-500/10 text-purple-400 rounded-full border border-purple-500/20">
                  <BrainCircuit size={40} />
                </div>
                <h2 className="text-xl font-semibold text-white">How can I assist you today, MP?</h2>
                <p className="text-slate-400 text-sm leading-relaxed">
                  I query real-time PostgreSQL data to give rankings, priority scores, and complaint counts for legislative decisions.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4 max-w-lg">
                  {SUGGESTED_PROMPTS.map((promptText) => (
                    <button
                      key={promptText}
                      onClick={() => handleSend(promptText)}
                      className="px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-left text-xs text-slate-350 hover:bg-slate-800 hover:border-slate-700 transition duration-200 cursor-pointer flex items-start gap-2 hover:text-white"
                    >
                      <Sparkles size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>{promptText}</span>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 max-w-3xl mx-auto">
                {messages.map((msg, index) => {
                  const isUser = msg.sender === "user";
                  return (
                    <div
                      key={index}
                      className={`flex flex-col ${isUser ? "items-end" : "items-start"}`}
                    >
                      {/* Message Bubble */}
                      <div
                        className={`max-w-[85%] rounded-2xl p-4 border text-sm leading-relaxed relative group ${
                          isUser
                            ? "bg-purple-600 border-purple-500 text-white rounded-br-none"
                            : "bg-slate-950/60 border-slate-800 text-slate-200 rounded-bl-none shadow-md"
                        }`}
                      >
                        {/* Render Plain Markdown Response (Support newlines) */}
                        <div className="whitespace-pre-wrap font-sans">
                          {msg.text}
                        </div>

                        {/* Actions for Assistant Response */}
                        {!isUser && (
                          <div className="flex gap-2 items-center justify-end mt-4 pt-2 border-t border-slate-800 text-slate-400 text-xs">
                            <span className="mr-auto font-mono text-[10px] text-slate-500">
                              Confidence: {msg.response?.confidence ? `${msg.response.confidence * 100}%` : "100%"}
                            </span>
                            <button
                              onClick={() => copyToClipboard(msg.text, index)}
                              className="p-1 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer flex items-center gap-1"
                              title="Copy response"
                            >
                              {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                              <span>{copiedIndex === index ? "Copied!" : "Copy"}</span>
                            </button>
                            {msg.response?.data && (
                              <button
                                onClick={() => toggleExpand(index)}
                                className="p-1 hover:text-white hover:bg-slate-800 rounded transition cursor-pointer flex items-center gap-1"
                              >
                                {expandedData[index] ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                <span>{expandedData[index] ? "Hide Data" : "Inspect Data"}</span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Expandable JSON Data Panel */}
                      {!isUser && msg.response?.data && expandedData[index] && (
                        <div className="w-full max-w-[85%] mt-2 p-4 bg-slate-950 border border-slate-800 rounded-xl overflow-x-auto text-[11px] font-mono text-blue-400 shadow-inner">
                          <pre>{JSON.stringify(msg.response.data, null, 2)}</pre>
                        </div>
                      )}

                      {/* Suggested Followups */}
                      {!isUser && msg.response?.suggested_followups && (
                        <div className="flex flex-wrap gap-2 mt-3 pl-2">
                          {msg.response.suggested_followups.map((followup) => (
                            <button
                              key={followup}
                              onClick={() => handleSend(followup)}
                              className="px-3 py-1.5 bg-slate-900 border border-slate-800 hover:border-purple-500/30 text-[11px] text-slate-350 hover:text-white rounded-full transition cursor-pointer active:scale-95"
                            >
                              {followup}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Loading indicator */}
                {loading && (
                  <div className="flex flex-col items-start">
                    <div className="flex gap-2 items-center p-4 bg-slate-950/60 border border-slate-800 rounded-2xl rounded-bl-none justify-center">
                      <div className="h-2.5 w-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                      <div className="h-2.5 w-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                      <div className="h-2.5 w-2.5 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-slate-800 bg-slate-950/50">
            <div className="relative max-w-3xl mx-auto flex items-center">
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend(query)}
                disabled={loading}
                placeholder="Ask AI Insight Assist a question..."
                className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none focus:border-purple-500 transition duration-200 disabled:opacity-60"
              />
              <button 
                onClick={() => handleSend(query)}
                disabled={loading}
                className="absolute right-2.5 p-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition duration-200 disabled:opacity-60 cursor-pointer active:scale-95"
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}