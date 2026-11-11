import type { ProduceKind } from '@contexts/catalog';
import { LAST_MONTH_NUMBER, type Month, type SeasonLevelValue } from '@contexts/seasonality';
import { InvalidMonthError } from '@shared/domain/errors';
import { characterCount, DESCRIPTION_MAX_LENGTH, TITLE_MAX_LENGTH } from '@shared/seo';

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

/** Returns the Bulgarian name of `month` in lowercase (e.g. „ноември“), as used inside sentences. */
export function monthNameLower(month: Month): string {
  return monthName(month).toLocaleLowerCase('bg');
}

const TITLE_SUFFIX_LENGTH = characterCount(` | ${SITE_NAME}`);
const MAX_FRACTION_DIGITS = 2;

const numberFormat = new Intl.NumberFormat('bg', {
  maximumFractionDigits: MAX_FRACTION_DIGITS,
  useGrouping: 'min2',
});
const dateFormat = new Intl.DateTimeFormat('bg', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  timeZone: 'UTC',
});

/** Formats a number the Bulgarian way: decimal comma, at most two decimals. */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}

/** Formats a calendar date in Bulgarian, e.g. „10 ноември 2026 г.“. */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/** Returns the first title that fits 60 characters with the site-name suffix, else the last. */
function fittingTitle(variants: ReadonlyArray<string>): string {
  const fallback = variants[variants.length - 1] ?? '';
  return (
    variants.find((title) => characterCount(title) + TITLE_SUFFIX_LENGTH <= TITLE_MAX_LENGTH) ??
    fallback
  );
}

/**
 * Returns the page title of a produce: the longest variant that fits 60 characters together
 * with the site-name suffix.
 */
export function produceTitle(name: string): string {
  return fittingTitle([
    `${name} – сезон, хранителни стойности и ферми`,
    `${name} – сезон и хранителни стойности`,
    name,
  ]);
}

/** Returns a nutrient name for use inside a sentence (first letter in lower case). */
const inSentence = (name: string): string => name.charAt(0).toLowerCase() + name.slice(1);

function monthPageDescription(month: Month, produceNames: ReadonlyArray<string>): string {
  const intro = `Какво е в сезон в България през ${monthNameLower(month)}`;
  const closing = 'Вижте кое е в разгара си и кое идва скоро.';
  const withNames = (names: ReadonlyArray<string>) => `${intro}: ${names.join(', ')}. ${closing}`;
  const listed: string[] = [];
  for (const name of produceNames) {
    if (characterCount(withNames([...listed, name])) <= DESCRIPTION_MAX_LENGTH) {
      listed.push(name);
    }
  }
  return listed.length === 0 ? `${intro}? ${closing}` : withNames(listed);
}

const SECTION_NAMES: Readonly<Record<ProduceKind, string>> = {
  fruit: 'Плодове',
  vegetable: 'Зеленчуци',
  herb: 'Подправки',
  nut: 'Ядки',
};

const HOME_HEADING_LEAD = 'В сезон през';

/** All user-facing UI strings. */
export const ui = {
  siteName: SITE_NAME,
  siteDescription:
    'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купите и как да ги приготвите.',
  skipLink: 'Към основното съдържание',
  homeLinkLabel: `${SITE_NAME} – начална страница`,
  ribbon: {
    label: 'Месеци',
  },
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
    plate: (month: Month) =>
      `Табло ${romanNumeral(month.number)} от ${romanNumeral(LAST_MONTH_NUMBER)}`,
    title: 'Какво е в сезон сега',
    heading: (month: Month) => `${HOME_HEADING_LEAD} ${monthNameLower(month)}`,
    headingLead: HOME_HEADING_LEAD,
    intro:
      'Сезонните плодове и зеленчуци са най-вкусни, най-евтини и идват от по-близо. Ето какво се бере в България този месец.',
    description: (month: Month) =>
      `Какво е в сезон в България сега – ${monthNameLower(month)}. Вижте кои плодове и зеленчуци са в разгара си и кои идват скоро.`,
    fullMonthLink: (month: Month) => `Вижте всичко в сезон през ${monthNameLower(month)}`,
    nextMonthLink: (month: Month) => `Вижте какво идва през ${monthNameLower(month)}`,
  },
  monthPage: {
    title: (month: Month) => `Какво е в сезон през ${monthNameLower(month)}`,
    heading: (month: Month) => `Какво е в сезон през ${monthNameLower(month)}`,
    description: monthPageDescription,
  },
  overview: {
    peak: 'В разгара на сезона',
    available: 'Също в сезон',
    comingSoon: 'Идват скоро',
    storage: 'От хранилище',
    empty: 'Няма данни за този месец.',
    listName: (month: Month) => `В сезон през ${monthNameLower(month)}`,
    fromMonth: (month: Month, level: string) => `От ${monthNameLower(month)}: ${level}`,
  },
  produce: {
    family: (name: string, latinName: string) => `Семейство: ${name} (${latinName})`,
    now: (month: string, level: string) => `През ${month}: ${level}`,
    outOfSeason: 'Извън сезона',
    outOfSeasonLower: 'извън сезона',
    photoCredit: 'Снимка:',
    headings: {
      season: 'Сезон по месеци',
      varieties: 'Сортове',
      nutrition: 'Хранителни стойности',
      preparation: 'Как да го приготвим, за да запази хранителните си вещества',
      traditional: 'Традиционна употреба',
      regions: 'Откъде е най-добре да се купува',
      farms: 'Местни ферми',
      choose: 'Как да изберем',
      storage: 'Как да съхраняваме',
      faq: 'Често задавани въпроси',
      sources: 'Източници',
    },
    nutrition: {
      caption: 'Хранителни стойности на 100 г',
      nutrient: 'Хранително вещество',
      amount: 'Количество',
      percent: '%',
      percentAbbreviation: 'РСП',
      percentTitle: 'референтен прием',
      noReferenceIntake: 'няма референтен прием',
      units: { g: 'г', kcal: 'ккал', mg: 'мг', µg: 'мкг' },
      energy: 'Енергия',
      protein: 'Белтъчини',
      fat: 'Мазнини',
      carbohydrate: 'Въглехидрати',
      sugars: 'от които захари',
      fiber: 'Фибри',
      sourcePrefix: 'Източник:',
      referenceNote:
        'РСП е референтният прием за възрастен човек (8400 kJ/2000 ккал) според Регламент (ЕС) № 1169/2011.',
    },
    traditional: {
      disclaimer:
        'Тук описваме традиции, а не доказани ефекти. Информацията не е медицински съвет – при здравословни проблеми се консултирайте с лекар.',
      sourcePrefix: 'източник:',
      systems: { ayurveda: 'Аюрведа', folk: 'Народна медицина' },
    },
    farms: {
      empty: 'Все още няма добавени ферми за този продукт.',
      placeholder: 'Примерни данни',
      sponsored: 'Спонсорирано',
      website: (farm: string) => `Уебсайт на ${farm}`,
      email: (farm: string) => `Имейл до ${farm}`,
      phoneLabel: 'Телефон:',
      phone: (farm: string, phone: string) => `Телефон на ${farm}: ${phone}`,
    },
    sources: {
      updated: 'Обновено на',
      draft: 'Данните очакват редакторска проверка.',
    },
  },
  notFound: {
    title: 'Страницата не е намерена',
    heading: 'Страницата не е намерена',
    description:
      'Страницата, която търсите, не съществува. Вижте какво е в сезон сега или изберете месец.',
    intro:
      'Възможно е адресът да е грешен или страницата да е преместена. Ето откъде да продължите:',
    homeLink: 'Какво е в сезон сега',
    monthLink: (month: Month) => `Всичко в сезон през ${monthNameLower(month)}`,
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
  nutrients: {
    title: (name: string) =>
      fittingTitle([`${name} в сезонните храни от България`, `${name} в сезонните храни`, name]),
    description: (name: string) =>
      `Кои сезонни храни от България съдържат най-много ${inSentence(name)} на 100 г, колко от референтния прием покриват и кои са в сезон сега.`,
    heading: (name: string) => `${name} в сезонните храни`,
    claimsHeading: (name: string) => `Какво прави ${inSentence(name)}`,
    claimsNote: (name: string) =>
      `Формулировките са разрешени здравни претенции по Регламент (ЕС) № 432/2012 и се отнасят за храни, които са поне източник на ${inSentence(name)}.`,
    inSeasonHeading: 'В сезон сега',
    rankingHeading: 'Съдържание на 100 г',
    caption: (name: string) => `${name} на 100 г`,
    produceColumn: 'Продукт',
    claimColumn: 'Претенция',
    seasonColumn: (monthName: string) => `През ${monthName}`,
    claimLabels: {
      high: (name: string) => `Високо съдържание на ${inSentence(name)}`,
      source: (name: string) => `Източник на ${inSentence(name)}`,
    },
    noClaim: 'под прага за претенция',
    labelSeparator: ' – ',
    balancedDiet:
      'Важно е храненето да е разнообразно и балансирано, както и да се води здравословен начин на живот.',
    quantityNote:
      'Количествата са на 100 г сурова ядлива част. Претенцията „Източник на“ изисква поне 15 %, а „Високо съдържание на“ – поне 30 % от референтния прием на 100 г.',
    empty: (name: string) => `Все още няма продукти с данни за ${inSentence(name)}.`,
  },
  sections: {
    names: SECTION_NAMES,
    title: (kind: ProduceKind) => `${SECTION_NAMES[kind]} по сезони`,
    description: (kind: ProduceKind, month: Month) =>
      `${SECTION_NAMES[kind]} в България: кои са в разгара на сезона през ${monthNameLower(month)}, кои са в сезон и кои идват от хранилище. Хранителни стойности и местни ферми.`,
    intro: (kind: ProduceKind, month: Month) =>
      `Всички ${SECTION_NAMES[kind].toLowerCase()} в каталога, подредени по сезона през ${monthNameLower(month)}.`,
    outOfSeason: (month: Month) => `Извън сезона през ${monthNameLower(month)}`,
    empty: 'Все още няма добавени продукти в този раздел.',
  },
  calendar: {
    navLabel: 'Календар',
    title: 'Сезонен календар на плодовете и зеленчуците',
    heading: 'Сезонен календар',
    description:
      'Целогодишен календар на сезонните плодове, зеленчуци, подправки и ядки в България: кога са в разгара си, кога в сезон и кога от хранилище.',
    intro:
      'Кога е сезонът на всеки продукт през годината. Календарът е подготвен за разпечатване на A4 в хоризонтален формат.',
    caption: 'Сезон на всеки продукт по месеци',
    produceColumn: 'Продукт',
    legendHeading: 'Легенда',
    empty: 'Няма данни за календара.',
    homeLink: 'Целогодишен сезонен календар',
  },
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

const ABBREVIATION_LENGTH = 3;
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

/** Returns the first three letters of the month name (e.g. „Ное“). */
export function monthAbbreviation(month: Month): string {
  return monthName(month).slice(0, ABBREVIATION_LENGTH);
}

/** Returns the letters of the month name after its abbreviation (e.g. „мври“), or „“. */
export function monthRest(month: Month): string {
  return monthName(month).slice(ABBREVIATION_LENGTH);
}

/**
 * Returns a month number (1–12) as a Roman numeral.
 * @throws InvalidMonthError when `value` is outside 1–12.
 */
export function romanNumeral(value: number): string {
  const numeral = ROMAN_NUMERALS[value - 1];
  if (numeral === undefined) {
    throw new InvalidMonthError(`No Roman numeral for month ${value}.`);
  }
  return numeral;
}
