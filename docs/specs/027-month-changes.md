# 027. What changes this month

- **Status:** Approved
- **Bounded context(s):** catalog (application), UI (month pages)
- **Related:** issue #99 (slice of #82), brief `docs/design/brief.md` §3 („започва / свършва /
  сей този месец“), specs 004, 018, 024

## 1. Goal

A month page lists what is in season, but not what is new. Shoppers and gardeners want to know
what changed since last month: what has just come into its peak, what is still at its peak, what
has left its peak, what now comes from storage, and what to sow or plant. This block answers
that on every month page, computed only from the season and growing data.

## 2. User stories

- As a shopper, I want to see what has just reached its peak, so I buy it while it is best.
- As a shopper, I want to know what has left its peak, so I am not surprised by the quality.
- As a gardener, I want the month's sowing and planting jobs on the month page.

## 3. Scope

### In scope

- `MonthChangesService.changesFor(month)` in the catalog application layer.
- `MonthChanges.astro` on each month page (`/sezon/<месец>`), after the legend and before the
  coming-soon list: an `h2` „Какво се променя през <месец>“ and one `h3` group per non-empty change.
- Groups, in this order, each comparing `month` with the previous month:
  1. „Навлизат в разгара си“: peak now, not peak in the previous month.
  2. „Още са в разгара си“: peak now and in the previous month.
  3. „Отминава им разгарът, …“: peak in the previous month, not now, split by the level now into
     up to three groups: „…, още са в сезон“, „…, вече от хранилище“, „…, вече извън сезона“.
  4. „Вече от хранилище“: storage now and available (fresh, not at its peak) in the previous
     month. Produce going from its peak to storage is only in group 3; produce coming from out of
     season straight into storage is in no group.
  5. „В градината“: the growing guide names `month` for sowing, transplanting or planting; each
     item lists the activities („Сеитба“, „Разсаждане“, „Засаждане“).
- Each item is a link to the produce page. Groups without details (all but „В градината“) wrap
  as one line of links; garden items are rows with their activities.

### Out of scope

- The home page (its first screen belongs to the in-season list).
- Changes to the season or growing data.

## 4. Domain model

New application service `MonthChangesService` (catalog), constructed with the
`ProduceRepository`. It returns a frozen `MonthChanges`:

- `month`, `previous` (`Month`);
- `enteringPeak`, `stayingPeak`, `toStorage`: `ReadonlyArray<Produce>`;
- `leavingPeak`: `ReadonlyArray<{ produce; levelNow: SeasonLevel | undefined }>`;
- `garden`: `ReadonlyArray<{ produce; activities: ReadonlyArray<GrowingActivity> }>`
  (activities in `GROWING_ACTIVITIES` order);
- `isEmpty`: true when every list is empty.

Lists keep the repository order. No domain entity changes.

## 5. Behaviour and edge cases

- January compares with December (`Month.previous()` wraps).
- A produce can appear in more than one group (e.g. „Влиза в разгар“ and „В градината“).
- Produce without a growing guide, or whose guide names no month (only a planting note), is never
  in „В градината“.
- Empty groups are not rendered. When every group is empty the whole block, heading included,
  is omitted.
- Readable without CSS: headings and plain lists in source order.

## 6. Accessibility requirements

- `h2` for the block and `h3` per group, after the page's existing `h2`s; no skipped levels
  (1.3.1, 2.4.6).
- Groups are lists of links; link text is the produce name (2.4.4); the level or activities follow
  as plain text.
- Nothing is conveyed by colour alone (1.4.1); colours use tested token pairs only.
- Targets at least 24 × 24 px (2.5.8). No JavaScript.
- Zero axe violations in light and dark mode.

## 7. SEO requirements

- Title, description and JSON-LD of month pages unchanged.
- The block adds internal links from each month page to the produce pages it names.

## 8. Acceptance criteria

1. **AC1:** Given produce peak in October and November, peak only in November, peak only in
   October, and storage in November but available in October, when `changesFor(November)`, then
   `stayingPeak`, `enteringPeak`, `leavingPeak` and `toStorage` hold exactly those produce, in
   repository order.
2. **AC2:** Given a produce peak in October and available in November, when
   `changesFor(November)`, then its `leavingPeak` entry has `levelNow` available; for one out of
   season in November, `levelNow` is undefined.
3. **AC3:** Given a produce sown in November and transplanted in November, when
   `changesFor(November)`, then `garden` lists it with activities sow, transplant; produce
   without a guide is not listed.
4. **AC4:** Given produce peak in December and January, when `changesFor(January)`, then it is
   in `stayingPeak`.
5. **AC5:** Given no change in a month, when `changesFor`, then `isEmpty` is true.
6. **AC6:** Given changes, when `MonthChanges` renders, then it has an `h2`
   „Какво се променя през ноември“, an `h3` per non-empty group in the fixed order, and items that
   link to produce pages.
7. **AC7:** Given leaving-peak items with different levels now and a garden item, when rendered,
   then the leaving items sit under one `h3` per level (in the order in season, storage, out of
   season) and the garden item reads „<name> – Сеитба, Разсаждане“.
8. **AC8:** Given empty changes, when rendered, then nothing is output.
9. **AC9:** Given the March month page (which also lists produce coming soon), then the block sits after the legend and before the
   coming-soon list, and axe reports no violations on the March and November pages in light and
   dark mode.
10. **AC10:** Given produce available in October and storage in November, peak in October and
    storage in November, and out of season in October and storage in November, when
    `changesFor(November)`, then only the first is in `toStorage` and the second is in
    `leavingPeak`.
11. **AC11:** Given a guide with only a planting note, and a produce entering its peak with a
    planting job in the same month, when `changesFor`, then the first is in no garden entry and
    the second is in both `enteringPeak` and `garden`.

## 9. Test plan

| AC   | Test type | Test file                                                             |
| ---- | --------- | --------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |
| AC2  | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |
| AC3  | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |
| AC4  | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |
| AC5  | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |
| AC6  | component | `tests/components/MonthChanges.test.ts`                               |
| AC7  | component | `tests/components/MonthChanges.test.ts`                               |
| AC8  | component | `tests/components/MonthChanges.test.ts`                               |
| AC9  | e2e       | `tests/e2e/month-changes.spec.ts`                                     |
| AC10 | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |
| AC11 | unit      | `tests/unit/contexts/catalog/application/MonthChangesService.test.ts` |

## 10. Third-party documentation consulted

| Package | Version | Source (URL or Context7 ID)                                                                      | Topic |
| ------- | ------- | ------------------------------------------------------------------------------------------------ | ----- |
| –       | –       | No new third-party API: the feature uses existing Astro components and the project's own domain. | –     |
