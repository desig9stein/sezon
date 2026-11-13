import type { ProduceKind } from '@contexts/catalog';
import type { Month } from '@contexts/seasonality';

const PRODUCE_SECTIONS: Readonly<Record<ProduceKind, string>> = {
  fruit: 'plodove',
  vegetable: 'zelenchutsi',
  herb: 'podpravki',
  nut: 'yadki',
};

const GROUPS_PREFIX = '/grupi';
const NUTRIENTS_PREFIX = '/nutrienti';
const MONTHS_PREFIX = '/sezon';
const REGIONS_PREFIX = '/regioni';
const FARMS_PREFIX = '/fermi';
const RECIPES_PREFIX = '/retsepti';
const OG_IMAGES_PREFIX = '/og';
const OG_IMAGE_EXTENSION = '.png';

/** Media type of the RSS feed at `routes.feed`. */
export const FEED_MEDIA_TYPE = 'application/rss+xml';

/** Site-relative paths of all routes. */
export const routes = {
  home: '/',
  catalog: '/katalog',
  about: '/za-nas',
  reportError: '/za-nas#greshka',
  addFarm: '/za-nas#dobavi-ferma',
  methodology: '/metodologiya',
  advertising: '/reklama',
  privacy: '/poveritelnost',
  cookies: '/biskvitki',
  calendar: '/kalendar',
  search: '/tarsene',
  feed: '/rss.xml',
  farms: FARMS_PREFIX,
  farm: (slug: string) => `${FARMS_PREFIX}/${slug}`,
  regions: REGIONS_PREFIX,
  region: (slug: string) => `${REGIONS_PREFIX}/${slug}`,
  recipes: RECIPES_PREFIX,
  recipe: (slug: string) => `${RECIPES_PREFIX}/${slug}`,
  month: (month: Month) => `${MONTHS_PREFIX}/${month.slug}`,
  group: (slug: string) => `${GROUPS_PREFIX}/${slug}`,
  nutrient: (slug: string) => `${NUTRIENTS_PREFIX}/${slug}`,
  produceSection: (kind: ProduceKind) => PRODUCE_SECTIONS[kind],
  section: (kind: ProduceKind) => `/${PRODUCE_SECTIONS[kind]}`,
  produce: (produce: { readonly kind: ProduceKind; readonly slug: string }) =>
    `/${PRODUCE_SECTIONS[produce.kind]}/${produce.slug}`,
  /** Generated Open Graph images (spec 050). */
  ogImage: {
    prefix: `${OG_IMAGES_PREFIX}/`,
    extension: OG_IMAGE_EXTENSION,
    site: `${OG_IMAGES_PREFIX}/site${OG_IMAGE_EXTENSION}`,
    month: (month: Month) =>
      `${OG_IMAGES_PREFIX}${MONTHS_PREFIX}/${month.slug}${OG_IMAGE_EXTENSION}`,
    produce: (produce: { readonly kind: ProduceKind; readonly slug: string }) =>
      `${OG_IMAGES_PREFIX}/${PRODUCE_SECTIONS[produce.kind]}/${produce.slug}${OG_IMAGE_EXTENSION}`,
  },
} as const;

/** Path prefixes of the pages the main navigation counts as part of the catalogue. */
export const CATALOG_AREAS: ReadonlyArray<string> = [
  ...Object.values(PRODUCE_SECTIONS).map((section) => `/${section}`),
  GROUPS_PREFIX,
  NUTRIENTS_PREFIX,
  REGIONS_PREFIX,
  FARMS_PREFIX,
  RECIPES_PREFIX,
];

/** Path prefixes of the pages the main navigation counts as part of the calendar. */
export const CALENDAR_AREAS: ReadonlyArray<string> = [MONTHS_PREFIX];
