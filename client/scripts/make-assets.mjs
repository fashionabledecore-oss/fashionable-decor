// One-time asset script (NOT part of the build). Run: node scripts/make-assets.mjs
// Makes the light hero WebPs, the 1200x630 social image and the "FD" placeholder icons.
// Brand colour = --color-coral in src/index.css (also the fill of the old favicon mark).
import { readFile, writeFile, stat } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const pub = join(root, 'public')
const src = join(pub, 'images', 'hero.jpg')

async function brandColour() {
  const css = await readFile(join(root, 'src', 'index.css'), 'utf8')
  const m = css.match(/--color-coral:\s*(#[0-9a-f]{3,8})/i)
  if (!m) throw new Error('--color-coral not found in src/index.css')
  return m[1]
}

// (Quality 78 se shuru, 4-4 kam, 55 se neeche nahi; jo pehli baar limit mein aaye wahi.)
async function webpUnder(width, maxKB, out) {
  let buf
  for (let q = 78; q >= 55; q -= 4) {
    buf = await sharp(src).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: q }).toBuffer()
    if (buf.length <= maxKB * 1024) break
  }
  await writeFile(out, buf)
}

const kb = async (f) => `${((await stat(f)).size / 1024).toFixed(1)} KB`

async function main() {
  const colour = await brandColour()

  const hero1600 = join(pub, 'images', 'hero-1600.webp')
  const hero800 = join(pub, 'images', 'hero-800.webp')
  await webpUnder(1600, 250, hero1600)
  await webpUnder(800, 100, hero800)

  const og = join(pub, 'og-image.jpg')
  await sharp(src).rotate().resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile(og)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64">
  <rect width="64" height="64" rx="14" fill="${colour}"/>
  <text x="32" y="42" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700" fill="#ffffff">FD</text>
</svg>
`
  await writeFile(join(pub, 'favicon.svg'), svg)
  await sharp(Buffer.from(svg), { density: 300 }).resize(32, 32).png().toFile(join(pub, 'favicon-32.png'))
  // (Apple icon: rounded corners iOS khud lagata hai, isliye poora square.)
  const appleSvg = svg.replace('rx="14"', 'rx="0"')
  await sharp(Buffer.from(appleSvg), { density: 600 }).resize(180, 180).png().toFile(join(pub, 'apple-touch-icon.png'))

  const ogMeta = await sharp(og).metadata()
  console.log(`hero-1600.webp  ${await kb(hero1600)}`)
  console.log(`hero-800.webp   ${await kb(hero800)}`)
  console.log(`og-image.jpg    ${await kb(og)} (${ogMeta.width}x${ogMeta.height})`)
  console.log(`favicon.svg     ${await kb(join(pub, 'favicon.svg'))}`)
  console.log(`favicon-32.png  ${await kb(join(pub, 'favicon-32.png'))}`)
  console.log(`apple-touch-icon.png ${await kb(join(pub, 'apple-touch-icon.png'))}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
