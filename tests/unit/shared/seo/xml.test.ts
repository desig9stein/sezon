import { describe, expect, it } from 'vitest';
import { escapeXml } from '@shared/seo';

describe('escapeXml (QA 047)', () => {
  it('AC12: escapes the five XML special characters', () => {
    expect(escapeXml(`a&b<c>"d'`)).toBe('a&amp;b&lt;c&gt;&quot;d&apos;');
    expect(escapeXml('https://sezon.example/sezon/noemvri#2026')).toBe(
      'https://sezon.example/sezon/noemvri#2026',
    );
  });
});
