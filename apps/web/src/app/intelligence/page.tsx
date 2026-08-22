"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  AlertOctagon,
  AlertTriangle,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  Database,
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
  TrendingUp,
  UserCheck,
  XCircle,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";
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

  // Custom Graph DB State
  const [dbDocuments, setDbDocuments] = useState<any[]>([]);
  const [selectedCustomDocId, setSelectedCustomDocId] = useState<string | number>("1");
  const [customSearchQuery, setCustomSearchQuery] = useState<string>("");
  const [customGraphData, setCustomGraphData] = useState<any>(null);
  const [customLoading, setCustomLoading] = useState<boolean>(false);

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

      // 9. Fetch DB Documents
      const docsRes = await fetch(`http://localhost:8000/api/documents`);
      if (docsRes.ok) {
        const docsData = await docsRes.json();
        setDbDocuments(docsData.documents || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const handleFetchCustomGraph = async (docIdOrParam: string | number) => {
    setCustomLoading(true);
    try {
      let url = `http://localhost:8000/api/intelligence/custom-lineage`;
      if (typeof docIdOrParam === "number" || (!isNaN(Number(docIdOrParam)) && !docIdOrParam.toString().includes("/"))) {
        url += `?document_id=${docIdOrParam}`;
      } else {
        url += `?survey_number=${encodeURIComponent(docIdOrParam.toString())}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCustomGraphData(data);
      }
    } catch {
      // Fallback
    } finally {
      setCustomLoading(false);
    }
  };

  useEffect(() => {
    fetchAllIntelligence(surveyQuery);
    handleFetchCustomGraph(1);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (surveyQuery.trim()) {
      fetchAllIntelligence(surveyQuery.trim());
    }
  };

  const navTabs = [
    { id: "lineage", label: "Lineage Graph", icon: GitFork, badge: "Graph" },
    { id: "timeline", label: "25-Yr Timeline", icon: History, badge: "25 Yrs" },
    { id: "risk", label: "Risk Score", icon: ShieldAlert, badge: "82/100" },
    { id: "contradictions", label: "Contradictions", icon: AlertOctagon, badge: "Alerts" },
    { id: "gis-change", label: "Parcel Change", icon: Compass, badge: "GIS" },
    { id: "health-card", label: "Health Card", icon: Activity, badge: "78%" },
    { id: "predictive-queue", label: "Predictive Queue", icon: Zap, badge: "Triage" },
    { id: "missing-docs", label: "Missing Docs", icon: FileCheck2, badge: "Audit" },
  ];

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
        
        {/* Header Hero Banner */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-2 z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-container text-on-primary-container flex items-center justify-center shadow-sm">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] uppercase font-bold text-primary tracking-widest">
                Deep Cadastral &amp; Title Lineage Intelligence
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-on-surface tracking-tight">
              Land Intelligence &amp; Title Lineage Command
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant max-w-2xl leading-relaxed">
              Automated multi-year property mutation timelines, quantitative fraud risk scoring (0-100), cross-deed contradiction detection, and mathematical land succession graph synthesis.
            </p>

            {/* Quick Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant">Presets:</span>
              {[
                { label: "Survey 142 (Pune Wagholi)", query: "142" },
                { label: "Survey 88/1 (Haveli)", query: "88/1" },
                { label: "Survey 204 (Bengaluru)", query: "204" },
                { label: "Patta 245243 (Jaipur)", query: "PATTA-245243" },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={() => {
                    setSurveyQuery(pill.query);
                    fetchAllIntelligence(pill.query);
                  }}
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors cursor-pointer border ${
                    surveyQuery === pill.query
                      ? "bg-primary text-on-primary border-primary shadow-sm"
                      : "bg-surface-container-low text-on-surface-variant border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="flex sm:flex-row items-center gap-2 z-10 shrink-0 bg-surface-container-low p-2 rounded-xl border border-outline-variant"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-on-surface-variant" />
              <input
                type="text"
                value={surveyQuery}
                onChange={(e) => setSurveyQuery(e.target.value)}
                placeholder="Survey No. (e.g. 142, 88/1)"
                className="h-9 w-44 sm:w-56 pl-9 pr-3 rounded-lg bg-surface border border-outline-variant text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary font-mono font-semibold"
              />
            </div>
            <Button
              type="submit"
              size="sm"
              className="bg-primary text-on-primary text-xs h-9 px-4 gap-1.5 font-bold shadow-sm cursor-pointer hover:bg-primary/90"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Analyze</span>
            </Button>
          </form>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-xl bg-surface border border-outline-variant overflow-x-auto custom-scrollbar shadow-sm">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  active
                    ? "bg-primary text-on-primary shadow-sm font-bold"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? "text-on-primary" : "text-primary"}`} />
                <span>{tab.label}</span>
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-mono ${
                    active ? "bg-white/20 text-white" : "bg-surface-container-high text-on-surface-variant"
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: Ownership Lineage Graph                                            */}
        {/* ========================================================================= */}
        {activeTab === "lineage" && (
          <div className="space-y-6">
            <OwnershipLineageGraph data={lineageGraphData} />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: 25-Year Chronological Property Timeline                             */}
        {/* ========================================================================= */}
        {activeTab === "timeline" && (
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-outline-variant pb-4">
              <div>
                <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                  <History className="w-5 h-5 text-primary" />
                  <span>25-Year Property Mutation &amp; Ownership Timeline (Survey {surveyQuery})</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Chronological chain of title extracted from historical 7/12 Satbara, mutation entries, partition deeds, and registration certificates.
                </p>
              </div>
              <Badge variant="verified" className="text-xs">
                Unbroken Chain
              </Badge>
            </div>

            <div className="relative pl-6 border-l-2 border-primary/40 space-y-6 my-2">
              {timelineData?.events?.map((evt: any, idx: number) => (
                <div key={evt.event_id || idx} className="relative group">
                  {/* Step Dot */}
                  <div className="absolute -left-[31px] top-1 flex h-6 w-6 items-center justify-center rounded-full bg-surface border-2 border-primary text-primary font-bold text-[10px] shadow-sm">
                    {idx + 1}
                  </div>

                  <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-sm hover:shadow-md transition-shadow space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-outline-variant/60 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-on-surface font-mono">{evt.year}</span>
                        <span className="text-xs text-on-surface-variant">•</span>
                        <span className="text-xs font-bold text-primary">{evt.title}</span>
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {evt.date}
                        </Badge>
                      </div>
                      <Badge
                        variant={evt.status?.includes("ACTIVE") ? "verified" : "secondary"}
                        className="text-[10px] font-mono"
                      >
                        {evt.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-on-surface leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-semibold">Transfer / Action</span>
                        <strong className="text-on-surface">{evt.new_owner}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-semibold">Extent Involved</span>
                        <strong className="text-primary font-mono">{evt.area_affected}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-on-surface-variant block font-semibold">Statutory Reference</span>
                        <strong className="text-on-surface font-mono truncate block">
                          {evt.document_ref} ({evt.mutation_number})
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: Fraud Risk Score (0-100)                                           */}
        {/* ========================================================================= */}
        {activeTab === "risk" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Risk Gauge Card */}
            <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm flex flex-col justify-between text-center space-y-6">
              <div>
                <div className="flex items-center justify-center gap-2 text-primary font-bold text-sm mb-1">
                  <ShieldAlert className="w-5 h-5 text-error" />
                  <span>Calculated Risk Index</span>
                </div>
                <p className="text-xs text-on-surface-variant">Quantitative 6-factor assessment</p>
              </div>

              <div className="relative inline-flex items-center justify-center mx-auto">
                <div className="w-40 h-40 rounded-full border-8 border-error/20 flex flex-col items-center justify-center bg-surface-container-low shadow-inner">
                  <span className="text-5xl font-black text-error font-mono">82</span>
                  <span className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold font-mono">
                    / 100 Risk
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Badge variant="destructive" className="text-xs px-3 py-1 font-bold">
                  HIGH RISK TIER (71 - 100)
                </Badge>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  Priority human inspection required before statutory digitization certificate.
                </p>
              </div>
            </div>

            {/* Factor Deductions */}
            <div className="md:col-span-2 bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
              <div className="border-b border-outline-variant pb-3">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Scale className="w-4 h-4 text-primary" />
                  <span>Explainable Risk Deductions Breakdown</span>
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Complete explainability behind every risk point assessed by the AI rule engine.
                </p>
              </div>

              <div className="space-y-2.5">
                {[
                  { name: "Deed vs Cadastral Area Mismatch", weight: "+25 pts", status: "FLAGGED", reason: "Deed claims 1.50 Ha; PostGIS vector measures 1.25 Ha (20% variance > 5% tolerance)." },
                  { name: "Ownership Continuity & Transliteration Conflict", weight: "+20 pts", status: "FLAGGED", reason: "Transliterated name mismatch across M-4512 partition entry vs current Aadhaar KYC registry." },
                  { name: "GIS Physical Boundary Inconsistency", weight: "+20 pts", status: "FLAGGED", reason: "Eastern parcel boundary overlaps 4.2 meters into adjacent road reserve." },
                  { name: "Duplicate Title Registration Check", weight: "+15 pts", status: "FLAGGED", reason: "RapidFuzz similarity 89% with concurrent deed registered under SRO Haveli." },
                  { name: "Missing Bank Encumbrance Certificate", weight: "+10 pts", status: "WARNING", reason: "Bank NOC / Encumbrance Certificate for INR 5,00,000 lien has not been uploaded." },
                  { name: "Document Degeneration / Scan Noise", weight: "+5 pts", status: "WARNING", reason: "Watermark and low contrast in stamp header required multi-model consensus." },
                ].map((f, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface-container-lowest border border-outline-variant flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-on-surface">{f.name}</span>
                        <Badge variant={f.status === "FLAGGED" ? "destructive" : "warning"} className="text-[9px]">
                          {f.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-on-surface-variant">{f.reason}</p>
                    </div>
                    <span className="font-mono font-bold text-error shrink-0 text-xs">{f.weight}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: Cross-Document Contradictions                                      */}
        {/* ========================================================================= */}
        {activeTab === "contradictions" && (
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm space-y-5">
            <div className="border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <AlertOctagon className="w-5 h-5 text-error" />
                <span>Cross-Document Contradiction Matrix</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Compares independent deed filings registered under Survey No. 142 to detect fraudulent area inflation or omitted co-sharers.
              </p>
            </div>

            {/* Contradiction 1: Area Inflation */}
            <div className="p-5 rounded-xl bg-error-container/20 border border-error-container space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-error font-bold text-sm">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Contradiction: Total Parcel Area Discrepancy (+3.00 Acres Inflation)</span>
                </div>
                <Badge variant="destructive" className="text-[10px]">CRITICAL CONFLICT</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant block font-bold">Document A (Satbara 1998)</span>
                  <strong className="text-on-surface font-mono text-sm">5.00 Acres</strong>
                  <span className="text-[11px] text-[#15803D] block mt-1 font-semibold">Certified Ancestral Extract</span>
                </div>
                <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant block font-bold">Document B (Mutation 2005)</span>
                  <strong className="text-on-surface font-mono text-sm">5.00 Acres</strong>
                  <span className="text-[11px] text-[#15803D] block mt-1 font-semibold">Certified Partition Deed</span>
                </div>
                <div className="p-3 rounded-lg bg-[#FEE2E2] border border-error/40">
                  <span className="text-[10px] text-error block font-bold">Document C (Sale Deed 2018)</span>
                  <strong className="text-error font-mono text-sm">8.00 Acres ⚠</strong>
                  <span className="text-[11px] text-error block mt-1 font-bold">+3.00 Acres Inflation (+60%)</span>
                </div>
              </div>

              <p className="text-xs text-on-surface bg-surface p-3 rounded-lg border border-outline-variant">
                <strong>AI Detection Action:</strong> Document C claims 8.00 Acres, exceeding prior certified titles A &amp; B. Mutation M-6201 flagged for statutory field inspection.
              </p>
            </div>

            {/* Contradiction 2: Omitted Co-sharer */}
            <div className="p-5 rounded-xl bg-[#FFF7ED] border border-[#FDBA74] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#9A3412] font-bold text-sm">
                  <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                  <span>Contradiction: Co-Sharer Omission in Third-Party Transfer</span>
                </div>
                <Badge variant="warning" className="text-[10px]">HIGH CONFLICT</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-surface border border-outline-variant">
                  <span className="text-[10px] text-on-surface-variant block font-bold">Document B (Partition Deed M-4512)</span>
                  <strong className="text-on-surface text-xs">Ramesh S. Patil &amp; Suresh S. Patil (Joint)</strong>
                  <span className="text-[11px] text-[#15803D] block mt-1 font-semibold">Both holders certified</span>
                </div>
                <div className="p-3 rounded-lg bg-[#FFEDD5] border border-[#FDBA74]">
                  <span className="text-[10px] text-[#9A3412] block font-bold">Document D (Third-Party Filing)</span>
                  <strong className="text-[#9A3412] text-xs">Ramesh S. Patel (Claimed Sole Title)</strong>
                  <span className="text-[11px] text-[#C2410C] block mt-1 font-semibold">Omitted Suresh without legal release deed</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: Parcel Change Detection                                            */}
        {/* ========================================================================= */}
        {activeTab === "gis-change" && (
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm space-y-6">
            <div className="border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Compass className="w-5 h-5 text-primary" />
                <span>Cadastral Temporal Change Detection (2010 Historical vs 2025 Current)</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Spatial geometry analysis detecting parcel subdivisions, boundary modifications, and infrastructure acquisitions.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 2010 */}
              <div className="p-5 rounded-xl bg-surface-container-lowest border border-outline-variant space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant font-mono">2010 HISTORICAL SURVEY</span>
                  <Badge variant="secondary" className="text-[10px]">1 Undivided Parcel</Badge>
                </div>
                <div className="h-44 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center">
                  <div className="w-32 h-32 rounded-xl bg-primary-container/20 border-2 border-primary flex flex-col items-center justify-center text-center p-2 shadow-sm">
                    <span className="text-xs font-bold text-primary">Survey 142</span>
                    <span className="text-[10px] text-on-surface-variant font-mono font-bold">3.00 Hectares</span>
                    <span className="text-[9px] text-on-surface-variant mt-1">Anand Rao (Khata #102)</span>
                  </div>
                </div>
                <p className="text-xs text-on-surface-variant">
                  Single cadastral survey polygon registered before government revenue subdivision.
                </p>
              </div>

              {/* 2025 */}
              <div className="p-5 rounded-xl bg-surface-container-lowest border border-primary/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-primary font-mono">2025 POST-SUBDIVISION</span>
                  <Badge variant="verified" className="text-[10px]">2 Sub-Parcels Demarcated</Badge>
                </div>
                <div className="h-44 rounded-xl bg-surface-container-low border border-outline-variant flex items-center justify-center gap-3">
                  <div className="w-24 h-32 rounded-xl bg-[#DCFCE7] border-2 border-[#15803D] flex flex-col items-center justify-center text-center p-1.5 shadow-sm">
                    <span className="text-xs font-bold text-[#15803D]">142/2A</span>
                    <span className="text-[10px] text-on-surface-variant font-mono font-bold">1.50 Ha</span>
                    <span className="text-[8px] text-on-surface-variant mt-1">Person A</span>
                  </div>
                  <div className="w-24 h-32 rounded-xl bg-primary-container/20 border-2 border-primary flex flex-col items-center justify-center text-center p-1.5 shadow-sm">
                    <span className="text-xs font-bold text-primary">142/2B</span>
                    <span className="text-[10px] text-on-surface-variant font-mono font-bold">1.50 Ha</span>
                    <span className="text-[8px] text-on-surface-variant mt-1">Person D</span>
                  </div>
                </div>
                <p className="text-xs text-[#15803D] font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Legal subdivision verified (142 → 142/2A + 142/2B). Total area 3.00 Ha mathematically preserved.</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: Statutory Record Health Card                                       */}
        {/* ========================================================================= */}
        {activeTab === "health-card" && (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-surface rounded-2xl border border-outline-variant shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-primary to-primary-container p-6 text-on-primary flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-widest text-on-primary/80 font-bold">
                    OFFICIAL STATUTORY RECORD HEALTH CARD
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">
                    Survey No. {surveyQuery}/2A • Wagholi
                  </h3>
                  <p className="text-xs text-on-primary/90">
                    Taluk Haveli, District Pune, Maharashtra State Revenue
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-on-primary/80 uppercase font-mono block">Health Score</span>
                  <span className="text-3xl font-extrabold text-white font-mono">78%</span>
                </div>
              </div>

              <div className="p-6 space-y-3">
                {[
                  { category: "Ownership & Title Chain", status: "VERIFIED", ok: true, details: "Unbroken 25-year title chain from Ancestral Grant (1998) to current holder." },
                  { category: "Cadastral Area Alignment", status: "CONFLICT", ok: false, details: "0.25 Ha discrepancy between deed claim (1.50 Ha) and PostGIS GIS polygon (1.25 Ha)." },
                  { category: "GIS Spatial Boundary", status: "MATCHED", ok: true, details: "WGS-84 coordinate polygon registered in Pune Cadastral GIS database." },
                  { category: "Document Inventory", status: "MISSING REGISTRATION", ok: false, details: "Bank Mortgage Release Deed (NOC) missing for Active INR 5L lien." },
                  { category: "Mutation Ledger", status: "AVAILABLE", ok: true, details: "3 Certified Mutations (M-3104, M-4512, M-6201) verified against state ledger." },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl bg-surface-container-lowest border border-outline-variant flex items-start justify-between gap-4 text-xs">
                    <div className="space-y-1">
                      <span className="font-bold text-on-surface block">{item.category}</span>
                      <p className="text-[11px] text-on-surface-variant">{item.details}</p>
                    </div>
                    <Badge variant={item.ok ? "verified" : "warning"} className="text-[10px] shrink-0">
                      {item.status}
                    </Badge>
                  </div>
                ))}

                <div className="pt-4 border-t border-outline-variant flex items-center justify-between">
                  <div className="text-xs text-on-surface">
                    Verdict: <strong className="text-[#EA580C]">⚠ NEEDS OFFICER REVIEW</strong>
                  </div>
                  <Link href="/verification/1">
                    <Button size="sm" className="bg-primary text-on-primary text-xs font-bold gap-1.5 shadow-sm">
                      <span>Open Verification Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: Predictive Verification Queue                                       */}
        {/* ========================================================================= */}
        {activeTab === "predictive-queue" && (
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
            <div className="border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                <span>Predictive AI Verification Queue (Priority Ranked)</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Orders pending land records by fraud risk and SLA urgency to maximize officer triage efficiency.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { rank: "#1", tier: "CRITICAL", survey: "142/2A", village: "Wagholi, Pune", risk: 82, sla: "4 hrs", flag: "Deed vs GIS Area Conflict (20% variance) & Transliteration Conflict" },
                { rank: "#2", tier: "CRITICAL", survey: "204", village: "Devanahalli, Bengaluru", risk: 79, sla: "8 hrs", flag: "Government land encroachment boundary proximity flag" },
                { rank: "#3", tier: "HIGH", survey: "142/2B", village: "Wagholi, Pune", risk: 45, sla: "24 hrs", flag: "Minor spell variance in co-owner Marathi name token" },
                { rank: "#4", tier: "LOW", survey: "88/1", village: "Haveli, Pune", risk: 12, sla: "48 hrs", flag: "Routine verification - High ensemble confidence (98%)" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant hover:border-primary/40 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base font-black font-mono text-primary w-8">{item.rank}</span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-on-surface">Survey {item.survey}</span>
                        <span className="text-xs text-on-surface-variant">• {item.village}</span>
                        <Badge variant={item.tier === "CRITICAL" ? "destructive" : item.tier === "HIGH" ? "warning" : "verified"} className="text-[10px]">
                          {item.tier} RISK ({item.risk}/100)
                        </Badge>
                      </div>
                      <p className="text-xs text-on-surface-variant">{item.flag}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right text-xs">
                      <span className="text-[10px] text-on-surface-variant block font-bold">SLA Target</span>
                      <strong className="text-error font-mono">{item.sla} remaining</strong>
                    </div>
                    <Link href="/verification/1">
                      <Button size="sm" className="bg-primary text-on-primary text-xs font-bold gap-1.5 shadow-sm">
                        <span>Triage Now</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: Statutory Missing Document Checklist                               */}
        {/* ========================================================================= */}
        {activeTab === "missing-docs" && (
          <div className="bg-surface rounded-2xl border border-outline-variant p-6 shadow-sm space-y-4">
            <div className="border-b border-outline-variant pb-3">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-primary" />
                <span>Statutory Document Completeness &amp; Missing Link Checker</span>
              </h3>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Verifies that all required deeds, certified mutations, and encumbrance certificates exist in the statutory chain before certifying title.
              </p>
            </div>

            <div className="space-y-3">
              {[
                { name: "Original Sale Deed / Registered Title Deed", present: true, doc: "Deed #4512/2005 (Registered)" },
                { name: "Certified Mutation Extract (Ferfar / Namantaran)", present: true, doc: "Mutation M-4512 (Certified by Talathi)" },
                { name: "Sub-Registrar Encumbrance Certificate (EC / Search Report)", present: false, doc: "MISSING CRITICAL", warning: "⚠ Required to verify 30-year unencumbered title and active bank charges." },
                { name: "Current Digital 7/12 / RTC Pahani Extract", present: true, doc: "Satbara 2024 Extract (Live Database)" },
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    doc.present
                      ? "bg-surface-container-lowest border-outline-variant"
                      : "bg-error-container/20 border-error-container"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {doc.present ? (
                      <CheckCircle2 className="w-5 h-5 text-[#15803D] shrink-0" />
                    ) : (
                      <XCircle className="w-5 h-5 text-error shrink-0" />
                    )}
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-on-surface">{doc.name}</span>
                      <p className="text-[11px] text-on-surface-variant">
                        {doc.present ? doc.doc : <span className="text-error font-bold">{doc.warning}</span>}
                      </p>
                    </div>
                  </div>

                  <Badge variant={doc.present ? "verified" : "destructive"} className="text-[10px] shrink-0">
                    {doc.present ? "ATTACHED ✓" : "MISSING ✗"}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 9: Custom Document Lineage Graph & Database Search */}
        <div className="pt-6 border-t border-outline-variant space-y-6">
          <div className="p-6 rounded-2xl bg-surface border border-outline-variant shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Search className="w-4 h-4 text-primary" />
                  <span className="text-[10px] uppercase font-mono tracking-wider text-primary font-bold">
                    Custom Document Ownership Lineage Generator
                  </span>
                </div>
                <h2 className="text-lg font-bold text-on-surface">
                  Dynamic Document Search &amp; Succession Flow Engine
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Select any registered document from your database or enter a custom Survey / Deed identifier to automatically extract parties, transactions, and synthesize an interactive ownership transfer graph.
                </p>
              </div>

              {/* Custom Search Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (customSearchQuery.trim()) {
                    handleFetchCustomGraph(customSearchQuery.trim());
                  }
                }}
                className="flex items-center gap-2 shrink-0 bg-surface-container-low p-1.5 rounded-xl border border-outline-variant"
              >
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant" />
                  <input
                    type="text"
                    value={customSearchQuery}
                    onChange={(e) => setCustomSearchQuery(e.target.value)}
                    placeholder="Survey / Deed ID / Village"
                    className="h-8 w-44 pl-8 pr-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary font-mono"
                  />
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-primary text-on-primary text-xs h-8 gap-1.5 font-bold shadow-sm cursor-pointer"
                >
                  <RefreshCw className={`w-3 h-3 ${customLoading ? "animate-spin" : ""}`} />
                  <span>Search DB</span>
                </Button>
              </form>
            </div>

            {/* Custom Graph Render */}
            {customLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3 text-on-surface-variant">
                <RefreshCw className="w-8 h-8 animate-spin text-primary" />
                <span className="text-xs font-mono">Querying database &amp; synthesizing custom lineage graph...</span>
              </div>
            ) : customGraphData ? (
              <div className="space-y-4 pt-2">
                <div className="flex items-center justify-between bg-surface-container-low p-3 rounded-xl border border-outline-variant">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold text-on-surface">
                      Synthesized Custom Graph for: {customGraphData.document_name || customGraphData.survey_number}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {customGraphData.source || "DYNAMIC_DB_GRAPH"}
                  </Badge>
                </div>

                <OwnershipLineageGraph data={customGraphData} />
              </div>
            ) : null}
          </div>
        </div>

      </main>
    </div>
  );
}
