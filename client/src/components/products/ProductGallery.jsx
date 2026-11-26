import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Expand, X } from 'lucide-react'
import { cldUrl } from '../../utils/cloudinary'
import ImageBox from '../common/ImageBox'
import PhotoFrame from '../common/PhotoFrame'

const SWIPE_PX = 40

// (Phone par left/right swipe. Chhota tap swipe nahi maana jata, wo click hi rehta hai.)
function useSwipe(onPrev, onNext) {
  const start = useRef(null)
  return {
    onTouchStart: (e) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY }
    },
    onTouchEnd: (e) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      start.current = null
      if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy)) (dx < 0 ? onNext : onPrev)()
    },
  }
}

// Product page: badi photo (poori, crop nahi), neeche thumbnails, swipe, aur tap par full-screen viewer.
function ProductGallery({ images, name, fallbackAlt }) {
  const [index, setIndex] = useState(0)
  const [viewer, setViewer] = useState(false)
  const count = images.length
  const go = (dir) => setIndex((i) => (i + dir + count) % count)
  const swipe = useSwipe(() => count > 1 && go(-1), () => count > 1 && go(1))
  const active = images[index]
  const altFor = (img, i) => img?.alt || (i === 0 ? fallbackAlt : `${fallbackAlt || name} - photo ${i + 1}`)
  const closeViewer = useCallback(() => setViewer(false), [])

  return (
    <div>
      <div className="relative" {...swipe}>
        {count > 0 ? (
          <button
            type="button"
            onClick={() => setViewer(true)}
            className="block w-full cursor-zoom-in text-left"
            aria-label={`Open photo ${index + 1} of ${count} full screen`}
          >
            <PhotoFrame
              tone="coral"
              src={active?.url}
              alt={altFor(active, index)}
              width={1200}
              sizes="(min-width: 1024px) 50vw, 100vw"
              ratio={3 / 4}
              aspect={3 / 4}
              fit="contain"
              priority
              className="w-full"
            />
            <span className="absolute right-5 bottom-5 inline-flex items-center gap-1 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-semibold text-white">
              <Expand size={14} /> {count > 1 ? `${index + 1} / ${count}` : 'Full screen'}
            </span>
          </button>
        ) : (
          <PhotoFrame tone="coral" alt={fallbackAlt} width={720} ratio={3 / 4} aspect={3 / 4} className="w-full" />
        )}
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-4 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow sm:inline-flex"
            >
              <ChevronLeft size={22} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-4 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-ink shadow sm:inline-flex"
            >
              <ChevronRight size={22} />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <ul className="mt-5 flex flex-wrap gap-2.5" aria-label="More photos">
          {images.map((img, i) => (
            <li key={img.url}>
              <button
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-pressed={i === index}
                className={`clay block rounded-[16px] p-1 ${i === index ? 'clay-mustard clay-pressed' : 'clay-paper clay-press'}`}
              >
                <ImageBox src={img.url} alt="" className="h-12 w-16 rounded-[12px] sm:h-15 sm:w-20" width={200} ratio={3 / 4} fit="contain" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {viewer && count > 0 && (
        <Viewer images={images} index={index} setIndex={setIndex} name={name} altFor={altFor} onClose={closeViewer} />
      )}
    </div>
  )
}

// (Full-screen: next/prev arrows, swipe, keyboard (← → Esc), close button. Peeche ka page scroll nahi hota.)
function Viewer({ images, index, setIndex, name, altFor, onClose }) {
  const count = images.length
  const closeRef = useRef(null)
  const go = (dir) => setIndex((i) => (i + dir + count) % count)
  const swipe = useSwipe(() => go(-1), () => go(1))
  const img = images[index]

  useEffect(() => {
    const previous = document.activeElement
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowRight' && count > 1) setIndex((i) => (i + 1) % count)
      else if (e.key === 'ArrowLeft' && count > 1) setIndex((i) => (i - 1 + count) % count)
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = overflow
      previous?.focus?.({ preventScroll: true })
    }
  }, [count, onClose, setIndex])

  // (Portal: body ke seedhe andar, taaki koi parent ise dhak na sake; z-[200] floating WhatsApp/Call (z-100) se upar.)
  return createPortal(
    <div
      className="fixed inset-0 z-[200] flex flex-col bg-ink text-white"
      role="dialog"
      aria-modal="true"
      aria-label={`${name} photos`}
      data-testid="photo-viewer"
    >
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <p className="truncate text-sm font-semibold" aria-live="polite">
          {name} {count > 1 && <span className="font-normal text-white/70">· {index + 1} / {count}</span>}
        </p>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close photos"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/15 hover:bg-white/25"
        >
          <X size={22} />
        </button>
      </div>

      <div className="relative min-h-0 flex-1" {...swipe} onClick={(e) => e.target === e.currentTarget && onClose()}>
        <img
          key={img.url}
          src={cldUrl(img.url, 1200)}
          alt={altFor(img, index)}
          loading="lazy"
          decoding="async"
          className="pointer-events-none absolute inset-0 m-auto h-full w-full object-contain p-2 sm:p-6"
        />
        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              aria-label="Previous photo"
              className="absolute top-1/2 left-2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:left-4"
            >
              <ChevronLeft size={26} />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              aria-label="Next photo"
              className="absolute top-1/2 right-2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 hover:bg-white/25 sm:right-4"
            >
              <ChevronRight size={26} />
            </button>
          </>
        )}
      </div>
    </div>,
    document.body,
  )
}

export default ProductGallery
