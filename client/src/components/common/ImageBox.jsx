import { cloudinaryUrl, cloudinarySrcSet } from '../../utils/cloudinary'
import { toneFor } from '../../utils/tones'
import { doodles } from './doodleMap'

const placeholderDoodles = ['chair', 'lamp', 'plant']

// (ratio = height / width. width/height attributes se browser pehle hi jagah rakh leta hai, layout nahi khiskta.)
// (Photo na ho toh halka clay rang + chhota doodle. Kabhi stock photo nahi.)
// fit 'cover': box bhar do (crop ho sakta hai). fit 'contain': poori photo, kabhi crop/stretch nahi,
//   halke clay background par beech mein. Box ka size className deta hai (jaise aspect-[4/3] w-full).
function ImageBox({ src, alt, className = '', width = 800, ratio = 3 / 4, priority = false, tone, doodle, fit = 'cover' }) {
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

  const size = { width, height: Math.round(width * ratio), fit }
  const img = (
    <img
      src={cloudinaryUrl(src, size)}
      srcSet={cloudinarySrcSet(src, size)}
      width={size.width}
      height={size.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={fit === 'contain' ? 'absolute inset-0 h-full w-full object-contain' : `object-cover ${className}`}
    />
  )
  if (fit !== 'contain') return img

  // (Wrapper hi jagah rakhta hai; photo andar absolute, isliye load hote waqt kuch nahi khiskta.)
  return <div className={`photo-well relative overflow-hidden ${className}`}>{img}</div>
}

export default ImageBox
