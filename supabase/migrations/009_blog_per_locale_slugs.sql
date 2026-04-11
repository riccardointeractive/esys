-- ═══════════════════════════════════════════════════════
-- ESYS VIP — Blog per-locale slugs
-- Adds slug_en and slug_ru columns to esys_blog_posts so each language
-- variant of a post can have its own SEO-friendly URL slug.
-- The existing `slug` column remains the canonical ES slug.
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════

ALTER TABLE esys_blog_posts
  ADD COLUMN IF NOT EXISTS slug_en text NOT NULL DEFAULT '';

ALTER TABLE esys_blog_posts
  ADD COLUMN IF NOT EXISTS slug_ru text NOT NULL DEFAULT '';

-- Unique partial indexes: enforce uniqueness only on non-empty values and
-- on non-deleted rows. An empty string means "not yet assigned" and is
-- allowed to repeat (backfill window + safety net).

CREATE UNIQUE INDEX IF NOT EXISTS idx_esys_blog_posts_slug_en_unique
  ON esys_blog_posts (slug_en)
  WHERE slug_en <> '' AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_esys_blog_posts_slug_ru_unique
  ON esys_blog_posts (slug_ru)
  WHERE slug_ru <> '' AND deleted_at IS NULL;

-- Lookup indexes for fetchPostBySlug resolution per locale.

CREATE INDEX IF NOT EXISTS idx_esys_blog_posts_slug_en
  ON esys_blog_posts (slug_en)
  WHERE deleted_at IS NULL AND status = 'published';

CREATE INDEX IF NOT EXISTS idx_esys_blog_posts_slug_ru
  ON esys_blog_posts (slug_ru)
  WHERE deleted_at IS NULL AND status = 'published';
