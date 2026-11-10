# Content guide

All site content lives in `src/data/<collection>/<id>.yaml`, one file per entry.
The schemas are in `src/contexts/<context>/infrastructure/schemas.ts`; `pnpm test` and
`pnpm build` reject invalid content. The full contract is in `docs/specs/002-content-model-and-seed-data.md`.

## Rules for every entry

- The file name (entry id) must equal the slug of the Bulgarian `name`, generated with the
  official transliteration (`Slug.fromBulgarian`). Examples: `Ябълки` → `yabalki.yaml`,
  `Стара Загора` → `stara-zagora.yaml`, `София-град` → `sofia-grad.yaml`.
  If unsure, run `pnpm test`: the seed-data test prints the expected file name.
- References use the id of another entry (`group: rozotsvetni`, `region: plovdiv`).
- Text values are in Bulgarian. Keys are in English.
- URLs must start with `https://`.

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
- Traditional uses describe tradition, not effects. Always start with
  „Традиционно се използва …“. Never write that a food cures, treats or prevents a disease
  (EU Regulation 1924/2006).
- Set `reviewStatus: reviewed` only after a human has checked every value against the source.

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
USDA FoodData Central SR Legacy and must be re-checked item by item. Traditional uses cite
Wikipedia as a starting point and should be replaced with primary sources.
All farms are placeholders (`isPlaceholder: true`) on `example.com`.
