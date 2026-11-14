import { Pencil, Plus } from 'lucide-react'

// (Form ke upar saaf dikhe ki kya edit ho raha hai, aur Cancel ek tap mein.)
function EditingBanner({ name, isNew = false, onCancel }) {
  const Icon = isNew ? Plus : Pencil
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl bg-butter px-4 py-3 text-sm text-ink" role="status">
      <p className="flex min-w-0 items-center gap-2">
        <Icon size={16} className="shrink-0 text-walnut" />
        <span className="truncate">
          <span className="font-semibold">{isNew ? 'Adding:' : 'Editing:'}</span> {name}
        </span>
      </p>
      <button
        type="button"
        onClick={onCancel}
        className="shrink-0 rounded-full border border-walnut/40 bg-white px-4 py-1.5 text-sm text-walnut"
      >
        Cancel
      </button>
    </div>
  )
}

export default EditingBanner
