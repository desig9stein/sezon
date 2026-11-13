import type { SponsorInput } from '@contexts/advertising';

/** Intrinsic size of the test banner, in px (4:1). */
export const BANNER_SIZE = { width: 1600, height: 400 } as const;

/** Returns valid {@link SponsorInput}; `overrides` replace top-level fields. */
export function sponsorInput(overrides: Partial<SponsorInput> = {}): SponsorInput {
  return {
    id: 'test-sponsor',
    name: 'Тестов спонсор',
    image: { src: '/src/assets/test-banner.jpg', ...BANNER_SIZE, format: 'jpg' },
    alt: 'Тестов банер на спонсор',
    url: 'https://sponsor.example.com/oferta',
    placement: 'produce',
    from: new Date('2026-12-01'),
    to: new Date('2026-12-31'),
    ...overrides,
  };
}

/** Returns a raw sponsor entry as YAML would give it; `overrides` replace top-level fields. */
export function rawSponsorRecord(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    name: 'Тестов спонсор',
    image: '../../assets/test-banner.jpg',
    alt: 'Тестов банер на спонсор',
    url: 'https://sponsor.example.com/oferta',
    placement: 'month',
    from: '2026-12-01',
    to: '2026-12-31',
    ...overrides,
  };
}
