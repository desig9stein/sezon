import { describe, expect, it } from 'vitest';
import TraditionalUses from '@components/produce/TraditionalUses.astro';
import { render } from './render';

const uses = [
  {
    system: 'ayurveda' as const,
    use: 'Традиционно се използва в аюрведа.',
    source: { name: 'Източник', url: 'https://example.org/a' },
  },
  {
    system: 'folk' as const,
    use: 'Традиционно се използва в народната медицина.',
    source: { name: 'Друг', url: 'https://example.org/b' },
  },
];

describe('TraditionalUses', () => {
  it('AC8: renders the disclaimer before the list, system labels and sources', async () => {
    const html = await render(TraditionalUses, { uses });
    const disclaimer = html.indexOf('не е медицински съвет');
    expect(disclaimer).toBeGreaterThan(-1);
    expect(disclaimer).toBeLessThan(html.indexOf('<ul'));
    expect(html).toContain('Аюрведа');
    expect(html).toContain('Народна медицина');
    expect(html).toMatch(/<a[^>]*href="https:\/\/example\.org\/a"[^>]*>Източник<\/a>/);
  });

  it('AC8: renders nothing without uses', async () => {
    expect((await render(TraditionalUses, { uses: [] })).trim()).toBe('');
  });
});
