import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { getAdminClient } from '@/lib/supabase/server'
import { listFolders, createFolder, renameFolder, deleteFolder } from '@digiko-npm/cms/r2'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { TABLES } from '@/config/supabase-tables'

/* ─── GET /api/admin/media/folders ─── */

export async function GET(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  const supabase = getAdminClient()
  const folders = await listFolders(supabase, TABLES.mediaFolders)

  return NextResponse.json(folders)
}

/* ─── POST /api/admin/media/folders ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: { name?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const name = body.name?.trim()
  if (!name) {
    return NextResponse.json(
      { error: 'Se requiere nombre' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    const supabase = getAdminClient()
    const folder = await createFolder(supabase, TABLES.mediaFolders, name)
    return NextResponse.json(folder, { status: HTTP_STATUS.CREATED })
  } catch (err) {
    console.error('[POST /api/admin/media/folders]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al crear carpeta' },
      { status: 500 }
    )
  }
}

/* ─── PATCH /api/admin/media/folders ─── */

export async function PATCH(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: { id?: string; name?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const name = body.name?.trim()
  if (!body.id || !name) {
    return NextResponse.json(
      { error: 'Se requieren id y nombre' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    const supabase = getAdminClient()
    const folder = await renameFolder(supabase, TABLES.mediaFolders, body.id, name)
    return NextResponse.json(folder)
  } catch (err) {
    console.error('[PATCH /api/admin/media/folders]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al renombrar carpeta' },
      { status: 500 }
    )
  }
}

/* ─── DELETE /api/admin/media/folders ─── */

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
    await deleteFolder(supabase, TABLES.mediaFolders, id)
    return new NextResponse(null, { status: HTTP_STATUS.NO_CONTENT })
  } catch (err) {
    console.error('[DELETE /api/admin/media/folders]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al eliminar carpeta' },
      { status: 500 }
    )
  }
}
