"use client";

import React, { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowRight,
  Compass,
  FileText,
  Filter,
  Globe,
  MapPin,
  RefreshCw,
  Search,
  Satellite,
  Map as MapIcon,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Topbar } from "@/components/Topbar";

// Dynamically import Leaflet LiveMap component (client-side only)
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-surface-container-low text-on-surface-variant gap-3">
      <RefreshCw className="w-8 h-8 animate-spin text-primary" />
      <span className="text-xs font-mono">Initializing High-Resolution Cadastral Satellite Tiles...</span>
    </div>
  ),
});

interface GeoFeature {
  id: number;
  type: string;
  geometry: {
    type: string;
    coordinates: number[][][];
  };
  properties: {
    parcel_id: number;
    survey_number: string;
    village: string;
    district: string;
    state: string;
    area_hectares: number;
    land_record_id: number | null;
    validation_status: string;
    owners: string[];
    confidence_score: number;
  };
}

const REGION_PRESETS = [
  { name: "Wagholi (Pune, MH)", lat: 18.5805, lng: 73.9810, zoom: 15, desc: "Survey 142 Boundary" },
  { name: "Guntur City (AP)", lat: 16.3067, lng: 80.4365, zoom: 15, desc: "Telugu Deed Vikraya" },
  { name: "Jaipur Bassi (RJ)", lat: 26.8500, lng: 75.8000, zoom: 15, desc: "Patta Vilekh Lease Plot" },
  { name: "Devanahalli (BLR, KA)", lat: 13.2485, lng: 77.7140, zoom: 15, desc: "Survey 204 RTC Pahani" },
];

export default function GISMapExplorerPage() {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<GeoFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTileLayer, setActiveTileLayer] = useState<"satellite" | "dark" | "osm">("satellite");

  const fetchParcels = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/parcels");
      if (res.ok) {
        const data = await res.json();
        const feats = data.features || [];
        const comprehensiveFeats: GeoFeature[] = [
          ...feats,
          {
            id: 101,
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [80.4340, 16.3040],
                [80.4390, 16.3040],
                [80.4390, 16.3090],
                [80.4340, 16.3090],
                [80.4340, 16.3040]
              ]]
            },
            properties: {
              parcel_id: 101,
              survey_number: "0/GNT",
              village: "Guntur City",
              district: "Guntur",
              state: "Andhra Pradesh",
              area_hectares: 0.85,
              land_record_id: 4,
              validation_status: "VERIFIED_MANUAL",
              owners: ["Vemula Mallikarjuna Rao", "Gundapaneni Vijayalakshmi"],
              confidence_score: 0.96
            }
          },
          {
            id: 102,
            type: "Feature",
            geometry: {
              type: "Polygon",
              coordinates: [[
                [75.7970, 26.8470],
                [75.8030, 26.8470],
                [75.8030, 26.8530],
                [75.7970, 26.8530],
                [75.7970, 26.8470]
              ]]
            },
            properties: {
              parcel_id: 102,
              survey_number: "PATTA-245243",
              village: "Durgapura, Jaipur",
              district: "Jaipur",
              state: "Rajasthan",
              area_hectares: 1.20,
              land_record_id: 1,
              validation_status: "VERIFIED_WITH_WARNINGS",
              owners: ["Governor of Rajasthan", "Vagish Chandra Sharma"],
              confidence_score: 0.98
            }
          }
        ];
        setFeatures(comprehensiveFeats);
        setSelectedParcel(comprehensiveFeats[0]);
      } else {
        loadMockParcels();
      }
    } catch {
      loadMockParcels();
    } finally {
      setLoading(false);
    }
  };

  const loadMockParcels = () => {
    const mock: GeoFeature[] = [
      {
        id: 1,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.9780, 18.5780],
            [73.9810, 18.5780],
            [73.9810, 18.5830],
            [73.9780, 18.5830],
            [73.9780, 18.5780]
          ]]
        },
        properties: {
          parcel_id: 1,
          survey_number: "142/2A",
          village: "Wagholi",
          district: "Pune",
          state: "Maharashtra",
          area_hectares: 1.50,
          land_record_id: 1,
          validation_status: "FLAGGED_FOR_REVIEW",
          owners: ["Ramesh Shankarrao Patil", "Suresh Shankarrao Patil"],
          confidence_score: 0.76
        }
      },
      {
        id: 2,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.9810, 18.5780],
            [73.9840, 18.5780],
            [73.9840, 18.5830],
            [73.9810, 18.5830],
            [73.9810, 18.5780]
          ]]
        },
        properties: {
          parcel_id: 2,
          survey_number: "142/2B",
          village: "Wagholi",
          district: "Pune",
          state: "Maharashtra",
          area_hectares: 1.50,
          land_record_id: 2,
          validation_status: "VERIFIED_CLEAR",
          owners: ["Govind Rao Patil"],
          confidence_score: 0.95
        }
      },
      {
        id: 3,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [73.9850, 18.5840],
            [73.9910, 18.5840],
            [73.9910, 18.5900],
            [73.9850, 18.5900],
            [73.9850, 18.5840]
          ]]
        },
        properties: {
          parcel_id: 3,
          survey_number: "88/1",
          village: "Haveli",
          district: "Pune",
          state: "Maharashtra",
          area_hectares: 2.20,
          land_record_id: 3,
          validation_status: "VERIFIED_MANUAL",
          owners: ["Smt. Sunita Ramesh Patil"],
          confidence_score: 0.98
        }
      },
      {
        id: 4,
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.7100, 13.2450],
            [77.7180, 13.2450],
            [77.7180, 13.2520],
            [77.7100, 13.2520],
            [77.7100, 13.2450]
          ]]
        },
        properties: {
          parcel_id: 4,
          survey_number: "204",
          village: "Devanahalli",
          district: "Bengaluru Rural",
          state: "Karnataka",
          area_hectares: 3.10,
          land_record_id: 4,
          validation_status: "REJECTED_CRITICAL",
          owners: ["G. Venkatesh"],
          confidence_score: 0.62
        }
      }
    ];
    setFeatures(mock);
    setSelectedParcel(mock[0]);
  };

  useEffect(() => {
    fetchParcels();
  }, []);

  const filteredFeatures = useMemo(() => {
    return features.filter((feat) => {
      const p = feat.properties;
      const matchesSearch =
        p.survey_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.owners.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()));

      if (statusFilter === "ALL") return matchesSearch;
      if (statusFilter === "FLAGGED") return matchesSearch && (p.validation_status.includes("FLAGGED") || p.confidence_score < 0.85);
      if (statusFilter === "VERIFIED") return matchesSearch && p.validation_status.includes("VERIFIED");
      return matchesSearch;
    });
  }, [features, searchQuery, statusFilter]);

  const p = selectedParcel?.properties;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px] overflow-hidden">
      {/* Top Navigation */}
      <Topbar />

      {/* Cadastral GIS Explorer Toolbar */}
      <div className="h-14 bg-surface border-b border-outline-variant px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-on-surface">Cadastral GIS Intelligence Map</h2>
              <span className="text-[10px] font-mono text-primary bg-primary-fixed/40 px-1.5 py-0.2 rounded border border-primary/20">
                PostGIS Live
              </span>
            </div>
          </div>
        </div>

        {/* Region Jumps */}
        <div className="hidden lg:flex items-center gap-1.5 bg-surface-container-low p-1 rounded-lg border border-outline-variant">
          <span className="text-[10px] font-bold uppercase text-on-surface-variant px-1.5">Jump:</span>
          {REGION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                const matched = features.find((f) => f.properties.village.toLowerCase().includes(preset.name.split(" ")[0].toLowerCase()));
                if (matched) setSelectedParcel(matched);
              }}
              className="text-xs px-2 py-0.5 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors cursor-pointer"
            >
              {preset.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Layer Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant text-xs">
            <button
              onClick={() => setActiveTileLayer("satellite")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                activeTileLayer === "satellite"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setActiveTileLayer("dark")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                activeTileLayer === "dark"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Dark Command
            </button>
            <button
              onClick={() => setActiveTileLayer("osm")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                activeTileLayer === "osm"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Street
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchParcels}
            className="h-8 text-xs font-semibold gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Sync</span>
          </Button>
        </div>
      </div>

      {/* Main Map Canvas & Right Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0 split-pane">
        
        {/* Leaflet Live Map Canvas */}
        <div className="flex-1 h-full w-full relative flex">
          <LiveMap
            features={filteredFeatures}
            selectedParcel={selectedParcel}
            onSelectParcel={(feat) => setSelectedParcel(feat)}
            tileLayerType={activeTileLayer}
          />

          {/* Floating Legend */}
          <div className="absolute top-4 left-4 z-[400] bg-surface/95 backdrop-blur-md border border-outline-variant p-3 rounded-xl shadow-md text-xs space-y-1.5 max-w-xs">
            <div className="flex items-center justify-between font-bold text-on-surface">
              <span>Cadastral Legend</span>
              <span className="text-[10px] font-mono text-primary">{filteredFeatures.length} Parcels</span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-on-surface-variant pt-1 border-t border-outline-variant">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#15803D]" />
                <span>Verified</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                <span>Flagged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-error" />
                <span>Conflict</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector & Directory Panel (360px) */}
        <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface flex flex-col h-auto lg:h-full shrink-0 z-10 overflow-hidden shadow-sm">
          
          {/* Search & Filter */}
          <div className="p-3.5 border-b border-outline-variant space-y-2 bg-surface-container-low">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-on-surface-variant" />
              <input
                type="text"
                placeholder="Search survey no, village, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-surface border border-outline-variant rounded-lg text-xs text-on-surface placeholder:text-on-surface-variant focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="flex gap-1.5">
              {["ALL", "FLAGGED", "VERIFIED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-semibold transition-colors border ${
                    statusFilter === st
                      ? "bg-primary text-on-primary border-primary"
                      : "bg-surface text-on-surface-variant border-outline-variant hover:bg-surface-container"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Parcel Inspector */}
          {selectedParcel && (
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary tracking-wider">
                    Cadastral Plot Selected
                  </span>
                  <h3 className="text-base font-bold text-on-surface">
                    Survey No. {p?.survey_number}
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {p?.village}, {p?.district}, {p?.state}
                  </p>
                </div>
                <Badge
                  variant={
                    p?.validation_status.includes("VERIFIED")
                      ? "verified"
                      : p?.validation_status.includes("REJECTED")
                      ? "destructive"
                      : "warning"
                  }
                  className="text-[10px]"
                >
                  {p?.validation_status}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-surface-container-low p-2.5 rounded-lg border border-outline-variant">
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-semibold">GIS Area</span>
                  <strong className="text-on-surface font-mono">{p?.area_hectares} Ha</strong>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-semibold">Confidence</span>
                  <strong className="text-primary font-mono">{Math.round((p?.confidence_score || 1) * 100)}%</strong>
                </div>
                <div className="col-span-2 pt-1 border-t border-outline-variant/60">
                  <span className="text-[10px] text-on-surface-variant block font-semibold">Registered Khatadars</span>
                  <strong className="text-on-surface truncate block">
                    {p?.owners?.length ? p.owners.join(", ") : "—"}
                  </strong>
                </div>
              </div>

              {p && (
                <Link
                  href={`/verification/${p.land_record_id || p.parcel_id || 1}`}
                  className="block"
                >
                  <Button className="w-full bg-primary text-on-primary text-xs h-9 gap-2 font-bold shadow-md hover:bg-primary/90">
                    <FileText className="w-4 h-4" />
                    <span>Open Verification &amp; Deed Record</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Parcel Directory List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            <div className="flex items-center justify-between px-2 py-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Parcels Directory ({filteredFeatures.length})
              </span>
              <span className="text-[10px] text-primary font-medium">Click to Zoom</span>
            </div>

            {filteredFeatures.map((feat) => {
              const fp = feat.properties;
              const isSelected = selectedParcel?.properties?.parcel_id === fp.parcel_id;
              const recordId = fp.land_record_id || fp.parcel_id || 1;

              return (
                <div
                  key={fp.parcel_id}
                  onClick={() => setSelectedParcel(feat)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? "bg-primary-container/15 border-primary shadow-sm"
                      : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-on-surface">
                    <div className="flex items-center gap-1.5">
                      <MapPin className={`w-3.5 h-3.5 ${isSelected ? "text-primary" : "text-on-surface-variant"}`} />
                      <span>Survey {fp.survey_number}</span>
                    </div>
                    <span className="font-mono text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded border border-outline-variant">
                      {fp.area_hectares} Ha
                    </span>
                  </div>

                  <div className="text-[11px] text-on-surface-variant truncate mt-1">
                    {fp.village}, {fp.district} ({fp.state})
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-outline-variant/60 flex items-center justify-between text-[11px]">
                    <span className="text-[10px] text-primary font-semibold flex items-center gap-1">
                      <Compass className="w-3 h-3" /> Zoom Map
                    </span>
                    <Link
                      href={`/verification/${recordId}`}
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 font-bold text-indigo-400 hover:text-indigo-300 transition-colors"
                    >
                      <span>Verification Record</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </aside>
      </div>
    </div>
  );
}
