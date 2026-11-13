# 047. Monthly RSS feed

- **Status:** Approved
- **Bounded context(s):** shared (SEO), composition, UI
- **Related:** issue #22, spec 004 (season overview pages), spec 006 (site essentials), spec 023
  (site shell)

## 1. Goal

Readers who use a feed reader have no way to follow the site. This feature publishes an RSS 2.0
feed at `/rss.xml` with one item per month that links to the month page and names the produce at
its peak, so a subscriber sees „what is in season in <month>“ without visiting the site. Every
page advertises the feed in its `<head>` (RSS autodiscovery) and the footer links to it. The
owner decided on 2026-11-13 „Само RSS засега“: the newsletter signup of issue #22 is deferred.

## 2. User stories

- As a reader with a feed reader, I want to subscribe to the site, so that I learn what is in
  season each month.
- As a reader, I want each feed item to name the produce at its peak, so that I can decide whether
  to open the month page.
- As a reader whose browser or reader detects feeds, I want every page to point to the feed, so
  that I can subscribe from any page.
- As a reader without a feed-detecting browser, I want a visible link to the feed in the footer.

## 3. Scope

### In scope

- Dependency `@astrojs/rss` (exact version 4.0.19).
- `src/pages/rss.xml.ts`: a static endpoint that builds the feed at build time.
- `src/components/season/monthlyFeed.ts`: pure builders of the channel and its 12 items, next to
  `seasonJsonLd.ts` (same inputs: season overviews and the site URL).
- `routes.feed` (`/rss.xml`) and `FEED_MEDIA_TYPE` (`application/rss+xml`), the one constant
  for the RSS media type, used by `Seo` and the endpoint.
- `latestMonthStart(month, now)` in `src/composition/clock.ts`, next to `yearInTimeZone`.
- `escapeXml(text)` in `src/shared/seo/xml.ts`.
- A `/rss.xml` rule in `public/_headers` (Cloudflare Pages).
- `ui.feed`: channel title and description, item description, footer link label.
- `Seo` renders the autodiscovery `<link rel="alternate">`; `BaseLayout` passes it the feed.
- `SiteFooter` gains a link to the feed in its „За сайта“ list.

### Out of scope

- Newsletter signup and any email collection (deferred by the owner).
- An XSL stylesheet for viewing the feed in a browser.
- Atom or JSON Feed formats.
- Per-produce, per-region or per-farm feeds.
- `content:encoded` with the full month page.

## 4. Domain model

No domain change. The feed is a read model built from the existing `SeasonOverviewService`
(`overviewFor(month)` for each of the 12 months) in `src/components/season/monthlyFeed.ts`:

- `MonthlyFeedItem { title, link, guid, description, pubDate }`. The builder does not import the
  library; the endpoint maps `guid` to the item's `customData`.
- `monthlyFeedItems(overviews, siteUrl, now): ReadonlyArray<MonthlyFeedItem>`: mapping only.
- `latestMonthStart(month, now, timeZone = Europe/Sofia): Date` (`src/composition/clock.ts`): 00:00
  on the most recent first day of `month` that is not after `now`, local time in `timeZone`.
- `escapeXml(text)` (`src/shared/seo`): replaces `&`, `<`, `>`, `"` and `'` with entities.
- `monthlyFeedChannel(siteUrl)`: title, description, site link, language and self URL.

## 5. Behaviour and edge cases

- **Feed URL:** `/rss.xml`, generated at build time (`output: 'static'`), served by the static
  host. The endpoint responds with the library's `Content-Type: application/xml`; in production
  `public/_headers` sets `Content-Type: application/rss+xml; charset=utf-8` for `/rss.xml`.
- **Channel:**
  - `title`: „Сезон – какво е в сезон в България“ (`ui.feed.title`).
  - `description`: „Всеки месец: кои плодове, зеленчуци и подправки са в сезон в България.“.
  - `link`: the site root (`<site>/`).
  - `language`: `bg`.
  - `atom:link rel="self" type="application/rss+xml"` with the absolute feed URL (RSS Best
    Practices Profile §5.1.1), via the library's `xmlns` and `customData` options. The URL is
    XML-escaped.
- **Items:** exactly 12, one per month, newest first (ordered by `pubDate`, descending, so the
  build month comes first).
  - `title`: `ui.monthPage.title(month)`, e.g. „Какво е в сезон през ноември“.
  - `link`: the absolute URL of `routes.month(month)`, without a trailing slash.
  - `guid`: `<link>#<year>` with `isPermaLink="false"`, where `<year>` is the Europe/Sofia
    calendar year of the item's `pubDate` (January's `pubDate` 2025-12-31T22:00Z gives 2026). The
    guid changes when the month starts again, so feed readers show the item as new each year. The
    endpoint passes it, XML-escaped, as the item's `customData`
    (`<guid isPermaLink="false">…</guid>`), which replaces the library's default permalink guid.
  - `description`: plain text, no HTML, built from data:
    - with peak produce: „През ноември в разгара на сезона: зеле, праз и спанак. Виж всичко,
      което е в сезон в България през ноември.“ The names keep the repository order, start in
      lower case inside the sentence, and the last two are joined with „и“.
    - without peak produce: „През <месец> нищо не е в разгара на сезона. Виж какво е в сезон в
      България през <месец>.“
  - `pubDate`: optional in RSS 2.0. The feed sets it to the first day of the item's month at
    00:00 Europe/Sofia, in the build year when that day is not after the build time, otherwise in
    the previous year. A date in the future is never emitted, because aggregators may hide such
    items until that date (RSS 2.0 specification, `<pubDate>`). The daily rebuild moves an item's
    date forward by one year when its month starts again.
- **Autodiscovery:** every page (404 included) has, in `<head>`,
  `<link rel="alternate" type="application/rss+xml" title="Сезон – какво е в сезон в България"
href="<site>/rss.xml">`. The `href` is absolute, as RSS Autodiscovery §3.1 recommends.
- **Footer:** the „За сайта“ list gains „RSS абонамент“ linking to `/rss.xml`, after
  „Методология“.
- **Errors:** a missing `site` throws `InvalidConfigurationError` (`requireSiteUrl`), failing the
  build.

## 6. Accessibility requirements

- WCAG 2.2 AA 2.4.4 (link purpose): the footer link text „RSS абонамент“ says where it leads.
- 2.5.8 (target size): the link reuses the footer links' `min-height: var(--target-min)`.
- 1.4.3 (contrast): the link uses the existing footer link colours; no new colours.
- Semantic structure: the link is a `<li>` in the existing `<nav aria-label="За сайта">` list; no
  heading changes.
- Keyboard: reachable in source order after „Методология“; existing `:focus-visible` styles apply.
- Works without JavaScript and without CSS (a plain list item link).
- The autodiscovery `<link>` is in `<head>` and has no accessibility impact.
- Zero axe violations on the pages already audited.

## 7. SEO requirements

- The feed's item links are the canonical month URLs (no trailing slash), so they match the
  sitemap and the pages' `<link rel="canonical">`.
- The autodiscovery link is on every page, with an absolute URL.
- The feed is not added to the sitemap (it is not an HTML page).
- Page titles, descriptions and structured data do not change.
- Lighthouse SEO and Best Practices stay at 100.

## 8. Acceptance criteria

1. **AC1:** Given the 12 season overviews, when `monthlyFeedItems` runs, then it returns 12 items,
   one per month, each titled `ui.monthPage.title(month)`.
2. **AC2:** Given the site URL, when `monthlyFeedItems` runs, then every item's `link` is the
   absolute URL of that month's page, without a trailing slash.
3. **AC3:** Given a month with peak produce, when its item is built, then its description names
   every peak produce in lower case, joins the last two with „и“, and contains no HTML; given a
   month without peak produce, then the description says nothing is at its peak.
4. **AC4:** Given a build time, when `latestMonthStart(month, now)` runs, then it returns 00:00 Europe/Sofia
   on the first day of `month` in the build year if that is not after `now`, otherwise in the
   previous year; and the items are ordered by `pubDate`, newest first.
5. **AC5:** Given the site URL, when `monthlyFeedChannel` runs, then it returns the channel title,
   description, the site root as link, language `bg` and the absolute self URL `<site>/rss.xml`.
6. **AC6:** Given any page, when `BaseLayout` renders, then `<head>` contains
   `<link rel="alternate" type="application/rss+xml">` with the channel title and the absolute feed
   URL.
7. **AC7:** Given the footer, when it renders, then the „За сайта“ list links to `/rss.xml` with the
   text „RSS абонамент“.
8. **AC8:** Given the built site, when `dist/rss.xml` is parsed as XML, then it is well-formed RSS
   2.0 with language `bg`, an `atom:link rel="self"`, 12 items each with a title, an absolute
   link, a guid with `isPermaLink="false"` equal to the link, `#` and the Sofia year of the
   `pubDate`, a plain-text description and a `pubDate` not in the
   future; and the preview server serves it with an XML content type (e2e).
9. **AC9:** Given the built site, when any HTML page in `dist` is read, then it has exactly one RSS
   autodiscovery link (e2e).
10. **AC10:** Pages with the new footer link keep zero axe violations and Lighthouse scores
    (existing e2e axe tests and `pnpm lhci`).
11. **AC11:** Given a build time, when `monthlyFeedItems` runs, then each item's `guid` is its link,
    `#` and the Europe/Sofia year of its `pubDate`; on 2026-11-13 January's guid ends in `#2026`
    and December's in `#2025`, and on 2027-01-05 January's ends in `#2027` and December's in
    `#2026`.
12. **AC12:** Given text with `&`, `<`, `>`, `"` or `'`, when `escapeXml` runs, then each is replaced
    by its XML entity.
13. **AC13:** Given the source, then `Seo.astro` and `rss.xml.ts` take the RSS media type from the
    single `FEED_MEDIA_TYPE` constant.
14. **AC14:** Given `public/_headers`, then `/rss.xml` has
    `Content-Type: application/rss+xml; charset=utf-8`.

## 9. Test plan

| AC                 | Test type | Test file                                                                     |
| ------------------ | --------- | ----------------------------------------------------------------------------- |
| AC1–AC3, AC5, AC11 | unit      | `tests/unit/components/season/monthlyFeed.test.ts`                            |
| AC4                | unit      | `tests/unit/composition/clock.test.ts` (dates), `monthlyFeed.test.ts` (order) |
| AC12               | unit      | `tests/unit/shared/seo/xml.test.ts`                                           |
| AC13–AC14          | unit      | `tests/unit/repo/rss-047.test.ts`                                             |
| AC6                | component | `tests/components/BaseLayout-047.test.ts`                                     |
| AC7                | component | `tests/components/SiteFooter-047.test.ts`                                     |
| AC8–AC9            | e2e       | `tests/e2e/rss-feed.spec.ts`                                                  |
| AC10               | e2e, LHCI | existing axe specs, `lighthouserc.cjs` (`pnpm lhci`)                          |

## 10. Third-party documentation consulted

| Package / source  | Version | Source                                                                                   | Topic                                                                            |
| ----------------- | ------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| @astrojs/rss      | 4.0.19  | Context7 `/withastro/docs` (`recipes/rss.mdx`: setting up, generating items, stylesheet) | `rss()` endpoint, item fields, optional `pubDate`                                |
| @astrojs/rss      | 4.0.19  | `node_modules/@astrojs/rss/dist/index.d.ts`, `index.js`, `util.js`                       | `RSSOptions`, `xmlns`, `customData`; item `customData` replaces the default guid |
| astro             | 7.4.8   | Context7 `/withastro/docs` (static file endpoints), existing `src/pages/robots.txt.ts`   | `APIRoute` endpoint generating `rss.xml` at build time                           |
| RSS 2.0           | 2.0.11  | https://www.rssboard.org/rss-specification                                               | Item elements optional, `pubDate` format and future dates                        |
| RSS Profile       | current | https://www.rssboard.org/rss-profile (§5.1.1 `atom:link`)                                | Self link                                                                        |
| RSS Autodiscovery | 1.0     | https://www.rssboard.org/rss-autodiscovery                                               | `<link rel="alternate">`, absolute `href`                                        |
| Cloudflare Pages  | current | developers.cloudflare.com/pages/configuration/headers                                    | `_headers` rule for `/rss.xml`                                                   |
