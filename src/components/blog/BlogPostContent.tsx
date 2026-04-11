import { sanitizeBlogHtml } from '@/lib/sanitize-html'

interface BlogPostContentProps {
  html: string
}

/**
 * Server component: re-sanitizes the stored HTML as a defense-in-depth pass
 * (the API already sanitizes on write) and renders via dangerouslySetInnerHTML.
 */
export function BlogPostContent({ html }: BlogPostContentProps) {
  const safe = sanitizeBlogHtml(html)
  return (
    <div
      className="vip-blog-content ds-prose"
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: safe }}
    />
  )
}
