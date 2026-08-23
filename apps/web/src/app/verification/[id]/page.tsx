"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Download,
  Edit3,
  ExternalLink,
  Eye,
  FileCheck2,
  FileText,
  GitFork,
  HelpCircle,
  History,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  Lock,
  MapPin,
  Maximize2,
  Plus,
  RefreshCw,
  RotateCw,
  Save,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trash2,
  UserCheck,
  Users,
  X,
  XCircle,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";
import { useAuth } from "@/context/AuthContext";

interface VerificationPageProps {
  params: Promise<{ id: string }>;
}

export default function VerificationWorkspacePage({ params }: VerificationPageProps) {
  const resolvedParams = use(params);
  const recordId = resolvedParams.id;
  const searchParams = useSearchParams();
  const autoEdit = searchParams ? searchParams.get("edit") === "true" : false;
  const { user } = useAuth();

  const [detail, setDetail] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(autoEdit);
  const [viewMode, setViewMode] = useState<"photo" | "extract" | "split">("photo");
  const [imageError, setImageError] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [officerNotes, setOfficerNotes] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Editable Form State
  const [formData, setFormData] = useState({
    state: "",
    district: "",
    taluk: "",
    village: "",
    sub_registrar_office: "",
    survey_number: "",
    hissa_number: "",
    gat_number: "",
    khata_number: "",
    total_area: 0,
    cultivable_area: 0,
    uncultivable_area: 0,
    area_unit: "hectares",
    land_tenure: "",
    assessment_tax: 0,
    owners: [] as any[],
    mutations: [] as any[],
    encumbrances: [] as any[],
  });

  const fetchRecordDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/verification/${recordId}`);
      if (res.ok) {
        const data = await res.json();
        setDetail(data);
        syncFormData(data.record);
      } else {
        loadMockDetail();
      }
    } catch {
      loadMockDetail();
    } finally {
      setLoading(false);
    }
  };

  const syncFormData = (rec: any) => {
    if (!rec) return;
    setFormData({
      state: rec.administrative?.state || "",
      district: rec.administrative?.district || "",
      taluk: rec.administrative?.taluk || "",
      village: rec.administrative?.village || "",
      sub_registrar_office: rec.administrative?.sub_registrar_office || "",
      survey_number: rec.land?.survey_number || "",
      hissa_number: rec.land?.hissa_number || "",
      gat_number: rec.land?.gat_number || "",
      khata_number: rec.land?.khata_number || "",
      total_area: rec.land?.total_area || 0,
      cultivable_area: rec.land?.cultivable_area || 0,
      uncultivable_area: rec.land?.uncultivable_area || 0,
      area_unit: rec.land?.area_unit || "hectares",
      land_tenure: rec.land?.land_tenure || "",
      assessment_tax: rec.land?.assessment_tax || 0,
      owners: rec.owners ? JSON.parse(JSON.stringify(rec.owners)) : [],
      mutations: rec.mutations ? JSON.parse(JSON.stringify(rec.mutations)) : [],
      encumbrances: rec.encumbrances ? JSON.parse(JSON.stringify(rec.encumbrances)) : [],
    });
  };

  const loadMockDetail = () => {
    const mock = {
      record: {
        id: Number(recordId),
        document_id: 1,
        administrative: {
          state: "Maharashtra",
          district: "Pune",
          taluk: "Haveli",
          village: "Wagholi",
          sub_registrar_office: "Haveli Sub-District IV",
        },
        land: {
          survey_number: "142",
          hissa_number: "2A",
          gat_number: "142/2A",
          khata_number: "891",
          total_area: 1.45,
          cultivable_area: 1.30,
          uncultivable_area: 0.15,
          area_unit: "hectares",
          land_tenure: "Occupant Class 1 (भोगवटादार १)",
          assessment_tax: 45.5,
        },
        owners: [
          {
            name_english: "Ramesh Shankarrao Patil",
            name_indic: "रमेश शंकरराव पाटील",
            gender: "Male",
            share_fraction: "1/2",
            share_percentage: 50.0,
            mutation_entry_number: "M-4512",
            aadhaar_hash_matched: true,
          },
          {
            name_english: "Suresh Shankarrao Patil",
            name_indic: "सुरेश शंकरराव पाटील",
            gender: "Male",
            share_fraction: "1/2",
            share_percentage: 50.0,
            mutation_entry_number: "M-4512",
            aadhaar_hash_matched: true,
          },
        ],
        mutations: [
          {
            mutation_number: "M-4512",
            date: "2018-04-12",
            nature_of_mutation: "Inheritance / Succession (वारस नोंद)",
            parties_involved: "Shankar Patil (Deceased) → Ramesh Patil & Suresh Patil",
            status: "CERTIFIED",
          },
        ],
        encumbrances: [
          {
            institution_name: "Maharashtra Gramin Bank",
            amount: 150000,
            date_of_encumbrance: "2020-08-15",
            status: "ACTIVE_HYPOTHECATION",
            noc_attached: false,
          },
        ],
        evidence: [
          {
            id: 1,
            field_name: "survey_number",
            extracted_value: "142/2A",
            confidence_score: 0.98,
            source_text: "भूमापन क्रमांक / गट क्र. १४२/२अ",
          },
          {
            id: 2,
            field_name: "owner_names",
            extracted_value: "Ramesh Shankarrao Patil",
            confidence_score: 0.94,
            source_text: "खातेदार: १) रमेश शंकरराव पाटील २) सुरेश शंकरराव पाटील",
          },
          {
            id: 3,
            field_name: "total_area",
            extracted_value: "1.45 Ha",
            confidence_score: 0.96,
            source_text: "एकूण क्षेत्र: १.४५ हेक्टर आर",
          },
        ],
        validation_results: [
          {
            id: 1,
            issue_type: "EXTENT_SANITY_CHECK",
            severity: "MEDIUM",
            field_name: "total_area",
            description: "Cultivable area (1.30) + Pot Kharaba (0.15) matches total extent (1.45 Ha).",
            status: "VERIFIED",
          },
        ],
        overall_confidence_score: 0.96,
        validation_status: "FLAGGED_FOR_REVIEW",
      },
      document_file_url: `/api/documents/1/file`,
      mime_type: "image/jpeg",
      original_name: "satbara_wagholi_142.pdf",
      audit_history: [],
    };
    setDetail(mock);
    syncFormData(mock.record);
  };

  useEffect(() => {
    fetchRecordDetails();
  }, [recordId]);

  // Owners list management
  const handleAddOwner = () => {
    setIsEditing(true);
    setFormData((prev) => ({
      ...prev,
      owners: [
        ...prev.owners,
        {
          name_english: "",
          name_indic: "",
          gender: "Male",
          share_fraction: "1/1",
          share_percentage: 100.0,
          mutation_entry_number: "",
          aadhaar_hash_matched: false,
        },
      ],
    }));
  };

  const handleUpdateOwner = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.owners];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, owners: updated };
    });
  };

  const handleRemoveOwner = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      owners: prev.owners.filter((_, i) => i !== index),
    }));
  };

  // Mutations list management
  const handleAddMutation = () => {
    setIsEditing(true);
    setFormData((prev) => ({
      ...prev,
      mutations: [
        ...prev.mutations,
        {
          mutation_number: `M-${Math.floor(1000 + Math.random() * 9000)}`,
          date: new Date().toISOString().split("T")[0],
          nature_of_mutation: "Sale Deed Conveyance (नोंदणीकृत खरेदीखत)",
          parties_involved: "",
          status: "CERTIFIED",
        },
      ],
    }));
  };

  const handleUpdateMutation = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.mutations];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, mutations: updated };
    });
  };

  const handleRemoveMutation = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      mutations: prev.mutations.filter((_, i) => i !== index),
    }));
  };

  // Encumbrances list management
  const handleAddEncumbrance = () => {
    setIsEditing(true);
    setFormData((prev) => ({
      ...prev,
      encumbrances: [
        ...prev.encumbrances,
        {
          institution_name: "",
          amount: 0,
          date_of_encumbrance: new Date().toISOString().split("T")[0],
          status: "ACTIVE",
          noc_attached: false,
        },
      ],
    }));
  };

  const handleUpdateEncumbrance = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const updated = [...prev.encumbrances];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, encumbrances: updated };
    });
  };

  const handleRemoveEncumbrance = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      encumbrances: prev.encumbrances.filter((_, i) => i !== index),
    }));
  };

  // Save Corrections
  const handleSaveCorrections = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const payload = {
        corrected_fields: {
          state: formData.state,
          district: formData.district,
          taluk: formData.taluk,
          village: formData.village,
          sub_registrar_office: formData.sub_registrar_office,
          survey_number: formData.survey_number,
          hissa_number: formData.hissa_number,
          gat_number: formData.gat_number,
          khata_number: formData.khata_number,
          total_area: Number(formData.total_area),
          cultivable_area: Number(formData.cultivable_area),
          uncultivable_area: Number(formData.uncultivable_area),
          area_unit: formData.area_unit,
          land_tenure: formData.land_tenure,
          assessment_tax: Number(formData.assessment_tax),
          owners_data: formData.owners,
          mutations_data: formData.mutations,
          encumbrances_data: formData.encumbrances,
        },
        notes: officerNotes || "Officer corrected missing entities and verified record.",
      };

      const res = await fetch(`http://localhost:8000/api/verification/${recordId}/correct`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("Failed to persist corrections.");
      }

      setIsEditing(false);
      setNotification({
        type: "success",
        message: "Record successfully updated with officer corrections and verified.",
      });
      fetchRecordDetails();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Failed to save corrections.",
      });
    } finally {
      setActionLoading(false);
    }
  };

  // Approve Record
  const handleApprove = async () => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/api/verification/${recordId}/approve`, {
        method: "POST",
        headers,
        body: JSON.stringify({ notes: officerNotes || "Officer approved record without manual edits." }),
      });

      if (!res.ok) throw new Error("Approval failed.");

      setNotification({ type: "success", message: "Record successfully approved and verified in registry." });
      fetchRecordDetails();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Approval action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  // Reject Record
  const handleReject = async () => {
    if (!rejectReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }
    setActionLoading(true);
    try {
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`http://localhost:8000/api/verification/${recordId}/reject`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          reason: rejectReason,
          notes: officerNotes || "Statutory defect identified by revenue officer.",
        }),
      });

      if (!res.ok) throw new Error("Rejection action failed.");

      setShowRejectModal(false);
      setNotification({ type: "success", message: "Record has been marked as REJECTED." });
      fetchRecordDetails();
    } catch (err: any) {
      setNotification({ type: "error", message: err.message || "Rejection action failed." });
    } finally {
      setActionLoading(false);
    }
  };

  const rec = detail?.record;
  const docId = rec?.document_id || detail?.record?.document_id || recordId;
  const fileUrl = detail?.document_file_url
    ? `http://localhost:8000${detail.document_file_url}`
    : `http://localhost:8000/api/documents/${docId}/file`;
  const isImageDoc =
    detail?.mime_type?.startsWith("image/") ||
    detail?.original_name?.match(/\.(jpe?g|png|webp|gif|bmp|tiff)$/i) ||
    true;

  const validationResults = rec?.validation_results || [];
  const missingItems = [];
  if (formData.owners.length === 0) missingItems.push("No Registered Khatadars / Co-Sharers");
  if (!formData.sub_registrar_office) missingItems.push("Sub-Registrar Office Jurisdiction");
  if (!formData.khata_number) missingItems.push("Khata / Ledger Account Number");
  if (formData.total_area <= 0) missingItems.push("Total Extent Area (Zero Extent)");

  if (user?.role === "OWNER") {
    return (
      <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
        <Topbar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
          <div className="max-w-md w-full bg-surface p-6 sm:p-8 rounded-2xl border border-outline-variant shadow-lg text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-on-surface">Officer Verification Restricted</h2>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Official document verification and mutation editing are reserved for authorized Revenue Officers.
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
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px] overflow-hidden">
      {/* Top Navigation */}
      <Topbar />

      {/* Notification Banner */}
      {notification && (
        <div
          className={`px-6 py-2.5 text-xs flex items-center justify-between z-20 font-semibold ${
            notification.type === "success"
              ? "bg-[#DCFCE7] border-b border-[#86EFAC] text-[#15803D]"
              : "bg-error-container border-b border-error/20 text-on-error-container"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="p-0.5 hover:opacity-75">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Split-Pane Workbench Canvas */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden split-pane bg-surface-container-lowest">
        
        {/* ========================================================================= */}
        {/* LEFT PANE: Scanned Original Document Viewer (PHOTO & EXTRACT MODES)       */}
        {/* ========================================================================= */}
        <section className="w-full lg:w-1/2 flex flex-col border-r border-outline-variant bg-surface-container-low relative">
          
          {/* Viewer Toolbar */}
          <div className="h-12 bg-surface border-b border-outline-variant flex items-center justify-between px-3 sm:px-4 shrink-0 gap-2">
            
            {/* View Mode Toggle: Photo vs Extract vs Split */}
            <div className="flex items-center gap-1 bg-surface-container-low p-0.5 rounded-lg border border-outline-variant text-xs">
              <button
                onClick={() => setViewMode("photo")}
                className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === "photo"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
                title="View Raw Scanned Image Photo"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Original Photo</span>
              </button>

              <button
                onClick={() => setViewMode("extract")}
                className={`px-2.5 py-1 rounded font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                  viewMode === "extract"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container"
                }`}
                title="View Digital Form Extract"
              >
                <FileText className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Digital Form</span>
              </button>
            </div>

            {/* Viewer Controls: Zoom / Rotate / Fullscreen */}
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-outline-variant">
              <button
                onClick={() => setZoom((z) => Math.max(40, z - 15))}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-[11px] font-mono text-on-surface-variant w-8 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom((z) => Math.min(250, z + 15))}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <div className="w-px h-4 bg-outline-variant mx-0.5" />
              <button
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Rotate 90°"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setShowPhotoModal(true)}
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Full Screen High-Res Inspector"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded cursor-pointer"
                title="Open Raw File in New Window"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Document Canvas Area */}
          <div className="flex-1 relative overflow-auto custom-scrollbar p-4 sm:p-6 flex justify-center items-start bg-surface-container-lowest">
            
            {/* MODE 1: ORIGINAL PHOTO / SCANNED IMAGE VIEWER */}
            {viewMode === "photo" && (
              <div className="flex flex-col items-center justify-center w-full min-h-full space-y-3">
                <div
                  style={{
                    transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                    transformOrigin: "top center",
                    transition: "transform 0.15s ease",
                  }}
                  className="relative bg-white shadow-2xl border border-outline-variant rounded-lg p-2 max-w-full inline-block"
                >
                  {!imageError ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={fileUrl}
                      alt={detail?.original_name || "Original Scanned Revenue Deed"}
                      onError={() => setImageError(true)}
                      className="max-w-full h-auto object-contain rounded max-h-[800px]"
                    />
                  ) : (
                    <div className="p-8 text-center space-y-3 min-w-[340px]">
                      <ImageIcon className="w-12 h-12 mx-auto text-slate-400" />
                      <h4 className="font-bold text-sm text-slate-800">Scanned Document Photo</h4>
                      <p className="text-xs text-slate-500">{detail?.original_name || "Document Preview"}</p>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs bg-primary text-on-primary px-3 py-1.5 rounded-lg font-semibold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Open Raw Document</span>
                      </a>
                    </div>
                  )}

                  {/* Stamp / Badge Overlay */}
                  <div className="absolute top-4 left-4 bg-black/70 backdrop-blur-sm text-white px-2.5 py-1 rounded text-[10px] font-mono flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Original Source: {detail?.original_name || "Revenue Deed Scan"}</span>
                  </div>
                </div>

                {/* Sub-label */}
                <div className="text-[11px] text-on-surface-variant font-mono bg-surface/80 backdrop-blur px-3 py-1 rounded-full border border-outline-variant">
                  Viewing Original High-Res Deed • Use Zoom/Rotate to inspect seals &amp; signatures
                </div>
              </div>
            )}

            {/* MODE 2: DIGITAL REVENUE EXTRACT FORM */}
            {viewMode === "extract" && (
              <div
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  transformOrigin: "top center",
                  transition: "transform 0.15s ease",
                }}
                className="relative w-full max-w-xl bg-white shadow-xl border border-outline-variant p-8 min-h-[720px] text-slate-900 font-sans rounded-sm"
              >
                {/* Official Revenue Seal & Header */}
                <div className="text-center mb-6 border-b-2 border-slate-900 pb-4">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-slate-700">
                    GOVERNMENT OF {formData.state?.toUpperCase() || "MAHARASHTRA"} • महसूल व भूमी अभिलेख विभाग
                  </div>
                  <h3 className="text-lg font-extrabold text-[#15803D] mt-1">
                    VILLAGE FORM VII / XII (गाव नमुना सात / बारा)
                  </h3>
                  <div className="text-[11px] text-slate-600 font-serif">
                    अधिकार अभिलेख पत्रक • Record of Rights & Cadastral Register
                  </div>
                </div>

                {/* Administrative Revenue Location Grid */}
                <div className="grid grid-cols-2 gap-4 text-xs mb-6 bg-slate-50 p-3 rounded border border-slate-200">
                  <div className="space-y-1">
                    <p><span className="font-bold text-slate-600">गावाचे नाव (Village):</span> <strong className="text-slate-900">{formData.village || "—"}</strong></p>
                    <p><span className="font-bold text-slate-600">तालुका (Taluka):</span> <strong className="text-slate-900">{formData.taluk || "—"}</strong></p>
                    <p><span className="font-bold text-slate-600">जिल्हा (District):</span> <strong className="text-slate-900">{formData.district || "—"}</strong></p>
                    <p><span className="font-bold text-slate-600">दुय्यम निबंधक (SRO):</span> <span className="text-slate-700">{formData.sub_registrar_office || "Haveli"}</span></p>
                  </div>

                  <div className="text-right space-y-1">
                    <div className="relative inline-block p-1 bg-emerald-50 rounded border border-emerald-300">
                      <span className="font-bold text-slate-600 text-xs">गट क्र. / Survey No:</span>
                      <span className="font-mono text-base font-extrabold ml-2 text-[#15803D]">{formData.survey_number || "—"}</span>
                      {formData.hissa_number && (
                        <span className="font-mono text-xs text-slate-700 ml-1">/ {formData.hissa_number}</span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-600">खाते क्रमांक (Khata): <strong className="font-mono">{formData.khata_number || "—"}</strong></p>
                    <p className="text-[11px] text-slate-600">भोगवटादार वर्ग: <span className="font-semibold text-slate-800">{formData.land_tenure || "वर्ग १"}</span></p>
                  </div>
                </div>

                {/* Land Extent Table */}
                <div className="mb-4 border border-slate-300 rounded overflow-hidden">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                      <tr>
                        <th className="p-2 border-r border-slate-300">एकूण क्षेत्र (Total Extent)</th>
                        <th className="p-2 border-r border-slate-300">लागवडीयोग्य (Cultivable)</th>
                        <th className="p-2 border-r border-slate-300">पोट खराब (Uncultivable)</th>
                        <th className="p-2 text-right">आकारणी (Tax INR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="bg-white">
                        <td className="p-2 border-r border-slate-300 font-mono font-bold text-[#15803D]">
                          {formData.total_area} {formData.area_unit}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono text-slate-800">
                          {formData.cultivable_area} {formData.area_unit}
                        </td>
                        <td className="p-2 border-r border-slate-300 font-mono text-slate-600">
                          {formData.uncultivable_area} {formData.area_unit}
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-slate-900">
                          ₹{formData.assessment_tax}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Khatadars / Land Owners Table */}
                <div className="mb-4 border border-slate-300 rounded overflow-hidden">
                  <div className="bg-slate-100 p-2 font-bold text-xs text-slate-800 border-b border-slate-300 flex justify-between items-center">
                    <span>खातेदारांचे नाव व हिस्सा (Registered Khatadars & Share)</span>
                    <span className="text-[10px] text-slate-500 font-normal">{formData.owners.length} Co-Sharers</span>
                  </div>
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-700 text-[11px] border-b border-slate-200">
                      <tr>
                        <th className="p-2 border-r border-slate-200">Owner Name (English / Indic)</th>
                        <th className="p-2 border-r border-slate-200">Mutation Ref</th>
                        <th className="p-2 text-right">Share %</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {formData.owners.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-3 text-center text-slate-400 italic text-[11px]">
                            No owners registered. Click &ldquo;Edit Record&rdquo; to add co-sharers.
                          </td>
                        </tr>
                      ) : (
                        formData.owners.map((o: any, idx: number) => (
                          <tr key={idx} className="hover:bg-slate-50">
                            <td className="p-2 border-r border-slate-200">
                              <span className="font-bold text-slate-900 block">{o.name_english || "—"}</span>
                              {o.name_indic && <span className="text-slate-500 text-[11px] block font-serif">{o.name_indic}</span>}
                            </td>
                            <td className="p-2 border-r border-slate-200 font-mono text-slate-600 text-[11px]">
                              {o.mutation_entry_number || "Direct Entry"}
                            </td>
                            <td className="p-2 text-right font-mono font-bold text-[#15803D]">
                              {o.share_percentage || 100}% ({o.share_fraction || "1/1"})
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Digital Authentication Watermark */}
                <div className="mt-8 pt-4 border-t border-slate-300 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                  <div>Digital Ingestion Hash: SHA256:8f4c2e...</div>
                  <div className="font-bold uppercase tracking-wider text-emerald-800 border border-emerald-600 px-2 py-0.5 rounded bg-emerald-50">
                    Land AI Verified Ingestion
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ========================================================================= */}
        {/* RIGHT PANE: Verification Inspector & Full Interactive Edit Workbench       */}
        {/* ========================================================================= */}
        <section className="w-full lg:w-1/2 flex flex-col bg-surface-container-lowest overflow-y-auto custom-scrollbar">
          
          {/* Panel Header */}
          <div className="sticky top-0 bg-surface/95 backdrop-blur-md z-10 border-b border-outline-variant p-4 flex items-center justify-between shadow-sm">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-on-surface">Officer Verification Workbench</h2>
                <Badge
                  variant={
                    rec?.validation_status?.includes("VERIFIED")
                      ? "verified"
                      : rec?.validation_status?.includes("REJECTED")
                      ? "destructive"
                      : "warning"
                  }
                  className="text-[10px]"
                >
                  {rec?.validation_status || "PENDING"}
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-0.5">
                Review OCR extractions, inspect original scans, edit fields, add co-sharers or mutations, and submit verification.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isEditing
                    ? "bg-[#EA580C] text-white shadow-sm"
                    : "bg-surface-container-high text-primary hover:bg-surface-container-highest border border-outline-variant"
                }`}
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? "Exit Edit Mode" : "Edit / Add Missing Info"}</span>
              </button>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-6 flex-1">
            
            {/* CONFLICTS & DISCREPANCIES PROMINENT CARD */}
            {validationResults.length > 0 && (
              <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#9A3412] font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-[#EA580C]" />
                    <span>Active Discrepancies &amp; Validation Conflicts ({validationResults.length})</span>
                  </div>
                  {!isEditing && (
                    <Button
                      size="sm"
                      onClick={() => setIsEditing(true)}
                      className="bg-[#EA580C] hover:bg-[#C2410C] text-white text-[11px] h-6 px-2 font-bold"
                    >
                      Resolve Conflicts
                    </Button>
                  )}
                </div>

                <div className="space-y-2">
                  {validationResults.map((v: any, idx: number) => (
                    <div key={idx} className="bg-white/80 border border-[#FED7AA] p-2.5 rounded-lg text-xs flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-[#9A3412] font-mono text-[11px] uppercase">
                            {v.issue_type}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                            v.severity === "CRITICAL" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-800"
                          }`}>
                            {v.severity}
                          </span>
                        </div>
                        <p className="text-slate-700 text-[11px] mt-0.5">{v.description}</p>
                      </div>
                      <Badge variant="outline" className="text-[10px] shrink-0 text-slate-600">
                        {v.field_name || "Record"}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* MISSING DETAILS NOTIFICATION CARD */}
            {missingItems.length > 0 && (
              <div className="bg-[#FEF3C7] border border-[#FCD34D] rounded-xl p-4 space-y-2.5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[#B45309] font-bold text-xs">
                    <HelpCircle className="w-4 h-4 text-[#D97706]" />
                    <span>Missing Record Attributes Detected ({missingItems.length})</span>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                      if (formData.owners.length === 0) handleAddOwner();
                    }}
                    className="bg-[#D97706] hover:bg-[#B45309] text-white text-[11px] h-6 px-2 font-bold gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Fill Missing Data</span>
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {missingItems.map((m, idx) => (
                    <span key={idx} className="bg-white/80 border border-[#FDE68A] text-[#92400E] px-2.5 py-1 rounded text-[11px] font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-[#D97706]" />
                      <span>{m}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* IMAGE QUALITY ASSESSMENT & PREPROCESSING */}
            {rec?.raw_extracted_payload?.quality_assessment && (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700 font-bold text-xs">
                    <ImageIcon className="w-4 h-4 text-slate-500" />
                    <span>Image Quality &amp; CV Preprocessing</span>
                  </div>
                  <Badge className={`${
                    rec.raw_extracted_payload.quality_assessment.quality === "GOOD" ? "bg-emerald-100 text-emerald-800" :
                    rec.raw_extracted_payload.quality_assessment.quality === "FAIR" ? "bg-blue-100 text-blue-800" :
                    rec.raw_extracted_payload.quality_assessment.quality === "POOR" ? "bg-amber-100 text-amber-800" :
                    "bg-rose-100 text-rose-800"
                  }`}>
                    {rec.raw_extracted_payload.quality_assessment.quality}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600">
                  <div>Blur Score: <span className="font-semibold text-slate-800">{rec.raw_extracted_payload.quality_assessment.blur_score}</span></div>
                  <div>Contrast Score: <span className="font-semibold text-slate-800">{rec.raw_extracted_payload.quality_assessment.contrast_score}</span></div>
                  <div>Brightness: <span className="font-semibold text-slate-800">{rec.raw_extracted_payload.quality_assessment.brightness_score}</span></div>
                  <div>Noise Level: <span className="font-semibold text-slate-800">{rec.raw_extracted_payload.quality_assessment.noise_level}</span></div>
                  <div>Skew Angle: <span className="font-semibold text-slate-800">{rec.raw_extracted_payload.quality_assessment.skew_angle}°</span></div>
                  <div>Resolution: <span className="font-semibold text-slate-800">{rec.raw_extracted_payload.quality_assessment.width}x{rec.raw_extracted_payload.quality_assessment.height}</span></div>
                </div>
                {rec.raw_extracted_payload.applied_filters?.length > 0 && (
                  <div className="pt-2 border-t border-slate-100">
                    <div className="text-[10px] text-slate-500 font-semibold mb-1">Applied Enhancement Filters:</div>
                    <div className="flex flex-wrap gap-1">
                      {rec.raw_extracted_payload.applied_filters.map((f: string, idx: number) => (
                        <span key={idx} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-mono">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* OCR CONSENSUS SUMMARY */}
            {rec?.raw_extracted_payload?._consensus && (
              <div className="bg-sky-50/50 border border-sky-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sky-800 font-bold text-xs">
                    <Layers className="w-4 h-4 text-sky-600" />
                    <span>OCR Consensus (Sarvam + Mistral)</span>
                  </div>
                  <div className="text-[11px] font-bold text-sky-900 bg-sky-100 px-2 py-0.5 rounded">
                    Agreement: {Math.round(rec.raw_extracted_payload._consensus.overall_agreement_score * 100)}%
                  </div>
                </div>
                <div className="text-[11px] text-slate-600">
                  {rec.raw_extracted_payload._consensus.disagreed_count > 0 ? (
                    <div className="space-y-1.5">
                      <div className="text-amber-800 font-semibold">Detected Model Disagreements ({rec.raw_extracted_payload._consensus.disagreed_count}):</div>
                      <div className="space-y-1">
                        {Object.values(rec.raw_extracted_payload._consensus.conflicts).map((conf: any, idx: number) => (
                          <div key={idx} className="bg-white/80 p-2 border border-amber-200 rounded text-[10px]">
                            <div className="font-bold text-amber-900 capitalize">{conf.reason.split("'")[1]}</div>
                            <div className="grid grid-cols-2 gap-1 text-slate-500 mt-1">
                              <div>Sarvam: <span className="font-semibold text-slate-800">{String(conf.values.sarvam || "—")}</span></div>
                              <div>Mistral: <span className="font-semibold text-slate-800">{String(conf.values.mistral || "—")}</span></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-emerald-800 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>All models are in perfect OCR agreement.</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AI GROUNDED REASONING REPORT */}
            {rec?.raw_extracted_payload?.reasoning_report && (
              <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-3 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
                    <Bot className="w-4 h-4 text-indigo-600" />
                    <span>Explainable Reasoning Report</span>
                  </div>
                  <Badge className={`${
                    rec.raw_extracted_payload.reasoning_report.severity === "CRITICAL" ? "bg-red-100 text-red-800" :
                    rec.raw_extracted_payload.reasoning_report.severity === "HIGH" ? "bg-amber-100 text-amber-800" :
                    rec.raw_extracted_payload.reasoning_report.severity === "MEDIUM" ? "bg-yellow-100 text-yellow-800" :
                    "bg-slate-100 text-slate-800"
                  }`}>
                    {rec.raw_extracted_payload.reasoning_report.severity} RISK
                  </Badge>
                </div>
                <div className="text-xs space-y-2 text-slate-700">
                  <div className="font-bold text-indigo-950 text-[12px]">{rec.raw_extracted_payload.reasoning_report.finding}</div>
                  <div>
                    <span className="font-semibold text-indigo-950 block text-[10px] uppercase tracking-wider text-slate-500">Grounded Evidence:</span>
                    <ul className="list-disc pl-4 space-y-0.5 mt-0.5 text-[11px]">
                      {rec.raw_extracted_payload.reasoning_report.evidence?.map((ev: string, idx: number) => (
                        <li key={idx}>{ev}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="bg-white/80 p-2.5 border border-indigo-100 rounded-lg">
                    <span className="font-bold text-indigo-950 text-[10px] block uppercase tracking-wider text-slate-500">Detailed Rationale:</span>
                    <p className="text-[11px] mt-0.5 text-slate-600 leading-relaxed">{rec.raw_extracted_payload.reasoning_report.reason}</p>
                  </div>
                  <div className="bg-amber-50/50 p-2.5 border border-amber-200 rounded-lg">
                    <span className="font-bold text-amber-800 text-[10px] block uppercase tracking-wider text-slate-600">Officer Verification Guidance:</span>
                    <p className="text-[11px] mt-0.5 text-amber-900 font-semibold">{rec.raw_extracted_payload.reasoning_report.action}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Editing Active Notice Banner */}
            {isEditing && (
              <div className="bg-[#FFF7ED] border border-[#FDBA74] rounded-xl p-4 text-xs space-y-1 shadow-sm">
                <div className="flex items-center gap-2 font-bold text-[#9A3412]">
                  <Edit3 className="w-4 h-4 text-[#EA580C]" />
                  <span>Government Officer Edit Mode Active</span>
                </div>
                <p className="text-[#C2410C] text-[11px] leading-relaxed">
                  You are editing authoritative land entities and co-sharer registers. Any saved corrections will update the active database, resolve flagged validation issues, and be logged in the tamper-evident audit ledger.
                </p>
              </div>
            )}

            {/* SECTION 1: Administrative Jurisdiction */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <MapPin className="w-4 h-4" />
                  <span>1. Administrative Revenue Hierarchy</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">Location Data</span>
              </div>

              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
                {/* State */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">State</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-on-surface text-sm">{formData.state || "—"}</span>
                  )}
                </div>

                {/* District */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">District</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-on-surface text-sm">{formData.district || "—"}</span>
                  )}
                </div>

                {/* Taluk */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Taluk / Tehsil</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.taluk}
                      onChange={(e) => setFormData({ ...formData, taluk: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-on-surface text-sm">{formData.taluk || "—"}</span>
                  )}
                </div>

                {/* Village */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Village</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-bold text-on-surface text-sm">{formData.village || "—"}</span>
                  )}
                </div>

                {/* SRO */}
                <div className="sm:col-span-2">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Sub-Registrar Office (SRO)</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.sub_registrar_office}
                      onChange={(e) => setFormData({ ...formData, sub_registrar_office: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-semibold text-on-surface text-xs">{formData.sub_registrar_office || "—"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 2: Land Extent & Cadastral Identifiers */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Compass className="w-4 h-4" />
                  <span>2. Cadastral Survey Identifiers &amp; Area Extents</span>
                </div>
                <span className="text-[10px] text-on-surface-variant font-mono">Land Geometry</span>
              </div>

              <div className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
                {/* Survey No */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Survey / Gat No</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.survey_number}
                      onChange={(e) => setFormData({ ...formData, survey_number: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono font-bold text-primary text-base">{formData.survey_number || "—"}</span>
                  )}
                </div>

                {/* Hissa No */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Hissa / Sub-Division</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.hissa_number}
                      onChange={(e) => setFormData({ ...formData, hissa_number: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono text-on-surface text-sm">{formData.hissa_number || "—"}</span>
                  )}
                </div>

                {/* Khata No */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Khata / Ledger No</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.khata_number}
                      onChange={(e) => setFormData({ ...formData, khata_number: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono text-on-surface text-sm">{formData.khata_number || "—"}</span>
                  )}
                </div>

                {/* Area Unit */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Area Unit</label>
                  {isEditing ? (
                    <select
                      value={formData.area_unit}
                      onChange={(e) => setFormData({ ...formData, area_unit: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
                    >
                      <option value="hectares">Hectares</option>
                      <option value="acres">Acres</option>
                      <option value="gunthas">Gunthas</option>
                      <option value="sq_yards">Sq Yards</option>
                    </select>
                  ) : (
                    <span className="font-semibold text-on-surface text-sm capitalize">{formData.area_unit}</span>
                  )}
                </div>

                {/* Total Area */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Total Area</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.total_area}
                      onChange={(e) => setFormData({ ...formData, total_area: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono font-bold focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono font-bold text-on-surface text-base">{formData.total_area} {formData.area_unit}</span>
                  )}
                </div>

                {/* Cultivable Area */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Cultivable Area</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.cultivable_area}
                      onChange={(e) => setFormData({ ...formData, cultivable_area: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono text-on-surface text-sm">{formData.cultivable_area}</span>
                  )}
                </div>

                {/* Pot Kharaba */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Pot Kharaba (Uncultivable)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.01"
                      value={formData.uncultivable_area}
                      onChange={(e) => setFormData({ ...formData, uncultivable_area: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono text-on-surface text-sm">{formData.uncultivable_area}</span>
                  )}
                </div>

                {/* Assessment Tax */}
                <div>
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Tax Assessment (₹)</label>
                  {isEditing ? (
                    <input
                      type="number"
                      step="0.5"
                      value={formData.assessment_tax}
                      onChange={(e) => setFormData({ ...formData, assessment_tax: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-mono font-bold text-on-surface text-sm">₹{formData.assessment_tax}</span>
                  )}
                </div>

                {/* Land Tenure */}
                <div className="col-span-2 sm:col-span-4">
                  <label className="text-[10px] uppercase font-bold text-on-surface-variant block mb-1">Land Tenure / Class</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.land_tenure}
                      onChange={(e) => setFormData({ ...formData, land_tenure: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2 text-xs text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                    />
                  ) : (
                    <span className="font-semibold text-on-surface text-xs">{formData.land_tenure || "—"}</span>
                  )}
                </div>
              </div>
            </div>

            {/* SECTION 3: Registered Khatadars & Land Owners */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Users className="w-4 h-4" />
                  <span>3. Registered Khatadars &amp; Co-Sharers ({formData.owners.length})</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddOwner}
                  className="bg-primary text-on-primary text-[11px] h-7 px-2.5 gap-1 font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Missing Owner</span>
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {formData.owners.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-outline-variant rounded-lg p-4 text-xs text-on-surface-variant space-y-2">
                    <p>No co-sharers listed for this title.</p>
                    <Button size="sm" onClick={handleAddOwner} className="text-xs bg-[#EA580C] text-white">
                      + Click to Add First Owner
                    </Button>
                  </div>
                ) : (
                  formData.owners.map((owner: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-lg border border-outline-variant bg-surface-container-low/50 space-y-3"
                    >
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex justify-between items-center pb-2 border-b border-outline-variant/60">
                            <span className="font-bold text-xs text-primary">Co-Sharer #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveOwner(idx)}
                              className="text-error hover:text-error/80 text-xs flex items-center gap-1 font-semibold cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> Remove
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Owner Name (English)</label>
                              <input
                                type="text"
                                value={owner.name_english || ""}
                                onChange={(e) => handleUpdateOwner(idx, "name_english", e.target.value)}
                                placeholder="e.g. Ramesh Shankarrao Patil"
                                className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-semibold focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Owner Name (Indic Script)</label>
                              <input
                                type="text"
                                value={owner.name_indic || ""}
                                onChange={(e) => handleUpdateOwner(idx, "name_indic", e.target.value)}
                                placeholder="e.g. रमेश शंकरराव पाटील"
                                className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-serif focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Share Percentage (%)</label>
                              <input
                                type="number"
                                step="1"
                                value={owner.share_percentage || 50}
                                onChange={(e) => handleUpdateOwner(idx, "share_percentage", parseFloat(e.target.value) || 0)}
                                className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Share Fraction</label>
                              <input
                                type="text"
                                value={owner.share_fraction || "1/2"}
                                onChange={(e) => handleUpdateOwner(idx, "share_fraction", e.target.value)}
                                placeholder="e.g. 1/2 or 1/4"
                                className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>
                            <div className="sm:col-span-2">
                              <label className="text-[10px] font-bold text-on-surface-variant block mb-1">Linked Mutation Ref</label>
                              <input
                                type="text"
                                value={owner.mutation_entry_number || ""}
                                onChange={(e) => handleUpdateOwner(idx, "mutation_entry_number", e.target.value)}
                                placeholder="e.g. M-4512 or Direct Title"
                                className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs text-on-surface font-mono focus:ring-1 focus:ring-primary focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-on-surface text-sm">{owner.name_english || "Unknown"}</span>
                              {owner.name_indic && (
                                <span className="text-on-surface-variant text-xs font-serif">({owner.name_indic})</span>
                              )}
                              {owner.aadhaar_hash_matched && (
                                <Badge variant="verified" className="text-[9px] py-0 px-1">Aadhaar Matched</Badge>
                              )}
                            </div>
                            <div className="text-[11px] text-on-surface-variant mt-0.5">
                              Mutation Ref: <strong className="text-on-surface font-mono">{owner.mutation_entry_number || "Direct Inscription"}</strong>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-on-surface-variant">Share:</span>
                            <Badge variant="outline" className="font-mono text-primary font-bold">
                              {owner.share_percentage ?? 100}% ({owner.share_fraction || "1/1"})
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 4: Title Mutations & Lineage Events */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <History className="w-4 h-4" />
                  <span>4. Certified Mutations &amp; Lineage Events ({formData.mutations.length})</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddMutation}
                  className="bg-primary text-on-primary text-[11px] h-7 px-2.5 gap-1 font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Mutation</span>
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {formData.mutations.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-outline-variant rounded-lg text-xs text-on-surface-variant">
                    No previous mutation entries listed. Click &ldquo;Add Mutation&rdquo; to insert.
                  </div>
                ) : (
                  formData.mutations.map((mut: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-outline-variant bg-surface-container-low/50 space-y-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center pb-1 border-b border-outline-variant/40">
                            <span className="font-bold text-primary text-xs">Mutation Entry #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMutation(idx)}
                              className="text-error text-xs hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-on-surface-variant block font-bold">Mutation Number</label>
                              <input
                                type="text"
                                value={mut.mutation_number || ""}
                                onChange={(e) => handleUpdateMutation(idx, "mutation_number", e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-on-surface-variant block font-bold">Date</label>
                              <input
                                type="date"
                                value={mut.date || ""}
                                onChange={(e) => handleUpdateMutation(idx, "date", e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-on-surface-variant block font-bold">Nature</label>
                              <input
                                type="text"
                                value={mut.nature_of_mutation || ""}
                                onChange={(e) => handleUpdateMutation(idx, "nature_of_mutation", e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface"
                              />
                            </div>
                            <div className="sm:col-span-3">
                              <label className="text-[10px] text-on-surface-variant block font-bold">Parties Involved</label>
                              <input
                                type="text"
                                value={mut.parties_involved || ""}
                                onChange={(e) => handleUpdateMutation(idx, "parties_involved", e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-on-surface">{mut.nature_of_mutation || "Mutation"}</span>
                            <span className="font-mono text-primary font-bold">{mut.mutation_number}</span>
                          </div>
                          <p className="text-on-surface-variant text-[11px]">{mut.parties_involved}</p>
                          <div className="text-[10px] text-outline mt-1">{mut.date} • Status: {mut.status || "CERTIFIED"}</div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* SECTION 5: Encumbrances & Liens */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="bg-surface-container-low px-4 py-3 border-b border-outline-variant flex items-center justify-between">
                <div className="flex items-center gap-2 text-primary font-bold text-xs">
                  <Scale className="w-4 h-4" />
                  <span>5. Active Encumbrances &amp; Bank Liens ({formData.encumbrances.length})</span>
                </div>
                <Button
                  size="sm"
                  onClick={handleAddEncumbrance}
                  className="bg-primary text-on-primary text-[11px] h-7 px-2.5 gap-1 font-bold shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Encumbrance</span>
                </Button>
              </div>

              <div className="p-4 space-y-3">
                {formData.encumbrances.length === 0 ? (
                  <div className="text-center py-4 border border-dashed border-outline-variant rounded-lg text-xs text-on-surface-variant">
                    ✓ Clear Title — No active bank mortgages or statutory liens reported.
                  </div>
                ) : (
                  formData.encumbrances.map((enc: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-outline-variant bg-surface-container-low/50 space-y-2 text-xs"
                    >
                      {isEditing ? (
                        <div className="space-y-2">
                          <div className="flex justify-between items-center pb-1 border-b border-outline-variant/40">
                            <span className="font-bold text-error text-xs">Lien / Mortgage #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveEncumbrance(idx)}
                              className="text-error text-xs hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" /> Remove
                            </button>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                            <div>
                              <label className="text-[10px] text-on-surface-variant block font-bold">Institution / Bank</label>
                              <input
                                type="text"
                                value={enc.institution_name || ""}
                                onChange={(e) => handleUpdateEncumbrance(idx, "institution_name", e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-on-surface-variant block font-bold">Amount (₹)</label>
                              <input
                                type="number"
                                value={enc.amount || 0}
                                onChange={(e) => handleUpdateEncumbrance(idx, "amount", parseFloat(e.target.value) || 0)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface font-mono"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] text-on-surface-variant block font-bold">Status</label>
                              <input
                                type="text"
                                value={enc.status || "ACTIVE"}
                                onChange={(e) => handleUpdateEncumbrance(idx, "status", e.target.value)}
                                className="w-full bg-surface border border-outline-variant rounded p-1.5 text-xs text-on-surface"
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-on-surface">{enc.institution_name}</span>
                            <div className="text-[11px] text-on-surface-variant mt-0.5">
                              Status: <strong className="text-error">{enc.status}</strong> • Date: {enc.date_of_encumbrance}
                            </div>
                          </div>
                          <span className="font-mono font-bold text-on-surface">₹{enc.amount?.toLocaleString()}</span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Officer Remarks / Legal Justification Input */}
            <div className="bg-surface rounded-xl border border-outline-variant shadow-sm p-4 space-y-2">
              <label className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                <FileCheck2 className="w-4 h-4 text-primary" />
                <span>Officer Statutory Remarks &amp; Mutation Justification</span>
              </label>
              <textarea
                value={officerNotes}
                onChange={(e) => setOfficerNotes(e.target.value)}
                placeholder="Enter revenue officer inspection notes, physical survey reference, or legal sanction rationale..."
                rows={2}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* SECTION 6: Audit Trail Diff History */}
            {detail?.audit_history && detail.audit_history.length > 0 && (
              <div className="bg-surface rounded-xl border border-outline-variant shadow-sm overflow-hidden p-4 space-y-3">
                <h3 className="text-xs font-bold text-on-surface flex items-center gap-1.5">
                  <History className="w-4 h-4 text-primary" />
                  <span>Previous Officer Verification Actions &amp; Diffs ({detail.audit_history.length})</span>
                </h3>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {detail.audit_history.map((log: any, i: number) => (
                    <div key={i} className="p-2.5 rounded bg-surface-container-low border border-outline-variant text-[11px] space-y-1">
                      <div className="flex justify-between items-center font-semibold">
                        <span className="text-primary font-bold">{log.officer_name} • {log.action}</span>
                        <span className="text-outline font-mono">{new Date(log.created_at).toLocaleString()}</span>
                      </div>
                      {log.notes && <p className="text-on-surface-variant italic">&ldquo;{log.notes}&rdquo;</p>}
                      {log.corrected_values && Object.keys(log.corrected_values).length > 0 && (
                        <div className="text-[10px] text-on-surface-variant font-mono bg-surface p-1 rounded border border-outline-variant/60">
                          Modified: {Object.keys(log.corrected_values).join(", ")}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Sticky Footer Action Bar */}
          <div className="mt-auto sticky bottom-0 bg-surface border-t border-outline-variant p-4 flex flex-wrap items-center justify-between gap-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={actionLoading}
              className="px-4 py-2 text-error hover:bg-error-container/30 font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <XCircle className="w-4 h-4" />
              <span>Reject Deed</span>
            </button>

            <div className="flex items-center gap-2.5">
              <Link href="/intelligence">
                <button className="px-3.5 py-2 border border-outline-variant text-on-surface-variant hover:bg-surface-container font-semibold rounded-lg text-xs transition-colors cursor-pointer">
                  Lineage Graph
                </button>
              </Link>

              {isEditing ? (
                <button
                  onClick={handleSaveCorrections}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-[#EA580C] text-white hover:bg-[#C2410C] font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  <span>Save Corrections &amp; Verify</span>
                </button>
              ) : (
                <button
                  onClick={handleApprove}
                  disabled={actionLoading}
                  className="px-5 py-2 bg-primary text-on-primary hover:bg-primary/90 font-bold rounded-lg text-xs transition-colors shadow flex items-center gap-1.5 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>Approve &amp; Validate Record</span>
                </button>
              )}
            </div>
          </div>

        </section>

      </div>

      {/* Reject Record Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface border border-outline-variant rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center gap-2 text-error font-bold text-base">
              <XCircle className="w-5 h-5" />
              <span>Statutory Rejection of Revenue Deed</span>
            </div>
            <p className="text-xs text-on-surface-variant">
              Please specify the statutory, legal, or physical discrepancy for rejecting this record from the official land registry.
            </p>
            <div>
              <label className="text-[11px] font-bold text-on-surface-variant block mb-1">Rejection Reason</label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="e.g. Fraudulent succession affidavit, illegible survey map, conflicting title lawsuit pending in Civil Court..."
                rows={3}
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:outline-none focus:ring-1 focus:ring-error"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowRejectModal(false)}
                className="text-on-surface-variant hover:text-on-surface text-xs"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="text-xs gap-1.5"
              >
                {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Statutory Rejection
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Screen High-Resolution Photo Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col p-4 sm:p-6">
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2 text-xs font-semibold font-mono">
              <ImageIcon className="w-4 h-4 text-emerald-400" />
              <span>{detail?.original_name || "Original Deed High-Resolution Photo Scan"}</span>
            </div>
            <div className="flex items-center gap-2">
              <a
                href={fileUrl}
                target="_blank"
                rel="noreferrer"
                className="bg-white/10 hover:bg-white/20 px-3 py-1 rounded text-xs text-white transition-colors flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Original</span>
              </a>
              <button
                onClick={() => setShowPhotoModal(false)}
                className="p-1 text-white/70 hover:text-white rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-auto p-4 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={fileUrl}
              alt="Original Deed High-Res Photo"
              className="max-w-full max-h-[85vh] object-contain rounded shadow-2xl border border-white/20"
            />
          </div>
        </div>
      )}

    </div>
  );
}
