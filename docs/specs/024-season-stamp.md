# 024. Season stamp, year strip and the in-season list

- **Status:** Approved
- **Bounded context(s):** UI (season components, home and month pages)
- **Related:** issue #93 (slice 3 of #82), brief `docs/design/brief.md` §2, §4, §5.1, ADR-0006,
  specs 004, 020, 022, 023

## 1. Goal

Answer the shopper's first question on the first phone screen: everything in season this month,
each with its level as a stamp and its year as a strip. The stamp is the signature move of
ADR-0006: its form carries the level (solid, outlined, hatched) next to the words.

## 2. User stories

- As a shopper at a stall, I want to see every in-season produce on my first screen, so that I do
  not scroll before I know what to look for.
- As a shopper, I want to tell at a glance whether something is at its peak, in season or from
  storage, without relying on colour.
- As a planner, I want to see each produce's year at a glance.

## 3. Scope

### In scope

- **Season stamp (`SeasonBadge`):** the badge becomes a stamp in condensed capitals with a short
  label: „Разгар“ solid `peak` fill with `onPeak` text; „В сезон“ outlined in `accent` with
  `accent` text; „От хранилище“ hatched (accent lines on surface) with a solid outline and `text`.
  The coming-soon form keeps its „От <месец>:“ prefix. The decorative level mark is dropped from
  the stamp (the form replaces it).
- **Year strip (`YearStrip`):** an inline SVG of 12 cells, January to December, where the form
  carries the level: peak solid, available outlined, storage outlined with hatch lines, out of
  season a thin baseline; the current month framed in ink. It has a `<title>` and a text
  alternative listing the months of each level in ranges, and keeps its size without CSS.
- **In-season list (`SeasonList`):** one list for a month, peak first, then available, then
  storage (repository order inside each), each row: name, Latin name, kind, stamp, year strip.
  Heading „В сезон през <месец> (<брой>)“.
- **Legend (`SeasonLegend`):** each stamp followed by its plain-words meaning (brief §4), the
  out-of-season baseline with „Извън сезона: вероятно е внос“, and how to read the strip.
- **Home:** a compact heading „В сезон през <месец>“, then the list, the legend, coming soon (rows)
  and the existing links. The „Табло … от …“ line, the hero year ribbon and the photo plates go
  (the footer year strip and the month pages remain).
- **Month pages:** the same list and legend, then coming soon, then the pager.

### Out of scope

- „What changes this month“ (start, end, sow) block: follow-up issue.
- Section and group pages keep their plates and rows; `ProduceCard` gains an optional strip, used
  by the coming-soon rows.
- The produce page (#94) and data visuals (#95).

## 4. Domain model

No domain change. The strip reads `produce.levelIn(month)` for the 12 months.

## 5. Behaviour and edge cases

- A month with no in-season produce shows the existing empty text instead of the list.
- The first-screen target is a 390 × 844 phone (ten rows); on shorter or narrower screens the
  list starts on the first screen and continues below. Below 23rem the strip moves to the second
  line of each row so nothing overlaps or is cut.
- The strip's text alternative omits levels with no months; a produce in season all year reads
  „януари – декември“ for that level.
- Print: stamps and strip cells print in ink (fills dropped, forms kept by borders and hatching).

## 6. Accessibility requirements

- Level is never colour alone: the stamp always shows its word; strip cells differ by fill vs
  hatch vs empty, and the strip has a text alternative.
- The list is a `ul` of rows with the produce name as a link; headings h1 → h2 in order.
- Readable without CSS: stamps read as words, the strip SVG keeps its size and title.
- Zero axe violations on home and a month page in light and dark mode; targets ≥ 24 px.

## 7. SEO requirements

- Titles and descriptions unchanged; the `ItemList` JSON-LD of fresh produce stays.

## 8. Acceptance criteria

1. **AC1:** Given a produce with peak in September–October, available in August and storage in
   December–March, the year strip has 12 cells with those levels, marks the given current month,
   and its label reads „Разгар: септември – октомври; В сезон: август; От хранилище: декември –
   март“.
2. **AC2:** Given each level, the stamp renders `data-level` and the short word („Разгар“, „В
   сезон“, „От хранилище“); with a coming-soon month it renders „От <месец>: <word>“.
3. **AC3:** Given a month overview, `SeasonList` renders one heading with the in-season count and
   rows in the order peak, available, storage, each with a stamp and a strip.
4. **AC4:** Given the built home page, it has no „Табло“ line and no hero year ribbon, the `h1`
   names the build month, the legend lists the four plain-word levels, and at 390 × 844 the first
   ten in-season rows (or all, if fewer) end above the bottom of the viewport.
5. **AC5:** Given a built month page, it shows the in-season list, the legend, coming soon (when
   any produce becomes fresh next month) and the pager.
6. **AC6:** Home and a month page pass axe in light and dark mode, and in print the stamps use
   ink.

## 9. Test plan

| AC  | Type      | Test file                                                               |
| --- | --------- | ----------------------------------------------------------------------- |
| AC1 | component | `tests/components/YearStrip.test.ts`                                    |
| AC2 | component | `tests/components/SeasonBadge-024.test.ts`                              |
| AC3 | component | `tests/components/SeasonList.test.ts`, `tests/e2e/season-stamp.spec.ts` |
| AC4 | e2e       | `tests/e2e/season-stamp.spec.ts`                                        |
| AC5 | e2e       | `tests/e2e/season-stamp.spec.ts`                                        |
| AC6 | e2e       | `tests/e2e/season-stamp.spec.ts`                                        |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                | Topic                   |
| ---------------- | ------- | ----------------------------------------------------- | ----------------------- |
| SVG 2 / WAI-ARIA | current | `role="img"` with `aria-label` on inline SVG (MDN)    | Strip text alternative  |
| CSS              | current | MDN `repeating-linear-gradient`, `print-color-adjust` | Hatched forms and print |
| WCAG 2.2         | current | Understanding 1.4.1, 1.1.1, 1.4.11                    | Colour, alt text        |
