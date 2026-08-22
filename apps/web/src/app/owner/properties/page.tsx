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
import { Topbar } from "@/components/Topbar";

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
      if (res.ok) {
        const data: PropertyItem[] = await res.json();
        setProperties(data);
      } else {
        loadMockProperties();
      }
    } catch {
      loadMockProperties();
    } finally {
      setLoading(false);
    }
  };

  const loadMockProperties = () => {
    setProperties([
      {
        id: 1,
        survey_number: "204/5B",
        hissa_number: "5B",
        village: "Medavakkam",
        taluk: "Tambaram",
        district: "Chennai",
        state: "Tamil Nadu",
        total_area_ha: 0.97,
        total_area_acres: 2.40,
        area_unit: "Acres",
        land_tenure: "Ryotwari Patta",
        validation_status: "ATTENTION_REQUIRED",
        has_discrepancy: true,
        discrepancy_details: "On-ground cadastral boundary overlaps with parcel 204/5C by 0.12 Acres.",
        gis_area_ha: 0.92,
        mutation_count: 3,
        encumbrances: [],
        last_ownership_event: "Inheritance Mutation (2018)",
      },
      {
        id: 2,
        survey_number: "18/2",
        village: "Whitefield",
        taluk: "KR Puram",
        district: "Bengaluru",
        state: "Karnataka",
        total_area_ha: 0.34,
        total_area_acres: 0.85,
        area_unit: "Acres",
        land_tenure: "Converted Commercial",
        validation_status: "VERIFIED",
        has_discrepancy: false,
        gis_area_ha: 0.34,
        mutation_count: 2,
        encumbrances: ["State Bank Lien (NOC Attached)"],
        last_ownership_event: "Registered Sale Deed (2015)",
      },
      {
        id: 3,
        survey_number: "45/A",
        village: "Hinjawadi",
        taluk: "Mulshi",
        district: "Pune",
        state: "Maharashtra",
        total_area_ha: 0.06,
        total_area_acres: 0.15,
        area_unit: "Acres",
        land_tenure: "Occupant Class 1 (भोगवटादार १)",
        validation_status: "VERIFIED",
        has_discrepancy: false,
        gis_area_ha: 0.06,
        mutation_count: 4,
        encumbrances: [],
        last_ownership_event: "Partition Deed (2019)",
      },
    ]);
  };

  const states = ["all", "Karnataka", "Telangana", "Maharashtra", "Tamil Nadu", "Rajasthan"];

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
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px]">
      {/* Top Navigation */}
      <Topbar />

      {/* Main Content Canvas */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Citizen Land Vault • मेरी भूमि
              </span>
              <Badge variant="outline" className="text-[10px]">
                {properties.length} Verified Properties
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-on-surface">
              My Land Records &amp; Holdings
            </h1>
            <p className="text-xs sm:text-sm text-on-surface-variant mt-0.5">
              Verified cadastral parcels, land extents, tenure categories, and boundary audit statuses across all states.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/copilot">
              <Button size="sm" className="bg-primary text-on-primary text-xs font-semibold gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Ask Copilot About Properties</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-outline-variant shadow-sm">
          
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-on-surface-variant" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by survey number, village, district, or state..."
              className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-3 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          {/* State Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {states.map((st) => (
              <button
                key={st}
                onClick={() => setSelectedState(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                  selectedState === st
                    ? "bg-primary text-on-primary border-primary shadow-sm"
                    : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
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
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                selectedStatus === "all"
                  ? "bg-primary text-on-primary border-primary"
                  : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setSelectedStatus("attention")}
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer border ${
                selectedStatus === "attention"
                  ? "bg-[#EA580C] text-white border-[#EA580C]"
                  : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
              }`}
            >
              Needs Attention
            </button>
          </div>

        </div>

        {/* Loading / Empty / Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-2">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
            <span className="text-xs text-on-surface-variant font-medium">Retrieving verified properties...</span>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="rounded-xl border border-outline-variant bg-surface p-12 text-center space-y-2">
            <MapPin className="w-8 h-8 text-on-surface-variant mx-auto" />
            <h3 className="text-base font-bold text-on-surface">No Properties Found</h3>
            <p className="text-xs text-on-surface-variant">Try adjusting your active search query or state filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredProperties.map((prop) => (
              <div
                key={prop.id}
                className={`rounded-xl border flex flex-col justify-between p-5 transition-all shadow-[0_2px_4px_rgba(23,32,27,0.04)] hover:shadow-md ${
                  prop.has_discrepancy
                    ? "border-[#FDBA74] bg-[#FFF7ED]"
                    : "border-outline-variant bg-surface"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-on-surface">
                          Survey {prop.survey_number}
                        </h3>
                        {prop.hissa_number && (
                          <Badge variant="outline" className="text-[10px]">
                            Hissa {prop.hissa_number}
                          </Badge>
                        )}
                      </div>
                      <span className="text-xs text-on-surface-variant block mt-0.5">
                        {prop.village}, {prop.district} ({prop.state})
                      </span>
                    </div>

                    <Badge variant={prop.has_discrepancy ? "warning" : "verified"} className="text-[10px]">
                      {prop.has_discrepancy ? "⚠ Mismatch" : "✓ Verified"}
                    </Badge>
                  </div>

                  {/* Extent & Tenure Table */}
                  <div className="rounded-lg bg-surface-container-low border border-outline-variant p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant">Recorded Extent:</span>
                      <span className="font-bold text-primary font-mono">
                        {prop.total_area_acres} Acres <span className="text-on-surface-variant font-normal">({prop.total_area_ha} Ha)</span>
                      </span>
                    </div>
                    {prop.gis_area_ha && (
                      <div className="flex justify-between text-[11px]">
                        <span className="text-on-surface-variant">Cadastral GIS Area:</span>
                        <span className={`font-mono ${prop.has_discrepancy ? "text-[#C2410C] font-bold" : "text-on-surface"}`}>
                          {prop.gis_area_ha} Ha
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px]">
                      <span className="text-on-surface-variant">Land Tenure:</span>
                      <span className="text-on-surface line-clamp-1">{prop.land_tenure || "Ryotwari Occupant"}</span>
                    </div>
                    {prop.encumbrances && prop.encumbrances.length > 0 && (
                      <div className="flex justify-between text-[11px] text-[#4338CA] pt-1 border-t border-outline-variant/60">
                        <span>Encumbrance:</span>
                        <span className="font-semibold">{prop.encumbrances.join(", ")}</span>
                      </div>
                    )}
                  </div>

                  {/* Discrepancy Note */}
                  {prop.discrepancy_details && (
                    <div className="rounded-lg bg-[#FFEDD5] border border-[#FDBA74] p-2.5 text-xs text-[#9A3412]">
                      {prop.discrepancy_details}
                    </div>
                  )}

                  {/* Last Known Mutation */}
                  {prop.last_ownership_event && (
                    <div className="text-[11px] text-on-surface-variant flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-outline" />
                      <span className="truncate">{prop.last_ownership_event}</span>
                    </div>
                  )}
                </div>

                {/* Card Actions */}
                <div className="pt-4 border-t border-outline-variant/60 flex items-center gap-2 mt-4">
                  <Link
                    href={`/owner/properties/${prop.id}`}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary text-on-primary px-3 py-2 text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
                  >
                    <span>View Property</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/owner/gis?survey=${prop.survey_number}`}
                    className="inline-flex items-center justify-center gap-1 rounded-lg bg-surface border border-outline-variant hover:bg-surface-container-high px-3 py-2 text-xs font-semibold text-on-surface transition-colors"
                    title="View in Cadastral GIS Map"
                  >
                    <Compass className="w-3.5 h-3.5 text-primary" />
                    <span>GIS</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
