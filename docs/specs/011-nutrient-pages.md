# 011. Nutrient pages

- **Status:** Approved
- **Bounded context(s):** catalog (domain, application), UI, content
- **Related:** specs 002 and 005, issue #6, epic #30

## 1. Goal

Give each vitamin and mineral its own page, `/nutrienti/<slug>`. The page says what the nutrient
does, using only the wording the EU has authorised. It then ranks the produce in the catalog by
the amount per 100 g and shows which of them are in season now. These pages answer long-tail
searches such as „храни с витамин C“. They do this without health claims that the law does not
allow.

## 2. User stories

- As a health-conscious shopper, I want to see which local produce gives the most of a vitamin
  or mineral, and which of it is in season now, so that I can choose well this month.
- As a careful reader, I want to see exactly what the nutrient does according to EU law, with the
  source, so that I can trust the page.
- As a visitor on a produce page, I want to click a nutrient in the nutrition table, so that I can
  compare that produce with the others.

## 3. Scope

### In scope

- **Content model.** The `nutrients` collection replaces `description` with three fields:
  - `claims`: one or more authorised claims, copied verbatim from Regulation (EU) No 432/2012.
  - `claimsSource`: the source of the claims.
  - `note` (optional): a short editorial note, such as the unit basis for vitamin A.
- **Domain.** `Nutrient` gains `claims`, `claimsSource`, `note` and
  `claimLevel(amountPer100g)`. The claim level is `high` at 30 % or more of the reference intake,
  `source` at 15 % or more, and otherwise `undefined`.
- **Application.** `NutrientRankingService` (catalog) provides `rankingFor(slug, month)` and
  `allNutrients()`.
- **Routes and page.** The route helper `routes.nutrient(slug)` and the page
  `src/pages/nutrienti/[slug].astro`, one static page per nutrient.
- **Produce nutrition table.** Each micronutrient row header links to its nutrient page.
- **Quality checks.** Lighthouse CI audits `/nutrienti/vitamin-c`. The spec 009 checks (readable
  without CSS) include a nutrient page.
- **Content guide.** `docs/CONTENT-GUIDE.md` documents the new nutrient fields.

### Out of scope

- A nutrient index page (`/nutrienti`). The breadcrumbs are Начало › <Nutrient>.
- Claims for macronutrients and fibre.
- Recommending amounts or servings.

## 4. Domain model

`Nutrient` (value object, extended):

| Field          | Content                                                                      |
| -------------- | ---------------------------------------------------------------------------- |
| `claims`       | Non-empty list of authorised claim sentences, verbatim, without a full stop. |
| `claimsSource` | `{ name, url }` of the regulation.                                           |
| `note`         | Optional editorial note.                                                     |

`claimLevel(amount)` returns `'high' | 'source' | undefined`. It uses the unrounded percentage
of the reference intake. The thresholds are `SOURCE_PERCENT = 15` and
`HIGH_PERCENT = SOURCE_PERCENT × 2`.

`NutrientRanking` (application read model, frozen):

| Field      | Content                                                                                          |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `nutrient` | The `Nutrient`.                                                                                  |
| `month`    | The month the season levels refer to.                                                            |
| `entries`  | `{ produce, amount, percentOfReferenceIntake, claimLevel, seasonLevel }[]`, sorted as below.     |
| `inSeason` | Produce in `entries` whose `seasonLevel` is `peak` or `available` and whose `claimLevel` is set. |

`rankingFor` sorts by amount, highest first. Equal amounts keep the repository order, which is
by Bulgarian name. `rankingFor` throws `NutrientNotFoundError` for an unknown slug.
`allNutrients()` returns every nutrient in repository order.

## 5. Behaviour and edge cases

- Only produce that lists the nutrient in its `micronutrients` appears in the ranking. A
  nutrient that no produce lists still gets a page, which shows the empty-state text
  „Все още няма продукти с данни за <име>.“
- Claim labels follow Regulation (EC) No 1924/2006, Annex. The thresholds are 15 % and 30 % of
  the reference value per 100 g, from Regulation (EU) No 1169/2011, Annex XIII, Part A, point 2:
  - „С високо съдържание на <име>“ for 30 % and above;
  - „Източник на <име>“ for 15 % and above;
  - „–“ with hidden text „под прага за претенция“ below 15 %.
- The word „богат на“ is never used, because it carries the same meaning as „с високо
  съдържание“.
- **Page layout:**
  - `h1` „<Име> в сезонните плодове и зеленчуци“.
  - Section „Какво прави <име>“: the claims as a list. Each claim is a sentence ending in a full
    stop. Below the list:
    - a sentence saying the wording is authorised by Regulation (EU) No 432/2012 and applies to
      foods that are at least a source of the nutrient;
    - the source link;
    - the `note`, when present;
    - the health disclaimer (shared with produce pages).
  - Section „В сезон сега“, rendered only when `inSeason` is not empty: the produce names as
    links, with the claim label.
  - Section „Съдържание на 100 г“: a ranking table with caption „<Име> на 100 г“. The columns are:
    - produce (row header, a link);
    - amount with unit;
    - % РСП (`<abbr>`, as on produce pages);
    - claim;
    - level in the current month (text and icon, or „Извън сезона“).
- **Title:** „<Име> в сезонни плодове и зеленчуци“. If the full title with the site suffix is
  longer than 60 characters, fall back to „<Име> в сезонните храни“, then „<Име>“.
- **Description:** „Кои сезонни плодове и зеленчуци от България съдържат най-много <име> на 100 г,
  колко от референтния прием покриват и кои са в сезон сега.“ It is 70–160 characters for every
  nutrient.
- **Produce page:** the micronutrient row header becomes a link to `routes.nutrient(slug)`. The
  macronutrient rows are unchanged.

## 6. Accessibility requirements

- One `h1`. Each part is a `<section aria-labelledby>` with an `h2`.
- The ranking table has:
  - a `<caption>`;
  - `<th scope="col">` headers and a `<th scope="row">` for each produce;
  - numbers aligned right;
  - a focusable scroll container labelled by the caption, so it does not overflow at 320 px
    (same pattern as the nutrition table);
  - claim „–“ cells with visually hidden text.
- Season level is shown as text and icon, never colour alone.
- Link text names its target: the produce name, or the nutrient name in produce tables.
- The page is readable without CSS (spec 009) and works without JavaScript. axe reports zero
  violations in light and dark mode and at 320 px.

## 7. SEO requirements

- Canonical `/nutrienti/<slug>`, with a unique title and description.
- JSON-LD: an `ItemList` of the ranked produce (name, absolute URL, position) and a
  `BreadcrumbList` (Начало › <Име>).
- Internal links: produce tables link to nutrient pages, and nutrient pages link to produce pages.
- YMYL:
  - Every claim sits next to its regulation source.
  - Nutrition values keep their USDA sources on the produce pages.
  - No wording beyond the authorised claims.

## 8. Acceptance criteria

1. **AC1:** Given a nutrient with a reference intake of 80, `claimLevel` returns `high` for 24 (30 %), `source` for 12 (15 %) and `undefined` for 11.9.
2. **AC2:** Given produce with and without a nutrient, `rankingFor(slug, month)` lists only produce that contains it, highest amount first (ties in repository order), with percentage, claim level and the season level in `month`. `inSeason` holds the peak or available entries that have a claim level.
3. **AC3:** Given an unknown slug, `rankingFor` throws `NutrientNotFoundError`. `allNutrients` returns every nutrient.
4. **AC4:** The nutrient schema requires a non-empty `claims` list and a `claimsSource`, accepts an optional `note`, and rejects `description`. Every seed nutrient passes. Each of its claims appears verbatim in Regulation (EU) No 432/2012, checked against the list in the test.
5. **AC5:** `routes.nutrient('vitamin-c')` returns `/nutrienti/vitamin-c`.
6. **AC6:** For every seed nutrient, the title with the site suffix is at most 60 characters and the description is 70–160 characters.
7. **AC7:** `NutrientRankingTable` renders a caption, column and row headers, formatted amounts, % РСП, claim labels (or „–“ with hidden text) and the season level text, and links each produce.
8. **AC8:** `NutritionTable` links each micronutrient row header to its nutrient page and leaves the macronutrient rows as text.
9. **AC9:** The built site has a page for each nutrient with one `h1`, a canonical URL, `ItemList` and `BreadcrumbList` JSON-LD, the claims list with the regulation link, and table rows in descending amount (e2e).
10. **AC10:** Nutrient pages have zero axe violations in light and dark mode and at 320 px, and pass the readable-without-CSS checks (e2e).

## 9. Test plan

| AC       | Type      | Test file                                                                                |
| -------- | --------- | ---------------------------------------------------------------------------------------- |
| AC1      | unit      | `tests/unit/contexts/catalog/domain/Nutrient-011.test.ts`                                |
| AC2–AC3  | unit      | `tests/unit/contexts/catalog/application/NutrientRankingService.test.ts`                 |
| AC4      | unit      | `tests/unit/contexts/catalog/infrastructure/nutrientClaims.test.ts`                      |
| AC5      | unit      | `tests/unit/components/routes.test.ts`                                                   |
| AC6      | unit      | `tests/unit/i18n/bg-011.test.ts`                                                         |
| AC7      | component | `tests/components/NutrientRankingTable.test.ts`                                          |
| AC8      | component | `tests/components/NutritionTable.test.ts`                                                |
| AC9–AC10 | e2e       | `tests/e2e/nutrient-pages.spec.ts`, `tests/e2e/readable-without-css.spec.ts` (vitamin C) |

## 10. Third-party documentation consulted

| Package / source             | Version           | Source                                                                                            | Topic                                                     |
| ---------------------------- | ----------------- | ------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Regulation (EU) No 432/2012  | OJ L 136, 2012    | eur-lex.europa.eu/legal-content/BG/TXT/?uri=CELEX:32012R0432 (Bulgarian text, fetched 2026-11-10) | Verbatim authorised claims and the „source of“ condition  |
| Regulation (EC) No 1924/2006 | consolidated 2014 | eur-lex.europa.eu/legal-content/BG/TXT/?uri=CELEX:02006R1924-20141213                             | „Източник на“ and „С високо съдържание на“ claims (Annex) |
| Regulation (EU) No 1169/2011 | OJ L 304, 2011    | eur-lex.europa.eu/legal-content/BG/TXT/?uri=CELEX:32011R1169, Annex XIII Part A                   | NRVs; significant amount = 15 % per 100 g                 |
| astro                        | 7.4.8             | Context7 `/withastro/docs` (guides/routing, `getStaticPaths`)                                     | `nutrienti/[slug]` static pages                           |
| astro/zod (Zod 4)            | 7.4.8             | `node_modules/zod` types (`z.strictObject`, `.min`)                                               | Nutrient schema                                           |
