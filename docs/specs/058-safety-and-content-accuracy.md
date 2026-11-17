# 058. Safety and content accuracy

- **Status:** Implemented
- **Bounded context(s):** catalog (content model, `Produce`, produce data), recipes (`Recipe`,
  recipe data), farms (farm data), UI (produce cautions callout, recipe facts card, methodology
  page), CMS (Keystatic config)
- **Related:** spec 041, 044, 052, 053 (seasons and summaries), spec 048 (recipes), spec 051
  (farms), spec 055 (wild produce and cautions), spec 057 (wild produce content),
  `docs/CONTENT-GUIDE.md`

## 1. Goal

A persona usability test (six simulated users, 2026-11-17) found places where the site says one
thing and shows another, or leaves out a safety fact a reader needs: a raw-elderberry nutrition
table under „не яж плодовете сурови“, a ramsons smell test without its known weakness, no line on
what to do after a suspected poisoning, a „Диворастящо“ rule the data does not follow, summaries
that name other months than the season strip, a canning card that gives the time for up to 300 m
in large type, and three small farm-data doubts. This spec fixes each with sourced facts or by
removing the claim. It adds no invented data: every new fact has a source quoted in section 5,
gradinata.bg is not used and Wikipedia is not a caution source.

## 2. User stories

- As a forager, I want the elder page not to show raw-berry nutrition next to „не яж плодовете
  сурови“, so that I am not told two opposite things.
- As a forager, I want to know that the garlic smell test fails once my hands smell of garlic, so
  that I do not rely on a false result.
- As anyone reading a caution about a toxic plant, I want to see whom to call when I suspect a
  poisoning, so that I do not have to search for it in an emergency.
- As a reader, I want „Диворастящо“ to mean one clear thing and the methodology to say what it
  means, so that I can trust the label.
- As a reader, I want the summary of a produce to name the same months as its season strip.
- As a home canner in Sofia (about 550 m), I want the water-bath time for my altitude in the facts
  card, so that I do not boil the jars for the time that applies only up to 300 m.
- As a buyer, I want farm descriptions that match the farm's product list and sources.

## 3. Scope

### In scope

1. **Raw-inedible produce (item 1).** A new optional produce flag `notEatenRaw` (default `false`)
   for a produce whose raw part is not eaten. The schema rejects `notEatenRaw: true` together with
   `nutrition` (nutrition values on the site are „per 100 g raw edible portion“, so they do not
   apply) and requires at least one `preparation` or `toxic-part` caution that says why. Set on
   `cheren-baz` (its USDA „Elderberries, raw“ block is removed), `yaponska-dyulya` and `kopriva`
   (both already have a `preparation` caution and no nutrition). Chosen over a note under the table
   because it is the safer and simpler option: a note would keep elder in the vitamin C and iron
   rankings („В сезон сега“) as if the raw berries were a food. The methodology says so.
2. **Ramsons and poisoning (item 2).**
   - `levurda` gains a `look-alike` caution from the BfR (German Federal Institute for Risk
     Assessment) press release: the smell test fails when the hands still smell of an earlier leaf;
     if a leaf does not smell of garlic, leave it and wash the hands at once.
   - A UI string `ui.produce.cautions.emergency` in the „Внимание“ callout: call 112 and the
     24-hour poison information of the Клиника по токсикология at УМБАЛСМ „Н. И. Пирогов“, with the
     hospital's phone number as the clinic page shows it. It is shown on every produce whose
     callout warns of poisoning: a wild produce, or any produce with a `look-alike` or `toxic-part`
     caution (e.g. `kesteni`, `godzhi-beri`). The methodology cites both sources.
   - The content guide's rule „Do not write what to do after poisoning“ becomes: cautions never
     give treatment advice; the only after-poisoning text is this shared emergency line.
3. **„Диворастящо“ rule (item 3).** Rule: a produce is marked `wild` when its page describes a
   plant gathered from the wild. A crop grown in gardens or orchards that also grows wild (шипка,
   къпини, малини, облепиха, киселец, риган) is not marked; the methodology says so and that the
   same gathering rules apply to its wild form. Applied to the data:
   - `drenki` („Дрянът расте диво из цялата страна…“) describes a wild-gathered fruit: it is marked
     `wild: true` with a `protected` caution from the Закон за лечебните растения (Дрян обикновен,
     _Cornus mas_, is on its list; fruit for personal needs up to 10 kg a day).
   - `rigan` gains a `protected` caution for ordinary oregano (Риган обикновен, _Origanum vulgare_,
     is on the same list; stems up to 2 kg a day). The 2026 order caution for white oregano stays.
     It stays unmarked (a garden herb that also grows wild).
   - `shipka`: the summary says only that the harvest starts in September (the strip shows
     September; October was dropped in spec 052 as not dated by the source).
4. **Summary months vs the season strip (item 4).** A content test checks every produce
   `summary` and `howToChoose`:
   - (a) a month named in the text is a month of the season, except a whitelisted month that the
     text names for another event (sowing, planting out, flowering), each with its reason;
   - (b) every month of a range „от <month> до <month>“ is a month of the season;
   - (c) „от <month>“ without a closing „до“ is not used for the last month of a season (it claims
     the harvest goes on after that month).
     Fixed texts: `brokoli`, `domati` (text narrower than the strip), `cheren-baz`, `shipka`, `bakla`,
     `fastatsi` (open „от“ on the last season month). Each new text keeps to the cited source.
5. **Canning times by altitude (item 5).** A new required recipe field `processingAtAltitude`: the
   water-bath minutes for the same jar in each altitude band above the lowest, from the recipe's own
   NCHFP table (already quoted in `safety.sterilisation`). The facts card shows every band
   („до 300 м: 5 мин“, „300–1800 м: 10 мин“, „над 1800 м: 15 мин“) as a wide cell, and the muted note
   is replaced by one that says the time depends on the altitude and is for the largest jar.
   Applied to all five recipes.
6. **Farm data (item 6).**
   - `ferma-krumovi`: `https://localstore.bg/producer/ferma-krumovi-1234` was fetched on
     2026-11-17 and is a real LocalStore.bg profile („Ферма Крумови, Ферма | Профил в
     LocalStore.bg“, with the description the farm entry paraphrases). No change.
   - `vkusnagradina`: the description says it sells organic vegetables, while the farm lists
     strawberries. The TRACES certificate BG-BIO-18.100-0004936.2026.001 lists „Ягоди /
     Strawberries“ (CN 081110). The description now says the certificate also covers strawberries.
   - Игнатиево is a town: Решение № 137 на Министерския съвет от 11 март 2011 г. (ДВ, бр. 22 от
     2011 г.) „Обявява населеното място село Игнатиево (32278), община Аксаково (VAR02), област
     Варна, за град.“ The address „гр. Игнатиево“ is right. No change.
   - `dzhumerski`: the LocalStore.bg profile names „пащърнак“, which is not a produce on the site,
     so the farm cannot list it. The description no longer names it, so it matches the list.
7. **Children (item 7).** Skipped: no official or poison-centre source found in this pass states
   guidance on small children and wild berries or stones (the BfR ramsons release only names its
   app on poisoning accidents in children). Nothing is added.

### Out of scope

- Navigation, search, layout and the other persona findings (other specs).
- Altitude-specific seasons, photos of look-alikes, visual identification cues (no sourced text in
  this pass).
- A „Диворастящо“ filter or list.

## 4. Domain model

- **Produce data contract (`produceSchema`):** `notEatenRaw: boolean` (default `false`). Refinement:
  when `true`, `nutrition` must be absent and at least one caution has kind `preparation` or
  `toxic-part`. The domain `Produce` does not carry the flag (it only constrains data).
- **`Produce.warnsOfPoisoning(): boolean`:** `true` when the produce is wild or has a caution of
  kind `look-alike` or `toxic-part` (`POISONING_CAUTION_KINDS` in `Caution.ts`).
- **`Recipe.processingAtAltitude: ReadonlyArray<AltitudeProcessing>`** with
  `AltitudeProcessing { fromMetres: number; minutes: number }`. Invariants (checked by
  `Recipe.create`, `InvalidRecipeError` otherwise): at least one band; `fromMetres` positive
  integers, strictly increasing; `minutes` integers, not below `processingMinutes` and not
  decreasing. `processingMinutes` keeps its meaning (the lowest band, up to the first `fromMetres`).
- **Recipe schema:** `processingAtAltitude: [{ fromMetres, minutes }]`, required, at least one.

## 5. Behaviour and edge cases

### Content changes with sources

| Entry              | Change                                                                                                                                                                                                                          | Source (quoted)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cheren-baz`       | `notEatenRaw: true`, nutrition removed; summary „…а плодовете му се берат през втората половина на август…“                                                                                                                     | Existing caution (Avena et al. 2024) „…not properly processed“; Български фермер 7636932: „Периодът от средата на август е много подходящ за добив на плод“ (spec 057).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| `yaponska-dyulya`  | `notEatenRaw: true`                                                                                                                                                                                                             | Existing caution, CORDIS FAIR973894 (spec 056): the fruit is not eaten fresh.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| `kopriva`          | `notEatenRaw: true`                                                                                                                                                                                                             | Existing caution, Български фермер 14721904: blanch the leaves before eating, otherwise they sting the tongue and palate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `levurda`          | `look-alike`: „Мирисът не е сигурен знак, ако ръцете ти вече миришат на чесън от предишно листо. Ако листото не мирише на чесън, остави го и веднага измий ръцете си.“                                                          | BfR, Presseinformation Nr. 9/2025, 21.03.2025, „Geruchstest mit Tücken: Worauf beim Bärlauch-Sammeln geachtet werden sollte“: „Zeigt sich dabei nicht der für Bärlauch typische Knoblauchgeruch, sollte das Kraut besser liegen gelassen und sofort gründlich die Hände gewaschen werden. „Aber auch der Geruchstest hat seine Tücken: haftet nämlich noch der Lauchgeruch einer vorangegangenen Probe an den Händen, kann dies zu einem falschen Ergebnis führen““.                                                                                                                                                                                          |
| UI emergency line  | „При съмнение за отравяне веднага звъни на 112. Денонощна информация за отравяния дава Клиниката по токсикология на УМБАЛСМ „Н. И. Пирогов“ в София (телефон на болницата: 02 9154 411).“                                       | МВР, Дирекция „Национална система 112“, „Кога звъним на 112?“: „Ползвайте телефон 112 в случай на внезапна реална заплаха за живота, здравето … като: … Спешни медицински случаи“. УМБАЛСМ „Н. И. Пирогов“, „Клиника по токсикология“ (https://pirogov.eu/bg/klinika-po-toksikologiia_p12.html): the information centre „Осигурява 24 часова специализирана информация относно състава, токсичното действие и терапевтичното поведение при остри екзогенни интоксикации“; the page and its „Контакти“ block give „1606 София, бул. Тотлебен №21, 02 9154 411“. The page names no separate number for the clinic, so the line labels it the hospital's number. |
| `drenki`           | `wild: true`; `protected`: „Дрянът е в списъка на Закона за лечебните растения: за лични нужди можеш да набереш до 10 кг плодове на ден, а за търговия ти трябва позволително.“                                                 | ЗЛР (FAOLEX copy) Приложение към чл. 1, ал. 2: „Дрян обикновен Cornus mas L. Cornaceae“; § 1, т. 18, ж) „плодове - до 10 кг“. Not in Заповед № РД-178/2026 (read page by page: т. I and т. II.4 do not name _Cornus mas_).                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| `rigan`            | `protected`: „Обикновеният риган е в списъка на Закона за лечебните растения: за лични нужди можеш да набереш до 2 кг стръкове на ден, а за търговия ти трябва позволително.“                                                   | ЗЛР Приложение: „Риган обикновен Origanum vulgare L. Lamiaceae“; § 1, т. 18, б) „стръкове - до 2 кг“. РД-178/2026 т. II.4 bans only „Риган бял (Origanum vulgare L. ssp. Hirtum …)“.                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `shipka`           | Summary „Беритбата на шипките започва през септември – бери ги, преди да омекнат. …“                                                                                                                                            | Български фермер 7747322 (spec 052): „Плодовете на шипката се берат от септември до първите слани преди да са омекнали“; the strip has only September (spec 052 QA).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
| `brokoli`          | Summary „…берат се от септември до ноември, най-много през октомври…“                                                                                                                                                           | Season 9 available, 10 peak, 11 available (spec 044).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `domati`           | Summary „Доматите от открити площи се берат от юли до октомври, а напролет идват от оранжерии. …“                                                                                                                               | Season 4–6 available (greenhouse), 7–9 peak, 10 available (spec 041).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| `bakla`            | Summary „…Беритбата на зелените ѝ шушулки започва в началото на май…“                                                                                                                                                           | Български фермер 11149745 (spec 053): „Беритбата започва, когато се оформят шушулките - началото на май.“                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `fastatsi`         | Summary „…а узряването им започва през септември…“                                                                                                                                                                              | Български фермер 6845105 (spec 052): „Узряването започва през септември“.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| `vkusnagradina`    | Description: „…Продава био зеленчуци през собствен онлайн магазин; сертификатът за биологично производство включва и ягоди. …“                                                                                                  | TRACES certificate BG-BIO-18.100-0004936.2026.001, II.1 Directory of products: „Ягоди / Strawberries … 081110 Strawberries … Organic“.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| `dzhumerski`       | Description without „пащърнак“                                                                                                                                                                                                  | LocalStore.bg profile (fetched 2026-11-17) lists „…целина, пащърнак, ябълки и магданоз“; пащърнак is not a produce on the site.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Recipes (all five) | `processingAtAltitude` from each recipe's NCHFP table, the jar the card already uses: sweet spreads 10 (300 м), 15 (1800 м); kiselo-zele 20, 25; kompot-ot-krushi 30, 35, 40 (300, 900, 1800 м); kompot-ot-praskovi 35, 40, 45. | The recipes' own `safety.sterilisation` text and NCHFP sources (spec 048).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |

Every changed produce gets `updatedAt: 2026-11-17`. The 2026 МОСВ order was re-read for `rigan`
and `drenki` (section 3).

### Rules and edge cases

- `notEatenRaw: true` with a `nutrition` block, or without a `preparation`/`toxic-part` caution, is
  a schema error naming `nutrition` or `cautions`.
- The emergency line appears once per callout, after the gathering note (wild) or as the first
  paragraph (non-wild with a look-alike or toxic-part caution). A produce with only `allergy`,
  `protected` or `preparation` cautions does not show it. A produce without cautions shows no
  callout at all (unchanged).
- Altitude labels: the first band is „до <first fromMetres> м“, a middle band
  „<fromMetres>–<next fromMetres> м“, the last band „над <fromMetres> м“. Minutes use
  `formatDuration`.
- The month test treats a month name as a whole word (not inside another word). The whitelist
  names the produce, the month and the event; a whitelisted month that is no longer in the text
  fails the test, so the whitelist cannot go stale.

## 6. Accessibility requirements

- 1.3.1: the emergency line is a paragraph inside the existing „Внимание“ section; the altitude
  times are a `<ul>` inside the card's `<dd>`, so each band is a list item to screen readers.
- 1.4.3: the emergency line uses body text colour and weight 600 (as the gathering note); the
  altitude list uses body text, not the muted colour.
- 1.3.2 / no-CSS rule: source order alone reads correctly (heading, note, emergency line, list;
  card term then its band list). No reordering by CSS.
- 2.1.1, 2.4.7: no new interactive element. Without JavaScript everything renders (static HTML).
- 3.1.1: content stays in Bulgarian, `lang="bg"`.

## 7. SEO requirements

- No title, description, canonical or URL change. Summaries are meta descriptions: the changed
  ones stay 70–160 characters (schema).
- Recipe JSON-LD is unchanged (times use the lowest band, as before).
- Removing elder's nutrition removes it from the nutrient pages' rankings; no page or link is
  removed.

## 8. Acceptance criteria

1. **AC1:** Given a produce record with `notEatenRaw: true` and a `nutrition` block, when it is
   parsed, then the schema rejects it at `nutrition`; given `notEatenRaw: true` without a
   `preparation` or `toxic-part` caution, then it is rejected at `cautions`; omitted, it defaults to
   `false`.
2. **AC2:** Given the content, then `cheren-baz`, `yaponska-dyulya` and `kopriva` have
   `notEatenRaw: true` and no nutrition, and no produce with `notEatenRaw: true` has nutrition.
3. **AC3:** Given the `levurda` entry, then it has a `look-alike` caution citing the BfR press
   release 9/2025 whose text says that hands smelling of garlic make the smell test fail and to
   wash the hands.
4. **AC4:** Given a wild produce page, or a page with a `look-alike` or `toxic-part` caution, when
   it renders, then the „Внимание“ section contains the emergency line with „112“ and „Пирогов“;
   given a page whose only cautions are `allergy`, `protected` or `preparation`, then it does not.
5. **AC5:** Given `Produce.warnsOfPoisoning`, then it is `true` for a wild produce and for a
   produce with a `look-alike` or `toxic-part` caution, and `false` otherwise.
6. **AC6:** Given the methodology page, then the wild section states the rule (a page that
   describes gathering from the wild is marked; cultivated crops that also grow wild are not),
   mentions the emergency line, and links the МВР 112 page and the Pirogov toxicology clinic page;
   the nutrition section says produce not eaten raw has no nutrition values.
7. **AC7:** Given `drenki`, then it is `wild: true` with a ЗЛР `protected` caution stating 10 kg of
   fruit; given `rigan`, then it has a ЗЛР caution for _Origanum vulgare_ stating 2 kg of stems and
   still has the 2026 order caution first.
8. **AC8:** Given every produce `summary` and `howToChoose`, then (a) every month name is a season
   month or whitelisted with a reason, (b) every month inside „от M1 до M2“ is a season month, and
   (c) no „от M“ without „до“ names the last month of the season; every whitelisted month still
   appears in its text.
9. **AC9:** Given `brokoli`, `domati`, `shipka` and `cheren-baz`, then the summary of `brokoli` names
   септември and ноември, `domati` names октомври, `shipka` does not mention „слани“, and
   `cheren-baz` does not say „от средата на август“.
10. **AC10:** Given a recipe input with no altitude band, a band with a non-positive or
    non-increasing `fromMetres`, or minutes below `processingMinutes` or decreasing, when
    `Recipe.create` runs, then it throws `InvalidRecipeError`; the schema requires
    `processingAtAltitude` with at least one band.
11. **AC11:** Given every recipe in `src/data/recipes`, then its altitude bands match the minutes in
    its `safety.sterilisation` text for the same jar (each minute value appears there), and sweet
    spreads have bands 300 → 10 and 1800 → 15.
12. **AC12:** Given a recipe page, when it renders, then the „Във водна баня“ cell lists every
    band („до 300 м: 5 мин“, „300–1800 м: 10 мин“, „над 1800 м: 15 мин“) and the old note „за
    надморска височина до 300 м“ is gone.
13. **AC13:** Given the farms, then `vkusnagradina`'s description mentions „ягоди“ and its sources
    include the TRACES certificate; `dzhumerski`'s description names no produce outside its list
    (no „пащърнак“).
14. **AC14:** Given the content guide, then it documents `notEatenRaw`, the wild rule, the shared
    emergency line (instead of „Do not write what to do after poisoning“) and
    `processingAtAltitude`; Keystatic has fields for `notEatenRaw` and `processingAtAltitude`.

## 9. Test plan

| AC   | Test type | Test file                                                                            |
| ---- | --------- | ------------------------------------------------------------------------------------ |
| AC1  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-058.test.ts`                     |
| AC2  | unit      | `tests/unit/content/safety-058.test.ts`                                              |
| AC3  | unit      | `tests/unit/content/safety-058.test.ts`                                              |
| AC4  | component | `tests/components/ProduceCautions-058.test.ts`                                       |
| AC5  | unit      | `tests/unit/contexts/catalog/domain/Produce-058.test.ts`                             |
| AC6  | unit      | `tests/unit/content/safety-058.test.ts`                                              |
| AC7  | unit      | `tests/unit/content/safety-058.test.ts`                                              |
| AC8  | unit      | `tests/unit/content/season-text-058.test.ts`                                         |
| AC9  | unit      | `tests/unit/content/season-text-058.test.ts`                                         |
| AC10 | unit      | `tests/unit/contexts/recipes/Recipe-058.test.ts`                                     |
| AC11 | unit      | `tests/unit/content/safety-058.test.ts`                                              |
| AC12 | component | `tests/components/RecipeFacts-058.test.ts`                                           |
| AC13 | unit      | `tests/unit/content/safety-058.test.ts`                                              |
| AC14 | unit      | `tests/unit/content/safety-058.test.ts`, `tests/unit/cms/keystaticRoundTrip.test.ts` |

The callout takes the produce (`<ProduceCautions produce={produce} />`), so the component test
covers the page's wiring; the recipe facts card is its own component (`RecipeFacts.astro`) for the
same reason.

Existing tests adjusted for the new facts: the spec 041, 044, 052 and 056 tests accept an
`updatedAt` on or after their change date; the spec 057 test no longer expects elder nutrition,
expects a fifth ramsons look-alike and checks that the 2026 order caution stays first on oregano;
the spec 054 Keystatic test lists `processingAtAltitude` as required.

E2E: the existing suites (axe on produce and recipe pages) cover the rendered pages; run locally
on a private port.

## 10. Third-party documentation consulted

| Package / source                       | Version / date        | Source                                                                                                                                    | Topic                                                                               |
| -------------------------------------- | --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| astro (`astro/zod`)                    | 7.4.8                 | Existing `superRefine` pattern in `src/contexts/catalog/infrastructure/schemas.ts` (spec 055); no new API                                 | Schema refinement                                                                   |
| @keystatic/core                        | 0.6.9                 | Existing `fields.checkbox`, `fields.array`, `fields.object`, `fields.integer` in `keystatic.config.ts`; no new API                        | CMS fields                                                                          |
| BfR Presseinformation Nr. 9/2025       | 21.03.2025            | https://www.bfr.bund.de/presseinformation/geruchstest-mit-tuecken-worauf-beim-baerlauch-sammeln-geachtet-werden-sollte/                   | Ramsons smell test                                                                  |
| МВР, Дирекция „Национална система 112“ | fetched 2026-11-17    | https://www.mvr.bg/112/дейности/дейности-и-функции/koga_zvanim_na_112                                                                     | When to call 112                                                                    |
| УМБАЛСМ „Н. И. Пирогов“                | fetched 2026-11-17    | https://pirogov.eu/bg/klinika-po-toksikologiia_p12.html                                                                                   | Toxicology clinic, 24-hour information, hospital phone                              |
| WHO poison centres directory           | 2019-02               | https://apps.who.int/poisoncentres/PoisonCentres_201902.pdf                                                                               | Checked, not used: its numbers are from 2019 and not on the hospital's current page |
| Закон за лечебните растения (FAOLEX)   | посл. изм. 2017       | https://faolex.fao.org/docs/pdf/bul40297.pdf                                                                                              | Cornus mas, Origanum vulgare, § 1, т. 18                                            |
| МОСВ Заповед № РД-178/2026             | ДВ, бр. 24 от 2026 г. | https://www.moew.government.bg/static/media/ups/tiny/filebase/Nature/Legislation/Zapovedi/MedicinalPlants/RD-178-18.02.2026-MedPlants.pdf | Re-check of drenki and rigan                                                        |
| TRACES certificate                     | 2026                  | https://webgate.ec.europa.eu/tracesnt/directory/publication/organic-operator/BG-BIO-18.100-0004936.2026.001.pdf                           | ВКУСнаГРАДИНА products                                                              |
| Решение № 137 на МС от 11.03.2011      | ДВ, бр. 22 от 2011 г. | https://nrnm.nsi.bg/reports/front-documents/1702/download                                                                                 | Игнатиево is a town                                                                 |
| LocalStore.bg profiles                 | fetched 2026-11-17    | https://localstore.bg/producer/ferma-krumovi-1234, https://localstore.bg/producer/dzhumerski                                              | Farm profiles                                                                       |
