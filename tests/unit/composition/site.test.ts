import { describe, expect, it } from 'vitest';
import { requireSiteUrl } from '@composition/site';
import { InvalidConfigurationError } from '@shared/domain/errors';

describe('requireSiteUrl', () => {
  it('returns the configured site URL', () => {
    expect(requireSiteUrl(new URL('https://sezon.example'))).toBe('https://sezon.example/');
  });

  it('throws InvalidConfigurationError when site is missing', () => {
    expect(() => requireSiteUrl(undefined)).toThrow(InvalidConfigurationError);
  });
});
