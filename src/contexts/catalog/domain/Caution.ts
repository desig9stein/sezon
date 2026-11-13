import type { Source } from './Source';

/**
 * Kinds of caution a produce page can show: toxic look-alikes, a toxic part or one that must be
 * cooked, an allergy, a protected species or gathering restriction, and a required preparation.
 */
export const CAUTION_KINDS = [
  'look-alike',
  'toxic-part',
  'allergy',
  'protected',
  'preparation',
] as const;

export type CautionKind = (typeof CAUTION_KINDS)[number];

/** Shortest caution text, in characters. */
export const CAUTION_TEXT_MIN_LENGTH = 20;
/** Longest caution text, in characters. */
export const CAUTION_TEXT_MAX_LENGTH = 200;

/** A sourced, factual warning about gathering, eating or preparing a produce. */
export interface Caution {
  readonly kind: CautionKind;
  readonly text: string;
  readonly source: Source;
}
