# 010. Section index pages for fruits, vegetables, herbs and nuts

- **Status:** Approved
- **Bounded context(s):** catalog (application), UI
- **Related:** specs 003–005, issue #4, epic #30

## 1. Goal

Give each produce kind its own index page (`/plodove`, `/zelenchutsi`, `/podpravki`, `/yadki`)
that lists every produce of that kind, grouped by how seasonal it is in the current month. The
pages are the natural parents of produce pages in the breadcrumbs, are linked from the main
navigation, and rank for broad queries such as „сезонни зеленчуци“.

## 2. User stories

- As a shopper, I want to see all vegetables at once with what is in season now first, so that
  I can plan what to buy.
- As a visitor on a produce page, I want a breadcrumb back to its section, so that I can browse
  similar produce.
- As a search user, I want a page per kind that answers „кои плодове са в сезон“.

## 3. Scope

### In scope

- Application service `SectionIndexService` (catalog) with `sectionFor(kind, month)`.
- Route helper `routes.section(kind)`.
- Page `src/pages/[section]/index.astro` (four static pages).
- Component `SectionIndex` (grouped lists of `ProduceCard`).
- JSON-LD builder `collectionPageJsonLd` in `src/shared/seo`.
- Header navigation links to the four sections.
- Produce page breadcrumbs: Начало › <Section> › <Produce> (changes spec 005, section 7).
- Lighthouse CI audits `/zelenchutsi`.

### Out of scope

- Filters, sorting controls and search (#8).
- Photos on cards (redesign #37 and content #38–#41).
- Botanical group pages (#5).

## 4. Domain model

`SectionIndex` (application read model, frozen):

| Field         | Content                                                         |
| ------------- | --------------------------------------------------------------- |
| `kind`        | The `ProduceKind`.                                              |
| `month`       | The `Month` the levels refer to (the build month on the pages). |
| `peak`        | Produce of the kind whose level in `month` is `peak`.           |
| `available`   | … level `available`.                                            |
| `storage`     | … level `storage`.                                              |
| `outOfSeason` | … with no level in `month`.                                     |
| `count`       | Total number of produce of the kind.                            |

Each list keeps the repository order (sorted by Bulgarian name). `SectionIndexService` takes a
`ProduceRepository` in its constructor.

## 5. Behaviour and edge cases

- Every produce of the kind appears in exactly one list.
- A kind with no produce yields four empty lists and `count` 0; the page then shows
  „Все още няма добавени продукти в този раздел.“ (still built, so navigation never 404s).
- Section names (plural, used for `h1`, navigation and breadcrumbs): „Плодове“, „Зеленчуци“,
  „Подправки“, „Ядки“.
- Page: `h1` section name; intro „Всички <section lowercase> в каталога, подредени по сезона през
  <месец>.“; groups in the order peak, available, storage, out of season, with headings
  „В разгара на сезона“, „Също в сезон“, „От хранилище“, „Извън сезона през <месец>“; empty
  groups are not rendered. Cards show the season badge for peak, available and storage; out of
  season cards show no badge (the heading states it).
- Title: „<Section> по сезони“ (+ site suffix, ≤ 60). Description:
  „<Section> в България: кои са в разгара на сезона през <месец>, кои са в сезон и кои идват от
  хранилище. Хранителни стойности и местни ферми.“, 70–160 characters for every kind and month.
- Header navigation: „Сезонът сега“, „Какво идва: <Месец>“, then the four sections in the
  order плодове, зеленчуци, подправки, ядки. The link of the current page has
  `aria-current="page"`; on a produce page the link of its section has `aria-current="true"`.
- Produce pages: breadcrumbs „Начало › <Section> › <Name>“.

## 6. Accessibility requirements

- One `h1`; each group is a `<section aria-labelledby>` with `h2`; cards use `h3`.
- Groups are lists (`<ul role="list">`) so the count is announced.
- Season level is text + icon + colour (badges, spec 004); out-of-season is stated in the
  heading text.
- Navigation stays a `<nav aria-label="Основна навигация">`; six links wrap without horizontal
  scroll at 320 px; each target ≥ 24 × 24 px. `aria-current="true"` marks the section of a
  produce page (WCAG 1.3.1; current location in a set).
- Readable without CSS (spec 009) and without JavaScript; zero axe violations in light and dark
  mode and at 320 px.

## 7. SEO requirements

- Canonical `/<section>`; unique title and description per section.
- JSON-LD: `CollectionPage` (`name`, `description`, `url`, `inLanguage: bg`, `mainEntity` =
  `ItemList` of every produce of the section in name order, absolute URLs) and
  `BreadcrumbList` (Начало › <Section>).
- Internal links: navigation → sections → produce pages; produce breadcrumbs → section.
- The sitemap includes the four section pages.

## 8. Acceptance criteria

1. **AC1:** Given produce of several kinds and levels, `sectionFor(kind, month)` returns only that kind, split into peak, available, storage and out of season, each in repository order, with `count`.
2. **AC2:** Given a kind without produce, `sectionFor` returns empty lists and `count` 0.
3. **AC3:** `routes.section(kind)` returns `/plodove`, `/zelenchutsi`, `/podpravki` and `/yadki`.
4. **AC4:** `collectionPageJsonLd` returns a `CollectionPage` with `inLanguage`, absolute `url` and an `ItemList` `mainEntity`.
5. **AC5:** For every kind and month, the section description is 70–160 characters and the full title is ≤ 60.
6. **AC6:** `SectionIndex` renders one labelled section per non-empty group with an `h2`, lists of cards, badges for seasonal groups, and the empty-state text when the kind has no produce.
7. **AC7:** `SiteHeader` links to the four sections in order, marks the current page with `aria-current="page"` and the section of a produce page with `aria-current="true"`.
8. **AC8:** The built site has `/plodove`, `/zelenchutsi`, `/podpravki` and `/yadki` with one `h1`, canonical, `CollectionPage` + `BreadcrumbList` JSON-LD and cards linking to every produce of the kind (e2e).
9. **AC9:** A produce page's breadcrumbs are Начало › <Section> › <Name>, and its `BreadcrumbList` has three items (e2e).
10. **AC10:** Section pages have zero axe violations in light and dark mode and at 320 px, and pass the readable-without-CSS checks (e2e).

## 9. Test plan

| AC       | Type      | Test file                                                             |
| -------- | --------- | --------------------------------------------------------------------- |
| AC1–AC2  | unit      | `tests/unit/contexts/catalog/application/SectionIndexService.test.ts` |
| AC3      | unit      | `tests/unit/components/routes.test.ts`                                |
| AC4      | unit      | `tests/unit/shared/seo/jsonLd-010.test.ts`                            |
| AC5      | unit      | `tests/unit/i18n/bg-010.test.ts`                                      |
| AC6      | component | `tests/components/SectionIndex.test.ts`                               |
| AC7      | component | `tests/components/SiteHeader-010.test.ts`                             |
| AC8–AC10 | e2e       | `tests/e2e/section-pages.spec.ts`                                     |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                       | Topic                                    |
| ---------------- | ------- | ---------------------------------------------------------------------------- | ---------------------------------------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (guides/routing: `[param]/index.astro`, priority) | Section route next to `[section]/[slug]` |
| schema.org       | current | https://schema.org/CollectionPage, https://schema.org/ItemList               | `CollectionPage` with `mainEntity`       |
| WAI-ARIA 1.2     | 2023    | w3.org/TR/wai-aria-1.2/#aria-current                                         | `aria-current="page"` vs `"true"`        |
