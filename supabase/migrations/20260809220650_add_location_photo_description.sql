/*
# Add photo_url and description columns to locations table

1. Modified Tables
- `locations` — add `photo_url` (text, nullable) for branch/city photo shown in popup
- `locations` — add `description` (text, nullable) for longer popup description text

2. Security
- No RLS policy changes. Existing anon+authenticated CRUD policies already cover the new columns.

3. Notes
- Both columns are nullable so existing rows remain valid without backfill.
- The CMS admin form will optionally include these fields.
*/

ALTER TABLE locations ADD COLUMN IF NOT EXISTS photo_url text;
ALTER TABLE locations ADD COLUMN IF NOT EXISTS description text;

-- Seed default locations with descriptions and photos if table is empty
INSERT INTO locations (city, country, role, lat, lng, color, "order", published, photo_url, description)
SELECT * FROM (VALUES
  ('Singapore', 'Singapore', 'Holding & Headquarters', 1.3521, 103.8198, '#3EC4FF', 1, true,
   'https://images.pexels.com/photos/2506923/pexels-photo-2506923.jpeg?auto=compress&cs=tinysrgb&w=800',
   'Global headquarters and strategic holding entity for Sunjaya Asia Group.'),
  ('Jakarta', 'Indonesia', 'Indonesia Distribution & Operational Hub', -6.2088, 106.8456, '#FF6A3D', 2, true,
   'https://images.pexels.com/photos/1234590/pexels-photo-1234590.jpeg?auto=compress&cs=tinysrgb&w=800',
   'Primary operational hub for Indonesia distribution and technology subsidiaries.'),
  ('Batam', 'Indonesia', 'FTZ Distribution Hub', 1.1301, 104.0530, '#FF6A3D', 3, true,
   'https://images.pexels.com/photos/2079438/pexels-photo-2079438.jpeg?auto=compress&cs=tinysrgb&w=800',
   'Free Trade Zone distribution hub for Allwyn Group Indonesia.'),
  ('Balikpapan', 'Indonesia', 'East Indonesia Operations', -1.2379, 116.8529, '#FF6A3D', 4, true,
   'https://images.pexels.com/photos/2079246/pexels-photo-2079246.jpeg?auto=compress&cs=tinysrgb&w=800',
   'East Indonesia regional operations and logistics.'),
  ('Dubai', 'UAE', 'Middle East Distribution & Operational Hub', 25.2048, 55.2708, '#8BFF63', 5, true,
   'https://images.pexels.com/photos/2049527/pexels-photo-2049527.jpeg?auto=compress&cs=tinysrgb&w=800',
   'Middle East distribution and commodity trading hub for Sunjaya Emirates LLC.'),
  ('Delaware', 'USA', 'America Distribution Hub & Assets Management', 39.0000, -75.5000, '#8BFF63', 6, true,
   'https://images.pexels.com/photos/802024/pexels-photo-802024.jpeg?auto=compress&cs=tinysrgb&w=800',
   'American branch for capital investment and assets management operations.'),
  ('Beijing', 'China', 'Strategic Market Operations', 39.9042, 116.4074, '#FFB84D', 7, true,
   'https://images.pexels.com/photos/1614466/pexels-photo-1614466.jpeg?auto=compress&cs=tinysrgb&w=800',
   'Strategic joint venture operations in defense and military technology with Sunjaya An Xin.')
) AS v(city, country, role, lat, lng, color, "order", published, photo_url, description)
WHERE NOT EXISTS (SELECT 1 FROM locations LIMIT 1);
