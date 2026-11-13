import { useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { adminCreateContent, adminDeleteContent, adminListContent, adminUpdateContent } from '../../services/api'
import { useAsync } from '../../hooks/useAsync'
import Loader from '../../components/common/Loader'
import ErrorState from '../../components/common/ErrorState'
import FormAlert from './FormAlert'
import { saveNewOrder } from '../reorder'

// (Reviews aur Instagram ka ek jaisa admin page: list (phone par cards), add/edit form,
//  order up/down, show/hide, delete. Har page sirf apne fields aur card ka look deta hai.)
//
// kind: 'reviews' | 'instagram'
// toForm(item|null) -> form values. toPayload(values) -> { payload } ya { error }.
// renderFields({ values, set, errors }) -> form fields. renderItem(item) -> card ka andar wala hissa.
function ContentManager({ kind, title, intro, addLabel, emptyText, note, toForm, toPayload, renderFields, renderItem }) {
  const [version, setVersion] = useState(0)
  const [editing, setEditing] = useState(null) // null | 'new' | item
  const [notice, setNotice] = useState('')
  const [problem, setProblem] = useState('')

  const { data, loading, error } = useAsync(() => adminListContent(kind), `admin-${kind}:${version}`)
  const items = data ?? []
  const reload = () => setVersion((v) => v + 1)

  const run = async (fn, message) => {
    setNotice('')
    setProblem('')
    try {
      await fn()
      if (message) setNotice(message)
      reload()
    } catch (err) {
      setProblem(err.message)
    }
  }

  // (Order up/down: items ka displayOrder list ki position ke hisaab se set ho jata hai.)
  const move = (index, dir) =>
    run(() => saveNewOrder(items, index, dir, (id, body) => adminUpdateContent(kind, id, body)))

  const remove = (item) => {
    if (!window.confirm('Delete this permanently? This cannot be undone.')) return
    run(() => adminDeleteContent(kind, item._id), 'Deleted.')
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-walnut">{title}</h1>
          <p className="mt-1 max-w-xl text-sm text-ink/60">{intro}</p>
        </div>
        {!editing && (
          <button
            type="button"
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-2 rounded-full bg-walnut px-5 py-2.5 text-sm font-medium text-white"
          >
            <Plus size={16} /> {addLabel}
          </button>
        )}
      </div>

      {note && <p className="mt-4 rounded-xl bg-butter px-4 py-3 text-sm text-ink">{note}</p>}
      {notice && <p className="mt-4 rounded-xl bg-sage/20 px-4 py-3 text-sm text-ink">{notice}</p>}
      {problem && (
        <p className="mt-4 rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">
          {problem}
        </p>
      )}

      {editing && (
        <ContentForm
          key={editing === 'new' ? 'new' : editing._id}
          kind={kind}
          initial={editing === 'new' ? null : editing}
          nextOrder={items.length}
          toForm={toForm}
          toPayload={toPayload}
          renderFields={renderFields}
          onCancel={() => setEditing(null)}
          onSaved={(message) => {
            setEditing(null)
            setProblem('')
            setNotice(message)
            reload()
          }}
        />
      )}

      {loading && <Loader />}
      {error && <ErrorState message={error.message} />}

      {data && items.length === 0 && !editing && (
        <p className="mt-6 rounded-2xl bg-white p-8 text-center text-sm text-ink/60">{emptyText}</p>
      )}

      {items.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, i) => (
            <li key={item._id} className={`flex flex-col rounded-2xl bg-white p-3 shadow-sm ${item.isActive ? '' : 'opacity-60'}`}>
              <div className="flex-1">{renderItem(item)}</div>
              <div className="mt-3 flex items-center gap-1 border-t border-beige pt-3">
                <button type="button" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up" className="rounded-full bg-beige p-2 text-walnut disabled:opacity-30">
                  <ArrowUp size={16} />
                </button>
                <button type="button" onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="Move down" className="rounded-full bg-beige p-2 text-walnut disabled:opacity-30">
                  <ArrowDown size={16} />
                </button>
                <button
                  type="button"
                  onClick={() => run(() => adminUpdateContent(kind, item._id, { isActive: !item.isActive }), item.isActive ? 'Hidden from the website.' : 'Visible on the website.')}
                  className="ml-1 inline-flex items-center gap-1 rounded-full bg-beige px-3 py-2 text-xs text-walnut"
                >
                  {item.isActive ? <><EyeOff size={14} /> Hide</> : <><Eye size={14} /> Show</>}
                </button>
                <button type="button" onClick={() => setEditing(item)} aria-label="Edit" className="ml-auto p-2 text-walnut">
                  <Pencil size={17} />
                </button>
                <button type="button" onClick={() => remove(item)} aria-label="Delete" className="p-2 text-ink/40 hover:text-danger">
                  <Trash2 size={17} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function ContentForm({ kind, initial, nextOrder, toForm, toPayload, renderFields, onCancel, onSaved }) {
  const editing = Boolean(initial?._id)
  const [values, setValues] = useState(() => ({ isActive: true, ...toForm(initial) }))
  const [errors, setErrors] = useState({})
  const [alert, setAlert] = useState('')
  const [serverErrors, setServerErrors] = useState(null)
  const [saving, setSaving] = useState(false)

  const set = (name, value) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  const submit = async (e) => {
    e.preventDefault()
    if (saving) return
    const { payload, errors: found } = toPayload(values)
    if (found && Object.keys(found).length > 0) {
      setErrors(found)
      return
    }
    const body = { ...payload, isActive: values.isActive }
    if (!editing) body.displayOrder = nextOrder

    setSaving(true)
    setAlert('')
    setServerErrors(null)
    try {
      if (editing) await adminUpdateContent(kind, initial._id, body)
      else await adminCreateContent(kind, body)
      onSaved(editing ? 'Saved.' : 'Added.')
    } catch (err) {
      setAlert(err.message)
      setServerErrors(err.errors || null)
      setErrors(err.errors || {})
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="mt-6 space-y-4 rounded-2xl bg-white p-4 shadow-sm sm:p-6">
      {renderFields({ values, set, errors })}

      <label className="flex items-center gap-2 text-sm text-ink">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(e) => set('isActive', e.target.checked)}
          className="h-5 w-5 accent-[#B4462F]"
        />
        Active (visible on the website)
      </label>

      <FormAlert message={alert} errors={serverErrors} />

      <div className="flex gap-3">
        <button type="submit" disabled={saving} className="rounded-full bg-walnut px-6 py-2.5 text-sm font-medium text-white disabled:opacity-60">
          {saving ? 'Saving...' : 'Save'}
        </button>
        <button type="button" onClick={onCancel} className="rounded-full border border-walnut/40 px-6 py-2.5 text-sm text-walnut">
          Cancel
        </button>
      </div>
    </form>
  )
}

// (Plain admin select, FormField ki tarah label ke saath.)
export function SelectField({ label, name, value, onChange, options, error }) {
  const id = `field-${name}`
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
      </label>
      <select id={id} name={name} value={value} onChange={onChange} className="clay-well mt-1.5">
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-sm font-medium text-danger">{error}</p>}
    </div>
  )
}

export default ContentManager
