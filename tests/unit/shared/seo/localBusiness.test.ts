import { describe, expect, it } from 'vitest';
import { localBusinessJsonLd } from '@shared/seo';

describe('localBusinessJsonLd (spec 030)', () => {
  it('AC5: describes a farm with its contacts and address', () => {
    expect(
      localBusinessJsonLd({
        siteUrl: 'https://sezon.example',
        path: '/fermi/venets',
        name: 'Венец',
        description: 'Пермакултурни градини.',
        telephone: '+359882538244',
        email: 'info@venets.co',
        address: 'с. Тодорово',
        website: 'https://venets.co/',
      }),
    ).toEqual({
      '@context': 'https://schema.org',
      '@type': 'LocalBusiness',
      name: 'Венец',
      description: 'Пермакултурни градини.',
      url: 'https://sezon.example/fermi/venets',
      telephone: '+359882538244',
      email: 'info@venets.co',
      address: 'с. Тодорово',
      sameAs: ['https://venets.co/'],
    });
  });

  it('AC5: leaves out what the farm does not have', () => {
    const data = localBusinessJsonLd({
      siteUrl: 'https://sezon.example',
      path: '/fermi/agro',
      name: 'Агро',
      description: 'Описание.',
    });
    expect(Object.keys(data).sort()).toEqual(['@context', '@type', 'description', 'name', 'url']);
  });
});
