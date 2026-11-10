/** Produce kinds as stored in content. */
export const PRODUCE_KINDS = ['fruit', 'vegetable', 'herb', 'nut'] as const;

export type ProduceKind = (typeof PRODUCE_KINDS)[number];
