import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { RegionProfile } from '@contexts/geography';
import { toRegion } from '@contexts/geography/infrastructure/mappers';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { feminineOrdinal, ui } from '@i18n/bg';
import { InvalidPageMetaError } from '@shared/domain/errors';
import { regionProfileRecord } from '@tests/fixtures/records';

const NBSP = ' ';
const length = (text: string) => [...text].length;

/** The 28 feminine ordinals, written out by hand. */
const ORDINALS = [
  'първа',
  'втора',
  'трета',
  'четвърта',
  'пета',
  'шеста',
  'седма',
  'осма',
  'девета',
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
  'двадесета',
  'двадесет и първа',
  'двадесет и втора',
  'двадесет и трета',
  'двадесет и четвърта',
  'двадесет и пета',
  'двадесет и шеста',
  'двадесет и седма',
  'двадесет и осма',
] as const;

const REGIONS_DIR = join(process.cwd(), 'src', 'data', 'regions');
const PROVINCES = readdirSync(REGIONS_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) =>
    toRegion(
      file.replace(/\.yaml$/, ''),
      regionSchema.parse(parse(readFileSync(join(REGIONS_DIR, file), 'utf8'))),
    ),
  );
const plovdiv = RegionProfile.create(regionProfileRecord());
const noFruits = () =>
  RegionProfile.create(
    regionProfileRecord({
      utilisedAreaHa: 34777,
      arableHa: 1277,
      grasslandHa: 32125,
      topFruits: undefined,
      orchardYear: undefined,
    }),
  );

describe('province profile texts (spec 038)', () => {
  it.each(ORDINALS.map((word, index) => [index + 1, word] as const))(
    'AC9: rank %i is „%s“',
    (rank, word) => {
      expect(feminineOrdinal(rank)).toBe(word);
    },
  );

  it('AC10: builds the Plovdiv sentences from the figures', () => {
    expect(ui.regions.profile.summary(plovdiv, { rank: 5, total: 28 })).toBe(
      `Използваната земеделска площ е 257${NBSP}175 ха (2025 г.) – пета по големина сред 28-те области. ` +
        'Обработваемата земя е 76% от нея, а постоянно затревените площи – 18%. ' +
        `От основните овощни видове, изследвани от МЗХ, най-голяма площ заемат черешите (1${NBSP}676 ха), следвани от сливите (1${NBSP}551 ха) – 2023 г., предварителни данни.`,
    );
  });

  it('AC10: writes a share under 0.5% as „под 1%“ and names a single top fruit alone', () => {
    const silistra = RegionProfile.create(
      regionProfileRecord({
        utilisedAreaHa: 158788,
        arableHa: 151449,
        grasslandHa: 694,
        topFruits: [{ name: 'кайсиите', areaHa: 2151 }],
      }),
    );
    const summary = ui.regions.profile.summary(silistra, { rank: 16, total: 28 });
    expect(summary).toContain('шестнадесета по големина');
    expect(summary).toContain('Обработваемата земя е 95% от нея');
    expect(summary).toContain('постоянно затревените площи – под 1%.');
    expect(summary).toContain(
      `От основните овощни видове, изследвани от МЗХ, най-голяма площ заемат кайсиите (2${NBSP}151 ха) – 2023 г., предварителни данни.`,
    );
  });

  it('AC10: has the section heading', () => {
    expect(ui.regions.profile.heading).toBe('Земеделие в областта');
  });

  it.each(PROVINCES.map((region) => [region.name, region] as const))(
    'AC11: %s has a 70–160 character description without produce and farms',
    (_name, region) => {
      const description = ui.regions.pageDescription(region.name, 0, 0, region.profile);
      expect(length(description)).toBeGreaterThanOrEqual(70);
      expect(length(description)).toBeLessThanOrEqual(160);
      expect(description).toContain('земеделска площ');
      expect(description).toContain(
        `${new Intl.NumberFormat('bg').format(region.profile?.utilisedAreaHa ?? 0)} ха`,
      );
    },
  );

  it('AC11: keeps the „във“ and „Софийска област“ rules', () => {
    expect(ui.regions.pageDescription('Видин', 0, 0, plovdiv)).toMatch(/^Във Видин /);
    expect(ui.regions.pageDescription('Смолян', 0, 0, noFruits())).toMatch(/^В Смолян /);
    expect(ui.regions.pageDescription('Софийска', 0, 0, plovdiv)).toMatch(/^В Софийска област /);
  });

  it('AC11: keeps the spec 029 descriptions when the page lists produce or farms', () => {
    expect(ui.regions.pageDescription('Пловдив', 12, 0, plovdiv)).toBe(
      ui.regions.pageDescription('Пловдив', 12, 0),
    );
  });

  it('AC11: throws without produce, farms or profile', () => {
    expect(() => ui.regions.pageDescription('Смолян', 0, 0)).toThrow(InvalidPageMetaError);
  });
});

describe('province profile texts, QA (spec 038)', () => {
  it('AC10: leaves out the fruit sentence when the profile has no top fruits', () => {
    const summary = ui.regions.profile.summary(noFruits(), { rank: 28, total: 28 });
    expect(summary).toMatch(/постоянно затревените площи – 92%\.$/);
    expect(summary).not.toContain('овощни');
  });

  it('AC11: names the main fruit species studied by МЗХ only when the profile has top fruits', () => {
    expect(ui.regions.pageDescription('Пловдив', 0, 0, plovdiv)).toContain(
      'кои от основните овощни видове заемат най-голяма площ',
    );
    const smolyan = ui.regions.pageDescription('Смолян', 0, 0, noFruits());
    expect(smolyan).not.toContain('овощни');
    expect(length(smolyan)).toBeGreaterThanOrEqual(70);
  });

  it('AC16: renders the survey years from the data', () => {
    const later = RegionProfile.create(regionProfileRecord({ areaYear: 2026, orchardYear: 2024 }));
    const summary = ui.regions.profile.summary(later, { rank: 1, total: 28 });
    expect(summary).toContain('(2026 г.)');
    expect(summary).toContain('– 2024 г., предварителни данни.');
    expect(ui.regions.pageDescription('Пловдив', 0, 0, later)).toContain('(2026 г.)');
  });

  it('AC13: the overview label shows counts, else the utilised area, else „no data“', () => {
    expect(ui.regions.overviewLabel({ produceCount: 3, farmCount: 1, profile: plovdiv })).toBe(
      '3 продукта · 1 ферма',
    );
    expect(ui.regions.overviewLabel({ produceCount: 0, farmCount: 0, profile: noFruits() })).toBe(
      `34${NBSP}777 ха земеделска площ`,
    );
    expect(ui.regions.overviewLabel({ produceCount: 0, farmCount: 0, profile: undefined })).toBe(
      'Още няма данни',
    );
  });

  it('AC17: a page with only a profile gets an intro that promises no produce or farms', () => {
    expect(ui.regions.pageIntro(0, 0)).toBe('Земеделието в областта според статистиката на МЗХ.');
    expect(ui.regions.pageIntro(2, 0)).toBe('Какво расте тук и кои местни ферми има в областта.');
    expect(ui.regions.pageIntro(0, 1)).toBe(ui.regions.pageIntro(2, 0));
  });

  it('AC18: the map captions no longer speak of provinces without a page', () => {
    expect(ui.regions.mapCaption).not.toContain('щрихи');
    expect(ui.regions.mapCaptionFor('Софийска')).toContain('Софийска област');
    expect(ui.regions.mapCaptionFor('Пловдив')).not.toContain('тънки щрихи');
  });

  it('AC18: the map name lists no provinces when all are marked', () => {
    const names = PROVINCES.map((region) => region.name);
    expect(ui.produce.map.label(names, names.length)).toBe(
      'Карта на България. Отбелязани са всички 28 области.',
    );
    expect(ui.produce.map.label(['Пловдив'], names.length)).toBe(
      'Карта на България. Отбелязани области: Пловдив',
    );
  });
});
