import type { ProduceKind } from '@contexts/catalog';
import type { Month } from '@contexts/seasonality';

const PRODUCE_SECTIONS: Readonly<Record<ProduceKind, string>> = {
  fruit: 'plodove',
  vegetable: 'zelenchutsi',
  herb: 'podpravki',
  nut: 'yadki',
};

/** Site-relative paths of all routes. */
export const routes = {
  home: '/',
  month: (month: Month) => `/sezon/${month.slug}`,
  produce: (produce: { readonly kind: ProduceKind; readonly slug: string }) =>
    `/${PRODUCE_SECTIONS[produce.kind]}/${produce.slug}`,
} as const;
