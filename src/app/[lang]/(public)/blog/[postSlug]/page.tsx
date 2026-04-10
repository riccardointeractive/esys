import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, ChevronLeft, Calendar } from 'lucide-react'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { BlogPostContent } from '@/components/blog/BlogPostContent'
import { BlogPostGrid } from '@/components/blog/BlogPostGrid'
import { fetchPostBySlug, fetchRelatedPosts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

interface BlogDetailProps {
  params: Promise<{ lang: string; postSlug: string }>
}

function pickLocalized(obj: Record<string, unknown>, key: string, locale: Locale): string {
  return (obj[`${key}_${locale}`] as string) || (obj[`${key}_es`] as string) || ''
}

export async function generateMetadata({ params }: BlogDetailProps) {
  const { lang, postSlug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const post = await fetchPostBySlug(postSlug)
  if (!post) return { title: dict.blog.notFound }
  const title = pickLocalized(post as unknown as Record<string, unknown>,'title', locale)
  const description = pickLocalized(post as unknown as Record<string, unknown>,'excerpt', locale) || dict.seo.blog.description
  return {
    title: `${title} — ${dict.blog.title}`,
    description,
    openGraph: post.cover_image_url
      ? { images: [{ url: post.cover_image_url }] }
      : undefined,
  }
}

export default async function BlogPostPage({ params }: BlogDetailProps) {
  const { lang, postSlug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const routes = localizedRoutes(locale)

  const post = await fetchPostBySlug(postSlug)
  if (!post) notFound()

  const title = pickLocalized(post as unknown as Record<string, unknown>,'title', locale)
  const excerpt = pickLocalized(post as unknown as Record<string, unknown>,'excerpt', locale)
  const content = pickLocalized(post as unknown as Record<string, unknown>,'content', locale) || post.content_es

  const categoryLabel = post.category
    ? (post.category[`label_${locale}` as `label_${Locale}`] as string) || post.category.label_es
    : null

  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat(locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-GB' : 'es-ES', {
        dateStyle: 'long',
      }).format(new Date(post.published_at))
    : null

  const relatedRaw = await fetchRelatedPosts(post.category_id, post.id, 3)

  return (
    <article className="ds-container ds-py-8">
      <Link href={routes.blog} className="ds-text-interactive ds-flex ds-items-center ds-gap-1 ds-mb-4">
        <ChevronLeft size={16} />
        <span>{dict.blog.backToBlog}</span>
      </Link>

      <header className="vip-blog-detail__header">
        {categoryLabel && post.category && (
          <Link
            href={routes.blogCategory(post.category.slug)}
            className="ds-badge ds-badge--outline"
          >
            {categoryLabel}
          </Link>
        )}
        <h1 className="ds-font-display ds-text-3xl ds-font-bold ds-text-primary ds-mt-3">
          {title}
        </h1>
        {excerpt && <p className="ds-text-lg ds-text-secondary ds-mt-3">{excerpt}</p>}

        <div className="ds-flex ds-items-center ds-gap-4 ds-text-sm ds-text-tertiary ds-mt-4">
          {publishedDate && (
            <span className="ds-flex ds-items-center ds-gap-1">
              <Calendar size={14} />
              {publishedDate}
            </span>
          )}
          <span className="ds-flex ds-items-center ds-gap-1">
            <Clock size={14} />
            {dict.blog.readingTime.replace('{n}', String(post.reading_minutes))}
          </span>
        </div>
      </header>

      {post.cover_image_url && (
        <div className="vip-blog-detail__cover">
          <Image
            src={post.cover_image_url}
            alt={post.cover_alt || title}
            fill
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="vip-blog-detail__cover-img"
            priority
            unoptimized
          />
        </div>
      )}

      <BlogPostContent html={content} />

      {post.cover_photographer_name && (
        <p className="ds-text-xs ds-text-tertiary ds-mt-4">
          {dict.blog.photoBy}{' '}
          <a
            href={post.cover_photographer_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-text-interactive"
          >
            {post.cover_photographer_name}
          </a>{' '}
          {dict.blog.onUnsplash}{' '}
          <a
            href={post.cover_photo_page_url}
            target="_blank"
            rel="noopener noreferrer"
            className="ds-text-interactive"
          >
            ↗
          </a>
        </p>
      )}

      {relatedRaw.length > 0 && (
        <section className="ds-mt-12">
          <h2 className="ds-font-display ds-text-2xl ds-font-bold ds-text-primary ds-mb-4">
            {dict.blog.relatedPosts}
          </h2>
          <BlogPostGrid
            posts={relatedRaw}
            locale={locale}
            readingTimeTemplate={dict.blog.readingTime}
            emptyMessage={dict.blog.empty}
          />
        </section>
      )}
    </article>
  )
}
