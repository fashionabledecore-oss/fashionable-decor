import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { getCollection, getProducts } from '../services/api'
import { useAsync } from '../hooks/useAsync'
import { siteConfig, inCity } from '../config/site'
import EmptyRange from '../components/common/EmptyRange'
import NotFound from '../components/common/NotFound'
import LoadState from '../components/common/LoadState'
import ImageBox from '../components/common/ImageBox'
import ProductGrid from '../components/products/ProductGrid'
import Seo from '../components/common/Seo'
import PageHeader from '../components/common/PageHeader'

const PAGE_SIZE = 24

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

  const meta = useAsync(() => getCollection(collectionSlug), `col:${collectionSlug}`)

  if (meta.error?.status === 404) return <NotFound message="This category does not exist." />
  if (meta.loading || meta.error) return <LoadState state={meta} fullPage />

  const collection = meta.data
  const category = collection.categories.find((c) => c.slug === categorySlug)
  if (!category) return <NotFound message="This category does not exist." />

  const changeSort = (value) => {
    const next = new URLSearchParams(searchParams)
    if (value === 'newest') next.delete('sort')
    else next.set('sort', value)
    next.delete('page')
    setSearchParams(next)
  }

  return (
    <>
      <Seo
        title={`${category.name}${inCity} | ${siteConfig.name}`}
        description={`${category.description || `${category.name} from our ${collection.name} range.`} Enquire with ${siteConfig.name} on WhatsApp or ask for a call back.`}
        path={`/collections/${collectionSlug}/${categorySlug}`}
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

        {/* (key: sort ya category badle toh list shuru se) */}
        <ProductList
          key={`${collectionSlug}:${categorySlug}:${sort}`}
          collectionSlug={collectionSlug}
          category={category}
          sort={sort}
          onSort={changeSort}
        />
      </div>
    </>
  )
}

// (Pehle 24 products; "Load more" agle 24 neeche jodta hai.)
function ProductList({ collectionSlug, category, sort, onSort }) {
  const first = useAsync(
    () => getProducts({ collection: collectionSlug, category: category.slug, sort, page: 1, limit: PAGE_SIZE }),
    `products:${collectionSlug}:${category.slug}:${sort}`,
  )
  const [more, setMore] = useState({ items: [], page: 1, loading: false, error: '' })

  const total = first.data?.pagination?.total ?? 0
  const products = [...(first.data?.data ?? []), ...more.items]
  const remaining = total - products.length

  const loadMore = async () => {
    if (more.loading) return
    const page = more.page + 1
    setMore((m) => ({ ...m, loading: true, error: '' }))
    try {
      const res = await getProducts({ collection: collectionSlug, category: category.slug, sort, page, limit: PAGE_SIZE })
      setMore((m) => ({ items: [...m.items, ...res.data], page, loading: false, error: '' }))
    } catch (err) {
      setMore((m) => ({ ...m, loading: false, error: err.message || 'Could not load more.' }))
    }
  }

  return (
    <>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted" aria-live="polite">
          {first.data ? `${total} ${total === 1 ? 'piece' : 'pieces'}` : ' '}
        </p>
        <label className="flex items-center gap-2 text-sm font-semibold text-muted">
          Sort by
          <select value={sort} onChange={(e) => onSort(e.target.value)} className="clay-well w-auto py-2 pr-8 text-ink">
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* (min-h: list load hote waqt footer upar aa kar phir neeche na khiske) */}
      <div className="mt-8 min-h-[60vh]">
        {(first.loading || first.error) && <LoadState state={first} />}

        {first.data && total === 0 && (
          <>
            {category.image?.url && (
              <ImageBox
                src={category.image.url}
                alt={category.name}
                width={560}
                ratio={3 / 4}
                fit="contain"
                className="mx-auto aspect-[4/3] w-full max-w-md rounded-[28px]"
              />
            )}
            <EmptyRange name={category.name} />
          </>
        )}

        {products.length > 0 && <ProductGrid products={products} compact />}

        {first.data && remaining > 0 && (
          <div className="mt-10 text-center">
            <button type="button" onClick={loadMore} disabled={more.loading} className="btn clay clay-coral clay-press">
              {more.loading && <Loader2 size={18} className="animate-spin" />}
              {more.loading ? 'Loading...' : `Load more (${remaining} more)`}
            </button>
            {more.error && (
              <p className="mt-3 text-sm text-danger" role="alert">
                {more.error} Please tap Load more again.
              </p>
            )}
          </div>
        )}
      </div>
    </>
  )
}

export default CategoryPage
