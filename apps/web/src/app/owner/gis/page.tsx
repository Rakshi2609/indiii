"use client";

import React, { useState, useEffect, Suspense } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  ArrowRight,
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
    ];
    setFeatures(mockFeats);
    setSelectedParcel(mockFeats[0]);
  };

  const p = selectedParcel?.properties;

  return (
    <div className="min-h-screen bg-surface-container-lowest text-on-surface flex flex-col md:pl-[72px] overflow-hidden">
      {/* Top Navigation */}
      <Topbar />

      {/* Cadastral GIS Toolbar */}
      <div className="h-14 bg-surface border-b border-outline-variant px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-container flex items-center justify-center text-on-primary-container shrink-0">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xs sm:text-sm font-bold text-on-surface">Personal Cadastral GIS Vault</h2>
              <span className="text-[10px] font-mono text-primary bg-primary-fixed/40 px-1.5 py-0.2 rounded border border-primary/20">
                Owner Mode
              </span>
            </div>
          </div>
        </div>

        {/* Map Layer Selector */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-surface-container-low p-0.5 rounded-lg border border-outline-variant text-xs">
            <button
              onClick={() => setTileLayer("satellite")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                tileLayer === "satellite"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Satellite
            </button>
            <button
              onClick={() => setTileLayer("dark")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                tileLayer === "dark"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Dark
            </button>
            <button
              onClick={() => setTileLayer("osm")}
              className={`px-2.5 py-1 rounded font-semibold transition-colors cursor-pointer ${
                tileLayer === "osm"
                  ? "bg-primary text-on-primary shadow-sm"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Street
            </button>
          </div>
        </div>
      </div>

      {/* Main Map & Inspector */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative min-h-0 split-pane">
        
        {/* Leaflet Live Map Canvas */}
        <div className="flex-1 h-full w-full relative flex">
          <LiveMap
            features={features}
            selectedParcel={selectedParcel}
            onSelectParcel={(feat) => setSelectedParcel(feat)}
            tileLayerType={tileLayer}
          />
        </div>

        {/* Right Inspector & Property Selector */}
        <aside className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-outline-variant bg-surface flex flex-col h-auto lg:h-full shrink-0 z-10 overflow-hidden shadow-sm">
          {selectedParcel && (
            <div className="p-4 border-b border-outline-variant bg-surface-container-lowest space-y-3">
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
                  <span className="text-[10px] text-on-surface-variant block font-semibold">Extent</span>
                  <strong className="text-on-surface font-mono">{p?.area_hectares} Ha</strong>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant block font-semibold">Status</span>
                  <strong className="text-primary">{p?.validation_status}</strong>
                </div>
              </div>

              {p?.land_record_id && (
                <Link href={`/owner/properties/${p.land_record_id}`} className="block">
                  <Button className="w-full bg-primary text-on-primary text-xs h-8 gap-1.5 font-semibold">
                    <span>View Property Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          )}

          {/* Directory of Owned Parcels */}
          <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar">
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
              Your Land Parcels ({features.length})
            </div>

            {features.map((feat) => {
              const fp = feat.properties;
              const isSelected = selectedParcel?.properties?.parcel_id === fp.parcel_id;
              return (
                <button
                  key={fp.parcel_id}
                  onClick={() => setSelectedParcel(feat)}
                  className={`w-full text-left p-2.5 rounded-lg border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-primary-container/10 border-primary text-primary font-semibold"
                      : "bg-surface border-outline-variant text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>Survey {fp.survey_number}</span>
                    <span className="font-mono text-[10px]">{fp.area_hectares} Ha</span>
                  </div>
                  <div className="text-[11px] text-on-surface-variant truncate mt-0.5">
                    {fp.village}, {fp.district} ({fp.state})
                  </div>
                </button>
              );
            })}
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
