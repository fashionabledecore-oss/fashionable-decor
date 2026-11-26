import { presetsFor } from '../../config/productNames'
import { CUSTOM } from '../../utils/productNames'

const inputClass =
  'mt-1 w-full rounded-xl border border-beige bg-white px-4 py-3 text-ink outline-none focus:border-walnut disabled:bg-beige/30'

const chipClass = (on) =>
  `inline-flex min-h-11 items-center rounded-full border-2 px-4 py-2 text-sm font-medium transition disabled:opacity-60 ${
    on ? 'border-walnut bg-butter text-ink' : 'border-beige bg-white text-ink/80 hover:border-walnut/50'
  }`

/**
 * Tap-to-choose product name: category presets as chips + "Custom name" + optional detail.
 * value = { choice, custom, detail }. preview = final name text. warning = non-blocking note.
 * suffix = text shown after the preview (bulk add: " 01, 02 ...").
 */
function ProductNamePicker({ idPrefix, categoryName, value, onChange, disabled = false, error, preview, previewSuffix = '', warning }) {
  const presets = presetsFor(categoryName)
  const set = (patch) => onChange({ ...value, ...patch })

  return (
    <fieldset aria-describedby={error ? `${idPrefix}-error` : undefined}>
      <legend className="text-sm font-medium text-ink">
        Product name <span className="text-terracotta">*</span>
      </legend>

      {!categoryName ? (
        <p className="mt-1 text-sm text-ink/60">Choose a category first, then tap a name.</p>
      ) : (
        <>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Product name">
            {[...presets, CUSTOM].map((p) => {
              const on = value.choice === p
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  disabled={disabled}
                  onClick={() => set({ choice: p })}
                  className={chipClass(on)}
                >
                  {p === CUSTOM ? 'Custom name' : p}
                </button>
              )
            })}
          </div>

          {value.choice === CUSTOM && (
            <div className="mt-3">
              <label htmlFor={`${idPrefix}-custom`} className="text-sm font-medium text-ink">
                Custom name
              </label>
              <input
                id={`${idPrefix}-custom`}
                value={value.custom}
                onChange={(e) => set({ custom: e.target.value })}
                disabled={disabled}
                maxLength={80}
                spellCheck
                autoCapitalize="words"
                lang="en"
                placeholder="e.g. Chesterfield Sofa"
                className={inputClass}
              />
            </div>
          )}

          <div className="mt-3">
            <label htmlFor={`${idPrefix}-detail`} className="text-sm font-medium text-ink">
              Detail (optional), for example Grey velvet
            </label>
            <input
              id={`${idPrefix}-detail`}
              value={value.detail}
              onChange={(e) => set({ detail: e.target.value })}
              disabled={disabled}
              maxLength={40}
              spellCheck
              lang="en"
              className={inputClass}
            />
          </div>

          <p className="mt-3 text-sm text-ink">
            Name on website: <strong>{preview ? `${preview}${previewSuffix}` : '-'}</strong>
          </p>
          {warning && <p className="mt-1 text-xs text-terracotta">{warning}</p>}
        </>
      )}
      {error && (
        <p id={`${idPrefix}-error`} className="mt-1 text-sm text-danger">
          {error}
        </p>
      )}
    </fieldset>
  )
}

export default ProductNamePicker
