import { useCallback, useEffect, useRef, useState } from 'react'

const behavior = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

const FIRST_FIELD =
  'input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([disabled]), select:not([disabled]), textarea:not([disabled])'

// Inline add/edit form (Categories, Collections, Reviews, Instagram).
// - open(item | 'new'): har tap par nonce badhta hai, isliye scroll HAMESHA hota hai (same item, khula form, Save/Cancel ke baad bhi).
// - Doosra item: form seedha naye item par badal jata hai (key = item id). Unsaved badlav hon toh ek baar confirm.
// - formRef wrapper par lagao, aur wrapper ke onChange se markDirty() chalta hai (formProps).
export function useInlineEditor(nameOf = (item) => item?.name || 'this item') {
  const [state, setState] = useState({ item: null, nonce: 0 })
  const formRef = useRef(null)
  const dirtyRef = useRef(false)

  // (Form mount hone ke BAAD scroll: effect nonce par, aur rAF taaki layout ho chuka ho.)
  useEffect(() => {
    if (!state.item) return
    const frame = requestAnimationFrame(() => {
      const el = formRef.current
      if (!el) return
      el.scrollIntoView({ behavior: behavior(), block: 'start' })
      el.querySelector(FIRST_FIELD)?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [state.nonce, state.item])

  const open = useCallback(
    (item) => {
      const current = state.item
      const sameItem = current && (current === item || (current !== 'new' && item !== 'new' && current._id === item._id))
      if (current && !sameItem && dirtyRef.current) {
        const from = current === 'new' ? 'the new item' : nameOf(current)
        const to = item === 'new' ? 'add a new one' : `edit ${nameOf(item)}`
        if (!window.confirm(`Discard changes to ${from} and ${to}?`)) return
      }
      if (!sameItem) dirtyRef.current = false
      // (Same item: form wahi rehta hai (badlav bache rehte hain), sirf dobara scroll.)
      setState((prev) => ({ item: sameItem ? prev.item : item, nonce: prev.nonce + 1 }))
    },
    [state.item, nameOf],
  )

  const close = useCallback(() => {
    dirtyRef.current = false
    setState((prev) => ({ item: null, nonce: prev.nonce + 1 }))
  }, [])

  const formProps = {
    ref: formRef,
    onChange: () => {
      dirtyRef.current = true
    },
  }

  const editing = state.item
  const formKey = editing === 'new' ? 'new' : editing?._id
  return { editing, formKey, open, close, formProps }
}

// (Save ke baad: list dobara load hone par wahi row dikhao aur thodi der highlight karo.)
export function useSavedRow(ready, initialId = null) {
  const [savedId, setSavedId] = useState(initialId ? String(initialId) : null)

  useEffect(() => {
    if (!savedId || !ready) return
    document.getElementById(`row-${savedId}`)?.scrollIntoView({ behavior: behavior(), block: 'center' })
    const timer = setTimeout(() => setSavedId(null), 4000)
    return () => clearTimeout(timer)
  }, [savedId, ready])

  const markSaved = useCallback((id) => setSavedId(id ? String(id) : null), [])
  return [savedId, markSaved]
}

// (Row ka look: jo edit ho raha hai wo terracotta ring, jo abhi save hua wo green ring.)
export function rowState(id, editing, savedId) {
  if (editing && editing !== 'new' && String(editing._id) === String(id)) return 'ring-2 ring-terracotta bg-butter'
  if (savedId && savedId === String(id)) return 'ring-2 ring-sage'
  return ''
}
