import { describe, expect, it } from 'vitest';
import ProduceRecipes from '@components/recipes/ProduceRecipes.astro';
import { ui } from '@i18n/bg';
import { aRecipe } from '@tests/fixtures/recipes';
import { render } from './render';

describe('ProduceRecipes (spec 048)', () => {
  it('AC10: lists a link to each recipe under an h3 „Рецепти за зимнина“', async () => {
    const html = await render(ProduceRecipes, {
      recipes: [
        aRecipe(),
        aRecipe({ slug: 'sladko-ot-krushi', name: 'Сладко от круши', category: 'preserve' }),
      ],
    });
    expect(html).toMatch(/<section[^>]*aria-labelledby="recipes"/);
    expect(html).toMatch(/<h3[^>]*id="recipes"[^>]*>Рецепти за зимнина<\/h3>/);
    expect(html).toContain('href="/retsepti/kompot-ot-krushi"');
    expect(html).toContain('href="/retsepti/sladko-ot-krushi"');
    expect(html).toContain(ui.recipes.categories.preserve);
    expect(html.match(/<li[\s>]/g)).toHaveLength(2);
  });

  it('AC10: renders nothing without recipes', async () => {
    expect((await render(ProduceRecipes, { recipes: [] })).trim()).toBe('');
  });
});
