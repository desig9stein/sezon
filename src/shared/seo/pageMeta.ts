import { InvalidPageMetaError } from '@shared/domain/errors';

const TITLE_SEPARATOR = ' | ';
/** Maximum length of a full page title, in characters. */
export const TITLE_MAX_LENGTH = 60;
/** Minimum length of a meta description, in characters. */
export const DESCRIPTION_MIN_LENGTH = 70;
/** Maximum length of a meta description, in characters. */
export const DESCRIPTION_MAX_LENGTH = 160;
const PATH_PATTERN = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/;
const WHITESPACE_RUN = /\s+/g;
const OG_LOCALE = 'bg_BG';

/** Open Graph page type. */
export type OgType = 'website' | 'article';

/** Input for {@link buildPageMeta}. */
export interface PageMetaInput {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  /** Site origin, e.g. `https://sezon.bg` (a trailing slash is allowed, a path is not). */
  readonly siteUrl: string;
  readonly siteName: string;
  readonly type?: OgType | undefined;
}

/** Validated metadata for a page's `<head>`. */
export interface PageMeta {
  readonly title: string;
  readonly description: string;
  readonly canonicalUrl: string;
  readonly ogType: OgType;
  readonly locale: string;
  readonly siteName: string;
}

/** Returns the number of Unicode code points in `text`. */
export const characterCount = (text: string): number => [...text].length;
const collapseWhitespace = (text: string): string => text.replace(WHITESPACE_RUN, ' ').trim();

/**
 * Returns the absolute URL of `path` on the site.
 * @throws InvalidPageMetaError when `siteUrl` is not an http(s) origin without path, query or hash.
 */
export function absoluteUrl(siteUrl: string, path: string): string {
  if (!URL.canParse(siteUrl)) {
    throw new InvalidPageMetaError(`"${siteUrl}" is not a URL.`);
  }
  const site = new URL(siteUrl);
  if (site.pathname !== '/' || site.search !== '' || site.hash !== '') {
    throw new InvalidPageMetaError(
      `Site URL "${siteUrl}" must be an origin without path, query or hash.`,
    );
  }
  return new URL(path, site.origin).toString();
}

function fullTitle(title: string, siteName: string): string {
  const suffix = `${TITLE_SEPARATOR}${siteName}`;
  if (title === siteName || title.endsWith(suffix)) {
    return title;
  }
  return `${title}${suffix}`;
}

/**
 * Builds page metadata: collapses whitespace, suffixes the title with the site name and derives
 * the canonical URL.
 * @throws InvalidPageMetaError when the full title exceeds 60 characters, the description is
 * outside 70–160 characters, `path` is not a lowercase absolute path without trailing slash,
 * or `siteUrl` is not a bare origin.
 */
export function buildPageMeta(input: PageMetaInput): PageMeta {
  const baseTitle = collapseWhitespace(input.title);
  if (baseTitle === '') {
    throw new InvalidPageMetaError('Page title must not be empty.');
  }
  const title = fullTitle(baseTitle, input.siteName);
  if (characterCount(title) > TITLE_MAX_LENGTH) {
    throw new InvalidPageMetaError(
      `Title "${title}" is longer than ${TITLE_MAX_LENGTH} characters.`,
    );
  }
  const description = collapseWhitespace(input.description);
  const descriptionLength = characterCount(description);
  if (descriptionLength < DESCRIPTION_MIN_LENGTH || descriptionLength > DESCRIPTION_MAX_LENGTH) {
    throw new InvalidPageMetaError(
      `Description must be ${DESCRIPTION_MIN_LENGTH}–${DESCRIPTION_MAX_LENGTH} characters, got ${descriptionLength}.`,
    );
  }
  if (!PATH_PATTERN.test(input.path)) {
    throw new InvalidPageMetaError(`"${input.path}" is not a valid page path.`);
  }
  return {
    title,
    description,
    canonicalUrl: absoluteUrl(input.siteUrl, input.path),
    ogType: input.type ?? 'website',
    locale: OG_LOCALE,
    siteName: input.siteName,
  };
}
