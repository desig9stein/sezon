import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { farmSchema, type FarmRecord } from '@contexts/farms/infrastructure/schemas';
import { Slug } from '@shared/domain/Slug';
import { readSeedCollection } from '@tests/fixtures/seedData';

const FARMS_DIR = join(process.cwd(), 'src', 'data', 'farms');
const MIN_FARMS = 49;
const MIN_PROVINCES = 20;

/** The 39 farms added by spec 051, by id. */
const NEW_FARMS = [
  'vkusnagradina',
  'ferma-biotiful',
  'lyuta-ferma-hot-farm',
  'vantana',
  'vega-fruits',
  'biostopanstvo-komoss',
  'stopanstvo-gabrovski',
  'zizu-peppers',
  'ferma-besika',
  'ferma-teta-ruma',
  'zp-ivan-terziev',
  'oranzherii-paskalev',
  'gradinata-na-gosho',
  'zelenchukovo-sakrovishte-gradina-mihovi',
  'bio-ferma-pokrayna',
  'papiagro',
  'chista-hrana-ot-ranchoto',
  'zelenchutsite-ot-nashata-gradina',
  'ferma-ranchoto',
  'fermerska-koshnitsa',
  'balgarska-domashna-yagoda',
  'ferma-demar',
  'domashna-ferma-ivanovi',
  'ferma-nedevi',
  'gradina-dzhumerski',
  'fermata-na-kris-i-maria',
  'yadkova-gradina-orle',
  'pura-vida-organic-farm',
  'bio-gradinka-kalinka',
  'hrana-za-badeshte',
  'ferma-krumovi',
  'our-garden',
  'biotikva-eood',
  'ot-gradinata-ni',
  'lyubimata-ni-ferma',
  'gradini-devar',
  'zp-snezhana-kotseva',
  'oranzherii-samovodene',
  'petra-dolinata-na-praskovite',
] as const;

/** Farms that state a certification the site has not verified (spec 051, AC8). */
const SELF_CLAIMED_CERTIFICATION = [
  'biostopanstvo-komoss',
  'bio-ferma-pokrayna',
  'zp-snezhana-kotseva',
  'gradini-devar',
] as const;

/** Words of a certification or organic claim. */
const CERTIFICATION_CLAIM = /сертифиц|биологич/u;
const FARM_STATEMENT = 'По данни на фермата';
const SENTENCE_END = /(?<=\.)\s+/u;

const LOCALSTORE = 'localstore.bg';
const DIRECTORY_HOSTS = new Set([LOCALSTORE, 'coop.hrankoop.com']);
const BANNED_HOST = /(^|\.)gradinata\.bg$/;
const VKUSNAGRADINA_ORGANIC = {
  certifier: 'COSMOCERT (BG-BIO-18)',
  certificateId: 'BG-BIO-18.100-0004936.2026.001',
  validUntil: new Date('2027-07-20'),
};
const TRACES_CERTIFICATE =
  'https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/BG-BIO-18.100-0004936.2026.001.pdf';

const farms = new Map<string, FarmRecord>(
  readSeedCollection('farms').map(({ id, data }) => [id, farmSchema.parse(data)]),
);
const produceIds = new Set(readSeedCollection('produce').map(({ id }) => id));
const regionIds = new Set(readSeedCollection('regions').map(({ id }) => id));
const hostOf = (url: string) => new URL(url).hostname.replace(/^www\./, '');

/** Returns the farm with the given id, failing the test when it is missing. */
function farm(id: string): FarmRecord {
  const record = farms.get(id);
  if (record === undefined) throw new Error(`Missing farm "${id}".`);
  return record;
}

describe('more farms (spec 051)', () => {
  it('AC1: adds the 39 farms, at least 49 farms in at least 20 provinces', () => {
    expect(NEW_FARMS.filter((id) => !farms.has(id))).toEqual([]);
    expect(farms.size).toBeGreaterThanOrEqual(MIN_FARMS);
    const provinces = new Set([...farms.values()].map(({ region }) => region));
    expect(provinces.size).toBeGreaterThanOrEqual(MIN_PROVINCES);
  });

  it('AC2: every farm cites https sources and nothing from gradinata.bg', () => {
    for (const [id, record] of farms) {
      expect(record.sources.length, id).toBeGreaterThan(0);
      for (const url of record.sources) {
        expect(url, id).toMatch(/^https:\/\//);
        expect(BANNED_HOST.test(hostOf(url)), `${id}: ${url}`).toBe(false);
      }
      const website = record.contact.website;
      if (website !== undefined) expect(BANNED_HOST.test(hostOf(website)), id).toBe(false);
    }
  });

  it('AC3: no farm file contains a masked phone number', () => {
    const masked = readdirSync(FARMS_DIR)
      .filter((file) => file.endsWith('.yaml'))
      .filter((file) => readFileSync(join(FARMS_DIR, file), 'utf8').includes('*'));
    expect(masked).toEqual([]);
  });

  it('AC4: every new farm has an existing region, existing produce and a slug id', () => {
    for (const id of NEW_FARMS) {
      const record = farm(id);
      expect(regionIds.has(record.region), `${id}: ${record.region}`).toBe(true);
      expect(
        record.produce.filter((slug) => !produceIds.has(slug)),
        id,
      ).toEqual([]);
      expect(Slug.fromBulgarian(record.name).value, id).toBe(id);
    }
  });

  it('AC5: a farm sourced only from LocalStore.bg says so and links its profile', () => {
    const localStoreOnly = NEW_FARMS.filter((id) =>
      farm(id).sources.every((url) => hostOf(url) === LOCALSTORE),
    );
    expect(localStoreOnly.length).toBeGreaterThan(0);
    for (const id of localStoreOnly) {
      const record = farm(id);
      expect(record.description, id).toContain('По данни на LocalStore.bg');
      expect(record.contact.phone, id).toBeUndefined();
      expect(record.contact.email, id).toBeUndefined();
      expect(record.sources, id).toContain(record.contact.website);
    }
  });

  it('AC6: a farm sourced only from directories publishes no phone or e-mail', () => {
    const directoryOnly = NEW_FARMS.filter((id) =>
      farm(id).sources.every((url) => DIRECTORY_HOSTS.has(hostOf(url))),
    );
    expect(directoryOnly.length).toBeGreaterThan(0);
    for (const id of directoryOnly) {
      const record = farm(id);
      expect(record.contact.phone, id).toBeUndefined();
      expect(record.contact.email, id).toBeUndefined();
      expect(record.sources, id).toContain(record.contact.website);
    }
  });

  it('AC7: only ВКУСнаГРАДИНА has an organic block, from its TRACES certificate', () => {
    const organic = [...farms].filter(([, record]) => record.organic !== undefined);
    expect(organic.map(([id]) => id)).toEqual(['vkusnagradina']);
    const record = farm('vkusnagradina');
    expect(record.organic).toEqual(VKUSNAGRADINA_ORGANIC);
    expect(record.sources).toContain(TRACES_CERTIFICATE);
  });

  it('AC8: an unverified certification is worded as the farm’s own statement', () => {
    for (const id of SELF_CLAIMED_CERTIFICATION) {
      const claims = farm(id)
        .description.split(SENTENCE_END)
        .filter((sentence) => CERTIFICATION_CLAIM.test(sentence));
      expect(claims.length, id).toBeGreaterThan(0);
      for (const sentence of claims) {
        const statement = sentence.indexOf(FARM_STATEMENT);
        expect(statement, `${id}: ${sentence}`).toBeGreaterThanOrEqual(0);
        expect(statement, `${id}: ${sentence}`).toBeLessThan(sentence.search(CERTIFICATION_CLAIM));
      }
    }
  });
});

describe('more farms, QA findings (spec 051)', () => {
  it('QA2: no farm rests only on dried fruit (Calladan dropped, Комосс without plums)', () => {
    expect(farms.has('calladan')).toBe(false);
    expect(farm('biostopanstvo-komoss').produce).not.toContain('slivi');
  });

  it('QA3: the Hot Farm description does not mention pickles', () => {
    expect(farm('lyuta-ferma-hot-farm').description).not.toContain('туршии');
  });

  it('QA4: ЗП Снежана Коцева is described as the source words it', () => {
    const description = farm('zp-snezhana-kotseva').description;
    expect(description).toContain('стопанство от 5 декара');
    expect(description).toContain('регистрирано за ябълки и други трайни насаждения');
    expect(description).not.toContain('ябълкова градина');
  });

  it('QA7: Ферма „Бесика“ has the address Хранкооп states', () => {
    expect(farm('ferma-besika').address).toBe('с. Бяга, обл. Пазарджик');
  });
});
