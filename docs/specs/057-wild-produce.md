# 057. Wild produce

- **Status:** Approved
- **Bounded context(s):** catalog (content data)
- **Related:** spec 055 (wild flag and cautions), specs 043, 052 and 053 (wild plants left out
  until the page could show cautions), spec 049 (season-only produce), spec 056 (cultivated
  produce, in parallel: it adds `chernitsi` and `matochina`)

## 1. Goal

Owner decision (2026-11-13): add wild-gathered plants, showing the season only (no traditional
uses). Spec 055 built the `wild` flag and the sourced „Внимание“ section; this spec fills them with
content. It adds twelve wild plants and two cultivated fruits that need a caution, adds sourced
cautions to four existing entries, and records why the other candidates are left out. Every month
and every caution is quoted from a page fetched on 2026-11-13. Nothing is invented.

## 2. User stories

- As a reader, I want to know when nettle, dandelion, ramsons, elder, hawthorn, sloe, wild
  strawberry, bilberry, lingonberry, rowan, barberry and purslane are in season in Bulgaria.
- As a forager, I want each wild plant's look-alikes, toxic parts, preparation and gathering rules
  before anything else on its page, each with its source.
- As a reader of the sea buckthorn, oregano, thyme and chestnut pages, I want to learn that wild
  sea buckthorn and some thymes are protected, that white oregano may not be gathered commercially
  in 2026, and that the horse chestnut is not edible.
- As the owner, I want unsafe, protected or unsourced candidates left out, with the reason.

## 3. Scope

### In scope

Fourteen new produce entries (twelve with `wild: true`) and five new groups.

| Slug                   | Name                | Latin name            | Kind      | Group            | Wild | Nutrition (FDC) | Photo         |
| ---------------------- | ------------------- | --------------------- | --------- | ---------------- | ---- | --------------- | ------------- |
| `kopriva`              | Коприва             | Urtica dioica         | vegetable | `koprivovi`      | yes  | –               | `yaKZ4f0tZ4Y` |
| `gluharche`            | Глухарче            | Taraxacum officinale  | vegetable | `slozhnotsvetni` | yes  | 169226          | `f-02pTFLV14` |
| `levurda`              | Левурда             | Allium ursinum        | vegetable | `amarilisovi`    | yes  | –               | –             |
| `cheren-baz`           | Черен бъз           | Sambucus nigra        | fruit     | `meshkovitsovi`  | yes  | 171727          | `ITFBAchRAiI` |
| `glog`                 | Глог                | Crataegus monogyna    | fruit     | `rozotsvetni`    | yes  | –               | –             |
| `tranka`               | Трънка              | Prunus spinosa        | fruit     | `rozotsvetni`    | yes  | –               | –             |
| `gorska-yagoda`        | Горска ягода        | Fragaria vesca        | fruit     | `rozotsvetni`    | yes  | –               | –             |
| `cherna-borovinka`     | Черна боровинка     | Vaccinium myrtillus   | fruit     | `pirenovi`       | yes  | –               | –             |
| `chervena-borovinka`   | Червена боровинка   | Vaccinium vitis-idaea | fruit     | `pirenovi`       | yes  | –               | –             |
| `ofika`                | Офика               | Sorbus aucuparia      | fruit     | `rozotsvetni`    | yes  | –               | –             |
| `kisel-tran`           | Кисел трън          | Berberis vulgaris     | fruit     | `kiselotranovi`  | yes  | –               | –             |
| `tuchenitsa`           | Тученица            | Portulaca oleracea    | vegetable | `tuchenitsovi`   | yes  | –               | –             |
| `godzhi-beri`          | Годжи бери          | Lycium barbarum       | fruit     | `kartofovi`      | no   | –               | –             |
| `kamchatska-borovinka` | Камчатска боровинка | Lonicera kamtschatica | fruit     | `nokatovi`       | no   | –               | –             |

- **Bilberry vs blueberry.** The existing `borovinki` („Боровинки“) is the cultivated highbush
  blueberry _Vaccinium corymbosum_ (spec 052). `cherna-borovinka` („Черна боровинка“) is the wild
  bilberry _Vaccinium myrtillus_, a different species; its summary says „Дивата черна боровинка“
  and its Latin name is shown, so the two pages are not ambiguous.
- **Godji and haskap** are cultivated (`wild: false`); spec 056 handed them over because they need
  a caution.
- **New groups** (Bulgarian names as in the bg.wikipedia taxobox or family article):
  - `koprivovi`: „Копривови“ (_Urticaceae_). bg.wikipedia „Обикновена коприва“, taxobox:
    „семейство: Копривови (Urticaceae)“. Description: „Семейство на копривата.“
  - `meshkovitsovi`: „Мешковицови“ (_Adoxaceae_). bg.wikipedia „Мешковицови“: „Мешковицови
    (Adoxaceae) е малко семейство двусемеделни растения“; „Родове … Sambucus – Бъз … Viburnum –
    Калина“. The article adds that recent sources treat the family as _Viburnaceae_ (the name in the
    „Черен бъз“ taxobox, which has no Bulgarian name); the Bulgarian article name is used.
    Description: „Семейство на бъза и калината.“
  - `kiselotranovi`: „Киселотрънови“ (_Berberidaceae_). bg.wikipedia „Обикновен кисел трън“,
    taxobox: „семейство: Киселотрънови (Berberidaceae)“. Description: „Семейство на киселия трън.“
  - `tuchenitsovi`: „Тученицови“ (_Portulacaceae_). bg.wikipedia „Тученица“, taxobox: „семейство:
    Тученицови (Portulacaceae)“. Description: „Семейство на тученицата.“
  - `nokatovi`: „Нокътови“ (_Caprifoliaceae_). bg.wikipedia „Бъзови“: „Бъзови, също нокътови,
    (Caprifoliaceae) са семейство покритосеменни растения“, illustrated with _Lonicera_ species. The
    alternative name „Нокътови“ is used so that the family of honeysuckles is not confused with the
    elder (бъз, `meshkovitsovi`). Description: „Семейство на лоницерите, сред които е камчатската
    боровинка.“
  - Reused: `slozhnotsvetni` (Asteraceae), `amarilisovi` (Amaryllidaceae; bg.wikipedia „Левурда“:
    „семейство: Кокичеви (Amaryllidaceae)“, the same family under the site's existing name),
    `rozotsvetni`, `pirenovi`, `kartofovi` (Solanaceae, for _Lycium_).
- **Cautions on existing entries** (`wild` stays `false`, `updatedAt` stays 2026-11-13):
  `oblepiha` (protected), `rigan` (protected), `mashterka` (protected), `kesteni` (look-alike).
- **Docs:** rows in `docs/content-review/README.md`, the „Seed data status“ of
  `docs/CONTENT-GUIDE.md`, and three caution rules in the guide: (1) search official, poison-centre
  and scientific sources (PubMed) first; an editorial Bulgarian farming article (bgfermer.bg,
  agrozona.bg) is a fallback only, must state the fact about this species and about people, may only
  add cautions and is never a reason to omit a known toxic look-alike; a plant whose known deadly
  look-alike has no acceptable source is not published; (2) a ЗЛР caution states the
  personal-needs amounts and the permit rule; (3) protected ЗБР Приложение 3 relatives that a
  gatherer could confuse with the plant are named in their own `protected` caution.
- **Test amendments:** spec 043 AC1 („nettle is left out“) and spec 053 AC1 (left-out `kopriva`,
  `gluharche`, `levurda`) were true only while the page could not show cautions; their tests now
  check the other left-out candidates only. Spec 056 left out goji, haskap and purslane for this
  spec; its test (`cultivated-056.test.ts`, AC7) no longer lists them.

### Out of scope (candidates left out)

| Candidate                                                                             | Reason                                                                                                                                                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Лапад (`lapad`)                                                                       | Re-check confirms spec 053: Български фермер 8416350 („Билките през април“) dates it only by its title; the article treats dock as a garden plant („Засяват се след последния мраз“, „Румексите могат да се засяват директно в градината“). The only „caution“ (7409171, „Измива се и се попарва лападът.“) is a recipe step. Wild _Rumex_ is already covered by `kiselets`.       |
| Бяла куча лобода                                                                      | The only month source (Български фермер 21562939, „Лободата се бере през лятото“) does not name the species: it calls it „бяла сладка трева“, and „лобода“ also names _Atriplex_. The species cannot be tied to the source.                                                                                                                                                        |
| Дива череша                                                                           | The month source (ИАГ „Горските плодове“: „Обикновената (дива) череша … Плодовете узряват през юни-юли“) gives no caution, so `wild: true` is impossible (spec 055). _Prunus avium_ is not on the Закон за лечебните растения list, where „Махалебка (Дива череша) Prunus mahaleb L.“ uses the same name for another species. As a cultivated entry it would duplicate `chereshi`. |
| Обикновена хвойна                                                                     | The only source (ДГС „Ракитово“ plan) gives medicine, perfumery and spirits as uses („Използват се в официалната и народната медицина, в парфюмерията и за производство на някои спиртни напитки“), no food use, and warns „При вътрешна употреба и предозиране са възможни отравяния!“. _Juniperus communis_ could not be found on the ЗЛР list. Medicinal only.                  |
| Маточина, бяла черница                                                                | Covered by spec 056 (`matochina`, `chernitsi`).                                                                                                                                                                                                                                                                                                                                    |
| Шипка, мента, малина, къпина                                                          | Already on the site (`shipka`, `menta`, `malini`, `kapini`); no wild duplicate.                                                                                                                                                                                                                                                                                                    |
| Червен бъз, змиярник (as cautions)                                                    | No official, scientific or press source found names red elder as a look-alike of black elder or arum (_Arum_) as a look-alike of ramsons, so neither appears in a caution (Wikipedia is not a caution source).                                                                                                                                                                     |
| Мечо грозде                                                                           | Medicinal only and on the 2026 countrywide ban list (Заповед № РД-178/2026, т. II.4: „– Мечо грозде (Arctostaphyllos uva-urs i (L.) Spreng);“).                                                                                                                                                                                                                                    |
| Иглика                                                                                | ЗБР Приложение 4 and on the 2026 quota list (т. I: „– Иглика лечебна (Primula veris L.);“); medicinal only.                                                                                                                                                                                                                                                                        |
| Дива морква, бучиниш, бъзак, момина сълза, мразовец, конски кестен                    | Toxic or confusable with deadly hemlock; never added as produce.                                                                                                                                                                                                                                                                                                                   |
| Кавказка боровинка, черно френско грозде, черен емпетрум, българска круша, дива круша | Fully protected (ЗБР Приложение 3) or a protected relative and no month source.                                                                                                                                                                                                                                                                                                    |
| Киселица, диви аспержи, хмел, щир, мушмула (wild), мехунка, липа, бял равнец, лайка   | No harvest-month source, ЗБР Приложение 4, medicinal only, or already on the site (`mushmuli`).                                                                                                                                                                                                                                                                                    |

- **Regions:** none. Forest management plans name forestry units (ДГС „Ракитово“, „Омуртаг“,
  „Елена“), not provinces; no official source ranks provinces for wild plants. Every entry omits
  `regions` (spec 042).
- **Traditional uses, growing guides, FAQ, preparation, storage, organic:** none (owner decision:
  the season only).
- **Farms and recipes:** no links.

## 4. Domain model

No change. 14 `produce` and 5 `groups` entries under the schemas of spec 055.

## 5. Behaviour and edge cases

### Season levels (editorial mapping, as in specs 052 and 053)

- **peak:** a month the cited source names for the harvest, ripening or gathering, including a
  month named only in part („втората половина на септември“);
- **available:** a month that is an editorial reading of a vague phrase („напролет“, „през
  лятото“, „до падане на първите снегове“, „до първите есенни слани“), or a month derived from
  other dates; each derivation is written out below.

| Slug                   | Months and levels       | Source and quote                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| ---------------------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `kopriva`              | 5–7 peak                | Български фермер „Дойде времето на прясната коприва“ (https://www.bgfermer.bg/Article/14721904): „младите листа, събрани от май до юли, са най-подходящи за готвене;“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      |
| `gluharche`            | 3–4 available           | Agrozona „Всички части на глухарчето са лековити“ (21.04.2017, https://agrozona.bg/vsichki-chasti-na-gluharcheto-sa-lekoviti/): „То цъфва през пролетта … Появява се през април и май“ and „Листата му се събират преди цъфтежа“, „Пресните листа са чудесни за салата“; Български фермер „Билките - плевел или лек“ (https://www.bgfermer.bg/Article/21562939): „Листата и цветовете напролет могат да се използват във свежо състояние“. The leaves are what is eaten, and they are gathered before flowering. Flowering is dated April–May, so the leaf months are derived: March (spring, before flowering) and April (flowering begins) are available; May is left out (in flower). No month is peak, because no source names a month for the leaves. |
| `levurda`              | 3–4 available           | Български фермер „Билките през април“ (https://www.bgfermer.bg/Article/8416350): „най-вече листата, събрани през пролетта“ and „Април е месецът, в който се появяват първите бели цветове, но тогава ароматът на листата намалява.“; „Левурда - от гората вече и в градината“ (https://www.bgfermer.bg/Article/10789085): „Щом растението започне да цъфти беритбата се прекратява.“ „Пролетта“ is vague; the harvest stops at flowering, which starts in April, so May is left out.                                                                                                                                                                                                                                                                       |
| `cheren-baz`           | 8 peak                  | Български фермер „Бъз за красота и здраве“ (04.09.2019, https://www.bgfermer.bg/article/7636932), on _Sambucus nigra_: „Периодът от средата на август е много подходящ за добив на плод, кора и корени от свирчовина.“ The season is the berries; no source names a later month. The summary dates the flowers from the same article: „Цветовете са бели, ароматни, събрани в големи съцветия. Цъфтят в края на пролетта.“ (no month is given, so the flowers have no months in the calendar). The Agrozona article that also lists „бъзак“ among the names of the plant is no longer used.                                                                                                                                                                |
| `glog`                 | 9 peak, 10 available    | Български фермер „Лечебни ползи от нестандартни плодове“ (https://www.bgfermer.bg/Article/7891605), on _Crataegus monogyna_: „Плодовете обикновено узряват още през септември, но се запазват до късно през зимата.“; „Два ценни продукта от природата“ (https://www.bgfermer.bg/Article/13121271): „Може да съберете глог през лятото или в началото на есента, в зависимост от това къде расте, да го изсушите, за да имате през зимните месеци.“ October is „в началото на есента“ (available). „През лятото“ is not used: 7891605 dates ripening to September. „До късно през зимата“ says the fruit stays on the shrub, not when to gather it.                                                                                                        |
| `tranka`               | 9–11 peak               | ДГС „Ракитово“, обяснителна записка (2020, https://pazardjik.iag.bg/data/docs/obiasnitelna_zapiska_DGS_Rakitovo.pdf), „44. Трънка - Prunus spinosa L.“: „Събират се … зрели плодове - предимно през септември - ноември“. Summary: Български фермер 19298463 „Плодовете на сините трънки стават меки и вкусни след първата слана.“; the same plan: „Среща се из цялата страна“.                                                                                                                                                                                                                                                                                                                                                                            |
| `gorska-yagoda`        | 6–9 peak                | ТП „ДГС Омуртаг“, обяснителна записка (2023, https://shumen.iag.bg/data/docs/ZAPISKA_OMURTAG.pdf): „Горска ягода - Fragaria vesca - … Расте масово в разсветлените гори, също из храсталаци, сечища и тревисти места … Плодоноси през юни - септември“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `cherna-borovinka`     | 8 peak                  | ДГС „Ракитово“ plan: „16. Черна боровинка – Vaccinium myrtillus L. … Расте от 1200 до 2200 м.н.в. из светли иглолистни и широколистни гори. Цъфти през юни-юли, плодоноси през август.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `chervena-borovinka`   | 8 peak                  | ДГС „Ракитово“ plan: „17. Червена боровинка - Vaccinium vitis-idaea L. Дребно вечнозелено храстче … Расте от 1000 до 2000 м.н.в. по каменисти и скални поляни и в иглолистни гори. Събират се листата през юни-юли и плодовете през август.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| `ofika`                | 9 peak, 10–11 available | ТП ДГС „Елена“, обяснителна записка (2024, https://vtarnovo.iag.bg/data/news/18625/_ZAPISKA_DGS-ELENA.pdf): „Офика - Sorbus aucuparia - дърво. … Събират се плодовете от септември до падане на първите снегове.“ „До падане на първите снегове“ is vague: October–November (available). Summary: Български фермер 19298463 „ДИЗАЙН: Дървета и храсти с цветни плодчета“: „други стават сладки и вкусни само след първата слана (калина, офика и трънки)“; 7891605: „От плодчетата се приготвят мармалади, желета, сиропи, оцет, алкохолни напитки.“                                                                                                                                                                                                       |
| `kisel-tran`           | 8–9 peak                | bg.wikipedia „Обикновен кисел трън“: „Узряват в края на лятото – в България узряват през август-септември.“; Български фермер „Лечебните корени се прибират наесен“ (https://www.bgfermer.bg/Article/7861773): „Кисел трън (Berberis vulgaris) - … цъфти с дребни жълти цветчета и плододава обилно. Плодчетата са овални, червени и се берат през септември.“                                                                                                                                                                                                                                                                                                                                                                                             |
| `tuchenitsa`           | 6–8 available           | Agrozona „Тученица – полезна за здравето билка или обикновен плевел?“ (https://agrozona.bg/tuchenitsa-polezna-za-zdraveto-bilka-ili-obiknoven-plevel/): „Растението се развива добре и на бедни почви, отстрани на пътечките и в задънените места на градината. … Най-лесно се намира през летните месеци.“; Български фермер 15617943: „Нейните листа и млади горни стъбла могат да се използват в храната, но трябва да се събират преди цъфтежа“. „Летните месеци“ is vague (available).                                                                                                                                                                                                                                                                |
| `godzhi-beri`          | 9 peak, 10 available    | Български фермер „Годжи бери плододава до първите есенни слани“ (26.09.2022, https://www.bgfermer.bg/Article/12628459): „Растението цъфти през юли и август, а плододава от втората половина на септември до първите есенни слани.“ September is named in part (peak); „до първите есенни слани“ is vague (October, available). Agrozona (below) gives ripening „от юли до октомври“ but gathering „по-късно през есента“; the Български фермер months are used.                                                                                                                                                                                                                                                                                           |
| `kamchatska-borovinka` | 6–7 peak                | Български фермер „Майска боровинка – декоративна и лечебна“ (09.11.2024, https://www.bgfermer.bg/Article/19272138): „Научно се нарича Lonicera kamtschatica“ and „Зреенето на плодчетата започва през юни-юли.“ Summary: „останалите лоницери са много красиви … но плодовете им не са ядливи.“                                                                                                                                                                                                                                                                                                                                                                                                                                                            |

### Cautions

Each caution has one source. Sources were searched in this order (content guide): official acts
and documents, poison centres and scientific publications (PubMed E-utilities, 2026-11-13), then
editorial Bulgarian farming articles. The PubMed searches and what they gave:

- „Colchicum autumnale“ with „Allium ursinum“: the two case series used for ramsons (PMID 33156711,
  16626006). „Arum“ with „Allium ursinum“: nothing that names arum as a ramsons look-alike.
- „Sambucus nigra[tiab] AND poisoning[tiab]“ and „Sambucus ebulus[tiab] AND poisoning[tiab]“: one
  ethnobotanical survey (PMID 39124271), no caution. The CDC report „Poisoning from Elderberry
  Juice -- California“ (MMWR 1984, PMID 6422238) says „uncooked berries may produce nausea“, but it
  concerns _Sambucus mexicana_, not _S. nigra_, so it is not cited. A search for _S. nigra_ found the
  2024 review in Research for Rural Development used below.
- „Urtica dioica“ with contact urticaria or stinging (62 records): none states the blanching or
  glove advice; the nettle cautions stay with Български фермер.
- „Lycium barbarum“ with unripe or immature and toxic (0 records), „Portulaca oleracea“ with oxalate
  and boiling or cooking (0 records): the goji and purslane cautions stay with Agrozona.
- „Aesculus hippocastanum[tiab] AND poisoning[tiab]“ (3 records): Yi and Lee 2021 (PMID 35000361)
  compares horse chestnut with the Korean chestnut _Castanea crenata_, not with _C. sativa_, so the
  chestnut caution keeps the Български фермер article that compares _Aesculus_ with the sweet
  chestnut.

„ЗЛР“ is the Закон за лечебните растения (обн. ДВ, бр. 29 от 2000 г., посл. изм. ДВ, бр. 58 от
2017 г.; FAOLEX copy, https://faolex.fao.org/docs/pdf/bul40297.pdf; lex.bg refused the download, and
the МОСВ link to the act points at a host that no longer resolves). The ЗЛР
`protected` caution says only what the act says:

- the plant is in „Приложение към чл. 1, ал. 2 Списък на лечебните растения, които попадат под
  разпоредбите на закона“ (row quoted per plant below);
- чл. 21, ал. 2: „Ползването на лечебните растения по чл. 20, ал. 1, т. 1 и 3, представляващо
  стопанска дейност, се извършва въз основа на позволително.“; ал. 3: „Позволително по ал. 2 не се
  изисква при събиране на билки за лични нужди от земи, гори и водни обекти - държавна и общинска
  собственост.“;
- § 1, т. 18: „"Билки за лични нужди" са количества билки в свежо състояние, събрани от едно лице в
  рамките на един ден, както следва: а) корени, коренища, луковици или грудки - до 1 кг; б)
  стръкове - до 2 кг; в) листа - до 1 кг; г) кори - до 0,5 кг; д) цветове - до 0,5 кг; е) семена -
  до 0,1 кг; ж) плодове - до 10 кг;“.

Its text follows one pattern: „<Plant> е в списъка на Закона за лечебните растения: за лични нужди
можеш да набереш <amounts> на ден, а за търговия ти трябва позволително.“ The ЗЛР list rows
(verbatim): „Глухарче обикновено Taraxacum officinale Web. Asteraceae“, „Лук мечи (Левурда) Allium
ursinum L. Liliaceae“, „Бъз черен Sambucus nigra L. Caprifoliaceae“, „Глог червен Crataegus
monogyna Jacq. Rosaceae“, „Трънка Prunus spinosa L. Rosaceae“, „Ягода горска Fragaria vesca L.
Rosaceae“, „Боровинка черна Vaccinium myrtillus L. Ericaceae“, „Боровинка червена Vaccinium
vitis-idaea L. Ericaceae“, „Офика Sorbus aucuparia L. Rosaceae“, „Тученица обикновена Portulaca
oleracea L. Portulacaceae“. _Urtica dioica_ could not be found in this copy (only „Коприва гръцка
Urtica urens L.“ on the page where it would be), so nettle has no ЗЛР caution.

The МОСВ order for 2026 is Заповед № РД-178 от 18 февруари 2026 г. (ДВ, бр. 24 от 2026 г.,
https://www.moew.government.bg/static/media/ups/tiny/filebase/Nature/Legislation/Zapovedi/MedicinalPlants/RD-178-18.02.2026-MedPlants.pdf,
a scan read page by page): т. I „Допустимите за събиране количества билки (кг сухо тегло) от
естествените находища извън територията на националните паркове, съгласно приложението, на
следните 11 вида лечебни растения: … – Трън кисел (Berberis vulgaris L.);“; т. II „Забранявам: 1.
Събирането в националните паркове на билки от видовете лечебни растения по т. I. 2. Събирането на
билки от естествените им находища от видовете лечебни растения по т. I извън количествата и
районите, определени в приложението към тази заповед.“; т. II.4 „Събирането на билки от
естествените им находища на територията на цялата страна от следните видове лечебни растения: …
– Риган бял (Origanum vulgare L. ssp. Hirtum (Link) Ietswaart);“; т. II.5 „Ограниченията и
забраните по настоящата заповед не се отнасят за количествата билки, събирани за лични нужди в
количества, съгласно § 1, т. 18 от допълнителните разпоредби на Закона за лечебните растения.“

The Закон за биологичното разнообразие is cited from the МОСВ copy
(https://www.moew.government.bg/static/media/ups/tiny/filebase/Nature/Legislation/ZAKON_za_biologichnoto_raznoobrazie24.pdf;
its header ends „доп., бр. 70 от 20.08.2024 г.“, and the source name reads „обн. ДВ, бр. 77 от
2002 г., посл. доп. ДВ, бр. 70 от 2024 г.“): чл. 37 „За защитени на територията на цялата страна се обявяват
дивите животински и растителни видове, посочени в приложение № 3.“; чл. 40, ал. 1 „За растителните
видове от приложение № 3 се забраняват: 1. брането, събирането, отрязването, изкореняването или
друг начин на унищожаване на екземпляри в техните естествени области на разпространение;“;
Приложение № 3 rows „Облепиха Hippophae rhamnoides“, „Прицветникова мащерка Thymus bracteosus“,
„Пиринска мащерка Thymus perinicus“, „Стоянова мащерка Thymus stojanovi“, „Дебърски бъз Sambucus
deborensis“, „Дребнолистен глог Crataegus microphylla“, „Ориенталски глог Crataegus stevenii“,
„Кавказка боровинка Vaccinium arctostaphyllos“.

| Slug                                                                                 | Kind        | Text (as in the YAML)                                                                                                                                                                   | Source and supporting quote                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------------------------------------------------------------------------------ | ----------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `kopriva`                                                                            | preparation | Работи с копривата с ръкавици и попари листата, преди да ги ядеш – иначе парят не само ръцете, но и езика и небцето.                                                                    | Български фермер 14721904: „когато работите с коприва, разбира се, е необходимо да използвате ръкавици;“ and „Не забравяйте да попарите зарзавата. В противен случай ще пари не само ръцете, но и езика и небцето.“                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `kopriva`                                                                            | allergy     | Копривата пари кожата, а ако имаш алергия, изгарянията стават още по-тежки.                                                                                                             | Български фермер „В сезона на свежата коприва“ (https://www.bgfermer.bg/Article/11372935): „изгарянията по кожата са доста болезнени, а ако има и алергия – нещата стават страшни...“                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| `gluharche`                                                                          | protected   | ЗЛР pattern: „до 1 кг листа и до 0,5 кг цветове“                                                                                                                                        | ЗЛР (rows and rules above)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `levurda`                                                                            | look-alike  | Листата на левурдата приличат почти на тези на момината сълза. Бери само растение, което познаваш със сигурност.                                                                        | Български фермер „Дивият чесън е красив и полезен“ (https://www.bgfermer.bg/Article/6966759): „Латинското му име е Allium ursinum L. … Има свежозелени продълговати листа, почти като на момина сълза.“ The second sentence is the site's advice that follows from it.                                                                                                                                                                                                                                                                                                                                                                                             |
| `levurda`                                                                            | look-alike  | Всички части на момината сълза, с която левурдата може да се сбърка, са силно отровни.                                                                                                  | Български фермер „Две сълзи с лечебни свойства“ (https://www.bgfermer.bg/Article/8551141): „Всички части на момината сълза са силно отровни, поради което приемът без консултация със специалист е рисков.“                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `levurda`                                                                            | look-alike  | Есенният мразовец съдържа силно отровния колхицин, а листата му се бъркат с левурдата. При описаните отравяния 35 % от хората са починали.                                              | Razinger G, Kozelj G, Gorjup V, Grenc D, Brvar M. „Accidental poisoning with autumn crocus (Colchicum autumnale): a case series.“ Clin Toxicol (Phila) 2021;59(6):493-499 (Centre for Clinical Toxicology and Pharmacology, Ljubljana; https://pubmed.ncbi.nlm.nih.gov/33156711/), abstract: „Colchicum autumnale (autumn crocus) is a plant that contains highly toxic alkaloid colchicine.“; „They all mistakenly ingested C autumnale's leaves instead of Allium ursinum in the spring“; „On review, we found 58 cases; 95% cases accidently ingested leaves of C autumnale instead of A ursinum.“; „The lethality of this and reviewed cases was 35% (26/74).“ |
| `levurda`                                                                            | look-alike  | Листата на левурдата имат типичен мирис и вкус на чесън, а тези на мразовеца – не. Ако листото не мирише на чесън, не го бери.                                                          | Hermanns-Clausen M, Schindler F, Stedtler U, Zilker T, Felgenhauer N. „[Poisoning by the autumn crocus plant].“ MMW Fortschr Med 2006;148(12):45-7 (Vergiftungs-Informations-Zentrale Freiburg; https://pubmed.ncbi.nlm.nih.gov/16626006/), abstract: „Confirmed cases of poisoning resulting from the ingestion of Colchicum autumnale in mistake for Allium ursinum were analysed retrospectively. The study included 32 patients“; „In addition, a diminished sense of smell may allow the absence of the typical garlic smell and taste of Allium ursinum to go unrecognised.“ The last sentence of the text is the site's advice that follows from it.        |
| `levurda`                                                                            | protected   | ЗЛР pattern: „до 1 кг листа“                                                                                                                                                            | ЗЛР                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `cheren-baz`                                                                         | toxic-part  | Никога не бери зелените плодчета. Презрелите плодове също не са подходящи.                                                                                                              | Български фермер 7636932: „Плодчетата в никакъв случай не бива да се берат зелени! Презрелите плодове също не са подходящи.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `cheren-baz`                                                                         | toxic-part  | Кората, листата, семките и неузрелите плодове на черния бъз съдържат цианогенни гликозиди.                                                                                              | Avena A, Ozola L, Ķeķe A. „Sambucus nigra fruits and their processing solutions: a review.“ Research for Rural Development 2024, vol. 39, Latvia University of Life Sciences and Technologies, DOI 10.22616/RRD.30.2024.011 (https://lbtufb.lbtu.lv/conference/Research-for-Rural-Development/2024/LBTU_LatviaResRuralDev_30th_2024-67-72.pdf): „It is important to note that the plant contains potentially toxic cyanogenic glycosides, particularly in the bark, leaves, seeds, and unripe fruits (Appenteng et al., 2021).“                                                                                                                                    |
| `cheren-baz`                                                                         | preparation | Плодовете съдържат цианогенни гликозиди и лектини, които са риск за здравето без обработка. Топлинната обработка ги намалява – не яж плодовете сурови.                                  | Same review: „This is particularly important due to the presence of cyanogenic glycosides and lectins in the fruits, which pose health risks if not properly processed.“; „given the presence of potentially harmful cyanogenic glycosides and lectins, which can be mitigated through heat treatment and fermentation.“; „Studies have shown that Sambucus nigra lectins are resistant to digestion unless they are heat-pre-treated.“ „Не яж плодовете сурови“ is the site's reading of „pose health risks if not properly processed“.                                                                                                                           |
| `cheren-baz`                                                                         | look-alike  | Не го бъркай с бъзака: той е тревисто растение до 2 м и цъфти през юни–юли, а черният бъз е дърво до 3–5 м, цъфтящо в края на пролетта.                                                 | Български фермер 7636932: „Черният бъз (Sambucus nigra) у нас е познат с наименованието свирчовина. Растението представлява малко дърво с височина до 3-5 метра“, „Цъфтят в края на пролетта.“, „Бъзакът е тревистата версия“, „Стъблата са едногодишни, зелени, изправени, с височна до 2 метра“, „Цъфтежът започва юни-юли.“ The green fruit of both elders: Български фермер „Кои лечебни растения се берат през август?“ (https://www.bgfermer.bg/article/10092136): „(сетете се за двата вида бъз и характеристиките на техните плодчета – зелените са отровни!)“                                                                                             |
| `cheren-baz`                                                                         | protected   | ЗЛР pattern: „до 0,5 кг цвят и до 10 кг плодове“                                                                                                                                        | ЗЛР                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `cheren-baz`                                                                         | protected   | Дебърският бъз (Sambucus deborensis) е защитен вид: Законът за биологичното разнообразие забранява брането му в природата.                                                              | ЗБР чл. 40, ал. 1, т. 1, Приложение № 3 „Дебърски бъз Sambucus deborensis“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `glog`, `tranka`, `gorska-yagoda`, `cherna-borovinka`, `chervena-borovinka`, `ofika` | protected   | ЗЛР pattern: „до 10 кг плодове“                                                                                                                                                         | ЗЛР                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `glog`                                                                               | protected   | Дребнолистният глог (Crataegus microphylla) и ориенталският глог (C. stevenii) са защитени видове: Законът за биологичното разнообразие забранява брането им.                           | ЗБР Приложение № 3 „Дребнолистен глог Crataegus microphylla“, „Ориенталски глог Crataegus stevenii“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `cherna-borovinka`                                                                   | protected   | Кавказката боровинка (Vaccinium arctostaphyllos) е защитен вид: Законът за биологичното разнообразие забранява брането ѝ. Не я бъркай с черната боровинка.                              | ЗБР Приложение № 3 „Кавказка боровинка Vaccinium arctostaphyllos“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| `ofika`                                                                              | toxic-part  | Горскостопанският план на ДГС „Елена“ описва офиката като отровна при предозиране, когато се използва като лечебно растение.                                                            | ДГС „Елена“ plan: „Офика - Sorbus aucuparia - … Събират се плодовете от септември до падане на първите снегове. Използват се във фитотерапевтичната практика. Отровно при предозиране - употреба само под лекарски контрол!“                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `kisel-tran`                                                                         | protected   | По заповед на МОСВ за 2026 г. киселият трън се бере от природата само в определени количества и райони, а в националните паркове – не. Не важи за лични нужди: до 10 кг плодове на ден. | Заповед № РД-178/2026, т. I, т. II.1, т. II.2 and т. II.5; the amount is ЗЛР § 1, т. 18, ж), to which т. II.5 refers (above)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `tuchenitsa`                                                                         | preparation | При варене във вода тученицата отделя оксалова киселина, която трябва да се отстрани, затова не ползвай водата от варенето.                                                             | Agrozona tuchenitsa article: „Трябва да се има предвид също така, че при варене във вода тученицата отделя оксалова киселина, която трябва да се елиминира, без да се губят много други полезни хранителни вещества.“ (the page writes some of these words with Latin look-alike letters; quoted here in Cyrillic). The acid goes into the water, so „не ползвай водата от варенето“ is the site's reading of „трябва да се елиминира“.                                                                                                                                                                                                                            |
| `tuchenitsa`                                                                         | protected   | ЗЛР pattern: „до 1 кг листа или до 2 кг стръкове“                                                                                                                                       | ЗЛР                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| `godzhi-beri`                                                                        | toxic-part  | Не бери неузрели плодове – те може да са опасни. Събирай ги напълно узрели, по-късно през есента.                                                                                       | Agrozona „Годжи Бери – всичко, което трябва да знаем за плода и отглеждането му“ (27.03.2019, https://agrozona.bg/godzhi-beri-vsichko-koeto-tryabva-da-znaem-za-ploda-i-otglezhdaneto-mu/): „Зреенето на плодовете става от юли до октомври , но се събират по-късно през есента, неузрелите плодове са може да бъдат опасни.“                                                                                                                                                                                                                                                                                                                                     |
| `oblepiha`                                                                           | protected   | Облепихата е защитен вид: Законът за биологичното разнообразие забранява брането ѝ в естествените ѝ находища. Плодовете, които се продават, са от насаждения.                           | ЗБР чл. 37, чл. 40, ал. 1, т. 1, Приложение № 3 „Облепиха Hippophae rhamnoides“ (above)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| `rigan`                                                                              | protected   | По заповед на МОСВ за 2026 г. белият риган (Origanum vulgare ssp. hirtum) не се бере от природата в цялата страна, освен за лични нужди – до 2 кг стръкове на ден.                      | Заповед № РД-178/2026, т. II.4 and т. II.5; the amount is ЗЛР § 1, т. 18, б) (oregano is gathered as flowering stems, spec 053)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `mashterka`                                                                          | protected   | Прицветниковата, пиринската и стояновата мащерка са защитени видове: Законът за биологичното разнообразие забранява брането им в природата.                                             | ЗБР чл. 40, ал. 1, т. 1, Приложение № 3 (above). The entry is culinary thyme (_Thymus vulgaris_, spec 053); the caution names the protected wild relatives.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `kesteni`                                                                            | look-alike  | Не бъркай ядливия кестен с конския (Aesculus hippocastanum): конският кестен не става за храна и е отровен.                                                                             | Български фермер 7891605: „Питомният кестен не бива да се бърка с конския (Aesculus hippocastanum). … Конският кестен не става за храна, даже е отровен“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |

Decisions and limits:

- **Nettle** has no ЗЛР caution (see above); its two cautions come from Български фермер.
- **Ramsons:** the deadly look-alike is autumn crocus; two poison-centre case series name it, and
  the page says how the leaves differ (garlic smell). Lily of the valley stays as a second look-alike.
- **Elder:** the cautions on toxic parts and on heat treatment come from the 2024 review of
  _S. nigra_. The earlier livestock article (Български фермер 22826799) and its „Само узрелите
  плодове са безопасни“ are no longer used, nor is the market article 18585568. No source found names
  red elder (_Sambucus racemosa_) as a look-alike, or the stems. The бъзак look-alike stays with
  Български фермер 7636932, which describes both plants for people gathering them, and
  10092136 („сетете се за двата вида бъз … зелените са отровни!“).
- **Protected relatives (one rule):** a species of ЗБР Приложение 3 that a gatherer could confuse
  with the plant is named in its own `protected` caution: дебърски бъз on the elder, дребнолистен
  and ориенталски глог on the hawthorn, кавказка боровинка on the bilberry, and the three thymes on
  `mashterka`. Each cites the ЗБР with its gazette number and year.
- **Bilberry and the Закон за горите:** Agrozona reports a fine of 50–500 лв for illegal picking
  („Съгласно Закона за горите, санкцията за незаконно бране на плода е от 50 до 500 лв.“). The
  `protected` kind covers the ЗЛР, ЗБР and the yearly МОСВ order only, so the bilberry carries the ЗЛР
  rule and the forest-law fine is not shown.
- **Barberry:** the only source naming its toxic parts (unripe fruit, roots) is bg.wikipedia, which
  is not a caution source; its caution is the 2026 order. Its summary names only the ripe red
  fruit.
- **Rowan:** the summary presents it as fruit for jams, jellies and syrups. The toxic-part caution
  stays with the forestry plan's wording, which is about medicinal use („Използват се във
  фитотерапевтичната практика. Отровно при предозиране“); it does not tell the reader how much to
  eat.
- **Purslane:** the preparation caution says what to do with the cooking water (above). The
  Agrozona and Български фермер warnings about kidney stones and pregnancy are dietary advice that
  fits no caution kind (it is neither a toxic part, an allergy nor a preparation step), so they are
  not shown.
- **Personal-needs amounts** are given in every caution about the ЗЛР or a yearly МОСВ order.
- **Haskap:** the source says the other honeysuckles' berries „не са ядливи“, not that they are
  toxic, so there is no `look-alike` caution (that kind is for toxic look-alikes); the summary says
  it in the source's words.
- **Sea buckthorn summary** („Облепихата узрява от края на юли до октомври според сорта…“) speaks
  of varieties and does not suggest gathering it in the wild; it is unchanged.

### Nutrition

Copied from the USDA SR Legacy CSV (April 2018) and checked by
`tests/unit/content/usda-nutrition.test.ts` after `pnpm content:usda`. Micronutrients at ≥ 15 % of
the EU reference intake, highest share first, at most six; when fewer than three reach 15 %, the
next highest are added to show three (spec 043 rule). When two nutrients tie at the cut, the one
whose Bulgarian name comes first alphabetically is listed. Dandelion: copper (0.171 mg, 17.1 %) and
manganese (0.342 mg, 17.1 %) tie for the sixth place, so manganese („Манган“) is listed before
copper („Мед (Cu)“).

| Slug         | FDC record                     |
| ------------ | ------------------------------ |
| `gluharche`  | 169226 „Dandelion greens, raw“ |
| `cheren-baz` | 171727 „Elderberries, raw“     |

No nutrition: nettle (only „Stinging Nettles, blanched (Northern Plains Indians)“, 169819),
purslane („Purslane, raw“, 169274, has no fibre value, and the schema needs every macronutrient),
goji (only „Goji berries, dried“, 173032), and the others (no SR Legacy record of the species; the
cultivated strawberry, sweet cherry and blueberry records are not used as proxies).

The elderberry record is raw; the preparation caution says not to eat the fruit raw. The table
states values per 100 g raw edible portion, as for every produce.

### Editorial text

Summaries are 70–160 characters, „ти“ voice, no health claims, never „богат“, „полез“, „лекува“
or „действие“, and say nothing that invites gathering a toxic part. Every caution text is 20–200
characters, single line. Every entry has `updatedAt: 2026-11-13`.

### Photos (spec 015)

Downloaded through the Unsplash download endpoint (MCP `download_asset`), centre-cropped to 4:3,
1600 × 1200 JPEG at quality 80 without metadata. Wild plants are easy to confuse, so a photo is used
only when it plainly shows the species: nettle (opposite serrated leaves with hanging catkins from
the leaf axils, described „Stinging nettle“), elder (black berries on red stalks, described as
_Sambucus nigra_) and dandelion (flowers with the toothed leaf rosette). The first nettle photo
(`VRjJ6MA1X-Q`) showed leaves only and was replaced. The dandelion photo is cropped to leave out a
small yellow flower at the top right that may be lesser celandine (crop 1464 × 1098 from x 440,
y 502 of the 2400 × 1600 download, scaled to 1600 × 1200). The rowan results showed firethorn (_Pyracantha_), and no result for the other
plants clearly showed the species, so they have no photo.

| Slug         | Author                        | Unsplash photo                                                                        |
| ------------ | ----------------------------- | ------------------------------------------------------------------------------------- |
| `kopriva`    | Bakd&Raw by Karolin Baitinger | https://unsplash.com/photos/green-and-white-plant-in-close-up-photography-yaKZ4f0tZ4Y |
| `cheren-baz` | Tadeusz Zachwieja             | https://unsplash.com/photos/a-bunch-of-berries-hanging-from-a-tree-ITFBAchRAiI        |
| `gluharche`  | Lorenzo Ranuzzi               | https://unsplash.com/photos/yellow-flower-on-brown-soil-f-02pTFLV14                   |

## 6. Accessibility requirements

- WCAG 1.1.1: every photo has a Bulgarian `alt` of 10–120 characters describing the photo.
- WCAG 3.1.2: Latin names render with `lang="la"` (existing component).
- WCAG 1.3.1 / 1.3.2 / 1.4.1: cautions render in the spec 055 „Внимание“ section (heading, list,
  kind label as text, decorative icon hidden), before the season in source order. No new
  component.
- Caution texts are plain sentences that read well aloud, with no symbols standing for words
  except „–“ and „кг“.
- Entries without regions, nutrition or photo omit those sections (spec 049).
- The e2e axe checks run on every produce and group page, now including wild pages with real
  cautions.

## 7. SEO requirements

- Titles from the name, meta descriptions from the summary (70–160 characters), unique per page.
- `Article` JSON-LD cites the caution sources (spec 055) next to the other sources.
- Internal links: produce ↔ group (five new group pages) ↔ months, and nutrient pages for the two
  entries with nutrition.
- No region links.

## 8. Acceptance criteria

1. **AC1:** Given the produce collection, then it contains the 14 slugs of section 3, each valid
   under the schema, with the name, Latin name, kind and group of section 3.
2. **AC2:** Given each new produce, then `wild` is `true` for the twelve wild plants and `false`
   for `godzhi-beri` and `kamchatska-borovinka`.
3. **AC3:** Given each new produce, then its caution kinds, in order, equal section 5, every
   caution source is https and not Wikipedia, and every `protected` caution citing a yearly МОСВ
   order names the year 2026 in its text.
4. **AC4:** Given each new produce, then its season months and levels equal section 5.
5. **AC5:** Given each new produce, then it cites the FDC record of section 5 or has no nutrition.
6. **AC6:** Given each new produce, then it names no province and cites no gradinata.bg page.
7. **AC7:** Given each new produce with a photo in section 5, then the photo file exists and its
   credit is the listed Unsplash photo; the others have no photo.
8. **AC8:** Given each new produce, then its summary, photo `alt` and caution texts contain no
   „богат“, „полез“, „лекува“ or „действие“, and it has no traditional uses and no organic block.
9. **AC9:** Given the produce collection, then none of the left-out candidates exists (`lapad`,
   `byala-kucha-loboda`, `diva-cheresha`, `obiknovena-hvoyna`, `mecho-grozde`, `iglika`,
   `diva-morkva`, `buchinish`, `bazak`, `cherven-baz`, `momina-salza`, `mrazovets`,
   `konski-kesten`, `kavkazka-borovinka`, `cherno-frensko-grozde`, `bulgarska-krusha`,
   `diva-krusha`), and there is no wild duplicate of `shipka`, `menta`, `malini` or `kapini`
   (`diva-shipka`, `diva-menta`, `gorska-malina`, `gorska-kapina`).
10. **AC10:** Given `oblepiha`, `rigan`, `mashterka` and `kesteni`, then each is not wild and has
    exactly the caution of section 5 (kind and source URL), and the `rigan` text names 2026.
11. **AC11:** Given the new groups, then `koprivovi` is _Urticaceae_, `meshkovitsovi`
    _Adoxaceae_, `kiselotranovi` _Berberidaceae_, `tuchenitsovi` _Portulacaceae_ and `nokatovi`
    _Caprifoliaceae_.
12. **AC12:** Given the content checklist, then it has a row per new produce.
13. **AC13 (QA 057):** Given any new or changed produce, then every `protected` caution's source
    name gives an act or order with its number and year.

## 9. Test plan

| AC   | Test type | Test file                                                                   |
| ---- | --------- | --------------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC2  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC3  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC4  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC5  | unit      | `tests/unit/content/wild-057.test.ts` (values: `usda-nutrition.test.ts`)    |
| AC6  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC7  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC8  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC9  | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC10 | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC11 | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC12 | unit      | `tests/unit/content/wild-057.test.ts`                                       |
| AC13 | unit      | `tests/unit/content/wild-057.test.ts` („QA 057: every protected caution …“) |

The existing e2e suite (axe on every produce page, heading outline, links) covers the rendered
pages; built wild pages are also checked by eye at mobile width.

## 10. Third-party documentation consulted

No new third-party API. Content sources, all fetched 2026-11-13:

| Source                                                                                                                                                                                                                     | Used for                                 |
| -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| Закон за лечебните растения, FAOLEX copy (https://faolex.fao.org/docs/pdf/bul40297.pdf)                                                                                                                                    | `protected` cautions                     |
| МОСВ, Закон за биологичното разнообразие (МОСВ PDF, above)                                                                                                                                                                 | `oblepiha`, `mashterka` cautions         |
| МОСВ, Заповед № РД-178 от 18 февруари 2026 г. (ДВ, бр. 24 от 2026 г.)                                                                                                                                                      | `kisel-tran`, `rigan` cautions; left-out |
| ИАГ: ДГС „Ракитово“ (2020), ТП „ДГС Омуртаг“ (2023), ТП ДГС „Елена“ (2024) plans; „Горските плодове“                                                                                                                       | Seasons, rowan caution, left-out         |
| PubMed (E-utilities): PMID 33156711, 16626006 (used); 6422238, 39124271, 35000361 (read, not used)                                                                                                                         | Ramsons look-alike                       |
| Avena, Ozola, Ķeķe (2024), Research for Rural Development 39, DOI 10.22616/RRD.30.2024.011                                                                                                                                 | Elder cautions                           |
| bgfermer.bg 14721904, 11372935, 21562939, 8416350, 7409171, 10789085, 6966759, 8551141, 7636932, 10092136, 7891605, 13121271, 19298463, 7861773, 15617943, 12628459, 19272138 (22826799 and 18585568 read, no longer used) | Seasons, cautions, summaries             |
| agrozona.bg: глухарче, тученица, годжи бери, боровинки (fine) articles; бъз article read, no longer used                                                                                                                   | Seasons, cautions                        |
| bg.wikipedia.org: Обикновен кисел трън, Обикновена коприва, Мешковицови, Черен бъз, Бъзови (Нокътови), Тученица, Левурда, Копривови, Киселотрънови                                                                         | Barberry season; group names             |
| USDA FoodData Central SR Legacy CSV (April 2018): 169226, 171727 (used); 169819, 169274, 173032 (not used)                                                                                                                 | Nutrition                                |
| Unsplash photo pages above                                                                                                                                                                                                 | Photos                                   |

## 11. QA review (2026-11-13)

No `qa-reviewer` subagent could be launched from this session; the checklist was followed manually.
Every quote in sections 3 and 5 was re-checked by script against the pages fetched on 2026-11-13,
and the scanned МОСВ order was read page by page. `pnpm test`, `pnpm check`, `pnpm lint`,
`pnpm build`, `pnpm validate:html` and the full e2e suite (axe on every produce page) pass. The
„Внимание“ sections of `levurda`, `cheren-baz` and `godzhi-beri` were checked at mobile width.

| Finding                                                                                                  | Fix                                                                      |
| -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| The content guide merged with spec 055 asks a `protected` source name to carry the act's number and year | The ЗБР source name gives „обн. ДВ, бр. 77 от 2002 г.“ and the amendment |
| Spec 056 adds `matochina` and `chernitsi`                                                                | Both dropped here (section 3)                                            |

Second QA round (`qa-reviewer`, 2026-11-13). Regression tests are in
`tests/unit/content/wild-057.test.ts` („QA 057: …“).

| Finding                                                                                                        | Fix                                                                                                                        |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- |
| Blocker: ramsons omitted autumn crocus, its known deadly look-alike, and the spec said no source compares them | Two look-alike cautions from poison-centre case series (PMID 33156711, 16626006); the statement is removed                 |
| Elder: „Само узрелите плодове са безопасни“ came from a livestock article                                      | Dropped; toxic parts and heat treatment cited from the 2024 _S. nigra_ review; the market article is no longer used        |
| The nettle photo did not show diagnostic features                                                              | Replaced with a photo showing hanging catkins (`yaKZ4f0tZ4Y`)                                                              |
| The press-source rule in the content guide was too loose                                                       | Search order recorded above; press only adds cautions; deadly look-alike without a source means the plant is not published |
| Protected relatives were handled inconsistently                                                                | One rule: дебърски бъз, дребнолистен and ориенталски глог, кавказка боровинка named in `protected` cautions                |
| Barberry and oregano cautions lacked the personal-needs amounts                                                | „до 10 кг плодове“ and „до 2 кг стръкове“ added                                                                            |
| `bazovi` („Бъзови“) could be confused with elder                                                               | Renamed `nokatovi` („Нокътови“)                                                                                            |
| Elder season mixed flowers and berries and used an article that lists бъзак as a synonym                       | Berries only (August); flowers in the summary from Български фермер 7636932                                                |
| Purslane caution could not be acted on                                                                         | It now says not to use the cooking water                                                                                   |
| Rowan caution added „не ги яж в големи количества“                                                             | Reworded to the forestry plan's medicinal-use wording                                                                      |
| Dandelion months were peak from the flowering months                                                           | Leaf months 3–4 available, reasoning written out                                                                           |
| Legal source names                                                                                             | ЗЛР „обн. ДВ, бр. 29 от 2000 г., посл. изм. ДВ, бр. 58 от 2017 г.“; ЗБР „посл. доп. ДВ, бр. 70 от 2024 г.“; AC13 test      |
| Nits: dandelion photo flower, a history comment in the 053 test, micronutrient tie                             | Photo cropped; comment removed; tie rule written above                                                                     |
