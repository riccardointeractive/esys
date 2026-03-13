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

/* ─── POST /api/admin/media/presign ─── */

export async function POST(request: NextRequest) {
  const auth = await verifyAdminRequest(request)
  if (!auth.authorized) return auth.response

  let body: { filename: string; contentType: string; folder?: string }
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

  // Validate content type
  const allAllowed: readonly string[] = [
    ...MEDIA_CONFIG.allowedImageTypes,
    ...MEDIA_CONFIG.allowedVideoTypes,
  ]
  if (!allAllowed.includes(body.contentType)) {
    return NextResponse.json(
      { error: 'Tipo de archivo no permitido' },
      { status: HTTP_STATUS.BAD_REQUEST }
    )
  }

  const result = await createPresignedUploadUrl(getR2Config(), {
    filename: body.filename,
    contentType: body.contentType,
    folder: body.folder || MEDIA_CONFIG.paths.properties,
  })

  return NextResponse.json(result)
}
