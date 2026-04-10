import { BlogPostForm } from '@/components/admin/BlogPostForm'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { BlogCategory, BlogPostWithCategory } from '@/types/blog'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchPost(id: string): Promise<BlogPostWithCategory | null> {
  const supabase = getAdminClient()
  const { data, error } = await supabase
    .from(TABLES.blogPosts)
    .select(`*, category:${TABLES.blogCategories}(*)`)
    .eq('id', id)
    .is('deleted_at', null)
    .single()
  if (error || !data) return null
  return data as BlogPostWithCategory
}

async function fetchCategories(): Promise<BlogCategory[]> {
  const supabase = getAdminClient()
  const { data } = await supabase
    .from(TABLES.blogCategories)
    .select('*')
    .is('deleted_at', null)
    .order('sort_order', { ascending: true })
    .order('label_es', { ascending: true })
  return (data ?? []) as BlogCategory[]
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params
  const [post, categories] = await Promise.all([fetchPost(id), fetchCategories()])

  if (!post) {
    return <div className="ds-alert ds-alert--error">Artículo no encontrado</div>
  }

  return <BlogPostForm post={post} categories={categories} />
}
