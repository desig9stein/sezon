import { routes } from '@components/layout/routes';
import type { Produce, SeasonOverview } from '@contexts/catalog';
import type { Month, SeasonLevelValue } from '@contexts/seasonality';
import { monthName, monthNameLower, ui } from '@i18n/bg';
import { absoluteUrl } from '@shared/seo';

/** Size and media type of every generated Open Graph image. */
export const OG_IMAGE = { width: 1200, height: 630, type: 'image/png' } as const;

/** Width available to the heading: the image width minus 72 px padding on each side. */
const HEADING_WIDTH_PX = 1056;
/** Average advance of a capital in Sofia Sans Extra Condensed 800, in em. */
const HEADING_CHARACTER_EM = 0.42;
const HEADING_MAX_PX = 200;
const HEADING_MIN_PX = 96;
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
  /** Small line above the heading. */
  readonly kicker?: string | undefined;
  /** Large name, drawn in capitals. */
  readonly heading: string;
  /** Heading font size in px. */
  readonly headingSize: number;
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
}

/** Values of the `og:image` tags. */
export interface OgImageMeta {
  readonly url: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
  readonly type: string;
}

const STAMP_TEXTS: Readonly<Record<OgStampTone, string>> = {
  peak: ui.overview.peak,
  available: ui.stamp.available,
  storage: ui.overview.storage,
  out: ui.produce.outOfSeason,
};

/**
 * Returns the heading font size in px that fits `text` on one line of the card, between 96 and
 * 200 px.
 */
export function headingFontSize(text: string): number {
  const fitting = Math.floor(HEADING_WIDTH_PX / (HEADING_CHARACTER_EM * [...text].length));
  return Math.min(HEADING_MAX_PX, Math.max(HEADING_MIN_PX, fitting));
}

/** Returns the card of the whole site: its name and tagline. Used by the home page and as default. */
export function siteOgCard(): OgCard {
  return {
    path: routes.ogImage.site,
    alt: ui.ogImage.siteAlt(ui.siteDescription),
    heading: ui.siteName,
    headingSize: headingFontSize(ui.siteName),
    detail: ui.siteDescription,
  };
}

/** Returns the card of a month page: „Какво е в сезон през <месец>“ and the first fresh produce. */
export function monthOgCard(overview: SeasonOverview): OgCard {
  const { month } = overview;
  const fresh = [...overview.peak, ...overview.available].map((produce) => produce.name);
  const shown = fresh.slice(0, MONTH_NAMES_SHOWN);
  const remaining = fresh.length - shown.length;
  const heading = monthName(month);
  return {
    path: routes.ogImage.month(month),
    alt: ui.ogImage.monthAlt(month, shown, remaining),
    kicker: ui.ogImage.monthKicker,
    heading,
    headingSize: headingFontSize(heading),
    detail: ui.ogImage.monthDetail(shown, remaining),
    brand: ui.siteName,
  };
}

/** Returns the card of a produce page: its kind, name and season level in `month`, in words. */
export function produceOgCard(produce: Produce, month: Month): OgCard {
  const tone: OgStampTone = produce.levelIn(month)?.value ?? 'out';
  const text = STAMP_TEXTS[tone];
  return {
    path: routes.ogImage.produce(produce),
    alt: ui.ogImage.produceAlt(produce.name, text, month),
    kicker: ui.produceKinds[produce.kind],
    heading: produce.name,
    headingSize: headingFontSize(produce.name),
    stamp: { text, tone },
    detail: ui.produce.nowIn(monthNameLower(month)),
    brand: ui.siteName,
  };
}

/** Returns the endpoint's `slug` param of an image path: the path without `/og/` and `.png`. */
export function ogImageSlug(path: string): string {
  return path.slice(routes.ogImage.prefix.length, -routes.ogImage.extension.length);
}

/** Returns the values of the `og:image` tags for `image` on the site at `siteUrl`. */
export function ogImageMeta(siteUrl: string, image: OgImageRef): OgImageMeta {
  return {
    url: absoluteUrl(siteUrl, image.path),
    alt: image.alt,
    width: OG_IMAGE.width,
    height: OG_IMAGE.height,
    type: OG_IMAGE.type,
  };
}
