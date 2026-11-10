import { InvalidPageMetaError } from '@shared/domain/errors';
import { absoluteUrl } from './pageMeta';

const SCHEMA_CONTEXT = 'https://schema.org';
const CONTENT_LANGUAGE = 'bg';
const SCRIPT_UNSAFE_CHARACTERS = /[<>&\u2028\u2029]/g;

/** A JSON-LD object. */
export type JsonLd = Readonly<Record<string, unknown>>;

/** A breadcrumb entry with a site-relative path. */
export interface BreadcrumbItem {
  readonly name: string;
  readonly path: string;
}

/**
 * Serialises `value` as JSON that is safe to embed inside `<script type="application/ld+json">`:
 * `<`, `>`, `&`, U+2028 and U+2029 are written as `\uXXXX` escapes.
 */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(
    SCRIPT_UNSAFE_CHARACTERS,
    (character) => `\\u${character.charCodeAt(0).toString(16).padStart(4, '0')}`,
  );
}

/** Returns schema.org `WebSite` data for the home page. */
export function websiteJsonLd(input: {
  readonly siteUrl: string;
  readonly name: string;
  readonly description: string;
}): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.siteUrl, '/'),
    inLanguage: CONTENT_LANGUAGE,
  };
}

/**
 * Returns schema.org `BreadcrumbList` data with 1-based positions and absolute URLs.
 * @throws InvalidPageMetaError when `items` is empty.
 */
export function breadcrumbListJsonLd(
  items: ReadonlyArray<BreadcrumbItem>,
  siteUrl: string,
): JsonLd {
  if (items.length === 0) {
    throw new InvalidPageMetaError('A breadcrumb list needs at least one item.');
  }
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: absoluteUrl(siteUrl, item.path),
    })),
  };
}
