// Tiny self-test for src/utils/productNames.js (not part of the build). Run: node scripts/test-product-names.mjs
import assert from 'node:assert/strict'
import { normalizeCustom, buildName, nextNumber, isDuplicate, parseName, pickerName, CUSTOM } from '../src/utils/productNames.js'
import { presetsFor } from '../src/config/productNames.js'

const checks = [
  ['normalizeCustom title-cases lower-case', () => assert.equal(normalizeCustom('daining table'), 'Daining Table')],
  ['normalizeCustom collapses spaces', () => assert.equal(normalizeCustom('  Grey   Corner  Sofa '), 'Grey Corner Sofa')],
  ['normalizeCustom keeps mixed case', () => assert.equal(normalizeCustom('L-Shape sofa'), 'L-Shape sofa')],
  ['normalizeCustom max 80', () => assert.equal(normalizeCustom('a'.repeat(100)).length, 80)],
  ['buildName without detail', () => assert.equal(buildName('Sofa Set', ''), 'Sofa Set')],
  ['buildName with detail', () => assert.equal(buildName('Sofa Set', '  Grey velvet '), 'Sofa Set - Grey velvet')],
  ['buildName detail max 40', () => assert.equal(buildName('Bed', 'x'.repeat(50)), `Bed - ${'x'.repeat(40)}`)],
  ['nextNumber empty -> 01', () => assert.equal(nextNumber('Sofa Set', []), '01')],
  ['nextNumber after 03 -> 04', () => assert.equal(nextNumber('Sofa Set', ['Sofa Set 01', 'sofa set 03', 'Sofa Set - Grey 07']), '04')],
  ['isDuplicate case-insensitive', () => assert.equal(isDuplicate('sofa SET 01', ['Sofa Set 01']), true)],
  ['isDuplicate no match', () => assert.equal(isDuplicate('Sofa Set 02', ['Sofa Set 01']), false)],
  ['presetsFor trims and ignores case', () => assert.equal(presetsFor('  Beds ')[0], 'Bed')],
  ['presetsFor fallback', () => assert.deepEqual(presetsFor('Ottomans'), ['Ottomans'])],
  ['parseName preset + detail', () => assert.deepEqual(parseName('Sofa Set - Grey', presetsFor('Sofa Sets')), { choice: 'Sofa Set', custom: '', detail: 'Grey' })],
  ['parseName numbered -> custom (unchanged)', () => assert.deepEqual(parseName('Sofa Set 01', presetsFor('Sofa Sets')), { choice: CUSTOM, custom: 'Sofa Set 01', detail: '' })],
  ['pickerName round trip', () => assert.equal(pickerName(parseName('3+2 Sofa Set - Grey', presetsFor('sofa sets'))), '3+2 Sofa Set - Grey')],
]

let failed = 0
for (const [label, fn] of checks) {
  try {
    fn()
    console.log(`ok   ${label}`)
  } catch (err) {
    failed++
    console.log(`FAIL ${label}: ${err.message}`)
  }
}
console.log(`\n${checks.length - failed}/${checks.length} passed`)
process.exit(failed ? 1 : 0)
