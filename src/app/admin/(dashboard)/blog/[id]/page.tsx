import { BlogPostForm } from '@/components/admin/BlogPostForm'
import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import type { BlogCategory, BlogPostWithCategory } from '@/types/blog'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ id: string }>
}

async function fetchPost(id: string): Promise<BlogPostWithCategory | null> {
  try {
    const supabase = getAdminClient()
    const { data: post, error } = await supabase
      .from(TABLES.blogPosts)
      .select('*')
      .eq('id', id)
      .is('deleted_at', null)
      .single()
    if (error || !post) {
      if (error) console.error('[admin/blog/[id]] fetchPost error:', error)
      return null
    }

    let category: BlogCategory | null = null
    if (post.category_id) {
      const { data: cat } = await supabase
        .from(TABLES.blogCategories)
        .select('*')
        .eq('id', post.category_id)
        .maybeSingle()
      category = (cat as BlogCategory | null) ?? null
    }

    return { ...(post as BlogPostWithCategory), category }
  } catch (err) {
    console.error('[admin/blog/[id]] fetchPost threw:', err)
    return null
  }
}

async function fetchCategories(): Promise<BlogCategory[]> {
  try {
    const supabase = getAdminClient()
    const { data, error } = await supabase
      .from(TABLES.blogCategories)
      .select('*')
      .is('deleted_at', null)
      .order('sort_order', { ascending: true })
      .order('label_es', { ascending: true })
    if (error) {
      console.error('[admin/blog/[id]] fetchCategories error:', error)
      return []
    }
    return (data ?? []) as BlogCategory[]
  } catch (err) {
    console.error('[admin/blog/[id]] fetchCategories threw:', err)
    return []
  }
}

export default async function AdminBlogEditPage({ params }: Props) {
  const { id } = await params
  const [post, categories] = await Promise.all([fetchPost(id), fetchCategories()])

  if (!post) {
    return <div className="ds-alert ds-alert--error">Artículo no encontrado</div>
  }

  return <BlogPostForm post={post} categories={categories} />
}
