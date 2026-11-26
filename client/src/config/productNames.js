// Tap-to-choose product names in admin, per category.
// Key = category name as stored in the Category document, lower-cased and trimmed, so the same presets also
// work for same-named categories in other collections (e.g. "Beds" under Beds & Headboards).
// Plain furniture terms only, no marketing words.
export const productNamePresets = {
  'sofa sets': ['Sofa Set', '3+2 Sofa Set', '3+1+1 Sofa Set', '2+1+1 Sofa Set', 'Sofa Set with Center Table'],
  'corner sofas': ['Corner Sofa', 'L-Shape Corner Sofa', 'U-Shape Corner Sofa'],
  'l-shape sofas': ['L-Shape Sofa', 'L-Shape Sofa with Lounger'],
  'single seaters': ['Single Seater Sofa', 'Accent Chair', 'Wing Chair'],
  'recliner sofas': ['Recliner Sofa', '2 Seater Recliner Sofa', '3 Seater Recliner Sofa'],
  'recliner chairs': ['Recliner Chair', 'Rocking Recliner Chair'],
  beds: ['Bed', 'King Size Bed', 'Queen Size Bed', 'Storage Bed', 'Upholstered Bed'],
  headboards: ['Headboard', 'Cushioned Headboard', 'Wall Panel Headboard'],
  'dining sets': ['Dining Set', '4 Seater Dining Set', '6 Seater Dining Set', '8 Seater Dining Set', 'Dining Table'],
  'dining chairs': ['Dining Chair', 'Cushioned Dining Chair'],
  curtains: ['Curtains', 'Blinds', 'Sheer Curtains', 'Blackout Curtains'],
  wallpaper: ['Wallpaper', '3D Wallpaper', 'Textured Wallpaper'],
}

// Fallback for categories without presets (created later): the category name itself is the only preset.
export function presetsFor(categoryName) {
  const name = String(categoryName ?? '').trim()
  if (!name) return []
  return productNamePresets[name.toLowerCase()] ?? [name]
}
