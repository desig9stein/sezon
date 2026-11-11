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

All seed produce entries are `reviewStatus: draft`: nutrition values were entered from
USDA FoodData Central SR Legacy and must be re-checked item by item. Their source URL is the
FoodData Central home page, because the item pages could not be reached while seeding; replace
each with the item page during review. Traditional uses cite
Wikipedia as a starting point and should be replaced with primary sources.
All farms are placeholders (`isPlaceholder: true`) on `example.com`.
