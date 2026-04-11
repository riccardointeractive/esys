import { ADMIN_API_ROUTES } from '@/config/routes'
import { MEDIA_CONFIG } from '@/config/media'

/**
 * Browser-side helper to upload an image file to R2 (blog scope) and
 * register the metadata in esys_media. Returns the public URL.
 *
 * Flow:
 *   1. POST /api/admin/blog/media/presign → presigned PUT URL on R2
 *   2. PUT file directly to R2 (no bytes through Next server)
 *   3. POST metadata to /api/admin/blog/media → register row
 */

export interface BlogUploadResult {
  url: string
  width?: number
  height?: number
  filename: string
}

const MAX_BYTES = MEDIA_CONFIG.maxFileSizeMb * 1024 * 1024

export async function uploadBlogImage(file: File): Promise<BlogUploadResult> {
  if (!(MEDIA_CONFIG.allowedImageTypes as readonly string[]).includes(file.type)) {
    throw new Error(
      `Tipo no permitido: ${file.type}. Usa JPG, PNG, WebP o AVIF.`
    )
  }
  if (file.size > MAX_BYTES) {
    throw new Error(
      `Archivo demasiado grande (${(file.size / 1024 / 1024).toFixed(1)} MB). Máx ${MEDIA_CONFIG.maxFileSizeMb} MB.`
    )
  }

  // 1. Get presigned URL
  const presignRes = await fetch(ADMIN_API_ROUTES.blogMediaPresign, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filename: file.name, contentType: file.type }),
  })
  if (!presignRes.ok) {
    const data = await presignRes.json().catch(() => ({}))
    throw new Error(data.error || 'Presign failed')
  }
  const { uploadUrl, publicUrl, key } = (await presignRes.json()) as {
    uploadUrl: string
    publicUrl: string
    key: string
  }

  // 2. Upload directly to R2
  const putRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': file.type },
    body: file,
  })
  if (!putRes.ok) {
    throw new Error(`R2 upload failed: ${putRes.status}`)
  }

  // 3. Probe image dimensions client-side (best effort)
  let width: number | undefined
  let height: number | undefined
  try {
    const dims = await readImageDimensions(file)
    width = dims.width
    height = dims.height
  } catch {
    // Non-fatal — server will store nulls
  }

  // 4. Register metadata
  const registerRes = await fetch(ADMIN_API_ROUTES.blogMedia, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filename: key.split('/').pop() ?? file.name,
      original_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      url: publicUrl,
      width,
      height,
    }),
  })
  if (!registerRes.ok) {
    const data = await registerRes.json().catch(() => ({}))
    throw new Error(data.error || 'Register failed')
  }

  return { url: publicUrl, width, height, filename: file.name }
}

function readImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to read image'))
    }
    img.src = url
  })
}
