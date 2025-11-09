'use client'

import { useState } from 'react'
import { insertSampleFeedback } from '@/app/actions/feedback'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export function InsertSampleDataButton() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleInsert = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const result = await insertSampleFeedback()

      if (result?.error) {
        setMessage(`Error: ${result.error}`)
      } else if (result?.success) {
        setMessage(`✅ ${result.message}`)
        // Refresh the page after a short delay to show the new data
        setTimeout(() => {
          router.refresh()
        }, 1000)
      }
    } catch (error) {
      setMessage('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        onClick={handleInsert}
        disabled={loading}
        className="bg-tmobile-magenta hover:bg-tmobile-magenta-dark text-white"
      >
        {loading ? 'Inserting...' : 'Insert Sample Data'}
      </Button>
      {message && (
        <p className={`text-sm ${message.includes('Error') ? 'text-red-600' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </div>
  )
}

