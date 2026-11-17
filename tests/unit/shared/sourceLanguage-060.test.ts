import { describe, expect, it } from 'vitest';
import keystaticConfig from '../../../keystatic.config';
import { sourceSchema } from '@shared/infrastructure/schemaPrimitives';

const SOURCE = { name: 'USDA FoodData Central', url: 'https://fdc.nal.usda.gov/' };

/** The parts of a Keystatic select field these checks call. */
interface SelectInternals {
  readonly options: ReadonlyArray<{ readonly value: string }>;
  parse(value: unknown): unknown;
  serialize(value: unknown): { readonly value: unknown };
}

interface ObjectField {
  readonly fields: Readonly<Record<string, unknown>>;
}

const recipeSources = keystaticConfig.collections.recipes.schema.sources as unknown as {
  readonly element: ObjectField;
};
const langField = recipeSources.element.fields.lang as SelectInternals | undefined;

describe('source language (spec 060)', () => {
  it('AC2: the source schema accepts en, bg or no language', () => {
    expect(sourceSchema.safeParse({ ...SOURCE, lang: 'en' }).success).toBe(true);
    expect(sourceSchema.safeParse({ ...SOURCE, lang: 'bg' }).success).toBe(true);
    expect(sourceSchema.parse(SOURCE)).toEqual(SOURCE);
  });

  it('AC2: the source schema rejects any other language', () => {
    expect(sourceSchema.safeParse({ ...SOURCE, lang: 'de' }).success).toBe(false);
  });

  it('AC2: Keystatic edits the language as a bg/en select', () => {
    expect(langField?.options.map((option) => option.value)).toEqual(['bg', 'en']);
    expect(langField?.parse(undefined)).toBe('bg');
  });

  it('AC2: Keystatic leaves bg out of the file and keeps en', () => {
    expect(langField?.serialize('bg').value).toBeUndefined();
    expect(langField?.serialize('en').value).toBe('en');
  });
});
