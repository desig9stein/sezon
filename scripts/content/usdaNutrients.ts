/**
 * USDA FoodData Central nutrient ids for the nutrition fields of a produce entry, keyed by the
 * field name in `src/data/produce/*.yaml`.
 */
export const MACRO_NUTRIENT_IDS: Readonly<Record<string, string>> = {
  energyKcal: '1008',
  proteinG: '1003',
  fatG: '1004',
  carbohydrateG: '1005',
  fiberG: '1079',
  sugarsG: '2000',
};

/**
 * USDA FoodData Central nutrient ids for the micronutrients, keyed by the nutrient slug in
 * `src/data/nutrients`. Vitamin A is retinol activity equivalents (RAE) and folate is total folate,
 * both in µg.
 */
export const MICRO_NUTRIENT_IDS: Readonly<Record<string, string>> = {
  'vitamin-a': '1106',
  'vitamin-c': '1162',
  'vitamin-k': '1185',
  folat: '1177',
  kaliy: '1092',
  zhelyazo: '1089',
  magneziy: '1090',
  mangan: '1101',
  'med-cu': '1098',
  fosfor: '1091',
};
