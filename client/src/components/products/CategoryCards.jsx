import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ImageBox from '../common/ImageBox'
import { toneAt } from '../../utils/tones'

// (Collection page: har type (category) ka card, admin ki category photo ke saath. Photo poori dikhti hai, 4:3 box.)
function CategoryCards({ collectionSlug, categories }) {
  return (
    <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {categories.map((c, i) => (
        <li key={c._id || c.slug}>
          <Link
            to={`/collections/${collectionSlug}/${c.slug}`}
            className={`clay clay-${toneAt(i)} clay-press flex h-full flex-col gap-3 rounded-[24px] p-3 sm:p-4`}
          >
            <ImageBox
              src={c.image?.url}
              alt={c.name}
              width={320}
              ratio={3 / 4}
              fit="contain"
              tone={toneAt(i)}
              className="aspect-[4/3] w-full rounded-[16px]"
            />
            <span className="flex items-start justify-between gap-2 font-display text-lg leading-tight font-semibold">
              {c.name}
              <ArrowUpRight size={18} className="mt-0.5 shrink-0" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

export default CategoryCards
