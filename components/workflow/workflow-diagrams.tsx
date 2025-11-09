'use client'

import { useState } from 'react'
import { MermaidDiagram } from '@/components/ui/mermaid-diagram'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

const diagrams = {
  journey: {
    title: 'PM Daily Journey',
    description: 'How product managers use T-Insight throughout their day',
    chart: `journey
    title PM Daily Workflow with T-Insight
    section Morning Review
      Check CHI Score: 5: PM
      Review New Signals: 4: PM
      Identify Emerging Issues: 3: PM
    section Prioritize
      Create Opportunities: 5: PM
      Review RICE Scores: 4: PM
      Filter by Severity: 3: PM
    section Plan
      Generate PRD: 5: PM
      Generate User Stories: 4: PM
      Review Evidence: 3: PM
    section Execute
      Mark In Progress: 5: PM
      Deploy Solution: 3: PM
    section Validate
      Monitor Recovery: 4: PM
      Generate Release Notes: 5: PM`,
  },
  lifecycle: {
    title: 'Opportunity Lifecycle',
    description: 'Status flow with decision points and automated monitoring',
    chart: `stateDiagram-v2
    [*] --> New
    New --> PRDGenerated: Generate PRD
    PRDGenerated --> StoriesGenerated: Generate Stories
    StoriesGenerated --> InProgress: PM Starts Work
    New --> InProgress: Skip PRD/Stories
    InProgress --> Done: Solution Deployed

    Done --> Monitoring: Auto-Monitor (72h)

    state Monitoring {
        [*] --> CheckRecovery
        CheckRecovery --> Recovered: Sentiment ↑ or Intensity ↓
        CheckRecovery --> NotRecovered: No Improvement
    }

    Recovered --> ReleaseNotesReady: Generate Release Notes
    ReleaseNotesReady --> [*]
    NotRecovered --> [*]

    note right of Done
        Triggers close-the-loop
        monitoring automatically
    end note`,
  },
  pipeline: {
    title: 'Data Pipeline Architecture',
    description: 'End-to-end data flow from sources to PM workbench',
    chart: `flowchart TB
    subgraph Sources
        Reddit[Reddit<br/>r/tmobile]
        DD[DownDetector]
        Community[T-Mobile Community]
        AppReviews[App Store Reviews]
    end

    subgraph Ingestion
        Scrapers[Scrapers<br/>Every 15min]
        RawEvents[(raw_events<br/>Table)]
    end

    subgraph Processing
        Sentiment[Sentiment<br/>Analysis]
        Topic[Topic<br/>Detection]
        Dedup[Deduplication]
        ProductMap[Product Area<br/>Mapping]
        Signals[(signals<br/>Table)]
    end

    subgraph Intelligence
        CHI[CHI Score<br/>Calculation]
        Dashboard[Dashboard<br/>Charts]
        Auto[Auto-Create<br/>Opportunities]
    end

    subgraph PMWorkbench
        Opps[(opportunity_cards<br/>Table)]
        RICE[RICE<br/>Prioritization]
        PRD[PRD<br/>Generation]
        Stories[User Stories]
    end

    Sources --> Scrapers
    Scrapers --> RawEvents
    RawEvents --> Sentiment
    Sentiment --> Topic
    Topic --> Dedup
    Dedup --> ProductMap
    ProductMap --> Signals

    Signals --> CHI
    Signals --> Dashboard
    Signals --> Auto

    Auto --> Opps
    Opps --> RICE
    RICE --> PRD
    PRD --> Stories`,
  },
  autoCreate: {
    title: 'Auto-Opportunity Creation',
    description: 'Decision logic for automatically creating opportunities from signals',
    chart: `stateDiagram-v2
    [*] --> SignalDetected

    state SignalDetected {
        [*] --> CheckIntensity
    }

    state if_intensity <<choice>>
    CheckIntensity --> if_intensity
    if_intensity --> CheckSentiment: intensity > 100
    if_intensity --> Ignore: intensity ≤ 100

    state if_sentiment <<choice>>
    CheckSentiment --> if_sentiment
    if_sentiment --> CreateOpportunity: sentiment < -0.5
    if_sentiment --> Ignore: sentiment ≥ -0.5

    state CreateOpportunity {
        [*] --> CalculateRICE
        CalculateRICE --> SetSeverity
        SetSeverity --> SaveToDatabase
    }

    CreateOpportunity --> [*]
    Ignore --> [*]

    note right of CreateOpportunity
        RICE = (Reach × Impact × Confidence) / Effort
        Severity based on sentiment + intensity
    end note`,
  },
}

type DiagramKey = keyof typeof diagrams

export function WorkflowDiagrams() {
  const [activeDiagram, setActiveDiagram] = useState<DiagramKey>('journey')

  const tabs: { key: DiagramKey; label: string }[] = [
    { key: 'journey', label: 'PM Journey' },
    { key: 'lifecycle', label: 'Lifecycle' },
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'autoCreate', label: 'Auto-Create' },
  ]

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeDiagram === tab.key ? 'default' : 'outline'}
            onClick={() => setActiveDiagram(tab.key)}
            className={
              activeDiagram === tab.key
                ? 'bg-[#E8258E] hover:bg-[#D01A7A] text-white'
                : 'border-[#E8258E]/30 text-[#E8258E] hover:bg-[#E8258E]/10'
            }
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Diagram Card */}
      <Card className="bg-white/95 backdrop-blur-sm border-2 border-tmobile-gray-200 shadow-xl">
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-2xl font-bold text-[#E8258E] mb-2">
              {diagrams[activeDiagram].title}
            </h3>
            <p className="text-tmobile-gray-600">
              {diagrams[activeDiagram].description}
            </p>
          </div>

          <MermaidDiagram chart={diagrams[activeDiagram].chart} />
        </div>
      </Card>
    </div>
  )
}
