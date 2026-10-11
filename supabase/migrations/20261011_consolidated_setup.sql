-- =====================================================================
-- Sunjaya Asia Group — Consolidated Supabase setup
-- Run this ONCE in Supabase Dashboard -> SQL Editor -> New query -> Run
-- Safe to re-run (idempotent).
-- =====================================================================

-- ---------- CONTACTS ----------
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  company text,
  subject text NOT NULL,
  message text NOT NULL,
  inquiry_type text NOT NULL DEFAULT 'general',
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_contacts" ON contacts;
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE TO anon, authenticated USING (true);

-- ---------- NEWS ----------
CREATE TABLE IF NOT EXISTS news (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text NOT NULL UNIQUE,
  excerpt text NOT NULL,
  body text NOT NULL,
  category text NOT NULL DEFAULT 'Press Release',
  cover_image text,
  published boolean NOT NULL DEFAULT true,
  language text NOT NULL DEFAULT 'en',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_language ON news(language);
CREATE INDEX IF NOT EXISTS idx_news_published ON news(published);
CREATE INDEX IF NOT EXISTS idx_news_created_at ON news(created_at DESC);
ALTER TABLE news ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_news" ON news;
CREATE POLICY "anon_select_news" ON news FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_news" ON news;
CREATE POLICY "anon_insert_news" ON news FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_news" ON news;
CREATE POLICY "anon_update_news" ON news FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_news" ON news;
CREATE POLICY "anon_delete_news" ON news FOR DELETE TO anon, authenticated USING (true);

-- ---------- LOCATIONS ----------
CREATE TABLE IF NOT EXISTS locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  city text NOT NULL,
  country text NOT NULL,
  role text NOT NULL,
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  color text NOT NULL DEFAULT '#C86230',
  "order" integer NOT NULL DEFAULT 100,
  published boolean NOT NULL DEFAULT true,
  photo_url text,
  description text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_locations_order ON locations("order");
CREATE INDEX IF NOT EXISTS idx_locations_published ON locations(published);
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "anon_select_locations" ON locations;
CREATE POLICY "anon_select_locations" ON locations FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_locations" ON locations;
CREATE POLICY "anon_insert_locations" ON locations FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_locations" ON locations;
CREATE POLICY "anon_update_locations" ON locations FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_locations" ON locations;
CREATE POLICY "anon_delete_locations" ON locations FOR DELETE TO anon, authenticated USING (true);

-- ---------- ASSETS (image registry for the CMS) ----------
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
CREATE POLICY "anon_select_assets" ON assets FOR SELECT TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_assets" ON assets;
CREATE POLICY "anon_insert_assets" ON assets FOR INSERT TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_assets" ON assets;
CREATE POLICY "anon_update_assets" ON assets FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_assets" ON assets;
CREATE POLICY "anon_delete_assets" ON assets FOR DELETE TO anon, authenticated USING (true);
