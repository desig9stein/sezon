import type { ProduceKind } from '@contexts/catalog';
import type { Month, SeasonLevelValue } from '@contexts/seasonality';

/** Name of the website. */
export const SITE_NAME = 'Сезон';

/** Bulgarian month names in calendar order (index 0 = January). */
const MONTH_NAMES = [
  'Януари',
  'Февруари',
  'Март',
  'Април',
  'Май',
  'Юни',
  'Юли',
  'Август',
  'Септември',
  'Октомври',
  'Ноември',
  'Декември',
] as const;

const DESCRIPTION_MAX_LENGTH = 160;

/** Returns the Bulgarian name of `month` in lowercase (e.g. „ноември“), as used inside sentences. */
export function monthNameLower(month: Month): string {
  return monthName(month).toLocaleLowerCase('bg');
}

function monthPageDescription(month: Month, produceNames: ReadonlyArray<string>): string {
  const intro = `Какво е в сезон в България през ${monthNameLower(month)}`;
  const closing = 'Вижте кое е в разгара си и откъде да купите от местни ферми.';
  const fits = (names: ReadonlyArray<string>) =>
    `${intro}: ${names.join(', ')}. ${closing}`.length <= DESCRIPTION_MAX_LENGTH;
  const listed: string[] = [];
  for (const name of produceNames) {
    if (!fits([...listed, name])) {
      break;
    }
    listed.push(name);
  }
  return listed.length === 0
    ? `${intro}? ${closing}`
    : `${intro}: ${listed.join(', ')}. ${closing}`;
}

/** All user-facing UI strings. */
export const ui = {
  siteName: SITE_NAME,
  siteDescription:
    'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купите и как да ги приготвите.',
  skipLink: 'Към основното съдържание',
  homeLinkLabel: `${SITE_NAME} – начална страница`,
  logoGlyph: '🌱',
  nav: {
    label: 'Основна навигация',
    now: 'Сезонът сега',
    next: (monthName: string) => `Какво идва: ${monthName}`,
  },
  breadcrumbs: {
    label: 'Път до страницата',
    home: 'Начало',
  },
  footer: {
    monthsHeading: 'Какво е в сезон през',
    disclaimer:
      'Информацията на сайта е с образователна цел и не е медицински съвет. Хранителните стойности са ориентировъчни и са посочени с източник.',
    copyright: (year: number) => `© ${year} ${SITE_NAME}`,
  },
  home: {
    title: 'Какво е в сезон сега',
    heading: (month: Month) => `В сезон през ${monthNameLower(month)}`,
    intro:
      'Сезонните плодове и зеленчуци са най-вкусни, най-евтини и идват от по-близо. Ето какво се бере в България този месец.',
    description: (month: Month) =>
      `Какво е в сезон в България сега – ${monthNameLower(month)}. Вижте кои плодове и зеленчуци са в разгара си и откъде да ги купите.`,
    nextMonthLink: (month: Month) => `Вижте какво идва през ${monthNameLower(month)}`,
  },
  monthPage: {
    title: (month: Month) => `Какво е в сезон през ${monthNameLower(month)}`,
    heading: (month: Month) => `Какво е в сезон през ${monthNameLower(month)}`,
    description: monthPageDescription,
  },
  overview: {
    peak: 'В разгара на сезона',
    available: 'Все още в сезон',
    comingSoon: 'Идват скоро',
    storage: 'От хранилище',
    empty: 'Няма данни за този месец.',
    listName: (month: Month) => `В сезон през ${monthNameLower(month)}`,
  },
  monthPager: {
    label: 'Други месеци',
    previous: 'Предишен месец',
    next: 'Следващ месец',
  },
  seasonLevels: {
    peak: 'Разгар на сезона',
    available: 'В сезон',
    storage: 'От хранилище',
  } satisfies Record<SeasonLevelValue, string>,
  seasonLevelIcons: {
    peak: '★',
    available: '●',
    storage: '◐',
  } satisfies Record<SeasonLevelValue, string>,
  produceKinds: {
    fruit: 'Плод',
    vegetable: 'Зеленчук',
    herb: 'Подправка',
    nut: 'Ядка',
  } satisfies Record<ProduceKind, string>,
} as const;

/** Returns the Bulgarian name of `month`, capitalised (e.g. „Ноември“). */
export function monthName(month: Month): string {
  const name = MONTH_NAMES[month.number - 1];
  if (name === undefined) {
    throw new RangeError(`No name for month ${month.number}.`);
  }
  return name;
}
