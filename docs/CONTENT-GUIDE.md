# Content guide

All site content lives in `src/data/<collection>/<id>.yaml`, one file per entry.
The schemas are in `src/contexts/<context>/infrastructure/schemas.ts`. `pnpm build` rejects
entries that do not match their schema, including unknown keys (typos). References between
entries are checked by `pnpm test` and whenever a page loads content during the build. The full contract is in `docs/specs/002-content-model-and-seed-data.md`.

## Rules for every entry

- The file name (entry id) must equal the slug of the Bulgarian `name`, generated with the
  official transliteration (`Slug.fromBulgarian`). Examples: `Ябълки` → `yabalki.yaml`,
  `Стара Загора` → `stara-zagora.yaml`, `София-град` → `sofia-grad.yaml`.
  If unsure, run `pnpm test`: the seed-data test prints the expected file name.
- References use the id of another entry (`group: rozotsvetni`, `region: plovdiv`).
- Text values are in Bulgarian. Keys are in English.
- URLs must start with `https://` and use a real domain name.
- Dates use the ISO form `YYYY-MM-DD` (not `10.11.2026`).

## Add a produce (`src/data/produce/`)

```yaml
name: Ябълки # Bulgarian name, shown as the page title
latinName: Malus domestica
kind: fruit # fruit | vegetable | herb | nut
group: rozotsvetni # id from src/data/groups
summary: 70–160 characters, used as the meta description.
varieties:
  - name: Флорина
    note: Optional note.
season: # at least one month; each month once
  - { month: 9, level: peak } # peak | available | storage
regions: # at least one; ids from src/data/regions
  - region: kyustendil
    note: Why this region is good for this produce.
nutrition: # per 100 g raw edible portion
  energyKcal: 52
  proteinG: 0.26
  fatG: 0.17
  carbohydrateG: 13.81
  fiberG: 2.4
  sugarsG: 10.39 # optional
  micronutrients: # ids from src/data/nutrients; amount in the nutrient's unit
    - { nutrient: vitamin-c, amount: 4.6 }
  source:
    name: 'USDA FoodData Central, SR Legacy: Apples, raw, with skin'
    url: https://fdc.nal.usda.gov/
preparation: # at least one tip
  - method: Сурови с кората
    tip: How to prepare it to keep nutrients.
traditionalUses: # may be empty
  - system: ayurveda # ayurveda | folk
    use: Традиционно се използва при … # must start with this phrase
    source: { name: …, url: https://… }
howToChoose: …
storage: …
faq:
  - question: …
    answer: …
updatedAt: 2026-11-10
reviewStatus: draft # draft | reviewed
```

### Photo

Every produce has a photo: a close-up of the produce itself, without people, text or logos.

1. Put the image in `src/assets/produce/<slug>.jpg`: cropped to 4:3, 1600 × 1200 px, JPEG at
   quality about 80, without EXIF. The build makes the AVIF, WebP and smaller sizes, so do not
   add them yourself.
2. Add the `photo` block to the produce YAML:

   ```yaml
   photo:
     src: ../../assets/produce/zele.jpg
     alt: 'Глава бяло зеле с външни зелени листа върху дървена маса'
     credit:
       author: 'Име на автора'
       authorUrl: https://unsplash.com/@username
       sourceName: Unsplash
       sourceUrl: https://unsplash.com/photos/<photo-id>
   ```

   - `alt` is one Bulgarian sentence of 10–120 characters that describes what is in the photo
     (colour, shape, setting), not only the produce name.
   - For your own photo, use your name and site in `author` and `authorUrl`, and the same page
     or your site in `sourceName` and `sourceUrl`.
   - Photos from Unsplash fall under the Unsplash License. Download them through the Unsplash
     download link, so the download is counted for the photographer.

To replace a photo, overwrite the JPEG with the same file name and update `alt` and `credit`.

### Growing guide

The optional `growing` block tells home gardeners when to sow and plant:

```yaml
growing:
  sow: [2, 3] # sowing, for seedlings or directly in the bed
  transplant: [4] # setting seedlings out
  plant: [] # planting saplings, sets or plants
  plantingNote: 'Optional single line, e.g. for trees or a regional caveat.'
  tips:
    - 'Three to five tips, each at most 140 characters, in your own words.'
  sources:
    - name: 'Site – article title'
      url: https://example.bg/article
```

Every month and tip must come from a cited Bulgarian source (gardening portals such as
agrozona.bg, bgfermer.bg or gradinata.bg). Tips address the reader with „ти“ („Сей“,
„Поливай“), as `PRODUCT.md` asks. Never write „богат на“, even about soil.

### Organic production

The optional `organic` block says whether certified organic production of the produce exists in
Bulgaria:

```yaml
organic:
  availability: available # or limited
  note: 'One factual sentence, at most 160 characters, e.g. areas from Eurostat org_cropar.'
  sources:
    - name: 'Евростат – org_cropar'
      url: https://ec.europa.eu/eurostat/databrowser/view/org_cropar/default/table
```

Leave the block out when no source states it (no „unknown“ is shown). Organic is a production
method: never write it as a health or quality claim. A farm gets an `organic` block
(`certifier`, `certificateId`, `validUntil`) only with a real certificate; placeholder farms never
do. When the only evidence is a producer's own website, write that the producer states it is
certified („посочва, че е сертифицирана“), credit each figure only to the source that gives it,
and do not name individual products or offers.

### Health content (YMYL)

- Take nutrition values from USDA FoodData Central (SR Legacy, raw) or EFSA, and cite the item.
  Prefer the item page URL `https://fdc.nal.usda.gov/food-details/<fdcId>/nutrients`.
- Vitamin A amounts are in µg RAE (USDA). The EU reference intake (800 µg) is defined in
  retinol equivalents (RE); for plant foods RAE is about half of RE, so the % shown is conservative.
- Do not write that a food is „полезен“, „лекува“ or has an „действие“; a test rejects such words.
- Traditional uses describe tradition, not effects. Always start with
  „Традиционно се използва …“. Never write that a food cures, treats or prevents a disease
  (EU Regulation 1924/2006).
- Set `reviewStatus: reviewed` only after a human has checked every value against the source.

## Add a nutrient (`src/data/nutrients/`)

```yaml
name: Витамин C
kind: vitamin # vitamin | mineral
unit: mg # mg | µg
referenceIntake: 80 # EU adult NRV, Regulation (EU) No 1169/2011, Annex XIII Part A
claims: # authorised health claims, verbatim, without the final full stop
  - Витамин С допринася за нормалната функция на имунната система
claimsSource:
  name: Регламент (ЕС) № 432/2012 на Комисията (списък на разрешените здравни претенции)
  url: https://eur-lex.europa.eu/legal-content/BG/TXT/?uri=CELEX:32012R0432
note: Optional editorial note, e.g. the unit basis. # optional
```

- Copy each claim **verbatim** from the Bulgarian text of Regulation (EU) No 432/2012 on
  EUR-Lex. Never paraphrase, shorten or combine claims. Add the sentence to the list of authorised
  claims in `tests/unit/contexts/catalog/infrastructure/nutrientClaims.test.ts`.
- The page labels a produce „Източник на …“ from 15 % and „С високо съдържание на …“ from 30 % of
  the reference intake per 100 g (Regulation (EC) No 1924/2006). Never write „богат на …“.

## Add a farm (`src/data/farms/`)

```yaml
name: Име на фермата
region: plovdiv
produce: [zele, praz] # ids from src/data/produce
description: Short description.
contact: # at least one of website, email, phone
  website: https://…
  email: farm@example.bg
  phone: '+359888123456' # E.164 format, quoted
address: Optional address
isPlaceholder: false
sponsored: false # optional, default false
```

## Seed data status

All seed produce entries are `reviewStatus: draft`.

- **Nutrition (checked 2026-11-11, #10):** every value was compared with the USDA FoodData
  Central SR Legacy release (April 2018, CSV download) and matches it. Four rounded
  micronutrient values were replaced by the exact figures. Each `nutrition.source.url` points to
  the item page (`https://fdc.nal.usda.gov/food-details/<fdcId>/nutrients`).
- **Still to review before `reviewed`:** season months and growing regions against Bulgarian
  sources, and traditional uses, which cite Wikipedia as a starting point and should get
  primary sources.

All farms are placeholders (`isPlaceholder: true`) on `example.com`.
