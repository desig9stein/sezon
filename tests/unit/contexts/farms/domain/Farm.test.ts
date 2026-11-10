import { describe, expect, it } from 'vitest';
import { ContactInfo } from '@contexts/farms';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { InvalidContactInfoError } from '@shared/domain/errors';
import { farmRecord } from '@tests/fixtures/records';

describe('ContactInfo', () => {
  it('AC6: requires at least one contact method', () => {
    expect(() => ContactInfo.create({})).toThrow(InvalidContactInfoError);
  });

  it('AC6: creates frozen contact info with any single method', () => {
    const contact = ContactInfo.create({ phone: '+359000000001' });
    expect(contact.phone).toBe('+359000000001');
    expect(contact.website).toBeUndefined();
    expect(Object.isFrozen(contact)).toBe(true);
  });
});

describe('Farm', () => {
  const farm = toFarm('zelena-dolina', farmRecord());

  it('AC7: reports whether it sells a produce', () => {
    expect(farm.sells('zele')).toBe(true);
    expect(farm.sells('yabalki')).toBe(false);
  });

  it('maps the record into a frozen entity', () => {
    expect(farm.slug).toBe('zelena-dolina');
    expect(farm.regionSlug).toBe('plovdiv');
    expect(farm.isPlaceholder).toBe(true);
    expect(farm.contact.email).toBe('farm@example.com');
    expect(Object.isFrozen(farm)).toBe(true);
  });
});
