import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import RecipeFacts from '@components/recipes/RecipeFacts.astro';
import { Recipe, type RecipeInput } from '@contexts/recipes';
import { recipeInput } from '@tests/fixtures/recipes';
import { render } from './render';

/** A sweet spread: 5 minutes up to 300 m, 10 up to 1800 m, 15 above. */
const spread = Recipe.create({
  ...recipeInput(),
  category: 'preserve',
  processingMinutes: 5,
  processingAtAltitude: [
    { fromMetres: 300, minutes: 10 },
    { fromMetres: 1800, minutes: 15 },
  ],
} as unknown as RecipeInput);

async function factsOf(recipe: Recipe) {
  const html = await render(RecipeFacts, { recipe });
  const window = new Window();
  window.document.write(`<main>${html}</main>`);
  return window.document;
}

describe('recipe facts with water-bath times by altitude (spec 058)', () => {
  it('AC12: the water-bath cell lists every altitude band', async () => {
    const document = await factsOf(spread);
    const term = [...document.querySelectorAll('dt')].find(
      (dt) => dt.textContent?.trim() === 'Във водна баня',
    );
    const bands = [...(term?.parentElement?.querySelectorAll('dd li') ?? [])].map((li) =>
      li.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(bands).toEqual(['до 300 м: 5 мин', '300–1800 м: 10 мин', 'над 1800 м: 15 мин']);
  });

  it('AC12: no longer says the time is only for up to 300 m', async () => {
    const document = await factsOf(spread);
    expect(document.body.textContent).not.toContain('за надморска височина до 300 м');
  });

  it('AC12: keeps the other facts', async () => {
    const document = await factsOf(spread);
    const terms = [...document.querySelectorAll('dt')].map((dt) => dt.textContent?.trim());
    expect(terms).toContain('Количество');
    expect(terms).toContain('Подготовка');
  });
});
