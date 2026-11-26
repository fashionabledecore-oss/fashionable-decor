import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { CheckCircle2, ExternalLink, ImagePlus, Loader2, Star, Trash2 } from 'lucide-react'
import { adminCreateProduct, adminDeleteImage, adminGetCategories, adminGetCollections, adminUploadImages } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import { checkFile, resizeImage } from '../resizeImage'
import ProductNamePicker from '../components/ProductNamePicker'
import { useCategoryNames } from '../useCategoryNames'
import { nextNumber, pickerName } from '../../utils/productNames'

const MAX_ROWS = 50 // (ek baar mein 50 photos)
const MAX_GALLERY = 15 // (ek product mein zyada se zyada 15 photos)
const PARALLEL = 2

const selectClass = 'mt-1 w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-walnut'

const pad = (n) => String(n).padStart(2, '0')
const EMPTY_PICK = { choice: '', custom: '', detail: '' }

const randomSuffix = () => Math.random().toString(36).slice(2, 6)
const slugify = (text) =>
  text.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// (Same naam ka product pehle se ho (409) toh link ke aage chhota code laga ke dobara.)
async function createProduct(payload) {
  try {
    return await adminCreateProduct(payload)
  } catch (err) {
    if (err.status !== 409) throw err
    return adminCreateProduct({ ...payload, slug: `${slugify(payload.name) || 'product'}-${randomSuffix()}` })
  }
}

const BUSY_MESSAGE =
  'The server is busy and rejected some requests. The photos that were added are kept. Please wait a few minutes, then press Create again for the remaining photos.'

let nextId = 1

function BulkAddProducts() {
  const [searchParams] = useSearchParams()
  const collections = useAsync(adminGetCollections, 'bulk-collections')
  const categories = useAsync(() => adminGetCategories(), 'bulk-categories')

  const inputRef = useRef(null)
  const [mode, setMode] = useState('separate') // 'separate' | 'gallery'
  // (Categories > "Add photos" se aaye toh collection aur category pehle se chuni hui.)
  const [collectionId, setCollectionId] = useState(searchParams.get('collection') || '')
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '')
  // (Naam chips se, poore batch ke liye. Har product "<naam> NN", category ke sabse bade number ke aage se.)
  const [pick, setPick] = useState(EMPTY_PICK)
  const names = useCategoryNames(categoryId)
  const [rows, setRows] = useState([]) // ({ id, file, preview, status: ready|working|done|failed, error })
  const [problem, setProblem] = useState('')
  const [running, setRunning] = useState(false)
  const [progress, setProgress] = useState({ done: 0, total: 0 })
  const [result, setResult] = useState(null) // ({ added, failed, photos, busy, product })

  // (Page chhodne par thumbnails ki memory chhod do.)
  const rowsRef = useRef(rows)
  useEffect(() => {
    rowsRef.current = rows
  }, [rows])
  useEffect(() => () => rowsRef.current.forEach((r) => URL.revokeObjectURL(r.preview)), [])

  if (collections.loading || categories.loading) return <Loader />
  if (collections.error) return <ErrorState message={collections.error.message} onRetry={collections.retry} />
  if (categories.error) return <ErrorState message={categories.error.message} onRetry={categories.retry} />

  const gallery = mode === 'gallery'
  const maxRows = gallery ? MAX_GALLERY : MAX_ROWS
  const collection = collections.data.find((c) => c._id === collectionId)
  const categoryList = categories.data.filter((c) => String(c.collectionId) === collectionId)
  const category = categoryList.find((c) => c._id === categoryId)
  const pending = rows.filter((r) => r.status !== 'done')

  const finalName = pickerName(pick)
  const namesReady = !categoryId || Boolean(names.data)
  const start = finalName && names.data ? Number(nextNumber(finalName, names.data.map((p) => p.name))) : 1
  // (Separate: har pending photo ka apna number. Gallery: ek product, ek number.)
  const plannedName = new Map(pending.map((r, i) => [r.id, `${finalName} ${pad(start + (gallery ? 0 : i))}`]))
  const previewSuffix = gallery || pending.length <= 1 ? ` ${pad(start)}` : ` ${pad(start)} to ${pad(start + pending.length - 1)}`

  const updateRow = (id, patch) => setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)))

  const removeRow = (id) => {
    setRows((prev) => {
      const row = prev.find((r) => r.id === id)
      if (row) URL.revokeObjectURL(row.preview)
      return prev.filter((r) => r.id !== id)
    })
  }

  const makeMain = (id) =>
    setRows((prev) => {
      const row = prev.find((r) => r.id === id)
      return [row, ...prev.filter((r) => r.id !== id)]
    })

  const switchMode = (next) => {
    if (running || next === mode) return
    setMode(next)
    setProblem('')
    setResult(null)
    if (next === 'gallery' && rows.length > MAX_GALLERY) {
      setProblem(`One product can have at most ${MAX_GALLERY} photos. Please remove ${rows.length - MAX_GALLERY} photos.`)
    }
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
      const bad = checkFile(file)
      if (bad) skipped.push(bad)
      else fresh.push(file)
    }
    const room = maxRows - rows.length
    if (fresh.length > room) skipped.push(`Only ${maxRows} photos can be added at a time, ${fresh.length - Math.max(0, room)} were left out`)

    const added = fresh.slice(0, Math.max(0, room)).map((file) => ({
      id: nextId++,
      file,
      preview: URL.createObjectURL(file),
      status: 'ready',
      error: '',
    }))
    setRows((prev) => [...prev, ...added])
    if (skipped.length) setProblem(`${skipped.join('. ')}.`)
  }

  // (Do do karke chalate hain. Server "busy" (429) bole toh ruk jaate hain; baaki rows "ready" rehti hain.)
  const runQueue = async (list, work) => {
    const queue = [...list]
    let busy = false
    const worker = async () => {
      while (queue.length && !busy) {
        const row = queue.shift()
        try {
          await work(row)
        } catch (err) {
          if (err.status === 429) busy = true
        } finally {
          setProgress((p) => ({ ...p, done: p.done + 1 }))
        }
      }
    }
    await Promise.all(Array.from({ length: Math.min(PARALLEL, queue.length) }, worker))
    return busy
  }

  const uploadRow = async (row) => {
    updateRow(row.id, { status: 'working', error: '' })
    try {
      const file = await resizeImage(row.file)
      const [uploaded] = await adminUploadImages([file])
      return uploaded
    } catch (err) {
      updateRow(row.id, { status: 'failed', error: err.message || 'Something went wrong.' })
      throw err
    }
  }

  // Mode 1: har photo ek product.
  const createSeparate = async (planned) => {
    let added = 0
    const busy = await runQueue(pending, async (row) => {
      const uploaded = await uploadRow(row)
      const name = planned.get(row.id)
      try {
        await createProduct({
          name,
          categoryId,
          images: [{ url: uploaded.url, publicId: uploaded.publicId, alt: name.slice(0, 150) }],
          isActive: true,
        })
      } catch (err) {
        adminDeleteImage(uploaded.publicId).catch(() => {})
        updateRow(row.id, { status: 'failed', error: err.message || 'Something went wrong.' })
        throw err
      }
      updateRow(row.id, { status: 'done' })
      added++
    })
    return { added, photos: added, busy }
  }

  // Mode 2: saari photos ek product ki gallery (row ke order mein, pehli = main).
  const createGallery = async (planned) => {
    const uploads = new Map()
    const busy = await runQueue(pending, async (row) => {
      uploads.set(row.id, await uploadRow(row))
    })
    const ok = pending.filter((r) => uploads.has(r.id))
    if (ok.length === 0) return { added: 0, photos: 0, busy }

    const name = planned.get(pending[0].id)
    const images = ok.map((r, i) => {
      const u = uploads.get(r.id)
      return { url: u.url, publicId: u.publicId, alt: `${name} - photo ${i + 1}`.slice(0, 150) }
    })
    try {
      const product = await createProduct({ name, categoryId, images, isActive: true })
      ok.forEach((r) => updateRow(r.id, { status: 'done' }))
      return { added: 1, photos: ok.length, busy, product }
    } catch (err) {
      images.forEach((img) => adminDeleteImage(img.publicId).catch(() => {}))
      ok.forEach((r) => updateRow(r.id, { status: 'failed', error: err.message || 'Something went wrong.' }))
      return { added: 0, photos: 0, busy: busy || err.status === 429, error: err.message }
    }
  }

  const createAll = async () => {
    if (running) return
    setProblem('')
    setResult(null)
    if (!collectionId || !categoryId) return setProblem('Please choose a collection and a category.')
    if (pending.length === 0) return setProblem('Please select some photos first.')
    if (finalName.trim().length < 2) return setProblem('Please choose the product name.')
    if (!names.data) return setProblem('Existing product names are still loading. Please wait a moment.')
    if (gallery && pending.length > MAX_GALLERY) return setProblem(`One product can have at most ${MAX_GALLERY} photos.`)

    setRunning(true)
    setProgress({ done: 0, total: pending.length })
    const total = pending.length
    const res = gallery ? await createGallery(plannedName) : await createSeparate(plannedName)
    setRunning(false)
    // (Naye naam aa gaye; agla batch unke aage se number lega.)
    names.retry()
    setResult({ ...res, failed: total - res.photos })
    if (res.error) setProblem(`The product could not be created: ${res.error}`)
  }

  const clearDone = () => {
    rows.filter((r) => r.status === 'done').forEach((r) => URL.revokeObjectURL(r.preview))
    setRows((prev) => prev.filter((r) => r.status !== 'done'))
    setResult(null)
  }

  const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0
  const categoryLink = collection && category ? `/collections/${collection.slug}/${category.slug}` : ''
  const hiddenNote =
    (collection && !collection.isActive) || (category && !category.isActive)
      ? 'This collection or category is hidden, so these products will not show on the website until you make it visible.'
      : ''

  const modeButton = (value, title, text) => (
    <label
      className={`flex cursor-pointer gap-3 rounded-xl border-2 p-4 text-sm ${mode === value ? 'border-walnut bg-butter' : 'border-beige bg-white'}`}
    >
      <input
        type="radio"
        name="bulk-mode"
        value={value}
        checked={mode === value}
        disabled={running}
        onChange={() => switchMode(value)}
        className="mt-0.5 h-4 w-4 accent-[#6B422F]"
      />
      <span>
        <span className="block font-semibold text-ink">{title}</span>
        <span className="text-ink/60">{text}</span>
      </span>
    </label>
  )

  return (
    <div className="max-w-4xl space-y-6 pb-10">
      <div>
        <Link to="/admin/products" className="text-sm text-walnut hover:underline">
          Back to products
        </Link>
        <h1 className="mt-2 text-2xl font-bold text-walnut">Bulk add products</h1>
        <p className="mt-1 text-sm text-ink/60">Select many photos at once. You can add details later from the Products page.</p>
      </div>

      <fieldset className="grid gap-3 sm:grid-cols-2">
        <legend className="mb-2 text-sm font-medium text-ink">How should the photos be added?</legend>
        {modeButton('separate', 'Each photo is a separate product', `Up to ${MAX_ROWS} photos, one product per photo.`)}
        {modeButton('gallery', 'All photos are ONE product', `One product with a gallery of up to ${MAX_GALLERY} photos.`)}
      </fieldset>

      <section className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-2 sm:p-6">
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
              setPick((p) => ({ ...p, choice: '' }))
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
            onChange={(e) => {
              setCategoryId(e.target.value)
              setPick((p) => ({ ...p, choice: '' }))
            }}
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
        <div className="sm:col-span-2">
          <ProductNamePicker
            idPrefix="bulk-name"
            categoryName={category?.name ?? ''}
            value={pick}
            onChange={setPick}
            disabled={running}
            preview={finalName}
            previewSuffix={names.data ? previewSuffix : ''}
          />
          {categoryId && names.loading && <p className="mt-1 text-xs text-ink/60">Loading existing names for numbering...</p>}
          {categoryId && names.error && (
            <p className="mt-1 text-xs text-danger">
              Could not load existing names ({names.error.message}).{' '}
              <button type="button" onClick={names.retry} className="underline">
                Try again
              </button>
            </p>
          )}
        </div>
        {hiddenNote && <p className="text-xs text-terracotta sm:col-span-2">{hiddenNote}</p>}
      </section>

      <section className="rounded-2xl bg-white p-4 shadow-sm sm:p-6">
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
          disabled={running || rows.length >= maxRows}
          className="inline-flex items-center gap-2 rounded-full border border-dashed border-walnut/50 px-5 py-2 text-sm text-walnut transition hover:bg-beige/50 disabled:opacity-60"
        >
          <ImagePlus size={16} /> Select photos
        </button>
        <p className="mt-2 text-xs text-ink/50">
          JPG, PNG or WebP, up to {maxRows} photos at a time. Photos are made smaller before upload (1600 px).
          {gallery ? ' The first photo is the main photo.' : ' Each photo becomes its own product, numbered 01, 02 and so on.'}
        </p>

        {rows.length > 0 && (
          <ul className="mt-4 divide-y divide-beige">
            {rows.map((r, i) => (
              <li key={r.id} className="flex items-center gap-3 py-3" data-testid="bulk-row">
                <img src={r.preview} alt="" loading="lazy" decoding="async" className="photo-well h-14 w-14 shrink-0 rounded-lg object-contain" />
                <div className="min-w-0 flex-1">
                  {gallery ? (
                    <p className="flex items-center gap-2 text-sm text-ink/70">
                      {i === 0 ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-walnut px-2 py-0.5 text-xs text-white">
                          <Star size={12} /> Main
                        </span>
                      ) : (
                        r.status !== 'done' && (
                          <button type="button" onClick={() => makeMain(r.id)} disabled={running} className="text-xs text-walnut underline">
                            Set as main
                          </button>
                        )
                      )}
                      <span className="truncate">Photo {i + 1}</span>
                    </p>
                  ) : (
                    <p className="truncate text-sm text-ink/70">
                      {r.status === 'done' ? `Photo ${i + 1}: added` : finalName && namesReady ? plannedName.get(r.id) : `Photo ${i + 1}`}
                    </p>
                  )}
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
                      aria-label={`Remove photo ${i + 1}`}
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
            {progress.done} of {progress.total} photos done
          </p>
        </div>
      )}

      {result?.busy && (
        <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {BUSY_MESSAGE}
        </p>
      )}

      {result && (
        <div className="rounded-xl bg-sage/20 px-4 py-3 text-sm text-ink" role="status">
          <p className="font-medium">
            {gallery
              ? result.added
                ? `1 product added with ${result.photos} ${result.photos === 1 ? 'photo' : 'photos'}`
                : 'No product was added'
              : `${result.added} ${result.added === 1 ? 'product' : 'products'} added`}
            {result.failed > 0 && `, ${result.failed} ${result.failed === 1 ? 'photo' : 'photos'} not added (see the rows below, you can try again)`}.
          </p>
          <div className="mt-2 flex flex-wrap gap-4">
            {categoryLink && result.added > 0 && (
              <a href={categoryLink} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-walnut underline">
                View {category.name} on the website <ExternalLink size={14} />
              </a>
            )}
            {result.product?._id && (
              <Link to={`/admin/products/${result.product._id}/edit`} className="text-walnut underline">
                Edit this product
              </Link>
            )}
            <Link to={`/admin/products?collection=${collectionId}&category=${categoryId}`} className="text-walnut underline">
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
        disabled={running || pending.length === 0 || finalName.trim().length < 2 || !names.data}
        className="inline-flex items-center gap-2 rounded-full bg-walnut px-8 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60"
      >
        {running && <Loader2 size={16} className="animate-spin" />}
        {running
          ? 'Creating...'
          : gallery
            ? `Create 1 product with ${pending.length} ${pending.length === 1 ? 'photo' : 'photos'}`
            : pending.length
              ? `Create products (${pending.length})`
              : 'Create products'}
      </button>
    </div>
  )
}

export default BulkAddProducts
