"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
  ChevronRight,
  Compass,
  Database,
  ExternalLink,
  FileCheck2,
  Layers,
  MapPin,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const LiveMap = dynamic(() => import("@/components/LiveMap"), { ssr: false });

function OwnerGISContent() {
  const searchParams = useSearchParams();
  const initialSurvey = searchParams ? searchParams.get("survey") : null;

  const [features, setFeatures] = useState<any[]>([]);
  const [selectedParcel, setSelectedParcel] = useState<any | null>(null);
  const [tileLayer, setTileLayer] = useState<"satellite" | "dark" | "osm">("satellite");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGISData();
  }, []);

  const fetchGISData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/owner/gis");
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
        setFeatures(feats);

        if (initialSurvey) {
          const match = feats.find(
            (p: any) => p.properties.survey_number.toLowerCase() === initialSurvey.toLowerCase()
          );
          if (match) setSelectedParcel(match);
        } else if (feats.length > 0) {
          setSelectedParcel(feats[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load GIS parcels:", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans">
      {/* Top Bar */}
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/90 px-6 py-3 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
            <Compass className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white">Cadastral GIS Map</h1>
              <Badge variant="outline" className="border-emerald-500/40 bg-emerald-500/10 text-emerald-400 text-[10px]">
                Owner Vault
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400">
              High-resolution satellite imagery overlaid with your verified PostGIS cadastral boundary polygons
            </p>
          </div>
        </div>

        {/* Map Layer Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-slate-800 bg-slate-900 p-0.5 text-xs">
            <button
              onClick={() => setTileLayer("satellite")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tileLayer === "satellite" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileLayer("dark")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tileLayer === "dark" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileLayer("osm")}
              className={`px-2.5 py-1 rounded-md transition-colors ${
                tileLayer === "osm" ? "bg-indigo-600 text-white font-semibold" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Vector
            </button>
          </div>
        </div>
      </header>

      {/* Map Content Area */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Main Leaflet Map */}
        <div className="flex-1 h-[550px] md:h-[calc(100vh-65px)] relative">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full space-y-2 bg-slate-950">
              <RefreshCw className="h-8 w-8 animate-spin text-emerald-400" />
              <span className="text-xs text-slate-400">Rendering Cadastral Parcels...</span>
            </div>
          ) : (
            <LiveMap
              features={features}
              selectedParcel={selectedParcel}
              onSelectParcel={(f) => setSelectedParcel(f)}
              tileLayerType={tileLayer}
            />
          )}
        </div>

        {/* Right Inspector Drawer */}
        <aside className="w-full md:w-96 border-t md:border-t-0 md:border-l border-slate-800 bg-slate-950/95 p-5 space-y-5 overflow-y-auto max-h-[calc(100vh-65px)]">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Parcel Spatial Inspector
            </h2>
            <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300 text-[10px]">
              {features.length} Parcels Mapped
            </Badge>
          </div>

          {selectedParcel ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-900/80 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-white">
                    Survey {selectedParcel.properties.survey_number}
                  </h3>
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/40 text-[10px]">
                    Cadastral Plot #{selectedParcel.properties.parcel_id}
                  </Badge>
                </div>
                <p className="text-xs text-slate-400">
                  {selectedParcel.properties.village}, {selectedParcel.properties.district}, {selectedParcel.properties.state}
                </p>
              </div>

              {/* Area Extent Card */}
              <div className="rounded-xl bg-slate-900/80 border border-slate-800 p-4 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Surveyed Polygon Area:</span>
                  <strong className="text-emerald-400 font-bold">
                    {selectedParcel.properties.area_hectares} Ha
                  </strong>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span className="text-slate-400">Acreage Equivalent:</span>
                  <span className="text-white font-medium">
                    {roundAcres(selectedParcel.properties.area_hectares)} Acres
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1 border-t border-slate-800/80">
                  <span className="text-slate-400">Spatial Projection:</span>
                  <span className="text-slate-400">EPSG:4326 (WGS-84)</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                {selectedParcel.properties.land_record_id && (
                  <Link
                    href={`/owner/properties/${selectedParcel.properties.land_record_id}`}
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white py-2.5 shadow-md transition-colors"
                  >
                    <span>View Full Property Details</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}

                <Link
                  href={`/copilot`}
                  className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 py-2.5 transition-colors"
                >
                  <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                  <span>Ask Copilot About Survey {selectedParcel.properties.survey_number}</span>
                </Link>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-8 text-center text-xs text-slate-500">
              Click any parcel on the satellite map to inspect its cadastral boundary and area.
            </div>
          )}

          {/* All Parcels Quick Picker */}
          <div className="pt-4 border-t border-slate-800">
            <span className="text-xs font-semibold text-slate-400 block mb-2">
              All Owned Parcels ({features.length}):
            </span>
            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {features.map((f) => (
                <button
                  key={f.id}
                  onClick={() => setSelectedParcel(f)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left text-xs transition-colors ${
                    selectedParcel?.id === f.id
                      ? "bg-emerald-600/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-slate-900/60 border border-slate-800/60 text-slate-300 hover:bg-slate-800"
                  }`}
                >
                  <span className="font-medium truncate">
                    Survey {f.properties.survey_number} ({f.properties.village})
                  </span>
                  <span className="text-[10px] text-emerald-400 shrink-0 ml-2">
                    {f.properties.area_hectares} Ha
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

export default function OwnerGISPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-slate-400 text-xs">
        <RefreshCw className="h-6 w-6 animate-spin text-emerald-400 mr-2" />
        Loading Cadastral Map...
      </div>
    }>
      <OwnerGISContent />
    </Suspense>
  );
}

function roundAcres(ha: number): string {
  if (!ha) return "0.0";
  return (ha * 2.47105).toFixed(2);
}
