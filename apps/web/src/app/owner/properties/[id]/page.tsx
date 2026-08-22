"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Bot,
  Calendar,
  CheckCircle2,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  GitFork,
  History,
  Layers,
  MapPin,
  RefreshCw,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

interface HistoryEvent {
  id: string;
  record_id: number;
  property_title: string;
  survey_number: string;
  village: string;
  state: string;
  event_year?: number;
  event_date?: string;
  event_type: string;
  title: string;
  description: string;
  mutation_number?: string;
  parties_involved?: string;
  supporting_document_id?: number;
  supporting_document_name?: string;
}

interface PropertyDetail {
  id: number;
  document_id?: number;
  state: string;
  district: string;
  taluk?: string;
  village: string;
  survey_number: string;
  hissa_number?: string;
  gat_number?: string;
  khata_number?: string;
  total_area?: number;
  cultivable_area?: number;
  uncultivable_area?: number;
  area_acres?: number;
  area_unit: string;
  land_tenure?: string;
  owners: Array<{ name?: string; name_english?: string; name_indic?: string; share_percent?: number; relation?: string }>;
  validation_status: string;
  overall_confidence_score: number;
  has_discrepancy: boolean;
  discrepancy_details?: string;
  gis_parcel?: {
    id: number;
    area_ha: number;
    area_acres?: number;
    centroid_lat?: number;
    centroid_lng?: number;
    geojson?: string;
  };
  ownership_history: HistoryEvent[];
  encumbrances: Array<{ holder?: string; bank_name?: string; amount?: number | string; loan_type?: string }>;
  document?: {
    id: number;
    filename: string;
    original_name: string;
    file_size: number;
    mime_type: string;
    status: string;
  };
}

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [property, setProperty] = useState<PropertyDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (propertyId) {
      fetchPropertyDetail();
    }
  }, [propertyId]);

  const fetchPropertyDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch(`http://localhost:8000/api/owner/properties/${propertyId}`, { headers });
      if (!res.ok) {
        if (res.status === 403) throw new Error("Access Denied: You do not own this land record.");
        if (res.status === 404) throw new Error("Land Record not found.");
        throw new Error(`API returned status ${res.status}`);
      }
      const data: PropertyDetail = await res.json();
      setProperty(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to load property details.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
        <span className="text-xs text-slate-400 font-medium">Loading verified land record from database...</span>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="p-6 md:p-10 space-y-4 max-w-2xl mx-auto">
        <Link href="/owner/properties" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to My Land
        </Link>
        <div className="rounded-2xl border border-rose-500/40 bg-rose-500/10 p-6 text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-rose-400 mx-auto" />
          <h2 className="text-base font-bold text-white">Error Loading Property</h2>
          <p className="text-xs text-rose-200">{error || "Property not found."}</p>
          <Button size="sm" onClick={() => router.push("/owner/properties")} className="text-xs">
            Return to Land Vault
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      <Topbar />
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-6xl w-full mx-auto">
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-outline-variant pb-4">
        <div className="flex items-center gap-2 text-xs text-on-surface-variant">
          <Link href="/owner" className="hover:text-primary font-medium">Overview</Link>
          <span>/</span>
          <Link href="/owner/properties" className="hover:text-primary font-medium">My Land</Link>
          <span>/</span>
          <span className="text-primary font-bold">Survey {property.survey_number}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/copilot"
            className="inline-flex items-center gap-1.5 rounded-xl bg-primary text-on-primary px-3.5 py-2 text-xs font-bold shadow-sm hover:bg-primary/90 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask Copilot About This Land</span>
          </Link>

          <Link
            href={`/owner/gis?survey=${property.survey_number}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-surface-container border border-outline-variant hover:bg-surface-container-high px-3.5 py-2 text-xs font-bold text-on-surface transition-colors"
          >
            <Compass className="h-3.5 w-3.5 text-primary" />
            <span>Cadastral GIS Map</span>
          </Link>
        </div>
      </div>

      {/* Hero Property Overview Header */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary text-xs px-2.5 py-0.5 font-bold">
                {property.state} Land Revenue Register
              </Badge>
              {property.has_discrepancy ? (
                <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-xs font-bold">
                  ⚠ Area Discrepancy Flagged
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-xs font-bold">
                  ✓ Statutorily Verified
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">
              Survey No. {property.survey_number}
              {property.hissa_number && <span className="text-on-surface-variant font-medium text-xl ml-2">/ Hissa {property.hissa_number}</span>}
              {property.gat_number && <span className="text-on-surface-variant font-medium text-xl ml-2">(Gat {property.gat_number})</span>}
            </h1>
            <p className="text-sm text-on-surface-variant mt-1 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary shrink-0" />
              <span>Village {property.village}, Taluk {property.taluk || "Headquarters"}, District {property.district}, {property.state}</span>
            </p>
          </div>

          {/* Large Area Display */}
          <div className="rounded-xl bg-surface-container-low border border-outline-variant p-4 text-right shrink-0">
            <span className="text-xs text-on-surface-variant block font-medium">Authoritative Land Extent</span>
            <div className="text-2xl md:text-3xl font-extrabold text-primary mt-0.5 font-mono">
              {property.area_acres} Acres
            </div>
            <span className="text-xs text-on-surface-variant/80 block">({property.total_area} {property.area_unit})</span>
          </div>
        </div>

        {/* Primary Attribute Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-outline-variant/60">
          <div className="rounded-xl bg-surface-container-low p-3.5 border border-outline-variant/60">
            <span className="text-[11px] text-on-surface-variant block font-semibold">Cultivable Extent</span>
            <strong className="text-sm text-on-surface font-bold">{property.cultivable_area || property.total_area} {property.area_unit}</strong>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3.5 border border-outline-variant/60">
            <span className="text-[11px] text-on-surface-variant block font-semibold">Uncultivable (Pot-Kharaba)</span>
            <strong className="text-sm text-on-surface font-bold">{property.uncultivable_area || 0.0} {property.area_unit}</strong>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3.5 border border-outline-variant/60">
            <span className="text-[11px] text-on-surface-variant block font-semibold">Land Tenure Class</span>
            <strong className="text-sm text-on-surface font-bold line-clamp-1">{property.land_tenure || "Occupant Class 1"}</strong>
          </div>
          <div className="rounded-xl bg-surface-container-low p-3.5 border border-outline-variant/60">
            <span className="text-[11px] text-on-surface-variant block font-semibold">AI Verification Score</span>
            <strong className="text-sm text-primary font-bold">{Math.round(property.overall_confidence_score * 100)}% Confidence</strong>
          </div>
        </div>
      </div>

      {/* Discrepancy Warning Alert Box */}
      {property.has_discrepancy && (
        <div className="rounded-2xl border border-amber-500/40 bg-amber-500/10 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            <span>Cadastral Boundary &amp; Ground Area Discrepancy Detected</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            {property.discrepancy_details || "The physical surveyed cadastral satellite polygon boundary deviates from the registered document deed."}
          </p>
          <div className="flex items-center gap-4 text-xs pt-2">
            <Link
              href={`/owner/gis?survey=${property.survey_number}`}
              className="font-bold text-primary hover:underline"
            >
              Inspect Polygon in GIS Explorer →
            </Link>
          </div>
        </div>
      )}

      {/* 2-Column Core Sections: GIS Comparison & Document Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GIS Cadastral Comparison Card */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <Compass className="h-4 w-4 text-primary" />
              <span>Cadastral GIS Verification</span>
            </div>
            <Badge variant="outline" className="border-outline-variant bg-surface-container text-on-surface-variant text-xs">
              PostGIS WGS-84
            </Badge>
          </div>

          <p className="text-xs text-on-surface-variant">
            Comparison between legal revenue deed text and physical satellite surveyed polygon extent:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-surface-container-low border border-outline-variant p-3.5 text-center">
              <span className="text-[11px] text-on-surface-variant block font-semibold">Deed Document Area</span>
              <strong className="text-base text-on-surface font-bold block mt-1 font-mono">
                {property.total_area} Ha
              </strong>
              <span className="text-[10px] text-on-surface-variant">({property.area_acres} Acres)</span>
            </div>

            <div className={`rounded-xl border p-3.5 text-center ${
              property.has_discrepancy ? "bg-amber-500/10 border-amber-500/30" : "bg-surface-container-low border-outline-variant"
            }`}>
              <span className="text-[11px] text-on-surface-variant block font-semibold">Cadastral GIS Area</span>
              <strong className={`text-base font-bold block mt-1 font-mono ${
                property.has_discrepancy ? "text-amber-700" : "text-primary"
              }`}>
                {property.gis_parcel?.area_ha || property.total_area} Ha
              </strong>
              <span className="text-[10px] text-on-surface-variant">
                ({property.gis_parcel?.area_acres || property.area_acres} Acres)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/owner/gis?survey=${property.survey_number}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 text-xs font-bold py-2.5 transition-colors shadow-sm"
            >
              <Compass className="h-4 w-4" />
              <span>Open Cadastral Map View</span>
            </Link>
          </div>
        </div>

        {/* Document Evidence Card */}
        <div className="rounded-2xl border border-outline-variant bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <FileText className="h-4 w-4 text-primary" />
              <span>Document Evidence</span>
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary text-xs font-bold">
              Original Deed
            </Badge>
          </div>

          <p className="text-xs text-on-surface-variant">
            Source deed extract processed by Sarvam Vision &amp; Mistral OCR:
          </p>

          {property.document ? (
            <div className="rounded-xl bg-surface-container-low border border-outline-variant p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-on-surface line-clamp-1">
                  {property.document.original_name}
                </span>
                <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-500/30 text-[10px] font-bold">
                  {property.document.status}
                </Badge>
              </div>

              {/* Real Deed Image Preview */}
              <div className="relative rounded-lg overflow-hidden border border-outline-variant bg-surface aspect-[4/3] group shadow-inner">
                <img
                  src={`http://localhost:8000/api/documents/${property.document?.id || property.document_id || property.id}/file`}
                  alt={property.document.original_name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to sample or placeholder
                    (e.target as HTMLImageElement).src = `/sample/deeds/${property.document?.filename || "images.jpeg"}`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded border border-white/20">
                    Official Revenue Extract • {property.document.original_name}
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-on-surface-variant flex items-center justify-between">
                <span>File Size: {Math.round(property.document.file_size / 1024)} KB</span>
                <span>Type: {property.document.mime_type}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-surface-container-low border border-outline-variant p-4 text-xs text-on-surface-variant text-center">
              Historical digitized deed record
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            {property.document && (
              <a
                href={`http://localhost:8000/api/documents/${property.document?.id || property.document_id || property.id}/file`}
                target="_blank"
                rel="noreferrer"
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-on-primary hover:bg-primary/90 px-3 py-2.5 text-xs font-bold transition-colors shadow-sm"
                title="Open full resolution deed image in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>View Full Resolution Scan</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Ownership History Chronological Timeline */}
      <div className="rounded-2xl border border-outline-variant bg-surface p-6 md:p-8 space-y-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-on-surface">
              <History className="h-4 w-4 text-primary" />
              <span>Chronological Ownership History</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Verified mutation entries, title transfers, and succession records from official land registers.
            </p>
          </div>
          <Badge variant="outline" className="border-outline-variant bg-surface-container text-on-surface-variant text-xs">
            Zero Hallucination
          </Badge>
        </div>

        {property.ownership_history && property.ownership_history.length > 0 ? (
          <div className="space-y-6 pl-4 relative before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-outline-variant">
            {property.ownership_history.map((event, idx) => (
              <div key={event.id || idx} className="flex items-start gap-4 relative">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ring-4 ring-surface shrink-0 mt-0.5 ${
                  event.event_type === "VERIFIED_RECORD"
                    ? "bg-primary text-on-primary"
                    : event.event_type === "MORTGAGE_LIEN"
                    ? "bg-purple-600 text-white"
                    : "bg-primary text-on-primary"
                }`}>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>

                <div className="flex-1 rounded-xl bg-surface-container-low border border-outline-variant p-4 space-y-2 shadow-xs">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-on-surface">
                      {event.title}
                    </h4>
                    <span className="text-[11px] text-primary font-bold font-mono">
                      {event.event_date || (event.event_year ? `Year ${event.event_year}` : "Recorded")}
                    </span>
                  </div>

                  <p className="text-xs text-on-surface leading-relaxed">
                    {event.description}
                  </p>

                  {event.parties_involved && (
                    <div className="text-[11px] text-on-surface-variant pt-2 border-t border-outline-variant/60">
                      <span className="font-semibold text-on-surface">Parties Involved:</span> {event.parties_involved}
                    </div>
                  )}

                  {event.mutation_number && (
                    <Badge variant="outline" className="text-[10px] border-primary/20 bg-primary/10 text-primary font-semibold">
                      Mutation Order #{event.mutation_number}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-surface-container-low border border-outline-variant p-6 text-center text-xs text-on-surface-variant">
            Historical record prior to current registration is unavailable in the database.
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
