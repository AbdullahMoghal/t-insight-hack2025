'use client'

import dynamic from 'next/dynamic'

interface FeedbackPoint {
  city: string
  lat: number
  lng: number
  sentiment: number
  intensity: number
}

interface GeoMapWrapperProps {
  feedback: FeedbackPoint[]
}

// Dynamically import GeoHeatmap with SSR disabled (Leaflet requires browser APIs)
const GeoHeatmap = dynamic(
  () => import('@/components/dashboard/geo-heatmap').then((mod) => ({ default: mod.GeoHeatmap })),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[500px] flex items-center justify-center bg-tmobile-gray-50 rounded-2xl border border-tmobile-gray-200">
        <div className="text-center">
          <p className="text-tmobile-gray-600 text-lg">Loading map...</p>
        </div>
      </div>
    )
  }
)

export function GeoMapWrapper({ feedback }: GeoMapWrapperProps) {
  return <GeoHeatmap feedback={feedback} />
}

