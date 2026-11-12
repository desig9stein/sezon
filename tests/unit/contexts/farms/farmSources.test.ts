import { describe, expect, it } from 'vitest';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';

describe('Farm sources (spec 030)', () => {
  it('AC1: maps the record sources in order and freezes them', () => {
    const sources = ['https://ferma.example/', 'https://ferma.example/kontakti'];
    const farm = toFarm('ferma', farmRecord({ sources }));
    expect(farm.sources).toEqual(sources);
    expect(Object.isFrozen(farm.sources)).toBe(true);
  });
});
