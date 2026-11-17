import { describe, expect, it } from 'vitest';
import { GROWING_ACTIVITIES, GrowingGuide } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { ui } from '@i18n/bg';

const SOURCE = { name: 'Български фермер – Календар на сеитбите', url: 'https://example.org' };

describe('sowing seedlings (spec 061)', () => {
  it('AC14: a month can have sowing seedlings, sowing, transplanting and planting, in that order', () => {
    const guide = GrowingGuide.create({
      sowSeedlings: [3],
      sow: [3],
      transplant: [3],
      plant: [3],
      tips: [],
      sources: [SOURCE],
    });
    expect(guide.activitiesIn(Month.of(3))).toEqual(['sowSeedlings', 'sow', 'transplant', 'plant']);
    expect(guide.monthsOf('sowSeedlings').map((month) => month.number)).toEqual([3]);
  });

  it('AC14: sowing seedlings is optional and empty by default', () => {
    const guide = GrowingGuide.create({
      sow: [4],
      transplant: [],
      plant: [],
      tips: [],
      sources: [SOURCE],
    });
    expect(guide.monthsOf('sowSeedlings')).toEqual([]);
  });

  it('AC14: labels tell seedlings from sowing and say that transplanting is outdoors', () => {
    expect(GROWING_ACTIVITIES.map((activity) => ui.produce.growingActivities[activity])).toEqual([
      'Сеитба на разсад',
      'Сеитба',
      'Разсаждане навън',
      'Засаждане',
    ]);
  });
});
