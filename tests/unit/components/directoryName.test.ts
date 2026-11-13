import { describe, expect, it } from 'vitest';
import { directoryName } from '@components/farms/directoryName';

describe('directoryName (spec 051 QA)', () => {
  it('AC10: names the directory of a LocalStore.bg or Хранкооп profile', () => {
    expect(directoryName('https://localstore.bg/producer/papiagro')).toBe('LocalStore.bg');
    expect(directoryName('https://coop.hrankoop.com/producer/vantana')).toBe('Хранкооп');
  });

  it('AC10: returns undefined for a farm’s own website', () => {
    expect(directoryName('https://venets.co/')).toBeUndefined();
    expect(directoryName('https://hrankoop.com/')).toBeUndefined();
  });
});
