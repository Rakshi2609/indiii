"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  FileCheck2,
  FileText,
  History,
  Home,
  Layers,
  MapPin,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";

interface OwnerOverview {
  total_properties: number;
  total_area_acres: number;
  total_area_ha: number;
  states_count: number;
  verified_count: number;
  action_required_count: number;
  state_breakdown: Record<string, number>;
  district_breakdown: Record<string, number>;
}

export default function CitizenLandVaultPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const fetchOwnerData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const [overviewRes, propsRes] = await Promise.allSettled([
        fetch("http://localhost:8000/api/owner/overview", { headers }),
        fetch("http://localhost:8000/api/owner/properties", { headers }),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.ok) {
        const data = await overviewRes.value.json();
        setOverview(data);
      } else {
        loadMockOverview();
      }

      if (propsRes.status === "fulfilled" && propsRes.value.ok) {
        const pData = await propsRes.value.json();
        setProperties(pData);
      } else {
        loadMockProperties();
      }
    } catch {
      loadMockOverview();
      loadMockProperties();
    } finally {
      setLoading(false);
    }
  };

  const loadMockOverview = () => {
    setOverview({
      total_properties: 8,
      total_area_acres: 15.2,
      total_area_ha: 6.15,
      states_count: 5,
      verified_count: 6,
      action_required_count: 2,
      state_breakdown: { "Karnataka": 3, "Maharashtra": 2, "Tamil Nadu": 1, "Telangana": 2 },
      district_breakdown: { "Bengaluru Rural": 3, "Pune": 2, "Chengalpattu": 1, "Rangareddy": 2 },
    });
  };

  const loadMockProperties = () => {
    setProperties([
      {
        id: 7,
        survey_number: "88/3A",
        village: "Devanahalli",
        district: "Bengaluru Rural",
        state: "Karnataka",
        total_area: 2.1,
        total_area_acres: 2.1,
        total_area_ha: 0.85,
        area_unit: "acres",
        status: "VERIFIED",
        validation_status: "VERIFIED",
        has_discrepancy: false,
        has_gis_polygon: true,
      },
      {
        id: 10,
        survey_number: "156/AA",
        village: "Shamshabad",
        district: "Rangareddy",
        state: "Telangana",
        total_area: 1.8,
        total_area_acres: 1.8,
        total_area_ha: 0.73,
        area_unit: "acres",
        status: "ATTENTION_REQUIRED",
        validation_status: "FLAGGED_FOR_REVIEW",
        has_discrepancy: true,
        discrepancy_details: "Pending succession mutation order cross-verification.",
        has_gis_polygon: true,
      },
    ]);
  };

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const handleQuickCopilot = async (prompt: string) => {
    setCopilotInput(prompt);
    setCopilotLoading(true);
    setCopilotResponse(null);
    try {
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("http://localhost:8000/api/copilot/query", {
        method: "POST",
        headers,
        body: JSON.stringify({ query: prompt, user_role: "OWNER" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotResponse(data.answer);
      } else {
        setCopilotResponse("You own parcels across Karnataka, Maharashtra, Telangana, and Andhra Pradesh. Survey 156/AA has a pending succession review, while Survey 88/3A is fully verified in the cadastral registry.");
      }
    } catch {
      setCopilotResponse("You own parcels across Karnataka, Maharashtra, Telangana, and Andhra Pradesh. Survey 156/AA has a pending succession review, while Survey 88/3A is fully verified in the cadastral registry.");
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Topbar */}
      <Topbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Breadcrumb & Page Header */}
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant mb-2">
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-outline" />
            <span className="text-on-surface font-bold">Owner Land Vault</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
                My Land Vault
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Verified multi-state land portfolio, digital deed repository, and cadastral spatial status for {user?.full_name || "Nishu Kumar"}.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="bg-surface-container-high text-on-surface px-4 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container-highest transition-colors flex items-center gap-2 border border-outline-variant cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
            </div>
          </div>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          
          {/* Total Properties */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Layers className="w-10 h-10 text-primary" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant mb-2 z-10 relative">
              Total Properties
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-on-surface z-10 relative font-mono">
              {overview ? overview.total_properties : (loading ? "…" : properties.length)}
            </div>
          </div>

          {/* Total Area */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant mb-2 z-10 relative">
              Total Extent
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-on-surface flex items-baseline gap-1 z-10 relative font-mono">
              {overview ? overview.total_area_acres.toFixed(2) : "15.20"}{" "}
              <span className="text-xs font-semibold text-on-surface-variant">Acres</span>
            </div>
          </div>

          {/* States */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Compass className="w-10 h-10 text-primary" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant mb-2 z-10 relative">
              States
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-on-surface z-10 relative font-mono">
              {overview ? overview.states_count : "—"}
            </div>
          </div>

          {/* Verified */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <CheckCircle2 className="w-10 h-10 text-[#15803D]" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant mb-2 z-10 relative">
              Verified Clear
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#15803D] z-10 relative flex items-center gap-2 font-mono">
              {overview ? overview.verified_count : "—"}
              <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
            </div>
          </div>

          {/* Requires Attention */}
          <div className="bg-error-container/20 p-4 rounded-xl border border-error-container shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <AlertTriangle className="w-10 h-10 text-error" />
            </div>
            <span className="text-xs font-semibold text-error mb-2 z-10 relative">
              Needs Review
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-error z-10 relative flex items-center gap-2 font-mono">
              {overview ? overview.action_required_count : "0"}
              {overview && overview.action_required_count > 0 && (
                <AlertTriangle className="w-5 h-5 text-error" />
              )}
            </div>
          </div>

        </div>

        {/* Property Health Alert Banner */}
        {overview && overview.action_required_count > 0 && (
          <div className="bg-[#FFF7ED] border border-[#F97316] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_4px_rgba(23,32,27,0.04)]">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#9A3412]">
                  Action Recommended: {overview.action_required_count} Property Discrepancies
                </h4>
                <p className="text-xs text-[#C2410C] mt-0.5 leading-relaxed">
                  Cadastral boundary variance or unverified succession entries detected. Review your parcel records to maintain statutory compliance.
                </p>
              </div>
            </div>
            <Link href="/owner/properties?status=attention">
              <button className="bg-[#EA580C] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#C2410C] transition-colors whitespace-nowrap self-stretch sm:self-auto cursor-pointer shadow-sm">
                Review Discrepancies
              </button>
            </Link>
          </div>
        )}

        {/* Main Section: Portfolio Grid & Copilot Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Portfolio Grid Section */}
          <section className="flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-base font-bold text-on-surface">Your Land Holdings ({properties.length})</h3>
              <Link href="/owner/properties" className="text-primary text-xs font-semibold hover:underline">
                View All Properties →
              </Link>
            </div>

            {loading ? (
              <div className="py-16 text-center text-xs text-on-surface-variant">
                <RefreshCw className="w-7 h-7 mx-auto animate-spin text-primary mb-2" />
                Loading your verified properties...
              </div>
            ) : properties.length === 0 ? (
              <div className="bg-surface rounded-xl border border-dashed border-outline-variant p-8 text-center space-y-2">
                <MapPin className="w-8 h-8 mx-auto text-outline" />
                <h4 className="font-bold text-sm text-on-surface">No Properties Found in Vault</h4>
                <p className="text-xs text-on-surface-variant">Your verified revenue deeds will appear here automatically.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {properties.map((prop) => {
                  const isFlagged = prop.has_discrepancy || prop.status === "ATTENTION_REQUIRED" || prop.validation_status?.includes("FLAGGED");
                  return (
                    <div
                      key={prop.id}
                      className={`bg-surface rounded-xl border shadow-[0_2px_4px_rgba(23,32,27,0.04)] overflow-hidden flex flex-col hover:shadow-md transition-shadow ${
                        isFlagged ? "border-[#FDBA74] bg-[#FFF7ED]" : "border-outline-variant"
                      }`}
                    >
                      {/* Header */}
                      <div className={`p-3 border-b border-outline-variant flex justify-between items-center px-4 ${
                        isFlagged ? "bg-[#FFEDD5]" : "bg-surface-container-low"
                      }`}>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-on-surface font-mono">
                            Survey No. {prop.survey_number}
                          </span>
                        </div>
                        <Badge variant={isFlagged ? "warning" : "verified"} className="text-[10px]">
                          {isFlagged ? "⚠ Needs Review" : "✓ Verified"}
                        </Badge>
                      </div>

                      {/* Body */}
                      <div className="p-4 flex-1 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                        <div className="col-span-2 flex items-baseline gap-2 mb-1">
                          <span className="text-base font-bold text-on-surface">{prop.village}, {prop.district}</span>
                          <span className="text-xs text-on-surface-variant font-medium">({prop.state})</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Extent</span>
                          <p className="text-sm font-bold text-primary font-mono">
                            {prop.total_area_acres || prop.total_area} {prop.area_unit || "Acres"}
                          </p>
                        </div>
                        <div>
                          <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Cadastral GIS</span>
                          <p className="font-semibold text-[#15803D] flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5" /> Mapped
                          </p>
                        </div>
                        {prop.discrepancy_details && (
                          <div className="col-span-2 p-2 bg-[#FFEDD5] text-[#9A3412] rounded border border-[#FDBA74] text-[11px]">
                            {prop.discrepancy_details}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      <div className="p-3 px-4 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center text-xs">
                        <Link href={`/owner/properties/${prop.id}`} className="text-primary hover:underline font-semibold flex items-center gap-1">
                          <span>Property Details</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                        <Link href={`/owner/gis?survey=${prop.survey_number}`}>
                          <button className="bg-surface border border-outline-variant hover:bg-surface-container-high px-3 py-1.5 rounded font-semibold text-xs text-on-surface transition-colors cursor-pointer flex items-center gap-1">
                            <Compass className="w-3.5 h-3.5 text-primary" />
                            <span>View GIS</span>
                          </button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Right Section: AI Copilot Assistant */}
          <aside className="w-full xl:w-[380px] space-y-4">
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-5 space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#EEF2FF] text-[#4F46E5] flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-on-surface">Land AI Copilot</h4>
                  <p className="text-[11px] text-on-surface-variant">Grounded in your official revenue deeds</p>
                </div>
              </div>

              {/* Sample Prompts */}
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider block">
                  Quick Inquiries
                </span>
                {[
                  "Which of my properties have active GIS discrepancies?",
                  "Show all my registered parcels in Karnataka",
                  "What is my total land holding across all states?",
                ].map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickCopilot(q)}
                    className="w-full text-left p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-xs text-on-surface border border-outline-variant transition-colors block cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>

              {/* Response Output */}
              {copilotLoading ? (
                <div className="p-3 bg-surface-container rounded-lg border border-outline-variant text-xs text-on-surface-variant flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-primary" />
                  <span>Consulting Land AI grounded database...</span>
                </div>
              ) : copilotResponse ? (
                <div className="p-3.5 bg-[#F0FDF4] border border-[#86EFAC] rounded-xl text-xs text-[#166534] space-y-2">
                  <div className="font-bold flex items-center gap-1.5 text-[#15803D]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Copilot Grounded Analysis:</span>
                  </div>
                  <p className="leading-relaxed">{copilotResponse}</p>
                </div>
              ) : null}

              {/* Chat Input */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={copilotInput}
                  onChange={(e) => setCopilotInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && copilotInput.trim()) {
                      handleQuickCopilot(copilotInput);
                    }
                  }}
                  placeholder="Ask any question about your land..."
                  className="flex-1 bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <Button
                  size="sm"
                  onClick={() => copilotInput.trim() && handleQuickCopilot(copilotInput)}
                  disabled={!copilotInput.trim() || copilotLoading}
                  className="bg-primary text-on-primary px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          </aside>

        </div>

      </main>
    </div>
  );
}
