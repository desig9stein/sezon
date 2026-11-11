# 025. Produce page grouped as at the stall, eat, grow, sources

- **Status:** Approved
- **Bounded context(s):** UI (produce page)
- **Related:** issue #94 (slice 4 of #82), brief `docs/design/brief.md` §3, ADR-0006, specs 005,
  018, 019, 024

## 1. Goal

Put the shopper's questions first on the produce page and make the long page navigable: a short
table of contents, then an „На сергията“ group (level now, season, how to choose, how to store,
varieties, where it grows), then „Яж“ (nutrition, preparation, traditional uses), „Отгледай“
(growing guide), and the farms, questions and sources.

## 2. User stories

- As a shopper at a stall, I want the level this month, how to choose and how to store at the top.
- As a reader of a long page, I want to jump to the part I need.
- As a cook or gardener, I want the eating and growing information grouped.

## 3. Scope

### In scope

- **Header:** `h1`, meta (Latin name, kind, family), summary, photo (unchanged).
- **Table of contents:** a `nav` „На тази страница“ with anchor links to the groups present.
- **„На сергията“ (`h2#stall`):** the current level as a large stamp with „през <месец>“ (or
  „Извън сезона през <месец>“), then `h3` sections: season by month (calendar), how to choose,
  how to store, varieties (when any), where it grows (regions with notes).
- **„Яж“ (`h2#eat`):** `h3` nutrition, preparation, traditional uses (when any).
- **„Отгледай“ (`h2#grow`):** the growing guide with its heading as `h3` (only when the produce has
  a guide).
- **Farms, FAQ, sources:** `h2` sections as today, after the groups.
- **Copy in the „ти“ voice** for the changed headings: „Как да избереш“, „Как да съхраниш“,
  „Откъде“, „Как да го приготвиш, за да запази хранителните си вещества“.

### Out of scope

- Data visuals (map, sowing row, nutrition bars): #95.
- Region pages and region links.

## 4. Domain model

No change.

## 5. Behaviour and edge cases

- Groups and table-of-contents entries for absent content (no guide, no FAQ) are omitted.
- Section ids stay stable (`season`, `nutrition`, `growing`, `farms`, `faq`, `sources`), so old
  anchors keep working; new ids are `stall`, `eat`, `grow`.
- Readable without CSS: the source order is the reading order; the table of contents is a list of
  links.

## 6. Accessibility requirements

- One `h1`; `h2` for the groups, farms, FAQ and sources; `h3` inside groups; no skipped levels.
- The table of contents is a labelled `nav` with in-page links (targets ≥ 24 px).
- The current level reads as words (stamp plus month), never colour alone.
- Zero axe violations in light and dark mode.

## 7. SEO requirements

- Title, description and JSON-LD (`Article`, `FAQPage`) unchanged.

## 8. Acceptance criteria

1. **AC1:** Given a produce page, the `h2` order is: На сергията, Яж, Отгледай (when a guide
   exists), Местни ферми, Често задавани въпроси (when any), Източници.
2. **AC2:** Given a produce page, „На сергията“ contains, in order, the current-level stamp with
   the month, and `h3` sections for season by month, how to choose, how to store, varieties (when
   any) and where it grows.
3. **AC3:** Given a produce page, the table of contents links to every `h2` group present, in
   page order, and each link target exists.
4. **AC4:** Given the produce page at 390 × 844, the current-level stamp and the „Как да избереш“
   heading are within the first two screens (`top < 1688`).
5. **AC5:** Given produce pages in light and dark mode, axe reports no violations and the heading
   levels never skip.

## 9. Test plan

| AC  | Type | Test file                          |
| --- | ---- | ---------------------------------- |
| AC1 | e2e  | `tests/e2e/produce-groups.spec.ts` |
| AC2 | e2e  | `tests/e2e/produce-groups.spec.ts` |
| AC3 | e2e  | `tests/e2e/produce-groups.spec.ts` |
| AC4 | e2e  | `tests/e2e/produce-groups.spec.ts` |
| AC5 | e2e  | `tests/e2e/produce-groups.spec.ts` |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                            | Topic             |
| ---------------- | ------- | ------------------------------------------------- | ----------------- |
| WCAG 2.2         | current | Understanding 2.4.5 (multiple ways), 1.3.1, 2.4.6 | TOC and headings  |
| HTML             | current | WHATWG `nav`, fragment navigation                 | Table of contents |
