# 017. Botanical group pages

- **Status:** Approved
- **Bounded context(s):** catalog (group query), UI (group page, produce page link)
- **Related:** specs 005, 010, 013, 015, 016, issue #5

## 1. Goal

Give every botanical family (e.g. „Кръстоцветни – Brassicaceae“) its own page at
`/grupi/<slug>`, listing its produce by season in the current month, so readers can explore
related produce and search engines get an internal hub per family. The family line on each
produce page links to it.

## 2. User stories

- As a reader of the cabbage page, I want to open „Кръстоцветни“ and see which related produce
  are in season now.
- As a visitor who searches „кръстоцветни“ or „krastotsvetni“, I want to land on the family page.
- As a screen-reader user, I want the Latin family name announced in Latin.

## 3. Scope

### In scope

- **Application:** `ProduceGroupIndexService.groupFor(slug, month)` returns the group and its
  produce split by season level (peak, available, storage, out of season), plus `all` and
  `count`; `allGroups()` lists every group for `getStaticPaths`. The split by level is shared
  with `SectionIndexService` (one `seasonGroups(items, month)` helper).
- **Page `/grupi/<slug>`:**
  - `h1` with the Bulgarian name, then the Latin name in `lang="la"` italics as a subtitle;
  - the group description;
  - the produce in season groups, rendered by `SeasonGroupsList` (extracted from `SectionIndex`,
    which now wraps it): it takes any season grouping, an intro, an empty text and an `idPrefix`
    that keeps heading ids unique per page;
  - indexed for search by its heading and Latin name only (`data-pagefind-body` on the title
    block, Latin heading attributes), so a family never outranks the produce it lists.
- **Produce page:** the family fact („Семейство: Кръстоцветни (Brassicaceae)“) links to the
  group page.
- **SEO:** unique title and description, `CollectionPage` + `BreadcrumbList` JSON-LD, sitemap.

### Out of scope

- A `/grupi` index of all families (no issue asks for it; the produce pages link every family).
- New groups or group content.

## 4. Domain model

- `SeasonGroups` (application read model): `month`, `peak`, `available`, `storage`,
  `outOfSeason`, `all`, `count`, each list frozen and in repository order.
- `seasonGroups(items, month)`: pure function that builds it.
- `SectionIndex` becomes `SeasonGroups & { kind }`; `ProduceGroupIndex` is
  `SeasonGroups & { group: ProduceGroup }`.
- `ProduceGroupIndexService.groupFor` throws a new `ProduceGroupNotFoundError` (shared errors, like
  `NutrientNotFoundError`) for an unknown slug.

## 5. Behaviour and edge cases

- Produce belongs to a group through its `group` reference; a group with no produce shows the
  empty text „Все още няма добавени продукти от това семейство.“.
- The intro reads „Продуктите от семейство <име>, подредени по сезона през <месец>.“.
- The peak group shows plates (with photos), the other groups index rows, as on section pages.
- **Title:** „<Име> (<Latin>) – сезонни продукти“, shortened by the existing `fittingTitle`
  rule to fit 60 characters with the site suffix.
- **Description:** „<description> Кои от тях са в сезон през <месец> и какви са хранителните им
  стойности.“, 70–160 characters for every seed group (unit-tested).
- **Breadcrumbs:** Начало › <Име>.

## 6. Accessibility requirements

- One `h1`; the season group headings are `h2`, as on section pages.
- The Latin name is in `<i lang="la">` (WCAG 3.1.2).
- The produce page link „Кръстоцветни (Brassicaceae)“ has a name that makes sense in context
  (WCAG 2.4.4) and a target of at least 24 × 24 px or the inline exception.
- Readable without CSS (spec 009); zero axe violations in light and dark mode and at 320 px.

## 7. SEO requirements

- Unique title ≤ 60 characters and description 70–160 characters per group.
- Canonical `/grupi/<slug>`, in the sitemap.
- `CollectionPage` with an `ItemList` of the group's produce, and `BreadcrumbList`.
- Internal links: produce → group, group → produce.

## 8. Acceptance criteria

1. **AC1:** `seasonGroups` splits produce by level in the month and keeps `all` and `count`;
   `SectionIndexService` returns the same lists as before.
2. **AC2:** `ProduceGroupIndexService.groupFor` returns only the produce of that group, split by
   season, and throws `ProduceGroupNotFoundError` for an unknown slug; `allGroups` lists every group.
3. **AC3:** For every seed group, the title fits 60 characters with the suffix and the
   description is 70–160 characters; the intro and empty texts exist.
4. **AC4:** `routes.group(slug)` returns `/grupi/<slug>`.
5. **AC5:** The built `/grupi/krastotsvetni` has one `h1` „Кръстоцветни“, the Latin name in
   `lang="la"`, the description, a link to `/zelenchutsi/zele`, a canonical URL, and
   `CollectionPage` and `BreadcrumbList` JSON-LD (e2e).
6. **AC6:** The cabbage page's family fact links to `/grupi/krastotsvetni` (e2e).
7. **AC7:** Group pages have zero axe violations in light and dark mode and at 320 px, pass the
   spec 009 checks, are indexed for search, and meet ADR-0005 in Lighthouse (e2e, LHCI).

## 9. Test plan

| AC  | Type      | Test file                                                                           |
| --- | --------- | ----------------------------------------------------------------------------------- |
| AC1 | unit      | `tests/unit/contexts/catalog/application/seasonGroups.test.ts`                      |
| AC2 | unit      | `tests/unit/contexts/catalog/application/ProduceGroupIndexService.test.ts`          |
| AC3 | unit      | `tests/unit/i18n/bg-017.test.ts`                                                    |
| AC4 | unit      | `tests/unit/i18n/bg-017.test.ts`                                                    |
| AC5 | e2e       | `tests/e2e/group-pages.spec.ts`                                                     |
| AC6 | e2e       | `tests/e2e/group-pages.spec.ts`                                                     |
| AC7 | e2e, LHCI | `tests/e2e/group-pages.spec.ts`, `readable-without-css.spec.ts`, `lighthouserc.cjs` |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                 | Topic                        |
| ---------------- | ------- | ---------------------------------------------------------------------- | ---------------------------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (routing: dynamic routes, `getStaticPaths`) | Group routes                 |
| schema.org       | current | `CollectionPage`, `ItemList`, `BreadcrumbList`                         | Structured data              |
| WCAG 2.2         | 2023    | Understanding 2.4.4, 3.1.2                                             | Link purpose, language parts |
