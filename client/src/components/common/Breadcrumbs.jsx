import { Link } from 'react-router-dom'
import { breadcrumbSchema, useJsonLd } from '../../utils/seo'

function Breadcrumbs({ items }) {
  useJsonLd('breadcrumbs', breadcrumbSchema(items))

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-muted">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-2">
            {item.to ? (
              <Link to={item.to} className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
                {item.label}
              </Link>
            ) : (
              <span className="font-medium text-ink" aria-current="page">
                {item.label}
              </span>
            )}
            {i < items.length - 1 && <span aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
