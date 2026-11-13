import { describe, expect, it } from 'vitest';
import { routes } from '@components/layout/routes';
import {
  headingFontSize,
  monthOgCard,
  OG_IMAGE,
  ogImageMeta,
  ogImageSlug,
  produceOgCard,
  siteOgCard,
} from '@components/seo/ogImage';
import { SeasonOverviewService } from '@contexts/catalog';
import { Month } from '@contexts/seasonality';
import { ui } from '@i18n/bg';
import { aProduce, produceRepositoryOf } from '@tests/fixtures/produce';

const SITE = 'https://sezon.example';
const NOVEMBER = Month.of(11);
const peakIn = (month: number) => [{ month, level: 'peak' as const }];
const availableIn = (month: number) => [{ month, level: 'available' as const }];

const service = new SeasonOverviewService(
  produceRepositoryOf([
    aProduce({ slug: 'zele', name: 'Зеле', season: peakIn(11) }),
    aProduce({ slug: 'yabalki', name: 'Ябълки', kind: 'fruit', season: availableIn(11) }),
    aProduce({ slug: 'praz', name: 'Праз', season: peakIn(11) }),
    aProduce({ slug: 'krushi', name: 'Круши', kind: 'fruit', season: availableIn(11) }),
    aProduce({ slug: 'tikva', name: 'Тиква', season: availableIn(11) }),
    aProduce({ slug: 'morkovi', name: 'Моркови', season: availableIn(11) }),
    aProduce({ slug: 'tsveklo', name: 'Цвекло', season: availableIn(11) }),
    aProduce({ slug: 'chereshi', name: 'Череши', kind: 'fruit', season: peakIn(6) }),
    aProduce({ slug: 'kartofi', name: 'Картофи', season: availableIn(7) }),
    aProduce({ slug: 'yagodi', name: 'Ягоди', kind: 'fruit', season: availableIn(5) }),
  ]),
);

describe('siteOgCard (spec 050)', () => {
  it('AC1: shows the site name and tagline, without stamp, kicker or brand', () => {
    const card = siteOgCard();
    expect(card.path).toBe('/og/site.png');
    expect(card.path).toBe(routes.ogImage.site);
    expect(card.heading).toBe('Сезон');
    expect(card.detail).toBe(ui.siteDescription);
    expect(card.stamp).toBeUndefined();
    expect(card.kicker).toBeUndefined();
    expect(card.brand).toBeUndefined();
    expect(card.alt).toBe(`Сезон: ${ui.siteDescription}`);
    expect(card.headingSize).toBe(headingFontSize('Сезон'));
  });
});

describe('monthOgCard (spec 050)', () => {
  it('AC2: names the first five fresh produce, peak first in repository order, and counts the rest', async () => {
    const card = monthOgCard(await service.overviewFor(NOVEMBER));
    expect(card.path).toBe('/og/sezon/noemvri.png');
    expect(card.path).toBe(routes.ogImage.month(NOVEMBER));
    expect(card.kicker).toBe('Какво е в сезон през');
    expect(card.heading).toBe('Ноември');
    expect(card.detail).toBe('Зеле, праз, круши, моркови, тиква и още 2');
    expect(card.alt).toBe(
      'Какво е в сезон през ноември: зеле, праз, круши, моркови, тиква и още 2. Сезон',
    );
    expect(card.brand).toBe('Сезон');
    expect(card.stamp).toBeUndefined();
  });

  it('AC2: joins the last two names with „и“ when all fit', async () => {
    const card = monthOgCard(await service.overviewFor(Month.of(6)));
    expect(card.detail).toBe('Череши');
    const july = monthOgCard(await service.overviewFor(Month.of(7)));
    expect(july.detail).toBe('Картофи');
    const small = new SeasonOverviewService(
      produceRepositoryOf([
        aProduce({ slug: 'zele', name: 'Зеле', season: peakIn(1) }),
        aProduce({ slug: 'praz', name: 'Праз', season: availableIn(1) }),
        aProduce({ slug: 'luk', name: 'Лук', season: availableIn(1) }),
      ]),
    );
    const january = monthOgCard(await small.overviewFor(Month.of(1)));
    expect(january.detail).toBe('Зеле, лук и праз');
    expect(january.alt).toBe('Какво е в сезон през януари: зеле, лук и праз. Сезон');
  });

  it('AC2: says nothing is fresh in an empty month', async () => {
    const card = monthOgCard(await service.overviewFor(Month.of(2)));
    expect(card.detail).toBe('Нищо прясно този месец – виж какво има от хранилище.');
    expect(card.alt).toBe('Какво е в сезон през февруари: нищо прясно. Сезон');
  });
});

describe('produceOgCard (spec 050)', () => {
  const apples = aProduce({
    slug: 'yabalki',
    name: 'Ябълки',
    kind: 'fruit',
    season: [
      { month: 9, level: 'peak' },
      { month: 11, level: 'available' },
      { month: 1, level: 'storage' },
    ],
  });

  it('AC3: shows the kind, the name and the level in the month with the existing labels', () => {
    const card = produceOgCard(apples, Month.of(9));
    expect(card.path).toBe('/og/plodove/yabalki.png');
    expect(card.path).toBe(routes.ogImage.produce(apples));
    expect(card.kicker).toBe('Плод');
    expect(card.heading).toBe('Ябълки');
    expect(card.stamp).toEqual({ text: ui.overview.peak, tone: 'peak' });
    expect(card.detail).toBe('през септември');
    expect(card.brand).toBe('Сезон');
    expect(card.alt).toBe('Ябълки – в разгара на сезона през септември. Сезон');
    expect(card.headingSize).toBe(headingFontSize('Ябълки'));
  });

  it('AC3: covers available, storage and out of season', () => {
    expect(produceOgCard(apples, NOVEMBER).stamp).toEqual({
      text: ui.stamp.available,
      tone: 'available',
    });
    expect(produceOgCard(apples, NOVEMBER).alt).toBe('Ябълки – в сезон през ноември. Сезон');
    expect(produceOgCard(apples, Month.of(1)).stamp).toEqual({
      text: ui.overview.storage,
      tone: 'storage',
    });
    const june = produceOgCard(apples, Month.of(6));
    expect(june.stamp).toEqual({ text: ui.produce.outOfSeason, tone: 'out' });
    expect(june.alt).toBe('Ябълки – извън сезона през юни. Сезон');
  });

  it('AC3: uses the section of the produce kind in the path', () => {
    const leek = aProduce({ slug: 'praz', name: 'Праз', season: peakIn(11) });
    expect(produceOgCard(leek, NOVEMBER).path).toBe('/og/zelenchutsi/praz.png');
    expect(produceOgCard(leek, NOVEMBER).kicker).toBe('Зеленчук');
  });
});

describe('headingFontSize (spec 050)', () => {
  it('AC4: caps short headings, floors long ones and scales in between', () => {
    expect(headingFontSize('Сезон')).toBe(200);
    expect(headingFontSize('Зелен фасул')).toBe(200);
    expect(headingFontSize('Червени боровинки')).toBe(Math.floor(1056 / (0.42 * 17)));
    expect(headingFontSize('Много дълго име на продукт, което не се побира')).toBe(96);
  });
});

describe('ogImageSlug and ogImageMeta (spec 050)', () => {
  it('AC5: strips the prefix and extension from an image path', () => {
    expect(ogImageSlug('/og/site.png')).toBe('site');
    expect(ogImageSlug('/og/sezon/noemvri.png')).toBe('sezon/noemvri');
    expect(ogImageSlug('/og/plodove/yabalki.png')).toBe('plodove/yabalki');
  });

  it('AC5: builds the absolute URL, alt, size and type', () => {
    expect(ogImageMeta(SITE, { path: '/og/sezon/noemvri.png', alt: 'Алт' })).toEqual({
      url: 'https://sezon.example/og/sezon/noemvri.png',
      alt: 'Алт',
      width: 1200,
      height: 630,
      type: 'image/png',
    });
    expect(OG_IMAGE).toEqual({ width: 1200, height: 630, type: 'image/png' });
  });
});
