import { useRef, useState } from 'react'
import { ArrowLeft, ArrowRight, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { adminDeleteImage, adminUploadImages } from '../../services/api'
import { MAX_PICK_MB, checkFile, resizeImage } from '../resizeImage'

// images: [{ url, publicId, alt }]   onChange(newImagesArray)
// (Ek baar mein `max` tak photos chun sakte ho; har photo browser mein chhoti (1600 px, 0.8) hoti hai, phir ek ek karke upload.)
function ImageUploader({ images, onChange, max = 15, showAlt = true }) {
  const inputRef = useRef(null)
  const [status, setStatus] = useState('') // (khaali = kuch nahi ho raha, warna button par dikhne wala text)
  const [error, setError] = useState('')
  const [fresh, setFresh] = useState([]) // (jo images is form mein abhi upload hui, abhi save nahi hui)

  const busy = status !== ''

  const discardIfFresh = (img) => {
    if (img?.publicId && fresh.includes(img.publicId)) {
      adminDeleteImage(img.publicId).catch(() => {})
      setFresh((prev) => prev.filter((id) => id !== img.publicId))
    }
  }

  const handleFiles = async (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setError('')

    if (max === 1 && files.length > 1) return setError('Please choose only one image.')
    if (max > 1 && images.length + files.length > max) {
      const room = max - images.length
      return setError(`You can add at most ${max} images. There is room for ${room} more.`)
    }
    const bad = files.map(checkFile).find(Boolean)
    if (bad) return setError(`${bad}.`)

    try {
      // (Har photo: pehle chhoti, phir upload. Ek ek karke, taaki memory na bhare aur slow net par timeout na aaye.)
      const added = []
      let failure = ''
      for (let i = 0; i < files.length; i++) {
        const label = files.length > 1 ? ` ${i + 1} of ${files.length}` : ''
        try {
          setStatus(`Preparing${label}...`)
          const prepared = await resizeImage(files[i])
          setStatus(`Uploading${label}...`)
          const [u] = await adminUploadImages([prepared])
          added.push({ url: u.url, publicId: u.publicId, alt: '' })
        } catch (err) {
          failure = `"${files[i].name}" could not be uploaded: ${err.message}`
          break
        }
      }

      if (added.length > 0) {
        setFresh((prev) => [...prev, ...added.map((a) => a.publicId)])
        if (max === 1) {
          discardIfFresh(images[0])
          onChange(added)
        } else {
          onChange([...images, ...added])
        }
      }
      if (failure) {
        setError(added.length > 0 ? `${failure} The photos before it were added.` : failure)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setStatus('')
    }
  }

  const removeAt = (index) => {
    discardIfFresh(images[index])
    onChange(images.filter((_, i) => i !== index))
  }

  const move = (from, to) => {
    if (to < 0 || to >= images.length) return
    const next = [...images]
    ;[next[from], next[to]] = [next[to], next[from]]
    onChange(next)
  }

  const makeMain = (index) => {
    const next = [...images]
    const [img] = next.splice(index, 1)
    onChange([img, ...next])
  }

  const setAlt = (index, alt) => {
    onChange(images.map((img, i) => (i === index ? { ...img, alt } : img)))
  }

  const canAdd = max === 1 || images.length < max

  return (
    <div>
      {images.length > 0 && (
        <ul className={`grid gap-4 ${max === 1 ? 'max-w-xs' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
          {images.map((img, i) => (
            <li key={img.publicId || img.url} className="rounded-2xl border border-beige bg-white p-2">
              <div className="relative">
                <img
                  src={img.url}
                  alt={img.alt || `Photo ${i + 1}`}
                  className="photo-well aspect-[4/3] w-full rounded-xl object-contain"
                  data-testid="uploaded-photo"
                />
                {i === 0 && max > 1 && (
                  <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-walnut px-2 py-0.5 text-xs text-white">
                    <Star size={12} /> Main
                  </span>
                )}
                {i > 0 && max > 1 && (
                  <button
                    type="button"
                    onClick={() => makeMain(i)}
                    aria-label={`Set photo ${i + 1} as main`}
                    className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-0.5 text-xs text-walnut shadow-sm"
                  >
                    <Star size={12} /> Set as main
                  </button>
                )}
              </div>

              {showAlt && (
                <input
                  value={img.alt}
                  onChange={(e) => setAlt(i, e.target.value)}
                  maxLength={150}
                  placeholder="Short description (alt text)"
                  aria-label={`Description for image ${i + 1}`}
                  className="mt-2 w-full rounded-lg border border-beige px-2 py-1 text-xs outline-none focus:border-walnut"
                />
              )}

              <div className="mt-2 flex items-center justify-between">
                {max > 1 ? (
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => move(i, i - 1)}
                      disabled={i === 0}
                      aria-label={`Move photo ${i + 1} left`}
                      className="rounded-full bg-beige p-1.5 text-walnut disabled:opacity-30"
                    >
                      <ArrowLeft size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(i, i + 1)}
                      disabled={i === images.length - 1}
                      aria-label={`Move photo ${i + 1} right`}
                      className="rounded-full bg-beige p-1.5 text-walnut disabled:opacity-30"
                    >
                      <ArrowRight size={14} />
                    </button>
                  </div>
                ) : (
                  <span />
                )}
                <button
                  type="button"
                  onClick={() => removeAt(i)}
                  aria-label={`Remove photo ${i + 1}`}
                  className="inline-flex items-center gap-1 text-xs text-ink/50 hover:text-danger"
                >
                  <Trash2 size={14} /> Remove
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {canAdd && (
        <>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={max > 1}
            onChange={handleFiles}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-dashed border-walnut/50 px-5 py-2 text-sm text-walnut transition hover:bg-beige/50 disabled:opacity-60"
          >
            {busy ? (
              <>
                <Loader2 size={16} className="animate-spin" /> {status}
              </>
            ) : (
              <>
                <ImagePlus size={16} /> {images.length > 0 && max === 1 ? 'Replace image' : 'Add images'}
              </>
            )}
          </button>
        </>
      )}

      <p className="mt-2 text-xs text-ink/50">
        JPG, PNG or WebP, up to {MAX_PICK_MB} MB each{max > 1 ? `, up to ${max} photos` : ''}. You can select many at once.
        Photos are made smaller before upload (1600 px), so they load fast and stay sharp.
      </p>
      {error && (
        <p className="mt-2 text-sm text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

export default ImageUploader