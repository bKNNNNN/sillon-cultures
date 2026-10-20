// Rules for the alert fields added in 0.4.0: frostClass, chillC, rootDepthM, depletionP,
// germSoilC, kcStages, and the degree-day targets of the autumn and winter crops.
import {
  FAO56_TABLE11,
  FAO56_TABLE22,
  FROST_CLASS,
  HARRINGTON_F,
  HARRINGTON_ROW,
  NO_TABLE22,
  TABLE22_ROW,
  fToC,
} from './sources.mjs';
import { deriveGdd } from './gdd.mjs';

/** Crops sown in late summer or autumn whose harvest forecast must slow down with the season. */
export const AUTUMN_IDS = [
  'chou-chinois', 'epinard', 'roquette', 'moutarde', 'radis-hiver', 'navet', 'mache', 'blette', 'betterave', 'cerfeuil', 'coriandre',
];

const NEW_FIELDS = ['frostClass', 'chillC', 'rootDepthM', 'depletionP', 'germSoilC', 'kcStages'];

const sourceOf = (field) => field?.source ?? '';

function checkFrost(crop, fail) {
  if (!crop.frostClass) return fail(`${crop.id}: missing frostClass`);
  const expected = FROST_CLASS.tender.includes(crop.id) ? 'tender' : FROST_CLASS.semi.includes(crop.id) ? 'semi' : 'hardy';
  if (crop.frostClass.value !== expected) fail(`${crop.id}: frostClass should be ${expected}, got ${crop.frostClass.value}`);
  if (crop.frostClass.value === 'tender' && !crop.frostSensitive) fail(`${crop.id}: tender but frostSensitive is false`);
  if (crop.frostClass.value === 'hardy' && crop.frostSensitive) fail(`${crop.id}: hardy but frostSensitive is true`);
}

function checkWater(crop, fail) {
  if (!crop.rootDepthM || !crop.depletionP) return fail(`${crop.id}: missing rootDepthM or depletionP`);
  const mapped = TABLE22_ROW[crop.id];
  const fallback = NO_TABLE22[crop.id];
  if (!mapped && !fallback) return fail(`${crop.id}: no FAO-56 table 22 mapping in scripts/sources.mjs`);
  const zr = mapped ? FAO56_TABLE22[mapped.row].zr[0] : fallback.zr;
  const p = mapped ? FAO56_TABLE22[mapped.row].p : fallback.p;
  if (crop.rootDepthM.value !== zr) fail(`${crop.id}: rootDepthM should be ${zr} (lower bound of ${mapped?.row ?? 'estimate'})`);
  if (crop.depletionP.value !== p) fail(`${crop.id}: depletionP should be ${p}`);
  for (const field of ['rootDepthM', 'depletionP']) {
    const source = sourceOf(crop[field]);
    if (mapped && !source.includes(`ligne ${mapped.row}`)) fail(`${crop.id}.${field}: source should name 'ligne ${mapped.row}'`);
    if (mapped?.analogy && !source.includes('par analogie')) fail(`${crop.id}.${field}: borrowed row, source should say 'par analogie'`);
    if (!mapped && source) fail(`${crop.id}.${field}: no table row, the value is an estimate without source`);
  }
}

function checkGerm(crop, fail) {
  const mapped = HARRINGTON_ROW[crop.id];
  if (!mapped) {
    if (crop.germSoilC) fail(`${crop.id}: germSoilC has no Harrington row in scripts/sources.mjs`);
    return;
  }
  if (!crop.germSoilC) return fail(`${crop.id}: missing germSoilC (Harrington ${mapped.row})`);
  const [min, optLow, optHigh, max] = HARRINGTON_F[mapped.row];
  const want = { min: fToC(min), max: fToC(max), ...(optLow === null ? {} : { optLow: fToC(optLow), optHigh: fToC(optHigh) }) };
  const got = crop.germSoilC.value;
  for (const key of ['min', 'optLow', 'optHigh', 'max']) {
    if (got[key] !== want[key]) fail(`${crop.id}: germSoilC.${key} should be ${want[key]}, got ${got[key]}`);
  }
  const source = sourceOf(crop.germSoilC);
  if (!source.includes(`ligne ${mapped.row}`)) fail(`${crop.id}.germSoilC: source should name 'ligne ${mapped.row}'`);
  if (mapped.analogy && !source.includes('par analogie')) fail(`${crop.id}.germSoilC: borrowed row, source should say 'par analogie'`);
}

function checkStages(crop, fail) {
  const stages = FAO56_TABLE11[crop.id];
  if (!stages) {
    if (crop.kcStages) fail(`${crop.id}: kcStages has no FAO-56 table 11 row in scripts/sources.mjs`);
    return;
  }
  if (!crop.kc) fail(`${crop.id}: kcStages without kc`);
  const k = crop.kcStages?.value;
  if (k?.method !== 'fao56-table11') return fail(`${crop.id}: missing kcStages (fao56-table11)`);
  const got = [k.initDays, k.devDays, k.midDays, k.lateDays];
  if (got.join() !== stages.join()) fail(`${crop.id}: kcStages should be ${stages.join('/')}, got ${got.join('/')}`);
  const total = got.reduce((a, b) => a + b, 0);
  if (crop.daysToMaturity && total !== crop.daysToMaturity.value) fail(`${crop.id}: kcStages add up to ${total}, daysToMaturity is ${crop.daysToMaturity.value}`);
  const row = sourceOf(crop.daysToMaturity).match(/ligne (.*?), https/)?.[1];
  if (!row || !sourceOf(crop.kcStages).includes(`tableau 11, ligne ${row}, `)) {
    fail(`${crop.id}.kcStages: source should cite FAO-56 tableau 11, ligne ${row ?? '?'} (the daysToMaturity row)`);
  }
}

function checkAutumn(crops, fail) {
  for (const id of AUTUMN_IDS) {
    const crop = crops.find((c) => c.id === id);
    if (!crop) {
      fail(`${id}: missing crop`);
      continue;
    }
    if (!crop.gdd || !crop.tBaseC) {
      fail(`${id}: autumn crop needs gdd and tBaseC`);
      continue;
    }
    if (!crop.gdd.estimate || !crop.tBaseC.estimate) fail(`${id}: gdd and tBaseC must stay estimate: true`);
    const derived = deriveGdd(crop);
    if (sourceOf(crop.gdd).includes('derive') && crop.gdd.value !== derived) {
      fail(`${id}: gdd ${crop.gdd.value} does not match scripts/gdd.mjs (${derived})`);
    }
  }
}

/** Runs every alert-field rule and reports through `fail`. */
export function checkAlertFields(crops, fail) {
  for (const crop of crops) {
    checkFrost(crop, fail);
    checkWater(crop, fail);
    checkGerm(crop, fail);
    checkStages(crop, fail);
    for (const field of NEW_FIELDS) {
      if (crop[field] && crop[field].estimate !== true) fail(`${crop.id}.${field}: no source is specific to Gironde, keep estimate: true`);
    }
  }
  const basil = crops.find((c) => c.id === 'basilic');
  if (!basil?.chillC) fail('basilic: missing chillC');
  for (const crop of crops) if (crop.id !== 'basilic' && crop.chillC) fail(`${crop.id}: chillC is only for basil`);
  checkAutumn(crops, fail);
}
