import type { ComponentSchema } from '@keystatic/core';
import { dump } from 'js-yaml';
import { parseDocument } from 'yaml';
import type { z } from 'astro/zod';
import { sponsorSchemaWith } from '@contexts/advertising/infrastructure/schemas';
import {
  groupSchema,
  nutrientSchema,
  produceSchemaWith,
} from '@contexts/catalog/infrastructure/schemas';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { regionSchema } from '@contexts/geography/infrastructure/schemas';
import { recipeSchema } from '@contexts/recipes/infrastructure/schemas';
import { testImage } from './photos';

/** The Zod schema of each content collection, with a stub for Astro's `image()` helper. */
export const ZOD_SCHEMAS: Readonly<Record<string, z.ZodType>> = {
  produce: produceSchemaWith({ image: testImage }),
  groups: groupSchema,
  nutrients: nutrientSchema,
  regions: regionSchema,
  farms: farmSchema,
  recipes: recipeSchema,
  sponsors: sponsorSchemaWith({ image: testImage }),
};

/** Parses YAML the way Astro's content loader does (core schema, timestamps as dates). */
export function parseAstroYaml(source: string): unknown {
  return parseDocument(source, { customTags: ['timestamp'], merge: true, schema: 'core' }).toJS();
}

/** The parts of a Keystatic form field the admin calls when it loads and saves an entry. */
interface FormField {
  readonly kind: 'form';
  parse(value: unknown, args?: { readonly slug?: string }): unknown;
  serialize(value: unknown): { readonly value: unknown };
  serializeWithSlug?(value: unknown): { readonly value: unknown };
}

type Fields = Readonly<Record<string, ComponentSchema>>;

const asRecord = (value: unknown): Readonly<Record<string, unknown>> =>
  typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};

/** Turns a stored value into the admin's editor state, as Keystatic's `parseProps` does. */
function toEditorState(schema: ComponentSchema, value: unknown): unknown {
  switch (schema.kind) {
    case 'form':
      return (schema as unknown as FormField).parse(value, undefined);
    case 'object':
      return objectToEditorState(schema.fields, value);
    case 'array':
      return (Array.isArray(value) ? value : []).map((item) => toEditorState(schema.element, item));
    default:
      throw new Error(`Unsupported Keystatic field kind: ${schema.kind}`);
  }
}

function objectToEditorState(fields: Fields, value: unknown): Record<string, unknown> {
  const record = asRecord(value);
  return Object.fromEntries(
    Object.entries(fields).map(([key, field]) => [key, toEditorState(field, record[key])]),
  );
}

/** Turns editor state back into the stored value, as Keystatic's `serializeProps` does. */
function toStoredValue(schema: ComponentSchema, state: unknown): unknown {
  switch (schema.kind) {
    case 'form':
      return (schema as unknown as FormField).serialize(state).value;
    case 'object':
      return objectToStoredValue(schema.fields, state);
    case 'array':
      return (state as unknown[]).map((item) => toStoredValue(schema.element, item) ?? null);
    default:
      throw new Error(`Unsupported Keystatic field kind: ${schema.kind}`);
  }
}

function objectToStoredValue(fields: Fields, state: unknown): Record<string, unknown> {
  const record = asRecord(state);
  return Object.fromEntries(
    Object.entries(fields)
      .map(([key, field]) => [key, toStoredValue(field, record[key])] as const)
      .filter(([, value]) => value !== undefined),
  );
}

/**
 * Loads an entry into the Keystatic admin and saves it unchanged, the way the admin does: each
 * field's own `parse` and `serialize`, then `js-yaml` `dump`.
 * @param schema - The Keystatic collection schema.
 * @param slugField - The collection's slug field (stored as the name, the slug is the file name).
 * @param slug - The entry id.
 * @param source - The YAML file content.
 * @returns The YAML Keystatic writes.
 */
export function saveThroughKeystatic(
  schema: Fields,
  slugField: string,
  slug: string,
  source: string,
): string {
  const stored = asRecord(parseAstroYaml(source));
  const output: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema)) {
    if (key === slugField) {
      const slugInput = field as unknown as FormField;
      const name = slugInput.parse(stored[key], { slug });
      output[key] = slugInput.serializeWithSlug?.(name).value;
      continue;
    }
    const value = toStoredValue(field, toEditorState(field, stored[key]));
    if (value !== undefined) {
      output[key] = value;
    }
  }
  return dump(output);
}

/**
 * Removes the values Keystatic's reader uses for an absent optional field (`null` and `''`), so
 * the result can be parsed with the Zod schema.
 */
export function withoutEmptyValues(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(withoutEmptyValues);
  }
  if (typeof value !== 'object' || value === null || value instanceof Date) {
    return value;
  }
  return Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== null && item !== '')
      .map(([key, item]) => [key, withoutEmptyValues(item)]),
  );
}
