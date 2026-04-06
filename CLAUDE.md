## Design System → [DS_HEALTH.md](/Projects/infra/DS_HEALTH.md)
For dev conventions (API shape, TanStack Query, Supabase, Redis, commit) → [DEV_CONVENTIONS.md](/Projects/infra/DEV_CONVENTIONS.md)

CONTROLLED MODE attivo. Regole DS, azioni aperte, metriche: tutto centralizzato in [DS_HEALTH.md](/Projects/infra/DS_HEALTH.md).
Ops Triage: when the user describes a task, automatically call `ops_triage`. Details in DS_HEALTH.md section "Ops Triage".
Customizzazioni CSS project-specific: [DS_CUSTOM.md](DS_CUSTOM.md) — consultare prima di aggiungere/modificare CSS custom.

---

# CLAUDE.md — ESYS VIP Project Guidelines

## Project Overview

Real estate platform for ESYS VIP. Public-facing property listings (new builds + resale) with user registration (Idealista-style: favorites, saved searches, alerts). Admin CMS for property management, lead tracking, and analytics.

**Stack:** Next.js 16 (App Router), React 19, TypeScript
**Styling:** `@digiko-npm/designsystem` (CSS-only, zero JS, `--ds-*` tokens) + `components.css`
**CMS:** `@digiko-npm/cms` (auth, sessions, media, Supabase/R2 utilities)
**Services:** Supabase (DB + RLS), Upstash Redis (sessions + cache), Cloudflare R2 (media)
**Deploy:** Cloudflare (L2)
**Typography:** Clash Display (headings) + Switzer (body) + Geist Mono (code)
**Theme:** Dark + light mode via `next-themes`
**Locale:** Spanish (`es-ES`), currency EUR

---

## ESYS-Specific Styling

### Two Layers of CSS

| Layer | Prefix | Purpose | Where |
|-------|--------|---------|-------|
| **DS (components + utilities)** | `ds-*` | Self-contained components, tokenized layout | `@digiko-npm/designsystem` |
| **Project-specific classes** | project-specific (no prefix convention) | Property form, media grid, hero search bar (`vip-hero-search`) | `src/styles/components.css` |

Base styles (body, selection, overrides) live in `src/app/globals.css`.

For all DS styling rules (component-first approach, anti-patterns, CSS variable vs utility class, responsive utilities, size tiers, cn() usage) → [DS_HEALTH.md](/Projects/infra/DS_HEALTH.md)

---

## Critical Rules

### 1. No Hardcoding — The Config Dictionary

Every literal value lives in `src/config/`. **A perfect file has zero magic values — every number, string, path, and message is an import from `@/config/*`.**

#### Config Directory (8 files)

| File | What belongs here | Example import |
|------|-------------------|----------------|
| `site.ts` | Name, description, URL, contact info, social links, nav items | `siteConfig.name`, `siteConfig.contact.email` |
| `routes.ts` | Public routes, user routes, admin routes, API routes | `ROUTES.properties`, `API_ROUTES.auth.login` |
| `property.ts` | Property types, statuses, features, price/size ranges, sort options | `PROPERTY_TYPES.apartment`, `PRICE_RANGES.max` |
| `auth.ts` | Session duration, rate limits, PBKDF2 params, cookie name, roles | `AUTH_CONFIG.sessionDurationMs`, `AUTH_CONFIG.roles.admin` |
| `supabase-tables.ts` | Table names, storage bucket names | `TABLES.properties`, `BUCKETS.properties` |
| `redis-keys.ts` | Redis key patterns with `esys:` namespace | `REDIS_KEYS.session(token)`, `REDIS_KEYS.propertyCache(id)` |
| `media.ts` | Image limits, allowed types, thumbnail config, R2 paths | `MEDIA_CONFIG.maxPropertyImages`, `MEDIA_CONFIG.maxFileSizeMb` |
| `seo.ts` | Title template, default meta, per-page SEO | `SEO_CONFIG.pages.home.title` |

#### Perfect File Checklist

| Rule | Bad | Good |
|------|-----|------|
| No user strings | `'Propiedades'` | config import |
| No route paths | `href="/propiedades"` | `href={ROUTES.properties}` |
| No API URLs | `fetch('/api/properties')` | `fetch(API_ROUTES.properties)` |
| No magic numbers | `maxImages = 30` | `MEDIA_CONFIG.maxPropertyImages` |
| No table names | `from('properties')` | `from(TABLES.properties)` |
| No Redis keys | `` `esys:session:${t}` `` | `REDIS_KEYS.session(t)` |
| No HTTP status | `{ status: 401 }` | Use CMS `HTTP_STATUS` |

### 2. CMS Package Usage

Use `@digiko-npm/cms` for all backend utilities — never roll your own:

```tsx
// Auth
import { hashPassword, verifyPassword, generateSessionToken } from '@digiko-npm/cms/auth'

// Sessions (Redis-backed)
import { createSessionStore } from '@digiko-npm/cms/session'

// Supabase clients
import { createBrowserClient, createAdminClient } from '@digiko-npm/cms/supabase'

// Media (R2 uploads)
import { uploadFile, createPresignedUploadUrl } from '@digiko-npm/cms/r2'

// Rate limiting
import { createRateLimiter } from '@digiko-npm/cms/session'
```

### 3. Code Integrity

Don't remove existing functionality without explicit confirmation.

### 4. Hero Section

**Hero Section:** Uses `ds-hero` component from the DS (v0.9.1+). The overlay uses `color-mix()` for theme-aware darkening. Search bar styling (`.vip-hero-search`) remains project-specific in `components.css`.

### 5. Admin Layout

**Admin Layout:** Uses `ds-admin-layout` component from the DS. Sidebar, header, nav items, and main content area are all DS components (`ds-admin__sidebar`, `ds-admin__header`, `ds-admin__nav-item`, etc.).

---

## Project Architecture

### Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout (fonts, metadata, providers)
│   ├── page.tsx                # Homepage (hero, featured properties, CTA)
│   ├── globals.css             # DS import + base styles
│   ├── propiedades/            # Property listings
│   │   ├── page.tsx            # All properties (search + filters)
│   │   └── [slug]/page.tsx     # Property detail (gallery, map, contact form)
│   ├── obra-nueva/page.tsx     # New builds listing
│   ├── segunda-mano/page.tsx   # Resale listing
│   ├── nosotros/page.tsx       # About — team, values, experience
│   ├── contacto/page.tsx       # Contact — form, phone, email, map
│   ├── login/page.tsx          # User login
│   ├── registro/page.tsx       # User registration
│   ├── cuenta/                 # User dashboard (authenticated)
│   │   ├── page.tsx            # User overview
│   │   ├── favoritos/          # Saved properties
│   │   ├── busquedas/          # Saved searches
│   │   ├── alertas/            # Price/new listing alerts
│   │   └── ajustes/            # Account settings
│   ├── admin/                  # Admin CMS
│   │   ├── page.tsx            # Admin dashboard (stats, leads)
│   │   ├── propiedades/        # Property CRUD
│   │   ├── leads/              # Lead management
│   │   ├── usuarios/           # User management
│   │   ├── media/              # Media library
│   │   └── analytics/          # Site analytics
│   └── api/                    # API routes
│       ├── properties/         # Property endpoints
│       ├── search/             # Search endpoint
│       ├── auth/               # Auth endpoints (login, register, logout)
│       ├── favorites/          # Favorites CRUD
│       ├── alerts/             # Alert management
│       ├── contact/            # Contact form
│       ├── leads/              # Lead endpoints
│       └── media/              # Media upload
├── components/
│   ├── ui/                     # Primitives (Button, Badge, Input, Modal)
│   ├── property/               # PropertyCard, PropertyGrid, PropertyFilters, Gallery
│   ├── forms/                  # ContactForm, SearchForm, LoginForm, RegisterForm
│   ├── sections/               # Hero, FeaturedProperties, AboutTeam, CTABanner
│   └── layout/                 # DashboardShell, Sidebar, Header, Footer, ThemeToggle
├── config/                     # All configuration (8 files — see Config Dictionary)
├── hooks/                      # Custom hooks (useSearch, useFavorites, useAuth)
├── lib/
│   ├── utils.ts                # cn() = clsx() wrapper
│   ├── supabase/               # Supabase clients (via @digiko-npm/cms)
│   ├── redis/                  # Redis client (via @upstash/redis)
│   └── search.ts               # Search/filter logic
├── styles/
│   └── components.css          # Project component classes
└── types/
    ├── property.ts             # Property, PropertyImage, PropertyFilter types
    ├── user.ts                 # User, Session types
    └── index.ts                # Shared types + re-exports
```

### Naming Conventions

```typescript
// Components: PascalCase
PropertyCard, SearchForm, DashboardShell

// Hooks: useXxx pattern
useSearch, useFavorites, useAuth

// Utils: camelCase
cn, formatPrice, formatArea

// Files: match export name
PropertyCard.tsx, SearchForm.tsx, useSearch.ts

// CSS classes: ds-* (DS components + utilities), kebab-case (project-specific)
ds-flex, ds-text-primary, ds-input, ds-btn--secondary, property-card, filter-bar
```

### Import Alias

Always use `@/` — no relative paths:

```typescript
import { PropertyCard } from '@/components/property/PropertyCard'
import { siteConfig } from '@/config/site'
import { ROUTES } from '@/config/routes'
import { PROPERTY_TYPES } from '@/config/property'
import { TABLES } from '@/config/supabase-tables'
import { cn } from '@/lib/utils'
```

---

## Database Schema (Supabase)

### Core Tables

| Table | Purpose | RLS |
|-------|---------|-----|
| `properties` | All property listings | Public read, admin write |
| `property_images` | Images linked to properties (order, alt_text) | Public read, admin write |
| `property_features` | Feature flags per property | Public read, admin write |
| `users` | Registered users (email, password hash, name) | User own read/write |
| `favorites` | User ↔ Property relation | User own read/write |
| `saved_searches` | Serialized search filters per user | User own read/write |
| `alerts` | Price/listing alerts per user | User own read/write |
| `leads` | Contact form submissions + inquiry source | Admin read |
| `contact_messages` | General contact form submissions | Admin read |
| `admins` | Admin accounts (separate from users) | Admin only |
| `media` | Media library metadata | Admin read/write |
| `analytics_events` | Page views, searches, clicks | Admin read |

---

## Quick Reference

```
Project folder: ~/Projects/esys/
Local URL:      http://esys.test (PM2 + Caddy, port 4005)
Dev server:     npm run dev (only for hot-reload when actively developing)
Build:          npm run build
Lint:           npm run lint
CMS utilities:  @digiko-npm/cms (auth, sessions, media, Supabase, R2)
```

---

### Living Registry

- `ds.manifest.json` nella root del progetto traccia versione DS, override, e ultima sessione
- A chiusura sessione, aggiornare `last_session` (data) e `last_session_summary` (1 riga su cosa e stato fatto)
- Per rigenerare i conteggi override: `node ~/Projects/generate-manifest.js`
- Per stato ecosistema: `node ~/Projects/ds-registry.js`
- Il manifest va committato in git

---

## End-of-Session Checklist

For DS checklist (CONTROLLED MODE, compliance, build, git) → [DS_HEALTH.md](/Projects/infra/DS_HEALTH.md)

### Project-Specific
- [ ] CMS package used for auth, sessions, media — no custom implementations
- [ ] Spanish strings used throughout (locale `es-ES`)
- [ ] New routes in `routes.ts`
- [ ] New Redis keys in `redis-keys.ts`
- [ ] Property config changes in `property.ts`
- [ ] SEO metadata in `seo.ts`

### Security
- [ ] RLS enabled on all new Supabase tables
- [ ] Rate limiting on auth + contact endpoints
- [ ] Input sanitization on user-facing forms
- [ ] Admin routes protected with session verification
- [ ] `DS_CUSTOM.md` updated if custom CSS files were modified
