import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { BlogPostContent } from '@/components/blog/BlogPostContent'
import { BlogPostGrid } from '@/components/blog/BlogPostGrid'
import { fetchPostBySlug, fetchRelatedPosts } from '@/lib/blog'
import { hreflang, absoluteUrl, slugForLocale } from '@/lib/seo/alternates'
import { articleJsonLd, breadcrumbListJsonLd } from '@/lib/seo/jsonld'
import { JsonLd } from '@/components/seo/JsonLd'

export const dynamic = 'force-dynamic'

interface BlogDetailProps {
  params: Promise<{ lang: string; postSlug: string }>
}

function pickLocalized(obj: Record<string, unknown>, key: string, locale: Locale): string {
  return (obj[`${key}_${locale}`] as string) || (obj[`${key}_es`] as string) || ''
}

export async function generateMetadata({ params }: BlogDetailProps): Promise<Metadata> {
  const { lang, postSlug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const post = await fetchPostBySlug(postSlug, locale)
  if (!post) {
    return {
      title: dict.blog.notFound,
      alternates: hreflang.blog(locale),
    }
  }
  const title = pickLocalized(post as unknown as Record<string, unknown>, 'title', locale)
  const description =
    pickLocalized(post as unknown as Record<string, unknown>, 'excerpt', locale) ||
    dict.seo.blog.description
  return {
    title: `${title} — ${dict.blog.title}`,
    description,
    alternates: hreflang.blogPost(locale, post),
    openGraph: post.cover_image_url ? { images: [{ url: post.cover_image_url }] } : undefined,
  }
}

export default async function BlogPostPage({ params }: BlogDetailProps) {
  const { lang, postSlug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const routes = localizedRoutes(locale)

  const post = await fetchPostBySlug(postSlug, locale)
  if (!post) notFound()

  // 301 redirect from a legacy/ES slug to the localised slug when the user
  // lands on /en/blog/<es-slug> or /ru/blog/<es-slug> and an actual EN/RU
  // slug exists. Keeps old links + the Google index unified on the new URL.
  const expectedSlug = slugForLocale(post, locale)
  if (expectedSlug && expectedSlug !== postSlug) {
    permanentRedirect(routes.blogPost(expectedSlug))
  }

  const title = pickLocalized(post as unknown as Record<string, unknown>, 'title', locale)
  const excerpt = pickLocalized(post as unknown as Record<string, unknown>, 'excerpt', locale)
  const content =
    pickLocalized(post as unknown as Record<string, unknown>, 'content', locale) || post.content_es

  const categoryLabel = post.category
    ? (post.category[`label_${locale}` as `label_${Locale}`] as string) || post.category.label_es
    : null

  const publishedDate = post.published_at
    ? new Intl.DateTimeFormat(
        locale === 'ru' ? 'ru-RU' : locale === 'en' ? 'en-GB' : 'es-ES',
        { day: 'numeric', month: 'long', year: 'numeric' }
      ).format(new Date(post.published_at))
    : null

  const relatedRaw = await fetchRelatedPosts(post.category_id, post.id, 3)

  const breadcrumbs = breadcrumbListJsonLd([
    { name: dict.nav.home, url: absoluteUrl(routes.home) },
    { name: dict.blog.title, url: absoluteUrl(routes.blog) },
    ...(post.category
      ? [
          {
            name:
              (post.category[`label_${locale}` as `label_${Locale}`] as string) ||
              post.category.label_es,
            url: absoluteUrl(routes.blogCategory(post.category.slug)),
          },
        ]
      : []),
    { name: title, url: absoluteUrl(routes.blogPost(slugForLocale(post, locale))) },
  ])
  const article = articleJsonLd(post, locale)

  return (
    <article className="ds-container">
      <JsonLd data={[breadcrumbs, article]} />

      {/* ─── Editorial header ─── */}
      <header className="vip-blog-detail__header">
        {categoryLabel && post.category ? (
          <Link
            href={routes.blogCategory(post.category.slug)}
            className="ds-overline"
          >
            {categoryLabel}
          </Link>
        ) : null}

        <h1 className="vip-blog-hero-title">{title}</h1>

        {excerpt && <p className="vip-blog-lede">{excerpt}</p>}

        <div className="vip-blog-meta ds-overline">
          {publishedDate && <span>{publishedDate}</span>}
          {publishedDate && <span className="vip-blog-meta__sep" aria-hidden="true" />}
          <span>
            {dict.blog.readingTime.replace('{n}', String(post.reading_minutes))}
          </span>
        </div>
      </header>

      {/* ─── Cinematic cover ─── */}
      {post.cover_image_url && (
        <div className="vip-blog-detail__cover">
          <Image
            src={post.cover_image_url}
            alt={post.cover_alt || title}
            fill
            sizes="(max-width: 1024px) 100vw, 1080px"
            className="vip-blog-detail__cover-img"
            priority
            unoptimized
          />
        </div>
      )}

      {/* ─── Body ─── */}
      <div className="vip-blog-detail__body">
        <BlogPostContent html={content} />

        {post.cover_photographer_name && (
          <p className="vip-blog-detail__credit ds-text-xs ds-text-tertiary">
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
      </div>

      {/* ─── Article-end CTA (generic: browse + contact) ─── */}
      <section className="vip-blog-cta" aria-labelledby="vip-blog-cta-title">
        <div className="vip-blog-cta__inner">
          <p className="ds-overline">{dict.blog.cta.eyebrow}</p>
          <h2 id="vip-blog-cta-title" className="ds-section-title">
            {dict.blog.cta.title}
          </h2>
          <p className="ds-text-base ds-text-secondary">{dict.blog.cta.text}</p>
          <div className="vip-blog-cta__actions">
            <Link href={routes.properties} className="ds-btn ds-btn--xl">
              {dict.blog.cta.actionPrimary}
            </Link>
            <Link href={routes.contact} className="ds-btn ds-btn--xl ds-btn--secondary">
              {dict.blog.cta.actionSecondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Related ─── */}
      {relatedRaw.length > 0 && (
        <section className="vip-blog-detail__related">
          <h2 className="ds-section-title ds-mb-6">{dict.blog.relatedPosts}</h2>
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
