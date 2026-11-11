import { describe, expect, it } from 'vitest';
import { routes } from '@components/layout/routes';
import { Month } from '@contexts/seasonality';
import { SITE_NAME, ui } from '@i18n/bg';
import {
  characterCount,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from '@shared/seo';
import { readSeedCollection } from '@tests/fixtures/seedData';

const groups = readSeedCollection('groups').map(({ id, data }) => ({
  id,
  ...(data as { name: string; latinName: string; description: string }),
}));

describe('group page texts', () => {
  it.each(groups.map((group) => [group.id, group]))(
    'AC3: %s has a title within 60 characters and a 70–160 character description',
    (_id, group) => {
      expect(
        characterCount(`${ui.groups.title(group.name, group.latinName)} | ${SITE_NAME}`),
      ).toBeLessThanOrEqual(TITLE_MAX_LENGTH);
      for (let number = 1; number <= 12; number += 1) {
        const length = characterCount(ui.groups.description(group.description, Month.of(number)));
        expect(length).toBeGreaterThanOrEqual(DESCRIPTION_MIN_LENGTH);
        expect(length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
      }
    },
  );

  it('AC3: has the intro and empty texts', () => {
    expect(ui.groups.intro('Кръстоцветни', Month.of(11))).toBe(
      'Продуктите от семейство Кръстоцветни, подредени по сезона през ноември.',
    );
    expect(ui.groups.empty).toBe('Все още няма добавени продукти от това семейство.');
  });

  it('AC4: routes a group to /grupi/<slug>', () => {
    expect(routes.group('krastotsvetni')).toBe('/grupi/krastotsvetni');
  });
});
