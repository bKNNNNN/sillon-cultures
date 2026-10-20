// Unit tests for scripts/gdd.mjs. Run: node --test scripts/
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { deriveGdd, mondayOfIsoWeek, referenceWeek, SPRING_REFERENCE_WEEK } from './gdd.mjs';

const crop = (windows, days = 60, base = 4.4) => ({
  sowDirect: { value: windows.length === 1 ? windows[0] : windows },
  firstHarvestDays: { value: { days, from: 'sowing' } },
  tBaseC: { value: base },
});
const iso = (ms) => new Date(ms).toISOString().slice(0, 10);

test('week 18 when it lies inside a sowDirect window', () => {
  assert.equal(SPRING_REFERENCE_WEEK, 18);
  assert.equal(referenceWeek(crop([{ from: 10, to: 40 }])), 18);
  assert.equal(referenceWeek(crop([{ from: 10, to: 18 }, { from: 32, to: 44 }])), 18);
  assert.equal(referenceWeek(crop([{ from: 18, to: 18 }])), 18);
});

test('a summer window starting after week 18 takes its own start (radis-hiver, navet, chou-chinois)', () => {
  assert.equal(referenceWeek(crop([{ from: 23, to: 36 }])), 23);
  assert.equal(referenceWeek(crop([{ from: 23, to: 40 }])), 23);
  assert.equal(referenceWeek(crop([{ from: 19, to: 36 }])), 19);
});

test('an autumn-only crop takes the start of its window (mache)', () => {
  assert.equal(referenceWeek(crop([{ from: 36, to: 44 }])), 36);
});

test('a spring window ending before week 18 takes its last week, never a winter start (epinard)', () => {
  assert.equal(referenceWeek(crop([{ from: 6, to: 15 }, { from: 35, to: 41 }])), 15);
});

test('a window wrapping the new year that contains week 18 keeps week 18, one that does not takes its nearest week', () => {
  assert.equal(referenceWeek(crop([{ from: 44, to: 20 }])), 18);
  assert.equal(referenceWeek(crop([{ from: 44, to: 8 }])), 8);
});

test('the reference week always lies inside a sowDirect window', () => {
  const cases = [[{ from: 23, to: 36 }], [{ from: 6, to: 15 }, { from: 35, to: 41 }], [{ from: 36, to: 44 }], [{ from: 2, to: 5 }]];
  for (const windows of cases) {
    const w = referenceWeek(crop(windows));
    assert.ok(windows.some((x) => (x.from <= x.to ? w >= x.from && w <= x.to : w >= x.from || w <= x.to)), `${w} outside ${JSON.stringify(windows)}`);
  }
});

test('no sowDirect, no reference and no gdd', () => {
  assert.equal(referenceWeek({ firstHarvestDays: { value: { days: 40, from: 'sowing' } } }), null);
  assert.equal(deriveGdd({ firstHarvestDays: { value: { days: 40, from: 'sowing' } }, tBaseC: { value: 4.4 } }), null);
});

test('derived targets of the summer and spring-only crops (0.4.0 fix round)', () => {
  assert.equal(deriveGdd(crop([{ from: 23, to: 36 }], 70)), 1150);
  assert.equal(deriveGdd(crop([{ from: 23, to: 40 }], 60)), 970);
  assert.equal(deriveGdd(crop([{ from: 19, to: 36 }], 45)), 600);
  assert.equal(deriveGdd(crop([{ from: 6, to: 15 }, { from: 35, to: 41 }], 42)), 420);
  assert.equal(deriveGdd(crop([{ from: 36, to: 44 }], 60)), 750);
});

test('Mondays of the reference weeks', () => {
  assert.equal(iso(mondayOfIsoWeek(15)), '2026-04-06');
  assert.equal(iso(mondayOfIsoWeek(18)), '2026-04-27');
  assert.equal(iso(mondayOfIsoWeek(19)), '2026-05-04');
  assert.equal(iso(mondayOfIsoWeek(23)), '2026-06-01');
  assert.equal(iso(mondayOfIsoWeek(36)), '2026-08-31');
});
