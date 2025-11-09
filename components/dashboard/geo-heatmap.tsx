'use client'

import { useEffect, useRef } from 'react'
import { MapContainer, TileLayer, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// Dynamically import leaflet.heat only on client side
if (typeof window !== 'undefined') {
  require('leaflet.heat')
  
  // Fix for default marker icons in Next.js
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
  })
}

interface FeedbackPoint {
  city: string
  lat: number
  lng: number
  sentiment: number
  intensity: number
}

interface GeoHeatmapProps {
  feedback: FeedbackPoint[]
}

// Component to add heat layer to the map
function HeatLayer({ feedback }: { feedback: FeedbackPoint[] }) {
  const map = useMap()
  const heatLayerRef = useRef<L.HeatLayer | null>(null)

  useEffect(() => {
    if (!map || feedback.length === 0) return

    // Calculate raw weights - intensity is the PRIMARY factor
    const rawWeights = feedback.map((point) => {
      // Intensity gets the most weight (0-100 scale) - this is the main driver
      const intensityWeight = (point.intensity || 0) * 0.8  // Much stronger!
      // Sentiment adds secondary variation
      const sentimentWeight = Math.abs(point.sentiment || 0) * 5  // Stronger sentiment impact
      return intensityWeight + sentimentWeight
    })

    // Find min and max for normalization
    const minWeight = Math.min(...rawWeights)
    const maxWeight = Math.max(...rawWeights)
    const range = maxWeight - minWeight

    // Normalize with wider range for better color distinction
    // This ensures high intensity values really stand out as red
    const heatData: [number, number, number][] = feedback.map((point, i) => {
      const normalizedWeight = range > 0 
        ? 0.15 + ((rawWeights[i] - minWeight) / range) * 0.85  // Scale to 0.15-1.0
        : 0.5 // Default if all weights are the same
      
      return [point.lat, point.lng, normalizedWeight]
    })

    // Remove existing heat layer if it exists
    if (heatLayerRef.current) {
      map.removeLayer(heatLayerRef.current)
    }

    // Create new heat layer with adjusted settings for better visibility
    const heatLayer = (L as any).heatLayer(heatData, {
      radius: 20,        // Slightly reduced for better point distinction
      blur: 12,         // Slightly reduced for sharper heat zones
      maxZoom: 17,
      gradient: {
        0.0: 'blue',    // Low intensity
        0.2: 'cyan',    // Low-medium
        0.4: 'lime',    // Medium-low
        0.6: 'yellow',  // Medium
        0.8: 'orange',  // Medium-high
        1.0: 'red',      // High intensity
      },
    })

    heatLayer.addTo(map)
    heatLayerRef.current = heatLayer

    // Fit bounds to show all points
    if (heatData.length > 0) {
      const bounds = L.latLngBounds(heatData.map(([lat, lng]) => [lat, lng] as [number, number]))
      map.fitBounds(bounds, { padding: [50, 50] })
    }

    return () => {
      if (heatLayerRef.current) {
        map.removeLayer(heatLayerRef.current)
      }
    }
  }, [map, feedback])

  return null
}

export function GeoHeatmap({ feedback }: GeoHeatmapProps) {
  // Filter out invalid coordinates
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
  )

  if (validFeedback.length === 0) {
    return (
      <div className="h-[500px] flex items-center justify-center bg-tmobile-gray-50 rounded-2xl border border-tmobile-gray-200">
        <div className="text-center">
          <p className="text-tmobile-gray-600 text-lg mb-2">No location data available</p>
          <p className="text-tmobile-gray-500 text-sm">
            Submit feedback with location data to see the heatmap
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[500px] rounded-2xl overflow-hidden border border-tmobile-gray-200 shadow-lg">
      <MapContainer
        center={[37.8, -96]}
        zoom={4}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <HeatLayer feedback={validFeedback} />
      </MapContainer>
    </div>
  )
}

