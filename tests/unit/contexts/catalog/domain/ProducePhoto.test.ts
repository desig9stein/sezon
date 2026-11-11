import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { InvalidProduceError } from '@shared/domain/errors';
import { photoRecord } from '@tests/fixtures/photos';
import { produceRecord } from '@tests/fixtures/records';

describe('Produce photo', () => {
  it('AC3: maps the record photo to produce.photo and freezes it', () => {
    const produce = toProduce('zele', produceRecord({ photo: photoRecord() }));
    expect(produce.photo).toEqual({
      image: { src: '/src/assets/produce/zele.jpg', width: 1600, height: 1200, format: 'jpg' },
      alt: 'Глава бяло зеле с външни зелени листа върху дървена маса',
      credit: {
        author: 'Natasha Skov',
        authorUrl: 'https://unsplash.com/@natskov',
        sourceName: 'Unsplash',
        sourceUrl: 'https://unsplash.com/photos/ujh4hU9S-KA',
      },
    });
    expect(Object.isFrozen(produce.photo)).toBe(true);
    expect(Object.isFrozen(produce.photo?.credit)).toBe(true);
  });

  it('AC3: has no photo when the record has none', () => {
    expect(toProduce('zele', produceRecord()).photo).toBeUndefined();
  });

  it('AC3: rejects an empty alt', () => {
    expect(() => toProduce('zele', produceRecord({ photo: photoRecord({ alt: '  ' }) }))).toThrow(
      InvalidProduceError,
    );
  });
});
