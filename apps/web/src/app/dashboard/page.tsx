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

import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";

interface OverviewMetrics {
  total_documents: number;
  total_documents_processed: number;
  total_documents_pending: number;
  total_records_extracted: number;
  total_records_verified: number;
  total_records_flagged: number;
  total_records_rejected: number;
  fields_requiring_review: number;
  validation_conflicts_count: number;
  critical_conflicts_count: number;
  average_confidence_score: number;
  digitization_progress_pct: number;
}

export default function GovernmentCommandCenterPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [queueItems, setQueueItems] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [overviewRes, queueRes, distRes, conflictRes, logsRes] = await Promise.allSettled([
        fetch("http://localhost:8000/api/analytics/overview"),
        fetch("http://localhost:8000/api/verification/queue?limit=5"),
        fetch("http://localhost:8000/api/analytics/districts"),
        fetch("http://localhost:8000/api/analytics/conflicts"),
        fetch("http://localhost:8000/api/audit/logs?limit=5"),
      ]);

      if (overviewRes.status === "fulfilled" && overviewRes.value.ok) {
        const data = await overviewRes.value.json();
        setOverview(data);
      } else {
        loadMockOverview();
      }

      if (queueRes.status === "fulfilled" && queueRes.value.ok) {
        const data = await queueRes.value.json();
        setQueueItems(data.items || []);
      }

      if (distRes.status === "fulfilled" && distRes.value.ok) {
        const data = await distRes.value.json();
        setDistricts(data.districts || []);
      }

      if (conflictRes.status === "fulfilled" && conflictRes.value.ok) {
        const data = await conflictRes.value.json();
        setConflicts(data.breakdown || []);
      }

      if (logsRes.status === "fulfilled" && logsRes.value.ok) {
        const data = await logsRes.value.json();
        setRecentLogs(data.logs || []);
      }
    } catch {
      loadMockOverview();
    } finally {
      setLoading(false);
    }
  };

  const loadMockOverview = () => {
    setOverview({
      total_documents: 18,
      total_documents_processed: 18,
      total_documents_pending: 0,
      total_records_extracted: 18,
      total_records_verified: 12,
      total_records_flagged: 2,
      total_records_rejected: 4,
      fields_requiring_review: 2,
      validation_conflicts_count: 5,
      critical_conflicts_count: 2,
      average_confidence_score: 0.95,
      digitization_progress_pct: 78.5,
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (user?.role === "OWNER") {
    return (
      <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Officer Command Center Restricted</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              This portal is restricted to authorized Revenue Officers, District Collectors, and Surveyors. Please navigate to your Citizen Land Vault to view your properties.
            </p>
            <div className="pt-2">
              <Link href="/owner">
                <Button className="w-full bg-primary text-on-primary font-bold text-xs">
                  Go to Citizen Land Vault
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header Breadcrumb & Title */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant">
              <span>Command Center</span>
              <ChevronRight className="w-3.5 h-3.5 text-outline" />
              <span className="text-primary font-bold">Overview Telemetry</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Land Intelligence Command Center
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant">
              National / State / District cadastral telemetry, verification queue telemetry, and spatial conflict alerts.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Metrics</span>
            </Button>
            <Link href="/upload">
              <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold gap-1.5 shadow-sm">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Ingest Document</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* 6 Top Metric KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          
          {/* Metric 1: Documents Processed */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                Processed Deeds
              </span>
              <FileText className="w-4 h-4 text-outline" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono">
              {overview ? overview.total_documents_processed : "—"}
            </div>
            <div className="mt-2 text-primary text-[11px] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Ingested &amp; Parsed</span>
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
            <div className="text-2xl font-bold text-on-surface font-mono">
              {overview ? overview.fields_requiring_review : "—"}
            </div>
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
            <div className="text-2xl font-bold text-on-surface font-mono z-10">
              {overview ? overview.critical_conflicts_count : "—"}
            </div>
            <div className="mt-2 text-error text-[11px] font-semibold flex items-center gap-1 z-10">
              <AlertTriangle className="w-3 h-3" />
              <span>Spatial Overlaps</span>
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
            <div className="text-2xl font-bold text-on-surface font-mono z-10">
              {overview ? overview.validation_conflicts_count : "—"}
            </div>
            <div className="mt-2 text-error text-[11px] font-semibold flex items-center gap-1 z-10">
              <AlertTriangle className="w-3 h-3" />
              <span>Rule Violations</span>
            </div>
          </div>

          {/* Metric 5: Average AI Confidence */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute top-0 right-0 w-12 h-12 bg-primary/10 rounded-bl-full" />
            <div className="flex items-center justify-between mb-2 z-10">
              <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                AI Accuracy
              </span>
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-on-surface font-mono z-10">
              {overview ? `${(overview.average_confidence_score * 100).toFixed(1)}%` : "—"}
            </div>
            <div className="mt-2 text-primary text-[11px] font-semibold flex items-center gap-1 z-10">
              <span>Indic Vision OCR</span>
            </div>
          </div>

          {/* Metric 6: Verified Records */}
          <div className="bg-surface p-4 rounded-xl border border-outline-variant shadow-[0_2px_4px_rgba(23,32,27,0.04)] flex flex-col justify-between hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] uppercase font-bold text-[#15803D] tracking-wider">
                Verified Clear
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
            </div>
            <div className="text-2xl font-bold text-[#15803D] font-mono">
              {overview ? overview.total_records_verified : "—"}
            </div>
            <div className="mt-2 text-[#15803D] text-[11px] font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              <span>{overview ? `${overview.digitization_progress_pct}% Total` : "Validated"}</span>
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
                  <span>Pending Officer Queue</span>
                </h3>
                <Link href="/verification" className="text-primary text-xs font-semibold hover:underline">
                  View All ({queueItems.length})
                </Link>
              </div>

              <div className="p-2 divide-y divide-outline-variant/60 max-h-[320px] overflow-y-auto custom-scrollbar">
                {queueItems.length === 0 ? (
                  <div className="p-6 text-center text-xs text-on-surface-variant">
                    <CheckCircle2 className="w-6 h-6 mx-auto text-[#15803D] mb-1" />
                    No urgent records awaiting officer review.
                  </div>
                ) : (
                  queueItems.map((item) => (
                    <Link
                      key={item.record_id}
                      href={`/verification/${item.record_id}`}
                      className="p-3 hover:bg-surface-container-low rounded-lg block transition-colors group cursor-pointer"
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-on-surface group-hover:text-primary">
                          Survey #{item.survey_number} • {item.village}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider border ${
                            item.critical_issues > 0
                              ? "bg-error-container text-on-error-container border-error/20"
                              : "bg-[#FFEDD5] text-[#C2410C] border-[#FDBA74]"
                          }`}
                        >
                          {item.critical_issues > 0 ? "Critical" : "Review"}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant truncate">
                        {item.original_name}
                      </p>
                      <div className="text-[10px] text-outline mt-1.5 flex items-center justify-between font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{item.district}, {item.state}</span>
                        </div>
                        <span className="text-primary font-bold">
                          {((item.overall_confidence_score || 0.9) * 100).toFixed(0)}% Conf
                        </span>
                      </div>
                    </Link>
                  ))
                )}
              </div>
            </div>

            {/* Live Audit Log Stream */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm flex flex-col overflow-hidden">
              <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span>Audit Event Telemetry</span>
                </h3>
                <Link href="/audit" className="text-primary text-xs font-semibold hover:underline">
                  Full Ledger
                </Link>
              </div>

              <div className="p-3 space-y-2.5 max-h-[260px] overflow-y-auto custom-scrollbar text-xs">
                {recentLogs.length === 0 ? (
                  <div className="py-4 text-center text-xs text-on-surface-variant">
                    No recent audit events recorded.
                  </div>
                ) : (
                  recentLogs.map((log, idx) => (
                    <div key={idx} className="p-2 rounded bg-surface-container-low border border-outline-variant/60 flex items-start gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-on-surface truncate">{log.action}</span>
                          <span className="text-[10px] text-outline font-mono">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-[11px] text-on-surface-variant truncate">
                          {log.resource_type} #{log.resource_id} • User #{log.user_id || "System"}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* Right Column (2 Cols): Live Cadastral GIS & District Progress */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Live Cadastral Conflict Telemetry Map Card */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-outline-variant flex flex-wrap justify-between items-center bg-surface-container-low gap-2">
                <div>
                  <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                    <Compass className="w-4 h-4 text-primary" />
                    <span>Cadastral Spatial Boundary Telemetry</span>
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Live GIS parcel layer overlay with boundary variance triggers.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="verified" className="text-[10px]">
                    PostGIS Engine Active
                  </Badge>
                  <Link href="/gis">
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Open GIS Map
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Map Canvas Visual */}
              <div className="relative w-full h-[280px] bg-cadastral bg-cover flex items-center justify-center p-6">
                <div className="absolute inset-0 bg-gradient-to-t from-surface-container-lowest/80 via-transparent to-transparent" />
                <div className="relative z-10 bg-surface/90 backdrop-blur-md p-4 rounded-xl border border-outline-variant shadow-lg max-w-sm text-center space-y-2">
                  <Compass className="w-8 h-8 mx-auto text-primary animate-spin" style={{ animationDuration: "12s" }} />
                  <h4 className="font-bold text-xs text-on-surface">Live Cadastral Spatial Validation</h4>
                  <p className="text-[11px] text-on-surface-variant">
                    Spatial verification runs polygon extent calculation against revenue deeds. 17 cadastral parcels mapped across Pune, Haveli, and Devanahalli.
                  </p>
                  <Link href="/gis" className="inline-block pt-1">
                    <span className="text-xs font-bold text-primary hover:underline">
                      Explore Full GIS Conflict Layer →
                    </span>
                  </Link>
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
                <span className="text-xs font-mono font-bold text-primary">State Jurisdictions</span>
              </div>

              <div className="space-y-4">
                {districts.length === 0 ? (
                  <div className="text-xs text-on-surface-variant py-2">Loading district statistics...</div>
                ) : (
                  districts.map((dist, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-end text-xs">
                        <span className="font-bold text-on-surface">
                          {dist.district} ({dist.state})
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] text-on-surface-variant">
                            {dist.verified_records} / {dist.total_records} Records ({dist.total_area_hectares} Ha)
                          </span>
                          <span className="font-mono text-primary font-bold">{dist.progress_percentage}%</span>
                        </div>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden border border-outline-variant">
                        <div
                          className="bg-primary h-2.5 rounded-full transition-all"
                          style={{ width: `${Math.min(100, dist.progress_percentage)}%` }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

        </div>

      </main>
    </div>
  );
}
