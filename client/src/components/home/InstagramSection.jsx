import { useCallback, useEffect, useRef, useState } from 'react'
import { ExternalLink, Play, X } from 'lucide-react'
import { Instagram } from '../common/SocialIcons'
import { siteConfig } from '../../config/site'
import { getInstagramPosts } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import { toneAt } from '../../utils/tones'
import ImageBox from '../common/ImageBox'

// (URL se shortcode. Server bhi yahi pattern check karta hai.)
const URL_RX = /instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(?:p|reel|reels|tv)\/([A-Za-z0-9_-]+)/

function shortcodeOf(url) {
  return url.match(URL_RX)?.[1] || ''
}

const embedUrl = (post) => `https://www.instagram.com/${post.kind === 'post' ? 'p' : 'reel'}/${shortcodeOf(post.url)}/embed`

// (Iframe sirf click ke baad banta hai: page load par Instagram ki koi script ya request nahi.)
function EmbedModal({ post, onClose }) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prev
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={post.caption || 'Instagram video'}
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/70 p-3"
      onClick={onClose}
    >
      <div className="clay clay-paper relative w-full max-w-md rounded-[30px] p-3" onClick={(e) => e.stopPropagation()}>
        <div className="mb-2 flex items-center justify-between gap-2 px-1">
          <a href={post.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-terracotta underline-offset-4 hover:underline">
            Open on Instagram <ExternalLink size={14} />
          </a>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="clay clay-butter clay-press inline-flex h-10 w-10 items-center justify-center rounded-full"
          >
            <X size={20} />
          </button>
        </div>
        <iframe
          src={embedUrl(post)}
          title={post.caption || 'Instagram post by Fashionable Decor'}
          className="block h-[70vh] max-h-[640px] w-full rounded-[20px] border-0 bg-white"
          allow="encrypted-media; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  )
}

function InstagramSection() {
  const { data } = useAsync(getInstagramPosts, 'instagram-posts')
  const [open, setOpen] = useState(null)
  const close = useCallback(() => setOpen(null), [])
  const posts = (data ?? []).filter((p) => shortcodeOf(p.url))
  if (posts.length === 0) return null

  return (
    <section aria-labelledby="insta-title" className="mx-auto max-w-6xl px-4 pt-20 sm:px-6 md:pt-28">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="insta-title" className="text-4xl font-semibold md:text-5xl">
          Watch our work
        </h2>
        <a href={siteConfig.instagramUrl} target="_blank" rel="noreferrer" className="btn clay clay-lilac clay-press">
          <Instagram size={18} /> Follow @{siteConfig.instagramHandle}
        </a>
      </div>

      <ul className="-mx-4 mt-8 flex snap-x gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0">
        {posts.map((post, i) => (
          <li key={post._id} className="w-56 shrink-0 snap-start sm:w-64">
            <button
              type="button"
              onClick={() => setOpen(post)}
              className="group relative block w-full overflow-hidden rounded-[28px] text-left"
              aria-label={`Play: ${post.caption || `Instagram ${post.kind}`}`}
            >
              <ImageBox
                src={post.thumbnail?.url}
                alt=""
                tone={toneAt(i)}
                doodle="chair"
                width={600}
                sizes="256px"
                ratio={16 / 9}
                className="aspect-[9/16] w-full transition-transform duration-500 motion-safe:group-hover:scale-[1.03]"
              />
              <span className="clay clay-coral blob-a absolute top-1/2 left-1/2 inline-flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center">
                <Play size={26} className="ml-1 fill-current" />
              </span>
            </button>
            {post.caption && <p className="mt-2 line-clamp-2 px-1 text-sm text-muted">{post.caption}</p>}
            <a href={post.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 px-1 text-sm font-bold text-terracotta underline-offset-4 hover:underline">
              Open on Instagram <ExternalLink size={13} />
            </a>
          </li>
        ))}
      </ul>

      {open && <EmbedModal post={open} onClose={close} />}
    </section>
  )
}

export default InstagramSection
