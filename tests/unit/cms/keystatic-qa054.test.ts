import { readdirSync, readFileSync } from 'node:fs';
import { basename, join } from 'node:path';
import type { ComponentSchema } from '@keystatic/core';
import type { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import * as keystaticModule from '../../../keystatic.config';
import { collections } from '../../../src/content.config';
import { PRODUCE_SUMMARY_MAX_LENGTH, PRODUCE_SUMMARY_MIN_LENGTH } from '@contexts/catalog';
import { DATA_DIRECTORY } from '@shared/infrastructure/contentFiles';
import {
  saveThroughKeystatic,
  unwrapZod,
  ZOD_SCHEMAS,
  type ZodNode,
} from '@tests/fixtures/keystatic';

const KEYSTATIC = keystaticModule.default.collections;
type CollectionName = keyof typeof KEYSTATIC;
const COLLECTION_NAMES = Object.keys(collections).sort() as CollectionName[];
const DATA = join(process.cwd(), DATA_DIRECTORY);
const ISO_TIME_OF_DAY = /T\d{2}:\d{2}:\d{2}/;

/** The parts of a Keystatic form field these checks call. */
interface FormInternals {
  readonly kind: string;
  parse(value: unknown, args?: object): unknown;
  validate(value: unknown): unknown;
  Input(props: object): { readonly props: Readonly<Record<string, unknown>> } | null;
}

/** Text that passes every single-line text rule of the schemas, including the use prefix. */
const ONE_LINE = `Традиционно се използва ${'а'.repeat(60)}`;
const TWO_LINES = `Традиционно се използва ${'а'.repeat(30)}\n${'а'.repeat(29)}`;

const accepts = (schema: ZodNode, value: unknown) =>
  (schema as unknown as z.ZodType).safeParse(value).success;

const keystaticAccepts = (field: FormInternals, value: unknown) => {
  try {
    field.validate(value);
    return true;
  } catch {
    return false;
  }
};

const isNumeric = (field: FormInternals) => {
  try {
    return field.parse(0) === 0 && field.Input({}) !== null;
  } catch {
    return false;
  }
};

/**
 * Lists the form fields whose Keystatic input accepts a value the Zod schema rejects: a multi-line
 * input for a single-line text, or a zero or negative number the schema does not allow.
 */
function looserFields(field: ComponentSchema, zod: ZodNode, path: string): string[] {
  const node = unwrapZod(zod);
  if (field.kind === 'object') {
    const shape = node.def.shape ?? {};
    return Object.entries(field.fields).flatMap(([key, child]) => {
      const childZod = shape[key];
      return childZod === undefined ? [] : looserFields(child, childZod, `${path}.${key}`);
    });
  }
  if (field.kind === 'array') {
    const element = node.def.element;
    return element === undefined ? [] : looserFields(field.element, element, `${path}[]`);
  }
  const form = field as unknown as FormInternals;
  const input = form.Input({});
  if (input !== null && 'multiline' in input.props) {
    const singleLineOnly = accepts(zod, ONE_LINE) && !accepts(zod, TWO_LINES);
    return singleLineOnly && input.props.multiline === true ? [`${path}: multiline`] : [];
  }
  if (isNumeric(form)) {
    return [0, -1]
      .filter((value) => keystaticAccepts(form, value) && !accepts(zod, value))
      .map((value) => `${path}: accepts ${value}`);
  }
  return [];
}

const ENTRIES = COLLECTION_NAMES.flatMap((name) =>
  readdirSync(join(DATA, name))
    .filter((file) => file.endsWith('.yaml'))
    .map((file) => ({
      name,
      id: basename(file, '.yaml'),
      source: readFileSync(join(DATA, name, file), 'utf8'),
    })),
);

const saved = (name: CollectionName, id: string, source: string) =>
  saveThroughKeystatic(KEYSTATIC[name].schema, KEYSTATIC[name].slugField, id, source);

describe('Keystatic QA findings (spec 054)', () => {
  it('QA 054: a date in a kept block is saved as a plain date', () => {
    const farm = ENTRIES.find((entry) => entry.id === 'vkusnagradina');
    expect(farm).toBeDefined();
    expect(saved('farms', 'vkusnagradina', farm!.source)).toMatch(/^ {2}validUntil: 2027-07-20$/m);
  });

  it('QA 054: no saved entry gains a time of day', () => {
    for (const { name, id, source } of ENTRIES) {
      expect(saved(name, id, source), `${name}/${id}`).not.toMatch(ISO_TIME_OF_DAY);
    }
  });

  it('QA 054: no form input accepts a value its Zod schema rejects', () => {
    const looser = COLLECTION_NAMES.flatMap((name) => {
      const schema = ZOD_SCHEMAS[name] as unknown as ZodNode;
      const shape = unwrapZod(schema).def.shape ?? {};
      return Object.entries(KEYSTATIC[name].schema).flatMap(([key, field]) => {
        const zod = shape[key];
        return zod === undefined ? [] : looserFields(field, zod, `${name}.${key}`);
      });
    });
    expect(looser).toEqual([]);
  });

  it('QA 054: the produce summary uses the catalog limits', () => {
    const summary = KEYSTATIC.produce.schema.summary as unknown as FormInternals;
    const text = (length: number) => 'а'.repeat(length);
    expect(keystaticAccepts(summary, text(PRODUCE_SUMMARY_MIN_LENGTH - 1))).toBe(false);
    expect(keystaticAccepts(summary, text(PRODUCE_SUMMARY_MIN_LENGTH))).toBe(true);
    expect(keystaticAccepts(summary, text(PRODUCE_SUMMARY_MAX_LENGTH))).toBe(true);
    expect(keystaticAccepts(summary, text(PRODUCE_SUMMARY_MAX_LENGTH + 1))).toBe(false);
  });

  it('QA 054: the data directory is defined once, outside the Keystatic config', () => {
    expect(keystaticModule).not.toHaveProperty('DATA_DIRECTORY');
    for (const name of COLLECTION_NAMES) {
      expect(KEYSTATIC[name].path).toBe(`${DATA_DIRECTORY}/${name}/*`);
    }
  });
});
