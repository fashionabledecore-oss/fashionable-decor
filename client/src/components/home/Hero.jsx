import { useState } from 'react'
import { MessageCircle, PhoneCall } from 'lucide-react'
import { siteConfig, getWhatsAppLink } from '../../config/site'
import { DoodleSpark, Underlined } from '../common/Doodles'
import ImageBox from '../common/ImageBox'
import Sticker from '../common/Sticker'

// (Hero photo: client/public/images/hero.jpg, owner khud daalega. File na ho toh clay placeholder.)
function HeroPhoto() {
  const [failed, setFailed] = useState(false)

  return (
    <div className="clay clay-coral blob-a aspect-[10/9] w-full p-2.5 sm:p-3.5">
      {failed ? (
        <ImageBox tone="coral" alt={siteConfig.heroImageAlt} doodle="chair" className="blob-a h-full w-full" />
      ) : (
        <img
          src="/images/hero.jpg"
          width={800}
          height={720}
          alt={siteConfig.heroImageAlt}
          fetchPriority="high"
          decoding="async"
          onError={() => setFailed(true)}
          className="blob-a h-full w-full object-cover"
        />
      )}
    </div>
  )
}

function Hero() {
  return (
    <section className="px-4 pt-28 pb-16 sm:px-6 md:pt-40 md:pb-20">
      <div className="mx-auto grid max-w-6xl items-center gap-y-14 md:grid-cols-12 md:gap-x-10">
        <div className="md:col-span-6">
          <p className="hand -rotate-2 text-2xl text-terracotta sm:text-[1.75rem]">{siteConfig.workLocation}</p>
          <h1 className="mt-3 text-[2.6rem] leading-[1.02] font-semibold tracking-[-0.025em] sm:text-6xl lg:text-[4.4rem]">
            Custom-made sofas, built by <Underlined>our own</Underlined> team.
          </h1>
          <p className="mt-6 max-w-md text-lg text-muted">
            We build the frame and do the stitching and finishing ourselves, in {siteConfig.workLocation}. We also make
            recliners, beds, headboards and dining, and do curtains and wallpaper.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <a href={getWhatsAppLink()} target="_blank" rel="noreferrer" className="btn clay clay-sage clay-press text-base">
              <MessageCircle size={20} /> WhatsApp us
            </a>
            <a href="#call-back" className="btn clay clay-coral clay-press text-base">
              <PhoneCall size={19} /> Request a call back
            </a>
          </div>
        </div>

        <div className="relative md:col-span-6">
          <HeroPhoto />
          <Sticker tone="mustard" tilt={-3} className="absolute -top-3 left-0 sm:left-8">
            <DoodleSpark size={18} strokeWidth={2.6} /> {siteConfig.yearsInBusiness} of making sofas
          </Sticker>
        </div>
      </div>
    </section>
  )
}

export default Hero
