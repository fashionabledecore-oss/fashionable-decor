// Build-time prerendered meta tags (runs after `vite build`).
// For every public route it writes dist/<route>/index.html: the same bundle and <div id="root">,
// but with that route's title, description, canonical, og:*, twitter:* and (products) Product JSON-LD,
// plus a short <noscript> block. Netlify serves these files when they exist; everything else falls
// back to /index.html through the (non-forced) SPA rule in _redirects.
// The API may be asleep or down: then only the static routes are written and the build still passes.
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { siteConfig, productLines, SITE_URL, cityLine, inCity, productTitle } from '../src/config/site.js'
import { cldUrl, cloudinaryUrl } from '../src/utils/cloudinary.js'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const dist = join(root, 'dist')
const API = (process.env.PRERENDER_API_URL || 'https://fashionable-decor-api2.onrender.com/api').replace(/\/+$/, '')
const TIMEOUT_MS = 90_000
const ATTEMPTS = 4

const name = siteConfig.name
// Social image: https://fashionabledecor.in/og-image.jpg (1200x630). og:image:width/height come from the template.
const defaultImage = siteConfig.ogImage

// ---------- helpers ----------
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

function clip(text, max = 160) {
  const clean = String(text || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= max) return clean
  return `${clean.slice(0, max - 1).replace(/\s+\S*$/, '')}…`
}

const absolute = (url) => (!url ? defaultImage : /^https?:\/\//i.test(url) ? url : `${SITE_URL}${url.startsWith('/') ? '' : '/'}${url}`)
// (JSON-LD: photo 1200 wide. Share preview: Cloudinary crop to 1200x630, same as the runtime <Seo>.)
const imageFor = (url) => (url ? absolute(cldUrl(url, 1200)) : defaultImage)
const shareImageFor = (url) => (url ? absolute(cloudinaryUrl(url, { width: 1200, height: 630 })) : defaultImage)
const canonicalFor = (route) => `${SITE_URL}${route === '/' ? '/' : route}`

// Static routes straight from the client router (public, no params, no admin, no catch-all).
async function staticRoutes() {
  const app = await readFile(join(root, 'src', 'App.jsx'), 'utf8')
  const paths = [...app.matchAll(/path="(\/[^"]*)"/g)].map((m) => m[1])
  return [...new Set(paths)].filter((p) => !p.includes(':') && !p.includes('*') && !p.startsWith('/admin'))
}

const staticMeta = {
  '/': { title: siteConfig.defaultTitle, h1: `Custom sofa manufacturer in ${siteConfig.workLocation}`, description: siteConfig.defaultDescription },
  '/collections': {
    title: `All Products${inCity} | ${name}`,
    h1: 'Everything we make',
    description: `Sofas made by our own team${inCity}, plus recliners, beds, headboards, dining, curtains and wallpaper. Enquire with ${name} on WhatsApp.`,
  },
  '/contact-us': {
    title: `Contact Us${inCity} | ${name}`,
    h1: 'Contact us',
    description: `${name} makes custom-made sofas${inCity}. Call, WhatsApp or ask for a call back. Phone ${siteConfig.phone}.`,
  },
  '/privacy-policy': {
    title: `Privacy Policy | ${name}`,
    h1: 'Privacy Policy',
    description: `This policy explains how ${name} handles the information you share with us through this website.`,
  },
}

async function fetchJson(path) {
  let lastError
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(`${API}${path}`, { signal: AbortSignal.timeout(TIMEOUT_MS), headers: { Accept: 'application/json' } })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err) {
      lastError = err
      console.log(`[prerender] ${path} attempt ${attempt}/${ATTEMPTS} failed: ${err.message}`)
    }
  }
  throw lastError
}

async function fetchCatalogue() {
  const collections = (await fetchJson('/collections')).data || []
  const categories = (await fetchJson('/categories')).data || []
  const products = []
  for (let page = 1; ; page++) {
    const body = await fetchJson(`/products?limit=50&page=${page}`)
    products.push(...(body.data || []))
    if (page >= (body.pagination?.totalPages || 1)) break
  }
  return { collections, categories, products }
}

// ---------- page rendering ----------
const HEAD_TAGS = [
  /<title>[\s\S]*?<\/title>\s*/gi,
  /<meta\s+name="(?:description|robots|twitter:[a-z]+)"[\s\S]*?\/?>\s*/gi,
  /<meta\s+property="og:(?:title|description|url|image|type)"[\s\S]*?\/?>\s*/gi,
  /<link\s+rel="canonical"[\s\S]*?\/?>\s*/gi,
  /<script type="application\/ld\+json" id="ld-product">[\s\S]*?<\/script>\s*/gi,
]

function render(template, route, { title, description, image, type = 'website', jsonLd, h1 }) {
  const url = canonicalFor(route)
  const desc = clip(description)
  let html = template
  for (const re of HEAD_TAGS) html = html.replace(re, '')

  const head = [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(desc)}" />`,
    `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${esc(type)}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(desc)}" />`,
    `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image || defaultImage)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(desc)}" />`,
    `<meta name="twitter:image" content="${esc(image || defaultImage)}" />`,
    jsonLd
      ? `<script type="application/ld+json" id="ld-product">${JSON.stringify(jsonLd).replace(/</g, '\\u003c')}</script>`
      : '',
  ]
    .filter(Boolean)
    .join('\n    ')
  html = html.replace('</head>', `    ${head}\n  </head>`)

  const noscript = `<noscript>
      <h1>${esc(h1)}</h1>
      <p>${esc(desc)}</p>
      <p>${esc(siteConfig.shopName)}, ${esc(siteConfig.addressLine)}, ${esc(cityLine)}. <a href="${esc(siteConfig.mapUrl)}">Get directions</a></p>
      <p>Phone: <a href="tel:${esc(siteConfig.phone.replace(/\s/g, ''))}">${esc(siteConfig.phone)}</a> · <a href="https://wa.me/${esc(siteConfig.whatsappNumber)}">WhatsApp</a></p>
      <p><a href="/">Home</a> · <a href="/collections">Products</a> · <a href="/contact-us">Contact us</a></p>
    </noscript>`
  return html.replace('<div id="root"></div>', `<div id="root"></div>\n    ${noscript}`)
}

async function writePage(template, route, meta) {
  const file = route === '/' ? join(dist, 'index.html') : join(dist, ...route.split('/').filter(Boolean), 'index.html')
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, render(template, route, meta), 'utf8')
}

// ---------- main ----------
async function main() {
  const template = await readFile(join(dist, 'index.html'), 'utf8')
  let count = 0

  for (const route of await staticRoutes()) {
    const meta = staticMeta[route] || { title: `${name}${inCity}`, h1: name, description: siteConfig.defaultDescription }
    await writePage(template, route, meta)
    count++
  }

  let catalogue
  try {
    console.log(`[prerender] Fetching catalogue from ${API} (the backend may take a while to wake up)...`)
    catalogue = await fetchCatalogue()
  } catch (err) {
    console.warn(`\n[prerender] WARNING: API not reachable (${err.message}). Only static routes were prerendered.\n`)
    console.log(`[prerender] ${count} pages written.`)
    return
  }

  const { collections, categories, products } = catalogue
  const enquire = `Enquire with ${name} on WhatsApp or ask for a call back.`

  for (const c of collections) {
    const line = productLines.find((p) => p.slug === c.slug)
    await writePage(template, `/collections/${c.slug}`, {
      title: `${c.name}${inCity} | ${name}`,
      h1: c.name,
      description: `${c.description || line?.line || c.tagline || `${c.name} from ${name}.`} ${enquire}`,
      image: shareImageFor(c.bannerImage?.url),
    })
    count++
  }

  const collectionById = new Map(collections.map((c) => [String(c._id), c]))
  for (const cat of categories) {
    const col = cat.collection && collectionById.get(String(cat.collection._id))
    if (!col) continue
    await writePage(template, `/collections/${col.slug}/${cat.slug}`, {
      title: `${cat.name}${inCity} | ${name}`,
      h1: cat.name,
      description: `${cat.description || `${cat.name} from our ${col.name} range.`} ${enquire}`,
      image: shareImageFor(cat.image?.url || col.bannerImage?.url),
    })
    count++
  }

  for (const p of products) {
    if (!p.collection?.slug || !p.category?.slug || !p.slug) continue
    const route = `/collections/${p.collection.slug}/${p.category.slug}/${p.slug}`
    const description = clip(p.shortDescription || p.description || `${p.name} from our ${p.category.name} range by ${name}.`)
    const images = (p.images || []).map((img) => img?.url).filter(Boolean)
    const image = shareImageFor(images[0])
    await writePage(template, route, {
      title: productTitle(p.name, p.category.name),
      h1: p.name,
      description,
      image,
      type: 'product',
      // No offers, price or rating: the site shows none of these.
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: p.name,
        description,
        image: images.length ? images.map(imageFor) : [defaultImage],
        brand: { '@type': 'Brand', name },
        url: canonicalFor(route),
      },
    })
    count++
  }

  console.log(`[prerender] API reachable. ${count} pages written.`)
}

main().catch((err) => {
  // Never fail the build because of prerendering.
  console.warn(`[prerender] WARNING: ${err.stack || err.message}`)
  process.exit(0)
})
