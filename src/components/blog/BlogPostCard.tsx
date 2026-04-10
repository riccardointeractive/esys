import Image from 'next/image'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import type { BlogPostWithCategory } from '@/types/blog'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'

interface BlogPostCardProps {
  post: BlogPostWithCategory
  locale: Locale
  readingTimeTemplate: string
}

function pickLocalized(post: BlogPostWithCategory, key: 'title' | 'excerpt', locale: Locale): string {
  return (post[`${key}_${locale}` as `${typeof key}_${Locale}`] as string) || post[`${key}_es`]
}

export function BlogPostCard({ post, locale, readingTimeTemplate }: BlogPostCardProps) {
  const readingLabel = readingTimeTemplate.replace('{n}', String(post.reading_minutes))
  const routes = localizedRoutes(locale)
  const title = pickLocalized(post, 'title', locale)
  const excerpt = pickLocalized(post, 'excerpt', locale)
  const categoryLabel = post.category
    ? (post.category[`label_${locale}` as `label_${Locale}`] as string) || post.category.label_es
    : null

  return (
    <article className="vip-blog-card">
      <Link href={routes.blogPost(post.slug)} className="vip-blog-card__media">
        {post.cover_thumb_url ? (
          <Image
            src={post.cover_thumb_url}
            alt={post.cover_alt || title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="vip-blog-card__img"
            unoptimized
          />
        ) : (
          <div className="vip-blog-card__placeholder" />
        )}
      </Link>
      <div className="vip-blog-card__body">
        {categoryLabel && post.category && (
          <Link
            href={routes.blogCategory(post.category.slug)}
            className="ds-badge ds-badge--outline vip-blog-card__category"
          >
            {categoryLabel}
          </Link>
        )}
        <h3 className="ds-font-display ds-text-lg ds-font-semibold ds-text-primary ds-mt-2">
          <Link href={routes.blogPost(post.slug)} className="ds-text-primary">
            {title}
          </Link>
        </h3>
        {excerpt && (
          <p className="ds-text-sm ds-text-secondary ds-mt-2 vip-blog-card__excerpt">{excerpt}</p>
        )}
        <div className="ds-flex ds-items-center ds-gap-2 ds-mt-3 ds-text-xs ds-text-tertiary">
          <Clock size={14} />
          <span>{readingLabel}</span>
        </div>
      </div>
    </article>
  )
}
