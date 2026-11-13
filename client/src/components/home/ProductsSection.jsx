import { useProductLines } from '../../hooks/useProductLines'
import ProductLineGrid from '../products/ProductLineGrid'

// (Home: saare 7 product lines. Ek kaam: visitor apna product chune.)
function ProductsSection() {
  const { lines } = useProductLines()

  return (
    <section aria-labelledby="products-title" className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 md:pt-24">
      <h2 id="products-title" className="text-4xl font-semibold md:text-5xl">
        Our products
      </h2>
      <p className="mt-3 max-w-xl text-muted">Custom-made sofas first, made by our own team. Tap a product to see photos and ask about it.</p>
      <div className="mt-8">
        <ProductLineGrid lines={lines} />
      </div>
    </section>
  )
}

export default ProductsSection
