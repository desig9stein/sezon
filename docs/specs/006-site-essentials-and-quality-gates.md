# 006. Site essentials and quality gates

- **Status:** Approved
- **Bounded context(s):** UI, infrastructure
- **Related:** ADR-0001, specs 003–005

## 1. Goal

Finish Phase 1 so the site is deployable and provably meets the quality bar: a helpful 404
page, crawl directives, a sitemap, a favicon, security and caching headers for Cloudflare Pages,
and an automated check that every page template scores 100 in all four Lighthouse categories.

## 2. User stories

- As a visitor who follows a broken link, I want a friendly page that helps me find what is in
  season, so that I do not leave the site.
- As a search engine, I want `robots.txt` and a complete sitemap, so that every page is discovered.
- As the owner, I want CI to fail when any page drops below 100 in Lighthouse.

## 3. Scope

### In scope

- `src/pages/404.astro` (Cloudflare Pages serves `404.html` for unknown paths).
- `src/pages/robots.txt.ts` generated from the configured site URL.
- Sitemap via `@astrojs/sitemap`, excluding the 404 page.
- `public/favicon.svg` and its `<link rel="icon">`.
- `public/_headers` for Cloudflare Pages: security headers and long-lived caching of hashed assets.
- Lighthouse CI on `/`, a month page and a produce page with `minScore: 1` for all four categories.

### Out of scope

- Search, analytics, consent banner, advertising (later phases).

## 4. Domain model

None.

## 5. Behaviour and edge cases

- **404:** `<h1>` „Страницата не е намерена“, a short explanation, links to `/` and to the
  current month page, and the footer's month links. `<meta name="robots" content="noindex">`;
  no canonical link. Title „Страницата не е намерена | Сезон“.
- **robots.txt:** `User-agent: *`, `Allow: /`, `Sitemap: <site>/sitemap-index.xml`.
- **Sitemap:** every built page except `/404`.
- **Favicon:** SVG with a leaf on the accent colour; `<link rel="icon" href="/favicon.svg" type="image/svg+xml">`.
- **Headers (`/*`):** `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`,
  `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY`,
  `Content-Security-Policy` allowing only same-origin resources plus inline styles and
  JSON-LD (`default-src 'self'; style-src 'self' 'unsafe-inline'; script-src 'self';
img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'`).
  `/_astro/*`: `Cache-Control: public, max-age=31536000, immutable`.
- `BaseLayout` gains an optional `noindex` prop (robots `noindex, follow`, no canonical).

## 6. Accessibility requirements

- 404 page: one `h1`, landmarks from the layout, descriptive links, zero axe violations.
- Favicon is decorative and has no accessibility impact.

## 7. SEO requirements

- 404 page is `noindex` and excluded from the sitemap.
- `robots.txt` points to the sitemap with an absolute URL.
- Lighthouse SEO = 1 on all audited pages.

## 8. Acceptance criteria

1. **AC1:** `robotsTxt(siteUrl)` returns the directives in section 5 with an absolute sitemap URL.
2. **AC2:** `BaseLayout` with `noindex` renders `robots` `noindex, follow` and no canonical link.
3. **AC3:** Every page links the SVG favicon.
4. **AC4:** The built site contains `404.html` (with `noindex`), `robots.txt`, `sitemap-index.xml` (without `/404`) and `_headers` (e2e).
5. **AC5:** The 404 page has one `h1`, links to `/` and the current month, and zero axe violations (e2e).
6. **AC6:** Lighthouse scores 1.0 in Performance, Accessibility, Best Practices and SEO for `/`, `/sezon/noemvri` and `/zelenchutsi/zele` (LHCI).

## 9. Test plan

| AC      | Type       | Test file                              |
| ------- | ---------- | -------------------------------------- |
| AC1     | unit       | `tests/unit/shared/seo/robots.test.ts` |
| AC2–AC3 | component  | `tests/components/BaseLayout.test.ts`  |
| AC4–AC5 | e2e        | `tests/e2e/site-essentials.spec.ts`    |
| AC6     | lighthouse | `lighthouserc.cjs` (`pnpm lhci`)       |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                                | Topic                        |
| ---------------- | ------- | ------------------------------------------------------------------------------------- | ---------------------------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (guides/endpoints: static file endpoints; custom 404 page) | `robots.txt.ts`, `404.astro` |
| @astrojs/sitemap | 3.7.4   | `node_modules/@astrojs/sitemap` README / types (`filter`)                             | Excluding pages              |
| Cloudflare Pages | current | developers.cloudflare.com/pages/configuration/headers                                 | `_headers` file syntax       |
| @lhci/cli        | 0.16.0  | `node_modules/@lhci/cli` docs (`assert`, `collect.startServerCommand`)                | Assertions                   |
