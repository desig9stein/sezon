# 054. Keystatic local editing

- **Status:** Implemented
- **Bounded context(s):** none (repository tooling over the content of catalog, geography, farms,
  recipes and advertising)
- **Related:** ADR-0008, ADR-0001, ADR-0005, spec 002 (content model), spec 049 (season-only
  mandatory), issue #23

## 1. Goal

The owner edits content by hand in YAML today. This feature adds Keystatic's admin UI in local
mode so the owner can edit produce, groups, nutrients, regions, farms, recipes and sponsors in
forms, while Keystatic writes the same `src/data/<collection>/<id>.yaml` files the Astro content
collections read. There is no data migration and the production site does not change: the admin
exists only in `astro dev`.

## 2. User stories

- As the owner, I want to open `/keystatic` while running `pnpm dev` and edit an entry in a form,
  so that I do not have to remember YAML syntax and key names.
- As the owner, I want the form to require the same fields as the schema, so that a saved entry
  passes the build.
- As the owner, I want saving an entry to keep every value I did not edit, so that the CMS never
  loses sources, nutrition data or photos.
- As a visitor, I want the public site to stay as fast and accessible as before, so that the CMS
  costs me nothing.

## 3. Scope

### In scope

- `keystatic.config.ts` at the repository root, local storage, one collection per Astro content
  collection: `produce`, `groups`, `nutrients`, `regions`, `farms`, `recipes`, `sponsors`.
- A dev-only Astro integration (`scripts/cms/localCms.mjs`) that adds `@astrojs/react` and
  `@keystatic/astro` only for `astro dev`.
- Exported constants in `src/content.config.ts` (`DATA_DIRECTORY`, `ENTRY_FILE_PATTERN`) so tests
  can compare the Keystatic paths with the collection globs.
- An ESLint rule that keeps `keystatic.config.ts` and `@keystatic/*` out of `src/`.
- `docs/CONTENT-GUIDE.md`: a short „Editing with Keystatic“ section.

### Out of scope

- Keystatic GitHub mode or Keystatic Cloud (needs a server adapter and secrets; ADR-0008 records
  it as a later option).
- Editing optional nested blocks in forms: `nutrition`, `photo`, `growing`, `organic`,
  `regions[].source` (produce), `profile` (regions) and `organic` (farms). Keystatic keeps them
  unchanged (`fields.ignored`); they are edited in YAML.
- Uploading images through Keystatic (sponsor banners are a text path, produce photos are kept
  as they are).
- Keeping the hand-written YAML style on save (see section 5).
- Any change to pages, components, the build output or the content schemas.

## 4. Domain model

No domain change. The Keystatic schema mirrors the Zod schemas in
`src/contexts/*/infrastructure/schemas.ts` (and `src/content.config.ts`) field by field:

| Collection  | Slug field (name → file name) | Editable fields                                                                                                                                                                                                                 | Kept as is (`fields.ignored`)                                  |
| ----------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- |
| `produce`   | `name`                        | `latinName`, `kind`, `group`, `summary` (70–160), `varieties[]`, `season[]` (month 1–12, level), `regions[]` (region, note), `preparation[]`, `traditionalUses[]` (with source), `howToChoose`, `storage`, `faq[]`, `updatedAt` | `nutrition`, `photo`, `growing`, `organic`, `regions[].source` |
| `groups`    | `name`                        | `latinName`, `description`                                                                                                                                                                                                      | –                                                              |
| `nutrients` | `name`                        | `kind`, `unit`, `referenceIntake`, `claims[]`, `claimsSource`, `note`                                                                                                                                                           | –                                                              |
| `regions`   | `name`                        | –                                                                                                                                                                                                                               | `profile`                                                      |
| `farms`     | `name`                        | `region`, `produce[]`, `description`, `contact` (website, email, phone), `address`, `sponsored`, `sources[]`                                                                                                                    | `organic`                                                      |
| `recipes`   | `title`                       | `summary` (70–160), `category`, `produce[]`, `yield`, `prepMinutes`, `cookMinutes`, `processingMinutes`, `waitDays`, `ingredients[]`, `steps[]`, `safety` (with sources), `sources[]`, `publishedAt`, `updatedAt`               | –                                                              |
| `sponsors`  | `name`                        | `image` (text path), `alt`, `url`, `placement`, `from`, `to`                                                                                                                                                                    | –                                                              |

Required in Keystatic are exactly the schema's required fields; for produce these are the name,
kind, group, summary, season and update date (spec 049). References (`group`, `region`,
`produce`) are Keystatic relationship fields, so the form offers only existing entries.

## 5. Behaviour and edge cases

- **Dev only.** `localCms()` adds the integrations in `astro:config:setup` when `command` is
  `dev`, and also adds `react-dom/client` to `vite.optimizeDeps.include` (without it the admin
  does not hydrate, ADR-0008). For `build`, `preview` and `sync` it does nothing and imports
  nothing. It also does nothing when `VITEST` is set, because Vitest's `getViteConfig` runs the
  Astro config as `dev`.
- **Slug.** The slug field's name is stored in the file (`name`, or `title` for recipes); the slug
  is the file name. For a new entry Keystatic proposes `Slug.fromBulgarian(name)`; while the name
  has no transliterable letters the proposal is empty. The slug must match `SLUG_PATTERN`.
  Keystatic rejects a slug another entry already has, and **Duplicate** proposes `<slug>-copy`.
  Changing the slug of a saved entry renames its file, which breaks its URL and the references to
  it; the content guide tells the owner not to.
- **Optional values.** An empty optional text, number or URL is left out of the file. An array is
  written even when empty (`varieties: []`), which the schemas parse like an absent list. A farm
  always gets `sponsored: true|false`; `false` is the schema default.
- **Optional nested blocks** are `fields.ignored`: Keystatic stores the value read from the file
  and writes it back with the same values, or leaves the key out when the file has none. A date in
  such a block (a farm's `organic.validUntil`) is written as a plain date (`2027-07-20`), not as
  `js-yaml`'s default `2027-07-20T00:00:00.000Z`.
- **Unknown keys.** Keystatic writes only the keys in its schema. Because every key of every Zod
  schema is in the Keystatic schema, and the strict Zod schemas reject other keys, no valid entry
  loses a key on save.
- **Formatting.** Keystatic writes YAML with `js-yaml`: block style, folded long strings and long
  URLs (`>-`), empty lists written out, dates unquoted (`2026-11-13`). The values are unchanged;
  the diff of a first save is larger than the edit.
- **Validation.** Keystatic validates required fields, lengths, month range and select values.
  Fields the schemas keep to one line use single-line inputs, and amounts the schemas require to
  be positive (`referenceIntake`, ingredient `quantity`) have a minimum of 0.001, the closest
  match to `.positive()` because Keystatic's minimum is inclusive. The
  remaining rules (https URLs, phone format, unique months, „Традиционно се използва“ prefix,
  date order, cross-references) stay with the Zod schemas and tests, which reject an invalid
  entry in `pnpm build` and CI as before.

## 6. Accessibility requirements

- The public site does not change: no new page, component or markup, so WCAG 2.2 AA conformance,
  the axe checks and Lighthouse Accessibility 100 are unaffected (AC9 checks the build output).
- The Keystatic admin is a development tool that exists only in `astro dev` for the owner. It is
  not published and is outside the site's accessibility scope. Its UI is Keystatic's (Keystar UI,
  built on React Aria).
- Behaviour without JavaScript: unchanged for the site; the admin itself requires JavaScript.

## 7. SEO requirements

- No new public routes: `/keystatic` and `/api/keystatic` are not built (AC9), so the sitemap,
  `robots.txt`, canonical URLs and structured data are unchanged.
- Content edited in Keystatic is the same YAML, so titles, descriptions and internal links follow
  the existing rules.

## 8. Acceptance criteria

1. **AC1:** Given the Astro content collections, when the Keystatic config is loaded, then it
   defines exactly one collection per content collection, with the same names.
2. **AC2:** Given a content collection `<name>` read from `./src/data/<name>` with pattern `*.yaml`,
   when its Keystatic collection is inspected, then its path is `src/data/<name>/*` with YAML data
   format, and Keystatic's reader lists exactly the ids of the YAML files in that folder.
3. **AC3:** Given each collection's Zod schema, when its keys are compared with the Keystatic
   schema (recursively through editable objects and array items), then every schema key has a
   Keystatic field and Keystatic has no key the schema lacks.
4. **AC4:** Given a Keystatic collection, when its slug field is inspected, then it is `name`
   (`title` for recipes), and the proposed slug of a Bulgarian name equals
   `Slug.fromBulgarian(name)` (`Зелен фасул` → `zelen-fasul`), or is empty for a name without
   letters.
5. **AC5:** Given every entry in `src/data`, when it is read with Keystatic's reader
   (`@keystatic/core/reader`), then the Zod-parsed reader value equals the Zod-parsed YAML file.
6. **AC6:** Given every entry in `src/data`, when it is saved through Keystatic's field parsers and
   serializers and `js-yaml` (as the admin does), then the Zod-parsed result equals the Zod-parsed
   original.
7. **AC7:** Given the minimal produce of spec 049, when it is saved through Keystatic, then it
   stays valid and no optional block is added; and given Keystatic's produce schema, then exactly
   `name`, `kind`, `group`, `summary`, `season` and `updatedAt` are required.
8. **AC8:** Given `localCms()`, when Astro runs `dev`, then it adds the React and Keystatic
   integrations and pre-bundles `react-dom/client`; when it runs `build`, `preview` or `sync`, or
   when Vitest runs it as `dev`, then it adds and imports nothing.
9. **AC9:** Given `pnpm build`, when `dist/` is inspected, then it has no `keystatic` file or
   folder, no file mentions Keystatic, no page contains an `astro-island`, and the CSP in
   `_headers` is unchanged.
10. **AC10:** Given a file in `src/`, when it imports `keystatic.config`, `@keystatic/*`, `react`
    or `react-dom`, then ESLint reports `no-restricted-imports`; when it loads the CMS with
    `import()`, then ESLint reports `no-restricted-syntax`.
11. **AC11:** Given `pnpm dev`, when `/keystatic` is opened, then the admin loads without console
    errors and lists the seven collections (manual check, QA).

## 9. Test plan

| AC   | Test type | Test file                                                   |
| ---- | --------- | ----------------------------------------------------------- |
| AC1  | unit      | `tests/unit/cms/keystaticConfig.test.ts`                    |
| AC2  | unit      | `tests/unit/cms/keystaticConfig.test.ts`                    |
| AC3  | unit      | `tests/unit/cms/keystaticConfig.test.ts`                    |
| AC4  | unit      | `tests/unit/cms/keystaticConfig.test.ts`                    |
| AC5  | unit      | `tests/unit/cms/keystaticRoundTrip.test.ts`                 |
| AC6  | unit      | `tests/unit/cms/keystaticRoundTrip.test.ts`                 |
| AC7  | unit      | `tests/unit/cms/keystaticRoundTrip.test.ts`                 |
| AC8  | unit      | `tests/unit/cms/localCms.test.ts`                           |
| AC9  | e2e       | `tests/e2e/keystatic-build.spec.ts`                         |
| AC10 | unit      | `tests/unit/cms/keystaticBoundary.test.ts`                  |
| AC11 | manual    | `pnpm dev`, open `/keystatic` (Playwright script during QA) |

QA findings (regression tests in `tests/unit/cms/keystatic-qa054.test.ts`): dates in kept blocks
stay plain dates; no form input accepts a value its Zod schema rejects (single-line text, positive
amounts); the produce summary uses the catalog's limits; the data directory is defined once in
`src/shared/infrastructure/contentFiles.ts`.

## 10. Third-party documentation consulted

| Package            | Version | Source (URL or Context7 ID)                                                                            | Topic                                                                                                |
| ------------------ | ------- | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| `@keystatic/core`  | 0.6.9   | Context7 `/thinkmill/keystatic`                                                                        | `config`, `collection` (`path`, `format`, `slugField`), `fields.*`, `fields.ignored`, `createReader` |
| `@keystatic/core`  | 0.6.9   | `node_modules/@keystatic/core/dist` (field `parse`/`serialize`, `serializeEntryToFiles`, `parseProps`) | How values are parsed, serialized and dumped with `js-yaml` on save                                  |
| `@keystatic/core`  | 0.6.9   | `node_modules/@keystatic/core/dist/declarations/src/form/fields/*.d.ts`                                | Field options and types                                                                              |
| `@keystatic/astro` | 6.0.0   | npm registry (`peerDependencies`: `astro: '5 \|\| 6 \|\| 7'`), `dist/keystatic-astro.js`               | Astro 7 support, injected routes, Vite config, `server.host`                                         |
| `@astrojs/react`   | 7.1.8   | `node_modules/@astrojs/react/dist/index.js`, `@astrojs/react-renderer@0.1.2`                           | Renderer, `optimizeDeps` includes                                                                    |
| `astro`            | 7.4.8   | `node_modules/astro` types (`AstroIntegration`, `astro:config:setup` `command`, `updateConfig`)        | Dev-only integration                                                                                 |
| `js-yaml`          | 4.3.2   | `node_modules/js-yaml` (the version `@keystatic/core` resolves)                                        | `dump` used by the round-trip test                                                                   |
| `eslint`           | 10.14.0 | `node_modules/eslint` (`ESLint#lintText`)                                                              | Boundary rule test                                                                                   |
