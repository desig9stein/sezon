import type { ProduceRecord } from '@contexts/catalog/infrastructure/schemas';
import type { FarmRecord } from '@contexts/farms/infrastructure/schemas';

/** Returns a valid produce organic record; `overrides` replace top-level fields. */
export function organicRecord(
  overrides: Partial<NonNullable<ProduceRecord['organic']>> = {},
): NonNullable<ProduceRecord['organic']> {
  return {
    availability: 'available',
    note: 'През 2023 г. в България има биологично отглеждани ябълки (Евростат).',
    sources: [{ name: 'Евростат – org_cropar', url: 'https://ec.europa.eu/eurostat/org_cropar' }],
    ...overrides,
  };
}

/** Returns a valid farm organic certificate record valid until the end of 2026. */
export function certificateRecord(
  overrides: Partial<NonNullable<FarmRecord['organic']>> = {},
): NonNullable<FarmRecord['organic']> {
  return {
    certifier: 'Балкан Биосерт',
    certificateId: 'BG-BIO-03-0001',
    validUntil: new Date('2026-12-31'),
    ...overrides,
  };
}
