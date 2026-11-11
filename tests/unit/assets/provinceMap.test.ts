import { readdirSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import provinceMap from '../../../src/assets/map/provinces.json';

const REGION_SLUGS = readdirSync(join(process.cwd(), 'src', 'data', 'regions'))
  .filter((file) => file.endsWith('.yaml'))
  .map((file) => file.replace(/\.yaml$/, ''))
  .sort();

describe('province map asset', () => {
  it('AC1: has a path for every region and no other keys', () => {
    expect(Object.keys(provinceMap.provinces).sort()).toEqual(REGION_SLUGS);
    for (const path of Object.values(provinceMap.provinces)) expect(path).toMatch(/^M[\d .LMZ]+Z$/);
  });

  it('AC1: has a 600-unit-wide viewBox', () => {
    expect(provinceMap.viewBox).toMatch(/^0 0 600 \d+$/);
  });
});
