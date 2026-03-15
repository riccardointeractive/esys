-- ═══════════════════════════════════════════════════════
-- Multilingual title & description for properties
-- Renames title → title_es, description → description_es
-- Adds _en and _ru variants
-- ═══════════════════════════════════════════════════════

-- Rename existing columns to _es
ALTER TABLE esys_properties RENAME COLUMN title TO title_es;
ALTER TABLE esys_properties RENAME COLUMN description TO description_es;

-- Add EN and RU columns
ALTER TABLE esys_properties ADD COLUMN title_en text NOT NULL DEFAULT '';
ALTER TABLE esys_properties ADD COLUMN title_ru text NOT NULL DEFAULT '';
ALTER TABLE esys_properties ADD COLUMN description_en text NOT NULL DEFAULT '';
ALTER TABLE esys_properties ADD COLUMN description_ru text NOT NULL DEFAULT '';

-- Update slug function to use title_es
-- (slug is always based on the Spanish title)
CREATE OR REPLACE FUNCTION esys_generate_slug(title text)
RETURNS text AS $$
BEGIN
  RETURN lower(
    regexp_replace(
      regexp_replace(
        translate(title, 'áéíóúñüÁÉÍÓÚÑÜ', 'aeiounuaeiounU'),
        '[^a-zA-Z0-9\s-]', '', 'g'
      ),
      '\s+', '-', 'g'
    )
  );
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Update search index to include all title variants
DROP INDEX IF EXISTS idx_esys_properties_search;
