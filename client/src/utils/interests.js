// (Lead form ka "What are you looking for?". Values server ke LEAD_INTERESTS jaise hi hain.)
export const INTERESTS = [
  { value: 'sofa-set', label: 'Sofa set' },
  { value: 'l-shape', label: 'L-shape sofa' },
  { value: 'recliner', label: 'Recliner' },
  { value: 'bed', label: 'Bed' },
  { value: 'headboard', label: 'Headboard' },
  { value: 'dining', label: 'Dining table' },
  { value: 'curtains', label: 'Curtains' },
  { value: 'wallpaper', label: 'Wallpaper' },
  { value: 'other', label: 'Other' },
]

// (Purani leads ki values: admin mein naam dikhane ke liye, form mein nahi.)
const LEGACY_LABELS = {
  'bed-headboard': 'Bed or headboard',
  'curtains-wallpaper': 'Curtains or wallpaper',
}

export const interestLabel = (value) => INTERESTS.find((i) => i.value === value)?.label || LEGACY_LABELS[value] || ''

// (Product page par form pehle se sahi chuna ho: L-shape category ho toh l-shape, warna product line ka interest.)
export function interestForProduct(categorySlug, collectionSlug, productLines) {
  if (/l-shape/.test(categorySlug || '')) return 'l-shape'
  return productLines.find((p) => p.slug === collectionSlug)?.interest || ''
}
