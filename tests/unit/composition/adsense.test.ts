import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { adsenseConfig } from '@composition/adsense';
import { InvalidConfigurationError } from '@shared/domain/errors';

const CLIENT = 'ca-pub-1234567890123456';
const SLOT = '1234567890';

describe('AdSense configuration (spec 045)', () => {
  it.each([undefined, '', '   '])('AC1: a blank client (%j) turns AdSense off', (client) => {
    expect(adsenseConfig(client, SLOT)).toBeUndefined();
    expect(adsenseConfig(client, undefined)).toBeUndefined();
    expect(adsenseConfig(client, 'not-digits')).toBeUndefined();
  });

  it('AC2: returns a frozen config with the trimmed client and slot', () => {
    const config = adsenseConfig(` ${CLIENT} `, ` ${SLOT} `);
    expect(config).toEqual({ client: CLIENT, slot: SLOT });
    expect(Object.isFrozen(config)).toBe(true);
  });

  it.each([
    'pub-1234567890123456',
    'ca-pub-123',
    'ca-pub-123456789012345678901',
    'ca-pub-12345abc90',
  ])('AC3: rejects the client %j', (client) => {
    expect(() => adsenseConfig(client, SLOT)).toThrow(InvalidConfigurationError);
  });

  it.each([undefined, '', '  ', '12a4', '-1'])('AC3: rejects the slot %j with a client', (slot) => {
    expect(() => adsenseConfig(CLIENT, slot)).toThrow(InvalidConfigurationError);
  });

  it('AC14: .env.example documents both AdSense variables', () => {
    const example = readFileSync(join(process.cwd(), '.env.example'), 'utf8');
    expect(example).toMatch(/^PUBLIC_ADSENSE_CLIENT=$/m);
    expect(example).toMatch(/^PUBLIC_ADSENSE_SLOT=$/m);
  });
});
