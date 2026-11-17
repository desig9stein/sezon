import { describe, expect, it } from 'vitest';
import { MICRO_NUTRIENT_IDS } from '../../../scripts/content/usdaNutrients';
import extract from '../../fixtures/usda/sr-legacy-extract.json';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { ui } from '@i18n/bg';
import { readSeedCollection } from '@tests/fixtures/seedData';

interface Caution {
  readonly kind: string;
  readonly text: string;
  readonly source: { readonly name: string; readonly url: string };
}

interface ProduceRecord {
  readonly summary?: string;
  readonly season: ReadonlyArray<{ readonly month: number; readonly level: string }>;
  readonly cautions?: ReadonlyArray<Caution>;
  readonly regions?: ReadonlyArray<{ readonly region: string; readonly note: string }>;
  readonly nutrition?: {
    readonly micronutrients: ReadonlyArray<{ readonly nutrient: string; readonly amount: number }>;
    readonly source: { readonly url: string };
  };
  readonly growing?: {
    readonly sowSeedlings?: ReadonlyArray<number>;
    readonly sow: ReadonlyArray<number>;
  };
}

interface RecipeRecord {
  readonly steps: ReadonlyArray<string>;
  readonly safety: { readonly sterilisation: string };
}

interface RegionRecord {
  readonly seat?: {
    readonly town: string;
    readonly altitude: { readonly fromMetres: number; readonly toMetres?: number };
    readonly source: { readonly name: string; readonly url: string };
  };
}

const produce = new Map(
  readSeedCollection('produce').map(({ id, data }) => [id, data as ProduceRecord]),
);
const recipes = readSeedCollection('recipes').map(({ id, data }) => ({
  id,
  ...(data as RecipeRecord),
}));
const regions = new Map(
  readSeedCollection('regions').map(({ id, data }) => [id, data as RegionRecord]),
);
const referenceIntakes = new Map(
  readSeedCollection('nutrients').map(({ id, data }) => [
    id,
    (data as { referenceIntake: number }).referenceIntake,
  ]),
);
const foods = extract.foods as Record<string, { readonly nutrients: Record<string, number> }>;

/** Returns the produce record with `id`, failing the test when it is missing. */
function record(id: string): ProduceRecord {
  const entry = produce.get(id);
  if (entry === undefined) throw new Error(`Missing produce "${id}".`);
  return entry;
}

const cautionsOf = (id: string) => record(id).cautions ?? [];
const processingStep = (steps: ReadonlyArray<string>) =>
  steps.find((step) => step.startsWith('Вари бурканите')) ?? '';
const LARGE_JAR = 'до 950 мл';
const NCHFP_DIFFERENCE = 5;
const CLAIM_SHARE = 0.15;
/** Micronutrients left out on purpose: the chestnut record includes the inner skin (spec 044). */
const LEFT_OUT: ReadonlyArray<readonly [string, string]> = [['kesteni', 'mangan']];
const NSI_REGISTER = 'https://nrnm.nsi.bg/ekatte/territorial-units';

/** ЕКАТТЕ altitude groups of the province seats (spec 061, section 5.1). */
const SEATS: Readonly<Record<string, readonly [string, number, number | undefined]>> = {
  blagoevgrad: ['Благоевград', 300, 499],
  burgas: ['Бургас', 0, 49],
  varna: ['Варна', 0, 49],
  'veliko-tarnovo': ['Велико Търново', 100, 199],
  vidin: ['Видин', 0, 49],
  vratsa: ['Враца', 300, 499],
  gabrovo: ['Габрово', 300, 499],
  dobrich: ['Добрич', 200, 299],
  kardzhali: ['Кърджали', 200, 299],
  kyustendil: ['Кюстендил', 500, 699],
  lovech: ['Ловеч', 100, 199],
  montana: ['Монтана', 100, 199],
  pazardzhik: ['Пазарджик', 200, 299],
  pernik: ['Перник', 500, 699],
  pleven: ['Плевен', 50, 99],
  plovdiv: ['Пловдив', 100, 199],
  razgrad: ['Разград', 200, 299],
  ruse: ['Русе', 0, 49],
  silistra: ['Силистра', 0, 49],
  sliven: ['Сливен', 200, 299],
  smolyan: ['Смолян', 700, 999],
  'sofia-grad': ['София', 500, 699],
  'stara-zagora': ['Стара Загора', 200, 299],
  targovishte: ['Търговище', 100, 199],
  haskovo: ['Хасково', 100, 199],
  shumen: ['Шумен', 200, 299],
  yambol: ['Ямбол', 100, 199],
};

/** Months sown for seedlings and months still sown, from the sources in spec 061, section 5.6. */
const SOWING: Readonly<Record<string, readonly [ReadonlyArray<number>, ReadonlyArray<number>]>> = {
  domati: [[2, 3], []],
  piper: [[1, 2, 3], []],
  tselina: [[3], []],
  krastavitsi: [[3], [4, 6, 7]],
  brokoli: [[6], []],
  karfiol: [[5, 6, 7], []],
  patladzhan: [[1, 2, 4], []],
  zele: [[2, 4, 6], []],
  marulya: [[1], [9]],
};

describe('recipe steps and town altitudes (spec 061)', () => {
  it.each(recipes)('AC1: $id sends the reader to the altitude card, with no minutes', (recipe) => {
    const step = processingStep(recipe.steps);
    expect(step).toContain('„Във водна баня“');
    expect(step).toContain('надморската височина');
    expect(step).toContain('от момента, в който водата заври');
    expect(step).not.toMatch(/\d+\s*минут/);
  });

  it.each(recipes.filter(({ safety }) => safety.sterilisation.includes(LARGE_JAR)))(
    'AC2: $id says the card is for jars up to 950 мл and smaller jars take 5 minutes less',
    (recipe) => {
      const step = processingStep(recipe.steps);
      expect(step).toContain('буркани до 950 мл');
      expect(step).toContain('буркани до 470 мл вари 5 минути по-малко');
      const sentence = (jar: string) =>
        new RegExp(`Буркани ${jar}: [^.]*\\.`).exec(recipe.safety.sterilisation)?.[0] ?? '';
      const smallTimes = [...sentence('до 470 мл').matchAll(/(\d+) минути/g)].map((match) =>
        Number(match[1]),
      );
      const largeTimes = [...sentence(LARGE_JAR).matchAll(/\d+/g)]
        .map((match) => Number(match[0]))
        .filter((value) => value !== 950);
      expect(smallTimes.length).toBeGreaterThan(0);
      expect(largeTimes).toEqual(smallTimes.map((minutes) => minutes + NCHFP_DIFFERENCE));
    },
  );

  it('AC3: every province seat has its ЕКАТТЕ altitude group and the НСИ source', () => {
    for (const [id, [town, fromMetres, toMetres]] of Object.entries(SEATS)) {
      const seat = regions.get(id)?.seat;
      expect(seat?.town, id).toBe(town);
      expect(seat?.altitude, id).toEqual(
        toMetres === undefined ? { fromMetres } : { fromMetres, toMetres },
      );
      expect(seat?.source.url, id).toBe(NSI_REGISTER);
    }
    expect(regions.get('sofiyska')?.seat).toBeUndefined();
  });

  it('AC3: the schema rejects an altitude group that does not rise', () => {
    const seat = {
      town: 'Смолян',
      altitude: { fromMetres: 700, toMetres: 700 },
      source: { name: 'НСИ', url: NSI_REGISTER },
    };
    expect(regionSchema.safeParse({ name: 'Смолян', seat }).success).toBe(false);
    expect(
      regionSchema.safeParse({ name: 'Смолян', seat: { ...seat, altitude: { fromMetres: 700 } } })
        .success,
    ).toBe(true);
  });
});

describe('wild produce cautions (spec 061)', () => {
  it('AC6: elder dates the berries to August only and says бъзак is poisonous', () => {
    const elder = record('cheren-baz');
    expect(elder.summary).not.toContain('започва');
    expect(elder.summary).toContain('през август');
    expect(elder.season).toEqual([{ month: 8, level: 'peak' }]);
    const lookAlikes = cautionsOf('cheren-baz').filter(({ kind }) => kind === 'look-alike');
    expect(lookAlikes.some(({ text }) => text.includes('бъзака (Sambucus ebulus)'))).toBe(true);
    const poisonous = lookAlikes.find(({ text }) => text.includes('отровно'));
    expect(poisonous?.text).toContain('Sambucus ebulus');
    expect(poisonous?.source.url).toBe('https://pmc.ncbi.nlm.nih.gov/articles/PMC4379516/');
  });

  it('AC7: the methodology says wild sea buckthorn is not gathered at all', () => {
    expect(ui.methodology.wild).not.toContain('важат същите правила');
    expect(ui.methodology.wild).toContain('дивата облепиха е защитен вид и изобщо не се бере');
    expect(ui.methodology.wild).toContain('законът ограничава количеството');
  });

  it('AC8: oregano has one ЗЛР caution for both oreganos and one 2026 order caution', () => {
    const protectedCautions = cautionsOf('rigan').filter(({ kind }) => kind === 'protected');
    expect(protectedCautions).toHaveLength(2);
    const [law, order] = protectedCautions;
    expect(law?.text).toMatch(/^Белият и обикновеният риган са в списъка/);
    expect(law?.source.url).toBe('https://faolex.fao.org/docs/pdf/bul40297.pdf');
    expect(order?.text).toMatch(/^През 2026 г\./);
    expect(order?.text).toContain('Ако не знаеш кой риган е, бери само за лични нужди.');
  });

  it('AC9: purslane warns of the spurge look-alike', () => {
    const spurge = cautionsOf('tuchenitsa').find(({ kind }) => kind === 'look-alike');
    expect(spurge?.text).toContain('Euphorbia');
    expect(spurge?.text).toContain('млечен сок');
    expect(new URL(spurge?.source.url ?? 'https://x').hostname).toBe('extension.psu.edu');
  });
});

describe('nutrient coverage (spec 061)', () => {
  const usdaProduce = [...produce].filter(([, entry]) =>
    (entry.nutrition?.source.url ?? '').startsWith('https://fdc.nal.usda.gov/'),
  );

  it.each(usdaProduce)(
    'AC12: %s lists every micronutrient its USDA record gives at 15 % or more',
    (id, entry) => {
      const fdcId = /\/food-details\/(\d+)\//.exec(entry.nutrition?.source.url ?? '')?.[1] ?? '';
      const values = foods[fdcId]?.nutrients ?? {};
      const listed = new Set(entry.nutrition?.micronutrients.map(({ nutrient }) => nutrient));
      for (const [slug, fdcNutrient] of Object.entries(MICRO_NUTRIENT_IDS)) {
        const amount = values[fdcNutrient];
        const intake = referenceIntakes.get(slug) ?? Infinity;
        if (amount === undefined || amount / intake < CLAIM_SHARE) continue;
        if (LEFT_OUT.some(([produceId, nutrient]) => produceId === id && nutrient === slug)) {
          continue;
        }
        expect(listed.has(slug), `${id} ${slug}`).toBe(true);
      }
    },
  );
});

describe('region notes and sowing (spec 061)', () => {
  const notes = [...produce].flatMap(([id, entry]) =>
    (entry.regions ?? []).map(({ region, note }) => ({ id, region, note })),
  );

  it('AC13: a statistical-region note starts with the region, not with the province', () => {
    for (const { id, region, note } of notes) {
      expect(note, `${id}/${region}`).not.toMatch(/^(Областта|Столицата) е в/);
      if (/ район/.test(note)) {
        expect(note, `${id}/${region}`).toMatch(
          /^(Южният централен|Югозападният|Югоизточният|Северният централен|Североизточният|Северозападният) район \(в който е (областта|столицата)\) има/,
        );
      }
    }
  });

  it.each(Object.entries(SOWING))(
    'AC14: %s sows seedlings where its sources say so',
    (id, months) => {
      const [seedlings, sow] = months;
      expect(record(id).growing?.sowSeedlings, id).toEqual(seedlings);
      expect(record(id).growing?.sow, id).toEqual(sow);
    },
  );
});

describe('organic certificates (spec 061)', () => {
  it('AC15: the methodology explains how to check a certificate in TRACES', () => {
    expect(ui.methodology.farms).toContain('TRACES');
    expect(ui.methodology.organicCheckLink.url).toBe(
      'https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/index',
    );
  });
});
