// Validates cultures.yaml against sillon-core and the data rules of this repo.
// Usage: node scripts/check.mjs <path to sillon-core dist/index.js>
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { checkAlertFields } from './check-alert-fields.mjs';
import { checkScientificNames, resolveScientificName } from './scientific-names.mjs';

const corePath = process.argv[2];
if (!corePath) {
  console.error('usage: node scripts/check.mjs <sillon-core/dist/index.js>');
  process.exit(2);
}
const { parseCrops, getCrop, windowsOf } = await import(pathToFileURL(resolve(corePath)).href);
/** sillon-core's own YAML parser, so this repo keeps no dependency. */
const { parse: parseYaml } = createRequire(resolve(corePath))('yaml');

const root = new URL('..', import.meta.url);
const read = (name) => readFileSync(new URL(name, root), 'utf8');

/** Ids published in v0.1.0. Stored plantings use them, so each one must still resolve. */
const LEGACY_IDS = [
  'tomate', 'courgette', 'courge', 'concombre', 'haricot', 'petit-pois', 'salade', 'radis', 'carotte', 'betterave',
  'poireau', 'oignon', 'ail', 'pomme-de-terre', 'epinard', 'blette', 'chou', 'fraise', 'basilic', 'persil',
];
const RENAMED = { chou: 'chou-ete' };
/** Crops added after v0.1.0. */
const ADDED_IDS = ['chou-hiver', 'feve', 'mache', 'coriandre', 'roquette', 'navet', 'moutarde', 'cerfeuil', 'radis-hiver', 'chou-chinois'];

/**
 * Quotes a review found in no source document. They must never come back as citations.
 * Each entry: the invented text, and the crop field whose source must label the value an estimate instead.
 */
const RETRACTED_QUOTES = [
  { text: 'jusque fin juin', crop: 'concombre', field: 'transplant', label: 'to: estimation' },
];

/** Names an identification may return, and the crops they must give (0.5.0). */
const RESOLUTIONS = [
  { name: 'Solanum lycopersicum L.', match: 'exact', cropIds: ['tomate'] },
  { name: 'Pisum sativum', match: 'exact', cropIds: ['petit-pois'] },
  { name: 'Fragaria ×ananassa', match: 'exact', cropIds: ['fraise'] },
  { name: 'Beta vulgaris', match: 'exact', cropIds: ['betterave', 'blette'] },
  { name: 'Brassica oleracea', match: 'exact', cropIds: ['chou-ete', 'chou-hiver'] },
  { name: 'Brassica oleracea var. italica', match: 'species', cropIds: ['chou-ete', 'chou-hiver'] },
  { name: 'Brassica rapa', match: 'exact', cropIds: ['chou-chinois', 'navet'] },
  { name: 'Brassica rapa subsp. chinensis', match: 'exact', cropIds: ['chou-chinois'] },
  { name: 'Brassica rapa subsp. nipposinica', match: 'exact', cropIds: ['moutarde'] },
  { name: 'Raphanus sativus', match: 'exact', cropIds: ['radis', 'radis-hiver'] },
  { name: 'Raphanus sativus var. niger', match: 'exact', cropIds: ['radis-hiver'] },
  { name: 'Cucurbita pepo', match: 'exact', cropIds: ['courgette', 'courge'] },
  { name: 'Cichorium endivia', match: 'none', cropIds: [] },
  { name: 'Taraxacum officinale', match: 'none', cropIds: [] },
];

const errors = [];
const fail = (msg) => errors.push(msg);

let crops = [];
try {
  crops = parseCrops(read('cultures.yaml'));
} catch (e) {
  fail(e instanceof Error ? e.message : String(e));
}

for (const id of LEGACY_IDS) {
  const crop = getCrop(crops, id);
  const expected = RENAMED[id] ?? id;
  if (crop?.id !== expected) fail(`${id}: should resolve to ${expected}, got ${crop?.id ?? 'nothing'}`);
}

for (const id of ADDED_IDS) {
  if (!crops.some((c) => c.id === id)) fail(`${id}: missing crop`);
}

for (const crop of crops) {
  if (!crop.seedLifespanYears) fail(`${crop.id}: missing seedLifespanYears`);
  for (const field of ['goodCompanions', 'badCompanions']) {
    for (const ref of crop[field]) {
      if (!crops.some((c) => c.id === ref)) fail(`${crop.id}: ${field} names unknown crop ${ref}`);
    }
  }
}

checkAlertFields(crops, fail);

let names = [];
try {
  names = parseYaml(read('scientific-names.yaml'));
} catch (e) {
  fail(`scientific-names.yaml: ${e instanceof Error ? e.message : String(e)}`);
}
checkScientificNames(crops, names, fail);
if (Array.isArray(names)) {
  for (const { name, ...expected } of RESOLUTIONS) {
    const got = resolveScientificName(names, name);
    if (JSON.stringify(got) !== JSON.stringify(expected)) fail(`${name}: resolves to ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`);
  }
}

for (const { crop: id, field, label } of RETRACTED_QUOTES) {
  const source = getCrop(crops, id)?.[field]?.source ?? '';
  if (!source.includes(label)) fail(`${id}.${field}: source should say '${label}'`);
}

for (const name of ['cultures.yaml', 'scientific-names.yaml', 'README.md', 'CHANGELOG.md']) {
  let text = '';
  try {
    text = read(name);
  } catch {
    fail(`${name}: missing`);
  }
  if (text.includes('—')) fail(`${name}: contains an em dash`);
  for (const { text: quote } of RETRACTED_QUOTES) {
    if (text.includes(quote)) fail(`${name}: cites '${quote}', which no source contains`);
  }
}

if (errors.length > 0) {
  console.error(`cultures check failed:\n${errors.join('\n')}`);
  process.exit(1);
}
const windows = crops.flatMap((c) => ['sowUnderCover', 'sowDirect', 'transplant'].flatMap((f) => (c[f] ? windowsOf(c[f].value) : [])));
const nameCount = Array.isArray(names) ? names.reduce((n, e) => n + e.scientificNames.length, 0) : 0;
console.log(`cultures check passed: ${crops.length} crops, ${windows.length} windows, ${nameCount} scientific names.`);
