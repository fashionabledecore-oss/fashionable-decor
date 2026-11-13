import ProductCard from './ProductCard'

// (CSS columns se masonry: alag height ke cards apne aap fit ho jaate hain.)
function ProductGrid({ products, columns = 3 }) {
  const cols = columns === 4 ? 'sm:columns-2 lg:columns-4' : 'sm:columns-2 lg:columns-3'
  return (
    <div className={`columns-1 gap-7 ${cols}`}>
      {products.map((p, i) => (
        <ProductCard key={p._id} product={p} index={i} />
      ))}
    </div>
  )
}

export default ProductGrid
