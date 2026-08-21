"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck,
  FileText,
  Layers,
  MapPin,
  PieChart,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  TrendingUp,
  UploadCloud,
  UserCheck,
  Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface OverviewMetrics {
  total_documents: number;
  total_documents_processed: number;
  total_documents_pending: number;
  total_documents_failed: number;
  total_records_extracted: number;
  total_records_verified: number;
  total_records_flagged: number;
  total_records_rejected: number;
  fields_requiring_review: number;
  validation_conflicts_count: number;
  critical_conflicts_count: number;
  average_confidence_score: number;
  digitization_progress_pct: number;
  last_updated: string;
}

interface DistrictProgress {
  state: string;
  district: string;
  total_records: number;
  verified_records: number;
  flagged_records: number;
  progress_percentage: number;
  total_area_hectares: number;
}

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewMetrics | null>(null);
  const [districts, setDistricts] = useState<DistrictProgress[]>([]);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [ovRes, distRes, confRes] = await Promise.all([
        fetch("http://localhost:8000/api/analytics/overview"),
        fetch("http://localhost:8000/api/analytics/districts"),
        fetch("http://localhost:8000/api/analytics/conflicts")
      ]);

      if (ovRes.ok) {
        const ovData = await ovRes.json();
        setOverview(ovData);
      } else {
        loadMockData();
      }

      if (distRes.ok) {
        const distData = await distRes.json();
        setDistricts(distData.districts || []);
      }

      if (confRes.ok) {
        const confData = await confRes.json();
        setConflicts(confData.breakdown || []);
      }
    } catch {
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockData = () => {
    setOverview({
      total_documents: 128,
      total_documents_processed: 124,
      total_documents_pending: 3,
      total_documents_failed: 1,
      total_records_extracted: 124,
      total_records_verified: 106,
      total_records_flagged: 15,
      total_records_rejected: 3,
      fields_requiring_review: 18,
      validation_conflicts_count: 22,
      critical_conflicts_count: 2,
      average_confidence_score: 0.912,
      digitization_progress_pct: 85.5,
      last_updated: new Date().toISOString()
    });

    setDistricts([
      {
        state: "Maharashtra",
        district: "Pune (Haveli/Wagholi)",
        total_records: 64,
        verified_records: 58,
        flagged_records: 6,
        progress_percentage: 90.6,
        total_area_hectares: 184.5
      },
      {
        state: "Maharashtra",
        district: "Satara",
        total_records: 36,
        verified_records: 30,
        flagged_records: 6,
        progress_percentage: 83.3,
        total_area_hectares: 112.8
      },
      {
        state: "Karnataka",
        district: "Bengaluru Rural (Devanahalli)",
        total_records: 24,
        verified_records: 18,
        flagged_records: 6,
        progress_percentage: 75.0,
        total_area_hectares: 96.4
      }
    ]);

    setConflicts([
      { issue_type: "RULE", severity: "HIGH", count: 8 },
      { issue_type: "DB_MATCH", severity: "CRITICAL", count: 2 },
      { issue_type: "GIS_CONFLICT", severity: "MEDIUM", count: 7 },
      { issue_type: "RULE", severity: "LOW", count: 5 }
    ]);
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-6 sm:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                Executive Analytics & Telemetry
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Land AI Enterprise Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Real-time monitoring of land deed digitization, Sarvam OCR extraction throughput, and cadastral spatial health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchDashboardData}
              className="border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800 text-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
            </Button>
            <Link href="/gis">
              <Button size="sm" variant="outline" className="border-slate-800 bg-slate-900 text-slate-200 gap-1.5 text-xs">
                <Compass className="w-3.5 h-3.5 text-indigo-400" />
                GIS Map
              </Button>
            </Link>
            <Link href="/verification">
              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white gap-1.5 text-xs font-semibold">
                <FileCheck className="w-3.5 h-3.5" />
                Review Queue
              </Button>
            </Link>
          </div>
        </div>

        {/* 1. TOP STAT CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Documents Card */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Total Documents
                </span>
                <div className="p-2 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-400">
                  <FileText className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mt-2">
                {overview?.total_documents ?? "—"}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span>Processed: <strong className="text-emerald-400">{overview?.total_documents_processed ?? 0}</strong></span>
                <span>Pending: <strong className="text-amber-400">{overview?.total_documents_pending ?? 0}</strong></span>
              </div>
            </CardContent>
          </Card>

          {/* Extracted Records Card */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Extracted Records
                </span>
                <div className="p-2 rounded-lg bg-indigo-950/60 border border-indigo-800/60 text-indigo-400">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-white mt-2">
                {overview?.total_records_extracted ?? "—"}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span>Mean OCR Score:</span>
                <strong className="text-emerald-400 font-mono">
                  {overview?.average_confidence_score ? `${(overview.average_confidence_score * 100).toFixed(1)}%` : "95.0%"}
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* Verified Land Records Card */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Verified Records
                </span>
                <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-emerald-400 mt-2">
                {overview?.total_records_verified ?? "—"}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span>Verification Rate:</span>
                <strong className="text-emerald-400 font-mono">
                  {overview?.digitization_progress_pct ?? 0}%
                </strong>
              </div>
            </CardContent>
          </Card>

          {/* Review Queue / Conflicts Card */}
          <Card className="bg-slate-900/80 border-slate-800">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Review Queue
                </span>
                <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-400">
                  <AlertTriangle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-3xl font-bold text-amber-400 mt-2">
                {overview?.fields_requiring_review ?? "—"}
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800/80">
                <span>Critical Flags: <strong className="text-red-400">{overview?.critical_conflicts_count ?? 0}</strong></span>
                <Link href="/verification" className="text-emerald-400 hover:underline flex items-center gap-1 font-semibold">
                  Inspect <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 2. OVERALL DIGITIZATION PROGRESS BAR */}
        <Card className="bg-slate-900/70 border-slate-800">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  National Cadastral Digitization Progress
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Percentage of revenue deeds validated through AI extraction and officer approval
                </p>
              </div>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {overview?.digitization_progress_pct ?? 0}% Completed
              </span>
            </div>

            {/* Main Progress Track */}
            <div className="w-full bg-slate-950 rounded-full h-3.5 border border-slate-800 overflow-hidden p-0.5 flex">
              <div
                style={{ width: `${overview?.digitization_progress_pct ?? 85}%` }}
                className="bg-gradient-to-r from-emerald-600 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* 3. SPLIT VIEW: PENDING VERIFICATION vs ACTIVE VALIDATION CONFLICTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Pending Verification Queue Highlights */}
          <Card className="bg-slate-900/60 border-slate-800 flex flex-col">
            <CardHeader className="border-b border-slate-800 pb-3 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-400" />
                  Pending Officer Verification
                </CardTitle>
                <CardDescription className="text-xs text-slate-400">
                  Records with low OCR confidence or pending field sign-offs
                </CardDescription>
              </div>
              <Link href="/verification">
                <Button size="sm" variant="ghost" className="text-xs text-emerald-400 hover:text-emerald-300">
                  View All
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="p-4 space-y-3 flex-1">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">Survey No. 142/2A • Wagholi</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Marginal OCR confidence on area extent</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="warning">74% Conf</Badge>
                  <Link href="/verification/1">
                    <Button size="sm" variant="secondary" className="h-7 text-xs px-2.5">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">Survey No. 204 • Devanahalli</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Cadastral GIS boundary discrepancy flagged</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="destructive">Critical</Badge>
                  <Link href="/verification/3">
                    <Button size="sm" variant="secondary" className="h-7 text-xs px-2.5">
                      Review
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Right: Validation Conflicts by Category */}
          <Card className="bg-slate-900/60 border-slate-800 flex flex-col">
            <CardHeader className="border-b border-slate-800 pb-3">
              <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Active Validation Conflicts Breakdown
              </CardTitle>
              <CardDescription className="text-xs text-slate-400">
                Rule violations, double registrations, and GIS extent mismatches
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 space-y-3 flex-1">
              {conflicts.length > 0 ? (
                conflicts.map((c, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono text-slate-300 font-semibold">{c.issue_type}</span>
                      <span className="text-slate-500">•</span>
                      <Badge
                        variant={c.severity === "CRITICAL" ? "destructive" : c.severity === "HIGH" ? "destructive" : "warning"}
                        className="text-[10px]"
                      >
                        {c.severity}
                      </Badge>
                    </div>
                    <span className="font-bold text-white font-mono">{c.count} instances</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500 text-xs">
                  <CheckCircle2 className="w-6 h-6 mx-auto text-emerald-400 mb-1" />
                  No open critical conflicts across the registry.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* 4. DISTRICT DIGITIZATION PROGRESS LIST */}
        <Card className="bg-slate-900/60 border-slate-800">
          <CardHeader className="border-b border-slate-800 pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" />
              District-Wise Cadastral Digitization Progress
            </CardTitle>
            <CardDescription className="text-xs text-slate-400">
              Coverage metrics and total land area cataloged by revenue jurisdiction
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            {districts.map((dist, idx) => (
              <div key={idx} className="space-y-1.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <div>
                    <span className="font-bold text-white text-sm">{dist.district}</span>
                    <span className="text-slate-400 ml-2 text-xs">({dist.state})</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-400 text-xs">
                    <span>Total Area: <strong className="text-slate-200">{dist.total_area_hectares} Ha</strong></span>
                    <span>Records: <strong className="text-emerald-400">{dist.verified_records}</strong> / {dist.total_records}</span>
                    <span className="font-mono text-emerald-400 font-bold">{dist.progress_percentage}%</span>
                  </div>
                </div>

                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden flex">
                  <div
                    style={{ width: `${dist.progress_percentage}%` }}
                    className="bg-emerald-500 h-full rounded-full"
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
