import { describe, expect, it } from 'vitest';
import { ui } from '@i18n/bg';

describe('ad strings (spec 037)', () => {
  it('AC11: labels advertising „Реклама“', () => {
    expect(ui.ads.label).toBe('Реклама');
  });
});
