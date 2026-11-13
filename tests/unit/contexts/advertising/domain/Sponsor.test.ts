import { describe, expect, it } from 'vitest';
import { AD_PLACEMENTS, Sponsor } from '@contexts/advertising';
import type { AdPlacement } from '@contexts/advertising';
import { InvalidSponsorError } from '@shared/domain/errors';
import { sponsorInput } from '@tests/fixtures/sponsors';

describe('Sponsor', () => {
  it('AC1: creates a frozen sponsor with the given values', () => {
    const input = sponsorInput();
    const sponsor = Sponsor.create(input);
    expect(sponsor.id).toBe('test-sponsor');
    expect(sponsor.name).toBe(input.name);
    expect(sponsor.image).toEqual(input.image);
    expect(sponsor.alt).toBe(input.alt);
    expect(sponsor.url).toBe(input.url);
    expect(sponsor.placement).toBe('produce');
    expect(sponsor.from.toISOString()).toBe('2026-12-01T00:00:00.000Z');
    expect(sponsor.to.toISOString()).toBe('2026-12-31T00:00:00.000Z');
    expect(Object.isFrozen(sponsor)).toBe(true);
  });

  it('AC1: lists the produce and month placements', () => {
    expect(AD_PLACEMENTS).toEqual(['produce', 'month']);
  });

  it('AC1: accepts a one-day campaign', () => {
    const day = new Date('2026-12-05');
    expect(() => Sponsor.create(sponsorInput({ from: day, to: day }))).not.toThrow();
  });

  it.each([
    ['an invalid slug', { id: 'Not A Slug' }],
    ['a blank name', { name: '  ' }],
    ['a blank alt', { alt: '' }],
    ['a non-HTTPS url', { url: 'http://sponsor.example.com' }],
    ['a relative url', { url: '/oferta' }],
    ['an unknown placement', { placement: 'home' as AdPlacement }],
    ['an invalid start date', { from: new Date('nope') }],
    ['an invalid end date', { to: new Date('nope') }],
    ['an end before the start', { from: new Date('2026-12-02'), to: new Date('2026-12-01') }],
    [
      'an image without a positive size',
      { image: { src: '/banner.jpg', width: 0, height: 400, format: 'jpg' as const } },
    ],
  ])('AC2: rejects %s', (_label, overrides) => {
    expect(() => Sponsor.create(sponsorInput(overrides))).toThrow(InvalidSponsorError);
  });

  describe('isActiveOn', () => {
    const sponsor = Sponsor.create(sponsorInput());

    it('AC3: is active from the first to the last day, both included, in Europe/Sofia', () => {
      expect(sponsor.isActiveOn(new Date('2026-12-01T00:00:00+02:00'))).toBe(true);
      expect(sponsor.isActiveOn(new Date('2026-12-15T12:00:00+02:00'))).toBe(true);
      expect(sponsor.isActiveOn(new Date('2026-12-31T23:59:00+02:00'))).toBe(true);
    });

    it('AC3: is not active on the day before or the day after', () => {
      expect(sponsor.isActiveOn(new Date('2026-11-30T23:59:00+02:00'))).toBe(false);
      expect(sponsor.isActiveOn(new Date('2027-01-01T00:00:00+02:00'))).toBe(false);
    });

    it('AC3: compares Sofia calendar days, not UTC days', () => {
      expect(sponsor.isActiveOn(new Date('2026-11-30T23:30:00Z'))).toBe(true);
      expect(sponsor.isActiveOn(new Date('2026-12-31T22:30:00Z'))).toBe(false);
    });

    it('AC3: compares the calendar day in another time zone when given', () => {
      expect(sponsor.isActiveOn(new Date('2026-12-31T22:30:00Z'), 'UTC')).toBe(true);
    });
  });
});
