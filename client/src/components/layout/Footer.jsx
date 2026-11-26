import { Link } from 'react-router-dom'
import { siteConfig, phoneLink, cityLine, getWhatsAppLink } from '../../config/site'

function Footer() {
  return (
    // (pr: footer ka text daayein floating WhatsApp/Call buttons ke neeche na aaye.)
    <footer className="bg-mint px-4 pt-12 pb-16 sm:px-6 md:pb-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 pr-20 md:flex-row md:items-end md:justify-between md:pr-24">
        <div>
          <p className="font-display text-2xl font-semibold">{siteConfig.name}</p>
          <p className="mt-1 text-muted">Custom-made sofas, {siteConfig.workLocation}</p>
          <address className="mt-3 text-sm text-muted not-italic">
            {siteConfig.shopName}
            <br />
            {siteConfig.addressLine}
            <br />
            {cityLine}
            <br />
            <a
              href={siteConfig.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center font-semibold text-ink underline-offset-4 hover:underline"
            >
              Get directions
            </a>
          </address>
          <p className="mt-1 flex flex-wrap gap-x-6 font-semibold">
            <a href={phoneLink} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
              {siteConfig.phone}
            </a>
            <a
              href={getWhatsAppLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            >
              WhatsApp
            </a>
            <a
              href={siteConfig.instagramUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-11 items-center underline-offset-4 hover:underline"
            >
              Instagram @{siteConfig.instagramHandle}
            </a>
          </p>
        </div>
        <p className="flex flex-wrap items-center gap-x-5 text-sm text-muted">
          <span>
            © {new Date().getFullYear()} {siteConfig.name}
          </span>
          <Link to="/privacy-policy" className="inline-flex min-h-11 items-center underline-offset-4 hover:text-ink hover:underline">
            Privacy Policy
          </Link>
        </p>
      </div>
    </footer>
  )
}

export default Footer
