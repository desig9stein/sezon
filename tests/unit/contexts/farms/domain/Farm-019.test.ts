import { describe, expect, it } from 'vitest';
import { toProduce } from '@contexts/catalog/infrastructure/mappers';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { certificateRecord, organicRecord } from '@tests/fixtures/organic';
import { farmRecord, produceRecord } from '@tests/fixtures/records';

describe('organic information', () => {
  it('AC3: maps the produce organic block', () => {
    const organic = toProduce('yabalki', produceRecord({ organic: organicRecord() })).organic;
    expect(organic?.availability).toBe('available');
    expect(organic?.sources).toHaveLength(1);
    expect(Object.isFrozen(organic)).toBe(true);
    expect(toProduce('zele', produceRecord()).organic).toBeUndefined();
  });

  it('AC3: a farm is organic on and before its certificate expires', () => {
    const farm = toFarm('sad', farmRecord({ organic: certificateRecord() }));
    expect(farm.organic?.certifier).toBe('Балкан Биосерт');
    expect(farm.isOrganicOn(new Date('2026-11-11'))).toBe(true);
    expect(farm.isOrganicOn(new Date('2026-12-31'))).toBe(true);
    expect(farm.isOrganicOn(new Date('2027-01-01'))).toBe(false);
    expect(toFarm('zelena-dolina', farmRecord()).isOrganicOn(new Date('2026-11-11'))).toBe(false);
  });
});
