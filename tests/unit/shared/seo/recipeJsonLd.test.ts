import { describe, expect, it } from 'vitest';
import { isoDuration, recipeJsonLd } from '@shared/seo';

const input = {
  siteUrl: 'https://sezon.example',
  path: '/retsepti/kiselo-zele',
  name: 'Кисело зеле',
  description: 'Нарязано кисело зеле в буркан.',
  category: 'кисело зеле',
  yield: 'около 1,7 л',
  ingredients: ['2,3 кг бяло зеле', '3 с.л. сол'],
  steps: ['Нарежи зелето.', 'Посоли го.'],
  prepMinutes: 40,
  cookMinutes: 10,
  processingMinutes: 15,
  waitDays: 21,
  datePublished: new Date('2026-11-13'),
  dateModified: new Date('2026-11-14'),
  citations: [
    { name: 'NCHFP – Sauerkraut', url: 'https://nchfp.uga.edu/how/ferment/recipes/sauerkraut' },
  ],
};

describe('recipeJsonLd (spec 048)', () => {
  it('AC7: builds schema.org Recipe data', () => {
    expect(recipeJsonLd(input)).toEqual({
      '@context': 'https://schema.org',
      '@type': 'Recipe',
      name: 'Кисело зеле',
      description: 'Нарязано кисело зеле в буркан.',
      url: 'https://sezon.example/retsepti/kiselo-zele',
      inLanguage: 'bg',
      recipeCategory: 'кисело зеле',
      recipeCuisine: 'Bulgarian',
      recipeYield: 'около 1,7 л',
      recipeIngredient: ['2,3 кг бяло зеле', '3 с.л. сол'],
      recipeInstructions: [
        { '@type': 'HowToStep', position: 1, text: 'Нарежи зелето.' },
        { '@type': 'HowToStep', position: 2, text: 'Посоли го.' },
      ],
      prepTime: 'PT40M',
      cookTime: 'PT10M',
      totalTime: 'P21DT1H5M',
      datePublished: '2026-11-13',
      dateModified: '2026-11-14',
      citation: [
        {
          '@type': 'CreativeWork',
          name: 'NCHFP – Sauerkraut',
          url: 'https://nchfp.uga.edu/how/ferment/recipes/sauerkraut',
        },
      ],
    });
  });

  it('AC7: totalTime has no day part without waiting', () => {
    expect(recipeJsonLd({ ...input, waitDays: 0 }).totalTime).toBe('PT1H5M');
  });

  it.each([
    [{ minutes: 0 }, 'PT0M'],
    [{ minutes: 25 }, 'PT25M'],
    [{ minutes: 60 }, 'PT1H'],
    [{ minutes: 65 }, 'PT1H5M'],
    [{ days: 21, minutes: 65 }, 'P21DT1H5M'],
    [{ days: 3, minutes: 0 }, 'P3D'],
  ])('AC7: isoDuration(%o) is %s', (duration, expected) => {
    expect(isoDuration(duration)).toBe(expected);
  });
});
