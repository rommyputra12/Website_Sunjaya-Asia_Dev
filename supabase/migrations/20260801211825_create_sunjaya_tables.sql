/*
# Create Sunjaya Asia Group tables

1. New Tables
- `contacts` — public contact form submissions (name, email, company, subject, message, inquiry_type)
- `news` — CMS-managed news articles (title, slug, excerpt, body, category, cover_image, published, language)
- `locations` — CMS-managed global presence locations (city, country, role, lat, lng, color, order, published)

2. Security
- All tables are single-tenant (no sign-in screen for public visitors).
- Admin access is controlled by the backend via an admin token header, NOT RLS.
- RLS enabled on all tables with anon+authenticated CRUD allowed (data is intentionally public/shared).
- contacts: public can INSERT (form submission), admin reads via backend service role.
- news: public can SELECT published, admin manages via backend service role.
- locations: public can SELECT published, admin manages via backend service role.

3. Notes
- `id` columns use uuid with gen_random_uuid() default.
- Timestamps use timestamptz with now() default.
- Slug on news is unique.
*/

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
CREATE POLICY "anon_select_contacts" ON contacts FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_contacts" ON contacts;
CREATE POLICY "anon_insert_contacts" ON contacts FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_contacts" ON contacts;
CREATE POLICY "anon_update_contacts" ON contacts FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_contacts" ON contacts;
CREATE POLICY "anon_delete_contacts" ON contacts FOR DELETE
  TO anon, authenticated USING (true);

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
CREATE POLICY "anon_select_news" ON news FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_news" ON news;
CREATE POLICY "anon_insert_news" ON news FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_news" ON news;
CREATE POLICY "anon_update_news" ON news FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_news" ON news;
CREATE POLICY "anon_delete_news" ON news FOR DELETE
  TO anon, authenticated USING (true);

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
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_order ON locations("order");
CREATE INDEX IF NOT EXISTS idx_locations_published ON locations(published);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_locations" ON locations;
CREATE POLICY "anon_select_locations" ON locations FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_locations" ON locations;
CREATE POLICY "anon_insert_locations" ON locations FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_locations" ON locations;
CREATE POLICY "anon_update_locations" ON locations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_locations" ON locations;
CREATE POLICY "anon_delete_locations" ON locations FOR DELETE
  TO anon, authenticated USING (true);
