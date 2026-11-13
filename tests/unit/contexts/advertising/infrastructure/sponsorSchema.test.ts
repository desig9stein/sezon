import { describe, expect, it } from 'vitest';
import { sponsorSchemaWith } from '@contexts/advertising/infrastructure/schemas';
import { toSponsor } from '@contexts/advertising/infrastructure/mappers';
import { testImage } from '@tests/fixtures/photos';
import { rawSponsorRecord } from '@tests/fixtures/sponsors';

const schema = sponsorSchemaWith({ image: testImage });

describe('sponsor schema', () => {
  it('AC7: parses a valid record and maps it to a sponsor', () => {
    const sponsor = toSponsor('test-sponsor', schema.parse(rawSponsorRecord()));
    expect(sponsor.id).toBe('test-sponsor');
    expect(sponsor.placement).toBe('month');
    expect(sponsor.image.src).toBe('../../assets/test-banner.jpg');
    expect(sponsor.from.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(sponsor.to.toISOString()).toBe('2026-12-31T00:00:00.000Z');
  });

  it('AC7: accepts a one-day campaign', () => {
    const record = rawSponsorRecord({ from: '2026-12-05', to: '2026-12-05' });
    expect(schema.safeParse(record).success).toBe(true);
  });

  it.each([
    ['a start after the end', { from: '2026-12-02', to: '2026-12-01' }],
    ['a non-HTTPS url', { url: 'http://sponsor.example.com' }],
    ['an unknown placement', { placement: 'home' }],
    ['a blank alt', { alt: ' ' }],
    ['an unknown field', { extra: true }],
  ])('AC7: rejects %s', (_label, overrides) => {
    expect(schema.safeParse(rawSponsorRecord(overrides)).success).toBe(false);
  });
});
