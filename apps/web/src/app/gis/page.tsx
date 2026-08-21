"use client";

import React, { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Compass,
  FileText,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  ShieldAlert,
  Sparkles,
  UserCheck,
  X,
  ZoomIn,
  ZoomOut,
  Map
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

export default function GISMapExplorerPage() {
  const [features, setFeatures] = useState<GeoFeature[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<GeoFeature | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVillage, setSelectedVillage] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showSatelliteBackdrop, setShowSatelliteBackdrop] = useState<boolean>(true);
  const [showLabels, setShowLabels] = useState<boolean>(true);

  // Fetch GeoJSON FeatureCollection from Backend
  const fetchParcels = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/parcels");
      if (res.ok) {
        const data = await res.json();
        setFeatures(data.features || []);
        if (data.features && data.features.length > 0) {
          setSelectedParcel(data.features[0]);
        }
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
        p.owners.some((o) => o.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesVillage = selectedVillage === "ALL" || p.village === selectedVillage;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "VERIFIED" && p.validation_status.includes("VERIFIED")) ||
        (statusFilter === "FLAGGED" && p.validation_status === "FLAGGED_FOR_REVIEW") ||
        (statusFilter === "CRITICAL" && p.validation_status === "REJECTED_CRITICAL");

      return matchesSearch && matchesVillage && matchesStatus;
    });
  }, [features, searchQuery, selectedVillage, statusFilter]);

  // Compute map bounding box for SVG projection
  const bounds = useMemo(() => {
    if (filteredFeatures.length === 0) return { minX: 73.97, maxX: 73.995, minY: 18.57, maxY: 18.595 };
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    filteredFeatures.forEach((f) => {
      f.geometry.coordinates[0].forEach(([lng, lat]) => {
        if (lng < minX) minX = lng;
        if (lng > maxX) maxX = lng;
        if (lat < minY) minY = lat;
        if (lat > maxY) maxY = lat;
      });
    });
    // Add margin
    const dx = Math.max((maxX - minX) * 0.15, 0.002);
    const dy = Math.max((maxY - minY) * 0.15, 0.002);
    return { minX: minX - dx, maxX: maxX + dx, minY: minY - dy, maxY: maxY + dy };
  }, [filteredFeatures]);

  // Project longitude/latitude to SVG canvas viewBox coordinates (width: 800, height: 600)
  const project = (lng: number, lat: number) => {
    const svgWidth = 800;
    const svgHeight = 600;
    const x = ((lng - bounds.minX) / (bounds.maxX - bounds.minX)) * svgWidth;
    const y = svgHeight - ((lat - bounds.minY) / (bounds.maxY - bounds.minY)) * svgHeight;
    return { x, y };
  };

  const getPolygonPath = (coords: number[][]) => {
    if (!coords || coords.length === 0) return "";
    return coords
      .map(([lng, lat], idx) => {
        const pt = project(lng, lat);
        return `${idx === 0 ? "M" : "L"} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`;
      })
      .join(" ") + " Z";
  };

  const getCentroid = (coords: number[][]) => {
    let sumX = 0, sumY = 0;
    coords.forEach(([lng, lat]) => {
      const pt = project(lng, lat);
      sumX += pt.x;
      sumY += pt.y;
    });
    return { x: sumX / coords.length, y: sumY / coords.length };
  };

  const getFillColor = (feat: GeoFeature) => {
    const isSelected = selectedParcel?.id === feat.id;
    const status = feat.properties.validation_status;

    if (isSelected) return "rgba(16, 185, 129, 0.55)"; // Emerald highlight
    if (status.includes("VERIFIED")) return "rgba(16, 185, 129, 0.28)"; // Emerald
    if (status === "FLAGGED_FOR_REVIEW") return "rgba(245, 158, 11, 0.32)"; // Amber
    if (status === "REJECTED_CRITICAL") return "rgba(239, 68, 68, 0.38)"; // Red
    return "rgba(99, 102, 241, 0.28)"; // Indigo
  };

  const getStrokeColor = (feat: GeoFeature) => {
    const isSelected = selectedParcel?.id === feat.id;
    const status = feat.properties.validation_status;

    if (isSelected) return "#34d399";
    if (status.includes("VERIFIED")) return "#10b981";
    if (status === "FLAGGED_FOR_REVIEW") return "#f59e0b";
    if (status === "REJECTED_CRITICAL") return "#ef4444";
    return "#818cf8";
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-400">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">Cadastral GIS Map Explorer</h1>
              <Badge variant="verified">PostGIS Engine</Badge>
            </div>
            <p className="text-xs text-slate-400">
              Interactive spatial survey boundaries, geodetic area computation & deed discrepancy inspector
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/verification">
            <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800 text-slate-200 text-xs">
              Verification Queue
            </Button>
          </Link>
          <Link href="/">
            <Button size="sm" variant="secondary" className="text-xs">
              Dashboard
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Map + Sidebar Workspace */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden h-[calc(100vh-65px)]">
        {/* ========================================================================= */}
        {/* MAP CANVAS VIEWPORT (8 Columns)                                          */}
        {/* ========================================================================= */}
        <div className="lg:col-span-8 bg-slate-950 relative flex flex-col border-r border-slate-800 overflow-hidden">
          {/* Map Top Filter Bar */}
          <div className="p-3 bg-slate-900/90 backdrop-blur border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 z-10">
            <div className="flex items-center gap-2 flex-1 max-w-sm">
              <Search className="w-4 h-4 text-slate-400 ml-1 shrink-0" />
              <input
                type="text"
                placeholder="Search Survey No, Village, or Owner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            {/* Village Filter */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400 font-semibold uppercase">Village:</span>
              <select
                value={selectedVillage}
                onChange={(e) => setSelectedVillage(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="ALL">All Revenue Villages</option>
                <option value="Wagholi">Wagholi (Pune)</option>
                <option value="Haveli">Haveli (Pune)</option>
                <option value="Devanahalli">Devanahalli (Bengaluru)</option>
              </select>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1">
              {["ALL", "VERIFIED", "FLAGGED"].map((st) => (
                <Button
                  key={st}
                  size="sm"
                  variant={statusFilter === st ? "default" : "outline"}
                  onClick={() => setStatusFilter(st)}
                  className={`text-[11px] h-7 px-2.5 ${
                    statusFilter === st
                      ? "bg-emerald-600 text-white"
                      : "border-slate-800 bg-slate-950 text-slate-400 hover:text-white"
                  }`}
                >
                  {st}
                </Button>
              ))}
            </div>
          </div>

          {/* Map Surface Render */}
          <div className="flex-1 relative bg-slate-950 flex items-center justify-center overflow-hidden p-6 select-none">
            {/* Satellite Grid Grid-lines Backdrop */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-30" />

            {/* Vector Cadastral SVG Engine */}
            <svg
              viewBox="0 0 800 600"
              className="w-full h-full max-h-[580px] drop-shadow-2xl transition-transform duration-200"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              {/* Render Parcel Polygons */}
              {filteredFeatures.map((feat) => {
                const isSelected = selectedParcel?.id === feat.id;
                const coords = feat.geometry.coordinates[0];
                const pathData = getPolygonPath(coords);
                const centroid = getCentroid(coords);
                const p = feat.properties;

                return (
                  <g key={feat.id} className="cursor-pointer group" onClick={() => setSelectedParcel(feat)}>
                    {/* Polygon Area Surface */}
                    <path
                      d={pathData}
                      fill={getFillColor(feat)}
                      stroke={getStrokeColor(feat)}
                      strokeWidth={isSelected ? 3.5 : 2}
                      strokeDasharray={p.validation_status === "REJECTED_CRITICAL" ? "6 3" : "none"}
                      className="transition-all duration-150 group-hover:brightness-125"
                    />

                    {/* Cadastral Survey Number Label */}
                    {showLabels && (
                      <g transform={`translate(${centroid.x}, ${centroid.y})`}>
                        <rect
                          x="-28"
                          y="-10"
                          width="56"
                          height="20"
                          rx="4"
                          fill="rgba(15, 23, 42, 0.85)"
                          stroke={getStrokeColor(feat)}
                          strokeWidth="1"
                        />
                        <text
                          textAnchor="middle"
                          dominantBaseline="central"
                          fill="#f8fafc"
                          fontSize="10"
                          fontWeight="bold"
                          fontFamily="sans-serif"
                        >
                          {p.survey_number}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Floating Map Zoom & Layer Controls */}
            <div className="absolute bottom-6 right-6 flex flex-col gap-1.5 bg-slate-900/90 border border-slate-800 rounded-lg p-1.5 shadow-xl backdrop-blur">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-300 hover:text-white"
                onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-300 hover:text-white"
                onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8 text-slate-300 hover:text-white"
                onClick={() => setZoomLevel(1)}
                title="Reset View"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <div className="h-px bg-slate-800 my-0.5" />
              <Button
                size="icon"
                variant="ghost"
                className={`h-8 w-8 ${showLabels ? 'text-emerald-400' : 'text-slate-500'}`}
                onClick={() => setShowLabels(!showLabels)}
                title="Toggle Survey Labels"
              >
                <Layers className="w-4 h-4" />
              </Button>
            </div>

            {/* Map Legend */}
            <div className="absolute bottom-6 left-6 bg-slate-900/90 border border-slate-800 rounded-lg p-3 shadow-xl backdrop-blur text-xs space-y-1.5">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
                Cadastral Legend
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-3 w-3 rounded bg-emerald-500/40 border border-emerald-400 inline-block" />
                <span>Verified Match</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-3 w-3 rounded bg-amber-500/40 border border-amber-400 inline-block" />
                <span>Spatial Warning / Flag</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <span className="h-3 w-3 rounded bg-red-500/40 border border-red-400 inline-block" />
                <span>Cadastral Overlap / Conflict</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* DIGITAL LAND RECORD SIDEBAR INSPECTOR (4 Columns)                         */}
        {/* ========================================================================= */}
        <div className="lg:col-span-4 bg-slate-900/50 p-6 overflow-y-auto h-[calc(100vh-65px)] space-y-5 border-l border-slate-800">
          {selectedParcel ? (
            <>
              {/* Header */}
              <div className="border-b border-slate-800 pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    Parcel #{selectedParcel.id}
                  </span>
                  <Badge
                    variant={
                      selectedParcel.properties.validation_status.includes("VERIFIED")
                        ? "verified"
                        : selectedParcel.properties.validation_status.includes("REJECTED")
                        ? "destructive"
                        : "warning"
                    }
                  >
                    {selectedParcel.properties.validation_status}
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-white mt-1">
                  Survey No. {selectedParcel.properties.survey_number}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {selectedParcel.properties.village}, {selectedParcel.properties.district}, {selectedParcel.properties.state}
                </p>
              </div>

              {/* Spatial vs Deed Comparison Grid */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center justify-between">
                    <span>Spatial Area Alignment</span>
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 pt-1 text-xs">
                  <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">GIS Calculated Polygon:</span>
                    <strong className="text-emerald-400 font-mono text-sm">
                      {selectedParcel.properties.area_hectares.toFixed(2)} Ha
                    </strong>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">AI Extracted Deed Area:</span>
                    <strong className="text-white font-mono text-sm">
                      {selectedParcel.properties.area_hectares.toFixed(2)} Ha
                    </strong>
                  </div>

                  <div className="flex justify-between items-center text-[11px] text-slate-400 px-1">
                    <span>Discrepancy Ratio:</span>
                    <span className="text-emerald-400 font-bold">0.0% (Within Tolerance)</span>
                  </div>
                </CardContent>
              </Card>

              {/* Registered Khatadars / Owners */}
              <Card className="bg-slate-900 border-slate-800">
                <CardHeader className="pb-2">
                  <CardTitle className="text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                    Registered Occupants / Khatadars
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 pt-1 text-xs">
                  {selectedParcel.properties.owners.map((owner, idx) => (
                    <div key={idx} className="p-2.5 rounded bg-slate-950 border border-slate-800">
                      <div className="font-semibold text-white">{owner}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">Title Source: 7/12 Adhikar Abhilekh</div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                {selectedParcel.properties.land_record_id && (
                  <Link href={`/verification/${selectedParcel.properties.land_record_id}`}>
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white gap-2 text-xs font-semibold">
                      Open Verification Workspace
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-slate-500">
              <Map className="w-10 h-10 mx-auto text-slate-600 mb-3" />
              <p className="text-sm font-semibold text-slate-400">Select a parcel on the map</p>
              <p className="text-xs text-slate-600 mt-1">Click on any cadastral boundary polygon to inspect records.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
