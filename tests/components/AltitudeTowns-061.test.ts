import { describe, expect, it } from 'vitest';
import { Window } from 'happy-dom';
import AltitudeTowns from '@components/recipes/AltitudeTowns.astro';
import { Recipe } from '@contexts/recipes';
import { recipeInput } from '@tests/fixtures/recipes';
import { render } from './render';

const SOURCE = {
  name: 'НСИ, Национален регистър на населените места – ЕКАТТЕ',
  url: 'https://nrnm.nsi.bg/ekatte/territorial-units',
};

const TOWNS = [
  { name: 'Варна', fromMetres: 0, toMetres: 49 },
  { name: 'София', fromMetres: 500, toMetres: 699 },
  { name: 'Смолян', fromMetres: 700, toMetres: 999 },
];

async function documentOf() {
  const html = await render(AltitudeTowns, {
    recipe: Recipe.create(recipeInput()),
    towns: TOWNS,
    source: SOURCE,
  });
  const window = new Window();
  window.document.write(`<main>${html}</main>`);
  return window.document;
}

describe('province towns by water-bath band (spec 061)', () => {
  it('AC5: lists the towns under the band their altitude lies in, with its minutes', async () => {
    const document = await documentOf();
    const items = [...document.querySelectorAll('li')].map((li) =>
      li.textContent?.replace(/\s+/g, ' ').trim(),
    );
    expect(items).toContain('до 300 м: 25 мин – Варна');
    expect(items).toContain('300–900 м: 30 мин – София');
  });

  it('AC5: names a town that spans two bands with both of them', async () => {
    const text = (await documentOf()).body.textContent?.replace(/\s+/g, ' ') ?? '';
    expect(text).toContain('Смолян (700–999 м)');
    expect(text).toContain('300–900 м: 30 мин');
    expect(text).toContain('900–1800 м (35 мин)');
  });

  it('AC5: cites the НСИ register', async () => {
    const document = await documentOf();
    const link = document.querySelector(`a[href="${SOURCE.url}"]`);
    expect(link?.textContent).toContain('ЕКАТТЕ');
  });
});
