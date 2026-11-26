// One-time fix of product NAMES in the NEW database (server/.env.new -> NEW_MONGODB_URI, db fashionable_decor).
// Only `name` is changed. Slugs, images, categories, visibility: untouched.
//
//   node scripts/fixProductNames.js          -> DRY RUN (prints changes, writes nothing)
//   node scripts/fixProductNames.js --run    -> backup to migration-output/, then update names
//
// Rules:
//   a. Whole-word typo fixes, case-preserving: Daining -> Dining, Blainds -> Blinds.
//   b. Name that is only a number (camera-style, e.g. 1000139586, IMG_1234) ->
//      "<Category name, singular> NN", running number per category in createdAt order.
//   c. Everything else unchanged.
//   d. After a-c: a final name shared by 2+ products (trimmed, case-insensitive) gets " NN" on ALL of them,
//      createdAt order, skipping numbers that would collide with any existing or new name.
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';

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

const TYPOS = { daining: 'dining', blainds: 'blinds' };
const TYPO_RE = new RegExp(`\\b(${Object.keys(TYPOS).join('|')})\\b`, 'gi');

function matchCase(original, fixed) {
  if (original === original.toUpperCase()) return fixed.toUpperCase();
  if (original[0] === original[0].toUpperCase()) return fixed[0].toUpperCase() + fixed.slice(1);
  return fixed;
}

const fixTypos = (text) => text.replace(TYPO_RE, (w) => matchCase(w, TYPOS[w.toLowerCase()]));

// (Sirf number, ya camera jaisa naam: "1000139586", "IMG_1234", "IMG-2024 0101".)
const isNumberName = (name) => /^(img|dsc|pxl)?[\s_-]*\d[\d\s_-]*$/i.test(name.trim());

// (Category ka naam singular: aakhri word ka "s" hatao ("Sofa Sets" -> "Sofa Set"), "ss" wale nahi.)
function singular(categoryName) {
  const words = fixTypos(categoryName.trim()).split(/\s+/);
  const last = words[words.length - 1];
  if (/[^s]s$/i.test(last) && last.length > 3) words[words.length - 1] = last.slice(0, -1);
  return words.join(' ');
}

async function main() {
  const client = new MongoClient(NEW_URI);
  await client.connect();
  try {
    const db = client.db(DB);
    const products = await db
      .collection('products')
      .find({}, { projection: { name: 1, categoryId: 1, createdAt: 1 } })
      .sort({ createdAt: 1, _id: 1 })
      .toArray();
    const categories = await db.collection('categories').find({}, { projection: { name: 1 } }).toArray();
    const categoryName = new Map(categories.map((c) => [String(c._id), c.name]));

    const keyOf = (s) => String(s).trim().toLowerCase();
    const pad = (n) => String(n).padStart(2, '0');
    const counters = new Map();
    let numberNoCategory = 0;

    // Rules a, b, c: one plan item per product (products are already in createdAt order).
    const plan = products.map((p) => {
      const old = String(p.name ?? '');
      if (isNumberName(old)) {
        const cat = categoryName.get(String(p.categoryId));
        if (!cat) {
          numberNoCategory++;
          return { _id: p._id, old, next: old, rule: 'c' };
        }
        // (Number category ke NAAM par chalta hai (trim, case-insensitive), document par nahi: alag collections
        //  ki same naam wali categories (Beds, Curtains, Wallpaper) se kabhi do "Bed 01" nahi banenge.)
        const key = keyOf(cat);
        const n = (counters.get(key) || 0) + 1;
        counters.set(key, n);
        return { _id: p._id, old, next: `${singular(cat)} ${pad(n)}`, rule: 'b' };
      }
      const next = fixTypos(old);
      return { _id: p._id, old, next, rule: next !== old ? 'a' : 'c' };
    });

    // Rule d: a final name still shared by 2+ products -> " NN" on ALL of them, createdAt order,
    // skipping any number whose result already exists (existing or new names).
    const groups = new Map();
    for (const item of plan) {
      const k = keyOf(item.next);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(item);
    }
    const taken = new Set(plan.map((item) => keyOf(item.next)));
    for (const list of groups.values()) {
      if (list.length < 2) continue;
      const base = list[0].next.trim();
      let n = 1;
      for (const item of list) {
        let candidate;
        do candidate = `${base} ${pad(n++)}`;
        while (taken.has(keyOf(candidate)));
        taken.add(keyOf(candidate));
        item.next = candidate;
        item.ruleD = true;
      }
    }

    const changes = plan.filter((item) => item.next !== item.old);
    const count = (fn) => plan.filter(fn).length;

    console.log(`Mode: ${RUN ? 'RUN' : 'DRY RUN (nothing written)'}`);
    console.log(`Total products: ${products.length}`);
    console.log(`Rule a (typo fix): ${count((i) => i.rule === 'a')}`);
    console.log(`Rule b (number name -> category name + NN): ${count((i) => i.rule === 'b')}`);
    console.log(`Rule c (left as is by a/b): ${count((i) => i.rule === 'c')}`);
    console.log(`Rule d (shared name -> name + NN): ${count((i) => i.ruleD)} (of these, after a typo fix: ${count((i) => i.ruleD && i.rule === 'a')})`);
    if (numberNoCategory) console.log(`Number names skipped (category not found): ${numberNoCategory}`);
    console.log(`Unchanged in the end: ${products.length - changes.length}`);
    console.log(`Would change: ${changes.length}`);

    console.log('Rule d, first 15:');
    for (const c of plan.filter((i) => i.ruleD).slice(0, 15)) console.log(`  "${c.old}" -> "${c.next}"`);
    // (Har nayi category-name ka ek example, taaki rule b ke naam bhi dikhein.)
    const seen = new Set();
    const samples = plan.filter((c) => c.rule === 'b').filter((c) => {
      const b = c.next.replace(/\s\d+$/, '');
      return !seen.has(b) && seen.add(b);
    });
    if (samples.length) {
      console.log('Rule b examples (one per category):');
      for (const c of samples) console.log(`  "${c.old}" -> "${c.next}"`);
    }

    // (Uniqueness check: sabke final naam (badle + unchanged), poore database mein, case-insensitive.)
    const finalCount = new Map();
    for (const item of plan) finalCount.set(keyOf(item.next), (finalCount.get(keyOf(item.next)) || 0) + 1);
    const notUnique = plan.filter((item) => finalCount.get(keyOf(item.next)) > 1);
    console.log(`Products whose new name is not unique (whole DB): ${notUnique.length}`);
    if (notUnique.length) {
      const repeated = [...finalCount].filter(([, n]) => n > 1).map(([name, n]) => `"${name}" x${n}`);
      console.log(`  Repeated names: ${repeated.join(', ')}`);
    }

    if (!RUN) return;
    if (!changes.length) {
      console.log('Nothing to update.');
      return;
    }

    const outDir = path.join(serverDir, 'migration-output');
    fs.mkdirSync(outDir, { recursive: true });
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(outDir, `names-backup-${stamp}.json`);
    fs.writeFileSync(
      backupFile,
      JSON.stringify(products.map((p) => ({ _id: String(p._id), name: p.name })), null, 2),
    );
    console.log(`Backup written: ${path.relative(serverDir, backupFile)}`);

    const result = await db.collection('products').bulkWrite(
      changes.map((c) => ({
        updateOne: { filter: { _id: c._id, name: c.old }, update: { $set: { name: c.next } } },
      })),
      { ordered: false },
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
