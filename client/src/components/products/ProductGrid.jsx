import ProductCard from './ProductCard'

// (Saare cards ka photo box ek jaisa (4:3), isliye seedha grid: rows barabar, order baayen se daayen.)
// compact: phone par bhi 2 photos ek line mein.
function ProductGrid({ products, columns = 3, compact = false }) {
  const cols = compact
    ? 'grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4'
    : `grid-cols-1 gap-x-7 gap-y-10 sm:grid-cols-2 ${columns === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3'}`
  return (
    <div className={`grid ${cols}`} data-testid="product-grid">
      {products.map((p) => (
        <ProductCard key={p._id} product={p} compact={compact} />
      ))}
    </div>
  )
}

export default ProductGrid
