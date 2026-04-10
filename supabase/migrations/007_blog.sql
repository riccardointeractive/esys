-- ═══════════════════════════════════════════════════════
-- ESYS VIP — Blog Schema
-- Reuses esys_update_updated_at() helper from 001_properties.sql
-- ═══════════════════════════════════════════════════════

-- ─── Blog Categories ───

CREATE TABLE IF NOT EXISTS esys_blog_categories (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        text NOT NULL UNIQUE,

  -- Multilingual labels
  label_es    text NOT NULL,
  label_en    text NOT NULL DEFAULT '',
  label_ru    text NOT NULL DEFAULT '',

  -- Optional descriptions for category landing pages
  description_es text NOT NULL DEFAULT '',
  description_en text NOT NULL DEFAULT '',
  description_ru text NOT NULL DEFAULT '',

  sort_order  integer NOT NULL DEFAULT 0,
  active      boolean NOT NULL DEFAULT true,

  deleted_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_esys_blog_categories_slug
  ON esys_blog_categories (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_blog_categories_active
  ON esys_blog_categories (active, sort_order) WHERE deleted_at IS NULL;

CREATE TRIGGER trg_esys_blog_categories_updated_at
  BEFORE UPDATE ON esys_blog_categories
  FOR EACH ROW EXECUTE FUNCTION esys_update_updated_at();

-- ═══════════════════════════════════════════════════════
-- Blog Posts
-- ═══════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS esys_blog_posts (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            text NOT NULL UNIQUE,

  -- Relations
  category_id     uuid REFERENCES esys_blog_categories(id) ON DELETE SET NULL,
  -- Soft reference to admin user (no FK because esys_admins is managed by @digiko-npm/cms)
  author_id       uuid,

  -- Multilingual content
  title_es        text NOT NULL,
  title_en        text NOT NULL DEFAULT '',
  title_ru        text NOT NULL DEFAULT '',

  excerpt_es      text NOT NULL DEFAULT '',
  excerpt_en      text NOT NULL DEFAULT '',
  excerpt_ru      text NOT NULL DEFAULT '',

  -- HTML output from TipTap, sanitized server-side before insert
  content_es      text NOT NULL DEFAULT '',
  content_en      text NOT NULL DEFAULT '',
  content_ru      text NOT NULL DEFAULT '',

  -- Cover (Unsplash)
  cover_image_url         text NOT NULL DEFAULT '',
  cover_thumb_url         text NOT NULL DEFAULT '',
  cover_blur_hash         text,
  cover_alt               text NOT NULL DEFAULT '',
  cover_photographer_name text NOT NULL DEFAULT '',
  cover_photographer_url  text NOT NULL DEFAULT '',
  cover_photo_page_url    text NOT NULL DEFAULT '',
  cover_unsplash_id       text,

  -- State
  status          text NOT NULL DEFAULT 'draft',
  featured        boolean NOT NULL DEFAULT false,
  published_at    timestamptz,

  -- Derived metrics
  reading_minutes smallint NOT NULL DEFAULT 0,
  view_count      integer NOT NULL DEFAULT 0,

  -- Soft delete + timestamps
  deleted_at      timestamptz,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT esys_blog_posts_status_check
    CHECK (status IN ('draft', 'published', 'archived'))
);

-- Indices
CREATE INDEX idx_esys_blog_posts_slug
  ON esys_blog_posts (slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_blog_posts_category
  ON esys_blog_posts (category_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_blog_posts_status
  ON esys_blog_posts (status) WHERE deleted_at IS NULL;
CREATE INDEX idx_esys_blog_posts_published
  ON esys_blog_posts (published_at DESC)
  WHERE deleted_at IS NULL AND status = 'published';
CREATE INDEX idx_esys_blog_posts_featured
  ON esys_blog_posts (featured)
  WHERE deleted_at IS NULL AND status = 'published';

CREATE TRIGGER trg_esys_blog_posts_updated_at
  BEFORE UPDATE ON esys_blog_posts
  FOR EACH ROW EXECUTE FUNCTION esys_update_updated_at();

-- ═══════════════════════════════════════════════════════
-- RLS Policies
-- ═══════════════════════════════════════════════════════

ALTER TABLE esys_blog_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE esys_blog_posts      ENABLE ROW LEVEL SECURITY;

-- Public read: only active categories
CREATE POLICY esys_blog_categories_public_read ON esys_blog_categories
  FOR SELECT USING (active = true AND deleted_at IS NULL);

-- Public read: only published, non-deleted posts
CREATE POLICY esys_blog_posts_public_read ON esys_blog_posts
  FOR SELECT USING (status = 'published' AND deleted_at IS NULL);

-- Admin (service_role) bypasses RLS automatically — no extra policy needed.
