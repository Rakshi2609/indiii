"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Edit3,
  FileCheck2,
  FileText,
  Filter,
  HelpCircle,
  Layers,
  Loader2,
  MapPin,
  PlusCircle,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";
import { Lock } from "lucide-react";

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
  has_conflicts?: boolean;
  has_missing_details?: boolean;
  missing_fields?: string[];
  created_at: string;
}

export default function VerificationQueuePage() {
  const { user } = useAuth();
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
        record_id: 18,
        document_id: 18,
        filename: "latest_deed_wagholi.pdf",
        original_name: "Satbara_7_12_Wagholi_Pune.pdf",
        state: "Maharashtra",
        district: "Pune",
        village: "Wagholi",
        survey_number: "142/2A",
        overall_confidence_score: 0.94,
        validation_status: "FLAGGED_FOR_REVIEW",
        total_issues: 2,
        critical_issues: 1,
        has_conflicts: true,
        has_missing_details: false,
        missing_fields: [],
        created_at: new Date().toISOString(),
      },
      {
        record_id: 17,
        document_id: 17,
        filename: "missing_khatadar_deed.pdf",
        original_name: "Karnataka_RTC_Pahani_Devanahalli.pdf",
        state: "Karnataka",
        district: "Bengaluru Rural",
        village: "Devanahalli",
        survey_number: "88/3A",
        overall_confidence_score: 0.72,
        validation_status: "PENDING_MANUAL_REVIEW",
        total_issues: 1,
        critical_issues: 0,
        has_conflicts: false,
        has_missing_details: true,
        missing_fields: ["Khatadars / Co-Sharers", "Sub-Registrar Office"],
        created_at: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        record_id: 16,
        document_id: 16,
        filename: "verified_sale_deed.pdf",
        original_name: "Registered_Deed_Haveli_4512.pdf",
        state: "Maharashtra",
        district: "Pune",
        village: "Haveli",
        survey_number: "88/1",
        overall_confidence_score: 0.98,
        validation_status: "VERIFIED_MANUAL",
        total_issues: 0,
        critical_issues: 0,
        has_conflicts: false,
        has_missing_details: false,
        missing_fields: [],
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
      item.original_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.state.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterStatus === "ALL") return true;
    if (filterStatus === "CONFLICTS") return item.has_conflicts || item.total_issues > 0 || item.critical_issues > 0;
    if (filterStatus === "MISSING") return item.has_missing_details || (item.missing_fields && item.missing_fields.length > 0);
    if (filterStatus === "PENDING") return !item.validation_status.includes("VERIFIED") && !item.validation_status.includes("REJECTED");
    if (filterStatus === "VERIFIED") return item.validation_status.includes("VERIFIED");
    return true;
  });

  const conflictsCount = items.filter((i) => i.has_conflicts || i.total_issues > 0).length;
  const missingCount = items.filter((i) => i.has_missing_details || (i.missing_fields && i.missing_fields.length > 0)).length;
  const pendingCount = items.filter((i) => !i.validation_status.includes("VERIFIED") && !i.validation_status.includes("REJECTED")).length;
  const verifiedCount = items.filter((i) => i.validation_status.includes("VERIFIED")).length;

  if (user?.role === "OWNER") {
    return (
      <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Officer Queue Restricted</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Human verification workflows are restricted to authorized Revenue Officers and Land Surveyors. Please view your properties in the Citizen Vault.
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

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-[10px] uppercase tracking-widest text-primary font-bold">
                Government Officer Verification Workbench
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-on-surface tracking-tight">
              Human Verification &amp; Review Queue
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Latest uploaded deeds appear on top. Review AI OCR extracts, inspect conflicts, add missing khatadars/details, and issue statutory verifications.
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
              <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold gap-1.5 shadow-sm">
                <FileCheck2 className="w-3.5 h-3.5" />
                <span>Upload New Deed</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search by Survey Number, Village, District, State, or Document Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-surface border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
              />
            </div>

            {/* Quick Filter Buttons */}
            <div className="flex flex-wrap gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant">
              <button
                onClick={() => setFilterStatus("ALL")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterStatus === "ALL"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                All Deeds ({items.length})
              </button>

              <button
                onClick={() => setFilterStatus("CONFLICTS")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterStatus === "CONFLICTS"
                    ? "bg-[#EA580C] text-white shadow-sm"
                    : "text-[#EA580C] hover:bg-[#FFEDD5]"
                }`}
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Conflicts ({conflictsCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus("MISSING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                  filterStatus === "MISSING"
                    ? "bg-[#D97706] text-white shadow-sm"
                    : "text-[#D97706] hover:bg-[#FEF3C7]"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Missing Details ({missingCount})</span>
              </button>

              <button
                onClick={() => setFilterStatus("PENDING")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                  filterStatus === "PENDING"
                    ? "bg-[#4F46E5] text-white shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
              >
                Pending Review ({pendingCount})
              </button>

              <button
                onClick={() => setFilterStatus("VERIFIED")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  filterStatus === "VERIFIED"
                    ? "bg-[#15803D] text-white shadow-sm"
                    : "text-[#15803D] hover:bg-[#DCFCE7]"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified ({verifiedCount})</span>
              </button>
            </div>
          </div>

          {/* Sub-header Sorting Note */}
          <div className="flex justify-between items-center text-[11px] text-on-surface-variant px-1 font-mono">
            <span>Sorted by: <strong>Latest Uploaded (Newest on Top)</strong></span>
            <span>Showing {filteredItems.length} of {items.length} records</span>
          </div>
        </div>

        {/* Queue Items List */}
        <div className="space-y-3.5">
          {loading ? (
            <div className="text-center py-16 text-on-surface-variant space-y-2">
              <RefreshCw className="w-7 h-7 mx-auto animate-spin text-primary" />
              <p className="text-xs">Loading verification queue...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-outline-variant rounded-xl bg-surface p-6 space-y-2">
              <CheckCircle2 className="w-8 h-8 mx-auto text-[#15803D]" />
              <h3 className="text-sm font-bold text-on-surface">No records matching active filter</h3>
              <p className="text-xs text-on-surface-variant">Switch filter tab or upload a new deed document.</p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isFlagged = item.has_conflicts || item.total_issues > 0;
              const hasMissing = item.has_missing_details || (item.missing_fields && item.missing_fields.length > 0);
              const isVerified = item.validation_status.includes("VERIFIED");

              return (
                <div
                  key={item.record_id}
                  className={`bg-surface rounded-xl border p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden ${
                    isFlagged
                      ? "border-[#FDBA74] bg-[#FFFBF7]"
                      : hasMissing
                      ? "border-[#FCD34D] bg-[#FFFDF5]"
                      : "border-outline-variant"
                  }`}
                >
                  {/* Top Left Indicator for Newest Upload */}
                  {idx === 0 && (
                    <div className="absolute top-0 left-0 bg-primary text-on-primary text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-br">
                      Latest Uploaded
                    </div>
                  )}

                  <div className="space-y-2.5 min-w-0 flex-1 pt-1">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-primary-container/20 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-on-surface font-mono">
                            Survey No. {item.survey_number}
                          </span>
                          <Badge
                            variant={
                              isVerified
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
                        <span className="text-xs text-on-surface-variant font-medium">
                          {item.village}, {item.district}, {item.state}
                        </span>
                      </div>
                    </div>

                    {/* Conflict / Missing Tags */}
                    <div className="flex flex-wrap items-center gap-2 text-xs pl-11">
                      {/* Document original name */}
                      <span className="text-on-surface font-medium truncate max-w-[220px]">
                        {item.original_name}
                      </span>

                      <span className="text-outline">•</span>

                      {/* Confidence */}
                      <span className="text-on-surface-variant">
                        AI Score:{" "}
                        <strong className={item.overall_confidence_score < 0.85 ? "text-error" : "text-[#15803D]"}>
                          {(item.overall_confidence_score * 100).toFixed(0)}%
                        </strong>
                      </span>

                      {/* Active Conflicts Badge */}
                      {isFlagged && (
                        <span className="bg-[#FFEDD5] border border-[#FDBA74] text-[#C2410C] px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>{item.total_issues || 1} Conflict(s) Detected</span>
                        </span>
                      )}

                      {/* Missing Details Tag */}
                      {hasMissing && (
                        <span className="bg-[#FEF3C7] border border-[#FCD34D] text-[#B45309] px-2 py-0.5 rounded-full font-bold text-[11px] flex items-center gap-1">
                          <HelpCircle className="w-3 h-3" />
                          <span>Missing: {item.missing_fields?.join(", ") || "Khatadar / Area"}</span>
                        </span>
                      )}

                      <span className="text-outline">•</span>

                      {/* Timestamp */}
                      <span className="text-[10px] text-outline font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{new Date(item.created_at).toLocaleString()}</span>
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0 self-end md:self-center">
                    {/* Direct Edit / Add Missing Info Button */}
                    <Link href={`/verification/${item.record_id}?edit=true`}>
                      <button className="bg-surface border border-outline-variant hover:bg-surface-container text-on-surface px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer">
                        <Edit3 className="w-3.5 h-3.5 text-[#EA580C]" />
                        <span>Edit / Add Missing</span>
                      </button>
                    </Link>

                    {/* Open Full Workbench */}
                    <Link href={`/verification/${item.record_id}`}>
                      <Button size="sm" className="bg-primary text-on-primary text-xs font-bold gap-1.5 shadow-sm">
                        <span>Verify Record</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>

                    {/* Delete Option */}
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
              );
            })
          )}
        </div>

      </main>
    </div>
  );
}
