// Derives a degree-day target from a day count, for crops with no degree-day source (0.4.0).
//
// The catalog delay (`firstHarvestDays`, from sowing) is taken to hold for a spring sowing at the end of April
// (ISO week 18), the season national seed catalogs describe, or for a crop sown only in autumn, for the
// start of its window (see `referenceWeek`). The target is the sum of
// daily degree-days over that delay, from a normal year at Bordeaux-Merignac. sillon-core then counts
// the same target against the real weather, so a sowing in a colder season takes longer than the catalog
// says, and a warmer one less. The result is an estimate: it only moves the catalog day count with
// temperature, not with day length or shade.
//
// Temperatures: Meteo-France, fiche climatologique 1991-2020 de Bordeaux-Merignac (33281001),
// "Temperature moyenne (moyenne en C)", one value per month, read on 2026-10-20 at
// https://object.files.data.gouv.fr/meteofrance/data/synchro_ftp/REF_STATION/FICHECLIM_33281001.pdf
// Each monthly mean is placed on the 15th of its month and days in between are interpolated linearly.

export const MERIGNAC_MEAN_C = [7.1, 7.8, 10.7, 13.0, 16.6, 19.8, 21.7, 21.9, 18.8, 15.2, 10.4, 7.7];

const YEAR = 2026;
const DAY_MS = 86_400_000;
const utc = (y, m, d) => Date.UTC(y, m, d);

/** Normal daily mean temperature at Merignac on a date (ms since epoch, UTC). */
export function normalMeanC(ms) {
  const date = new Date(ms);
  const y = date.getUTCFullYear();
  const anchors = [];
  for (let k = -1; k <= 12; k += 1) {
    const month = ((k % 12) + 12) % 12;
    anchors.push({ at: utc(y, k, 15), t: MERIGNAC_MEAN_C[month] });
  }
  for (let i = 0; i < anchors.length - 1; i += 1) {
    const a = anchors[i];
    const b = anchors[i + 1];
    if (ms >= a.at && ms <= b.at) return a.t + ((b.t - a.t) * (ms - a.at)) / (b.at - a.at);
  }
  throw new Error(`no anchor for ${date.toISOString()}`);
}

/** Monday of an ISO week of 2026. */
export function mondayOfIsoWeek(week, year = YEAR) {
  const jan4 = utc(year, 0, 4);
  const jan4Day = (new Date(jan4).getUTCDay() + 6) % 7;
  return jan4 - jan4Day * DAY_MS + (week - 1) * 7 * DAY_MS;
}

const firstWindow = (field) => (field ? (Array.isArray(field.value) ? field.value[0] : field.value) : null);
const sowingDelay = (crop) => {
  const value = crop.firstHarvestDays?.value;
  const list = Array.isArray(value) ? value : value ? [value] : [];
  return list.find((d) => d.from === 'sowing')?.days ?? null;
};

/** Spring sowing (Monday 27 April 2026, ISO week 18) for which national seed catalogs give their delays. */
export const SPRING_REFERENCE_WEEK = 18;
/** A first direct window opening this late (August) means a crop sown only for autumn. */
export const AUTUMN_ONLY_FROM_WEEK = 32;

/**
 * Reference sowing week. Week 18 for every crop, except a crop sown only from August on (mache),
 * whose catalog delay already describes autumn growth: the start of its first window.
 */
export function referenceWeek(crop) {
  const w = firstWindow(crop.sowDirect);
  if (!w) return null;
  return w.from >= AUTUMN_ONLY_FROM_WEEK && w.from <= w.to ? w.from : SPRING_REFERENCE_WEEK;
}

/** Degree-day target, rounded to 10, or null when the crop lacks a window, a sowing delay or a base temperature. */
export function deriveGdd(crop) {
  const week = referenceWeek(crop);
  const days = sowingDelay(crop);
  const base = crop.tBaseC?.value;
  if (week === null || days === null || base === undefined) return null;
  const start = mondayOfIsoWeek(week);
  let total = 0;
  for (let i = 0; i < days; i += 1) total += Math.max(0, normalMeanC(start + i * DAY_MS) - base);
  return Math.round(total / 10) * 10;
}
