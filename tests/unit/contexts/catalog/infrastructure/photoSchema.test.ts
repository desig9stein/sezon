import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { produceRecord } from '@tests/fixtures/records';
import { testImage } from '@tests/fixtures/photos';

const schema = produceSchemaWith({ image: testImage });
const PHOTO = {
  src: '../../assets/produce/zele.jpg',
  alt: 'Глава бяло зеле с външни зелени листа върху дървена маса',
  credit: {
    author: 'Natasha Skov',
    authorUrl: 'https://unsplash.com/@natskov',
    sourceName: 'Unsplash',
    sourceUrl: 'https://unsplash.com/photos/ujh4hU9S-KA',
  },
};
const record = (photo?: unknown) => ({
  ...produceRecord(),
  updatedAt: '2026-11-10',
  ...(photo === undefined ? {} : { photo }),
});

describe('produce photo schema', () => {
  it('AC1: accepts a record without a photo and one with a complete photo', () => {
    expect(schema.safeParse(record()).success).toBe(true);
    const parsed = schema.parse(record(PHOTO));
    expect(parsed.photo?.src).toMatchObject({ width: 1600, height: 1200, format: 'jpg' });
  });

  it.each(['alt', 'credit'])('AC1: rejects a photo without %s', (field) => {
    const photo = Object.fromEntries(Object.entries(PHOTO).filter(([key]) => key !== field));
    expect(schema.safeParse(record(photo)).success).toBe(false);
  });

  it.each(['author', 'authorUrl', 'sourceName', 'sourceUrl'])(
    'AC1: rejects a credit with an empty %s',
    (field) => {
      const photo = { ...PHOTO, credit: { ...PHOTO.credit, [field]: '' } };
      expect(schema.safeParse(record(photo)).success).toBe(false);
    },
  );

  it.each(['authorUrl', 'sourceUrl'])('AC1: rejects a non-https %s', (field) => {
    const photo = { ...PHOTO, credit: { ...PHOTO.credit, [field]: 'http://unsplash.com/x' } };
    expect(schema.safeParse(record(photo)).success).toBe(false);
  });

  it('AC1: rejects an empty alt and unknown photo fields', () => {
    expect(schema.safeParse(record({ ...PHOTO, alt: ' ' })).success).toBe(false);
    expect(schema.safeParse(record({ ...PHOTO, caption: 'x' })).success).toBe(false);
  });
});
