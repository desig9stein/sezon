import { routes } from '@components/layout/routes';
import type { Produce, SeasonOverview } from '@contexts/catalog';
import type { Month, SeasonLevelValue } from '@contexts/seasonality';
import { monthName, monthNameLower, ui } from '@i18n/bg';
import { InvalidPageMetaError } from '@shared/domain/errors';
import { absoluteUrl } from '@shared/seo';

/** Size and media type of every generated Open Graph image. */
export const OG_IMAGE = { width: 1200, height: 630, type: 'image/png' } as const;

/**
 * Heading limits: the width available (the image width minus 72 px padding on each side), the
 * largest and smallest one-line sizes, and the most lines a wrapped heading may take.
 */
export const OG_HEADING = { widthPx: 1056, maxPx: 200, minPx: 96, maxLines: 2 } as const;
/** Extra width a wrapped heading may need because lines do not break at the ideal point. */
const WRAP_SLACK = 1.2;
const VERSION_PARAM = 'm';
/** Number of produce names a month card shows. */
const MONTH_NAMES_SHOWN = 5;

/** Look of the season stamp on a card: one per season level, plus out of season. */
export type OgStampTone = SeasonLevelValue | 'out';

/** Text and tone of the season stamp on a produce card. */
export interface OgStamp {
  readonly text: string;
  readonly tone: OgStampTone;
}

/** Content of one generated share image, independent of how it is drawn. */
export interface OgCard {
  /** Site-relative path of the PNG. */
  readonly path: string;
  /** Bulgarian text alternative for `og:image:alt`. */
  readonly alt: string;
  /** Cache key added to the meta URL, so a card whose content changes gets a new URL. */
  readonly version?: string | undefined;
  /** Small line above the heading. */
  readonly kicker?: string | undefined;
  /** Large name, drawn in capitals. */
  readonly heading: string;
  readonly stamp?: OgStamp | undefined;
  /** Line under the heading. */
  readonly detail: string;
  /** Site name in the bottom band; absent when the heading is the site name. */
  readonly brand?: string | undefined;
}

/** Image reference a page passes to its layout. */
export interface OgImageRef {
  readonly path: string;
  readonly alt: string;
  readonly version?: string | undefined;
}

/** Measured widths of a heading in capitals, in em. */
export interface HeadingMetrics {
  /** Width of the whole heading on one line. */
  readonly lineEm: number;
  /** Width of its widest word. */
  readonly longestWordEm: number;
}

/** Values of the `og:image` tags. */
export interface OgImageMeta {
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly type: string;
}

/** The produce page's words for each level: its stamp words and „Извън сезона“. */
const STAMP_TEXTS: Readonly<Record<OgStampTone, string>> = {
  ...ui.stamp,
  out: ui.produce.outOfSeason,
};

/**
 * Returns the heading font size in px: the largest size up to 200 px that fits the heading on one
 * line, if that is at least 96 px; otherwise at most 96 px, small enough that the widest word fits
 * the width and the heading takes at most two lines.
 */
export function headingFontSize({ lineEm, longestWordEm }: HeadingMetrics): number {
  const { widthPx, maxPx, minPx, maxLines } = OG_HEADING;
  const oneLine = Math.floor(widthPx / lineEm);
  if (oneLine >= minPx) return Math.min(maxPx, oneLine);
  return Math.min(
    minPx,
    Math.floor(widthPx / longestWordEm),
    Math.floor((maxLines * widthPx) / (lineEm * WRAP_SLACK)),
  );
}

/** Returns the card of the whole site: its name and tagline. Used by the home page and as default. */
export function siteOgCard(): OgCard {
  return {
    path: routes.ogImage.site,
    alt: ui.ogImage.siteAlt(ui.siteDescription),
    heading: ui.siteName,
    detail: ui.siteDescription,
  };
}

/** Returns the card of a month page: „Какво е в сезон през <месец>“ and the first fresh produce. */
export function monthOgCard(overview: SeasonOverview): OgCard {
  const { month } = overview;
  const fresh = [...overview.peak, ...overview.available].map((produce) => produce.name);
  const shown = fresh.slice(0, MONTH_NAMES_SHOWN);
  const remaining = fresh.length - shown.length;
  return {
    path: routes.ogImage.month(month),
    alt: ui.ogImage.monthAlt(month, shown, remaining),
    kicker: ui.ogImage.monthKicker,
    heading: monthName(month),
    detail: ui.ogImage.monthDetail(shown, remaining),
    brand: ui.siteName,
  };
}

/**
 * Returns the card of a produce page: its kind, name and season level in `month` in the produce
 * page's words, versioned with the month.
 */
export function produceOgCard(produce: Produce, month: Month): OgCard {
  const tone: OgStampTone = produce.levelIn(month)?.value ?? 'out';
  const text = STAMP_TEXTS[tone];
  return {
    path: routes.ogImage.produce(produce),
    version: month.slug,
    alt: ui.ogImage.produceAlt(produce.name, text, month),
    kicker: ui.produceKinds[produce.kind],
    heading: produce.name,
    stamp: { text, tone },
    detail: ui.produce.nowIn(monthNameLower(month)),
    brand: ui.siteName,
  };
}

/**
 * Returns the endpoint's `slug` param of an image path: the path without `/og/` and `.png`.
 * @throws InvalidPageMetaError when `path` is not `/og/<slug>.png`.
 */
export function ogImageSlug(path: string): string {
  const { prefix, extension } = routes.ogImage;
  const slug = path.slice(prefix.length, -extension.length);
  if (!path.startsWith(prefix) || !path.endsWith(extension) || slug === '') {
    throw new InvalidPageMetaError(`"${path}" is not an Open Graph image path.`);
  }
  return slug;
}

/**
 * Returns the values of the `og:image` tags for `image` on the site at `siteUrl`; a versioned
 * image gets `?m=<version>` on its URL.
 */
export function ogImageMeta(siteUrl: string, image: OgImageRef): OgImageMeta {
  const url = absoluteUrl(siteUrl, image.path);
  return {
    url: image.version === undefined ? url : `${url}?${VERSION_PARAM}=${image.version}`,
    alt: image.alt,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    type: OG_IMAGE.type,
  };
}
