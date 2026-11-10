import { InvalidPageMetaError } from '@shared/domain/errors';
import { SITE_NAME } from '@i18n/bg';

const TITLE_SEPARATOR = ' | ';
const TITLE_MAX_LENGTH = 60;
const DESCRIPTION_MIN_LENGTH = 70;
const DESCRIPTION_MAX_LENGTH = 160;
const PATH_PATTERN = /^\/(?:[a-z0-9-]+(?:\/[a-z0-9-]+)*)?$/;
const OG_LOCALE = 'bg_BG';

/** Open Graph page type. */
export type OgType = 'website' | 'article';

/** Input for {@link buildPageMeta}. */
export interface PageMetaInput {
  readonly title: string;
  readonly description: string;
  readonly path: string;
  readonly siteUrl: string;
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

/** Returns `siteUrl` joined with an absolute `path`, without a double slash. */
export function absoluteUrl(siteUrl: string, path: string): string {
  return `${siteUrl.replace(/\/+$/, '')}${path}`;
}

/**
 * Builds page metadata: suffixes the title with the site name, trims the description
 * and derives the canonical URL.
 * @throws InvalidPageMetaError when the full title exceeds 60 characters, the description is
 * outside 70–160 characters, or `path` is not a lowercase absolute path without trailing slash.
 */
export function buildPageMeta(input: PageMetaInput): PageMeta {
  const baseTitle = input.title.trim();
  if (baseTitle === '') {
    throw new InvalidPageMetaError('Page title must not be empty.');
  }
  const title = baseTitle === SITE_NAME ? SITE_NAME : `${baseTitle}${TITLE_SEPARATOR}${SITE_NAME}`;
  if (title.length > TITLE_MAX_LENGTH) {
    throw new InvalidPageMetaError(
      `Title "${title}" is longer than ${TITLE_MAX_LENGTH} characters.`,
    );
  }
  const description = input.description.trim();
  if (description.length < DESCRIPTION_MIN_LENGTH || description.length > DESCRIPTION_MAX_LENGTH) {
    throw new InvalidPageMetaError(
      `Description must be ${DESCRIPTION_MIN_LENGTH}–${DESCRIPTION_MAX_LENGTH} characters, got ${description.length}.`,
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
    siteName: SITE_NAME,
  };
}
