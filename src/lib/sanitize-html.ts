import DOMPurify from 'isomorphic-dompurify'

/**
 * Allow-list for blog content HTML.
 * Strips <script>, on*= attributes, javascript:, SVG vectors, etc. by default.
 * Forces rel="noopener noreferrer nofollow" on all anchors.
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

const ALLOWED_ATTR = ['href', 'target', 'rel', 'src', 'alt', 'title']

let hookInstalled = false
function ensureHook() {
  if (hookInstalled) return
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (!(node instanceof Element)) return
    if (node.tagName === 'A') {
      node.setAttribute('rel', 'noopener noreferrer nofollow')
      // Open external links in a new tab; relative links stay in same tab.
      const href = node.getAttribute('href') || ''
      if (/^https?:\/\//i.test(href)) {
        node.setAttribute('target', '_blank')
      }
    }
    if (node.tagName === 'IMG') {
      // Force lazy loading for any image inside content.
      node.setAttribute('loading', 'lazy')
      node.setAttribute('decoding', 'async')
    }
  })
  hookInstalled = true
}

/** Sanitize HTML produced by the TipTap editor before persisting / rendering. */
export function sanitizeBlogHtml(html: string): string {
  if (!html) return ''
  ensureHook()
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  })
}
