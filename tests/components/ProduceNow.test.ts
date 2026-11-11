import { describe, expect, it } from 'vitest';
import ProduceNow from '@components/produce/ProduceNow.astro';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { Month } from '@contexts/seasonality';
import { produceRecord } from '@tests/fixtures/records';
import { render } from './render';

const text = (html: string) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const produce = toProduce('kopar', produceRecord({ season: [{ month: 6, level: 'peak' }] }));

describe('ProduceNow (QA 025)', () => {
  it('shows the stamp and the month when the produce is in season', async () => {
    const html = await render(ProduceNow, { produce, month: Month.of(6) });
    expect(html).toContain('season-stamp');
    expect(text(html)).toBe('Разгар през юни');
  });

  it('shows plain words without a stamp when the produce is out of season', async () => {
    const html = await render(ProduceNow, { produce, month: Month.of(11) });
    expect(html).not.toContain('season-stamp');
    expect(text(html)).toBe('Извън сезона през ноември');
  });
});
