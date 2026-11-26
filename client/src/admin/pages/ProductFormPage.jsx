import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2 } from 'lucide-react'
import { adminCreateProduct, adminGetCategories, adminGetProduct, adminUpdateProduct } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import FormField from '../../components/forms/FormField'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormAlert from '../components/FormAlert'
import ImageUploader from '../components/ImageUploader'
import ProductNamePicker from '../components/ProductNamePicker'
import { useCategoryNames } from '../useCategoryNames'
import { presetsFor } from '../../config/productNames'
import { isDuplicate, parseName, pickerName } from '../../utils/productNames'

const toNumber = (v) => (v === '' || v === null || v === undefined ? null : Number(v))

function toForm(p) {
  return {
    name: p?.name ?? '',
    slug: p?.slug ?? '',
    categoryId: p?.categoryId ?? '',
    shortDescription: p?.shortDescription ?? '',
    description: p?.description ?? '',
    images: (p?.images ?? []).map((i) => ({ url: i.url, publicId: i.publicId || '', alt: i.alt || '' })),
    width: p?.dimensions?.width ?? '',
    depth: p?.dimensions?.depth ?? '',
    height: p?.dimensions?.height ?? '',
    unit: p?.dimensions?.unit ?? 'in',
    materials: p?.materials ?? '',
    colours: (p?.colours ?? []).join(', '),
    specs: (p?.specifications ?? []).map((s) => ({ label: s.label, value: s.value })),
    customizable: p?.customizable ?? false,
    priceLabel: p?.priceLabel ?? '',
    featured: p?.featured ?? false,
    isActive: p?.isActive ?? true,
    displayOrder: p?.displayOrder ?? 0,
  }
}

function Section({ title, hint, children }) {
  return (
    <section className="rounded-2xl bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-walnut">{title}</h2>
      {hint && <p className="mt-1 text-xs text-ink/50">{hint}</p>}
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  )
}

function Check({ checked, onChange, children }) {
  return (
    <label className="flex items-center gap-2 text-sm text-ink">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#6B422F]" />
      {children}
    </label>
  )
}

function ProductFormInner({ initial, categories }) {
  const navigate = useNavigate()
  const location = useLocation()
  // (Save/Cancel ke baad wahi filter wali list, jahan se aaye the.)
  const listPath = `/admin/products${location.state?.listSearch || ''}`
  const editing = Boolean(initial?._id)
  const [v, setV] = useState(() => toForm(initial))
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [serverErrors, setServerErrors] = useState(null)
  const [saving, setSaving] = useState(false)

  // (Form khulte hi page ke upar, heading par focus: owner ko turant dikhe ki kaunsa product khula hai.)
  const headingRef = useRef(null)
  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus({ preventScroll: true })
  }, [])

  const set = (name, value) => {
    setV((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }
  const handleChange = (e) => set(e.target.name, e.target.value)

  // (Naam: category ke chips se chuna jaata hai. Edit mein purana naam tab tak waisa hi rehta hai jab tak admin kuch na badle.)
  const categoryNameOf = (id) => categories.find((c) => c._id === id)?.name ?? ''
  const [initialPick] = useState(() => parseName(initial?.name, presetsFor(categoryNameOf(initial?.categoryId))))
  const [pick, setPick] = useState(initialPick)
  const untouched =
    editing &&
    v.categoryId === initial.categoryId &&
    pick.choice === initialPick.choice &&
    pick.custom === initialPick.custom &&
    pick.detail === initialPick.detail
  const finalName = untouched ? initial.name : pickerName(pick)

  const changePick = (next) => {
    setPick(next)
    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
  }
  // (Category badli toh chuna hua chip hatao, detail rehne do.)
  const changeCategory = (e) => {
    handleChange(e)
    setPick((p) => ({ ...p, choice: '' }))
  }

  const names = useCategoryNames(v.categoryId)
  const others = (names.data ?? []).filter((p) => p._id !== initial?._id).map((p) => p.name)
  const duplicate = Boolean(finalName) && isDuplicate(finalName, others)

  // (Categories ko collection ke hisaab se group karke dikhate hain.)
  const groups = categories.reduce((acc, c) => {
    const key = c.collection?.name ?? 'Other'
    ;(acc[key] ||= []).push(c)
    return acc
  }, {})

  const updateSpec = (index, field, value) =>
    set('specs', v.specs.map((s, i) => (i === index ? { ...s, [field]: value } : s)))

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return

    const found = {}
    if (finalName.trim().length < 2) found.name = 'Please choose or enter the product name.'
    if (!v.categoryId) found.categoryId = 'Please choose a category.'

    const dims = {}
    for (const key of ['width', 'depth', 'height']) {
      const n = toNumber(v[key])
      if (Number.isNaN(n) || (n !== null && n < 0)) found.dimensions = 'Dimensions must be positive numbers.'
      dims[key] = n
    }

    const specRows = v.specs.filter((s) => s.label.trim() || s.value.trim())
    if (specRows.some((s) => !s.label.trim() || !s.value.trim())) {
      found.specs = 'Fill both the name and the value for each specification, or remove the row.'
    }

    if (Object.keys(found).length > 0) {
      setErrors(found)
      setAlert('Please correct the highlighted fields.')
      setServerErrors(null)
      return
    }

    const payload = {
      name: finalName.trim(),
      categoryId: v.categoryId,
      shortDescription: v.shortDescription.trim(),
      description: v.description.trim(),
      images: v.images.map((i) => ({ url: i.url, publicId: i.publicId, alt: i.alt.trim() })),
      dimensions: { ...dims, unit: v.unit },
      materials: v.materials.trim(),
      colours: v.colours.split(',').map((c) => c.trim()).filter(Boolean),
      specifications: specRows.map((s) => ({ label: s.label.trim(), value: s.value.trim() })),
      customizable: v.customizable,
      priceLabel: v.priceLabel.trim(),
      featured: v.featured,
      isActive: v.isActive,
      displayOrder: Math.max(0, Math.trunc(Number(v.displayOrder) || 0)),
    }
    if (v.slug.trim()) payload.slug = v.slug.trim()

    setSaving(true)
    setAlert('')
    setServerErrors(null)
    try {
      const saved = editing ? await adminUpdateProduct(initial._id, payload) : await adminCreateProduct(payload)
      navigate(listPath, {
        state: {
          notice: editing ? `"${payload.name}" saved.` : `"${payload.name}" added.`,
          savedId: saved?._id ?? initial?._id,
        },
      })
    } catch (err) {
      setAlert(err.message)
      setServerErrors(err.errors || null)
      setErrors(err.errors || {})
      setSaving(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  return (
    <form onSubmit={submit} noValidate className="max-w-4xl space-y-6">
      <div>
        <Link to={listPath} className="text-sm text-walnut hover:underline">
          Back to products
        </Link>
        <h1 ref={headingRef} tabIndex={-1} className="mt-2 text-2xl font-bold break-words text-walnut outline-none">
          {editing ? (
            <>
              <span className="text-ink/60">Editing:</span> {initial.name}
            </>
          ) : (
            'Add product'
          )}
        </h1>
      </div>

      <FormAlert message={alert} errors={serverErrors} />

      <Section title="Basic details">
        <div>
          <label htmlFor="field-categoryId" className="text-sm font-medium text-ink">
            Category <span className="text-terracotta">*</span>
          </label>
          <select
            id="field-categoryId"
            name="categoryId"
            value={v.categoryId}
            onChange={changeCategory}
            className={`mt-1 w-full rounded-xl border bg-white px-4 py-3 text-ink outline-none focus:border-walnut ${errors.categoryId ? 'border-danger' : 'border-beige'}`}
          >
            <option value="">Choose a category</option>
            {Object.entries(groups).map(([collectionName, list]) => (
              <optgroup key={collectionName} label={collectionName}>
                {list.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          {errors.categoryId && <p className="mt-1 text-sm text-danger">{errors.categoryId}</p>}
        </div>

        <ProductNamePicker
          idPrefix="field-name"
          categoryName={categoryNameOf(v.categoryId)}
          value={pick}
          onChange={changePick}
          error={errors.name}
          preview={finalName}
          warning={duplicate ? 'A product with this name already exists in this category. Add a detail to tell them apart.' : ''}
        />

        <FormField label="Short description" name="shortDescription" value={v.shortDescription} onChange={handleChange} error={errors.shortDescription} placeholder="One line shown on product cards" />
        <FormField label="Full description" name="description" as="textarea" rows={6} value={v.description} onChange={handleChange} error={errors.description} placeholder="Comfort, fabric, finish and any other details" />
      </Section>

      <Section
        title="Photos"
        hint="Up to 15 photos. The first photo is the main photo shown on cards. Use Set as main or the arrows to change the order."
      >
        <ImageUploader images={v.images} onChange={(arr) => set('images', arr)} max={15} />
      </Section>

      <Section title="Size and materials">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <FormField label="Width" name="width" type="number" value={v.width} onChange={handleChange} />
          <FormField label="Depth" name="depth" type="number" value={v.depth} onChange={handleChange} />
          <FormField label="Height" name="height" type="number" value={v.height} onChange={handleChange} />
          <div>
            <label htmlFor="field-unit" className="text-sm font-medium text-ink">Unit</label>
            <select id="field-unit" name="unit" value={v.unit} onChange={handleChange} className="mt-1 w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-walnut">
              <option value="in">inches</option>
              <option value="cm">cm</option>
              <option value="mm">mm</option>
            </select>
          </div>
        </div>
        {errors.dimensions && <p className="text-sm text-danger">{errors.dimensions}</p>}

        <FormField label="Materials" name="materials" value={v.materials} onChange={handleChange} error={errors.materials} placeholder="e.g. Solid wood frame, fabric upholstery" />
        <FormField label="Colours (separate with commas)" name="colours" value={v.colours} onChange={handleChange} error={errors.colours} placeholder="Beige, Grey, Green" />
      </Section>

      <Section title="Other specifications" hint="Optional, like Seating: 3 seater or Mechanism: Manual recliner.">
        {v.specs.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <input
              value={s.label}
              onChange={(e) => updateSpec(i, 'label', e.target.value)}
              placeholder="Name"
              aria-label={`Specification ${i + 1} name`}
              className="w-40 rounded-xl border border-beige px-3 py-2 text-sm outline-none focus:border-walnut"
            />
            <input
              value={s.value}
              onChange={(e) => updateSpec(i, 'value', e.target.value)}
              placeholder="Value"
              aria-label={`Specification ${i + 1} value`}
              className="min-w-0 flex-1 rounded-xl border border-beige px-3 py-2 text-sm outline-none focus:border-walnut"
            />
            <button type="button" onClick={() => set('specs', v.specs.filter((_, idx) => idx !== i))} aria-label={`Remove specification ${i + 1}`} className="text-ink/40 hover:text-danger">
              <Trash2 size={17} />
            </button>
          </div>
        ))}
        {errors.specs && <p className="text-sm text-danger">{errors.specs}</p>}
        {v.specs.length < 20 && (
          <button type="button" onClick={() => set('specs', [...v.specs, { label: '', value: '' }])} className="inline-flex items-center gap-1 text-sm text-walnut">
            <Plus size={16} /> Add specification
          </button>
        )}
      </Section>

      <Section title="Pricing and visibility">
        <div>
          <FormField label="Price note (internal only, not shown on the website)" name="priceLabel" value={v.priceLabel} onChange={handleChange} error={errors.priceLabel} placeholder="Internal note, never shown" />
          <p className="mt-1 text-xs text-ink/50">Leave empty to show "Price on enquiry".</p>
        </div>
        <FormField label="Display order (smaller shows first)" name="displayOrder" type="number" value={v.displayOrder} onChange={handleChange} error={errors.displayOrder} />
        <div>
          <FormField label="Slug (page link)" name="slug" value={v.slug} onChange={handleChange} error={errors.slug} placeholder="sample-oak-coffee-table" />
          <p className="mt-1 text-xs text-ink/50">
            {editing
              ? 'Changing this changes the product link, so shared links will stop working.'
              : 'Leave empty to create it from the name.'}
          </p>
        </div>
        <Check checked={v.customizable} onChange={(c) => set('customizable', c)}>
          Available in custom size or fabric
        </Check>
        <Check checked={v.featured} onChange={(c) => set('featured', c)}>
          Featured (shown on the home page)
        </Check>
        <Check checked={v.isActive} onChange={(c) => set('isActive', c)}>
          Visible on the website
        </Check>
      </Section>

      <div className="flex gap-3 pb-10">
        <button type="submit" disabled={saving} className="rounded-full bg-walnut px-8 py-3 text-sm font-medium text-white transition hover:brightness-110 disabled:opacity-60">
          {saving ? 'Saving...' : editing ? 'Save changes' : 'Add product'}
        </button>
        <Link to={listPath} className="rounded-full border border-walnut/40 px-8 py-3 text-sm text-walnut">
          Cancel
        </Link>
      </div>
    </form>
  )
}

function ProductFormPage() {
  const { id } = useParams()
  const cats = useAsync(() => adminGetCategories(), 'product-form-categories')
  const prod = useAsync(() => (id ? adminGetProduct(id) : Promise.resolve(null)), `product-form:${id ?? 'new'}`)

  if (cats.loading || prod.loading) return <Loader />
  if (cats.error) return <ErrorState message={cats.error.message} />
  if (prod.error) {
    return <ErrorState message={prod.error.status === 404 ? 'This product does not exist.' : prod.error.message} />
  }

  if (cats.data.length === 0) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
        <p className="font-medium text-walnut">Please add a collection and a category first.</p>
        <Link to="/admin/categories" className="mt-4 inline-block rounded-full bg-walnut px-6 py-2 text-sm text-white">
          Go to categories
        </Link>
      </div>
    )
  }

  return <ProductFormInner key={id ?? 'new'} initial={prod.data} categories={cats.data} />
}

export default ProductFormPage