"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  FileCheck2,
  FileText,
  Filter,
  Layers,
  Loader2,
  MapPin,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  Trash2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

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
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchQueue = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/verification/queue");
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      } else {
        loadMockQueue();
      }
    } catch {
      loadMockQueue();
    } finally {
      setLoading(false);
    }
  };

  const loadMockQueue = () => {
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
        created_at: new Date().toISOString(),
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
        created_at: new Date(Date.now() - 3600000).toISOString(),
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
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
    ]);
  };

  useEffect(() => {
    fetchQueue();
  }, []);

  const handleDeleteQueueItem = async (e: React.MouseEvent, docId: number, recordId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Are you sure you want to delete Record #${recordId}?`)) return;
    setDeletingId(recordId);
    try {
      await fetch(`http://localhost:8000/api/documents/${docId}`, { method: "DELETE" });
      setItems((prev) => prev.filter((item) => item.record_id !== recordId));
    } catch {
      setItems((prev) => prev.filter((item) => item.record_id !== recordId));
    } finally {
      setDeletingId(null);
    }
  };

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

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Officer Verification Workbench
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Human Verification &amp; Review Queue
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Review AI-extracted land revenue records, resolve cadastral conflicts, and approve ownership deeds.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchQueue}
              className="text-xs font-semibold gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh Queue</span>
            </Button>
            <Link href="/upload">
              <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold">
                Upload New Deed
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Search by Survey Number, Village, District, or Document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex gap-2">
            {["ALL", "FLAGGED", "VERIFIED"].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                  filterStatus === st
                    ? "bg-primary text-on-primary border-primary"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant space-y-2">
              <RefreshCw className="w-7 h-7 mx-auto animate-spin text-primary" />
              <p className="text-xs">Loading verification queue...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-outline-variant rounded-xl bg-surface p-6 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#15803D]" />
              <h3 className="text-sm font-bold text-on-surface">No records awaiting verification</h3>
              <p className="text-xs text-on-surface-variant">All extracted deeds meet automated confidence thresholds.</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.record_id}
                className="bg-surface rounded-xl border border-outline-variant p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="space-y-2 min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary-container/15 text-primary flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-bold text-sm text-on-surface">
                      Survey No. {item.survey_number}
                    </span>
                    <span className="text-xs text-on-surface-variant">
                      • {item.village}, {item.district}, {item.state}
                    </span>
                    <Badge
                      variant={
                        item.validation_status.includes("VERIFIED")
                          ? "verified"
                          : item.validation_status.includes("REJECTED")
                          ? "destructive"
                          : "warning"
                      }
                      className="text-[10px]"
                    >
                      {item.validation_status}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pl-10">
                    <span>Doc: <strong className="text-on-surface">{item.original_name}</strong></span>
                    <span>•</span>
                    <span>
                      Confidence:{" "}
                      <strong className={item.overall_confidence_score < 0.85 ? "text-error" : "text-[#15803D]"}>
                        {(item.overall_confidence_score * 100).toFixed(0)}%
                      </strong>
                    </span>
                    {item.total_issues > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#C2410C] font-semibold flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          {item.total_issues} conflict(s)
                        </span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <Link href={`/verification/${item.record_id}`}>
                    <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold gap-1.5">
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>

                  <button
                    onClick={(e) => handleDeleteQueueItem(e, item.document_id, item.record_id)}
                    disabled={deletingId === item.record_id}
                    className="p-2 text-on-surface-variant hover:text-error hover:bg-surface-container rounded-lg transition-colors cursor-pointer"
                    title="Delete Record"
                  >
                    {deletingId === item.record_id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

      </main>
    </div>
  );
}
