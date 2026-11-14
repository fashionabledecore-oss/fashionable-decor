import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getProducts } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import ProductGrid from '../products/ProductGrid'

const SHOW = 8
const MIN = 4

// (Home: sabse naye 8 products. 4 se kam hon (ya load na ho) toh section hi nahi dikhta.)
function RecentWork() {
  const { data } = useAsync(() => getProducts({ limit: SHOW, sort: 'newest' }), 'home-recent-work')
  const products = data?.data ?? []
  if (products.length < MIN) return null

  return (
    <section aria-labelledby="recent-title" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="recent-title" className="text-4xl font-semibold md:text-5xl">
          Our recent work
        </h2>
        <Link to="/collections" className="btn clay clay-paper clay-press">
          See all products <ArrowRight size={18} />
        </Link>
      </div>
      <div className="mt-8">
        <ProductGrid products={products} compact />
      </div>
    </section>
  )
}

export default RecentWork
