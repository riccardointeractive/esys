-- Dynamic property definitions (managed via Admin > Ajustes)
-- Replaces hardcoded values in src/config/property.ts

CREATE TABLE esys_definitions (
  id          uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  category    text NOT NULL,
  key         text NOT NULL,
  label_es    text NOT NULL,
  label_en    text NOT NULL DEFAULT '',
  label_ru    text NOT NULL DEFAULT '',
  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,
  metadata    jsonb DEFAULT '{}',
  created_at  timestamptz DEFAULT now(),
  updated_at  timestamptz DEFAULT now(),
  UNIQUE(category, key)
);

CREATE INDEX idx_definitions_category ON esys_definitions(category, active, sort_order);

-- RLS: public read, admin write (via service role key)
ALTER TABLE esys_definitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read definitions"
  ON esys_definitions FOR SELECT
  USING (true);

CREATE POLICY "Service role full access"
  ON esys_definitions FOR ALL
  USING (true)
  WITH CHECK (true);
