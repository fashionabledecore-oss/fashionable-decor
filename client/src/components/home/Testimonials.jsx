import { ExternalLink } from 'lucide-react'
import { siteConfig } from '../../config/site'
import { getReviews } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import { toneAt } from '../../utils/tones'

const MIN_REVIEWS = 3
const sourceLabels = { google: 'on Google', instagram: 'on Instagram', whatsapp: 'on WhatsApp', other: '' }

// (Reviews admin panel se, sirf asli customers ke. 3 se kam active hon toh section dikhta hi nahi.)
function Testimonials() {
  const { data } = useAsync(getReviews, 'reviews')
  const reviews = data ?? []
  if (reviews.length < MIN_REVIEWS) return null

  return (
    <section aria-labelledby="reviews-title" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
      <h2 id="reviews-title" className="text-4xl font-semibold md:text-5xl">
        What customers told us
      </h2>
      <ul className="mt-10 grid gap-6 md:grid-cols-3">
        {reviews.map((r, i) => (
          <li key={r._id}>
            <figure className="h-full rounded-[28px] bg-white p-6">
              <blockquote className="text-lg whitespace-pre-line">{r.text}</blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className={`clay clay-${toneAt(i)} blob-b inline-flex h-10 w-10 shrink-0 items-center justify-center font-bold`}>
                  {r.customerName.charAt(0)}
                </span>
                <span>
                  <span className="block font-semibold">{r.customerName}</span>
                  <span className="text-sm text-muted">
                    {[r.area, sourceLabels[r.source]].filter(Boolean).join(', ')}
                  </span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
      {siteConfig.googleReviewsUrl && (
        <a
          href={siteConfig.googleReviewsUrl}
          target="_blank"
          rel="noreferrer"
          className="btn clay clay-paper clay-press mt-10"
        >
          See our Google reviews <ExternalLink size={16} />
        </a>
      )}
    </section>
  )
}

export default Testimonials
