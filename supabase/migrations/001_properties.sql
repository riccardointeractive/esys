-- ═══════════════════════════════════════════════════════
-- ESYS VIP — Properties Schema
-- ═══════════════════════════════════════════════════════

-- ─── Helper: auto-update updated_at ───

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Helper: generate slug from title ───

CREATE OR REPLACE FUNCTION generate_slug(title text)
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

-- ═══════════════════════════════════════════════════════
-- Properties
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS properties (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text NOT NULL,
  slug        text NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',

  -- Classification
  type        text NOT NULL,       -- apartment, house, villa, etc.
  status      text NOT NULL DEFAULT 'available',  -- available, reserved, sold
  category    text NOT NULL,       -- newBuild, resale

  -- Specs
  price       numeric(12,2) NOT NULL DEFAULT 0,
  area        numeric(8,2) NOT NULL DEFAULT 0,
  bedrooms    smallint NOT NULL DEFAULT 0,
  bathrooms   smallint NOT NULL DEFAULT 0,

  -- Location
  address     text NOT NULL DEFAULT '',
  city        text NOT NULL DEFAULT '',
  province    text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  latitude    double precision,
  longitude   double precision,

  -- Extra
  energy_rating text,              -- A, B, C, D, E, F, G
  year_built    smallint,
  floor         smallint,

  -- Flags
  featured    boolean NOT NULL DEFAULT false,
  published   boolean NOT NULL DEFAULT false,

  -- Soft delete
  deleted_at  timestamptz,

  -- Timestamps
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- Indices
CREATE INDEX idx_properties_slug       ON properties (slug);
CREATE INDEX idx_properties_status     ON properties (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_category   ON properties (category) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_type       ON properties (type) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_published  ON properties (published) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_city       ON properties (city) WHERE deleted_at IS NULL;
CREATE INDEX idx_properties_price      ON properties (price) WHERE deleted_at IS NULL AND published = true;

-- Auto-update trigger
CREATE TRIGGER trg_properties_updated_at
  BEFORE UPDATE ON properties
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════
-- Property Images
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text NOT NULL DEFAULT '',
  sort_order  smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_property_images_property ON property_images (property_id, sort_order);

-- ═══════════════════════════════════════════════════════
-- Property Features
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS property_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  feature_key text NOT NULL,       -- matches PROPERTY_FEATURES keys

  UNIQUE (property_id, feature_key)
);

CREATE INDEX idx_property_features_property ON property_features (property_id);

-- ═══════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════

ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_features ENABLE ROW LEVEL SECURITY;

-- Public read: only published, non-deleted properties
CREATE POLICY properties_public_read ON properties
  FOR SELECT USING (published = true AND deleted_at IS NULL);

CREATE POLICY property_images_public_read ON property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_images.property_id
        AND properties.published = true
        AND properties.deleted_at IS NULL
    )
  );

CREATE POLICY property_features_public_read ON property_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM properties
      WHERE properties.id = property_features.property_id
        AND properties.published = true
        AND properties.deleted_at IS NULL
    )
  );

-- Admin (service_role) bypasses RLS automatically — no extra policy needed.
