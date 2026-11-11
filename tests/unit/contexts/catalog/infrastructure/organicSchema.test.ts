import { describe, expect, it } from 'vitest';
import { produceSchemaWith } from '@contexts/catalog/infrastructure/schemas';
import { organicRecord } from '@tests/fixtures/organic';
import { testImage } from '@tests/fixtures/photos';
import { produceRecord } from '@tests/fixtures/records';

const schema = produceSchemaWith({ image: testImage });
const valid = (organic?: unknown) =>
  schema.safeParse({
    ...produceRecord(),
    updatedAt: '2026-11-10',
    ...(organic === undefined ? {} : { organic }),
  }).success;

describe('produce organic schema', () => {
  it('AC1: accepts a valid organic block and a produce without one', () => {
    expect(valid()).toBe(true);
    expect(valid(organicRecord())).toBe(true);
    expect(valid(organicRecord({ availability: 'limited' }))).toBe(true);
  });

  it.each([
    ['an unknown availability', { ...organicRecord(), availability: 'unknown' }],
    ['a note over 160 characters', organicRecord({ note: 'а'.repeat(161) })],
    ['empty sources', organicRecord({ sources: [] })],
  ])('AC1: rejects %s', (_label, organic) => {
    expect(valid(organic)).toBe(false);
  });
});

describe('produce organic schema (QA 019)', () => {
  it('AC1: rejects a block without sources', () => {
    const withoutSources: Partial<ReturnType<typeof organicRecord>> = organicRecord();
    delete withoutSources.sources;
    expect(valid(withoutSources)).toBe(false);
  });
});
