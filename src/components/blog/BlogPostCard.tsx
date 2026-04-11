import Image from 'next/image'
import Link from 'next/link'
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

function formatDate(value: string | null, locale: Locale): string | null {
  if (!value) return null
  try {
    return new Intl.DateTimeFormat(
      locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-GB' : 'es-ES',
      { day: 'numeric', month: 'short', year: 'numeric' }
    ).format(new Date(value))
  } catch {
    return null
  }
}

export function BlogPostCard({ post, locale, readingTimeTemplate }: BlogPostCardProps) {
  const routes = localizedRoutes(locale)
  const title = pickLocalized(post, 'title', locale)
  const excerpt = pickLocalized(post, 'excerpt', locale)
  const categoryLabel = post.category
    ? (post.category[`label_${locale}` as `label_${Locale}`] as string) || post.category.label_es
    : null
  const readingLabel = readingTimeTemplate.replace('{n}', String(post.reading_minutes))
  const dateLabel = formatDate(post.published_at, locale)

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
            className="vip-blog-card__category ds-overline"
          >
            {categoryLabel}
          </Link>
        )}
        <h3 className="vip-blog-card__title">
          <Link href={routes.blogPost(post.slug)}>{title}</Link>
        </h3>
        {excerpt && (
          <p className="ds-text-sm ds-text-secondary ds-line-clamp-2">{excerpt}</p>
        )}
        <div className="vip-blog-card__meta ds-overline">
          {dateLabel && <span>{dateLabel}</span>}
          {dateLabel && <span aria-hidden="true">·</span>}
          <span>{readingLabel}</span>
        </div>
      </div>
    </article>
  )
}
