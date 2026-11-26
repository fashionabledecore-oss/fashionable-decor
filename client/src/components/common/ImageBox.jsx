import { useState } from 'react'
import { cldUrl, cldSrcSet } from '../../utils/cloudinary'
import { toneFor } from '../../utils/tones'
import { doodles } from './doodleMap'

const placeholderDoodles = ['chair', 'lamp', 'plant']
const CARD_SIZES = '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'

// (ratio = height / width. width/height attributes se browser pehle hi jagah rakh leta hai, layout nahi khiskta.)
// (Photo na ho toh halka clay rang + chhota doodle. Kabhi stock photo nahi.)
// fit 'cover': box bhar do (crop ho sakta hai). fit 'contain': poori photo, kabhi crop/stretch nahi,
//   halke clay background par beech mein. Box ka size className deta hai (jaise aspect-[4/3] w-full).
// (width: cards 600, detail 1200, thumbnails 200. width >= 400 par 400w/800w/1200w srcSet + sizes.)
// (Load hote waqt wrapper ka halka rang dikhta hai, phir photo halke se fade-in.)
function ImageBox({ src, alt, className = '', width = 600, ratio = 3 / 4, priority = false, tone, doodle, fit = 'cover', sizes }) {
  const [loadedSrc, setLoadedSrc] = useState(null)

  if (!src) {
    const t = tone || toneFor(alt)
    const name = doodle || placeholderDoodles[(alt || '').length % placeholderDoodles.length]
    const Doodle = doodles[name] || doodles.chair
    return (
      <div
        className={`ph flex items-center justify-center ${className}`}
        style={{ '--ph': `var(--color-${t})` }}
        role="img"
        aria-label={alt}
      >
        <Doodle size={56} strokeWidth={2} className="opacity-80" />
      </div>
    )
  }

  const srcSet = width >= 400 ? cldSrcSet(src) : undefined
  const loaded = loadedSrc === src
  const done = () => setLoadedSrc(src)

  // (Wrapper hi jagah rakhta hai; photo andar absolute, isliye load hote waqt kuch nahi khiskta.)
  return (
    <div className={`photo-well relative overflow-hidden ${className}`}>
      <img
        src={cldUrl(src, width)}
        srcSet={srcSet}
        sizes={srcSet ? sizes || CARD_SIZES : undefined}
        width={width}
        height={Math.round(width * ratio)}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        ref={(el) => el?.complete && el.naturalWidth > 0 && !loaded && done()}
        onLoad={done}
        onError={done}
        className={`absolute inset-0 h-full w-full transition-opacity duration-300 ${fit === 'contain' ? 'object-contain' : 'object-cover'} ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  )
}

export default ImageBox
