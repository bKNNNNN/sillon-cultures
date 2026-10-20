// Transcriptions of the source tables behind the alert fields of cultures.yaml (0.4.0).
// Each table was read on 2026-10-20 at the URL given. scripts/check.mjs compares cultures.yaml
// against them, so a typo in the YAML (or in a conversion) fails the check.

/** FAO-56 table 22, https://www.fao.org/4/x0490e/x0490e0e.htm : [Zr low, Zr high] in m and p. */
export const FAO56_TABLE22 = {
  Cabbage: { zr: [0.5, 0.8], p: 0.45 },
  Carrots: { zr: [0.5, 1.0], p: 0.35 },
  Garlic: { zr: [0.3, 0.5], p: 0.3 },
  Lettuce: { zr: [0.3, 0.5], p: 0.3 },
  'Onions, dry': { zr: [0.3, 0.6], p: 0.3 },
  Spinach: { zr: [0.3, 0.5], p: 0.2 },
  Radishes: { zr: [0.3, 0.5], p: 0.3 },
  Tomato: { zr: [0.7, 1.5], p: 0.4 },
  'Cucumber, Fresh Market': { zr: [0.7, 1.2], p: 0.5 },
  'Pumpkin, Winter Squash': { zr: [1.0, 1.5], p: 0.35 },
  'Squash, Zucchini': { zr: [0.6, 1.0], p: 0.5 },
  'Beets, table': { zr: [0.6, 1.0], p: 0.5 },
  Potato: { zr: [0.4, 0.6], p: 0.35 },
  'Turnip (and Rutabaga)': { zr: [0.5, 1.0], p: 0.5 },
  'Beans, green': { zr: [0.5, 0.7], p: 0.45 },
  'Fababean, Fresh': { zr: [0.5, 0.7], p: 0.45 },
  'Peas, Fresh': { zr: [0.6, 1.0], p: 0.35 },
  Strawberries: { zr: [0.2, 0.3], p: 0.2 },
};

/**
 * Table 22 row per crop. `analogy: true` when the crop is not in the table and borrows a row
 * (the YAML source then says "par analogie"). Crops absent here carry no table 22 source.
 */
export const TABLE22_ROW = {
  tomate: { row: 'Tomato' },
  courgette: { row: 'Squash, Zucchini' },
  courge: { row: 'Pumpkin, Winter Squash' },
  concombre: { row: 'Cucumber, Fresh Market' },
  haricot: { row: 'Beans, green' },
  'petit-pois': { row: 'Peas, Fresh' },
  salade: { row: 'Lettuce' },
  radis: { row: 'Radishes' },
  'radis-hiver': { row: 'Radishes' },
  carotte: { row: 'Carrots' },
  betterave: { row: 'Beets, table' },
  poireau: { row: 'Onions, dry', analogy: true },
  oignon: { row: 'Onions, dry' },
  ail: { row: 'Garlic' },
  'pomme-de-terre': { row: 'Potato' },
  epinard: { row: 'Spinach' },
  blette: { row: 'Spinach', analogy: true },
  'chou-ete': { row: 'Cabbage' },
  'chou-hiver': { row: 'Cabbage' },
  'chou-chinois': { row: 'Lettuce', analogy: true },
  fraise: { row: 'Strawberries' },
  feve: { row: 'Fababean, Fresh' },
  mache: { row: 'Lettuce', analogy: true },
  roquette: { row: 'Lettuce', analogy: true },
  navet: { row: 'Turnip (and Rutabaga)' },
  moutarde: { row: 'Lettuce', analogy: true },
};

/** Crops with no table 22 row and no close analogue: 0.3 m and 0.30, estimate only (agronomy review 4.1). */
export const NO_TABLE22 = { basilic: { zr: 0.3, p: 0.3 }, persil: { zr: 0.3, p: 0.3 }, cerfeuil: { zr: 0.3, p: 0.3 }, coriandre: { zr: 0.3, p: 0.3 } };

/**
 * FAO-56 table 11, https://www.fao.org/4/x0490e/x0490e0b.htm : stage lengths in days for the row
 * each crop's `daysToMaturity` already cites. Carrots, Oct/Jan prints a mid stage of "50/30" with a
 * total of 100: 30 is the value that adds up to the printed total.
 */
export const FAO56_TABLE11 = {
  tomate: [35, 40, 50, 30],
  courgette: [25, 35, 25, 15],
  courge: [20, 30, 30, 20],
  concombre: [20, 30, 40, 15],
  haricot: [20, 30, 30, 10],
  'petit-pois': [15, 25, 35, 15],
  salade: [20, 30, 15, 10],
  radis: [5, 10, 15, 5],
  carotte: [20, 30, 30, 20],
  betterave: [15, 25, 20, 10],
  oignon: [15, 25, 70, 40],
  'pomme-de-terre': [25, 30, 45, 30],
  epinard: [20, 30, 40, 10],
  'chou-ete': [40, 60, 50, 15],
  'chou-hiver': [40, 60, 50, 15],
  feve: [20, 30, 35, 15],
};

/**
 * Harrington (UC Davis) soil temperatures for germination, degrees F, via Oregon State University
 * Extension, https://extension.oregonstate.edu/gardening/soil-compost/soil-temperature-conditions-vegetable-seed-germination :
 * [minimum, optimum low, optimum high, maximum]. Cabbage prints its optimum range as "45-5", a typo:
 * only its minimum and maximum are used.
 */
export const HARRINGTON_F = {
  Bean: [60, 60, 85, 95],
  Beet: [40, 50, 85, 95],
  Cabbage: [40, null, null, 100],
  Carrot: [40, 45, 85, 95],
  'Chard, Swiss': [40, 50, 85, 95],
  Cucumber: [60, 60, 95, 105],
  Lettuce: [35, 40, 80, 95],
  Onion: [35, 50, 95, 95],
  Parsley: [40, 50, 85, 90],
  Pea: [40, 40, 75, 85],
  Pumpkin: [60, 70, 90, 100],
  Radish: [40, 45, 90, 95],
  Spinach: [35, 45, 75, 85],
  Squash: [60, 70, 95, 100],
  Tomato: [50, 60, 85, 95],
  Turnip: [40, 60, 105, 105],
};

/** Harrington row per crop. `analogy: true` for a borrowed row ("par analogie" in the YAML source). */
export const HARRINGTON_ROW = {
  haricot: { row: 'Bean' },
  betterave: { row: 'Beet' },
  'chou-ete': { row: 'Cabbage' },
  'chou-hiver': { row: 'Cabbage' },
  carotte: { row: 'Carrot' },
  blette: { row: 'Chard, Swiss' },
  concombre: { row: 'Cucumber' },
  salade: { row: 'Lettuce' },
  oignon: { row: 'Onion' },
  poireau: { row: 'Onion', analogy: true },
  persil: { row: 'Parsley' },
  'petit-pois': { row: 'Pea' },
  courge: { row: 'Pumpkin' },
  courgette: { row: 'Squash' },
  radis: { row: 'Radish' },
  'radis-hiver': { row: 'Radish' },
  epinard: { row: 'Spinach' },
  tomate: { row: 'Tomato' },
  navet: { row: 'Turnip' },
  'chou-chinois': { row: 'Turnip', analogy: true },
  roquette: { row: 'Cabbage', analogy: true },
  moutarde: { row: 'Cabbage', analogy: true },
};

/** Degrees F to degrees C, rounded to 0.1, as the YAML stores them. */
export const fToC = (f) => Math.round(((f - 32) * 5) / 9 * 10) / 10;

/**
 * Frost classes. Tender crops: "Frost occurs at temperatures from 31-33 ºF and will result in damage or
 * destruction of the foliage of warm season plants like beans, ..., cucumbers, ..., potatoes, ..., squash,
 * tomatoes" (NC State Extension, https://gardening.ces.ncsu.edu/2020/05/frost-and-freeze-protection-for-vegetables-2).
 * Potato regrows from the tuber and strawberry is hurt only in flower: `semi`, estimate (agronomy review 2.2).
 */
export const FROST_CLASS = {
  tender: ['tomate', 'courgette', 'courge', 'concombre', 'haricot', 'basilic'],
  semi: ['pomme-de-terre', 'fraise'],
};
