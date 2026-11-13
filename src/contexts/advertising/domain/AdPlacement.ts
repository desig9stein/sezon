/** Page templates that have an ad slot. */
export const AD_PLACEMENTS = ['produce', 'month'] as const;

export type AdPlacement = (typeof AD_PLACEMENTS)[number];

/** Returns `true` when `value` is one of {@link AD_PLACEMENTS}. */
export function isAdPlacement(value: string): value is AdPlacement {
  return (AD_PLACEMENTS as ReadonlyArray<string>).includes(value);
}
