-- ─── Users table ───

CREATE TABLE esys_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  totp_secret TEXT,
  totp_enabled BOOLEAN NOT NULL DEFAULT false,
  email_verified BOOLEAN NOT NULL DEFAULT false,
  reset_token TEXT,
  reset_token_expires_at TIMESTAMPTZ,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_esys_users_email ON esys_users (email);
CREATE INDEX idx_esys_users_username ON esys_users (username);
CREATE INDEX idx_esys_users_reset_token ON esys_users (reset_token) WHERE reset_token IS NOT NULL;

ALTER TABLE esys_users ENABLE ROW LEVEL SECURITY;

-- ─── Favorites table ───

CREATE TABLE esys_favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES esys_users(id) ON DELETE CASCADE,
  property_id UUID NOT NULL REFERENCES esys_properties(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, property_id)
);

CREATE INDEX idx_esys_favorites_user ON esys_favorites (user_id);
CREATE INDEX idx_esys_favorites_property ON esys_favorites (property_id);

ALTER TABLE esys_favorites ENABLE ROW LEVEL SECURITY;

-- ─── Updated_at trigger ───

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER esys_users_updated_at
  BEFORE UPDATE ON esys_users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();
