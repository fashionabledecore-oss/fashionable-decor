import ProductCard from './ProductCard'

// (Saare cards ka photo box ek jaisa (4:3), isliye seedha grid: rows barabar, order baayen se daayen.)
function ProductGrid({ products, columns = 3 }) {
  const cols = columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
  return (
    <div className={`grid grid-cols-1 gap-x-7 gap-y-10 ${cols}`}>
      {products.map((p) => (
        <ProductCard key={p._id} product={p} />
      ))}
    </div>
  )
}

export default ProductGrid
