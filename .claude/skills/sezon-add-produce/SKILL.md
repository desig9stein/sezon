---
name: sezon-add-produce
description: Add a new fruit, vegetable, herb or nut to the Sezon catalog, or rework an existing one, as a sourced YAML entry in src/data/produce with its photo, USDA nutrition, МЗХ regions and growing guide, then run the content tests. Use this whenever someone asks to add, create or expand a produce entry or a batch of produce ("add пъпеш", "добави тиква", "we need sorrel and nettle", "the summer fruits issue"), or to fix its sources, regions, nutrition or photo, even if they never say "YAML". Not for farms, recipes, nutrients or sponsors.
---

# Add a produce to Sezon

A produce is one file, `src/data/produce/<slug>.yaml`, plus a photo in `src/assets/produce/`.
Every fact on the page is either sourced or labelled editorial, because the site carries health
content (YMYL). Read these before writing anything, and follow them where this skill is silent:

- [`docs/CONTENT-GUIDE.md`](../../../docs/CONTENT-GUIDE.md): the field reference, voice, photo,
  growing guide, organic block and the health-content rules.
- [`docs/content-review/README.md`](../../../docs/content-review/README.md): what is sourced per
  produce, where sources were searched, and how to regenerate the USDA extract.
- `AGENTS.md` section 10 (content rules).

A batch of new produce is a feature: it gets a spec and the full workflow (see the
`sezon-feature` skill). Specs 040–044 are worked examples; copy their structure.

## 1. Check what the schema requires on `main`

Run `git fetch origin main` and read `produceSchema` in
`src/contexts/catalog/infrastructure/schemas.ts` on `origin/main`. Spec 049 makes the season the
only mandatory part of a produce (nutrition, regions, preparation and the rest become optional).
Until it is merged, `main` still requires them. Leave a field out only when the schema on `main`
allows it; never invent a value to fill a required field. If no source exists for a required
field, stop and tell the owner rather than guess.

## 2. Slug and file name

The file name is the slug of the Bulgarian `name`, from `Slug.fromBulgarian`
(`Ябълки` → `yabalki.yaml`). If unsure, run the content tests: the seed-data test prints the
expected file name. Use the same slug for the photo and in references from farms or recipes.

## 3. Sources, one per fact

- **Nutrition:** USDA FoodData Central, SR Legacy, raw record. Cite the item page
  `https://fdc.nal.usda.gov/food-details/<fdcId>/nutrients` with the record title. Copy every value
  from that record, then regenerate the extract with `pnpm content:usda <SR Legacy CSV dir>` (steps
  in `docs/content-review/README.md`) and commit `tests/fixtures/usda/sr-legacy-extract.json`.
  `tests/unit/content/usda-nutrition.test.ts` fails when a value differs. If SR Legacy has no raw
  record, leave the produce out or ask (rosehip and nettle were left out for this reason).
- **Regions:** МЗХ „Агростатистика“ bulletins only (orchard structure survey for fruit, the
  vegetables bulletin „Производство на зеленчуци … реколта <year>“ for vegetables).
  - Name provinces only when a table ranks them. When the data is by NUTS2 region, name the
    provinces of the leading region and quote the regional figure and year without ranking them.
  - **Check confidential cells.** Read the table's legend: some provinces are hidden as
    confidential, so a visible rank can be wrong. Say so („about sixth: two cells are
    confidential“, spec 033) or do not rank.
  - Every note that quotes a figure cites the bulletin with its exact title.
  - With no official provincial or NUTS2 data, use `regions: []` (spec 042) and say why in the
    spec and in `docs/content-review/README.md`.
- **Growing guide:** Bulgarian gardening sources such as bgfermer.bg or agrozona.bg. Every month
  and tip must be stated by the cited page. **Never cite gradinata.bg**: the owner judged it
  unreliable (spec 034), and tests reject it.
- **Varieties:** the ИАСАС official variety list or Български фермер.
- **Traditional uses:** only with a primary source (pharmacopoeia, official monograph,
  ethnobotanical study). Never Wikipedia. Without one, `traditionalUses: []`.
- **Seasons** are editorial (no official monthly calendar exists); say so in the spec.

**Quote sources verbatim.** Copy titles exactly as published, and record the sentence or table
row that supports each fact in the spec's sources section, so the reviewer can check it without
re-reading the page. Do not paraphrase a figure from memory.

## 4. No health claims

- Traditional uses start with „Традиционно се използва …“ and describe tradition, never effects
  (EU Regulation 1924/2006).
- Never write „полезен“, „лекува“, „действие“ or „богат на“ (not even about soil). Tests reject
  them. Nutrient labels („Източник на …“) are computed by the site, not written in YAML.
- Organic is a production method, never a quality or health claim.
- Address the reader with „ти“ (CONTENT-GUIDE „Voice“).

## 5. Photo from Unsplash

Search Unsplash (the Unsplash MCP tools or unsplash.com) for a close-up of the produce itself, with
no people, text or logos, and check it is the right species (a sweet chestnut burr, not a horse
chestnut). Download through the Unsplash download endpoint so the photographer is credited, crop to
4:3, export 1600 × 1200 JPEG at quality about 80 without EXIF, and save it as
`src/assets/produce/<slug>.jpg`. Fill `photo` with a descriptive Bulgarian `alt` (10–120
characters) and the credit fields, as CONTENT-GUIDE shows. Record the photo id and author in the
spec.

## 6. Test and record

1. Run `pnpm test tests/unit/content` while writing; it checks the schema, references, slug,
   banned words and hosts, sources and USDA values. Fix each failure at its cause.
2. Run the full `pnpm test` once before committing (other suites read the catalog too).
3. Add the produce to the table in `docs/content-review/README.md` and to the seed-data status in
   `docs/CONTENT-GUIDE.md` when the batch has a spec.
4. Set `updatedAt` to today whenever facts or sources change.

CI runs the rest (build, e2e, Lighthouse). Do not repeat it locally unless CI goes red.
