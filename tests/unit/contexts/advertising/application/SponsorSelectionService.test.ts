import { describe, expect, it } from 'vitest';
import { Sponsor, SponsorSelectionService } from '@contexts/advertising';
import type { SponsorInput, SponsorRepository } from '@contexts/advertising';
import { sponsorInput } from '@tests/fixtures/sponsors';

const ON = new Date('2026-12-15T12:00:00+02:00');

const sponsor = (overrides: Partial<SponsorInput>) => Sponsor.create(sponsorInput(overrides));

const serviceWith = (...sponsors: Sponsor[]) => {
  const repository: SponsorRepository = { all: async () => sponsors };
  return new SponsorSelectionService(repository);
};

describe('SponsorSelectionService', () => {
  it('AC4: returns undefined when there are no sponsors', async () => {
    expect(await serviceWith().forPlacement('produce', ON)).toBeUndefined();
  });

  it('AC4: ignores expired and future sponsors', async () => {
    const expired = sponsor({
      id: 'expired',
      from: new Date('2026-11-01'),
      to: new Date('2026-12-14'),
    });
    const future = sponsor({
      id: 'future',
      from: new Date('2026-12-16'),
      to: new Date('2027-01-31'),
    });
    expect(await serviceWith(expired, future).forPlacement('produce', ON)).toBeUndefined();
  });

  it('AC4: returns undefined when only another placement has a sponsor', async () => {
    expect(
      await serviceWith(sponsor({ placement: 'month' })).forPlacement('produce', ON),
    ).toBeUndefined();
  });

  it('AC5: returns the active sponsor of the requested placement', async () => {
    const produce = sponsor({ id: 'produce-sponsor', placement: 'produce' });
    const month = sponsor({ id: 'month-sponsor', placement: 'month' });
    const service = serviceWith(month, produce);
    expect((await service.forPlacement('produce', ON))?.id).toBe('produce-sponsor');
    expect((await service.forPlacement('month', ON))?.id).toBe('month-sponsor');
  });

  it('AC6: picks the latest start, then the lowest id, whatever the order', async () => {
    const older = sponsor({ id: 'a-older', from: new Date('2026-12-01') });
    const newerB = sponsor({ id: 'b-newer', from: new Date('2026-12-10') });
    const newerC = sponsor({ id: 'c-newer', from: new Date('2026-12-10') });
    for (const order of [
      [older, newerB, newerC],
      [newerC, newerB, older],
      [newerB, older, newerC],
    ]) {
      expect((await serviceWith(...order).forPlacement('produce', ON))?.id).toBe('b-newer');
    }
  });
});
