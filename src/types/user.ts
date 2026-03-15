/* ─── User Database Row ─── */

export interface User {
  id: string
  email: string
  username: string
  full_name: string
  totp_enabled: boolean
  email_verified: boolean
  last_login_at: string | null
  created_at: string
  updated_at: string
}

/* ─── User with password fields (internal, never expose to client) ─── */

export interface UserWithCredentials extends User {
  password_hash: string
  password_salt: string
  totp_secret: string | null
  reset_token: string | null
  reset_token_expires_at: string | null
}

/* ─── Session data stored in Redis ─── */

export interface UserSession {
  userId: string
  email: string
  username: string
  fullName: string
  createdAt: number
  expiresAt: number
}

/* ─── Favorite entry ─── */

export interface FavoriteEntry {
  id: string
  user_id: string
  property_id: string
  created_at: string
}

/* ─── API response types ─── */

export interface AuthResponse {
  success: boolean
  user?: User
  requires2fa?: boolean
  error?: string
}
