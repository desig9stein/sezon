# 004. Season overview: home page and month pages

- **Status:** Approved
- **Bounded context(s):** catalog (application), seasonality, UI
- **Related:** specs 001–003, ADR-0001

## 1. Goal

Show visitors what is in season in Bulgaria. The home page shows the current month
(Europe/Sofia, at build time); twelve month pages (`/sezon/<month>`) show any month.
Each page groups produce by how seasonal it is, so users can choose the freshest local food.

## 2. User stories

- As a shopper, I want to open the site and immediately see what is at its peak this month.
- As a planner, I want to see any month of the year, so that I know what to expect.
- As a user, I want to see what is coming next month, so that I can look forward to it.
- As a search user, I want a page that answers „какво е в сезон през ноември“.

## 3. Scope

### In scope

- Application service `SeasonOverviewService` (catalog context) with `overviewFor(month)`.
- Components: `ProduceCard`, `SeasonBadge`, `SeasonOverview` (the grouped sections), `MonthPager`.
- Pages: `src/pages/index.astro` (current month) and `src/pages/sezon/[month].astro` (12 pages).
- JSON-LD: `ItemList` of fresh produce on both pages; `WebSite` on the home page;
  `BreadcrumbList` on month pages.
- Produce URL helper: fruit → `/plodove/<slug>`, vegetable → `/zelenchutsi/<slug>`,
  herb → `/podpravki/<slug>`, nut → `/yadki/<slug>`.

### Out of scope

- Produce detail pages (spec 005), filters, search, images.
- A client-side "month has changed" notice: the daily rebuild (ADR-0001) keeps the home page
  current, and revealing a notice after load would cause layout shift. This replaces the
  fallback script mentioned in `docs/PLAN.md`.

## 4. Domain model

`SeasonOverview` (application read model):

| Field        | Content                                                               |
| ------------ | --------------------------------------------------------------------- |
| `month`      | The `Month`.                                                          |
| `peak`       | Produce whose level in `month` is `peak`.                             |
| `available`  | Produce whose level in `month` is `available`.                        |
| `storage`    | Produce whose level in `month` is `storage`.                          |
| `comingSoon` | Produce with no level in `month` and a fresh level in `month.next()`. |

Each list is sorted by Bulgarian name and frozen. `SeasonOverviewService` takes a
`ProduceRepository` in its constructor.

## 5. Behaviour and edge cases

- Every produce appears in at most one of `peak`, `available`, `storage`, `comingSoon`.
- December's `comingSoon` uses January (wrap-around).
- Produce whose next month is only `storage` is not "coming soon".
- `freshCount` = `peak.length + available.length`.
- Group headings: „В разгара на сезона“ (peak), „Също в сезон“ (available), „Идват скоро“,
  „От хранилище“.
- Coming-soon cards show next month's level with an explicit prefix, e.g.
  „От декември: Разгар на сезона“, so a card never claims a status that is false for the page's month.
- `ItemList` JSON-LD is omitted when nothing is fresh.
- The description builder skips names that do not fit and keeps trying shorter later names;
  length limits come from `@shared/seo` and are counted in code points.
- Produce names are unique (seed-data test).
- Empty groups are not rendered. If all groups are empty, the page shows
  „Няма данни за този месец.“
- Home page: `<h1>` „В сезон през <месец>“ (month in lowercase), intro paragraph, only the
  peak and coming-soon groups (a highlight, not a copy of the month page), a link
  „Вижте всичко в сезон през <месец>“ to the current month page, and a link to next month's page.
- Month page: `<h1>` „Какво е в сезон през <месец>“, the overview, and `MonthPager` with links
  to the previous and next month (wrap-around), each with an accessible name such as
  „Предишен месец: Октомври“.
- `ProduceCard`: the name links to the produce URL; shows the kind label and a `SeasonBadge`
  when a level is given. The card's heading level is configurable (default `h3`).
- `SeasonBadge`: icon (decorative, `aria-hidden`) + visible text label from `ui.seasonLevels`;
  background colour from the matching token. Information is never conveyed by colour alone.

## 6. Accessibility requirements

- One `<h1>` per page; each group is a `<section aria-labelledby>` with an `<h2>`; cards use `<h3>`.
- Groups render as lists (`<ul role="list">`) of cards, so screen readers announce the count.
- Season level is visible text, not only colour or icon (WCAG 1.4.1); badge contrast is covered
  by spec 003 token tests.
- Card links have the produce name as accessible name; the entire card is not a single big
  link (keeps content readable), and the link target is ≥ 24 × 24 px.
- `MonthPager` is a `<nav aria-label="Други месеци">`; link text is visible and descriptive.
- Layout reflows to one column at 320 px; no horizontal scrolling.
- No JavaScript.

## 7. SEO requirements

- Home: title „Какво е в сезон сега“ → „Какво е в сезон сега | Сезон“; description from
  `ui.home.description(month)` (70–160 chars); `WebSite` + `ItemList` JSON-LD.
- Month page: title „Какво е в сезон през <месец>“; description lists the first fresh
  produce names and stays within 70–160 characters for every month; canonical `/sezon/<slug>`;
  `BreadcrumbList` (Начало › <Месец>) + `ItemList` JSON-LD.
- `ItemList` items: `ListItem` with `position`, `name`, absolute `url` of the produce page.
- Internal links: every card links to its produce page; month pages link to adjacent months;
  the footer links to all months (spec 003).

## 8. Acceptance criteria

1. **AC1:** Given produce with various calendars, `overviewFor(month)` returns peak, available, storage and coming-soon lists per section 4, each sorted by Bulgarian name.
2. **AC2:** Given December, coming soon is computed from January.
3. **AC3:** Given produce that is out of season this month and only `storage` next month, it is not coming soon.
4. **AC4:** `produceUrl` returns the path for each kind.
5. **AC5:** `SeasonBadge` renders the icon as `aria-hidden` and the Bulgarian text label for each level.
6. **AC6:** `ProduceCard` renders a heading with a link to the produce URL, the kind label and the badge.
7. **AC7:** `SeasonOverview` renders one labelled section per non-empty group, lists of cards, and the empty-state text when all groups are empty.
8. **AC8:** `MonthPager` links to the previous and next months with descriptive accessible names, wrapping around the year.
9. **AC9:** `itemListJsonLd` returns a schema.org `ItemList` with positions and absolute URLs.
10. **AC10:** For every month, the month page description built by `ui.monthPage.description` is 70–160 characters.
11. **AC11:** The built site has `/index.html` and 12 `/sezon/<slug>.html` pages, each with one `h1`, canonical URL and valid JSON-LD (e2e).
12. **AC12:** Home and month pages have zero axe violations in light and dark mode and at 320 px width (e2e).

## 9. Test plan

| AC        | Type      | Test file                                                               |
| --------- | --------- | ----------------------------------------------------------------------- |
| AC1–AC3   | unit      | `tests/unit/contexts/catalog/application/SeasonOverviewService.test.ts` |
| AC4       | unit      | `tests/unit/components/routes.test.ts`                                  |
| AC5       | component | `tests/components/SeasonBadge.test.ts`                                  |
| AC6       | component | `tests/components/ProduceCard.test.ts`                                  |
| AC7       | component | `tests/components/SeasonOverview.test.ts`                               |
| AC8       | component | `tests/components/MonthPager.test.ts`                                   |
| AC9       | unit      | `tests/unit/shared/seo/jsonLd.test.ts`                                  |
| AC10      | unit      | `tests/unit/i18n/bg.test.ts`                                            |
| AC11–AC12 | e2e       | `tests/e2e/season-pages.spec.ts`                                        |

## 10. Third-party documentation consulted

| Package              | Version | Source                                                                         | Topic                                    |
| -------------------- | ------- | ------------------------------------------------------------------------------ | ---------------------------------------- |
| astro                | 7.4.8   | Context7 `/withastro/docs` (guides/routing: `getStaticPaths`)                  | Dynamic static routes, `params`, `props` |
| @playwright/test     | 1.63.0  | Context7 `/microsoft/playwright` (test configuration, `colorScheme`, viewport) | e2e setup                                |
| @axe-core/playwright | 4.14.0  | npm README `@axe-core/playwright` (`AxeBuilder`, `withTags`)                   | Accessibility scan                       |
| schema.org           | current | https://schema.org/ItemList                                                    | ItemList shape                           |
