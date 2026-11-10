import { describe, expect, it } from 'vitest';
import { collectionPageJsonLd } from '@shared/seo';

describe('collectionPageJsonLd', () => {
  it('AC4: returns a CollectionPage with an ItemList main entity', () => {
    const page = collectionPageJsonLd({
      siteUrl: 'https://sezon.example',
      path: '/zelenchutsi',
      name: 'Зеленчуци',
      description: 'Всички зеленчуци.',
      items: [{ name: 'Зеле', path: '/zelenchutsi/zele' }],
    });

    expect(page).toEqual({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Зеленчуци',
      description: 'Всички зеленчуци.',
      url: 'https://sezon.example/zelenchutsi',
      inLanguage: 'bg',
      mainEntity: {
        '@type': 'ItemList',
        name: 'Зеленчуци',
        numberOfItems: 1,
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Зеле',
            url: 'https://sezon.example/zelenchutsi/zele',
          },
        ],
      },
    });
  });
});
