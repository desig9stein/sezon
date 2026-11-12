# 029. Region pages and the linked province map

- **Status:** Approved
- **Bounded context(s):** geography, catalog, farms (read across in the composition root), UI
- **Related:** issues #13 (region pages) and #12 (accessible SVG map), epic #31 (Phase 3),
  spec 026 (province map asset), spec 019/021 (farms)

## 1. Goal

Readers ask „какво расте около мен“ and „има ли ферма наблизо“. The site already knows which
provinces each produce grows best in and where each farm is, but it shows that only on produce
pages. This feature adds a page per province with that data, an overview of all 28 provinces with
a clickable map, and links to the province pages from produce pages and farm cards.

## 2. User stories

- As a reader, I want to open my province and see what grows there and which farms are there.
- As a reader on a produce page, I want to follow a growing region to see what else grows there.
- As a keyboard or screen-reader user, I want the map's provinces to be real links with names, and
  the same links as a plain list.

## 3. Scope

### In scope

- **`/regioni`:** `h1` „Области“, a short intro, the province map with every province that has a
  page marked and linked, and a list of all 28 provinces in Bulgarian alphabetical order. Each item
  shows the name (a link when the province has a page) and its counts („3 продукта · 1 ферма“) or
  „Още няма данни“.
- **`/regioni/<slug>`** for each province with at least one growing produce or one farm:
  - `h1` with the province name;
  - the map with that province marked;
  - `h2` „Какво расте тук“ with the produce (link plus the editorial note), or an empty state;
  - `h2` „Местни ферми“ with the farms there, shown as farm cards, or an empty state.
- **`ProvinceMap`:** takes the province hrefs. A province with an href is a keyboard-focusable
  link with the province name as its accessible name; the rest are decorative. Marked provinces
  are filled with the accent colour and a hatch pattern, so they are not shown by colour alone.
- **Links:** produce page growing regions (in the list and on its map, whose role becomes
  `group`) and farm cards link to the province page. The catalogue
  page (`/katalog`) gets a „Области“ section, and `/regioni` counts as part of the catalogue in the
  header.
- **Structured data:** region pages carry `AdministrativeArea` with `containedInPlace` Bulgaria;
  `/regioni` carries `CollectionPage`. Both carry `BreadcrumbList`.

### Out of scope

- **Province descriptions** (issue #13 asks for them): they need sourced facts, and nothing may be
  invented. A follow-up content issue covers them.
- **Pages for provinces without data:** these would be thin pages. The overview still lists them.
- Filtering by season on the region page.

## 4. Domain model

No entity changes. A new read model `RegionPagesQuery` in `src/composition/` (cross-context, like
`ProduceDetailsQuery`):

- `overview()`: every region in name order as `{ region, produceCount, farmCount, hasPage }`.
- `pageSlugs()`: the slugs of regions with a page.
- `forSlug(slug, on)`: `{ region, produce: [{ produce, note }], farms: FarmWithRegion[] }`.
  - Produce is in repository order.
  - Farms put sponsored first, like the produce page, and are certified organic on the day of
    `on`.
  - Throws `RegionNotFoundError` for an unknown slug.

`hasPage` is true when `produceCount + farmCount > 0`.

## 5. Behaviour and edge cases

- A region with produce but no farms shows the farms empty state „Все още няма добавени ферми от
  тази област.“, and the reverse shows „Все още няма продукти, свързани с тази област.“
- A produce lists the same region at most once (content schema), so a region page lists a produce
  once.
- Sofia city lies inside Sofia province: the map keeps the drawing order from spec 026, so both
  stay visible and clickable.
- Without CSS, the map keeps its attribute size and the list remains the main way to navigate.
- No JavaScript.

## 6. Accessibility requirements

- One `h1`; `h2` sections; no skipped levels (1.3.1, 2.4.6).
- Map with links: the SVG has `role="group"` named by its `<title>`. Each linked province is an
  `<a>` with `aria-label` set to the province name and a visible focus outline in the focus colour
  (2.4.7). Unlinked provinces are `aria-hidden`.
- Map without links (the produce page with no growing region linked, or as before) keeps
  `role="img"`.
- Marked provinces: accent fill plus a hatch pattern (1.4.1), at least 3:1 against unmarked
  provinces (1.4.11).
- The text list repeats every map link, so small provinces need no 24 px target (2.5.8,
  equivalent-control exception).
- Zero axe violations in light and dark mode.

## 7. SEO requirements

- Region page title: „<Име>: какво расте и местни ферми“ (≤ 60). Description from a template
  naming the province (70–160).
- `/regioni` title „Области на България: какво расте къде“ with its own description.
- JSON-LD:
  - `AdministrativeArea`: `name`, `url`, `containedInPlace` `{ @type: Country, name: България }`.
  - `CollectionPage` listing the region pages.
  - `BreadcrumbList`: Начало › Области › <Име>.
- Internal links: produce ↔ region and farm → region.

## 8. Acceptance criteria

1. **AC1:** Given produce growing in Plovdiv and a farm in Pleven, when `overview()`, then every
   region is listed in Bulgarian name order with its counts, and `hasPage` is true only for regions
   with a produce or a farm.
2. **AC2:** Given Plovdiv, when `forSlug('plovdiv', date)`, then it returns the region, its produce
   with notes in repository order, and its farms sponsored first with `certifiedOrganic` for the
   date.
3. **AC3:** Given an unknown slug, when `forSlug`, then it throws `RegionNotFoundError`.
4. **AC4:** Given `ProvinceMap` with hrefs for Plovdiv and Pleven, then the SVG has
   `role="group"`. Exactly two provinces are `<a>` elements, with those hrefs and their names as
   `aria-label`, and the other paths are `aria-hidden`.
5. **AC5:** Given `ProvinceMap` with no hrefs, then it renders as before, with `role="img"` and no
   links.
6. **AC6:** Given marked provinces, then their fill uses the hatch pattern defined in the SVG.
7. **AC7:** Given the built site, then `/regioni` and one page per region with data exist, there is
   no page for a region without data, and the `/regioni` list has 28 items with links only to
   existing pages.
8. **AC8:** Given the Plovdiv page, then it has the `h1` „Пловдив“, the map with Plovdiv marked,
   the produce list with links to produce pages, the farm section, `AdministrativeArea` and
   `BreadcrumbList` JSON-LD, and a title of at most 60 characters.
9. **AC9:** Given a produce page, then each growing region name links to its region page; given a
   farm card, then its province links to its region page.
10. **AC10:** Given `/katalog`, then it links to `/regioni`; given `/regioni/*`, then the header
    marks „Каталог“ as the current area.
11. **AC11:** Given `/regioni` and a region page in light and dark mode, then axe reports no
    violations, the map links are reachable with Tab, and the pages are readable without CSS.
12. **AC12:** Given the region title and description builders, then for every region the title is
    at most 60 and the description 70–160 characters.

## 9. Test plan

| AC   | Test type | Test file                                         |
| ---- | --------- | ------------------------------------------------- |
| AC1  | unit      | `tests/unit/composition/RegionPagesQuery.test.ts` |
| AC2  | unit      | `tests/unit/composition/RegionPagesQuery.test.ts` |
| AC3  | unit      | `tests/unit/composition/RegionPagesQuery.test.ts` |
| AC4  | component | `tests/components/ProvinceMap-029.test.ts`        |
| AC5  | component | `tests/components/ProvinceMap-029.test.ts`        |
| AC6  | component | `tests/components/ProvinceMap-029.test.ts`        |
| AC7  | e2e       | `tests/e2e/region-pages.spec.ts`                  |
| AC8  | e2e       | `tests/e2e/region-pages.spec.ts`                  |
| AC9  | e2e       | `tests/e2e/region-pages.spec.ts`                  |
| AC10 | e2e       | `tests/e2e/region-pages.spec.ts`                  |
| AC11 | e2e       | `tests/e2e/region-pages.spec.ts`                  |
| AC12 | unit      | `tests/unit/i18n/regionMeta.test.ts`              |

## 10. Third-party documentation consulted

| Package / source    | Version | Source (URL or Context7 ID)                                                | Topic                                                                                                                                                                                                                                                                     |
| ------------------- | ------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema.org          | main    | `/schemaorg/schemaorg` (Context7), releases notes                          | `containedIn` was renamed `containedInPlace` (range Place). schema.org itself is not reachable from the build session; the `AdministrativeArea` → `Place` and `Country` → `AdministrativeArea` hierarchy is to be confirmed in the Rich Results Test before launch (#34). |
| MDN SVG `<a>`       | –       | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/a       | Links inside inline SVG                                                                                                                                                                                                                                                   |
| MDN SVG `<pattern>` | –       | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/pattern | Hatch fill                                                                                                                                                                                                                                                                |
| Astro               | 7.4.8   | `/withastro/docs` (Context7), `getStaticPaths`                             | Dynamic routes for regions                                                                                                                                                                                                                                                |
