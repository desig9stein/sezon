import type { GrowingActivity, OrganicAvailability, ProduceKind } from '@contexts/catalog';
import type { AreaRank, RegionProfile, TopFruit } from '@contexts/geography';
import type { Ingredient, IngredientUnit, RecipeCategory } from '@contexts/recipes';
import { LAST_MONTH_NUMBER, Month, type SeasonLevelValue } from '@contexts/seasonality';
import { hoursAndMinutes } from '@shared/domain/duration';
import { InvalidPageMetaError } from '@shared/domain/errors';
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
const LIST_SEPARATOR = ', ';
const DASH_SEPARATOR = ' – ';
const GARDEN_LABEL = 'В градината';
const LOCAL_FARMS = 'Местни ферми';
const SOURCES = 'Източници';
const RECIPES_HEADING = 'Рецепти за зимнина';
const NO_TIME = '–';
const ADVERTISING = 'Реклама';
const COOKIES = 'Бисквитки';
const PRIVACY_POLICY = 'Политика за поверителност';
const PRIVACY_SETTINGS = 'Настройки за поверителност';
/** Province names that read as adjectives and need „област“ after them in running text. */
const REGION_PLACE_NAMES: Readonly<Record<string, string>> = { Софийска: 'Софийска област' };
/** First letters after which the preposition „в“ becomes „във“. */
const VAV_LETTERS = /^[вфВФ]/u;

/** Returns the province name as it reads in running text („Софийска област“, „Пловдив“). */
function regionPlaceName(name: string): string {
  return REGION_PLACE_NAMES[name] ?? name;
}

/** Returns „в <place>“ or „във <place>“ for a province name, for use inside a sentence. */
function inRegionLower(name: string): string {
  const place = regionPlaceName(name);
  return `${VAV_LETTERS.test(place) ? 'във' : 'в'} ${place}`;
}

/** Returns „В <place>“ or „Във <place>“ for a province name, for the start of a sentence. */
function inRegion(name: string): string {
  const phrase = inRegionLower(name);
  return `${phrase.charAt(0).toUpperCase()}${phrase.slice(1)}`;
}

/**
 * Returns the region page description for the counts the page shows. With no produce and no farm,
 * it describes the province's agricultural profile instead, naming fruit species only when the
 * profile has top fruits.
 * @param profile - Agricultural profile of the province, when it has one.
 * @throws InvalidPageMetaError when there is no produce, no farm and no profile.
 */
function regionPageDescription(
  name: string,
  produceCount: number,
  farmCount: number,
  profile?: RegionProfile,
): string {
  if (produceCount + farmCount === 0) {
    if (profile === undefined) {
      throw new InvalidPageMetaError(`Region "${name}" has no data to describe.`);
    }
    const area = `${inRegion(name)} използваната земеделска площ е ${formatHectares(profile.utilisedAreaHa)} (${profile.areaYear} г.).`;
    return profile.topFruits.length > 0
      ? `${area} Виж колко от нея е обработваема и кои от основните овощни видове заемат най-голяма площ.`
      : `${area} Виж колко от нея е обработваема земя и колко – постоянно затревени площи.`;
  }
  const grows =
    produceCount === 1
      ? `${inRegion(name)} се отглежда 1 продукт от каталога на Сезон.`
      : `${inRegion(name)} се отглеждат ${produceCount} продукта от каталога на Сезон.`;
  const farms =
    farmCount === 1
      ? `${inRegion(name)} има 1 местна ферма, която продава продукти от каталога на Сезон.`
      : `${inRegion(name)} има ${farmCount} местни ферми, които продават продукти от каталога на Сезон.`;
  if (farmCount === 0) return `${grows} Виж кои са и какво пише за тях в областта.`;
  if (produceCount === 0) return `${farms} Виж кои са и как да се свържеш с тях.`;
  return `${grows} Виж кои са и кои местни ферми има в областта.`;
}
const MAP_TITLE = 'Карта на България.';
const REGION_NO_DATA = 'Още няма данни';
const PERCENT = 100;

/** Feminine ordinal words for 1–9 (index 0 = 1). */
const ORDINAL_UNITS = [
  'първа',
  'втора',
  'трета',
  'четвърта',
  'пета',
  'шеста',
  'седма',
  'осма',
  'девета',
] as const;
/** Feminine ordinal words for 10–19 (index 0 = 10). */
const ORDINAL_TEENS = [
  'десета',
  'единадесета',
  'дванадесета',
  'тринадесета',
  'четиринадесета',
  'петнадесета',
  'шестнадесета',
  'седемнадесета',
  'осемнадесета',
  'деветнадесета',
] as const;
/** Cardinal words for the tens 20–90 (index 0 = 20); the ordinal adds „а“. */
const TENS = [
  'двадесет',
  'тридесет',
  'четиридесет',
  'петдесет',
  'шестдесет',
  'седемдесет',
  'осемдесет',
  'деветдесет',
] as const;
const TEN = 10;
const FIRST_TENS = 20;
const LAST_ORDINAL = 99;

/**
 * Returns the feminine Bulgarian ordinal word for `rank` („първа“, „двадесет и осма“), as used
 * with „област“. Ranks outside 1–99 are written in digits („100-а“).
 */
export function feminineOrdinal(rank: number): string {
  if (!Number.isInteger(rank) || rank < 1 || rank > LAST_ORDINAL) return `${rank}-а`;
  if (rank < TEN) return ORDINAL_UNITS[rank - 1] ?? '';
  if (rank < FIRST_TENS) return ORDINAL_TEENS[rank - TEN] ?? '';
  const tens = TENS[Math.floor(rank / TEN) - 2] ?? '';
  const unit = rank % TEN;
  return unit === 0 ? `${tens}а` : `${tens} и ${ORDINAL_UNITS[unit - 1] ?? ''}`;
}

const numberFormat = new Intl.NumberFormat('bg', {
  maximumFractionDigits: MAX_FRACTION_DIGITS,
  useGrouping: 'min2',
});
const areaFormat = new Intl.NumberFormat('bg', { maximumFractionDigits: 0, useGrouping: 'always' });
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

/** Formats an area in hectares with non-breaking thousands separators, e.g. „1 676 ха“. */
function formatHectares(value: number): string {
  return `${areaFormat.format(value)} ха`;
}

/** Formats a share (0–1) as a whole percentage, or „под 1%“ when it rounds to zero. */
function formatShare(share: number): string {
  const percent = Math.round(share * PERCENT);
  return percent === 0 ? 'под 1%' : `${percent}%`;
}

/**
 * Returns the sentences of a province's agricultural profile: its utilised area and rank, the
 * shares of arable land and permanent grassland, and, when the profile has them, the main fruit
 * species with the largest area in the МЗХ orchard survey.
 */
function regionProfileSummary(profile: RegionProfile, areaRank: AreaRank): string {
  const area = `Използваната земеделска площ е ${formatHectares(profile.utilisedAreaHa)} (${profile.areaYear} г.) – ${feminineOrdinal(areaRank.rank)} по големина сред ${areaRank.total}-те области.`;
  const use = `Обработваемата земя е ${formatShare(profile.arableShare)} от нея, а постоянно затревените площи – ${formatShare(profile.grasslandShare)}.`;
  const [first, second] = profile.topFruits;
  if (first === undefined) return `${area} ${use}`;
  const fruitArea = (fruit: TopFruit) => `${fruit.name} (${formatHectares(fruit.areaHa)})`;
  const fruits =
    second === undefined
      ? fruitArea(first)
      : `${fruitArea(first)}, следвани от ${fruitArea(second)}`;
  return `${area} ${use} От основните овощни видове, изследвани от МЗХ, най-голяма площ заемат ${fruits} – ${profile.orchardYear} г., предварителни данни.`;
}

/** Counts and profile of a region in the overview list. */
interface RegionOverviewFacts {
  readonly produceCount: number;
  readonly farmCount: number;
  readonly profile: RegionProfile | undefined;
}

/** Returns the produce and farm counts of a region, e.g. „3 продукта · 1 ферма“. */
function regionCounts(produce: number, farms: number): string {
  return [
    produce === 0 ? undefined : produce === 1 ? '1 продукт' : `${produce} продукта`,
    farms === 0 ? undefined : farms === 1 ? '1 ферма' : `${farms} ферми`,
  ]
    .filter((part) => part !== undefined)
    .join(' · ');
}

/**
 * Returns the text after a region in the overview list: its counts, else its utilised area, else
 * „Още няма данни“.
 */
function regionOverviewLabel({ produceCount, farmCount, profile }: RegionOverviewFacts): string {
  if (produceCount + farmCount > 0) return regionCounts(produceCount, farmCount);
  if (profile === undefined) return REGION_NO_DATA;
  return `${formatHectares(profile.utilisedAreaHa)} земеделска площ`;
}

/** Returns the region page intro: what grows and which farms, or the МЗХ data alone. */
function regionPageIntro(produceCount: number, farmCount: number): string {
  return produceCount + farmCount === 0
    ? 'Земеделието в областта според статистиката на МЗХ.'
    : 'Какво расте тук и кои местни ферми има в областта.';
}

/** Formats a calendar date in Bulgarian, e.g. „10 ноември 2026 г.“. */
export function formatDate(date: Date): string {
  return dateFormat.format(date);
}

/**
 * Groups months into ranges of consecutive months, wrapping December to January: each range is
 * `[month]` or `[first, last]`, ordered by their first month (e.g. 11, 12, 1 → `[[11, 1]]`).
 * @param months - Distinct months, in any order.
 */
export function monthRanges(months: ReadonlyArray<Month>): ReadonlyArray<ReadonlyArray<Month>> {
  const numbers = new Set(months.map((month) => month.number));
  if (numbers.size === LAST_MONTH_NUMBER) return [[Month.of(1), Month.of(LAST_MONTH_NUMBER)]];
  const next = (number: number) => (number % LAST_MONTH_NUMBER) + 1;
  const previous = (number: number) => ((number + LAST_MONTH_NUMBER - 2) % LAST_MONTH_NUMBER) + 1;
  return [...numbers]
    .filter((number) => !numbers.has(previous(number)))
    .sort((a, b) => a - b)
    .map((first) => {
      let last = first;
      while (numbers.has(next(last))) last = next(last);
      return last === first ? [Month.of(first)] : [Month.of(first), Month.of(last)];
    });
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

/**
 * Formats a number of minutes as „25 мин“, „1 ч“ or „1 ч 5 мин“; zero is „–“.
 * @param minutes - Whole minutes, zero or more.
 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return NO_TIME;
  const { hours, minutes: rest } = hoursAndMinutes(minutes);
  return [hours > 0 ? `${hours} ч` : undefined, rest > 0 ? `${rest} мин` : undefined]
    .filter((part) => part !== undefined)
    .join(' ');
}

const RECIPE_UNITS: Readonly<Record<IngredientUnit, string>> = {
  g: 'г',
  kg: 'кг',
  ml: 'мл',
  l: 'л',
  piece: 'бр.',
  tsp: 'ч.л.',
  tbsp: 'с.л.',
  cup: 'ч.ч.',
};

/** Returns an ingredient line such as „2,3 кг бяло зеле“. */
function recipeIngredient(ingredient: Ingredient): string {
  return `${formatNumber(ingredient.quantity)} ${RECIPE_UNITS[ingredient.unit]} ${inSentence(ingredient.name)}`;
}

/** Returns a nutrient name for use inside a sentence (first letter in lower case). */
const inSentence = (name: string): string => name.charAt(0).toLowerCase() + name.slice(1);

/**
 * Returns as many of `names`, in order, as fit into `render` within the description length limit.
 * @param render - Builds the description from a list of names.
 */
function namesThatFit(
  names: ReadonlyArray<string>,
  render: (names: ReadonlyArray<string>) => string,
): ReadonlyArray<string> {
  const listed: string[] = [];
  for (const name of names) {
    if (characterCount(render([...listed, name])) <= DESCRIPTION_MAX_LENGTH) listed.push(name);
  }
  return listed;
}

function monthPageDescription(month: Month, produceNames: ReadonlyArray<string>): string {
  const intro = `Какво е в сезон в България през ${monthNameLower(month)}`;
  const closing = 'Виж кое е в разгара си и кое идва скоро.';
  const withNames = (names: ReadonlyArray<string>) =>
    `${intro}: ${names.join(LIST_SEPARATOR)}. ${closing}`;
  const listed = namesThatFit(produceNames, withNames);
  return listed.length === 0 ? `${intro}? ${closing}` : withNames(listed);
}

/**
 * Returns the farm page description: the farm, its province and as many of its produce names (in
 * lower case) as fit within the description length limit.
 */
function farmPageDescription(
  name: string,
  regionName: string,
  produceNames: ReadonlyArray<string>,
): string {
  const lead = `${name} е местна ферма ${inRegionLower(regionName)}`;
  const closing = 'Виж контактите и какво е в сезон сега.';
  const withNames = (names: ReadonlyArray<string>) =>
    `${lead}, която предлага ${names.join(LIST_SEPARATOR)}. ${closing}`;
  const listed = namesThatFit(produceNames.map(inSentence), withNames);
  return listed.length === 0 ? `${lead}. ${closing}` : withNames(listed);
}

/** Returns `items` joined with commas, the last two with „и“ (e.g. „зеле, праз и спанак“). */
function listWithAnd(items: ReadonlyArray<string>): string {
  const last = items[items.length - 1] ?? '';
  return items.length < 2 ? last : `${items.slice(0, -1).join(LIST_SEPARATOR)} и ${last}`;
}

/**
 * Returns the plain-text RSS item description of a month: its peak produce names in lower case,
 * or a note that nothing is at its peak.
 */
function monthFeedDescription(month: Month, peakNames: ReadonlyArray<string>): string {
  const name = monthNameLower(month);
  if (peakNames.length === 0) {
    return `През ${name} нищо не е в разгара на сезона. Виж какво е в сезон в България през ${name}.`;
  }
  return `През ${name} в разгара на сезона: ${listWithAnd(peakNames.map(inSentence))}. Виж всичко, което е в сезон в България през ${name}.`;
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
    'Кои плодове и зеленчуци са в сезон в България сега, откъде да ги купиш и как да ги приготвиш.',
  skipLink: 'Към основното съдържание',
  homeLinkLabel: `${SITE_NAME} – начална страница`,
  nav: {
    label: 'Основна навигация',
    now: 'Сега',
    catalog: 'Каталог',
  },
  breadcrumbs: {
    label: 'Път до страницата',
    home: 'Начало',
  },
  footer: {
    monthsLabel: 'Месеците на годината',
    disclaimer:
      'Информацията на сайта е с образователна цел и не е медицински съвет. Хранителните стойности са ориентировъчни и са посочени с източник.',
    copyright: (year: number) => `© ${year} ${SITE_NAME}`,
    linksLabel: 'За сайта',
    about: 'За нас',
    methodology: 'Методология',
    report: 'Съобщи за грешка на тази страница в GitHub (нужен е профил)',
    addFarm: 'Добави своята ферма',
    reportEmail: 'Съобщи за грешка по имейл',
    advertising: ADVERTISING,
    privacy: 'Поверителност',
    cookies: COOKIES,
    feed: 'RSS абонамент',
  },
  feed: {
    title: `${SITE_NAME} – какво е в сезон в България`,
    description: 'Всеки месец: кои плодове, зеленчуци и подправки са в сезон в България.',
    itemDescription: monthFeedDescription,
  },
  corrections: {
    mailSubject: (page: string) => `Грешка в Сезон: ${page}`,
    mailBody: (page: string) =>
      `Страница: ${page}\n\nКакво е грешно:\n\nКое е вярното:\n\nДоказателство (връзка или приложен документ):\n`,
  },
  farmSubmission: {
    mailSubject: 'Добавяне на ферма в Сезон',
    mailBody:
      'Име на фермата:\nОбласт и населено място:\nПродукти:\nВръзка (уебсайт, имейл или телефон):\nИзточник (страница, която потвърждава данните):\nБиосертификат (номер и орган, ако има):\n',
  },
  about: {
    title: 'За нас: кой стои зад сайта и как работи',
    heading: 'За Сезон',
    description:
      'Кой прави Сезон, как се използва изкуствен интелект, откъде идват данните, как да съобщиш за грешка и как да добавиш своята ферма.',
    whatHeading: 'Какво е Сезон',
    what: 'Сезон показва кои плодове, зеленчуци, подправки и ядки са в сезон в България, откъде идват, какви хранителни вещества съдържат и кои местни ферми ги предлагат. Целта е да имаш надеждна и проверима информация, когато избираш храна.',
    whoHeading: 'Кой стои зад сайта',
    who: (name: string) =>
      `Сезон се прави и поддържа от ${name} – един разработчик, с помощта на агенти с изкуствен интелект.`,
    sourcesUnderData:
      'Източниците са посочени на страниците на продуктите и фермите – под данните или в раздел „Източници“ в края на страницата.',
    ownerGithub: (handle: string) => `${handle} в GitHub`,
    ownerLinkedin: (name: string) => `${name} в LinkedIn`,
    aiHeading: 'Как използваме изкуствен интелект',
    ai: [
      'Агенти с изкуствен интелект пишат код, тестове и чернови на текстове. Всяка промяна минава през автоматични проверки и остава публична в историята на хранилището.',
      'Автоматичните проверки не допускат хранителни стойности, традиционни употреби, съвети за отглеждане или ферми без източник. Сезоните, практическите съвети и повечето бележки за областите са редакторски.',
    ],
    sourcesHeading: 'Източници и прозрачност',
    sources:
      'Хранителните стойности водят към USDA FoodData Central или EFSA, традиционните употреби – към публикацията, от която идват, съветите за отглеждане – към своите източници, а данните за фермите – към собствените им страници. Областите на ябълките, крушите, орехите, черешите, кайсиите, прасковите, сливите, гроздето, зелето, ягодите, пъпешите, доматите, пипера, патладжана, краставиците, картофите и лука следват статистиката на МЗХ. Сезоните по месеци, останалите бележки за областите и съветите как да избереш, съхраниш и приготвиш са редакторски.',
    methodologyLink: 'Как работим с данните – методология',
    openHeading: 'Отворен код',
    open: 'Кодът и съдържанието на Сезон са публични. Кодът е под лиценз MIT, а текстовете и данните – под CC BY 4.0: можеш да ги използваш свободно, като посочиш Сезон като източник. Снимките, шрифтовете и картата на областите са от други автори и запазват своите лицензи, посочени при тях.',
    repositoryLink: 'Хранилището на Сезон в GitHub',
    errorsHeading: 'Видя грешка?',
    errorsIntro:
      'Ако нещо на сайта е неточно или остаряло, кажи ни. Най-долу на всяка страница има връзка „Съобщи за грешка“. Посочи:',
    errorsItems: [
      'на коя страница е грешката (адресът ѝ);',
      'какво е написано и кое е вярното;',
      'доказателство – връзка към надежден източник или приложен документ.',
    ],
    errorsEvidence: 'Без доказателство не можем да променим данните.',
    community:
      'Всеки читател, който съобщи за неточна или остаряла информация, помага да проверяваме данните и Сезон да остава точен.',
    errorsGithub: 'Съобщи за грешка в GitHub (нужен е профил)',
    errorsEmail: 'Съобщи за грешка по имейл',
    errorsProcess:
      'Проверяваме всеки сигнал спрямо източниците. Ако е верен, поправяме данните с новия източник, а промяната се вижда публично в историята на хранилището.',
    farmHeading: 'Добави своята ферма',
    farmIntro:
      'Ако продаваш сезонни продукти директно, можеш да добавиш фермата си безплатно. Изпрати ни:',
    farmItems: [
      'име на фермата;',
      'област и населено място;',
      'кои продукти предлагаш;',
      'поне един начин за връзка – уебсайт, имейл или телефон;',
      'страница, която потвърждава тези данни – уебсайт или профил на фермата;',
      'номер на биосертификата и сертифициращия орган, ако имаш.',
    ],
    farmProcess:
      'Добавяме само реални ферми, след като проверим данните. Онова, което фермата казва за себе си, се показва с бележка „По данни на фермата“.',
    farmEmail: 'Изпрати данните на фермата по имейл',
    farmGithub: 'Изпрати данните на фермата в GitHub (нужен е профил)',
    adsHeading: 'Реклама',
    adsOff:
      'В момента в сайта няма реклами. Ако се появят реклами или спонсорирани ферми, те ще бъдат ясно отбелязани и няма да влияят на данните.',
    adsOn:
      'На рекламните места без спонсор може да се показват реклами от Google AdSense. Рекламите и спонсорираните ферми са ясно отбелязани и не влияят на данните.',
    adsLink: 'Реклама в Сезон',
    privacyHeading: 'Поверителност',
    privacyOff:
      'Сайтът не използва бисквитки и не следи посещенията ти. Ако ни пишеш по имейл, използваме адреса ти само за да ти отговорим. Сигналите и заявките в GitHub са публични, заедно с името на профила ти.',
    privacyOn:
      'Сайтът не следи посещенията ти. Рекламите от Google използват бисквитки според избора ти в съобщението на Google за поверителност. Ако ни пишеш по имейл, използваме адреса ти само за да ти отговорим. Сигналите и заявките в GitHub са публични, заедно с името на профила ти.',
    privacyLink: PRIVACY_POLICY,
    cookiesLink: COOKIES,
    healthHeading: 'Здраве',
  },
  methodology: {
    title: 'Методология: откъде идват данните',
    heading: 'Методология',
    description:
      'Откъде идват данните в Сезон: хранителни стойности от USDA и EFSA, сезони, райони, традиционна употреба, ферми и поправки.',
    intro: 'Тук описваме откъде идват данните в Сезон и кои от тях са редакторски.',
    nutritionHeading: 'Хранителни стойности',
    nutrition:
      'Стойностите са за 100 г сурова ядлива част. Вземаме ги от USDA FoodData Central (SR Legacy) или от EFSA и посочваме конкретния запис като източник.',
    usdaLink: 'USDA FoodData Central',
    efsaLink: 'EFSA',
    referenceIntake:
      'Процентът от референтния прием (РСП) е спрямо Регламент (ЕС) № 1169/2011 за възрастен човек (8400 kJ/2000 ккал).',
    vitaminA:
      'Витамин A е в микрограми ретинолов активен еквивалент (RAE) по USDA, а референтният прием в ЕС е в ретинолов еквивалент (RE). За растителни храни RAE е около половината от RE, затова показаният процент е около половината от този, който би се получил по правилата на ЕС.',
    seasonHeading: 'Сезон',
    season:
      'Всеки продукт има ниво за всеки месец, за условията в България. Официален календар по месеци за продуктите в България няма, затова нивата са редакторска оценка:',
    outOfSeasonText: 'в България не се бере и не е от хранилище; ако го има, вероятно е внос',
    regionsHeading: 'Области',
    regions:
      'Където е известно, посочваме областите, в които продуктът се отглежда, с кратка бележка. За ябълки, круши, орехи, череши, кайсии, праскови, сливи и десертно грозде областите следват статистиката на МЗХ (отдел „Агростатистика“) по области, а за зеле, ягоди, пъпеши, домати, пипер, патладжан, краставици, картофи и лук – по статистически райони, към които принадлежат областите; тези бележки имат източник. При останалите бележките са редакторски или посочват друг източник. Когато за продукт няма официални данни по области и никой източник не посочва област, страницата казва това вместо да назовава области. Земеделските данни на всяка област – използваната земеделска площ, обработваемата земя, постоянно затревените площи и основните овощни видове с най-голяма площ – са от бюлетините на МЗХ „БАНСИК 2025“ и „Структура на основни овощни видове в България през 2023 година“ (предварителни резултати). Овощни видове не посочваме, когато поверителни данни в бюлетина биха могли да променят класирането.',
    traditionalHeading: 'Традиционна употреба',
    traditional:
      'Традиционната употреба описва традиции, а не доказани ефекти, и винаги започва с „Традиционно се използва“. Не твърдим, че храна лекува или предпазва от болест (Регламент (ЕО) № 1924/2006). Всяка употреба има първичен източник – фармакопея, официална монография или етноботаническо изследване; Уикипедия не се приема.',
    growingHeading: 'Отглеждане',
    growing:
      'Месеците за сеитба, разсаждане и засаждане и съветите за отглеждане имат собствени източници, посочени в раздел „Източници“ на страницата на продукта.',
    farmsHeading: 'Ферми',
    farms:
      'Показваме само реални ферми и посочваме страниците, от които са данните за тях. Онова, което фермата казва за себе си, е отбелязано „По данни на фермата“. Биосертификатът се показва само докато е валиден.',
    correctionsHeading: 'Поправки',
    corrections: 'Ако откриеш грешка, кажи ни – с доказателство ще я поправим.',
    correctionsLink: 'Как да съобщиш за грешка',
  },
  home: {
    title: 'Какво е в сезон сега',
    heading: (month: Month) => `${HOME_HEADING_LEAD} ${monthNameLower(month)}`,
    headingLead: HOME_HEADING_LEAD,
    intro:
      'Сезонните плодове и зеленчуци са най-вкусни, най-евтини и идват от по-близо. Ето какво се бере в България този месец.',
    description: (month: Month) =>
      `Какво е в сезон в България сега – ${monthNameLower(month)}. Виж кои плодове и зеленчуци са в разгара си и кои идват скоро.`,
    fullMonthLink: (month: Month) => `Виж всичко в сезон през ${monthNameLower(month)}`,
    nextMonthLink: (month: Month) => `Виж какво идва през ${monthNameLower(month)}`,
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
    familyLabel: 'Семейство:',
    outOfSeason: 'Извън сезона',
    photoCredit: 'Снимка:',
    monthListSeparator: LIST_SEPARATOR,
    monthRangeDash: DASH_SEPARATOR,
    growingActivities: {
      sow: 'Сеитба',
      transplant: 'Разсаждане',
      plant: 'Засаждане',
    } satisfies Record<GrowingActivity, string>,
    toc: 'На тази страница',
    garden: { label: GARDEN_LABEL, none: 'нищо', separator: LIST_SEPARATOR },
    map: {
      label: (regions: ReadonlyArray<string>, provinceCount: number) => {
        if (regions.length === 0) return `${MAP_TITLE} Няма отбелязани области`;
        if (regions.length === provinceCount) {
          return `${MAP_TITLE} Отбелязани са всички ${provinceCount} области.`;
        }
        return `${MAP_TITLE} Отбелязани области: ${regions.join(LIST_SEPARATOR)}`;
      },
      caption: 'Оцветени са областите, изброени по-горе.',
      creditPrefix: 'Граници на областите:',
      creditName: 'Natural Earth',
      creditUrl: 'https://www.naturalearthdata.com/',
      creditSuffix: '(обществено достояние).',
    },
    farmsLink: 'Местни ферми, които го продават',
    regionsEmpty: 'Няма официални данни по области за този продукт.',
    nowIn: (month: string) => `през ${month}`,
    outOfSeasonIn: (month: string) => `Извън сезона през ${month}`,
    headings: {
      stall: 'На сергията',
      eat: 'Яж',
      grow: 'Отгледай',
      season: 'Сезон по месеци',
      varieties: 'Сортове',
      nutrition: 'Хранителни стойности',
      preparation: 'Как да го приготвиш, за да запази хранителните си вещества',
      traditional: 'Традиционна употреба',
      regions: 'Откъде',
      farms: LOCAL_FARMS,
      choose: 'Как да избереш',
      storage: 'Как да съхраниш',
      growing: 'Отглеждане в градината',
      recipes: RECIPES_HEADING,
      faq: 'Често задавани въпроси',
      sources: SOURCES,
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
        'Тук описваме традиции, а не доказани ефекти. Информацията не е медицински съвет – при здравословни проблеми се консултирай с лекар.',
      sourcePrefix: 'източник:',
      systems: { ayurveda: 'Аюрведа', folk: 'Народна медицина' },
    },
    farms: {
      empty: 'Все още няма добавени ферми за този продукт.',
      addFarmLink: 'Твоята ферма липсва? Виж как да я добавиш',
      sponsored: 'Спонсорирано',
      organic: (certifier: string) => `Био · ${certifier}`,
      organicGroup: 'Сертифицирани био ферми',
      otherGroup: 'Други ферми',
      organicStatusLabel: 'Био в България:',
      organicStatus: {
        available: 'има сертифицирано производство.',
        limited: 'има ограничено сертифицирано производство.',
      } satisfies Record<OrganicAvailability, string>,
      website: (farm: string) => `Уебсайт на ${farm}`,
      directoryProfile: (farm: string, directory: string) => `Профил на ${farm} в ${directory}`,
      email: (farm: string) => `Имейл до ${farm}`,
      phoneLabel: 'Телефон:',
      phone: (farm: string, phone: string) => `Телефон на ${farm}: ${phone}`,
    },
    sources: {
      methodologyLink: 'Как работим с източниците – методология',
      updated: 'Обновено на',
    },
  },
  notFound: {
    title: 'Страницата не е намерена',
    heading: 'Страницата не е намерена',
    description:
      'Страницата, която търсиш, не съществува. Виж какво е в сезон сега или избери месец.',
    intro:
      'Възможно е адресът да е грешен или страницата да е преместена. Ето откъде да продължиш:',
    homeLink: 'Какво е в сезон сега',
    monthLink: (month: Month) => `Всичко в сезон през ${monthNameLower(month)}`,
  },
  monthPager: {
    label: 'Други месеци',
    previous: 'Предишен месец',
    next: 'Следващ месец',
  },
  stamp: {
    peak: 'Разгар',
    available: 'В сезон',
    storage: 'От хранилище',
  } satisfies Record<SeasonLevelValue, string>,
  monthChanges: {
    heading: (month: Month) => `Какво се променя през ${monthNameLower(month)}`,
    groups: {
      enteringPeak: 'Навлизат в разгара си',
      stayingPeak: 'Още са в разгара си',
      leavingPeak: {
        available: 'Отминава им разгарът, още са в сезон',
        storage: 'Отминава им разгарът, вече от хранилище',
        outOfSeason: 'Отминава им разгарът, вече извън сезона',
      },
      toStorage: 'Вече от хранилище',
      garden: GARDEN_LABEL,
    },
    detailSeparator: DASH_SEPARATOR,
  },
  legend: {
    label: 'Какво значат печатите',
    peak: 'прясно от полето, в пика на сезона',
    available: 'бере се в България сега',
    storage: 'от последната бера, съхранявано',
    outOfSeason: 'Извън сезона: вероятно е внос',
    strip: 'Лентата е годината от януари до декември; текущият месец е в рамка.',
  },
  yearStrip: {
    part: (level: string, ranges: string) => `${level}: ${ranges}`,
    separator: '; ',
    outOfSeason: 'Извън сезона през цялата година',
  },
  seasonList: {
    heading: (month: Month, count: number) => `В сезон през ${monthNameLower(month)} (${count})`,
    countHeading: (count: number) => `Всичко в сезон (${count})`,
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
    labelSeparator: DASH_SEPARATOR,
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
  groups: {
    title: (name: string, latinName: string) =>
      fittingTitle([`${name} (${latinName}) – сезонни продукти`, `${name} (${latinName})`, name]),
    description: (description: string, month: Month) =>
      `${description} Кои от тях са в сезон през ${monthNameLower(month)} и какви са хранителните им стойности.`,
    intro: (name: string, month: Month) =>
      `Продуктите от семейство ${name}, подредени по сезона през ${monthNameLower(month)}.`,
    empty: 'Все още няма добавени продукти от това семейство.',
  },
  search: {
    navLabel: 'Търсене',
    title: 'Търсене',
    heading: 'Търсене',
    description:
      'Търси плод, зеленчук, подправка, ядка или хранително вещество по име, на кирилица или на латиница.',
    label: 'Какво търсиш?',
    hint: 'Например ябълки или yabalki.',
    submit: 'Търси',
    noscript: 'Търсенето изисква JavaScript. Разгледай каталога по-долу.',
    browseHeading: 'Разгледай',
    loading: 'Търсене…',
    found: 'Резултати: {count} за „{query}“.',
    none: 'Няма резултати за „{query}“.',
    failed: 'Търсенето не може да се зареди.',
  },
  ads: {
    label: ADVERTISING,
  },
  advertising: {
    title: 'Реклама в Сезон: за спонсори и ферми',
    heading: 'Реклама в Сезон',
    description:
      'Как работи рекламата в Сезон: спонсорирани банери и ферми, ясно отбелязани, които не променят данните. Пиши ни по имейл.',
    intro:
      'Сезон може да показва ненатрапчива реклама. Тук описваме какво предлагаме на фирми и ферми и правилата, които пазят данните независими.',
    offerHeading: 'Какво предлагаме',
    offerItems: [
      'Спонсориран банер – на страниците на продуктите след раздела „Яж“, а на страниците на месеците след списъците с продукти; никога в началото на страницата.',
      'Спонсорирана ферма – показва се първа в списъците с ферми на страниците на продуктите и на областите.',
    ],
    offerFarms:
      'Спонсорираната ферма отговаря на същите условия като всяка друга: да е реална и данните за нея да имат източник.',
    labelsHeading: 'Как отбелязваме рекламата',
    labels:
      'Всеки банер е с надпис „Реклама“, а всяка спонсорирана ферма – със „Спонсорирано“. Връзките към спонсорите са отбелязани за търсачките като платени.',
    dataHeading: 'Рекламата не променя данните',
    data: 'Спонсорът не може да промени сезоните, хранителните стойности, областите, традиционните употреби или данните за фермите. Те следват източниците си, както на всяка друга страница.',
    contactHeading: 'Връзка',
    contact: 'Ако искаш да рекламираш в Сезон, пиши ни на:',
  },
  privacy: {
    title: PRIVACY_POLICY,
    heading: PRIVACY_POLICY,
    description:
      'Какви данни обработва Сезон: без анализ на посещенията, имейлът е само за отговор, сигналите в GitHub са публични, а рекламите са описани.',
    intro:
      'Тук описваме какви данни обработва Сезон и защо. Описваме само онова, което сайтът прави в момента.',
    controllerHeading: 'Кой отговаря за данните',
    controller: (name: string) =>
      `Администратор на личните данни е ${name}, който прави и поддържа Сезон. Можеш да се свържеш с него на:`,
    collectedHeading: 'Какво събира сайтът',
    collected: 'Сезон не използва инструменти за анализ на посещенията и сам не поставя бисквитки.',
    emailHeading: 'Имейл',
    email: 'Ако ни пишеш, използваме имейла ти и написаното в него само за да ти отговорим.',
    githubHeading: 'Сигнали в GitHub',
    github:
      'Сигналите и заявките в GitHub са публични, заедно с името на профила ти. Не пиши там лични данни, които не искаш да се виждат.',
    adsHeading: 'Реклами от Google',
    adsOff:
      'В момента Сезон не показва реклами от Google, затова Google не поставя бисквитки чрез сайта.',
    adsOn:
      'На рекламните места без спонсор може да се показват реклами от Google AdSense. Когато рекламният код се зареди, браузърът ти изпраща на Google технически данни като IP адреса ти и адреса на страницата. Google използва бисквитки и лични данни за персонализирани реклами само след съгласието ти, дадено в съобщението на Google за поверителност; без съгласие може да показва ограничени реклами. Изборът ти се пази в бисквитки на домейна на Сезон.',
    cookiesLink: 'Кои бисквитки се използват',
  },
  cookies: {
    title: `${COOKIES}: какво поставя сайтът`,
    heading: COOKIES,
    description:
      'Кои бисквитки се използват в Сезон: сайтът не поставя свои, а когато има реклами от Google – кои поставя Google и как да промениш избора си.',
    intro:
      'Бисквитките са малки файлове, които сайтовете записват в браузъра ти. Тук изброяваме кои се използват в Сезон.',
    siteHeading: 'Бисквитки на Сезон',
    siteOff: 'Сезон не поставя свои бисквитки.',
    siteOn:
      'Сезон сам не поставя бисквитки. Съобщението на Google за поверителност обаче пази избора ти – дори когато откажеш – в бисквитки на домейна на Сезон: FCCDCF (до 13 месеца) и FCNEC (до 1 година).',
    googleHeading: 'Бисквитки на Google',
    googleOff:
      'В момента сайтът не показва реклами от Google, затова Google не поставя бисквитки чрез Сезон.',
    googleOn:
      'На рекламните места без спонсор може да се показват реклами от Google AdSense. Когато рекламният код се зареди, браузърът ти изпраща на Google технически данни като IP адреса ти и адреса на страницата. Google поставя бисквитки за персонализирани реклами само след съгласието ти; без съгласие може да показва ограничени реклами. Съобщението на Google за поверителност се показва само в регионите, настроени в AdSense – ЕИП, Обединеното кралство и Швейцария, когато за първи път стигнеш близо до рекламно място.',
    googlePolicyLink: 'Как Google използва информацията от сайтовете, които използват услугите му',
    settingsHeading: PRIVACY_SETTINGS,
    settingsButton: PRIVACY_SETTINGS,
    settingsIntro: 'Бутонът отваря отново съобщението на Google, за да промениш избора си.',
    settingsNoScript:
      'Без JavaScript рекламите и съобщението на Google не се зареждат и не се поставят бисквитки, затова няма избор за промяна.',
    noConsentStored:
      'Сайтът не пази съгласие, защото нито Сезон, нито Google поставят бисквитки чрез него.',
  },
  farms: {
    title: 'Местни ферми, които продават сезонни продукти',
    heading: LOCAL_FARMS,
    description:
      'Местни ферми в България, които продават сезонни плодове, зеленчуци и ядки: какво продават, къде са и как да се свържеш с тях.',
    intro:
      'Ферми, които продават направо на теб. Всяка страница казва какво продават, къде са и откъде са данните.',
    pageTitle: (name: string) => fittingTitle([`${name} – местна ферма`, name]),
    pageDescription: farmPageDescription,
    listHeading: (count: number) => `Всички ферми (${count})`,
    produceHeading: 'Какво предлага',
    produceSeparator: DASH_SEPARATOR,
    contactsHeading: 'Контакти',
    addressLabel: 'Адрес:',
    sourcesHeading: SOURCES,
    sourcesNote: 'Данните за фермата са взети от тези страници.',
  },
  regions: {
    title: 'Области на България: какво расте къде',
    heading: 'Области',
    description:
      'Кои плодове и зеленчуци растат най-добре във всяка от 28-те области на България и кои местни ферми има в тях.',
    intro:
      'Избери област на картата или в списъка, за да видиш какво расте там и кои местни ферми има.',
    mapCaption: 'Всяка област на картата води към своята страница.',
    listHeading: 'Всички области',
    overviewLabel: regionOverviewLabel,
    placeName: regionPlaceName,
    pageTitle: (name: string) => `${regionPlaceName(name)}: какво расте и местни ферми`,
    pageDescription: regionPageDescription,
    pageIntro: regionPageIntro,
    mapCaptionFor: (name: string) =>
      `На картата: ${regionPlaceName(name)} – с плътни щрихи. Избери друга област, за да видиш нейната страница.`,
    profile: {
      heading: 'Земеделие в областта',
      summary: regionProfileSummary,
      sourcesLabel: 'Източници:',
    },
    growsHeading: 'Какво расте тук',
    noteSeparator: DASH_SEPARATOR,
    noProduce: 'Все още няма продукти, свързани с тази област.',
    farmsHeading: LOCAL_FARMS,
    noFarms: 'Все още няма добавени ферми от тази област.',
    country: 'България',
  },
  catalog: {
    title: 'Каталог: плодове, зеленчуци, подправки и ядки',
    heading: 'Каталог',
    description:
      'Всички сезонни плодове, зеленчуци, подправки и ядки в каталога, подредени по раздели и ботанически семейства, и хранителните вещества в тях.',
    intro:
      'Всичко в сайта на едно място: разделите, ботаническите семейства и хранителните вещества.',
    sectionsHeading: 'Раздели',
    groupsHeading: 'Ботанически семейства',
    nutrientsHeading: 'Хранителни вещества',
    farmsLink: 'Всички местни ферми',
    regionsLink: 'Какво расте във всяка от 28-те области',
    recipesLink: 'Всички рецепти за зимнина',
    count: (count: number) => (count === 1 ? '1 продукт' : `${count} продукта`),
  },
  recipes: {
    title: 'Рецепти за зимнина: кисело зеле, сладка и компоти',
    heading: RECIPES_HEADING,
    description:
      'Рецепти за зимнина с източник: кисело зеле, сладка и компоти с точни количества, време във водна баня и съвети за безопасно съхранение.',
    intro:
      'Как да затвориш сезона в буркан. Всяка рецепта посочва публикацията, от която идва, а стъпките за безопасност – стерилизация, време във водна баня и съхранение – следват източник за безопасност на храните.',
    safetyIntro:
      'Не променяй количествата сол, захар, киселина и вода и спазвай времето във водна баня: от тях зависи дали бурканът е безопасен.',
    pageTitle: (name: string) =>
      fittingTitle([`${name} – рецепта за зимнина`, `${name} – рецепта`, name]),
    forProduce: (names: ReadonlyArray<string>) => `За: ${names.join(LIST_SEPARATOR)}`,
    produceLabel: 'За продуктите:',
    produceSeparator: DASH_SEPARATOR,
    categories: {
      sauerkraut: 'кисело зеле',
      pickle: 'туршия',
      preserve: 'сладко',
      jam: 'конфитюр',
      compote: 'компот',
      'jarred-vegetables': 'зеленчуци в буркан',
    } satisfies Record<RecipeCategory, string>,
    categoryHeadings: {
      sauerkraut: 'Кисело зеле',
      pickle: 'Туршии',
      preserve: 'Сладка',
      jam: 'Конфитюри',
      compote: 'Компоти',
      'jarred-vegetables': 'Зеленчуци в буркан',
    } satisfies Record<RecipeCategory, string>,
    units: RECIPE_UNITS,
    ingredient: recipeIngredient,
    facts: {
      category: 'Вид',
      yield: 'Количество',
      prep: 'Подготовка',
      cook: 'Варене',
      processing: 'Във водна баня',
      wait: 'Престояване',
      days: (days: number) => (days === 1 ? '1 ден' : `${days} дни`),
      processingNote:
        'Времето във водна баня е за надморска височина до 300 м; за по-голяма височина виж „Буркани и стерилизация“.',
    },
    headings: {
      ingredients: 'Съставки',
      steps: 'Приготвяне',
      safety: 'Безопасност',
      sterilisation: 'Буркани и стерилизация',
      storage: 'Съхранение',
      sources: SOURCES,
    },
    waterBath: {
      heading: 'Водна баня',
      items: [
        'Използвай буркани за консервиране и нови плоски капачки при всяко затваряне: бурканите може да се ползват отново, капачките – не.',
        'Подреди бурканите на скара в съда и налей гореща вода поне 2,5 см над капачките, а когато варенето е над 30 минути – поне 5 см над тях.',
        'Отчитай времето от момента, в който водата заври силно, и дръж съда покрит.',
        'Ако водата спре да ври, доведи я отново до силно кипене и започни отначало с цялото време.',
        'Извади бурканите, без да ги накланяш, и ги остави да изстинат 12–24 часа, без да ги местиш.',
        'После натисни средата на всяка капачка: ако е вдлъбната и не пружинира, бурканът е затворен херметично.',
        'Буркан, който не се е затворил до 24 часа, дръж в хладилник и го изяж до седмица.',
      ],
    },
    safetySourcesLabel: 'Източници за безопасността:',
    sourcesNote: 'Рецептата е по тези публикации.',
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

/** Returns the first three letters of the month name (e.g. „Ное“). */
export function monthAbbreviation(month: Month): string {
  return monthName(month).slice(0, ABBREVIATION_LENGTH);
}

/** Returns the letters of the month name after its abbreviation (e.g. „мври“), or „“. */
export function monthRest(month: Month): string {
  return monthName(month).slice(ABBREVIATION_LENGTH);
}
