# 019. Organic production per produce and organic farms

- **Status:** Approved
- **Bounded context(s):** catalog (`Produce`), farms (`Farm`), composition, UI (produce page)
- **Related:** epic #66, issue #68, specs 002, 005, 018

## 1. Goal

Tell readers whether certified organic production of a produce exists in Bulgaria, with a
source, and mark farms that hold a valid organic certificate, so a shopper can look for organic
local produce. Wording is factual only: organic is a production method, never a health claim.

## 2. User stories

- As a shopper, I want to know whether Bulgarian organic apples exist at all before I look for
  them.
- As a shopper, I want to see which listed farms are certified organic, and by whom.
- As a careful reader, I want the organic information to cite a source.

## 3. Scope

### In scope

- **Produce:** an optional `organic` block:
  - `availability`: `available` (certified organic production clearly exists in Bulgaria) or
    `limited` (small or occasional);
  - `note`: one factual single-line sentence (≤ 160 characters), e.g. areas from official
    statistics;
  - `sources`: one or more citations.

  Produce without a sourced answer has no block (no „unknown“ state is shown).

- **Farms:** an optional `organic` block: `certifier` (certification body), `certificateId`,
  `validUntil` (date). A farm is organic on a date when that date's calendar day in
  Europe/Sofia is on or before `validUntil`.
- **Produce page, farms section:**
  - a line „Био в България: <статус>. <note>“ when the produce has the
    block, its sources joining the page sources;
  - farms split into „Сертифицирани био ферми“ and „Други ферми“ (`h3` each) when at least one
    farm is organic on the build date; otherwise the list stays as it is;
  - each organic farm shows a „Био“ label with its certifier („Био · <certifier>“).
- **Seed data:** `organic` blocks for the produce the research could source; no placeholder
  farm gets an organic block (it would be invented).

### Out of scope

- Organic farm search or filters with JavaScript.
- Real farm data (#16).

## 4. Domain model

- `OrganicAvailability`: `'available' | 'limited'`.
- `OrganicProduction` (read model on `Produce.organic`): `availability`, `note`, `sources`
  (frozen, at least one source).
- `OrganicCertificate` (value on `Farm.organic`): `certifier`, `certificateId`, `validUntil`;
  `Farm.isOrganicOn(date)`.
- `ProduceDetailsQuery` adds the organic sources to the page sources and returns farms with an
  `organic` flag for the build date.

## 5. Behaviour and edge cases

- An expired certificate (`validUntil` before the build date) shows no label and the farm is
  listed under „Други ферми“.
- The availability text: `available` → „има сертифицирано производство“, `limited` →
  „има ограничено сертифицирано производство“.
- `Farm.create` throws `InvalidFarmError` for a certificate with a blank certifier or id or an
  invalid date.
- `ProduceDetailsQuery.forSlug` takes the date explicitly (the page passes the build date).
- Data notes (QA 019): a producer's own statement that it is certified is worded as „посочва, че е
  сертифицирана“; only a certificate with certifier and number gives a farm the „Био“ label.
- Sponsored and placeholder labels keep working next to the organic label.
- Order inside each farm group is unchanged (sponsored first, then by name, as today).

## 6. Accessibility requirements

- The status line is plain text; the organic label is text („Био · …“), not colour or an icon
  alone.
- The farm groups use `h3` under the section `h2`; farm names stay `h3` inside a single list
  when there are no organic farms, and become `h4` inside the groups, so headings never skip a
  level.
- Readable without CSS; zero axe violations in light and dark mode. The grouped markup is
  covered by component tests; it reaches the e2e axe run once a seed farm holds a certificate.

## 7. SEO requirements

- Organic sources join the `Article` JSON-LD `citation` list.
- No change to titles or descriptions.

## 8. Acceptance criteria

1. **AC1:** The produce schema accepts a valid `organic` block and none; it rejects an unknown
   availability, a note over 160 characters, and missing or empty sources.
2. **AC2:** The farm schema accepts a valid `organic` block and none; it rejects a missing
   certifier, certificate id or date.
3. **AC3:** `toProduce` maps `organic`; `Farm.isOrganicOn` is true on and before `validUntil`
   and false after it, by the calendar day in Europe/Sofia; `Farm.create` rejects an invalid
   certificate.
4. **AC4:** `ProduceDetailsQuery` adds the organic sources once and marks each farm `organic`
   for the given date.
5. **AC5:** The farms section renders the status line; with an organic farm it renders the two
   `h3` groups with farm names as `h4` and the „Био · <certifier>“ label; without one, the single
   list as before.
6. **AC6:** Seed produce organic blocks pass the schema with https sources; no placeholder farm
   has an organic block; the built page with an organic block shows the status line and passes
   axe (unit, e2e).

## 9. Test plan

| AC  | Type      | Test file                                                                  |
| --- | --------- | -------------------------------------------------------------------------- |
| AC1 | unit      | `tests/unit/contexts/catalog/infrastructure/organicSchema.test.ts`         |
| AC2 | unit      | `tests/unit/contexts/farms/infrastructure/organicFarm.test.ts`             |
| AC3 | unit      | `tests/unit/contexts/farms/domain/Farm-019.test.ts`, `Farm-019-qa.test.ts` |
| AC4 | unit      | `tests/unit/composition/ProduceDetailsQuery-019.test.ts`                   |
| AC5 | component | `tests/components/FarmList-019.test.ts`                                    |
| AC6 | unit, e2e | `tests/unit/content/seed-organic.test.ts`, `tests/e2e/organic.spec.ts`     |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                       | Topic                 |
| ---------------- | ------- | ------------------------------------------------------------ | --------------------- |
| Eurostat         | current | Dataset `org_cropar` (organic crop area by crop and country) | Organic area evidence |
| astro            | 7.4.8   | Context7 `/withastro/docs` (content collections)             | Schema                |
