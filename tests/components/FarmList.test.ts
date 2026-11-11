import { describe, expect, it } from 'vitest';
import FarmList from '@components/produce/FarmList.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

const farm = toFarm('zelena-dolina', farmRecord());
const sponsored = toFarm(
  'sad',
  farmRecord({
    name: 'Сад',
    sponsored: true,
    contact: { phone: '+359888123456' },
  }),
);
const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });
const farms = [
  { farm: sponsored, region: plovdiv },
  { farm, region: plovdiv },
];

describe('FarmList', () => {
  it('AC9: renders contact links with descriptive names and labels', async () => {
    const html = await render(FarmList, { farms });
    expect(html).toMatch(
      /<a[^>]*href="https:\/\/example\.com"[^>]*>\s*Уебсайт на Зелена долина\s*<\/a>/,
    );
    expect(html).toMatch(
      /<a[^>]*href="mailto:farm@example\.com"[^>]*>\s*Имейл до Зелена долина\s*<\/a>/,
    );
    expect(html).toMatch(
      /<a[^>]*href="tel:\+359888123456"[^>]*aria-label="Телефон на Сад: \+359888123456"[^>]*>\s*\+359888123456\s*<\/a>/,
    );
    expect(html).toContain('Спонсорирано');
    expect(html).toContain('Пловдив');
    expect(html).toMatch(/<a[^>]*href="https:\/\/example\.com"[^>]*rel="noopener"/);
    expect(html).toMatch(/<span aria-hidden="true"[^>]*>Телефон:<\/span>/);
  });

  it('AC9: shows the empty state', async () => {
    const html = await render(FarmList, { farms: [] });
    expect(html).toContain('Все още няма добавени ферми за този продукт.');
  });
});
