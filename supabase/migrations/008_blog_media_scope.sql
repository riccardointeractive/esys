-- ═══════════════════════════════════════════════════════
-- ESYS VIP — Media scope (separate blog uploads from client media)
-- Idempotent: safe to re-run.
-- ═══════════════════════════════════════════════════════

-- Add scope column to esys_media. Default 'main' so existing rows
-- (all client property images) automatically belong to the main pool.
-- Blog uploads will use scope = 'blog' and stay invisible to the
-- main /admin/media library.

ALTER TABLE esys_media
  ADD COLUMN IF NOT EXISTS scope text NOT NULL DEFAULT 'main';

CREATE INDEX IF NOT EXISTS idx_esys_media_scope
  ON esys_media (scope);

-- Optional sanity check constraint — only known scopes allowed.
-- Easy to extend later (newsletter, docs, etc.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'esys_media_scope_check'
  ) THEN
    ALTER TABLE esys_media
      ADD CONSTRAINT esys_media_scope_check
      CHECK (scope IN ('main', 'blog'));
  END IF;
END $$;
