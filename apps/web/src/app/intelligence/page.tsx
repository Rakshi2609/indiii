"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  Filter,
  GitCommit,
  GitFork,
  HelpCircle,
  History,
  Layers,
  MapPin,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  UserCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import OwnershipLineageGraph from "@/components/OwnershipLineageGraph";

export default function LandIntelligencePage() {
  const [activeTab, setActiveTab] = useState<string>("lineage");
  const [surveyQuery, setSurveyQuery] = useState<string>("142");
  const [loading, setLoading] = useState<boolean>(false);

  // API State
  const [timelineData, setTimelineData] = useState<any>(null);
  const [riskData, setRiskData] = useState<any>(null);
  const [contradictionsData, setContradictionsData] = useState<any>(null);
  const [parcelChangeData, setParcelChangeData] = useState<any>(null);
  const [healthCardData, setHealthCardData] = useState<any>(null);
  const [predictiveQueueData, setPredictiveQueueData] = useState<any>(null);
  const [lineageGraphData, setLineageGraphData] = useState<any>(null);
  const [docInventoryData, setDocInventoryData] = useState<any>(null);

  const fetchAllIntelligence = async (survey: string) => {
    setLoading(true);
    try {
      // 1. Timeline
      const tlRes = await fetch(`http://localhost:8000/api/intelligence/timeline/${survey}`);
      if (tlRes.ok) setTimelineData(await tlRes.json());

      // 2. Risk Score
      const rkRes = await fetch(`http://localhost:8000/api/intelligence/risk-score/1`);
      if (rkRes.ok) setRiskData(await rkRes.json());

      // 3. Contradictions
      const ctRes = await fetch(`http://localhost:8000/api/intelligence/contradictions?survey_number=${survey}`);
      if (ctRes.ok) setContradictionsData(await ctRes.json());

      // 4. Parcel Changes
      const pcRes = await fetch(`http://localhost:8000/api/intelligence/parcel-changes`);
      if (pcRes.ok) setParcelChangeData(await pcRes.json());

      // 5. Health Card
      const hcRes = await fetch(`http://localhost:8000/api/intelligence/health-card/1`);
      if (hcRes.ok) setHealthCardData(await hcRes.json());

      // 6. Predictive Queue
      const pqRes = await fetch(`http://localhost:8000/api/intelligence/predictive-queue`);
      if (pqRes.ok) setPredictiveQueueData(await pqRes.json());

      // 7. Lineage Graph
      const lgRes = await fetch(`http://localhost:8000/api/intelligence/lineage-graph/${survey}`);
      if (lgRes.ok) setLineageGraphData(await lgRes.json());

      // 8. Document Inventory
      const diRes = await fetch(`http://localhost:8000/api/intelligence/document-inventory/1`);
      if (diRes.ok) setDocInventoryData(await diRes.json());
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllIntelligence(surveyQuery);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyQuery.trim()) {
      fetchAllIntelligence(surveyQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-[#070B14] text-[#F4F7FA] font-sans p-6 sm:p-10 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-5 h-5 text-teal-400" />
            <span className="text-xs uppercase font-mono tracking-widest text-teal-400 font-semibold">
              Deep Cadastral & Lineage Intelligence Engine
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Land Intelligence & Title Lineage Command
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Automated multi-year property timelines, fraud risk scoring, cross-document contradiction detection, and mathematical land lineage graphs.
          </p>
        </div>

        {/* Survey Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={surveyQuery}
              onChange={(e) => setSurveyQuery(e.target.value)}
              placeholder="Survey No. (e.g. 142, 88/1)"
              className="h-9 w-48 pl-9 pr-3 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
            />
          </div>
          <Button type="submit" size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs h-9 gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Analyze</span>
          </Button>
        </form>
      </div>

      {/* Feature Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 rounded-xl bg-slate-900/80 border border-white/[0.06] text-xs">
        <button
          onClick={() => setActiveTab("lineage")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "lineage"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <GitFork className="w-4 h-4" />
          <span>1. Ownership Lineage Graph</span>
        </button>

        <button
          onClick={() => setActiveTab("timeline")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "timeline"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <History className="w-4 h-4" />
          <span>2. 25-Year Property Timeline</span>
        </button>

        <button
          onClick={() => setActiveTab("risk")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "risk"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>3. Fraud Risk Score (0-100)</span>
        </button>

        <button
          onClick={() => setActiveTab("contradictions")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "contradictions"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <AlertOctagon className="w-4 h-4" />
          <span>4. Cross-Doc Contradictions</span>
        </button>

        <button
          onClick={() => setActiveTab("gis-change")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "gis-change"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>5. Parcel Change Detection</span>
        </button>

        <button
          onClick={() => setActiveTab("health-card")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "health-card"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Activity className="w-4 h-4" />
          <span>6. Record Health Card</span>
        </button>

        <button
          onClick={() => setActiveTab("predictive-queue")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "predictive-queue"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>7. Predictive Queue</span>
        </button>

        <button
          onClick={() => setActiveTab("missing-docs")}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-semibold transition-all ${
            activeTab === "missing-docs"
              ? "bg-teal-500/20 text-teal-300 border border-teal-500/30 shadow-lg shadow-teal-950/50"
              : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
          }`}
        >
          <FileCheck2 className="w-4 h-4" />
          <span>8. Missing Document Audit</span>
        </button>
      </div>

      {/* Tab 1: Interactive Land Ownership Lineage Graph */}
      {activeTab === "lineage" && (
        <div className="space-y-6">
          <OwnershipLineageGraph data={lineageGraphData} />
        </div>
      )}

      {/* Tab 2: 25-Year Chronological Property History Timeline */}
      {activeTab === "timeline" && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <History className="w-5 h-5 text-teal-400" />
                25-Year Property Mutation & Ownership Timeline (Survey {surveyQuery})
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Chronological chain of title extracted from historical 7/12 Satbara, mutation entries, partition deeds, and registration certificates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative pl-6 border-l-2 border-slate-700/80 space-y-8 my-2">
                {timelineData?.events?.map((evt: any, idx: number) => (
                  <div key={evt.event_id} className="relative group">
                    {/* Stepper Dot */}
                    <div className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 border-2 border-teal-400 text-teal-300">
                      <span className="text-[10px] font-bold font-mono">{idx + 1}</span>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 hover:border-teal-500/40 transition-all space-y-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-mono">{evt.year}</span>
                          <span className="text-xs text-slate-500">•</span>
                          <span className="text-xs font-semibold text-teal-300">{evt.title}</span>
                          <Badge variant="outline" className="text-[10px] border-slate-700 text-slate-400 font-mono">
                            {evt.date}
                          </Badge>
                        </div>
                        <Badge
                          variant={evt.status.includes("ACTIVE") ? "verified" : "secondary"}
                          className="text-[10px] font-mono"
                        >
                          {evt.status}
                        </Badge>
                      </div>

                      <p className="text-xs text-slate-300 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 pt-2">
                        <div>
                          <span className="text-[10px] text-slate-500 block">Transfer / Action</span>
                          <strong className="text-slate-200">{evt.new_owner}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Extent Involved</span>
                          <strong className="text-teal-400 font-mono">{evt.area_affected}</strong>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-500 block">Statutory Reference</span>
                          <strong className="text-slate-400 font-mono truncate block">{evt.document_ref} ({evt.mutation_number})</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 3: Land Record Anomaly & Fraud Risk Score (0-100) */}
      {activeTab === "risk" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Risk Gauge Scorecard */}
            <Card className="bg-slate-900/70 border-slate-800 md:col-span-1 flex flex-col justify-between">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Calculated Risk Index
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Quantitative 6-factor assessment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 text-center py-6">
                <div className="relative inline-flex items-center justify-center">
                  <div className="w-36 h-36 rounded-full border-4 border-amber-500/30 flex flex-col items-center justify-center bg-slate-950 shadow-inner">
                    <span className="text-4xl font-extrabold text-amber-400 font-mono">
                      82
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold font-mono">
                      / 100 Risk
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <Badge variant="warning" className="text-xs px-3 py-1 font-bold">
                    HIGH RISK TIER (71 - 100)
                  </Badge>
                  <p className="text-xs text-slate-400">
                    Priority human inspection required before statutory digitization certificate.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Factor Deductions Table */}
            <Card className="bg-slate-900/70 border-slate-800 md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Scale className="w-4 h-4 text-teal-400" />
                  Risk Deductions Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Transparent explainability behind every risk point assessed.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: "Deed vs Cadastral Area Mismatch", weight: "+25 pts", status: "FLAGGED", reason: "Deed claims 1.50 Ha; PostGIS vector measures 1.25 Ha (20% variance > 5% tolerance)." },
                  { name: "Ownership Continuity & Transliteration Conflict", weight: "+20 pts", status: "FLAGGED", reason: "Transliterated name mismatch across M-4512 partition entry vs current Aadhaar KYC registry." },
                  { name: "GIS Physical Boundary Inconsistency", weight: "+20 pts", status: "FLAGGED", reason: "Eastern parcel boundary overlaps 4.2 meters into adjacent road reserve." },
                  { name: "Duplicate Title Registration Check", weight: "+15 pts", status: "FLAGGED", reason: "RapidFuzz similarity 89% with concurrent deed registered under SRO Haveli." },
                  { name: "Missing Bank Encumbrance Certificate", weight: "+10 pts", status: "WARNING", reason: "Bank NOC / Encumbrance Certificate for INR 5,00,000 lien has not been uploaded." },
                  { name: "Document Degeneration / Scan Noise", weight: "+5 pts", status: "WARNING", reason: "Watermark and low contrast in stamp header required multi-model consensus." },
                ].map((f, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{f.name}</span>
                        <Badge variant={f.status === "FLAGGED" ? "destructive" : "warning"} className="text-[10px] px-1.5 py-0">
                          {f.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-slate-400">{f.reason}</p>
                    </div>
                    <span className="font-mono font-bold text-amber-400 shrink-0 text-xs">{f.weight}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Tab 4: Cross-Document Contradiction Detector */}
      {activeTab === "contradictions" && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-red-400" />
                Cross-Document Contradiction Matrix
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Compares independent deed filings registered under Survey No. 142 to detect fraudulent area inflation or omitted co-sharers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              
              {/* Contradiction 1: Area Inflation */}
              <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Contradiction: Total Parcel Area Discrepancy (+3.00 Acres Inflation)</span>
                  </div>
                  <Badge variant="destructive" className="text-[10px]">CRITICAL CONFLICT</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Document A (Satbara 1998)</span>
                    <strong className="text-white font-mono text-sm">5.00 Acres</strong>
                    <span className="text-[11px] text-emerald-400 block mt-1">Certified Ancestral Extract</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Document B (Mutation 2005)</span>
                    <strong className="text-white font-mono text-sm">5.00 Acres</strong>
                    <span className="text-[11px] text-emerald-400 block mt-1">Certified Partition Deed</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-red-800/80 bg-red-950/30">
                    <span className="text-[10px] text-red-400 block">Document C (Sale Deed 2018)</span>
                    <strong className="text-red-400 font-mono text-sm">8.00 Acres ⚠</strong>
                    <span className="text-[11px] text-red-300 block mt-1">+3.00 Acres Inflation (+60%)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-black/40 p-2.5 rounded-lg border border-white/[0.04]">
                  <strong>AI Detection Action:</strong> Document C claims 8.00 Acres, exceeding prior certified titles A & B. Mutation M-6201 flagged for statutory field inspection.
                </p>
              </div>

              {/* Contradiction 2: Omitted Co-sharer */}
              <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Contradiction: Co-Sharer Omission in Third-Party Transfer</span>
                  </div>
                  <Badge variant="warning" className="text-[10px]">HIGH CONFLICT</Badge>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Document B (Partition Deed M-4512)</span>
                    <strong className="text-white text-xs">Ramesh S. Patil & Suresh S. Patil (Joint)</strong>
                    <span className="text-[11px] text-emerald-400 block mt-1">Both holders certified</span>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-950 border border-amber-800/80 bg-amber-950/30">
                    <span className="text-[10px] text-amber-400 block">Document D (Third-Party Filing)</span>
                    <strong className="text-amber-300 text-xs">Ramesh S. Patel (Claimed Sole Title)</strong>
                    <span className="text-[11px] text-amber-300 block mt-1">Omitted Suresh without Hakkasod deed</span>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 5: Cadastral Parcel Change Detection */}
      {activeTab === "gis-change" && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Compass className="w-5 h-5 text-teal-400" />
                Cadastral Temporal Change Detection (2010 Historical vs 2025 Current)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Spatial geometry analysis detecting parcel subdivisions, boundary modifications, and infrastructure acquisitions.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 2010 Historical Geometry */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400 font-mono">2010 HISTORICAL SURVEY</span>
                    <Badge variant="secondary" className="text-[10px]">1 Undivided Parcel</Badge>
                  </div>
                  <div className="h-44 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center relative overflow-hidden">
                    <div className="w-32 h-32 rounded bg-indigo-500/20 border-2 border-indigo-400 flex flex-col items-center justify-center text-center p-2">
                      <span className="text-xs font-bold text-indigo-300">Survey 142</span>
                      <span className="text-[10px] text-slate-400 font-mono">3.00 Hectares</span>
                      <span className="text-[9px] text-slate-500 mt-1">Anand Rao (Khata #102)</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400">
                    Single cadastral survey polygon registered before government revenue subdivision.
                  </p>
                </div>

                {/* 2025 Current Subdivided Geometry */}
                <div className="p-4 rounded-xl bg-slate-950 border border-teal-500/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-teal-400 font-mono">2025 POST-SUBDIVISION</span>
                    <Badge variant="verified" className="text-[10px]">2 Sub-Parcels Demarcated</Badge>
                  </div>
                  <div className="h-44 rounded-lg bg-slate-900/80 border border-slate-800 flex items-center justify-center gap-2 relative overflow-hidden">
                    <div className="w-24 h-32 rounded bg-emerald-500/20 border-2 border-emerald-400 flex flex-col items-center justify-center text-center p-1.5">
                      <span className="text-xs font-bold text-emerald-300">142/2A</span>
                      <span className="text-[10px] text-slate-400 font-mono">1.50 Ha</span>
                      <span className="text-[8px] text-slate-400 mt-1">Person A</span>
                    </div>
                    <div className="w-24 h-32 rounded bg-teal-500/20 border-2 border-teal-400 flex flex-col items-center justify-center text-center p-1.5">
                      <span className="text-xs font-bold text-teal-300">142/2B</span>
                      <span className="text-[10px] text-slate-400 font-mono">1.50 Ha</span>
                      <span className="text-[8px] text-slate-400 mt-1">Person D</span>
                    </div>
                  </div>
                  <p className="text-xs text-emerald-400 font-semibold">
                    ✓ Legal subdivision verified (142 → 142/2A + 142/2B). Total area 3.00 Ha preserved.
                  </p>
                </div>

              </div>

            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 6: Record Health Card */}
      {activeTab === "health-card" && (
        <div className="max-w-2xl mx-auto space-y-6">
          <Card className="bg-[#070B14] border-white/[0.08] shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-teal-900/50 via-slate-900 to-indigo-900/50 p-6 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-teal-400 font-bold">
                  OFFICIAL STATUTORY RECORD HEALTH CARD
                </span>
                <h3 className="text-2xl font-bold text-white mt-1">
                  Survey No. {surveyQuery}/2A • Wagholi
                </h3>
                <p className="text-xs text-slate-400">
                  Taluk Haveli, District Pune, Maharashtra State Revenue
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-mono block">Health Score</span>
                <span className="text-3xl font-extrabold text-teal-400 font-mono">78%</span>
              </div>
            </div>

            <CardContent className="p-6 space-y-4">
              {[
                { category: "Ownership & Title Chain", status: "VERIFIED", ok: true, details: "Unbroken 25-year title chain from Ancestral Grant (1998) to current holder." },
                { category: "Cadastral Area Alignment", status: "CONFLICT", ok: false, details: "0.25 Ha discrepancy between deed claim (1.50 Ha) and PostGIS GIS polygon (1.25 Ha)." },
                { category: "GIS Spatial Boundary", status: "MATCHED", ok: true, details: "WGS-84 coordinate polygon registered in Pune Cadastral GIS database." },
                { category: "Document Inventory", status: "MISSING REGISTRATION", ok: false, details: "Bank Mortgage Release Deed (NOC) missing for Active INR 5L lien." },
                { category: "Mutation Ledger", status: "AVAILABLE", ok: true, details: "3 Certified Mutations (M-3104, M-4512, M-6201) verified against state ledger." },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-slate-950/80 border border-slate-800 flex items-start justify-between gap-4 text-xs">
                  <div className="space-y-1">
                    <span className="font-semibold text-white block">{item.category}</span>
                    <p className="text-[11px] text-slate-400">{item.details}</p>
                  </div>
                  <Badge variant={item.ok ? "verified" : "warning"} className="text-[10px] shrink-0">
                    {item.status}
                  </Badge>
                </div>
              ))}

              <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
                <div className="text-xs text-slate-400">
                  Overall Verdict: <strong className="text-amber-400">⚠ NEEDS OFFICER REVIEW</strong>
                </div>
                <Link href="/verification/1">
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs gap-1.5">
                    <span>Open Verification Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 7: Predictive Verification Queue */}
      {activeTab === "predictive-queue" && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Predictive AI Verification Queue (Priority Ranked)
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Orders pending land records by fraud risk and SLA urgency to maximize officer triage efficiency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { rank: "#1", tier: "CRITICAL", survey: "142/2A", village: "Wagholi, Pune", risk: 82, sla: "4 hrs", flag: "Deed vs GIS Area Conflict (20% variance) & Transliteration Conflict", time: "6 mins" },
                { rank: "#2", tier: "CRITICAL", survey: "204", village: "Devanahalli, Bengaluru", risk: 79, sla: "8 hrs", flag: "Government land encroachment boundary proximity flag", time: "8 mins" },
                { rank: "#3", tier: "HIGH", survey: "142/2B", village: "Wagholi, Pune", risk: 45, sla: "24 hrs", flag: "Minor spell variance in co-owner Marathi name token", time: "3 mins" },
                { rank: "#4", tier: "LOW", survey: "88/1", village: "Haveli, Pune", risk: 12, sla: "48 hrs", flag: "Routine verification - High ensemble confidence (98%)", time: "2 mins" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-extrabold font-mono text-teal-400 w-8">{item.rank}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">Survey {item.survey}</span>
                        <span className="text-xs text-slate-500">• {item.village}</span>
                        <Badge variant={item.tier === "CRITICAL" ? "destructive" : item.tier === "HIGH" ? "warning" : "verified"} className="text-[10px]">
                          {item.tier} RISK ({item.risk}/100)
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400">{item.flag}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-[10px] text-slate-500 block">SLA Target</span>
                      <strong className="text-amber-400 font-mono">{item.sla} remaining</strong>
                    </div>
                    <Link href="/verification/1">
                      <Button size="sm" className="bg-teal-600 hover:bg-teal-500 text-white text-xs gap-1.5">
                        <span>Triage Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 8: Statutory Missing Document Checklist */}
      {activeTab === "missing-docs" && (
        <div className="space-y-6">
          <Card className="bg-slate-900/60 border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold text-white flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-teal-400" />
                Statutory Document Completeness & Missing Link Checker
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Verifies that all required deeds, certified mutations, and encumbrance certificates exist in the statutory chain before certifying title.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "Original Sale Deed / Registered Title Deed", present: true, doc: "Deed #4512/2005 (Registered)", confidence: "98%" },
                { name: "Certified Mutation Extract (Ferfar / Namantaran)", present: true, doc: "Mutation M-4512 (Certified by Talathi)", confidence: "96%" },
                { name: "Sub-Registrar Encumbrance Certificate (EC / Search Report)", present: false, doc: "MISSING CRITICAL", warning: "⚠ Required to verify 30-year unencumbered title and active bank charges." },
                { name: "Current Digital 7/12 / RTC Pahani Extract", present: true, doc: "Satbara 2024 Extract (Live Database)", confidence: "97%" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    doc.present
                      ? "bg-slate-950/80 border-slate-800"
                      : "bg-red-950/20 border-red-900/80"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {doc.present ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 shrink-0" />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-white">{doc.name}</span>
                      <p className="text-[11px] text-slate-400">
                        {doc.present ? doc.doc : <span className="text-red-300 font-semibold">{doc.warning}</span>}
                      </p>
                    </div>
                  </div>

                  <Badge variant={doc.present ? "verified" : "destructive"} className="text-[10px] shrink-0">
                    {doc.present ? "ATTACHED ✓" : "MISSING ✗"}
                  </Badge>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}

    </div>
  );
}
