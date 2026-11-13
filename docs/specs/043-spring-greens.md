# 043. Spring greens and wild plants

- **Status:** Approved
- **Bounded context(s):** catalog (content data)
- **Related:** issue #40, specs 015 (photos), 032 (USDA extract), 033 (sourced regions), 035
  (growing guides from reliable sources), 039 (traditional uses), 042 (produce without regions)

## 1. Goal

Issue #40 asks for the spring greens and wild plants that Bulgarian readers look for first in the
year: sorrel, nettle, spring onions, garlic, lettuce and radishes. This spec adds the five of them
that have a raw nutrition record in USDA SR Legacy, with every fact taken from a cited source, and
records why nettle is left out.

## 2. User stories

- As a reader, I want pages for sorrel, spring onions, garlic, romaine lettuce and radishes with
  their season, nutrition, varieties and a growing guide.
- As a reader, I want to be told when no official data names the provinces where a produce grows,
  instead of reading an unsourced claim.
- As the owner, I want no invented data: every value has a source or is marked editorial.

## 3. Scope

### In scope

Five new produce entries and two new groups:

| Slug        | Name      | Latin name                     | Kind      | Group                  | USDA SR Legacy record (FDC id)                                     |
| ----------- | --------- | ------------------------------ | --------- | ---------------------- | ------------------------------------------------------------------ |
| `kiselets`  | Киселец   | Rumex acetosa                  | vegetable | `lapadovi` (new)       | Dock, raw (170076)                                                 |
| `zelen-luk` | Зелен лук | Allium cepa                    | vegetable | `amarilisovi`          | Onions, spring or scallions (includes tops and bulb), raw (170005) |
| `chesan`    | Чесън     | Allium sativum                 | vegetable | `amarilisovi`          | Garlic, raw (169230)                                               |
| `marulya`   | Маруля    | Lactuca sativa var. longifolia | vegetable | `slozhnotsvetni` (new) | Lettuce, cos or romaine, raw (169247)                              |
| `repichki`  | Репички   | Raphanus sativus               | vegetable | `krastotsvetni`        | Radishes, raw (169276)                                             |

- **New groups** (names from the Bulgarian Wikipedia):
  - `lapadovi`: „Лападови“ (_Polygonaceae_), the family of sorrel (bg.wikipedia „Лападови“,
    „Киселец“).
  - `slozhnotsvetni`: „Сложноцветни“ (_Asteraceae_), the family of lettuce (bg.wikipedia
    „Сложноцветни“, „Маруля“).
- **Catalogue groups:** `main` already checks the catalogue's group links against the files in
  `src/data/groups` (`tests/e2e/site-shell.spec.ts`, spec 023 AC5), so the two new groups need no
  test change.
- **Docs:** the per-produce rows in `docs/content-review/README.md` and the „Seed data status“
  section of `docs/CONTENT-GUIDE.md`.

### Decisions

- **Sorrel nutrition:** USDA's „Dock, raw“ (FDC 170076) has the scientific name _Rumex spp._ on
  its FDC page, the genus of sorrel. It is the only raw _Rumex_ record in SR Legacy („Sourdock,
  young leaves (Alaska Native)“ is a regional record). The FAQ says the values are for the genus.
  The record has no sugars and no vitamin K, so the entry gives neither.
- **Garlic:** one entry, „Чесън“, covers green (young) garlic in spring and the mature bulb from
  summer onwards. SR Legacy has no green-garlic record, so the nutrition is „Garlic, raw“ (the
  mature cloves) and the FAQ says so. The season shows green garlic in April–May as `available`,
  the summer harvest as `peak` and the stored bulbs as `storage`.
- **Lettuce:** the entry is „Маруля“ (romaine). „Салата“ in Bulgarian is the butterhead type,
  which has its own USDA record; one entry cannot cite two records, so butterhead lettuce is out
  of scope.
- **Spring onions:** in Bulgaria green onions are mostly grown from onion sets (арпаджик) of
  _Allium cepa_; МЗХ counts them as „Лук кромид – зелен“. The Latin name is therefore _Allium
  cepa_, and the USDA record is the generic „Onions, spring or scallions“. The dry onion entry
  `luk` (branch 044) shares the Latin name _Allium cepa_: both are the same species, eaten at
  different stages, so the shared name is intended.

### Out of scope

- **Nettle (коприва).** SR Legacy has only „Stinging Nettles, blanched (Northern Plains Indians)“
  (FDC 169819). The site states „Стойностите са за 100 г сурова ядлива част“ for every produce,
  so a blanched record would be shown as raw. EFSA's published food composition data (Zenodo
  record 438313, 2013) lists „Common nettle“ only for selected vitamins and minerals, per
  country, with no energy, macronutrients or fibre, which the schema requires. With neither a
  raw USDA record nor a complete EFSA record, nettle is left out. A later spec could add a
  per-produce nutrition basis (raw or blanched) and then add nettle.
- **Organic production:** no `organic` block (no source checked for these five).
- **Traditional uses:** none (`traditionalUses: []`), as issue #40 asks.
- **Farms:** no farm is linked to the new produce.

## 4. Domain model

No change. The entries use the existing content schema. Two new `groups` entries.

## 5. Behaviour and edge cases

### Nutrition

Values are copied exactly from the SR Legacy CSV (April 2018) and checked by
`tests/unit/content/usda-nutrition.test.ts` after `pnpm content:usda`. Micronutrients are those
the record gives at ≥ 15 % of the EU reference intake per 100 g. Only when fewer than three reach
15 % does the entry add lower ones (potassium, folate) to show three in total; radishes are the
only such case.

| Slug        | Energy | Protein | Fat  | Carbs | Fibre | Sugars | Micronutrients                                       |
| ----------- | ------ | ------- | ---- | ----- | ----- | ------ | ---------------------------------------------------- |
| `kiselets`  | 22     | 2       | 0.7  | 3.2   | 2.9   | –      | vit C 48, vit A 200, Mg 103, K 390, Fe 2.4, Mn 0.349 |
| `zelen-luk` | 32     | 1.83    | 0.19 | 7.34  | 2.6   | 2.33   | vit K 207, folate 64, vit C 18.8                     |
| `chesan`    | 149    | 6.36    | 0.5  | 33.06 | 2.1   | 1      | Mn 1.672, vit C 31.2, Cu 0.299, P 153, K 401         |
| `marulya`   | 17     | 1.23    | 0.3  | 3.29  | 2.1   | 1.19   | vit K 102.5, vit A 436, folate 136                   |
| `repichki`  | 16     | 0.68    | 0.1  | 3.4   | 1.6   | 1.86   | vit C 14.8, folate 25, K 233                         |

### Regions

МЗХ „Агростатистика“ bulletin № 468 („Производство на зеленчуци в България – реколта 2025“) and
RA 423 (реколта 2022) give NUTS2 figures (Table 3) only for tomatoes, peppers, cucumbers,
aubergines, melons, potatoes, cabbage, mature dry onions and strawberries. Green onions („Лук
кромид – зелен“, 95 ha in 2025), mature garlic („Чесън – зрял“, 261 ha), lettuce („Салати и
марули“, 128 ha) and radishes (inside „Други грудкови и лукови зеленчуци“) are given only
nationally. Sorrel is not counted. Mature dry onions are a different crop from green onions, so
their NUTS2 figure is not used. Every new entry therefore has `regions: []` (spec 042), and the page
shows „Няма официални данни по области за този продукт.“

### Varieties

Only cultivars named in the ИАСАС „Официална сортова листа на сортове от земеделски растителни
видове и зеленчукови видове растения … 2026 г.“ (OSL 1 – 2026) or in a Български фермер article:

- **Чесън:** „Юнак“ (OSL list Б). „Зимен 14“ is left out: it is only in the OSL annex of
  endangered local varieties, which spec 040 rules out.
- **Репички:** „Едри червени“ and „Любими“ (OSL list B, 2026).
- **Маруля:** „Черна гюмюрджинска“, from OSL list Б under „Салата“ (p. 48), marked `b, c`, where
  the legend reads „c – тип маруля – Cos type“. Български фермер „Последни срокове за салатата“
  (2016) names a winter variety „Черна маруля“, but does not say it is the same cultivar, so that
  name is not used.
- **Зелен лук:** none. The OSL onion cultivars are bred for bulbs; no source names one for green
  onions.
- **Киселец:** none. No sorrel cultivar is in the OSL; Български фермер mentions only
  unnamed „селекционирани сортове“.

### Seasons (editorial)

No official monthly calendar exists (`docs/content-review/README.md`). The months follow the
growing sources below and stay conservative:

- **Киселец:** March and June–September `available`, April–May `peak` (Български фермер: leaves
  can be picked „почти през цялото лято и есен“; the spring leaves are the main crop).
- **Зелен лук:** March–April `peak`, May `available` (onion sets planted in autumn give green
  onions „рано през пролетта“; no source supports February).
- **Чесън:** April–May `available` (green garlic from winter garlic), June–July `peak` (harvest),
  August `available`, September–February `storage`.
- **Маруля:** March, June and October–November `available`, April–May `peak` (sown in January
  for spring and planted out in March; autumn lettuce is planted out around mid-September, so its
  harvest starts in October; „Лятото не е подходящ период“).
- **Репички:** March, June and September–October `available`, April–May `peak` (sown in March
  and again from August).

### Growing guides (spec 035)

Each item is stated by the cited source; titles are copied as published.

- **Киселец:** sow 3, 4; plant 10 (division of a clump in autumn).
  - Български фермер – „Сега е време да засеете киселец“ (08.10.2022), „Засейте киселец и
    лапад“ (20.03.2020).
- **Зелен лук:** plant 3, 10 (onion sets).
  - Български фермер – „На лук и чесън за зелено“ (10.10.2011), „Засадете арпаджик, ако искате
    големи глави лук“ (20.03.2014), „Как да си отгледате лук от арпаджик“ (26.02.2022).
- **Чесън:** plant 9, 10; note: September to early November in the warmest areas.
  - Български фермер – „Засаждане на зимен чесън“ (20.10.2025), „Отглеждане на зимен чесън“
    (21.10.2020), „Зимен и летен чесън“ (12.09.2018).
- **Маруля:** sow 1, 9; transplant 3, 9, 10; note: spring seedlings are sown in mid-January in
  a cold frame or polytunnel.
  - Български фермер – „Изискванията за ранни салати и марули“ (23.01.2022), „Засаждане на
    салати и марули“ (18.03.2018), „Разсаждат се салати и марули“ (19.04.2013), „Последни
    срокове за салатата“ (07.10.2016).
- **Репички:** sow 3, 8.
  - Български фермер – „Отглеждане на репички - 8 тайни за успешна реколта“ (10.03.2025),
    „Засяване на репички“ (20.03.2017), „Засейте репички, стават много бързо“ (01.09.2011).

The existing test that every produce has a growing guide (spec 018 AC6) stays unchanged: all five
have one.

### Wild plants

Sorrel also grows wild in meadows (bg.wikipedia „Киселец“: „растящо в изобилие по поляните“;
Български фермер: „диворастящи форми“). The summary says so factually; no foraging advice and no
safety or health claim.

### Editorial text

„Ти“ voice, no health claims, never „богат на“. Summaries are 70–160 characters. Every entry has
`updatedAt: 2026-11-13`.

### Photos (spec 015)

Unsplash photos, downloaded through the Unsplash download endpoint, cropped to 4:3, 1600 × 1200
px JPEG at quality 80 without metadata, stored as `src/assets/produce/<slug>.jpg`. Most are
centre-cropped. The romaine photo is described by its author as „heads of romaine lettuce, their
elongated leaves a bright green“; it is cropped to the romaine heads, leaving out the price signs.
No Unsplash photo is described as sorrel; the sorrel photo shows arrow-shaped leaves with reddish
stems, and its `alt` names sorrel.

| Slug        | Author              | Unsplash photo                          |
| ----------- | ------------------- | --------------------------------------- |
| `kiselets`  | malwina nogaj       | https://unsplash.com/photos/-X-34YMStbc |
| `zelen-luk` | Christopher Previte | https://unsplash.com/photos/7CcXR5wIhEY |
| `chesan`    | team voyas          | https://unsplash.com/photos/vIiye0QDryo |
| `marulya`   | Zoshua Colah        | https://unsplash.com/photos/sdDA-pMzW10 |
| `repichki`  | philippe collard    | https://unsplash.com/photos/EjICVrzSobA |

## 6. Accessibility requirements

- WCAG 1.1.1: every photo has a Bulgarian `alt` of 10–120 characters that describes the photo.
- WCAG 3.1.2: Latin names render with `lang="la"` (existing component).
- The empty regions state is a sentence after the heading, with no empty list or map (spec 042).
- No new components; the existing e2e axe checks cover every produce page.

## 7. SEO requirements

- Each produce page gets its title from the name and its meta description from the summary
  (70–160 characters).
- Internal links: produce ↔ group (new group pages for `lapadovi` and `slozhnotsvetni`), produce ↔
  month and produce ↔ nutrient pages are generated from the data.
- No region links (no regions).

## 8. Acceptance criteria

1. **AC1:** Given the produce collection, then it contains `kiselets`, `zelen-luk`, `chesan`,
   `marulya` and `repichki`, each valid under the content schema, and no nettle entry.
2. **AC2:** Given each new produce, then its nutrition cites the USDA SR Legacy record in section
   3 by its FDC item URL (the existing spec 032 test then checks the values).
3. **AC3:** Given each new produce, then `regions` is empty.
4. **AC4:** Given each new produce, then its varieties are exactly those in section 5.
5. **AC5:** Given each new produce, then it has a growing guide whose sources are all on
   bgfermer.bg, agrozona.bg, bg.wikipedia.org or an official institute, never gradinata.bg.
6. **AC6:** Given each new produce, then it has a photo whose credit is on unsplash.com, and
   `traditionalUses` is empty and there is no `organic` block.
7. **AC7:** Given each new produce, then its summary, preparation methods and tips, variety
   notes, FAQ, growing tips and planting note, and photo `alt` do not contain „богат“, „полезен“,
   „лекува“ or „действие“.
8. **AC8:** Given sorrel and lettuce, then they belong to the new groups `lapadovi`
   (_Polygonaceae_) and `slozhnotsvetni` (_Asteraceae_).
9. **AC9:** Given the content checklist, then it has a row for each new produce, and the content
   guide's „Seed data status“ names nettle as left out.
10. **AC10:** Given the catalogue page, then it links to every group page, including the two new
    ones (covered by `main`'s spec 023 AC5 test, which reads the group files).

## 9. Test plan

| AC   | Test type | Test file                                      |
| ---- | --------- | ---------------------------------------------- |
| AC1  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC2  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC3  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC4  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC5  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC6  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC7  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC8  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC9  | unit      | `tests/unit/content/spring-greens-043.test.ts` |
| AC10 | e2e       | `tests/e2e/site-shell.spec.ts` (spec 023 AC5)  |

## 10. Third-party documentation consulted

No new third-party API. Content sources:

| Source                                                                                          | Used for                             |
| ----------------------------------------------------------------------------------------------- | ------------------------------------ |
| USDA FoodData Central, SR Legacy CSV (April 2018), FDC 170076, 170005, 169230, 169247, 169276   | Nutrition                            |
| https://fdc.nal.usda.gov/food-details/170076/nutrients (scientific name _Rumex spp._)           | Sorrel record                        |
| https://fdc.nal.usda.gov/food-details/169819/nutrients                                          | Nettle (blanched only, not used)     |
| EFSA food composition data, https://zenodo.org/records/438313                                   | Nettle (no macronutrients, not used) |
| https://www.mzh.government.bg/media/filer_public/2026/03/31/ra468_publicationvegetables2025.pdf | Regions (national only)              |
| https://www.mzh.government.bg/media/filer_public/2023/04/11/ra423_publicationvegetables2022.pdf | Regions (national only)              |
| https://iasas.government.bg/att/OSL%201%20-%202026%2013.pdf                                     | Varieties                            |
| https://www.bgfermer.bg/Article/5798167                                                         | Lettuce growing guide                |
| bgfermer.bg articles listed in section 5                                                        | Growing guides, seasons              |
| bg.wikipedia.org „Лападови“, „Сложноцветни“, „Киселец“, „Маруля“                                | Group names, wild sorrel             |

## 11. QA review

The QA review asked for these changes; `tests/unit/content/spring-greens-043.test.ts` has a
regression test („QA 043“) for each data finding:

- „Зимен 14“ removed (endangered local variety, spec 040).
- The romaine photo replaced with one whose description names romaine.
- The romaine variety named by its official name „Черна гюмюрджинска“ (OSL Cos type).
- Autumn lettuce starts in October; green onions start in March.
- Potassium removed from green onions and romaine (they already list three nutrients at ≥ 15 %).
- Garlic summary: bulbs keep „през зимата“; the sorrel `alt` names sorrel.
- AC7 also checks preparation methods, variety notes, the planting note and the photo `alt`.
