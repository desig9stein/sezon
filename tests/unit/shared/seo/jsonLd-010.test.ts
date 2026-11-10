import { describe, expect, it } from 'vitest';
import { collectionPageJsonLd, itemListJsonLd } from '@shared/seo';

describe('collectionPageJsonLd', () => {
  it('AC4: returns a CollectionPage with an ItemList main entity', () => {
    const list = itemListJsonLd(
      'Зеленчуци',
      [{ name: 'Зеле', path: '/zelenchutsi/zele' }],
      'https://sezon.example',
    );

    const page = collectionPageJsonLd({
      siteUrl: 'https://sezon.example',
      path: '/zelenchutsi',
      name: 'Зеленчуци',
      description: 'Всички зеленчуци.',
      mainEntity: list,
    });

    expect(page).toEqual({
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: 'Зеленчуци',
      description: 'Всички зеленчуци.',
      url: 'https://sezon.example/zelenchutsi',
      inLanguage: 'bg',
      mainEntity: expect.objectContaining({ '@type': 'ItemList', name: 'Зеленчуци' }),
    });
    expect((page as { mainEntity: Record<string, unknown> }).mainEntity).not.toHaveProperty(
      '@context',
    );
    expect(list).toHaveProperty('@context');
  });
});
