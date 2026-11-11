import { describe, expect, it } from 'vitest';
import { farmSchema } from '@contexts/farms/infrastructure/schemas';
import { certificateRecord } from '@tests/fixtures/organic';
import { farmRecord } from '@tests/fixtures/records';

const valid = (organic?: unknown) =>
  farmSchema.safeParse({ ...farmRecord(), ...(organic === undefined ? {} : { organic }) }).success;

describe('farm organic schema', () => {
  it('AC2: accepts a valid certificate and a farm without one', () => {
    expect(valid()).toBe(true);
    expect(valid({ ...certificateRecord(), validUntil: '2026-12-31' })).toBe(true);
  });

  it.each(['certifier', 'certificateId', 'validUntil'])('AC2: rejects a missing %s', (key) => {
    const organic = Object.fromEntries(
      Object.entries({ ...certificateRecord(), validUntil: '2026-12-31' }).filter(
        ([field]) => field !== key,
      ),
    );
    expect(valid(organic)).toBe(false);
  });
});
