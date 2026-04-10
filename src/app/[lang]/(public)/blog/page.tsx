import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { BlogPostGrid } from '@/components/blog/BlogPostGrid'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import {
  fetchActiveCategories,
  fetchCategoryCounts,
  fetchPublishedPosts,
} from '@/lib/blog'

export const dynamic = 'force-dynamic'

interface BlogIndexProps {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ page?: string }>
}

export async function generateMetadata({ params }: BlogIndexProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: dict.seo.blog.title,
    description: dict.seo.blog.description,
  }
}

export default async function BlogIndexPage({ params, searchParams }: BlogIndexProps) {
  const { lang } = await params
  const sp = await searchParams
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const page = Math.max(1, Number(sp.page) || 1)

  const [{ data: posts }, categories, counts] = await Promise.all([
    fetchPublishedPosts({ page, limit: 12 }),
    fetchActiveCategories(),
    fetchCategoryCounts(),
  ])

  return (
    <div className="ds-container vip-blog-section">
      <header className="vip-blog-detail__header">
        <span className="vip-blog-eyebrow">{dict.blog.journalEyebrow}</span>
        <h1 className="vip-blog-hero-title">{dict.blog.title}</h1>
        <p className="vip-blog-lede">{dict.blog.subtitle}</p>
      </header>

      <div className="vip-blog-layout">
        <section className="vip-blog-layout__main">
          <BlogPostGrid
            posts={posts}
            locale={locale}
            readingTimeTemplate={dict.blog.readingTime}
            emptyMessage={dict.blog.empty}
          />
        </section>
        <BlogSidebar
          categories={categories}
          counts={counts}
          locale={locale}
          title={dict.blog.categories}
          allLabel={dict.blog.allCategories}
        />
      </div>
    </div>
  )
}
