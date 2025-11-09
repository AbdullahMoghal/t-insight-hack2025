import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch all feedback with location data
    const { data, error } = await supabase
      .from('feedback')
      .select('city, lat, lng, sentiment, intensity')
      .not('lat', 'is', null)
      .not('lng', 'is', null)

    if (error) {
      console.error('Error fetching feedback:', error)
      // Return empty array if table doesn't exist yet (for development)
      return NextResponse.json({
        feedback: [],
      })
    }

    return NextResponse.json({
      feedback: data || [],
    })
  } catch (error) {
    console.error('Error in feedback API:', error)
    // Return empty array on error to prevent breaking the page
    return NextResponse.json({
      feedback: [],
    })
  }
}

