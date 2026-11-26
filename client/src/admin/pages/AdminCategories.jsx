import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImagePlus, Pencil, Plus, Trash2 } from 'lucide-react'
import {
  adminCreateCategory,
  adminDeleteCategory,
  adminGetCategories,
  adminGetCollections,
  adminUpdateCategory,
} from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import FormField from '../../components/forms/FormField'
import ImageBox from '../../components/common/ImageBox'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormAlert from '../components/FormAlert'
import ImageUploader from '../components/ImageUploader'
import OrderButtons from '../components/OrderButtons'
import EditingBanner from '../components/EditingBanner'
import AdminToast from '../components/AdminToast'
import { saveNewOrder } from '../reorder'
import { rowState, useInlineEditor, useSavedRow } from '../editFeedback'

function CategoryForm({ initial, collections, defaultCollectionId, onSaved, onCancel }) {
  const editing = Boolean(initial?._id)
  const [values, setValues] = useState({
    name: initial?.name ?? '',
    slug: initial?.slug ?? '',
    collectionId: initial?.collectionId ?? defaultCollectionId ?? '',
    description: initial?.description ?? '',
    displayOrder: initial?.displayOrder ?? 0,
    isActive: initial?.isActive ?? true,
    image: initial?.image?.url
      ? { url: initial.image.url, publicId: initial.image.publicId || '' }
      : null,
  })
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [serverErrors, setServerErrors] = useState(null)
  const [saving, setSaving] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return

    const found = {}
    if (values.name.trim().length < 2) found.name = 'Please enter a name.'
    if (!values.collectionId) found.collectionId = 'Please choose a collection.'
    if (Object.keys(found).length > 0) {
      setErrors(found)
      return
    }

    const payload = {
      name: values.name.trim(),
      collectionId: values.collectionId,
      description: values.description.trim(),
      displayOrder: Math.max(0, Math.trunc(Number(values.displayOrder) || 0)),
      isActive: values.isActive,
      image: values.image ?? { url: '', publicId: '' },
    }
    if (values.slug.trim()) payload.slug = values.slug.trim()

    setSaving(true)
    setAlert('')
    setServerErrors(null)
    try {
      const saved = editing ? await adminUpdateCategory(initial._id, payload) : await adminCreateCategory(payload)
      onSaved(editing ? `"${payload.name}" saved.` : `"${payload.name}" added.`, saved?._id ?? initial?._id)
    } catch (err) {
      setAlert(err.message)
      setServerErrors(err.errors || null)
      setErrors(err.errors || {})
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-semibold text-walnut">{editing ? 'Edit category' : 'Add category'}</h2>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="field-collectionId" className="text-sm font-medium text-ink">
            Collection <span className="text-terracotta">*</span>
          </label>
          <select
            id="field-collectionId"
            name="collectionId"
            value={values.collectionId}
            onChange={handleChange}
            className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-walnut ${
              errors.collectionId ? 'border-danger' : 'border-beige'
            }`}
          >
            <option value="">Choose a collection</option>
            {collections.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.collectionId && <p className="mt-1 text-sm text-danger">{errors.collectionId}</p>}
        </div>
        <FormField label="Name" name="name" value={values.name} onChange={handleChange} error={errors.name} required placeholder="e.g. Recliners" />
      </div>

      <div>
        <FormField label="Slug (page link)" name="slug" value={values.slug} onChange={handleChange} error={errors.slug} placeholder="recliners" />
        <p className="mt-1 text-xs text-ink/50">
          {editing ? 'Changing this changes the category link on the website.' : 'Leave empty to create it from the name.'}
        </p>
      </div>

      <FormField label="Description" name="description" as="textarea" rows={2} value={values.description} onChange={handleChange} error={errors.description} />

      <div className="grid gap-4 md:grid-cols-2">
        <FormField label="Display order (smaller shows first)" name="displayOrder" type="number" value={values.displayOrder} onChange={handleChange} error={errors.displayOrder} />
        <label className="flex items-center gap-2 pt-7 text-sm text-ink">
          <input
            type="checkbox"
            checked={values.isActive}
            onChange={(e) => setValues((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="h-4 w-4 accent-[#6B422F]"
          />
          Active (visible on the website)
        </label>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Category cover photo</p>
        <p className="mb-2 text-xs text-ink/50">
          Shown on this category&apos;s card. It is only the cover photo, not a product.{' '}
          <Link
            to={initial?._id ? `/admin/products/bulk?collection=${values.collectionId}&category=${initial._id}` : '/admin/products/bulk'}
            className="font-medium text-walnut underline"
          >
            Add products with photos
          </Link>
        </p>
        <ImageUploader
          images={values.image ? [values.image] : []}
          onChange={(arr) =>
            setValues((prev) => ({
              ...prev,
              image: arr[0] ? { url: arr[0].url, publicId: arr[0].publicId } : null,
            }))
          }
          max={1}
          showAlt={false}
        />
      </div>

      <FormAlert message={alert} errors={serverErrors} />

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-walnut px-6 py-2 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-walnut/40 px-6 py-2 text-sm text-walnut">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AdminCategories() {
  const [version, setVersion] = useState(0)
  const [filter, setFilter] = useState('')
  const { editing, formKey, open, close, formProps } = useInlineEditor()
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState('')

  // (Collections ki list reload par dobara nahi: warna khula form beech mein gayab ho kar badlav kho deta.)
  const collections = useAsync(adminGetCollections, 'cat-collections')
  const { data, loading, error } = useAsync(
    () => adminGetCategories({ collectionId: filter }),
    `admin-categories:${filter}:${version}`,
  )
  const reload = () => setVersion((v) => v + 1)
  const [savedId, markSaved] = useSavedRow(Boolean(data) && !loading)

  const saved = (message, id) => {
    close()
    setProblem('')
    setNotice(message)
    markSaved(id)
    reload()
  }

  const toggleActive = async (c) => {
    setNotice('')
    setProblem('')
    try {
      await adminUpdateCategory(c._id, { isActive: !c.isActive })
      setNotice(c.isActive ? `"${c.name}" is now hidden from the website.` : `"${c.name}" is now visible on the website.`)
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const remove = async (c) => {
    if (!window.confirm(`Delete the category "${c.name}"?`)) return
    setNotice('')
    setProblem('')
    try {
      await adminDeleteCategory(c._id)
      setNotice('Category deleted.')
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const move = async (items, index, dir) => {
    setNotice('')
    setProblem('')
    try {
      await saveNewOrder(items, index, dir, adminUpdateCategory)
      setNotice(`Order saved. "${items[index].name}" moved ${dir < 0 ? 'up' : 'down'}.`)
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  const noCollections = collections.data && collections.data.length === 0

  // (Categories ko unki collection ke order mein group karo.)
  const groups = (collections.data ?? [])
    .map((col) => ({
      id: col._id,
      name: `${col.name}${col.isActive ? '' : ' (hidden collection)'}`,
      items: (data ?? []).filter((c) => String(c.collectionId) === String(col._id)),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-walnut">Categories</h1>
          <p className="mt-1 text-sm text-ink/60">Types inside a collection, like Sofa Sets, L-Shape Sofas or Recliners.</p>
        </div>
        {collections.data && !noCollections && (
          <button
            type="button"
            onClick={() => open('new')}
            className="inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-2 text-sm font-medium text-white"
          >
            <Plus size={16} /> Add category
          </button>
        )}
      </div>

      {noCollections && (
        <p className="mt-4 rounded-xl bg-beige/60 px-4 py-3 text-sm text-ink">
          Please add a collection first. Categories live inside collections.
        </p>
      )}

      <AdminToast notice={notice} problem={problem} onClose={() => { setNotice(''); setProblem('') }} />

      {editing && collections.data && (
        <div {...formProps} className="mt-6 scroll-mt-4 space-y-3" data-testid="inline-form">
          <EditingBanner name={editing === 'new' ? 'new category' : editing.name} isNew={editing === 'new'} onCancel={close} />
          <CategoryForm
            key={formKey}
            initial={editing === 'new' ? null : editing}
            collections={collections.data}
            defaultCollectionId={filter}
            onSaved={saved}
            onCancel={close}
          />
        </div>
      )}

      {collections.data && collections.data.length > 0 && (
        <div className="mt-6">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            aria-label="Filter by collection"
            className="rounded-full border border-beige bg-white px-4 py-2 text-sm text-ink"
          >
            <option value="">All collections</option>
            {collections.data.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {data && data.length === 0 && !noCollections && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink/60">No categories here yet.</p>
      )}

      {/* (Collection ke hisaab se groups. Order sirf apne group ke andar badalta hai. Cards phone par bhi theek.) */}
      {groups.map((g) => (
        <section key={g.id} className="mt-6">
          <h2 className="text-sm font-bold tracking-wide text-ink/60 uppercase">{g.name}</h2>
          <ul className="mt-2 space-y-2">
            {g.items.map((c, i) => (
              <li
                key={c._id}
                id={`row-${c._id}`}
                className={`scroll-mt-4 rounded-2xl bg-white p-3 shadow-sm transition ${c.isActive ? '' : 'opacity-60'} ${rowState(c._id, editing, savedId)}`}
              >
                <div className="flex items-center gap-3">
                  <ImageBox src={c.image?.url} alt={c.name} className="h-12 w-16 shrink-0 rounded-lg" width={200} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium text-ink">
                      {c.name}
                      {editing?._id === c._id && <span className="ml-2 rounded-full bg-terracotta px-2 py-0.5 text-xs text-white">Editing</span>}
                    </p>
                    <p className="text-xs text-ink/50">
                      /{c.slug} · {c.productCount} {c.productCount === 1 ? 'product' : 'products'}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-beige pt-3">
                  <OrderButtons index={i} count={g.items.length} label={c.name} onMove={(idx, dir) => move(g.items, idx, dir)} />
                  <button
                    type="button"
                    onClick={() => toggleActive(c)}
                    className={`rounded-full px-3 py-2 text-xs font-medium ${c.isActive ? 'bg-sage/25 text-ink' : 'bg-ink/10 text-ink/60'}`}
                  >
                    {c.isActive ? 'Active (tap to hide)' : 'Hidden (tap to show)'}
                  </button>
                  <Link
                    to={`/admin/products/bulk?collection=${c.collectionId}&category=${c._id}`}
                    className="inline-flex items-center gap-1 rounded-full bg-walnut px-3 py-2 text-xs font-medium text-white"
                  >
                    <ImagePlus size={14} /> Add photos
                  </Link>
                  <Link
                    to={`/admin/products?collection=${c.collectionId}&category=${c._id}`}
                    className="rounded-full border border-walnut/40 px-3 py-2 text-xs font-medium text-walnut"
                  >
                    View products
                  </Link>
                  <button type="button" onClick={() => open(c)} aria-label={`Edit ${c.name}`} className="ml-auto p-2 text-walnut">
                    <Pencil size={17} />
                  </button>
                  <button type="button" onClick={() => remove(c)} aria-label={`Delete ${c.name}`} className="p-2 text-ink/40 hover:text-danger">
                    <Trash2 size={17} />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p className="mt-4 text-xs text-ink/50">
        A category can only be deleted when it has no products. Otherwise, set it to Hidden.
      </p>
    </div>
  )
}

export default AdminCategories