import { describe, expect, it } from 'vitest';
import ScrollTable from '@components/ui/ScrollTable.astro';
import { render } from './render';

const TABLE =
  '<table><caption id="t-caption">Таблица за проба</caption><tr><td>1</td></tr></table>';

describe('ScrollTable (spec 060)', () => {
  it('AC6: is a focusable region named differently from the caption', async () => {
    const html = await render(ScrollTable, {}, { default: TABLE });
    const wrapper = /<div[^>]*class="table-scroll[^"]*"[^>]*>/.exec(html)?.[0] ?? '';
    expect(wrapper).toContain('role="region"');
    expect(wrapper).toContain('tabindex="0"');
    expect(wrapper).toContain('aria-label="Таблица с хоризонтално превъртане"');
    expect(wrapper).not.toContain('aria-labelledby');
  });
});
