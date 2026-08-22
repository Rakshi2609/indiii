"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  FileUp,
  Gavel,
  History,
  Layers,
  MapPin,
  Maximize2,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

interface OverviewMetrics {
  total_documents: number;
  total_documents_processed: number;
  total_documents_pending: number;
  total_records_extracted: number;
  total_records_verified: number;
  fields_requiring_review: number;
  validation_conflicts_count: number;
  critical_conflicts_count: number;
  average_confidence_score: number;
  digitization_progress_pct: number;
}

export default function GovernmentCommandCenterPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/analytics/overview");
      if (res.ok) {
        const data = await res.json();
        setOverview(data);
      } else {
        loadMockData();
      }
    } catch {
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setOverview({
      total_documents: 1248500,
      total_documents_processed: 1200000,
      total_documents_pending: 45230,
      total_records_extracted: 1200000,
      total_records_verified: 894000,
      fields_requiring_review: 12890,
      validation_conflicts_count: 8401,
      critical_conflicts_count: 2150,
      average_confidence_score: 0.945,
      digitization_progress_pct: 85.5,
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header Breadcrumb & Title */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
            <span>Command Center</span>
            <ChevronRight className="w-3.5 h-3.5 text-outline" />
            <span className="text-primary font-bold">Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
            Land Intelligence Command Center
          </h1>
          <p className="text-xs sm:text-sm text-on-surface-variant">
            National / State / District land-record verification overview and cadastral stream telemetry.
          </p>
        </div>

        {/* 6 Top Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* Metric 1: Documents Processed */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Processed
              </span>
              <FileText className="w-4 h-4 text-outline" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">1.2M</div>
            <div className="mt-2 text-primary text-[11px] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>+12% this week</span>
            </div>
          </div>

          {/* Metric 2: Pending Verification */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Pending Queue
              </span>
              <Clock className="w-4 h-4 text-outline" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">45,230</div>
            <div className="mt-2 text-on-surface-variant text-[11px]">
              Officer Review Req.
            </div>
          </div>

          {/* Metric 3: Spatial Conflicts */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-12 h-12 bg-error/10 rounded-bl-full" />
            <div className="flex items-center justify-between mb-2 z-10">
              <span className="text-[10px] uppercase font-bold text-error tracking-wider">
                GIS Conflicts
              </span>
              <MapPin className="w-4 h-4 text-error" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono z-10">8,401</div>
            <div className="mt-2 text-error text-[11px] font-semibold flex items-center gap-1 z-10">
              <AlertTriangle className="w-3 h-3" />
              <span>Critical Action Req.</span>
            </div>
          </div>

          {/* Metric 4: Title Conflicts */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-12 h-12 bg-error/10 rounded-bl-full" />
            <div className="flex items-center justify-between mb-2 z-10">
              <span className="text-[10px] uppercase font-bold text-error tracking-wider">
                Title Conflicts
              </span>
              <Scale className="w-4 h-4 text-error" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono z-10">2,150</div>
            <div className="mt-2 text-error text-[11px] font-semibold flex items-center gap-1 z-10">
              <AlertTriangle className="w-3 h-3" />
              <span>Legal Review Req.</span>
            </div>
          </div>

          {/* Metric 5: AI Low Confidence */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-12 h-12 bg-[#F59E0B]/10 rounded-bl-full" />
            <div className="flex items-center justify-between mb-2 z-10">
              <span className="text-[10px] uppercase font-bold text-[#D97706] tracking-wider">
                Low Conf.
              </span>
              <Bot className="w-4 h-4 text-[#D97706]" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono z-10">12,890</div>
            <div className="mt-2 text-[#D97706] text-[11px] font-semibold flex items-center gap-1 z-10">
              <span>Manual Audit Needed</span>
            </div>
          </div>

          {/* Metric 6: Verified Records */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                Verified
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-2xl font-bold text-[#15803D] font-mono">894K</div>
            <div className="mt-2 text-primary text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>Fully Validated</span>
            </div>
          </div>

        </div>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column (1 Col): Critical Verification Queue & Live Activity */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            
            {/* Critical Verification Queue Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-error" />
                  <span>Critical Queue</span>
                </h3>
                <Link href="/verification" className="text-primary text-xs font-semibold hover:underline">
                  View All
                </Link>
              </div>

              <div className="p-2 divide-y divide-outline-variant/60 max-h-[300px] overflow-y-auto custom-scrollbar">
                
                {/* Queue Item 1 */}
                <Link
                  href="/verification/1"
                  className="p-3 hover:bg-surface-container-low rounded-lg block transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary">
                      Survey #402/A
                    </span>
                    <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-error/20">
                      Title Conflict
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    Owner mismatch detected in legacy succession record.
                  </p>
                  <div className="text-[10px] text-outline mt-1.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>2 hrs ago • Haveli, Pune</span>
                  </div>
                </Link>

                {/* Queue Item 2 */}
                <Link
                  href="/verification/3"
                  className="p-3 hover:bg-surface-container-low rounded-lg block transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary">
                      Survey #118/B
                    </span>
                    <span className="bg-error-container text-on-error-container px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-error/20">
                      Spatial Conflict
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    Cadastral boundary overlap with adjacent road reserve.
                  </p>
                  <div className="text-[10px] text-outline mt-1.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>4 hrs ago • Devanahalli, Bengaluru</span>
                  </div>
                </Link>

                {/* Queue Item 3 */}
                <Link
                  href="/verification/1"
                  className="p-3 hover:bg-surface-container-low rounded-lg block transition-colors group cursor-pointer"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-xs font-bold text-on-surface group-hover:text-primary">
                      Survey #992/C
                    </span>
                    <span className="bg-[#FFEDD5] text-[#C2410C] px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border border-[#FDBA74]">
                      Low Confidence
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant truncate">
                    Illegible handwriting in source revenue stamp.
                  </p>
                  <div className="text-[10px] text-outline mt-1.5 flex items-center gap-1 font-mono">
                    <Clock className="w-3 h-3" />
                    <span>5 hrs ago • Satara Rural</span>
                  </div>
                </Link>

              </div>
            </div>

            {/* Live Processing Activity Stream */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Live Stream Activity</span>
                </h3>
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                </span>
              </div>

              <div className="p-4 space-y-4 relative">
                <div className="absolute left-[31px] top-6 bottom-6 w-px bg-outline-variant" />

                {/* Activity 1 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#E0E7FF] border border-[#A5B4FC] flex items-center justify-center text-[#4338CA] shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">AI Extraction Complete</div>
                    <div className="text-[11px] text-on-surface-variant">Batch #8892 • 450 documents processed</div>
                  </div>
                </div>

                {/* Activity 2 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline-variant flex items-center justify-center text-on-surface-variant shrink-0 mt-0.5">
                    <FileUp className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">New Ingestion Stream</div>
                    <div className="text-[11px] text-on-surface-variant">Pune Sub-Registrar uploaded 1,200 scans</div>
                  </div>
                </div>

                {/* Activity 3 */}
                <div className="flex gap-3 relative z-10">
                  <div className="w-8 h-8 rounded-full bg-[#DCFCE7] border border-[#86EFAC] flex items-center justify-center text-[#15803D] shrink-0 mt-0.5">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-on-surface">Officer Verified &amp; Signed</div>
                    <div className="text-[11px] text-on-surface-variant">Officer ID-902 approved 54 deeds</div>
                  </div>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column (2 Cols): GIS Conflict Clusters & District Digitization */}
          <div className="lg:col-span-2 space-y-6 flex flex-col">
            
            {/* GIS Conflict Clusters Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden h-[380px]">
              <div className="p-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low z-10">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Compass className="w-4 h-4 text-on-surface-variant" />
                  <span>Cadastral GIS Conflict Clusters (Live PostGIS)</span>
                </h3>
                <div className="flex gap-2">
                  <Link href="/gis">
                    <button className="bg-surface-container-high px-3 py-1 rounded text-xs font-semibold border border-outline-variant hover:bg-surface-container-highest transition-colors cursor-pointer">
                      Open Full GIS Map
                    </button>
                  </Link>
                </div>
              </div>

              {/* Interactive GIS Preview */}
              <div className="flex-1 relative bg-surface-container overflow-hidden">
                {/* Cadastral Simulated Grid View */}
                <div className="absolute inset-0 bg-cadastral bg-cover opacity-90" />
                
                {/* Cadastral Interactive Parcels */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="flex justify-end">
                    <div className="bg-surface/95 backdrop-blur border border-outline-variant p-2.5 rounded-lg shadow-sm flex flex-col gap-1.5 text-[11px]">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-error" />
                        <span className="font-semibold">High Conflict Density</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#F59E0B]" />
                        <span className="font-semibold">Moderate Density</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-[#15803D]" />
                        <span className="font-semibold">Clear / Verified</span>
                      </div>
                    </div>
                  </div>

                  {/* Simulated Conflict Hotspot Overlays */}
                  <div className="absolute top-[35%] left-[25%] w-16 h-16 bg-error/25 rounded-full animate-pulse border border-error flex items-center justify-center">
                    <span className="text-[10px] font-bold text-error">142/A</span>
                  </div>
                  <div className="absolute top-[55%] left-[58%] w-20 h-20 bg-[#F59E0B]/25 rounded-full animate-pulse border border-[#F59E0B] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#B45309]">204/BLR</span>
                  </div>
                  <div className="absolute top-[25%] left-[70%] w-14 h-14 bg-[#15803D]/25 rounded-full border border-[#15803D] flex items-center justify-center">
                    <span className="text-[10px] font-bold text-[#15803D]">88/1</span>
                  </div>
                </div>
              </div>
            </div>

            {/* District Progress Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-on-surface-variant" />
                  <span>District Digitization &amp; Verification Progress</span>
                </h3>
                <span className="text-xs font-mono font-bold text-primary">State: Maharashtra &amp; Karnataka</span>
              </div>

              <div className="space-y-4">
                {/* District 1: Pune */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-on-surface">Pune District (Haveli / Wagholi)</span>
                    <span className="font-mono text-primary font-bold">85% Complete</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden border border-outline-variant">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: "85%" }} />
                  </div>
                </div>

                {/* District 2: Nashik */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-on-surface">Nashik District (Niphad / Dindori)</span>
                    <span className="font-mono text-on-surface-variant">62% Complete</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden border border-outline-variant flex">
                    <div className="bg-primary h-2.5" style={{ width: "62%" }} />
                    <div className="bg-[#F59E0B] h-2.5" style={{ width: "15%" }} title="Pending Review" />
                    <div className="bg-error h-2.5" style={{ width: "5%" }} title="Critical Conflicts" />
                  </div>
                </div>

                {/* District 3: Bengaluru Rural */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-end text-xs">
                    <span className="font-bold text-on-surface">Bengaluru Rural (Devanahalli)</span>
                    <span className="font-mono text-on-surface-variant">40% Complete</span>
                  </div>
                  <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden border border-outline-variant flex">
                    <div className="bg-primary h-2.5" style={{ width: "40%" }} />
                    <div className="bg-[#F59E0B] h-2.5" style={{ width: "30%" }} title="Pending Review" />
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
