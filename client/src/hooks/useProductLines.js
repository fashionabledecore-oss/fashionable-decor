import { useEffect, useState } from 'react'
import { getCategories, getCollections } from '../services/api'
import { productLines } from '../config/site'

// (Navbar, footer, home tiles aur What we make sab ek hi request share karte hain: pehli baar fetch, phir cache.)
let cache = null

function load() {
  if (!cache) {
    cache = Promise.all([getCollections(), getCategories()]).catch((err) => {
      cache = null // (agli baar dobara koshish)
      throw err
    })
  }
  return cache
}

// Merges the live collections (admin) with productLines (config):
// - order and visibility come from admin (a hidden collection does not show),
// - the short line, tone and doodle come from config,
// - any extra collection added in admin also shows.
// While loading, or if the API fails, the config list is used so links still work.
function merge(collections, categories) {
  const known = new Map(productLines.map((p, i) => [p.slug, { ...p, index: i }]))
  return collections.map((c, i) => {
    const line = known.get(c.slug)
    return {
      slug: c.slug,
      name: c.name,
      line: line?.line || c.tagline || '',
      interest: line?.interest || 'other',
      tone: line?.tone || ['coral', 'mustard', 'sky', 'sage'][i % 4],
      doodle: line?.doodle || 'chair',
      image: c.bannerImage?.url || '',
      categories: categories.filter((cat) => cat.collection?.slug === c.slug),
    }
  })
}

const fallback = productLines.map((p) => ({ ...p, image: '', categories: [] }))

export function useProductLines() {
  const [state, setState] = useState({ lines: fallback, loading: true, error: null })

  useEffect(() => {
    let cancelled = false
    load()
      .then(([collections, categories]) => {
        if (!cancelled) setState({ lines: merge(collections, categories), loading: false, error: null })
      })
      .catch((error) => {
        if (!cancelled) setState({ lines: fallback, loading: false, error })
      })
    return () => {
      cancelled = true
    }
  }, [])

  return state
}
