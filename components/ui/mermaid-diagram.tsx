'use client'

import { useEffect, useRef, useState } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

// Initialize mermaid once globally
let mermaidInitialized = false

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    // Initialize mermaid with T-Mobile theme (only once)
    if (!mermaidInitialized) {
      mermaid.initialize({
        startOnLoad: false, // Changed to false to prevent auto-rendering
        theme: 'base',
        themeVariables: {
          primaryColor: '#E20074', // T-Mobile Magenta
          primaryTextColor: '#000000',
          primaryBorderColor: '#E20074',
          lineColor: '#E20074',
          secondaryColor: '#7C3E93', // Purple
          tertiaryColor: '#00A19C', // Teal
          background: '#ffffff',
          mainBkg: '#f9fafb',
          secondBkg: '#f3f4f6',
          border1: '#e5e7eb',
          border2: '#d1d5db',
          arrowheadColor: '#E20074',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          fontSize: '14px',
        },
      })
      mermaidInitialized = true
    }

    // Mark as ready after initialization
    setIsReady(true)
  }, [])

  useEffect(() => {
    // Only render when mermaid is ready
    if (!isReady) return

    const renderDiagram = async () => {
      if (containerRef.current) {
        try {
          // Clear previous content
          containerRef.current.innerHTML = ''

          // Generate a new unique ID for each render
          const renderId = `mermaid-${Math.random().toString(36).substr(2, 9)}`

          // Render the diagram
          const { svg } = await mermaid.render(renderId, chart)
          containerRef.current.innerHTML = svg

          // Make the SVG responsive
          const svgElement = containerRef.current.querySelector('svg')
          if (svgElement) {
            svgElement.style.maxWidth = '100%'
            svgElement.style.height = 'auto'
          }
        } catch (error) {
          console.error('Mermaid rendering error:', error)
          containerRef.current.innerHTML = `
            <div class="text-red-600 p-4 border border-red-200 rounded-lg bg-red-50">
              <p class="font-semibold">Error rendering diagram</p>
              <p class="text-sm mt-1">Please check the diagram syntax</p>
            </div>
          `
        }
      }
    }

    renderDiagram()
  }, [chart, isReady])

  return (
    <div
      ref={containerRef}
      className={`mermaid-container bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-xl p-6 shadow-xl overflow-x-auto ${className}`}
    >
      {!isReady && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#E8258E]"></div>
          <span className="ml-3 text-tmobile-gray-600">Loading diagram...</span>
        </div>
      )}
    </div>
  )
}
