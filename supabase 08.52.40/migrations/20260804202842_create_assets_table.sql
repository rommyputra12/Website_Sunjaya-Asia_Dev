/*
# Create assets table for CMS-managed image assets

1. New Tables
- `assets` — registry of image assets used across the site (key, url, alt, width, height, created_at).
  Stores the reference/path to each image so the frontend can resolve asset URLs from the database
  instead of hard-coding them. The binary file lives in the repo's public folder; this table tracks
  metadata so assets can be swapped via the database without code changes.

2. Security
- RLS enabled on `assets`.
- Single-tenant (no sign-in screen): anon + authenticated CRUD allowed because asset metadata is
  intentionally public/shared.

3. Notes
- `id` uuid primary key with gen_random_uuid() default.
- `key` is unique so each asset is addressable by a stable string (e.g. "foundation_slide").
- `url` stores the path/URL the frontend should use for the <img src>.
*/

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  url text NOT NULL,
  alt text,
  width integer,
  height integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_assets" ON assets;
CREATE POLICY "anon_select_assets" ON assets FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_assets" ON assets;
CREATE POLICY "anon_insert_assets" ON assets FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_assets" ON assets;
CREATE POLICY "anon_update_assets" ON assets FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_assets" ON assets;
CREATE POLICY "anon_delete_assets" ON assets FOR DELETE
  TO anon, authenticated USING (true);

-- Seed the Foundation pillar image asset
INSERT INTO assets (key, url, alt, width, height)
VALUES ('foundation_slide', '/images/01_Foundation_Pillars.png', 'The Foundation — Capital & Infrastructure', 2160, 2700)
ON CONFLICT (key) DO UPDATE
SET url = EXCLUDED.url, alt = EXCLUDED.alt, width = EXCLUDED.width, height = EXCLUDED.height, updated_at = now();
