import { Link, useParams } from 'react-router-dom'
import { getCollection, getProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, inCity, productLines } from '../config/site'
import Seo from '../components/common/Seo'
import PageHeader from '../components/common/PageHeader'
import EmptyRange from '../components/common/EmptyRange'
import ProductGrid from '../components/products/ProductGrid'
import CategoryCards from '../components/products/CategoryCards'
import NotFound from '../components/common/NotFound'
import LoadState from '../components/common/LoadState'

const LIMIT = 12

function CollectionPage() {
  const { collectionSlug } = useParams()

  const meta = useAsync(() => getCollection(collectionSlug), `col:${collectionSlug}`)
  const list = useAsync(() => getProducts({ collection: collectionSlug, limit: LIMIT }), `colproducts:${collectionSlug}`)

  if (meta.error?.status === 404) return <NotFound message="This page does not exist." />
  // (Retry dabane par dono requests dobara, taaki doosra Retry na dabana pade.)
  const retryAll = () => {
    meta.retry()
    if (list.error) list.retry()
  }
  if (meta.loading || meta.error) return <LoadState state={{ ...meta, retry: retryAll }} fullPage />

  const collection = meta.data
  const line = productLines.find((p) => p.slug === collection.slug)
  const intro = line?.line || collection.tagline
  const products = list.data?.data ?? []
  const total = list.data?.pagination?.total ?? 0
  const categories = collection.categories
  // (Types ke photo cards: jab ek se zyada type ho, ya kisi type ki photo ho.)
  const showTypeCards = categories.length > 1 || categories.some((c) => c.image?.url)

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

        {showTypeCards && (
          <nav aria-label={`Types of ${collection.name}`} className="mt-8">
            <CategoryCards collectionSlug={collectionSlug} categories={categories} />
          </nav>
        )}

        {/* (min-h: list load hote waqt footer upar aa kar phir neeche na khiske) */}
        <div className="mt-10 min-h-[50vh]">
          {(list.loading || list.error) && <LoadState state={list} />}
          {list.data && total === 0 && <EmptyRange name={collection.name} />}
          {products.length > 0 && (
            <>
              {showTypeCards && <h2 className="mb-6 text-3xl font-semibold">Latest pieces</h2>}
              <ProductGrid products={products} columns={4} />
            </>
          )}
          {total > products.length && categories.length > 1 && (
            <p className="mt-8 text-center text-muted">Showing the latest {products.length}. Pick a type above to see more.</p>
          )}
          {total > products.length && categories.length === 1 && (
            <p className="mt-8 text-center">
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
