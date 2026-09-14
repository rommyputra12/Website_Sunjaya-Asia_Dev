/*
# Register the new pillar poster assets

1. Purpose
- Replace the older Foundation, Core, and Future poster references with the three newly supplied full-frame assets.
- Keep the public asset registry aligned with the files used by the pillar page.

2. Modified asset records
- `foundation_slide`: the new Foundation poster, including Chapter 01 artwork.
- `core_slide`: the new Core poster, including Chapter 02 artwork.
- `future_slide`: the new Future poster, including Chapter 03 artwork.
- Each record stores the public file URL, accessible label, and poster dimensions.

3. Security
- No new tables are created.
- Existing public asset access rules remain unchanged because these are shared website assets.

4. Notes
- The source image files remain in the public asset collection.
- The frontend uses the same stable asset keys while pointing to the new files.
*/

INSERT INTO assets (key, url, alt, width, height)
VALUES
  ('foundation_slide', '/images/01_Foundation_Pillars_New2026%20copy%203.jpg', 'The Foundation — Chapter 01 poster', 1024, 1536),
  ('core_slide', '/images/02_The_Core_Pillars_03.01.48%20copy%202.png', 'The Core — Chapter 02 poster', 1024, 1536),
  ('future_slide', '/images/03_The_Future_Pillar_02.36.31.jpg', 'The Future — Chapter 03 poster', 1024, 1536)
ON CONFLICT (key) DO UPDATE
SET url = EXCLUDED.url,
    alt = EXCLUDED.alt,
    width = EXCLUDED.width,
    height = EXCLUDED.height,
    updated_at = now();