import type { Source } from './Source';

/** How widely certified organic production of a produce exists in Bulgaria. */
export const ORGANIC_AVAILABILITIES = ['available', 'limited'] as const;
export type OrganicAvailability = (typeof ORGANIC_AVAILABILITIES)[number];

/** Whether certified organic production of a produce exists in Bulgaria, with a note and sources. */
export interface OrganicProduction {
  readonly availability: OrganicAvailability;
  readonly note: string;
  readonly sources: ReadonlyArray<Source>;
}
