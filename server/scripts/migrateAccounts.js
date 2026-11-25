import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

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

const oldEnv = loadEnv(path.join(serverDir, '.env'));
const newEnv = loadEnv(path.join(serverDir, '.env.new'));
const OLD_URI = oldEnv.MONGODB_URI;
const OLD_CLOUD = oldEnv.CLOUDINARY_CLOUD_NAME;
const NEW_URI = newEnv.NEW_MONGODB_URI;
const NEW_CLOUD = newEnv.NEW_CLOUDINARY_CLOUD_NAME;
const NEW_KEY = newEnv.NEW_CLOUDINARY_API_KEY;
const NEW_SECRET = newEnv.NEW_CLOUDINARY_API_SECRET;

if (!OLD_URI || !OLD_CLOUD || !NEW_URI || !NEW_CLOUD || !NEW_KEY || !NEW_SECRET) {
  console.log('STOP: kuch value missing hai (.env ya .env.new check kar).');
  process.exit(1);
}
if (OLD_URI === NEW_URI || OLD_CLOUD === NEW_CLOUD) {
  console.log('STOP: old aur new same hain. .env mein purani values, .env.new mein nayi values honi chahiye.');
  process.exit(1);
}

function check(label, uri) {
  const at = uri.lastIndexOf('@');
  const host = at >= 0 ? uri.slice(at + 1).split(/[/?]/)[0] : '(no @)';
  console.log(label, {
    scheme_ok: /^mongodb(\+srv)?:\/\//.test(uri),
    has_angle_brackets: /[<>]/.test(uri),
    has_space: /\s/.test(uri),
    at_signs: (uri.match(/@/g) || []).length,
    host,
  });
}
check('OLD', OLD_URI);
check('NEW', NEW_URI);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const urlRe = (cloud) =>
  new RegExp(`https?://res\\.cloudinary\\.com/${esc(cloud)}/(image|video|raw)/upload/[^\\s"'<>)\\\\]+`, 'g');
const isPlain = (v) => v && typeof v === 'object' && Object.getPrototypeOf(v) === Object.prototype;

function collectUrls(v, set, cloud) {
  if (typeof v === 'string') for (const m of v.matchAll(urlRe(cloud))) set.add(m[0]);
  else if (Array.isArray(v)) v.forEach((x) => collectUrls(x, set, cloud));
  else if (isPlain(v)) Object.values(v).forEach((x) => collectUrls(x, set, cloud));
}
function rewrite(v, map) {
  if (typeof v === 'string') return v.replace(urlRe(OLD_CLOUD), (u) => map[u] || u);
  if (Array.isArray(v)) return v.map((x) => rewrite(x, map));
  if (isPlain(v)) {
    const o = {};
    for (const [k, x] of Object.entries(v)) o[k] = rewrite(x, map);
    return o;
  }
  return v;
}

function parseUrl(u) {
  const m = u.match(/^https?:\/\/res\.cloudinary\.com\/[^/]+\/(image|video|raw)\/upload\/(.+)$/);
  const rtype = m[1];
  let segs = m[2].split('?')[0].split('/');
  const vi = segs.findIndex((s) => /^v\d+$/.test(s));
  let version = null;
  if (vi >= 0) {
    version = segs[vi];
    segs = segs.slice(vi + 1);
  } else {
    while (segs.length > 1 && /^[a-z]{1,3}_[^/]*$/.test(segs[0])) segs.shift();
  }
  let id = decodeURIComponent(segs.join('/'));
  if (rtype !== 'raw') id = id.replace(/\.[A-Za-z0-9]+$/, '');
  const original = `https://res.cloudinary.com/${OLD_CLOUD}/${rtype}/upload/${version ? version + '/' : ''}${segs.join('/')}`;
  return { rtype, id, original };
}

function upload(buf, { rtype, id }) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ public_id: id, resource_type: rtype, overwrite: true }, (e, r) => (e ? reject(e) : resolve(r)))
      .end(buf);
  });
}
async function pool(items, n, fn) {
  let i = 0;
  await Promise.all(
    Array.from({ length: n }, async () => {
      while (i < items.length) await fn(items[i++]);
    })
  );
}
async function retry(fn, tries = 3) {
  for (let t = 1; ; t++) {
    try {
      return await fn();
    } catch (e) {
      if (t >= tries) throw e;
      await new Promise((r) => setTimeout(r, 1000 * t));
    }
  }
}

const oldC = new MongoClient(OLD_URI);
const newC = new MongoClient(NEW_URI);
await oldC.connect();
await newC.connect();
const oldDb = oldC.db(DB);
const newDb = newC.db(DB);
const cols = (await oldDb.listCollections({}, { nameOnly: true }).toArray())
  .map((c) => c.name)
  .filter((n) => !n.startsWith('system.'));

console.log(RUN ? '--- REAL RUN ---' : '--- DRY RUN (kuch likha nahi jaayega) ---');

const urls = new Set();
for (const name of cols) {
  const oc = await oldDb.collection(name).countDocuments();
  const nc = await newDb.collection(name).countDocuments();
  console.log(`${name}: old=${oc} new=${nc}`);
  for await (const d of oldDb.collection(name).find()) collectUrls(d, urls, OLD_CLOUD);
}
console.log(`Unique Cloudinary photos/files purane account ke: ${urls.size}`);

if (!RUN) {
  console.log('Dry run complete. Asli copy ke liye: node scripts/migrateAccounts.js --run');
  await oldC.close();
  await newC.close();
  process.exit(0);
}

// 1. backup
const outDir = path.join(serverDir, 'migration-output');
const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const bdir = path.join(outDir, 'backup-' + stamp);
fs.mkdirSync(bdir, { recursive: true });
const EJSON = mongoose.mongo.BSON?.EJSON;
for (const name of cols) {
  const docs = await oldDb.collection(name).find().toArray();
  fs.writeFileSync(
    path.join(bdir, name + '.json'),
    EJSON ? EJSON.stringify(docs, undefined, 2) : JSON.stringify(docs, null, 2)
  );
}
console.log('Backup ban gaya: server/migration-output/backup-' + stamp);

// 2. photos
const mapFile = path.join(outDir, 'url-map.json');
const map = fs.existsSync(mapFile) ? JSON.parse(fs.readFileSync(mapFile, 'utf8')) : {};
cloudinary.config({ cloud_name: NEW_CLOUD, api_key: NEW_KEY, api_secret: NEW_SECRET, secure: true });
const todo = [...urls].filter((u) => !map[u]);
let done = 0;
const failed = [];
await pool(todo, 4, async (u) => {
  try {
    const p = parseUrl(u);
    const buf = await retry(async () => {
      const r = await fetch(p.original);
      if (!r.ok) throw new Error('download ' + r.status);
      return Buffer.from(await r.arrayBuffer());
    });
    const r = await retry(() => upload(buf, p));
    map[u] = r.secure_url;
    done++;
    if (done % 10 === 0) {
      fs.writeFileSync(mapFile, JSON.stringify(map, null, 2));
      console.log(`photos uploaded: ${done}/${todo.length}`);
    }
  } catch (e) {
    failed.push(u + ' -> ' + String(e.message || e).slice(0, 100));
  }
});
fs.writeFileSync(mapFile, JSON.stringify(map, null, 2));
console.log(`Photos: uploaded=${done} failed=${failed.length} (pehle se done: ${urls.size - todo.length})`);
if (failed.length) {
  failed.forEach((f) => console.log('FAILED', f));
  console.log('FAIL: kuch photos fail hui. DB copy nahi ki. Dobara --run chala (jo ho chuki wo skip hongi).');
  await oldC.close();
  await newC.close();
  process.exit(1);
}

// 3. database
for (const name of cols) {
  const src = oldDb.collection(name);
  const dst = newDb.collection(name);
  let batch = [];
  for await (const d of src.find()) {
    const nd = rewrite(d, map);
    batch.push({ replaceOne: { filter: { _id: nd._id }, replacement: nd, upsert: true } });
    if (batch.length >= 200) {
      await dst.bulkWrite(batch, { ordered: false });
      batch = [];
    }
  }
  if (batch.length) await dst.bulkWrite(batch, { ordered: false });
  for (const ix of await src.indexes()) {
    if (ix.name === '_id_') continue;
    const { key, v, ns, ...opts } = ix;
    try {
      await dst.createIndex(key, opts);
    } catch {
      console.log(`index skip: ${name}.${ix.name}`);
    }
  }
}

// 4. verify
let pass = true;
const leftover = new Set();
for (const name of cols) {
  const oc = await oldDb.collection(name).countDocuments();
  const nc = await newDb.collection(name).countDocuments();
  if (oc !== nc) pass = false;
  console.log(`${name}: old=${oc} new=${nc} ${oc === nc ? 'OK' : 'MISMATCH'}`);
  for await (const d of newDb.collection(name).find()) collectUrls(d, leftover, OLD_CLOUD);
}
console.log(`Naye DB mein purane Cloudinary links bache: ${leftover.size} (0 hona chahiye)`);
if (leftover.size) pass = false;
let bad = 0;
await pool(Object.values(map), 8, async (u) => {
  try {
    const r = await fetch(u, { method: 'HEAD' });
    if (!r.ok) bad++;
  } catch {
    bad++;
  }
});
console.log(`Naye photo links jo open nahi hue: ${bad} (0 hona chahiye)`);
if (bad) pass = false;
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
await oldC.close();
await newC.close();