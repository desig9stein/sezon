# 016. Site search with Pagefind

- **Status:** Approved
- **Bounded context(s):** UI (search page, header), shared (SEO JSON-LD), build (search index)
- **Related:** specs 003, 009, 010, 011, 013, ADR-0005, issue #8

## 1. Goal

Let visitors find a produce, a section or a nutrient by typing its name, in Cyrillic or in Latin
letters („ябълки“, „yabalki“, „ябъл“). The search is fully static: Pagefind builds an index at
build time and a small script queries it in the browser. Only the search page loads any
JavaScript, and only that page; every other page stays script-free.

## 2. User stories

- As a visitor, I want to type „ябълки“ and get the apple page as the first result.
- As a visitor with a Latin keyboard, I want „yabalki“ to find the same page.
- As a screen-reader user, I want the number of results announced after I type.
- As a visitor without JavaScript, I want the page to say that search needs JavaScript and to
  give me links to browse the catalogue instead.

## 3. Scope

### In scope

- **Search page `/tarsene`:**
  - an `h1` „Търсене“, a `<search>` landmark with a `<form method="get" action="/tarsene">`, a
    labelled `input type="search" name="q"` and a submit button „Търси“;
  - a results region: a status line (`role="status"`) and an ordered list of results, each
    with the page title as a link and a short excerpt;
  - a „Разгледайте“ list of the section pages, the calendar and the nutrient pages, which is
    always present and is the fallback without JavaScript;
  - a `<noscript>` note that search needs JavaScript.
- **Header:** a „Търсене“ link to `/tarsene` as the last item of the main navigation.
- **Index (build):** `pagefind --site dist` after `astro build`, writing `dist/pagefind/`.
  Indexed pages: produce and nutrient pages (`data-pagefind-body` on their `article`) and
  section pages (only their heading, so a section does not outrank the produce it lists). Home, month, calendar, search and error pages are not indexed, because they repeat
  produce names and would crowd the results.
- **Latin queries:** every indexed page's `h1` carries `data-search-latin` with the Latin
  transliteration of the produce, section or nutrient name (the site's own `Slug` rules, words separated by spaces), and
  `data-pagefind-index-attrs="data-search-latin"` so Pagefind indexes it.
- **SEO:** `SearchAction` in the `WebSite` JSON-LD, pointing to `/tarsene?q={search_term_string}`.
- **CSP:** `script-src` gains `'wasm-unsafe-eval'`, which the Pagefind WebAssembly needs.

### Out of scope

- A search field in the header or on other pages (owner decision: page plus link).
- Filters, facets and highlighting inside pages.
- Searching month pages, farms and regions (they come with their own pages).

## 4. Domain model

None. One pure helper in `src/shared/seo/` (or `src/i18n/`):

- `latinSearchText(text)`: the Latin transliteration of a Bulgarian heading, lower case, words
  separated by single spaces (from `Slug.fromBulgarian`), e.g. „Витамин C“ → „vitamin c“,
  „Ябълки“ → „yabalki“.

## 5. Behaviour and edge cases

- **Loading.** The search script is an Astro `<script>` on `/tarsene` only. It imports
  `/pagefind/pagefind.js` lazily: on the first focus of the field, on input or when the page
  opens with `?q=`. No other page references Pagefind.
- **Query.**
  - The form works as a normal GET form: submitting reloads `/tarsene?q=…`, and the script then
    runs the query from the URL and fills the field.
  - Typing searches after a short pause (debounce 200 ms) and updates the URL with
    `history.replaceState`, so the results can be shared or bookmarked.
  - The query is trimmed; an empty query clears the results and the status.
- **Results.**
  - At most 10 results, each an `li` with the title (from Pagefind's `meta.title`, which is the
    page's `h1`) as a link and the excerpt below it.
  - Pagefind returns URLs ending in `.html` (the build writes `name.html` files); the script
    removes the `.html` suffix so links match the site's canonical URLs.
  - The excerpt is Pagefind's `excerpt` (HTML-encoded, with `<mark>` around matches). Titles are
    inserted as text, never as HTML.
- **Status (`role="status"`, polite):** „Търсене…“ while loading, „Резултати: N за „…““ or „Няма резултати за „…“.“ after a search, and „Търсенето не може да се зареди.“ if
  the Pagefind bundle fails to load.
- **Without JavaScript.** The form submits but nothing runs. The `<noscript>` note says
  „Търсенето изисква JavaScript. Разгледайте каталога по-долу.“ and the browse list is there.
- **Partial words.** Pagefind matches word prefixes, so „ябъл“ finds „Ябълки“.
  Pagefind has no Bulgarian stemming, so the singular „ябълка“ and informal spellings such as
  „yabulki“ do not find the plural page; a follow-up can add search terms per produce.
- **Count.** The status counts the results shown (at most 10), so a screen-reader user hears
  the number of links they can reach.
- **Latin label.** Pagefind adds the indexed `data-search-latin` text to the page content. The
  heading also stores it as `latin` metadata (`data-pagefind-meta="latin[data-search-latin]"`),
  and the script removes it from the start of each excerpt.
- **Load failure.** A failed Pagefind load shows the failure status and is retried on the next
  query.
- **JSON-LD.** `websiteJsonLd` takes the search path as input; the path lives in `routes.ts`
  with the other routes.

## 6. Accessibility requirements

- WCAG 1.3.1: the form is inside a `<search>` landmark; the input has a visible `<label>`; the
  results are an ordered list after a status line.
- WCAG 4.1.3: the status line is `role="status"` and announces the number of results without
  moving focus.
- WCAG 2.1.1 and 2.4.7: the field, the button and every result link are keyboard reachable
  with the visible focus outline; typing never moves focus.
- WCAG 2.5.8: the button and links are at least 24 × 24 px.
- WCAG 3.3.2: the label „Какво търсите?“ and a hint with an example („например ябълки или
  yabalki“) linked with `aria-describedby`.
- Spec 009: without CSS the reading order is heading, form, status, results, browse list.
- Zero axe violations in light and dark mode, with and without results, and at 320 px.

## 7. SEO requirements

- Title „Търсене“ (with the site suffix, ≤ 60 characters) and a 70–160 character description.
- `/tarsene` is `noindex, follow` without a canonical URL, like the 404 page: search result
  pages have no content of their own. It is not in the sitemap.
- `WebSite` JSON-LD gets `potentialAction` `SearchAction` with
  `target: <site>/tarsene?q={search_term_string}` and
  `query-input: required name=search_term_string`.
- The header link adds no new indexable content.

## 8. Acceptance criteria

1. **AC1:** `latinSearchText` returns „yabalki“ for „Ябълки“, „vitamin c“ for „Витамин C“ and
   „zelenchutsi“ for „Зеленчуци“.
2. **AC2:** `websiteJsonLd` includes the `SearchAction` with the search URL template.
3. **AC3:** The `SiteSearch` component renders a `<search>` landmark with a GET form to
   `/tarsene`, a labelled `type="search"` input named `q` with a hint, a submit button, an empty
   `role="status"` element, an empty results list, the browse list it is given and the
   `<noscript>` note. The built `/tarsene` has one `h1`, `noindex, follow` and is not in the
   sitemap (e2e).
4. **AC4:** Produce, section and nutrient pages mark their content with `data-pagefind-body`,
   and their `h1` has `data-search-latin` and `data-pagefind-index-attrs="data-search-latin"`;
   the home, month, calendar and search pages have no `data-pagefind-body`.
5. **AC5:** The header navigation ends with a „Търсене“ link to `/tarsene`, and at 320 px the
   header stays at most 180 px tall (spec 013 AC8).
6. **AC6:** In the built site, searching „ябълки“, „yabalki“ and „ябъл“ lists the apple page
   (`/plodove/yabalki`, without `.html`) first; „витамин“ lists a nutrient page; the status
   announces the count; a nonsense query shows „Няма резултати“ (e2e).
7. **AC7:** Opening `/tarsene?q=praz` fills the field and shows the leek page (e2e).
8. **AC8:** No page other than `/tarsene` requests `/pagefind/` files, and `/tarsene` requests
   them only after interaction or with `?q=` (e2e).
9. **AC9:** Without JavaScript `/tarsene` shows the `<noscript>` note and the browse links; the
   page has zero axe violations in light and dark mode, at 320 px and with results (e2e).
10. **AC10:** The `_headers` CSP allows `'wasm-unsafe-eval'` in `script-src`, and Lighthouse
    meets ADR-0005 on `/tarsene` (unit, LHCI).

## 9. Test plan

| AC   | Type           | Test file                                                                   |
| ---- | -------------- | --------------------------------------------------------------------------- |
| AC1  | unit           | `tests/unit/shared/seo/latinSearchText.test.ts`                             |
| AC2  | unit           | `tests/unit/shared/seo/jsonLd-016.test.ts`                                  |
| AC3  | component, e2e | `tests/components/SiteSearch.test.ts`, `tests/e2e/search.spec.ts`           |
| AC4  | e2e            | `tests/e2e/search.spec.ts`                                                  |
| AC5  | component      | `tests/components/SiteHeader-016.test.ts`, existing `atlas-restyle.spec.ts` |
| AC6  | e2e            | `tests/e2e/search.spec.ts`                                                  |
| AC7  | e2e            | `tests/e2e/search.spec.ts`                                                  |
| AC8  | e2e            | `tests/e2e/search.spec.ts`                                                  |
| AC9  | e2e            | `tests/e2e/search.spec.ts`, `readable-without-css.spec.ts`                  |
| AC10 | unit, LHCI     | `tests/unit/repo/headers-016.test.ts`, `lighthouserc.cjs`                   |

QA regression tests (`QA 016`): `tests/unit/components/search/siteSearch.test.ts` (happy-dom:
templates, `.html` suffix, Latin label, shown count, empty query, retry after a failed load,
race between queries, `?q=` on start), `searchAttributes.test.ts`, and in `search.spec.ts` the
empty-page axe scan, the 24 px browse links and the excerpt without the Latin label.

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                                                                                                                                                         | Topic                          |
| ---------------- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| pagefind         | 1.5.2   | Context7 `/pagefind/pagefind` (docs: api.md `init`, `options`, `search`, `result.data()`; indexing.md `data-pagefind-body`, `data-pagefind-index-attrs`; config-options.md; hosting.md CSP `wasm-unsafe-eval`) | JS API, indexing, CLI, CSP     |
| vitest           | 5.1.0   | Context7 `/vitest-dev/vitest` (guide/environment: `@vitest-environment` per file; happy-dom 21.0.4)                                                                                                            | DOM tests of the search script |
| astro            | 7.4.8   | Context7 `/withastro/docs` (guides/client-side-scripts: `<script>` processing)                                                                                                                                 | Page script                    |
| WCAG 2.2 / HTML  | current | `<search>` element (WHATWG HTML), Understanding 4.1.3 Status Messages, 3.3.2                                                                                                                                   | Landmark, status, labels       |
| schema.org       | current | `SearchAction`, `potentialAction`                                                                                                                                                                              | Sitelinks search box           |
