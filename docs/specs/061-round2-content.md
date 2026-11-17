# 061. Content and safety, round 2

- **Status:** Approved
- **Bounded context(s):** recipes (recipe data, altitude bands by town), geography (`Region.seat`,
  region data), catalog (cautions, nutrient rankings, micronutrient data, growing guide), farms
  (organic certificate link), UI (recipe facts card, nutrient ranking table, farm labels and
  sources, methodology page), CMS (Keystatic config)
- **Related:** spec 011 (nutrient pages), spec 043 (micronutrient selection), spec 048 (recipes),
  spec 051 (farms), spec 055 and 057 (wild produce and cautions), spec 058 (safety and content
  accuracy), persona usability tests round 2 (P1–P6, 2026-11-17), `docs/CONTENT-GUIDE.md`.
  Navigation, search and accessibility findings of the same round are spec 062.

## 1. Goal

A second persona round (six simulated users, 2026-11-17) found content that is still inconsistent
or incomplete: recipe steps that give only the time up to 300 m while the card gives every band,
and no way to know the altitude of your town; an elder page whose season strip and look-alike
warning say less than its text; a methodology sentence that contradicts the sea-buckthorn ban; two
oregano cautions that read as unrelated rules; no spurge look-alike on purslane; nutrient tables
without a source line and rankings that miss foods because each produce lists at most six
micronutrients; NUTS2 statistics that read as a province ranking; one „Сеитба“ label for sowing
seedlings and sowing in the bed; and an organic badge that cannot be checked. This spec fixes each
with sourced facts or rewording. It adds no invented data: every new fact is quoted in section 5,
gradinata.bg is not used and Wikipedia is not a source.

## 2. User stories

- As a home canner in Sofia, I want the steps to send me to the time for my altitude and the page
  to tell me how high my town is, so that I do not use the lowland time.
- As a forager, I want the elder page to say that бъзак is poisonous and to show the same harvest
  months as its text.
- As a forager, I want the methodology to say plainly that wild sea buckthorn is not gathered at
  all, while other garden crops that grow wild have gathering limits.
- As a forager who cannot tell white oregano from common oregano, I want to know which rule to
  follow.
- As a forager, I want to be warned about the purslane look-alike.
- As a sceptical reader, I want the nutrient table to say where its numbers come from, and the
  ranking to include every food that reaches the claim threshold.
- As a reader of a province page, I want to know when a figure is about the statistical region and
  not about the province.
- As a gardener, I want to know whether a month is for sowing seedlings or for sowing in the bed.
- As a buyer, I want to open the organic certificate and to know how to check one myself.

## 3. Scope

### In scope

1. **Recipe steps and town altitudes.** The water-bath step of every recipe names no minutes; it
   sends the reader to the „Във водна баня“ card for the altitude of the place where they boil. For
   the recipes with two jar sizes (pear and peach compote, sauerkraut) the step says the card is for
   jars up to 950 мл and that jars up to 470 мл take 5 minutes less (true in every band of each
   NCHFP table, see 5.1). This also removes the pear compote mismatch between the card (25 min) and
   the step (20 min). The facts card lists the province seats of Bulgaria by altitude band: each
   band shows the towns whose ЕКАТТЕ altitude group lies in it, and a town whose group spans two
   bands is named separately with both bands (Смолян, 700–999 m, for a 900 m boundary). The
   altitude groups come from the НСИ ЕКАТТЕ register and are stored as `seat` on each region.
2. **Elder.** The summary no longer says the harvest „starts“ in mid-August (which implies later
   months): it says the berries are picked in August, from the middle of the month. September is
   not added: no source found dates the berries in September (search in 5.2). The flowers keep no
   months: the only dated source found is not acceptable (5.2). The бъзак look-alike gains the Latin
   name _Sambucus ebulus_ from its own source, and a new `look-alike` caution says бъзак is
   poisonous, from a scientific review.
3. **Sea buckthorn and the methodology.** The methodology sentence „ако береш дивата им форма,
   важат същите правила“ becomes: follow the cautions of the page; wild sea buckthorn is protected
   and is not gathered at all, and for others, such as raspberries, sorrel and oregano, the law
   limits the amount.
4. **Oregano.** The two `protected` cautions are reworded so they read as one rule set: the
   Закон за лечебните растения lists both white and common oregano (2 kg stems a day for personal
   needs, a permit for trade); the 2026 МОСВ order bans gathering white oregano from the wild
   except for personal needs; if you do not know which oregano it is, gather only for personal
   needs. The last clause is a reading of the two sources, not a new fact.
5. **Purslane.** A `look-alike` caution names spurges (_Euphorbia maculata_): a spurge gives a
   milky sap when a stem or leaf is broken and is not succulent. Source: Penn State Extension.
6. **Nutrient table source.** Under every nutrient ranking table: „Източник: USDA FoodData
   Central, SR Legacy (по продукт) – записът е посочен на страницата на всеки продукт.“ with a link
   to FoodData Central.
7. **Nutrient ranking coverage.** Root cause: the spec 043 rule lists the micronutrients at ≥ 15 %
   of the reference intake „at most six“, and older entries (walnuts, dill, parsley, leek) list
   fewer than the rule gives. Walnuts list five and leave out iron (2.91 mg, 20.8 %) and potassium.
   Fix: the cap is removed. Every USDA produce lists **every** mapped micronutrient that its record
   gives at ≥ 15 % (highest share first), except the chestnut manganese left out in spec 044 (the
   record includes the inner skin); the rule that fills up to three with lower shares stays. The
   ranking table and „В сезон сега“ list only produce at or above the 15 % claim threshold, so the
   list is complete for what it shows and the filler rows below 15 % no longer make it look
   complete when it is not. Produce without nutrition (rose hip, sloe, rowan, medlar, elder and the
   other wild or herb entries without a raw SR Legacy record) cannot be ranked; the note under the
   table says so. Pomegranate stays out of the vitamin C ranking: 10.2 mg is 12.75 %, below the
   threshold. The values come from the USDA extract already checked by
   `tests/unit/content/usda-nutrition.test.ts`, so the data stays the single build-time source.
8. **Region statistics wording.** The eleven produce whose province notes quote NUTS2 figures
   (`yagodi`, `dini`, `papeshi`, `zele`, `shipka`, `domati`, `patladzhan`, `piper`, `kartofi`,
   `luk`, `krastavitsi`) start the note with the statistical region: „Южният централен район (в
   който е областта) има най-много … сред районите в страната – …“. The same note is shown on the
   produce „Откъде“ block and on the region page. Province-level notes (orchard bulletin) are not
   changed: they already rank the province.
9. **Garden sowing labels.** A new growing activity `sowSeedlings` („Сеитба на разсад“) next to
   `sow` („Сеитба“), and `transplant` is labelled „Разсаждане навън“. Months move from `sow` to
   `sowSeedlings` only where the produce's own sourced note or source says the seed is sown for
   seedlings (5.6). `sow` stays „Сеитба“, not „Сеитба в лехата“: for several produce without a
   transplant month (tikvichki „в съоръжения“, praz, marulya in September, tsveklo) the sources do
   not say the seed goes straight into the bed, so a stronger label would not be faithful.
10. **Organic certificate.** The farm `organic` block gains a required `url` (the certificate in the
    EU TRACES directory). The organic label becomes a link to it and shows the certificate number;
    the farm's source list labels that link „Сертификат в TRACES (ЕС): <номер>“; the methodology
    explains how to check a certificate in the EU list of organic operators, citing the European
    Commission page.

### Out of scope

- Navigation, search and accessibility (spec 062); children and wild berries (no source, as in
  spec 058); altitude-specific seasons; elder flower months (no acceptable source).
- „Сеитба в лехата“ for produce whose sources do not say so (see item 9).

## 4. Domain model

- **Geography `Region.seat?: RegionSeat`** with `RegionSeat { town: string; altitude: { fromMetres:
number; toMetres?: number }; source: RegionSource }`. `toMetres` is absent for the open top group
  („1000 и повече“). Schema: `seat` optional on a region, `fromMetres` a non-negative integer,
  `toMetres` an integer above `fromMetres`.
- **Recipes `townsByAltitudeBand(processingMinutes, bands, towns)`** (application, pure): returns
  one entry per band (`fromMetres`, `toMetres?`, `minutes`, `towns`) with the towns whose whole
  group lies in the band (`group.from ≥ band.from` and `group.to < next band.from`), and a list of
  `spanning` towns with the bands they touch. Towns keep the given order (alphabetical by the
  caller). The recipes context does not import geography: towns are plain `AltitudeTown { name,
fromMetres, toMetres? }`.
- **Catalog `GrowingActivity`** gains `sowSeedlings` (first in calendar order: sowSeedlings, sow,
  transplant, plant). `GrowingGuideInput.sowSeedlings` is optional (default empty).
- **Catalog `NutrientRanking.entries`** contains only entries with a claim level (≥ 15 %).
- **Farms `OrganicCertificate.url: string`** (https), required.

## 5. Behaviour and edge cases

### 5.1 Recipes

NCHFP tables already quoted in spec 048 / 058 (`safety.sterilisation`): pears hot pack 20/25/30/35
(pints) and 25/30/35/40 (quarts); peaches raw pack 25/30/35/40 and 30/35/40/45; sauerkraut hot pack
10/15/20 and 15/20/25. In every band the quart time is the pint time + 5, so „5 минути по-малко“ for
jars up to 470 мл is exact. A test derives it from the sterilisation text.

Town altitudes: НСИ, Национален регистър на населените места, ЕКАТТЕ
(https://nrnm.nsi.bg/ekatte/territorial-units, JSON archive „Свали архив в Json“ downloaded
2026-11-17). The field description `Ekat_str.txt`: „ALTITUDE Char 1 - Надморска височина. Код /
Групи (в метри): 1 до 49 вкл.; 2 50 - 99 вкл.; 3 100 - 199 вкл.; 4 200 - 299 вкл.; 5 300 - 499
вкл.; 6 500 - 699 вкл.; 7 700 - 999 вкл.; 8 1000 и повече“. The province seats (`ek_obl.json` →
`ek_atte.json`):

| Region           | Town           | ЕКАТТЕ | Group (`text`) |
| ---------------- | -------------- | ------ | -------------- |
| `blagoevgrad`    | Благоевград    | 04279  | 300 - 499      |
| `burgas`         | Бургас         | 07079  | 0 - 49         |
| `varna`          | Варна          | 10135  | 0 - 49         |
| `veliko-tarnovo` | Велико Търново | 10447  | 100 - 199      |
| `vidin`          | Видин          | 10971  | 0 - 49         |
| `vratsa`         | Враца          | 12259  | 300 - 499      |
| `gabrovo`        | Габрово        | 14218  | 300 - 499      |
| `dobrich`        | Добрич         | 72624  | 200 - 299      |
| `kardzhali`      | Кърджали       | 40909  | 200 - 299      |
| `kyustendil`     | Кюстендил      | 41112  | 500 - 699      |
| `lovech`         | Ловеч          | 43952  | 100 - 199      |
| `montana`        | Монтана        | 48489  | 100 - 199      |
| `pazardzhik`     | Пазарджик      | 55155  | 200 - 299      |
| `pernik`         | Перник         | 55871  | 500 - 699      |
| `pleven`         | Плевен         | 56722  | 50 - 99        |
| `plovdiv`        | Пловдив        | 56784  | 100 - 199      |
| `razgrad`        | Разград        | 61710  | 200 - 299      |
| `ruse`           | Русе           | 63427  | 0 - 49         |
| `silistra`       | Силистра       | 66425  | 0 - 49         |
| `sliven`         | Сливен         | 67338  | 200 - 299      |
| `smolyan`        | Смолян         | 67653  | 700 - 999      |
| `sofia-grad`     | София          | 68134  | 500 - 699      |
| `stara-zagora`   | Стара Загора   | 68850  | 200 - 299      |
| `targovishte`    | Търговище      | 73626  | 100 - 199      |
| `haskovo`        | Хасково        | 77195  | 100 - 199      |
| `shumen`         | Шумен          | 83510  | 200 - 299      |
| `yambol`         | Ямбол          | 87374  | 100 - 199      |

`sofiyska` has no seat: its administrative centre is also София, which is listed once under
`sofia-grad`. The group of a town is for the settlement as registered; the card says that parts of
a town can lie higher or lower and that the band is for the place where you boil.

Edge cases: a group that ends exactly below a band start (200–299 with a 300 band) is inside the
lower band; a group that starts at a band start (300–499) is inside that band; a group that crosses
a band start (700–999 with 900) is spanning; an open top group (1000+) is spanning whenever a higher
band exists. A band with no town shows no town list.

### 5.2 Wild produce cautions

| Entry        | Change                                                                                                                                                                                                             | Source (quoted)                                                                                                                                                                                                                                                                                                                                                                               |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cheren-baz` | Summary: „Черният бъз (свирчовина) цъфти в края на пролетта, а плодовете се берат през август – от средата на месеца. Зелените плодчета не се берат.“                                                              | Български фермер 7636932: „Периодът от средата на август е много подходящ за добив на плод“; „Цъфтят в края на пролетта.“                                                                                                                                                                                                                                                                     |
| `cheren-baz` | `look-alike` (reworded): „Не го бъркай с бъзака (Sambucus ebulus): той е тревисто растение до 2 м и цъфти през юни–юли, а черният бъз е дърво до 3–5 м, цъфтящо в края на пролетта.“                               | Български фермер 7636932: „Sambucus ebulus е познат като бъзак, бъзвуняк, бъзе, бъзей, тревист бъз и др.“ plus the quotes of spec 057.                                                                                                                                                                                                                                                        |
| `cheren-baz` | New `look-alike`: „Бъзакът (Sambucus ebulus) е отровно растение – заради токсичността му употребата му като храна е ограничена.“                                                                                   | Jiménez P, Tejero J, Cordoba-Diaz D, Quinto EJ, Garrosa M, Gayoso MJ, Girbés T. „Ebulin from dwarf elder (Sambucus ebulus L.): a mini-review.“ Toxins 2015;7(3):648–658, doi 10.3390/toxins7030648 (PMID 25723322, PMC4379516): „Sambucus ebulus L. (dwarf elder) is a medicinal plant, the usefulness of which also as food is restricted due to its toxicity.“; „since the plant is toxic“. |
| `tuchenitsa` | New `look-alike`: „Тученицата прилича на стелещите се млечки (Euphorbia maculata): млечката пуска бял млечен сок, щом счупиш стъбло или лист, и не е месеста като тученицата.“                                     | Penn State Extension, „Purslane“ (updated September 11, 2025, https://extension.psu.edu/purslane): „The prostrate nature of purslane is similar to knotweed and spotted spurge, but there are distinct differences. Spurge produces a milky sap when a stem or leaf is broken. … Neither spurge nor knotweed is succulent like purslane.“                                                     |
| `rigan`      | `protected` (ЗЛР, reworded): „Белият и обикновеният риган са в списъка на Закона за лечебните растения: за лични нужди можеш да набереш до 2 кг стръкове на ден, а за търговия ти трябва позволително.“            | ЗЛР (FAOLEX copy) Приложение към чл. 1, ал. 2: „Риган бял Origanum vulgare L. ssp. hirtum (Link.) Jetswaart (O. heracleoticum L.) Lamiaceae“, „Риган обикновен Origanum vulgare L. Lamiaceae“; § 1, т. 18, б) „стръкове - до 2 кг“.                                                                                                                                                           |
| `rigan`      | `protected` (order, reworded): „През 2026 г. заповед на МОСВ забранява брането на бял риган (Origanum vulgare ssp. hirtum) от природата освен за лични нужди. Ако не знаеш кой риган е, бери само за лични нужди.“ | Заповед № РД-178/2026, т. II.4 „Събирането на билки от естествените им находища на територията на цялата страна от следните видове лечебни растения: … – Риган бял (Origanum vulgare L. ssp. Hirtum (Link) Ietswaart);“; т. II.5 „Ограниченията и забраните по настоящата заповед не се отнасят за количествата билки, събирани за лични нужди …“ (spec 057).                                 |

Search record (content guide: official, poison centre and scientific first, press as fallback):

- **Elder in September:** web searches for Bulgarian official, scientific and farming sources
  („черен бъз плодовете узряват август септември“, „„черен бъз“ плодове „август-септември““,
  „bgfermer лечебни растения септември бъз“) found no acceptable source that dates the berries in
  September; September is not added.
- **Elder flower months:** one result (medpedia.framar.bg) gives May–June; it is not an official,
  scientific or editorial farming source, so the flowers keep no months.
- **Бъзак toxicity:** PubMed „"Sambucus ebulus"[tiab] AND (poison*[tiab] OR intoxicat*[tiab] OR
  toxic*[tiab])“ (29 records, 2026-11-17); no poison-centre page was found. The 2015 review is the
  one that states the plant's toxicity for food use; Jiménez 2013 (Toxicon, PMID 23142777) and
  Ebrahimzadeh 2007 (PMID 19090303) are animal studies and are not cited. The Bulgarian name is
  confirmed by the ЗЛР list: „Бъз нисък (Бъзак) Sambucus ebulus L.“.
- **Purslane look-alike:** PubMed „(Portulaca[tiab] OR purslane[tiab]) AND (Euphorbia[tiab] OR
  spurge[tiab])“ (7 records): none names spurge as a purslane look-alike. No poison-centre source
  found. Penn State Extension (a university extension publication, the same class of source the
  recipes accept) names spotted spurge and how to tell it apart; the Latin name of spotted spurge
  is from University of Idaho Extension BUL 998 „Spotted Spurge (Chamaesyce maculata; Synonym:
  Euphorbia maculata)“ and UW–Madison Extension „Spotted spurge … They secrete a milky sap
  (characteristic of the euphorbia family) when broken“. The caution states identification only, no
  toxicity, because the Penn State page does not state it.

### 5.3 Methodology texts

- Wild: „… не отбелязваме така. Ако береш дивата им форма, спазвай предупрежденията на страницата
  им: дивата облепиха е защитен вид и изобщо не се бере, а за други, като малините, киселеца и
  ригана, законът ограничава количеството.“ (raspberry, sorrel and oregano each have a ЗЛР
  caution; sea buckthorn has the ЗБР caution.)
- Nutrition: adds „В класациите по хранително вещество са продуктите, които достигат поне 15 % от
  референтния прием на 100 г. Продукти без хранителни стойности не могат да се класират.“
- Farms: adds „Можеш сам да провериш биосертификат: Европейската комисия публикува списък на
  биологичните оператори в ЕС и техните сертификати (TRACES). Потърси производителя или номера на
  сертификата и виж срока на валидност и продуктите.“ with a link „Списък на биологичните
  оператори в ЕС (TRACES)“. Source: European Commission, „Organic farming“
  (https://agriculture.ec.europa.eu/farming/organic-farming_en): link „List of organic operators in
  the EU – Database of the organic operators in the EU and their certificates“ →
  https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/index. The
  ВКУСнаГРАДИНА certificate PDF shows „I.1 Document number“, the control body „COSMOCERT
  (BG-BIO-18)“, the validity period and the product list.

### 5.4 Nutrients

Micronutrients added from the USDA extract (`tests/fixtures/usda/sr-legacy-extract.json`), each
≥ 15 % of its EU reference intake: `bob` fosfor 301; `bosilek` vitamin-c 18, magneziy 64;
`dzhodzhen` vitamin-c 13.3, magneziy 63; `gluharche` med-cu 0.171; `kopar` folat 150, kaliy 738;
`kreson` med-cu 0.17; `magdanoz` kaliy 554; `mashterka` vitamin-a 238, folat 45, fosfor 106;
`menta` vitamin-a 212, magneziy 80; `nahut` magneziy 79; `orehi` kaliy 441, zhelyazo 2.91; `praz`
mangan 0.481; `rozmarin` vitamin-a 146, magneziy 91; `shamfastak` folat 51; `spanak` mangan 0.897.
`kesteni` keeps manganese out (spec 044). Each list is re-sorted by share, highest first, ties by
slug.

### 5.5 Region notes

Each NUTS2 note keeps its figures and source and only changes its subject:
„Областта е в Южния централен район, който има …“ → „Южният централен район (в който е областта)
има …“; „Югозападния“ → „Югозападният“, „Югоизточния“ → „Югоизточният“; „Столицата е в …“ → „…
(в който е столицата) …“. „най-много … в страната“ and „най-голямата … сред районите в страната“
become „… сред районите в страната“, so the superlative is about regions.

### 5.6 Sowing seedlings

| Produce       | `sowSeedlings` | `sow` kept | Source wording                                                                                                                                                                                                              |
| ------------- | -------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `domati`      | 2, 3           | –          | Български фермер „Календар на сеитбите“ (9378131): „около 10-и февруари се засява разсадът за ранно полско производство на домати“, „През първата половина на месеца … се засява разсадът за средноранните домати.“         |
| `piper`       | 1, 2, 3        | –          | Same: „се извършва сеитбата на разсада за ранно полско производство на пипер“, „се засява разсадът за ранен полски пипер“, „се засява и средноранният пипер“.                                                               |
| `tselina`     | 3              | –          | Български фермер 7466953: „Целината се отглежда основно чрез разсад.“; 9670112: „Целината се отглежда чрез предварително произведен разсад.“                                                                                |
| `krastavitsi` | 3              | 4, 6, 7    | Its note: „Разсада сей в края на март; директно в лехата – от втората половина на април, а за късна реколта – от края на юни до началото на юли.“; „Календар на сеитбите“: „се засява разсадът за краставици … на открито“. |
| `brokoli`     | 6              | –          | Its note: „Сей разсада през първата половина на юни …“                                                                                                                                                                      |
| `karfiol`     | 5, 6, 7        | –          | Its note: „… сей разсада от края на май до края на юли …“                                                                                                                                                                   |
| `patladzhan`  | 1, 2, 4        | –          | Its note: „Разсада за ранен патладжан сей от края на януари до средата на февруари, за късен – през април …“                                                                                                                |
| `zele`        | 2, 4, 6        | –          | Its note: „Ранното сей през февруари, средноранното – през април, късното – в началото на юни; разсаждай съответно …“                                                                                                       |
| `marulya`     | 1              | 9          | Its note: „Разсада за пролетна маруля сей около 15–20 януари …“; September is not dated as seedlings.                                                                                                                       |

`tikvichki` (no transplant month; „сей през март в съоръжения“) and `tsveklo` keep `sow`.

### 5.7 Farms

`vkusnagradina.organic.url`:
https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/BG-BIO-18.100-0004936.2026.001.pdf
(already in its sources). The label reads „Био · COSMOCERT (BG-BIO-18), сертификат №
BG-BIO-18.100-0004936.2026.001“ and links there. When the certificate has expired, nothing is shown
(unchanged).

## 6. Accessibility requirements

- 1.3.1: the town list is a `ul` per band with the band as text; the spanning towns are a sentence.
  The source line under the ranking table is a `p` after the table, not inside the caption (the
  caption stays short and names the scroll region).
- 2.4.4: the organic link text names the certifier and certificate number; the TRACES source link
  text names TRACES and the number; the methodology link text names the list.
- 3.1.2: the English source names (Toxins, Penn State) get `lang="en"` through `SourceLink`.
- 2.5.8: the new links are inline text links in running text (exception).
- Without CSS and without JavaScript every new text is in reading order.

## 7. SEO requirements

- No new routes; titles and descriptions unchanged. Internal links unchanged.
- The organic link is an external link to an official certificate (`rel="noopener"`).

## 8. Acceptance criteria

1. **AC1:** Given any recipe, when its water-bath step is read, then it contains „Във водна баня“,
   „надморска височина“ and „от момента, в който водата заври“ and no number of minutes.
2. **AC2:** Given a recipe with jars up to 950 мл, when its step is read, then it says the card is
   for jars up to 950 мл and jars up to 470 мл take 5 minutes less, and its sterilisation text
   gives a 470 мл time 5 minutes below the 950 мл time in every band.
3. **AC3:** Given the regions data, when it is parsed, then every region except `sofiyska` has a
   `seat` whose town and altitude group equal the ЕКАТТЕ table in 5.1 and whose source is the НСИ
   register; the schema rejects a seat with `toMetres` not above `fromMetres`.
4. **AC4:** Given bands (до 300: 25, 300–900: 30, 900–1800: 35, над 1800: 40) and towns with groups
   0–49, 200–299, 300–499, 500–699, 700–999 and 1000+, when `townsByAltitudeBand` runs, then the
   first two are in the first band, the next two in the second, 700–999 spans the second and third
   bands and 1000+ spans the third and fourth.
5. **AC5:** Given a recipe and towns, when the facts card renders, then it lists the towns under
   each band with their minutes, names spanning towns with both bands, and cites the НСИ source.
6. **AC6:** Given the elder entry, then its summary has no „започва“, its season is August only,
   one look-alike names „Sambucus ebulus“ and another says бъзак is „отровно“ with the Toxins review
   as source.
7. **AC7:** Given the methodology, then the wild text no longer contains „важат същите правила“ and
   says wild sea buckthorn „изобщо не се бере“.
8. **AC8:** Given oregano, then it has exactly two `protected` cautions: the ЗЛР one names both
   „Белият“ and „обикновеният“ риган, the order one starts „През 2026 г.“ and tells the reader who
   does not know the oregano to gather only for personal needs.
9. **AC9:** Given purslane, then it has a `look-alike` caution naming „Euphorbia“ and „млечен
   сок“ sourced from extension.psu.edu.
10. **AC10:** Given a nutrient ranking, when the table renders, then a line „Източник: USDA
    FoodData Central, SR Legacy (по продукт)“ with a link to fdc.nal.usda.gov follows it.
11. **AC11:** Given produce with 36.6, 12 and 5.9 mg vitamin C (RI 80), when the ranking is built,
    then the entries are only 36.6 and 12 (≥ 15 %).
12. **AC12:** Given every USDA-sourced produce, then it lists every mapped micronutrient its
    extracted record gives at ≥ 15 % of the reference intake (except chestnut manganese).
13. **AC13:** Given the produce data, then no region note starts „Областта е в“ or „Столицата е в“,
    and every note that names a statistical region starts with it and says „(в който е“.
14. **AC14:** Given a growing guide with `sowSeedlings`, then the labels are „Сеитба на разсад“,
    „Сеитба“, „Разсаждане навън“ and „Засаждане“, in that order for a month with all of them; and
    the data of 5.6 is in the produce files.
15. **AC15:** Given ВКУСнаГРАДИНА, when its page and a produce page render, then the organic label
    links to the TRACES PDF and shows the certificate number, the source list labels that link
    „Сертификат в TRACES (ЕС): BG-BIO-18.100-0004936.2026.001“, and the methodology links the EU
    list of organic operators.

## 9. Test plan

| AC   | Test type        | Test file                                                                                              |
| ---- | ---------------- | ------------------------------------------------------------------------------------------------------ |
| AC1  | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC2  | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC3  | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC4  | unit             | `tests/unit/contexts/recipes/townsByAltitudeBand.test.ts`                                              |
| AC5  | component        | `tests/components/AltitudeTowns-061.test.ts`                                                           |
| AC6  | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC7  | unit             | `tests/unit/content/round2-061.test.ts`                                                                |
| AC8  | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC9  | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC10 | component        | `tests/components/NutrientRankingTable-061.test.ts`                                                    |
| AC11 | unit             | `tests/unit/contexts/catalog/application/NutrientRankingService-061.test.ts`                           |
| AC12 | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC13 | unit (content)   | `tests/unit/content/round2-061.test.ts`                                                                |
| AC14 | unit + component | `tests/unit/contexts/catalog/domain/GrowingGuide-061.test.ts`, `tests/unit/content/round2-061.test.ts` |
| AC15 | component + e2e  | `tests/components/FarmLabels-061.test.ts`, `tests/e2e/round2-061.spec.ts`                              |

## 10. Third-party documentation consulted

| Package / source                      | Version / date | Source                                                                                             | Topic                                   |
| ------------------------------------- | -------------- | -------------------------------------------------------------------------------------------------- | --------------------------------------- |
| astro (Container API, `astro/zod`)    | as installed   | existing usage in `tests/components/*` and `src/contexts/*/infrastructure/schemas.ts` (no new API) | component tests, optional schema fields |
| НСИ ЕКАТТЕ                            | 2026-11-17     | https://nrnm.nsi.bg/ekatte/territorial-units, JSON archive and `Ekat_str.txt`                      | altitude groups of the province seats   |
| PubMed E-utilities                    | 2026-11-17     | https://eutils.ncbi.nlm.nih.gov/entrez/eutils/                                                     | бъзак and purslane searches             |
| Toxins 2015;7(3):648–658              | 2015           | https://pmc.ncbi.nlm.nih.gov/articles/PMC4379516/                                                  | бъзак toxicity                          |
| Penn State Extension „Purslane“       | 2025-09-11     | https://extension.psu.edu/purslane                                                                 | spurge look-alike                       |
| Закон за лечебните растения           | FAOLEX copy    | https://faolex.fao.org/docs/pdf/bul40297.pdf                                                       | oregano, бъзак names                    |
| European Commission „Organic farming“ | 2026-11-17     | https://agriculture.ec.europa.eu/farming/organic-farming_en                                        | TRACES list of organic operators        |
| Български фермер                      | as dated       | https://www.bgfermer.bg/Article/9378131, /7466953, /9670112, /article/7636932                      | sowing seedlings, бъзак name            |
