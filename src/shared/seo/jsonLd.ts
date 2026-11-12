import { InvalidPageMetaError } from '@shared/domain/errors';
import { absoluteUrl } from './pageMeta';

const SCHEMA_CONTEXT = 'https://schema.org';
const CONTENT_LANGUAGE = 'bg';
const SCRIPT_UNSAFE_CHARACTERS = /[<>&\u2028\u2029]/g;

/** A JSON-LD object. */
export type JsonLd = Readonly<Record<string, unknown>>;

/** A named link with a site-relative path (breadcrumbs, list items). */
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

/**
 * Returns schema.org `WebSite` data for the home page, with a `SearchAction` for the search page
 * at `searchPath`, whose `q` parameter holds the query.
 */
export function websiteJsonLd(input: {
  readonly siteUrl: string;
  readonly name: string;
  readonly description: string;
  readonly searchPath: string;
}): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'WebSite',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.siteUrl, '/'),
    inLanguage: CONTENT_LANGUAGE,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${absoluteUrl(input.siteUrl, input.searchPath)}?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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

function itemListEntity(
  name: string,
  items: ReadonlyArray<BreadcrumbItem>,
  siteUrl: string,
): JsonLd {
  return {
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: absoluteUrl(siteUrl, item.path),
    })),
  };
}

/** Returns schema.org `ItemList` data with 1-based positions and absolute item URLs. */
export function itemListJsonLd(
  name: string,
  items: ReadonlyArray<BreadcrumbItem>,
  siteUrl: string,
): JsonLd {
  return { '@context': SCHEMA_CONTEXT, ...itemListEntity(name, items, siteUrl) };
}

/** Input for {@link articleJsonLd}. */
export interface ArticleJsonLdInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly headline: string;
  readonly description: string;
  readonly dateModified: Date;
  readonly about: { readonly name: string; readonly alternateName?: string | undefined };
  readonly citations: ReadonlyArray<{ readonly name: string; readonly url: string }>;
  readonly imagePath?: string | undefined;
}

/**
 * Returns schema.org `Article` data describing a page about one thing, with its citations and,
 * when `imagePath` is given, its absolute image URL.
 */
export function articleJsonLd(input: ArticleJsonLdInput): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'Article',
    headline: input.headline,
    description: input.description,
    inLanguage: CONTENT_LANGUAGE,
    dateModified: input.dateModified.toISOString().slice(0, 10),
    mainEntityOfPage: absoluteUrl(input.siteUrl, input.path),
    ...(input.imagePath === undefined
      ? {}
      : { image: absoluteUrl(input.siteUrl, input.imagePath) }),
    about: {
      '@type': 'Thing',
      name: input.about.name,
      ...(input.about.alternateName === undefined
        ? {}
        : { alternateName: input.about.alternateName }),
    },
    citation: input.citations.map((citation) => ({
      '@type': 'CreativeWork',
      name: citation.name,
      url: citation.url,
    })),
  };
}

/** Returns schema.org `FAQPage` data for question–answer pairs. */
export function faqPageJsonLd(
  items: ReadonlyArray<{ readonly question: string; readonly answer: string }>,
): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/** Input for {@link collectionPageJsonLd}. */
export interface CollectionPageJsonLdInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly name: string;
  readonly description: string;
  readonly items: ReadonlyArray<BreadcrumbItem>;
}

/** Returns schema.org `CollectionPage` data whose main entity is an `ItemList` of `items`. */
export function collectionPageJsonLd(input: CollectionPageJsonLdInput): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'CollectionPage',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.siteUrl, input.path),
    inLanguage: CONTENT_LANGUAGE,
    mainEntity: itemListEntity(input.name, input.items, input.siteUrl),
  };
}

/** Input for {@link administrativeAreaJsonLd}. */
export interface AdministrativeAreaJsonLdInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly name: string;
  readonly description: string;
  /** Name of the country that contains the area. */
  readonly country: string;
}

/** Returns schema.org `AdministrativeArea` data for a province, contained in its country. */
export function administrativeAreaJsonLd(input: AdministrativeAreaJsonLdInput): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'AdministrativeArea',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.siteUrl, input.path),
    containedInPlace: { '@type': 'Country', name: input.country },
  };
}

/** Input for {@link localBusinessJsonLd}. */
export interface LocalBusinessJsonLdInput {
  readonly siteUrl: string;
  readonly path: string;
  readonly name: string;
  readonly description: string;
  readonly telephone?: string | undefined;
  readonly email?: string | undefined;
  /** Address as free text. */
  readonly address?: string | undefined;
  /** The business's own website, given as `sameAs`. */
  readonly website?: string | undefined;
}

/** Returns schema.org `LocalBusiness` data for a farm; absent contact fields are left out. */
export function localBusinessJsonLd(input: LocalBusinessJsonLdInput): JsonLd {
  return {
    '@context': SCHEMA_CONTEXT,
    '@type': 'LocalBusiness',
    name: input.name,
    description: input.description,
    url: absoluteUrl(input.siteUrl, input.path),
    ...(input.telephone === undefined ? {} : { telephone: input.telephone }),
    ...(input.email === undefined ? {} : { email: input.email }),
    ...(input.address === undefined ? {} : { address: input.address }),
    ...(input.website === undefined ? {} : { sameAs: [input.website] }),
  };
}
