"use client";

import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

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

interface LiveMapProps {
  features: GeoFeature[];
  selectedParcel: GeoFeature | null;
  onSelectParcel: (feature: GeoFeature) => void;
  tileLayerType: "satellite" | "dark" | "osm";
}

export default function LiveMap({
  features,
  selectedParcel,
  onSelectParcel,
  tileLayerType,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  // Initialize Map Once
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    // Fix default marker icons
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });

    const map = L.map(mapContainerRef.current, {
      center: [18.5805, 73.9810],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    // Invalidate size on mount to ensure tiles load immediately
    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        try {
          map.invalidateSize();
        } catch {
          // ignore unmounted error
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Update Tile Layer
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (tileLayerRef.current) {
      map.removeLayer(tileLayerRef.current);
    }

    let tileUrl = "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    let maxZoom = 19;

    if (tileLayerType === "dark") {
      tileUrl = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
      maxZoom = 19;
    } else if (tileLayerType === "osm") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
      maxZoom = 19;
    }

    const newTileLayer = L.tileLayer(tileUrl, {
      maxZoom,
      subdomains: "abcd",
    }).addTo(map);

    tileLayerRef.current = newTileLayer;
  }, [tileLayerType]);

  // Update Cadastral GeoJSON Polygons
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geojsonLayerRef.current) {
      map.removeLayer(geojsonLayerRef.current);
    }

    if (features.length > 0) {
      const geojson = L.geoJSON(features as any, {
        style: (feature: any) => {
          const p = feature?.properties;
          const isSelected = selectedParcel?.properties?.parcel_id === p?.parcel_id;
          const isFlagged = p?.validation_status?.includes("FLAGGED") || (p?.confidence_score && p.confidence_score < 0.85);
          const isCritical = p?.validation_status?.includes("REJECTED");

          let fillColor = "#10B981"; // Emerald
          let borderColor = "#059669";

          if (isCritical) {
            fillColor = "#EF4444";
            borderColor = "#DC2626";
          } else if (isFlagged) {
            fillColor = "#F59E0B";
            borderColor = "#D97706";
          }

          if (isSelected) {
            borderColor = "#2DD4BF"; // Bright teal
          }

          return {
            fillColor,
            fillOpacity: isSelected ? 0.6 : 0.4,
            color: isSelected ? "#2DD4BF" : borderColor,
            weight: isSelected ? 4 : 2,
            dashArray: isFlagged ? "5, 5" : undefined,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const p = feature?.properties;

          // Tooltip
          layer.bindTooltip(
            `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: #10B981;">Survey ${p?.survey_number}</strong><br/>
              <span>${p?.village}, ${p?.district}</span><br/>
              <span style="color: #64748B;">Area: ${p?.area_hectares} Ha</span>
            </div>`,
            { permanent: false, direction: "center", className: "custom-leaflet-tooltip" }
          );

          // Click handler
          layer.on({
            click: () => {
              onSelectParcel(feature);
              map.fitBounds(layer.getBounds(), { padding: [50, 50], maxZoom: 16 });
            },
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = geojson;
    }
  }, [features, selectedParcel, onSelectParcel]);

  // Expose map resize listener
  useEffect(() => {
    const handleResize = () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px] flex-1">
      <div
        ref={mapContainerRef}
        className="absolute inset-0 w-full h-full bg-[#050912] z-0"
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}
