// Unit tests for scripts/scientific-names.mjs. Run: node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkScientificNames, parseScientificName, resolveScientificName } from './scientific-names.mjs';

const table = [
  { id: 'tomate', scientificNames: ['Solanum lycopersicum', 'Lycopersicon esculentum'], source: 's' },
  { id: 'betterave', scientificNames: ['Beta vulgaris'], source: 's' },
  { id: 'blette', scientificNames: ['Beta vulgaris'], source: 's' },
  { id: 'chou-chinois', scientificNames: ['Brassica rapa', 'Brassica rapa subsp. chinensis'], source: 's' },
  { id: 'navet', scientificNames: ['Brassica rapa', 'Brassica rapa subsp. rapa'], source: 's' },
  { id: 'moutarde', scientificNames: ['Brassica juncea', 'Brassica rapa subsp. nipposinica'], source: 's' },
  { id: 'fraise', scientificNames: ['Fragaria × ananassa'], source: 's' },
];

test('parses a binomial and drops the author', () => {
  assert.deepEqual(parseScientificName('Solanum lycopersicum'), { key: 'solanum lycopersicum', species: 'solanum lycopersicum', display: 'Solanum lycopersicum' });
  assert.equal(parseScientificName('Solanum lycopersicum L.').key, 'solanum lycopersicum');
  assert.equal(parseScientificName('  Petroselinum   crispum (Mill.) Fuss ').key, 'petroselinum crispum');
});

test('keeps one infraspecific rank and normalises its spelling', () => {
  const p = parseScientificName('Brassica rapa subsp. chinensis (L.) Hanelt');
  assert.equal(p.key, 'brassica rapa subsp. chinensis');
  assert.equal(p.species, 'brassica rapa');
  assert.equal(p.display, 'Brassica rapa subsp. chinensis');
  assert.equal(parseScientificName('Brassica rapa ssp. chinensis').key, 'brassica rapa subsp. chinensis');
  assert.equal(parseScientificName('Brassica rapa subsp chinensis').key, 'brassica rapa subsp. chinensis');
  assert.equal(parseScientificName('Brassica oleracea var. capitata').key, 'brassica oleracea var. capitata');
});

test('reads every spelling of a hybrid the same way', () => {
  for (const name of ['Fragaria × ananassa', 'Fragaria ×ananassa', 'Fragaria x ananassa', 'Fragaria ananassa', 'Fragaria × ananassa (Weston) Rozier']) {
    assert.equal(parseScientificName(name).key, 'fragaria ananassa', name);
  }
  assert.equal(parseScientificName('Fragaria ×ananassa').display, 'Fragaria × ananassa');
});

test('is case-insensitive on the input, never on the display form', () => {
  assert.equal(parseScientificName('SOLANUM LYCOPERSICUM').key, 'solanum lycopersicum');
  assert.equal(parseScientificName('solanum lycopersicum').display, 'Solanum lycopersicum');
});

test('refuses what is not a species name', () => {
  for (const bad of ['', '   ', 'Solanum', 'Solanum L.', '123 abc', 'Solanum Dunal', null, undefined, 42]) {
    assert.equal(parseScientificName(bad), null, String(bad));
  }
});

test('an exact name gives its crops, in table order', () => {
  assert.deepEqual(resolveScientificName(table, 'Solanum lycopersicum L.'), { match: 'exact', cropIds: ['tomate'] });
  assert.deepEqual(resolveScientificName(table, 'Lycopersicon esculentum Mill.'), { match: 'exact', cropIds: ['tomate'] });
  assert.deepEqual(resolveScientificName(table, 'Fragaria ×ananassa'), { match: 'exact', cropIds: ['fraise'] });
});

test('a species shared by several crops gives every candidate', () => {
  assert.deepEqual(resolveScientificName(table, 'Beta vulgaris'), { match: 'exact', cropIds: ['betterave', 'blette'] });
  assert.deepEqual(resolveScientificName(table, 'Brassica rapa'), { match: 'exact', cropIds: ['chou-chinois', 'navet'] });
});

test('an infraspecific name listed by a crop picks that crop only', () => {
  assert.deepEqual(resolveScientificName(table, 'Brassica rapa subsp. nipposinica'), { match: 'exact', cropIds: ['moutarde'] });
  assert.deepEqual(resolveScientificName(table, 'Brassica rapa ssp. chinensis'), { match: 'exact', cropIds: ['chou-chinois'] });
});

test('an unlisted infraspecific name falls back on crops that list its plain species', () => {
  assert.deepEqual(resolveScientificName(table, 'Brassica rapa subsp. oleifera'), { match: 'species', cropIds: ['chou-chinois', 'navet'] });
  assert.deepEqual(resolveScientificName(table, 'Beta vulgaris subsp. maritima'), { match: 'species', cropIds: ['betterave', 'blette'] });
});

test('a crop that lists only an infraspecific name is not a species fallback', () => {
  const only = [{ id: 'moutarde', scientificNames: ['Brassica rapa subsp. nipposinica'], source: 's' }];
  assert.deepEqual(resolveScientificName(only, 'Brassica rapa'), { match: 'none', cropIds: [] });
  assert.deepEqual(resolveScientificName(only, 'Brassica rapa subsp. oleifera'), { match: 'none', cropIds: [] });
});

test('an unknown or unreadable name maps to nothing', () => {
  assert.deepEqual(resolveScientificName(table, 'Cichorium endivia'), { match: 'none', cropIds: [] });
  assert.deepEqual(resolveScientificName(table, 'Solanum'), { match: 'none', cropIds: [] });
  assert.deepEqual(resolveScientificName(table, ''), { match: 'none', cropIds: [] });
});

const crops = [{ id: 'tomate' }, { id: 'fraise' }];
const run = (entries) => {
  const errors = [];
  checkScientificNames(crops, entries, (m) => errors.push(m));
  return errors;
};
const ok = [
  { id: 'tomate', scientificNames: ['Solanum lycopersicum'], source: 'GBIF' },
  { id: 'fraise', scientificNames: ['Fragaria × ananassa'], source: 'GBIF' },
];

test('a table that covers every crop with tidy names passes', () => {
  assert.deepEqual(run(ok), []);
});

test('the table must be a list of entries', () => {
  assert.match(run({ tomate: [] }).join('\n'), /expected a YAML list/);
});

test('every crop needs an entry, and every entry a crop', () => {
  assert.match(run([ok[0]]).join('\n'), /fraise: no scientific names/);
  assert.match(run([...ok, { id: 'banane', scientificNames: ['Musa acuminata'], source: 'x' }]).join('\n'), /banane: not a crop/);
  assert.match(run([...ok, ok[0]]).join('\n'), /tomate: duplicate entry/);
});

test('each entry needs names, a source and nothing else', () => {
  const errors = (entry) => run([entry, ok[1]]).join('\n');
  assert.match(errors({ id: 'tomate', scientificNames: [], source: 'x' }), /tomate: scientificNames must be a non-empty list/);
  assert.match(errors({ id: 'tomate', scientificNames: ['Solanum lycopersicum'] }), /tomate: missing source/);
  assert.match(errors({ id: 'tomate', scientificNames: ['Solanum lycopersicum'], source: 'x', extra: 1 }), /tomate: unknown field extra/);
});

test('names are written in display form, without author, once per crop', () => {
  const errors = (names) => run([{ id: 'tomate', scientificNames: names, source: 'x' }, ok[1]]).join('\n');
  assert.match(errors(['Solanum lycopersicum L.']), /tomate: write 'Solanum lycopersicum L\.' as 'Solanum lycopersicum'/);
  assert.match(errors(['solanum lycopersicum']), /as 'Solanum lycopersicum'/);
  assert.match(errors(['Solanum']), /tomate: 'Solanum' is not a species name/);
  assert.match(errors(['Solanum lycopersicum', 'Solanum  lycopersicum']), /tomate: write 'Solanum {2}lycopersicum' as 'Solanum lycopersicum'/);
  assert.match(errors(['Fragaria ananassa', 'Solanum lycopersicum', 'Solanum lycopersicum']), /tomate: Solanum lycopersicum listed twice/);
});
