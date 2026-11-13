import { dump } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import keystaticConfig from '../../../keystatic.config';
import { parseAstroYaml, saveThroughKeystatic, ZOD_SCHEMAS } from '@tests/fixtures/keystatic';
import { MINIMAL_PRODUCE_INPUT, WILD_PRODUCE_INPUT } from '@tests/fixtures/records';

const PRODUCE = keystaticConfig.collections.produce;
const KINDS = ['look-alike', 'toxic-part', 'allergy', 'protected', 'preparation'];

/** The parts of Keystatic fields this test reads. */
interface FieldInternals {
  readonly kind: string;
  readonly element?: FieldInternals;
  readonly fields?: Readonly<Record<string, FieldInternals>>;
  readonly options?: ReadonlyArray<{ readonly value: string }>;
  defaultValue?(): unknown;
}

const field = (name: string) =>
  (PRODUCE.schema as unknown as Record<string, FieldInternals | undefined>)[name];
const zodParse = (value: unknown) => ZOD_SCHEMAS.produce?.parse(value);
const save = (slug: string, input: unknown) =>
  parseAstroYaml(saveThroughKeystatic(PRODUCE.schema, PRODUCE.slugField, slug, dump(input)));

describe('Keystatic wild and cautions fields (spec 055)', () => {
  it('AC17: has a wild checkbox that defaults to false', () => {
    const wild = field('wild');
    expect(wild?.kind).toBe('form');
    expect(wild?.defaultValue?.()).toBe(false);
  });

  it('AC17: has an editable cautions list with the caution kinds, a text and a source', () => {
    const cautions = field('cautions');
    expect(cautions?.kind).toBe('array');
    const item = cautions?.element;
    expect(item?.kind).toBe('object');
    expect(Object.keys(item?.fields ?? {}).sort()).toEqual(['kind', 'source', 'text']);
    expect(item?.fields?.kind?.options?.map((option) => option.value)).toEqual(KINDS);
    expect(Object.keys(item?.fields?.source?.fields ?? {}).sort()).toEqual(['name', 'url']);
  });

  it('AC17: saves a wild produce with cautions without changing its entry', () => {
    expect(zodParse(save('gluharche', WILD_PRODUCE_INPUT))).toEqual(zodParse(WILD_PRODUCE_INPUT));
  });

  it('AC17: saves a produce without the keys as not wild, without cautions', () => {
    expect(zodParse(save('hryan', MINIMAL_PRODUCE_INPUT))).toEqual(zodParse(MINIMAL_PRODUCE_INPUT));
  });
});
