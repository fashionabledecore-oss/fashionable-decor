import { Link } from 'react-router-dom'
import { MessageCircle } from 'lucide-react'
import { getWhatsAppLink } from '../../config/site'
import { productPath, mainImage } from '../../utils/paths'
import ImageBox from '../common/ImageBox'

// (Har card ka photo box 4:3 hai. Photo kisi bhi size/shape ki ho, poori dikhti hai (object-contain), crop nahi.)
// compact: sirf photo + chhota naam (category grid, recent work), taaki bahut saara kaam ek saath dikhe.
function ProductCard({ product, compact = false }) {
  const path = productPath(product)
  const image = mainImage(product)
  const alt = image?.alt || [product.name, product.category?.name].filter(Boolean).join(' - ')

  if (compact) {
    return (
      <article className="group">
        <Link to={path} className="block rounded-[20px]">
          <ImageBox
            src={image?.url}
            alt={alt}
            width={360}
            ratio={3 / 4}
            fit="contain"
            className="aspect-[4/3] w-full rounded-[20px] transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
          />
          <h3 className="mt-2 line-clamp-2 px-1 text-sm font-semibold underline-offset-4 group-hover:underline">{product.name}</h3>
        </Link>
      </article>
    )
  }

  const message = `Hello, I want to enquire about ${product.name}. ${window.location.origin}${path}`
  return (
    <article className="group flex flex-col">
      <Link to={path} className="block overflow-hidden rounded-[28px]">
        <ImageBox
          src={image?.url}
          alt={alt}
          width={480}
          ratio={3 / 4}
          fit="contain"
          className="aspect-[4/3] w-full rounded-[28px] transition-transform duration-500 motion-safe:group-hover:scale-[1.02]"
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
          className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-bold text-terracotta underline-offset-4 hover:underline"
        >
          <MessageCircle size={16} /> Ask about this on WhatsApp
        </a>
      </div>
    </article>
  )
}

export default ProductCard
