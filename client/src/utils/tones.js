// (Clay rang ek fixed order mein ghoomte hain. Lilac jaan-boojh kar list mein nahi, use kam use karna hai.)
export const TONES = ['coral', 'mustard', 'sage', 'sky']

export const toneAt = (i) => TONES[((i % TONES.length) + TONES.length) % TONES.length]

// (Text se hamesha same rang: ek hi product ka placeholder har jagah same dikhe.)
export function toneFor(text = '') {
  let sum = 0
  for (const ch of String(text)) sum = (sum + ch.charCodeAt(0)) % 997
  return toneAt(sum)
}
