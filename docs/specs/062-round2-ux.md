# 062. UX and accessibility, round 2

- **Status:** Implemented
- **Bounded context(s):** catalog (produce aliases, wild produce listing), UI (season lists, legend,
  scroll tables, produce page, search, nutrient tables, subscribe page, farm list and farm pages,
  group pages, calendar, recipes), shared (search text matching)
- **Related:** specs 016 (search), 024 (home and season stamp), 029 (region pages), 030 (farm
  pages), 043 (calendar print), 055 (wild produce), 059 (findability), 060 (accessibility polish),
  second persona usability round (November 2026, personas P1–P6). Content and safety texts are
  spec 061.

## 1. Goal

The second persona round found no blockers, but a blind NVDA user (P6) still met verbose lists,
needless Tab stops, too many landmarks and in-page links that leave focus behind; a wild-plant
gatherer (P4) had no way to list wild plants; search users met prefix noise („нар“ →
„нарязани“), farms ranked above the produce they asked for („чушки“), missing group pages
(„семейство домати“) and a bare „Няма резултати“; phone users met clipped nutrient tables, a copy
hint that did not work, a Sofia farm list that hid the farms around Sofia and farm e-mail addresses
they could not read. This spec fixes these without changing content texts (spec 061).

## 2. User stories

- As a screen-reader user, I want each season list row to say the current status before the
  year, and the legend to tell me how the year strip reads aloud.
- As a keyboard user, I want only scrollable tables to be Tab stops, few landmarks on a produce
  page, and in-page links that move my focus to their target.
- As a screen-reader user who searches, I want a heading before the results and the query in the
  page title.
- As a cook, I want the water-bath steps numbered, because their order matters.
- As a reader who enlarges text, I want the nutrition table's „% РСП“ column visible.
- As a gatherer, I want one list of all wild plants with their season and a list of the wild
  plants in season on each month page.
- As a searcher, I want „нар“ to find the pomegranate and not „нарязани“, „чушки“ to find Пипер
  first, „семейство домати“ to find the family page and an explanation when nothing is found.
- As a phone user, I want the nutrient ranking tables readable without sideways scrolling.
- As a feed subscriber, I want a copy button for the feed address.
- As a Sofia resident, I want the farm list to point me from София-град to Софийска област; as a
  shopper, I want certified organic farms marked on the farm list and to know that a directory
  profile holds the contact details.
- As a reader of a family page, I want its first heading to say what follows.
- As a reader who prints the calendar, I want no on-screen instruction on paper and a key on each
  printed table.
- As a reader without a mail app, I want to see a farm's e-mail address as text.

## 3. Scope

### In scope

1. **Season list rows (P6-1).** The year strip's text alternative starts with „През годината:“,
   so the row reads name, year, then stamp without the year sounding like the status. Month pages
   show the full legend before the list (spec 059 already does this on the home page).
2. **Legend (P6-2).** The strip line of `SeasonLegend` and the compact key explain the drawing
   and how the strip reads as text („…; прочетена, лентата изрежда месеците на всяко ниво“).
3. **Scroll tables (P6-3).** `ScrollTable` renders a focusable named `section` (no-JS default). A
   small module script removes `tabindex` and the name when the table does not overflow its box,
   and restores both when it does (resize observer). The name stays „<caption> (превъртане)“.
4. **Landmarks on produce pages (P6-4).** Only `h2` sections are named (`aria-labelledby`);
   sections headed by an `h3` (season, choose, storage, varieties, regions, nutrition, preparation,
   traditional, recipes, cautions, growing guide at level 3, farm groups) are plain `section`s.
5. **In-page link targets (P6-5).** Targets of in-page links get `tabindex="-1"`, so browsers
   move focus to them: produce contents (`stall`, `cautions`, `eat`, `grow`, `farms`, `faq`,
   `sources`), the calendar kind headings, the `/fermi` province headings, the footer month strip
   (`#mesetsi`) and the wild section on month pages. No script.
6. **Search results heading and title (P6-6).** A „Резултати“ `h2` precedes the result list and is
   `hidden` until a search ran; while a query is active, `document.title` is
   „Търсене: <query> | Сезон“ (the site's title pattern); an empty query restores the original title.
7. **Water-bath steps (P6-7)** are an ordered list.
8. **Nutrition table at 200 % text (P6-8).** The percentage bar wraps under the number and the
   table's minimum width is removed, so at 640 px with doubled text the „% РСП“ column is inside
   the box.
9. **Wild plants.** New page `/divorastyashti` („Диворастящи растения“): intro with the gathering
   note and a methodology link, a month jump list (links to `/sezon/<month>#divorastyashti`), and
   every wild produce in Bulgarian alphabetical order with its kind, Latin name, year strip (whose
   text alternative names the months of each level) and its level this month. The „Диворастящо“ tag on produce pages links it. Month
   pages get a section „Диворастящи през <месец> (N)“ (`id="divorastyashti"`) after the main list,
   listing the wild produce in season that month, or „През <месец> няма диворастящи растения в
   сезон.“, plus a link to the page. `/tarsene` „Разгледай“ and `/katalog` link it. Indexed for
   search (type „Раздел“), in the sitemap.
10. **Search tuning.**
    - A query word of at most 3 letters matches only that word or its Bulgarian inflected forms
      (word + „а“, „ът“, „ят“, „и“, „ите“, „ове“, „овете“, „ета“, „то“, „та“, „е“, „я“), not
      longer words („нар“ finds „нара“, not „нарязани“, „народна“). Results are filtered on their
      content, title and aliases.
    - Produce `aliases` (data, optional list): other names the produce's own text uses. Each
      alias must occur in the produce's name, summary, varieties, tips, choose/storage text or
      FAQ (domain invariant). They are indexed on the `h1` as alias metadata (spec 059 mechanism)
      and count as names for result ordering. Data: Пипер → „чушки“ (its own text says „чушките“,
      „чушки“).
    - Family pages index the word „семейство“ and store the names of their produce as `members`
      metadata (not indexed, so „домати“ alone still lists the produce). A query with „семейство“
      and other words also searches the family pages for „семейство“ and lists first those whose
      name or members match the other words („семейство домати“ → Картофови). Without the family
      word, family pages come after the other results of the same title rank (Pagefind ranks the
      short family page „Тиквови“ above „Тиквички“ for „тикв“; spec 017 QA wants the produce
      first).
    - No results: the status adds „Сайтът покрива пресни плодове, зеленчуци, билки и ядки от
      България.“
11. **Nutrient ranking tables on phones.** Below 40rem each row is a stacked block (produce name
    on its own line, then labelled cells); explicit `table`, `row` and `columnheader` roles keep the
    table semantics (eslint-plugin-jsx-a11y rejects explicit roles on `td` and row `th`); the
    header row is visually hidden on narrow screens (`.visually-hidden-narrow`); no
    horizontal overflow at 390 px and 320 px.
12. **/abonament.** The hint reads „Копирай адреса от полето и го постави в приложението.“; the
    field selects its text on focus; a „Копирай“ button (hidden without JavaScript or without the
    clipboard API) copies the address and announces „Адресът е копиран.“ in a status line.
13. **Farms.**
    - `/fermi` lists the certified organic farms („Сертифицирани био ферми: …“) after the province
      jump list; their cards keep the „Био · <орган>“ badge.
    - The София-град section links „Ферми в Софийска област (N)“ to that section.
    - A farm whose only contact is a directory profile shows „За връзка с фермата отвори профила
      ѝ в <directory>.“ after the link.
    - Farm contacts show the e-mail address as the link text after „Имейл:“; the link's name is
      „Имейл до <farm>: <address>“.
14. **Group pages.** The first `h2` is „В сезон през <месец> (N)“ with `h3` level groups (peak,
    available, storage) and `h4` cards, or a paragraph when nothing is in season; then the `h2`
    „Извън сезона през <месец>“.
15. **Calendar print.** The print instruction is its own paragraph, hidden in print. Each table
    head starts with a key row (kind name and the four level marks with their words), hidden from
    assistive technology (the cells already carry the level text), repeated on every printed sheet.

### Out of scope

- Content, safety texts, recipe and region wording (spec 061).
- E-mail newsletter, organic filter facets, neighbouring provinces beyond Sofia.
- Fuzzy or transliteration typo matching („damati“).

## 4. Domain model

- `Produce.aliases: ReadonlyArray<string>` (input `aliases?`). Invariant: every alias, lower case,
  occurs in the lower-cased text of the produce (name, summary, varieties, preparation tips,
  choose, storage, FAQ); otherwise `InvalidProduceError`. Duplicates are rejected by the schema.
- `produceSchema.aliases: z.array(text()).default([])`, unique; Keystatic `aliases` array.
- `searchText.ts`: `matchesWordForms(text, terms)` – a term of at most 3 letters matches a word
  equal to it or the term plus an inflection ending; longer terms keep prefix matching.
  `SHORT_TERM_MAX_LENGTH = 3`, `INFLECTION_ENDINGS`.
- Application: `WildProduceService` (catalog) with `all()` (wild produce in Bulgarian alphabetical
  order) and `groupsFor(month)` (`seasonGroups` of the wild produce); wired in the composition root
  as `wildProduceService`.
- Search helpers: `FAMILY_TERM`, `searchFamilyAttributes(word, names)`, `byTitleMatch(items,
terms, laterType?)`.

## 5. Behaviour and edge cases

- Overflow check: `scrollWidth > clientWidth + 1`. Without JavaScript every scroll table stays a
  focusable named region.
- Short-term filter: only when at least one normalised term has at most 3 letters; Latin vitamin
  letters (`c`, `b6`) are excluded from the rule. If no result passes, the search shows „Няма
  резултати“ with the scope note.
- Month without wild produce in season: the section shows its empty text and the link.
- `/divorastyashti` with no wild produce: the empty text „Все още няма диворастящи растения.“
- Copy fails (permission denied): status „Копирането не успя – избери адреса и го копирай.“
- Farm with a profile and also a phone or e-mail: no profile note.
- Group with nothing in season: the in-season `h2` remains, with „Нищо от семейството не е в сезон
  през <месец>.“

## 6. Accessibility requirements

- 1.3.1: tables keep caption, `th scope`; stacked ranking rows keep roles `table`, `row` and
  `columnheader` (Chromium keeps row headers and cells, checked in e2e). Ordered list for sequential steps. Group headings h2 → h3 →
  h4 without skips.
- 1.3.2 / without CSS: no CSS reordering; the calendar key row and the stacked labels add no
  content that needs CSS to make sense; the print hint is hidden only in print.
- 2.1.1 / 2.4.3: no focusable element without a reason (non-overflowing scroll boxes); in-page
  links move focus to their target (`tabindex="-1"`).
- 2.4.1 / 1.3.1: at most one landmark per `h2` section on produce pages (plus page landmarks).
- 2.4.2: the search page title names the query.
- 2.4.6: search results under a „Резултати“ heading; group pages start with a meaningful heading.
- 2.5.3: farm e-mail link name contains its visible text.
- 4.1.3: the copy status is a `role="status"` line.
- 1.4.4 / 1.4.10: nutrition table at 200 % text and ranking tables at 320 px without clipping.
- Zero axe violations in light and dark mode on the touched pages; everything works without
  JavaScript (copy button hidden, scroll tables focusable).

## 7. SEO requirements

- `/divorastyashti`: title „Диворастящи растения в България по сезони“ (≤ 60), description 70–160
  characters, canonical, `CollectionPage` JSON-LD listing the wild produce, internal links to each
  produce, to month pages and from produce pages, month pages, `/katalog` and `/tarsene`.
- Group, month and other titles unchanged. The search title change is client-side only.

## 8. Acceptance criteria

1. **AC1:** Given a `YearStrip`, its `aria-label` and `title` start with „През годината:“; given a
   month page, the legend precedes the season list.
2. **AC2:** Given the legend and the home key, their strip text says how the strip reads as text.
3. **AC3:** Given `ScrollTable`, it renders `tabindex="0"` and a name (no-JS default); given the
   built apple page at 1280 px, its nutrition region is not focusable and unnamed; given
   `/kalendar` at 390 px, the calendar regions stay focusable and named.
4. **AC4:** Given the apple page, the number of `region` landmarks in `main` equals the number of
   its named `h2` sections plus the overflowing scroll tables, and no `section` headed by an `h3`
   has an accessible name.
5. **AC5:** Given the apple page, when the „Източници“ contents link is activated with the
   keyboard, focus is on `#sources`; same for `/kalendar` „Зеленчуци“, `/fermi` „Пловдив“ and the
   home „Всички месеци“; every such target has `tabindex="-1"`.
6. **AC6:** Given a search for „ябълка“, an `h2` „Резултати“ precedes the list and the title
   contains „ябълка“; before searching the heading is hidden.
7. **AC7:** Given a recipe page, the water-bath steps are an `ol`.
8. **AC8:** Given the apple page at 640 px with doubled text, the „% РСП“ header lies inside the
   nutrition box.
9. **AC9:** Given `/divorastyashti`, it has one `h1`, lists every wild produce with a year strip
   and a link, links the 12 month sections; the apple page has no wild tag and the ramsons page's
   tag links `/divorastyashti`; `/sezon/avgust` has a section „Диворастящи през август“ with
   „Черен бъз“; `/tarsene` and `/katalog` link the page; no axe violations.
10. **AC10:** `matchesWordForms`: „нар“ matches „нара“ and „нар“ but not „нарязани“; „лук“
    matches „лукът“; longer terms keep prefix matching. The search for „нар“ lists only results
    with „нар“ as a word form, the pomegranate first.
11. **AC11:** `Produce` with alias „чушки“ whose text has „чушките“ is valid; an alias absent from
    its text throws. The schema accepts `aliases`; Keystatic has the field. The search for „чушки“
    lists Пипер first.
12. **AC12:** The search for „семейство домати“ lists the family page of tomatoes in the first
    three results.
13. **AC13:** The search for „гъби“ shows „Няма резултати“ with the scope sentence.
14. **AC14:** Given `/nutrienti/vitamin-c` at 390 px and 320 px, the ranking table does not
    overflow its box, and the table keeps its roles and headers.
15. **AC15:** Given `/abonament`, the hint text is new, the copy button is hidden without
    JavaScript, visible with it, copies the address and announces it; focusing the field selects
    the address.
16. **AC16:** Given `/fermi`, it lists the certified farms with links, the certified farm card has
    the badge, the София-град section links `#oblast-sofiyska` with the count; a farm with only a
    directory profile shows the profile note.
17. **AC17:** Given `FarmContacts` with an e-mail, the link text is the address and its name is
    „Имейл до <farm>: <address>“.
18. **AC18:** Given a group page, the first `h2` after the `h1` is „В сезон през <месец> (N)“ with
    `h3` level groups, followed by „Извън сезона през <месец>“ when such produce exists.
19. **AC19:** Given `/kalendar` printed, the print instruction is not displayed, and every table's
    head has a key row hidden from assistive technology.

## 9. Test plan

| AC   | Type           | Test file                                                                                         |
| ---- | -------------- | ------------------------------------------------------------------------------------------------- |
| AC1  | component, e2e | `tests/components/YearStrip.test.ts`, `tests/e2e/round2-ux-062.spec.ts`                           |
| AC2  | component      | `tests/components/SeasonLegend-062.test.ts`                                                       |
| AC3  | component, e2e | `tests/components/ScrollTable-060.test.ts`, `round2-ux-062.spec.ts`                               |
| AC4  | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC5  | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC6  | unit, e2e      | `tests/unit/components/search/siteSearch-062.test.ts`, `round2-ux-062.spec.ts`                    |
| AC7  | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC8  | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC9  | unit, e2e      | `tests/unit/contexts/catalog/application/WildProduceService-062.test.ts`, `round2-ux-062.spec.ts` |
| AC10 | unit, e2e      | `tests/unit/shared/seo/searchText-062.test.ts`, `siteSearch-062.test.ts`, e2e                     |
| AC11 | unit, e2e      | `tests/unit/contexts/catalog/domain/Produce-062.test.ts`, `schemas-062.test.ts`, e2e              |
| AC12 | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC13 | unit, e2e      | `siteSearch-062.test.ts`, `round2-ux-062.spec.ts`                                                 |
| AC14 | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC15 | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC16 | e2e, component | `round2-ux-062.spec.ts`, `tests/components/FarmContacts-062.test.ts`                              |
| AC17 | component      | `tests/components/FarmContacts-062.test.ts`                                                       |
| AC18 | e2e            | `round2-ux-062.spec.ts`                                                                           |
| AC19 | e2e            | `round2-ux-062.spec.ts`                                                                           |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                                                              | Topic                                     |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- |
| pagefind         | 1.5.2   | Context7 `/pagefind/pagefind`: `docs/indexing.md` (`data-pagefind-index-attrs` indexed inline), `docs/weighting.md` | Aliases and group members in the index    |
| HTML Standard    | living  | „Scroll to the fragment“ (focusing steps on a focusable target); verified in Chromium with Playwright 1.63.0        | Focus moves to `tabindex="-1"` targets    |
| MDN              | n/a     | `Clipboard.writeText()`, `ResizeObserver`, `HTMLInputElement.select()`                                              | Copy button, overflow check, select       |
| WAI-ARIA 1.2     | current | Roles `table`, `row`, `columnheader`                                                                                | Stacked ranking rows keep table semantics |
| @playwright/test | 1.63.0  | https://playwright.dev/docs/api/class-page (`emulateMedia`, `context.grantPermissions` for clipboard)               | Print and copy tests                      |
