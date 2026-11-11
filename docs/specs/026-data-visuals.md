# 026. Data visuals: province map, growing row, nutrition bars

- **Status:** Approved
- **Bounded context(s):** UI (produce page), geography (map asset)
- **Related:** issue #95 (slice 5 of #82), brief `docs/design/brief.md`, ADR-0006, specs 018,
  024, 025

## 1. Goal

Show three facts on the produce page as pictures as well as words. A map of Bulgaria's 28
provinces with the growing regions filled in, under „Откъде“. A garden row (sowing,
transplanting, planting) under the season calendar, so a gardener can compare it with the season
month by month. A bar beside each nutrient's percentage of the reference intake, so the table can
be scanned at a glance. Every visual repeats information that is also in text.

## 2. User stories

- As a shopper, I want to see where in Bulgaria the produce grows, without knowing the province
  names.
- As a gardener, I want the sowing months next to the season months, so I can see how far ahead
  to sow.
- As a reader of the nutrition table, I want to spot the strong nutrients without reading every
  number.

## 3. Scope

### In scope

- **Map data:** `scripts/map/build.ts` builds `src/assets/map/provinces.json` from Natural
  Earth's 1:10m admin-1 GeoJSON (public domain). It filters Bulgaria, maps ISO 3166-2 codes
  BG-01…BG-28 to the region slugs in `src/data/regions`, projects the boundaries
  (equirectangular, x scaled by the cosine of the mid latitude, 600 units wide), simplifies them
  (Douglas–Peucker, tolerance 0.9) and writes SVG path data with one decimal. The JSON is
  committed; the script runs only when the source changes.
- **`ProvinceMap.astro`:** a `figure` with an inline SVG of all 28 provinces. The given regions
  are filled with the accent colour, the others with the rule colour, separated by surface-coloured
  borders. The `figcaption` credits Natural Earth.
- **Produce page „Откъде“:** the map after the list of regions with notes, before the farms
  link.
- **Garden row in `SeasonCalendarList`:** when the produce has a growing guide, a second list of
  12 cells under the season months, introduced by a visible label „В градината“. Each cell shows
  the month abbreviation and the activities of that month („Сеитба“, „Разсаждане“,
  „Засаждане“, joined by „, “), or a dash with a hidden „нищо“ when there is none.
- **Nutrition bars:** in the „% РСП“ column, a small SVG bar after the percentage, filled to
  `min(percent, 100)` %. Rows without a reference intake have no bar.

### Out of scope

- Province links: region pages do not exist yet (Phase 3).
- Interactive map (hover, zoom, tooltips).
- Bars on the nutrient ranking table.

## 4. Domain model

No change. The map asset is keyed by region slug; a unit test keeps it in step with
`src/data/regions`.

## 5. Behaviour and edge cases

- **Map:** an unknown region slug passed to `ProvinceMap` throws `BrokenReferenceError` at build
  time. With no regions, all provinces use the rule colour and the label says no region is
  marked. Regions keep their data order in the label.
- **Map size:** the SVG has `width`/`height` attributes (320 × 209) so it stays small without CSS;
  CSS makes it fluid up to `30rem`. The viewBox keeps the ratio, so there is no layout shift.
- **Garden row:** omitted when the produce has no growing guide. The cells line up with the
  season cells at every breakpoint (12, 6 and 4 columns). Cells are not links.
- **Bars:** percentages above 100 fill the bar completely; 0 % draws only the track. The bar is
  decorative (`aria-hidden`) because the percentage is next to it.
- **Without CSS:** the map and bars keep their attribute sizes and fills (light palette values as
  attributes, like the year strip); the garden row reads as a labelled list.
- **Print:** fills switch to print ink: marked provinces solid, others white with ink borders;
  bars outlined with an ink fill.
- **Dark mode:** CSS classes override the attribute fills with the dark tokens.

## 6. Accessibility requirements

- 1.1.1: the map SVG has `role="img"`, a `<title>` and an `aria-label`
  „Карта на България. Отбелязани области: Пловдив, Кюстендил“; the same regions are listed in text
  above it.
- 1.3.1: the garden row is a `ul` labelled by its visible label via `aria-labelledby`.
- 1.4.1: no information by colour alone: the regions and the activities are also text; the bar
  repeats the percentage beside it.
- 1.4.11: marked provinces against unmarked ones ≥ 3:1 in both modes (contrast pair
  `accent`/`rule`).
- 1.4.10: no horizontal scroll at 320 px from the map or the row.
- Zero axe violations in light and dark mode; readable without CSS (spec 009 rules).

## 7. SEO requirements

- No change to titles, descriptions or JSON-LD. The map's text equivalent is the existing region
  list, which is indexed.

## 8. Acceptance criteria

1. **AC1:** Given the map asset, it has a path for every region in `src/data/regions` and no other
   keys, and a viewBox `0 0 600 <height>`.
2. **AC2:** Given `ProvinceMap` with Plovdiv and Kyustendil, it renders a `figure` with an SVG of
   28 paths, `role="img"`, a `<title>` and an `aria-label` naming both regions in order, exactly two
   paths marked `data-marked="true"`, `width="320"` and `height="209"`, and a caption crediting
   Natural Earth.
3. **AC3:** Given `ProvinceMap` with an unknown slug, rendering throws `BrokenReferenceError`.
4. **AC4:** Given `ProvinceMap` with no regions, no path is marked and the label says no region
   is marked.
5. **AC5:** Given a produce with a growing guide (sow March–April, transplant May), the calendar
   renders a second list labelled „В градината“ with 12 items: March and April read „Сеитба“, May
   reads „Разсаждане“, and the other nine read „нищо“ (hidden) with a visible dash.
6. **AC6:** Given a month with two activities, its cell reads both, joined by „, “.
7. **AC7:** Given a produce without a growing guide, the calendar has no garden row.
8. **AC8:** Given nutrition rows with 46 %, 150 % and no reference intake, the table renders an
   `aria-hidden` bar filled to 46 and 100 units of 100, and no bar for the row without one.
9. **AC9:** Given a produce page, the „Откъде“ section contains the map after the region list, and
   the season section contains the garden row; axe reports no violations in light and dark mode.
10. **AC10:** Given a produce page at 320 px without CSS, the map is at most 320 px wide, and at 320
    px with CSS, the page does not scroll horizontally.
11. **AC11:** Given the palettes, `accent` against `rule` is at least 3:1 in light and dark mode.

## 9. Test plan

| AC   | Test type | Test file                                         |
| ---- | --------- | ------------------------------------------------- |
| AC1  | unit      | `tests/unit/assets/provinceMap.test.ts`           |
| AC2  | component | `tests/components/ProvinceMap.test.ts`            |
| AC3  | component | `tests/components/ProvinceMap.test.ts`            |
| AC4  | component | `tests/components/ProvinceMap.test.ts`            |
| AC5  | component | `tests/components/SeasonCalendarList-026.test.ts` |
| AC6  | component | `tests/components/SeasonCalendarList-026.test.ts` |
| AC7  | component | `tests/components/SeasonCalendarList-026.test.ts` |
| AC8  | component | `tests/components/NutritionTable-026.test.ts`     |
| AC9  | e2e       | `tests/e2e/data-visuals.spec.ts`                  |
| AC10 | e2e       | `tests/e2e/data-visuals.spec.ts`                  |
| AC11 | unit      | `tests/unit/design/tokens.test.ts` (pair list)    |

## 10. Third-party documentation consulted

| Package / source      | Version            | Source (URL or Context7 ID)                                                                                 | Topic                                         |
| --------------------- | ------------------ | ----------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Natural Earth admin-1 | master, 2026-11-11 | https://github.com/nvkelso/natural-earth-vector/blob/master/geojson/ne_10m_admin_1_states_provinces.geojson | Province boundaries, `iso_3166_2` codes       |
| Natural Earth terms   | –                  | https://www.naturalearthdata.com/about/terms-of-use/                                                        | Public domain, credit optional (we credit it) |
| MDN SVG `<title>`     | –                  | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Element/title                                    | Accessible name of an SVG                     |
| Astro                 | 7.4.8              | `/withastro/docs` (Context7), `guides/imports.mdx` › JSON                                                   | Importing JSON in `.astro` frontmatter        |
