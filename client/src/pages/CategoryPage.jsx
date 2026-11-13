import { Link, useParams, useSearchParams } from 'react-router-dom'
import { getCollection, getProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, inCity } from '../config/site'
import EmptyRange from '../components/common/EmptyRange'
import NotFound from '../components/common/NotFound'
import Loader from '../components/common/Loader'
import ErrorState from '../components/common/ErrorState'
import ProductGrid from '../components/products/ProductGrid'
import Seo from '../components/common/Seo'
import PageHeader from '../components/common/PageHeader'

const PAGE_SIZE = 12

const sortOptions = [
  { value: 'newest', label: 'Newest first' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
]

function CategoryPage() {
  const { collectionSlug, categorySlug } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()

  const rawSort = searchParams.get('sort')
  const sort = sortOptions.some((o) => o.value === rawSort) ? rawSort : 'newest'
  const page = Math.max(1, Number(searchParams.get('page')) || 1)

  const meta = useAsync(() => getCollection(collectionSlug), `col:${collectionSlug}`)
  const list = useAsync(
    () => getProducts({ collection: collectionSlug, category: categorySlug, sort, page, limit: PAGE_SIZE }),
    `products:${collectionSlug}:${categorySlug}:${sort}:${page}`,
  )

  const updateParams = (changes) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(changes).forEach(([key, value]) => {
      if (value) next.set(key, value)
      else next.delete(key)
    })
    setSearchParams(next)
  }

  if (meta.loading) return <Loader fullPage />
  if (meta.error?.status === 404) return <NotFound message="This category does not exist." />
  if (meta.error) return <ErrorState fullPage message={meta.error.message} />

  const collection = meta.data
  const category = collection.categories.find((c) => c.slug === categorySlug)
  if (!category) return <NotFound message="This category does not exist." />

  const products = list.data?.data ?? []
  const pagination = list.data?.pagination
  const total = pagination?.total ?? 0
  const totalPages = pagination?.totalPages ?? 1

  return (
    <>
      <Seo
        title={`${category.name}${inCity}${page > 1 ? ` - Page ${page}` : ''} | ${siteConfig.name}`}
        description={`${category.description || `${category.name} from our ${collection.name} range.`} Enquire with ${siteConfig.name} on WhatsApp or ask for a call back.`}
        path={`/collections/${collectionSlug}/${categorySlug}${page > 1 ? `?page=${page}` : ''}`}
        image={category.image?.url || collection.bannerImage?.url}
      />
      <div className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
        <PageHeader
          crumbs={[
            { label: 'Home', to: '/' },
            { label: 'Products', to: '/collections' },
            { label: collection.name, to: `/collections/${collectionSlug}` },
            { label: category.name },
          ]}
          title={category.name}
          intro={category.description}
        />

        {/* Same collection ki baaki categories, chips mein (sirf jab ek se zyada hon) */}
        <nav
          aria-label={`${collection.name} categories`}
          className={`-mx-4 mt-10 overflow-x-auto px-4 pb-3 sm:mx-0 sm:px-0 ${collection.categories.length > 1 ? '' : 'hidden'}`}
        >
          <ul className="flex gap-2.5 sm:flex-wrap">
            {collection.categories.map((c) => {
              const active = c.slug === categorySlug
              return (
                <li key={c.slug} className="shrink-0">
                  <Link
                    to={`/collections/${collectionSlug}/${c.slug}`}
                    aria-current={active ? 'page' : undefined}
                    className={`chip clay min-h-10 px-4 text-sm ${active ? 'clay-mustard clay-pressed' : 'clay-paper clay-press'}`}
                  >
                    {c.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-muted" aria-live="polite">
            {list.data ? `${total} ${total === 1 ? 'piece' : 'pieces'}` : ' '}
          </p>
          <label className="flex items-center gap-2 text-sm font-semibold text-muted">
            Sort by
            <select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value === 'newest' ? '' : e.target.value, page: '' })}
              className="clay-well w-auto py-2 pr-8 text-ink"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-8">
          {list.loading && <Loader />}
          {list.error && <ErrorState message={list.error.message} />}

          {list.data && total === 0 && <EmptyRange name={category.name} />}

          {list.data && total > 0 && products.length === 0 && (
            <div className="py-10 text-center">
              <p className="text-muted">There is nothing on this page.</p>
              <button type="button" onClick={() => updateParams({ page: '' })} className="btn clay clay-coral clay-press mt-4">
                Go to the first page
              </button>
            </div>
          )}

          {products.length > 0 && <ProductGrid products={products} />}
        </div>

        {totalPages > 1 && (
          <nav aria-label="Pagination" className="mt-6 flex flex-wrap justify-center gap-2.5">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => updateParams({ page: n === 1 ? '' : String(n) })}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`Page ${n}`}
                className={`clay inline-flex h-11 w-11 items-center justify-center rounded-full font-semibold ${
                  n === page ? 'clay-coral clay-pressed' : 'clay-paper clay-press'
                }`}
              >
                {n}
              </button>
            ))}
          </nav>
        )}
      </div>
    </>
  )
}

export default CategoryPage
