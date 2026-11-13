import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { RegionProfile } from '@contexts/geography';
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

const CSV = readFileSync(
  join(process.cwd(), 'tests', 'fixtures', 'regions', 'province-profile-2025.csv'),
  'utf8',
)
  .trim()
  .split('\n');
const HEADER = CSV[0]?.split(',') ?? [];
const AREAS = new Map(
  CSV.slice(1).map((line) => {
    const cells = line.split(',');
    return [
      cells[HEADER.indexOf('slug')] ?? '',
      Number(cells[HEADER.indexOf('uaa_2025_ha')]),
    ] as const;
  }),
);
const PROVINCES = [...AREAS.keys()].map((slug) => {
  const { name } = parse(
    readFileSync(join(process.cwd(), 'src', 'data', 'regions', `${slug}.yaml`), 'utf8'),
  ) as { name: string };
  return { slug, name, area: AREAS.get(slug) ?? 0 };
});

describe('province profile texts (spec 038)', () => {
  it.each(ORDINALS.map((word, index) => [index + 1, word] as const))(
    'AC9: rank %i is „%s“',
    (rank, word) => {
      expect(feminineOrdinal(rank)).toBe(word);
    },
  );

  it('AC10: builds the Plovdiv sentences from the figures', () => {
    const summary = ui.regions.profile.summary(RegionProfile.create(regionProfileRecord()), {
      rank: 5,
      total: 28,
    });
    expect(summary).toBe(
      `Използваната земеделска площ е 257${NBSP}175 ха (2025 г.) – пета по големина сред 28-те области. ` +
        'Обработваемата земя е 76% от нея, а постоянните пасища и ливади – 18%. ' +
        `С най-голяма площ от овощните видове са черешите (1${NBSP}676 ха) и сливите (1${NBSP}551 ха, 2023 г.).`,
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
    expect(summary).toContain('постоянните пасища и ливади – под 1%.');
    expect(summary).toContain(
      `С най-голяма площ от овощните видове са кайсиите (2${NBSP}151 ха, 2023 г.).`,
    );
  });

  it('AC10: has the section heading', () => {
    expect(ui.regions.profile.heading).toBe('Земеделие в областта');
  });

  it.each(PROVINCES)(
    'AC11: $name has a 70–160 character description without produce and farms',
    ({ name, area }) => {
      const description = ui.regions.pageDescription(name, 0, 0, area);
      expect(length(description)).toBeGreaterThanOrEqual(70);
      expect(length(description)).toBeLessThanOrEqual(160);
      expect(description).toContain('земеделска площ');
      expect(description).toContain(`${new Intl.NumberFormat('bg').format(area)} ха`);
    },
  );

  it('AC11: keeps the „във“ and „Софийска област“ rules', () => {
    expect(ui.regions.pageDescription('Видин', 0, 0, 124382)).toMatch(/^Във Видин /);
    expect(ui.regions.pageDescription('Смолян', 0, 0, 34777)).toMatch(/^В Смолян /);
    expect(ui.regions.pageDescription('Софийска', 0, 0, 196278)).toMatch(/^В Софийска област /);
  });

  it('AC11: keeps the spec 029 descriptions when the page lists produce or farms', () => {
    expect(ui.regions.pageDescription('Пловдив', 12, 0, 257175)).toBe(
      ui.regions.pageDescription('Пловдив', 12, 0),
    );
  });

  it('AC11: throws without produce, farms or utilised area', () => {
    expect(() => ui.regions.pageDescription('Смолян', 0, 0)).toThrow(InvalidPageMetaError);
  });

  it('AC13: the overview shows the utilised area for a province without produce and farms', () => {
    expect(ui.regions.areaOnly(34777)).toBe(`34${NBSP}777 ха земеделска площ`);
  });
});
