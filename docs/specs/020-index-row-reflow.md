# 020. Index rows without overlapping text

- **Status:** Approved
- **Bounded context(s):** UI (`ProduceCard` index variant)
- **Related:** issue #83, specs 004, 010, 017; design evidence #79

## 1. Goal

On narrow screens the produce name in an index row („Също в сезон“ lists on month, section and
group pages) is drawn over its Latin name. Make every index row lay out its text without overlap
at any width from 320 px up.

## 2. User stories

- As a shopper on a phone, I want to read the names in the „Също в сезон“ list, so that I can
  open the produce I am looking at.

## 3. Scope

### In scope

- The CSS of the `index` variant of `ProduceCard`: the name keeps at least its own width; the
  meta line (Latin name, kind, badge) takes the remaining space and wraps.

### Out of scope

- Any other redesign of the row (epic #78).

## 4. Domain model

No change.

## 5. Behaviour and edge cases

- Long Latin names (e.g. „Daucus carota subsp. sativus“) wrap inside the meta column.
- Source order and markup are unchanged, so the page reads the same without CSS (spec 009).

## 6. Accessibility requirements

- WCAG 1.4.10 Reflow: no overlapping text and no horizontal scroll at 320 px.
- Zero axe violations on the affected pages in light and dark mode.

## 7. SEO requirements

No change.

## 8. Acceptance criteria

1. **AC1:** Given the month, section and group pages at 320 px and 390 px wide, when they render,
   then no two text boxes of any index row (name link, Latin name, kind, badge) intersect.

## 9. Test plan

| AC  | Type | Test file                            |
| --- | ---- | ------------------------------------ |
| AC1 | e2e  | `tests/e2e/index-row-reflow.spec.ts` |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                   | Topic                |
| ---------------- | ------- | -------------------------------------------------------- | -------------------- |
| CSS Grid         | current | MDN `grid-template-columns`, `minmax()` (track sizing)   | Column sizing        |
| @playwright/test | 1.63.0  | Context7 `/microsoft/playwright` (`locator.boundingBox`) | Measuring text boxes |
| WCAG 2.2         | current | Understanding SC 1.4.10 Reflow                           | Acceptance threshold |
