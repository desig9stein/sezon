import { describe, expect, it } from 'vitest';
import { InvalidFarmError } from '@shared/domain';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { certificateRecord } from '@tests/fixtures/organic';
import { farmRecord } from '@tests/fixtures/records';

const farm = (validUntil: Date) =>
  toFarm('sad', farmRecord({ organic: certificateRecord({ validUntil }) }));

describe('organic certificate validity (QA 019)', () => {
  it('AC3: compares the calendar day in Europe/Sofia, not in UTC', () => {
    const winter = farm(new Date('2026-12-31'));
    expect(winter.isOrganicOn(new Date('2026-12-31T23:59:00+02:00'))).toBe(true);
    expect(winter.isOrganicOn(new Date('2027-01-01T00:30:00+02:00'))).toBe(false);
    expect(winter.isOrganicOn(new Date('2027-01-01T01:59:00+02:00'))).toBe(false);
    const summer = farm(new Date('2027-06-30'));
    expect(summer.isOrganicOn(new Date('2027-07-01T02:30:00+03:00'))).toBe(false);
  });

  it.each([
    ['an invalid expiry date', certificateRecord({ validUntil: new Date('nope') })],
    ['a blank certifier', certificateRecord({ certifier: ' ' })],
    ['a blank certificate id', certificateRecord({ certificateId: '' })],
  ])('AC3: rejects a certificate with %s', (_label, organic) => {
    expect(() => toFarm('sad', farmRecord({ organic }))).toThrow(InvalidFarmError);
  });
});
