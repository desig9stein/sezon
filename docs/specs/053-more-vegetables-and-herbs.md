# 053. More vegetables and herbs

- **Status:** Approved
- **Bounded context(s):** catalog (content data)
- **Related:** specs 015 (photos), 032 (USDA extract), 033 (sourced regions), 042 (produce
  without regions), 043 (spring greens, printed calendar), 049 (season-only mandatory produce),
  052 (fruits and nuts, in parallel)

## 1. Goal

The owner wants as many produce as possible, with the season as the one thing that matters
(spec 049). This spec adds 21 vegetables and herbs whose harvest months a Bulgarian gardening
source or an encyclopaedia states, with every optional block (nutrition, photo) only where it is
sourced, and records why nine other candidates are left out.

## 2. User stories

- As a reader, I want to see when peas, broad beans, turnips, kohlrabi, asparagus, basil, mint and
  other common vegetables and herbs are in season in Bulgaria.
- As a reader, I want nutrition facts and a photo where a reliable source exists, and no invented
  value where none does.
- As the owner, I want every month traceable to a quoted sentence, and unsafe or unsourced
  candidates left out.

## 3. Scope

### In scope

21 new produce entries and two new groups (`zaychesyankovi`, `ustnotsvetni`).

| Slug               | Name            | Latin name                        | Kind      | Group                  | Nutrition (FDC) | Photo |
| ------------------ | --------------- | --------------------------------- | --------- | ---------------------- | --------------- | ----- |
| `grah`             | Грах            | Pisum sativum                     | vegetable | `bobovi`               | 170419          | yes   |
| `bakla`            | Бакла           | Vicia faba                        | vegetable | `bobovi`               | 170377          | yes   |
| `bob`              | Боб             | Phaseolus vulgaris                | vegetable | `bobovi`               | 175193          | yes   |
| `ryapa`            | Ряпа            | Brassica rapa subsp. rapa         | vegetable | `krastotsvetni`        | 170465          | yes   |
| `alabash`          | Алабаш          | Brassica oleracea var. gongylodes | vegetable | `krastotsvetni`        | 168424          | yes   |
| `bryukselsko-zele` | Брюкселско зеле | Brassica oleracea var. gemmifera  | vegetable | `krastotsvetni`        | 170383          | yes   |
| `pashtarnak`       | Пащърнак        | Pastinaca sativa                  | vegetable | `sennikotsvetni`       | 170417          | yes   |
| `hryan`            | Хрян            | Armoracia rusticana               | vegetable | `krastotsvetni`        | –               | –     |
| `asperzhi`         | Аспержи         | Asparagus officinalis             | vegetable | `zaychesyankovi` (new) | 168389          | yes   |
| `reven`            | Ревен           | Rheum rhabarbarum                 | vegetable | `lapadovi`             | 167758          | –     |
| `artishok`         | Артишок         | Cynara cardunculus var. scolymus  | vegetable | `slozhnotsvetni`       | 169205          | yes   |
| `rukola`           | Рукола          | Eruca vesicaria subsp. sativa     | vegetable | `krastotsvetni`        | 169387          | –     |
| `keyl`             | Кейл            | Brassica oleracea var. sabellica  | vegetable | `krastotsvetni`        | 168421          | –     |
| `bosilek`          | Босилек         | Ocimum basilicum                  | herb      | `ustnotsvetni` (new)   | 172232          | yes   |
| `menta`            | Мента           | Mentha × piperita                 | herb      | `ustnotsvetni`         | 173474          | yes   |
| `dzhodzhen`        | Джоджен         | Mentha spicata                    | herb      | `ustnotsvetni`         | 173475          | –     |
| `rigan`            | Риган           | Origanum vulgare                  | herb      | `ustnotsvetni`         | –               | –     |
| `mashterka`        | Мащерка         | Thymus vulgaris                   | herb      | `ustnotsvetni`         | 173470          | yes   |
| `rozmarin`         | Розмарин        | Salvia rosmarinus                 | herb      | `ustnotsvetni`         | 173473          | yes   |
| `salviya`          | Салвия          | Salvia officinalis                | herb      | `ustnotsvetni`         | –               | yes   |
| `estragon`         | Естрагон        | Artemisia dracunculus             | herb      | `slozhnotsvetni`       | –               | –     |

- **New groups:**
  - `zaychesyankovi`: „Зайчесянкови“ (_Asparagaceae_). bg.wikipedia „Зайчесянкови“: „Зайчесянкови
    (Asparagaceae) е семейство цъфтящи растения … Най-известният му член е обикновената аспержа
    (Asparagus officinalis).“ Description: „Семейство на аспержата.“
  - `ustnotsvetni`: „Устноцветни“ (_Lamiaceae_). Български фермер „Билки: Полезните растения от
    семейство Устноцветни“ (25.07.2025): „По-познати растения от това семейство са мъртвите коприви,
    босилекът, маточината, мащерката, ментата, риганът, чубрицата, салвиите и още много.“
    Description: „Семейство на босилека, ментата, мащерката, ригана и салвията.“
- **Docs:** rows in `docs/content-review/README.md` and the „Seed data status“ of
  `docs/CONTENT-GUIDE.md`.
- **Printed calendar:** the print test scales its sheet limit with the number of produce rows
  (section 5).

### Out of scope (candidates left out)

| Candidate       | Reason                                                                                                                                                                                                                                             |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Червено зеле    | Already a variety of `zele` („Червено зеле“); Български фермер 23874922 gives the same harvest signs for red as for white cabbage, so a separate entry would duplicate `zele`.                                                                     |
| Сладък картоф   | The only source (Agrozona, field trial 2023) gives the growing period „май – септември“, not a harvest month; no other source found.                                                                                                               |
| Сладка царевица | Български фермер 2023033, 6873832 and 5532605 say only that it is eaten „във фаза млечна зрялост“; no month.                                                                                                                                       |
| Коприва         | Wild-gathered. The only month source (Български фермер 14721904, „Дойде времето на прясната коприва“) warns of painful burns and allergy and says to blanch the leaves; the site cannot show these cautions next to a produce. Spec 043 AC1 stays. |
| Глухарче        | Wild-gathered. The only source (Agrozona „Всички части на глухарчето са лековити“) is a medicinal article; it dates the flowers („Появява се през април и май“), and the leaves only as „преди цъфтежа“, with no month.                            |
| Лапад           | The only month is the title of Български фермер 8416350 („Билките през април“); the article says only „Засяват се след последния мраз“ for the leaves. Too weak; wild _Rumex_ already has `kiselets`.                                              |
| Лобода          | No season source found.                                                                                                                                                                                                                            |
| Чубрица         | Garden savory has no harvest month in a source: Български фермер gives the sowing month and „Стръковете се берат по време на цъфтежа“ (11879233) without a flowering month; the July–October flowering of 20953518 is for _Satureja montana_.      |
| Девесил         | No harvest source found (Български фермер 12631791 mentions only autumn planting).                                                                                                                                                                 |
| Левурда         | Excluded by the owner: toxic look-alikes (lily of the valley, autumn crocus).                                                                                                                                                                      |

- **Regions:** none of the 21 has МЗХ data by province or NUTS2 region. Bulletin № 468
  („Производство на зеленчуци в България – реколта 2025“) gives „Градински грах – зелен“ (922 ha)
  only nationally and counts artichokes and asparagus inside „Други зеленчуци“ and turnips inside
  „Други грудкови и лукови зеленчуци“. Every entry omits `regions` (spec 042: the page says „Няма
  официални данни по области…“).
- **Growing guides, varieties, FAQ, how to choose, storage text, preparation, traditional uses,
  organic:** none. They are optional (spec 049) and were not researched for this batch.
- **Farms and recipes:** no links.

## 4. Domain model

No change. 21 `produce` entries and 2 `groups` entries under the existing schemas.

## 5. Behaviour and edge cases

### Season levels (editorial mapping)

No official monthly calendar exists (`docs/content-review/README.md`). The levels follow one rule:

- **peak:** a month the cited source names for the harvest (or the season), including a month it
  names only in part („края на май“, „средата на юни“) and the months inside a stated window;
- **available:** a month that is an editorial reading of a vague phrase („през есента“, „рано
  напролет“) or that is derived from sowing dates and growing time;
- **storage:** a month after harvest when a source says the produce keeps in storage.

All pages were fetched on 2026-11-13. Quotes are verbatim.

| Slug               | Months and levels           | Source and quote                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------------------ | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `grah`             | 5–6 peak                    | Български фермер „Градинският грах се сее в края на февруари“ (https://www.bgfermer.bg/Article/13871302): „Градинският грах се прибира в технологична зрелост, преди втвърдяване на семената, обикновено от края на май до средата на юни, в зависимост от сорта и сроковете на сеитба.“                                                                                                                                                                                                                                                                                                            |
| `bakla`            | 5 peak                      | Български фермер „Баклата е студоустойчива, може да се сее много рано“ (https://www.bgfermer.bg/Article/11149745): „Беритбата започва, когато се оформят шушулките - началото на май. Реколтата се прибира на няколко пъти, през 5-10 дни.“                                                                                                                                                                                                                                                                                                                                                         |
| `bob`              | 9–10 peak                   | Български фермер „Берете късния фасул до започване на студовете“ (https://www.bgfermer.bg/Article/251569): „При повечето сортове зрелият фасул се прибира до края на септември - началото на октомври.“                                                                                                                                                                                                                                                                                                                                                                                             |
| `ryapa`            | 10–11 peak                  | Български фермер „Ряпата се вади преди студовете“ (https://www.bgfermer.bg/Article/6502337): „Започна прибирането на ряпата. Най-подходящото време за целта е от средата на октомври до средата на ноември.“                                                                                                                                                                                                                                                                                                                                                                                        |
| `alabash`          | 7, 10–11 peak; 12–4 storage | Български фермер „Алабашът трябва да е със средни размери“ (https://www.bgfermer.bg/Article/23874930): „Ранните сортове се прибират още през юли. … Късните сортове се прибират през есента, приблизително по същото време като късното главесто зеле.“ and „При тези условия зеленчукът запазва вкусовите си качества в продължение на шест месеца или повече.“; late cabbage from „Кога главестото зеле е готово за прибиране“ (https://www.bgfermer.bg/Article/23874922): „Обикновено това е краят на октомври и през ноември.“ Storage is counted conservatively as five months after November. |
| `bryukselsko-zele` | 9–1 peak                    | Agrozona „Зимни зеленчуци, даващи ни енергия“ (https://agrozona.bg/zimni-zelenchutsi-davashti-ni-energiya/): „Сезонът му започва от септември и е чак до януари“                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `pashtarnak`       | 9–11 available              | Български фермер „Как се отглежда пащърнак“ (https://www.bgfermer.bg/Article/5232589): „Кореноплодите се прибират през есента, пак както морковите.“ („през есента“ read as September–November.)                                                                                                                                                                                                                                                                                                                                                                                                    |
| `hryan`            | 10 peak                     | Български фермер „Как се отглежда хрян“ (https://www.bgfermer.bg/Article/4691830): „Коренищата на хряна се прибират през октомври.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `asperzhi`         | 4–6 peak                    | Български фермер „Ниските температури забавиха и реколтата от аспержи“ (https://www.bgfermer.bg/Article/20362817): „Сезонът на аспержите започва в началото на април и приключва към средата на юни.“; „Отглеждане на аспержи“ (https://www.bgfermer.bg/Article/6881170): „Нормалната беритба започва от четвъртата година през април до средата на май“                                                                                                                                                                                                                                            |
| `reven`            | 4 available; 5–7 peak       | Български фермер „Ако решите да отглеждате ревен“ (https://www.bgfermer.bg/Article/7294370): „Дръжките се берат рано напролет. … Беритбата на дръжките продължава до към края на юли.“ and „Листните дръжки на ревена се използват в супи, пюрета, сладка, вино“; Agrozona „Как да си отгледате ревен – най-ранният пролетен витамин“: „Спрете с прибирането на дръжки през юли“. („рано напролет“ read as April.)                                                                                                                                                                                  |
| `artishok`         | 5–6 peak                    | Български фермер „Красивият артишок е двугодишно растение“ (https://www.bgfermer.bg/Article/1903522): „Съцветията се отрязват преди цъфтежа - през юни“; „Красивият като цвете артишок е истински деликатес“ (https://www.bgfermer.bg/Article/13276617): „Обикновено това е в края на май“                                                                                                                                                                                                                                                                                                          |
| `rukola`           | 5–7, 10 available           | Български фермер „Рукола – свежа и пикантна, отглежда се лесно“ (https://www.bgfermer.bg/Article/13201151): „Пролетната сеитба се извършва в средата на март, а също през април и май, а есенната – в началото на септември.“ and „Голямо предимство на културата е, че е с много кратка вегетация – 40-60 дни.“ Derived: sowings plus 40–60 days.                                                                                                                                                                                                                                                  |
| `keyl`             | 3–5, 9–11 available         | Български фермер „Как да си отгледаме кейл“ (https://www.bgfermer.bg/Article/11922998): „Кейлът, както и останалите зелеви представители, издържа на ниски температури, затова може да се рекултира есен и пролет.“ (Autumn and spring read as September–November and March–May.)                                                                                                                                                                                                                                                                                                                   |
| `bosilek`          | 6–8 peak                    | Български фермер „Прибиране и грижи за билките“ (https://www.bgfermer.bg/Article/23331366): „Босилек, мента, салвия, магданоз, копър и много други можем да приберем, засеем или размножим по вегетативен начин именно през летните месеци.“; „Ароматни билки в градината“ (https://www.bgfermer.bg/Article/4834169), basil: „Не се изнася навън преди юни.“                                                                                                                                                                                                                                        |
| `menta`            | 6–8 peak                    | bgfermer 23331366 (above); bg.wikipedia „Мента“: „Ако сами ще берете мента, трябва да знаете, че най-подходящото време е през юли и август, в началото на цъфтежа им.“                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `dzhodzhen`        | 7–8 peak; 9–10 available    | bg.wikipedia „Мента“ (genus; it names „джоджен – M. spicata“ among the species grown in Bulgaria): July and August as above; Agrozona „Джоджен в градината: Засадете ароматната подправка през есента“: „Първото изрязване се прави преди цъфтежа, а второто – през есента преди настъпването на сланите.“ (Autumn cut read as September–October.)                                                                                                                                                                                                                                                  |
| `rigan`            | 6–8 peak                    | bgfermer 23331366: „Летните месеци са най-подходящи да приберем реколтата от любими билки и подправки като риган, мащерка, розмарин, салвия и други.“; bg.wikipedia „Обикновен риган“: „цъфтежът започва обикновено от началото на юни и продължава до края на август“; Български фермер „Средиземноморски подправки“ (https://www.bgfermer.bg/Article/14228661): „бере се по време на цъфтежа“                                                                                                                                                                                                     |
| `mashterka`        | 6–8 peak                    | bgfermer 23331366 (above).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `rozmarin`         | 6–8 peak                    | bgfermer 23331366 (above).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `salviya`          | 5–8 peak                    | bgfermer 23331366 (above); Български фермер „Билките през май“ (https://www.bgfermer.bg/Article/1974861): „През този красив месец … се берат листата на маточината, на градинския чай …“                                                                                                                                                                                                                                                                                                                                                                                                            |
| `estragon`         | 6–8 peak                    | Български фермер „Засадете естрагон - ценна подправка е“ (https://www.bgfermer.bg/Article/5893744): „През лятото трябва неколкократно да отрязвате стъблата и листата, и да ги сушите на сянка.“                                                                                                                                                                                                                                                                                                                                                                                                    |

### Nutrition

Values are copied from the USDA SR Legacy CSV (April 2018) and checked by
`tests/unit/content/usda-nutrition.test.ts` after `pnpm content:usda`. Only raw or fresh records
are used; horseradish, oregano, sage and tarragon have only prepared, dried or ground records in
SR Legacy, so their entries have no nutrition. Micronutrients are those at ≥ 15 % of the EU
reference intake per 100 g, highest share first, at most six; when fewer than three reach 15 %,
the next highest are added to show three (spec 043 rule).

| Slug               | FDC record                                           |
| ------------------ | ---------------------------------------------------- |
| `grah`             | Peas, green, raw (170419)                            |
| `bakla`            | Broadbeans, immature seeds, raw (170377)             |
| `bob`              | Beans, kidney, all types, mature seeds, raw (175193) |
| `ryapa`            | Turnips, raw (170465)                                |
| `alabash`          | Kohlrabi, raw (168424)                               |
| `bryukselsko-zele` | Brussels sprouts, raw (170383)                       |
| `pashtarnak`       | Parsnips, raw (170417)                               |
| `asperzhi`         | Asparagus, raw (168389)                              |
| `reven`            | Rhubarb, raw (167758)                                |
| `artishok`         | Artichokes, (globe or french), raw (169205)          |
| `rukola`           | Arugula, raw (169387)                                |
| `keyl`             | Kale, raw (168421)                                   |
| `bosilek`          | Basil, fresh (172232)                                |
| `menta`            | Peppermint, fresh (173474)                           |
| `dzhodzhen`        | Spearmint, fresh (173475)                            |
| `mashterka`        | Thyme, fresh (173470)                                |
| `rozmarin`         | Rosemary, fresh (173473)                             |

- **Боб:** the dry mature seed, which in Bulgaria is mostly white beans; SR Legacy's generic
  „Beans, kidney, all types, mature seeds, raw“ is the record for mature _Phaseolus vulgaris_
  seeds of all types. The values are for the raw dry seed.
- **Мащерка:** the culinary thyme _Thymus vulgaris_ (the USDA record); wild _Thymus_ species are
  not covered.

### Editorial text

Summaries are 70–160 characters, „ти“ voice, factual, no health claims, never „богат на“,
„полезен“, „лекува“ or „действие“. The rhubarb summary names the stalks as the eaten part, as the
source does („Листните дръжки на ревена се използват в супи, пюрета, сладка“); it says nothing
about the leaves. The broad bean entry carries no health statement. Every entry has
`updatedAt: 2026-11-13`.

### Photos (spec 015)

Unsplash photos downloaded through the Unsplash download endpoint (the MCP `download_asset`),
centre-cropped to 4:3, 1600 × 1200 px JPEG at quality 80 without metadata, stored as
`src/assets/produce/<slug>.jpg`. Each was checked visually. No photo is given where no Unsplash
result clearly showed the produce: horseradish, rhubarb (the best result looked like chard),
arugula, kale, spearmint, oregano and tarragon.

| Slug               | Author              | Unsplash photo                          |
| ------------------ | ------------------- | --------------------------------------- |
| `grah`             | Summan Mehmood      | https://unsplash.com/photos/K2-ZxFtVXrg |
| `bakla`            | Zoshua Colah        | https://unsplash.com/photos/2_urXm2lJR4 |
| `bob`              | Łukasz Rawa         | https://unsplash.com/photos/b6h5nTVD1Hw |
| `ryapa`            | Zoshua Colah        | https://unsplash.com/photos/DIYv7TerQI4 |
| `alabash`          | The Matter of Food  | https://unsplash.com/photos/tpZOOZLYC28 |
| `bryukselsko-zele` | Jason Leung         | https://unsplash.com/photos/q6HCBFaL-ZU |
| `pashtarnak`       | Jasmine Waheed      | https://unsplash.com/photos/Bt-T8tSfBkM |
| `asperzhi`         | engin akyurt        | https://unsplash.com/photos/vZI6sTly1p4 |
| `artishok`         | Kim Daniels         | https://unsplash.com/photos/J84yENp4O9w |
| `bosilek`          | Yakov Leonov        | https://unsplash.com/photos/0wWYos3ZGqU |
| `menta`            | Shaun Meintjes      | https://unsplash.com/photos/dJ4JgX5I5y8 |
| `mashterka`        | Compagnons          | https://unsplash.com/photos/ite5WrQaDaE |
| `rozmarin`         | Babette Landmesser  | https://unsplash.com/photos/Wl-z9lbwkSI |
| `salviya`          | stephan de MARANTHI | https://unsplash.com/photos/ZbxEgEaxDew |

### Printed calendar (amends spec 043 AC11 and spec 014 AC7)

With this batch and spec 052 the calendar has about 80 produce, more than the about 60 that two A4
landscape sheets hold at the readable print spacing of spec 043. Shrinking the type further would
make the printout unreadable, so the sheet limit scales with the table instead: the calendar
prints on at most `max(2, ceil(rows / 30))` A4 landscape sheets, where `rows` is the number of
produce rows (spec 043: two sheets hold about 60 produce). The other print rules stay: the month
header row repeats on every sheet (`thead` as `table-header-group`), rows never split
(`break-inside: avoid`), each kind heading stays with its first row, and the site chrome is hidden.

## 6. Accessibility requirements

- WCAG 1.1.1: every photo has a Bulgarian `alt` of 10–120 characters that describes the photo.
- WCAG 3.1.2: Latin names render with `lang="la"` (existing component).
- Entries without regions, nutrition or photo leave those sections out (spec 049); no empty
  headings or lists.
- The printed calendar keeps its repeated header row and unsplit rows (WCAG 1.3.1 reading order in
  print).
- No new components; the existing e2e axe checks cover every produce and group page.

## 7. SEO requirements

- Each produce page gets its title from the name and its meta description from the summary
  (70–160 characters), unique per page.
- Internal links: produce ↔ group (two new group pages), produce ↔ month and, where nutrition is
  given, produce ↔ nutrient pages, all generated from the data.
- No region links (no regions).

## 8. Acceptance criteria

1. **AC1:** Given the produce collection, then it contains the 21 slugs of section 3, each valid
   under the content schema, with the kind and group of section 3, and none of the left-out
   candidates (`kopriva`, `gluharche`, `lapad`, `levurda`, `loboda`, `chubritsa`, `devesil`,
   `sladak-kartof`, `sladka-tsarevitsa`, `cherveno-zele`).
2. **AC2:** Given each new produce, then its season months and levels equal section 5's table.
3. **AC3:** Given each new produce with nutrition, then it cites the FDC record of section 5 by its
   item URL, and the produce without a raw record (`hryan`, `rigan`, `salviya`, `estragon`) have no
   nutrition. (The spec 032 test checks the values against the extract.)
4. **AC4:** Given each new produce, then it names no province and cites no gradinata.bg page.
5. **AC5:** Given each new produce with a photo in section 5, then the photo file exists and its
   credit is the listed Unsplash photo; the others have no photo.
6. **AC6:** Given each new produce, then its summary and photo `alt` contain no „богат“, „полез“,
   „лекува“ or „действие“, and it has no traditional uses and no organic block.
7. **AC7:** Given the new groups, then `zaychesyankovi` is _Asparagaceae_ and `ustnotsvetni` is
   _Lamiaceae_.
8. **AC8:** Given the content checklist, then it has a row per new produce.
9. **AC9:** Given the calendar in print media at A4 landscape, then it prints on at most
   `max(2, ceil(rows / 30))` sheets, repeats the month header row and keeps each kind heading with
   its first row.

## 9. Test plan

| AC  | Test type | Test file                                         |
| --- | --------- | ------------------------------------------------- |
| AC1 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC2 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC3 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC4 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC5 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC6 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC7 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC8 | unit      | `tests/unit/content/vegetables-herbs-053.test.ts` |
| AC9 | e2e       | `tests/e2e/calendar-page.spec.ts` (AC7, QA 043)   |

## 10. Third-party documentation consulted

No new third-party API. Content sources (all fetched 2026-11-13):

| Source                                                                                                                                                                                                           | Used for                             |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
| USDA FoodData Central, SR Legacy CSV (April 2018), the 17 FDC ids of section 5                                                                                                                                   | Nutrition                            |
| https://www.mzh.government.bg/media/filer_public/2026/03/31/ra468_publicationvegetables2025.pdf                                                                                                                  | Regions (national only, none named)  |
| bgfermer.bg articles 13871302, 11149745, 251569, 6502337, 23874930, 23874922, 5232589, 4691830, 20362817, 6881170, 7294370, 1903522, 13276617, 13201151, 11922998, 23331366, 4834169, 1974861, 14228661, 5893744 | Seasons                              |
| bgfermer.bg 20953518 („Билки: Полезните растения от семейство Устноцветни“)                                                                                                                                      | Group `ustnotsvetni`                 |
| agrozona.bg „Зимни зеленчуци, даващи ни енергия“, „Как да си отгледате ревен …“, „Джоджен в градината …“                                                                                                         | Seasons                              |
| bg.wikipedia.org „Мента“, „Обикновен риган“, „Зайчесянкови“, „Обикновена аспержа“                                                                                                                                | Seasons (mint, oregano), group names |
| bgfermer.bg 14721904, 8416350, 2023033, 6873832, 5532605, 11879233, 18793657, 12631791; agrozona.bg glucharche and sweet potato articles                                                                         | Left-out candidates                  |
| Unsplash photo pages in section 5                                                                                                                                                                                | Photos                               |
