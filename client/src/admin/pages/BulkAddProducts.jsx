import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, ExternalLink, ImagePlus, Loader2, Trash2 } from 'lucide-react'
import { adminCreateProduct, adminDeleteImage, adminGetCategories, adminGetCollections, adminUploadImages } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
const MAX_PICK_MB = 20
const MAX_ROWS = 50 // (ek baar mein 50 photos; API limit 300 requests / 15 min hai)
const MAX_SIDE = 1600
const QUALITY = 0.8
const PARALLEL = 2

const selectClass = 'mt-1 w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-walnut'

// ("grey_l-shape sofa.jpg" -> "Grey L Shape Sofa")
function nameFromFile(fileName) {
  return fileName
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (ch) => ch.toUpperCase())
    .slice(0, 120)
}

const toBlob = (canvas, type, quality) => new Promise((resolve) => canvas.toBlob(resolve, type, quality))

// (Lambi side max 1600 px, quality 0.8. JPEG JPEG hi rehta hai, PNG/WebP WebP ban jaate hain.)
async function resizeFile(file) {
  let bitmap
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
  } catch {
    throw new Error('This photo could not be read.')
  }
  try {
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(bitmap.width * scale)
    canvas.height = Math.round(bitmap.height * scale)
    canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)

    const type = file.type === 'image/jpeg' ? 'image/jpeg' : 'image/webp'
    const blob = await toBlob(canvas, type, QUALITY)
    if (!blob || blob.type !== type) return file
    // (Photo pehle se chhoti thi aur nayi badi ban gayi, toh asli hi bhejo.)
    if (scale === 1 && blob.size >= file.size) return file
    const base = file.name.replace(/\.[^.]+$/, '')
    return new File([blob], `${base}.${type === 'image/jpeg' ? 'jpg' : 'webp'}`, { type })
  } finally {
    bitmap.close?.()
  }
}

const randomSuffix = () => Math.random().toString(36).slice(2, 6)
const slugify = (text) =>
  text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

let nextId = 1

function BulkAddProducts() {
  const collections = useAsync(adminGetCollections, 'bulk-collections')
  const categories = useAsync(() => adminGetCategories(), 'bulk-categories')

  const inputRef = useRef(null)
  const [collectionId, setCollectionId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [rows, setRows] = useState([]) // ({ id, file, preview, name, status: ready|working|done|failed, error })
  const [problem, setProblem] = useState('')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState(null) // ({ added, failed })

  // (Page chhodne par thumbnails ki memory chhod do.)
  const rowsRef = useRef(rows)
  useEffect(() => {
    rowsRef.current = rows
  }, [rows])
  useEffect(() => () => rowsRef.current.forEach((r) => URL.revokeObjectURL(r.preview)), [])

  if (collections.loading || categories.loading) return <Loader />
  if (collections.error) return <ErrorState message={collections.error.message} />
  if (categories.error) return <ErrorState message={categories.error.message} />

  const collection = collections.data.find((c) => c._id === collectionId)
  const categoryList = categories.data.filter((c) => String(c.collectionId) === collectionId)
  const category = categoryList.find((c) => c._id === categoryId)
  const pending = rows.filter((r) => r.status !== 'done')

  const updateRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const removeRow = (id) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id)
      if (row) URL.revokeObjectURL(row.preview)
      return prev.filter((r) => r.id !== id)
    })
  }

  const pickFiles = (e) => {
    const files = Array.from(e.target.files ?? [])
    e.target.value = ''
    if (files.length === 0) return
    setProblem('')
    setResult(null)

    const skipped = []
    const fresh = []
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) skipped.push(`"${file.name}" is not JPG, PNG or WebP`)
      else if (file.size > MAX_PICK_MB * 1024 * 1024) skipped.push(`"${file.name}" is larger than ${MAX_PICK_MB} MB`)
      else fresh.push(file)
    }
    const room = MAX_ROWS - rows.length
    if (fresh.length > room) skipped.push(`Only ${MAX_ROWS} photos can be added at a time, ${fresh.length - room} were left out`)

    const added = fresh.slice(0, Math.max(0, room)).map((file) => ({
      id: nextId++,
      file,
      preview: URL.createObjectURL(file),
      name: nameFromFile(file.name),
      status: 'ready',
      error: '',
    }))
    setRows((prev) => [...prev, ...added])
    if (skipped.length) setProblem(`${skipped.join('. ')}.`)
  }

  // (Ek photo: chhota karo, upload karo, product banao. Product na bane toh image wapas hatao.)
  const processRow = async (row) => {
    updateRow(row.id, { status: 'working', error: '' })
    let uploaded
    try {
      const file = await resizeFile(row.file)
      ;[uploaded] = await adminUploadImages([file])
      const payload = {
        name: row.name.trim(),
        categoryId,
        images: [{ url: uploaded.url, publicId: uploaded.publicId, alt: row.name.trim().slice(0, 150) }],
        isActive: true,
      }
      try {
        await adminCreateProduct(payload)
      } catch (err) {
        // (Same naam ka product pehle se hai toh link ke aage chhota code laga ke dobara.)
        if (err.status !== 409) throw err
        await adminCreateProduct({ ...payload, slug: `${slugify(payload.name) || 'product'}-${randomSuffix()}` })
      }
      updateRow(row.id, { status: 'done' })
      return true
    } catch (err) {
      if (uploaded?.publicId) adminDeleteImage(uploaded.publicId).catch(() => {})
      updateRow(row.id, { status: 'failed', error: err.message || 'Something went wrong.' })
      return false
    } finally {
      setProgress((p) => ({ ...p, done: p.done + 1 }))
    }
  }

  const createAll = async () => {
    if (running) return
    setProblem('')
    setResult(null)
    if (!collectionId || !categoryId) return setProblem('Please choose a collection and a category.')
    if (pending.length === 0) return setProblem('Please select some photos first.')
    const badName = pending.find((r) => r.name.trim().length < 2)
    if (badName) return setProblem('Every product needs a name of at least 2 letters.')

    setRunning(true)
    setProgress({ done: 0, total: pending.length })
    const queue = [...pending]
    let added = 0
    let failed = 0
    const worker = async () => {
      while (queue.length) {
        const row = queue.shift()
        if (await processRow(row)) added++
        else failed++
      }
    }
    await Promise.all(Array.from({ length: Math.min(PARALLEL, queue.length) }, worker))
    setRunning(false)
    setResult({ added, failed })
  }

  const clearDone = () => {
    rows.filter((r) => r.status === 'done').forEach((r) => URL.revokeObjectURL(r.preview))
    setRows((prev) => prev.filter((r) => r.status !== 'done'))
  }

  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  const categoryLink = collection && category ? `/collections/${collection.slug}/${category.slug}` : ''
  const hiddenNote =
    (collection && !collection.isActive) || (category && !category.isActive)
      ? 'This collection or category is hidden, so these products will not show on the website until you make it visible.'
      : ''

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <Link to="/admin/products" className="text-sm text-walnut hover:underline">
          Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-walnut">Bulk add products</h1>
        <p className="mt-1 text-sm text-ink/60">
          Each photo becomes one product with that photo. You can add details later from the Products page.
        </p>
      </div>

      <section className="grid gap-4 rounded-2xl bg-white p-6 shadow-sm sm:grid-cols-2">
        <div>
          <label htmlFor="bulk-collection" className="text-sm font-medium text-ink">
            Collection <span className="text-terracotta">*</span>
          </label>
          <select
            id="bulk-collection"
            value={collectionId}
            disabled={running}
            onChange={(e) => {
              setCollectionId(e.target.value)
              setCategoryId('')
            }}
            className={selectClass}
          >
            <option value="">Choose a collection</option>
            {collections.data.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
                {c.isActive ? '' : ' (hidden)'}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="bulk-category" className="text-sm font-medium text-ink">
            Category <span className="text-terracotta">*</span>
          </label>
          <select
            id="bulk-category"
            value={categoryId}
            disabled={running || !collectionId}
            onChange={(e) => setCategoryId(e.target.value)}
            className={selectClass}
          >
            <option value="">{collectionId ? 'Choose a category' : 'Choose a collection first'}</option>
            {categoryList.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
                {c.isActive ? '' : ' (hidden)'}
              </option>
            ))}
          </select>
        </div>
        {hiddenNote && <p className="text-xs text-terracotta sm:col-span-2">{hiddenNote}</p>}
      </section>

      <section className="rounded-2xl bg-white p-6 shadow-sm">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={pickFiles}
          className="hidden"
          data-testid="bulk-file-input"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={running || rows.length >= MAX_ROWS}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-walnut/50 px-5 py-2 text-sm text-walnut transition hover:bg-beige/50 disabled:opacity-60"
        >
          <ImagePlus size={16} /> Select photos
        </button>
        <p className="mt-2 text-xs text-ink/50">
          JPG, PNG or WebP, up to {MAX_ROWS} photos at a time. Photos are made smaller before upload. The name comes from
          the file name, you can change it below.
        </p>

        {rows.length > 0 && (
          <ul className="mt-4 divide-y divide-beige">
            {rows.map((r, i) => (
              <li key={r.id} className="flex items-center gap-3 py-3">
                <img src={r.preview} alt="" className="h-14 w-14 shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <input
                    value={r.name}
                    onChange={(e) => updateRow(r.id, { name: e.target.value })}
                    disabled={running || r.status === 'done'}
                    maxLength={120}
                    aria-label={`Product name ${i + 1}`}
                    className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-walnut disabled:bg-beige/30 ${r.name.trim().length < 2 ? 'border-danger' : 'border-beige'}`}
                  />
                  {r.status === 'failed' && <p className="mt-1 text-xs text-danger">Failed: {r.error}</p>}
                </div>
                <div className="flex w-8 shrink-0 justify-center">
                  {r.status === 'working' && <Loader2 size={18} className="animate-spin text-walnut" aria-label="Saving" />}
                  {r.status === 'done' && <CheckCircle2 size={18} className="text-sage" aria-label="Added" />}
                  {(r.status === 'ready' || r.status === 'failed') && (
                    <button
                      type="button"
                      onClick={() => removeRow(r.id)}
                      disabled={running}
                      aria-label={`Remove ${r.name || `photo ${i + 1}`}`}
                      className="text-ink/40 hover:text-danger disabled:opacity-30"
                    >
                      <Trash2 size={17} />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {problem && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {problem}
        </p>
      )}

      {(running || result) && (
        <div>
          <div className="h-2 overflow-hidden rounded-full bg-beige" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full bg-walnut transition-all" style={{ width: `${percent}%` }} />
          </div>
          <p className="mt-1 text-xs text-ink/60">
            {progress.done} of {progress.total} done
          </p>
        </div>
      )}

      {result && (
        <div className="rounded-xl bg-sage/20 px-4 py-3 text-sm text-ink" role="status">
          <p className="font-medium">
            {result.added} {result.added === 1 ? 'product' : 'products'} added
            {result.failed > 0 && `, ${result.failed} failed (see the rows marked in red, you can fix and try again)`}.
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            {categoryLink && result.added > 0 && (
              <a href={categoryLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-walnut underline">
                View {category.name} on the website <ExternalLink size={14} />
              </a>
            )}
            <Link to="/admin/products" className="text-walnut underline">
              Go to products
            </Link>
            {rows.some((r) => r.status === 'done') && (
              <button type="button" onClick={clearDone} className="text-walnut underline">
                Clear added rows
              </button>
            )}
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={createAll}
        disabled={running || pending.length === 0}
        className="inline-flex items-center gap-2 rounded-full bg-walnut px-8 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {running && <Loader2 size={16} className="animate-spin" />}
        {running ? 'Creating...' : pending.length ? `Create products (${pending.length})` : 'Create products'}
      </button>
    </div>
  )
}

export default BulkAddProducts
