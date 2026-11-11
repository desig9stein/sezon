import { describe, expect, it } from 'vitest';
import GrowingGuide from '@components/produce/GrowingGuide.astro';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { growingRecord } from '@tests/fixtures/growing';
import { produceRecord } from '@tests/fixtures/records';
import { render } from './render';

const guideOf = (overrides: Parameters<typeof growingRecord>[0] = {}) => {
  const growing = toProduce('zele', produceRecord({ growing: growingRecord(overrides) })).growing;
  if (growing === undefined) throw new Error('growing missing');
  return growing;
};

describe('GrowingGuide', () => {
  it('AC4: renders the heading, only the activities with months, month links and tips', async () => {
    const html = await render(GrowingGuide, {
      growing: guideOf({ sow: [3, 4], transplant: [5], plant: [] }),
    });
    expect(html).toMatch(/<h2[^>]*>\s*Отглеждане в градината\s*<\/h2>/);
    expect(html).toMatch(/<dt[^>]*>\s*Сеитба\s*<\/dt>/);
    expect(html).toMatch(/<dt[^>]*>\s*Разсаждане\s*<\/dt>/);
    expect(html).not.toMatch(/<dt[^>]*>\s*Засаждане\s*<\/dt>/);
    expect(html).toMatch(
      /<a href="\/sezon\/mart"[^>]*>март<\/a>\s*–\s*<a href="\/sezon\/april"[^>]*>април<\/a>/,
    );
    expect(html).toMatch(/<a href="\/sezon\/may"[^>]*>май<\/a>/);
    expect(html.match(/<li/g)).toHaveLength(3);
  });

  it('AC4: shows the planting note', async () => {
    const html = await render(GrowingGuide, {
      growing: guideOf({
        sow: [],
        transplant: [],
        plant: [11, 3],
        plantingNote: 'Засажда се наесен или рано напролет.',
      }),
    });
    expect(html).toContain('Засажда се наесен или рано напролет.');
    expect(html).toMatch(/<a href="\/sezon\/mart"[^>]*>март<\/a>,\s*<a href="\/sezon\/noemvri"/);
  });

  it('QA 018: renders no list of months when no activity has months', async () => {
    const html = await render(GrowingGuide, {
      growing: guideOf({
        sow: [],
        transplant: [],
        plant: [],
        plantingNote: 'Сей при топла почва.',
      }),
    });
    expect(html).not.toContain('<dl');
    expect(html).toContain('Сей при топла почва.');
  });

  it('QA 025: renders its heading as h3 when nested in a group', async () => {
    const html = await render(GrowingGuide, { growing: guideOf(), headingLevel: 3 });
    expect(html).toMatch(/<h3[^>]*>\s*Отглеждане в градината\s*<\/h3>/);
  });
});
