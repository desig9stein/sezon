import { describe, expect, it } from 'vitest';
import { routes } from '@components/layout/routes';

describe('legal and advertising routes (spec 046)', () => {
  it('AC1: maps the three pages to Latin paths', () => {
    expect(routes.advertising).toBe('/reklama');
    expect(routes.privacy).toBe('/poveritelnost');
    expect(routes.cookies).toBe('/biskvitki');
  });
});
