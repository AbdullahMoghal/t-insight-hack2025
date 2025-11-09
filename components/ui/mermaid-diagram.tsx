'use client'

import { useEffect, useRef } from 'react'
import mermaid from 'mermaid'

interface MermaidDiagramProps {
  chart: string
  className?: string
}

export function MermaidDiagram({ chart, className = '' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const id = useRef(`mermaid-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    // Initialize mermaid with T-Mobile theme
    mermaid.initialize({
      startOnLoad: true,
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

    const renderDiagram = async () => {
      if (containerRef.current) {
        try {
          // Clear previous content
          containerRef.current.innerHTML = ''

          // Render the diagram
          const { svg } = await mermaid.render(id.current, chart)
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
  }, [chart])

  return (
    <div
      ref={containerRef}
      className={`mermaid-container bg-white/95 backdrop-blur-sm border border-tmobile-gray-200 rounded-xl p-6 shadow-xl overflow-x-auto ${className}`}
    />
  )
}
