import { describe, expect, it } from 'vitest';
import NutritionTable from '@components/produce/NutritionTable.astro';
import { toNutrient } from '@contexts/catalog/infrastructure/mappers';
import { aProduce } from '@tests/fixtures/produce';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';
import { render } from './render';

const produce = aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 9, level: 'peak' }] });
const nutrient = (slug: string, name: string) =>
  toNutrient(slug, { name, kind: 'vitamin', unit: 'mg', referenceIntake: 80, ...NUTRIENT_CLAIMS });

const rowOf = (html: string, name: string) =>
  new RegExp(`<tr>(?:(?!</tr>)[\\s\\S])*>${name}<(?:(?!</tr>)[\\s\\S])*</tr>`).exec(html)?.[0] ??
  '';

describe('NutritionTable bars (spec 026)', () => {
  it('AC8: draws a decorative bar capped at 100 and none without a reference intake', async () => {
    const html = await render(NutritionTable, {
      nutrition: produce.nutrition,
      micronutrients: [
        {
          nutrient: nutrient('vitamin-c', 'Витамин C'),
          amount: 36.6,
          percentOfReferenceIntake: 46,
        },
        {
          nutrient: nutrient('vitamin-k', 'Витамин K'),
          amount: 120,
          percentOfReferenceIntake: 150,
        },
        { nutrient: nutrient('lutein', 'Лутеин'), amount: 1, percentOfReferenceIntake: undefined },
      ],
    });
    const bar = /<svg[^>]*class="nutrition__bar"[^>]*>[\s\S]*?<\/svg>/;
    const fill = /class="nutrition__bar-fill"[^>]*width="(\d+(?:\.\d+)?)"/;
    const vitaminC = bar.exec(rowOf(html, 'Витамин C'))?.[0] ?? '';
    expect(vitaminC).toMatch(/aria-hidden="true"/);
    expect(vitaminC).toMatch(/viewBox="0 0 100 \d+"/);
    expect(fill.exec(vitaminC)?.[1]).toBe('46');
    expect(fill.exec(bar.exec(rowOf(html, 'Витамин K'))?.[0] ?? '')?.[1]).toBe('100');
    expect(rowOf(html, 'Лутеин')).not.toMatch(bar);
  });
});
