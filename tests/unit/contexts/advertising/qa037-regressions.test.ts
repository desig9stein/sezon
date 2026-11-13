import { describe, expect, it } from 'vitest';
import { Sponsor } from '@contexts/advertising';
import { sponsorSchemaWith } from '@contexts/advertising/infrastructure/schemas';
import { InvalidSponsorError } from '@shared/domain/errors';
import { testImage } from '@tests/fixtures/photos';
import { rawSponsorRecord, sponsorInput } from '@tests/fixtures/sponsors';

const schema = sponsorSchemaWith({ image: testImage });

describe('sponsor dates (QA 037)', () => {
  it.each([
    ['a start with a time of day', { from: new Date('2026-11-14T00:00:00+02:00') }],
    ['an end with a time of day', { to: new Date('2026-12-31T12:00:00Z') }],
  ])('AC2: Sponsor.create rejects %s', (_label, overrides) => {
    expect(() => Sponsor.create(sponsorInput(overrides))).toThrow(InvalidSponsorError);
  });

  it.each([
    ['a date-time string', { from: '2026-11-14T00:00:00+02:00' }],
    ['a YAML timestamp with a time', { to: new Date('2026-12-31T10:00:00Z') }],
  ])('AC7: the schema rejects %s', (_label, overrides) => {
    expect(schema.safeParse(rawSponsorRecord(overrides)).success).toBe(false);
  });

  it('AC7: the schema accepts a YAML date (UTC midnight)', () => {
    const record = rawSponsorRecord({ from: new Date('2026-12-01'), to: new Date('2026-12-31') });
    expect(schema.safeParse(record).success).toBe(true);
  });

  it('AC1: mutating a returned date does not change the sponsor', () => {
    const sponsor = Sponsor.create(sponsorInput());
    sponsor.from.setUTCFullYear(2000);
    sponsor.to.setUTCFullYear(2000);
    expect(sponsor.from.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(sponsor.to.toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });
});
