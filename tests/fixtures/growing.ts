import type { ProduceRecord } from '@contexts/catalog/infrastructure/schemas';

/** Returns a valid growing record; `overrides` replace top-level fields. */
export function growingRecord(
  overrides: Partial<NonNullable<ProduceRecord['growing']>> = {},
): NonNullable<ProduceRecord['growing']> {
  return {
    sow: [3, 4],
    transplant: [5],
    plant: [],
    tips: [
      'Сейте в рохкава, добре наторена почва.',
      'Поливайте редовно, особено при образуване на главите.',
      'Не садете зеле на едно място по-често от веднъж на 3–4 години.',
    ],
    sources: [{ name: 'Агрозона – Отглеждане на зеле', url: 'https://agrozona.bg/zele' }],
    ...overrides,
  };
}
