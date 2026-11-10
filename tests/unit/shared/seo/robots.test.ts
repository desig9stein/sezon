import { describe, expect, it } from 'vitest';
import { robotsTxt } from '@shared/seo/robots';

describe('robotsTxt', () => {
  it('AC1: allows all crawlers and points to the absolute sitemap URL', () => {
    expect(robotsTxt('https://sezon.example/')).toBe(
      'User-agent: *\nAllow: /\n\nSitemap: https://sezon.example/sitemap-index.xml\n',
    );
  });
});
