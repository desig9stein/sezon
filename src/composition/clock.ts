import { Month } from '@contexts/seasonality';

/** Moment at which the static site was generated. */
export const BUILD_DATE = new Date();

/** Calendar month in Europe/Sofia at build time. */
export const buildMonth: Month = Month.fromDate(BUILD_DATE);
