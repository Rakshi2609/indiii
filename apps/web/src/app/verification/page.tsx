"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  FileText, 
  Filter, 
  Layers, 
  RefreshCw, 
  Search, 
  ShieldAlert, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface QueueItem {
  record_id: number;
  document_id: number;
  filename: string;
  original_name: string;
  state: string;
  district: string;
  village: string;
  survey_number: string;
  overall_confidence_score: number;
  validation_status: string;
  total_issues: number;
  critical_issues: number;
  created_at: string;
}

export default function VerificationQueuePage() {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/verification/queue");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        // Fallback sample data for offline / demo mode
        setItems([
          {
            record_id: 1,
            document_id: 101,
            filename: "satbara_wagholi_142.pdf",
            original_name: "Satbara_7_12_Wagholi_Pune.pdf",
            state: "Maharashtra",
            district: "Pune",
            village: "Wagholi",
            survey_number: "142/2A",
            overall_confidence_score: 0.76,
            validation_status: "FLAGGED_FOR_REVIEW",
            total_issues: 2,
            critical_issues: 0,
            created_at: new Date().toISOString()
          },
          {
            record_id: 2,
            document_id: 102,
            filename: "sale_deed_haveli.pdf",
            original_name: "Registered_Deed_Haveli_4512.pdf",
            state: "Maharashtra",
            district: "Pune",
            village: "Haveli",
            survey_number: "88/1",
            overall_confidence_score: 0.94,
            validation_status: "VERIFIED_CLEAR",
            total_issues: 0,
            critical_issues: 0,
            created_at: new Date(Date.now() - 3600000).toISOString()
          },
          {
            record_id: 3,
            document_id: 103,
            filename: "rtc_pahani_bangalore.pdf",
            original_name: "RTC_Pahani_Survey_204.pdf",
            state: "Karnataka",
            district: "Bengaluru Rural",
            village: "Devanahalli",
            survey_number: "204",
            overall_confidence_score: 0.62,
            validation_status: "REJECTED_CRITICAL",
            total_issues: 3,
            critical_issues: 1,
            created_at: new Date(Date.now() - 7200000).toISOString()
          }
        ]);
      }
    } catch {
      // Mock fallback
      setItems([
        {
          record_id: 1,
          document_id: 101,
          filename: "satbara_wagholi_142.pdf",
          original_name: "Satbara_7_12_Wagholi_Pune.pdf",
          state: "Maharashtra",
          district: "Pune",
          village: "Wagholi",
          survey_number: "142/2A",
          overall_confidence_score: 0.76,
          validation_status: "FLAGGED_FOR_REVIEW",
          total_issues: 2,
          critical_issues: 0,
          created_at: new Date().toISOString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.survey_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.original_name.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterStatus === "ALL") return matchesSearch;
    if (filterStatus === "FLAGGED") return matchesSearch && item.overall_confidence_score < 0.85;
    if (filterStatus === "VERIFIED") return matchesSearch && item.validation_status.includes("VERIFIED");
    return matchesSearch;
  });

  const getStatusBadge = (status: string, score: number) => {
    if (status.includes("MANUAL") || status.includes("CORRECTED")) {
      return <Badge variant="verified">Officer Verified</Badge>;
    }
    if (score >= 0.90 && status === "VERIFIED_CLEAR") {
      return <Badge variant="verified">Clear (AI 90%+)</Badge>;
    }
    if (status === "REJECTED_CRITICAL" || score < 0.70) {
      return <Badge variant="destructive">Critical Review</Badge>;
    }
    return <Badge variant="warning">Flagged ({Math.round(score * 100)}%)</Badge>;
  };

  return (
    <div className="min-vh-screen bg-slate-950 text-slate-100 p-6 sm:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
                Officer Workbench
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Human Verification & Review Queue
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Review AI-extracted land revenue records, resolve cadastral conflicts, and verify ownership deeds.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQueue}
              className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Link href="/">
              <Button size="sm" variant="secondary">
                Monorepo Dashboard
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Survey Number, Village, District, or Document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="flex gap-2">
            {["ALL", "FLAGGED", "VERIFIED"].map((status) => (
              <Button
                key={status}
                size="sm"
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className={`flex-1 text-xs ${
                  filterStatus === status
                    ? "bg-emerald-600 text-white"
                    : "border-slate-800 bg-slate-900 text-slate-300 hover:bg-slate-800"
                }`}
              >
                {status}
              </Button>
            ))}
          </div>
        </div>

        {/* Queue Items Table / Cards */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16 text-slate-500">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin mb-3 text-emerald-500" />
              <p>Loading verification queue...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-xl bg-slate-900/40">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
              <h3 className="text-base font-semibold text-white">No records awaiting verification</h3>
              <p className="text-xs text-slate-400 mt-1">All extracted records meet validation confidence thresholds.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <Card
                key={item.record_id}
                className="bg-slate-900/70 border-slate-800 hover:border-slate-700 transition-all shadow-sm"
              >
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-emerald-400 shrink-0" />
                      <span className="font-semibold text-white text-base">
                        Survey No. {item.survey_number}
                      </span>
                      <span className="text-slate-400 text-sm">
                        • {item.village}, {item.district}, {item.state}
                      </span>
                      {getStatusBadge(item.validation_status, item.overall_confidence_score)}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                      <span>Document: <strong className="text-slate-300">{item.original_name}</strong></span>
                      <span>Confidence Score: <strong className={`${item.overall_confidence_score < 0.85 ? 'text-amber-400' : 'text-emerald-400'}`}>{(item.overall_confidence_score * 100).toFixed(1)}%</strong></span>
                      {item.total_issues > 0 && (
                        <span className="flex items-center gap-1 text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          {item.total_issues} flagged conflict(s)
                        </span>
                      )}
                      {item.critical_issues > 0 && (
                        <span className="flex items-center gap-1 text-red-400">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          {item.critical_issues} critical
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center gap-3">
                    <Link href={`/verification/${item.record_id}`}>
                      <Button className="bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-xs">
                        Open Workspace
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
