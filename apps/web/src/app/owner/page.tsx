"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  CheckCircle2,
  ChevronRight,
  Compass,
  Database,
  FileCheck2,
  FileText,
  History,
  Layers,
  MapPin,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  User,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/context/AuthContext";

interface OwnerOverview {
  owner_name: string;
  total_properties: number;
  total_area_ha: number;
  total_area_acres: number;
  total_regions_count: number;
  regions_list: string[];
  verified_properties_count: number;
  review_required_count: number;
  gis_discrepancies_count: number;
  total_encumbrance_value_inr: number;
  state_distribution: Record<string, number>;
}

interface PropertySummary {
  id: number;
  document_id?: number;
  survey_number: string;
  hissa_number?: string;
  village: string;
  district: string;
  state: string;
  total_area_ha?: number;
  total_area_acres?: number;
  land_tenure?: string;
  validation_status: string;
  has_discrepancy: boolean;
  discrepancy_details?: string;
  mutation_count: number;
  encumbrances: string[];
  last_ownership_event?: string;
}

export default function OwnerDashboardPage() {
  const { user } = useAuth();
  const [overview, setOverview] = useState<OwnerOverview | null>(null);
  const [recentProperties, setRecentProperties] = useState<PropertySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOwnerData();
  }, []);

  const fetchOwnerData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch overview statistics
      const overviewRes = await fetch("http://localhost:8000/api/owner/overview");
      if (!overviewRes.ok) throw new Error(`Overview API failed (${overviewRes.status})`);
      const overviewData: OwnerOverview = await overviewRes.json();
      setOverview(overviewData);

      // Fetch recent properties
      const propsRes = await fetch("http://localhost:8000/api/owner/properties");
      if (propsRes.ok) {
        const propsData: PropertySummary[] = await propsRes.json();
        setRecentProperties(propsData.slice(0, 6));
      }
    } catch (err: any) {
      console.error("Failed to load owner data:", err);
      setError("Unable to connect to Land AI database service. Please ensure the backend is running.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-8">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Personal Land Vault • इंडी-भूमि
            </span>
            <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-300 text-[10px]">
              Verified Owner
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            Welcome, {overview?.owner_name || user?.full_name || "Nishu Kumar"}
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Understand, monitor, and protect your verified land portfolio across India.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ask Land AI Copilot</span>
          </Link>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchOwnerData}
            className="border-slate-800 bg-slate-900 text-xs hover:bg-slate-800 text-slate-300"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin text-indigo-400" : ""}`} />
            Sync Vault
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200 flex items-center justify-between">
          <span>{error}</span>
          <Button size="sm" variant="outline" onClick={fetchOwnerData} className="border-amber-500/50 text-xs">
            Retry
          </Button>
        </div>
      )}

      {/* Core Question Answer: "What Land Do I Own?" */}
      <div className="rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-900/90 via-slate-900/60 to-slate-950 p-6 md:p-8 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Authoritative Holding Summary
            </span>
            <h2 className="text-xl font-bold text-white mt-0.5">
              What Land Do I Own?
            </h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Database className="h-4 w-4 text-emerald-400" />
            <span>Source of Truth: <strong className="text-slate-200">PostGIS LandRecord Database</strong></span>
          </div>
        </div>

        {/* 5 Deterministic Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
          
          {/* Total Properties */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Total Properties</span>
              <Layers className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {loading ? "..." : overview?.total_properties || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Registered Parcels</span>
          </div>

          {/* Total Land Extent */}
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-emerald-400 font-medium">Total Extent</span>
              <MapPin className="h-4 w-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {loading ? "..." : `${overview?.total_area_acres || 0} Ac`}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              ({overview?.total_area_ha || 0} Hectares)
            </span>
          </div>

          {/* States / Regions */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">States &amp; Regions</span>
              <Compass className="h-4 w-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300">
              {loading ? "..." : `${Object.keys(overview?.state_distribution || {}).length} States`}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">
              Across {overview?.total_regions_count || 0} Districts
            </span>
          </div>

          {/* Verified Status */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Verified Status</span>
              <ShieldCheck className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-teal-400">
              {loading ? "..." : overview?.verified_properties_count || 0}
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Officially Certified</span>
          </div>

          {/* Requiring Review / Attention */}
          <div className={`rounded-xl border p-4 ${
            (overview?.review_required_count || 0) > 0
              ? "border-amber-500/40 bg-amber-950/10"
              : "border-slate-800 bg-slate-950/70"
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-amber-400 font-medium">Needs Attention</span>
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400">
              {loading ? "..." : overview?.review_required_count || 0}
            </div>
            <span className="text-[11px] text-slate-400 mt-1 block">
              {overview?.gis_discrepancies_count || 0} GIS Discrepancies
            </span>
          </div>

        </div>

        {/* State Breakdown Chips */}
        {overview?.state_distribution && Object.keys(overview.state_distribution).length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 mr-2">State Breakdown:</span>
            {Object.entries(overview.state_distribution).map(([state, count]) => (
              <Badge
                key={state}
                variant="outline"
                className="border-slate-700 bg-slate-950 text-slate-300 text-xs px-2.5 py-1"
              >
                {state}: <strong className="text-white ml-1">{count} {count === 1 ? "parcel" : "parcels"}</strong>
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* Discrepancy & Attention Alert (if any) */}
      {overview && overview.gis_discrepancies_count > 0 && (
        <div className="rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/30 via-slate-900/50 to-amber-950/20 p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">
                  {overview.gis_discrepancies_count} Properties Have Cadastral Boundary Discrepancies
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  The land area specified in your registered revenue deeds deviates by more than 5% from the physical surveyed cadastral satellite polygons on ground.
                </p>
              </div>
            </div>
            <Link
              href="/owner/properties?status=attention"
              className="inline-flex items-center gap-1 text-xs font-semibold text-amber-400 hover:text-amber-300 shrink-0"
            >
              Review Flags <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}

      {/* Quick Access Grid: Land Vault & Ownership History */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Land Vault / My Properties Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <MapPin className="h-4 w-4 text-emerald-400" />
                <span>My Land Vault</span>
              </div>
              <Link href="/owner/properties" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                View All Properties <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Explore your registered parcels, survey numbers, khata details, tenure classes, and physical boundary measurements.
            </p>

            <div className="space-y-2.5">
              {recentProperties.slice(0, 3).map((prop) => (
                <Link
                  key={prop.id}
                  href={`/owner/properties/${prop.id}`}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-slate-700 transition-colors group"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-white group-hover:text-indigo-300">
                        Survey {prop.survey_number}
                      </span>
                      {prop.has_discrepancy ? (
                        <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[9px] px-1.5 py-0">
                          ⚠ Mismatch
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[9px] px-1.5 py-0">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {prop.village}, {prop.district} ({prop.state})
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-emerald-400 block">
                      {prop.total_area_acres} Acres
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({prop.total_area_ha} Ha)
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <Link
              href="/owner/properties"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-xs font-semibold text-white py-2.5 transition-colors"
            >
              <span>Open Land Vault Explorer</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Ownership Lineage & Historical Chain Card */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <History className="h-4 w-4 text-purple-400" />
                <span>Ownership History &amp; Lineage</span>
              </div>
              <Link href="/owner/history" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium">
                Full Timeline <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Trace verified mutation registers, succession inheritance records, and title transfers chronologically.
            </p>

            {/* Visual Timeline Sample */}
            <div className="space-y-3 pl-2 relative before:absolute before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
              <div className="flex items-start gap-3 relative">
                <div className="h-3 w-3 rounded-full bg-emerald-400 ring-4 ring-slate-950 mt-1 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white">Current Verified Title Record (2026)</span>
                  <p className="text-[11px] text-slate-400">
                    Digitized and authenticated under State Land Revenue Record.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="h-3 w-3 rounded-full bg-indigo-400 ring-4 ring-slate-950 mt-1 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white">Inheritance &amp; Succession Mutation</span>
                  <p className="text-[11px] text-slate-400">
                    Sanctioned under Order of Circle Officer &amp; Tehsildar.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 relative">
                <div className="h-3 w-3 rounded-full bg-slate-600 ring-4 ring-slate-950 mt-1 shrink-0" />
                <div>
                  <span className="text-xs font-semibold text-white">Initial Revenue Settlement</span>
                  <p className="text-[11px] text-slate-400">
                    Original cadastre survey and pot-kharaba land classification.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80">
            <Link
              href="/owner/history"
              className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800/90 hover:bg-slate-800 text-xs font-semibold text-white py-2.5 transition-colors"
            >
              <span>View Chronological History</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Ask Land AI Copilot Prompt Bar */}
      <div className="rounded-2xl border border-indigo-900/40 bg-gradient-to-r from-indigo-950/30 via-slate-900/50 to-purple-950/30 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-indigo-400 uppercase tracking-wider">
            <Sparkles className="h-4 w-4" />
            <span>Land AI Intelligence Copilot</span>
          </div>
          <h3 className="text-base font-bold text-white">
            Ask any question about your land holdings
          </h3>
          <p className="text-xs text-slate-400">
            Strictly grounded in your verified database records. Zero hallucination.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/copilot"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 hover:text-white hover:border-indigo-500 transition-colors"
          >
            &ldquo;Which of my properties need review?&rdquo;
          </Link>
          <Link
            href="/copilot"
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 border border-slate-700/80 px-3 py-2 text-xs text-slate-200 hover:text-white hover:border-indigo-500 transition-colors"
          >
            &ldquo;Show my land in Karnataka&rdquo;
          </Link>
        </div>
      </div>

    </div>
  );
}
