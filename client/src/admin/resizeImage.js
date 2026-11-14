// (Upload se pehle browser mein photo chhoti: lambi side max 1600 px, quality 0.8.
//  JPEG JPEG hi rehta hai; PNG/WebP WebP bante hain (transparency bachi rahe).)
export const MAX_SIDE = 1600
export const QUALITY = 0.8
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
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
    const blob = await toBlob(canvas, type, QUALITY)
    if (!blob || blob.type !== type) return file
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
