import type { ProduceRecord } from '@contexts/catalog/infrastructure/schemas';
import type { FarmRecord } from '@contexts/farms/infrastructure/schemas';

const SOURCE = {
  name: 'USDA FoodData Central, SR Legacy: Cabbage, raw',
  url: 'https://fdc.nal.usda.gov/',
};

/** Returns a valid produce record; `overrides` replace top-level fields. */
export function produceRecord(overrides: Partial<ProduceRecord> = {}): ProduceRecord {
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
    howToChoose: 'Изберете плътна и тежка глава с лъскави листа.',
    storage: 'В хладилник до две седмици.',
    faq: [{ question: 'Кога е сезонът на зелето?', answer: 'От септември до ноември.' }],
    updatedAt: new Date('2026-11-10'),
    reviewStatus: 'draft',
    ...overrides,
  };
}

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
    isPlaceholder: true,
    sponsored: false,
    ...overrides,
  };
}
