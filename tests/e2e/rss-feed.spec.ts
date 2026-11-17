import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

const DIST = join(process.cwd(), 'dist');
const MONTHS_IN_YEAR = 12;
const AUTODISCOVERY =
  /<link rel="alternate" type="application\/rss\+xml" title="[^"]+" href="https?:\/\/[^"]+\/rss\.xml">/g;

/** Returns the Europe/Sofia calendar year of an RFC 822 date. */
function sofiaYear(date: string): string {
  return new Intl.DateTimeFormat('en-US', { timeZone: 'Europe/Sofia', year: 'numeric' }).format(
    new Date(date),
  );
}

/** Returns the paths of all HTML pages in `dist`, relative to it, except Pagefind's assets. */
function builtPages(): ReadonlyArray<string> {
  return readdirSync(DIST, { recursive: true, encoding: 'utf8' }).filter(
    (file) => file.endsWith('.html') && !file.startsWith('pagefind'),
  );
}

test.describe('monthly RSS feed (spec 047)', () => {
  test('AC8: dist/rss.xml is well-formed RSS 2.0 with 12 monthly items', async ({
    page,
    request,
  }) => {
    const response = await request.get('/rss.xml');
    expect(response.ok()).toBe(true);
    expect(response.headers()['content-type']).toMatch(/xml/);
    const xml = readFileSync(join(DIST, 'rss.xml'), 'utf8');
    expect(await response.text()).toBe(xml);

    const feed = await page.evaluate((source) => {
      const doc = new DOMParser().parseFromString(source, 'application/xml');
      const text = (parent: Element | Document, selector: string) =>
        parent.querySelector(selector)?.textContent ?? null;
      const self = doc.getElementsByTagNameNS('http://www.w3.org/2005/Atom', 'link')[0];
      return {
        parseError: doc.querySelector('parsererror') !== null,
        version: doc.documentElement.getAttribute('version'),
        root: doc.documentElement.nodeName,
        language: text(doc, 'channel > language'),
        channelLink: text(doc, 'channel > link'),
        self:
          self === undefined
            ? null
            : { rel: self.getAttribute('rel'), href: self.getAttribute('href') },
        items: [...doc.querySelectorAll('channel > item')].map((item) => ({
          title: text(item, 'title'),
          link: text(item, 'link'),
          guid: text(item, 'guid'),
          isPermaLink: item.querySelector('guid')?.getAttribute('isPermaLink') ?? null,
          description: text(item, 'description'),
          pubDate: text(item, 'pubDate'),
        })),
      };
    }, xml);

    expect(feed.parseError).toBe(false);
    expect(feed.root).toBe('rss');
    expect(feed.version).toBe('2.0');
    expect(feed.language).toBe('bg');
    expect(feed.channelLink).toMatch(/^https?:\/\/[^/]+\/$/);
    expect(feed.self).toEqual({ rel: 'self', href: `${feed.channelLink ?? ''}rss.xml` });
    expect(feed.items).toHaveLength(MONTHS_IN_YEAR);
    const slugs = new Set<string>();
    for (const item of feed.items) {
      expect(item.title).toMatch(/^Какво е в сезон през [а-я]+$/);
      expect(item.link).toMatch(/^https?:\/\/[^/]+\/sezon\/[a-z]+$/);
      expect(item.guid).toBe(`${item.link ?? ''}#${sofiaYear(item.pubDate ?? '')}`);
      expect(item.isPermaLink).toBe('false');
      expect(item.description).toMatch(/^През [а-я]+ /);
      expect(item.description).not.toMatch(/[<>]/);
      expect(Date.parse(item.pubDate ?? '')).toBeLessThanOrEqual(Date.now());
      slugs.add(item.link?.split('/').pop() ?? '');
    }
    expect(slugs.size).toBe(MONTHS_IN_YEAR);
  });

  test('AC9: every built page has exactly one RSS autodiscovery link', () => {
    const pages = builtPages();
    expect(pages.length).toBeGreaterThan(MONTHS_IN_YEAR);
    const withoutOne = pages.filter(
      (file) => readFileSync(join(DIST, file), 'utf8').match(AUTODISCOVERY)?.length !== 1,
    );
    expect(withoutOne).toEqual([]);
  });
});

test.describe('subscription page (spec 059, QA)', () => {
  test('QA 059: /abonament explains the feed, shows its address and lists the entries', async ({
    page,
  }) => {
    await page.goto('/abonament');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('Следи сезона');
    await expect(page.locator('main')).toContainText('Какво е RSS');
    const address = page.getByLabel('Адрес на абонамента');
    await expect(address).toHaveAttribute('readonly', '');
    await expect(address).toHaveValue(/^https?:\/\/[^/]+\/rss\.xml$/);
    await expect(page.locator('main a[href="/rss.xml"]')).toHaveCount(1);
    expect(await page.locator('main .feed-entries a[href^="/sezon/"]').count()).toBe(
      MONTHS_IN_YEAR,
    );
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/abonament$/);
  });

  test('QA 059: /abonament is in the sitemap and the footer links it', async ({ page }) => {
    const sitemap = await (await page.request.get('/sitemap-0.xml')).text();
    expect(sitemap).toMatch(/\/abonament</);
    await page.goto('/');
    await expect(page.locator('footer .site-footer__follow a[href="/abonament"]')).toHaveCount(1);
  });

  test('QA 059: the feed has no XSL stylesheet', () => {
    expect(readFileSync(join(DIST, 'rss.xml'), 'utf8')).not.toContain('xml-stylesheet');
    expect(existsSync(join(DIST, 'rss.xsl'))).toBe(false);
  });
});
