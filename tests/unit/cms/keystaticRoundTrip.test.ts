import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { ComponentSchema } from '@keystatic/core';
import { createReader } from '@keystatic/core/reader';
import { dump } from 'js-yaml';
import { describe, expect, it } from 'vitest';
import keystaticConfig from '../../../keystatic.config';
import { collections } from '../../../src/content.config';
import {
  parseAstroYaml,
  saveThroughKeystatic,
  withoutEmptyValues,
  ZOD_SCHEMAS,
} from '@tests/fixtures/keystatic';
import { MINIMAL_PRODUCE_INPUT } from '@tests/fixtures/records';

const DATA = join(process.cwd(), 'src', 'data');
const KEYSTATIC = keystaticConfig.collections;
type CollectionName = keyof typeof KEYSTATIC;
const COLLECTION_NAMES = Object.keys(collections).sort() as CollectionName[];

/** Every entry of every collection: collection name, id and YAML source. */
const ENTRIES = COLLECTION_NAMES.flatMap((name) =>
  readdirSync(join(DATA, name))
    .filter((file) => file.endsWith('.yaml'))
    .sort()
    .map((file) => ({
      name,
      id: basename(file, '.yaml'),
      source: readFileSync(join(DATA, name, file), 'utf8'),
    })),
);

const zodParse = (name: CollectionName, value: unknown): unknown => {
  const schema = ZOD_SCHEMAS[name];
  if (schema === undefined) {
    throw new Error(`No Zod schema for ${name}`);
  }
  return schema.parse(value);
};

const saved = (name: CollectionName, id: string, source: string) =>
  saveThroughKeystatic(KEYSTATIC[name].schema, KEYSTATIC[name].slugField, id, source);

/** The parts of Keystatic fields needed to tell whether a field must be filled in. */
interface FieldInternals {
  readonly kind: string;
  readonly options?: unknown;
  readonly validation?: { readonly length?: { readonly min?: number } };
  defaultValue?(): unknown;
  validate?(value: unknown): unknown;
}

/**
 * Returns whether Keystatic always writes the field: a select or an object, a list with a minimum
 * length, or a form field whose empty value fails validation.
 */
function isRequired(field: ComponentSchema): boolean {
  const internals = field as unknown as FieldInternals;
  if (internals.kind === 'object' || internals.options !== undefined) {
    return true;
  }
  if (internals.kind === 'array') {
    return (internals.validation?.length?.min ?? 0) > 0;
  }
  try {
    internals.validate?.(internals.defaultValue?.());
    return false;
  } catch {
    return true;
  }
}

describe('Keystatic reads and saves the content without changing it (spec 054)', () => {
  it('AC5: every entry read with the Keystatic reader parses to the same Zod entry', async () => {
    expect(ENTRIES.length).toBeGreaterThan(0);
    const reader = createReader(process.cwd(), keystaticConfig);
    for (const { name, id, source } of ENTRIES) {
      const entry = await reader.collections[name].readOrThrow(id);
      expect(zodParse(name, withoutEmptyValues(entry)), `${name}/${id}`).toEqual(
        zodParse(name, parseAstroYaml(source)),
      );
    }
  });

  it('AC6: every entry saved through Keystatic parses to the same Zod entry', () => {
    for (const { name, id, source } of ENTRIES) {
      expect(zodParse(name, parseAstroYaml(saved(name, id, source))), `${name}/${id}`).toEqual(
        zodParse(name, parseAstroYaml(source)),
      );
    }
  });

  it('AC6: saving twice gives the same file as saving once', () => {
    for (const { name, id, source } of ENTRIES) {
      const once = saved(name, id, source);
      expect(saved(name, id, once), `${name}/${id}`).toBe(once);
    }
  });

  it('AC7: a minimal produce stays valid and gains no optional block when saved', () => {
    const output = parseAstroYaml(saved('produce', 'hryan', dump(MINIMAL_PRODUCE_INPUT))) as Record<
      string,
      unknown
    >;
    expect(zodParse('produce', output)).toEqual(zodParse('produce', MINIMAL_PRODUCE_INPUT));
    for (const block of ['nutrition', 'photo', 'growing', 'organic', 'latinName', 'storage']) {
      expect(output, block).not.toHaveProperty(block);
    }
  });

  it('AC7: requires exactly the fields the Zod schemas require', () => {
    const required = (name: CollectionName) =>
      Object.entries(KEYSTATIC[name].schema)
        .filter(([, field]) => isRequired(field))
        .map(([key]) => key)
        .sort();
    expect(required('produce')).toEqual(
      ['group', 'kind', 'name', 'season', 'summary', 'updatedAt'].sort(),
    );
    expect(required('farms')).toEqual(
      ['contact', 'description', 'name', 'produce', 'region', 'sources'].sort(),
    );
    expect(required('recipes')).toEqual(
      [
        'category',
        'ingredients',
        'processingMinutes',
        'produce',
        'publishedAt',
        'safety',
        'sources',
        'steps',
        'summary',
        'title',
        'updatedAt',
        'yield',
      ].sort(),
    );
    expect(required('sponsors')).toEqual(
      ['alt', 'from', 'image', 'name', 'placement', 'to', 'url'].sort(),
    );
  });
});
