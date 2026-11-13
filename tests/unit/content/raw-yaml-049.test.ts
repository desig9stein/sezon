import { describe, expect, it } from 'vitest';
import { citedFdcId } from '../../../scripts/content/citedFdcId';
import { nutritionSourceUrl, regionSlugsOf } from '@tests/fixtures/rawProduce';
import { MINIMAL_PRODUCE_INPUT, produceRecord } from '@tests/fixtures/records';

const USDA_ITEM = 'https://fdc.nal.usda.gov/food-details/169975/nutrients';
const withNutritionSource = (url: string) => ({
  ...MINIMAL_PRODUCE_INPUT,
  nutrition: { ...produceRecord().nutrition, source: { name: 'Източник', url } },
});

describe('raw produce YAML readers tolerate a minimal record (QA 049)', () => {
  it('QA 049: a minimal record has no region slugs', () => {
    expect(regionSlugsOf(MINIMAL_PRODUCE_INPUT)).toEqual([]);
  });

  it('QA 049: reads the region slugs of a record with regions', () => {
    expect(regionSlugsOf({ regions: [{ region: 'plovdiv', note: 'Бележка.' }] })).toEqual([
      'plovdiv',
    ]);
  });

  it('QA 049: a minimal record has no nutrition source', () => {
    expect(nutritionSourceUrl(MINIMAL_PRODUCE_INPUT)).toBeUndefined();
  });

  it('QA 049: reads the nutrition source of a record with nutrition', () => {
    expect(nutritionSourceUrl(withNutritionSource(USDA_ITEM))).toBe(USDA_ITEM);
  });

  it('QA 049: the USDA extract skips a produce without nutrition', () => {
    expect(citedFdcId(MINIMAL_PRODUCE_INPUT, 'hryan.yaml')).toBeUndefined();
  });

  it('QA 049: the USDA extract reads the FDC id of a USDA item and skips other sources', () => {
    expect(citedFdcId(withNutritionSource(USDA_ITEM), 'zele.yaml')).toBe('169975');
    expect(
      citedFdcId(withNutritionSource('https://www.efsa.europa.eu/en/data-report'), 'x.yaml'),
    ).toBeUndefined();
  });

  it('QA 049: the USDA extract rejects a USDA source that is not an item URL', () => {
    expect(() => citedFdcId(withNutritionSource('https://fdc.nal.usda.gov/'), 'zele.yaml')).toThrow(
      'zele.yaml',
    );
  });
});
