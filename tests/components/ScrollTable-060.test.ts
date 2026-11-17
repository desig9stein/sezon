import { describe, expect, it } from 'vitest';
import ScrollTable from '@components/ui/ScrollTable.astro';
import { render } from './render';

const CAPTION = 'Таблица за проба';
const TABLE = `<table><caption>${CAPTION}</caption><tr><td>1</td></tr></table>`;

describe('ScrollTable (spec 060)', () => {
  it('AC6: is a focusable named section (a region) named differently from the caption', async () => {
    const html = await render(ScrollTable, { caption: CAPTION }, { default: TABLE });
    const wrapper = /<section[^>]*class="table-scroll[^"]*"[^>]*>/.exec(html)?.[0] ?? '';
    expect(wrapper).toContain('tabindex="0"');
    expect(wrapper).not.toContain('aria-labelledby');
    expect(wrapper).not.toContain(`aria-label="${CAPTION}"`);
  });

  it('QA 060: names the region after its table caption with a short scrolling suffix', async () => {
    const html = await render(ScrollTable, { caption: CAPTION }, { default: TABLE });
    expect(html).toContain(`aria-label="${CAPTION} (превъртане)"`);
  });
});
