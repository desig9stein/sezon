# Content guide

All site content lives in `src/data/<collection>/<id>.yaml`, one file per entry.
The schemas are in `src/contexts/<context>/infrastructure/schemas.ts`. `pnpm build` rejects
entries that do not match their schema, including unknown keys (typos). References between
entries are checked by `pnpm test` and whenever a page loads content during the build. The full contract is in `docs/specs/002-content-model-and-seed-data.md`; `docs/specs/049-season-only-mandatory.md` makes every produce field optional except the name, kind, group, summary, season and update date.

## Rules for every entry

- The file name (entry id) must equal the slug of the Bulgarian `name`, generated with the
  official transliteration (`Slug.fromBulgarian`). Examples: `Ябълки` → `yabalki.yaml`,
  `Стара Загора` → `stara-zagora.yaml`, `София-град` → `sofia-grad.yaml`.
  If unsure, run `pnpm test`: the seed-data test prints the expected file name.
- References use the id of another entry (`group: rozotsvetni`, `region: plovdiv`).
- Text values are in Bulgarian. Keys are in English.
- URLs must start with `https://` and use a real domain name.
- Dates use the ISO form `YYYY-MM-DD` (not `10.11.2026`).

## Voice

The site speaks to the reader informally, with „ти“, in a friendly and plain voice (decided
2026-11-11, see `PRODUCT.md`). This applies to every text that addresses the reader: how to
choose, storage, preparation and growing tips, FAQ answers and UI strings.

- Imperatives are singular: „Изберете твърди корени“ → „Избери твърди корени“,
  „Пазете в хладилник“ → „Пази в хладилник“, „Яжте ги с кората“ → „Яж ги с кората“.
- Second-person verbs are singular: „ако търсите“ → „ако търсиш“, „за да не губите“ →
  „за да не губиш“.
- Never „Вие“, „Ви“, „Вас“ or „Ваш…“.
- Titles of source articles in `sources` are quoted as published, whatever their voice.
- `tests/unit/content/voice.test.ts` fails on the formal forms found so far; add a new formal form
  to its list when you meet one.

## Add a produce (`src/data/produce/`)

What matters most is whether a produce is in season (owner decision, 2026-11-13, spec 049). Only
the season and what identifies the produce are required; every other block is optional and may
differ from one produce to the next. Never invent a block to fill the page: leave it out until a
source gives it.

### Minimal entry

```yaml
name: Хрян # Bulgarian name, shown as the page title
kind: vegetable # fruit | vegetable | herb | nut
group: krastotsvetni # id from src/data/groups (the botanical family)
summary: 70–160 characters, one line. It is the meta description of the page and of search results.
season: # at least one month; each month once
  - { month: 11, level: peak } # peak | available | storage
updatedAt: 2026-11-13
```

The page of a minimal entry shows the name, kind and family, the summary, the season calendar, the
growing regions section („Няма официални данни по области…“), the farms that sell it, the update
date and the methodology link. Every section without data is left out, with its heading and its
table of contents entry.

### Optional blocks

| Field             | What it adds to the page                                                     |
| ----------------- | ---------------------------------------------------------------------------- |
| `latinName`       | The Latin name under the title, on cards and lists, and in the JSON-LD.      |
| `varieties`       | The „Сортове“ list.                                                          |
| `regions`         | The provinces with notes and the map (spec 042 for an empty list).           |
| `nutrition`       | The nutrition table, the „На масата“ group and a place in nutrient rankings. |
| `preparation`     | The preparation tips in „На масата“.                                         |
| `traditionalUses` | The traditional uses in „На масата“, each with its source.                   |
| `howToChoose`     | The „Как да избереш“ section.                                                |
| `storage`         | The „Съхранение“ section.                                                    |
| `faq`             | The questions section and the `FAQPage` JSON-LD.                             |
| `photo`           | The photo plate, the card photo and the JSON-LD image.                       |
| `growing`         | The home-garden guide and its months in the calendar.                        |
| `organic`         | The organic production note above the farms.                                 |
| `wild`            | The „Диворастящо“ label on the page and in lists, and the gathering note.    |
| `cautions`        | The „Внимание“ section at the top of „На сергията“, each with its source.    |

A block that is present is checked in full: nutrition needs every macronutrient and a source,
each traditional use and growing guide needs its sources, and a photo needs `alt` and a credit.
Omitted lists are the same as empty lists. A recipe in `src/data/recipes/` that lists the produce
adds the „Рецепти за зимнина“ block to „На масата“, even when the produce has no other block there.

### Full entry

Keys marked `# optional` may be left out; the others are the required keys of the minimal entry.

```yaml
name: Ябълки # Bulgarian name, shown as the page title
latinName: Malus domestica # optional
kind: fruit # fruit | vegetable | herb | nut
group: rozotsvetni # id from src/data/groups
summary: 70–160 characters, used as the meta description.
varieties: # optional
  - name: Флорина
    note: Optional note.
season: # at least one month; each month once
  - { month: 9, level: peak } # peak | available | storage
regions: # optional; ids from src/data/regions; omit or use [] only when no official source names a province
  - region: kyustendil
    note: Why this region is named; quote figures only with a source.
    source: { name: …, url: https://… } # optional; required when the note quotes figures
nutrition: # optional; when present, complete and sourced, per 100 g raw edible portion
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
preparation: # optional
  - method: Сурови с кората
    tip: How to prepare it to keep nutrients.
traditionalUses: # optional
  - system: ayurveda # ayurveda | folk
    use: Традиционно се използва при … # must start with this phrase
    source: { name: …, url: https://… }
howToChoose: … # optional
storage: … # optional
faq: # optional
  - question: …
    answer: …
updatedAt: 2026-11-10
```

The `photo`, `growing` and `organic` blocks below are optional too.

### Photo

A photo is optional. When you add one, it is a close-up of the produce itself, without people,
text or logos.

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

Every month and tip must come from a cited Bulgarian source about growing vegetables or fruit
(e.g. agrozona.bg or bgfermer.bg). Do not cite gradinata.bg: the owner judged it unreliable
(spec 034).

When the facts or sources of a produce change, set its `updatedAt` to the date of the change. Tips address the reader with „ти“ („Сей“,
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
(`certifier`, `certificateId`, `validUntil`) only with a real certificate. When the only
evidence is a producer's own website, write that the producer states it is certified („посочва,
че е сертифицирана“), credit each figure only to the source that gives it, and do not name
individual products or offers.

### Wild plants and cautions

Wild-gathered plants (nettle, dandelion, ramsons, elder, hawthorn, sloe …) are marked `wild: true`
(spec 055). A wild produce needs at least one sourced caution: `pnpm build` and the schema tests
reject `wild: true` without `cautions`. Whenever a source names a toxic look-alike, add a
`look-alike` caution at minimum. Cautions may also be given for a cultivated produce (for example
an allergy, or a protected wild form, see below).

**A species that may not be gathered at all is never added**, not even with a caution: a species in
Приложение 3 of the Закон за биологичното разнообразие (protected species), a species in the
Червена книга на България, or a species whose gathering an order bans completely.

```yaml
wild: true # optional, default false: the plant is gathered from the wild („диворастящо“)
cautions: # optional; required (at least one) when wild is true
  - kind: look-alike # look-alike | toxic-part | allergy | protected | preparation
    text: 'One line, 20–200 characters, in the „ти“ voice, e.g. what the look-alike is and how to tell it apart.'
    source: { name: 'Title as published', url: https://… }
```

- `look-alike`: toxic plants that can be mistaken for it. `toxic-part`: a part of the plant is
  toxic or must not be eaten raw. `allergy`: a known allergen. `preparation`: it must be blanched or
  cooked before eating.
- `protected` (shown as „Защита и ограничения“) covers only a species that **may be gathered under
  restrictions**: the regime of the Закон за лечебните растения (gathering for personal needs within
  its limits), a species in Приложение 4 of the Закон за биологичното разнообразие, or a species whose
  gathering a yearly МОСВ order limits. It also covers a cultivated produce whose **wild form** is
  protected, e.g. sea buckthorn: „Плодовете в продажба са от насаждения; събирането на диворастящ
  облепих е забранено.“
- A `protected` caution cites the act or order with its number and year in `source.name` (e.g.
  „Заповед № РД-…/2026 г. на министъра на околната среда и водите“). A caution based on a yearly
  order also names the year in its text („През 2026 г. …“). Re-check every yearly order whenever you
  change the produce's `updatedAt`, and update the caution and its source to the order in force.
- Every caution has its own `source` (https): the act or order, an official document, a poison
  centre or a scientific publication. Wikipedia is not a source.
- Write facts, never health claims: no „полезен“, „лекува“ or „действие“. Do not write what to do
  after poisoning; the page links no medical advice.
- The page shows the cautions in one „Внимание“ callout before the season, with the gathering note
  for wild produce, and lists their sources in „Източници“.

### Health content (YMYL)

- Take nutrition values from USDA FoodData Central (SR Legacy, raw) or EFSA, and cite the item.
  Prefer the item page URL `https://fdc.nal.usda.gov/food-details/<fdcId>/nutrients`.
  Then regenerate the USDA extract (`pnpm content:usda <SR Legacy CSV dir>`, see
  `docs/content-review/README.md`): a unit test fails when a value differs from the cited record.
- Vitamin A amounts are in µg RAE (USDA). The EU reference intake (800 µg) is defined in
  retinol equivalents (RE); for plant foods RAE is about half of RE, so the % shown is conservative.
- Do not write that a food is „полезен“, „лекува“ or has an „действие“; a test rejects such words.
- Traditional uses describe tradition, not effects. Always start with
  „Традиционно се използва …“. Never write that a food cures, treats or prevents a disease
  (EU Regulation 1924/2006).
- Every traditional use needs a primary source: a pharmacopoeia or official monograph (EMA/HMPC,
  Ayurvedic Pharmacopoeia of India), an ethnobotanical study or a published collection of folk
  medicine. Wikipedia is not accepted (a test rejects it); without a primary source, leave the use
  out.

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
address: Optional address (no private flat numbers)
sponsored: false # optional, default false
sources: # pages the facts come from, https, at least one
  - https://…
```

Only real farms, never invented examples. Every fact (province, produce, description, contacts)
comes from the pages listed in `sources` (the farm's own pages or a directory, see below). List
only seed produce the farm says it grows or sells. Write the description in the third person; what a farm says about
itself that the site has not checked (e.g. „сертифицирана“ without a certifier, number and
expiry) starts with „По данни на фермата …“. Note paused sales with the month of the check.

- **Directories.** A Хранкооп producer page (coop.hrankoop.com) or a LocalStore.bg profile is a
  valid source. Facts that come only from LocalStore.bg are introduced with „По данни на
  LocalStore.bg …“. gradinata.bg is never a source.
- **Contacts.** Publish a website, e-mail or phone only when a cited page shows it in clear text.
  Never publish a number a directory masks („088 72* ****“), even if the full number is in the page
  source. A farm without its own site links its Хранкооп page (where it sells) or its LocalStore.bg
  profile as `contact.website`.
- **Province.** Use the province the source names, or the one of the settlement when its name is
  unique in Bulgaria or the source removes the ambiguity (e.g. „на 10 минути от Добрич“). Record
  the basis in the spec.
- **Organic.** Add an `organic` block only from a certificate you have read, e.g. in the EU TRACES
  directory of organic operators, and cite it in `sources`.

## Add a recipe (`src/data/recipes/`)

```yaml
title: Компот от круши # the file name is the slug of the title
summary: 70–160 characters, used as the meta description.
category: compote # sauerkraut | pickle | preserve | jam | compote | jarred-vegetables
produce: [krushi] # ids from src/data/produce, at least one
yield: от 10 круши # as the source states it, else the main amount
prepMinutes: 20 # optional: only when the recipe or safety source gives the time
cookMinutes: 5 # optional: same rule; never estimate a time
processingMinutes: 25 # boiling-water time at 0–300 m for the largest jar, from the safety source
waitDays: 0 # optional: days of fermentation before the preserve is ready
ingredients:
  - { name: Круши, quantity: 10, unit: piece } # g | kg | ml | l | piece | tsp | tbsp | cup
steps:
  - Измий и обели крушите … # „ти“ voice, one line each
safety:
  note: The food-safety note, one line.
  sterilisation: Jars and processing times by jar size and altitude, one line.
  storage: How and how long to store, one line.
  sources: # food-safety sources for every statement above and the processing step
    - name: 'National Center for Home Food Preservation – Pears-Halved'
      url: https://nchfp.uga.edu/how/can/canning-fruits-and-fruit-products/pears-halved/
sources: # the recipe article(s), titles copied exactly
  - name: 'Български фермер – Най-вкусните компоти за зимата'
    url: https://www.bgfermer.bg/Article/23461966
publishedAt: 2026-11-13
updatedAt: 2026-11-13
```

- **Recipes are optional.** The site's core is the season of each produce. Add a recipe only when
  its safety is fully sourced; drop it rather than adapt it.
- **Base every recipe on an editorial Bulgarian recipe article** (bgfermer.bg or agrozona.bg, which
  a test checks), not a user-submitted recipe site, and copy its title into `sources`.
- **Follow a tested pack.** Fill the jars the way the safety source does (for example fruit packed
  to the shoulder, not a third of the jar topped with water); otherwise leave the recipe out.
- **Every food-safety statement needs a food-safety source:** salt, sugar, acid or vinegar amounts,
  processing times, jar sizes, altitude and storage. Use the National Center for Home Food
  Preservation (nchfp.uga.edu), Ask Extension, a university extension (`.edu`), БАБХ or the EU. A
  test rejects safety sources from other hosts.
- **When the recipe article and the safety source disagree** on something that affects safety, follow
  the safety source and say so in the safety note („… идва от NCHFP: статията … само затваря
  бурканите“).
- **Leave a recipe out** when no tested source covers it: low-acid vegetables without a tested
  vinegar ratio (beets, mixed pickles), anything that needs a pressure canner (pumpkin, plain beets)
  or lye or lime (green walnuts).
- NCHFP's altitudes are in feet: 0–1,000 ft is „до 300 м“, 1,001–3,000 ft „300–900 м“, 3,001–6,000 ft
  „900–1800 м“ and above 6,000 ft „над 1800 м“; give every band. A pint jar is „до 470 мл“, a quart
  „до 950 мл“; larger jars have no tested time.
- The processing step says „от момента, в който водата заври“. The water-bath rules (water depth,
  timing, restart, cooling, seal check, new lids) are one shared list on every recipe page
  (`ui.recipes.waterBath`), so cite NCHFP „Using Boiling Water Canners“ and „Recommended Jars and
  Lids“ in every recipe's `safety.sources` and do not repeat the rules in the notes.
- **Sweet spreads (сладко, конфитюр)** use NCHFP's preserve-recipe process: sterile jars up to 470 мл,
  5 minutes up to 300 м, 10 minutes from 300 to 1800 м, 15 minutes above 1800 м. Cite the NCHFP
  preserves recipe for the fruit (for example Plum Preserves).
- Steps use „ти“; no health claims and never „богат на“.

## Add a sponsor (`src/data/sponsors/`)

```yaml
name: Име на спонсора
image: ../../assets/sponsors/<id>.jpg # local banner, 4:1, at least 960 × 240 px
alt: Какво показва банерът и какво предлага спонсорът
url: https://… # the sponsor's page, https only
placement: produce # produce or month
from: 2026-12-01 # first day, a date without time
to: 2026-12-31 # last day, a date without time, not before `from`
```

The file name is the sponsor's id (a Latin slug). The folder is empty until a sponsor signs up.

- **Real sponsors only.** Never add an invented or example sponsor, not even for a test or a
  preview (AGENTS.md section 10). Tests use in-memory sponsors.
- **Dates are whole days.** `from` and `to` are inclusive calendar days in Europe/Sofia. Write a
  plain date (`2026-12-01`); a timestamp with a time of day fails the build. The site is static,
  so a campaign starts and ends with the first build on or after those days.
- **Banner:** a 4:1 image in `src/assets/sponsors/`. The slot crops other ratios to 4:1 from the
  centre, so keep text and logos away from the edges. Do not put the only copy of important text
  in the image.
- **Alt text** in Bulgarian: what the banner says and offers, e.g. „Ферма X – био зеленчуци с
  доставка в София“. It is the link's accessible name, so it must not be empty or generic
  („банер“, „реклама“).
- **One sponsor per placement is shown.** When campaigns overlap, the one with the latest `from`
  wins, then the lowest id. The slot is labelled „Реклама“ and the link has `rel="sponsored"`.

## Editing with Keystatic

Keystatic is a form editor for the same YAML files (ADR-0008, spec 054). It runs only on your
computer, inside the dev server; the published site has no admin.

1. Run `pnpm dev` and open `http://127.0.0.1:4321/keystatic`.
2. Pick a collection, edit or create an entry and press **Save**. Keystatic writes
   `src/data/<collection>/<id>.yaml` directly; for a new entry it proposes the file name from the
   Bulgarian name (`Slug.fromBulgarian`).
3. Commit the changed YAML on a branch and open a pull request, as for any other change. CI
   checks it against the schemas.

- **Wild and cautions:** tick **Wild-gathered** and add at least one caution (kind, text, source).
  A save writes both `wild: false` (checkbox not ticked) and `cautions: []` (no caution) into every
  produce file; both mean the same as leaving the keys out.
- **Not editable in the form:** nutrition, photo, growing guide and organic production of a
  produce, the sources of its regions, a province's profile and a farm's certificate. Keystatic
  keeps them unchanged; edit them in the YAML file.
- **Sponsor banners:** put the image in `src/assets/sponsors/` yourself and type its path
  (`../../assets/sponsors/<id>.jpg`) in the form.
- **Do not change the slug of a published entry.** The slug is the file name and the URL. Changing
  it renames the file, breaks the page's URL and leaves every reference to the old id (`group:`,
  `region:`, a farm's or recipe's `produce`) pointing at nothing. Keystatic rejects a slug that
  another entry already has („Slug must be unique“), and **Duplicate** proposes `<slug>-copy`:
  replace it with the slug of the new entry's own name before saving.
- **Formatting:** Keystatic rewrites a saved file in its own YAML style. Lists become block lists,
  long text and long URLs are folded with `>-`, quotes are dropped where YAML allows, empty lists
  are written out (`varieties: []`, `faq: []`), and farms get `sponsored: false`. Dates stay plain
  dates (`2027-07-20`). The values do not change, but the first save of a file shows a larger diff
  than your edit.
- The form checks required fields, lengths and allowed values. The other rules in this guide
  (https sources, „Традиционно се използва …“, unique months) are checked by `pnpm build` and CI.

## Seed data status

What is sourced and what is editorial for every produce is recorded in
`docs/content-review/README.md`: nutrition is checked against USDA by the unit tests, the
Wikipedia-sourced traditional uses were removed, the regions of apples, pears, walnuts and cabbage
follow МЗХ statistics (spec 033), the regions of tomatoes, peppers, aubergines and cucumbers
(spec 041) and of potatoes and onions (spec 044) follow МЗХ statistics at NUTS2 level, and
seasons are editorial (no official monthly calendar exists).

- **More fruits and nuts (2026-11-13, spec 052):** 21 fruits and nuts whose season a Bulgarian
  source states. Only blocks with a source are filled: 12 cite USDA SR Legacy, 7 name provinces or
  the leading NUTS2 region from МЗХ bulletins, the others have no nutrition or regions. Red currant
  and wild strawberry are left out (no source with months); elder is excluded (toxic look-alike).
- **Autumn staples (2026-11-13, spec 044):** potatoes, onions, broccoli, cauliflower and chestnuts
  cite USDA SR Legacy; potatoes and onions name the provinces of the leading NUTS2 region of the
  МЗХ 2025 vegetable bulletin; broccoli, cauliflower and chestnuts have `regions: []`. The rosehip
  of issue #41 is left out: SR Legacy has no raw record of it and the EFSA database gives no energy
  or macronutrients.
- **Spring greens (2026-11-13, spec 043):** sorrel, spring onions, garlic, romaine lettuce and
  radishes cite USDA SR Legacy and list no regions, because МЗХ publishes no provincial or NUTS2
  data for them. Nettle is left out: SR Legacy has only a blanched record, and the page states
  values per 100 g raw.
- **More vegetables and herbs (2026-11-13, spec 053):** 21 entries with sourced seasons and no
  regions; nutrition only where SR Legacy has a raw or fresh record, photos only where Unsplash
  clearly shows the produce. Wild nettle stays out because its only source carries cautions the
  page cannot show; dandelion stays out because no source gives a month for its leaves.
- **More cultivated produce (2026-11-13, spec 056):** ten cultivated produce with sourced harvest
  months and no regions; nutrition only from raw SR Legacy records, photos only where Unsplash
  clearly shows the produce. Goji berries and Kamchatka honeysuckle wait for a batch with cautions
  (unripe goji fruit, toxic _Lonicera_ look-alikes); varieties of existing entries (iceberg lettuce,
  shallot, black radish, pattypan squash) are not separate produce.
- **Farms (checked 2026-11-11, #16):** 10 real farms from their own websites. None publishes a
  full organic certificate, so none has an `organic` block.
- **More farms (checked 2026-11-13, spec 051):** 39 more farms from their own sites, Хранкооп
  listings and LocalStore.bg profiles (sources and the province basis per farm in
  `docs/specs/051-more-farms.md`). ВКУСнаГРАДИНА has the only `organic` block, from its COSMOCERT
  certificate in TRACES; masked directory phones are not published.
