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

## Design System Integration

### Architecture

The project uses `@digiko-npm/designsystem` as the **sole styling engine** — no Tailwind, no PostCSS, no build-time class scanning. Pure CSS with custom properties.

```css
/* globals.css */
@import "@digiko-npm/designsystem";
@import "../styles/components.css";
```

### Three Layers of CSS

| Layer | Prefix | Purpose | Where |
|-------|--------|---------|-------|
| **DS Utilities** | `ds-*` | Tokenized layout, spacing, color, typography | `@digiko-npm/designsystem` |
| **Component Classes** | `cx-*`, project-specific | Interactive patterns, property cards, gallery | `src/styles/components.css` |
| **Base Styles** | — | Body, selection, overrides | `src/app/globals.css` |

### How to Use Tokens

**DS utility classes (primary approach):**
```tsx
className="ds-flex ds-items-center ds-gap-4 ds-text-sm ds-text-secondary"
className="ds-bg-surface ds-border ds-rounded-xl ds-p-6"
className="ds-grid ds-grid-cols-3 ds-gap-6"
```

**DS component classes (28 components available):**
```tsx
className="ds-btn ds-btn--secondary"
className="ds-card ds-card__body"
className="ds-badge ds-badge--success"
className="ds-input"
className="ds-table"
```

**DS sources of truth:**

| What you need | Where to look |
|---------------|---------------|
| Component classes (`ds-btn`, `ds-card`, etc.) | `node_modules/@digiko-npm/designsystem/src/components/` |
| Token values (colors, spacing, radius) | `node_modules/@digiko-npm/designsystem/src/tokens/` |
| Utility classes | `node_modules/@digiko-npm/designsystem/src/utilities/` |
| Full compiled CSS | `node_modules/@digiko-npm/designsystem/dist/designsystem.css` |

**Class composition with cn():**
```tsx
import { cn } from '@/lib/utils'

className={cn(
  'ds-flex ds-items-center ds-gap-2 ds-p-3 ds-rounded-lg',
  isActive && 'ds-bg-elevated',
  property.status === 'sold' && 'cx-property--sold'
)}
```

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
| No `process.env` | `process.env.SUPABASE_URL` | Create typed env config |

### 2. Absolute Prohibitions

```tsx
// ❌ FORBIDDEN — Hardcoded colors
className="text-blue-500"
style={{ color: '#0070F3' }}

// ✅ REQUIRED — Use DS semantic tokens
className="ds-text-primary"
className="ds-bg-surface"

// ❌ FORBIDDEN — Bare Tailwind classes (Tailwind is NOT installed)
className="flex items-center gap-4 text-sm"

// ✅ REQUIRED — Use ds-* prefixed utilities
className="ds-flex ds-items-center ds-gap-4 ds-text-sm"

// ❌ FORBIDDEN — Tailwind pseudo-class syntax
className="hover:bg-gray-100 focus:ring-2"

// ✅ REQUIRED — Use component classes for interactive states
className="cx-hover-row"
className="cx-focus"

// ❌ FORBIDDEN — Arbitrary pixel values
className="ds-max-w-[1200px]"

// ✅ REQUIRED — Use tokens or DS sizes
className="ds-max-w-[var(--ds-container-max)]"
className="ds-text-sm"
```

### 3. CMS Package Usage

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

### 4. Light/Dark Mode

Dark + light + system via `next-themes`. DS handles theme switching automatically via `.dark` class:

```tsx
// Colors adapt automatically — never hardcode dark/light variants
className="ds-bg-surface ds-text-primary ds-border"
```

### 5. Code Integrity

Don't remove existing functionality without explicit confirmation.

### 6. Theme-Independent Sections

Some UI sections intentionally bypass DS semantic tokens and use hardcoded RGBA/hex values. **Do NOT refactor these to use `--ds-color-*` tokens or `ds-text-*` / `ds-bg-*` classes.**

| Section | Why | Where |
|---------|-----|-------|
| **Hero** (`cx-hero__backdrop`, `cx-hero-search`) | Sits over an aerial photo — always uses dark-tinted frosted glass with white text/inputs regardless of light/dark mode. DS tokens would break readability in light mode. | `src/styles/components.css` (look for the `HERO: INTENTIONALLY THEME-INDEPENDENT` block comment) |

When adding new photo-overlay sections in the future, follow the same pattern: hardcode RGBA values and add a block comment explaining the exception.

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

// CSS classes: ds-* (DS), cx-* (interactive), kebab-case (project)
ds-flex, ds-text-primary, cx-hover-row, property-card, filter-bar
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

## Semantic Color Tokens

```css
/* Backgrounds */
ds-bg-base         /* Page background */
ds-bg-surface      /* Card/section background */
ds-bg-elevated     /* Elevated elements, hover states */

/* Text */
ds-text-primary    /* Main content — highest contrast */
ds-text-secondary  /* Supporting content */
ds-text-tertiary   /* Hints, metadata */

/* Borders */
ds-border          /* Standard border */
ds-border-b        /* Bottom border only */

/* Interactive */
ds-text-interactive  /* Links, clickable text */
```

---

## Commit Convention

```
feat: Add new feature
fix: Bug fix
style: Styling changes (no logic change)
refactor: Code refactoring
docs: Documentation changes
chore: Build, deps, config changes
```

---

## Quick Reference

```
Project folder: ~/Projects/esys/
Dev server:     npm run dev (localhost:3000)
Build:          npm run build
Lint:           npm run lint
Styling:        @digiko-npm/designsystem (CSS-only, --ds-* tokens)
CMS utilities:  @digiko-npm/cms (auth, sessions, media, Supabase, R2)
                No Tailwind. No PostCSS. Pure CSS.
```

---

## End-of-Session Checklist

### Code Quality
- [ ] No hardcoded colors, arbitrary values, magic strings — everything in `src/config/`
- [ ] DS utilities only (`ds-*` prefix) — no bare Tailwind classes
- [ ] Component CSS in `src/styles/components.css` — not inline hacks
- [ ] Import aliases `@/` — no relative paths
- [ ] CMS package used for auth, sessions, media — no custom implementations

### Build
- [ ] `npm run build` — zero errors
- [ ] No `console.log` left
- [ ] DS lib synced — if modified, rebuild + publish + reinstall

### Architecture
- [ ] New routes in `routes.ts`
- [ ] New tables in `supabase-tables.ts`
- [ ] New Redis keys in `redis-keys.ts`
- [ ] Property config changes in `property.ts`
- [ ] SEO metadata in `seo.ts`

### Visual & Git
- [ ] Dark/light mode verified
- [ ] Responsive layouts checked (mobile first)
- [ ] Spanish strings used throughout (locale `es-ES`)
- [ ] Commit convention followed
- [ ] No secrets committed (`.env.local` in `.gitignore`)
- [ ] Design system repo (`~/Projects/designsystem`) committed separately if modified

### Security
- [ ] RLS enabled on all new Supabase tables
- [ ] Rate limiting on auth + contact endpoints
- [ ] Input sanitization on user-facing forms
- [ ] Admin routes protected with session verification

### Meta
- [ ] Evaluate if this session introduced patterns or rules worth adding to this checklist
