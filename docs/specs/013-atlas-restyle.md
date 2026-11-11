# 013. Botanical atlas restyle of layout and components

- **Status:** Approved
- **Bounded context(s):** UI
- **Related:** ADR-0004, specs 003–005, 009, 010, 012, issue #37, redesign #28

## 1. Goal

Apply the botanical-atlas identity (ADR-0004) to the page shell and components. The home page
opens with the month set as a giant display word and a year ribbon. Produce in its peak becomes
plates of different sizes, and other groups become a quiet index. The produce calendar becomes a
twelve-month strip, and the header, footer and tables become hairline and typographic. There is
one bold element per page and nothing generic. Accessibility, readability without CSS and
Lighthouse 100 stay as they are.

## 2. User stories

- As a visitor, I want to see the month and what is at its peak at a glance, in a page that feels
  like a botanical atlas rather than a template.
- As a phone user, I want the header and month ribbon to stay compact, so that content starts
  near the top.
- As a screen-reader or no-CSS user, I want the same content in the same order, whatever the
  styling.

## 3. Scope

### In scope

- **`SiteHeader`.** A typographic wordmark „Сезон“ in Piazzolla italic, without the emoji glyph.
  Navigation is compact, with targets of at least 24 × 24 px (36 px on narrow screens). It
  wraps into at most three rows at 320 px.
- **`SiteFooter`.** A hairline top rule and muted text. The month links are a compact grid.
- **Home page.**
  - A plate number „Табло XI от XII“.
  - The `h1` „В сезон през ноември“. Its month word is set in the display size and capitalised
    by CSS (`text-transform: capitalize`), so without CSS it still reads as a sentence.
  - The intro.
  - The **year ribbon**, a new `YearRibbon` component: `<nav aria-label="Месеци">` with an
    ordered list of 12 month links. Each shows a three-letter abbreviation followed, in the same word, by
    the rest of the name in `.visually-hidden` (e.g. „Яну<span class="visually-hidden">ари</span>“),
    so screen readers and no-CSS readers get the full name. The current month is marked `aria-current="date"` and
    filled with the accent colour. The ribbon has 12 columns on wide screens and 6 × 2 on
    narrow ones.
- **`SeasonOverview` and `SectionIndex`:**
  - **Peak:** plates of different sizes. The first one is larger. Plates use the surface
    colour, have a small radius, and no border or shadow.
  - **Other groups (available, coming soon, storage, out of season):** a quiet index. Each row
    has the name, the season badge and a hairline rule. There is no summary.
- **`ProduceCard`.** The name in the display family, the Latin name in italic (`lang="la"`)
  and the badge. In the plate variant only, the summary.
- **`SeasonCalendarList`.** A twelve-column strip (six on narrow screens). Each cell shows the
  month abbreviation, glyph and level text on its season tint. The current month is outlined
  in the accent colour.
- **Typography.** Headings follow the ADR scale: `h1` 2xl, `h2` 2xl, `h3` xl. The produce title
  uses 3xl, and the month word uses display size.
- **Breadcrumbs, tables, farm cards and month pager.** Hairline rules on `rule`. Boundaries use
  `border` (≥ 3:1). There are no shadows.
- **i18n.** Month abbreviations, the plate label (Roman numerals) and the ribbon label. The
  `logoGlyph` is removed.

### Out of scope

- Photos (#56). Plates have no image until then.
- Interaction or JavaScript.

## 4. Domain model

None. Presentation only. Helpers in `src/i18n/bg.ts`:

- `monthAbbreviation(month)`: the first three letters (and `monthRest(month)` the remaining letters) of the month name, for example „Яну“,
  „Май“ and „Сеп“.
- `romanNumeral(n)`: 1–12 to „I“–„XII“.
- `ui.home.plate(month)`: „Табло XI от XII“.
- `ui.ribbon.label`: „Месеци“.

## 5. Behaviour and edge cases

- **CSS never hides or reorders content (spec 009):**
  - Grid placement only spans the first plate. It does not move any item.
  - Capitalising the month word is only a text transform.
  - Ribbon and calendar abbreviations are visible text, and the rest of each month name is
    `.visually-hidden` text in the same word. The accessible name is the full month name and
    starts with the visible text (WCAG 2.5.3, label in name).
- **Plate variant.** It applies only to the peak group. When there is no peak produce, there are
  no plates.
- **Empty states and JSON-LD.** Both are unchanged.
- **Narrow screens (≤ 40 rem):**
  - The ribbon uses 6 columns and the calendar 6 columns.
  - Plates stack in one column.
  - The header navigation uses smaller gaps and 2.25 rem targets.
- **Focus.** It stays visible on every new element: an outline in the `focus` colour, which is
  not hidden by overflow.

## 6. Accessibility requirements

- One `h1` per page and no skipped heading levels. The ribbon is a `nav` with an accessible name.
- WCAG 2.5.3. Each ribbon link's accessible name („Ноември“) starts with its visible label („Ное“).
- WCAG 2.5.8. Every target is at least 24 × 24 px. Ribbon cells and header links are at least
  2.25 rem tall.
- WCAG 1.4.1. Season level is shown as text, glyph and tint. The current month is shown as a
  fill plus `aria-current`, so it is not colour alone.
- WCAG 1.4.10. Nothing scrolls horizontally at 320 px, except the table regions (spec 005).
- Every page has zero axe violations in light and dark mode and at 320 px, and passes the
  spec 009 checks.

## 7. SEO requirements

- Titles, descriptions, canonical URLs and JSON-LD are unchanged.
- The year ribbon adds internal links from the home page to all 12 month pages.

## 8. Acceptance criteria

1. **AC1:** `monthAbbreviation` returns three-letter abbreviations for all 12 months, and `romanNumeral` returns I–XII. `ui.home.plate(November)` returns „Табло XI от XII“.
2. **AC2:** `YearRibbon` renders a `nav` labelled „Месеци“ with an ordered list of 12 month links. Each link's text is the full month name, of which only the first three letters are visible, and only the given month has `aria-current="date"`.
3. **AC3:** The home page renders, in order: the plate label, the `h1` with the month word in its own element, the intro, then the ribbon (e2e).
4. **AC4:** `SeasonOverview` renders the peak group as plates and the other groups as an index. Plate cards include the summary, and index rows do not.
5. **AC5:** `ProduceCard` renders the Latin name with `lang="la"`.
6. **AC6:** `SiteHeader` renders the wordmark without the emoji glyph.
7. **AC7:** `SeasonCalendarList` shows the month abbreviation with the rest of the name visually hidden, plus the glyph and the level text, and uses no `aria-label`.
8. **AC8:** At 320 px, the header is at most 180 px tall and nothing scrolls horizontally (e2e).
9. **AC9:** Every page template has zero axe violations in light and dark mode, passes the spec 009 checks, and Lighthouse scores 100 × 4 (existing e2e and LHCI gates).

## 9. Test plan

| AC  | Type      | Test file                                     |
| --- | --------- | --------------------------------------------- |
| AC1 | unit      | `tests/unit/i18n/bg-013.test.ts`              |
| AC2 | component | `tests/components/YearRibbon.test.ts`         |
| AC3 | e2e       | `tests/e2e/atlas-restyle.spec.ts`             |
| AC4 | component | `tests/components/SeasonOverview-013.test.ts` |
| AC5 | component | `tests/components/ProduceCard.test.ts`        |
| AC6 | component | `tests/components/SiteHeader-013.test.ts`     |
| AC7 | component | `tests/components/SeasonCalendarList.test.ts` |
| AC8 | e2e       | `tests/e2e/atlas-restyle.spec.ts`             |
| AC9 | e2e, LHCI | existing suites in CI                         |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                 | Topic                             |
| ---------------- | ------- | ---------------------------------------------------------------------- | --------------------------------- |
| WCAG 2.2         | 2023    | Understanding 2.5.3 Label in Name, 2.5.8 Target Size (Minimum), 1.4.10 | Ribbon labels, targets, reflow    |
| MDN              | current | `text-transform`, CSS grid `grid-row: span`, `aria-current`            | Month word, plates, current month |
| astro            | 7.4.8   | Context7 `/withastro/docs` (guides/styling: scoped styles, `:global`)  | Component styles                  |
