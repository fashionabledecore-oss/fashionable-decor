import { cloudinaryUrl, cloudinarySrcSet } from '../../utils/cloudinary'
import { toneFor } from '../../utils/tones'
import { doodles } from './doodleMap'

const placeholderDoodles = ['chair', 'lamp', 'plant']

// (ratio = height / width. width/height attributes se browser pehle hi jagah rakh leta hai, layout nahi khiskta.)
// (Photo na ho toh halka clay rang + chhota doodle. Kabhi stock photo nahi.)
function ImageBox({ src, alt, className = '', width = 800, ratio = 3 / 4, priority = false, tone, doodle }) {
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

  const size = { width, height: Math.round(width * ratio) }
  return (
    <img
      src={cloudinaryUrl(src, size)}
      srcSet={cloudinarySrcSet(src, size)}
      width={size.width}
      height={size.height}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={`object-cover ${className}`}
    />
  )
}

export default ImageBox
