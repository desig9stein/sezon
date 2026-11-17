# 060. Accessibility and small UI fixes

- **Status:** Implemented
- **Bounded context(s):** shared (source schema, citation language), catalog, recipes, geography
  (source types), farms UI (phone display), UI (produce page, province map, tables, year strip,
  nutrient pages, calendar), CMS (Keystatic source field)
- **Related:** spec 025 (produce page groups), spec 026 (data visuals), spec 029 (region pages and
  the linked map), spec 049 (season-only produce), spec 054 (Keystatic), spec 055 (cautions),
  persona usability tests P1, P2, P3 and P6 (November 2026), `DESIGN.md`. Spec 058 (content texts)
  and spec 059 (navigation, home order, search, farm list, RSS, calendar headings) are separate.

## 1. Goal

A usability round with six personas (one a blind NVDA user who moves by keyboard only, one a
phone user, one an older reader) found no blockers but a set of accessibility and small UI faults:
a link with no visible focus, English link text read with Bulgarian phonetics, tables whose most
useful column is off screen on a phone, scroll regions announced twice, an unexplained
abbreviation, duplicate Tab stops, glyphs that do not scale with text, unreadable phone numbers, a
link to an empty farm section and small inline link targets. This spec fixes them without changing
any content text or the navigation.

## 2. User stories

- As a sighted keyboard user, I want every focusable element on a produce page to show where the
  focus is, so that I never lose my place.
- As a screen-reader user, I want English titles of sources read in English, so that I understand
  them.
- As a phone user comparing vitamin C foods, I want to see whether each food is in season now
  without scrolling sideways.
- As a screen-reader user, I want a table announced once, and „% РСП“ explained before I hear it in
  the table.
- As a keyboard user, I want each destination once in the Tab order, so that a produce page takes
  fewer key presses.
- As a reader who enlarges text, I want the year strip on the home page to grow with the text.
- As a reader calling a farm, I want the phone number in readable groups.
- As a reader of a produce page that no farm sells yet, I do not want a contents link that leads to
  an empty section.
- As an older phone user, I want the produce links in tables to be easy to tap.

## 3. Scope

### In scope

1. **Focus visible on the map credit.** `ProvinceMap` removes the outline only from the links in
   the SVG (which draw their own ring), not from the „Natural Earth“ link in the caption.
2. **Language of source titles.** `sourceSchema` gains an optional `lang` (`bg` or `en`; absent
   means Bulgarian, the page language). The source types of catalog, recipes and geography carry
   it. Every source whose name has no Cyrillic letter declares `lang: en` in the data (USDA
   FoodData Central, PubMed and journal titles, NCHFP, CORDIS). A shared `SourceLink` component
   renders a source link with `lang` when the source is not Bulgarian, and every page that links a
   source uses it. Keystatic edits `lang` as a select (`bg`, `en`) that leaves `bg` out of the file.
3. **Ranking tables on phones.** The vitamin and mineral ranking tables (`/nutrienti/*`) put the
   „През <месец>“ column right after the produce name, so it is visible on a 390 px phone without
   scrolling. The table keeps `caption`, `th scope="col"` and `th scope="row"`.
4. **Scroll region name.** `ScrollTable` stays a focusable scroll region (it is needed at 200 %
   zoom and for the calendar), but its accessible name is the short „Таблица с хоризонтално
   превъртане“ instead of the caption, so the caption is not announced twice.
5. **„% РСП“ before the nutrition table.** The note that explains РСП moves from after the table to
   a paragraph before it, and the table refers to it with `aria-describedby`. The `abbr` in the
   column header stays.
6. **Duplicate Tab stops on produce pages.**
   - The produce page map is pointer-only: the text list above it is the keyboard and
     screen-reader path (spec 029 already says the list repeats every map link). The map links get
     `tabindex="-1"` inside an `aria-hidden` group, so the SVG group reads as its title alone (it
     stays `role="group"`: as `role="img"` axe reports `nested-interactive` for the links inside).
     Region pages and `/regioni` keep the keyboard-reachable map (spec 029 AC11).
   - The nutrition note names its source as text (`cite`, with `lang`) instead of a second link to
     the same URL; the link is in „Източници“.
7. **Year strip scales with text.** With CSS the strip is `1rem` tall (its drawn height at the
   default font size) and its width follows the viewBox ratio, so it doubles when the root font
   size doubles. It keeps its integer pixel `width` and `height` attributes, so without CSS it stays
   small (spec 012). Table row-header links drop their minimum height in print, so the printed
   calendar keeps its sheet count.
8. **Readable phone numbers.** A `formatPhone` function groups a Bulgarian E.164 number for
   display, joined by no-break spaces (html-validate `tel-non-breaking`): mobile (9 digits)
   `+359 899 909 310`, Sofia (`2` + 7 digits) `+359 2 123 4567`, other 8-digit numbers
   `+359 32 123 456`. The `tel:` href keeps the E.164 number. The accessible name
   uses the grouped number.
9. **No contents link to an empty farm section.** Without farms, the produce page leaves out the
   „Местни ферми“ contents entry and the „Местни ферми, които го продават“ link under „Откъде“. The
   farm section itself stays, with its empty text and the „Твоята ферма липсва?“ link.
10. **Target size of table and list links.** Links in table row headers (calendar, ranking,
    nutrition) and in the produce page region list are at least 24 px tall (new token
    `--target-compact: 1.5rem`), without changing the row layout.

### Out of scope

- Header navigation, home list and legend order, search, the farm list layout, RSS and calendar
  headings (spec 059).
- Any content text in `src/data/**` (spec 058); this spec adds only the `lang` key.
- The keyboard-reachable maps on `/regioni` and region pages (spec 029 AC11 keeps them).
- Inline links in running text (WCAG 2.5.8 inline exception).

## 4. Domain model

- `src/shared/domain/sourceLanguage.ts`: `SOURCE_LANGUAGES = ['bg', 'en']`, type
  `SourceLanguage`, `DEFAULT_SOURCE_LANGUAGE = 'bg'`.
- `Source` (catalog), `RecipeSource` (recipes) and `RegionSource` (geography) gain
  `readonly lang?: SourceLanguage | undefined`. No new invariant: an absent `lang` is Bulgarian.
- `sourceSchema` (shared infrastructure): `lang: z.enum(SOURCE_LANGUAGES).optional()`.
- `formatPhone(phone: string): string` in `src/components/farms/formatPhone.ts` (display only; a
  value that is not a Bulgarian E.164 number is returned unchanged).
- `produceToc(produce, counts)` takes `{ recipes, farms }` instead of a recipe count.

## 5. Behaviour and edge cases

- `SourceLink` sets `lang` only when the source's `lang` is set and differs from `bg`.
- A source name with no Cyrillic letter and no `lang` fails a content test; a source with
  `lang: bg` written out also fails (Keystatic would drop it, so the file would change on save).
- `formatPhone`: input must match `^\+359\d{8,9}$` (the schema guarantees it); anything else is
  returned as given.
- The farm section still renders when there are no farms; only links to it are left out.
- The ranking table empty state is unchanged.
- Without CSS: the map keeps its size; the moved РСП note reads before the table; no content is
  hidden or reordered by CSS.

## 6. Accessibility requirements

- 2.4.7 Focus Visible: every Tab stop in a produce page's `main` shows an outline or box-shadow
  that it does not show unfocused.
- 3.1.2 Language of Parts: English source titles have `lang="en"`.
- 1.3.1 / 1.3.2: tables keep caption and header scopes; the reordered ranking column keeps a
  header; the РСП note is in reading order before the table.
- 4.1.2: the scroll region is a named `section` (role `region`) with a name distinct from the
  caption (a `div role="region"` fails html-validate `prefer-native-element`); the produce-page
  map stays a group named by its title, and its links are `aria-hidden` with `tabindex="-1"` (axe
  `aria-hidden-focus` passes for non-tabbable links).
- 2.4.3 / 2.1.1: the text region list is the keyboard path to region pages; nothing that was only
  reachable on the map is lost.
- 1.4.4 Resize Text: the year strip scales with the root font size.
- 2.5.8 Target Size: table and region-list links at least 24 px tall.
- Zero axe violations on the e2e pages in light and dark mode; works without JavaScript.

## 7. SEO requirements

- No change to titles, descriptions, canonical URLs or structured data. The Article `citation`
  list keeps name and URL only (no `lang`).
- Internal links: produce → region links stay (list); produce → farms link stays when farms exist.

## 8. Acceptance criteria

1. **AC1:** Given the apple page, when each Tab stop inside `main` is focused with the keyboard,
   then its computed outline or box-shadow differs from its unfocused style, including the
   „Natural Earth“ link.
2. **AC2:** Given `sourceSchema`, then it accepts a source with `lang` `en` or `bg` or without
   `lang`, and rejects any other `lang`; given the Keystatic source field, then it has a `lang`
   select with `bg` and `en`, and saving `bg` leaves the key out while `en` is kept.
3. **AC3:** Given every source in `src/data`, then each name without a Cyrillic letter has
   `lang: en`, and no source writes `lang: bg`.
4. **AC4:** Given `SourceLink` with an English source, then the link has `lang="en"`; with a
   Bulgarian source (no `lang` or `bg`), then it has no `lang` attribute. Given the built apple,
   ramsons and a recipe page, then every USDA, PubMed and NCHFP title has `lang="en"`.
5. **AC5:** Given a nutrient ranking table, then the season column is the second column; given
   `/nutrienti/vitamin-c` at a 390 px wide viewport, then the season cell of the first row lies
   within the scroll box without scrolling.
6. **AC6:** Given a `ScrollTable`, then it is a focusable named `section` whose accessible name is
   „Таблица с хоризонтално превъртане“, not the caption.
7. **AC7:** Given a nutrition table, then a paragraph explaining РСП comes before the table and the
   table's `aria-describedby` points to it.
8. **AC8:** Given a produce page with growing regions, then the map links have
   `tabindex="-1"` inside an `aria-hidden` group, and each region page href is tabbable once; given
   the nutrition note, then it names the source without a link, and the source URL is tabbable
   once on the page. Given `ProvinceMap` without the pointer-only option, then the links stay
   tabbable (spec 029).
9. **AC9:** Given the home page, when the root font size doubles, then the year strip's rendered
   height doubles.
10. **AC10:** Given `formatPhone`, then `+359899909310` gives `+359 899 909 310`, `+35921234567`
    gives `+359 2 123 4567`, `+35932123456` gives `+359 32 123 456`, and `0899` is returned
    unchanged; given `FarmContacts`, then the link text and name use the grouped number and the
    href stays `tel:+359…`.
11. **AC11:** Given a produce with no farms, then the contents has no `#farms` entry and the page
    has no „Местни ферми, които го продават“ link, while the farm section shows the empty text and
    the add-farm link; given farms, then both links are present.
12. **AC12:** Given `/kalendar`, `/nutrienti/vitamin-c` and the apple page on desktop and mobile,
    then every link in a table row header and in the region list is at least 24 px tall.

## 9. Test plan

| AC   | Test type | Test file                                                                                 |
| ---- | --------- | ----------------------------------------------------------------------------------------- |
| AC1  | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |
| AC2  | unit      | `tests/unit/shared/sourceLanguage-060.test.ts`                                            |
| AC3  | unit      | `tests/unit/content/source-languages-060.test.ts`                                         |
| AC4  | component | `tests/components/SourceLink-060.test.ts`                                                 |
| AC4  | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |
| AC5  | component | `tests/components/NutrientRankingTable.test.ts`                                           |
| AC5  | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |
| AC6  | component | `tests/components/ScrollTable-060.test.ts`                                                |
| AC7  | component | `tests/components/NutritionTable-060.test.ts`                                             |
| AC8  | component | `tests/components/ProvinceMap-060.test.ts`, `tests/components/NutritionTable-060.test.ts` |
| AC8  | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |
| AC9  | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |
| AC10 | unit      | `tests/unit/components/formatPhone-060.test.ts`                                           |
| AC10 | component | `tests/components/FarmContacts-060.test.ts`                                               |
| AC11 | unit      | `tests/unit/components/produce/produceToc.test.ts`                                        |
| AC11 | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |
| AC12 | e2e       | `tests/e2e/a11y-polish-060.spec.ts`                                                       |

## 10. Third-party documentation consulted

| Package          | Version | Source (URL or Context7 ID)                                                        | Topic                                                    |
| ---------------- | ------- | ---------------------------------------------------------------------------------- | -------------------------------------------------------- |
| axe-core         | 4.14.0  | Context7 `/dequelabs/axe-core` (rule descriptions); `node_modules/axe-core/axe.js` | `aria-hidden-focus` passes when links have tabindex `-1` |
| @keystatic/core  | 0.6.9   | `node_modules/@keystatic/core/dist` (`select`, `text` serialize)                   | a field serializing `{ value: undefined }` omits the key |
| MDN              | n/a     | https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/tabindex      | `tabindex` on SVG `<a>`                                  |
| @playwright/test | 1.63.0  | https://playwright.dev/docs/api/class-keyboard                                     | `keyboard.press('Tab')`, `evaluate`                      |
| astro            | 7.4.8   | Context7 `/withastro/docs` (scoped styles, `:global`)                              | scoped selectors in `ProvinceMap` and `ScrollTable`      |
