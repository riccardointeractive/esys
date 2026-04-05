-- ─── Contact messages table ───
-- Stores submissions from the public contact form (/contacto).
-- Pipeline: honeypot+time-trap → rate limit (esys:contact:) → Cloudflare
-- Turnstile → insert here. IP and user-agent are persisted for abuse
-- correlation with the rate limiter.

CREATE TABLE esys_contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT NOT NULL,
  locale TEXT,
  ip TEXT,
  user_agent TEXT,
  status TEXT NOT NULL DEFAULT 'new',  -- new | read | replied | archived
  read_at TIMESTAMPTZ,
  replied_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_esys_contact_messages_created_at
  ON esys_contact_messages (created_at DESC);
CREATE INDEX idx_esys_contact_messages_status
  ON esys_contact_messages (status);
CREATE INDEX idx_esys_contact_messages_email
  ON esys_contact_messages (email);

ALTER TABLE esys_contact_messages ENABLE ROW LEVEL SECURITY;

-- Public users cannot read/write directly — all access goes through the
-- service_role key in /api/contact (insert) and admin routes (read/update).
-- No RLS policies = denied for anon/authenticated roles by default.
