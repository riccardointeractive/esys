-- ═══════════════════════════════════════════════════════
-- ESYS VIP — Properties Schema
-- All tables prefixed with esys_ to avoid conflicts
-- ═══════════════════════════════════════════════════════

-- ─── Helper: auto-update updated_at ───

CREATE OR REPLACE FUNCTION esys_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ─── Helper: generate slug from title ───

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

-- ═══════════════════════════════════════════════════════
-- Properties
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS esys_properties (
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
CREATE INDEX idx_esys_properties_slug       ON esys_properties (slug);
CREATE INDEX idx_esys_properties_status     ON esys_properties (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_properties_category   ON esys_properties (category) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_properties_type       ON esys_properties (type) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_properties_published  ON esys_properties (published) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_properties_city       ON esys_properties (city) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_properties_price      ON esys_properties (price) WHERE deleted_at IS NULL AND published = true;

-- Auto-update trigger
CREATE TRIGGER trg_esys_properties_updated_at
  BEFORE UPDATE ON esys_properties
  FOR EACH ROW EXECUTE FUNCTION esys_update_updated_at();

-- ═══════════════════════════════════════════════════════
-- Property Images
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS esys_property_images (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES esys_properties(id) ON DELETE CASCADE,
  url         text NOT NULL,
  alt_text    text NOT NULL DEFAULT '',
  sort_order  smallint NOT NULL DEFAULT 0,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_esys_property_images_property ON esys_property_images (property_id, sort_order);

-- ═══════════════════════════════════════════════════════
-- Property Features
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS esys_property_features (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL REFERENCES esys_properties(id) ON DELETE CASCADE,
  feature_key text NOT NULL,       -- matches PROPERTY_FEATURES keys

  UNIQUE (property_id, feature_key)
);

CREATE INDEX idx_esys_property_features_property ON esys_property_features (property_id);

-- ═══════════════════════════════════════════════════════
-- Media
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS esys_media (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename      text NOT NULL,
  original_name text NOT NULL DEFAULT '',
  mime_type     text NOT NULL,
  size_bytes    bigint NOT NULL DEFAULT 0,
  url           text NOT NULL,
  width         integer,
  height        integer,
  alt_text      text NOT NULL DEFAULT '',
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_esys_media_mime_type ON esys_media (mime_type);
CREATE INDEX idx_esys_media_created   ON esys_media (created_at DESC);

-- ═══════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════

ALTER TABLE esys_properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE esys_property_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE esys_property_features ENABLE ROW LEVEL SECURITY;
ALTER TABLE esys_media ENABLE ROW LEVEL SECURITY;

-- Public read: only published, non-deleted properties
CREATE POLICY esys_properties_public_read ON esys_properties
  FOR SELECT USING (published = true AND deleted_at IS NULL);

CREATE POLICY esys_property_images_public_read ON esys_property_images
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM esys_properties
      WHERE esys_properties.id = esys_property_images.property_id
        AND esys_properties.published = true
        AND esys_properties.deleted_at IS NULL
    )
  );

CREATE POLICY esys_property_features_public_read ON esys_property_features
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM esys_properties
      WHERE esys_properties.id = esys_property_features.property_id
        AND esys_properties.published = true
        AND esys_properties.deleted_at IS NULL
    )
  );

-- Media: no public read (admin only via service_role)
-- Admin (service_role) bypasses RLS automatically — no extra policy needed.
