import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { ChevronDown, MessageCircle, Phone, Ruler } from 'lucide-react'
import { getProduct } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, inCity, getWhatsAppLink, phoneLink, SITE_URL, productLines } from '../config/site'
import { absoluteUrl, clip, useJsonLd } from '../utils/seo'
import { cloudinaryUrl } from '../utils/cloudinary'
import { productPath } from '../utils/paths'
import { trackEvent } from '../utils/tracking'
import Breadcrumbs from '../components/common/Breadcrumbs'
import ImageBox from '../components/common/ImageBox'
import PhotoFrame from '../components/common/PhotoFrame'
import Seo from '../components/common/Seo'
import NotFound from '../components/common/NotFound'
import LoadState from '../components/common/LoadState'
import WhatsAppButton from '../components/common/WhatsAppButton'
import LeadForm from '../components/forms/LeadForm'
import ProductGrid from '../components/products/ProductGrid'
import { interestForProduct } from '../utils/interests'

const TAG_TONES = ['clay-sky', 'clay-butter', 'clay-sage', 'clay-mustard']

function ProductDetail({ product }) {
  const [activeIndex, setActiveIndex] = useState(0)

  const { collection, category } = product
  const images = product.images ?? []
  const activeImage = images[activeIndex]
  const related = product.related ?? []

  const dims = product.dimensions ?? {}
  const hasDimensions = [dims.width, dims.depth, dims.height].some((v) => typeof v === 'number')
  const dimText = [dims.width, dims.depth, dims.height].map((v) => (typeof v === 'number' ? v : '-')).join(' x ')

  // (Specs clay tags ki tarah dikhte hain: "label: value".)
  const tags = [
    hasDimensions && { label: 'Size (W x D x H)', value: `${dimText} ${dims.unit || ''}`.trim() },
    product.materials && { label: 'Materials', value: product.materials },
    ...(product.specifications ?? []).map((s) => ({ label: s.label, value: s.value })),
  ].filter(Boolean)

  const whatsappMessage = `Hello, I want to enquire about ${product.name}. ${window.location.href}`

  const path = productPath(product)
  const description = clip(
    product.shortDescription ||
      product.description ||
      `${product.name} from our ${category.name} range by ${siteConfig.name}.`,
  )

  // (Price, offers ya rating nahi bhejte, kyunki site par ye hain hi nahi.)
  useJsonLd('product', {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description,
    url: absoluteUrl(path),
    image: images.map((img) => absoluteUrl(cloudinaryUrl(img.url, { width: 1200 }))),
    category: `${collection.name} > ${category.name}`,
    brand: { '@type': 'Brand', name: siteConfig.name },
    manufacturer: { '@id': `${SITE_URL}/#business` },
    ...(product.materials && { material: product.materials }),
    ...(product.colours?.length && { color: product.colours.join(', ') }),
  })

  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: product.name,
      content_category: category.name,
      content_ids: [product.slug],
      content_type: 'product',
    })
  }, [product.slug, product.name, category.name])

  return (
    <>
      <Seo
        title={`${product.name} | ${category.name}${inCity} | ${siteConfig.name}`}
        description={description}
        path={path}
        image={images[0]?.url}
        type="product"
      />
      <div className="mx-auto max-w-6xl px-4 pt-32 pb-24 sm:px-6 md:pt-40">
        <Breadcrumbs
          items={[
            { label: 'Home', to: '/' },
            { label: collection.name, to: `/collections/${collection.slug}` },
            { label: category.name, to: `/collections/${collection.slug}/${category.slug}` },
            { label: product.name },
          ]}
        />

        <div className="mt-8 grid gap-x-12 gap-y-10 md:grid-cols-12">
          {/* Gallery */}
          <div className="md:col-span-7 md:col-start-1 md:row-start-1">
            <PhotoFrame
              tone="coral"
              src={activeImage?.url}
              alt={activeImage?.alt || `${product.name} - ${category.name} by ${siteConfig.name}`}
              width={720}
              ratio={3 / 4}
              aspect={3 / 4}
              fit="contain"
              priority
              className="w-full"
            />
            {images.length > 1 && (
              <ul className="mt-6 flex flex-wrap gap-3" aria-label="More photos">
                {images.map((img, i) => (
                  <li key={img.url}>
                    <button
                      type="button"
                      onClick={() => setActiveIndex(i)}
                      aria-label={`Show photo ${i + 1}`}
                      aria-pressed={i === activeIndex}
                      className={`clay block rounded-[18px] p-1.5 ${i === activeIndex ? 'clay-mustard clay-pressed' : 'clay-paper clay-press'}`}
                    >
                      <ImageBox
                        src={img.url}
                        alt={img.alt || `${product.name} - photo ${i + 1}`}
                        className="h-15 w-20 rounded-[12px]"
                        width={80}
                        ratio={3 / 4}
                        fit="contain"
                      />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Sticky enquiry card */}
          <aside className="md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1">
            <div className="md:sticky md:top-28">
              <span className="chip clay clay-sky text-sm">{category.name}</span>
              <h1 className="mt-4 text-4xl leading-[1.05] font-semibold md:text-5xl">{product.name}</h1>
              {product.shortDescription && <p className="mt-3 text-lg text-muted">{product.shortDescription}</p>}
              {product.customizable && (
                <p className="mt-4 inline-flex items-center gap-2 font-semibold text-terracotta">
                  <Ruler size={18} /> Ask us about size and fabric
                </p>
              )}

              <div className="clay clay-paper mt-7 rounded-[32px] p-5 sm:p-6">
                <p className="font-display text-xl font-semibold">Like this one?</p>
                <p className="mt-1 text-sm text-muted">Ask us for the price, sizes and colours. We are happy to help.</p>
                <div className="mt-5 grid gap-3 lg:grid-cols-2">
                  <a
                    href={getWhatsAppLink(whatsappMessage)}
                    target="_blank"
                    rel="noreferrer"
                    className="btn clay clay-sage clay-press"
                  >
                    <MessageCircle size={18} /> WhatsApp us
                  </a>
                  {/* Phone par Call neeche wali bar mein hai. */}
                  <a href={phoneLink} className="btn clay clay-butter clay-press hidden md:inline-flex">
                    <Phone size={18} /> Call us
                  </a>
                </div>
                <p className="mt-3 text-sm text-muted">
                  Not sure about the size? Send us a photo of your room on WhatsApp.
                </p>
                <details className="group mt-4">
                  <summary className="btn clay clay-coral clay-press w-full list-none [&::-webkit-details-marker]:hidden">
                    Request a call back
                    <ChevronDown size={18} className="transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="mt-5">
                    <LeadForm
                      type="callback"
                      productSlug={product.slug}
                      defaultInterest={interestForProduct(category.slug, collection.slug, productLines)}
                      defaultMessage={`I am interested in ${product.name}. Please call me back with details.`}
                    />
                  </div>
                </details>
              </div>
            </div>
          </aside>

          {/* Details */}
          <div className="md:col-span-7 md:col-start-1 md:row-start-2">
            <h2 className="text-3xl font-semibold">The details</h2>
            {tags.length > 0 ? (
              <ul className="mt-5 flex flex-wrap gap-3">
                {tags.map((t, i) => (
                  <li key={t.label} className={`chip clay ${TAG_TONES[i % TAG_TONES.length]} px-4 py-2 text-sm`}>
                    <span className="font-medium">{t.label}:</span> {t.value}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-muted">Message us for the full details.</p>
            )}

            {(product.colours ?? []).length > 0 && (
              <>
                <h3 className="mt-8 text-xl font-semibold">Colours</h3>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.colours.map((c) => (
                    <li key={c} className="chip border-2 border-line bg-white">
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-sm text-muted">Ask us if you want a colour that is not listed.</p>
              </>
            )}

            {product.description && (
              <p className="mt-8 max-w-prose whitespace-pre-line text-muted">{product.description}</p>
            )}
          </div>
        </div>

        {related.length > 0 && (
          <section aria-labelledby="related-title" className="mt-24">
            <p className="hand text-2xl text-terracotta">while you are here</p>
            <h2 id="related-title" className="mt-1 mb-10 text-4xl font-semibold">
              You might also like
            </h2>
            <ProductGrid products={related} columns={4} />
          </section>
        )}
      </div>
    </>
  )
}

function ProductPage() {
  const { collectionSlug, categorySlug, productSlug } = useParams()
  const state = useAsync(() => getProduct(productSlug), `product:${productSlug}`)
  const { data: product, loading, error } = state

  // (MainLayout product page par floating button nahi dikhata; yahan product ke naam ke saath dikhta hai.)
  const valid =
    product && product.collection?.slug === collectionSlug && product.category?.slug === categorySlug
  const message = valid ? `Hello, I want to enquire about ${product.name}. ${window.location.href}` : undefined

  let content
  if (loading) content = <LoadState state={state} fullPage />
  else if (error?.status === 404 || (!error && !valid)) content = <NotFound message="This product does not exist." />
  else if (error) content = <LoadState state={state} fullPage />
  else content = <ProductDetail key={product.slug} product={product} />

  return (
    <>
      {content}
      <WhatsAppButton message={message} />
    </>
  )
}

export default ProductPage
