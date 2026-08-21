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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Dynamically import Leaflet LiveMap component (client-side only)
const LiveMap = dynamic(() => import("@/components/LiveMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-[#050912] text-[#8B98AA] gap-3">
      <RefreshCw className="w-8 h-8 animate-spin text-teal-400" />
      <span className="text-xs font-mono">Initializing High-Resolution Satellite Tiles...</span>
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
  { name: "Wagholi (Pune, MH)", lat: 18.5805, lng: 73.9810, zoom: 15, desc: "Survey 142 Boundary Overlap" },
  { name: "Guntur City (AP)", lat: 16.3067, lng: 80.4365, zoom: 15, desc: "Telugu Deed Vikraya Dastaaveju" },
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

  // Fetch GeoJSON features
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

  // Filter features
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
    <div className="flex-1 flex flex-col h-screen bg-[#070B14] text-[#F4F7FA] overflow-hidden">
      
      {/* Top Cadastral Command Toolbar */}
      <header className="h-[60px] border-b border-white/[0.08] bg-[#070B14]/90 backdrop-blur-md px-6 flex items-center justify-between gap-4 shrink-0 z-10">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400">
            <Compass className="h-4 w-4 stroke-[1.75]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-semibold text-[#F4F7FA]">Cadastral GIS Intelligence Map</h1>
              <span className="text-[10px] font-mono text-teal-400 bg-teal-500/10 px-1.5 py-0.5 rounded border border-teal-500/20">
                LIVE POSTGIS
              </span>
            </div>
            <p className="text-[11px] text-[#8B98AA] leading-none mt-0.5">
              Interactive high-resolution satellite imagery & WGS-84 cadastral parcel overlay
            </p>
          </div>
        </div>

        {/* Region Presets */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/[0.03] p-1 rounded-lg border border-white/[0.06]">
          <span className="text-[10px] uppercase font-semibold text-[#5F6B7A] px-2 font-mono">Jump:</span>
          {REGION_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() => {
                const matched = features.find((f) => f.properties.village.toLowerCase().includes(preset.name.split(" ")[0].toLowerCase()));
                if (matched) setSelectedParcel(matched);
              }}
              className="text-xs px-2.5 py-1 rounded-md text-[#8B98AA] hover:text-[#F4F7FA] hover:bg-white/[0.06] transition-colors whitespace-nowrap"
            >
              {preset.name.split(" ")[0]}
            </button>
          ))}
        </div>

        {/* Tile Layer & View Controls */}
        <div className="flex items-center gap-2">
          {/* Layer Selector */}
          <div className="flex items-center bg-white/[0.03] p-0.5 rounded-lg border border-white/[0.06] text-xs">
            <button
              onClick={() => setActiveTileLayer("satellite")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTileLayer === "satellite"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-[#8B98AA] hover:text-white"
              }`}
            >
              <Satellite className="w-3.5 h-3.5" />
              <span>Satellite</span>
            </button>
            <button
              onClick={() => setActiveTileLayer("dark")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTileLayer === "dark"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-[#8B98AA] hover:text-white"
              }`}
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span>Dark Command</span>
            </button>
            <button
              onClick={() => setActiveTileLayer("osm")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition-all ${
                activeTileLayer === "osm"
                  ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                  : "text-[#8B98AA] hover:text-white"
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Street</span>
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={fetchParcels}
            className="h-8 border-white/[0.08] bg-white/[0.03] text-[#8B98AA] hover:text-white text-xs gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Sync</span>
          </Button>
        </div>
      </header>

      {/* Main Map Viewport & Right Inspector Panel */}
      <div className="flex-1 flex overflow-hidden relative min-h-0">
        
        {/* Leaflet Live Map Canvas Container */}
        <div className="flex-1 h-full w-full relative flex">
          <LiveMap
            features={filteredFeatures}
            selectedParcel={selectedParcel}
            onSelectParcel={(feat) => setSelectedParcel(feat)}
            tileLayerType={activeTileLayer}
          />

          {/* Floating Map Legend Overlay */}
          <div className="absolute top-4 left-4 z-[400] flex flex-col gap-2 pointer-events-none">
            <div className="bg-[#070B14]/90 backdrop-blur-md border border-white/[0.08] px-3 py-2 rounded-lg shadow-xl text-xs space-y-1 pointer-events-auto max-w-xs">
              <div className="flex items-center justify-between text-[11px] font-semibold text-[#F4F7FA]">
                <span>Cadastral Legend</span>
                <span className="text-[10px] text-teal-400 font-mono">{filteredFeatures.length} Parcels</span>
              </div>
              <div className="flex items-center gap-4 text-[11px] text-[#8B98AA] pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500/80 border border-emerald-400" />
                  <span>Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/80 border border-amber-400" />
                  <span>Flagged</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 border border-red-400" />
                  <span>Critical</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Inspector & Parcel Directory Panel (360px) */}
        <div className="w-80 xl:w-96 border-l border-white/[0.08] bg-[#070B14]/95 backdrop-blur-xl flex flex-col h-full shrink-0 z-10 overflow-hidden shadow-2xl">
          
          {/* Search and Filters */}
          <div className="p-3.5 border-b border-white/[0.08] space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#5F6B7A]" />
              <input
                type="text"
                placeholder="Search survey no, village, owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-8 pl-8 pr-3 bg-white/[0.03] border border-white/[0.06] rounded-lg text-xs text-[#F4F7FA] placeholder-[#5F6B7A] focus:outline-none"
              />
            </div>

            <div className="flex gap-1.5">
              {["ALL", "FLAGGED", "VERIFIED"].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`flex-1 py-1 rounded-md text-[11px] font-medium transition-all ${
                    statusFilter === st
                      ? "bg-teal-500/20 text-teal-300 border border-teal-500/30"
                      : "text-[#8B98AA] hover:bg-white/[0.04]"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Parcel Inspector */}
          {selectedParcel && (
            <div className="p-4 border-b border-white/[0.08] bg-white/[0.02] space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-teal-400 font-mono">
                    Cadastral Plot Selected
                  </span>
                  <h3 className="text-base font-bold text-[#F4F7FA]">
                    Survey No. {p?.survey_number}
                  </h3>
                  <p className="text-xs text-[#8B98AA]">
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

              <div className="grid grid-cols-2 gap-2 text-xs bg-black/40 p-2.5 rounded-lg border border-white/[0.04]">
                <div>
                  <span className="text-[10px] text-[#5F6B7A] block">GIS Area</span>
                  <strong className="text-white font-mono">{p?.area_hectares} Ha</strong>
                </div>
                <div>
                  <span className="text-[10px] text-[#5F6B7A] block">Confidence</span>
                  <strong className="text-teal-400 font-mono">{Math.round((p?.confidence_score || 1) * 100)}%</strong>
                </div>
                <div className="col-span-2">
                  <span className="text-[10px] text-[#5F6B7A] block">Registered Khatadars</span>
                  <strong className="text-slate-200 truncate block">
                    {p?.owners?.length ? p.owners.join(", ") : "—"}
                  </strong>
                </div>
              </div>

              {p?.land_record_id && (
                <Link href={`/verification/${p.land_record_id}`} className="block">
                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs h-8 gap-1.5">
                    <span>Inspect Human Verification Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Parcel Directory List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#5F6B7A] font-mono">
              Parcels Directory ({filteredFeatures.length})
            </div>

            {filteredFeatures.map((feat) => {
              const fp = feat.properties;
              const isSelected = selectedParcel?.properties?.parcel_id === fp.parcel_id;
              return (
                <button
                  key={fp.parcel_id}
                  onClick={() => setSelectedParcel(feat)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                    isSelected
                      ? "bg-teal-500/10 border-teal-500/40 text-white"
                      : "bg-white/[0.02] border-white/[0.04] text-[#8B98AA] hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span>Survey {fp.survey_number}</span>
                    <span className="text-[10px] font-mono">{fp.area_hectares} Ha</span>
                  </div>
                  <div className="text-[11px] text-[#5F6B7A] truncate mt-0.5">
                    {fp.village}, {fp.district}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
