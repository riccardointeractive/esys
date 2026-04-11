import { getAdminClient } from '@/lib/supabase/server'
import { TABLES } from '@/config/supabase-tables'
import { MEDIA_CONFIG } from '@/config/media'

/**
 * Thin scope-aware media helpers.
 *
 * The cms package (@digiko-npm/cms/r2) helpers don't know about scope
 * (a column we added to esys_media in migration 008 to isolate blog
 * uploads from the client property pool). These wrappers replicate the
 * same query shape but always include `.eq('scope', scope)` so the
 * caller can never accidentally cross the boundary.
 */

export type MediaScope = 'main' | 'blog'

export interface MediaRecord {
  id: string
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  width: number | null
  height: number | null
  alt_text: string | null
  folder_id: string | null
  scope: MediaScope
  created_at: string
}

export interface MediaListOptions {
  page?: number
  limit?: number
  type?: string
  search?: string
  folderId?: string | null
  scope: MediaScope
}

export interface MediaListResult {
  items: MediaRecord[]
  total: number
  page: number
  limit: number
  totalPages: number
}

/** List media filtered by scope (and optionally type/search/folder). */
export async function listMediaScoped(opts: MediaListOptions): Promise<MediaListResult> {
  const { page = 1, limit = 24, type, search, folderId, scope } = opts
  const supabase = getAdminClient()
  const offset = (page - 1) * limit

  let query = supabase
    .from(TABLES.media)
    .select('*', { count: 'exact' })
    .eq('scope', scope)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (type) query = query.like('mime_type', `${type}/%`)
  if (search) {
    query = query.or(
      `original_name.ilike.%${search}%,alt_text.ilike.%${search}%`
    )
  }
  if (folderId !== undefined) {
    if (folderId === null) query = query.is('folder_id', null)
    else query = query.eq('folder_id', folderId)
  }

  const { data, count, error } = await query
  if (error) throw new Error(`Failed to list media: ${error.message}`)

  return {
    items: (data ?? []) as MediaRecord[],
    total: count ?? 0,
    page,
    limit,
    totalPages: Math.ceil((count ?? 0) / limit),
  }
}

export interface MediaInsertScoped {
  filename: string
  original_name: string
  mime_type: string
  size_bytes: number
  url: string
  width?: number | null
  height?: number | null
  alt_text?: string | null
  folder_id?: string | null
  scope: MediaScope
}

/** Insert a media record with explicit scope. */
export async function insertMediaScoped(data: MediaInsertScoped): Promise<MediaRecord> {
  const supabase = getAdminClient()
  const { data: record, error } = await supabase
    .from(TABLES.media)
    .insert({
      filename: data.filename,
      original_name: data.original_name,
      mime_type: data.mime_type,
      size_bytes: data.size_bytes,
      url: data.url,
      width: data.width ?? null,
      height: data.height ?? null,
      alt_text: data.alt_text ?? null,
      folder_id: data.folder_id ?? null,
      scope: data.scope,
    })
    .select()
    .single()

  if (error) throw new Error(`Failed to insert media: ${error.message}`)
  return record as MediaRecord
}

/** Delete a media record by id, scoped. Refuses cross-scope deletes. */
export async function deleteMediaScoped(id: string, scope: MediaScope): Promise<void> {
  const supabase = getAdminClient()
  const { error } = await supabase
    .from(TABLES.media)
    .delete()
    .eq('id', id)
    .eq('scope', scope)
  if (error) throw new Error(`Failed to delete media: ${error.message}`)
}

/** Resolve the R2 path prefix for a given scope. */
export function r2PathForScope(scope: MediaScope): string {
  return scope === 'blog' ? MEDIA_CONFIG.paths.blog : MEDIA_CONFIG.paths.properties
}
