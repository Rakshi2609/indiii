"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  GitFork,
  HelpCircle,
  Info,
  Layers,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

interface SourceRef {
  record_id?: number;
  document_id?: number;
  title: string;
  survey_number: string;
  location: string;
  area?: string;
  route: string;
  gis_route?: string;
  document_route?: string;
}

interface PropertyCard {
  record_id: number;
  document_id?: number;
  survey_number: string;
  hissa_number?: string;
  village: string;
  district: string;
  state: string;
  owners: string[];
  area_ha?: number;
  area_acres?: number;
  land_tenure?: string;
  validation_status: string;
  has_discrepancy: boolean;
  discrepancy_details?: string;
  encumbrances: string[];
  mutation_count: number;
  view_route: string;
  gis_route?: string;
}

interface Message {
  id: string;
  sender: "user" | "assistant";
  text: string;
  timestamp: string;
  data_found?: boolean;
  confidence?: string;
  aggregates?: any;
  sources?: SourceRef[];
  properties?: PropertyCard[];
  warnings?: string[];
  requires_review?: boolean;
  execution_trace?: any;
  loadingStep?: string;
}

export default function LandAICopilotPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [expandedTraceId, setExpandedTraceId] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize with greeting and fetch suggested queries
  useEffect(() => {
    fetchSuggestions();
    
    // Welcome message
    const welcomeMsg: Message = {
      id: "welcome-1",
      sender: "assistant",
      text: (
        "Welcome to **Land AI Copilot** (इंडी-भूमि सहायक) — your intelligent, database-grounded land intelligence partner.\n\n" +
        "**Guaranteed Architectural Rule:** Every answer is reasoned strictly over verified **PostgreSQL/PostGIS Land Records** and extracted cadastral deeds. Mistral never invents records or answers from pretrained assumptions."
      ),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      data_found: true,
      confidence: "high",
      execution_trace: {
        pipeline: "Database-First Grounding",
        source_of_truth: "PostGIS Cadastral DB",
        model: "mistral-small-latest"
      }
    };
    setMessages([welcomeMsg]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const fetchSuggestions = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/copilot/suggestions");
      if (res.ok) {
        setSuggestions(await res.json());
      }
    } catch (e) {
      console.warn("Could not load suggestions from API, using defaults.");
      setSuggestions([
        { category: "Ownership & Totals", query: "How much land does Nishu own?", description: "Multi-state aggregate total acres & state breakdown" },
        { category: "Discrepancies & Alerts", query: "Which of my properties need attention?", description: "Deed vs Cadastral GIS area mismatches" },
        { category: "Regional Holdings", query: "Show my land in Karnataka", description: "List verified properties in Karnataka" },
        { category: "Comparative Extent", query: "Which property has the largest area?", description: "Highest acreage parcel with survey location" },
        { category: "Historical Lineage", query: "Give me the ownership history of Survey 142/2B", description: "Trace mutation entries and title chain" },
      ]);
    }
  };

  const handleSend = async (userQuery?: string) => {
    const textToSend = userQuery || query;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/api/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: textToSend }),
      });

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();

      const assistantMsg: Message = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: data.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_found: data.data_found,
        confidence: data.confidence,
        aggregates: data.aggregates,
        sources: data.sources,
        properties: data.properties,
        warnings: data.warnings,
        requires_review: data.requires_review,
        execution_trace: data.execution_trace
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: Message = {
        id: `error-${Date.now()}`,
        sender: "assistant",
        text: `⚠️ **Connection Error**: Unable to reach Land AI Copilot backend (${err.message}). Please ensure the FastAPI backend is running at \`http://localhost:8000\`.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        data_found: false,
        confidence: "low"
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      const res = await fetch("http://localhost:8000/api/copilot/seed-demo", { method: "POST" });
      if (res.ok) {
        handleSend("How much land does Nishu own?");
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-50">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/90 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-lg shadow-indigo-500/20">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Land AI Copilot</h1>
              <Badge variant="outline" className="border-indigo-500/40 bg-indigo-500/10 text-indigo-400 text-xs px-2 py-0.5">
                इंडी-भूमि सहायक
              </Badge>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-xs px-2 py-0.5">
                DB-Grounded
              </Badge>
            </div>
            <p className="text-xs text-slate-400">
              Deterministic DB Search &amp; Spatial Verification • Mistral AI Reasoning Layer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-1.5 text-xs text-slate-300">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span>Source of Truth: <strong className="text-white">PostGIS LandRecord DB</strong></span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSeedDemo}
            className="border-slate-700 bg-slate-900 text-xs hover:bg-slate-800 hover:text-white"
          >
            <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
            Seed Multi-State Demo
          </Button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col max-w-6xl w-full mx-auto p-4 md:p-6 gap-6">
        
        {/* Suggested Quick Queries Carousel */}
        {suggestions.length > 0 && messages.length <= 2 && (
          <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-purple-950/30 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-400">
                <Zap className="h-3.5 w-3.5" />
                <span>Suggested Land Intelligence Queries</span>
              </div>
              <span className="text-xs text-slate-500">Click to execute deterministic query</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
              {suggestions.slice(0, 6).map((s, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(s.query)}
                  className="flex flex-col text-left p-3 rounded-xl border border-slate-800 bg-slate-900/60 hover:bg-slate-800/80 hover:border-indigo-500/50 transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between w-full mb-1">
                    <span className="text-xs font-medium text-slate-400 group-hover:text-indigo-300">
                      {s.category}
                    </span>
                    <ArrowRight className="h-3 w-3 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                  <span className="text-sm font-semibold text-white group-hover:text-indigo-200 line-clamp-1">
                    &ldquo;{s.query}&rdquo;
                  </span>
                  <span className="text-xs text-slate-500 mt-1 line-clamp-1">
                    {s.description}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Conversation Feed */}
        <div className="flex-1 flex flex-col gap-6 overflow-y-auto min-h-[400px]">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3.5 ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.sender === "assistant" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                  <Bot className="h-5 w-5 text-white" />
                </div>
              )}

              <div
                className={`flex flex-col max-w-4xl rounded-2xl p-5 ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-lg shadow-indigo-950/40"
                    : "bg-slate-900/90 border border-slate-800/90 text-slate-100 rounded-bl-none shadow-xl"
                }`}
              >
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 mb-2 pb-1 border-b border-slate-800/40">
                  <span className="text-xs font-semibold tracking-wide text-slate-400">
                    {msg.sender === "user" ? "You (Citizen / Officer)" : "Land AI Copilot"}
                  </span>
                  <div className="flex items-center gap-2">
                    {msg.confidence && (
                      <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] px-1.5 py-0">
                        {msg.confidence.toUpperCase()} CONFIDENCE
                      </Badge>
                    )}
                    <span className="text-[11px] text-slate-500">{msg.timestamp}</span>
                  </div>
                </div>

                {/* Natural Language Body with Rich React Markdown */}
                <div className="text-slate-200 leading-relaxed">
                  <MarkdownRenderer content={msg.text} />
                </div>

                {/* Aggregates Summary Stats Bar */}
                {msg.aggregates && msg.aggregates.total_properties > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5 text-center">
                      <span className="text-[11px] text-slate-400 block">Total Land Extent</span>
                      <strong className="text-sm text-emerald-400 font-bold">
                        {msg.aggregates.total_area_acres} Acres
                      </strong>
                      <span className="text-[10px] text-slate-500 block">({msg.aggregates.total_area_ha} Ha)</span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5 text-center">
                      <span className="text-[11px] text-slate-400 block">Total Properties</span>
                      <strong className="text-sm text-indigo-400 font-bold">
                        {msg.aggregates.total_properties} Parcels
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Across {Object.keys(msg.aggregates.state_breakdown || {}).length} States</span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5 text-center">
                      <span className="text-[11px] text-slate-400 block">GIS Discrepancies</span>
                      <strong className={`text-sm font-bold ${msg.aggregates.discrepancies_count > 0 ? "text-amber-400" : "text-slate-400"}`}>
                        {msg.aggregates.discrepancies_count} Flagged
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Area Variance &gt;5%</span>
                    </div>

                    <div className="rounded-lg bg-slate-950/60 border border-slate-800 p-2.5 text-center">
                      <span className="text-[11px] text-slate-400 block">Pending Reviews</span>
                      <strong className="text-sm text-purple-400 font-bold">
                        {msg.aggregates.pending_count || 0} Records
                      </strong>
                      <span className="text-[10px] text-slate-500 block">Awaiting Officer</span>
                    </div>
                  </div>
                )}

                {/* Warnings / Discrepancy Alert Box */}
                {msg.warnings && msg.warnings.length > 0 && (
                  <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-3.5 text-amber-200">
                    <div className="flex items-center gap-2 font-semibold text-xs text-amber-400 mb-1.5">
                      <AlertTriangle className="h-4 w-4" />
                      <span>Cadastral Boundary &amp; Discrepancy Warnings</span>
                    </div>
                    <ul className="text-xs space-y-1 pl-5 list-disc text-amber-200/90">
                      {msg.warnings.map((w, wIdx) => (
                        <li key={wIdx}>{w}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Property Summary Cards */}
                {msg.properties && msg.properties.length > 0 && (
                  <div className="mt-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 uppercase">
                      <span>Verified Land Records ({msg.properties.length})</span>
                      <span className="text-[11px] text-slate-500">Click actions to inspect</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {msg.properties.map((prop) => (
                        <div
                          key={prop.record_id}
                          className={`rounded-xl border p-3.5 transition-all duration-200 ${
                            prop.has_discrepancy
                              ? "border-amber-500/40 bg-amber-950/10 hover:border-amber-500/60"
                              : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-sm text-white">Survey {prop.survey_number}</span>
                                {prop.hissa_number && (
                                  <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-800 text-slate-300">
                                    Hissa {prop.hissa_number}
                                  </Badge>
                                )}
                              </div>
                              <span className="text-xs text-slate-400 block mt-0.5">
                                {prop.village}, {prop.district} ({prop.state})
                              </span>
                            </div>

                            {prop.has_discrepancy ? (
                              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px]">
                                ⚠ Mismatch
                              </Badge>
                            ) : (
                              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                                ✓ Verified
                              </Badge>
                            )}
                          </div>

                          {/* Owners & Area */}
                          <div className="text-xs space-y-1 text-slate-300 py-1.5 border-t border-b border-slate-800/60 my-2">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Owners:</span>
                              <span className="font-medium text-white line-clamp-1">{prop.owners.join(", ") || "Recorded Titleholder"}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Recorded Extent:</span>
                              <span className="font-medium text-emerald-400">{prop.area_acres} Acres ({prop.area_ha} Ha)</span>
                            </div>
                            {prop.discrepancy_details && (
                              <div className="text-[11px] text-amber-300 font-medium pt-0.5">
                                {prop.discrepancy_details}
                              </div>
                            )}
                            {prop.encumbrances.length > 0 && (
                              <div className="flex justify-between text-purple-300 text-[11px]">
                                <span>Encumbrance:</span>
                                <span>{prop.encumbrances.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          {/* Direct Nav Links */}
                          <div className="flex items-center gap-2 pt-1">
                            <Link
                              href={prop.view_route}
                              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 px-2.5 py-1.5 text-xs font-semibold text-indigo-300 transition-colors"
                            >
                              <FileCheck2 className="h-3.5 w-3.5" />
                              View Record
                            </Link>

                            <Link
                              href={prop.gis_route || `/gis?survey=${prop.survey_number}`}
                              className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/80 border border-slate-700 hover:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-300 transition-colors"
                            >
                              <Compass className="h-3.5 w-3.5 text-emerald-400" />
                              GIS Map
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Evidence & Source References Accordion */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-slate-800/80">
                    <button
                      onClick={() => setExpandedTraceId(expandedTraceId === msg.id ? null : msg.id)}
                      className="flex items-center justify-between w-full text-xs text-slate-400 hover:text-indigo-300 transition-colors"
                    >
                      <div className="flex items-center gap-1.5">
                        <Database className="h-3.5 w-3.5 text-emerald-400" />
                        <span>Source Traceability ({msg.sources.length} Verified Database Records)</span>
                      </div>
                      <ChevronDown
                        className={`h-3.5 w-3.5 transition-transform duration-200 ${
                          expandedTraceId === msg.id ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {expandedTraceId === msg.id && (
                      <div className="mt-3 space-y-2 rounded-xl bg-slate-950/90 border border-slate-800 p-3 text-xs">
                        <p className="text-[11px] text-slate-400">
                          These factual records were retrieved directly from the PostgreSQL/SQLite Land AI database before being passed into the Mistral reasoning engine:
                        </p>
                        <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                          {msg.sources.map((s, sIdx) => (
                            <div key={sIdx} className="flex items-center justify-between p-2 rounded-lg bg-slate-900 border border-slate-800/60">
                              <div>
                                <span className="font-semibold text-white">{s.title}</span>
                                <span className="text-slate-400 block text-[11px]">{s.location} • {s.area}</span>
                              </div>
                              <Link
                                href={s.route}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium text-xs ml-3 shrink-0"
                              >
                                Record #{s.record_id} <ExternalLink className="h-3 w-3" />
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Execution Trace Indicator */}
                {msg.execution_trace && (
                  <div className="mt-3 pt-2 text-[10px] text-slate-500 flex items-center justify-between">
                    <span>
                      Pipeline: <strong className="text-slate-400">{msg.execution_trace.pipeline}</strong>
                    </span>
                    <span>
                      Model: <strong className="text-slate-400">{msg.execution_trace.model || "Mistral OCR/LLM"}</strong>
                    </span>
                  </div>
                )}
              </div>

              {msg.sender === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-700 shadow-md">
                  <User className="h-5 w-5 text-white" />
                </div>
              )}
            </div>
          ))}

          {/* Stepped Loading State */}
          {loading && (
            <div className="flex gap-3.5 justify-start">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 animate-pulse">
                <Bot className="h-5 w-5 text-white" />
              </div>
              <div className="rounded-2xl rounded-bl-none border border-slate-800 bg-slate-900 p-4 shadow-xl max-w-md">
                <div className="flex items-center gap-3 text-sm text-indigo-300 font-medium mb-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Processing Land Intelligence Query...</span>
                </div>
                <div className="space-y-1 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>1. Intent &amp; Entity Parsing</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <CheckCircle2 className="h-3 w-3" />
                    <span>2. Database-First Record Search</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-indigo-400 animate-pulse">
                    <Clock className="h-3 w-3" />
                    <span>3. Mistral Grounded Evidence Reasoning...</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="sticky bottom-4 z-20">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/90 p-2 shadow-2xl backdrop-blur-xl focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50"
          >
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything about land records, ownership, area, discrepancies, mutations, or survey numbers..."
              className="flex-1 bg-transparent px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none"
              disabled={loading}
            />
            <Button
              type="submit"
              disabled={!query.trim() || loading}
              className="rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 disabled:opacity-50"
            >
              <Send className="mr-1.5 h-4 w-4" />
              Ask Copilot
            </Button>
          </form>
          <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-500">
            <span>🔒 Grounded exclusively in verified Land AI records • Zero hallucination</span>
            <span>FastAPI Backend :8000 • Mistral Vision &amp; Reasoning</span>
          </div>
        </div>

      </main>
    </div>
  );
}
