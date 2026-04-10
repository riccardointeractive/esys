import { BlogPostForm } from '@/components/admin/BlogPostForm'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { BlogCategory } from '@/types/blog'

export const dynamic = 'force-dynamic'

async function fetchCategories(): Promise<BlogCategory[]> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from(TABLES.blogCategories)
    .select('*')
    .is('deleted_at', null)
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .order('label_es', { ascending: true })
  return (data ?? []) as BlogCategory[]
}

export default async function AdminBlogNewPage() {
  const categories = await fetchCategories()
  return <BlogPostForm categories={categories} />
}
