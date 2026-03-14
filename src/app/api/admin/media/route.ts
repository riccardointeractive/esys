import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { listMedia, insertMedia, deleteMedia } from '@digiko-npm/cms/r2'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'

/* ─── GET /api/admin/media ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const { searchParams } = new URL(request.url)
  const page = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 24
  const type = searchParams.get('type') || undefined
  const search = searchParams.get('search') || undefined

  const supabase = getAdminClient()
  const result = await listMedia(supabase, TABLES.media, {
    page,
    limit,
    type,
    search,
  })

  return NextResponse.json(result)
}

/* ─── POST /api/admin/media ─── */

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
    const supabase = getAdminClient()
    const media = await insertMedia(supabase, TABLES.media, {
      filename: body.filename,
      original_name: body.original_name || body.filename,
      mime_type: body.mime_type,
      size_bytes: body.size_bytes || 0,
      url: body.url,
      width: body.width,
      height: body.height,
      alt_text: body.alt_text || '',
    })

    return NextResponse.json(media, { status: HTTP_STATUS.CREATED })
  } catch (err) {
    console.error('[POST /api/admin/media]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al registrar media' },
      { status: 500 }
    )
  }
}

/* ─── DELETE /api/admin/media ─── */

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

  const supabase = getAdminClient()
  const r2Config = {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: process.env.R2_PUBLIC_URL!,
  }

  await deleteMedia(supabase, TABLES.media, r2Config, id)

  return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT })
}
