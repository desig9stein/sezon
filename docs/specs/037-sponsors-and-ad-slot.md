# 037. Sponsors and ad slot

- **Status:** Approved
- **Bounded context(s):** advertising (new), shared, composition, UI
- **Related:** issue #17, ADR-0003 (hybrid advertising), ADR-0005 (Lighthouse), spec 015
  (produce photos), #19 (AdSense fallback)

## 1. Goal

ADR-0003 says direct sponsors come first: a sponsor banner is a content entry rendered as static
HTML, clearly labelled „Реклама“ and linked with `rel="sponsored"`. This feature adds the
`advertising` bounded context, a `sponsors` content collection and an `AdSlot` component placed on
produce and month pages. A slot shows the sponsor that is active for its placement on the build
date, and nothing at all when there is none. There are no real sponsors yet, so the collection is
empty and the built pages contain no ad markup.

## 2. User stories

- As a reader, I want any advertising to be clearly labelled and kept away from the top of the page,
  so that I can tell it apart from the content.
- As the site owner, I want to add a sponsor banner by adding one YAML file with dates, so that it
  appears and disappears on its own at the next build.
- As a reader using a screen reader or no CSS, I want the ad to be announced as an advertisement
  before its link.

## 3. Scope

### In scope

- **Shared kernel:**
  - `ImageAsset`, `ImageFormat` and `IMAGE_FORMATS` move from catalog's `ProducePhoto.ts` to
    `src/shared/domain/ImageAsset.ts`, because a domain may import only its listed upstream
    contexts and advertising has none. Catalog re-exports them, so its public API does not change.
  - `ImageSchemaFactory` moves to `src/shared/infrastructure/schemaPrimitives.ts`; catalog
    re-exports it.
  - New error `InvalidSponsorError`.
- **Advertising context** (`src/contexts/advertising/`): domain, application, infrastructure and a
  public `index.ts` (domain and application only). ESLint's dependency rules list it with no
  upstream contexts.
- **Content:** a `sponsors` collection over `src/data/sponsors/*.yaml`. The folder is committed
  empty (with `.gitkeep`).
- **Composition root:** `sponsorSelectionService`.
- **UI:** `src/components/ads/AdSlot.astro`; placements on `/[section]/[slug]` and `/sezon/[month]`.
- **i18n:** `ui.ads.label` „Реклама“.

### Out of scope

- AdSense fallback, consent and lazy loading of third-party code (#19).
- Sponsored farm cards (farms already carry `sponsored`).
- Any real or example sponsor data (AGENTS.md section 10 forbids invented data).
- Click tracking or analytics.

## 4. Domain model

- `AD_PLACEMENTS = ['produce', 'month'] as const`; `AdPlacement` is its element type.
- **Entity `Sponsor`** (immutable, frozen), created by `Sponsor.create(input)`:
  - `id`: a slug (`SLUG_PATTERN`), the content entry id.
  - `name`: the sponsor's name, non-blank.
  - `image: ImageAsset`: the banner, positive width and height.
  - `alt`: non-blank Bulgarian alternative text.
  - `url`: an HTTPS URL with a dotted host (`isHttpsUrl`).
  - `placement: AdPlacement`.
  - `from`, `to`: dates without time, i.e. exactly UTC midnight (`getTime() % MS_PER_DAY === 0`),
    inclusive calendar days; `to` is not before `from`. A date with a time of day is rejected,
    because `2026-11-14T00:00:00+02:00` is 13 November in UTC and would start the campaign a day
    early. Stored as epoch milliseconds; the `from` and `to` getters return a new `Date` each
    time, so callers cannot mutate the frozen sponsor.
  - `create` throws `InvalidSponsorError` when any invariant fails.
  - `isActiveOn(date, timeZone = Europe/Sofia)`: `true` when the calendar day of `date` in the time
    zone (`calendarDayIn`) is between the ISO days (`isoDay`) of `from` and `to`, both included.
- **Shared kernel helpers** (`src/shared/domain/calendarDay.ts`): `MS_PER_DAY`, `isoDay(date)` (the
  UTC day as `YYYY-MM-DD`, also used by `Farm.isOrganicOn`) and `isUtcMidnight(date)`.
- **`SponsorRepository`** (domain interface): `all(): Promise<ReadonlyArray<Sponsor>>`.
- **`SponsorSelectionService`** (application): `forPlacement(placement, on)` returns the sponsor
  for the placement that is active on `on`, or `undefined`.
- **Infrastructure:**
  - `sponsorSchemaWith({ image })`: strict Zod schema of a sponsor entry (`name`, `image`, `alt`,
    `url`, `placement`, `from`, `to`), refined so that `from <= to`. `from` and `to` use the shared
    `calendarDate()` primitive: a YAML date (UTC midnight) or an ISO `YYYY-MM-DD` string; a
    timestamp or string with a time of day is rejected.
  - `toSponsor(id, record)` mapper.
  - `LoadedSponsorRepository`: caches a successful load, retries a failed one, through the shared
    `cachedLoad(load)` helper in `src/shared/infrastructure/cachedLoad.ts`, which
    `IndexedRepository` and the composition root's content load also use.

## 5. Behaviour and edge cases

- **Selection:**
  - No sponsors, or none for the placement: `undefined`.
  - A sponsor whose `to` is before the day of `on` (expired) or whose `from` is after it (future)
    is ignored.
  - Several active sponsors: the one with the latest `from` wins; ties go to the lowest `id`
    (code-point order). The result does not depend on the repository order.
- **Day boundaries:** `isActiveOn` compares Europe/Sofia calendar days, so 23:59 local time on `to`
  is still active and 00:00 local time the next day is not, whatever the UTC offset.
- **Empty collection:** the glob loader logs `[WARN] [glob-loader] No files found matching "*.yaml"
in directory "src/data/sponsors"`. This warning is expected while there are no sponsors and is
  not silenced. (On a build without a cached data store, the content runtime may also log
  `The collection "sponsors" does not exist or is empty`, at most once, because the repository
  loads once.) `getCollection` returns an empty array and the build succeeds.
- **Content validation:** a sponsor file with `from` after `to`, a date with a time of day, a
  non-HTTPS `url`, an unknown `placement`, a blank `alt` or an unknown field fails the build.
  `docs/CONTENT-GUIDE.md` („Add a sponsor“) describes the fields for editors.
- **AdSlot:**
  - Without a sponsor it renders nothing (no element, no whitespace-only wrapper).
  - With a sponsor it renders
    `<aside class="ad-slot" aria-labelledby="ad-slot-<placement>-label" data-placement="…">`, then
    the visible label `<p id="ad-slot-<placement>-label">Реклама</p>`, then
    `<a href={url} rel="sponsored noopener">` around an `astro:assets` `<Image>` with explicit
    `width` and `height` of 480 × 120, a `srcset` with 480w and 960w, `sizes`, `fit="cover"`,
    `loading="lazy"`, `decoding="async"` and the sponsor's `alt`. The id is unique per page
    because each page has at most one slot per placement.
  - **Intrinsic size 480 × 120:** with CSS removed, a 960 px wide `<img>` made month pages scroll
    sideways on a 412 px phone (scrollWidth 968). The `width`/`height` attributes are therefore
    480 × 120, and the 960 px rendition is offered only in the `srcset` for wide and high-density
    screens.
  - The slot reserves its size: the link box has `aspect-ratio` 4 / 1 (a custom property set from
    the component's ratio constants) and the slot `max-width: var(--reading-width)`; the image
    fills the box with `object-fit: cover`. There is no layout shift when the image loads.
  - The component's scoped CSS (a few hundred bytes) is inlined on every produce and month page
    even when no sponsor is active, because Astro bundles a component's styles wherever it is
    imported. This is accepted: it adds no markup, no request and no layout cost.
- **Placement:**
  - Produce page: a direct child of the `<article>`, right after the „Как да го ядеш“ group that
    contains the nutrition table. Never in the header, so never above the fold.
  - Month page: in `<main>`, after the season lists, „what changes“ and „coming soon“ lists,
    before the month pager. On a large desktop window a month with few produce can be short
    enough for the slot to show without scrolling; this is accepted, because ADR-0003 forbids
    ads above the fold on mobile only and the slot is still after all the main content.
  - **Below the fold on mobile** is checked manually, because it needs a real sponsor in the
    build: QA measured the slot's top at 3582 px and more on produce pages and 1128 px and more on
    month pages at Pixel 7 (412 × 915). The component test renders both pages with an in-memory
    sponsor and checks the slot's position in the markup.
  - Both pages call the service with `BUILD_DATE` from `src/composition/clock.ts`.

## 6. Accessibility requirements

- **1.1.1 Non-text content:** the banner image has the sponsor's non-empty Bulgarian `alt`, which is
  also the link's accessible name.
- **1.3.1 / 1.3.2 Info and relationships, meaningful sequence:** the slot is an `<aside>` named
  „Реклама“ by its visible label through `aria-labelledby` (no duplicate `aria-label`). The label
  comes before the link in source order, so the page reads correctly without CSS.
- **Landmarks:** the `<aside>` is a complementary landmark. axe's best-practice rule
  `landmark-complementary-is-top-level` forbids it inside another landmark except `<main>`, so it is
  never placed inside a labelled `<section>` (a region); on the produce page it is a direct child
  of the `<article>`.
- **1.4.3 Contrast:** the label uses `--color-text-muted` on `--color-background`, a pair already
  required to reach 4.5:1 in both palettes (`REQUIRED_CONTRAST_PAIRS`).
- **2.4.7 / 2.5.8:** the link keeps the global `:focus-visible` outline; the banner is far larger
  than 24 × 24 px.
- **2.4.4 Link purpose:** the link name is the `alt`, which names the sponsor's offer.
- **Without JavaScript:** static HTML; no script.
- **Without CSS:** the image keeps its `width`/`height` attributes (480 × 120), so it neither renders
  oversized nor makes a 412 px wide page scroll sideways, and the label precedes it.
- **Reduced motion:** no animation.

## 7. SEO requirements

- `rel="sponsored"` on every sponsor link (Google's guidance on paid links); `noopener` for safety.
- The slot adds no structured data, does not change titles, descriptions or canonicals, and adds no
  internal links.
- The image is lazy-loaded and size-reserved, so LCP and CLS are unaffected (ADR-0005).
- While the collection is empty, built pages contain no `.ad-slot`.

## 8. Acceptance criteria

1. **AC1:** Given valid input, when `Sponsor.create` is called, then it returns a frozen sponsor with
   those values, and mutating a `Date` it returns does not change the sponsor.
2. **AC2:** Given an invalid slug, a blank name or alt, a non-HTTPS URL, an unknown placement, an
   invalid date, a date with a time of day (not UTC midnight), an image without a positive size, or
   `to` before `from`, when `Sponsor.create` is
   called, then it throws `InvalidSponsorError`.
3. **AC3:** Given a sponsor from 2026-12-01 to 2026-12-31, when `isActiveOn` is called, then it is
   `true` on both edge days (00:00 and 23:59 Europe/Sofia) and `false` on the day before and the day
   after in Europe/Sofia, also when UTC is still on the other day.
4. **AC4:** Given no sponsor for a placement, or only expired or future ones, when
   `forPlacement(placement, on)` is called, then it returns `undefined`.
5. **AC5:** Given one active sponsor for the placement and one active for another placement, when
   `forPlacement` is called, then it returns the one for the requested placement.
6. **AC6:** Given several active sponsors for a placement, when `forPlacement` is called, then it
   returns the one with the latest `from`, and on a tie the lowest `id`, whatever the repository
   order.
7. **AC7:** Given a sponsor record, when it is parsed by `sponsorSchemaWith` and mapped by
   `toSponsor`, then a valid record yields a sponsor; a record with `from` after `to`, a date with
   a time of day, a non-HTTPS `url` or an unknown `placement` is rejected by the schema.
8. **AC8:** Given no sponsor, when `AdSlot` is rendered, then the output is empty.
9. **AC9:** Given a sponsor, when `AdSlot` is rendered, then it is an `<aside class="ad-slot">`
   labelled by its visible „Реклама“ label (`aria-labelledby`), with the label before a link to the
   sponsor URL with `rel="sponsored noopener"`, and the image has the sponsor's `alt`, explicit
   `width` and `height` of 480 × 120, a 960w candidate in `srcset`, `loading="lazy"` and
   `decoding="async"`.
10. **AC10:** Given the empty `sponsors` collection, when the site is built, then produce and month
    pages contain no `.ad-slot`.
11. **AC11:** Given the i18n module, then `ui.ads.label` is „Реклама“.
12. **AC12:** Given a sponsor for every placement, when the produce and month pages are rendered,
    then the produce slot is a direct child of `<article>` right after `#eat`, the month slot is in
    `<main>` before the month pager, and neither is inside a `<section>`.
13. **AC13:** Given a cached load, when it succeeds it runs once for all callers; when it fails, the
    next call loads again.

## 9. Test plan

| AC   | Test type | Test file                                                                                                                           |
| ---- | --------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/contexts/advertising/domain/Sponsor.test.ts`, `tests/unit/contexts/advertising/qa037-regressions.test.ts`               |
| AC2  | unit      | `tests/unit/contexts/advertising/domain/Sponsor.test.ts`, `tests/unit/contexts/advertising/qa037-regressions.test.ts`               |
| AC3  | unit      | `tests/unit/contexts/advertising/domain/Sponsor.test.ts`                                                                            |
| AC4  | unit      | `tests/unit/contexts/advertising/application/SponsorSelectionService.test.ts`                                                       |
| AC5  | unit      | `tests/unit/contexts/advertising/application/SponsorSelectionService.test.ts`                                                       |
| AC6  | unit      | `tests/unit/contexts/advertising/application/SponsorSelectionService.test.ts`                                                       |
| AC7  | unit      | `tests/unit/contexts/advertising/infrastructure/sponsorSchema.test.ts`, `tests/unit/contexts/advertising/qa037-regressions.test.ts` |
| AC8  | component | `tests/components/AdSlot.test.ts`                                                                                                   |
| AC9  | component | `tests/components/AdSlot.test.ts`                                                                                                   |
| AC10 | e2e       | `tests/e2e/ad-slot.spec.ts`                                                                                                         |
| AC11 | unit      | `tests/unit/i18n/bg-037.test.ts`                                                                                                    |
| AC12 | component | `tests/components/AdSlot-placement-037.test.ts` (in-memory services via `vi.mock`)                                                  |
| AC13 | unit      | `tests/unit/shared/infrastructure/cachedLoad.test.ts`                                                                               |

## 10. Third-party documentation consulted

| Package / source | Version | Source (URL or Context7 ID)                                                                                   | Topic                                                                                                                                          |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| astro            | 7.4.8   | `/withastro/docs` (Context7): `reference/modules/astro-assets.mdx`, `guides/images.mdx`                       | `<Image />` from `astro:assets`: required `alt`, optional `width`/`height` for `src/` images, output with `loading="lazy"`, `decoding="async"` |
| astro            | 7.4.8   | `/withastro/docs` (Context7): `guides/images.mdx`, `reference/modules/astro-content.mdx` (`SchemaContext`)    | The `image()` schema helper passed to a collection's `schema` function                                                                         |
| astro            | 7.4.8   | `node_modules/astro/dist/content/runtime.js`, `node_modules/astro/dist/content/config.d.ts` (`ImageFunction`) | An empty collection logs a warning and `getCollection` returns `[]`; the type of `image()`                                                     |
| axe-core         | 4.14.0  | `node_modules/axe-core/axe.js` (`landmarkIsTopLevelEvaluate`)                                                 | A complementary landmark may sit inside `<main>` but not inside another landmark such as a labelled `<section>`                                |
| happy-dom        | 21.0.4  | `node_modules/happy-dom` type definitions (`Window`, `DOMParser`)                                             | Parsing rendered page HTML in the placement test, in the Node test environment                                                                 |
| Google Search    | –       | https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links                            | `rel="sponsored"` for paid links                                                                                                               |
