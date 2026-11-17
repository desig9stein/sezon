import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ui } from '@i18n/bg';
import { readSeedCollection } from '@tests/fixtures/seedData';

interface Caution {
  readonly kind: string;
  readonly text: string;
  readonly source: { readonly url: string };
}

interface ProduceRecord {
  readonly cautions?: ReadonlyArray<Caution>;
  readonly growing?: { readonly sources: ReadonlyArray<{ readonly url: string }> };
}

const produce = new Map(
  readSeedCollection('produce').map(({ id, data }) => [id, data as ProduceRecord]),
);
const cautionsOf = (id: string) => produce.get(id)?.cautions ?? [];
const GUIDE = readFileSync('docs/CONTENT-GUIDE.md', 'utf8').replace(/\s+/g, ' ');
const SPEC = readFileSync('docs/specs/061-round2-content.md', 'utf8');
const EDITORIAL_HOSTS = /^(www\.)?(bgfermer\.bg|agrozona\.bg)$/;

describe('QA findings for spec 061', () => {
  it('QA 061: the guide accepts a university extension only after the recorded search, before the press', () => {
    expect(GUIDE).toContain(
      'A university extension publication (a `.edu` extension service) is accepted only after the spec records the PubMed and poison-centre search',
    );
    expect(GUIDE.indexOf('A university extension publication')).toBeLessThan(
      GUIDE.indexOf('An editorial Bulgarian farming article'),
    );
  });

  it('QA 061: the purslane caution names the genus and a milky sap, not a white one', () => {
    const spurge = cautionsOf('tuchenitsa').find(({ kind }) => kind === 'look-alike');
    expect(spurge?.text).toContain('стелещите се млечки (Euphorbia)');
    expect(spurge?.text).toContain('млечен сок');
    expect(spurge?.text).not.toMatch(/бял/);
  });

  it('QA 061: the бъзак caution says only that the plant is poisonous', () => {
    const poisonous = cautionsOf('cheren-baz').find(({ text }) => text.includes('отровно'));
    expect(poisonous?.text).toBe('Бъзакът (Sambucus ebulus) е отровно растение.');
  });

  it('QA 061: the altitude note tells the reader to check the altitude of the place', () => {
    expect(ui.recipes.altitudeTowns.note).toContain('провери надморската височина на мястото');
  });

  it('QA 061: the spanning-town sentence chains no colons', () => {
    const sentence = ui.recipes.altitudeTowns.spanning('Смолян', '700–999 м', [
      ui.recipes.altitudeTowns.bandShort('300–900 м', 30),
      ui.recipes.altitudeTowns.bandShort('900–1800 м', 35),
    ]);
    expect(sentence).not.toContain(':');
    expect(sentence).toContain('300–900 м (30 мин)');
  });

  it('QA 061: the empty ranking says no produce reaches the 15 % threshold', () => {
    expect(ui.nutrients.empty('Фолат')).toContain('15 %');
    expect('noClaim' in ui.nutrients).toBe(false);
  });

  it('QA 061: leek cites editorial farming articles for its growing guide, not Wikipedia', () => {
    const urls = produce.get('praz')?.growing?.sources.map(({ url }) => url) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(new URL(url).hostname).toMatch(EDITORIAL_HOSTS);
  });

  it('QA 061: the spec cites Български фермер 9230195 for celery', () => {
    const celeryRow = SPEC.split('\n').find((line) => line.startsWith('| `tselina`'));
    expect(celeryRow).toContain('9230195');
    expect(celeryRow).not.toContain('9670112');
  });
});
