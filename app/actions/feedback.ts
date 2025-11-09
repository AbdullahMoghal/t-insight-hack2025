'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function insertSampleFeedback() {
  try {
    const supabase = await createClient()

    // Get the current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'You must be logged in to insert sample data' }
    }

    // Sample feedback data with coordinates - includes LOW, MEDIUM, and HIGH intensity
    const sampleData = [
      // HIGH INTENSITY (Red/Orange on heatmap) - Major pain points
      { city: 'New York', lat: 40.7128, lng: -74.0060, sentiment: -0.9, intensity: 98 },
      { city: 'New York', lat: 40.7306, lng: -73.9870, sentiment: -0.85, intensity: 95 },
      { city: 'Los Angeles', lat: 34.0522, lng: -118.2437, sentiment: -0.95, intensity: 99 },
      { city: 'Los Angeles', lat: 34.0600, lng: -118.2500, sentiment: -0.88, intensity: 92 },
      { city: 'Chicago', lat: 41.8781, lng: -87.6298, sentiment: -0.8, intensity: 96 },
      { city: 'Chicago', lat: 41.9000, lng: -87.6500, sentiment: -0.82, intensity: 94 },
      { city: 'Houston', lat: 29.7604, lng: -95.3698, sentiment: -0.75, intensity: 88 },
      { city: 'Miami', lat: 25.7617, lng: -80.1918, sentiment: -0.9, intensity: 97 },
      { city: 'San Francisco', lat: 37.7749, lng: -122.4194, sentiment: -0.88, intensity: 96 },
      { city: 'Boston', lat: 42.3601, lng: -71.0589, sentiment: -0.82, intensity: 93 },
      { city: 'Philadelphia', lat: 39.9526, lng: -75.1652, sentiment: -0.78, intensity: 89 },
      { city: 'Phoenix', lat: 33.4484, lng: -112.0740, sentiment: -0.8, intensity: 91 },
      { city: 'San Antonio', lat: 29.4241, lng: -98.4936, sentiment: -0.77, intensity: 87 },
      { city: 'San Diego', lat: 32.7157, lng: -117.1611, sentiment: -0.75, intensity: 85 },
      
      // MEDIUM INTENSITY (Yellow/Green on heatmap) - Moderate issues
      { city: 'Dallas', lat: 32.7767, lng: -96.7970, sentiment: -0.6, intensity: 68 },
      { city: 'Dallas', lat: 32.7800, lng: -96.8000, sentiment: -0.55, intensity: 62 },
      { city: 'San Jose', lat: 37.3382, lng: -121.8863, sentiment: -0.65, intensity: 70 },
      { city: 'Austin', lat: 30.2672, lng: -97.7431, sentiment: -0.58, intensity: 65 },
      { city: 'Jacksonville', lat: 30.3322, lng: -81.6557, sentiment: -0.48, intensity: 59 },
      { city: 'Indianapolis', lat: 39.7684, lng: -86.1581, sentiment: -0.52, intensity: 61 },
      { city: 'Columbus', lat: 39.9612, lng: -82.9988, sentiment: -0.47, intensity: 57 },
      { city: 'Charlotte', lat: 35.2271, lng: -80.8431, sentiment: -0.45, intensity: 55 },
      { city: 'Seattle', lat: 47.6062, lng: -122.3321, sentiment: -0.6, intensity: 68 },
      { city: 'Denver', lat: 39.7392, lng: -104.9903, sentiment: -0.55, intensity: 63 },
      { city: 'Washington DC', lat: 38.9072, lng: -77.0369, sentiment: -0.5, intensity: 60 },
      { city: 'Boston', lat: 42.3500, lng: -71.0500, sentiment: -0.52, intensity: 61 },
      { city: 'Nashville', lat: 36.1627, lng: -86.7816, sentiment: -0.48, intensity: 58 },
      { city: 'Detroit', lat: 42.3314, lng: -83.0458, sentiment: -0.5, intensity: 60 },
      { city: 'Portland', lat: 45.5152, lng: -122.6784, sentiment: -0.45, intensity: 56 },
      
      // LOW INTENSITY (Blue on heatmap) - Minor issues
      { city: 'Memphis', lat: 35.1495, lng: -90.0490, sentiment: -0.25, intensity: 32 },
      { city: 'Baltimore', lat: 39.2904, lng: -76.6122, sentiment: -0.15, intensity: 25 },
      { city: 'Milwaukee', lat: 43.0389, lng: -87.9065, sentiment: -0.22, intensity: 28 },
      { city: 'Kansas City', lat: 39.0997, lng: -94.5786, sentiment: -0.18, intensity: 27 },
      { city: 'Atlanta', lat: 33.7490, lng: -84.3880, sentiment: -0.35, intensity: 40 },
      { city: 'Orlando', lat: 28.5383, lng: -81.3792, sentiment: -0.28, intensity: 38 },
      { city: 'Las Vegas', lat: 36.1699, lng: -115.1398, sentiment: -0.32, intensity: 39 },
      { city: 'Cleveland', lat: 41.4993, lng: -81.6944, sentiment: -0.2, intensity: 30 },
      { city: 'Minneapolis', lat: 44.9778, lng: -93.2650, sentiment: -0.3, intensity: 35 },
      { city: 'Tampa', lat: 27.9506, lng: -82.4572, sentiment: -0.25, intensity: 33 },
      { city: 'Pittsburgh', lat: 40.4406, lng: -79.9959, sentiment: -0.2, intensity: 29 },
      { city: 'Cincinnati', lat: 39.1031, lng: -84.5120, sentiment: -0.18, intensity: 26 },
      { city: 'Sacramento', lat: 38.5816, lng: -121.4944, sentiment: -0.22, intensity: 31 },
      { city: 'Salt Lake City', lat: 40.7608, lng: -111.8910, sentiment: -0.3, intensity: 36 },
      { city: 'Raleigh', lat: 35.7796, lng: -78.6382, sentiment: -0.15, intensity: 24 },
    ]

    // Insert all sample data
    const { data, error } = await supabase
      .from('feedback')
      .insert(
        sampleData.map((item) => ({
          user_id: user.id,
          ...item,
        }))
      )
      .select()

    if (error) {
      console.error('Error inserting sample data:', error)
      return { 
        error: error.message || 'Failed to insert sample data',
        details: error.details,
        hint: error.hint
      }
    }

    revalidatePath('/dashboard/geo')
    return { 
      success: true, 
      count: data?.length || 0,
      message: `Successfully inserted ${data?.length || 0} sample feedback entries`
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { 
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    }
  }
}

