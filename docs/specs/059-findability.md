# 059. Findability: navigation, month links, search, farm list, feed and calendar

- **Status:** Approved
- **Bounded context(s):** UI (layout shell, home, search, farm list, calendar, feed), composition
  (farm list grouping), shared (search query normalisation)
- **Related:** persona usability test of November 2026 (six personas), specs 016 (search),
  023 (site shell), 024 (home and season stamp), 030 (farm pages), 043 (calendar print),
  047 (monthly RSS)

## 1. Goal

Every persona in the November 2026 usability test reached their goal, but most of them lost time
finding things: farms and recipes are only linked from the bottom of the catalogue, the home page
offers other months only in the footer, the search misses farms, regions, months, recipes and the
site's own pages and returns unrelated pages for unknown words, the farm list is 49 cards in one
column, the RSS link opens raw XML and the calendar promises a print layout it does not deliver.
This spec makes every page type findable from the header, the footer and the search, and fixes the
home page contradiction („Няма данни за този месец.“ under 35 in-season items).

## 2. User stories

- As a shopper, I want the home page to say nothing contradictory about this month's data.
- As a screen-reader user, I want the legend of the season stamps before the list that uses them.
- As a reader looking for a farm or a recipe, I want them in the header on every page.
- As a gardener, I want to switch to another month from the top of the home page.
- As a reader on a month page, I want the footer's month strip to show which month I am reading
  and which month is now, without mixing them up.
- As a searcher, I want to find farms, regions, months, recipes, groups, nutrients, the calendar
  and the site's own pages, and to see what kind of page each result is.
- As a Bulgarian keyboard user, I want „витамин С“ with a Cyrillic С to find „Витамин C“.
- As a searcher, I want „ябълка“, „рецепта“ and „ферма“ to find „Ябълки“, the recipes and the
  farms.
- As a searcher, I want an honest „Няма резултати“ for a word the site does not know („гъби“).
- As a searcher with many results, I want to see more than ten.
- As a reader looking for farms near me, I want the farm list grouped by province with jump links.
- As a reader who clicks „RSS абонамент“, I want a readable Bulgarian page that explains what RSS
  is and how to follow the site.
- As a reader who prints the calendar, I want the page to say how many sheets to expect, and
  headings to jump to each kind.

## 3. Scope

### In scope

1. **Home (`/`):**
   - The empty text of `SeasonOverview` is shown only when the whole month overview is empty (no
     peak, available, storage or coming-soon produce), not when only the selected groups are
     empty (the home page selects only „Идват скоро“, which is empty in November).
   - Source order: `h1`, month navigation, intro paragraph, legend, in-season list, coming soon,
     more links.
   - Month navigation under the heading: a `nav` labelled „Други месеци“ with the previous month,
     the next month and „Всички месеци“, a link to the footer's month strip (`#mesetsi`).
2. **Header (`SiteHeader`):** the logo (link to `/`, `aria-current="page"` on the home page) and
   five links: Каталог, Календар, Ферми, Рецепти, Търсене. „Сега“ goes: the logo is the link to
   the home page. Area marking:
   - Каталог: sections, produce, groups, nutrients, regions;
   - Календар: month pages;
   - Ферми: `/fermi` and farm pages;
   - Рецепти: `/retsepti` and recipe pages.
     Below 40rem the nav takes its own full-width row under the logo, its links share that one row
     (labels at `sm` size, spread across the row); from 40rem logo and links share one row.
3. **Footer (`SiteFooter`):**
   - The month strip `nav` gets `id="mesetsi"`.
   - The build month keeps the marker fill and `aria-current="date"` and gains the visible word
     „(сега)“, so the marker never reads as „you are here“.
   - On a month page the page's month gets `aria-current="page"` and a 2px `text` border with
     weight 700 (no marker). On the build month's own page it gets `aria-current="page"`, the
     marker and „(сега)“.
   - The links list adds Ферми (`/fermi`), Рецепти (`/retsepti`) and Области (`/regioni`) before
     „За нас“.
   - „Следи сезона“: a short paragraph after the links with the RSS link and one sentence on what
     it gives („по един запис всеки месец, в приложение за новини“). The RSS link leaves the
     links list.
4. **Search (`/tarsene`, Pagefind):**
   - **Indexed pages** (`data-pagefind-body`) and the visible result type (`type` metadata):

     | Page                                                                   | Indexed part                      | Type label                         |
     | ---------------------------------------------------------------------- | --------------------------------- | ---------------------------------- |
     | Produce                                                                | article (minus the ignored parts) | Плод / Зеленчук / Подправка / Ядка |
     | Section (`/plodove` …), `/katalog`, `/fermi`, `/regioni`, `/retsepti`  | heading and intro                 | Раздел                             |
     | Group                                                                  | heading                           | Ботаническо семейство              |
     | Nutrient                                                               | article                           | Хранително вещество                |
     | Farm                                                                   | article                           | Ферма                              |
     | Region                                                                 | main content                      | Област                             |
     | Recipe                                                                 | article                           | Рецепта                            |
     | Month                                                                  | heading                           | Месец                              |
     | `/kalendar`                                                            | heading and intro                 | Календар                           |
     | `/za-nas`, `/metodologiya`, `/poveritelnost`, `/biskvitki`, `/reklama` | article                           | Страница                           |

     Home, search and 404 stay out of the index. Every indexed `h1` carries the Latin attributes of
     spec 016.

   - **Ignored on produce pages** (`data-pagefind-ignore`): the table of contents, the photo
     credit, the „this month“ line, the month-by-month calendar, the farm list, the sources and the
     ad slot. Farm cards (on any page) ignore their description and contacts.
   - **Query normalisation** (`searchQuery`, pure function), applied before Pagefind:
     - lower case, words split on white space;
     - a single Cyrillic letter А, В, С, Е or К (optionally followed by digits) right after a word
       starting with „витамин“ or „vitamin“ becomes the Latin letter („витамин С“ → „витамин c“,
       „витамин В6“ → „витамин b6“);
     - light Bulgarian stemming of Cyrillic words, because Pagefind has no Bulgarian stemmer (the
       build reports „Pagefind doesn't support stemming for the language bg“): a word of at least
       6 letters ending in „ите“ loses it, a word of at least 5 letters ending in „ът“ or „ят“
       loses it, and then a word of at least 5 letters ending in a vowel (а, я, е, и, о, у, ъ, ю)
       loses that vowel. Pagefind's prefix matching then finds both forms („ябълка“ → „ябълк“
       matches „ябълки“ and „ябълка“). Latin words are left alone.
   - **Relevance guard:** when no indexed word starts with a query word, Pagefind 1.5 falls back to
     the longest indexed word that is a prefix of it („гъби“ → „г“, „поверителност“ → „по“). The
     script therefore checks the best result: if its text has no word that starts with every
     normalised query word, the search shows „Няма резултати“.
   - **Results:** 10 at a time. The status says „Резултати: N за „…“.“ with the full count N, and
     when N > 10 adds „Показани са първите 10.“. A „Покажи още“ button (with `hidden` until there
     are more) adds the next 10, moves focus to the first new result link and updates the status
     („Показани са N от M.“). Each result shows its type label above the title link.
   - The browse list on `/tarsene` adds Ферми, Области, Рецепти and Каталог.
5. **Farm list (`/fermi`):**
   - After the intro, a `nav` „Ферми по области“ with one link per province that has farms
     („Пловдив (3)“) to its section.
   - One `section` per province, in Bulgarian alphabetical order of the province name, with an
     `h2` (the region's place name, e.g. „Пловдив“, „Софийска област“, `id="oblast-<slug>"`), a link to the
     region page, and the farm cards (`h3` names). The flat „Сертифицирани био ферми“ / „Други
     ферми“ grouping does not apply here; certified farms keep their badge on the card.
   - Farm cards show the province first in the meta line, in `text` colour at weight 600.
6. **Feed (`/rss.xml`):** `@astrojs/rss` `stylesheet: '/rss.xsl'` adds
   `<?xml-stylesheet href="/rss.xsl" type="text/xsl"?>`. `/rss.xsl` is generated from `bg.ts`
   strings by an Astro endpoint: a Bulgarian page with a heading, what RSS is, how to follow the
   site (copy the address into a reader app such as Feedly or Inoreader), the feed address and the
   list of items (title as a link, description). `_headers` serves `/rss.xsl` as `text/xsl`. The
   feed stays valid RSS 2.0.
7. **Calendar (`/kalendar`):**
   - The intro says the calendar prints on several A4 sheets in landscape and how to print it
     („Печат“ in the browser menu or Ctrl+P); no button (it would need JavaScript).
   - One `section` per kind with an `h2` („Плодове“, „Зеленчуци“ …, `id="kalendar-<section>"`) and
     its own table (caption „<Kind> по месеци“, month header, produce rows); a „На тази страница“
     jump list to the four kinds above the tables. Column widths are fixed so the four tables line
     up. Print keeps each `h2` with its table's first rows and repeats the month header.

### Out of scope

- Content and data accuracy, safety texts (spec 058), accessibility nits (spec 060).
- Links to neighbouring provinces on region pages: the site has no adjacency data, so none are
  added (the persona request is noted for a future data spec).
- A search field in the header, filters or facets in search.
- Grouping or filtering on month pages, a wild-plant list.
- Making the printed calendar fit one sheet.

## 4. Domain model

No new entities. New pure functions and one read-model method:

- `searchQuery(raw)` in `src/shared/seo/searchText.ts`: returns the normalised query words
  (`ReadonlyArray<string>`), see section 5.
- `matchesAllTerms(text, terms)` in the same module: `true` when every term is the start of a word
  of `text` (both lower-cased, diacritics removed with NFD).
- `FarmPagesQuery.byRegion(on)`: farms grouped by region,
  `ReadonlyArray<{ region; farms: ReadonlyArray<FarmWithRegion> }>`, regions in Bulgarian
  alphabetical order of their name, farms in name order; regions without farms are absent.
- `SeasonOverview` (component) decides emptiness from all four overview groups, not from the
  selected ones.

## 5. Behaviour and edge cases

- `searchQuery`: empty or blank input → `[]`. Words are split on any white space; punctuation
  inside words is kept (Pagefind tokenises it). The homoglyph rule applies only right after a
  vitamin word, so „ябълки с мед“ keeps its Cyrillic „с“. Stemming applies only to words in
  Cyrillic script. „ябълки“ → „ябълк“, „ферма“ → „ферм“, „рецепта“ → „рецепт“, „доматите“ →
  „домат“, „гъби“ → „гъби“ (four letters, kept, so it does not match „гъбата“ on the chestnut page), „дюля“ → „дюля“, „март“ → „март“, „праз“ → „праз“, „yabalki“ → „yabalki“.
- The search sends the normalised words joined by spaces to Pagefind; the status and the URL keep
  the query as typed.
- Relevance guard uses the first result's `content` plus its `title` and `latin` metadata.
- „Покажи още“ appears only when results remain; a new query resets the list and the button.
- Farm list: a province section lists every farm of that province; the jump list counts them.
- Footer: on pages other than month pages no month has `aria-current="page"`.
- Header: on `/` the logo has `aria-current="page"` and no nav link is marked.
- XSL: the stylesheet transforms the feed for browsers; feed readers ignore the processing
  instruction. If a browser does not support XSLT it shows the raw feed as before.

## 6. Accessibility requirements

- 1.3.1 / 1.3.2: the legend precedes the list that uses its stamps; the home month links, the
  footer month strip, the farm province jump list and the calendar jump list are `nav` elements
  with their own labels and lists; one `h2` per kind on `/kalendar` and per province on `/fermi`,
  no skipped heading levels (farm cards are `h3` under the province `h2`).
- 2.4.1: the jump lists let keyboard and screen-reader users skip to a province or kind.
- 2.4.8 / 4.1.2: `aria-current="page"` on the logo on `/`, on the page's month in the footer;
  `aria-current="true"` for areas; `aria-current="date"` stays on the build month, whose cell also
  says „(сега)“ in text, so the state is not conveyed by colour alone (1.4.1).
- 4.1.3: the search status (`role="status"`) announces the total count, how many are shown, and
  the new count after „Покажи още“; focus moves to the first new result so the keyboard user
  continues from there (2.4.3).
- 2.5.8: header links stay 44px tall; „Покажи още“ is at least 44px tall.
- Without JavaScript: header, footer, month navigation, jump lists and the calendar work as plain
  links; the „Покажи още“ button stays `hidden`.
- Without CSS (spec 009): source order is the reading order everywhere; nothing reordered by CSS;
  the type label reads as its own line before the result title.
- Zero axe violations in light and dark mode on `/`, `/fermi`, `/kalendar`, `/tarsene` with
  results and a month page.

## 7. SEO requirements

- No title or description changes except the calendar intro text. Canonicals unchanged.
- More internal links: header and footer link `/fermi`, `/retsepti`, `/regioni` from every page;
  `/fermi` links every region page that has farms.
- `/rss.xsl` is not a page: not in the sitemap; the feed keeps its `atom:link rel="self"`.

## 8. Acceptance criteria

1. **AC1:** Given an overview whose selected groups are empty but which has in-season produce,
   when `SeasonOverview` renders only „comingSoon“, then it shows no „Няма данни за този месец.“;
   given a fully empty overview, it shows it.
2. **AC2:** Given the built home page, the intro paragraph and the legend come before the
   in-season list in source order, and the page does not contain „Няма данни за този месец.“.
3. **AC3:** Given the home page, a `nav` „Други месеци“ right after the `h1` links the previous
   month, the next month and `#mesetsi`, and the footer month strip has `id="mesetsi"`.
4. **AC4:** Given the header on any path, its nav has exactly the links Каталог (`/katalog`),
   Календар (`/kalendar`), Ферми (`/fermi`), Рецепти (`/retsepti`), Търсене (`/tarsene`) in that
   order, and the logo links to `/`.
5. **AC5:** Given the header on `/fermi/venets` Ферми is `aria-current="true"`, on `/fermi` it is
   `page`; on `/retsepti/kiselo-zele` Рецепти is `true`; on `/regioni/plovdiv` Каталог is `true`;
   on `/` the logo is `page` and no nav link is marked.
6. **AC6:** Given a 390 px viewport, all five nav links share one row, every link is at least
   44px tall and the header is at most 100px tall; at 1024 px logo and links share one row of at
   most 64px.
7. **AC7:** Given the footer, it links `/fermi`, `/retsepti` and `/regioni`, and has a „Следи
   сезона“ paragraph with the RSS link.
8. **AC8:** Given the footer on `/sezon/mart` while the build month is November, Март has
   `aria-current="page"`, Ноември has `aria-current="date"` and contains „(сега)“; on any other
   page no month has `aria-current="page"`.
9. **AC9:** `searchQuery` normalises homoglyphs after vitamin words and stems Cyrillic words as in
   section 5; `matchesAllTerms` checks word starts with diacritics removed.
10. **AC10:** Given the built site, farm, region, month, recipe, group, nutrient, section, catalogue,
    calendar and the five info pages have `data-pagefind-body` and a `type` metadata; home and
    search do not.
11. **AC11:** Given a produce page, the photo credit, the month calendar, the farm list, the
    sources and the table of contents are inside `data-pagefind-ignore` elements.
12. **AC12:** Given the built site search, „витамин С“ lists `/nutrienti/vitamin-c` first,
    „ябълка“ lists `/plodove/yabalki` in the first three, „рецепта“ lists `/retsepti` first,
    „ферма“ lists `/fermi` first, „ферма Пловдив“ lists a Plovdiv farm or `/regioni/plovdiv`
    first, „март“ lists `/sezon/mart` first, „календар“ lists `/kalendar` first and
    „поверителност“ lists `/poveritelnost` first; each result shows its type label (e2e).
13. **AC13:** Given the built site search, „гъби“ and „мечи лук“ show „Няма резултати“ (e2e).
14. **AC14:** Given a query with more than 10 results, the status gives the full count, „Покажи
    още“ shows 10 more and moves focus to the 11th result (e2e, and unit with a fake Pagefind).
15. **AC15:** Given `/fermi`, it has a „Ферми по области“ nav linking one `h2` section per
    province with farms, every farm card sits in its province's section, and the page has no axe
    violations in light and dark mode.
16. **AC16:** Given `/rss.xml`, it starts with an `xml-stylesheet` instruction for `/rss.xsl`,
    still parses as RSS 2.0 with its items; `/rss.xsl` is a valid XSLT 1.0 stylesheet with the
    Bulgarian explanation, and `_headers` serves it as `text/xsl`.
17. **AC17:** Given `/kalendar`, the intro says it prints on several A4 sheets, there is one `h2`
    per kind with its own table and a jump list to them, and the page has no axe violations.

## 9. Test plan

| AC   | Type           | Test file                                                                           |
| ---- | -------------- | ----------------------------------------------------------------------------------- |
| AC1  | component      | `tests/components/SeasonOverview-059.test.ts`                                       |
| AC2  | e2e            | `tests/e2e/findability-059.spec.ts`                                                 |
| AC3  | e2e            | `tests/e2e/findability-059.spec.ts`                                                 |
| AC4  | component      | `tests/components/SiteHeader-023.test.ts` (updated)                                 |
| AC5  | component      | `tests/components/SiteHeader-023.test.ts` (updated)                                 |
| AC6  | e2e            | `tests/e2e/site-shell.spec.ts`, `site-shell-qa.spec.ts` (updated)                   |
| AC7  | component      | `tests/components/SiteFooter-059.test.ts`                                           |
| AC8  | component      | `tests/components/SiteFooter-059.test.ts`                                           |
| AC9  | unit           | `tests/unit/shared/seo/searchQuery-059.test.ts`                                     |
| AC10 | e2e            | `tests/e2e/search-059.spec.ts`                                                      |
| AC11 | e2e            | `tests/e2e/search-059.spec.ts`                                                      |
| AC12 | e2e            | `tests/e2e/search-059.spec.ts`                                                      |
| AC13 | e2e            | `tests/e2e/search-059.spec.ts`                                                      |
| AC14 | unit, e2e      | `tests/unit/components/search/siteSearch-059.test.ts`, `search-059.spec.ts`         |
| AC15 | unit, e2e      | `tests/unit/composition/FarmPagesQuery-059.test.ts`, `findability-059.spec.ts`      |
| AC16 | unit, e2e      | `tests/unit/repo/headers-059.test.ts`, `tests/e2e/rss-feed.spec.ts` (extended)      |
| AC17 | component, e2e | `tests/components/SeasonCalendarTable.test.ts` (updated), `findability-059.spec.ts` |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Topic                                 |
| ---------------- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| pagefind         | 1.5.2   | Context7 `/pagefind/pagefind`: `docs/ranking.md` (`metaWeights`, `termSimilarity`), `docs/metadata.md` (`key:value` metadata, several captures with the inline value last), `docs/indexing.md` (`data-pagefind-ignore`), `docs/weighting.md`, `docs/search-config.md` (`exactDiacritics`), `pagefind_web/src/search.rs` (`find_word_extensions` prefix fallback, terms intersected); `node_modules/pagefind/types/index.d.ts`; build log „doesn't support stemming for the language bg“ | Indexing, metadata, matching, ranking |
| @astrojs/rss     | 4.0.19  | `node_modules/@astrojs/rss/dist/index.d.ts` (`stylesheet?: string \| boolean`, „local custom XSL stylesheet“), `dist/index.js` (emits `?xml-stylesheet` with `type="text/xsl"` for `.xsl`)                                                                                                                                                                                                                                                                                              | Feed stylesheet                       |
| astro            | 7.4.8   | Context7 `/withastro/docs` (endpoints: static `GET` routes with a file extension)                                                                                                                                                                                                                                                                                                                                                                                                       | `/rss.xsl` endpoint                   |
| XSLT 1.0         | W3C REC | https://www.w3.org/TR/xslt-10/ (`xsl:output method="html"`, `xsl:for-each`, `xsl:value-of`)                                                                                                                                                                                                                                                                                                                                                                                             | Feed page                             |
| WAI-ARIA 1.2     | current | `aria-current` values `page`, `true`, `date`                                                                                                                                                                                                                                                                                                                                                                                                                                            | Header, footer                        |
| WCAG 2.2         | current | Understanding 1.3.2, 2.4.1, 2.4.3, 4.1.3                                                                                                                                                                                                                                                                                                                                                                                                                                                | Order, bypass, focus, status          |
