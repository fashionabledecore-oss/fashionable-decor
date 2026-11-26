import { useEffect } from 'react'
import { siteConfig, SITE_URL, keywords } from '../config/site'

// ('/path' ya poora URL, dono se absolute URL banata hai.)
export function absoluteUrl(pathOrUrl = '/') {
  if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`
}

// (Meta description ~160 characters tak achhi lagti hai.)
export function clip(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

// (Head mein ek JSON-LD script rakhta hai. Page band hote hi hat jaata hai.)
export function useJsonLd(id, data) {
  const json = data ? JSON.stringify(data) : ''

  useEffect(() => {
    if (!json) return undefined
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = `ld-${id}`
    script.textContent = json.replace(/</g, '\\u003c')
    document.getElementById(script.id)?.remove()
    document.head.appendChild(script)
    return () => script.remove()
  }, [id, json])
}

// (Poora address siteConfig se. Koi geo, rating, review ya priceRange nahi.)
export function businessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FurnitureStore',
    '@id': `${SITE_URL}/#business`,
    name: siteConfig.name,
    slogan: siteConfig.tagline,
    description: siteConfig.defaultDescription,
    url: `${SITE_URL}/`,
    logo: absoluteUrl(siteConfig.logo),
    image: absoluteUrl(siteConfig.ogImage),
    telephone: siteConfig.phone.replace(/\s/g, ''),
    ...(siteConfig.email && { email: siteConfig.email }),
    founder: { '@type': 'Person', name: siteConfig.owner },
    address: {
      '@type': 'PostalAddress',
      streetAddress: siteConfig.addressLine,
      addressLocality: siteConfig.locality,
      addressRegion: siteConfig.state,
      postalCode: siteConfig.postalCode,
      addressCountry: siteConfig.country,
    },
    hasMap: siteConfig.mapUrl,
    areaServed: { '@type': 'City', name: siteConfig.city },
    keywords: keywords.join(', '),
    sameAs: [siteConfig.instagramUrl],
  }
}

// (Breadcrumbs component ke items se. Aakhri item ka link current page hota hai.)
export function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: absoluteUrl(item.to || window.location.pathname),
    })),
  }
}
