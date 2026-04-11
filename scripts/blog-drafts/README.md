# Blog post drafts

Ephemeral JSON drafts consumed by `scripts/publish-blog-post.mjs`. The draft files (`*.json`) are git-ignored — only this README is tracked.

## Workflow

1. Claude writes a draft as `NNN-slug.json` inside this folder.
2. Run `node --env-file=.env.local scripts/publish-blog-post.mjs scripts/blog-drafts/NNN-slug.json` (or `npm run blog:publish -- scripts/blog-drafts/NNN-slug.json`).
3. Script picks an Unsplash cover from `unsplash_query`, sanitizes HTML, inserts a published row directly into `esys_blog_posts`.
4. Review the three locale URLs printed at the end of the run.
5. Delete or keep the JSON locally — it's never committed.

## Draft shape

```json
{
  "category_slug": "guia-de-compra",
  "title_es": "…",
  "title_en": "…",
  "title_ru": "…",
  "excerpt_es": "…",
  "excerpt_en": "…",
  "excerpt_ru": "…",
  "content_es": "<p>…</p>",
  "content_en": "<p>…</p>",
  "content_ru": "<p>…</p>",
  "unsplash_query": "notary signing spain",
  "featured": false
}
```

## Available categories

Seeded by `scripts/seed-blog-categories.mjs`:

| slug | label ES |
|------|----------|
| `guia-de-compra` | Guía de Compra |
| `zonas-y-barrios` | Zonas y Barrios |
| `estilo-de-vida` | Estilo de Vida |
| `inversion-inmobiliaria` | Inversión Inmobiliaria |
| `obra-nueva-guia` | Obra Nueva |
| `segunda-mano-guia` | Segunda Mano |
| `mudarse-a-espana` | Mudarse a España |

## HTML rules

- Single-line HTML block — no newlines between tags
- Allowed tags: `p, h2, h3, h4, strong, em, u, s, code, pre, blockquote, ul, ol, li, a, img, br, hr`
- NO `<h1>` (page renders the title as h1)
- NO inline `style=""` (sanitizer strips)
- Outbound links get `rel="noopener noreferrer nofollow"` and `target="_blank"` automatically
