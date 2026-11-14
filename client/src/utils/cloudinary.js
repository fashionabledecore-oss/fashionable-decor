// (Sirf Cloudinary ki images badalti hain. Local /images/... ya doosre URLs waise ke waise.)
const isCloudinary = (src) =>
  typeof src === 'string' && src.includes('res.cloudinary.com') && src.includes('/upload/')

/**
 * Optimized Cloudinary URL: f_auto, q_auto and a width.
 * With height, the image is cropped to that size (c_fill + g_auto); without it, only scaled down (c_limit).
 * fit 'contain': never cropped, only scaled down to fit inside width x height (c_limit).
 */
export function cloudinaryUrl(src, { width, height, fit = 'cover' } = {}) {
  if (!isCloudinary(src)) return src
  const [base, rest] = src.split('/upload/')
  // (Version "v123/" se pehle jo transformations lagi hain wo hata do, taaki double na lagein.)
  const path = /(^|\/)v\d+\//.test(rest)
    ? rest.replace(/^(?:[^/]+\/)*?(?=v\d+\/)/, '')
    : rest.replace(/^f_auto,q_auto\//, '')

  const parts = ['f_auto', 'q_auto']
  if (width && height && fit === 'contain') parts.push('c_limit', `w_${Math.round(width)}`, `h_${Math.round(height)}`)
  else if (width && height) parts.push('c_fill', 'g_auto', `w_${Math.round(width)}`, `h_${Math.round(height)}`)
  else if (width) parts.push('c_limit', `w_${Math.round(width)}`)
  return `${base}/upload/${parts.join(',')}/${path}`
}

// (1x aur 2x screens ke liye srcSet. Non-Cloudinary image par undefined.)
export function cloudinarySrcSet(src, { width, height, fit } = {}) {
  if (!isCloudinary(src) || !width) return undefined
  return [1, 2]
    .map((d) => `${cloudinaryUrl(src, { width: width * d, height: height && height * d, fit })} ${d}x`)
    .join(', ')
}
