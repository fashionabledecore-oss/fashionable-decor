import { Link, useParams } from 'react-router-dom'
import { getCollection, getProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, inCity, productLines } from '../config/site'
import Seo from '../components/common/Seo'
import PageHeader from '../components/common/PageHeader'
import EmptyRange from '../components/common/EmptyRange'
import ProductGrid from '../components/products/ProductGrid'
import NotFound from '../components/common/NotFound'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'

const LIMIT = 12

function CollectionPage() {
  const { collectionSlug } = useParams()

  const meta = useAsync(() => getCollection(collectionSlug), `col:${collectionSlug}`)
  const list = useAsync(() => getProducts({ collection: collectionSlug, limit: LIMIT }), `colproducts:${collectionSlug}`)

  if (meta.loading) return <Loader fullPage />
  if (meta.error?.status === 404) return <NotFound message="This page does not exist." />
  if (meta.error) return <ErrorState fullPage message={meta.error.message} />

  const collection = meta.data
  const line = productLines.find((p) => p.slug === collection.slug)
  const intro = line?.line || collection.tagline
  const products = list.data?.data ?? []
  const total = list.data?.pagination?.total ?? 0
  const categories = collection.categories

  return (
    <>
      <Seo
        title={`${collection.name}${inCity} | ${siteConfig.name}`}
        description={`${collection.description || intro || `${collection.name} from ${siteConfig.name}.`} Enquire with ${siteConfig.name} on WhatsApp or ask for a call back.`}
        image={collection.bannerImage?.url}
      />
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <PageHeader
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/collections' },
            { label: collection.name },
          ]}
          kicker={collection.slug === 'sofas' ? 'made by our own team' : undefined}
          title={collection.name}
          intro={intro}
        />

        {categories.length > 1 && (
          <nav aria-label={`Types of ${collection.name}`} className="mt-8">
            <ul className="flex flex-wrap gap-2.5">
              {categories.map((c) => (
                <li key={c.slug}>
                  <Link to={`/collections/${collectionSlug}/${c.slug}`} className="chip clay clay-paper clay-press min-h-11 px-4">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="mt-10">
          {list.loading && <Loader />}
          {list.error && <ErrorState message={list.error.message} />}
          {list.data && total === 0 && <EmptyRange name={collection.name} />}
          {products.length > 0 && <ProductGrid products={products} columns={4} />}
          {total > products.length && categories.length > 1 && (
            <p className="text-center text-muted">Showing the latest {products.length}. Pick a type above to see more.</p>
          )}
          {total > products.length && categories.length === 1 && (
            <p className="text-center">
              <Link to={`/collections/${collectionSlug}/${categories[0].slug}`} className="btn clay clay-paper clay-press">
                See all {total}
              </Link>
            </p>
          )}
        </div>
      </div>
    </>
  )
}

export default CollectionPage
