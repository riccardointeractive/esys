import sanitizeHtmlLib from 'sanitize-html'

/**
 * Sanitize HTML produced by the TipTap editor before persisting / rendering.
 *
 * Uses `sanitize-html` (pure JS, htmlparser2 under the hood) instead of
 * DOMPurify because jsdom — which isomorphic-dompurify depends on server-side
 * — pulls in ESM-only transitive deps that break under Next 16 Turbopack's
 * Node runtime bundling (ERR_REQUIRE_ESM on @exodus/bytes/encoding-lite.js).
 *
 * Allow-list: headings, basic formatting, lists, links, images, block
 * quotes, code blocks, separators. Forces rel/target on external anchors,
 * lazy loading on images.
 */

const ALLOWED_TAGS = [
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'strong',
  'em',
  'u',
  's',
  'code',
  'pre',
  'blockquote',
  'ul',
  'ol',
  'li',
  'a',
  'img',
  'br',
  'hr',
]

export function sanitizeBlogHtml(html: string): string {
  if (!html) return ''

  return sanitizeHtmlLib(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: {
      a: ['href', 'title', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'loading', 'decoding'],
    },
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: { img: ['http', 'https'] },
    allowProtocolRelative: false,
    // Normalize text content; don't mess with whitespace inside <pre>
    enforceHtmlBoundary: false,
    transformTags: {
      a: (_tagName, attribs) => {
        const href = (attribs.href || '').trim()
        const isExternal = /^https?:\/\//i.test(href)
        return {
          tagName: 'a',
          attribs: {
            ...attribs,
            href,
            rel: 'noopener noreferrer nofollow',
            ...(isExternal ? { target: '_blank' } : {}),
          },
        }
      },
      img: (_tagName, attribs) => ({
        tagName: 'img',
        attribs: {
          ...attribs,
          loading: 'lazy',
          decoding: 'async',
        },
      }),
    },
  })
}
