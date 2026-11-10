import { describe, expect, it } from 'vitest';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';
import NutritionTable from '@components/produce/NutritionTable.astro';
import { toNutrient } from '@contexts/catalog/infrastructure/mappers';
import { aProduce } from '@tests/fixtures/produce';
import { render } from './render';

const produce = aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 9, level: 'peak' }] });
const vitaminC = toNutrient('vitamin-c', {
  name: 'Витамин C',
  kind: 'vitamin',
  unit: 'mg',
  referenceIntake: 80,
  ...NUTRIENT_CLAIMS,
});

describe('NutritionTable', () => {
  it('AC7: renders caption, headers, formatted values, % РСП and source', async () => {
    const html = await render(NutritionTable, {
      nutrition: produce.nutrition,
      micronutrients: [{ nutrient: vitaminC, amount: 36.6, percentOfReferenceIntake: 46 }],
    });
    expect(html).toMatch(/<caption[^>]*>[\s\S]*Хранителни стойности на 100 г[\s\S]*<\/caption>/);
    expect(html.match(/<th[^>]*scope="col"/g)?.length).toBeGreaterThanOrEqual(3);
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>\s*Енергия\s*<\/th>/);
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>\s*Витамин C\s*<\/th>/);
    expect(html).toContain('36,6 мг');
    expect(html).toContain('46%');
    expect(html).toContain('1,28 г');
    expect(html).toContain('25 ккал');
    expect(html).not.toMatch(/<td[^>]*>\s*<\/td>/);
    expect(html).toContain('1%');
    expect(html).toContain('няма референтен прием');
    expect(html).toMatch(/<abbr[^>]*title="референтен прием"[^>]*>РСП<\/abbr>/);
    expect(html).toMatch(
      /<a[^>]*href="https:\/\/fdc\.nal\.usda\.gov\/"[^>]*>USDA FoodData Central/,
    );
    expect(html).toMatch(/<section[^>]*aria-labelledby="nutrition-caption"[^>]*tabindex="0"/);
  });

  it('AC8 (spec 011): links micronutrient rows to their nutrient page', async () => {
    const html = await render(NutritionTable, {
      nutrition: produce.nutrition,
      micronutrients: [{ nutrient: vitaminC, amount: 36.6, percentOfReferenceIntake: 46 }],
    });
    expect(html).toMatch(
      /<th[^>]*scope="row"[^>]*>\s*<a href="\/nutrienti\/vitamin-c"[^>]*>Витамин C<\/a>\s*<\/th>/,
    );
    expect(html).toMatch(/<th[^>]*scope="row"[^>]*>\s*Енергия\s*<\/th>/);
  });
});
