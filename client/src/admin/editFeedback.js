import { useCallback, useEffect, useRef, useState } from 'react'

const behavior = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'

const FIRST_FIELD =
  'input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([disabled]), select:not([disabled]), textarea:not([disabled])'

// (Edit/Add dabate hi form tak smooth scroll aur pehle field par focus. editKey = item id ya 'new'.)
export function useEditFocus(editKey) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!editKey || !el) return
    el.scrollIntoView({ behavior: behavior(), block: 'start' })
    el.querySelector(FIRST_FIELD)?.focus({ preventScroll: true })
  }, [editKey])
  return ref
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
