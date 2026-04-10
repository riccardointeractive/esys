import { BlogPostForm } from '@/components/admin/BlogPostForm'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { BlogCategory } from '@/types/blog'

export const dynamic = 'force-dynamic'

async function fetchCategories(): Promise<BlogCategory[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from(TABLES.blogCategories)
      .select('*')
      .is('deleted_at', null)
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .order('label_es', { ascending: true })
    if (error) {
      console.error('[admin/blog/nueva] fetchCategories error:', error)
      return []
    }
    return (data ?? []) as BlogCategory[]
  } catch (err) {
    console.error('[admin/blog/nueva] fetchCategories threw:', err)
    return []
  }
}

export default async function AdminBlogNewPage() {
  const categories = await fetchCategories()
  return <BlogPostForm categories={categories} />
}
