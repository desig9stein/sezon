# Redesign brief (issue #80)

Step 2 of the redesign epic #78. It builds on the evidence in `docs/design/evidence/` (#79) and
on `PRODUCT.md`. It sets what the redesign must achieve and how the data is presented. It does
not choose a visual world (palette, type, imagery style); that is step 3 (#81).

Owner answers: 2026-11-11.

## 1. Job and audience

- **Primary:** a shopper at a market stall or in a shop, on a phone, often one-handed. The
  job: _what is in season now, is this one fresh or from storage, how do I pick a good one, is
  it local?_
- **Secondary:** home cooks and home gardeners on the same pages, at home.
- **Modes:** home, month, section and group pages are **Operate** (scan and pick); the produce
  page is **Read** (understand), with an Operate block at the top.

## 2. Outcome and proof

- Home: the full list of what is in season this month is visible on the first phone screen
  (390 × 844), with each item's level and section. The month is a title, not the whole screen.
- Produce page: within the first screen the shopper sees the season level now in plain words,
  how to choose and how to store, and where in Bulgaria it grows.
- Every figure keeps its source; nothing on the page is invented (`AGENTS.md` §10).

## 3. Information architecture

- **Global navigation:** four links in one row on mobile: **Сега** (home, this month) ·
  **Каталог** (sections: fruit, vegetables, herbs, nuts; groups) · **Календар** · **Търсене**.
  The footer replaces the 13-link list with a compact year strip and the legal links.
- **Produce page order** (owner choice: Buy → Eat → Grow → Sources):
  1. **На сергията** (at the stall): level this month in words, how to choose, how to store,
     where it grows (regions), local farms link.
  2. **Яж** (eat): nutrition, preparation, traditional uses.
  3. **Отгледай** (grow): growing guide, organic in Bulgaria.
  4. **Ферми**, **Въпроси**, **Източници**.

  A table of contents with anchor links sits under the title (no JavaScript).

- **One produce unit** in three sizes (row, card, page header), always in the same order: name,
  Latin name, section, season mark.
- Month pages match the home treatment and add „започва / свършва / сей този месец“.

## 4. Season levels (decides #62)

The storage level stays, explained in words everywhere it appears:

| Level         | Label                             |
| ------------- | --------------------------------- |
| peak          | Разгар — прясно от полето         |
| available     | В сезон                           |
| storage       | От хранилище — от последната бера |
| out of season | Извън сезона — вероятно е внос    |

Text + mark + colour, never colour alone. Exact wording is a copy decision in the slice that
implements it, within these meanings.

## 5. Data visualisation (all four chosen by the owner)

1. **Year strip in lists:** a compact 12-month strip beside each produce in rows and cards.
2. **Province map:** a static SVG of the 28 provinces with the growing regions marked, each
   province a link, with the same regions as a text list beside it.
3. **Sowing beside harvest:** the produce calendar shows the season and the sowing or planting
   months on two rows of the same 12 columns.
4. **Nutrition bars:** each nutrient row shows its share of the reference intake as a bar, next
   to the number; РСП is spelled out at first use.

Every visual is static HTML or SVG, has a text or table equivalent in the source order, reads
without CSS, and causes no layout shift.

## 6. Imagery

Real photos only, never generated. Photos are chosen and cropped to one rule (same background
treatment, framing and aspect) so that they read as one set; the design frames them. Each keeps
its credit.

## 7. Anti-goals

The redesign is wrong if it:

- looks like an online shop or food delivery (prices, carts, promotions, „купи сега“);
- is heavy or slow (animation, client JavaScript, Lighthouse below the ADR-0005 bar);
- looks like dated folklore (kitsch embroidery, retro „grandma's garden“).

Also unchanged from `PRODUCT.md`: no health promises, calm labelled advertising, „ти“ voice.

## 8. Constraints

- ADR-0005: Performance ≥ 95, other categories 100, CLS 0. Working ceilings from the audit:
  LCP about 2.2 s, TBT about 150 ms, fonts at most 110 KB.
- WCAG 2.2 AA, zero axe violations, readable without CSS and without JavaScript (spec 009),
  CSS never reorders content.
- No new JavaScript, except the existing search page.
- Bulgarian UI, tokens only (`src/design/tokens.ts`).

## 9. Open for step 3 (#81)

Visual world (palette, typography, layout character, mark style for the four levels, map and
chart style, photo treatment), shown as 2–3 directions on the home and produce pages, mobile and
desktop, light and dark.
