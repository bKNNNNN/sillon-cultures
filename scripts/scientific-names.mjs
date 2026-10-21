// Scientific names to cultures ids (0.5.0): the reference reader of scientific-names.yaml.
// An identification service (Pl@ntNet) answers with a scientific name; this file says which
// crops of cultures.yaml that name may be. The app or sillon-core must resolve names the same way.

const RANKS = new Map([
  ['subsp.', 'subsp.'], ['subsp', 'subsp.'], ['ssp.', 'subsp.'], ['ssp', 'subsp.'],
  ['var.', 'var.'], ['var', 'var.'], ['convar.', 'convar.'], ['convar', 'convar.'],
  ['f.', 'f.'], ['forma', 'f.'],
]);
const GENUS = /^[a-z][a-z-]+$/i;
const EPITHET = /^[a-z][a-z-]+$/;
const HYBRID = /^[×x]$/i;

const capitalise = (word) => word[0].toUpperCase() + word.slice(1).toLowerCase();

/**
 * Reads a scientific name, with or without its author.
 * `key` compares names (lowercase, hybrid sign dropped, one infraspecific rank at most),
 * `species` is the plain binomial key, `display` the tidy written form. Null when the
 * text is not a species name (genus alone, French name, empty).
 */
export function parseScientificName(text) {
  if (typeof text !== 'string') return null;
  const tokens = text.normalize('NFC').replace(/×/g, ' × ').trim().split(/\s+/).filter(Boolean);
  const [genus, ...rest] = tokens;
  if (!genus || !GENUS.test(genus)) return null;
  const hybrid = rest.length > 0 && HYBRID.test(rest[0]) && rest.length > 1 && EPITHET.test(rest[1].toLowerCase());
  if (hybrid) rest.shift();
  const written = rest.shift() ?? '';
  const epithet = written.toLowerCase();
  // An epithet is lowercase (or the whole name shouted); a capitalised word is an author ("Solanum Dunal").
  if (!EPITHET.test(epithet) || (/^[A-Z]/.test(written) && written !== written.toUpperCase())) return null;
  const g = genus.toLowerCase();
  const species = `${g} ${epithet}`;
  const display = `${capitalise(genus)} ${hybrid ? '× ' : ''}${epithet}`;
  const rank = RANKS.get(rest[0]?.toLowerCase());
  const infra = rest[1];
  if (rank && infra && EPITHET.test(infra)) {
    return { key: `${species} ${rank} ${infra}`, species, display: `${display} ${rank} ${infra}` };
  }
  return { key: species, species, display };
}

/**
 * The crops a scientific name may be, in table order.
 * `exact`: crops listing that name (several when a species covers several crops, beet and chard).
 * `species`: the name has an infraspecific rank no crop lists; crops listing its plain binomial.
 * `none`: the base has no such plant; show the raw name and "pas dans la base".
 */
export function resolveScientificName(table, name) {
  const parsed = parseScientificName(name);
  if (!parsed) return { match: 'none', cropIds: [] };
  const listing = (key) =>
    table.filter((entry) => entry.scientificNames.some((n) => parseScientificName(n)?.key === key)).map((entry) => entry.id);
  const exact = listing(parsed.key);
  if (exact.length > 0) return { match: 'exact', cropIds: exact };
  if (parsed.key !== parsed.species) {
    const species = listing(parsed.species);
    if (species.length > 0) return { match: 'species', cropIds: species };
  }
  return { match: 'none', cropIds: [] };
}

const FIELDS = new Set(['id', 'scientificNames', 'source']);

function checkEntry(entry, crops, fail) {
  const id = typeof entry?.id === 'string' ? entry.id : '(no id)';
  if (!crops.some((c) => c.id === id)) fail(`${id}: not a crop of cultures.yaml`);
  for (const field of Object.keys(entry ?? {})) {
    if (!FIELDS.has(field)) fail(`${id}: unknown field ${field}`);
  }
  if (typeof entry?.source !== 'string' || entry.source.trim() === '') fail(`${id}: missing source`);
  const names = entry?.scientificNames;
  if (!Array.isArray(names) || names.length === 0) return fail(`${id}: scientificNames must be a non-empty list`);
  const seen = new Set();
  for (const name of names) {
    const parsed = parseScientificName(name);
    if (!parsed) {
      fail(`${id}: '${name}' is not a species name`);
      continue;
    }
    if (parsed.display !== name) fail(`${id}: write '${name}' as '${parsed.display}'`);
    if (seen.has(parsed.key)) fail(`${id}: ${parsed.display} listed twice`);
    seen.add(parsed.key);
  }
}

/** Every crop has one entry, every entry is a crop, every name is a tidy species name with a source. */
export function checkScientificNames(crops, table, fail) {
  if (!Array.isArray(table)) return fail('scientific-names.yaml: expected a YAML list of entries');
  const ids = new Set();
  for (const entry of table) {
    if (ids.has(entry?.id)) fail(`${entry.id}: duplicate entry`);
    ids.add(entry?.id);
    checkEntry(entry, crops, fail);
  }
  for (const crop of crops) {
    if (!ids.has(crop.id)) fail(`${crop.id}: no scientific names`);
  }
}
