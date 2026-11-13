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
          width={big ? 600 : 300}
          ratio={big ? 0.66 : 0.75}
          className={`mt-auto w-full rounded-[20px] ${big ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
        />
      ) : (
        <span
          aria-hidden="true"
          className={`ph mt-auto flex w-full items-center justify-center rounded-[20px] ${big ? 'aspect-[3/2]' : 'aspect-[4/3]'}`}
          style={{ '--ph': `var(--color-${line.tone})` }}
        >
          <Doodle size={big ? 80 : 44} strokeWidth={2} />
        </span>
      )}
    </Link>
  )
}

export default ProductLineGrid
