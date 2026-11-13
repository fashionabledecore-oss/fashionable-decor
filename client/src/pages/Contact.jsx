import { useSearchParams } from 'react-router-dom'
import { Mail, MapPin, MessageCircle, Phone, Plus } from 'lucide-react'
import { siteConfig, inCity, getWhatsAppLink, phoneLink } from '../config/site'
import Seo from '../components/common/Seo'
import PageHeader from '../components/common/PageHeader'
import LeadForm from '../components/forms/LeadForm'
import { Instagram } from '../components/common/SocialIcons'

const linkClass = 'inline-flex min-h-11 items-center gap-3 font-semibold underline-offset-4 hover:underline'

function Contact() {
  const [params] = useSearchParams()

  // (?product=slug&name=Product+Name se aata hai. Slug ko sirf safe characters tak rakhte hain.)
  const rawSlug = params.get('product') || ''
  const productSlug = /^[a-z0-9-]{1,120}$/.test(rawSlug) ? rawSlug : undefined
  const productName = (params.get('name') || '').trim().slice(0, 80)
  const defaultMessage = productSlug && productName ? `I am interested in ${productName}. Please call me back with details.` : ''

  return (
    <>
      <Seo
        title={`Contact Us${inCity} | ${siteConfig.name}`}
        description={`${siteConfig.name} makes custom-made sofas${inCity}. Call, WhatsApp or ask for a call back. Phone ${siteConfig.phone}.`}
        path="/contact-us"
      />
      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <PageHeader
          crumbs={[{ label: 'Home', to: '/' }, { label: 'Contact' }]}
          title="Contact us"
          intro={`${siteConfig.name} is run by ${siteConfig.owner}. We make custom-made sofas in ${siteConfig.workLocation}, and have done so for ${siteConfig.yearsInBusiness.toLowerCase()}. Our own team builds the frame and does the stitching and finishing.`}
        />

        <div className="mt-10 grid items-start gap-10 md:grid-cols-12">
          <div className="clay clay-paper rounded-[32px] p-6 sm:p-9 md:col-span-7">
            <h2 className="text-2xl font-semibold">Request a call back</h2>
            <p className="mt-1 mb-6 text-sm text-muted">We only use your number to reply to you.</p>
            <LeadForm
              key={productSlug || 'general'}
              type={productSlug ? 'callback' : 'contact'}
              productSlug={productSlug}
              defaultMessage={defaultMessage}
            />
          </div>

          <ul className="space-y-4 text-lg md:col-span-4 md:col-start-9 md:pt-4">
            <li>
              <a href={phoneLink} className={linkClass}>
                <Phone size={20} className="text-terracotta" /> {siteConfig.phone}
              </a>
            </li>
            <li>
              <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className={linkClass}>
                <MessageCircle size={20} className="text-terracotta" /> WhatsApp us
              </a>
            </li>
            <li>
              <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" className={linkClass}>
                <Instagram size={20} className="text-terracotta" /> @{siteConfig.instagramHandle}
              </a>
            </li>
            {siteConfig.email && (
              <li>
                <a href={`mailto:${siteConfig.email}`} className={linkClass}>
                  <Mail size={20} className="text-terracotta" /> {siteConfig.email}
                </a>
              </li>
            )}
            <li className="inline-flex items-start gap-3">
              <MapPin size={20} className="mt-1 shrink-0 text-terracotta" />
              <span>{siteConfig.address || siteConfig.workLocation}</span>
            </li>
          </ul>
        </div>

        <section aria-labelledby="note-title" className="mt-16 max-w-3xl">
          <h2 id="note-title" className="text-3xl font-semibold">
            A note from {siteConfig.owner}
          </h2>
          <div className="mt-5 space-y-4 font-display text-xl leading-relaxed">
            {siteConfig.ownerNote.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          <p className="hand mt-4 text-4xl text-terracotta">{siteConfig.owner}</p>
        </section>

        <section aria-labelledby="faq-title" className="mt-16 max-w-3xl">
          <h2 id="faq-title" className="text-3xl font-semibold">
            Questions people ask us
          </h2>
          <div className="mt-6">
            {siteConfig.faqs.map((f) => (
              <details key={f.q} className="group border-b-2 border-dashed border-line py-5 first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="chip clay clay-sky h-10 w-10 shrink-0 justify-center p-0">
                    <Plus size={20} className="transition-transform duration-300 group-open:rotate-45" />
                  </span>
                </summary>
                <p className="mt-3 pr-12 text-muted">{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}

export default Contact
