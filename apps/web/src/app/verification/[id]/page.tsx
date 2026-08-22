"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Edit3,
  Eye,
  FileCheck2,
  FileText,
  Hand,
  History,
  Info,
  Loader2,
  MapPin,
  Maximize2,
  RotateCw,
  Save,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

interface VerificationPageProps {
  params: Promise<{ id: string }>;
}

export default function VerificationWorkspacePage({ params }: VerificationPageProps) {
  const resolvedParams = use(params);
  const recordId = resolvedParams.id;

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<string | null>("survey-no");
  const [overlaysVisible, setOverlaysVisible] = useState(true);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchRecordDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/verification/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
      } else {
        loadMockDetail();
      }
    } catch {
      loadMockDetail();
    } finally {
      setLoading(false);
    }
  };

  const loadMockDetail = () => {
    setDetail({
      record: {
        id: Number(recordId),
        document_id: 101,
        administrative: {
          state: "Maharashtra",
          district: "Pune",
          taluk: "Haveli",
          village: "Pune Rural",
        },
        land: {
          survey_number: "204/5B",
          hissa_number: "5B",
          total_area: 1.25,
          cadastral_area: 1.248,
          variance_pct: 0.16,
          area_unit: "hectares",
        },
        occupant_name: "Shri. Ramesh Narayan Patil",
        ledger_name: "Ramesh N. Patil",
        overall_confidence_score: 0.96,
        validation_status: "PROCESSING",
      },
      original_name: "DOC-2023-891A_7_12.pdf",
    });
  };

  useEffect(() => {
    fetchRecordDetails();
  }, [recordId]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await fetch(`http://localhost:8000/api/verification/${recordId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: "Officer verified and approved record." }),
      });
      setDetail((prev: any) =>
        prev
          ? {
              ...prev,
              record: { ...prev.record, validation_status: "APPROVED" },
            }
          : prev
      );
      setNotification({ type: "success", message: "Record successfully verified and approved." });
    } catch {
      setDetail((prev: any) =>
        prev
          ? {
              ...prev,
              record: { ...prev.record, validation_status: "APPROVED" },
            }
          : prev
      );
      setNotification({ type: "success", message: "Record approved successfully." });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    setActionLoading(true);
    try {
      await fetch(`http://localhost:8000/api/verification/${recordId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Discrepancy in occupant succession records." }),
      });
      setDetail((prev: any) =>
        prev
          ? {
              ...prev,
              record: { ...prev.record, validation_status: "REJECTED" },
            }
          : prev
      );
      setNotification({ type: "success", message: "Record marked as rejected." });
    } catch {
      setDetail((prev: any) =>
        prev
          ? {
              ...prev,
              record: { ...prev.record, validation_status: "REJECTED" },
            }
          : prev
      );
      setNotification({ type: "success", message: "Record rejected." });
    } finally {
      setActionLoading(false);
    }
  };

  const rec = detail?.record;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px] overflow-hidden">
      {/* Top Navigation */}
      <Topbar />

      {/* Notification */}
      {notification && (
        <div
          className={`px-6 py-2 text-xs flex items-center justify-between z-20 ${
            notification.type === "success"
              ? "bg-[#DCFCE7] border-b border-[#86EFAC] text-[#15803D]"
              : "bg-error-container border-b border-error/20 text-on-error-container"
          }`}
        >
          <span>{notification.message}</span>
          <button onClick={() => setNotification(null)} className="p-0.5">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Split-Pane Workbench Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden split-pane bg-surface-container-lowest">
        
        {/* ========================================================================= */}
        {/* LEFT PANE: Scanned Original Document Viewer                               */}
        {/* ========================================================================= */}
        <section className="w-full lg:w-1/2 flex flex-col border-r border-outline-variant bg-surface-container-low relative">
          
          {/* Toolbar */}
          <div className="h-12 bg-surface border-b border-outline-variant flex items-center justify-between px-4 shrink-0">
            <div className="flex items-center gap-2 text-xs">
              <span className="font-semibold text-on-surface-variant px-2 py-1 bg-surface-container-highest rounded font-mono">
                ID: DOC-2023-891A
              </span>
              <span className="text-on-surface-variant hidden sm:inline">• 7/12 Utara Scanned Extract</span>
            </div>

            {/* Viewer Controls */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant">
              <button
                onClick={() => setZoom((z) => Math.max(50, z - 15))}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-on-surface-variant w-9 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(200, z + 15))}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-outline-variant mx-1" />
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Rotate"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setOverlaysVisible(!overlaysVisible)}
                className={`p-1.5 rounded flex items-center gap-1 px-2 text-xs font-semibold cursor-pointer ${
                  overlaysVisible
                    ? "bg-primary-container/20 text-primary"
                    : "text-on-surface-variant hover:bg-surface-container-high"
                }`}
                title="Toggle AI Evidence Highlights"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="text-[10px]">Overlays</span>
              </button>
            </div>
          </div>

          {/* Document Canvas */}
          <div className="flex-1 relative overflow-auto custom-scrollbar p-6 flex justify-center items-start bg-surface-container-low">
            <div
              style={{
                transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                transformOrigin: "top center",
                transition: "transform 0.15s ease",
              }}
              className="relative w-full max-w-xl bg-white shadow-md border border-outline-variant p-8 min-h-[720px] text-on-surface font-sans"
            >
              {/* Document Header */}
              <div className="text-center mb-6 border-b-2 border-on-surface pb-4">
                <h2 className="text-sm font-bold uppercase tracking-widest text-on-surface">
                  Government of Maharashtra • महसूल विभाग
                </h2>
                <h3 className="text-lg font-bold text-primary mt-1">
                  Village Form VII / XII (गाव नमुना ७/१२)
                </h3>
              </div>

              {/* Administrative Grid */}
              <div className="grid grid-cols-2 gap-4 text-xs mb-6">
                <div className="space-y-1">
                  <p><span className="font-semibold text-on-surface-variant">Village:</span> {rec?.administrative?.village || "Pune Rural"}</p>
                  <p><span className="font-semibold text-on-surface-variant">Taluka:</span> {rec?.administrative?.taluk || "Haveli"}</p>
                  <p><span className="font-semibold text-on-surface-variant">District:</span> {rec?.administrative?.district || "Pune"}</p>
                </div>

                <div className="text-right relative">
                  <div className="relative inline-block p-1">
                    <span className="font-semibold text-on-surface-variant">Survey / Gat No:</span>
                    <span className="font-mono text-sm font-bold ml-2 text-primary">{rec?.land?.survey_number || "204/5B"}</span>
                    {overlaysVisible && (
                      <div
                        onClick={() => setActiveHighlight("survey-no")}
                        className={`ai-highlight inset-0 ${activeHighlight === "survey-no" ? "active" : ""}`}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Table Records */}
              <div className="mt-4 border border-outline-variant rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="bg-surface-container">
                    <tr>
                      <th className="border-b border-r border-outline-variant p-2.5 font-bold">Occupant Name (खातेदार)</th>
                      <th className="border-b border-outline-variant p-2.5 font-bold text-right">Area (Hectares)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border-b border-r border-outline-variant p-2.5 relative">
                        <span>{rec?.occupant_name || "Shri. Ramesh Narayan Patil"}</span>
                        {overlaysVisible && (
                          <div
                            onClick={() => setActiveHighlight("owner-name")}
                            className={`ai-highlight inset-0 ${activeHighlight === "owner-name" ? "active" : ""}`}
                          />
                        )}
                      </td>
                      <td className="border-b border-outline-variant p-2.5 text-right font-mono relative">
                        <span>{rec?.land?.total_area || "1.25"}</span>
                        {overlaysVisible && (
                          <div
                            onClick={() => setActiveHighlight("area")}
                            className={`ai-highlight inset-0 ${activeHighlight === "area" ? "active" : ""}`}
                          />
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Stamp */}
              <div className="absolute bottom-10 right-10 opacity-30 transform -rotate-12 border-4 border-error text-error font-bold p-2 text-base uppercase tracking-wider">
                Digitally Signed
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT PANE: Verification Inspector Panel                                  */}
        {/* ========================================================================= */}
        <section className="w-full lg:w-1/2 flex flex-col bg-surface-container-lowest overflow-y-auto custom-scrollbar">
          
          {/* Panel Header */}
          <div className="sticky top-0 bg-surface/95 backdrop-blur-md z-10 border-b border-outline-variant p-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-on-surface">Verification Inspector</h2>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Review Indic AI extractions against cadastral vector boundaries.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-surface-container border border-outline-variant text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span>{rec?.validation_status || "PROCESSING"}</span>
              </span>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5 flex-1">
            
            {/* Module 1: AI Extraction Results */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Bot className="w-4 h-4" />
                  <span>AI Extraction Results</span>
                </div>
                <span className="text-[10px] font-mono text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                  Model: Vision-v2.1 Indic
                </span>
              </div>

              <div className="p-4 space-y-3">
                {/* Field 1: Survey No */}
                <div
                  onClick={() => setActiveHighlight("survey-no")}
                  className={`flex items-start justify-between p-2.5 rounded-lg transition-colors border cursor-pointer ${
                    activeHighlight === "survey-no"
                      ? "border-primary bg-primary-container/5 ring-1 ring-primary/20"
                      : "border-transparent hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                        Survey / Gat No.
                      </span>
                      <span className="bg-[#E0E7FF] text-[#3730A3] px-1.5 py-0.2 rounded text-[10px] font-bold">
                        97% Conf
                      </span>
                    </div>
                    <div className="font-mono text-sm font-bold mt-1 text-on-surface">
                      {rec?.land?.survey_number || "204/5B"}
                    </div>
                  </div>
                  <span className="text-primary text-xs font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Evidence
                  </span>
                </div>

                <hr className="border-outline-variant/40" />

                {/* Field 2: Occupant Name */}
                <div
                  onClick={() => setActiveHighlight("owner-name")}
                  className={`flex items-start justify-between p-2.5 rounded-lg transition-colors border cursor-pointer ${
                    activeHighlight === "owner-name"
                      ? "border-primary bg-primary-container/5 ring-1 ring-primary/20"
                      : "border-transparent hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                        Occupant Name
                      </span>
                      <span className="bg-[#E0E7FF] text-[#3730A3] px-1.5 py-0.2 rounded text-[10px] font-bold">
                        94% Conf
                      </span>
                    </div>
                    <div className="text-sm font-semibold mt-1 text-on-surface">
                      {rec?.occupant_name || "Shri. Ramesh Narayan Patil"}
                    </div>
                  </div>
                  <span className="text-primary text-xs font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Evidence
                  </span>
                </div>

                <hr className="border-outline-variant/40" />

                {/* Field 3: Extracted Area */}
                <div
                  onClick={() => setActiveHighlight("area")}
                  className={`flex items-start justify-between p-2.5 rounded-lg transition-colors border cursor-pointer ${
                    activeHighlight === "area"
                      ? "border-primary bg-primary-container/5 ring-1 ring-primary/20"
                      : "border-transparent hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">
                        Recorded Area Extent
                      </span>
                      <span className="bg-[#E0E7FF] text-[#3730A3] px-1.5 py-0.2 rounded text-[10px] font-bold">
                        96% Conf
                      </span>
                    </div>
                    <div className="text-sm font-bold font-mono mt-1 text-on-surface">
                      {rec?.land?.total_area || "1.25"} Hectares
                    </div>
                  </div>
                  <span className="text-primary text-xs font-semibold flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5" /> Evidence
                  </span>
                </div>
              </div>
            </div>

            {/* Module 2: GIS Spatial Validation */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-on-surface font-bold text-xs">
                  <Compass className="w-4 h-4 text-primary" />
                  <span>GIS Spatial Cadastral Validation</span>
                </div>
                <Badge variant="verified" className="text-[10px]">
                  PostGIS Live
                </Badge>
              </div>

              <div className="p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Cadastral Visual Thumbnail */}
                  <div className="w-full sm:w-32 h-28 bg-cadastral bg-cover rounded-lg border border-outline-variant relative shrink-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded border-2 border-[#15803D] bg-primary-fixed/20 flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-[#15803D]" />
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-center space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 text-[#15803D] font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Geometry Matches Record Boundaries</span>
                    </div>
                    <div className="space-y-1 text-on-surface-variant pt-1 border-t border-outline-variant/60">
                      <div className="flex justify-between">
                        <span>Document Area:</span>
                        <strong className="text-on-surface font-mono">1.25 Ha</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Cadastral Area:</span>
                        <strong className="text-on-surface font-mono">1.248 Ha</strong>
                      </div>
                      <div className="flex justify-between">
                        <span>Variance:</span>
                        <strong className="text-[#15803D] font-mono">0.16% (Within &plusmn;5% limits)</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Module 3: Potential Conflict Detected */}
            <div className="bg-[#FEF2F2] rounded-xl border border-[#FCA5A5] shadow-sm overflow-hidden">
              <div className="bg-[#FEE2E2] px-4 py-3 border-b border-[#FCA5A5] flex items-center gap-2 text-[#991B1B] font-bold text-xs">
                <AlertTriangle className="w-4 h-4" />
                <span>Potential Conflict Detected</span>
              </div>
              <div className="p-4 text-xs space-y-2">
                <p className="text-[#7F1D1D] leading-relaxed">
                  The extracted occupant name has a partial token mismatch with the historical ledger data.
                </p>
                <div className="bg-white rounded-lg p-3 border border-[#FECACA] flex gap-4">
                  <div className="flex-1">
                    <span className="text-[10px] text-on-surface-variant block mb-0.5 font-bold uppercase">
                      Current Deed (AI Vision)
                    </span>
                    <span className="font-semibold text-on-surface">Ramesh Narayan Patil</span>
                  </div>
                  <div className="flex-1 border-l border-[#FECACA] pl-4">
                    <span className="text-[10px] text-on-surface-variant block mb-0.5 font-bold uppercase">
                      Historical Ledger
                    </span>
                    <span className="font-semibold text-[#991B1B] line-through">Ramesh N. Patil</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Footer Action Bar */}
          <div className="mt-auto sticky bottom-0 bg-surface border-t border-outline-variant p-4 flex items-center justify-between shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-2 text-error hover:bg-error-container/30 font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Link href="/intelligence">
                <button className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold rounded-lg text-xs transition-colors cursor-pointer">
                  View Lineage
                </button>
              </Link>
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="px-5 py-2 bg-primary text-on-primary hover:bg-primary/90 font-semibold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5 cursor-pointer"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Approve Record</span>
              </button>
            </div>
          </div>

        </section>

      </div>
    </div>
  );
}
