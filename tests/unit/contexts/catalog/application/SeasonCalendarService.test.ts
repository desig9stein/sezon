import { describe, expect, it } from 'vitest';
import { SeasonCalendarService } from '@contexts/catalog';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

describe('SeasonCalendarService', () => {
  it('AC1: groups produce by kind in section order, leaving out empty kinds', async () => {
    const service = new SeasonCalendarService(
      produceRepositoryOf([
        aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
        aProduce({
          slug: 'kopar',
          name: 'Копър',
          kind: 'herb',
          season: [{ month: 6, level: 'peak' }],
        }),
        aProduce({
          slug: 'yabalki',
          name: 'Ябълки',
          kind: 'fruit',
          season: [{ month: 9, level: 'peak' }],
        }),
        aProduce({
          slug: 'dyuli',
          name: 'Дюли',
          kind: 'fruit',
          season: [{ month: 10, level: 'peak' }],
        }),
      ]),
    );

    const calendar = await service.calendar();

    expect(calendar.groups.map((group) => [group.kind, group.produce.map((p) => p.slug)])).toEqual([
      ['fruit', ['dyuli', 'yabalki']],
      ['vegetable', ['zele']],
      ['herb', ['kopar']],
    ]);
    expect(Object.isFrozen(calendar.groups)).toBe(true);
  });
});
