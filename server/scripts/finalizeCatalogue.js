// One-time catalogue finalize in the NEW database (server/.env.new -> NEW_MONGODB_URI, db fashionable_decor).
// Cleans remaining odd product names and regenerates EVERY product slug from its final name.
// Only `name` and `slug` are changed. Images, categories, visibility, order: untouched.
//
//   node scripts/finalizeCatalogue.js          -> DRY RUN (prints everything, writes nothing)
//   node scripts/finalizeCatalogue.js --run    -> backup to migration-output/, then update name + slug
//
// Name rules (createdAt order, hidden products included; clean names stay exactly as they are):
//   a. Whole-word typo fixes, case-preserving: Daining->Dining, Blainds->Blinds, Leving->Living, Cuttens->Curtains.
//   e. Name starting with "WhatsApp Image", "IMG", "Screenshot" or "Photo", only digits, or longer than 60 chars ->
//      "<Category name, singular> NN", NN = next free number among names in categories with that same name.
//   d. A final name still shared by 2+ products (trimmed, case-insensitive) -> " NN" on all of them (next free).
// Slug rule: slugify(final name) (same helper as the app), unique across all products, collisions -> -2, -3, ...
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { slugify } from '../src/utils/slugify.js';

const serverDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DB = 'fashionable_decor';
const RUN = process.argv.includes('--run');
const { MongoClient } = mongoose.mongo;

function loadEnv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    if (line.trim().startsWith('#')) continue;
    const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    let v = m[2].trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    out[m[1]] = v;
  }
  return out;
}

// (Sirf .env.new. Purana server/.env (old database) yahan kabhi load nahi hota.)
const NEW_URI = loadEnv(path.join(serverDir, '.env.new')).NEW_MONGODB_URI;
if (!NEW_URI) {
  console.error('STOP: NEW_MONGODB_URI is missing in server/.env.new. Nothing was changed.');
  process.exit(1);
}

const TYPOS = { daining: 'dining', blainds: 'blinds', leving: 'living', cuttens: 'curtains' };
const NEW_WORDS = ['leving', 'cuttens'];
const TYPO_RE = new RegExp(`\\b(${Object.keys(TYPOS).join('|')})\\b`, 'gi');
const NEW_WORD_RE = new RegExp(`\\b(${NEW_WORDS.join('|')})\\b`, 'i');

function matchCase(original, fixed) {
  if (original === original.toUpperCase()) return fixed.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return fixed[0].toUpperCase() + fixed.slice(1);
  return fixed;
}
const fixTypos = (text) => text.replace(TYPO_RE, (w) => matchCase(w, TYPOS[w.toLowerCase()]));

// (Rule e: camera/file jaisa naam, sirf number, ya bahut lamba.)
const isOddName = (name) => {
  const n = name.trim();
  return /^(whatsapp\s*image|img|screenshot|photo)(?![a-z])/i.test(n) || /^\d+$/.test(n) || n.length > 60;
};

// (Same as fixProductNames.js rule b: aakhri word ka "s" hatao ("Sofa Sets" -> "Sofa Set"), "ss" wale nahi.)
function singular(categoryName) {
  const words = fixTypos(categoryName.trim()).split(/\s+/);
  const last = words[words.length - 1];
  if (/[^s]s$/i.test(last) && last.length > 3) words[words.length - 1] = last.slice(0, -1);
  return words.join(' ');
}

const keyOf = (s) => String(s).trim().toLowerCase();
const pad = (n) => String(n).padStart(2, '0');
const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function highestNumber(base, names) {
  const re = new RegExp(`^${escapeRe(base.trim())} (\\d+)$`, 'i');
  let max = 0;
  for (const n of names) {
    const m = String(n).trim().match(re);
    if (m) max = Math.max(max, Number(m[1]));
  }
  return max;
}

async function main() {
  const client = new MongoClient(NEW_URI);
  await client.connect();
  try {
    const db = client.db(DB);
    const products = await db
      .collection('products')
      .find({}, { projection: { name: 1, slug: 1, categoryId: 1, createdAt: 1 } })
      .sort({ createdAt: 1, _id: 1 })
      .toArray();
    const categories = await db.collection('categories').find({}, { projection: { name: 1 } }).toArray();
    const categoryName = new Map(categories.map((c) => [String(c._id), c.name]));

    // ---- Rule a ----
    const plan = products.map((p) => {
      const old = String(p.name ?? '');
      const afterA = fixTypos(old);
      return {
        _id: p._id,
        old,
        oldSlug: String(p.slug ?? ''),
        cat: categoryName.get(String(p.categoryId)) ?? '',
        next: afterA,
        ruleA: afterA !== old,
        newWord: NEW_WORD_RE.test(old),
      };
    });

    // ---- Rule e ----
    let eNoCategory = 0;
    const odd = plan.filter((i) => isOddName(i.next));
    const taken = new Set(plan.filter((i) => !odd.includes(i)).map((i) => keyOf(i.next)));
    const nextFree = new Map(); // key: category name (trim, lower) -> next number
    for (const item of odd) {
      if (!item.cat) {
        eNoCategory++;
        continue;
      }
      const catKey = keyOf(item.cat);
      const base = singular(item.cat);
      if (!nextFree.has(catKey)) {
        const sameNameCats = plan.filter((i) => keyOf(i.cat) === catKey && !odd.includes(i)).map((i) => i.next);
        nextFree.set(catKey, highestNumber(base, sameNameCats) + 1);
      }
      let n = nextFree.get(catKey);
      let candidate;
      do candidate = `${base} ${pad(n++)}`;
      while (taken.has(keyOf(candidate)));
      nextFree.set(catKey, n);
      taken.add(keyOf(candidate));
      item.next = candidate;
      item.ruleE = true;
    }
    // (Category na mile toh odd naam waisa hi; taken mein daal do taaki rule d use dekhe.)
    for (const item of odd) if (!item.ruleE) taken.add(keyOf(item.next));

    // ---- Rule d ----
    const groups = new Map();
    for (const item of plan) {
      const k = keyOf(item.next);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(item);
    }
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const base = list[0].next.trim();
      let n = highestNumber(base, [...taken]) + 1;
      for (const item of list) {
        let candidate;
        do candidate = `${base} ${pad(n++)}`;
        while (taken.has(keyOf(candidate)));
        taken.add(keyOf(candidate));
        item.next = candidate;
        item.ruleD = true;
      }
    }

    // ---- Slugs (createdAt order, -2, -3 on collision) ----
    const usedSlugs = new Set();
    let slugCollisions = 0;
    for (const item of plan) {
      const base = slugify(item.next) || 'product';
      let slug = base;
      for (let k = 2; usedSlugs.has(slug); k++) slug = `${base}-${k}`;
      if (slug !== base) slugCollisions++;
      usedSlugs.add(slug);
      item.slug = slug;
    }

    const nameChanged = plan.filter((i) => i.next !== i.old);
    const slugChanged = plan.filter((i) => i.slug !== i.oldSlug);
    const changes = plan.filter((i) => i.next !== i.old || i.slug !== i.oldSlug);
    const count = (fn) => plan.filter(fn).length;

    console.log(`Mode: ${RUN ? 'RUN' : 'DRY RUN (nothing written)'}`);
    console.log(`Total products: ${products.length}`);
    console.log(`Names changed by rule a (typo): ${count((i) => i.ruleA)}`);
    console.log(`Names changed by rule e (odd name -> category + NN): ${count((i) => i.ruleE)}`);
    if (eNoCategory) console.log(`  Odd names left as is (category not found): ${eNoCategory}`);
    console.log(`Names changed by rule d (shared name -> + NN): ${count((i) => i.ruleD)}`);
    console.log(`Total names changed: ${nameChanged.length}`);
    console.log(`Slugs changed: ${slugChanged.length}`);
    console.log(`Slug collisions resolved (-2, -3, ...): ${slugCollisions}`);
    console.log(`Products to update (name and/or slug): ${changes.length}`);

    const listed = plan.filter((i) => i.ruleE || i.newWord);
    console.log(`\nAll renames by rule e or new typo words (Leving, Cuttens): ${listed.length}`);
    for (const i of listed) console.log(`  "${i.old}" -> "${i.next}"`);

    console.log('\nFirst 20 slug changes:');
    for (const i of slugChanged.slice(0, 20)) console.log(`  ${i.oldSlug} -> ${i.slug}`);

    const nameCount = new Map();
    for (const i of plan) nameCount.set(keyOf(i.next), (nameCount.get(keyOf(i.next)) || 0) + 1);
    const slugCount = new Map();
    for (const i of plan) slugCount.set(i.slug, (slugCount.get(i.slug) || 0) + 1);
    console.log(`\nProducts whose final name is not unique (whole DB): ${plan.filter((i) => nameCount.get(keyOf(i.next)) > 1).length}`);
    console.log(`Products whose final slug is not unique (whole DB): ${plan.filter((i) => slugCount.get(i.slug) > 1).length}`);

    if (!RUN) return;
    if (!changes.length) {
      console.log('Nothing to update.');
      return;
    }

    const outDir = path.join(serverDir, 'migration-output');
    fs.mkdirSync(outDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(outDir, `catalogue-backup-${stamp}.json`);
    fs.writeFileSync(
      backupFile,
      JSON.stringify(products.map((p) => ({ _id: String(p._id), name: p.name, slug: p.slug })), null, 2),
    );
    console.log(`Backup written: ${path.relative(serverDir, backupFile)}`);

    const col = db.collection('products');
    // (Slug par unique index hai: pehle badalne wale slugs ko temporary banao, phir final name + slug.)
    const movers = changes.filter((i) => i.slug !== i.oldSlug);
    if (movers.length) {
      await col.bulkWrite(
        movers.map((i) => ({
          updateOne: { filter: { _id: i._id, slug: i.oldSlug }, update: { $set: { slug: `tmp-${String(i._id)}` } } },
        })),
        { ordered: true },
      );
    }
    const result = await col.bulkWrite(
      changes.map((i) => ({
        updateOne: { filter: { _id: i._id }, update: { $set: { name: i.next, slug: i.slug } } },
      })),
      { ordered: true },
    );
    console.log(`Updated: ${result.modifiedCount} of ${changes.length}`);
  } finally {
    await client.close();
  }
}

main().catch((err) => {
  // (Connection string kabhi print nahi hoti: sirf error message.)
  console.error(`Failed: ${String(err.message).replace(/mongodb(\+srv)?:\/\/\S+/gi, '<uri hidden>')}`);
  process.exit(1);
});
