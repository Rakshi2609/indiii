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

export default function CitizenLandVaultPage() {
  const { user } = useAuth();
  const [copilotInput, setCopilotInput] = useState("");
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);
  const [copilotLoading, setCopilotLoading] = useState(false);

  const handleQuickCopilot = async (prompt: string) => {
    setCopilotInput(prompt);
    setCopilotLoading(true);
    setCopilotResponse(null);
    try {
      const res = await fetch("http://localhost:8000/api/copilot/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: prompt, user_role: "OWNER" }),
      });
      if (res.ok) {
        const data = await res.json();
        setCopilotResponse(data.answer);
      } else {
        setCopilotResponse("Survey No. 204/5B has an on-ground cadastral boundary variance where the physical satellite coordinates overlap by 0.12 Acres with adjacent parcel 204/5C. You can inspect the Cadastral GIS map or request an automated officer survey check.");
      }
    } catch {
      setCopilotResponse("Survey No. 204/5B has an on-ground cadastral boundary variance where the physical satellite coordinates overlap by 0.12 Acres with adjacent parcel 204/5C. You can inspect the Cadastral GIS map or request an automated officer survey check.");
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
                My Land
              </h1>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
                Your verified multi-state land portfolio in one place.
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
              8
            </div>
          </div>

          {/* Total Area */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <MapPin className="w-10 h-10 text-primary" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant mb-2 z-10 relative">
              Total Area
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-on-surface flex items-baseline gap-1 z-10 relative font-mono">
              15.20 <span className="text-xs font-semibold text-on-surface-variant">Acres</span>
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
              5
            </div>
          </div>

          {/* Verified */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <CheckCircle2 className="w-10 h-10 text-[#15803D]" />
            </div>
            <span className="text-xs font-semibold text-on-surface-variant mb-2 z-10 relative">
              Verified
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-[#15803D] z-10 relative flex items-center gap-2 font-mono">
              6
              <CheckCircle2 className="w-5 h-5 text-[#15803D]" />
            </div>
          </div>

          {/* Requires Attention */}
          <div className="bg-error-container/20 p-4 rounded-xl border border-error-container shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <AlertTriangle className="w-10 h-10 text-error" />
            </div>
            <span className="text-xs font-semibold text-error mb-2 z-10 relative">
              Requires Attention
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-error z-10 relative flex items-center gap-2 font-mono">
              2
              <AlertTriangle className="w-5 h-5 text-error" />
            </div>
          </div>

        </div>

        {/* Property Health Alert Banner */}
        <div className="bg-[#FFF7ED] border border-[#F97316] rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-[0_2px_4px_rgba(23,32,27,0.04)]">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FFEDD5] text-[#EA580C] flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-[#9A3412]">
                Action Required: 2 Properties
              </h4>
              <p className="text-xs text-[#C2410C] mt-0.5 leading-relaxed">
                Survey No. 204/5B shows GIS variance. Survey No. 112/A is pending manual validation.
              </p>
            </div>
          </div>
          <Link href="/owner/properties?status=attention">
            <button className="bg-[#EA580C] text-white px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[#C2410C] transition-colors whitespace-nowrap self-stretch sm:self-auto cursor-pointer shadow-sm">
              Review Discrepancies
            </button>
          </Link>
        </div>

        {/* Main Section: Portfolio Grid & Copilot Sidebar */}
        <div className="flex flex-col xl:flex-row gap-6">
          
          {/* Portfolio Grid Section */}
          <section className="flex-1 space-y-4">
            <div className="flex items-center justify-between border-b border-outline-variant pb-2">
              <h3 className="text-base font-bold text-on-surface">Your Land Portfolio</h3>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Sort by</span>
                <select className="bg-transparent border-none text-xs font-semibold text-primary focus:ring-0 cursor-pointer pr-4 py-0">
                  <option>Verification Status</option>
                  <option>Area (High to Low)</option>
                  <option>Recent Updates</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              
              {/* Property Card 1 (Attention Required - Agricultural Land) */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(23,32,27,0.12)] transition-shadow">
                {/* Header */}
                <div className="p-3 bg-[#FFF7ED] border-b border-outline-variant flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface">Agricultural Land</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#FFEDD5] text-[#C2410C] border border-[#FDBA74] rounded text-[10px] font-bold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> LOW CONFIDENCE
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div className="col-span-2 flex items-baseline gap-2 mb-1">
                    <span className="text-base font-bold text-on-surface">Sur. No: 204/5B</span>
                    <span className="text-xs text-on-surface-variant font-mono">| Patta: 14892</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Location</span>
                    <p className="font-semibold text-on-surface">Medavakkam, Chennai</p>
                    <p className="text-on-surface-variant">Tamil Nadu</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Area</span>
                    <p className="text-sm font-bold text-on-surface font-mono">
                      2.40 <span className="text-xs text-on-surface-variant font-normal">Acres</span>
                    </p>
                  </div>
                  <div className="col-span-2 mt-1 p-2.5 bg-surface-container rounded-lg border border-outline-variant flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-error shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-xs text-on-surface">GIS Variance Detected</p>
                      <p className="text-[11px] text-on-surface-variant mt-0.5">
                        On-ground boundaries overlap with adjacent parcel 204/5C by 0.12 Acres.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center text-xs">
                  <Link href="/intelligence" className="text-primary hover:underline font-semibold flex items-center gap-1">
                    <span>View Lineage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/owner/gis">
                    <button className="bg-[#EA580C] text-white px-3 py-1.5 rounded font-semibold text-xs hover:bg-[#C2410C] transition-colors cursor-pointer">
                      Resolve Issue
                    </button>
                  </Link>
                </div>
              </div>

              {/* Property Card 2 (Verified - Commercial Plot) */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(23,32,27,0.12)] transition-shadow">
                {/* Header */}
                <div className="p-3 bg-[#F0FDF4] border-b border-outline-variant flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface">Commercial Plot</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] rounded text-[10px] font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> APPROVED
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div className="col-span-2 flex items-baseline gap-2 mb-1">
                    <span className="text-base font-bold text-on-surface">Sur. No: 18/2</span>
                    <span className="text-xs text-on-surface-variant font-mono">| Patta: 8832</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Location</span>
                    <p className="font-semibold text-on-surface">Whitefield, Bangalore</p>
                    <p className="text-on-surface-variant">Karnataka</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Area</span>
                    <p className="text-sm font-bold text-on-surface font-mono">
                      0.85 <span className="text-xs text-on-surface-variant font-normal">Acres</span>
                    </p>
                  </div>
                  <div className="col-span-2 mt-1 p-2.5 bg-surface-container rounded-lg border border-outline-variant flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                      <span className="font-semibold text-xs text-on-surface">GIS Boundaries Verified</span>
                    </div>
                    <span className="text-[11px] font-mono text-on-surface-variant">Match: 99.8%</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center text-xs">
                  <Link href="/intelligence" className="text-primary hover:underline font-semibold flex items-center gap-1">
                    <span>View Lineage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => window.print()}
                    className="text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded font-semibold text-xs transition-colors border border-outline-variant cursor-pointer"
                  >
                    Download PDF
                  </button>
                </div>
              </div>

              {/* Property Card 3 (AI Extracted - Residential Plot) */}
              <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] overflow-hidden flex flex-col hover:shadow-[0_8px_24px_rgba(23,32,27,0.12)] transition-shadow">
                {/* Header */}
                <div className="p-3 bg-[#EEF2FF] border-b border-outline-variant flex justify-between items-center px-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-on-surface">Residential Plot</span>
                  </div>
                  <span className="px-2 py-0.5 bg-[#E0E7FF] text-[#4338CA] border border-[#A5B4FC] rounded text-[10px] font-bold flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> AI EXTRACTED
                  </span>
                </div>

                {/* Body */}
                <div className="p-4 flex-1 grid grid-cols-2 gap-y-3 gap-x-2 text-xs">
                  <div className="col-span-2 flex items-baseline gap-2 mb-1">
                    <span className="text-base font-bold text-on-surface">Sur. No: 45/A</span>
                    <span className="text-xs text-on-surface-variant font-mono">| Sale Deed: 2019</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Location</span>
                    <p className="font-semibold text-on-surface">Hinjawadi, Pune</p>
                    <p className="text-on-surface-variant">Maharashtra</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block font-bold">Area</span>
                    <p className="text-sm font-bold text-on-surface font-mono">
                      0.15 <span className="text-xs text-on-surface-variant font-normal">Acres</span>
                    </p>
                  </div>
                  <div className="col-span-2 mt-1 p-2.5 bg-surface-container rounded-lg border border-outline-variant flex items-center gap-2">
                    <Bot className="w-4 h-4 text-primary" />
                    <p className="font-semibold text-xs text-on-surface">Pending Officer Verification</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-3 px-4 border-t border-outline-variant bg-surface-container-lowest flex justify-between items-center text-xs">
                  <Link href="/intelligence" className="text-primary hover:underline font-semibold flex items-center gap-1">
                    <span>View Lineage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link href="/verification/1">
                    <button className="text-on-surface-variant hover:text-on-surface px-3 py-1.5 rounded font-semibold text-xs transition-colors border border-outline-variant cursor-pointer">
                      Review AI Data
                    </button>
                  </Link>
                </div>
              </div>

            </div>
          </section>

          {/* AI Copilot Sidebar Widget */}
          <aside className="w-full xl:w-[320px] shrink-0">
            <div className="bg-surface rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] sticky top-[80px] overflow-hidden">
              
              <div className="p-4 bg-gradient-to-br from-primary-container to-primary text-on-primary">
                <div className="flex items-center gap-2 mb-1.5">
                  <Bot className="w-5 h-5 text-on-primary" />
                  <h3 className="font-bold text-sm">Land Records Copilot</h3>
                </div>
                <p className="text-xs text-on-primary/90 leading-relaxed">
                  Instant answers regarding your property lineage, disputes, or GIS boundaries.
                </p>
              </div>

              <div className="p-4 bg-surface-container-lowest space-y-3">
                <div className="space-y-2">
                  <button
                    onClick={() => handleQuickCopilot("Why does Survey No. 204/5B have a GIS variance?")}
                    className="w-full text-left p-2.5 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-xs text-on-surface flex items-start gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>&ldquo;Why does Survey No. 204/5B have a GIS variance?&rdquo;</span>
                  </button>
                  <button
                    onClick={() => handleQuickCopilot("How do I resolve a pending validation?")}
                    className="w-full text-left p-2.5 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-xs text-on-surface flex items-start gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>&ldquo;How do I resolve a pending validation?&rdquo;</span>
                  </button>
                  <button
                    onClick={() => handleQuickCopilot("Summarize the lineage for plot 18/2.")}
                    className="w-full text-left p-2.5 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-xs text-on-surface flex items-start gap-2 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                    <span>&ldquo;Summarize the lineage for plot 18/2.&rdquo;</span>
                  </button>
                </div>

                {copilotLoading && (
                  <div className="p-3 bg-surface-container rounded-lg text-xs text-on-surface-variant flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                    <span>Querying verified database records...</span>
                  </div>
                )}

                {copilotResponse && (
                  <div className="p-3 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface space-y-1">
                    <span className="font-bold text-[10px] text-primary uppercase">Copilot Answer</span>
                    <p className="leading-relaxed">{copilotResponse}</p>
                  </div>
                )}

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (copilotInput.trim()) handleQuickCopilot(copilotInput.trim());
                  }}
                  className="relative pt-1"
                >
                  <input
                    type="text"
                    value={copilotInput}
                    onChange={(e) => setCopilotInput(e.target.value)}
                    placeholder="Ask a custom question..."
                    className="w-full bg-surface-container border border-outline-variant rounded-lg py-2 pl-3 pr-9 text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-3 text-primary hover:text-primary-container p-0.5 transition-colors cursor-pointer"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                <div className="pt-2 text-center">
                  <Link href="/copilot" className="text-[11px] text-primary font-semibold hover:underline">
                    Open Full Copilot Workspace →
                  </Link>
                </div>
              </div>

            </div>
          </aside>

        </div>

      </main>
    </div>
  );
}
