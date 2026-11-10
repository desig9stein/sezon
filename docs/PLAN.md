# Sezon: seasonal produce in Bulgaria. Concept and development plan

## Context

This is a new project in an empty repo (`desig9stein/sezon`, branch `claude/seasonal-produce-bulgaria-1e20h1`, no commits yet). The site helps people in Bulgaria see:

- which fruits and vegetables are in season **right now**,
- which regions grow them best,
- nutrition facts, varieties, botanical group, how to cook them so the nutrients survive, and traditional (Ayurveda) uses,
- local farms for each product, with their sites and contacts.

Hard requirements: **Lighthouse 100/100 for SEO and Accessibility** (and Performance and Best Practices too), TDD (write the failing test first, then make it pass), latest Astro, the UI in Bulgarian and everything in the repo in English, data that is modular and ready for a CMS later. The site earns from tasteful advertising.

Decisions made with the user:

- **Ads:** hybrid. Our own sponsor banners and sponsored farms render as static HTML. AdSense loads lazily, only after consent, in slots with a reserved size (no CLS).
- **Hosting:** Cloudflare Pages, static output (SSG).
- **Content:** Claude writes the seed: 10–15 products with sourced data (USDA FoodData Central / EFSA). Every farm is clearly marked as a placeholder. The user verifies everything.
- **URLs:** Latin transliteration that follows the official Bulgarian system, for example `/plodove/yagodi` and `/regioni/plovdiv`.
- **Styling:** vanilla CSS with design tokens (custom properties) and Astro scoped styles.
- **Regions:** the 28 provinces (oblasti) plus an accessible SVG map.
- **Farms:** added only by the owner, as files in the repo. The site has an "Add your farm" page with mailto.
- **Scope of this session:** the plan in the repo plus **Phase 1**.

---

## Architecture

**Stack:** latest stable Astro (check with `npm view astro version` at install), TypeScript strict, pnpm, Node 22 LTS, `output: 'static'`.
Zero client JS by default. Small islands only where needed, as vanilla `<script>` (filters, consent, ad loader).

**Content:** Astro Content Layer (`src/content.config.ts`) with Zod schemas. The data lives in `src/data/**` as YAML/JSON (one file per item). This makes a later move to a CMS (Keystatic or Decap, which write the same files to git) almost free. Pages never read files directly. They go only through the application layer of each bounded context (`src/contexts/<context>/index.ts`), whose infrastructure adapters are the only code that reads collections. The data source can be swapped (CMS or API) in one place.

### Collections and schemas

| Collection  | Key fields                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `produce`   | `slug`, `name` (bg), `latinName`, `kind` (`fruit`\|`vegetable`\|`herb`\|`nut`), `group` → ref `groups`, `varieties[]`, `season: { month: 1-12, level: 'peak'\|'available'\|'storage' }[]`, `regions[]` → ref `regions` (+ `note` on why the region is good), `nutrition` (per 100 g: kcal, protein, fat, carbs, fiber, vitamins[], minerals[], `source`), `preparation[]` (method + effect on nutrients), `traditionalUses[]` (`system: 'ayurveda'\|'folk'`, text, `source`), `howToChoose`, `storage`, `image`, `faq[]`, `updatedAt` |
| `groups`    | botanical family (Rosaceae → „Розоцветни“), description                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `regions`   | the 28 provinces: `slug`, `name`, `svgId`, `description`, agricultural profile                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `farms`     | `name`, `region`, `produce[]`, `website`, `phone`, `email`, `address`, `geo`, `isPlaceholder`, `sponsored`, `verifiedAt`                                                                                                                                                                                                                                                                                                                                                                                                              |
| `nutrients` | vitamin or mineral: name, function, RDA (EFSA), sources                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `sponsors`  | banner: image, alt, url (`rel="sponsored"`), placement, dates `from`/`to`                                                                                                                                                                                                                                                                                                                                                                                                                                                             |

Cross-collection refs (`reference()`) are validated at build time, so a broken link fails the build.

### Routes (Bulgarian content, Latin URLs)

- `/` shows the current month: "В сезон сега" (peak), "Все още има" (available), "Идва скоро" (next month)
- `/sezon/[mesets]` gives 12 month pages (`/sezon/noemvri`), strong for queries like „какво е в сезон през ноември“
- `/plodove`, `/zelenchutsi`, `/podpravki`, `/yadki` (section indexes in Phase 2); product pages at `/<section>/<slug>` (built)
- `/kalendar` is a seasonal calendar as an accessible `<table>` (12 columns)
- `/grupi/[slug]`, `/nutrienti/[slug]` (for example „храни богати на витамин C“, long-tail SEO)
- `/regioni`, `/regioni/[slug]` (map, what grows there, farms)
- `/fermi`, `/fermi/[slug]`, `/dobavi-ferma`
- `/za-nas`, `/metodologiya` (sources, E-E-A-T), `/reklama` (for advertisers), `/poveritelnost`, `/biskvitki`, `404`

### The "current season" on a static site

- The home page is generated with the build-time month (Europe/Sofia).
- A GitHub Actions cron calls the Cloudflare Pages deploy hook **daily at 00:05 Sofia time**, so the content stays current. Month changes are the critical moment.
- No client-side fallback script: revealing a notice after load would cause layout shift and is blocked by the CSP. The rebuild cron keeps the month current (spec 004).
- Season logic lives in the `seasonality` and `catalog` domain layers (pure TypeScript), 100% covered by unit tests.

### Monetization without intrusiveness

- `<AdSlot placement="…">` reserves fixed dimensions (`aspect-ratio`/`min-height`), carries the visible label „Реклама“ and `aria-label`, and never sits above the fold on mobile.
- The first choice is a **direct sponsor** from the `sponsors` collection (static `<a rel="sponsored noopener">` with an `<img>` from `astro:assets`). The slot falls back to AdSense only when there is no sponsor.
- AdSense loads **only after consent** (GDPR. In the EEA Google requires Consent Mode v2 and a certified CMP, which is noted as a decision for Phase 4) and only on `IntersectionObserver`. Lighthouse does not scroll, so it measures 100. Real users see the ads lazily.
- "Sponsored farm" is a native card in the farm list with the label „Спонсорирано“, designed like the rest.
- `PUBLIC_ADSENSE_CLIENT` serves as the feature flag. With no value, no ad code is rendered.

### SEO checklist (each item is covered by a test)

- A unique `<title>` and `meta description` per page. Each page goes through `BaseLayout` → `<Seo>` and `buildPageMeta()`, which validates length.
- `canonical`, `lang="bg"`, `og:*`, `twitter:*`, `og:locale=bg_BG`.
- JSON-LD builders in `src/shared/seo/`: `WebSite` (+ SearchAction after Pagefind), `BreadcrumbList`, `ItemList` (season lists), `FAQPage` (product FAQ), `LocalBusiness`/`Farm` for farms, `Article` with `about`, `dateModified` and `citation` for product pages.
- `@astrojs/sitemap`, `robots.txt`, clean URLs with trailing-slash policy `never`, 301 redirects through `_redirects`.
- Rich internal linking: product ↔ month ↔ region ↔ farm ↔ nutrient ↔ group.
- YMYL/E-E-A-T: sources on every claim, an „Обновено на“ date, a methodology page, a health disclaimer. Ayurveda appears as **„традиционно се използва при…“**, never as a medical claim (EU Regulation 1924/2006 on health claims).
- Images: AVIF/WebP, `width`/`height`, `loading="lazy"` except the LCP image, meaningful `alt` in Bulgarian.
- Self-hosted variable font with a Cyrillic subset (Fontsource) and `font-display: swap` + preload, or a system stack.

### Accessibility checklist (WCAG 2.2 AA)

Skip link, landmarks, one `h1` per page, logical heading order, visible `:focus-visible`, AA contrast (tokens tested automatically), `prefers-reduced-motion`, `prefers-color-scheme`, 24×24 px minimum targets, a calendar `<table>` with `<th scope>` and a `caption`, season level shown by **text + icon** and never by color alone, the SVG map as `role="img"` + links per province + an equivalent text list, filters as a `<form>` that works without JS.

### Useful features (users + SEO)

1. **Seasonal calendar** (printable, `@media print`).
2. **„Как да избера зрял…“** and **„Как да съхранявам“** sections on every product, which win featured snippets.
3. **Nutrient pages** („Кои сезонни храни са богати на желязо“).
4. **Local vs imported:** a hint when a product in a store is out of the local season.
5. **Search with Pagefind:** static, zero JS until the user types.
6. **Monthly newsletter "What's in season"** (Phase 5, via an external provider).
7. **Shareable monthly lists** with a generated OG image per month and product.
8. **RSS feed** for monthly updates.
9. **PWA/offline** for the calendar (Phase 5, optional).

---

## Engineering workflow (mandatory for every feature, human or agent)

Every feature follows these four steps, in this order:

1. **Spec**: `docs/specs/NNN-<feature>.md` in English, from the template `docs/specs/_TEMPLATE.md`:
   Goal · User stories · Scope / Out of scope · Domain model touched · Behaviour & edge cases ·
   **Accessibility requirements** (WCAG 2.2 AA criteria, keyboard, screen-reader output, no-JS behaviour) ·
   **SEO requirements** (title/description, JSON-LD, internal links) · Acceptance criteria (Given/When/Then, numbered) ·
   Test plan (each acceptance criterion maps to a test) · Third-party docs consulted (link + version).
   Commit: `docs(spec): NNN <feature>`.
2. **Tests**: write them from the acceptance criteria and confirm they fail. Commit: `test(<context>): … (red)`.
3. **Implementation**: the minimum to turn the tests green, then refactor. Commit: `feat(<context>): …`.
4. **QA**: launch the `qa-reviewer` subagent (`.claude/agents/qa-reviewer.md`). It reviews the diff against the spec for bugs, edge cases, a11y, SEO, DRY, and comment quality. Fix the findings (each fix gets its own test where it applies). Re-run all checks. Only then is the feature **done**. Commit: `fix(<context>): QA findings for NNN`.

**Before any third-party API:** check the latest official documentation (Context7 MCP / official site / `npm view <pkg> version`), and record the link and version in the spec's "Third-party docs consulted" section. Never write from memory.

**Comment policy:** comments (TSDoc) describe _what_ a function, method, class, or component does: its parameters, return value, and errors. No change history, no TODO without an issue, no explanations of general concepts. Code that is obvious gets no comment.

### Architecture principles

- **DDD, modular monolith with bounded contexts.** A static site gains nothing from microservices at runtime. Each context is isolated behind its own public API (`index.ts`), so any of them can later move out into a separate service (for example a Cloudflare Worker for submitting farms, or an ads service) without touching the others. This is recorded in ADR-0002.
  - `catalog`: Produce, ProduceGroup, Nutrient, NutritionFacts (VO), Preparation, TraditionalUse
  - `seasonality`: Month (VO), SeasonLevel (VO), SeasonWindow, `SeasonService`
  - `geography`: Region, Province
  - `farms`: Farm, ContactInfo (VO)
  - `advertising`: AdPlacement, Sponsor, `AdSelectionPolicy`
  - `shared`: Slug (VO, transliteration), Result types, `seo` (meta + JSON-LD builders)
- **Layers per context:** `domain/` (entities and value objects, pure TS, no dependency on Astro) → `application/` (use cases such as `GetSeasonalProduce`) → `infrastructure/` (adapters for Astro content collections that implement the repository interfaces from `domain/`). Pages and components call only `application`.
- **OOP where it adds value:** value objects are immutable classes with validation in a factory (`Month.of(11)`, `Slug.fromBulgarian('Ябълки')`). Entities hold the behaviour (`produce.isInSeason(month)`). Repositories are interfaces with in-memory implementations for the tests. Pure functions stay pure functions.
- **DRY:** one source for UI strings (`src/i18n/bg.ts`), one `Seo` component, one `Card` primitive, shared test fixtures/builders (`tests/fixtures/*`).
- SOLID, dependency injection through constructor parameters, no singletons with state, `strict` + `noUncheckedIndexedAccess`.

### Agent instruction files

- **`AGENTS.md`** (source of truth, read by every agent): project overview, commands (`pnpm test`, `pnpm build`, `pnpm test:e2e`, `pnpm lhci`, `pnpm check`), the workflow above, architecture and folder map, the comment policy, coding standards, naming, the commit convention (Conventional Commits), language rule (UI in Bulgarian via `i18n/bg.ts` only, everything else in English), Definition of Done (spec ✓, red→green ✓, QA agent ✓, lint/types/unit/e2e/axe/Lighthouse 100×4 ✓), health-claims rules for content, and how to add a new product, region, or farm.
- **`CLAUDE.md`**: `@AGENTS.md` import plus Claude-specific instructions (use Context7 for docs, always run `qa-reviewer` at the end of a feature, branch rules).
- **`.claude/agents/qa-reviewer.md`**: a subagent with a checklist (spec compliance, edge cases, a11y, SEO, DRY/SOLID, comment policy, test coverage of the acceptance criteria). It returns findings ranked by severity.
- **`docs/specs/_TEMPLATE.md`**, **`docs/ADR/0000-template.md`**, ADR-0001 (Astro + static output on Cloudflare), ADR-0002 (DDD modular monolith), ADR-0003 (hybrid ads).

---

## Repo structure (all in English)

```
docs/PLAN.md, docs/CONTENT-GUIDE.md, docs/ADR/*.md
AGENTS.md, CLAUDE.md, .claude/agents/qa-reviewer.md
docs/specs/_TEMPLATE.md, docs/specs/NNN-*.md
src/content.config.ts
src/data/{produce,groups,regions,farms,nutrients,sponsors}/*.yaml
src/contexts/<context>/{domain,application,infrastructure,index.ts}
src/shared/{domain, seo, infrastructure}/
src/composition/          # composition root, cross-context read models, build clock
src/design/{tokens.ts, contrast.ts}
src/i18n/bg.ts            # all UI strings in one place (keys in English)
src/components/{layout,produce,season,seo,ads,ui}/*.astro
src/layouts/BaseLayout.astro
src/pages/**
src/styles/base.css
tests/unit/**  tests/components/** (Astro Container API)  tests/e2e/** (Playwright + axe)
lighthouserc.cjs  .github/workflows/{ci.yml, daily-rebuild.yml}
```

## TDD and quality gates

- **Unit (Vitest):** `season`, `months`, `transliterate` (the official system: щ→sht, ъ→a, ю→yu, я→ya, ц→ts, -ия at the end → -ia), `seo`, JSON-LD builders, schema validation of the seed data.
- **Components (Vitest + Astro Container API):** render each component and assert the HTML (heading levels, labels, `rel="sponsored"`, the „Реклама“ label).
- **E2E (Playwright + @axe-core/playwright):** 0 axe violations on every page template, keyboard navigation, no-JS mode.
- **Lighthouse CI:** assertion `minScore: 1` for all 4 categories on a representative set of URLs. CI fails at 99.
- **Content tests:** every produce has ≥1 season month, ≥1 region, a nutrition `source`, and a `source` on every traditional use. Every farm has a region and at least one way to contact it.
- Also: `astro check` (types), ESLint (+ `eslint-plugin-astro`, `eslint-plugin-jsx-a11y` for astro), Prettier, `html-validate` on `dist/`.
- Each feature lands as `docs(spec)` → `test (red)` → `feat` → (`test` + `fix` for QA findings), see AGENTS.md.

---

## Phases

**Phase 0: Setup (this session)**
`AGENTS.md`, `CLAUDE.md`, `qa-reviewer` agent, spec/ADR templates, `docs/PLAN.md` (this plan), ADRs for the main decisions, Astro scaffold, pnpm, TS strict, Vitest, Playwright + axe, LHCI, ESLint/Prettier, GitHub Actions CI.

**Phase 1: Core (this session)**. Each item below = spec → red tests → green → QA agent:

1. `transliterate`, `months`, `season` (TDD).
2. Zod schemas + seed: ~12 products for November and the months around it (cabbage, leeks, pumpkin, apples, quinces, pears, walnuts, spinach, carrots, beetroot, celeriac, dill/parsley), 5–6 groups, the 28 provinces (name + slug only for now), 3 placeholder farms, the main nutrients.
3. Design tokens + `BaseLayout`, `Header`, `Footer`, skip link, `Seo` + JSON-LD (WebSite, Breadcrumb).
4. Home page: the current season (peak / available / coming soon).
5. Product page: nutrition table, varieties, group, preparation, traditional uses + disclaimer, regions, farms, FAQ, sources.
6. `/sezon/[mesets]`, `404`, `robots.txt`, sitemap.
7. CI is green: unit + e2e/axe + Lighthouse 100×4.

**Phase 2: Catalog.** Lists by type, groups, nutrients, the calendar, Pagefind search, filters, ~40 products.

**Phase 3: Regions and farms.** SVG map of the 28 provinces (simplified Natural Earth admin-1, public domain), region pages, farm pages with `LocalBusiness`, `/dobavi-ferma`.

**Phase 4: Monetization.** `sponsors`, `AdSlot`, the `/reklama` page, consent banner (choose a certified CMP), lazy AdSense, privacy/cookie pages.

**Phase 5: Growth.** OG images per page, RSS, newsletter, PWA, CMS (Keystatic on top of the same files). The daily rebuild workflow already exists; it needs the secret `CF_DEPLOY_HOOK`.

## Verification

- `pnpm test` (unit + components) is green, and every feature has a commit with a failing test before the implementation.
- `pnpm build && pnpm test:e2e` shows 0 axe violations and the pages work without JS.
- `pnpm lhci` shows 100 in all 4 categories for `/`, a product page, and a month page.
- Manual: `pnpm preview` with screenshots of mobile and desktop, plus a JSON-LD check with the Rich Results Test schema validator (offline: `schema-dts` types).
- Commit and push to `claude/seasonal-produce-bulgaria-1e20h1`. No PR unless asked.

## Implementation status and resolved versions (as of 2026-11-10)

Phase 0 and Phase 1 completed (specs 001–006): home page, 12 month pages, 13 produce pages, 404,
robots.txt, sitemap, security headers; Lighthouse 100 × 4 on all audited templates.

Pinned versions (latest compatible, checked with `npm view`):

- `astro@7.4.8` (Vite 8, Zod 4 through `astro/zod`), `@astrojs/sitemap@3.7.4`
- `typescript@6.0.3`. TS 7 is out, but `@astrojs/check` and `typescript-eslint` support only up to 6.x. Recorded in ADR-0001.
- `vitest@5.1.0`, `@vitest/coverage-v8@5.1.0`
- `@playwright/test@1.63.0`, pinned to the preinstalled Chromium. `@axe-core/playwright@4.14.0`
- `@lhci/cli@0.16.0` with pnpm override `@puppeteer/browsers: 3.2.6`. The 3.2.7 tarball returns 404 from the registry, so CI uses the same override.
- `eslint@10.14.0` + `eslint-plugin-astro@3.2.1` + `eslint-plugin-jsx-a11y@6.10.2` + `typescript-eslint@8.72.2`, `prettier@3.9.10` + `prettier-plugin-astro@1.1.2`, `html-validate@11.21.0`

Source of documentation: `docs.astro.build` is not reachable from this session (network allowlist), so docs come from Context7 (`/withastro/docs`, main branch, which includes `upgrade-to/v7.mdx`) plus the type definitions in `node_modules/astro`. Astro 7 notes: Vite 8; `@astrojs/db` removed; former experimental flags (`rustCompiler`, `queuedRendering`, `advancedRouting`, `cache`, `routeRules`) are stable; content collections API unchanged since v6 (`defineCollection` + `glob`/`file` loaders + `reference()` + `z` from `astro/zod`); Container API still `experimental_AstroContainer`; Vitest through `getViteConfig` from `astro/config`.

Progress is tracked per spec in `docs/specs/`.

## Open items for the user (do not block Phase 1)

- Domain (needed for `site` in `astro.config` and canonical URLs). Until then: `https://sezon.example`.
- Choice of a certified CMP for AdSense (Phase 4).
- Real farms and checking the seed data.
