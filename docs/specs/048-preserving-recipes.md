# 048. Recipes for winter preserves

- **Status:** Approved
- **Bounded context(s):** recipes (new), catalog (read across in the composition root), shared,
  composition, UI
- **Related:** issues #69 (recipes section) and #70 (first set of recipes), epic „growing, organic
  and preserving guides“, specs 017, 018, 029, 030 (index and detail pages), 028 („ти“ voice),
  034 (no `reviewStatus`), 037 (new bounded context)

This spec covers both issues: #69 (sections 3–9) and the content of #70 (section 5.4).

## 1. Goal

Readers who buy seasonal produce in bulk want to put it up for the winter. The site says what is in
season, but not how to preserve it safely. This feature adds a `/retsepti` section with recipes for
winter preserves (кисело зеле, сладка, компоти), each linked to its produce, and a „Рецепти за
зимнина“ block on each produce page. Home canning can cause botulism or spoilage when acidity,
sugar, salt or processing time is wrong, so every food-safety step (acidity, salt, sterilisation
and processing times, storage) cites an authoritative food-safety source, and each recipe cites the
Bulgarian recipe article it is based on.

## 2. User stories

- As a reader with a crate of pears, I want a pear compote recipe with exact quantities and the
  processing time for my jars, so that the jars keep through the winter.
- As a reader on the cabbage page, I want to see that there is a sauerkraut recipe and open it.
- As a careful reader, I want to see where the recipe and each safety rule come from.
- As a reader in a mountain town, I want the processing time for my altitude.
- As a reader who prints recipes for the kitchen, I want a clean printout without the site chrome.

## 3. Scope

### In scope

- **New bounded context `recipes`** (`src/contexts/recipes/`): domain, application, infrastructure
  and a public `index.ts`. ESLint's dependency rules and AGENTS.md list it with no upstream
  contexts. **Why a new context and not part of catalog:** a recipe has its own lifecycle, sources
  and invariants (safety sources, processing times), and a recipe can use several produce, so it is
  not an attribute of one `Produce`. Like `farms`, it refers to produce only by slug; the
  composition root resolves the slugs. Catalog stays free of preserving knowledge and recipes can
  be extracted later without touching catalog (ADR-0002).
- **Content:** a `recipes` collection over `src/data/recipes/<slug>.yaml`, checked by Zod at build
  time; recipe → produce references are checked by the content integrity check (`pnpm test` and the
  build), like farm → produce.
- **Composition root:** `recipeRepository`, `recipeIndexService`, `recipePagesQuery`.
- **Pages:**
  - `/retsepti`: `h1` „Рецепти за зимнина“, an intro, a safety note, then one `h2` per category
    that has recipes, in a fixed order, each with its recipes (title link, summary, produce).
  - `/retsepti/<slug>`: one recipe (section 5.2).
  - Produce page: a „Рецепти за зимнина“ `h3` section at the end of the „Яж“ group, listing links
    to the recipes that use the produce. Shown only when there are recipes.
  - `/katalog`: a „Рецепти за зимнина“ section with a link to `/retsepti`; `/retsepti` and its
    pages count as part of the catalogue in the header (`CATALOG_AREAS`), like regions and farms.
- **SEO:** `Recipe` JSON-LD from a pure builder in `src/shared/seo/jsonLd.ts`, `BreadcrumbList` on
  both page types, `CollectionPage` on the index; titles and descriptions tested for every recipe.
- **Print:** an `@media print` block on the recipe page in the style of the calendar's.
- **Content (#70):** eight recipes (section 5.4).
- **Docs:** „Add a recipe“ in `docs/CONTENT-GUIDE.md`; the `recipes` context in AGENTS.md.

### Out of scope

- `reviewStatus` (removed by spec 034; the issue text predates it).
- Photos (the model has none; issue #69 does not ask for them).
- Site search indexing of recipes (Pagefind indexes produce pages only, spec 016).
- Recipes that need pressure canning, lye or calcium hydroxide, or proportions that no tested
  source covers (section 5.4).
- Lutenitsa and other recipes that wait for #39 (peppers and tomatoes).
- Scaling quantities, unit conversion, ratings, comments.

## 4. Domain model

### Recipes context

- `RECIPE_CATEGORIES = ['sauerkraut', 'pickle', 'preserve', 'jam', 'compote',
'jarred-vegetables'] as const`; `RecipeCategory`. The order is the order of the index page.
  Labels (Bulgarian) live in `ui.recipes.categories` (`кисело зеле`, `туршия`, `сладко`,
  `конфитюр`, `компот`, `зеленчуци в буркан`) and `ui.recipes.categoryHeadings` (plural headings).
- `INGREDIENT_UNITS = ['g', 'kg', 'ml', 'l', 'piece', 'tsp', 'tbsp', 'cup'] as const`;
  `IngredientUnit`. Labels in `ui.recipes.units` (`г`, `кг`, `мл`, `л`, `бр.`, `ч.л.`, `с.л.`,
  `ч.ч.`).
- `Ingredient`: `{ name, quantity, unit }`; `quantity` is a positive finite number.
- `RecipeSafety`: `{ note, sterilisation, storage, sources }`. `note` is the food-safety note,
  `sterilisation` the jar and processing note, `storage` the storage note, `sources` (≥ 1, HTTPS) the
  food-safety sources that every statement in the three notes and in the processing step comes from.
- **Entity `Recipe`** (frozen, created by `Recipe.create(input)`):
  - `slug` (the entry id), `name` (the YAML `title`), `summary`, `category`, `produceSlugs`
    (≥ 1, unique), `yield` (text), `prepMinutes`, `cookMinutes`, `processingMinutes` (non-negative
    integers), `waitDays` (non-negative integer, default 0: fermentation or maturing before the
    preserve is ready), `ingredients` (≥ 1), `steps` (≥ 1, non-blank), `safety`, `sources`
    (≥ 1, HTTPS: the recipe articles), `publishedAt`, `updatedAt` (valid dates,
    `updatedAt` not before `publishedAt`).
  - `create` throws `InvalidRecipeError` (new, shared errors) when an invariant fails.
  - `uses(produceSlug)`: `true` when the recipe lists the produce.
  - `activeMinutes`: `prepMinutes + cookMinutes + processingMinutes`.
- **`RecipeRepository`** (domain interface, extends the shared `Repository<Recipe>`; `all()` is in
  Bulgarian name order): `findByProduce(produceSlug)`.
- **`RecipeIndexService`** (application):
  - `byCategory()`: `[{ category, recipes }]` for each category with at least one recipe, in
    `RECIPE_CATEGORIES` order, recipes in name order.
  - `forProduce(produceSlug)`: the recipes that use the produce, in name order (may be empty).
- **Infrastructure:** `recipeSchema` (strict Zod), `toRecipe(id, record)`, `IndexedRecipeRepository`.

### Composition root

- `findBrokenReferences` also checks `recipes/<id> → produce/<slug>`; `ContentRecords` gains
  `recipes`.
- **`RecipePagesQuery`** (cross-context read model, like `FarmPagesQuery`):
  - `forSlug(slug)`: `{ recipe, produce }`, the produce in the recipe's order;
    throws `RecipeNotFoundError` (new) for an unknown slug and `BrokenReferenceError` for an unknown
    produce.
  - `overview()`: `byCategory()` with each recipe's produce resolved, for the index.

### Shared kernel

- `recipeJsonLd(input)` and `isoDuration({ days, minutes })` in `src/shared/seo/jsonLd.ts`.

## 5. Behaviour and edge cases

### 5.1 Content schema (`src/data/recipes/<slug>.yaml`)

```yaml
title: Компот от круши # file name = slug of the title
summary: 70–160 characters, the meta description.
category: compote # sauerkraut | pickle | preserve | jam | compote | jarred-vegetables
produce: [krushi] # produce ids, at least one, unique
yield: от 10 круши # what the recipe makes, as the source states it, else the main amount
prepMinutes: 30 # editorial estimate unless the source gives it
cookMinutes: 10
processingMinutes: 25 # boiling-water time at 0–300 m for the largest jar, from the safety source
waitDays: 21 # optional, default 0
ingredients:
  - { name: Круши, quantity: 10, unit: piece }
steps: # „ти“ voice, one action or a few related actions per step
  - Измий крушите …
safety:
  note: …
  sterilisation: …
  storage: …
  sources:
    - { name: 'National Center for Home Food Preservation – Pears-Halved', url: https://… }
sources:
  - { name: 'Български фермер – Най-вкусните компоти за зимата', url: https://… }
publishedAt: 2026-11-13
updatedAt: 2026-11-13
```

- Unknown keys, a summary outside 70–160 characters, an unknown category or unit, no produce, a
  duplicate produce, a non-positive quantity, negative or fractional minutes, no ingredient or step,
  a blank or multi-line step, a non-HTTPS source, no recipe source or no safety source, and
  `updatedAt` before `publishedAt` fail the build.
- Text fields are single lines, except the three safety notes (single paragraphs, one line each).

### 5.2 Recipe page (`/retsepti/<slug>`)

In source order:

1. `h1` with the title; under it a meta line: the category label.
2. The summary.
3. A definition list of facts: „Количество“ (yield), „Подготовка“, „Варене“, „Във водна баня“
   (each in minutes, as „1 ч 30 мин“ or „25 мин“), „Престояване“ (only when `waitDays` > 0, as
   „21 дни“), then a note „Времената за подготовка и варене са ориентировъчни; времето във водна
   баня е за надморска височина до 300 м.“ A step with zero minutes shows „–“.
4. „За продуктите“: links to the produce pages, joined by commas.
5. `h2` „Съставки“: `ul` with „2,3 кг бяло зеле“ (quantity with a decimal comma, unit label, name
   with a lower-case first letter).
6. `h2` „Приготвяне“: `ol` with the steps.
7. `h2` „Безопасност“: the note, then `h3` „Буркани и стерилизация“ with the sterilisation note,
   `h3` „Съхранение“ with the storage note, then „Източници за безопасността:“ and a list of the
   safety source links.
8. `h2` „Източници“: the recipe source links, the update date and the methodology link
   (`SourceList`).

### 5.3 Index, produce block, catalogue

- `/retsepti`: categories without recipes are not shown. Each recipe is an `li` with the title
  link, the summary and „За: Круши“ (produce names, not links, to keep one link per item).
- Produce page block: `section` with `h3#recipes` „Рецепти за зимнина“ and a `ul` of recipe links
  (title, then „ – “ and the category label), at the end of the „Яж“ group. No block, no heading,
  when no recipe uses the produce.
- `/katalog`: `h2` „Рецепти за зимнина“ and a link „Всички рецепти за зимнина“.

### 5.4 Content of #70

The safety source is the USDA-funded National Center for Home Food Preservation (NCHFP, University
of Georgia, nchfp.uga.edu), the recipe sources are Bulgarian recipe articles. Where a recipe article
and the safety source disagree on something that affects safety (salt ratio, processing time, how
fruit is packed), the recipe follows the safety source and the page says so in the safety note.
Altitude bands: NCHFP's 0–1,000 ft, 1,001–3,000 ft and 3,001–6,000 ft are written as „до 300 м“,
„300–900 м“ and „900–1800 м“; pint and quart jars as „до 470 мл“ and „до 950 мл“ (larger jars have
no tested time, so the text says to use jars up to 950 мл).

| Recipe (slug)                                 | Recipe source                                          | Safety sources (NCHFP unless stated)                                                                                                                                     |
| --------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Кисело зеле (`kiselo-zele`)                   | bgfermer.bg „Как да си направим кисело зеле в буркани“ | Sauerkraut; General Information on Fermenting; Storing Home Canned Foods                                                                                                 |
| Сладко от дюли (`sladko-ot-dyuli`)            | gotvach.bg „Моето сладко от дюли“                      | Ask Extension „Canning Poached Quinces“; General Information on Canning Jams, Jellies, and Marmalades; Sterilization of Empty Jars; Storing Home-Canned Jams and Jellies |
| Сладко от ябълки (`sladko-ot-yabalki`)        | bgfermer.bg „Сладко за зимни дни и вечери (и не само)“ | General Information on Canning Jams, Jellies, and Marmalades; Sterilization of Empty Jars; Storing Home-Canned Jams and Jellies                                          |
| Сладко от сини сливи (`sladko-ot-sini-slivi`) | bgfermer.bg „Сладко за зимни дни и вечери (и не само)“ | as above                                                                                                                                                                 |
| Компот от круши (`kompot-ot-krushi`)          | bgfermer.bg „Най-вкусните компоти за зимата“           | Pears-Halved; Preparing and Using Syrups for Canning Fruit; Sterilization of Empty Jars; Storing Home Canned Foods                                                       |
| Компот от сливи (`kompot-ot-slivi`)           | bgfermer.bg „Най-вкусните компоти за зимата“           | Plums-Halved or Whole; Sterilization of Empty Jars; Storing Home Canned Foods                                                                                            |
| Компот от праскови (`kompot-ot-praskovi`)     | bgfermer.bg „Най-вкусните компоти за зимата“           | Peaches-Halved or Sliced; Sterilization of Empty Jars; Storing Home Canned Foods                                                                                         |
| Компот от череши (`kompot-ot-chereshi`)       | bgfermer.bg „Най-вкусните компоти за зимата“           | Cherries-Whole; Sterilization of Empty Jars; Storing Home Canned Foods                                                                                                   |

Deviations from the recipe articles, all toward the safety source:

- **Кисело зеле:** 3 с.л. сол на 2,3 кг зеле (NCHFP: 3 tablespoons per 5 pounds) instead of the
  article's 3 с.л. на 3 кг; no carrots (the article calls them optional; NCHFP's tested recipe is
  cabbage and salt); 3–4 weeks at 21–24 °C instead of 3 days; boiling-water processing instead of
  the article's 80 °C bath.
- **Компоти:** NCHFP processing times instead of the articles' „затворете“ without processing; pears
  boiled 5 minutes (NCHFP) instead of 3; peaches peeled and yellow-flesh only (NCHFP).
- **Сладка:** 5 minutes in boiling water after filling sterile jars (NCHFP general sweet-spread
  rule), which the articles do not mention.
- **„Конфитюр от ябълки“** in the issue becomes „Сладко от ябълки“, the name its source uses.

Left out, with the reason recorded here:

- **Компот от дюли:** no tested processing time for quince in light syrup; the Ask Extension
  answer covers only fully cooked quince preserves.
- **Туршия „Царска“:** a mixed fermented and vinegar pickle; NCHFP requires tested proportions of
  vinegar, food and water, and no tested source covers this mix.
- **Цвекло в буркан:** plain beets need a pressure canner (NCHFP); pickled beets need tested vinegar
  proportions (NCHFP: 4 cups 5 % vinegar to 2 cups water), and no Bulgarian recipe source with those
  proportions was found.
- **Тиква в буркан:** pumpkin needs a pressure canner and must not be mashed or pureed (NCHFP).
- **Сладко от зелени орехи:** traditional recipes soak the nuts in lye or calcium hydroxide; no
  food-safety source for home use was found.
- Times: `processingMinutes` comes from the safety source; `cookMinutes` comes from the recipe or
  safety source where one gives it; `prepMinutes` is an editorial estimate. The page says that
  preparation and cooking times are approximate.

### 5.5 Edge cases

- A recipe with an unknown produce slug fails the integrity check (test and build) and
  `RecipePagesQuery.forSlug` throws `BrokenReferenceError`.
- An unknown recipe slug in `forSlug` throws `RecipeNotFoundError`.
- `waitDays` 0: no „Престояване“ row, `totalTime` has no day part.
- Two recipes for one produce are listed in name order.

## 6. Accessibility requirements

- One `h1`; `h2` sections; `h3` only inside them; no skipped levels (1.3.1, 2.4.6).
- Ingredients are a `ul`, steps an `ol` (1.3.1); facts a `dl`.
- Links have names that make sense in context: recipe titles, produce names, source titles (2.4.4).
- Readable without CSS (spec 009): source order is the reading order; no CSS hides or reorders
  content.
- Zero axe violations in light and dark mode; no horizontal scroll at 320 px (1.4.10).
- Print: `@media print` keeps the content in source order, removes the header, footer and
  breadcrumbs (base print rules), avoids breaking a step or an ingredient across pages and uses
  black text on white.
- No JavaScript.

## 7. SEO requirements

- **Index:** title „Рецепти за зимнина: кисело зеле, сладка и компоти“, its own description
  (70–160), canonical `/retsepti`, `CollectionPage` listing every recipe, `BreadcrumbList`
  Начало › Рецепти за зимнина.
- **Recipe page:** title from `fittingTitle([„<title> – рецепта за зимнина“, „<title> – рецепта“,

<title>])` (≤ 60 with the suffix), description = `summary` (70–160, enforced by the schema),
  `og:type` article, `BreadcrumbList` Начало › Рецепти за зимнина › <title>.
- **`Recipe` JSON-LD** (`recipeJsonLd`): `name`, `description`, `url`, `inLanguage` `bg`,
  `recipeCategory` (category label), `recipeCuisine` „Bulgarian“, `recipeYield`,
  `recipeIngredient` (formatted strings), `recipeInstructions` (`HowToStep` with `position`
  and `text`), `prepTime`, `cookTime`, `totalTime` (ISO 8601 durations; `totalTime` = prep + cook +
  processing minutes + wait days, e.g. `P21DT1H5M`), `datePublished`, `dateModified`
  (`YYYY-MM-DD`), `citation` (recipe and safety sources).
- Internal links: produce ↔ recipe, catalogue → index → recipe.

## 8. Acceptance criteria

1. **AC1:** Given valid input, when `Recipe.create`, then it returns a frozen recipe whose lists are
   frozen, `uses` is true only for its produce and `activeMinutes` is the sum of the three times.
2. **AC2:** Given a blank title, summary or step, an unknown category or unit, no produce, a
   duplicate produce, no ingredient, no step, a non-positive quantity, a negative or fractional
   time, a non-HTTPS recipe or safety source, no recipe or safety source, an invalid date or
   `updatedAt` before `publishedAt`, when `Recipe.create`, then it throws `InvalidRecipeError`.
3. **AC3:** Given a recipe record, when parsed by `recipeSchema` and mapped by `toRecipe`, then a
   valid record yields a recipe and `waitDays` defaults to 0; a record with an unknown key, a
   summary outside 70–160 characters, an unknown category or unit, an empty produce list, a
   duplicate produce, a negative minute, a multi-line step, an `http:` source, no safety source or
   `updatedAt` before `publishedAt` is rejected.
4. **AC4:** Given recipes in several categories, when `byCategory()`, then only non-empty categories
   are returned, in `RECIPE_CATEGORIES` order, recipes in Bulgarian name order; `forProduce(slug)`
   returns the recipes using that produce, or none.
5. **AC5:** Given a recipe, when `RecipePagesQuery.forSlug`, then it returns the recipe and its
   produce in the recipe's order; an unknown slug throws `RecipeNotFoundError` and an unknown
   produce `BrokenReferenceError`; `overview()` resolves the produce of every listed recipe.
6. **AC6:** Given content records where a recipe refers to a missing produce, when
   `findBrokenReferences`, then it reports `recipes/<id> → produce/<slug>`.
7. **AC7:** Given recipe data, when `recipeJsonLd` builds it, then it has `@type` `Recipe`, the
   fields of section 7, `HowToStep`s with 1-based positions, ISO 8601 durations and
   `recipeCuisine` „Bulgarian“; `isoDuration` returns `PT0M` for zero, `PT25M`, `PT1H5M` and
   `P21DT1H5M`.
8. **AC8:** Given every seed recipe, then its page title fits 60 characters with the suffix and its
   description is 70–160 characters; the index title and description fit; every category and unit
   has a label; `ui.recipes.ingredient` formats „2,3 кг бяло зеле“; `formatDuration` formats
   „25 мин“, „1 ч“, „1 ч 5 мин“; `routes.recipes` is `/retsepti` and `routes.recipe('x')` is
   `/retsepti/x`; `/retsepti` is a catalogue area.
9. **AC9:** Given the seed content, then there are at least 8 recipes; each parses, has an id equal
   to the slug of its title, refers to existing produce, has at least one recipe source and one
   safety source, takes its safety sources from an authoritative food-safety host (nchfp.uga.edu,
   ask.extension.org, babh.government.bg, an `europa.eu` host or a university `.edu` host), has a
   positive processing time or a wait time, uses the „ти“ voice (spec 028 helpers) and contains no
   health claim words („богат на“, „полезн“, „лекува“).
10. **AC10:** Given the `ProduceRecipes` component with recipes, then it renders a `section` with
    `h3#recipes` „Рецепти за зимнина“ and a link per recipe to `/retsepti/<slug>`; with none, it
    renders nothing.
11. **AC11:** Given the built site, then `/retsepti` lists every recipe file under its category
    heading with a link, and every recipe page exists.
12. **AC12:** Given `/retsepti/kiselo-zele`, then it has one `h1` „Кисело зеле“, an ingredients `ul`,
    a steps `ol` with as many items as the YAML, the safety section with at least one source link,
    a link to `/zelenchutsi/zele`, a title of at most 60 characters, and `Recipe` and
    `BreadcrumbList` JSON-LD; `/retsepti` has `CollectionPage`.
13. **AC13:** Given the cabbage page, then the „Рецепти за зимнина“ block links to
    `/retsepti/kiselo-zele`; given the dill page (no recipe), then there is no `#recipes`.
14. **AC14:** Given `/katalog`, then it links to `/retsepti`; on `/retsepti/*` the header marks
    „Каталог“ as current.
15. **AC15:** Given `/retsepti` and a recipe page in light and dark mode, then axe reports no
    violations; at 320 px there is no horizontal scroll; both pass the spec 009 checks; in print
    media the site header is hidden and the steps are shown.

## 9. Test plan

| AC   | Test type | Test file                                                                       |
| ---- | --------- | ------------------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/contexts/recipes/domain/Recipe.test.ts`                             |
| AC2  | unit      | `tests/unit/contexts/recipes/domain/Recipe.test.ts`                             |
| AC3  | unit      | `tests/unit/contexts/recipes/infrastructure/recipeSchema.test.ts`               |
| AC4  | unit      | `tests/unit/contexts/recipes/application/RecipeIndexService.test.ts`            |
| AC5  | unit      | `tests/unit/composition/RecipePagesQuery.test.ts`                               |
| AC6  | unit      | `tests/unit/composition/contentIntegrity-048.test.ts`                           |
| AC7  | unit      | `tests/unit/shared/seo/recipeJsonLd.test.ts`                                    |
| AC8  | unit      | `tests/unit/i18n/recipeMeta.test.ts`                                            |
| AC9  | unit      | `tests/unit/content/recipes-048.test.ts`                                        |
| AC10 | component | `tests/components/ProduceRecipes.test.ts`                                       |
| AC11 | e2e       | `tests/e2e/recipes.spec.ts`                                                     |
| AC12 | e2e       | `tests/e2e/recipes.spec.ts`                                                     |
| AC13 | e2e       | `tests/e2e/recipes.spec.ts`                                                     |
| AC14 | e2e       | `tests/e2e/recipes.spec.ts`                                                     |
| AC15 | e2e, LHCI | `tests/e2e/recipes.spec.ts`, `readable-without-css.spec.ts`, `lighthouserc.cjs` |

## 10. Third-party documentation consulted

| Package / source          | Version | Source (URL or Context7 ID)                                                                                                                                                          | Topic                                                                                                                                                                                                      |
| ------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema.org                | current | `/schemaorg/schemaorg` (Context7): `data/examples.txt` (Recipe JSON-LD), `data/sdo-howto-examples.txt` (`HowToStep`), `docs/gs.html` (ISO 8601 durations); https://schema.org/Recipe | `Recipe` properties: `recipeIngredient`, `recipeInstructions` (CreativeWork, ItemList or Text), `recipeYield`, `recipeCategory`, `recipeCuisine`, `prepTime`, `cookTime`, `totalTime` (Duration, ISO 8601) |
| astro                     | 7.4.8   | Context7 `/withastro/docs` (content collections, `getStaticPaths`), as in specs 029 and 030                                                                                          | Collection schema, dynamic routes                                                                                                                                                                          |
| NCHFP                     | 2026    | https://nchfp.uga.edu/ (pages listed in section 5.4; adapted from the USDA „Complete Guide to Home Canning“, 2015)                                                                   | Salt ratio, fermentation, processing times by jar size and altitude, sterile jars, sweet spreads, storage                                                                                                  |
| Ask Extension             | 2026    | https://ask.extension.org/kb/faq.php?id=280827 (Oregon State University Food Safety and Preservation Hotline)                                                                        | Quince acidity and preserves processing                                                                                                                                                                    |
| Bulgarian recipe articles | –       | bgfermer.bg Articles 7113883, 10249570, 23461966; recipe page r-54641 on recepti.gotvach.bg                                                                                          | Ingredients, quantities and steps                                                                                                                                                                          |
| WCAG 2.2 / HTML           | –       | `ol`, `ul`, `dl` (WHATWG); Understanding 1.3.1, 2.4.4, 1.4.10                                                                                                                        | Structure, link purpose, reflow                                                                                                                                                                            |
