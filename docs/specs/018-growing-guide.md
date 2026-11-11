# 018. Planting calendar and home-garden tips

- **Status:** Approved
- **Bounded context(s):** catalog (`Produce`, content model), composition (sources), UI (produce page)
- **Related:** epic #66, issue #67, specs 002, 005, 009

## 1. Goal

Tell home gardeners in Bulgaria when to sow, transplant and plant each produce, with a few
practical tips, on the produce page. Every month and tip comes from a cited Bulgarian source.

## 2. User stories

- As a home gardener, I want to know in which months to sow carrots and when to plant out
  cabbage seedlings, so that I do not miss the window.
- As someone planting a quince tree, I want to know whether to plant it in autumn or in spring.
- As a careful reader, I want to see where the advice comes from.

## 3. Scope

### In scope

- **Content model:** an optional `growing` field on a produce:
  - `sow`, `transplant`, `plant`: lists of month numbers (1–12, unique, may be empty);
  - `plantingNote`: optional single-line text, used for trees and perennials;
  - `tips`: 3–5 single-line tips of at most 140 characters;
  - `source`: name and https URL.

  The schema requires at least one month, or a `plantingNote`.

- **Domain:** a `GrowingGuide` read model on `Produce` (`produce.growing`), with months as
  `Month` values and `activitiesIn(month)`, which lists the activities due in a month.
- **Produce page:** an „Отглеждане в градината“ section after „Как да съхраняваме“:
  - a definition list with one row per activity that has months („Сеитба“, „Разсаждане“,
    „Засаждане“), each giving its months as ranges of month names linked to the month pages
    (e.g. „март – април“, „ноември, март“);
  - the planting note;
  - the tips as a bulleted list;
  - the growing source added to the page's sources list.
- **Seed data:** drafts for the 13 seed produce from Bulgarian gardening portals (owner
  decision), `reviewStatus` unchanged (`draft`).

### Out of scope

- Regional variants (north/south, lowland/mountain). Months are as the source gives them for
  Bulgaria; a regional note can go into `plantingNote` or a tip when the source states one.
- Month-page lists of „what to sow this month“ (possible follow-up).

## 4. Domain model

- `GrowingActivity`: `'sow' | 'transplant' | 'plant'`.
- `GrowingGuide` (interface): `sow`, `transplant`, `plant` (`ReadonlyArray<Month>`, sorted by
  month number), `plantingNote?`, `tips`, `source`, and `activitiesIn(month)`.
- `Produce.growing: GrowingGuide | undefined`, frozen. `Produce.create` rejects a guide with
  no months and no note (`InvalidProduceError`).
- `monthRanges(months)` (i18n helper): groups consecutive months into „от – до“ ranges, wrapping
  December to January, e.g. 11, 12, 1 → „ноември – януари“.

## 5. Behaviour and edge cases

- An activity without months is not shown.
- A produce without `growing` shows no section and adds no source.
- Ranges: a single month is its name; two or more consecutive months are „first – last“;
  separate ranges are joined by commas, in calendar order starting from the earliest month that
  does not continue a December range (e.g. 2, 3, 10, 11 → „февруари – март, октомври – ноември“).
- Month names in ranges are links to the month pages; in a range both ends link.

## 6. Accessibility requirements

- The section is a `section` with an `h2`; activities are a `dl` (`dt` activity, `dd` months).
- Month links have names that make sense in context (the month name, inside the activity row).
- Tips are a `ul`. Readable without CSS (spec 009); zero axe violations in light and dark mode
  and at 320 px.

## 7. SEO requirements

- Titles and descriptions unchanged. Month links add internal links from produce to months.
- The growing source joins the `Article` JSON-LD `citation` list through the page sources.

## 8. Acceptance criteria

1. **AC1:** The schema accepts a valid `growing` block and a produce without one; it rejects
   duplicate or out-of-range months, fewer than 3 or more than 5 tips, a tip over 140
   characters, a missing source, and a block with no months and no note.
2. **AC2:** `toProduce` maps `growing` to `produce.growing` with `Month` values sorted by
   number; `activitiesIn(Month.of(3))` lists the activities due in March;
   `produce.growing` is `undefined` without the block.
3. **AC3:** `monthRanges` returns „март“, „март – май“, „февруари – март, октомври – ноември“
   and „ноември – януари“ for the matching inputs, and an empty string for none.
4. **AC4:** The `GrowingGuide` component renders an `h2` „Отглеждане в градината“, a `dl` with
   only the activities that have months, month links to `/sezon/<month>`, the planting note and
   the tips.
5. **AC5:** `ProduceDetailsQuery` adds the growing source to the page sources once.
6. **AC6:** Every seed produce has a `growing` block with a source URL; the built carrot page
   shows the section; the section passes axe in light and dark mode and the spec 009 checks
   (unit, e2e).

## 9. Test plan

| AC  | Type      | Test file                                                                    |
| --- | --------- | ---------------------------------------------------------------------------- |
| AC1 | unit      | `tests/unit/contexts/catalog/infrastructure/growingSchema.test.ts`           |
| AC2 | unit      | `tests/unit/contexts/catalog/domain/GrowingGuide.test.ts`                    |
| AC3 | unit      | `tests/unit/i18n/bg-018.test.ts`                                             |
| AC4 | component | `tests/components/GrowingGuide.test.ts`                                      |
| AC5 | unit      | `tests/unit/composition/ProduceDetailsQuery-018.test.ts`                     |
| AC6 | unit, e2e | `tests/unit/content/seed-growing.test.ts`, `tests/e2e/growing-guide.spec.ts` |

## 10. Third-party documentation consulted

| Package / source            | Version | Source                                                        | Topic                   |
| --------------------------- | ------- | ------------------------------------------------------------- | ----------------------- |
| astro                       | 7.4.8   | Context7 `/withastro/docs` (content collections, `astro/zod`) | Schema                  |
| Bulgarian gardening portals | current | Cited per produce in `src/data/produce/*.yaml`                | Sowing months and tips  |
| WCAG 2.2 / HTML             | current | `dl` element (WHATWG), Understanding 1.3.1, 2.4.4             | Structure, link purpose |
