-- ============================================
-- SAMPLE FEEDBACK DATA FOR GEOMAP HEATMAP
-- ============================================
-- 
-- STEP-BY-STEP INSTRUCTIONS:
-- 
-- 1. Open your Supabase Dashboard
-- 2. Go to SQL Editor (left sidebar)
-- 3. Click "New Query"
-- 4. Copy and paste this entire file
-- 5. Click "Run" (or press Cmd/Ctrl + Enter)
-- 
-- WHAT THIS DOES:
-- - Inserts 20+ sample feedback entries across major US cities
-- - Each entry has: city name, latitude, longitude, sentiment, and intensity
-- - Uses your first authenticated user automatically
-- 
-- VERIFICATION:
-- After running, check the bottom query to see how many records were inserted
-- 
-- ============================================

-- Step 1: Verify you have users (optional check)
-- SELECT id, email FROM auth.users LIMIT 5;

-- Step 2: Insert sample feedback data with location coordinates
-- This automatically uses the first user in your auth.users table
-- Data includes LOW, MEDIUM, and HIGH intensity values for a diverse heatmap

INSERT INTO feedback (user_id, city, lat, lng, sentiment, intensity)
VALUES
  -- HIGH INTENSITY (Red/Orange on heatmap) - Major pain points
  ((SELECT id FROM auth.users LIMIT 1), 'New York', 40.7128, -74.0060, -0.9, 98),
  ((SELECT id FROM auth.users LIMIT 1), 'New York', 40.7306, -73.9870, -0.85, 95),
  ((SELECT id FROM auth.users LIMIT 1), 'Los Angeles', 34.0522, -118.2437, -0.95, 99),
  ((SELECT id FROM auth.users LIMIT 1), 'Los Angeles', 34.0600, -118.2500, -0.88, 92),
  ((SELECT id FROM auth.users LIMIT 1), 'Chicago', 41.8781, -87.6298, -0.8, 96),
  ((SELECT id FROM auth.users LIMIT 1), 'Chicago', 41.9000, -87.6500, -0.82, 94),
  ((SELECT id FROM auth.users LIMIT 1), 'Houston', 29.7604, -95.3698, -0.75, 88),
  ((SELECT id FROM auth.users LIMIT 1), 'Miami', 25.7617, -80.1918, -0.9, 97),
  ((SELECT id FROM auth.users LIMIT 1), 'San Francisco', 37.7749, -122.4194, -0.88, 96),
  ((SELECT id FROM auth.users LIMIT 1), 'Boston', 42.3601, -71.0589, -0.82, 93),
  ((SELECT id FROM auth.users LIMIT 1), 'Philadelphia', 39.9526, -75.1652, -0.78, 89),
  ((SELECT id FROM auth.users LIMIT 1), 'Phoenix', 33.4484, -112.0740, -0.8, 91),
  ((SELECT id FROM auth.users LIMIT 1), 'San Antonio', 29.4241, -98.4936, -0.77, 87),
  ((SELECT id FROM auth.users LIMIT 1), 'San Diego', 32.7157, -117.1611, -0.75, 85),
  
  -- MEDIUM INTENSITY (Yellow/Green on heatmap) - Moderate issues
  ((SELECT id FROM auth.users LIMIT 1), 'Dallas', 32.7767, -96.7970, -0.6, 68),
  ((SELECT id FROM auth.users LIMIT 1), 'Dallas', 32.7800, -96.8000, -0.55, 62),
  ((SELECT id FROM auth.users LIMIT 1), 'San Jose', 37.3382, -121.8863, -0.65, 70),
  ((SELECT id FROM auth.users LIMIT 1), 'Austin', 30.2672, -97.7431, -0.58, 65),
  ((SELECT id FROM auth.users LIMIT 1), 'Jacksonville', 30.3322, -81.6557, -0.48, 59),
  ((SELECT id FROM auth.users LIMIT 1), 'Indianapolis', 39.7684, -86.1581, -0.52, 61),
  ((SELECT id FROM auth.users LIMIT 1), 'Columbus', 39.9612, -82.9988, -0.47, 57),
  ((SELECT id FROM auth.users LIMIT 1), 'Charlotte', 35.2271, -80.8431, -0.45, 55),
  ((SELECT id FROM auth.users LIMIT 1), 'Seattle', 47.6062, -122.3321, -0.6, 68),
  ((SELECT id FROM auth.users LIMIT 1), 'Denver', 39.7392, -104.9903, -0.55, 63),
  ((SELECT id FROM auth.users LIMIT 1), 'Washington DC', 38.9072, -77.0369, -0.5, 60),
  ((SELECT id FROM auth.users LIMIT 1), 'Boston', 42.3500, -71.0500, -0.52, 61),
  ((SELECT id FROM auth.users LIMIT 1), 'Nashville', 36.1627, -86.7816, -0.48, 58),
  ((SELECT id FROM auth.users LIMIT 1), 'Detroit', 42.3314, -83.0458, -0.5, 60),
  ((SELECT id FROM auth.users LIMIT 1), 'Portland', 45.5152, -122.6784, -0.45, 56),
  
  -- LOW INTENSITY (Blue on heatmap) - Minor issues
  ((SELECT id FROM auth.users LIMIT 1), 'Memphis', 35.1495, -90.0490, -0.25, 32),
  ((SELECT id FROM auth.users LIMIT 1), 'Baltimore', 39.2904, -76.6122, -0.15, 25),
  ((SELECT id FROM auth.users LIMIT 1), 'Milwaukee', 43.0389, -87.9065, -0.22, 28),
  ((SELECT id FROM auth.users LIMIT 1), 'Kansas City', 39.0997, -94.5786, -0.18, 27),
  ((SELECT id FROM auth.users LIMIT 1), 'Atlanta', 33.7490, -84.3880, -0.35, 40),
  ((SELECT id FROM auth.users LIMIT 1), 'Orlando', 28.5383, -81.3792, -0.28, 38),
  ((SELECT id FROM auth.users LIMIT 1), 'Las Vegas', 36.1699, -115.1398, -0.32, 39),
  ((SELECT id FROM auth.users LIMIT 1), 'Cleveland', 41.4993, -81.6944, -0.2, 30),
  ((SELECT id FROM auth.users LIMIT 1), 'Minneapolis', 44.9778, -93.2650, -0.3, 35),
  ((SELECT id FROM auth.users LIMIT 1), 'Tampa', 27.9506, -82.4572, -0.25, 33),
  ((SELECT id FROM auth.users LIMIT 1), 'Pittsburgh', 40.4406, -79.9959, -0.2, 29),
  ((SELECT id FROM auth.users LIMIT 1), 'Cincinnati', 39.1031, -84.5120, -0.18, 26),
  ((SELECT id FROM auth.users LIMIT 1), 'Sacramento', 38.5816, -121.4944, -0.22, 31),
  ((SELECT id FROM auth.users LIMIT 1), 'Salt Lake City', 40.7608, -111.8910, -0.3, 36),
  ((SELECT id FROM auth.users LIMIT 1), 'Raleigh', 35.7796, -78.6382, -0.15, 24);

-- Verify the data was inserted
SELECT COUNT(*) as total_feedback, 
       COUNT(lat) as with_lat, 
       COUNT(lng) as with_lng,
       COUNT(*) FILTER (WHERE lat IS NOT NULL AND lng IS NOT NULL) as with_coordinates
FROM feedback;

