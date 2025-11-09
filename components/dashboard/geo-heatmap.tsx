"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

if (typeof window !== "undefined") {
  require("leaflet.heat");

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
    iconUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  });
}

interface FeedbackPoint {
  city: string;
  lat: number;
  lng: number;
  sentiment: number;
  intensity: number;
}

interface GeoHeatmapProps {
  feedback: FeedbackPoint[];
}

function HeatLayer({ feedback }: { feedback: FeedbackPoint[] }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || feedback.length === 0) return;

    const heatData: [number, number, number][] = feedback.map((point) => {
      const intensityNorm = (point.intensity || 0) / 100; // 0–1
      const sentimentNorm = Math.abs(point.sentiment || 0); // 0–1
      // 75% intensity, 25% sentiment
      let weight = 0.75 * intensityNorm + 0.25 * sentimentNorm;

      // clamp to 0–1 just in case
      if (weight < 0) weight = 0;
      if (weight > 1) weight = 1;

      return [point.lat, point.lng, weight];
    });

    // remove old layer
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    // Create heatmap layer using leaflet.heat plugin
    // Gradient mapping:
    // 0.0 (Very Low) -> Blue
    // 0.2 (Low) -> Cyan
    // 0.4 (Medium) -> Lime/Green
    // 0.6 (Moderate) -> Yellow
    // 0.8 (High) -> Orange
    // 1.0 (Very High) -> Red
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const heatLayer = (L as any).heatLayer(heatData, {
      max: 1, // force 1.0 to be the "hottest"
      minOpacity: 0.4, // make colors actually show
      radius: 28, // a bit smaller so red is visible
      blur: 15,
      maxZoom: 12,
      gradient: {
        0.0: "blue",
        0.2: "cyan",
        0.4: "lime",
        0.6: "yellow",
        0.8: "orange",
        1.0: "red",
      },
    });

    heatLayer.addTo(map);
    heatLayerRef.current = heatLayer;

    // fit to data
    if (heatData.length > 0) {
      const bounds = L.latLngBounds(
        heatData.map(([lat, lng]) => [lat, lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current);
      }
    };
  }, [map, feedback]);

  return null;
}

export function GeoHeatmap({ feedback }: GeoHeatmapProps) {
  const validFeedback = feedback.filter(
    (point) =>
      point.lat != null &&
      point.lng != null &&
      !isNaN(point.lat) &&
      !isNaN(point.lng) &&
      point.lat >= -90 &&
      point.lat <= 90 &&
      point.lng >= -180 &&
      point.lng <= 180
  );

  if (validFeedback.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-tmobile-gray-50 rounded-2xl border border-tmobile-gray-200">
        <div className="text-center">
          <p className="text-tmobile-gray-600 text-lg mb-2">
            No location data available
          </p>
          <p className="text-tmobile-gray-500 text-sm">
            Submit feedback with location data to see the heatmap
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-tmobile-gray-200 shadow-lg">
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer feedback={validFeedback} />
      </MapContainer>
    </div>
  );
}