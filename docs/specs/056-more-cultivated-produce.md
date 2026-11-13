# 056. More cultivated produce

- **Status:** Approved
- **Bounded context(s):** catalog (content data)
- **Related:** specs 015 (photos), 032 (USDA extract), 042 (produce without regions), 043
  (micronutrient rule, printed calendar), 049 (season-only mandatory produce), 052 (fruits and
  nuts), 053 (vegetables and herbs), `docs/CONTENT-GUIDE.md`, `docs/content-review/README.md`

## 1. Goal

The owner wants many more produce (2026-11-13). This spec adds ten cultivated fruits, vegetables,
herbs and nuts grown in Bulgaria whose harvest months a Bulgarian source states, with every
optional block (nutrition, photo, storage) only where it is sourced. It also records why about
thirty other candidates are left out: no source with months, a variety of an existing entry, a
wild-gathered plant, or a plant whose page would need a safety caution. No fact is invented, and
gradinata.bg is not cited.

## 2. User stories

- As a reader, I want to see when Jerusalem artichokes, endive, pistachios, mulberries, lemon
  balm, cress, Chinese cabbage, Japanese quince, chickpeas and sweet potatoes are in season in
  Bulgaria.
- As a reader, I want nutrition facts and a photo where a reliable source exists, and no invented
  value where none does.
- As the owner, I want every month traceable to a quoted sentence, and wild or unsafe candidates
  left for a batch that can show cautions.

## 3. Scope

### In scope

10 new produce entries and two new groups (`smradlikovi`, `povetitsovi`).

| Slug              | Name          | Latin name                      | Kind      | Group               | Optional blocks                       |
| ----------------- | ------------- | ------------------------------- | --------- | ------------------- | ------------------------------------- |
| `zemna-yabalka`   | Земна ябълка  | Helianthus tuberosus            | vegetable | `slozhnotsvetni`    | Latin name, nutrition, photo          |
| `endivia`         | Ендивия       | Cichorium endivia               | vegetable | `slozhnotsvetni`    | Latin name, nutrition                 |
| `shamfastak`      | Шамфъстък     | Pistacia vera                   | nut       | `smradlikovi` (new) | Latin name, nutrition, photo          |
| `chernitsi`       | Черници       | Morus                           | fruit     | `chernichevi`       | Latin name, nutrition, storage, photo |
| `matochina`       | Маточина      | Melissa officinalis             | herb      | `ustnotsvetni`      | Latin name, photo                     |
| `kreson`          | Кресон        | Lepidium sativum                | vegetable | `krastotsvetni`     | Latin name, nutrition                 |
| `kitaysko-zele`   | Китайско зеле | Brassica rapa subsp. pekinensis | vegetable | `krastotsvetni`     | Latin name, nutrition, photo          |
| `yaponska-dyulya` | Японска дюля  | Chaenomeles japonica            | fruit     | `rozotsvetni`       | Latin name, storage                   |
| `nahut`           | Нахут         | Cicer arietinum                 | vegetable | `bobovi`            | Latin name, nutrition, photo          |
| `sladak-kartof`   | Сладък картоф | Ipomoea batatas                 | vegetable | `povetitsovi` (new) | Latin name, nutrition, photo          |

- **Names and Latin names.** The names are the titles of the Bulgarian Wikipedia articles
  („Земна ябълка“ for топинамбур, „Шамфъстък“, „Маточина“, „Кресон“, „Японска дюля“, „Нахут“,
  „Сладък картоф“, „Черница“ in the plural as on the site) or of the cited Български фермер
  articles („Ендивия“, „Китайско зеле“). Latin names come from the taxobox of the same Bulgarian
  Wikipedia article; the mulberry article names only the genus _Morus_ (white and black mulberry
  are both grown), so the entry gives the genus. Endive (_Cichorium endivia_) and Chinese cabbage
  (_Brassica rapa_ subsp. _pekinensis_, the heading „pe-tsai“ cabbage; Български фермер 6181121
  says it is grown „като обикновеното“ head cabbage) follow the English Wikipedia articles
  „Endive“ and „Napa cabbage“, as spec 052 did for the blueberry.
- **Kind of chickpeas:** `vegetable`, like `bob` (a dry legume, spec 053).
- **New groups** (names as in the Bulgarian Wikipedia taxoboxes):
  - `smradlikovi`: „Смрадликови“ (_Anacardiaceae_). bg.wikipedia „Смрадликови“: „Сред по-важните в
    икономическо отношение видове спадат смрадликата, шамфъстъкът, мангото, шмакът, кашуто …“
    Description: „Семейство на шамфъстъка, мангото и кашуто.“
  - `povetitsovi`: „Поветицови“ (_Convolvulaceae_). bg.wikipedia „Сладък картоф“ (taxobox
    „семейство: Поветицови (Convolvulaceae)“). Description: „Семейство на сладкия картоф и
    поветицата.“
- **Docs:** rows in `docs/content-review/README.md` and a line in the „Seed data status“ of
  `docs/CONTENT-GUIDE.md`.
- **Spec 053 test:** `sladak-kartof` leaves the list of left-out produce in
  `tests/unit/content/vegetables-herbs-053.test.ts`, because this spec found the Bulgarian source
  with harvest months that spec 053 lacked (the owner allowed a retry on that condition).

### Out of scope (candidates left out)

**Need a safety caution (for the wild/cautions batch):**

| Candidate                                     | Reason                                                                                                                                                                                                                    |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Годжи бери (_Lycium barbarum_)                | Agrozona „Годжи Бери - всичко, което трябва да знаем …“ (2019-03-27): „неузрелите плодове са може да бъдат опасни“. Months exist (Български фермер 12628459: „от втората половина на септември до първите есенни слани“). |
| Камчатска боровинка (_Lonicera kamtschatica_) | Months exist (Български фермер 19272138: „Зреенето на плодчетата започва през юни-юли“), but most _Lonicera_ berries are toxic look-alikes; the page cannot show that caution.                                            |
| Физалис                                       | Unripe fruit and the husk need a caution (Solanaceae); not researched further.                                                                                                                                            |
| Шафран                                        | Toxic look-alike (autumn crocus, _Colchicum_).                                                                                                                                                                            |
| Кервел                                        | Look-alikes among wild Apiaceae (hemlock).                                                                                                                                                                                |
| Момордика                                     | Seeds and unripe fruit need a caution.                                                                                                                                                                                    |

**Wild-gathered (for the wild batch):** ирга (_Amelanchier ovalis_ is the wild Bulgarian species,
bg.wikipedia „Обикновена ирга“), тученица (portulaca), щир, глог, трънки, мурсалски чай; and the
owner's list бъз, левурда, коприва, глухарче, лапад.

**A variety of an existing entry (same species and the same eaten part):** салата айсберг
(`marulya`), магданозен корен (`magdanoz`, the owner's rule), шалот (`luk`), зелен чесън (`chesan`),
черна ряпа and дайкон (`repichki`, _Raphanus sativus_), патисон (`tikvichki`, _Cucurbita pepo_),
дръжкова целина (`tselina` lists celery as a variety), люти чушки (`piper`), савойско зеле (`zele`),
романеско (`karfiol`), бяла ряпа (= `ryapa`), червено зеле (owner). Mangold and Chinese cabbage share
a species with `tsveklo` and `ryapa` but not the eaten part; the existing catalog already keeps such
pairs apart (`bob` and `zelen-fasul`), so Chinese cabbage is added; mangold is left out for lack of
a source (below).

**No Bulgarian source with harvest months (searched on bgfermer.bg, agrozona.bg and
bg.wikipedia.org on 2026-11-13):**

| Candidate                                                     | What the sources say                                                                                                                                                      |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Цариградско грозде                                            | Български фермер 21047709: „Плодовете узряват 2 месеца след цъфтежа“, „Растението цъфти рано“; no month.                                                                  |
| Радикио / цикория                                             | Български фермер 1848907 gives only sowing („втората половина на март - началото на април“); no harvest month.                                                            |
| Кориандър                                                     | Agrozona gives sowing („през есента или рано напролет“); Български фермер 10092136 dates only the seeds („Семена от анасон, копър, кориандър“ in August), not the leaves. |
| Резене                                                        | Български фермер 17559607 gives sowing („през лятото - юли–август“) and seedlings; no harvest month.                                                                      |
| Манголд                                                       | Български фермер 13320773 gives sowing and „до пролетта се берат пресни листа“ from stored plants; the Wikipedia months are „в средноевропейските страни“.                |
| Майорана, шнитлук                                             | No growing article with months; bg.wikipedia „Сибирски лук“ dates only the seeds („узряват през лятото“).                                                                 |
| Бруква, полска салата                                         | No Bulgarian article found.                                                                                                                                               |
| Листна горчица                                                | Български фермер 12577189: „Най-подходящо е да се реколтира като лятна или пролетна култура“ — no month and no species named.                                             |
| Черен корен                                                   | Agrozona: „Кореноплодите се прибират 100 дни след поникване“ after „ранна пролет“ sowing; no month.                                                                       |
| Леща                                                          | Български фермер 19918561: „Лещата се прибира, когато узреят над 50% от чушките“; no month.                                                                               |
| Сминдух, стевия                                               | Български фермер 11088602 („Цъфти около юни“) and 20536159 („Листа могат да се берат през цялата вегетация“); no harvest month.                                           |
| Анасон                                                        | Only the August seed list of 10092136 in a medicinal-plant article; not a growing source.                                                                                 |
| Аспержов фасул (вигна)                                        | Agrozona „Що е то аспержов фасул“, Български фермер 8918772 and 7443886: sowing only.                                                                                     |
| Актинидия аргута, азимина, пекан, кивано                      | Articles describe the plant; none gives a ripening month for Bulgaria.                                                                                                    |
| Сладка царевица                                               | Unchanged from spec 053: „във фаза млечна зрялост“, no month.                                                                                                             |
| Лавандула, лайка                                              | Not eaten as produce (oil and tea crops).                                                                                                                                 |
| Маслини, мандарини, лимони, едамаме, соя, сусам, тиквено семе | Not a Bulgarian fresh-produce crop with a source, or not produce (seeds for oil).                                                                                         |

- **Regions:** none of the ten is counted by province or NUTS2 region in the МЗХ bulletins
  (bulletin № 468 counts them, if at all, inside „Други зеленчуци“; bulletin № 448 has no
  pistachio, mulberry or Japanese quince). Every entry omits `regions` (spec 042).
- **Growing guides, varieties, FAQ, how to choose, preparation, traditional uses, organic:** none.
- **Farms and recipes:** no links.

## 4. Domain model

No change. 10 `produce` entries and 2 `groups` entries under the existing schemas.

## 5. Behaviour and edge cases

### Season levels (editorial mapping)

No official monthly calendar exists (`docs/content-review/README.md`). The levels follow the rule
of specs 052 and 053 as the owner restated it for this batch:

- **peak:** a month the cited source names for the harvest or ripening, including a month it names
  only in part („края на септември“, „средата на септември“);
- **available:** a month read from a vague phrase („през цялата зима“, „по-късното лято“,
  „началото на есента“, „ранна пролет“, „края на лятото“) or derived from another fact (a sowing
  window plus growing time); every derivation is written out below;
- **storage:** a month after harvest that a source covers with a storage statement.

All pages were fetched on 2026-11-13. Quotes are verbatim. Български фермер articles are cited
with title and publication date.

| Slug              | Months and levels                          | Source and quote                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| ----------------- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `zemna-yabalka`   | 10–11 peak; 12, 1, 2 available             | „Запазете обелките на гулията“ (2022-01-15, https://www.bgfermer.bg/Article/10645018): „Наесен, през октомври и ноември, извадете новообразуваните ризоми, но оставете такива и в почвата, за да се възстанови растението.“ „Зеленчуци, които могат да зимуват в градината“ (2022-10-31, https://www.bgfermer.bg/Article/12919294): „Те успешно презимуват в почвата през цялата зима и могат да се вадят отново през пролетта. В много райони, предимно по-топлите, прибирането на реколтата от земна ябълка продължава през цялата зима и приключва през пролетта.“ „през цялата зима“ is read as December–February (available, the source limits it to „много райони, предимно по-топлите“); „приключва през пролетта“ names no month, so no spring month is shown.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `endivia`         | 6–7, 10–12 peak                            | Agrozona „Ендивия: Забравеното съкровище на градината“ (2024-11-30, https://agrozona.bg/endiviya-zabravenoto-sakrovishte-na-gradinata/): „Пролетният вид ендевия се засява през февруари в топъл парник и се прибира юни-юли. Сеитбата на есенния вид е през юли на студени лехи, като продукцията е готова през октомври-декември.“ Български фермер „Ендивия – малко познат листен зеленчук, който крие много ползи“ (2022-12-29, https://www.bgfermer.bg/Article/13378788), escarole: „Салатата е готова през октомври – ноември.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `shamfastak`      | 9 peak                                     | „Къде е подходящо да се отглежда шам-фъстък“ (2017-10-24, https://www.bgfermer.bg/Article/6510048): „Цъфтежът, в зависимост от метеорологичните условия, протича от средата на април до началото на май. Плодовете узряват до края на септември.“ September is the only month named for ripening.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `chernitsi`       | 6–8 peak                                   | bg.wikipedia „Черница“ (https://bg.wikipedia.org/wiki/Черница): „Плодовете узряват през юни – август.“ Storage text from the same article: „Запазват се 1 – 2 дни, ако се държат в хладилник, без да са измити предварително. Измиват се преди консумация.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `matochina`       | 5–6 peak; 7 available; 8 peak; 9 available | „Билките през май“ (2013-05-10, https://www.bgfermer.bg/Article/1974861): „През този красив месец … се берат листата на маточината“. Agrozona „Най-известните пет билки“ (2019-07-24, https://agrozona.bg/nay-izvestnite-pet-bilki/): „Прибира се чрез окосяване на няколко пъти. Обикновено реколти се прибират през юни, по-късното лято и началото на есента.“ „Кои лечебни растения се берат през август?“ (2021-08-22, https://www.bgfermer.bg/Article/10092136): „Листа от бяла акация, бяла бреза, малина, къпина, маточина и други“. „Култивирана маточина“ (2017-01-14, https://www.bgfermer.bg/Article/5991443): „Листата обикновено се берат на 2-3 пъти преди цъфтеж.“ „по-късното лято“ is read as July–August (August is already named) and „началото на есента“ as September.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `kreson`          | 3–6, 9 available                           | „Много зелено и свежо, или просто кресон“ (2023-02-03, https://www.bgfermer.bg/Article/13667226): „Кресонът се сее от ранна пролет до настъпване на горещините, а след това отново в края на лятото. Препоръчително е да се засява през 7-10 дни, тъй като става готов за по-малко от месец“; „Около 2-3 седмици след поникването кресът може да се бере.“ The article mixes two plants: its opening names are those of watercress („воден крес, поточарка или мокреш“, which „в природата расте край извори, потоци и реки“), while the rest describes garden cress („Градинският кресон е с произход Североизточна Африка и Югозападна Азия“, „едногодишно растение е“). The sowing passage applies to garden cress, _Lepidium sativum_: it describes an annual sown from seed every 7–10 days „в плитки сандъчета или саксии“ and eaten as sprouts or young leaves, which is how garden cress is grown; watercress is a perennial of running water. Derived: „ранна пролет“ is read as March and „до настъпване на горещините“ as the end of May, so sowings from 1 March to 31 May are ready within a month: March to June. For the second crop the conservative reading is kept: „в края на лятото“ is read as the last days of August, so that crop is ready in September only, and August is not shown. A month counts when any day of it falls in a harvest window (spec 053 rule for arugula). Months: March, April, May, June, September, all `available`. |
| `kitaysko-zele`   | 10–11 peak                                 | „Китайското зеле се отглежда като обикновеното“ (2017-04-21, https://www.bgfermer.bg/Article/6181121): „Може да изберете и есенното отглеждане, което между другото се предпочита от повечето градинари. При него се сее в края на юли и през август. Прибирането става през октомври, ноември.“ „Празът и китайското зеле се сеят директно в лехата“ (2023-04-24, https://www.bgfermer.bg/Article/14275035): „За китайското зеле може да изберете и есенно отглеждане, което между другото се предпочита от повечето градинари. При него се сее в края на юли и през август. Прибирането става през октомври - ноември.“ No source dates a spring crop, so none is shown.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| `yaponska-dyulya` | 9–10 peak; 11 available; 12, 1, 2 storage  | „Японската дюля е най-рано цъфтящият вид“ (2010-12-20, https://www.bgfermer.bg/Article/714425): „Годните за консумация плодове са закръглени до 6 см в диаметър, жълто-зелени и узряват в края на септември-октомври.“ and „Плодовете са кръгли, подобни на дюли, вкусни и много ароматни. Узряват в късна есен и при добро съхранение се запазват в свеж вид до февруари.“ The article describes the genus _Chaenomeles_ („От това растение са известни 4 вида, които се срещат в Китай и Япония“), not _C. japonica_ alone; the Latin name follows the Bulgarian Wikipedia article. September and October are named, so they are `peak`. „Узряват в късна есен“ is a vague phrase: late autumn is read as November, which is `available`. Storage covers December to February, the months after November up to „до февруари“. Bulgarian Wikipedia „Японска дюля“ (https://bg.wikipedia.org/wiki/Японска_дюля): „Плодът не годен за консумация суров.“ and „Плодовете на японската дюля са ядливи само след преработка. Могат да се използват за мармалад, желе и приготвяне на пай като заместител на братовчеда му, истинската дюля (Cydonia oblonga).“ The summary states this („Не се ядат сурови – използват се за мармалад и желе“). A `preparation` caution can follow once spec 055 is merged.                                                                                                                                                              |
| `nahut`           | 7–8 available                              | Български фермер „Нахутът е с висок потенциал и добра възвращаемост“ (2017-08-24, https://www.bgfermer.bg/Article/6405332): „Нахут се сее рано напролет, при първа възможност.“; „Поникването отнема между 2 и 3 седмици“; „Времето от поникване до узряване и жътва е кратко, често в рамките на 120 дни“. Derived: „рано напролет“ is read as March, so sowings from 1 to 31 March emerge 14–21 days later, from 15 March to 21 April; 120 days after emergence gives a harvest window from 13 July to 19 August. A month counts when any day of it falls in the window (the cress rule), so July and August are shown, both `available` because they are derived. Supporting context only: Agrozona „Рекордно големи площи с нахут засяха в Добричко“ (2018-07-28, https://agrozona.bg/rekordno-golemi-ploshti-s-nahut-zasyaha-v-dobrichko/) forecast that harvest for one season („Предстои жътвата на протеиновата култура в края на месеца“); it reports no harvest and is not used for a month or in the summary.                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| `sladak-kartof`   | 9–10 peak                                  | „Сортове сладък картоф, толерантни на вредители, се избират за професионално отглеждане“ (2024-03-15, https://www.bgfermer.bg/Article/17353461): „За условията на България времето за прибиране обикновено е подходящо в средата на септември - началото на октомври.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |

### Nutrition (USDA SR Legacy, April 2018)

Values are copied from the SR Legacy CSV and checked by `tests/unit/content/usda-nutrition.test.ts`
after `pnpm content:usda`. Only raw records are used. Micronutrients follow spec 043: those at
≥ 15 % of the EU reference intake per 100 g, highest share first, at most six; when fewer than three
reach 15 %, the next highest are added to show three.

| Slug            | FDC id | SR Legacy description                                      |
| --------------- | ------ | ---------------------------------------------------------- |
| `zemna-yabalka` | 169236 | Jerusalem-artichokes, raw                                  |
| `endivia`       | 168412 | Endive, raw                                                |
| `shamfastak`    | 170184 | Nuts, pistachio nuts, raw                                  |
| `chernitsi`     | 169913 | Mulberries, raw                                            |
| `kreson`        | 168407 | Cress, garden, raw                                         |
| `kitaysko-zele` | 169979 | Cabbage, chinese (pe-tsai), raw                            |
| `nahut`         | 173756 | Chickpeas (garbanzo beans, bengal gram), mature seeds, raw |
| `sladak-kartof` | 168482 | Sweet potato, raw, unprepared                              |

- **No nutrition:** `matochina` (SR Legacy has no lemon balm record) and `yaponska-dyulya` (no
  Chaenomeles record; „Quinces, raw“ is _Cydonia oblonga_).
- **Chickpeas** are the raw dry seed, like `bob`.

### Storage texts

- `chernitsi`: „Черниците са нетрайни: в хладилник, неизмити, издържат 1–2 дни. Измий ги точно
  преди ядене.“ (bg.wikipedia „Черница“, quoted above).
- `yaponska-dyulya`: „При добро съхранение плодовете се запазват свежи до февруари.“ (Article
  714425). Its summary adds that the fruit is not eaten raw (Bulgarian Wikipedia „Японска дюля“).

### Editorial text

The chickpea summary restates Article 6405332 („рано напролет“, „около 120 дни“) and names no place. The sweet potato
summary („Попари ли слана върховете, не отлагай прибирането“) restates Article 17353461: „При
кратка сутрешна слана върховете на сладките картофи умират - сигурен знак, че прибирането на
реколтата не може да се отлага повече.“

Summaries are 70–160 characters, „ти“ voice where they address the reader, restate only the
quoted facts, and contain no health claims („богат“, „полез“, „лекува“, „действие“). The lemon
balm summary speaks of the leaves and their harvest only, not of the medicinal uses in the
sources. Every entry has `updatedAt: 2026-11-13`.

### Photos (spec 015)

Unsplash photos downloaded through the Unsplash download endpoint (the MCP `download_asset`),
centre-cropped to 4:3, 1600 × 1200 px JPEG at quality 80 without metadata, stored as
`src/assets/produce/<slug>.jpg`. Each was checked visually.

| Slug            | Author            | Unsplash photo                          |
| --------------- | ----------------- | --------------------------------------- |
| `zemna-yabalka` | Ela Mar           | https://unsplash.com/photos/wsJJ-tSct2g |
| `shamfastak`    | Kairi Kaljo       | https://unsplash.com/photos/ES9YQ5HAwPI |
| `chernitsi`     | Dmytro Bukhantsov | https://unsplash.com/photos/oXWN5kByryQ |
| `matochina`     | Victor Serban     | https://unsplash.com/photos/whTrv7kvGJY |
| `kitaysko-zele` | Jason Leung       | https://unsplash.com/photos/BCXgdJJ5nPY |
| `nahut`         | Karyna Panchenko  | https://unsplash.com/photos/5352eOUYay4 |
| `sladak-kartof` | Glen Hayoge       | https://unsplash.com/photos/k0MigzUz-vI |

The lemon balm photo is identified by its author as _Melissa officinalis_. No photo: endive (no
Unsplash result), cress (only seedlings in trays), Japanese quince (the only fruit photo could not
be identified as _Chaenomeles_ with certainty).

### Printed calendar

The calendar grows from 80 to 90 produce rows. The print test of spec 053 allows
`max(2, ceil(rows / 30))` sheets, three for 90 rows; no print style changes.

## 6. Accessibility requirements

- WCAG 1.1.1: every photo has a Bulgarian `alt` of 10–120 characters that describes the photo.
- WCAG 3.1.2: Latin names render with `lang="la"` (existing component).
- Entries without regions, nutrition or photo leave those sections out (spec 049); no empty
  headings or lists.
- No new components; the existing e2e axe checks cover every produce and group page.

## 7. SEO requirements

- Each produce page gets its title from the name and its meta description from the summary
  (70–160 characters), unique per page; produce without nutrition use the season title (spec 052
  AC12).
- Internal links: produce ↔ group (two new group pages), produce ↔ month and, where nutrition is
  given, produce ↔ nutrient pages, all generated from the data.
- No region links (no regions).

## 8. Acceptance criteria

1. **AC1:** Given the produce collection, then it contains the 10 slugs of section 3, each valid
   under the content schema, with the kind, group and Latin name of section 3.
2. **AC2:** Given each new produce, then its season months and levels equal section 5's table.
3. **AC3:** Given each new produce with nutrition, then it cites the FDC record of section 5 by its
   item URL and SR Legacy description; `matochina` and `yaponska-dyulya` have no nutrition. (The
   spec 032 test checks the values against the extract.)
4. **AC4:** Given each new produce, then it names no province and no file cites gradinata.bg.
5. **AC5:** Given each new produce with a photo in section 5, then the photo file exists, is
   1600 × 1200, and its credit is the listed Unsplash photo; the others have no photo.
6. **AC6:** Given each new produce, then its summary, storage text and photo `alt` contain no
   „богат“, „полез“, „лекува“ or „действие“, the summary is 70–160 characters, it has no
   traditional uses and no organic block, and `updatedAt` is 2026-11-13.
7. **AC7:** Given the left-out candidates, then no produce entry has their slug: the caution list
   (`godzhi-beri`, `kamchatska-borovinka`, `fizalis`, `shafran`, `kervel`, `momordika`), the wild
   list (`irga`, `tuchenitsa`), the variety list (`salata-aysberg`, `shalot`, `zelen-chesan`,
   `cherna-ryapa`, `patison`, `magdanozen-koren`) and the unsourced list (`tsarigradsko-grozde`,
   `radikio`, `koriandar`, `rezene`, `mangold`, `mayorana`, `leshta`, `brukva`,
   `polska-salata`).
8. **AC8:** Given the new groups, then `smradlikovi` is _Anacardiaceae_ and `povetitsovi` is
   _Convolvulaceae_.
9. **AC9:** Given the content checklist and the content guide, then the checklist has a row per
   new produce and the content guide's „Seed data status“ names spec 056.
10. **AC10:** Given the storage texts of section 5, then `chernitsi` and `yaponska-dyulya` have a
    storage text and the other new produce have none.

## 9. Test plan

| AC   | Test type | Test file                                   |
| ---- | --------- | ------------------------------------------- |
| AC1  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC2  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC3  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC4  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC5  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC6  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC7  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC8  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC9  | unit      | `tests/unit/content/cultivated-056.test.ts` |
| AC10 | unit      | `tests/unit/content/cultivated-056.test.ts` |

The printed calendar is covered by `tests/e2e/calendar-page.spec.ts` (spec 053 formula).

## 10. Third-party documentation consulted

No new third-party API. Content sources (all fetched 2026-11-13):

| Source                                                                                                                                                                                             | Used for                                                           |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| USDA FoodData Central, SR Legacy CSV (April 2018), the 8 FDC ids of section 5                                                                                                                      | Nutrition                                                          |
| bgfermer.bg articles 10645018, 12919294, 13378788, 6510048, 1974861, 10092136, 5991443, 13667226, 6181121, 14275035, 714425, 6405332, 17353461                                                     | Seasons, storage                                                   |
| agrozona.bg „Ендивия: Забравеното съкровище на градината“, „Най-известните пет билки“, „Рекордно големи площи с нахут засяха в Добричко“                                                           | Seasons                                                            |
| bg.wikipedia.org „Черница“, „Земна ябълка“, „Шамфъстък“, „Маточина“, „Кресон“, „Японска дюля“, „Нахут“, „Сладък картоф“, „Смрадликови“, „Поветицови“, „Обикновена ирга“, „Сибирски лук“, „Манголд“ | Season (mulberry), names, Latin names, groups, left-out candidates |
| en.wikipedia.org „Endive“, „Napa cabbage“                                                                                                                                                          | Latin names                                                        |
| bgfermer.bg 12628459, 19272138, 21047709, 1848907, 17559607, 13320773, 12577189, 19918561, 11088602, 20536159, 8918772, 7443886, 15268259; agrozona.bg goji, черен корен, аспержов фасул articles  | Left-out candidates                                                |
| Unsplash photo pages in section 5                                                                                                                                                                  | Photos                                                             |

## 11. QA review (2026-11-13)

No `qa-reviewer` subagent could be launched from this session; the reviewer checklist was followed
manually, and the full unit, type, lint, build, html-validate and e2e runs passed.
`tests/unit/content/cultivated-056.test.ts` carries the regression checks („QA 056“):

| Finding                                                                                                                            | Fix                                                                          |
| ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| AC7 listed iceberg lettuce as `ayzberg`; `Slug.fromBulgarian('Салата айсберг')` is `salata-aysberg`, so the check could never fail | Slug corrected; a test derives the left-out slugs from their Bulgarian names |
| The chickpea summary turned one 2018 Dobrich news report into a general rule („В Добричко се прибира през юли“)                    | The summary dates the harvest to the 2018 report                             |
| The sweet potato summary's frost sentence had no quote in the spec                                                                 | Quoted under „Editorial text“                                                |

Second QA round (2026-11-13). `tests/unit/content/cultivated-056.test.ts` carries the regression
checks (AC2, AC4, AC7 and „QA 056“):

| Finding                                                                                                                                         | Fix                                                                                                                                                                    |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The chickpea season and summary rested on a 2018 Agrozona forecast („Предстои жътвата …“), not a harvest report, and the summary named Добричко | Season derived from Български фермер 6405332 (July–August, `available`); summary without the Dobrich event; AC4 also checks that no summary names a province or region |
| The Japanese quince summary omitted that the fruit is not eaten raw, as its own Bulgarian Wikipedia article states                              | Summary rewritten from the article; article quoted in section 5                                                                                                        |
| „Узряват в късна есен“ is vague, so November is not storage                                                                                     | November `available`; December–February `storage`                                                                                                                      |
| The cress article mixes watercress and garden cress, and August rested on a generous reading of „в края на лятото“                              | The species basis is written out; August dropped, September kept                                                                                                       |
| Article 14275035 was called „the same sentence“; 714425 describes the genus                                                                     | Quoted verbatim; genus noted                                                                                                                                           |
| The left-out slugs were typed by hand                                                                                                           | Derived from a list of Bulgarian names with `Slug.fromBulgarian`                                                                                                       |
