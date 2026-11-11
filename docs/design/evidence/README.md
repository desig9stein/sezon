# Design evidence (issue #79)

Step 1 of the redesign epic #78. It records the current state of the site, so the redesign brief
(#80) starts from evidence. Nothing here changes the UI.

| File                                       | What it is                                                     |
| ------------------------------------------ | -------------------------------------------------------------- |
| [`../../../DESIGN.md`](../../../DESIGN.md) | The current design system as built (tokens, type, components). |
| [`critique.md`](critique.md)               | UX critique of five templates, with heuristic scores.          |
| [`audit.md`](audit.md)                     | Technical audit: axe, Lighthouse, detector, tokens.            |

Templates: `/`, `/sezon/noemvri`, `/plodove/yabalki`, `/plodove`, `/grupi/krastotsvetni`, at 390
and 1280 px, light and dark. Screenshots were taken but are not committed (about 8 MB).

## Summary

**What works and must survive the redesign**

- The season level is shown as text, a mark and a tint, in four levels.
- Sourced nutrition tables, labelled placeholder data, a calm, ad-free page.
- axe: zero violations in 20 runs. Lighthouse: Accessibility, Best Practices and SEO are 100 on
  every template; Performance is 99–100; CLS is 0.

**Main problems**

1. The shopper's first question is not answered on the first phone screen: the home page shows no
   produce above the fold (big month word, 137 px header with 8 links, the month ribbon), and it
   lists only the peak items.
2. The produce page buries the market job: „Как да изберем“ sits at about 3,000 of 5,200 px, after
   nutrition and farms; „fresh or from storage?“ is never answered; 11 equal sections and no
   table of contents.
3. Index rows overlap on mobile (name over Latin name), tracked as bug #83.
4. The same produce has three looks (plate, row, page); `h1` and `h2` render at the same size.
5. Data is shown as text where a visual would help: regions without links or a map, growing months
   as a sentence instead of on the calendar, nutrition reference intakes explained only below the
   table.
6. The look is generic: the atlas identity shows only in the month word and the Latin names.
7. Fonts are 110 KB, 67–95 % of page bytes; hard-coded breakpoints and target sizes bypass tokens.

**Budget for the redesign** (from the audit): LCP about 2.2 s and TBT about 150 ms before
Performance drops below 95; fonts at most 110 KB; CLS 0; no new JavaScript; CSS never reorders
content (spec 009).
