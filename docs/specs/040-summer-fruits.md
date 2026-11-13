# 040. Summer fruits

- **Status:** Approved
- **Bounded context(s):** catalog (content data), tooling (content tests)
- **Related:** issue #38, spec 015 (photos), spec 018 (growing guide), spec 032 (USDA extract),
  spec 033 (region sources), spec 035 (growing sources), `docs/CONTENT-GUIDE.md`,
  `docs/content-review/README.md`

## 1. Goal

The catalogue has only autumn and winter produce, so the summer months look empty. This step adds
eight summer fruits: ягоди, череши, кайсии, праскови, сливи, грозде (dessert grapes), смокини and
пъпеши. Every fact comes from a cited source; what no source states is left out.

## 2. User stories

- As a reader in June, I want to see which fruits are in season and where in Bulgaria they grow.
- As the owner, I want every figure, variety and growing tip of the new fruits traceable to a
  source, as for the existing produce.

## 3. Scope

### In scope

- **Data:** eight produce files in `src/data/produce/` with nutrition, regions, varieties, season,
  editorial texts and a photo; two new groups (`lozovi`, `chernichevi`).
- **Nutrition:** USDA FoodData Central SR Legacy (April 2018), raw, copied from the regenerated
  extract `tests/fixtures/usda/sr-legacy-extract.json`:

  | Produce  | FDC id | USDA description                                                     |
  | -------- | ------ | -------------------------------------------------------------------- |
  | ягоди    | 167762 | Strawberries, raw                                                    |
  | череши   | 171719 | Cherries, sweet, raw                                                 |
  | кайсии   | 171697 | Apricots, raw                                                        |
  | праскови | 169928 | Peaches, yellow, raw                                                 |
  | сливи    | 169949 | Plums, raw                                                           |
  | грозде   | 174683 | Grapes, red or green (European type, such as Thompson seedless), raw |
  | смокини  | 173021 | Figs, raw                                                            |
  | пъпеши   | 169911 | Melons, honeydew, raw                                                |

  For melons USDA has no Bulgarian type. Honeydew is chosen because „Медена роса“ (honeydew) is
  among the classic Bulgarian sorts the cited article names, and because it has no vitamin A,
  so the page makes no vitamin A label that green-fleshed melons would not meet.

- **Regions** (planted area, hectares):
  - From the МЗХ orchard structure survey 2023, bulletin № 448, Tables 1–2 (column sums checked
    against the published totals; confidential cells are too small to change the ranks):
    - **Череши:** Бургас 2 163, Кюстендил 2 086, Пловдив 1 676 (total 11 619).
    - **Кайсии и зарзали:** Силистра 2 151, Русе 273, Добрич 140 (total 3 169).
    - **Праскови и нектарини:** Сливен 1 475, Бургас 398, Русе 218 (total 3 069).
    - **Сливи:** Пловдив 1 551, Ловеч 1 246, Силистра 897 (total 11 842).
    - **Лозя с десертни сортове грозде:** Пловдив 821, Бургас 345, Хасково 338 (total 2 415).
  - From „Производство на зеленчуци – реколта 2022“, bulletin RA 423, Table 3 (NUTS2 only, the
    cabbage pattern of spec 033):
    - **Ягоди:** the South Central region has 366 of 748 ha of harvested open-field strawberries.
    - **Дини и пъпеши** (one column): the South Central region has 2 404 of 5 418 ha, the largest
      of the six regions.
    - The provinces named are Пловдив and Пазарджик, both in that region, as for cabbage. The
      note says the figure is for the region, not the province.
  - **Смокини:** no official data. Agrozona (2017) quotes prof. Аргир Живондов of the Fruit-Growing
    Institute in Plovdiv: figs „се отглеждат много в районите на Сандански, Петрич, Ивайловград,
    Свиленград и Тракийската низина“. Сандански and Петрич are in Благоевград province, Ивайловград
    and Свиленград in Хасково province. The notes quote this without figures and cite Agrozona.
- **Varieties:** only cultivars a cited source names as grown or recommended in Bulgaria:
  - череши: Бигаро Бюрла, Ван („основен стандартен сорт“ у нас), Косара (Fruit-Growing Institute,
    Plovdiv), Кордия — Български фермер, „Сортове овошки, подходящи за нашите условия“;
  - сливи: Стенлей („има голямо разпространение“), Чачанска лепотица, Пловдивска ренклода — same
    article; Кюстендилска синя слива — ИАСАС official variety list 2026 (local variety);
  - кайсии: Унгарска („един от най-разпространените в страната“), Харкот, Роксана — Български
    фермер, „Подходящи за нашите условия праскови, нектарини и кайсии“; Силистренска компотна —
    „12 сорта кайсии за градината“ and the ИАСАС list;
  - праскови: Редхейвън, Глоухейвън, Файет, Ласкава — „Подходящи за нашите условия праскови,
    нектарини и кайсии“;
  - грозде: Болгар, Супер ран болгар, Плевен, Кардинал, Хамбургски мискет — Български фермер,
    „Кои десертни сортове грозде си заслужава да засадим в двора?“ (2026), each also on the
    ИАСАС official variety list 2026 (table grapes);
  - ягоди: Клери, Антея, Елсанта — Български фермер farm reports (2018, 2020, 2024);
  - пъпеши: Хибрид 1, Хибрид 15, Медена роса, Победител — Български фермер, „8 съвета за
    по-сладки пъпеши“;
  - смокини: none. The only fig cultivars on the official list are endangered local forms, and no
    cited article names cultivars grown in Bulgaria.
- **Season:** editorial, as for every produce (spec 033, methodology), set from the harvest
  timing the cited articles give:
  - череши: May–June (Бигаро Бюрла 15–20 May, Ван about 10 June, Кордия mid-June) and July for
    late and mountain orchards → 5 available, 6 peak, 7 available;
  - кайсии: Харкот second half of June, Унгарска and Роксана mid-July, Силистренска компотна
    early August → 6 available, 7 peak, 8 available;
  - праскови: Файет third week of June, Редхейвън late July, Глоухейвън mid-August → 6 available,
    7 peak, 8 peak, 9 available;
  - сливи: Сирма about 20 July, Пловдивска ренклода mid-August, Стенлей 25 Aug–2 Sep →
    7 available, 8 peak, 9 peak;
  - грозде: early sorts July–August, mid sorts August–September, late sorts into autumn →
    7 available, 8 peak, 9 peak, 10 available;
  - ягоди: no cited article gives open-field harvest dates; the levels keep to the common
    May–June crop and leave out remontant sorts → 5 peak, 6 peak;
  - смокини: fruit ripens „от август до края на октомври“ → 8 peak, 9 peak, 10 available;
  - пъпеши: „Първите пъпеши ще са през юли, продаваме ги до септември“ → 7 peak, 8 peak,
    9 available.
- **Growing guides** (spec 018 and 035 rules) for пъпеши and смокини only, from Български фермер.
  The other six have no guide: their planting advice would need a separate check per tree.
- **Photos:** eight Unsplash photos, stored and credited as in spec 015 (1600 × 1200 px, JPEG
  quality 82, no metadata), downloaded through the Unsplash download endpoint.
- **Checklist:** one row per new produce in `docs/content-review/README.md`.
- **Test:** `tests/unit/content/summer-fruits-040.test.ts`.

### Out of scope

- Watermelon (дини): the regional data fits, but no reliable source for varieties was found (the
  only article is a seed company's advertorial). It can follow in a later issue.
- Traditional uses (`traditionalUses: []`) and organic blocks: no primary source was looked for.
- Sour cherries (вишни): not in the issue.

## 4. Domain model

No change. Two new `groups` entries: Лозови (Vitaceae) and Черничеви (Moraceae).

## 5. Behaviour and edge cases

- New produce pages, month pages, region pages and group pages appear through the existing
  routes. Ловеч, Силистра, Русе, Добрич, Сливен and Бургас gain produce, so their region pages
  list them.
- Figs have no varieties; the varieties section is not rendered (existing behaviour).
- Region notes never start with „Също“ and every note that quotes hectares cites the МЗХ
  publication.
- Editorial texts use „ти“, make no health claim and never use „богат на“.

## 6. Accessibility requirements

- Each photo has a Bulgarian `alt` of 10–120 characters that describes the picture (WCAG 1.1.1).
- No markup change; the existing e2e, axe and without-CSS tests cover the new pages.

## 7. SEO requirements

- Each summary is 70–160 characters and becomes the meta description.
- Titles follow the existing produce pattern; new pages enter the sitemap automatically.
- Internal links to regions, groups and months come from the existing templates.

## 8. Acceptance criteria

1. **AC1:** Given the produce collection, when the eight slugs (`yagodi`, `chereshi`, `kaysii`,
   `praskovi`, `slivi`, `grozde`, `smokini`, `papeshi`) are read, then each exists, parses with
   the produce schema, has kind `fruit` and the group named in this spec.
2. **AC2:** Given each new produce, its nutrition source is the FDC record in section 3 and its
   values are exactly the extract values (checked by the existing USDA test).
3. **AC3:** Given the orchard fruits, the regions are exactly, in order: череши Бургас, Кюстендил,
   Пловдив; кайсии Силистра, Русе, Добрич; праскови Сливен, Бургас, Русе; сливи Пловдив, Ловеч,
   Силистра; грозде Пловдив, Бургас, Хасково. Each cites bulletin № 448 on `mzh.government.bg`.
4. **AC4:** Given strawberries and melons, the regions are Пловдив and Пазарджик, citing the 2022
   vegetables bulletin on `mzh.government.bg`, and each note says „Южния централен район“.
5. **AC5:** Given every region note of a new produce that contains a figure, it has a source on
   `mzh.government.bg`; no note starts with „Също“; numbers of four digits or more use a
   non-breaking space as thousands separator.
6. **AC6:** Given figs, the regions are Благоевград and Хасково, without figures, citing Agrozona.
7. **AC7:** Given each new produce, it has a photo file of 1600 × 1200 px and a credit with an
   author and an `unsplash.com` source URL.
8. **AC8:** Given each new produce, `traditionalUses` is empty and no text contains „богат на“.
9. **AC9:** Given the growing guides, only пъпеши and смокини have one, and every source of it is
   on bgfermer.bg or agrozona.bg.
10. **AC10:** Given the checklist, it has a row for each new produce with its FDC id.
11. **AC11:** Given the groups, `lozovi` (Vitaceae) and `chernichevi` (Moraceae) exist.

## 9. Test plan

| AC   | Test type | Test file                                                                |
| ---- | --------- | ------------------------------------------------------------------------ |
| AC1  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC2  | unit      | `tests/unit/content/summer-fruits-040.test.ts`, `usda-nutrition.test.ts` |
| AC3  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC4  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC5  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC6  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC7  | unit      | `tests/unit/content/summer-fruits-040.test.ts`, `seed-photos.test.ts`    |
| AC8  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC9  | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC10 | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |
| AC11 | unit      | `tests/unit/content/summer-fruits-040.test.ts`                           |

## 10. Third-party documentation consulted

No third-party API is used. Content sources:

| Source                                                                                            | Edition                      | URL                                                                                                                      | Used for                                                |
| ------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------- |
| USDA FoodData Central, SR Legacy                                                                  | April 2018                   | https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip                                    | Nutrition, FDC ids in section 3                         |
| МЗХ, Агростатистика: „Структура на основни овощни видове в България през 2023 г.“                 | бюлетин № 448, декември 2024 | https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448_publicationstructureorchard2023-preliminaryresults.pdf | Tables 1–2: areas by province                           |
| МЗХ, Агростатистика: „Производство на зеленчуци – реколта 2022“                                   | RA 423, April 2023           | https://www.mzh.government.bg/media/filer_public/2023/04/11/ra423_publicationvegetables2022.pdf                          | Table 3: strawberries, melons and watermelons by NUTS2  |
| ИАСАС: Официална сортова листа (лоза, овощни) 2026                                                | 2026                         | https://iasas.government.bg/att/OSL%202%20-%202026%208.pdf                                                               | Table grape varieties; local plum and apricot varieties |
| Български фермер: „Сортове овошки, подходящи за нашите условия“                                   | 29.11.2021                   | https://www.bgfermer.bg/Article/10439096                                                                                 | Cherry and plum varieties, harvest timing               |
| Български фермер: „Подходящи за нашите условия праскови, нектарини и кайсии“                      | 15.12.2021                   | https://www.bgfermer.bg/Article/10501421                                                                                 | Peach and apricot varieties, harvest timing             |
| Български фермер: „12 сорта кайсии за градината“                                                  | 19.01.2021                   | https://www.bgfermer.bg/Article/9425919                                                                                  | Силистренска компотна, harvest timing                   |
| Български фермер: „Кои десертни сортове грозде си заслужава да засадим в двора?“                  | 10.11.2026                   | https://www.bgfermer.bg/Article/23894249                                                                                 | Grape varieties and ripening groups                     |
| Български фермер: „Появиха се много аматьори в производството на ягоди заради субсидиите“         | 23.05.2018                   | https://www.bgfermer.bg/Article/6876499                                                                                  | Strawberry varieties (Клери, Антея, Елсанта)            |
| Български фермер: „Градина с безколови розови домати е новата страст на дядо и внук от Свищовско“ | 20.06.2024                   | https://www.bgfermer.bg/Article/18198196                                                                                 | Клери; melon harvest July–September                     |
| Български фермер: „8 съвета за по-сладки пъпеши“                                                  | 01.06.2019                   | https://www.bgfermer.bg/Article/7483379                                                                                  | Melon varieties, growing tips                           |
| Български фермер: „Дини и пъпеши се сеят през втората половина на април“                          | 15.04.2023                   | https://www.bgfermer.bg/Article/14205258                                                                                 | Melon sowing month and tips                             |
| Български фермер: „Отглеждане на дини и пъпеши“                                                   | 27.04.2018                   | https://www.bgfermer.bg/Article/6834440                                                                                  | Melon sowing months and tips                            |
| Български фермер: „Смокинята е типично южно растение“                                             | 19.08.2021                   | https://www.bgfermer.bg/Article/10091520                                                                                 | Fig ripening August–October                             |
| Български фермер: „Смокинята – ароматна и изключително сладка“                                    | 28.08.2024                   | https://www.bgfermer.bg/Article/18744542                                                                                 | Fig growing tips                                        |
| Български фермер: „Искате да си засадите смокиня през пролетта“                                   | 06.04.2020                   | https://www.bgfermer.bg/Article/8392127                                                                                  | Fig planting time and tips                              |
| Agrozona: „Кои екзотични овошки са най-подходящи за печеливш бизнес у нас“                        | 04.02.2017                   | https://agrozona.bg/koi-ekzotichni-ovoshki-sa-naj-podhodyashti-za-pechelivsh-biznes-u-nas/                               | Fig-growing areas                                       |
| Unsplash photos (eight, credited in each produce file)                                            | Unsplash License             | https://unsplash.com/license                                                                                             | Photos                                                  |
