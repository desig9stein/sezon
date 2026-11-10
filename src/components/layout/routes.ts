import type { Month } from '@contexts/seasonality';

/** Site-relative paths of all routes. */
export const routes = {
  home: '/',
  month: (month: Month) => `/sezon/${month.slug}`,
} as const;
