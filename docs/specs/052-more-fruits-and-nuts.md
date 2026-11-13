# 052. More fruits and nuts

- **Status:** Approved
- **Bounded context(s):** catalog (content data)
- **Related:** spec 002 (content model), spec 015 (photos), spec 032 (USDA extract), spec 033
  (region sources), spec 040 (summer fruits), spec 042 (produce without regions), spec 044 (autumn
  staples, rosehip left out), spec 049 (season-only mandatory produce), `docs/CONTENT-GUIDE.md`,
  `docs/content-review/README.md`

## 1. Goal

The owner wants as many produce as possible (2026-11-13). What matters most is whether a produce
is in season; nutrition, photo, regions, varieties and the other blocks are added only when a
source gives them (spec 049). This step adds every fruit and nut of the research list whose season
a Bulgarian source states: 18 fruits and 3 nuts. Two fruits are left out because no source gives
their months, and elder is excluded on safety grounds (section 5). No fact is invented, and
gradinata.bg is not cited.

## 2. User stories

- As a reader, I want to see when sour cherries, raspberries, blueberries, pomegranates, kiwi,
  rosehips, hazelnuts, almonds and other fruits and nuts are in season in Bulgaria.
- As a reader, I want nutrition, regions and a photo where a source gives them, and no invented
  values where it does not.
- As the owner, I want each season to come from a page I can check, with the sentence quoted.

## 3. Scope

### In scope

- **Data:** 21 produce entries in `src/data/produce/` (table in section 5). Every entry has the
  required name, kind, group, summary, season and `updatedAt` (spec 049), plus the optional blocks
  listed per entry: Latin name, varieties, regions, USDA nutrition, storage and photo.
- **Groups:** nine botanical families, with the Bulgarian names of the Bulgarian Wikipedia
  taxoboxes: `pirenovi` (Пиренови, Ericaceae), `kasisovi` (Касисови, Grossulariaceae), `blatievi`
  (Блатиеви, Lythraceae), `abanosovi` (Абаносови, Ebenaceae), `aktinidievi` (Актинидиеви,
  Actinidiaceae), `dryanovi` (Дрянови, Cornaceae), `mirizlivovarbovi` (Миризливовърбови,
  Elaeagnaceae), `zarnikovi` (Зърникови, Rhamnaceae) and `brezovi` (Брезови, Betulaceae). The
  descriptions name only the produce of this site in the family (editorial, as the existing
  groups).
- **USDA extract:** regenerated with `pnpm content:usda` for the 12 new FDC ids.
- **Checklist and content guide:** one row per new produce in `docs/content-review/README.md` and
  a line in the content guide's „Seed data status“.

### Out of scope

- **Червено френско грозде:** no source gives its months. Български фермер „Френското грозде се
  отглежда много лесно“ says only that the berries „не узряват едновременно“; its only months
  („от края на юли до началото на август“) are a watering period of black currant.
- **Горски ягоди:** no Bulgarian source with months was found (searches of bgfermer.bg,
  agrozona.bg and the Bulgarian Wikipedia article „Горска ягода“, which gives no months).
- **Бъз (черен):** excluded by the owner's brief. The only month source found describes the
  dwarf elder (бъзак, _Sambucus ebulus_), a toxic look-alike, and the raw berries need cooking.
- Growing guides, FAQ, preparation and organic blocks: not added in this step (no source was
  checked for them).
- Traditional uses: none (`traditionalUses` omitted). The research found no primary source.
- Ranking of nutrients or design changes: none. The printed calendar grows from 38 to 59 rows;
  spec 043 allows two A4 sheets for about 60 produce, so no print style change is needed.

## 4. Domain model

No change. The new groups and produce are data only.

## 5. Behaviour and edge cases

### Produce and optional blocks

| Slug             | Name          | Latin name                      | Kind  | Group              | Optional blocks                      |
| ---------------- | ------------- | ------------------------------- | ----- | ------------------ | ------------------------------------ |
| `vishni`         | Вишни         | Prunus cerasus                  | fruit | `rozotsvetni`      | varieties, regions, nutrition        |
| `malini`         | Малини        | Rubus idaeus                    | fruit | `rozotsvetni`      | varieties, regions, nutrition, photo |
| `kapini`         | Къпини        | –                               | fruit | `rozotsvetni`      | varieties, nutrition, photo          |
| `borovinki`      | Боровинки     | Vaccinium corymbosum            | fruit | `pirenovi`         | nutrition, storage, photo            |
| `kasis`          | Касис         | Ribes nigrum                    | fruit | `kasisovi`         | photo                                |
| `dini`           | Дини          | Citrullus lanatus               | fruit | `tikvovi`          | regions, nutrition, photo            |
| `nektarini`      | Нектарини     | Prunus persica var. nucipersica | fruit | `rozotsvetni`      | varieties, regions, nutrition, photo |
| `mushmuli`       | Мушмули       | Mespilus germanica              | fruit | `rozotsvetni`      | storage                              |
| `nar`            | Нар           | Punica granatum                 | fruit | `blatievi`         | nutrition, photo                     |
| `rayska-yabalka` | Райска ябълка | Diospyros kaki                  | fruit | `abanosovi`        | nutrition, storage, photo            |
| `kivi`           | Киви          | Actinidia deliciosa             | fruit | `aktinidievi`      | varieties, nutrition, photo          |
| `shipka`         | Шипка         | Rosa canina                     | fruit | `rozotsvetni`      | regions, photo                       |
| `drenki`         | Дренки        | Cornus mas                      | fruit | `dryanovi`         | –                                    |
| `aronia`         | Арония        | Aronia melanocarpa              | fruit | `rozotsvetni`      | –                                    |
| `dzhanki`        | Джанки        | Prunus cerasifera               | fruit | `rozotsvetni`      | –                                    |
| `oblepiha`       | Облепиха      | Hippophae rhamnoides            | fruit | `mirizlivovarbovi` | –                                    |
| `skorusha`       | Скоруша       | Sorbus domestica                | fruit | `rozotsvetni`      | storage                              |
| `hinap`          | Хинап         | Ziziphus jujuba                 | fruit | `zarnikovi`        | –                                    |
| `leshnitsi`      | Лешници       | Corylus avellana                | nut   | `brezovi`          | varieties, regions, nutrition, photo |
| `bademi`         | Бадеми        | Prunus dulcis                   | nut   | `rozotsvetni`      | varieties, regions, nutrition        |
| `fastatsi`       | Фъстъци       | Arachis hypogaea                | nut   | `bobovi`           | nutrition, photo                     |

A photo is listed only where one clearly shows the produce (section „Photos“); the others have no
`photo` block. The blackberry has no Latin name: the source describes the
thornless cultivar Торнфрий, and the cultivated thornless blackberries are hybrids whose species
name the source does not give. The blueberry is the cultivated „американска“ blueberry of the
source; its species name follows the English Wikipedia article „Vaccinium corymbosum“ („a North
American species of blueberry … commonly cultivated as a fresh fruit crop“).

### Seasons

Seasons are editorial (no official monthly calendar exists, `docs/content-review/README.md`), but
every month below is stated by the quoted source. The rule for the levels:

- **peak:** a month the source names as the ripening or harvest period (whole month, or the main
  part of a range);
- **available:** a month the source names only at the edge of the range („края на“, „началото на“,
  „до средата на“), for some varieties only, or for an earlier or later production method;
- **storage:** a month after the harvest that the source covers with a storage statement.

Fetched 2026-11-13. Articles of Български фермер (bgfermer.bg) are cited with their title and date.

| Slug             | Season (P = peak, A = available, S = storage) | Source and quote                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| ---------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `vishni`         | 6 P, 7 A                                      | „Вишнята - ароматни плодове, невзискателни дръвчета“ (2014-11-29, https://www.bgfermer.bg/Article/4449151): „Узряването на плодовете е в зависимост от района и сорта вишни - от началото на юни до средата на юли.“                                                                                                                                                                                                                                                                                                   |
| `malini`         | 6 A, 7 A, 8 A, 9 P, 10 A                      | „Малината - перфектният плод за всяка любителска градина“ (2020-04-03, https://www.bgfermer.bg/Article/8384602): Люлин „Плодовете узряват в края на август-началото на септември.“; Херитидж „Плодовете от пролетно-лятната реколта … започват да зреят от края на юни - началото на юли, а от лятно-есенната - от 15-20 август, като при благоприятна есен беритбите продължават до 5-10 октомври.“ (the research notes attributed this to Люлин; it is Херитидж)                                                     |
| `kapini`         | 7 A, 8 P, 9 P, 10 A                           | „Къпини Торнфрий“ (2021-12-24, https://www.bgfermer.bg/Article/10524280): „Започва да зрее от края на юли - началото на август, до края на септември – началото на октомври, като беритбата продължава над 40 дни.“                                                                                                                                                                                                                                                                                                    |
| `borovinki`      | 6 P, 7 P, 8 P, 9 P                            | „Боровинката е перфектен избор за всеки любител-градинар“ (2024-04-30, https://www.bgfermer.bg/Article/17764268): „Плодовете на боровинката узряват в зависимост от сорта, обикновено в периода юни - септември.“                                                                                                                                                                                                                                                                                                      |
| `kasis`          | 6 P, 7 P                                      | „Правилното хранене на касиса е гаранция за богата реколта“ (2025-04-24, https://www.bgfermer.bg/Article/20362020): „По време на периода на прибиране на реколтата, през юни-юли, е препоръчително касисът да се подхрани отново.“                                                                                                                                                                                                                                                                                     |
| `dini`           | 6 A, 7 P, 8 A                                 | „Ранни дини и пъпеши под полиетиленови тунели“ (2019-05-01, https://www.bgfermer.bg/article/7428007): tunnels „Беритбата започва в края на юни“; open field „Беритбата започва в началото на юли и продължава около месец и половина.“                                                                                                                                                                                                                                                                                 |
| `nektarini`      | 8 P                                           | „Подходящи за нашите условия праскови, нектарини и кайсии“ (2021-12-15, https://www.bgfermer.bg/article/10501421): Индипендънс „Плодовете узряват в началото на август.“; Фантазия „Плодовете узряват 15-20 август.“                                                                                                                                                                                                                                                                                                   |
| `mushmuli`       | 10 A, 11 P                                    | „Мушмулата“ (2012-09-28, https://www.bgfermer.bg/Article/1563331): „Обикновено прибирането на мушмулите става след падането на първите есенни слани през втората половина на октомври и началото на ноември.“; „Консумативната им зрялост настъпва след лагеруване, когато плодовете омекват.“ November is the peak because the fruit is eaten after it softens.                                                                                                                                                       |
| `nar`            | 10 P, 11 S, 12 S                              | „Плодовете на нара се прибират през октомври“ (2022-10-03, https://www.bgfermer.bg/Article/12677060): „Плодовете на нара се прибират в консумативна зрелост, през есента (м.октомври). … При подходящи условия за съхранение плодовете са годни за консумация в продължение на няколко месеца.“ Storage is limited to two months as the smallest reading of „няколко“.                                                                                                                                                 |
| `rayska-yabalka` | 10 P, 11 A                                    | „Плодовете на райската ябълка узряват през втората половина на октомври“ (2021-10-16, https://www.bgfermer.bg/Article/10288655): „Плодовете узряват през втората половина на октомври. … Райската ябълка достига консумативна зрелост по-късно, след омекване на плодовете. … Те могат да се прибират и след листопада“; „Агротехнически дейности в овощната градина през октомври“ (2022-10-06, https://www.bgfermer.bg/Article/12728233): „Започва беритбата на плодовете от райска ябълка, нар и актинидия (киви).“ |
| `kivi`           | 10 A, 11 P, 12 S                              | „Подходящи сортове киви“ (2014-10-08, https://www.bgfermer.bg/Article/4357043): Хейуърд „Плодовете узряват в края на октомври и в първите дни на ноември.“; „Българското киви - доходно, но е с труден пазар“ (2018-06-25, https://www.bgfermer.bg/Article/6922783): „най-добре е плодовете да се прибират около 10-15 ноември“, „плодовете узряват в края на октомври-ноември и са готови за ядене през декември.“                                                                                                    |
| `shipka`         | 9 P, 10 A                                     | „Шипката - мултивитамин за тялото и душата“ (2019-11-08, https://www.bgfermer.bg/Article/7747322): „Плодовете на шипката се берат от септември до първите слани преди да са омекнали и напълно узрели.“                                                                                                                                                                                                                                                                                                                |
| `drenki`         | 8 P, 9 P, 10 P                                | „Дренките са лек против простуда“ (2013-01-11, https://www.bgfermer.bg/Article/1712832): „Плодовете му узряват през август-октомври.“ The Bulgarian Wikipedia article „Обикновен дрян“ agrees („през август—октомври“). The article's folk-medicine statements are not used.                                                                                                                                                                                                                                           |
| `aronia`         | 8 P, 9 A                                      | „Плодовете на аронията се прибират в края на лятото“ (2020-08-24, https://www.bgfermer.bg/article/8937058): „обикновено от втората половина на август до средата на септември.“                                                                                                                                                                                                                                                                                                                                        |
| `dzhanki`        | 6 P, 7 P, 8 P, 9 P                            | Bulgarian Wikipedia „Джанка“ (https://bg.wikipedia.org/wiki/Джанка): „Съзряват през юни – септември.“                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `oblepiha`       | 7 A, 8 P, 9 P, 10 A                           | „Облепиха за ценители“ (2020-10-15, https://www.bgfermer.bg/article/9109181): „Най-ранните сортове узряват в края на юли – началото на август, средноранните през септември, а най-късните – през октомври.“; „Плодовете узряват през август, а в по-студените райони и през септември.“                                                                                                                                                                                                                               |
| `skorusha`       | 8 A, 9 P, 10 A, 11 S, 12 S                    | „Скорушата е за ценители“ (2020-10-01, https://www.bgfermer.bg/Article/9061829): „Узряването става постепенно - от средата на август до средата на октомври.“; „Късно узрели плодове (през октомври), поставени в хладилник, угниват доста по-бавно. Затова ако се държат там, могат да се съхраняват около 2 месеца.“                                                                                                                                                                                                 |
| `hinap`          | 9 A, 10 P                                     | „Хинапът се бере в края на септември и през октомври“ (2023-09-10, https://www.bgfermer.bg/Article/15453454): „Те встъпват в беритбена зрялост в края на септември и през октомври.“                                                                                                                                                                                                                                                                                                                                   |
| `leshnitsi`      | 8 P                                           | Bulgarian Wikipedia „Обикновена леска“: „плодовете узряват през август“; „Лешникът - много и разнообразни сортове“ (2019-10-02, https://www.bgfermer.bg/article/7684316): Халски „Узрява в края на август“. September (in the research notes) is not stated and is dropped.                                                                                                                                                                                                                                            |
| `bademi`         | 8 A, 9 P, 10 A                                | „Бадем се отглежда в топлите райони“ (2019-05-15, https://www.bgfermer.bg/Article/7452042): six varieties ripen from „края на август и началото на септември“ (Нонпарел) to „втората половина на септември“ (Поморие); „Агротехнически дейности в овощната градина през октомври“ (https://www.bgfermer.bg/Article/12728233): „Продължава беритбата на бадемовите и някои сливови плодове.“                                                                                                                            |
| `fastatsi`       | 9 P                                           | „Отглеждане на фъстъци“ (2018-05-04, https://www.bgfermer.bg/article/6845105): „Узряването започва през септември и зависи от сортовите особености.“                                                                                                                                                                                                                                                                                                                                                                   |

### Nutrition (USDA SR Legacy, April 2018)

Values are copied from the SR Legacy CSV and checked by `tests/unit/content/usda-nutrition.test.ts`
after `pnpm content:usda`. Micronutrients follow spec 043: those the record gives at ≥ 15 % of the
EU reference intake per 100 g; when fewer than three reach 15 %, the highest others are added to
show three.

| Slug             | FDC id | SR Legacy description       |
| ---------------- | ------ | --------------------------- |
| `vishni`         | 173954 | Cherries, sour, red, raw    |
| `malini`         | 167755 | Raspberries, raw            |
| `kapini`         | 173946 | Blackberries, raw           |
| `borovinki`      | 171711 | Blueberries, raw            |
| `dini`           | 167765 | Watermelon, raw             |
| `nektarini`      | 169914 | Nectarines, raw             |
| `nar`            | 169134 | Pomegranates, raw           |
| `rayska-yabalka` | 169941 | Persimmons, japanese, raw   |
| `kivi`           | 168153 | Kiwifruit, green, raw       |
| `leshnitsi`      | 170581 | Nuts, hazelnuts or filberts |
| `bademi`         | 170567 | Nuts, almonds               |
| `fastatsi`       | 172430 | Peanuts, all types, raw     |

- **No nutrition:** `kasis` (173963 „Currants, european black, raw“) and `hinap` (168151 „Jujube,
  raw“) have no fibre value, and a nutrition block needs every macronutrient; a value cannot be
  invented. SR Legacy has no record of medlar, rosehip (only 168998, wild North American roses, see
  spec 044), cornelian cherry, chokeberry, cherry plum, sea buckthorn or service tree.
- Nuts: the SR Legacy records „Nuts, almonds“ and „Nuts, hazelnuts or filberts“ are the unroasted
  kernels, like walnuts („Nuts, walnuts, english“). Peanuts use the raw record.

### Regions

- **Province rankings, МЗХ bulletin № 448** „Структура на основни овощни видове в България през
  2023 г. (предварителни резултати)“, Table 2 „Засадени площи, разпределени по местоположение на
  насажденията – хектари“. Confidential cells („с“) were checked: the hidden total of each column
  is smaller than the third figure, so the ranking holds.

  | Slug        | 1st              | 2nd                 | 3rd                 | Hidden cells (total)                                                 |
  | ----------- | ---------------- | ------------------- | ------------------- | -------------------------------------------------------------------- |
  | `vishni`    | Търговище 196 ха | София-област 180 ха | Пловдив 175 ха      | Благоевград, Плевен, Хасково (57 ха)                                 |
  | `malini`    | Търговище 374 ха | Разград 210 ха      | София-област 195 ха | Видин, Кърджали, София-град, Ямбол (14 ха)                           |
  | `leshnitsi` | Варна 433 ха     | Русе 340 ха         | Бургас 235 ха       | Перник, София-град (4 ха)                                            |
  | `bademi`    | Бургас 888 ха    | Хасково 802 ха      | Сливен 326 ха       | Велико Търново, Враца, Монтана, Перник, Разград, София-област (6 ха) |

- **Nectarines:** Table 1 of the same bulletin counts peaches and nectarines together. The entry
  repeats the three provinces of `praskovi` (Сливен 1 475 ха, Бургас 398 ха, Русе 218 ха) and each
  note says „праскови и нектарини“.
- **NUTS2 (the cabbage rule, spec 033):** the South Central region leads, and, as for cabbage,
  tomatoes, peppers and aubergines (spec 041), Пловдив and Пазарджик are named with the regional
  figure and year, without ranking them. Кърджали, Смолян and Хасково are in the same region, but
  nothing ranks them (QA 052: naming all five also gave Smolyan produce, against the precedent).
  - `dini`: bulletin № 468 „Производство на зеленчуци в България – реколта 2025“, Table 3: „Дини и
    пъпеши“ together, open-field harvested area, Южен централен 4 092 of 8 669 ха (2025).
  - `shipka`: bulletin № 469 „Производство на плодове в България – реколта 2025“, Table 2:
    „Култивирани шипки“, harvested area, Южен централен 323 of 950 ха (2025).
- **No regions (`regions` omitted, spec 042/049):** all other entries. The bulletins do not count
  blackberries, blueberries, black currant, medlar, pomegranate, persimmon, kiwi, cornelian
  cherry, chokeberry, cherry plum, sea buckthorn, service tree, jujube or peanuts by province or
  region (they fall under „Други овощни видове“ or are not counted).

### Varieties

All from the Български фермер articles of the season table; each note gives the ripening time
stated there.

- **Вишни:** Хайманов рубин, Фанал, Облачанска вишна, Монтморенси, Сенчеста морела, Метеор.
- **Малини:** Люлин (Bulgarian remontant), Херитидж.
- **Къпини:** Торнфрий.
- **Нектарини:** Индипендънс, Фантазия.
- **Киви:** Хейуърд, Абот, Бруно, Монти.
- **Лешници:** Бадемовиден, Ран трапезундски, Тонда джентиле, Тракийски, Римски, Ата баба, Халски.
- **Бадеми:** Ароматичен, Аспарух, Марково, Никитски, Нонпарел, Поморие.

### Storage and handling texts

- `borovinki`: „Боровинките се берат когато са напълно узрели, защото след откъсването си те спират
  да зреят. Могат да се съхраняват в хладилник за около две седмици.“ (Article 17764268).
- `mushmuli`: unripe medlars are hard and astringent; they are eaten after they soften in storage
  (Article 1563331).
- `rayska-yabalka`: „Плодовете на райската ябълка се съхраняват при температура 1-2°С и относителна
  влажност на въздуха над 85%.“ and they become edible after softening (Article 10288655).
- `skorusha`: late fruit in the fridge keeps about two months (Article 9061829).

### Editorial texts

- Summaries are 70–160 characters, restate the quoted season and, where present, the region
  ranking. No health claims, no „богат на“, „полезен“, „лекува“ or „действие“; the „ти“ voice where
  they address the reader.
- `updatedAt: 2026-11-13`.

### Photos

Unsplash, downloaded through the download endpoint, cropped to 4:3, 1600 × 1200 JPEG at quality 80
without metadata (spec 015). Each photo was checked visually for the right species.

| Slug             | Unsplash photo | Author                                     |
| ---------------- | -------------- | ------------------------------------------ |
| `malini`         | `BM27BzBrhVM`  | Stan Slade (@rofostan)                     |
| `kapini`         | `l1uVrvjZrsQ`  | Amanda Hortiz (@amandahortiz)              |
| `borovinki`      | `4qujjbj3srs`  | Joanna Kosinska (@joannakosinska)          |
| `kasis`          | `r7Y6wdEFVdE`  | Anna Evans (@anevans)                      |
| `dini`           | `aFUHu9WNO3Q`  | Floh Keitgen (@flohkeitgen)                |
| `nektarini`      | `m6U3YgHnncc`  | Michael Breucker (@michaelb61)             |
| `nar`            | `LOdAL10JejI`  | Jonas Renner (@jonasrnr)                   |
| `rayska-yabalka` | `wEjZtyvHs1w`  | Gabriella Clare Marino (@gabiontheroad)    |
| `kivi`           | `jPVcZsxRGJo`  | engin akyurt (@enginakyurt)                |
| `shipka`         | `XqhK2sJcTg0`  | Gabi Repaska (@emotionphotography_by_gabi) |
| `leshnitsi`      | `SCpXCeUvgdY`  | engin akyurt (@enginakyurt)                |
| `fastatsi`       | `8ThqdYrRFiw`  | Nasiru Othman (@othmanspixel)              |

No photo: sour cherries (the candidates could not be told apart from sweet cherries), almonds (no
photo of almonds was found), and medlar, cornelian cherry, chokeberry, cherry plum, sea buckthorn,
service tree and jujube (the searches returned other species or none).

## 6. Accessibility requirements

- Each photo has a Bulgarian `alt` of 10–120 characters that describes the photo (WCAG 1.1.1).
- Produce pages without nutrition, regions or photo leave those sections out with their headings and
  table of contents entries (spec 049), so the heading order stays valid (1.3.1, 2.4.6).
- Latin names render with `lang="la"` through the existing components (3.1.2).
- The season of each produce is shown as text, icon and colour by the existing calendar (1.4.1).
- The printed calendar keeps the header row on each of at most two A4 sheets (spec 043).

## 7. SEO requirements

- Each produce page gets a unique title (the name) and a 70–160 character summary as its meta
  description.
- The new group pages `/grupi/<id>` link their produce; produce pages link their group, month pages
  and named regions (internal links).
- Each nutrition table cites its FDC record (YMYL); each region note that quotes a figure cites the
  МЗХ bulletin.

## 8. Acceptance criteria

1. **AC1:** Given the 21 new produce files, when parsed with the content schema, then each is valid
   and has the kind, group and Latin name of section 5, and the nine new groups exist with their
   Latin family names.
2. **AC2:** Given each new produce, then its season equals the season table of section 5 (month
   and level).
3. **AC3:** Given each new produce with nutrition, then it cites the SR Legacy record of section 5
   by FDC item URL and description; and the produce of section 5 without nutrition have none.
4. **AC4:** Given sour cherries, raspberries, hazelnuts and almonds, then their regions are the
   three provinces of section 5 in that order, each citing bulletin № 448 with the figure in the
   note; nectarines name the peach provinces with „праскови и нектарини“ in each note.
5. **AC5:** Given watermelons and rosehips, then their regions are Пловдив and Пазарджик (South
   Central region, as for cabbage), each citing the 2025 bulletin with the regional figure.
6. **AC6:** Given the other new produce, then `regions` is empty.
7. **AC7:** Given each new produce, then no file cites gradinata.bg, none has traditional uses,
   none contains „богат“, and `updatedAt` is 2026-11-13.
8. **AC8:** Given each new produce with a photo, then the photo file exists and the credit is an
   Unsplash photo page.
9. **AC9:** Given the varieties of section 5, then each listed produce has exactly those varieties.
10. **AC10:** Given the red currant, wild strawberry and elder, then no produce file exists for them.
11. **AC11:** Given the checklist and the content guide, then the checklist has a row per new
    produce and the content guide's „Seed data status“ names spec 052.

## 9. Test plan

| AC   | Test type | Test file                                                                       |
| ---- | --------- | ------------------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC2  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC3  | unit      | `tests/unit/content/fruits-nuts-052.test.ts` (values: `usda-nutrition.test.ts`) |
| AC4  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC5  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC6  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC7  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC8  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC9  | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC10 | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |
| AC11 | unit      | `tests/unit/content/fruits-nuts-052.test.ts`                                    |

The existing e2e test of the printed calendar (spec 043, at most two A4 sheets) covers the larger
calendar.

## 10. Third-party documentation consulted

No new third-party API is used. Content sources (all fetched 2026-11-13):

| Source                                                                                                                                 | Version / date | URL                                                                                                                      | Used for                                           |
| -------------------------------------------------------------------------------------------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- |
| USDA FoodData Central, SR Legacy                                                                                                       | April 2018 CSV | https://fdc.nal.usda.gov/fdc-datasets/FoodData_Central_sr_legacy_food_csv_2018-04.zip                                    | Nutrition (section 5)                              |
| МЗХ, бюлетин № 448 „Структура на основни овощни видове в България през 2023 г.“                                                        | December 2024  | https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448_publicationstructureorchard2023-preliminaryresults.pdf | Table 2, confidentiality note                      |
| МЗХ, бюлетин № 468 „Производство на зеленчуци в България – реколта 2025“                                                               | March 2026     | https://www.mzh.government.bg/media/filer_public/2026/03/31/ra468_publicationvegetables2025.pdf                          | Table 3 (дини и пъпеши), NUTS2 membership          |
| МЗХ, бюлетин № 469 „Производство на плодове в България – реколта 2025“                                                                 | March 2026     | https://www.mzh.government.bg/media/filer_public/2026/03/31/ra469_publicationfruits2025_bg.pdf                           | Table 2 (култивирани шипки)                        |
| Български фермер – 22 articles of the season table                                                                                     | 2012–2025      | https://www.bgfermer.bg/                                                                                                 | Seasons, varieties, storage                        |
| Български фермер – Френското грозде се отглежда много лесно                                                                            | 2022-07-26     | https://www.bgfermer.bg/Article/12117296                                                                                 | Red currant: no months (left out)                  |
| Bulgarian Wikipedia – Джанка, Обикновена леска, Обикновен дрян                                                                         | 2026-11-13     | https://bg.wikipedia.org/                                                                                                | Seasons of cherry plum, hazelnut, cornelian cherry |
| Bulgarian Wikipedia – Боровинка, Касис, Нар, Райска ябълка, Киви (растение), Обикновен дрян, Облепиха, Хинап, Обикновена леска, Арония | 2026-11-13     | https://bg.wikipedia.org/                                                                                                | Family names of the new groups                     |
| English Wikipedia – Vaccinium corymbosum                                                                                               | 2026-11-13     | https://en.wikipedia.org/wiki/Vaccinium_corymbosum                                                                       | Species of the cultivated blueberry                |
| Unsplash photos                                                                                                                        | 2026-11-13     | https://unsplash.com/                                                                                                    | Photos                                             |

## 11. QA review (2026-11-13)

No `qa-reviewer` subagent could be launched from this session; the checklist was followed manually
and the full e2e suite was run.

| Finding                                                                                                                                                                                 | Fix                        | Regression test                                                     |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------- |
| Watermelons and rosehips named all five South Central provinces; the precedent (spec 041) names Пловдив and Пазарджик only, and the Smolyan page (spec 038, AC15) lost its empty states | Kept Пловдив and Пазарджик | `AC5: %s names Plovdiv and Pazardzhik for the South Central region` |
