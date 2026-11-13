import { ExternalLink } from 'lucide-react'
import FormField from '../../components/forms/FormField'
import ImageBox from '../../components/common/ImageBox'
import ContentManager, { SelectField } from '../components/ContentManager'
import ImageUploader from '../components/ImageUploader'

const KINDS = [
  { value: 'reel', label: 'Reel (video)' },
  { value: 'post', label: 'Post (photo)' },
]

// (Server bhi yahi check karta hai.)
const URL_RX = /^https:\/\/(www\.)?instagram\.com\/(?:[A-Za-z0-9_.]+\/)?(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?(\?.*)?$/

function AdminInstagram() {
  return (
    <ContentManager
      kind="instagram"
      title="Instagram"
      intro='Reels and posts for "Watch our work" on the home page. The section is hidden until at least one is active. Instagram only loads when a visitor taps a card.'
      addLabel="Add reel or post"
      emptyText="Nothing added yet. Open a reel in the Instagram app, tap Share > Copy link, and paste it here."
      toForm={(item) => ({
        url: item?.url ?? '',
        kind: item?.kind ?? 'reel',
        caption: item?.caption ?? '',
        thumbnail: item?.thumbnail?.url ? [{ url: item.thumbnail.url, publicId: item.thumbnail.publicId || '', alt: '' }] : [],
      })}
      toPayload={(v) => {
        const url = v.url.trim()
        if (!URL_RX.test(url)) return { errors: { url: 'Paste a full instagram.com link to a reel or post.' } }
        // (Link mein /p/ hai toh post, /reel/ hai toh reel: galat chuna ho toh link ki baat maano.)
        const kind = /\/p\//.test(url) ? 'post' : /\/(reel|reels|tv)\//.test(url) ? 'reel' : v.kind
        return {
          payload: {
            url,
            kind,
            caption: v.caption.trim(),
            thumbnail: v.thumbnail[0] ? { url: v.thumbnail[0].url, publicId: v.thumbnail[0].publicId } : { url: '', publicId: '' },
          },
        }
      }}
      renderFields={({ values, set, errors }) => (
        <>
          <FormField
            label="Instagram link"
            name="url"
            value={values.url}
            onChange={(e) => set('url', e.target.value)}
            error={errors.url}
            required
            placeholder="https://www.instagram.com/reel/..."
            hint="In the Instagram app: Share > Copy link."
          />
          <SelectField label="Type" name="kind" value={values.kind} onChange={(e) => set('kind', e.target.value)} options={KINDS} error={errors.kind} />
          <FormField label="Caption (optional, short)" name="caption" value={values.caption} onChange={(e) => set('caption', e.target.value)} error={errors.caption} placeholder="e.g. Making an L-shape sofa frame" />
          <div>
            <p className="mb-2 text-sm font-semibold text-ink">Cover image (optional)</p>
            <p className="mb-2 text-xs text-ink/60">A screenshot of the reel works well. Without one, a coloured block is shown.</p>
            <ImageUploader images={values.thumbnail} onChange={(arr) => set('thumbnail', arr)} max={1} showAlt={false} />
          </div>
        </>
      )}
      renderItem={(item) => (
        <>
          <ImageBox src={item.thumbnail?.url} alt={item.caption || 'Instagram'} width={320} ratio={0.75} className="aspect-[4/3] w-full rounded-xl" />
          <p className="mt-2 text-xs font-semibold tracking-wide text-ink/60 uppercase">{item.kind}</p>
          {item.caption && <p className="text-sm text-ink">{item.caption}</p>}
          <a href={item.url} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-xs break-all text-walnut underline">
            Open <ExternalLink size={12} />
          </a>
        </>
      )}
    />
  )
}

export default AdminInstagram
