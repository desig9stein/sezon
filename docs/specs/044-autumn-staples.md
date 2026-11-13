# 044. Autumn and winter staples

- **Status:** Approved
- **Bounded context(s):** catalog (content data), i18n (methodology and about texts)
- **Related:** issue #41, spec 002 (content model), spec 015 (photos), spec 018 (growing guide),
  spec 032 (USDA extract), spec 033 (region sources), spec 035 (growing sources), spec 039
  (traditional uses), spec 042 (produce without regions), `docs/CONTENT-GUIDE.md`,
  `docs/content-review/README.md`

## 1. Goal

Issue #41 asks for six autumn and winter staples: картофи, лук (кромид), броколи, карфиол, шипка
and кестени. Every fact must come from a source, as the other entries do:

- nutrition from USDA FoodData Central SR Legacy (April 2018), raw;
- regions from the МЗХ „Агростатистика“ surveys, or `regions: []` when no official source names a
  province (spec 042);
- varieties from the ИАСАС official variety list 2026 or from Български фермер / Agrozona;
- growing months and tips from Български фермер, Agrozona or the Bulgarian Wikipedia (spec 035).

This step adds five of them. Rosehip has no usable nutrition record (section 5) and is left out.

## 2. User stories

- As a reader in autumn and winter, I want to find potatoes, onions, broccoli, cauliflower and
  chestnuts, with when they are in season, how long they keep and where they grow.
- As a home gardener, I want planting months and tips for these crops from Bulgarian sources.
- As the owner, I want each region, variety and growing tip to come from a source I can check.

## 3. Scope

### In scope

- **Data:** five produce entries, each with a photo, varieties, season, regions, USDA nutrition,
  preparation, how to choose, storage, FAQ and a growing guide:
  - `kartofi` (Картофи, _Solanum tuberosum_, vegetable, group `kartofovi`);
  - `luk` (Лук, _Allium cepa_, vegetable, group `amarilisovi`), the dry bulb onion („кромид“);
  - `brokoli` (Броколи, _Brassica oleracea_ var. _italica_, vegetable, group `krastotsvetni`);
  - `karfiol` (Карфиол, _Brassica oleracea_ var. _botrytis_, vegetable, group `krastotsvetni`);
  - `kesteni` (Кестени, _Castanea sativa_, nut, group `bukovi`).
- **Groups:**
  - `kartofovi` (Картофови, Solanaceae), the Bulgarian Wikipedia name, with the same file as on
    the branch of spec 041 so that the two branches merge without a conflict;
  - `bukovi` (Букови, Fagaceae), the family Български фермер names for the sweet chestnut
    („принадлежащо към семейство Букови“), with a short editorial description.
- **USDA extract:** regenerated with `pnpm content:usda` for the five new FDC ids.
- **Texts:** the methodology („Области“) and about („Източници и прозрачност“) strings name
  potatoes and onions among the products whose regions follow МЗХ statistics.
- **Checklist and content guide:** one row per new produce in `docs/content-review/README.md` and
  a line in the content guide's „Seed data status“.
- **E2E:** the catalogue test counts the group links from `src/data/groups` instead of the fixed
  number 7.

### Out of scope

- **Шипка:** no raw SR Legacy record and no complete EFSA record (section 5).
- Organic blocks: omitted (no source checked).
- Traditional uses: `traditionalUses: []`.
- Updating cabbage to the 2025 bulletin.

## 4. Domain model

No change. The new groups are data only.

## 5. Behaviour and edge cases

### Nutrition (USDA SR Legacy, April 2018)

| Produce | FDC id | SR Legacy description                    |
| ------- | ------ | ---------------------------------------- |
| картофи | 170026 | Potatoes, flesh and skin, raw            |
| лук     | 170000 | Onions, raw                              |
| броколи | 170379 | Broccoli, raw                            |
| карфиол | 169986 | Cauliflower, raw                         |
| кестени | 170574 | Nuts, chestnuts, european, raw, unpeeled |

- **Chestnuts:** SR Legacy has „Nuts, chestnuts, european, raw, peeled“ (170575), but that record
  has no fibre value, and the content schema requires `fiberG`. A value cannot be invented, so the
  complete raw record of the same species, „raw, unpeeled“ (170574), is cited. Neither record gives
  sugars, so `sugarsG` is omitted.
- Micronutrients are ones the site maps and the record gives. Texts say „високо съдържание“ only
  where the value is at least 30 % of the reference intake (broccoli: vitamin C 89.2 mg, vitamin K
  101.6 µg; cauliflower: vitamin C 48.2 mg; chestnuts: vitamin C 43 mg). No text says „богат на“.

### Rosehip is left out

- SR Legacy has no raw rosehip record. Its only rosehip record, „Rose Hips, wild (Northern Plains
  Indians)“ (168998), does not say it is raw and describes North American wild roses, not the
  _Rosa canina_ sold in Bulgaria.
- The EFSA food composition database (2013 release, item A01FR „Rose hips and similar“) gives
  only minerals and some vitamins: no energy, macronutrients or vitamin C. The schema requires
  energy and macronutrients.
- Regions would be available: the МЗХ bulletin № 469 „Производство на плодове в България – реколта
  2025“ (Table 2) counts cultivated rosehip by NUTS2 region, with the South Central region first
  (323 of 950 ha harvested). This is recorded for a later step.

### Regions

- **Potatoes and onions:** МЗХ bulletin № 468, „Производство на зеленчуци в България – реколта
  2025“, Table 3 (NUTS2, harvested open-field area). The bulletin's methodology lists the
  provinces of each NUTS2 region. The rule follows cabbage (spec 033) and spec 041: name the
  provinces of the leading region and quote the regional figure and year, without ranking the
  provinces. With no precedent for a subset, all provinces of the region are named.

  | Produce | Leading NUTS2 region (open field, 2025)             | Provinces named                                               |
  | ------- | --------------------------------------------------- | ------------------------------------------------------------- |
  | картофи | Югозападен: 4 056 of 6 796 ха                       | Благоевград, Кюстендил, Перник, София (столица), София област |
  | лук     | Югоизточен: 1 425 of 2 965 ха („Лук кромид – зрял“) | Бургас, Сливен, Ямбол, Стара Загора                           |

- **Broccoli and cauliflower:** the bulletin counts them only nationally (Table 2: 45 ha and
  65 ha), so `regions: []`.
- **Chestnuts:** neither the vegetable nor the fruit bulletin (№ 469, 2025; № 448, orchard
  structure 2023) counts chestnuts, so `regions: []`. Natural chestnut forests (Беласица, Славянка,
  Огражден, Пирин, Берковица) are forest, not farm production, and are not named as regions.

### Varieties

- **Лук:** Асеновградска 5, Лясковски 58, Испанска 482, from the ИАСАС official variety list 2026
  (vegetables, list B, „Лук – Onion – Allium cepa L.“).
- **Броколи:** ИЗК Искра, from the same list („Броколи – Broccoli or Calabrese“), and Agrozona,
  „Първият български сорт броколи вече е на пазара“.
- **Картофи:** none. Potatoes are in list A, and the 2026 list has no potato section; no Bulgarian
  article checked lists varieties that can be verified.
- **Карфиол:** none. The 2026 list has three foreign varieties with Latin names only (Big Boy,
  Bormio, Campiglio); none of them is described in a Bulgarian source the reader could follow.
- **Кестени:** Вольотика and Морони, the Greek varieties in a chestnut orchard near Сандански
  described by Български фермер („Професионално отглеждане на кестени има вече и у нас“), the
  second as the pollinator.

### Seasons (editorial, conservative)

There is no official monthly calendar (`docs/content-review/README.md`). Months follow the cited
Bulgarian sources on planting and harvest:

| Produce | Available | Peak     | Storage         | Basis                                                                                                                                                                   |
| ------- | --------- | -------- | --------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| картофи | 6, 7, 11  | 8, 9, 10 | 12, 1, 2, 3     | early potatoes planted Feb–Mar; late ones dug in autumn („Вадете късните картофи…“); stored in a cool cellar until spring („Зеленчуци, които ще издържат до пролетта…“) |
| лук     | 7, 10     | 8, 9     | 11, 12, 1, 2, 3 | harvest end of July – August („Как да си отгледате лук от арпаджик“); keeps until the next spring (same storage article)                                                |
| броколи | 9, 11     | 10       | –               | late autumn crop, transplanted at the end of July                                                                                                                       |
| карфиол | 9         | 10, 11   | –               | late crop, heads form in autumn                                                                                                                                         |
| кестени | 9, 12     | 10, 11   | –               | season mid-September to end of November („Кестени – търсена стока…“)                                                                                                    |

### Growing guides

Every month and tip is stated by its source (spec 035). Tips are in the „ти“ voice.

- **Картофи:** plant 2–7 (early: end Feb – mid March; mid and late: mid April – mid May; second
  crop: mid June – mid July). Sources: bgfermer 22357538, 6143831, 9700439.
- **Лук:** sow 3 (seed for sets, „Засява се арпаджик“), plant 2–3 (sets, second half of February –
  mid March). Sources: bgfermer 10970651, 3742630, 13899207.
- **Броколи:** sow 6 (first half of June), transplant 7 (end of July, 35–40 days later). Sources:
  bgfermer 968291, 8831900.
- **Карфиол:** sow 5–7 (end of May – end of July), transplant 7–9 (about a month later, up to the
  beginning of September). Sources: bgfermer 11727731, 14746455, 15549195.
- **Кестени:** plant 9–11 (autumn planting: end of September – mid November). Sources: bgfermer
  12974658, 7891605, 13294825, 6826227.

`tests/unit/content/seed-growing.test.ts` requires a guide for every produce; all five have one, so
the test is not changed.

### Editorial texts

- Summaries are 70–160 characters, in the „ти“ voice where they address the reader, with no health
  claims and no „богат на“.
- Chestnuts: one FAQ says that the edible chestnut and the horse chestnut are different trees and
  that horse chestnuts are not eaten (Български фермер, „Лечебни ползи от нестандартни плодове“).
- `updatedAt: 2026-11-13`.

### Photos

Unsplash, downloaded through the download endpoint, cropped to 4:3, 1600 × 1200 JPEG at quality 80
without metadata (spec 015):

| Produce | Unsplash photo | Author                       |
| ------- | -------------- | ---------------------------- |
| картофи | `nyAs_YWU3_I`  | Daniel Dan (@outsideclick)   |
| лук     | `pmS8XSz5NU0`  | Lars Blankers (@lmablankers) |
| броколи | `fccAsIqdpeM`  | Annie Spratt (@anniespratt)  |
| карфиол | `PT-GXFtQj-s`  | Louis Hansel (@louishansel)  |
| кестени | `-rkmg-y5ECc`  | Diego Romeo (@gopitri_prem)  |

The chestnut photo shows a densely spined burr of the sweet chestnut, not a horse chestnut.

## 6. Accessibility requirements

- Each photo has a Bulgarian `alt` of 10–120 characters that describes the photo (WCAG 1.1.1).
- Produce pages keep the heading order of spec 025; products without regions show the empty-state
  sentence of spec 042, with no empty list or map (1.3.1).
- Latin names render with `lang="la"` through the existing components (3.1.2).
- The new group pages use the existing group template.

## 7. SEO requirements

- Each produce page gets a unique title (the name) and a 70–160 character summary as the meta
  description.
- New group pages `/grupi/kartofovi` and `/grupi/bukovi` link their produce; produce pages link
  their group and regions (internal links).
- Each nutrition table cites its FDC record; each growing guide cites its sources (YMYL).

## 8. Acceptance criteria

1. **AC1:** Given the five produce files, when parsed with the content schema, then each is valid,
   has the expected kind and group, and the groups `kartofovi` (Solanaceae) and `bukovi`
   (Fagaceae, „Букови“) exist.
2. **AC2:** Given each new produce, then its nutrition cites the expected SR Legacy record by FDC
   item URL and description.
3. **AC3:** Given potatoes and onions, then their regions are the provinces of the leading NUTS2
   region of bulletin № 468, each with an МЗХ source of „реколта 2025“ and a note that names
   „открити площи“ and 2025.
4. **AC4:** Given broccoli, cauliflower and chestnuts, then `regions` is empty.
5. **AC5:** Given each new produce, then it has an Unsplash photo with a credit and an existing file.
6. **AC6:** Given each new produce, then it has a growing guide whose sources are only bgfermer.bg,
   agrozona.bg or bg.wikipedia.org, and the file does not cite gradinata.bg.
7. **AC7:** Given each new produce, then it has no traditional uses, no „богат“ and
   `updatedAt` 2026-11-13.
8. **AC8:** Given each new produce, then its varieties are exactly the verified list of section 5.
9. **AC9:** Given potatoes and onions, then their season has `storage` months in winter.
10. **AC10:** Given the checklist and the content guide, then the checklist has a row per new
    produce with its FDC id, and the content guide's „Seed data status“ names spec 044 and that
    rosehip is left out.
11. **AC11:** Given the methodology and about texts, then they name potatoes and onions among the
    МЗХ-sourced products.
12. **AC12:** Given the catalogue page, then it links exactly one `/grupi/<id>` per file in
    `src/data/groups`.

## 9. Test plan

| AC   | Test type | Test file                                                                          |
| ---- | --------- | ---------------------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC2  | unit      | `tests/unit/content/autumn-staples-044.test.ts` (values: `usda-nutrition.test.ts`) |
| AC3  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC4  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC5  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC6  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC7  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC8  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC9  | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC10 | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC11 | unit      | `tests/unit/content/autumn-staples-044.test.ts`                                    |
| AC12 | e2e       | `tests/e2e/site-shell.spec.ts`                                                     |

## 10. Third-party documentation consulted

No new third-party API is used. Content sources:

| Source                                                                                 | Version / date | URL                                                                                                                      | Used for                                                                                           |
| -------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| USDA FoodData Central, SR Legacy                                                       | April 2018 CSV | https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip                                    | Nutrition (FDC 170026, 170000, 170379, 169986, 170574); rosehip 168998 and chestnut 170575 checked |
| EFSA food composition database                                                         | 2013 release   | https://www.efsa.europa.eu/en/data-report/food-composition                                                               | Rosehip A01FR checked: no energy or macronutrients                                                 |
| МЗХ, бюлетин № 468 „Производство на зеленчуци в България – реколта 2025“               | March 2026     | https://www.mzh.government.bg/media/filer_public/2026/03/31/ra468_publicationvegetables2025.pdf                          | Tables 2–3, NUTS2 membership                                                                       |
| МЗХ, бюлетин № 469 „Производство на плодове в България – реколта 2025“                 | March 2026     | https://www.mzh.government.bg/media/filer_public/2026/03/31/ra469_publicationfruits2025_bg.pdf                           | No chestnuts; cultivated rosehip by NUTS2                                                          |
| МЗХ, бюлетин № 448 (orchard structure 2023)                                            | December 2024  | https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448_publicationstructureorchard2023-preliminaryresults.pdf | No chestnuts or rosehip                                                                            |
| ИАСАС, Официална сортова листа 2026 (земеделски и зеленчукови видове)                  | 2026           | https://iasas.government.bg/                                                                                             | Onion and broccoli varieties; no potato section                                                    |
| ИАСАС, Официална сортова листа 2026 (тютюн, лоза, овощни…)                             | 2026           | https://iasas.government.bg/                                                                                             | No chestnut or rosehip varieties                                                                   |
| Agrozona.bg – Първият български сорт броколи вече е на пазара                          |                | https://agrozona.bg/parviyat-balgarski-sort-brokoli-veche-e-na-pazara/                                                   | ИЗК Искра                                                                                          |
| Български фермер – Ранните картофи се засаждат от края на февруари до средата на март  | 2026-03-03     | https://www.bgfermer.bg/Article/22357538                                                                                 | Potato planting, spacing, care                                                                     |
| Български фермер – Картофите се засаждат в добре затоплена почва                       | 2017-03-30     | https://www.bgfermer.bg/Article/6143831                                                                                  | Potato planting, rotation                                                                          |
| Български фермер – Подходящо време за засаждане на картофи                             | 2021-04-13     | https://www.bgfermer.bg/Article/9700439                                                                                  | Soil temperature                                                                                   |
| Български фермер – Вадете късните картофи, които ще се съхраняват                      | 2013-10-07     | https://www.bgfermer.bg/Article/2343591                                                                                  | Late harvest, storage                                                                              |
| Български фермер – Как картофите се съхраняват дълго                                   | 2018-09-08     | https://www.bgfermer.bg/Article/7043517                                                                                  | Storage                                                                                            |
| Български фермер – Полезно: Зеленчуци, които ще издържат до пролетта дори в апартамент | 2025-12-16     | https://www.bgfermer.bg/Article/21920085                                                                                 | Onion and potato storage until spring                                                              |
| Български фермер – Как да си отгледате лук от арпаджик                                 | 2022-02-26     | https://www.bgfermer.bg/Article/10970651                                                                                 | Onion planting, care, harvest                                                                      |
| Български фермер – Засадете арпаджик, ако искате големи глави лук                      | 2014-03-20     | https://www.bgfermer.bg/Article/3742630                                                                                  | Set size                                                                                           |
| Български фермер – Засява се арпаджик                                                  | 2023-03-03     | https://www.bgfermer.bg/Article/13899207                                                                                 | Sowing for sets                                                                                    |
| Български фермер – Как се отглеждат броколи                                            | 2011-07-18     | https://www.bgfermer.bg/Article/968291                                                                                   | Broccoli months, spacing, temperature                                                              |
| Български фермер – Броколито е късен зеленчук, не е трудно за отглеждане               | 2020-07-21     | https://www.bgfermer.bg/Article/8831900                                                                                  | Broccoli watering                                                                                  |
| Български фермер – Карфиолът се отглежда по-лесно чрез разсад                          | 2022-06-04     | https://www.bgfermer.bg/Article/11727731                                                                                 | Cauliflower sowing                                                                                 |
| Български фермер – Карфиолът е от най-капризните видове сред зелевите                  | 2023-06-23     | https://www.bgfermer.bg/Article/14746455                                                                                 | Cauliflower sowing, spacing, care                                                                  |
| Български фермер – Растенията от сем. Зелеви властват в есенните лехи                  | 2023-09-20     | https://www.bgfermer.bg/Article/15549195                                                                                 | Cauliflower transplanting                                                                          |
| Български фермер – Есенното засаждане на дръвчета - за и против                        | 2022-11-06     | https://www.bgfermer.bg/Article/12974658                                                                                 | Chestnut autumn planting window                                                                    |
| Български фермер – Лечебни ползи от нестандартни плодове                               | 2019-11-23     | https://www.bgfermer.bg/Article/7891605                                                                                  | Chestnut soil, growth; horse chestnut is not eaten                                                 |
| Български фермер – Професионално отглеждане на кестени има вече и у нас                | 2022-12-14     | https://www.bgfermer.bg/Article/13294825                                                                                 | Chestnut varieties, bearing age, ink disease                                                       |
| Български фермер – Болести и неприятели по кестена                                     | 2018-04-23     | https://www.bgfermer.bg/Article/6826227                                                                                  | Chestnut weevil                                                                                    |
| Български фермер – Кестени – търсена стока и печеливша ниша                            | 2023-11-27     | https://www.bgfermer.bg/Article/16335243                                                                                 | Season, family Букови                                                                              |
| Unsplash photos (five, section 5)                                                      | 2026-11-13     | https://unsplash.com/                                                                                                    | Photos                                                                                             |
