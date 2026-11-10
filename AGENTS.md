# AGENTS.md

Instructions for every contributor (human or AI agent) working in this repository.
Read this file completely before making any change. It is the single source of truth
for how work is done here. `CLAUDE.md` imports it.

---

## 1. Project overview

**Sezon** is a static website (in Bulgarian) that shows which fruits, vegetables and herbs
are in season in Bulgaria right now, which regions grow them best, their nutrition facts,
how to prepare them to preserve nutrients, their traditional (e.g. Ayurveda) uses,
and which local farms sell them.

- **Audience:** Bulgarian-speaking users. All user-facing text is Bulgarian.
- **Repository language:** English. Code, identifiers, comments, commit messages, specs,
  ADRs, file names and data keys are in English. Bulgarian appears only in content values
  (`src/data/**`) and UI strings (`src/i18n/bg.ts`).
- **Quality bar:** Lighthouse **100/100** in Performance, Accessibility, Best Practices and SEO
  on every page template. WCAG 2.2 AA. Zero axe violations.
- **Business model:** non-intrusive advertising (direct sponsors first, lazy AdSense second).
  See `docs/ADR/0003-hybrid-advertising.md`.

The full roadmap is in `docs/PLAN.md`.

## 2. Tech stack

| Concern         | Tool                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------ |
| Framework       | Astro 7 (`output: 'static'`), deployed to Cloudflare Pages                                             |
| Language        | TypeScript 6 (`strict`, `noUncheckedIndexedAccess`)                                                    |
| Content         | Astro Content Layer, YAML files in `src/data/**`, Zod via `astro/zod`                                  |
| Styling         | Vanilla CSS, design tokens in `src/design/tokens.ts` (inlined as CSS custom properties), scoped styles |
| Unit/components | Vitest + Astro Container API                                                                           |
| E2E / a11y      | Playwright + `@axe-core/playwright`                                                                    |
| Performance     | Lighthouse CI (`lighthouserc.cjs`), all categories must be 1.0                                         |
| Lint / format   | ESLint (typescript-eslint, eslint-plugin-astro, jsx-a11y), Prettier                                    |
| HTML validity   | html-validate on `dist/`                                                                               |
| Package manager | pnpm 12 (see `packageManager`; settings in `pnpm-workspace.yaml`)                                      |

Exact versions are pinned in `package.json`. Do not upgrade a major version without an ADR.

## 3. Commands

```bash
pnpm install          # install dependencies
pnpm dev              # dev server on http://localhost:4321
pnpm test             # unit + component tests (Vitest)
pnpm test:watch       # Vitest in watch mode
pnpm test:coverage    # coverage report
pnpm check            # astro check (type-check .astro and .ts)
pnpm lint             # ESLint
pnpm format:check     # Prettier check
pnpm build            # static build into dist/
pnpm validate:html    # html-validate on dist/
pnpm test:e2e         # Playwright + axe against the built site (runs preview)
pnpm lhci             # Lighthouse CI against the built site (locally set CHROME_PATH to a Chrome binary)
pnpm verify           # lint + check + test + build + validate:html + test:e2e
```

## 4. Mandatory workflow: Spec → Tests → Implementation → QA

Every feature, fix with behaviour change, or new page follows these four steps **in order**.
A step is not skipped because the change "looks small".

### Step 1. Spec

- Copy `docs/specs/_TEMPLATE.md` to `docs/specs/NNN-<kebab-feature-name>.md`
  (`NNN` = next free number, zero-padded).
- Fill **every** section, in English. The sections are fixed:
  Goal, User stories, Scope / Out of scope, Domain model, Behaviour and edge cases,
  **Accessibility requirements**, **SEO requirements**, Acceptance criteria
  (numbered, Given/When/Then), Test plan (maps each acceptance criterion to a test),
  Third-party documentation consulted.
- Commit: `docs(spec): NNN <feature>`.

### Step 2. Tests (red)

- Write tests derived from the acceptance criteria. Name each test after the criterion
  (e.g. `it('AC3: returns the next month when ...')`).
- Run them and confirm they **fail for the right reason** (missing behaviour, not a typo).
- Commit: `test(<context>): <feature> (red)`.

### Step 3. Implementation (green → refactor)

- Write the minimum code that makes the tests pass, then refactor with the tests green.
- Commit: `feat(<context>): <feature>`.

### Step 4. QA review

- Launch the `qa-reviewer` subagent (`.claude/agents/qa-reviewer.md`) with the spec path
  and the list of changed files. Other agents: follow the same checklist manually.
- Fix every confirmed finding. Each bug fix gets a regression test first.
- Re-run `pnpm verify` (and `pnpm lhci` for UI changes).
- Commit: `fix(<context>): QA findings for NNN` (only if there were findings).

A feature is **done** only after Step 4. See the Definition of Done in section 11.

## 5. Third-party documentation

- Before using any third-party API (Astro, Vitest, Playwright, Zod, axe, Lighthouse, etc.)
  read the **current** official documentation for the **installed** version.
  Sources, in order: Context7 MCP, the official docs site, the package's type definitions
  in `node_modules`, the package changelog.
- Never rely on memory for API names, options or defaults.
- Record every consulted source (URL or Context7 ID + package version) in the spec's
  "Third-party documentation consulted" section.

### Skills

Official Claude skills are vendored in `.claude/skills/`. `docs/SKILLS.md` says which to use
for which task (e.g. `frontend-design` before new UI, `webapp-testing` during QA).

## 6. Architecture

Domain-Driven Design as a **modular monolith**. Each bounded context is isolated behind a
public `index.ts` and can be extracted into a separate service later without touching
other contexts. See `docs/ADR/0002-ddd-modular-monolith.md`.

```
src/
  shared/                     Shared kernel used by all contexts
    domain/                   Value objects and errors (Slug, DomainError, ...)
    seo/                      SEO meta + JSON-LD builders (pure functions)
  contexts/
    seasonality/              Month, SeasonLevel, SeasonWindow, season queries
    catalog/                  Produce, ProduceGroup, Nutrient, nutrition facts
    geography/                Region (the 28 provinces)
    farms/                    Farm, contact info
    advertising/              Sponsors, ad placements (Phase 4)
      <context>/
        domain/               Entities, value objects, repository interfaces. Pure TS.
        application/          Use cases / query services. Depends on domain only.
        infrastructure/       Adapters (Astro content collections, mappers).
        index.ts              Public API (domain + application). No infrastructure exports.
  composition/                Composition root: wires infrastructure adapters into services.
  content.config.ts           Astro collections + Zod schemas (data shape contract)
  data/<collection>/*.yaml    Content, one file per entry
  i18n/bg.ts                  All UI strings (keys in English, values in Bulgarian)
  components/<area>/*.astro   Presentational components
  layouts/                    Page layouts
  pages/                      Routes. Thin: call application services, render components.
  design/                     tokens.ts (design tokens, WCAG-tested), contrast.ts
  styles/                     base.css (reset + base)
tests/
  unit/                       Mirrors src/ structure
  components/                 Astro Container API tests
  e2e/                        Playwright + axe
  fixtures/                   Shared builders and in-memory repositories
```

### Dependency rules (enforced by review and ESLint `no-restricted-imports`)

1. `domain/` imports only `src/shared/domain`, its own context, and the public `index.ts` of an
   upstream context (allowed upstreams: `catalog` → `seasonality`; `farms` → none). No Astro, no I/O.
2. `application/` imports only `domain/` (own context and `shared`), plus other contexts'
   public `index.ts`.
3. `infrastructure/` may import `astro:content` and `astro/zod`. It is imported only by
   `src/content.config.ts` (schemas) and by the composition root `src/composition/`.
4. A context's `index.ts` exports its domain and application API only (never infrastructure),
   so it stays importable without Astro.
5. Pages and components get services from `src/composition/` and types from
   `src/contexts/<context>/index.ts`. They never import `domain/`, `application/` or
   `infrastructure/` paths directly.
6. No circular dependencies between contexts.

### Design principles

- **Value objects** are immutable classes with a private constructor and a static factory
  that validates input (`Month.of(11)`, `Slug.fromBulgarian('Ябълки')`).
  Invalid input throws a typed `DomainError` subclass.
- **Entities** own their behaviour (`produce.levelIn(month)`), not services or pages.
- **Repositories** are interfaces in `domain/`. Implementations live in `infrastructure/`
  (content collections) and `tests/fixtures/` (in-memory).
- **Dependency injection** through constructor parameters. No mutable singletons.
- **DRY:** UI strings only in `src/i18n/bg.ts`; one `Seo` component; shared test builders.
- **SOLID**, small functions, early returns, no boolean flag parameters that switch behaviour.
- Pure functions stay functions. Use classes where identity, invariants or polymorphism matter.

## 7. Coding standards

- TypeScript `strict`. No `any`. No non-null assertions (`!`) outside tests.
  Prefer `readonly` properties and `ReadonlyArray`.
- Named exports only (except where Astro requires a default export).
- File naming: `PascalCase.ts` for classes, `camelCase.ts` for function modules,
  `PascalCase.astro` for components, `kebab-case` for routes and data files.
- Identifiers in English. Data slugs are Latin transliterations of Bulgarian names.
- No magic numbers or strings: use named constants.
- Errors: throw typed errors from `src/shared/domain/errors.ts`; never throw strings.
- Formatting is owned by Prettier. Do not hand-format.

### Comment policy

- Comments describe **what** a function, method, class, component or non-obvious block
  does: purpose, parameters, return value, thrown errors. Use TSDoc (`/** ... */`).
- Do **not** write: change history, author notes, "fixed bug X", explanations of general
  programming or domain concepts, commented-out code, or TODOs without an issue link.
- Obvious code has no comment.

```ts
// Good
/**
 * Returns the season level of this produce in the given month.
 * @param month - Calendar month to look up.
 * @returns The level, or `undefined` when the produce is out of season.
 */

// Bad
// Changed on 2026-11-10 to use Month instead of number.
// DDD says value objects should be immutable, so we freeze here.
```

## 8. Accessibility rules (WCAG 2.2 AA)

- Exactly one `<h1>` per page; headings never skip a level.
- Landmarks: `<header>`, `<nav aria-label>`, `<main id="main">`, `<footer>`. Skip link first.
- Every interactive element is reachable and operable by keyboard, with visible `:focus-visible`.
- Text contrast ≥ 4.5:1 (≥ 3:1 for large text and UI boundaries). Use tokens only.
- Information is never conveyed by colour alone (season level = text + icon + colour).
- Target size ≥ 24×24 CSS px.
- Tables have `<caption>` and `<th scope>`.
- Images have meaningful Bulgarian `alt`, or `alt=""` when decorative.
- Respect `prefers-reduced-motion` and `prefers-color-scheme`.
- Every page works without JavaScript.
- Every page is readable and usable **without CSS**: the source order alone gives a logical
  reading order, icons and decorative images do not render oversized, nothing relies on CSS to
  hide or reveal content (except `.visually-hidden`), and CSS never reorders content.
- `lang="bg"` on `<html>`. Foreign-language fragments (e.g. Latin names) get `lang="la"`.

## 9. SEO rules

- Every page renders `<Seo>` with a unique title (≤ 60 chars) and description (70–160 chars).
- Canonical URL, Open Graph and Twitter tags on every page. `og:locale` = `bg_BG`.
- Structured data via the builders in `src/shared/seo/`. Validate shape in unit tests.
- URLs: Latin, lowercase, kebab-case, no trailing slash.
- Internal links between related entities (produce ↔ month ↔ region ↔ farm ↔ group).
- Health content (YMYL): each nutrition table and each traditional use has a `source`.

## 10. Content rules

- Content lives in `src/data/<collection>/<slug>.yaml`. The file name is the entry id
  and must equal the Latin slug.
- Nutrition values are per 100 g raw edible portion, with a `source` (USDA FoodData Central
  or EFSA, with URL).
- Traditional uses (Ayurveda, folk) are worded as **„традиционно се използва при …“**,
  never as a medical or health claim (EU Regulation 1924/2006). Each has a `source`.
- Placeholder data (e.g. example farms) must have `isPlaceholder: true` and is labelled in the UI.
- How to add an entry: see `docs/CONTENT-GUIDE.md`.

## 11. Definition of Done

- [ ] Spec exists in `docs/specs/` with all sections filled, including accessibility and SEO.
- [ ] Tests were committed red before the implementation.
- [ ] All acceptance criteria have a passing test.
- [ ] `qa-reviewer` ran and every confirmed finding is fixed.
- [ ] `pnpm verify` passes (lint, types, unit, build, html-validate, e2e + axe).
- [ ] For UI changes: `pnpm lhci` reports 100 in all four categories.
- [ ] No UI string outside `src/i18n/bg.ts` or `src/data/**`.
- [ ] Comments follow the comment policy.

## 12. Git

### Branches and pull requests

- `main` is the only long-lived branch. Nobody pushes to it directly.
- Every change goes through a pull request into `main`, from a short-lived branch named after
  the work: `<type>/<NNN>-<kebab-feature>` for spec-driven work (e.g. `feat/007-produce-index-pages`)
  or `<type>/<kebab-topic>` otherwise (e.g. `docs/content-guide-sources`, `fix/calendar-focus`).
  `<type>` is a Conventional Commits type. No tool-generated or random branch names.
- The owner reviews and merges. Delete the branch after the merge.
- Work starts from an issue (forms in `.github/ISSUE_TEMPLATE/`) and is tracked on the GitHub
  Projects board (see `docs/PROJECT-BOARD.md`).
- Every issue is assigned to the owner (`desig9stein`) when it is created.
- Every issue has full metadata: assignee, labels (`type:*`, at least one `area:*`, a phase
  label, plus `epic` or `status:blocked` where they apply), and parent epic.
  The repository does not use milestones: epics group the work and Planning dates set deadlines.
- Every issue is added to the **Planning** project with all fields filled: Status, Priority,
  Impact, Estimate (ideal days), Start date and Target date. An epic's dates span its sub-issues.
- Large work is an **epic**: an issue titled `epic: …` whose parts are GitHub **sub-issues**.
  Split an issue into sub-issues when it needs more than one pull request. Each roadmap phase
  has an epic; a sub-issue can itself have sub-issues (e.g. the redesign). PRs use `.github/pull_request_template.md` and
  link the issue with `Closes #<n>`.
- CI runs separate checks (Prettier, ESLint, Types, Unit tests and coverage, Build and HTML
  validation, E2E and accessibility, Lighthouse 100); all must pass before merging.
- A pre-commit hook (`simple-git-hooks` + `lint-staged`, installed by `pnpm install`) runs
  ESLint `--fix` and Prettier on staged files. Do not bypass it with `--no-verify`.
- The PR title is a Conventional Commits summary; the body lists the specs, what changed and how
  it was verified (`pnpm verify`, `pnpm lhci`).

### Commits

- Conventional Commits: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`, `ci`, `build`,
  with the bounded context as scope, e.g. `feat(seasonality): ...`.
- One logical change per commit. Commit messages in English, imperative mood.
- Never commit secrets. Configuration that differs per environment goes in `PUBLIC_*`
  environment variables documented in `.env.example`.
