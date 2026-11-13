import { readdirSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { ComponentSchema } from '@keystatic/core';
import { createReader } from '@keystatic/core/reader';
import { describe, expect, it } from 'vitest';
import keystaticConfig, {
  DATA_DIRECTORY as KEYSTATIC_DATA_DIRECTORY,
  slugOf,
} from '../../../keystatic.config';
import { collections, DATA_DIRECTORY, ENTRY_FILE_PATTERN } from '../../../src/content.config';
import { Slug } from '@shared/domain';
import { ZOD_SCHEMAS } from '@tests/fixtures/keystatic';

const COLLECTION_NAMES = Object.keys(collections).sort();
const KEYSTATIC = keystaticConfig.collections;
const ENTRY_EXTENSION = '.yaml';

/** The parts of a Zod schema node needed to walk its keys. */
interface ZodNode {
  readonly def: {
    readonly type: string;
    readonly innerType?: ZodNode;
    readonly in?: ZodNode;
    readonly element?: ZodNode;
    readonly shape?: Readonly<Record<string, ZodNode>>;
  };
}

/** Removes optional, default and transform wrappers. */
function unwrap(node: ZodNode): ZodNode {
  const inner = node.def.innerType ?? node.def.in;
  return inner === undefined ? node : unwrap(inner);
}

/**
 * Lists every key path where the Keystatic schema and the Zod schema disagree, walking editable
 * objects and array items. Form fields (including `fields.ignored`) stop the walk.
 */
function keyMismatches(field: ComponentSchema, zod: ZodNode, path: string): string[] {
  const node = unwrap(zod);
  if (field.kind === 'object') {
    return objectMismatches(field.fields, node, path);
  }
  if (field.kind === 'array') {
    const element = node.def.element;
    return element === undefined
      ? [`${path}: not an array in Zod`]
      : keyMismatches(field.element, element, `${path}[]`);
  }
  return [];
}

function objectMismatches(
  fields: Readonly<Record<string, ComponentSchema>>,
  zod: ZodNode,
  path: string,
): string[] {
  const shape = unwrap(zod).def.shape;
  if (shape === undefined) {
    return [`${path}: not an object in Zod`];
  }
  const missing = Object.keys(shape)
    .filter((key) => !(key in fields))
    .map((key) => `${path}.${key}: no Keystatic field`);
  const extra = Object.keys(fields)
    .filter((key) => !(key in shape))
    .map((key) => `${path}.${key}: not in the Zod schema`);
  const nested = Object.entries(fields).flatMap(([key, field]) => {
    const child = shape[key];
    return child === undefined ? [] : keyMismatches(field, child, `${path}.${key}`);
  });
  return [...missing, ...extra, ...nested];
}

const entryIdsIn = (name: string) =>
  readdirSync(join(process.cwd(), DATA_DIRECTORY, name))
    .filter((file) => file.endsWith(ENTRY_EXTENSION))
    .map((file) => basename(file, ENTRY_EXTENSION))
    .sort();

describe('Keystatic config mirrors the content collections (spec 054)', () => {
  it('AC1: defines exactly one Keystatic collection per content collection', () => {
    expect(Object.keys(KEYSTATIC).sort()).toEqual(COLLECTION_NAMES);
  });

  it('AC2: stores each collection in the folder and file pattern its content collection reads', () => {
    expect(KEYSTATIC_DATA_DIRECTORY).toBe(DATA_DIRECTORY);
    expect(ENTRY_FILE_PATTERN).toBe(`*${ENTRY_EXTENSION}`);
    for (const name of COLLECTION_NAMES) {
      const collection = KEYSTATIC[name as keyof typeof KEYSTATIC];
      expect(collection.path, name).toBe(`${DATA_DIRECTORY}/${name}/*`);
      expect(collection.format, name).toEqual({ data: 'yaml' });
    }
  });

  it('AC2: Keystatic lists exactly the YAML files of each collection folder', async () => {
    const reader = createReader(process.cwd(), keystaticConfig);
    for (const name of COLLECTION_NAMES) {
      const slugs = await reader.collections[name as keyof typeof KEYSTATIC].list();
      expect([...slugs].sort(), name).toEqual(entryIdsIn(name));
    }
  });

  it('AC3: has a field for every key of each Zod schema and no other key', () => {
    for (const name of COLLECTION_NAMES) {
      const schema = ZOD_SCHEMAS[name];
      expect(schema, name).toBeDefined();
      const collection = KEYSTATIC[name as keyof typeof KEYSTATIC];
      expect(objectMismatches(collection.schema, schema as unknown as ZodNode, name)).toEqual([]);
    }
  });

  it('AC4: uses the name (the title for recipes) as the slug field', () => {
    const slugFields = Object.fromEntries(
      COLLECTION_NAMES.map((name) => [name, KEYSTATIC[name as keyof typeof KEYSTATIC].slugField]),
    );
    expect(slugFields).toEqual({
      farms: 'name',
      groups: 'name',
      nutrients: 'name',
      produce: 'name',
      recipes: 'title',
      regions: 'name',
      sponsors: 'name',
    });
  });

  it('AC4: proposes the Bulgarian transliteration as the slug, or nothing without letters', () => {
    expect(slugOf('Зелен фасул')).toBe('zelen-fasul');
    expect(slugOf('Стара Загора')).toBe(Slug.fromBulgarian('Стара Загора').value);
    expect(slugOf('')).toBe('');
    expect(slugOf(' – ')).toBe('');
  });
});
