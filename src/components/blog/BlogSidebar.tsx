import Link from 'next/link'
import type { BlogCategory } from '@/types/blog'
import type { Locale } from '@/config/i18n'
import { localizedRoutes } from '@/config/i18n/routes'

interface BlogSidebarProps {
  categories: BlogCategory[]
  counts: Record<string, number>
  locale: Locale
  activeCategorySlug?: string
  title: string
  allLabel: string
}

export function BlogSidebar({
  categories,
  counts,
  locale,
  activeCategorySlug,
  title,
  allLabel,
}: BlogSidebarProps) {
  const routes = localizedRoutes(locale)

  return (
    <aside className="vip-blog-sidebar">
      <h2 className="ds-heading-ui ds-text-lg ds-mb-4">
        {title}
      </h2>
      <ul className="vip-blog-sidebar__list">
        <li>
          <Link
            href={routes.blog}
            className={`vip-blog-sidebar__link${
              !activeCategorySlug ? ' vip-blog-sidebar__link--active' : ''
            }`}
          >
            {allLabel}
          </Link>
        </li>
        {categories.map((c) => {
          const label = (c[`label_${locale}` as `label_${Locale}`] as string) || c.label_es
          const count = counts[c.id] ?? 0
          const isActive = activeCategorySlug === c.slug
          return (
            <li key={c.id}>
              <Link
                href={routes.blogCategory(c.slug)}
                className={`vip-blog-sidebar__link${
                  isActive ? ' vip-blog-sidebar__link--active' : ''
                }`}
              >
                <span>{label}</span>
                <span className="ds-text-tertiary ds-text-sm">{count}</span>
              </Link>
            </li>
          )
        })}
      </ul>
    </aside>
  )
}
