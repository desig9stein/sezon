import { describe, expect, it } from 'vitest';
import SourceList from '@components/produce/SourceList.astro';
import { render } from './render';

describe('SourceList (QA 005)', () => {
  it('ends the update sentence with a single full stop and shows the draft note', async () => {
    const html = await render(SourceList, {
      sources: [{ name: 'USDA', url: 'https://fdc.nal.usda.gov/' }],
      updatedAt: new Date('2026-11-10'),
      isDraft: true,
    });
    expect(html).toMatch(/<time datetime="2026-11-10"[^>]*>10 ноември 2026 г\.<\/time>(?!\.)/);
    expect(html).toContain('Данните очакват редакторска проверка.');
  });
});
