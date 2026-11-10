import { describe, expect, it } from 'vitest';
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
  description: 'Описание.',
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
    expect(html).toContain('36,6 mg');
    expect(html).toContain('46%');
    expect(html).toContain('1,28 g');
    expect(html).toMatch(
      /<a[^>]*href="https:\/\/fdc\.nal\.usda\.gov\/"[^>]*>USDA FoodData Central/,
    );
    expect(html).toMatch(/<div[^>]*role="region"[^>]*tabindex="0"/);
  });
});
