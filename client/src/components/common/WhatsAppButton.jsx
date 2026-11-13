import { createPortal } from 'react-dom'
import { MessageCircle, Phone } from 'lucide-react'
import { getWhatsAppLink, phoneLink } from '../../config/site'

// (Gol floating WhatsApp button, har screen par neeche-daayein. Phone par uske upar chhota Call button.
//  document.body mein portal se render hota hai, taaki koi parent `position: fixed` ko tod na sake.
//  Contact tracking RouteEffects ke global click listener se hoti hai.)
function WhatsAppButton({ message }) {
  return createPortal(
    <div className="fixed right-4 bottom-[max(1rem,env(safe-area-inset-bottom))] z-[100] flex flex-col items-center gap-3 sm:right-6 sm:bottom-[max(1.5rem,env(safe-area-inset-bottom))]">
      <a
        href={phoneLink}
        aria-label="Call us"
        className="clay clay-coral clay-press inline-flex h-12 w-12 items-center justify-center rounded-full md:hidden"
      >
        <Phone size={20} />
      </a>
      <a
        href={getWhatsAppLink(message)}
        target="_blank"
        rel="noreferrer"
        aria-label="Chat with us on WhatsApp"
        className="clay clay-sage clay-press inline-flex h-[60px] w-[60px] items-center justify-center rounded-full"
      >
        <MessageCircle size={28} strokeWidth={2.2} />
      </a>
    </div>,
    document.body,
  )
}

export default WhatsAppButton
