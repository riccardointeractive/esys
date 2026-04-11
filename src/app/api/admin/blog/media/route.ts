import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { deleteMedia } from '@digiko-npm/cms/r2'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'
import { listMediaScoped, insertMediaScoped } from '@/lib/media-scoped'

/* ─── GET /api/admin/blog/media ───
 * Blog-scoped media library. Always filtered to scope='blog'.
 * Never exposes the client property pool.
 */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  try {
    const { searchParams } = new URL(request.url)
    const page = Number(searchParams.get('page')) || 1
    const limit = Number(searchParams.get('limit')) || 24
    const type = searchParams.get('type') || undefined
    const search = searchParams.get('search') || undefined

    const result = await listMediaScoped({
      page,
      limit,
      type,
      search,
      scope: 'blog',
    })

    return NextResponse.json(result)
  } catch (err) {
    console.error('[blog/media GET]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al listar media' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}

/* ─── POST /api/admin/blog/media ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: {
    filename: string
    original_name: string
    mime_type: string
    size_bytes: number
    url: string
    width?: number
    height?: number
    alt_text?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.filename || !body.url || !body.mime_type) {
    return NextResponse.json(
      { error: 'Campos obligatorios: filename, url, mime_type' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    const media = await insertMediaScoped({
      filename: body.filename,
      original_name: body.original_name || body.filename,
      mime_type: body.mime_type,
      size_bytes: body.size_bytes || 0,
      url: body.url,
      width: body.width,
      height: body.height,
      alt_text: body.alt_text || '',
      scope: 'blog',
    })

    return NextResponse.json(media, { status: HTTP_STATUS.CREATED })
  } catch (err) {
    console.error('[blog/media POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al registrar media' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}

/* ─── DELETE /api/admin/blog/media?id=... ─── */

export async function DELETE(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json(
      { error: 'Se requiere id' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    const supabase = getAdminClient()
    // Scope guard: refuse cross-scope deletes
    const { data: existing } = await supabase
      .from(TABLES.media)
      .select('id')
      .eq('id', id)
      .eq('scope', 'blog')
      .maybeSingle()
    if (!existing) {
      return NextResponse.json(
        { error: 'Media no encontrada' },
        { status: HTTP_STATUS.NOT_FOUND }
      )
    }

    const r2Config = {
      accountId: process.env.R2_ACCOUNT_ID!,
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
      bucketName: process.env.R2_BUCKET_NAME!,
      publicUrl: process.env.R2_PUBLIC_URL!,
    }

    await deleteMedia(supabase, TABLES.media, r2Config, id)
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT })
  } catch (err) {
    console.error('[blog/media DELETE]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al eliminar media' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
