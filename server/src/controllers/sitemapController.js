import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import Product from '../models/Product.js'

const STATIC_PAGES = [
  { path: '/', priority: '1.0', changefreq: 'weekly' },
  { path: '/collections', priority: '0.9', changefreq: 'weekly' },
  { path: '/contact-us', priority: '0.6', changefreq: 'monthly' },
  { path: '/privacy-policy', priority: '0.2', changefreq: 'yearly' },
]

const escapeXml = (text) =>
  String(text).replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[c])

const day = (date) => (date ? new Date(date).toISOString().slice(0, 10) : undefined)

function urlEntry(base, { path, lastmod, changefreq, priority }) {
  return [
    '  <url>',
    `    <loc>${escapeXml(base + path)}</loc>`,
    lastmod ? `    <lastmod>${lastmod}</lastmod>` : '',
    changefreq ? `    <changefreq>${changefreq}</changefreq>` : '',
    priority ? `    <priority>${priority}</priority>` : '',
    '  </url>',
  ]
    .filter(Boolean)
    .join('\n')
}

// GET /api/sitemap.xml (sirf active collections, categories aur products)
export async function getSitemap(req, res) {
  // (Site ka address: CLIENT_URL ka pehla domain.)
  const base = (process.env.CLIENT_URL || `${req.protocol}://${req.get('host')}`)
    .split(',')[0]
    .trim()
    .replace(/\/+$/, '')

  const collections = await ProductCollection.find({ isActive: true }).select('slug updatedAt').lean()
  const collectionById = new Map(collections.map((c) => [String(c._id), c]))

  const categories = await Category.find({ isActive: true, collectionId: { $in: collections.map((c) => c._id) } })
    .select('slug collectionId updatedAt')
    .lean()
  const categoryById = new Map(categories.map((c) => [String(c._id), c]))

  const products = await Product.find({ isActive: true, categoryId: { $in: categories.map((c) => c._id) } })
    .select('slug categoryId updatedAt')
    .lean()

  const entries = [
    ...STATIC_PAGES,
    ...collections.map((c) => ({
      path: `/collections/${c.slug}`,
      lastmod: day(c.updatedAt),
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...categories.map((c) => ({
      path: `/collections/${collectionById.get(String(c.collectionId)).slug}/${c.slug}`,
      lastmod: day(c.updatedAt),
      changefreq: 'weekly',
      priority: '0.8',
    })),
    ...products.map((p) => {
      const category = categoryById.get(String(p.categoryId))
      const collection = collectionById.get(String(category.collectionId))
      return {
        path: `/collections/${collection.slug}/${category.slug}/${p.slug}`,
        lastmod: day(p.updatedAt),
        changefreq: 'monthly',
        priority: '0.7',
      }
    }),
  ]

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...entries.map((e) => urlEntry(base, e)),
    '</urlset>',
  ].join('\n')

  res.set('Content-Type', 'application/xml; charset=utf-8')
  res.set('Cache-Control', 'public, max-age=3600')
  res.send(xml)
}
