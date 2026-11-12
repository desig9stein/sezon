# 032. Content review, step 1: nutrition values and traditional-use sources

- **Status:** Approved
- **Bounded context(s):** catalog (content), tooling
- **Amended by:** spec 034 (review status and the „Проверка“ section removed)
- **Related:** issue #10 (review the 13 seed produce entries), `docs/CONTENT-GUIDE.md`, spec 031
  (methodology), owner decision of 2026-11-12 („You decide“)

## 1. Goal

The 13 seed products are still drafts. This step checks the parts that can be checked
mechanically against primary sources, and removes what has no primary source:

- **Nutrition values.** Every value is compared with the official USDA FoodData Central SR Legacy
  dataset (April 2018 release, the source the site cites). A committed extract and a test keep
  them in step.
- **Traditional uses.** The three uses cite Wikipedia, not a primary source. Searches for primary
  sources did not find one: an EMA/HMPC monograph, the Ayurvedic Pharmacopoeia of India, or a
  Bulgarian folk-medicine publication. As issue #10 prescribes („or the use removed“), they are
  removed, and Wikipedia is no longer accepted as a source for traditional use.

Seasons and growing regions need Bulgarian sources and a human review. They are a later step, so
`reviewStatus` stays `draft`. A review checklist tells the owner what is verified and what is left.

## 2. User stories

- As a reader, I want nutrition values that match the cited USDA record exactly.
- As the reviewer, I want to know which parts of each product are already verified.
- As a content author, I want the unit tests (CI) to fail when a nutrition value drifts from its
  source.

## 3. Scope

### In scope

- **`scripts/content/usda-extract.ts`:** reads the SR Legacy CSV files (`food.csv`,
  `food_nutrient.csv`) and writes `tests/fixtures/usda/sr-legacy-extract.json`. For every FDC id
  cited in `src/data/produce`, the extract holds:
  - the description;
  - the nutrients the site uses: energy, protein, fat, carbohydrate, fibre, sugars and the
    micronutrients in `src/data/nutrients`.
- **Unit test:** for every produce:
  - the cited FDC id is in the extract;
  - the source name matches the USDA description;
  - every nutrition value equals the extract.
- **Mapping:** nutrient slugs to FDC nutrient ids (vitamin A as RAE `1106`, folate as total
  folate `1177`, …) in one module, used by the script and the test.
- **Traditional uses:**
  - remove the three Wikipedia-sourced uses (dill, parsley, cabbage);
  - a content test rejects `wikipedia.org` as a traditional-use source.
- **Review checklist:** `docs/content-review/README.md`.
  - Per product: nutrition verified (date, dataset), traditional uses (none), seasons and regions
    (to check), and the reviewer's sign-off column.
  - How to regenerate the extract.
- **`docs/CONTENT-GUIDE.md`:** the extract workflow for new produce, and the primary-source rule
  for traditional use.

### Out of scope

- Sourcing seasons and regions; setting `reviewStatus: reviewed` (the owner's sign-off).
- Committing the whole dataset (6 MB); only the extract is committed.

## 4. Domain model

No change. Tooling only: `scripts/content/` and test fixtures.

## 5. Behaviour and edge cases

- Values must match exactly (SR Legacy values as published).
- A produce whose FDC id is missing from the extract fails the test with a message to run the
  script.
- The script prints the dataset name and how many foods it extracted. It fails if a cited id is
  not in the dataset.
- With no traditional use, the produce page omits that section (existing behaviour).

## 6. Accessibility requirements

Not applicable: no UI change beyond removing three paragraphs. The existing e2e and axe tests cover
the produce pages.

## 7. SEO requirements

Not applicable: no title, description or structured-data change.

## 8. Acceptance criteria

1. **AC1:** Given every produce, its cited FDC id is in the extract, and its source name matches
   the extract's description (ignoring USDA's parenthetical program notes).
2. **AC2:** Given every produce, every macro and micronutrient value equals the extract's value for
   that FDC id.
3. **AC3:** Given every produce, no traditional-use source is on `wikipedia.org`.
4. **AC4:** Given all produce, none cites the removed Wikipedia pages for dill, parsley and cabbage
   (a use with a primary source may be re-added).
5. **AC5:** Given `docs/content-review/README.md`, it lists all 13 products with their nutrition
   status and the open review items.

6. **AC6:** Given every USDA-sourced produce, it gives every macronutrient (sugars when USDA has
   them), and every numeric nutrition field has an FDC id mapping, so a deleted field or a broken
   mapping fails.
7. **AC7:** Given a produce that does not cite USDA, its nutrition source is on `efsa.europa.eu`
   (EFSA values are not machine-checked and are listed as such in the checklist).

## 9. Test plan

| AC  | Test type | Test file                                        |
| --- | --------- | ------------------------------------------------ |
| AC1 | unit      | `tests/unit/content/usda-nutrition.test.ts`      |
| AC2 | unit      | `tests/unit/content/usda-nutrition.test.ts`      |
| AC3 | unit      | `tests/unit/content/traditional-sources.test.ts` |
| AC4 | unit      | `tests/unit/content/traditional-sources.test.ts` |
| AC5 | unit      | `tests/unit/content/traditional-sources.test.ts` |

## 10. Third-party documentation consulted

| Package / source      | Version               | Source (URL or Context7 ID)                                                                                                                                                      | Topic                                                                                                                                                         |
| --------------------- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| USDA FoodData Central | SR Legacy, April 2018 | https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip (downloaded 2026-11-12)                                                                    | `food.csv`, `food_nutrient.csv`, `nutrient.csv` (nutrient ids 1008, 1003, 1004, 1005, 1079, 2000, 1162, 1185, 1106, 1177, 1092, 1089, 1090, 1101, 1098, 1091) |
| Web search            | –                     | EMA/HMPC (parsley: no EU monograph), Ayurvedic Pharmacopoeia of India (Anethum sowa listed in Part I Vol. II, text not accessible), Bulgarian folk-medicine sources (none found) | Primary sources for the three traditional uses                                                                                                                |
