import type { GrowingActivity, OrganicAvailability, ProduceKind } from '@contexts/catalog';
import { LAST_MONTH_NUMBER, Month, type SeasonLevelValue } from '@contexts/seasonality';
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

/** Returns the region page description for the counts the page shows (never both zero). */
function regionPageDescription(name: string, produceCount: number, farmCount: number): string {
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
    reviewer: (name: string) => `Данните проверява ${name}.`,
    ownerGithub: (handle: string) => `${handle} в GitHub`,
    ownerLinkedin: (name: string) => `${name} в LinkedIn`,
    aiHeading: 'Как използваме изкуствен интелект',
    ai: [
      'Агенти с изкуствен интелект пишат код, тестове и чернови на текстове. Всяка промяна минава през автоматични проверки и остава публична в историята на хранилището.',
      'Автоматичните проверки не допускат хранителни стойности, традиционни употреби, съвети за отглеждане или ферми без източник. Сезоните, практическите съвети и повечето бележки за областите са редакторски.',
    ],
    sourcesHeading: 'Източници и прозрачност',
    sources:
      'Хранителните стойности водят към USDA FoodData Central или EFSA, традиционните употреби – към публикацията, от която идват, съветите за отглеждане – към своите източници, а данните за фермите – към собствените им страници. Областите на ябълките, крушите, орехите и зелето следват статистиката на МЗХ. Сезоните по месеци, останалите бележки за областите и съветите как да избереш, съхраниш и приготвиш са редакторски.',
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
    ads: 'В момента в сайта няма реклами. Ако се появят реклами или спонсорирани ферми, те ще бъдат ясно отбелязани и няма да влияят на данните.',
    privacyHeading: 'Поверителност',
    privacy:
      'Сайтът не използва бисквитки и не следи посещенията ти. Ако ни пишеш по имейл, използваме адреса ти само за да ти отговорим. Сигналите и заявките в GitHub са публични, заедно с името на профила ти.',
    healthHeading: 'Здраве',
  },
  methodology: {
    title: 'Методология: откъде идват данните',
    heading: 'Методология',
    description:
      'Как Сезон избира и проверява данните: хранителни стойности от USDA и EFSA, сезони, райони, традиционна употреба, ферми и поправки.',
    intro: 'Тук описваме откъде идват данните в Сезон и как ги проверяваме.',
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
      'Всеки продукт има ниво за всеки месец, за условията в България. Нивата са редакторска оценка: официален календар по месеци за всеки продукт в България няма. Нивата са:',
    outOfSeasonText: 'в България не се бере и не е от хранилище; ако го има, вероятно е внос',
    regionsHeading: 'Области',
    regions:
      'За всеки продукт посочваме областите, в които се отглежда, с кратка бележка. За ябълки, круши, орехи и зеле областите и бележките следват статистиката на МЗХ (отдел „Агростатистика“) и имат източник; за останалите продукти официални данни по области няма и бележките са редакторски.',
    traditionalHeading: 'Традиционна употреба',
    traditional:
      'Традиционната употреба описва традиции, а не доказани ефекти, и винаги започва с „Традиционно се използва“. Не твърдим, че храна лекува или предпазва от болест (Регламент (ЕО) № 1924/2006). Всяка употреба има първичен източник – фармакопея, официална монография или етноботаническо изследване; Уикипедия не се приема.',
    growingHeading: 'Отглеждане',
    growing:
      'Месеците за сеитба, разсаждане и засаждане и съветите за отглеждане имат собствени източници, посочени под тях.',
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
      label: (regions: ReadonlyArray<string>) =>
        regions.length === 0
          ? `${MAP_TITLE} Няма отбелязани области`
          : `${MAP_TITLE} Отбелязани области: ${regions.join(LIST_SEPARATOR)}`,
      caption: 'Оцветени са областите, изброени по-горе.',
      creditPrefix: 'Граници на областите:',
      creditName: 'Natural Earth',
      creditUrl: 'https://www.naturalearthdata.com/',
      creditSuffix: '(обществено достояние).',
    },
    farmsLink: 'Местни ферми, които го продават',
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
    mapCaption: 'С щрихи са областите, за които вече има данни.',
    listHeading: 'Всички области',
    noData: 'Още няма данни',
    counts: (produce: number, farms: number) =>
      [
        produce === 0 ? undefined : produce === 1 ? '1 продукт' : `${produce} продукта`,
        farms === 0 ? undefined : farms === 1 ? '1 ферма' : `${farms} ферми`,
      ]
        .filter((part) => part !== undefined)
        .join(' · '),
    placeName: regionPlaceName,
    pageTitle: (name: string) => `${regionPlaceName(name)}: какво расте и местни ферми`,
    pageDescription: regionPageDescription,
    pageIntro: 'Какво расте тук и кои местни ферми има в областта.',
    mapCaptionFor: (name: string) =>
      `На картата: ${regionPlaceName(name)} – с плътни щрихи; другите области със страница – с тънки щрихи.`,
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
    count: (count: number) => (count === 1 ? '1 продукт' : `${count} продукта`),
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
