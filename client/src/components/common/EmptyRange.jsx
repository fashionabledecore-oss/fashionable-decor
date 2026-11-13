import { MessageCircle, Phone } from 'lucide-react'
import { getWhatsAppLink, phoneLink } from '../../config/site'
import { DoodleCamera } from './Doodles'

// (Collection ya category mein abhi photos nahi hain: dosti bhara message + WhatsApp aur Call.)
function EmptyRange({ name }) {
  return (
    <div className="mx-auto max-w-lg py-10 text-center">
      <span className="clay clay-butter blob-b mx-auto inline-flex h-24 w-24 items-center justify-center">
        <DoodleCamera size={52} />
      </span>
      <p className="mt-6 font-display text-2xl font-semibold">We are adding photos here.</p>
      <p className="mt-2 text-muted">Message us on WhatsApp to see this range.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <a
          href={getWhatsAppLink(`Hello, I want to see your ${name} range.`)}
          target="_blank"
          rel="noreferrer"
          className="btn clay clay-sage clay-press"
        >
          <MessageCircle size={18} /> WhatsApp us
        </a>
        <a href={phoneLink} className="btn clay clay-paper clay-press">
          <Phone size={18} /> Call us
        </a>
      </div>
    </div>
  )
}

export default EmptyRange
