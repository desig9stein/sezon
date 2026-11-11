# 014. Printable seasonal calendar page

- **Status:** Approved
- **Bounded context(s):** catalog (application), UI
- **Related:** specs 005, 009, 010, 013, issue #7, epic #30

## 1. Goal

A year-at-a-glance page, `/kalendar`. It is a table of every produce against the 12 months, with
the season level in each cell. It is grouped by kind, readable on a phone, and prints on one A4
page in black and white.

## 2. User stories

- As a planner, I want to see the whole year for every produce on one page, so that I can plan
  what to buy and when.
- As a home cook, I want to print the calendar on one sheet and pin it to the fridge.
- As a screen-reader user, I want a real table with row and column headers, so that I can ask
  for the level of a produce in a month.

## 3. Scope

### In scope

- Application service `SeasonCalendarService` (catalog) with `calendar()`. It returns the
  produce grouped by kind, in the order fruit, vegetable, herb, nut, each in repository order.
- Route helper `routes.calendar` (`/kalendar`) and the page `src/pages/kalendar.astro`.
- Component `SeasonCalendarTable`, a table wrapped in `ScrollTable`:
  - one `<tbody>` per kind, starting with a group header row;
  - month column headers (`MonthAbbr`);
  - produce row headers that link to the produce page;
  - level cells with a glyph and the level text.
- A legend explaining the glyphs.
- Print styles:
  - A4 landscape;
  - site header, breadcrumbs, footer and skip link left out;
  - black text on white, with no backgrounds.
- Links to the page from the header navigation, the footer and the home page.
- Lighthouse CI audits `/kalendar`.

### Out of scope

- Filters, a PDF download, a per-region calendar.

## 4. Domain model

`SeasonCalendar` (application read model, frozen): `{ groups: { kind: ProduceKind; produce: Produce[] }[] }`.
Kinds with no produce are left out. `SeasonCalendarService` takes a `ProduceRepository` in its
constructor.

## 5. Behaviour and edge cases

- **Cells:**
  - The level glyph (★ ● ◐ ○) is decorative (`aria-hidden`).
  - The level text („Разгар на сезона“, „В сезон“, „От хранилище“, „Извън сезона“) is in
    `.visually-hidden` on screen. The glyph shapes and the legend carry the meaning visually,
    so it is never colour alone.
  - Without CSS, each cell reads as glyph plus text.
- **Shading:** cells are tinted by level on screen. In print, glyphs only.
- **Current month:** its column header is marked `aria-current="date"` and shown with the accent
  fill.
- **Group headers:** each kind's section starts with a header row. Its `<th scope="rowgroup"
colspan="13">` holds the section name (e.g. „Плодове“), and the name links to the section page.
- **Wide table:** on narrow screens the table scrolls inside its focusable region (ScrollTable),
  and the page itself never scrolls sideways at 320 px.
- **Print:**
  - `@page { size: A4 landscape; margin: 10mm }`;
  - the site chrome is left out;
  - the table uses a smaller font, so the current catalogue fits on one sheet.
- **Texts:**
  - `h1`: „Сезонен календар“.
  - Intro: one sentence.
  - Title: „Сезонен календар на плодовете и зеленчуците“.
  - Description: 70–160 characters.
- **Empty catalogue:** the page shows „Няма данни за календара.“ instead of the table.

## 6. Accessibility requirements

- The table has:
  - a `<caption>`;
  - `th scope="col"` for months, `th scope="row"` for produce, `th scope="rowgroup"` for kinds;
  - level text in each cell (WCAG 1.3.1, 1.4.1).
- The scroll region is focusable and labelled by the caption (WCAG 2.1.1, 1.4.10).
- One `h1` and a legend list. The page has zero axe violations in light and dark mode and at
  320 px, and passes spec 009 (readable without CSS).
- Print output is readable in black and white (glyph shapes).

## 7. SEO requirements

- Canonical `/kalendar`, with a unique title and description.
- `BreadcrumbList` JSON-LD (Начало › Сезонен календар).
- Internal links: every produce and section from the table, and the calendar from the header,
  footer and home page. The sitemap includes the page.

## 8. Acceptance criteria

1. **AC1:** `SeasonCalendarService.calendar()` groups produce by kind in the order fruit, vegetable, herb, nut (empty kinds left out), each in repository order.
2. **AC2:** `routes.calendar` is `/kalendar`. The title fits 60 characters with the suffix, and the description is 70–160 characters.
3. **AC3:** `SeasonCalendarTable` renders:
   - a caption;
   - 12 month column headers, with the current month marked `aria-current="date"`;
   - one `tbody` per kind, with a group header that links to the section;
   - row headers that link to each produce;
   - in each cell, a decorative glyph and the level text.
4. **AC4:** The legend lists the four levels with their glyphs.
5. **AC5:** The site header, footer and home page link to `/kalendar`.
6. **AC6:** The built `/kalendar` has:
   - one `h1`;
   - a canonical URL and `BreadcrumbList` JSON-LD;
   - zero axe violations in light and dark mode and at 320 px;
   - no horizontal page scroll at 320 px;
   - it passes the spec 009 checks (e2e).
7. **AC7:** In print media at A4 landscape width, the header and footer are not displayed, and the table is no wider than the page (e2e).

## 9. Test plan

| AC      | Type      | Test file                                                                   |
| ------- | --------- | --------------------------------------------------------------------------- |
| AC1     | unit      | `tests/unit/contexts/catalog/application/SeasonCalendarService.test.ts`     |
| AC2     | unit      | `tests/unit/i18n/bg-014.test.ts`, `tests/unit/components/routes.test.ts`    |
| AC3–AC4 | component | `tests/components/SeasonCalendarTable.test.ts`                              |
| AC5     | component | `tests/components/SiteHeader-014.test.ts`                                   |
| AC6–AC7 | e2e       | `tests/e2e/calendar-page.spec.ts`, `tests/e2e/readable-without-css.spec.ts` |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                     | Topic                           |
| ---------------- | ------- | -------------------------------------------------------------------------- | ------------------------------- |
| MDN              | current | `@page` `size`, `@media print`, `<th scope="rowgroup">`                    | Print layout, table headers     |
| @playwright/test | 1.63.0  | Context7 `/microsoft/playwright` (`page.emulateMedia({ media: 'print' })`) | Print-media test                |
| WCAG 2.2         | 2023    | Understanding 1.3.1, 1.4.1, 1.4.10 (tables exception)                      | Table semantics, colour, reflow |
