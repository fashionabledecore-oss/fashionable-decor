// Small pure helpers for admin product names (no React, no API). Tested by scripts/test-product-names.mjs.

export const CUSTOM = '__custom__'
const MAX_CUSTOM = 80
const MAX_DETAIL = 40

const collapse = (text) => String(text ?? '').replace(/\s+/g, ' ').trim()

// Trim, collapse spaces, max 80 chars; all lower-case text becomes Title Case ("daining table" -> "Daining Table").
export function normalizeCustom(text) {
  let out = collapse(text).slice(0, MAX_CUSTOM).trim()
  if (out && out === out.toLowerCase()) out = out.replace(/(^|[\s(/-])([a-z])/g, (_, pre, ch) => pre + ch.toUpperCase())
  return out
}

// "<base>" or "<base> - <detail>" (detail trimmed, max 40 chars).
export function buildName(base, detail) {
  const b = collapse(base)
  const d = collapse(detail).slice(0, MAX_DETAIL).trim()
  return d ? `${b} - ${d}` : b
}

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// Next two-digit number after the highest existing "<base> NN" (case-insensitive). Empty -> "01".
export function nextNumber(base, existingNames = []) {
  const re = new RegExp(`^${escapeRe(collapse(base))} (\\d+)$`, 'i')
  let max = 0
  for (const name of existingNames) {
    const m = collapse(name).match(re)
    if (m) max = Math.max(max, Number(m[1]))
  }
  return String(max + 1).padStart(2, '0')
}

// Case-insensitive exact match (spaces collapsed).
export function isDuplicate(name, existingNames = []) {
  const n = collapse(name).toLowerCase()
  return Boolean(n) && existingNames.some((e) => collapse(e).toLowerCase() === n)
}

// Picker state { choice, custom, detail } -> final name ('' if nothing chosen yet).
export function pickerName({ choice, custom, detail }) {
  const base = choice === CUSTOM ? normalizeCustom(custom) : choice
  return base ? buildName(base, detail) : ''
}

// Existing name -> picker state. Only an exact preset or "<preset> - <detail>" preselects a chip,
// so re-saving never changes the name; anything else opens "Custom name" with the full name.
export function parseName(name, presets = []) {
  const full = String(name ?? '')
  const sorted = [...presets].sort((a, b) => b.length - a.length)
  for (const p of sorted) {
    if (full === p) return { choice: p, custom: '', detail: '' }
    if (full.startsWith(`${p} - `)) return { choice: p, custom: '', detail: full.slice(p.length + 3) }
  }
  return full ? { choice: CUSTOM, custom: full, detail: '' } : { choice: '', custom: '', detail: '' }
}
