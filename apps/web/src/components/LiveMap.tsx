"use client";

import React, { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
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
  isOwnerMode?: boolean;
  onNavigateToDocument?: (feature: GeoFeature) => void;
}

export default function LiveMap({
  features,
  selectedParcel,
  onSelectParcel,
  tileLayerType,
  isOwnerMode,
  onNavigateToDocument,
}: LiveMapProps) {
  const router = useRouter();
  const pathname = usePathname();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const geojsonLayerRef = useRef<L.GeoJSON | null>(null);

  const effectiveIsOwner = isOwnerMode !== undefined ? isOwnerMode : pathname.startsWith("/owner");

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

  // Update Cadastral GeoJSON Polygons & Popups
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
            fillOpacity: isSelected ? 0.65 : 0.4,
            color: isSelected ? "#2DD4BF" : borderColor,
            weight: isSelected ? 4 : 2,
            dashArray: isFlagged ? "5, 5" : undefined,
          };
        },
        onEachFeature: (feature: any, layer: any) => {
          const p = feature?.properties;
          const recordId = p?.land_record_id || p?.parcel_id || feature?.id || 1;
          const docUrl = effectiveIsOwner
            ? `/owner/properties/${recordId}`
            : `/verification/${recordId}`;

          const statusColor = p?.validation_status?.includes("REJECTED")
            ? "#EF4444"
            : p?.validation_status?.includes("FLAGGED")
            ? "#F59E0B"
            : "#10B981";

          // Interactive Popup
          const popupHtml = `
            <div style="font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; width: 220px; padding: 2px; color: #FFFFFF;">
              <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
                <span style="font-size: 10px; font-weight: 800; letter-spacing: 0.05em; color: ${statusColor}; text-transform: uppercase;">
                  ${effectiveIsOwner ? "Your Land Parcel" : "Cadastral Record"}
                </span>
                <span style="font-size: 9px; background: rgba(15, 23, 42, 0.8); color: ${statusColor}; border: 1px solid ${statusColor}40; padding: 2px 5px; border-radius: 4px; font-weight: 700;">
                  ${p?.validation_status || "VERIFIED"}
                </span>
              </div>
              <div style="font-size: 14px; font-weight: 800; color: #F8FAFC; margin-bottom: 2px;">
                Survey No. ${p?.survey_number}
              </div>
              <div style="font-size: 11px; color: #94A3B8; margin-bottom: 8px;">
                ${p?.village}, ${p?.district} (${p?.state})
              </div>
              <div style="background: #090E17; border: 1px solid #1E293B; border-radius: 6px; padding: 6px 8px; margin-bottom: 10px; font-size: 11px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                  <span style="color: #64748B;">Extent Area:</span>
                  <strong style="color: #F1F5F9; font-family: monospace;">${p?.area_hectares} Ha</strong>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="color: #64748B;">Confidence:</span>
                  <strong style="color: #38BDF8; font-family: monospace;">${Math.round((p?.confidence_score || 0.96) * 100)}%</strong>
                </div>
              </div>
              <a
                href="${docUrl}"
                class="leaflet-parcel-cta-link"
                style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; background: #4F46E5; color: #FFFFFF; text-decoration: none; border-radius: 6px; padding: 7px 10px; font-size: 11px; font-weight: 700; box-shadow: 0 2px 6px rgba(79, 70, 229, 0.4); box-sizing: border-box;"
              >
                <span>${effectiveIsOwner ? "📄 Open Deed Document" : "🏛️ Open Verification & Deed"}</span>
                <span style="font-size: 13px;">→</span>
              </a>
            </div>
          `;

          layer.bindPopup(popupHtml, {
            className: "custom-cadastral-popup",
            closeButton: true,
            offset: [0, -5],
          });

          // Hover Tooltip
          layer.bindTooltip(
            `<div style="font-family: sans-serif; font-size: 11px; padding: 2px;">
              <strong style="color: #10B981;">Survey ${p?.survey_number}</strong><br/>
              <span>${p?.village}, ${p?.district}</span><br/>
              <span style="color: #64748B;">Area: ${p?.area_hectares} Ha • Click to Inspect</span>
            </div>`,
            { permanent: false, direction: "center", className: "custom-leaflet-tooltip" }
          );

          // Click handler on polygon
          layer.on({
            click: () => {
              onSelectParcel(feature);
              map.flyToBounds(layer.getBounds(), { padding: [70, 70], maxZoom: 17, duration: 0.8 });
              layer.openPopup();
            },
            dblclick: () => {
              if (onNavigateToDocument) {
                onNavigateToDocument(feature);
              } else {
                router.push(docUrl);
              }
            },
          });
        },
      }).addTo(map);

      geojsonLayerRef.current = geojson;
    }
  }, [features, selectedParcel, onSelectParcel, effectiveIsOwner, router, onNavigateToDocument]);

  // AUTO-ZOOM TO SELECTED PARCEL (when selected from sidebar "Your Land Parcels")
  useEffect(() => {
    if (!selectedParcel || !geojsonLayerRef.current || !mapInstanceRef.current) return;
    const map = mapInstanceRef.current;

    geojsonLayerRef.current.eachLayer((layer: any) => {
      if (layer.feature?.properties?.parcel_id === selectedParcel.properties?.parcel_id) {
        const bounds = layer.getBounds();
        map.flyToBounds(bounds, {
          padding: [70, 70],
          maxZoom: 17,
          duration: 1.0,
        });
        layer.openPopup();
      }
    });
  }, [selectedParcel]);

  // Invalidate Size on Container Resize
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
