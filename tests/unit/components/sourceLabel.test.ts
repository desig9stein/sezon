import { describe, expect, it } from 'vitest';
import { sourceLabel } from '@components/farms/sourceLabel';

describe('sourceLabel (spec 030 §5)', () => {
  it('shows the host and decoded path of a Cyrillic URL', () => {
    expect(sourceLabel('https://venets.co/%d0%ba%d0%be%d0%bd%d1%82%d0%b0%d0%ba%d1%82%d0%b8/')).toBe(
      'venets.co/контакти/',
    );
  });

  it('drops a lone trailing slash and keeps a malformed URL as stored', () => {
    expect(sourceLabel('https://venets.co/')).toBe('venets.co');
    expect(sourceLabel('https://example.bg/%E0%A4%A')).toBe('example.bg/%E0%A4%A');
  });
});

describe('sourceLabel QA (spec 030)', () => {
  it('AC13: keeps the fragment so two anchors on one page stay distinct', () => {
    expect(sourceLabel('https://a.bg/p#kontakti')).toBe('a.bg/p#kontakti');
  });
});
