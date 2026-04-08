# DS_CUSTOM — ESYS VIP

Inventario delle customizzazioni CSS project-specific rispetto al Design System.

**Ultimo aggiornamento:** 30 Mar 2026
**DS Version:** 0.9.36
**File CSS custom:** `src/styles/components.css` (665 righe), `src/app/globals.css` (22 righe)

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

**Motivazione:** sfondo fotografico variabile, i token DS (che cambiano tra temi) non sono appropriati.

---

## Azioni Future

- [ ] Consolidare footer con utility DS (3 classi → utility inline)
- [ ] Consolidare account-nav-scroll con utility DS
- [ ] Verificare se `.vip-settings-tabs` può usare `ds-tabs` dopo DS update
- [ ] Verificare se gallery/lightbox merita diventare componente DS condiviso
