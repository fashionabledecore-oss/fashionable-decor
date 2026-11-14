import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import ImageBox from '../common/ImageBox'
import { doodles } from '../common/doodleMap'

// (Saare product lines barabar: Sofas sabse bada tile, baaki ek jaise tiles. Photo na ho toh clay placeholder.)
// lines: from useProductLines().
function ProductLineGrid({ lines }) {
  const [first, ...others] = lines
  if (!first) return null
  const rest = others.length - 4

  const wideClass = (i) => {
    if (i < 4) return ''
    if (rest === 1) return 'md:col-span-4'
    if (rest === 2) return 'md:col-span-2'
    return ''
  }

  return (
    <ul className="grid grid-cols-2 gap-4 md:grid-cols-4">
      <li className="col-span-2 md:row-span-2">
        <Tile line={first} big />
      </li>
      {others.map((line, i) => (
        <li key={line.slug} className={wideClass(i)}>
          <Tile line={line} />
        </li>
      ))}
    </ul>
  )
}

function Tile({ line, big = false }) {
  const Doodle = doodles[line.doodle] || doodles.chair
  // (Photo box 4:3, poori photo dikhti hai. Bada tile desktop par baaki jagah bhar leta hai, phir bhi crop nahi.)
  const box = big ? 'aspect-[4/3] md:aspect-auto md:min-h-48 md:flex-1' : 'aspect-[4/3]'
  return (
    <Link
      to={`/collections/${line.slug}`}
      className={`clay clay-${line.tone} clay-press group flex h-full flex-col gap-3 rounded-[28px] p-4 ${big ? 'sm:p-6' : ''}`}
    >
      <span className="flex items-start justify-between gap-2">
        <span className={`font-display font-semibold ${big ? 'text-3xl md:text-4xl' : 'text-xl'}`}>{line.name}</span>
        <ArrowUpRight size={big ? 24 : 20} className="mt-1 shrink-0" />
      </span>
      {line.line && <span className={`font-medium ${big ? 'max-w-sm' : 'line-clamp-2 text-sm'}`}>{line.line}</span>}

      {line.image ? (
        <ImageBox
          src={line.image}
          alt={line.name}
          width={big ? 640 : 320}
          ratio={3 / 4}
          fit="contain"
          className={`mt-auto w-full rounded-[20px] ${box}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`ph mt-auto flex w-full items-center justify-center rounded-[20px] ${box}`}
          style={{ '--ph': `var(--color-${line.tone})` }}
        >
          <Doodle size={big ? 80 : 44} strokeWidth={2} />
        </span>
      )}
    </Link>
  )
}

export default ProductLineGrid
