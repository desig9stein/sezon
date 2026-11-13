# 041. Summer vegetables

- **Status:** Approved
- **Bounded context(s):** catalog (content data), i18n (methodology and about texts)
- **Related:** issue #39, spec 002 (content model), spec 015 (photos), spec 018 (growing guide),
  spec 032 (USDA extract), spec 033 (region sources), spec 035 (growing sources), spec 042
  (produce without regions), `docs/CONTENT-GUIDE.md`, `docs/content-review/README.md`

## 1. Goal

The catalogue has no summer vegetables yet. Issue #39 asks for seven: домати, краставици, пипер,
патладжан, тиквички, зелен фасул and бамя. Every fact must come from a source, as the other
entries do:

- nutrition from USDA FoodData Central SR Legacy;
- regions from the МЗХ „Агростатистика“ vegetable survey;
- varieties from the ИАСАС official variety list;
- growing months and tips from Български фермер or Agrozona.

The МЗХ survey gives regional figures only for tomatoes, peppers, cucumbers (with gherkins) and
aubergines. Courgettes, green beans and okra are counted only nationally (okra under „Други
зеленчуци (бамя и др.)“), and no other official source names provinces for them. Naming a province
for them would be invented, so they list no region (`regions: []`, allowed by spec 042).

## 2. User stories

- As a reader in summer, I want to find tomatoes, cucumbers, peppers, aubergines, courgettes,
  green beans and okra, with when they are in season and, where official data exists, where they
  grow.
- As a home gardener, I want sowing and planting months and tips for these crops from Bulgarian
  sources.
- As the owner, I want each region, variety and growing tip to come from a source I can check.

## 3. Scope

### In scope

- **Data:** seven produce entries, each with a photo, varieties, season, USDA nutrition,
  preparation, how to choose, storage, FAQ and a growing guide:
  - `domati` (Домати, _Solanum lycopersicum_);
  - `krastavitsi` (Краставици, _Cucumis sativus_);
  - `piper` (Пипер, _Capsicum annuum_);
  - `patladzhan` (Патладжан, _Solanum melongena_);
  - `tikvichki` (Тиквички, _Cucurbita pepo_);
  - `zelen-fasul` (Зелен фасул, _Phaseolus vulgaris_);
  - `bamya` (Бамя, _Abelmoschus esculentus_).

  The first four have regions with МЗХ sources; the last three have `regions: []`.

- **Groups:** new `kartofovi` (Картофови, Solanaceae), `bobovi` (Бобови, Fabaceae) and `slezovi`
  (Слезови, Malvaceae), the family names used by the Bulgarian Wikipedia (the redirects from the
  Latin names; the „Слезови“ article names okra). Cucumbers and courgettes use the existing
  `tikvovi`.
- **USDA extract:** regenerated with `pnpm content:usda` for the seven new FDC ids.
- **Texts:** the methodology („Области“) and about („Източници и прозрачност“) strings name the
  new products among those whose regions follow МЗХ statistics.
- **Checklist:** one row per new produce in `docs/content-review/README.md`.

### Out of scope

- Organic blocks: no source checked for these crops.
- Traditional uses: `traditionalUses: []`.
- Updating cabbage to the 2025 bulletin.

## 4. Domain model

No change. The new groups are data only.

## 5. Behaviour and edge cases

### Nutrition

| Produce     | FDC id | SR Legacy description                        |
| ----------- | ------ | -------------------------------------------- |
| домати      | 170457 | Tomatoes, red, ripe, raw, year round average |
| краставици  | 168409 | Cucumber, with peel, raw                     |
| пипер       | 170427 | Peppers, sweet, green, raw                   |
| патладжан   | 169228 | Eggplant, raw                                |
| тиквички    | 169291 | Squash, summer, zucchini, includes skin, raw |
| зелен фасул | 169961 | Beans, snap, green, raw                      |
| бамя        | 169260 | Okra, raw                                    |

Green sweet pepper is cited because most of the summer pepper season is green pepper; the
photo shows green peppers. Micronutrients are the ones the site maps and the USDA record gives.
The page labels „Източник на“ and „С високо съдържание на“ follow the existing thresholds; texts
say „високо съдържание“ only where the value is at least 30 % of the reference intake (green
pepper, vitamin C: 80.4 mg of 80 mg; green beans, vitamin K: 43 µg of 75 µg; okra, vitamin K:
31.3 µg of 75 µg).

### Regions

The source is „Производство на зеленчуци в България – реколта 2025“, bulletin № 468 (March 2026),
Table 3 (NUTS2). It is newer than the 2022 bulletin cabbage cites. All figures are **harvested
open-field areas**; greenhouse areas are not broken down by region. The rule follows cabbage
(spec 033): name provinces of the leading NUTS2 region and quote the regional figure, because the
survey does not rank provinces.

| Produce    | Leading NUTS2 region (open field, 2025)   | Provinces named                     |
| ---------- | ----------------------------------------- | ----------------------------------- |
| домати     | Южен централен: 1 469 of 2 312 ха         | Пловдив, Пазарджик                  |
| пипер      | Южен централен: 1 529 of 2 412 ха         | Пловдив, Пазарджик                  |
| патладжан  | Южен централен: 237 of 323 ха             | Пловдив, Пазарджик                  |
| краставици | Югоизточен: 360 of 755 ха (with gherkins) | Бургас, Сливен, Ямбол, Стара Загора |

- For the South Central region, Пловдив and Пазарджик are named, as for cabbage. Кърджали, Смолян
  and Хасково are in the same region, but nothing ranks them, so the choice follows the existing
  precedent instead of listing all five.
- For cucumbers no precedent exists, so all four provinces of the South-East region are named.
- Cucumbers are mostly a greenhouse crop: 40 360 of 52 275 t in 2025 came from greenhouses
  (Table 2). The region notes say „открити площи“; the FAQ says that spring cucumbers come mostly
  from greenhouses.
- Each note stands alone (no „Също“), quotes the figures and year and cites the bulletin title.

### Produce without regions

For courgettes (128 ha open field, national only), green beans (174 ha, national only) and okra
(in „Други зеленчуци (бамя и др.)“, 404 ha), the 2022 and 2025 bulletins have no regional table,
Eurostat `apro_cpshr` gives only the aggregate „Fresh vegetables“ for Bulgarian NUTS2 regions, and
Български фермер says only that okra grows „предимно в южните райони на страната“. They have
`regions: []`, and the page shows the spec 042 sentence instead of a map. The okra FAQ quotes the
„южните райони“ statement and says that no official data by province exists.

### Varieties

Cultivars come from the ИАСАС „Официална сортова листа … 2026 г.“ (List B, vegetable species),
and for okra also from Български фермер:

- домати: Розово сърце, Алено сърце (maintainer: ИЗК „Марица“), Миляна VF (ИЗК „Марица“ and
  another maintainer);
- пипер: Куртовска капия, Ивайловска капия, Сиврия 600, Стряма;
- краставици: Гергана, Тереза;
- патладжан: Български 12 (the only Bulgarian-named aubergine on the list);
- тиквички: Бистра (ИЗК „Марица“), Изобилна;
- зелен фасул: Еврос (ИЗК „Марица“), Никос (also named by Български фермер as an early dwarf
  variety);
- бамя: Лясковска (the only okra on the list), Пловдивска and Тополовградска, which Български
  фермер names with Лясковска as the most widespread Bulgarian varieties.

No variety note is added, because none of the facts a note would hold is sourced.

### Season (editorial)

No official monthly calendar exists (`docs/content-review/README.md`). The levels are conservative
and based on the cited planting times: the earliest open-field planting is late April to May
(tomatoes, peppers), early June without cover (cucumbers) or after mid-May (aubergines), so the
open-field peak starts in July. МЗХ reports greenhouse tomato and cucumber output from January to
May („Ситуация на пазара на плодове и зеленчуци в България – юни 2024“), and greenhouses give a
large share of both crops in bulletin № 468, Table 2: 46 022 of 105 235 t of tomatoes (44 %) and
40 360 of 52 275 t of cucumbers (77 %). Both are therefore marked `available` in April and May.
Open-field cucumbers are `available` in June and peak in July and August.

- **Courgettes:** with early sowing under cover the first harvests start at the end of April and
  last until the end of September (Български фермер), so May is `available` and June–August peak.
- **Green beans:** the spring crop is picked in June; sowing ends by mid-May, and the second crop,
  sown until about 20 July, is ready in under two months. June–July peak, August–September
  `available`.
- **Okra:** sown in the second half of May, it bears about two months later until the first autumn
  frosts. July `available`, August–September peak, October `available`.

| Produce     | available | peak    | available |
| ----------- | --------- | ------- | --------- |
| домати      | 4, 5, 6   | 7, 8, 9 | 10        |
| краставици  | 4, 5, 6   | 7, 8    | 9         |
| пипер       | 7         | 8, 9    | 10        |
| патладжан   | 7         | 8, 9    | 10        |
| тиквички    | 5         | 6, 7, 8 | 9         |
| зелен фасул | –         | 6, 7    | 8, 9      |
| бамя        | 7         | 8, 9    | 10        |

### Growing guides

Each month and tip below is stated by the cited page (fetched 2026-11-13; quotes in section 10).

- **Домати:** sow 2, 3; transplant 4, 5.
- **Пипер:** sow 1, 2, 3 (the calendar: early field pepper from the last ten days of January in
  the south); transplant 5.
- **Патладжан:** sow 1, 2, 4 (the calendar: early aubergine from the end of January, early field
  aubergine around mid-February; Agrozona: late crop in April); transplant 5, 6. Agrozona says
  early aubergines go outside in the second half of April; the site keeps the conservative date of
  Български фермер (after the second half of May, into June) and leaves April out.
- **Краставици:** sow 3, 4, 6, 7; transplant 5, 6.
- **Тиквички:** sow 3 (under cover), 4, 5, 6; no transplant month (no source gives one for
  courgette seedlings).
- **Зелен фасул:** sow 4, 5 (spring) and 7 (second crop, until about 20 July); June is left out
  because no source names it.
- **Бамя:** sow 5 (second half of May).

### Printed calendar

With the summer fruits of spec 040 and these seven vegetables, the calendar has 28 rows and no
longer printed on one A4 landscape sheet (spec 014, AC7). The print styles of the calendar table
now use a tighter line height (`--print-table-line-height: 1.15` in `src/styles/base.css`); font
size and padding are unchanged.

### Editorial texts

Summary, preparation, how to choose, storage and FAQ use the „ти“ voice, make no health or effect
claims, never use „богат на“ and state only common knowledge or the cited figures.

## 6. Accessibility requirements

No markup change. The new pages use the existing produce, group, region and month templates,
which the e2e and axe suites already cover. Each photo has a Bulgarian `alt` of 10–120 characters
that describes the photo (WCAG 1.1.1).

## 7. SEO requirements

- Each produce `summary` (70–160 characters) is its meta description; titles follow the existing
  pattern.
- New pages (seven produce, the `kartofovi`, `bobovi` and `slezovi` groups, and the region pages
  of Бургас, Сливен and Ямбол if they had no produce) join the sitemap automatically.
- Internal links: produce ↔ group ↔ region ↔ month, by the existing templates.

## 8. Acceptance criteria

1. **AC1:** Given the produce data, then the seven produce of section 3 exist, pass the produce
   schema, are vegetables and belong to their groups (`kartofovi` for domati, piper and
   patladzhan; `tikvovi` for krastavitsi and tikvichki; `bobovi` for zelen-fasul; `slezovi` for
   bamya); the groups `kartofovi`, `bobovi` and `slezovi` exist with the names and latin names of
   section 3.
2. **AC2:** Given the seven produce, then each cites its FDC id from section 5 and its nutrition
   source name is the SR Legacy description.
3. **AC3:** Given the seven produce, then their regions are exactly those in section 5, each with
   a source on `www.mzh.government.bg` whose name contains „реколта 2025“, and each note quotes
   „открити площи“ and „2025“ and does not start with „Също“; courgettes, green beans and okra
   have no region.
4. **AC4:** Given the seven produce, then each has a photo on Unsplash with an author, an author URL
   and the JPEG file.
5. **AC5:** Given the seven produce, then each has a growing guide whose sources are all on
   `bgfermer.bg` or `agrozona.bg`, and no source anywhere is on `gradinata.bg`.
6. **AC6:** Given the seven produce, then `traditionalUses` is empty, no text contains „богат“, and
   `updatedAt` is 2026-11-13.
7. **AC7:** Given the seven produce, then their varieties are exactly those of section 5.
8. **AC8:** Given the checklist, then it has a row for each new produce with its FDC id and
   „NUTS2“, or „no official regional data“ for the three without regions.
9. **AC9:** Given the methodology and about texts, then both name домати, пипер, патладжан and
   краставици among the products whose regions follow МЗХ statistics.

## 9. Test plan

| AC  | Test type | Test file                                                          |
| --- | --------- | ------------------------------------------------------------------ |
| AC1 | unit      | `tests/unit/content/summer-vegetables-041.test.ts`                 |
| AC2 | unit      | `summer-vegetables-041.test.ts`; values: `usda-nutrition.test.ts`  |
| AC3 | unit      | `tests/unit/content/summer-vegetables-041.test.ts`                 |
| AC4 | unit      | `summer-vegetables-041.test.ts`; alt length: `seed-photos.test.ts` |
| AC5 | unit      | `summer-vegetables-041.test.ts`; shape: `seed-growing.test.ts`     |
| AC6 | unit      | `summer-vegetables-041.test.ts`; voice: `voice.test.ts`            |
| AC7 | unit      | `tests/unit/content/summer-vegetables-041.test.ts`                 |
| AC8 | unit      | `tests/unit/content/summer-vegetables-041.test.ts`                 |
| AC9 | unit      | `tests/unit/content/summer-vegetables-041.test.ts`                 |

## 10. Third-party documentation consulted

No third-party API is used; the sources below are content sources. Pages were fetched on
2026-11-13.

| Source                                                                                                                                                                     | Used for                                                                                                                                                                                                                                                                                                                                   |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| USDA FoodData Central, SR Legacy CSV, April 2018 (FDC 170457, 168409, 170427, 169228, 169291, 169961, 169260)                                                              | Nutrition, via `pnpm content:usda`                                                                                                                                                                                                                                                                                                         |
| МЗХ, „Производство на зеленчуци в България – реколта 2025“, бюлетин № 468, https://www.mzh.government.bg/media/filer_public/2026/03/31/ra468_publicationvegetables2025.pdf | Table 2 (national open-field and greenhouse figures), Table 3 (open-field area by NUTS2), list of provinces per NUTS2 region                                                                                                                                                                                                               |
| МЗХ, „Производство на зеленчуци – реколта 2022“, RA 423, https://www.mzh.government.bg/media/filer_public/2023/04/11/ra423_publicationvegetables2022.pdf                   | Checked: same regional crops; no table for courgettes, beans or okra                                                                                                                                                                                                                                                                       |
| МЗХ, „Ситуация на пазара на плодове и зеленчуци в България – юни 2024“                                                                                                     | Greenhouse tomatoes and cucumbers produced January–May (season note)                                                                                                                                                                                                                                                                       |
| Eurostat `apro_cpshr` (API, geo BG34, BG41, BG42)                                                                                                                          | Checked: only the aggregate „Fresh vegetables“ by NUTS2                                                                                                                                                                                                                                                                                    |
| ИАСАС, „Официална сортова листа … 2026 г.“ (OSL 1), https://iasas.government.bg/att/OSL%201%20-%202026%2013.pdf                                                            | Varieties (List B: Домати, Пипер, Краставици, Патладжан; also Тиквички, Фасул, Бамя)                                                                                                                                                                                                                                                       |
| Bulgarian Wikipedia, „Картофови“, „Бобови“, „Слезови“ (redirects from the Latin names)                                                                                     | Group name                                                                                                                                                                                                                                                                                                                                 |
| Български фермер – Календар на сеитбите (https://www.bgfermer.bg/Article/9378131)                                                                                          | Sowing: tomatoes Feb (early) and Mar (mid-early); peppers Jan (early, south), Feb–Mar; aubergines end of Jan – mid-Feb; cucumbers for open field late March                                                                                                                                                                                |
| Български фермер – Домати се засаждат през целия май (https://www.bgfermer.bg/Article/20441010)                                                                            | Tomatoes transplanted end of April and all May; soil 14–15 °C at 10 cm; harden a week; same depth; stakes; water after a week                                                                                                                                                                                                              |
| Български фермер – Засаждане на домати (https://www.bgfermer.bg/Article/5460101)                                                                                           | Predecessors (not after potatoes, pepper, aubergine); 75–80 × 35–40 cm for tall varieties                                                                                                                                                                                                                                                  |
| Български фермер – Кога да се засажда разсадът на открито (https://www.bgfermer.bg/Article/22768010)                                                                       | Tomatoes, peppers, aubergines and cucumbers planted out through May                                                                                                                                                                                                                                                                        |
| Български фермер – 10 грешки при отглеждането на пипер (https://www.bgfermer.bg/Article/6170258)                                                                           | Pepper tips: do not plant out early; 25 × 60 cm; not deeper than the seed leaves; water often and little; shallow hoeing, mulch                                                                                                                                                                                                            |
| Български фермер – Патладжанът трябва да се засажда в топла почва (https://www.bgfermer.bg/Article/20603788)                                                               | Aubergines planted after the second half of May                                                                                                                                                                                                                                                                                            |
| Български фермер – Патладжанът се засажда при трайно затопляне (https://www.bgfermer.bg/Article/11624730)                                                                  | Soil above 13–14 °C; 4–5 leaves; 70 × 40 cm; planting into June; feed after 20 days, then every two weeks; pick regularly                                                                                                                                                                                                                  |
| Agrozona.bg – Патладжанът е любител на слънцето (https://agrozona.bg/patladzhanat-e-lyubitel-na-slantseto/)                                                                | Late-crop sowing in April; early crop planted out in the second half of April (not used, see section 5); not after tomatoes, pepper or potatoes                                                                                                                                                                                            |
| Български фермер – Кога и как се засажда разсадът от краставици (https://www.bgfermer.bg/Article/22935996)                                                                 | Cucumbers planted out under cover 10–15 May, uncovered 2–10 June, at 18–20 °C by day                                                                                                                                                                                                                                                       |
| Български фермер – Кога и как се сеят краставици директно (https://www.bgfermer.bg/Article/8392111)                                                                        | Direct sowing from the second half of April; late crop late June – early July                                                                                                                                                                                                                                                              |
| Български фермер – Директна сеитба на краставици (https://www.bgfermer.bg/Article/9734189)                                                                                 | Rows 90–100 cm, thinned to 25–30 cm                                                                                                                                                                                                                                                                                                        |
| Agrozona.bg – Как да отгледате краставици: От разсада до брането (https://agrozona.bg/kak-da-otgledate-krastavitsi-ot-razsada-do-braneto/)                                 | Water generously once or twice a week, in the morning, without wetting the leaves; support on wires or a net                                                                                                                                                                                                                               |
| Български фермер – Сеитбата на бамята се провежда през втората половина на май (https://www.bgfermer.bg/Article/22659480)                                                  | Okra: „предимно в южните райони“; varieties Пловдивска, Лясковска, Тополовградска; sown second half of May at 18–19 °C; second crop after spinach, onions, radishes, salads; nests 35–40 × 60–70 cm, 3–4 seeds at 4–5 cm; most water at the start and in flowering; bears two months after sowing until the first frosts; picked at 4–5 cm |
| Български фермер – Продължава да се засява бамя (https://www.bgfermer.bg/Article/5532488)                                                                                  | Okra sown in the second and third ten days of May; bears about two months after sowing                                                                                                                                                                                                                                                     |
| Български фермер – Отгледайте си бамя, няма да съжалявате (https://www.bgfermer.bg/Article/8637639)                                                                        | Okra picked before the seeds form; cook within 2–3 days; suits dishes and pickles                                                                                                                                                                                                                                                          |
| Български фермер – Патладжанът трябва да се засажда в топла почва (https://www.bgfermer.bg/Article/20603788)                                                               | Okra pods for stews, casseroles and pickles                                                                                                                                                                                                                                                                                                |
| Български фермер – Директна сеитба на тиквички (https://www.bgfermer.bg/Article/6862175)                                                                                   | Courgettes sown from March (under cover) through April, May and June; first harvests end of April to end of September; after tomatoes, pepper or legumes                                                                                                                                                                                   |
| Български фермер – Тиквичките понасят директна сеитба (https://www.bgfermer.bg/Article/11400911)                                                                           | Same sowing window and harvest period                                                                                                                                                                                                                                                                                                      |
| Български фермер – Тиквичките – лесни за гледане и много вкусни (https://www.bgfermer.bg/Article/14485662)                                                                 | Sow when the soil is warm and late frosts are over; 80–90 × 60 cm; 4–5 seeds at 3–4 cm, one plant left; pick regularly, large ones get coarse; eaten raw; can be frozen                                                                                                                                                                    |
| Български фермер – Градински фасул се сее до началото на май (https://www.bgfermer.bg/Article/14206346)                                                                    | Green beans sown at 10–12 °C soil: first ten days of April (south), second half of April (north), early May (high fields); picked in June before full size, late picking forms „лико“                                                                                                                                                      |
| Български фермер – Сеитба на зелен фасул (https://www.bgfermer.bg/Article/9692366)                                                                                         | Not on heavy, cold or acid soils; nests of 4–5 seeds at 5–6 cm; dwarf 50–60 × 30 cm, climbing 80 × 40 cm                                                                                                                                                                                                                                   |
| Български фермер – Зеленият фасул се сее на етапи (https://www.bgfermer.bg/Article/11474549)                                                                               | Sow in stages for a longer harvest; finish by 15–20 May                                                                                                                                                                                                                                                                                    |
| Български фермер – Отгледайте зелен фасул като втора култура (https://www.bgfermer.bg/Article/930528)                                                                      | Second crop sown until about 20 July, ready in under two months; late crop for freezing or jars                                                                                                                                                                                                                                            |
| Български фермер – Засява се градинският фасул за ранно производство (https://www.bgfermer.bg/Article/4714002)                                                             | Никос among the early dwarf varieties                                                                                                                                                                                                                                                                                                      |
