import { globSync, readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

interface ProduceText {
  readonly summary: string;
  readonly howToChoose?: string;
  readonly faq?: ReadonlyArray<{ readonly answer: string }>;
  readonly season: ReadonlyArray<{ month: number }>;
}

/** Bulgarian month names, January first; they do not decline. */
const MONTHS = [
  'януари',
  'февруари',
  'март',
  'април',
  'май',
  'юни',
  'юли',
  'август',
  'септември',
  'октомври',
  'ноември',
  'декември',
] as const;
const MONTHS_IN_YEAR = 12;
const MONTH_ALTERNATION = MONTHS.join('|');
/** A qualifier before a month name, e.g. „края на“ in „от края на юли“. */
const QUALIFIER = '(?:(?:началото|средата|края|първата половина|втората половина) на )?';
const NOT_LETTER_BEFORE = '(?<!\\p{L})';
const NOT_LETTER_AFTER = '(?!\\p{L})';
const RANGE = new RegExp(
  `${NOT_LETTER_BEFORE}от ${QUALIFIER}(${MONTH_ALTERNATION}) до ${QUALIFIER}(${MONTH_ALTERNATION})${NOT_LETTER_AFTER}`,
  'giu',
);
/** „от <month>“ that is not followed by „до <qualifier> <month>“. */
const OPEN_FROM = new RegExp(
  `${NOT_LETTER_BEFORE}от ${QUALIFIER}(${MONTH_ALTERNATION})${NOT_LETTER_AFTER}(?! до ${QUALIFIER}(?:${MONTH_ALTERNATION}))`,
  'giu',
);

/**
 * Months a text names for another event than the open-field harvest (sowing, planting out,
 * flowering, a harvest under cover), so they need not be season months. Each entry must still appear in its text.
 */
const OTHER_EVENT_MONTHS: Readonly<Record<string, ReadonlyArray<[number, string]>>> = {
  bamya: [[5, 'sowing']],
  bosilek: [[6, 'planting out']],
  brokoli: [[7, 'planting out']],
  'cherna-borovinka': [
    [6, 'flowering'],
    [7, 'flowering'],
  ],
  fastatsi: [[4, 'sowing']],
  gluharche: [[5, 'flowering']],
  patladzhan: [[5, 'planting out']],
  'godzhi-beri': [
    [7, 'flowering'],
    [8, 'flowering'],
  ],
  rukola: [[9, 'sowing']],
  tikvichki: [[4, 'first harvest under cover, before the open-field season (spec 041)']],
};

const monthNumber = (name: string): number =>
  MONTHS.indexOf(name.toLowerCase() as (typeof MONTHS)[number]) + 1;
const wordPattern = (name: string) =>
  new RegExp(`${NOT_LETTER_BEFORE}${name}${NOT_LETTER_AFTER}`, 'iu');
/** Months from `first` to `last` inclusive, wrapping over December. */
function monthsBetween(first: number, last: number): number[] {
  const months: number[] = [];
  for (let month = first; ; month = (month % MONTHS_IN_YEAR) + 1) {
    months.push(month);
    if (month === last) return months;
  }
}

const entries = globSync('src/data/produce/*.yaml').map((file) => {
  const record = parse(readFileSync(file, 'utf8')) as ProduceText;
  return {
    slug: basename(file, '.yaml'),
    texts: [
      record.summary,
      record.howToChoose ?? '',
      ...(record.faq ?? []).map((item) => item.answer),
    ],
    faqAnswers: (record.faq ?? []).map((item) => item.answer),
    season: new Set(record.season.map(({ month }) => month)),
    summary: record.summary,
  };
});
const entryOf = (slug: string) => entries.find((entry) => entry.slug === slug);
const summaryOf = (slug: string) => entryOf(slug)?.summary ?? '';

describe('season texts match the season strip (spec 058)', () => {
  it('AC8 (a): every month named in a summary, how-to-choose or FAQ answer is a season month or whitelisted', () => {
    const problems = entries.flatMap(({ slug, texts, season }) => {
      const allowed = new Set((OTHER_EVENT_MONTHS[slug] ?? []).map(([month]) => month));
      return MONTHS.flatMap((name, index) => {
        const month = index + 1;
        const named = texts.some((text) => wordPattern(name).test(text));
        return named && !season.has(month) && !allowed.has(month) ? [`${slug}: ${name}`] : [];
      });
    });
    expect(problems).toEqual([]);
  });

  it('AC8: every whitelisted month still appears in its text', () => {
    for (const [slug, months] of Object.entries(OTHER_EVENT_MONTHS)) {
      const entry = entries.find((candidate) => candidate.slug === slug);
      for (const [month, reason] of months) {
        const name = MONTHS[month - 1] ?? '';
        expect(
          entry?.texts.some((text) => wordPattern(name).test(text)),
          `${slug} ${name} (${reason})`,
        ).toBe(true);
      }
    }
  });

  it('AC8 (b): every month of „от … до …“ is a season month', () => {
    const problems = entries.flatMap(({ slug, texts, season }) =>
      texts.flatMap((text) =>
        [...text.matchAll(RANGE)].flatMap(([phrase, first = '', last = '']) =>
          monthsBetween(monthNumber(first), monthNumber(last)).some((month) => !season.has(month))
            ? [`${slug}: ${phrase}`]
            : [],
        ),
      ),
    );
    expect(problems).toEqual([]);
  });

  it('AC8 (c): no open „от <month>“ names the last month of the season', () => {
    const problems = entries.flatMap(({ slug, texts, season }) =>
      texts.flatMap((text) =>
        [...text.matchAll(OPEN_FROM)].flatMap(([phrase, name = '']) => {
          const next = (monthNumber(name) % MONTHS_IN_YEAR) + 1;
          return season.has(next) ? [] : [`${slug}: ${phrase}`];
        }),
      ),
    );
    expect(problems).toEqual([]);
  });

  it('AC9: broccoli follows its source: harvested in autumn, mostly in October', () => {
    expect(summaryOf('brokoli')).toContain('най-вече през октомври');
    expect(summaryOf('brokoli')).not.toMatch(/септември/);
  });

  it('AC9: the tomato summary and FAQ give the same open-field harvest, July to September', () => {
    expect(summaryOf('domati')).toContain('от юли до септември');
    expect(entryOf('domati')?.faqAnswers.join(' ')).toContain('От юли до септември');
  });

  it('AC9: rose hips do not claim a harvest until the first frosts', () => {
    expect(summaryOf('shipka')).not.toMatch(/слан/);
    expect(summaryOf('shipka')).toMatch(/септември/);
  });

  it('AC9: elder does not claim a harvest from mid-August onwards (wording of spec 061)', () => {
    expect(summaryOf('cheren-baz')).not.toContain('от средата на август');
    expect(summaryOf('cheren-baz')).toContain('през август – от средата на месеца');
  });
});
