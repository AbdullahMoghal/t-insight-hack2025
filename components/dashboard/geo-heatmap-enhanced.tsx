"use client";

import { useEffect, useRef, useState } from "react";
import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from "react-leaflet";
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

interface OutagePoint {
  city: string;
  state: string;
  lat: number;
  lng: number;
  reportCount: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  problemType: string;
  source: string;
  details: string;
}

type MapView = 'feedback' | 'outage';

interface GeoHeatmapEnhancedProps {
  feedback: FeedbackPoint[];
  onViewChange?: (view: MapView) => void;
}

// Color mapping for outage severity
const SEVERITY_COLORS = {
  critical: '#DC2626', // red-600
  high: '#F97316', // orange-500
  medium: '#FBBF24', // yellow-400
  low: '#60A5FA', // blue-400
};

function HeatLayer({ feedback }: { feedback: FeedbackPoint[] }) {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (!map || feedback.length === 0) return;

    const heatData: [number, number, number][] = feedback.map((point) => {
      const intensityNorm = (point.intensity || 0) / 100;
      const sentimentNorm = Math.abs(point.sentiment || 0);
      let weight = 0.75 * intensityNorm + 0.25 * sentimentNorm;

      if (weight < 0) weight = 0;
      if (weight > 1) weight = 1;

      return [point.lat, point.lng, weight];
    });

    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current);
    }

    const heatLayer = (L as any).heatLayer(heatData, {
      max: 1,
      minOpacity: 0.4,
      radius: 28,
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

function OutageMarkers({ outages }: { outages: OutagePoint[] }) {
  const map = useMap();

  useEffect(() => {
    if (outages.length > 0) {
      const bounds = L.latLngBounds(
        outages.map((outage) => [outage.lat, outage.lng] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [map, outages]);

  return (
    <>
      {outages.map((outage, idx) => {
        // Calculate radius based on report count (min 8, max 30)
        const radius = Math.min(Math.max(outage.reportCount / 10, 8), 30);

        return (
          <CircleMarker
            key={`${outage.city}-${idx}`}
            center={[outage.lat, outage.lng]}
            radius={radius}
            pathOptions={{
              fillColor: SEVERITY_COLORS[outage.severity],
              fillOpacity: 0.7,
              color: SEVERITY_COLORS[outage.severity],
              weight: 2,
              opacity: 0.9,
            }}
          >
            <Popup>
              <div className="p-2 min-w-[200px]">
                <h3 className="font-bold text-lg mb-1">{outage.city}, {outage.state}</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Reports:</span>{" "}
                    <span className="text-tmobile-magenta font-semibold">{outage.reportCount}</span>
                  </div>
                  <div>
                    <span className="font-medium">Severity:</span>{" "}
                    <span
                      className="px-2 py-0.5 rounded text-white text-xs font-medium"
                      style={{ backgroundColor: SEVERITY_COLORS[outage.severity] }}
                    >
                      {outage.severity.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Issue:</span> {outage.problemType}
                  </div>
                  <div>
                    <span className="font-medium">Source:</span> {outage.source}
                  </div>
                  <div className="text-xs text-gray-600 mt-2 pt-2 border-t">
                    {outage.details}
                  </div>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
    </>
  );
}

export function GeoHeatmapEnhanced({ feedback, onViewChange }: GeoHeatmapEnhancedProps) {
  const [mapView, setMapView] = useState<MapView>('feedback');
  const [outages, setOutages] = useState<OutagePoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleViewChange = (view: MapView) => {
    setMapView(view);
    onViewChange?.(view);
  };

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

  // Fetch outage data when switching to outage view
  useEffect(() => {
    if (mapView === 'outage' && outages.length === 0) {
      setLoading(true);
      setError(null);

      fetch('/api/dashboard/outages')
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setOutages(data.data);
          } else {
            setError(data.message || 'Failed to load outage data');
          }
        })
        .catch(err => {
          console.error('Error fetching outage data:', err);
          setError('Failed to load outage data');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [mapView, outages.length]);

  const hasData = (mapView === 'feedback' && validFeedback.length > 0) ||
                  (mapView === 'outage' && outages.length > 0);

  if (!hasData && mapView === 'feedback') {
    return (
      <div className="space-y-4">
        {/* View Selector */}
        <div className="flex gap-2 bg-white/50 p-1 rounded-lg border border-tmobile-gray-200 w-fit">
          <button
            onClick={() => handleViewChange('feedback')}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all bg-[#E8258E] text-white shadow-sm"
          >
            Customer Feedback
          </button>
          <button
            onClick={() => handleViewChange('outage')}
            className="px-4 py-2 rounded-md text-sm font-medium transition-all text-tmobile-gray-600 hover:bg-white/80"
          >
            Outage Map
          </button>
        </div>

        <div className="h-[500px] flex items-center justify-center bg-tmobile-gray-50 rounded-2xl border border-tmobile-gray-200">
          <div className="text-center">
            <p className="text-tmobile-gray-600 text-lg mb-2">
              No feedback data available
            </p>
            <p className="text-tmobile-gray-500 text-sm">
              Submit feedback with location data to see the heatmap
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Selector */}
      <div className="flex gap-2 bg-white/50 p-1 rounded-lg border border-tmobile-gray-200 w-fit">
        <button
          onClick={() => handleViewChange('feedback')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mapView === 'feedback'
              ? 'bg-[#E8258E] text-white shadow-sm'
              : 'text-tmobile-gray-600 hover:bg-white/80'
          }`}
        >
          Customer Feedback
        </button>
        <button
          onClick={() => handleViewChange('outage')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
            mapView === 'outage'
              ? 'bg-[#E8258E] text-white shadow-sm'
              : 'text-tmobile-gray-600 hover:bg-white/80'
          }`}
        >
          Outage Map
        </button>
      </div>

      {/* Map Container */}
      <div className="h-[500px] rounded-2xl overflow-hidden border border-tmobile-gray-200 shadow-lg">
        {loading ? (
          <div className="h-full flex items-center justify-center bg-tmobile-gray-50">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#E8258E] mx-auto mb-4"></div>
              <p className="text-tmobile-gray-600">Loading outage data...</p>
            </div>
          </div>
        ) : error ? (
          <div className="h-full flex items-center justify-center bg-tmobile-gray-50">
            <div className="text-center">
              <p className="text-red-600 text-lg mb-2">Error loading data</p>
              <p className="text-tmobile-gray-500 text-sm">{error}</p>
            </div>
          </div>
        ) : (
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

            {mapView === 'feedback' && <HeatLayer feedback={validFeedback} />}
            {mapView === 'outage' && <OutageMarkers outages={outages} />}
          </MapContainer>
        )}
      </div>

      {/* Legend */}
      {!loading && !error && (
        <div className="flex items-center gap-6 text-sm">
          {mapView === 'feedback' ? (
            <>
              <span className="font-medium text-tmobile-gray-700">Intensity Scale:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-blue-500 rounded shadow-sm"></div>
                <span className="text-xs text-tmobile-gray-600">Very Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-cyan-400 rounded shadow-sm"></div>
                <span className="text-xs text-tmobile-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-lime-500 rounded shadow-sm"></div>
                <span className="text-xs text-tmobile-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-yellow-400 rounded shadow-sm"></div>
                <span className="text-xs text-tmobile-gray-600">Moderate</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-orange-500 rounded shadow-sm"></div>
                <span className="text-xs text-tmobile-gray-600">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div>
                <span className="text-xs text-tmobile-gray-600">Very High</span>
              </div>
            </>
          ) : (
            <>
              <span className="font-medium text-tmobile-gray-700">Outage Severity:</span>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: SEVERITY_COLORS.low }}></div>
                <span className="text-xs text-tmobile-gray-600">Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: SEVERITY_COLORS.medium }}></div>
                <span className="text-xs text-tmobile-gray-600">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: SEVERITY_COLORS.high }}></div>
                <span className="text-xs text-tmobile-gray-600">High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded shadow-sm" style={{ backgroundColor: SEVERITY_COLORS.critical }}></div>
                <span className="text-xs text-tmobile-gray-600">Critical</span>
              </div>
              <span className="text-xs text-tmobile-gray-500 ml-4">
                Circle size = report volume
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
}
