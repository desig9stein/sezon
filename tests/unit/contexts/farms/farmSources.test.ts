import { describe, expect, it } from 'vitest';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { Farm } from '@contexts/farms';
import { ContactInfo } from '@contexts/farms';
import { InvalidFarmError } from '@shared/domain/errors';
import { farmRecord } from '@tests/fixtures/records';

describe('Farm sources (spec 030)', () => {
  it('AC1: maps the record sources in order and freezes them', () => {
    const sources = ['https://ferma.example/', 'https://ferma.example/kontakti'];
    const farm = toFarm('ferma', farmRecord({ sources }));
    expect(farm.sources).toEqual(sources);
    expect(Object.isFrozen(farm.sources)).toBe(true);
  });
});

describe('Farm sources QA (spec 030)', () => {
  it('AC12: rejects a source that is not an HTTPS URL', () => {
    const input = {
      slug: 'ferma',
      name: 'Ферма',
      regionSlug: 'pleven',
      produceSlugs: ['zele'],
      description: 'Описание.',
      contact: ContactInfo.create({ phone: '+359888123456' }),
      sponsored: false,
    };
    expect(() => Farm.create({ ...input, sources: ['ferma.bg/x'] })).toThrow(InvalidFarmError);
    expect(() => Farm.create({ ...input, sources: ['http://ferma.bg/'] })).toThrow(
      InvalidFarmError,
    );
    expect(Farm.create({ ...input, sources: ['https://ferma.bg/'] }).sources).toEqual([
      'https://ferma.bg/',
    ]);
  });
});
