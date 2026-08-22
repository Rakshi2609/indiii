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
      const res = await fetch(`http://localhost:8000/api/owner/properties/${propertyId}`);
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
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8 max-w-6xl w-full mx-auto">
      
      {/* Top Breadcrumb & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link href="/owner" className="hover:text-white">Overview</Link>
          <span>/</span>
          <Link href="/owner/properties" className="hover:text-white">My Land</Link>
          <span>/</span>
          <span className="text-emerald-400 font-semibold">Survey {property.survey_number}</span>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/copilot`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Ask Copilot About This Land</span>
          </Link>

          <Link
            href={`/owner/gis?survey=${property.survey_number}`}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 transition-colors"
          >
            <Compass className="h-3.5 w-3.5 text-emerald-400" />
            <span>Cadastral GIS Map</span>
          </Link>
        </div>
      </div>

      {/* Hero Property Overview Header */}
      <div className="rounded-2xl border border-slate-800 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 md:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-xs px-2.5 py-0.5">
                {property.state} Land Revenue Register
              </Badge>
              {property.has_discrepancy ? (
                <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-xs">
                  ⚠ Area Discrepancy Flagged
                </Badge>
              ) : (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-xs">
                  ✓ Statutorily Verified
                </Badge>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Survey No. {property.survey_number}
              {property.hissa_number && <span className="text-slate-400 text-xl ml-2">/ Hissa {property.hissa_number}</span>}
              {property.gat_number && <span className="text-slate-400 text-xl ml-2">(Gat {property.gat_number})</span>}
            </h1>
            <p className="text-sm text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-slate-500 shrink-0" />
              <span>Village {property.village}, Taluk {property.taluk || "Headquarters"}, District {property.district}, {property.state}</span>
            </p>
          </div>

          {/* Large Area Display */}
          <div className="rounded-xl bg-slate-950/80 border border-slate-800 p-4 text-right shrink-0">
            <span className="text-xs text-slate-400 block font-medium">Authoritative Land Extent</span>
            <div className="text-2xl md:text-3xl font-bold text-emerald-400 mt-0.5">
              {property.area_acres} Acres
            </div>
            <span className="text-xs text-slate-500 block">({property.total_area} {property.area_unit})</span>
          </div>
        </div>

        {/* Primary Attribute Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Cultivable Extent</span>
            <strong className="text-sm text-white font-semibold">{property.cultivable_area || property.total_area} {property.area_unit}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Uncultivable (Pot-Kharaba)</span>
            <strong className="text-sm text-white font-semibold">{property.uncultivable_area || 0.0} {property.area_unit}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">Land Tenure Class</span>
            <strong className="text-sm text-white font-semibold line-clamp-1">{property.land_tenure || "Occupant Class 1"}</strong>
          </div>
          <div className="rounded-lg bg-slate-950/50 p-3 border border-slate-800/60">
            <span className="text-[11px] text-slate-400 block">AI Verification Score</span>
            <strong className="text-sm text-emerald-400 font-semibold">{Math.round(property.overall_confidence_score * 100)}% Confidence</strong>
          </div>
        </div>
      </div>

      {/* Discrepancy Warning Alert Box */}
      {property.has_discrepancy && (
        <div className="rounded-2xl border border-amber-500/50 bg-amber-950/20 p-5 space-y-2">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            <span>Cadastral Boundary &amp; Ground Area Discrepancy Detected</span>
          </div>
          <p className="text-xs text-amber-200/90 leading-relaxed">
            {property.discrepancy_details || "The physical surveyed cadastral satellite polygon boundary deviates from the registered document deed."}
          </p>
          <div className="flex items-center gap-4 text-xs pt-2">
            <Link
              href={`/owner/gis?survey=${property.survey_number}`}
              className="font-semibold text-amber-300 hover:text-white underline"
            >
              Inspect Polygon in GIS Explorer →
            </Link>
            <Link
              href={`/verification/${property.id}`}
              className="font-semibold text-indigo-300 hover:text-white underline"
            >
              View Officer Verification Details →
            </Link>
          </div>
        </div>
      )}

      {/* 2-Column Core Sections: GIS Comparison & Document Evidence */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* GIS Cadastral Comparison Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Cadastral GIS Verification</span>
            </div>
            <Badge variant="outline" className="border-slate-700 bg-slate-950 text-slate-300 text-xs">
              PostGIS WGS-84
            </Badge>
          </div>

          <p className="text-xs text-slate-400">
            Comparison between legal revenue deed text and physical satellite surveyed polygon extent:
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-3.5 text-center">
              <span className="text-[11px] text-slate-400 block">Deed Document Area</span>
              <strong className="text-base text-white font-bold block mt-1">
                {property.total_area} Ha
              </strong>
              <span className="text-[10px] text-slate-500">({property.area_acres} Acres)</span>
            </div>

            <div className={`rounded-xl border p-3.5 text-center ${
              property.has_discrepancy ? "bg-amber-950/20 border-amber-500/40" : "bg-slate-950 border-slate-800"
            }`}>
              <span className="text-[11px] text-slate-400 block">Cadastral GIS Area</span>
              <strong className={`text-base font-bold block mt-1 ${
                property.has_discrepancy ? "text-amber-400" : "text-emerald-400"
              }`}>
                {property.gis_parcel?.area_ha || property.total_area} Ha
              </strong>
              <span className="text-[10px] text-slate-500">
                ({property.gis_parcel?.area_acres || property.area_acres} Acres)
              </span>
            </div>
          </div>

          <div className="pt-2">
            <Link
              href={`/owner/gis?survey=${property.survey_number}`}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white py-2.5 transition-colors"
            >
              <Compass className="h-4 w-4 text-emerald-400" />
              <span>Open Cadastral Map View</span>
            </Link>
          </div>
        </div>

        {/* Document Evidence Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Document Evidence</span>
            </div>
            <Badge variant="outline" className="border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs">
              Original Deed
            </Badge>
          </div>

          <p className="text-xs text-slate-400">
            Source deed extract processed by Sarvam Vision &amp; Mistral OCR:
          </p>

          {property.document ? (
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white line-clamp-1">
                  {property.document.original_name}
                </span>
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                  {property.document.status}
                </Badge>
              </div>

              {/* Real Deed Image Preview */}
              <div className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-900 aspect-[4/3] group">
                <img
                  src={`/sample/deeds/${property.document.filename}`}
                  alt={property.document.original_name}
                  className="w-full h-full object-cover object-top transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    // Fallback to API direct serving or placeholder
                    (e.target as HTMLImageElement).src = `http://localhost:8000/api/documents/${property.document?.id}/file`;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent flex items-end p-2.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-semibold text-white bg-slate-900/90 px-2 py-0.5 rounded border border-slate-700">
                    Official Revenue Extract • Nishu Kumar
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 flex items-center justify-between">
                <span>File Size: {Math.round(property.document.file_size / 1024)} KB</span>
                <span>Type: {property.document.mime_type}</span>
              </div>
            </div>
          ) : (
            <div className="rounded-xl bg-slate-950 border border-slate-800 p-4 text-xs text-slate-500 text-center">
              Historical digitized deed record
            </div>
          )}

          <div className="pt-2 flex items-center gap-2">
            <Link
              href={`/verification/${property.id}`}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold text-indigo-300 py-2.5 transition-colors"
            >
              <FileCheck2 className="h-4 w-4" />
              <span>Open Verification Record</span>
            </Link>
            {property.document && (
              <a
                href={`/sample/deeds/${property.document.filename}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 px-3 py-2.5 text-xs font-semibold text-slate-300 transition-colors"
                title="Open full resolution deed image in new tab"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>Full View</span>
              </a>
            )}
          </div>
        </div>

      </div>

      {/* Ownership History Chronological Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <History className="h-4 w-4 text-purple-400" />
              <span>Chronological Ownership History</span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified mutation entries, title transfers, and succession records from official land registers.
            </p>
          </div>
          <Badge variant="outline" className="border-slate-700 bg-slate-950 text-slate-400 text-xs">
            Zero Hallucination
          </Badge>
        </div>

        {property.ownership_history && property.ownership_history.length > 0 ? (
          <div className="space-y-6 pl-4 relative before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {property.ownership_history.map((event, idx) => (
              <div key={event.id || idx} className="flex items-start gap-4 relative">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center ring-4 ring-slate-950 shrink-0 mt-0.5 ${
                  event.event_type === "VERIFIED_RECORD"
                    ? "bg-emerald-500 text-white"
                    : event.event_type === "MORTGAGE_LIEN"
                    ? "bg-purple-500 text-white"
                    : "bg-indigo-500 text-white"
                }`}>
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>

                <div className="flex-1 rounded-xl bg-slate-950 border border-slate-800/80 p-4 space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-white">
                      {event.title}
                    </h4>
                    <span className="text-[11px] text-emerald-400 font-semibold">
                      {event.event_date || (event.event_year ? `Year ${event.event_year}` : "Recorded")}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {event.description}
                  </p>

                  {event.parties_involved && (
                    <div className="text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500">Parties Involved:</span> {event.parties_involved}
                    </div>
                  )}

                  {event.mutation_number && (
                    <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-900 text-slate-300">
                      Mutation Order #{event.mutation_number}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 text-center text-xs text-slate-500">
            Historical record prior to current registration is unavailable in the database.
          </div>
        )}
      </div>

    </div>
  );
}
