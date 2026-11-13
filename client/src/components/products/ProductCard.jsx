import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '../../config/site'
import { productPath, mainImage } from '../../utils/paths'
import ImageBox from '../common/ImageBox'

// (Teen alag shapes, taaki grid ek jaisa na dikhe. ratio = height / width.)
const RATIOS = [5 / 4, 1, 4 / 5]

function ProductCard({ product, index = 0 }) {
  const path = productPath(product)
  const image = mainImage(product)
  const ratio = RATIOS[index % RATIOS.length]
  const message = `Hello, I want to enquire about ${product.name}. ${window.location.origin}${path}`
  const alt = image?.alt || [product.name, product.category?.name].filter(Boolean).join(' - ')

  return (
    <article className="group break-inside-avoid pb-10">
      <Link to={path} className="block overflow-hidden rounded-[28px]" style={{ aspectRatio: `1 / ${ratio}` }}>
        <ImageBox
          src={image?.url}
          alt={alt}
          width={420}
          ratio={ratio}
          className="h-full w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
        />
      </Link>
      <div className="mt-4 px-1">
        {product.category?.name && (
          <span className="chip clay clay-butter -rotate-1 text-xs">{product.category.name}</span>
        )}
        <h3 className="mt-2.5 text-xl font-semibold">
          <Link to={path} className="underline-offset-4 hover:underline">
            {product.name}
          </Link>
        </h3>
        {product.shortDescription && <p className="mt-1 line-clamp-2 text-sm text-muted">{product.shortDescription}</p>}
        <a
          href={getWhatsAppLink(message)}
          target="_blank"
          rel="noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-terracotta underline-offset-4 hover:underline"
        >
          <MessageCircle size={16} /> Ask about this on WhatsApp
        </a>
      </div>
    </article>
  )
}

export default ProductCard
