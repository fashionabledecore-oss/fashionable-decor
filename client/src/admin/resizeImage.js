// (Upload se pehle browser mein photo chhoti: lambi side max 1200 px, WebP 0.78.
//  Browser WebP na bana sake toh JPEG 0.8. Chhoti JPEG/WebP (<=1200px, <150 KB) waise hi jaati hai.)
export const MAX_SIDE = 1200
export const QUALITY = 0.8
const WEBP_QUALITY = 0.78
const SMALL_BYTES = 150 * 1024
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
export const MAX_PICK_MB = 20

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))

export async function resizeImage(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error(`"${file.name}" could not be read. Please try a different photo.`)
  }
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const isWebOk = file.type === 'image/webp' || file.type === 'image/jpeg'
    if (scale === 1 && file.size < SMALL_BYTES && isWebOk) return file
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    let blob = await toBlob(canvas, 'image/webp', WEBP_QUALITY)
    if (!blob || blob.type !== 'image/webp') blob = await toBlob(canvas, 'image/jpeg', QUALITY)
    if (!blob) return file
    const type = blob.type
    // (Photo pehle se chhoti thi aur nayi badi ban gayi, toh asli hi bhejo.)
    if (scale === 1 && blob.size >= file.size) return file
    const base = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${base}.${type === 'image/jpeg' ? 'jpg' : 'webp'}`, { type })
  } finally {
    bitmap.close?.()
  }
}

// (File list check: galat type ya bahut badi file ka saaf message.)
export function checkFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return `"${file.name}" is not JPG, PNG or WebP`
  if (file.size > MAX_PICK_MB * 1024 * 1024) return `"${file.name}" is larger than ${MAX_PICK_MB} MB`
  return ''
}
