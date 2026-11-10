# 002. Content model, seed data and repositories

- **Status:** Approved
- **Bounded context(s):** catalog, geography, farms (+ seasonality, shared)
- **Related:** ADR-0001, ADR-0002, spec 001

## 1. Goal

Define the data contract for all site content (produce, botanical groups, nutrients, regions,
farms), seed it with a first set of real Bulgarian content, and expose it to the rest of the
application as domain entities through repository interfaces. The content source (YAML files
today, a CMS later) must be swappable by replacing one adapter per context.

## 2. User stories

- As a content editor, I want to add a product by creating one YAML file, so that I do not
  touch code.
- As a content editor, I want the build to fail with a clear message when data is invalid or
  references something that does not exist, so that broken pages never ship.
- As a developer, I want pages to receive domain entities (not raw YAML), so that business rules
  live in one place.
- As a visitor, I want every nutrition table and traditional use to cite a source, so that I
  can trust the information.

## 3. Scope

### In scope

- Zod schemas for collections `produce`, `groups`, `nutrients`, `regions`, `farms`
  (`src/contexts/<ctx>/infrastructure/schemas.ts`), registered in `src/content.config.ts`.
- Domain entities and value objects: `Produce`, `ProduceKind`, `NutritionFacts`,
  `ProduceGroup`, `Nutrient`, `Region`, `Farm`, `ContactInfo`.
- Repository interfaces (domain) and Astro content-collection adapters (infrastructure).
- Pure mappers from schema output to entities.
- A composition root (`src/composition/`) that wires adapters into repositories for pages.
- Seed data: 13 products, 7 groups, 10 nutrients, 28 provinces, 3 placeholder farms.
- `docs/CONTENT-GUIDE.md`.

### Out of scope

- Sponsors collection (Phase 4), images (later), region descriptions and map ids (Phase 3).
- Seasonal queries and pages (specs 004, 005).

## 4. Domain model

### catalog

- **`ProduceKind`**: `fruit` | `vegetable` | `herb` | `nut`.
- **`NutritionFacts`** (VO): `energyKcal`, `proteinG`, `fatG`, `carbohydrateG`, `fiberG`,
  optional `sugarsG`, `micronutrients: { nutrientSlug, amount }[]`, `source: { name, url }`.
  All amounts are per 100 g raw edible portion and ≥ 0. A nutrient appears at most once.
- **`Produce`** (entity, identity = `slug`): `name`, `latinName`, `kind`, `groupSlug`,
  `summary`, `varieties[]`, `calendar: SeasonCalendar`, `growingRegions: { regionSlug, note }[]`,
  `nutrition`, `preparation: { method, tip }[]`, `traditionalUses: { system, use, source }[]`,
  `howToChoose`, `storage`, `faq: { question, answer }[]`, `updatedAt: Date`,
  `reviewStatus: 'draft' | 'reviewed'`.
  Behaviour: `levelIn(month)`, `isFreshIn(month)`, `isGrownIn(regionSlug)`.
- **`ProduceGroup`** (entity): `slug`, `name`, `latinName`, `description`.
- **`Nutrient`** (entity): `slug`, `name`, `kind` (`vitamin` | `mineral`), `unit` (`mg` | `µg`),
  `referenceIntake` (EU NRV for adults, Regulation (EU) 1169/2011 Annex XIII), `description`.
  Behaviour: `percentOfReferenceIntake(amount)` rounded to an integer.
- **Repositories:** `ProduceRepository { all(); findBySlug(slug) }`,
  `ProduceGroupRepository { all(); findBySlug(slug) }`, `NutrientRepository { all(); findBySlug(slug) }`.

### geography

- **`Region`** (entity): `slug`, `name`. **`RegionRepository { all(); findBySlug(slug) }`**.

### farms

- **`ContactInfo`** (VO): optional `website` (https URL), `email`, `phone` (E.164 `+359…`).
  Invariant: at least one of them is present.
- **`Farm`** (entity): `slug`, `name`, `regionSlug`, `produceSlugs[]`, `description`, `contact`,
  optional `address`, `isPlaceholder`, `sponsored`.
  Behaviour: `sells(produceSlug)`.
- **`FarmRepository { all(); findBySlug(slug); findByProduce(produceSlug) }`**.

All repository methods are `async` and return frozen entities. `all()` returns entities sorted
by Bulgarian name (`localeCompare(..., 'bg')`).

## 5. Behaviour and edge cases

- **Entry id rule:** each data file name (the entry id) equals `Slug.fromBulgarian(name)`.
- **References:** `produce.group` → `groups`, `produce.regions[].region` → `regions`,
  `produce.nutrition.micronutrients[].nutrient` → `nutrients`, `farms.region` → `regions`,
  `farms.produce[]` → `produce`. Unknown ids fail validation.
- **Schema rules:** non-empty trimmed strings; `summary` 70–160 characters (used as meta
  description); `season` follows spec 001 (≥ 1 entry, unique months); ≥ 1 region;
  ≥ 1 preparation tip; unique varieties; `updatedAt` an ISO date; URLs are `https:`.
- **Traditional uses:** `use` must start with „Традиционно се използва“ (no health claims,
  EU Regulation 1924/2006); each has a `source` with `name` and `url`.
- **Placeholder farms:** `isPlaceholder: true`, contacts on `example.com` / `+359000…`.
- **Seed data status:** every seed product has `reviewStatus: draft` until a human verifies
  values against the cited source.
- Schemas are strict: unknown keys (typos such as `sumary`) are rejected at every level.
- `updatedAt` is a YAML date or an ISO `YYYY-MM-DD` string; anything else is rejected.
- `summary` is a single line. `sugarsG` must not exceed `carbohydrateG`.
- URLs are `https:` with a dotted hostname; phones are Bulgarian E.164 (`+359…`).
- `ContactInfo` rejects blank or malformed values; `Nutrient` requires a positive finite
  reference intake and non-negative amounts (`InvalidNutrientError`); `Produce` rejects an
  invalid `updatedAt` (`InvalidProduceError`) and returns a new `Date` on every read.
- Repositories retry the loader after a failed load and break name ties by slug.
- Seed text (summaries, preparation tips, FAQ, traditional uses) contains no health-effect
  wording; a test rejects words such as „лекува“, „действие“, „полезн…“.
- Placeholder farms use only `example.com` and `+359000…` contacts.
- Mappers throw the spec 001 `DomainError`s for invalid values; `ContactInfo` without any
  contact throws `InvalidContactInfoError`; negative nutrition values throw
  `InvalidNutritionFactsError`.

## 6. Accessibility requirements

Not applicable (no UI). Content rules that later affect accessibility: names are plain text
(no markup); Latin names are stored separately so pages can mark them up with `lang="la"`.

## 7. SEO requirements

- `summary` (70–160 chars) is the meta description source for product pages.
- `updatedAt` feeds `dateModified`; `source` fields feed citations (E-E-A-T).
- Entry ids are the URL slugs; the id rule keeps URLs consistent with Bulgarian names.

## 8. Acceptance criteria

1. **AC1:** Given a valid produce record, the schema accepts it and the mapper returns a frozen `Produce` with a `SeasonCalendar`.
2. **AC2:** Given a produce record with a missing source, a summary outside 70–160 chars, an empty region list, a duplicate season month, or a traditional use not starting with „Традиционно се използва“, the schema rejects it.
3. **AC3:** Given a `Produce`, `levelIn`, `isFreshIn` and `isGrownIn` answer per its data.
4. **AC4:** Given nutrition with a negative amount or a repeated nutrient, `NutritionFacts` throws `InvalidNutritionFactsError`.
5. **AC5:** Given an amount, `Nutrient.percentOfReferenceIntake` returns the rounded percentage of the NRV.
6. **AC6:** Given contact info with no website, email or phone, `ContactInfo` throws `InvalidContactInfoError`; a valid one is frozen.
7. **AC7:** Given a farm, `sells(slug)` reports whether the farm lists that produce.
8. **AC8:** Given in-memory data, every repository's `all()` is sorted by Bulgarian name and `findBySlug` returns `undefined` for unknown slugs; `FarmRepository.findByProduce` filters by produce.
9. **AC9:** Given the seed files in `src/data/**`, every entry validates against its schema.
10. **AC10:** Given the seed files, every entry id equals `Slug.fromBulgarian(name)`.
11. **AC11:** Given the seed files, every reference points to an existing entry.
12. **AC12:** Given the seed files, there are exactly 28 regions, ≥ 12 produce, every farm is a placeholder, and every produce has `reviewStatus: draft` or `reviewed`.
13. **AC13:** Given `pnpm build`, the content collections load without errors.

## 9. Test plan

| AC       | Type  | Test file                                                    |
| -------- | ----- | ------------------------------------------------------------ |
| AC1–AC2  | unit  | `tests/unit/contexts/catalog/infrastructure/schemas.test.ts` |
| AC1      | unit  | `tests/unit/contexts/catalog/infrastructure/mappers.test.ts` |
| AC3      | unit  | `tests/unit/contexts/catalog/domain/Produce.test.ts`         |
| AC4      | unit  | `tests/unit/contexts/catalog/domain/NutritionFacts.test.ts`  |
| AC5      | unit  | `tests/unit/contexts/catalog/domain/Nutrient.test.ts`        |
| AC6–AC7  | unit  | `tests/unit/contexts/farms/domain/Farm.test.ts`              |
| AC8      | unit  | `tests/unit/shared/infrastructure/IndexedRepository.test.ts` |
| AC9–AC12 | unit  | `tests/unit/content/seed-data.test.ts`                       |
| AC13     | build | `pnpm build` in CI                                           |

## 10. Third-party documentation consulted

| Package   | Version   | Source                                                                                   | Topic                                                             |
| --------- | --------- | ---------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| astro     | 7.4.8     | Context7 `/withastro/docs` (guides/content-collections, reference/modules/astro-content) | `defineCollection`, `glob` loader, `reference()`, `getCollection` |
| astro     | 7.4.8     | `node_modules/astro/dist/content/runtime.d.ts`                                           | `reference()` output `{ id, collection }`                         |
| astro/zod | zod 4.6.7 | `node_modules/astro/dist/zod.d.ts` (re-exports `zod/v4`)                                 | Schema API                                                        |
| yaml      | 2.9.1     | npm `yaml` README                                                                        | Parsing seed files in tests                                       |
| EU NRVs   | 2011      | Regulation (EU) No 1169/2011, Annex XIII Part A                                          | Reference intakes                                                 |
| USDA FDC  | SR Legacy | https://fdc.nal.usda.gov                                                                 | Nutrition values per 100 g                                        |
