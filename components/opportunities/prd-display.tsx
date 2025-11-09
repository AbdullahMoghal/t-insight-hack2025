'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Copy, Download, CheckCircle2 } from 'lucide-react'

interface PRD {
  problemStatement: string
  userImpact: string
  evidenceSummary: string
  proposedSolution: string
  successMetrics: string[]
  acceptanceCriteria: string[]
  implementation: {
    phase1: string[]
    phase2: string[]
  }
  risks: string[]
}

interface PRDDisplayProps {
  opportunityTitle: string
  prd: PRD | null
  isOpen: boolean
  onClose: () => void
}

export function PRDDisplay({
  opportunityTitle,
  prd,
  isOpen,
  onClose,
}: PRDDisplayProps) {
  const [copied, setCopied] = useState(false)

  const copyToClipboard = () => {
    if (!prd) return

    const prdMarkdown = `# Product Requirements Document
## ${opportunityTitle}

### Problem Statement
${prd.problemStatement}

### User Impact
${prd.userImpact}

### Evidence Summary
${prd.evidenceSummary}

### Proposed Solution
${prd.proposedSolution}

### Success Metrics
${prd.successMetrics.map((m) => `- ${m}`).join('\n')}

### Acceptance Criteria
${prd.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}

### Implementation Plan

#### Phase 1
${prd.implementation.phase1.map((s) => `- ${s}`).join('\n')}

#### Phase 2
${prd.implementation.phase2.map((s) => `- ${s}`).join('\n')}

### Risks & Mitigations
${prd.risks.map((r) => `- ${r}`).join('\n')}

---
*Generated with InsighT AI*
`

    navigator.clipboard.writeText(prdMarkdown)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadMarkdown = () => {
    if (!prd) return

    const prdMarkdown = `# Product Requirements Document
## ${opportunityTitle}

### Problem Statement
${prd.problemStatement}

### User Impact
${prd.userImpact}

### Evidence Summary
${prd.evidenceSummary}

### Proposed Solution
${prd.proposedSolution}

### Success Metrics
${prd.successMetrics.map((m) => `- ${m}`).join('\n')}

### Acceptance Criteria
${prd.acceptanceCriteria.map((c) => `- ${c}`).join('\n')}

### Implementation Plan

#### Phase 1
${prd.implementation.phase1.map((s) => `- ${s}`).join('\n')}

#### Phase 2
${prd.implementation.phase2.map((s) => `- ${s}`).join('\n')}

### Risks & Mitigations
${prd.risks.map((r) => `- ${r}`).join('\n')}

---
*Generated with T-Insight AI*
`

    const blob = new Blob([prdMarkdown], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `PRD-${opportunityTitle.replace(/\s+/g, '-').toLowerCase()}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (!prd) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-[#E8258E]">
            Product Requirements Document
          </DialogTitle>
          <DialogDescription className="text-base font-medium">
            {opportunityTitle}
          </DialogDescription>
        </DialogHeader>

        {/* Action Buttons */}
        <div className="flex gap-2 pb-4 border-b border-tmobile-gray-200">
          <Button
            size="sm"
            variant="outline"
            onClick={copyToClipboard}
            className="text-xs"
          >
            {copied ? (
              <>
                <CheckCircle2 className="h-3 w-3 mr-1.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3 w-3 mr-1.5" />
                Copy
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={downloadMarkdown}
            className="text-xs"
          >
            <Download className="h-3 w-3 mr-1.5" />
            Download
          </Button>
        </div>

        <div className="space-y-6 mt-4">
          {/* Problem Statement */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Problem Statement
            </h3>
            <p className="text-tmobile-gray-700 leading-relaxed pl-4">
              {prd.problemStatement}
            </p>
          </section>

          <Separator />

          {/* User Impact */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              User Impact
            </h3>
            <p className="text-tmobile-gray-700 leading-relaxed pl-4">
              {prd.userImpact}
            </p>
          </section>

          <Separator />

          {/* Evidence Summary */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Evidence Summary
            </h3>
            <p className="text-tmobile-gray-700 leading-relaxed pl-4">
              {prd.evidenceSummary}
            </p>
          </section>

          <Separator />

          {/* Proposed Solution */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Proposed Solution
            </h3>
            <p className="text-tmobile-gray-700 leading-relaxed pl-4 whitespace-pre-line">
              {prd.proposedSolution}
            </p>
          </section>

          <Separator />

          {/* Success Metrics */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Success Metrics
            </h3>
            <ul className="space-y-2 pl-4">
              {prd.successMetrics.map((metric, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-[#E8258E] font-bold mt-1">•</span>
                  <span className="text-tmobile-gray-700">{metric}</span>
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          {/* Acceptance Criteria */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Acceptance Criteria
            </h3>
            <ul className="space-y-2 pl-4">
              {prd.acceptanceCriteria.map((criteria, index) => (
                <li
                  key={index}
                  className="bg-tmobile-gray-50 rounded-lg p-3 border border-tmobile-gray-200"
                >
                  <code className="text-sm text-tmobile-gray-700">{criteria}</code>
                </li>
              ))}
            </ul>
          </section>

          <Separator />

          {/* Implementation Plan */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-4 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Implementation Plan
            </h3>
            <div className="space-y-4 pl-4">
              {/* Phase 1 */}
              <div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-2">
                  Phase 1
                </Badge>
                <ul className="space-y-1.5">
                  {prd.implementation.phase1.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-blue-600 font-bold mt-1">→</span>
                      <span className="text-tmobile-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Phase 2 */}
              <div>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200 mb-2">
                  Phase 2
                </Badge>
                <ul className="space-y-1.5">
                  {prd.implementation.phase2.map((step, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-purple-600 font-bold mt-1">→</span>
                      <span className="text-tmobile-gray-700">{step}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <Separator />

          {/* Risks */}
          <section>
            <h3 className="text-lg font-semibold text-tmobile-gray-800 mb-3 flex items-center gap-2">
              <span className="w-1 h-6 bg-[#E8258E] rounded" />
              Risks & Mitigations
            </h3>
            <ul className="space-y-2 pl-4">
              {prd.risks.map((risk, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 bg-orange-50 border border-orange-200 rounded-lg p-3"
                >
                  <span className="text-orange-600 font-bold mt-1">⚠</span>
                  <span className="text-tmobile-gray-700">{risk}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="mt-6 pt-6 border-t border-tmobile-gray-200 text-center">
          <p className="text-xs text-tmobile-gray-500 italic">
            Generated with T-Insight AI
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
