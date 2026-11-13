import { describe, expect, it } from 'vitest';
import { monthlyFeedChannel, monthlyFeedItems } from '@components/season/monthlyFeed';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { ui } from '@i18n/bg';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const SITE = 'https://sezon.example/';
const NOW = new Date('2026-11-13T10:00:00Z');
const NOVEMBER = Month.of(11);

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'praz', name: 'Праз', season: [{ month: 11, level: 'peak' }] }),
    aProduce({ slug: 'spanak', name: 'Спанак', season: [{ month: 11, level: 'peak' }] }),
    aProduce({
      slug: 'yabalki',
      name: 'Ябълки',
      kind: 'fruit',
      season: [{ month: 11, level: 'available' }],
    }),
    aProduce({
      slug: 'chereshi',
      name: 'Череши',
      kind: 'fruit',
      season: [{ month: 6, level: 'peak' }],
    }),
  ]),
);
const overviews = await Promise.all(Month.all().map((month) => service.overviewFor(month)));
const items = monthlyFeedItems(overviews, SITE, NOW);
const itemFor = (month: Month) => items.find((item) => item.title === ui.monthPage.title(month));

describe('monthlyFeedItems (spec 047)', () => {
  it('AC1: returns one item per month titled like the month page', () => {
    expect(items).toHaveLength(12);
    expect(new Set(items.map((item) => item.title))).toEqual(
      new Set(Month.all().map((month) => ui.monthPage.title(month))),
    );
    expect(itemFor(NOVEMBER)?.title).toBe('Какво е в сезон през ноември');
  });

  it('AC2: links every item to the absolute month page URL without a trailing slash', () => {
    for (const month of Month.all()) {
      expect(itemFor(month)?.link).toBe(`https://sezon.example/sezon/${month.slug}`);
    }
  });

  it('AC3: names the peak produce in lower case, joined with „и“, in plain text', () => {
    expect(itemFor(NOVEMBER)?.description).toBe(
      'През ноември в разгара на сезона: зеле, праз и спанак. Виж всичко, което е в сезон в България през ноември.',
    );
    expect(itemFor(Month.of(6))?.description).toBe(
      'През юни в разгара на сезона: череши. Виж всичко, което е в сезон в България през юни.',
    );
    for (const item of items) {
      expect(item.description).not.toMatch(/[<>&]/);
    }
  });

  it('AC3: says nothing is at its peak in a month without peak produce', () => {
    expect(itemFor(Month.of(1))?.description).toBe(
      'През януари нищо не е в разгара на сезона. Виж какво е в сезон в България през януари.',
    );
  });

  it('AC4: orders the items by pubDate, newest first, starting with the build month', () => {
    expect(items[0]?.title).toBe(ui.monthPage.title(NOVEMBER));
    expect(items[11]?.title).toBe(ui.monthPage.title(Month.of(12)));
    const times = items.map((item) => item.pubDate.getTime());
    expect(times).toEqual([...times].sort((a, b) => b - a));
    for (const item of items) {
      expect(item.pubDate.getTime()).toBeLessThanOrEqual(NOW.getTime());
    }
  });
});

describe('monthlyFeedItems guid (QA 047)', () => {
  it('AC11: gives each item a guid of its link and the Sofia year of its pubDate', () => {
    expect(itemFor(NOVEMBER)?.guid).toBe('https://sezon.example/sezon/noemvri#2026');
    expect(itemFor(Month.of(12))?.guid).toBe('https://sezon.example/sezon/dekemvri#2025');
    expect(itemFor(Month.of(1))?.pubDate.toISOString()).toBe('2025-12-31T22:00:00.000Z');
    expect(itemFor(Month.of(1))?.guid).toBe('https://sezon.example/sezon/yanuari#2026');
  });

  it('AC11: moves the January and December guids across the new year', () => {
    const newYear = monthlyFeedItems(overviews, SITE, new Date('2027-01-05T10:00:00Z'));
    const guidOf = (month: Month) =>
      newYear.find((item) => item.title === ui.monthPage.title(month))?.guid;
    expect(guidOf(Month.of(1))).toBe('https://sezon.example/sezon/yanuari#2027');
    expect(guidOf(Month.of(12))).toBe('https://sezon.example/sezon/dekemvri#2026');
  });
});

describe('monthlyFeedChannel (spec 047)', () => {
  it('AC5: describes the channel with the site link, language bg and the self URL', () => {
    expect(monthlyFeedChannel('https://sezon.example')).toEqual({
      title: 'Сезон – какво е в сезон в България',
      description: 'Всеки месец: кои плодове, зеленчуци и подправки са в сезон в България.',
      link: 'https://sezon.example/',
      language: 'bg',
      selfUrl: 'https://sezon.example/rss.xml',
    });
  });
});
