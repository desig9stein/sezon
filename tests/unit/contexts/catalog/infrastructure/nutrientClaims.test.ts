import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { nutrientSchema } from '@contexts/catalog/infrastructure/schemas';
import { NUTRIENT_CLAIMS } from '@tests/fixtures/records';

/**
 * Authorised claims used by the seed nutrients, copied verbatim from the Bulgarian text of
 * Regulation (EU) No 432/2012 (EUR-Lex CELEX 32012R0432), without the final full stop.
 */
const AUTHORISED_CLAIMS = new Set([
  'Витамин С допринася за нормалната функция на имунната система',
  'Витамин С допринася за нормалното образуване на колаген за нормалната функция на кожата',
  'Витамин К допринася за нормалното кръвосъсирване',
  'Витамин K допринася за поддържането на нормалното състояние на костите',
  'Фолатът допринася за нормалното кръвообразуване',
  'Фолатът допринася за нормалната функция на имунната система',
  'Калият допринася за нормалното функциониране на нервната система',
  'Калият допринася за поддържането на нормално кръвно налягане',
  'Желязото допринася за нормалното образуване на червени кръвни телца и хемоглобин',
  'Желязото допринася за нормалния пренос на кислород в тялото',
  'Магнезият допринася за намаляването на чувството на отпадналост и умора',
  'Магнезият допринася за нормалната функция на мускулите',
  'Манганът допринася за защитата на клетките от оксидативен стрес',
  'Манганът допринася за нормалното образуване на съединителна тъкан',
  'Медта допринася за нормалния пренос на желязо в организма',
  'Фосфорът допринася за поддържането на нормалното състояние на костите',
  'Фосфорът допринася за поддържането на нормалното състояние на зъбите',
  'Витамин А допринася за поддържането на нормалното зрение',
  'Витамин А допринася за поддържането на нормалното състояние на кожата',
]);

const DATA_DIR = join(process.cwd(), 'src', 'data', 'nutrients');
const seeds = readdirSync(DATA_DIR)
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => ({ file, record: parse(readFileSync(join(DATA_DIR, file), 'utf8')) as unknown }));

const base = { name: 'Витамин C', kind: 'vitamin', unit: 'mg', referenceIntake: 80 };

describe('nutrient claims', () => {
  it('AC4: requires claims and their source, accepts a note and rejects description', () => {
    expect(nutrientSchema.safeParse({ ...base, ...NUTRIENT_CLAIMS }).success).toBe(true);
    expect(
      nutrientSchema.safeParse({ ...base, ...NUTRIENT_CLAIMS, note: 'Бележка.' }).success,
    ).toBe(true);
    expect(nutrientSchema.safeParse({ ...base, ...NUTRIENT_CLAIMS, claims: [] }).success).toBe(
      false,
    );
    expect(nutrientSchema.safeParse({ ...base, claims: NUTRIENT_CLAIMS.claims }).success).toBe(
      false,
    );
    expect(
      nutrientSchema.safeParse({ ...base, ...NUTRIENT_CLAIMS, description: 'Описание.' }).success,
    ).toBe(false);
    expect(
      nutrientSchema.safeParse({ ...base, ...NUTRIENT_CLAIMS, claims: ['Твърдение.'] }).success,
    ).toBe(false);
  });

  for (const { file, record } of seeds) {
    it(`AC4: ${file} is valid and uses only authorised claims verbatim`, () => {
      const parsed = nutrientSchema.parse(record);
      for (const claim of parsed.claims) expect(AUTHORISED_CLAIMS).toContain(claim);
      expect(parsed.claimsSource.url).toContain('CELEX:32012R0432');
    });
  }

  it('QA 011: no content uses „богат на“ (same meaning as „високо съдържание на“); source titles are quoted as published', () => {
    const dataRoot = join(process.cwd(), 'src', 'data');
    const sourceTitle =
      /^\s*-?\s*name: '[^']*(?:Agrozona\.bg|Български фермер|USDA|EFSA|МЗХ|Уикипедия)/;
    const ownText = (file: string): string =>
      readFileSync(join(dataRoot, file), 'utf8')
        .split('\n')
        .filter((line) => !sourceTitle.test(line))
        .join('\n');
    const offending = readdirSync(dataRoot, { recursive: true })
      .map(String)
      .filter((file) => file.endsWith('.yaml'))
      .filter((file) => /богат/i.test(ownText(file)));
    expect(offending).toEqual([]);
  });
});
