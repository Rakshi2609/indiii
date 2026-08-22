"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  FileText,
  Filter,
  History,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface PropertyItem {
  id: number;
  document_id?: number;
  survey_number: string;
  hissa_number?: string;
  gat_number?: string;
  village: string;
  taluk?: string;
  district: string;
  state: string;
  total_area_ha?: number;
  total_area_acres?: number;
  area_unit: string;
  land_tenure?: string;
  validation_status: string;
  has_discrepancy: boolean;
  discrepancy_details?: string;
  gis_area_ha?: number;
  mutation_count: number;
  encumbrances: string[];
  last_ownership_event?: string;
}

export default function OwnerPropertiesVaultPage() {
  const [properties, setProperties] = useState<PropertyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedState, setSelectedState] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties();
  }, [selectedState, selectedStatus]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      let url = "http://localhost:8000/api/owner/properties?";
      if (selectedState !== "all") url += `state=${encodeURIComponent(selectedState)}&`;
      if (selectedStatus !== "all") url += `status=${encodeURIComponent(selectedStatus)}&`;
      if (search.trim()) url += `search=${encodeURIComponent(search)}&`;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`API returned ${res.status}`);
      const data: PropertyItem[] = await res.json();
      setProperties(data);
    } catch (err: any) {
      console.error(err);
      setError("Unable to load properties from the Land AI database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProperties();
  };

  const states = ["all", "Karnataka", "Telangana", "Maharashtra", "Andhra Pradesh", "Tamil Nadu"];

  const filteredProperties = properties.filter((p) => {
    if (!search.trim()) return true;
    const s = search.toLowerCase();
    return (
      p.survey_number.toLowerCase().includes(s) ||
      p.village.toLowerCase().includes(s) ||
      p.district.toLowerCase().includes(s) ||
      p.state.toLowerCase().includes(s)
    );
  });

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
              Land Vault • मेरी भूमि
            </span>
            <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 text-[10px]">
              {properties.length} Registered Properties
            </Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
            My Land Records
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Verified cadastral parcels, land extents, tenure categories, and boundary audit statuses.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/copilot"
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/20 hover:from-indigo-500 hover:to-purple-500 transition-all"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ask Copilot About Properties</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
        
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by survey number, village, district, or state..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>

        {/* State Filter Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
          {states.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedState(st)}
              className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
                selectedState === st
                  ? "bg-emerald-600 text-white font-semibold shadow-sm"
                  : "bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800"
              }`}
            >
              {st === "all" ? "All States" : st}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => setSelectedStatus("all")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              selectedStatus === "all" ? "bg-indigo-600 text-white" : "bg-slate-950 text-slate-400 border border-slate-800"
            }`}
          >
            All Statuses
          </button>
          <button
            onClick={() => setSelectedStatus("attention")}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium ${
              selectedStatus === "attention" ? "bg-amber-600 text-white font-semibold" : "bg-slate-950 text-slate-400 border border-slate-800"
            }`}
          >
            Needs Attention
          </button>
        </div>

      </div>

      {error && (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-xs text-amber-200">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-3">
          <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
          <span className="text-xs text-slate-400 font-medium">Retrieving verified properties from Land AI database...</span>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-12 text-center space-y-3">
          <MapPin className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-semibold text-white">No Properties Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            No land records match your active search or state filter. Try selecting &ldquo;All States&rdquo;.
          </p>
        </div>
      ) : (
        /* Property Cards Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProperties.map((prop) => (
            <div
              key={prop.id}
              className={`rounded-2xl border flex flex-col justify-between p-5 transition-all duration-200 hover:shadow-xl ${
                prop.has_discrepancy
                  ? "border-amber-500/40 bg-gradient-to-b from-amber-950/10 to-slate-900/80 hover:border-amber-500/60"
                  : "border-slate-800 bg-slate-900/80 hover:border-slate-700"
              }`}
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-white">
                        Survey {prop.survey_number}
                      </h3>
                      {prop.hissa_number && (
                        <Badge variant="outline" className="text-[10px] border-slate-700 bg-slate-800 text-slate-300">
                          Hissa {prop.hissa_number}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      {prop.village}, {prop.district} ({prop.state})
                    </span>
                  </div>

                  {prop.has_discrepancy ? (
                    <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/40 text-[10px]">
                      ⚠ Area Mismatch
                    </Badge>
                  ) : (
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                      ✓ Verified
                    </Badge>
                  )}
                </div>

                {/* Extent & Tenure Table */}
                <div className="rounded-xl bg-slate-950/70 border border-slate-800/80 p-3 text-xs space-y-1.5 my-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Recorded Extent:</span>
                    <span className="font-bold text-emerald-400">
                      {prop.total_area_acres} Acres <span className="text-slate-500 font-normal">({prop.total_area_ha} Ha)</span>
                    </span>
                  </div>
                  {prop.gis_area_ha && (
                    <div className="flex justify-between text-[11px]">
                      <span className="text-slate-400">Cadastral GIS Area:</span>
                      <span className={prop.has_discrepancy ? "text-amber-400 font-medium" : "text-slate-300"}>
                        {prop.gis_area_ha} Ha
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-400">Land Tenure:</span>
                    <span className="text-slate-300 line-clamp-1">
                      {prop.land_tenure || "Occupant Class 1 (भोगवटादार वर्ग १)"}
                    </span>
                  </div>
                  {prop.encumbrances.length > 0 && (
                    <div className="flex justify-between text-[11px] text-purple-300 pt-1 border-t border-slate-800/60">
                      <span>Encumbrance:</span>
                      <span className="font-medium">{prop.encumbrances.join(", ")}</span>
                    </div>
                  )}
                </div>

                {/* Discrepancy Note if applicable */}
                {prop.discrepancy_details && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-2 text-[11px] text-amber-300 mb-3">
                    {prop.discrepancy_details}
                  </div>
                )}

                {/* Last Known Mutation */}
                {prop.last_ownership_event && (
                  <div className="text-[11px] text-slate-400 flex items-start gap-1.5 mb-3">
                    <History className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-1">{prop.last_ownership_event}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
                <Link
                  href={`/owner/properties/${prop.id}`}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600/20 border border-indigo-500/30 hover:bg-indigo-600/30 px-3 py-2 text-xs font-semibold text-indigo-300 transition-colors"
                >
                  <span>View Property</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>

                <Link
                  href={`/owner/gis?survey=${prop.survey_number}`}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-800/80 border border-slate-700 hover:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-300 transition-colors"
                  title="View in Cadastral GIS Map"
                >
                  <Compass className="h-3.5 w-3.5 text-emerald-400" />
                  <span>GIS</span>
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
