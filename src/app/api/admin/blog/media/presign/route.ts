import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminRequest } from '@/lib/admin-auth'
import { createPresignedUploadUrl } from '@digiko-npm/cms/r2'
import { HTTP_STATUS } from '@digiko-npm/cms/http'
import { MEDIA_CONFIG } from '@/config/media'

function getR2Config() {
  return {
    accountId: process.env.R2_ACCOUNT_ID!,
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    bucketName: process.env.R2_BUCKET_NAME!,
    publicUrl: process.env.R2_PUBLIC_URL!,
  }
}

/* ─── POST /api/admin/blog/media/presign ───
 * Presign uploads to R2 under the 'blog/' path prefix so blog assets
 * are physically separated from client property assets.
 */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: { filename: string; contentType: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      { error: 'Cuerpo de la petición inválido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  if (!body.filename || !body.contentType) {
    return NextResponse.json(
      { error: 'Se requiere filename y contentType' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  // Only image types for blog (no video uploads in editorial)
  if (!(MEDIA_CONFIG.allowedImageTypes as readonly string[]).includes(body.contentType)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido — solo imágenes' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  try {
    const result = await createPresignedUploadUrl(getR2Config(), {
      filename: body.filename,
      contentType: body.contentType,
      folder: MEDIA_CONFIG.paths.blog,
    })
    return NextResponse.json(result)
  } catch (err) {
    console.error('[blog/media/presign POST]', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Error al generar URL de subida' },
      { status: HTTP_STATUS.INTERNAL_ERROR }
    )
  }
}
