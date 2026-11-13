import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { FEED_MEDIA_TYPE } from '@components/layout/routes';

describe('RSS feed media type (QA 047)', () => {
  it('AC13: one constant names the RSS media type for the head link and the feed', () => {
    expect(FEED_MEDIA_TYPE).toBe('application/rss+xml');
    for (const file of ['src/components/seo/Seo.astro', 'src/pages/rss.xml.ts']) {
      const source = readFileSync(file, 'utf8');
      expect(source).not.toContain("'application/rss+xml'");
      expect(source).not.toContain('"application/rss+xml"');
      expect(source).toContain('FEED_MEDIA_TYPE');
    }
  });

  it('AC14: Cloudflare Pages serves /rss.xml as RSS in UTF-8', () => {
    expect(readFileSync('public/_headers', 'utf8')).toMatch(
      /^\/rss\.xml\n\s+Content-Type: application\/rss\+xml; charset=utf-8$/m,
    );
  });
});
