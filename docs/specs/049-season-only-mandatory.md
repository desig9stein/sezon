# 049. Season-only mandatory produce

- **Status:** Approved
- **Bounded context(s):** catalog (content model, nutrient ranking), composition (produce details,
  content integrity), shared (JSON-LD), UI (produce page, produce lists)
- **Related:** spec 002 (content model), spec 042 (produce without regions, the model for this
  change), specs 024 and 035 (growing guide and its sources), spec 032 (USDA values), the „no
  invented data“ rule

## 1. Goal

Owner decision (2026-11-13): „Най-важното е дали продуктът е в сезон. Всичко останало е
второстепенно и може да е различно за всеки продукт.“

Today a produce entry must give a Latin name, nutrition, at least one preparation tip, how to
choose, storage and FAQ, and the tests require a photo and a growing guide for every produce. For
wild plants, herbs and local produce there is often no USDA record, no sourced guide and no photo,
and the only way to add them is to invent data or leave them out. This change keeps only what
answers „is it in season?“ mandatory and makes every other block optional. A produce page leaves
out every section whose data is missing.

## 2. User stories

- As a content author, I want to add a produce with only its name, kind, group, summary and
  season, so that I can publish it without inventing nutrition, tips or a photo.
- As a reader, I want a produce page to show only what is known, without empty headings or empty
  lists.
- As a screen-reader user, I want the heading outline and table of contents to stay valid when
  sections are missing.

## 3. Scope

### In scope

- **Schema (`produceSchema`):**
  - Required: `name`, `kind`, `group`, `summary` (70–160 characters), `season` (at least one
    month) and `updatedAt`.
  - Optional: `latinName`, `nutrition` (the whole block), `howToChoose`, `storage`.
  - Optional lists that default to `[]` when absent: `varieties`, `regions`, `preparation` (no
    longer at least one), `traditionalUses`, `faq`.
  - Already optional, unchanged: `photo`, `growing`, `organic`.
  - A block that is present is validated as before: `nutrition` keeps its required macros, its
    unique micronutrients and its `source`; a traditional use keeps its prefix and source; a
    growing guide keeps its tips and sources.
- **Domain:** `Produce.latinName`, `Produce.nutrition`, `Produce.howToChoose` and
  `Produce.storage` may be `undefined`.
- **Produce details (`ProduceDetailsQuery`):** without nutrition, `micronutrients` is empty and
  no nutrition source is listed.
- **Nutrient ranking (`NutrientRankingService`):** produce without nutrition are skipped.
- **Content integrity (`findBrokenReferences`):** produce without nutrition have no nutrient
  references.
- **Produce page `src/pages/[section]/[slug].astro`:**
  - Header: the Latin name item is shown only when present; the photo is shown only when present,
    and its caption shows the Latin name only when present.
  - „На сергията“ (`#stall`): always shown, with the „now“ line and the season section. „Как да
    избереш“, „Съхранение“ and „Сортове“ are shown only with data. The regions section keeps the
    spec 042 behaviour: with no regions it says that there are no official data by province.
  - „На масата“ (`#eat`): shown only when the produce has nutrition, at least one preparation tip,
    at least one traditional use or at least one recipe (spec 048). Each of its `h3` sections is
    shown only with data.
  - Growing guide and FAQ: shown only with data (unchanged).
  - Farms: always shown (farms are not produce data; the farm list has its own empty state).
  - Sources: the list shows whichever sources exist and is left out when there are none; the
    update date and the methodology link are always shown.
  - Table of contents: lists only the `h2` groups that are rendered.
- **Produce lists:** `ProduceCard` and `SeasonList` show the Latin name only when present.
- **JSON-LD (`articleJsonLd`):** leaves out `citation` when there are no citations; `image` and
  `about.alternateName` are already left out when absent.
- **Content guide:** describes the minimal entry and what each optional block adds.
- **Tests:** the seed tests that required a growing guide and a photo for every produce now check
  that a guide or photo, when present, is valid and sourced; the USDA test checks every produce
  that has nutrition.

### Out of scope

- Removing data from existing produce. Every existing entry stays valid and unchanged.
- Making `group` optional: every produce page links its botanical family and the group pages
  list every produce. No existing or planned plant lacks a family.
- Making `summary` optional: it is the meta description (70–160 characters) of the page.
- An Open Graph image: the site sets no `og:image` today, with or without a photo.

## 4. Domain model

`Produce` (catalog):

| Property                                                        | Before           | After                         |
| --------------------------------------------------------------- | ---------------- | ----------------------------- |
| `latinName`                                                     | `string`         | `string \| undefined`         |
| `nutrition`                                                     | `NutritionFacts` | `NutritionFacts \| undefined` |
| `howToChoose`, `storage`                                        | `string`         | `string \| undefined`         |
| `varieties`, `preparation`, `traditionalUses`, `faq`, `regions` | list             | list, may be empty            |

Invariants are unchanged: a valid `updatedAt`, a photo with non-empty `alt`, organic information
with a source. `NutritionFacts` keeps its own invariants whenever it exists.

## 5. Behaviour and edge cases

- A YAML entry may omit any optional key. An omitted list is parsed as `[]`; an empty list is also
  accepted.
- Unknown keys are still rejected (`strictObject`).
- An empty string is not a valid `howToChoose` or `storage`; leave the key out instead.
- A produce with only the required fields renders: `h1`, the meta list (kind and family), the
  summary, the table of contents (`#stall`, `#farms`, `#sources`), `#stall` with the „now“ line,
  the season and the regions sections, the ad slot, `#farms` and `#sources`.
- Heading outline: `h1` → `h2` groups → `h3` sections. Leaving out an `h3` never leaves an `h2`
  without content, because `#eat` is left out with its last `h3`, and `#stall` always has the
  season.
- The ad slot stays a direct child of the article, after `#eat` when present, otherwise after
  `#stall`.
- Pagefind indexes the page through `data-pagefind-body` on the article, which is always
  rendered.
- Nutrient pages: a produce without nutrition appears in no ranking and in no „in season“ list.

## 6. Accessibility requirements

- WCAG 2.2 AA: 1.3.1 (info and relationships), 1.3.2 (meaningful sequence), 2.4.6 (headings and
  labels), 2.4.1 (bypass blocks: the table of contents links only to rendered targets).
- Exactly one `h1`; headings never skip a level; no heading without content; no empty `<ul>`,
  `<dl>` or table.
- Every table of contents link points to an element with that id on the page.
- Zero axe violations on a minimal produce page.
- Readable without CSS: the source order alone gives the reading order (header, table of
  contents, stall, farms, sources); nothing is hidden or revealed by CSS.
- Works without JavaScript (static HTML).

## 7. SEO requirements

- Title and description are unchanged (`produceTitle(name)`, `summary`).
- `Article` JSON-LD stays valid without a photo (no `image`), without a Latin name (no
  `alternateName`) and without sources (no `citation`). `FAQPage` is emitted only with FAQ.
- Canonical, Open Graph and Twitter tags are unchanged.
- Internal links (group, regions, farms) are unchanged.

## 8. Acceptance criteria

1. **AC1:** Given a produce record with only `name`, `kind`, `group`, `summary`, `season` and
   `updatedAt`, when parsed, then it is valid and its lists are empty.
2. **AC2:** Given a record without `season`, or with an empty `season`, or without `group` or
   `summary`, when parsed, then it is rejected.
3. **AC3:** Given a record whose `nutrition` block lacks its `source` or a required macro, when
   parsed, then it is rejected; an empty `preparation` list is accepted.
4. **AC4:** Given a minimal record, when mapped, then the `Produce` has no Latin name, nutrition,
   how to choose or storage, and empty lists.
5. **AC5:** Given a minimal produce, when `ProduceDetailsQuery.forSlug` runs, then it returns no
   micronutrients and no sources.
6. **AC6:** Given a produce without nutrition, when a nutrient is ranked, then that produce is
   not in the ranking.
7. **AC7:** Given a produce record without nutrition, when references are checked, then none is
   reported for it beyond its group and regions.
8. **AC8:** Given a minimal produce, when the table of contents is built, then it lists `stall`,
   `farms` and `sources` only; with a recipe (spec 048), it also lists `eat`.
9. **AC9:** Given no citations, when `articleJsonLd` runs, then it has no `citation` key.
10. **AC10:** Given a minimal produce page, when rendered, then it has one `h1`, no skipped
    heading level, no heading without content, a table of contents whose links all resolve, and
    none of the optional sections (`#eat`, `#nutrition`, `#preparation`, `#traditional`,
    `#choose`, `#storage`, `#varieties`, `#grow`, `#faq`), no photo, no Latin name and no empty
    list.
11. **AC11:** Given a minimal produce page, when checked with axe, then it has no violations.
12. **AC12:** Given a minimal produce page, then it uses no `hidden` attribute or inline style to
    hide content, and its reading order is header, table of contents, stall, farms, sources.
13. **AC13:** Given a minimal produce page, then its `Article` JSON-LD has no `image`,
    `alternateName` or `citation`, it has no `FAQPage`, and the sources section has no list but
    still links the methodology.
14. **AC14:** Given a produce with nutrition but no preparation and no traditional uses, when its
    page is rendered, then `#eat` shows only the nutrition section.
15. **AC15:** Given a `ProduceCard` or `SeasonList` for a produce without a Latin name, when
    rendered, then no `lang="la"` element is rendered.
16. **AC16:** Given the content guide, then it shows the minimal entry and says what each optional
    block adds.

## 9. Test plan

| AC   | Test type | Test file                                                                    |
| ---- | --------- | ---------------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-049.test.ts`             |
| AC2  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-049.test.ts`             |
| AC3  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-049.test.ts`             |
| AC4  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-049.test.ts`             |
| AC5  | unit      | `tests/unit/composition/ProduceDetailsQuery-049.test.ts`                     |
| AC6  | unit      | `tests/unit/contexts/catalog/application/NutrientRankingService-049.test.ts` |
| AC7  | unit      | `tests/unit/composition/ProduceDetailsQuery-049.test.ts`                     |
| AC8  | unit      | `tests/unit/components/produce/produceToc.test.ts`                           |
| AC9  | unit      | `tests/unit/shared/seo/jsonLd-049.test.ts`                                   |
| AC10 | component | `tests/components/ProducePage-049.test.ts`                                   |
| AC11 | component | `tests/components/ProducePage-049.test.ts` (axe-core in happy-dom)           |
| AC12 | component | `tests/components/ProducePage-049.test.ts`                                   |
| AC13 | component | `tests/components/ProducePage-049.test.ts`                                   |
| AC14 | component | `tests/components/ProducePage-049.test.ts`                                   |
| AC15 | component | `tests/components/ProducePage-049.test.ts`                                   |
| AC16 | unit      | `tests/unit/content/season-only-049.test.ts`                                 |

The page is rendered through the Astro Container API with `@composition/index` mocked to an
in-memory repository holding a test-only fixture (as in `AdSlot-placement-037.test.ts`). No
test produce is added to `src/data`. The existing seed tests stay green: every existing produce
is still valid, the USDA test checks every produce that has nutrition, and the growing-guide and
photo tests check a guide or a photo whenever one is present.

## 10. Third-party documentation consulted

| Package   | Version | Source (URL or Context7 ID)                                          | Topic                                                                  |
| --------- | ------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| zod       | 4.6.7   | Context7 `/colinhacks/zod/v4.6.7` (`api.mdx`, `wiki/optionality.md`) | `.default()` makes a key optional on input and required on output      |
| astro     | 7.4.8   | `node_modules/astro/dist/container/index.d.ts`                       | `experimental_AstroContainer.renderToString` with `params` (as in 037) |
| axe-core  | 4.14.0  | `node_modules/axe-core/axe.d.ts`                                     | `axe.run(context, options)`, `runOnly` / `rules` options, `violations` |
| happy-dom | 21.0.4  | `node_modules/happy-dom/lib/window/Window.d.ts`                      | `Window`, `document.write`, `window.eval` to load the axe source       |
