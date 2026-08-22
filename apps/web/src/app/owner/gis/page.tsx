"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  Layers,
  MapPin,
  RefreshCw,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant gap-3">
      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      <span className="text-xs font-mono">Loading Cadastral Satellite Map...</span>
    </div>
  ),
});

function OwnerGISContent() {
  const searchParams = useSearchParams();
  const initialSurvey = searchParams ? searchParams.get("survey") : null;

  const [features, setFeatures] = useState<any[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [tileLayer, setTileLayer] = useState<"satellite" | "dark" | "osm">("satellite");
  const [loading, setLoading] = useState(true);

  // Search & Pagination State
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(4);

  useEffect(() => {
    fetchGISData();
  }, []);

  const fetchGISData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("land_ai_token");
      const headers: HeadersInit = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const res = await fetch("http://localhost:8000/api/owner/gis", { headers });
      if (res.ok) {
        const geojson = await res.json();
        const feats = (geojson.features || []).map((f: any) => ({
          id: f.id,
          type: "Feature",
          geometry: f.geometry,
          properties: {
            parcel_id: f.id,
            survey_number: f.properties.survey_number,
            village: f.properties.village,
            district: f.properties.district,
            state: f.properties.state,
            area_hectares: f.properties.area_ha,
            land_record_id: f.properties.land_record_id,
            validation_status: "VERIFIED",
            owners: ["Nishu Kumar"],
            confidence_score: 0.98,
          },
        }));

        if (feats.length > 0) {
          setFeatures(feats);
          if (initialSurvey) {
            const match = feats.find(
              (p: any) => p.properties.survey_number.toLowerCase() === initialSurvey.toLowerCase()
            );
            if (match) setSelectedParcel(match);
            else setSelectedParcel(feats[0]);
          } else {
            setSelectedParcel(feats[0]);
          }
        } else {
          loadMockOwnerGIS();
        }
      } else {
        loadMockOwnerGIS();
      }
    } catch {
      loadMockOwnerGIS();
    } finally {
      setLoading(false);
    }
  };

  const loadMockOwnerGIS = () => {
    const mockFeats = [
      {
        id: 1,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [80.1900, 12.9200],
            [80.1940, 12.9200],
            [80.1940, 12.9240],
            [80.1900, 12.9240],
            [80.1900, 12.9200]
          ]],
        },
        properties: {
          parcel_id: 1,
          survey_number: "204/5B",
          village: "Medavakkam",
          district: "Chennai",
          state: "Tamil Nadu",
          area_hectares: 0.97,
          land_record_id: 1,
          validation_status: "FLAGGED_FOR_REVIEW",
          owners: ["Nishu Kumar"],
          confidence_score: 0.76,
        },
      },
      {
        id: 2,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.7450, 12.9700],
            [77.7490, 12.9700],
            [77.7490, 12.9740],
            [77.7450, 12.9740],
            [77.7450, 12.9700]
          ]],
        },
        properties: {
          parcel_id: 2,
          survey_number: "18/2",
          village: "Whitefield",
          district: "Bengaluru",
          state: "Karnataka",
          area_hectares: 0.34,
          land_record_id: 2,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.99,
        },
      },
      {
        id: 3,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.7140, 13.2485],
            [77.7190, 13.2485],
            [77.7190, 13.2530],
            [77.7140, 13.2530],
            [77.7140, 13.2485]
          ]],
        },
        properties: {
          parcel_id: 3,
          survey_number: "88/3A",
          village: "Devanahalli",
          district: "Bengaluru Rural",
          state: "Karnataka",
          area_hectares: 1.45,
          land_record_id: 3,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.96,
        },
      },
      {
        id: 4,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.9810, 18.5805],
            [73.9850, 18.5805],
            [73.9850, 18.5845],
            [73.9810, 18.5845],
            [73.9810, 18.5805]
          ]],
        },
        properties: {
          parcel_id: 4,
          survey_number: "142/2A",
          village: "Wagholi",
          district: "Pune",
          state: "Maharashtra",
          area_hectares: 1.20,
          land_record_id: 4,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.95,
        },
      },
      {
        id: 5,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [80.4340, 16.3040],
            [80.4390, 16.3040],
            [80.4390, 16.3090],
            [80.4340, 16.3090],
            [80.4340, 16.3040]
          ]],
        },
        properties: {
          parcel_id: 5,
          survey_number: "0/GNT",
          village: "Guntur City",
          district: "Guntur",
          state: "Andhra Pradesh",
          area_hectares: 0.85,
          land_record_id: 5,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.92,
        },
      },
      {
        id: 6,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [75.8000, 26.8500],
            [75.8040, 26.8500],
            [75.8040, 26.8540],
            [75.8000, 26.8540],
            [75.8000, 26.8500]
          ]],
        },
        properties: {
          parcel_id: 6,
          survey_number: "PATTA-245243",
          village: "Durgapura",
          district: "Jaipur",
          state: "Rajasthan",
          area_hectares: 0.52,
          land_record_id: 6,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.91,
        },
      },
      {
        id: 7,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [78.4300, 17.2400],
            [78.4350, 17.2400],
            [78.4350, 17.2450],
            [78.4300, 17.2450],
            [78.4300, 17.2400]
          ]],
        },
        properties: {
          parcel_id: 7,
          survey_number: "45/1C",
          village: "Shamshabad",
          district: "Rangareddy",
          state: "Telangana",
          area_hectares: 2.10,
          land_record_id: 7,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.97,
        },
      },
      {
        id: 8,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.7300, 18.5900],
            [73.7340, 18.5900],
            [73.7340, 18.5940],
            [73.7300, 18.5940],
            [73.7300, 18.5900]
          ]],
        },
        properties: {
          parcel_id: 8,
          survey_number: "112/4",
          village: "Hinjawadi Phase 1",
          district: "Pune",
          state: "Maharashtra",
          area_hectares: 0.78,
          land_record_id: 8,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.94,
        },
      },
      {
        id: 9,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.5900, 13.1000],
            [77.5940, 13.1000],
            [77.5940, 13.1040],
            [77.5900, 13.1040],
            [77.5900, 13.1000]
          ]],
        },
        properties: {
          parcel_id: 9,
          survey_number: "67/2",
          village: "Yelahanka",
          district: "Bengaluru Urban",
          state: "Karnataka",
          area_hectares: 1.15,
          land_record_id: 9,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.96,
        },
      },
      {
        id: 10,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [79.9400, 12.9800],
            [79.9450, 12.9800],
            [79.9450, 12.9850],
            [79.9400, 12.9850],
            [79.9400, 12.9800]
          ]],
        },
        properties: {
          parcel_id: 10,
          survey_number: "310/A",
          village: "Sriperumbudur",
          district: "Kanchipuram",
          state: "Tamil Nadu",
          area_hectares: 1.88,
          land_record_id: 10,
          validation_status: "VERIFIED",
          owners: ["Nishu Kumar"],
          confidence_score: 0.98,
        },
      },
    ];
    setFeatures(mockFeats);
    setSelectedParcel(mockFeats[0]);
  };

  // Filter parcels based on search query
  const filteredParcels = features.filter((feat) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const fp = feat.properties;
    return (
      fp.survey_number?.toLowerCase().includes(q) ||
      fp.village?.toLowerCase().includes(q) ||
      fp.district?.toLowerCase().includes(q) ||
      fp.state?.toLowerCase().includes(q)
    );
  });

  // Calculate Pagination
  const totalItems = filteredParcels.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const paginatedParcels = filteredParcels.slice(startIndex, endIndex);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const p = selectedParcel?.properties;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px] overflow-hidden">
      {/* Top Navigation */}
      <Topbar />

      {/* Header bar */}
      <div className="p-3 sm:px-6 border-b border-outline-variant bg-surface flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-primary-container/20 text-primary">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-on-surface leading-tight">
              Cadastral GIS Land Explorer
            </h1>
            <p className="text-[11px] text-on-surface-variant hidden sm:block">
              Interactive high-resolution satellite imagery overlaid with surveyed spatial boundary polygons
            </p>
          </div>
        </div>

        {/* Tile Switcher */}
        <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl border border-outline-variant text-xs">
          <button
            onClick={() => setTileLayer("satellite")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              tileLayer === "satellite"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Satellite
          </button>
          <button
            onClick={() => setTileLayer("osm")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              tileLayer === "osm"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Streets
          </button>
          <button
            onClick={() => setTileLayer("dark")}
            className={`px-3 py-1 rounded-lg font-medium transition-all cursor-pointer ${
              tileLayer === "dark"
                ? "bg-primary text-on-primary shadow-sm"
                : "text-on-surface-variant hover:text-on-surface"
            }`}
          >
            Dark Vector
          </button>
        </div>
      </div>

      {/* Main Map + Inspector Layout */}
      <div className="flex-1 flex flex-col lg:flex-row relative overflow-hidden">
        
        {/* Left Interactive Map Canvas */}
        <div className="flex-1 relative h-[50vh] lg:h-full w-full">
          <LiveMap
            features={features}
            selectedParcel={selectedParcel}
            onSelectParcel={setSelectedParcel}
            tileLayerType={tileLayer}
          />
        </div>

        {/* Right Inspector & Property Selector */}
        <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface flex flex-col h-auto lg:h-full shrink-0 z-10 overflow-hidden shadow-sm">
          {selectedParcel && (
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest space-y-3 shrink-0">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                  Selected Parcel
                </span>
                <h3 className="text-base font-bold text-on-surface">
                  Survey No. {p?.survey_number}
                </h3>
                <p className="text-xs text-on-surface-variant">
                  {p?.village}, {p?.district}, {p?.state}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-semibold">Extent Area</span>
                  <strong className="text-on-surface font-mono">{p?.area_hectares} Ha</strong>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-semibold">Status</span>
                  <strong className="text-primary">{p?.validation_status}</strong>
                </div>
              </div>

              {p && (
                <Link
                  href={`/owner/properties/${p.land_record_id || p.parcel_id || 1}`}
                  className="block"
                >
                  <Button className="w-full bg-primary text-on-primary text-xs h-9 gap-2 font-bold shadow-md hover:bg-primary/90">
                    <FileCheck2 className="w-4 h-4" />
                    <span>Open Verified Deed &amp; Document</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Directory Header with Count & Search */}
          <div className="px-3 pt-3 pb-2 border-b border-outline-variant/60 bg-surface shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-on-surface flex items-center gap-1.5">
                <span>Your Land Parcels</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold border border-primary/20">
                  {features.length}
                </span>
              </span>
              <span className="text-[10px] text-primary font-bold">Click to Zoom Map</span>
            </div>

            {/* Quick Search Input */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-on-surface-variant absolute left-2.5 top-2.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Filter by survey no, village, or state..."
                className="w-full bg-surface-container-low border border-outline-variant rounded-lg pl-8 pr-7 py-1.5 text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-2 text-on-surface-variant hover:text-on-surface cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Directory of Owned Parcels with Explicit Custom Scrollbar */}
          <div
            className="flex-1 overflow-y-scroll p-3 space-y-2 custom-scrollbar min-h-[220px] max-h-[360px] lg:max-h-[calc(100vh-450px)]"
            style={{ scrollbarGutter: "stable" }}
          >
            {paginatedParcels.length === 0 ? (
              <div className="py-8 text-center space-y-1">
                <MapPin className="w-6 h-6 text-on-surface-variant mx-auto opacity-40" />
                <p className="text-xs font-semibold text-on-surface">No parcels match filter</p>
                <p className="text-[11px] text-on-surface-variant">Try adjusting your search query.</p>
              </div>
            ) : (
              paginatedParcels.map((feat) => {
                const fp = feat.properties;
                const isSelected = selectedParcel?.properties?.parcel_id === fp.parcel_id;
                const recordId = fp.land_record_id || fp.parcel_id || 1;

                return (
                  <div
                    key={fp.parcel_id}
                    onClick={() => setSelectedParcel(feat)}
                    className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group ${
                      isSelected
                        ? "bg-primary-container/15 border-primary shadow-sm ring-1 ring-primary/40"
                        : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                      <div className="flex items-center gap-1.5">
                        <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-on-surface-variant"}`} />
                        <span>Survey No. {fp.survey_number}</span>
                      </div>
                      <span className="font-mono text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant font-bold text-on-surface">
                        {fp.area_hectares} Ha
                      </span>
                    </div>

                    <div className="text-[11px] text-on-surface-variant truncate mt-1">
                      {fp.village}, {fp.district} ({fp.state})
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px]">
                      <span className="text-[10px] text-primary font-bold flex items-center gap-1">
                        <Compass className="w-3 h-3" /> Zoom Map
                      </span>
                      <Link
                        href={`/owner/properties/${recordId}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 font-bold text-primary hover:underline transition-colors"
                      >
                        <span>Deed Document</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Pagination Controls Footer */}
          <div className="p-3 border-t border-outline-variant bg-surface-container-low shrink-0 flex items-center justify-between text-xs">
            <div className="text-[11px] text-on-surface-variant">
              {totalItems > 0 ? (
                <span>
                  Showing <strong className="text-on-surface">{startIndex + 1}</strong>–<strong className="text-on-surface">{endIndex}</strong> of <strong className="text-on-surface">{totalItems}</strong>
                </span>
              ) : (
                <span>0 parcels</span>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handlePageChange(validCurrentPage - 1)}
                disabled={validCurrentPage <= 1}
                className="p-1 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-on-surface cursor-pointer"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {/* Page Number Badges */}
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pNum) => (
                  <button
                    key={pNum}
                    onClick={() => handlePageChange(pNum)}
                    className={`min-w-6 h-6 px-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                      validCurrentPage === pNum
                        ? "bg-primary text-on-primary border-primary shadow-xs"
                        : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                    }`}
                  >
                    {pNum}
                  </button>
                ))}
              </div>

              <button
                onClick={() => handlePageChange(validCurrentPage + 1)}
                disabled={validCurrentPage >= totalPages}
                className="p-1 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-on-surface cursor-pointer"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}

export default function OwnerGISPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-surface">
          <RefreshCw className="w-6 h-6 animate-spin text-primary" />
        </div>
      }
    >
      <OwnerGISContent />
    </Suspense>
  );
}
