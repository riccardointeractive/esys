# DS_CUSTOM — ESYS VIP

Inventario delle customizzazioni CSS project-specific rispetto al Design System.

**Ultimo aggiornamento:** 11 Apr 2026 (blog typography unified to DS)
**DS Version:** 0.9.36
**File CSS custom:** `src/styles/components.css` (712 righe), `src/styles/blog.css` (~470 righe, ~320 di pure layout/grid/spacing), `src/app/globals.css` (23 righe)

---

## Blog (src/styles/blog.css — approvato 10 Apr 2026, typography unified 11 Apr 2026)

File separato per pattern di **layout, grid, spacing, surface, border** project-specific del modulo blog (public + admin).

**Typography policy (11 Apr 2026):** ZERO custom font-size / font-weight / line-height / letter-spacing / text-transform / font-family in blog.css. Ogni elemento testuale usa classi DS (`ds-hero-title`, `ds-section-title`, `ds-overline`, `ds-text-*`, `ds-prose`) o eredita da DS base (h1-h6, p, blockquote, pre, code). Le classi BEM `.vip-blog-*` sono ora pure layout.

**Rimosse in questa passata:**
- 7 variabili fluid `--vip-blog-title-xl/lg/card`, `--vip-blog-lede`, `--vip-blog-eyebrow-size/tracking`, `--vip-blog-read-width` (ora il reading width è hardcoded a 720/760/1080 come layout constraint, fuori scope typography)
- Classi eliminate integralmente: `.vip-blog-eyebrow`, `.vip-blog-hero-title`, `.vip-blog-lede`, `.vip-blog-cta__eyebrow`, `.vip-blog-cta__title`, `.vip-blog-cta__text`, `.vip-blog-detail__related-title`, `.vip-blog-card__excerpt`
- Regole `.vip-blog-content h2/h3/h4/a/ul/ol/blockquote/pre/code/hr` — sostituite da `ds-prose` + DS base
- Regole `.vip-rte__content h2/h3` — tolte, ereditano da DS base
- Typography da `.vip-blog-card__title`, `.vip-blog-meta`, `.vip-blog-detail__credit`, `.vip-blog-tab`

**JUSTIFIED residui:**
- `.vip-blog-sidebar__link--active font-weight: semibold` — stato BEM coerente, no custom size
- `.vip-blog-section padding clamp()` — spacing fluid, fuori scope typography (DEFERRED)
- `max-width` values (720/760/1080) — reading column layout constraints, non tokenizzabili

### Public (layout/grid only)
| Classe | Scopo |
|--------|-------|
| `.vip-blog-section` | Padding verticale clamp — DEFERRED (spacing fluid, review separata) |
| `.vip-blog-layout` / `__main` | Grid lista + sidebar responsive (1col mobile, 1fr+280px desktop) |
| `.vip-blog-grid` | Grid post cards (1/2/3 colonne) |
| `.vip-blog-card` + `__media/__img/__placeholder/__body/__category/__meta` | Card — flex/aspect/hover transform. Category e meta usano `ds-overline` in JSX |
| `.vip-blog-meta` + `__sep` | Flex row del meta (date · reading time) — uso `ds-overline` in JSX per typography |
| `.vip-blog-sidebar` + `__list/__link/__link--active` | Sidebar sticky con lista categorie (bg/border/sticky) |
| `.vip-blog-detail__header/__cover/__cover-img/__body/__credit` | Layout pagina articolo (max-width 720, aspect-ratio 21/9 cover) |
| `.vip-blog-content` | Wrapper max-width 760 per reading column. Typography via `ds-prose` + DS base |
| `.vip-blog-cta` + `__inner/__action` | CTA editoriale fine articolo — layout/bg/border only |
| `.vip-blog-detail__related` | Wrapper related posts (max-width 1080) |

### Admin (form/editor)
| Classe | Scopo |
|--------|-------|
| `.vip-blog-form` / `__layout` / `__main` / `__sidebar` | Grid form + sidebar responsive |
| `.vip-rte` + `__toolbar/__btn/__btn--active/__sep/__content/__img/--hidden/--loading` | Wrapper TipTap v3 — layout + bg/border. h2/h3 content ereditano da DS base |
| `.vip-blog-content-editor__pane[data-active]` | Toggle 3 editor TipTap via attribute senza unmount (preserva history) |
| `.vip-unsplash-picker` + `__grid/__thumb/__selected/__preview/__credit/__loading/__empty` | Picker inline con ricerca + griglia thumbs + credit |
| `.vip-blog-tabs` / `.vip-blog-tab` / `--active` | Tab bar cover picker — layout + bg. Typography via `ds-text-sm ds-font-medium` in JSX |
| `.vip-blog-upload` / `__dropzone` | Drag&drop zone |
| `.vip-blog-library-tab`, `.vip-blog-picker-modal` + `__state/__grid/__thumb/__thumb-img` | Media library picker |
| `.vip-blog-table__search/__actions-col` | Tweaks per la tabella admin blog |

Tutti i token usati sono `surface-*` / `text-*` / `border-*` / `space-*` / `radius-*` / `shadow-*` / `duration-*` / `ease-*` / `opacity-disabled` del DS. Zero hardcoded. Active states usano `surface-active`; hover states usano `surface-hover`.

**Bonus fix nella stessa passata:** 2 `opacity: 0.4 / 0.6` su `:disabled` → `var(--ds-opacity-disabled)` in `.vip-rte__btn` e `.vip-blog-upload__dropzone` (pattern protetto da hook `hook-opacity-disabled.sh`).

---

## Riepilogo

| Metrica | Valore |
|---------|--------|
| Classi custom definite | ~57 |
| Override DS | 2 (hero search — intenzionali) |
| Valori hardcoded | ~8 (tutti in hero/gallery — giustificati per overlay su foto) |
| Inline styles | Minimi, giustificati (layout, email templates) |
| Compliance | Eccellente — token DS usati ovunque, naming coerente |

---

## Customizzazioni Legittime (KEEP)

### Hero Search Bar (lines 36-136) — HARDCODED GIUSTIFICATO
Effetto frosted glass su sfondo fotografico. Non può usare token DS perché lo sfondo è variabile.

| Classe | Scopo |
|--------|-------|
| `.vip-hero-search .ds-input` | Input frosted glass (rgba overlay) |
| `.vip-search-dropdown__trigger` | Trigger button layout |
| `.vip-search-dropdown__placeholder` | Placeholder bianco su sfondo scuro |
| `.vip-hero-search__submit.ds-btn` | Bottone bianco fisso per contrasto |
| `.vip-hero-search .ds-dropdown` | Dropdown positioning in hero |

### Property Search Bar (lines 140-237) — PULITO
Tutti token DS. Responsive. Ben strutturato.

| Classe | Scopo |
|--------|-------|
| `.property-search-bar__fields` | Flex layout responsive |
| `.property-filter-dropdown__trigger` | Filter dropdown button |
| `.property-filter-dropdown__placeholder` | Placeholder text |

### Property Gallery + Lightbox (lines 489-664)
Componente completo per visualizzazione immagini. Necessario, non sostituibile con DS.

| Classe | Scopo |
|--------|-------|
| `.vip-gallery__*` | Gallery container, main image, thumbs, thumb states, caption overlay |
| `.vip-lightbox__*` | Fullscreen modal, navigation, counter, caption overlay |

### Admin Components (lines 375-485)
Tutti usano token DS. Ben strutturati.

| Classe | Scopo |
|--------|-------|
| `.vip-settings-tabs` / `.vip-settings-tab` | Tab bar orizzontale con scroll |
| `.vip-locale-pills` | Pill group per selezione lingua — gap/padding via `var(--ds-space-0-5)` |
| `.vip-lang-switcher` | Language dropdown |
| `.vip-property-form__layout` | Form grid responsive |
| `.vip-image-grid__item` | Image grid item |
| `.vip-media-item` | Media library item (hover/selected) |
| `.vip-favorite-btn` | Heart button su immagini — pos. via DS tokens, `z-index:10` locale giustificato, `opacity` via `var(--ds-opacity-disabled)` |

### Layout Base
| Classe | Linee | Scopo |
|--------|-------|-------|
| `.vip-logo` | 8-11 | Logo display |
| `.public-main` | 16-18 | Navbar offset (4rem) |
| `.site-footer` / `__bottom` | 21-31 | Footer styling |
| `.account-nav-scroll` | 240-247 | Horizontal scroll mobile |

---

## Quick Wins (Consolidamento possibile)

| Attuale | Alternativa DS | Effort |
|---------|---------------|--------|
| `.site-footer` (custom border/bg/padding) | `ds-border-top ds-bg-surface ds-py-12` | Basso |
| `.site-footer__bottom` (custom border/mt/pt) | `ds-border-top ds-mt-8 ds-pt-6` | Basso |
| `.account-nav-scroll` (custom overflow) | `ds-overflow-x-auto ds-scrollbar-none` | Basso |

---

## Hardcoded Giustificati (NO ACTION)

Tutti in contesto di overlay su immagini fotografiche:
- Hero search: `rgba(0,0,0,0.35)`, `#fff`, `rgba(255,255,255,0.18)`
- Hero button: `#fff`, `#e5e5e5`, `#000`
- Favorite button: `rgba(0,0,0,0.4)`, `rgba(255,255,255,0.9)`
- Lightbox close/nav: `#fff`

**Motivazione:** sfondo fotografico variabile, i token DS (che cambiano tra temi) non sono appropriati.

### Prodigy audit suppression

I semantic-audit findings nelle seguenti zone sono giustificati e filtrati automaticamente dal Prodigy (`ds_semantic_audit`). Formato machine-readable:

<!-- ds-ops-suppress
selectors:
  - .vip-hero-search
  - .vip-search-dropdown
  - .vip-favorite-btn
  - .vip-lightbox
rules:
  - no-hardcoded-color
  - no-hardcoded-shadow
  - no-custom-focus-ring
  - no-magic-z-index
reason: Photo-overlay components — hardcoded white/black and custom rings are
  intentional (the background is a user photo, not a DS surface). Lightbox and
  favorite button sit over arbitrary images; DS semantic tokens would break
  contrast. Hero search uses a frosted-glass ring over the same photo backdrop.
  Reviewed 2026-04-11.
-->


---

## Azioni Future

- [ ] Consolidare footer con utility DS (3 classi → utility inline)
- [ ] Consolidare account-nav-scroll con utility DS
- [ ] Verificare se `.vip-settings-tabs` può usare `ds-tabs` dopo DS update
- [ ] Verificare se gallery/lightbox merita diventare componente DS condiviso
