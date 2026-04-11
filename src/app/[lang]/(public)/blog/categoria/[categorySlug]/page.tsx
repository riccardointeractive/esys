import { notFound } from 'next/navigation'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { BlogPostGrid } from '@/components/blog/BlogPostGrid'
import { BlogSidebar } from '@/components/blog/BlogSidebar'
import {
  fetchActiveCategories,
  fetchCategoryBySlug,
  fetchCategoryCounts,
  fetchPublishedPosts,
} from '@/lib/blog'

export const dynamic = 'force-dynamic'

interface CategoryPageProps {
  params: Promise<{ lang: string; categorySlug: string }>
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const { lang, categorySlug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const category = await fetchCategoryBySlug(categorySlug)
  if (!category) {
    return { title: dict.seo.blog.title, description: dict.seo.blog.description }
  }
  const label =
    (category[`label_${locale}` as `label_${Locale}`] as string) || category.label_es
  const desc =
    (category[`description_${locale}` as `description_${Locale}`] as string) ||
    category.description_es ||
    dict.seo.blog.description
  return { title: `${label} — ${dict.blog.title}`, description: desc }
}

export default async function BlogCategoryPage({ params }: CategoryPageProps) {
  const { lang, categorySlug } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)

  const category = await fetchCategoryBySlug(categorySlug)
  if (!category) notFound()

  const [{ data: posts }, categories, counts] = await Promise.all([
    fetchPublishedPosts({ categoryId: category.id, limit: 24 }),
    fetchActiveCategories(),
    fetchCategoryCounts(),
  ])

  const label = (category[`label_${locale}` as `label_${Locale}`] as string) || category.label_es
  const description =
    (category[`description_${locale}` as `description_${Locale}`] as string) ||
    category.description_es

  return (
    <div className="ds-container vip-blog-section">
      <header className="vip-blog-detail__header">
        <span className="ds-overline">{dict.blog.title}</span>
        <h1 className="ds-hero-title">{label}</h1>
        {description && <p className="ds-text-lg ds-text-secondary">{description}</p>}
      </header>

      <div className="vip-blog-layout">
        <section className="vip-blog-layout__main">
          <BlogPostGrid
            posts={posts}
            locale={locale}
            readingTimeTemplate={dict.blog.readingTime}
            emptyMessage={dict.blog.emptyCategory}
          />
        </section>
        <BlogSidebar
          categories={categories}
          counts={counts}
          locale={locale}
          activeCategorySlug={category.slug}
          title={dict.blog.categories}
          allLabel={dict.blog.allCategories}
        />
      </div>
    </div>
  )
}
