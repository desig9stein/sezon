import { z } from 'astro/zod';
import type { ProduceRecord } from '@contexts/catalog/infrastructure/schemas';

/** Width and height of a seed photo, in px. */
export const PHOTO_SIZE = { width: 1600, height: 1200 } as const;

/**
 * Stand-in for Astro's `image()` schema helper: accepts a path string and returns image metadata
 * with the seed photo size, so produce schemas can be parsed outside Astro.
 */
export const testImage = () =>
  z.string().transform((src) => ({ src, ...PHOTO_SIZE, format: 'jpg' as const }));

/** Returns a valid photo record; `overrides` replace top-level fields. */
export function photoRecord(
  overrides: Partial<NonNullable<ProduceRecord['photo']>> = {},
): NonNullable<ProduceRecord['photo']> {
  return {
    src: { src: '/src/assets/produce/zele.jpg', ...PHOTO_SIZE, format: 'jpg' },
    alt: 'Глава бяло зеле с външни зелени листа върху дървена маса',
    credit: {
      author: 'Natasha Skov',
      authorUrl: 'https://unsplash.com/@natskov',
      sourceName: 'Unsplash',
      sourceUrl: 'https://unsplash.com/photos/ujh4hU9S-KA',
    },
    ...overrides,
  };
}
