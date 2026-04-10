import { BlogPostCard } from '@/components/blog/BlogPostCard'
import type { BlogPostWithCategory } from '@/types/blog'
import type { Locale } from '@/config/i18n'

interface BlogPostGridProps {
  posts: BlogPostWithCategory[]
  locale: Locale
  readingTimeTemplate: string
  emptyMessage: string
}

export function BlogPostGrid({ posts, locale, readingTimeTemplate, emptyMessage }: BlogPostGridProps) {
  if (posts.length === 0) {
    return <p className="ds-text-secondary ds-py-8 ds-text-center">{emptyMessage}</p>
  }
  return (
    <div className="vip-blog-grid">
      {posts.map((post) => (
        <BlogPostCard
          key={post.id}
          post={post}
          locale={locale}
          readingTimeTemplate={readingTimeTemplate}
        />
      ))}
    </div>
  )
}
