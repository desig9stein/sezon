import { describe, expect, it } from 'vitest';
import FarmList from '@components/produce/FarmList.astro';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { certificateRecord, organicRecord } from '@tests/fixtures/organic';
import { farmRecord, produceRecord } from '@tests/fixtures/records';
import { render } from './render';

const plovdiv = toRegion('plovdiv', { name: 'Пловдив' });
const bio = toFarm('bio', farmRecord({ name: 'Био градина', organic: certificateRecord() }));
const plain = toFarm('obiknovena', farmRecord({ name: 'Обикновена' }));
const organic = toProduce('yabalki', produceRecord({ organic: organicRecord() })).organic;

describe('FarmList organic information', () => {
  it('AC5: renders the status line and groups organic farms with their certifier', async () => {
    const html = await render(FarmList, {
      organic,
      farms: [
        { farm: bio, region: plovdiv, organic: true },
        { farm: plain, region: plovdiv, organic: false },
      ],
    });
    const text = html.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ');
    expect(text).toContain(
      'Биологично производство в България: има сертифицирано биологично производство.',
    );
    expect(html).toContain('През 2023 г. в България има биологично отглеждани ябълки (Евростат).');
    expect(html).toMatch(
      /<h3[^>]*>\s*Сертифицирани био ферми\s*<\/h3>[\s\S]*Био градина[\s\S]*<h3[^>]*>\s*Други ферми\s*<\/h3>[\s\S]*Обикновена/,
    );
    expect(html).toMatch(/<h4[^>]*>\s*Био градина\s*<\/h4>/);
    expect(html).toContain('Био · Балкан Биосерт');
  });

  it('AC5: keeps the single list without organic farms', async () => {
    const html = await render(FarmList, {
      farms: [{ farm: plain, region: plovdiv, organic: false }],
    });
    expect(html).not.toContain('Сертифицирани био ферми');
    expect(html).toMatch(/<h3[^>]*>\s*Обикновена\s*<\/h3>/);
    expect(html).not.toContain('Биологично производство в България');
  });
});
