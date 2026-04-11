import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { getDictionary } from '@/config/i18n'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'
import { fetchActiveCategories, fetchCategoryCounts } from '@/lib/blog'

export const dynamic = 'force-dynamic'

interface CategoryIndexProps {
  params: Promise<{ lang: string }>
}

export async function generateMetadata({ params }: CategoryIndexProps) {
  const { lang } = await params
  const dict = getDictionary(lang as Locale)
  return {
    title: `${dict.blog.categories} — ${dict.blog.title}`,
    description: dict.seo.blog.description,
  }
}

export default async function BlogCategoryIndexPage({ params }: CategoryIndexProps) {
  const { lang } = await params
  const locale = lang as Locale
  const dict = getDictionary(locale)
  const routes = localizedRoutes(locale)
  const [categories, counts] = await Promise.all([fetchActiveCategories(), fetchCategoryCounts()])

  return (
    <div className="ds-container ds-py-8">
      <Link
        href={routes.blog}
        className="ds-text-interactive ds-flex ds-items-center ds-gap-1 ds-mb-4"
      >
        <ChevronLeft size={16} />
        <span>{dict.blog.backToBlog}</span>
      </Link>

      <h1 className="ds-section-title ds-mb-6">
        {dict.blog.categories}
      </h1>

      {categories.length === 0 ? (
        <p className="ds-text-secondary">{dict.blog.empty}</p>
      ) : (
        <div className="vip-blog-grid">
          {categories.map((c) => {
            const label = (c[`label_${locale}` as `label_${Locale}`] as string) || c.label_es
            const description =
              (c[`description_${locale}` as `description_${Locale}`] as string) ||
              c.description_es
            return (
              <Link
                key={c.id}
                href={routes.blogCategory(c.slug)}
                className="vip-blog-card vip-blog-card__body"
              >
                <h2 className="ds-heading-ui ds-text-lg">
                  {label}
                </h2>
                {description && (
                  <p className="ds-text-sm ds-text-secondary ds-mt-2">{description}</p>
                )}
                <p className="ds-text-xs ds-text-tertiary ds-mt-3">
                  {counts[c.id] ?? 0}
                </p>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
