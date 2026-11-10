# 005. Produce detail page

- **Status:** Approved
- **Bounded context(s):** catalog, geography, farms (read model in composition), UI
- **Related:** specs 002–004

## 1. Goal

Give every fruit, vegetable, herb and nut its own page with everything a shopper needs:
when it is in season (month by month), nutrition facts with % of the EU reference intake,
how to prepare it to keep its nutrients, traditional uses (clearly not medical advice),
the regions that grow it best, local farms with contacts, how to choose and store it, FAQ and
sources. The page is the main SEO landing page for queries such as „ябълки сезон“,
„хранителни стойности на спанак“ or „откъде да купя орехи“.

## 2. User stories

- As a shopper, I want to see if a product is in season now and in which months, so that I buy it at its best.
- As a health-conscious user, I want nutrition values per 100 g with % of the daily reference intake and a source.
- As a cook, I want preparation tips that keep nutrients.
- As a user interested in tradition, I want to read traditional (Ayurveda, folk) uses with sources and a clear disclaimer.
- As a buyer, I want to know which regions grow it best and contact local farms directly.

## 3. Scope

### In scope

- Route `src/pages/[section]/[slug].astro` generating one page per produce at
  `routes.produce(produce)` (`/plodove/…`, `/zelenchutsi/…`, `/podpravki/…`, `/yadki/…`).
- Read model `ProduceDetailsQuery` (`src/composition/ProduceDetailsQuery.ts`): combines produce,
  group, nutrients, regions and farms through repository interfaces (constructor injection).
- Components: `SeasonCalendarList`, `NutritionTable`, `TraditionalUses`, `FarmList`, `SourceList`.
- JSON-LD builders: `articleJsonLd`, `faqPageJsonLd`.
- Bulgarian number and date formatting helpers in `src/i18n/bg.ts`.

### Out of scope

- Section index pages (`/plodove`), region pages, farm pages (Phases 2–3): not linked yet.
- Images, recipes, search.

## 4. Domain model

`ProduceDetails` (read model, frozen):

| Field            | Content                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `produce`        | The `Produce`.                                                                            |
| `group`          | Its `ProduceGroup`.                                                                       |
| `micronutrients` | `{ nutrient: Nutrient; amount: number; percentOfReferenceIntake: number }[]`, data order. |
| `growingRegions` | `{ region: Region; note: string }[]`, data order.                                         |
| `farms`          | Farms that sell the produce, sorted by Bulgarian name (sponsored farms first).            |
| `sources`        | Unique sources (nutrition source first, then traditional-use sources), by URL+name.       |

`ProduceDetailsQuery.forSlug(slug)` throws `ProduceNotFoundError` for an unknown slug and
`BrokenReferenceError` when a referenced group, nutrient or region is missing.
`ProduceDetailsQuery.allSlugs()` returns every produce for static paths.

## 5. Behaviour and edge cases

- **Page title:** „<Име> – сезон, хранителни стойности и ферми“ (≤ 60 with the site suffix);
  if too long, fall back to „<Име> – сезон и хранителни стойности“, then „<Име>“.
- **Description:** `produce.summary`.
- **Header:** `<h1>` name; Latin name in `<i lang="la">`; kind label; botanical family
  („Семейство: Кръстоцветни (Brassicaceae)“); summary.
- **Now:** status for the build month: „През <месец>: <level label>“ or „През <месец>: извън сезона“.
- **Season calendar:** a list of the 12 months; each month links to its month page and shows the
  level label (or „Извън сезона“) as text plus icon; the build month is marked `aria-current="date"`.
- **Nutrition table:** caption „Хранителни стойности на 100 г“; rows for energy (kcal), protein,
  fat, carbohydrates, of which sugars (if present), fibre (g); then each micronutrient with
  amount + unit and „% РСП“ (reference intake). Numbers use Bulgarian formatting (decimal comma,
  at most 2 decimals; percentages as integers). Below: source link and a note that РСП is the
  EU reference intake for adults (Regulation (EU) 1169/2011).
- **Preparation:** heading „Как да го приготвим, за да запази хранителните си вещества“ and a
  description list (method → tip).
- **Traditional uses:** rendered only when present; heading „Традиционна употреба“; a visible
  disclaimer that this describes tradition, not medical advice; each use with its system label
  („Аюрведа“, „Народна медицина“) and a source link.
- **Regions:** heading „Откъде е най-добре да се купува“; list of region names with notes.
- **Farms:** heading „Местни ферми“; each farm with name, region name, description and links:
  website (`rel="noopener"`, opens in the same tab), `mailto:`, `tel:`. Placeholder farms show
  the label „Примерни данни“; sponsored farms show „Спонсорирано“. With no farms:
  „Все още няма добавени ферми за този продукт.“
- **How to choose / storage:** headings „Как да изберем“ and „Как да съхраняваме“.
- **FAQ:** heading „Често задавани въпроси“; each question as `<h3>`, answer as paragraph;
  rendered only when present.
- **Sources and freshness:** heading „Източници“; the unique sources; „Обновено на
  <дата>“ in a `<time datetime>`; when `reviewStatus` is `draft`, the note
  „Данните очакват редакторска проверка.“

## 6. Accessibility requirements

- One `h1`; sections are `<section aria-labelledby>` with `h2`; no skipped levels (FAQ uses `h3`).
- Latin names marked `lang="la"` (WCAG 3.1.2).
- Nutrition table: `<caption>`, `<th scope="col">` headers, `<th scope="row">` for each nutrient
  row; numbers right-aligned; the table scrolls inside a focusable, labelled region on narrow
  screens instead of causing page overflow (WCAG 1.4.10).
- Season calendar months: level conveyed by text, not only colour or icon (1.4.1).
- Links have descriptive text: „Уебсайт на <ферма>“, „Имейл до <ферма>“, „Телефон на <ферма>:
  <номер>“; source links use the source name.
- Disclaimer for traditional uses is plain visible text placed before the list.
- No JavaScript; all content visible without interaction.

## 7. SEO requirements

- Canonical `routes.produce(produce)`; `og:type` `article`.
- JSON-LD: `BreadcrumbList` (Начало › <Име>), `Article` (`headline`, `description`,
  `inLanguage: bg`, `dateModified`, `mainEntityOfPage`, `about` `Thing` with `name` and
  `alternateName` = Latin name, `citation` = sources as `CreativeWork`), and `FAQPage` when
  there is FAQ content.
- Internal links: 12 month pages from the calendar; month pages already link to produce pages.

## 8. Acceptance criteria

1. **AC1:** Given seeded repositories, `ProduceDetailsQuery.forSlug` returns the produce, group, micronutrients with percentages, growing regions with notes, farms selling it (sponsored first, then by name) and unique sources.
2. **AC2:** Given an unknown slug, `forSlug` throws `ProduceNotFoundError`; given a missing group, nutrient or region, it throws `BrokenReferenceError`.
3. **AC3:** `produceTitle(name)` returns the longest title variant that fits 60 characters with the site suffix.
4. **AC4:** `formatNumber` uses a decimal comma and at most two decimals; `formatDate` returns e.g. „10 ноември 2026 г.“.
5. **AC5:** `articleJsonLd` and `faqPageJsonLd` return the shapes in section 7.
6. **AC6:** `SeasonCalendarList` renders 12 month links with level text (or „Извън сезона“) and marks the current month with `aria-current="date"`.
7. **AC7:** `NutritionTable` renders caption, column and row headers, formatted values, % РСП and the source link.
8. **AC8:** `TraditionalUses` renders the disclaimer before the uses, system labels and source links, and nothing when the list is empty.
9. **AC9:** `FarmList` renders farm contact links with descriptive names, the placeholder and sponsored labels, and the empty-state text.
10. **AC10:** Every produce page is built at its URL with one `h1`, canonical, `Article` + `BreadcrumbList` JSON-LD, and zero axe violations in light and dark mode and at 320 px (e2e).

## 9. Test plan

| AC      | Type      | Test file                                            |
| ------- | --------- | ---------------------------------------------------- |
| AC1–AC2 | unit      | `tests/unit/composition/ProduceDetailsQuery.test.ts` |
| AC3–AC4 | unit      | `tests/unit/i18n/bg.test.ts`                         |
| AC5     | unit      | `tests/unit/shared/seo/jsonLd.test.ts`               |
| AC6     | component | `tests/components/SeasonCalendarList.test.ts`        |
| AC7     | component | `tests/components/NutritionTable.test.ts`            |
| AC8     | component | `tests/components/TraditionalUses.test.ts`           |
| AC9     | component | `tests/components/FarmList.test.ts`                  |
| AC10    | e2e       | `tests/e2e/produce-page.spec.ts`                     |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                             | Topic                           |
| ---------------- | ------- | ---------------------------------------------------------------------------------- | ------------------------------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (guides/routing, `getStaticPaths` with multiple params) | `[section]/[slug]` static paths |
| ECMAScript Intl  | Node 22 | MDN `Intl.NumberFormat`, `Intl.DateTimeFormat` (`bg` locale)                       | Number and date formatting      |
| schema.org       | current | https://schema.org/Article, https://schema.org/FAQPage                             | JSON-LD shapes                  |
| EU 1169/2011     | 2011    | Annex XIII Part A                                                                  | Reference intakes (РСП)         |
| WCAG 2.2         | 2023    | Understanding 1.4.10 Reflow (tables exception, scrollable regions)                 | Responsive tables               |
