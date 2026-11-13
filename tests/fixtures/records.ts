import type { ProduceRecord } from '@contexts/catalog/infrastructure/schemas';
import type { FarmRecord } from '@contexts/farms/infrastructure/schemas';
import type { RegionProfileRecord } from '@contexts/geography/infrastructure/schemas';

const SOURCE = {
  name: 'USDA FoodData Central, SR Legacy: Cabbage, raw',
  url: 'https://fdc.nal.usda.gov/',
};

/** A produce record whose optional nutrition block is present. */
export type ProduceRecordWithNutrition = ProduceRecord & {
  nutrition: NonNullable<ProduceRecord['nutrition']>;
};

/** Returns a valid produce record with every block; `overrides` replace top-level fields. */
export function produceRecord(
  overrides: Partial<ProduceRecordWithNutrition> = {},
): ProduceRecordWithNutrition {
  return {
    name: 'Зеле',
    latinName: 'Brassica oleracea var. capitata',
    kind: 'vegetable',
    group: 'krastotsvetni',
    summary:
      'Зелето е най-сладко и хрупкаво през есента. Има високо съдържание на витамин C и K и се съхранява дълго.',
    varieties: [{ name: 'Бяло зеле' }, { name: 'Червено зеле', note: 'Съдържа антоцианини.' }],
    season: [
      { month: 9, level: 'peak' },
      { month: 10, level: 'peak' },
      { month: 11, level: 'available' },
      { month: 1, level: 'storage' },
    ],
    regions: [{ region: 'plovdiv', note: 'Тракийската низина има плодородни почви.' }],
    nutrition: {
      energyKcal: 25,
      proteinG: 1.28,
      fatG: 0.1,
      carbohydrateG: 5.8,
      fiberG: 2.5,
      sugarsG: 3.2,
      micronutrients: [
        { nutrient: 'vitamin-c', amount: 36.6 },
        { nutrient: 'vitamin-k', amount: 76 },
      ],
      source: SOURCE,
    },
    preparation: [{ method: 'Сурово', tip: 'Нарязано на салата запазва най-много витамин C.' }],
    traditionalUses: [
      {
        system: 'folk',
        use: 'Традиционно се използва за компреси със зелеви листа.',
        source: { name: 'Народна медицина', url: 'https://example.org/source' },
      },
    ],
    howToChoose: 'Избери плътна и тежка глава с лъскави листа.',
    storage: 'В хладилник до две седмици.',
    faq: [{ question: 'Кога е сезонът на зелето?', answer: 'От септември до ноември.' }],
    updatedAt: new Date('2026-11-10'),
    ...overrides,
  };
}

/**
 * YAML-shaped input of a produce with only the fields every produce must give (spec 049): name,
 * kind, group, summary, season and update date. Test-only; not a seed entry.
 */
export const MINIMAL_PRODUCE_INPUT = {
  name: 'Хрян',
  kind: 'vegetable',
  group: 'krastotsvetni',
  summary:
    'Хрянът се копае през късната есен и зимата. Корените му се настъргват пресни към месо и туршии.',
  season: [
    { month: 10, level: 'available' },
    { month: 11, level: 'peak' },
    { month: 12, level: 'peak' },
  ],
  updatedAt: '2026-11-13',
};

/** Authorised claim fields shared by test nutrients (Regulation (EU) No 432/2012). */
export const NUTRIENT_CLAIMS = {
  claims: ['Витамин С допринася за нормалната функция на имунната система'],
  claimsSource: {
    name: 'Регламент (ЕС) № 432/2012',
    url: 'https://eur-lex.europa.eu/legal-content/BG/TXT/?uri=CELEX:32012R0432',
  },
};

/** Returns a valid farm record; `overrides` replace top-level fields. */
export function farmRecord(overrides: Partial<FarmRecord> = {}): FarmRecord {
  return {
    name: 'Зелена долина',
    region: 'plovdiv',
    produce: ['zele', 'praz'],
    description: 'Примерна семейна ферма за зеленчуци.',
    contact: { website: 'https://example.com', email: 'farm@example.com', phone: '+359000000001' },
    sponsored: false,
    sources: ['https://example.org/ferma'],
    ...overrides,
  };
}

/** The two МЗХ bulletins every province profile cites (spec 038). */
export const PROVINCE_PROFILE_SOURCES = [
  {
    name: 'МЗХ, Агростатистика – БАНСИК 2025: Заетост и използване на територията през 2025 година – окончателни резултати, бюлетин № 465',
    url: 'https://www.mzh.government.bg/media/filer_public/2025/12/04/ra_465_publicationbancik2025.pdf',
  },
  {
    name: 'МЗХ, Агростатистика – Структура на основни овощни видове в България през 2023 година (предварителни резултати), бюлетин № 448',
    url: 'https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448_publicationstructureorchard2023-preliminaryresults.pdf',
  },
] as const;

/** Returns the Plovdiv province profile record; `overrides` replace top-level fields. */
export function regionProfileRecord(
  overrides: Partial<RegionProfileRecord> = {},
): RegionProfileRecord {
  return {
    utilisedAreaHa: 257175,
    arableHa: 195490,
    grasslandHa: 47201,
    areaYear: 2025,
    orchardYear: 2023,
    topFruits: [
      { name: 'черешите', areaHa: 1676 },
      { name: 'сливите', areaHa: 1551 },
    ],
    sources: [...PROVINCE_PROFILE_SOURCES],
    ...overrides,
  };
}

/** Source cited by the first test-only caution of {@link WILD_PRODUCE_INPUT}. */
export const CAUTION_SOURCE = {
  name: 'Тестов източник за предупреждения',
  url: 'https://example.org/preduprezhdenie',
};

/** Source cited by the second test-only caution of {@link WILD_PRODUCE_INPUT}. */
export const SECOND_CAUTION_SOURCE = {
  name: 'Втори тестов източник',
  url: 'https://example.org/zakon',
};

/**
 * YAML-shaped input of a wild produce with two cautions (spec 055). Test-only; not a seed entry:
 * the caution texts say they are test text and the sources point to `example.org`.
 */
export const WILD_PRODUCE_INPUT = {
  name: 'Глухарче',
  kind: 'herb',
  group: 'slozhnotsvetni',
  wild: true,
  summary:
    'Тестов запис на диворастящо растение за проверка на предупрежденията. Не е част от съдържанието.',
  season: [
    { month: 4, level: 'peak' },
    { month: 11, level: 'available' },
  ],
  cautions: [
    {
      kind: 'look-alike',
      text: 'Тестов текст за отровен двойник на диворастящото растение.',
      source: CAUTION_SOURCE,
    },
    {
      kind: 'protected',
      text: 'Тестов текст за ограничения при събирането на защитен вид.',
      source: SECOND_CAUTION_SOURCE,
    },
  ],
  updatedAt: '2026-11-13',
};
