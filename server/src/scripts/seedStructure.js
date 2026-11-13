import 'dotenv/config'
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import ProductCollection from '../models/ProductCollection.js'
import Category from '../models/Category.js'
import { STRUCTURE } from '../data/catalogueStructure.js'

// npm run seed:structure                 -> 7 collections + starter categories bana/activate karta hai (slug se upsert)
// npm run seed:structure -- --dry-run    -> sirf batata hai kya badlega, kuch save nahi karta
// npm run seed:structure -- --hide-others-> is dhaanche ke bahar wale collections/categories ko isActive=false (delete nahi)
//
// (Products, leads, admins aur images ko kabhi nahi chhoota. Pehle se maujood collection/category ka naam, text,
//  banner aur order wahi rehta hai jo admin mein set hai; sirf hidden ho toh wapas active hota hai.)
const dryRun = process.argv.includes('--dry-run')
const hideOthers = process.argv.includes('--hide-others')

const changes = []
const note = (text) => {
  changes.push(text)
  console.log(`${dryRun ? '[dry-run] ' : ''}${text}`)
}

async function upsertCollection(def, order) {
  let col = await ProductCollection.findOne({ slug: def.slug })
  if (!col) {
    note(`+ collection "${def.name}" (/${def.slug}) created`)
    if (dryRun) return null
    col = await ProductCollection.create({ slug: def.slug, name: def.name, tagline: def.tagline, displayOrder: order })
  } else if (!col.isActive) {
    note(`~ collection "${col.name}" (/${def.slug}) set active`)
    if (!dryRun) await ProductCollection.updateOne({ _id: col._id }, { isActive: true })
  }
  return col
}

async function upsertCategory(col, def, [slug, name], order) {
  // (Collection dry-run mein abhi bana nahi, toh uski categories bhi nayi hi hongi.)
  const cat = col ? await Category.findOne({ collectionId: col._id, slug }) : null
  if (!cat) {
    note(`+ category "${name}" in ${def.name} (/${def.slug}/${slug}) created`)
    if (!dryRun) await Category.create({ slug, name, collectionId: col._id, displayOrder: order })
  } else if (!cat.isActive) {
    note(`~ category "${cat.name}" in ${def.name} set active`)
    if (!dryRun) await Category.updateOne({ _id: cat._id }, { isActive: true })
  }
}

async function hideEverythingElse(keptCollectionIds) {
  const keptSlugs = STRUCTURE.map((d) => d.slug)

  const otherCollections = await ProductCollection.find({ slug: { $nin: keptSlugs }, isActive: true })
  for (const c of otherCollections) {
    note(`- collection "${c.name}" (/${c.slug}) hidden`)
    if (!dryRun) await ProductCollection.updateOne({ _id: c._id }, { isActive: false })
  }

  // (Har rakhi gayi collection ke andar sirf starter categories active rehti hain. Baaki collections ki categories bhi hidden.)
  const activeCategories = await Category.find({ isActive: true }).populate('collectionId', 'slug name').lean()
  for (const cat of activeCategories) {
    const colSlug = cat.collectionId?.slug
    const def = STRUCTURE.find((d) => d.slug === colSlug)
    const keep = def && keptCollectionIds.has(String(cat.collectionId._id)) && def.categories.some(([s]) => s === cat.slug)
    if (!keep) {
      note(`- category "${cat.name}" in ${cat.collectionId?.name || 'unknown collection'} hidden`)
      if (!dryRun) await Category.updateOne({ _id: cat._id }, { isActive: false })
    }
  }
}

async function run() {
  await connectDB()
  console.log(dryRun ? 'Dry run: nothing will be saved.\n' : '')

  const keptCollectionIds = new Set()
  for (const [i, def] of STRUCTURE.entries()) {
    const col = await upsertCollection(def, i)
    if (col) keptCollectionIds.add(String(col._id))
    for (const [j, catDef] of def.categories.entries()) {
      await upsertCategory(col, def, catDef, j)
    }
  }

  if (hideOthers) await hideEverythingElse(keptCollectionIds)

  console.log(
    changes.length === 0
      ? '\nNothing to change. The catalogue structure is already in place.'
      : `\n${changes.length} change(s)${dryRun ? ' would be made. Run again without --dry-run to apply.' : ' made.'}`,
  )
  if (!hideOthers) console.log('Tip: add --hide-others to hide collections and categories that are not part of this structure.')
}

run()
  .catch((err) => {
    console.error('seed:structure failed:', err.message)
    process.exitCode = 1
  })
  .finally(() => mongoose.disconnect())
