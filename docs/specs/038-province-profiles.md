# 038. Province profiles: sourced agricultural facts on every region page

- **Status:** Approved
- **Bounded context(s):** geography (domain, application, content), composition (region pages),
  UI
- **Related:** issue #105, spec 029 (region pages, „Province descriptions“ out of scope), spec 033
  (МЗХ sources for growing regions)

## 1. Goal

Region pages (spec 029) list only the produce and farms the site knows about, so 13 of the 28
provinces have no page and the others say nothing about the province itself. Issue #13 asked for a
short description per province, but nothing may be invented. The Ministry of Agriculture and Food
(МЗХ, „Агростатистика“) publishes per-province figures: the utilised agricultural area with its
arable land and permanent grassland (БАНСИК 2025), and the area of each main fruit species
(orchard structure survey 2023). This feature stores those figures per province, shows them on the
region page as a few generated sentences with their sources, and gives every province a page.

## 2. User stories

- As a reader, I want to know how much farmland my province has and which fruit trees cover the
  most land there, with the source.
- As a reader from a province with no produce or farm in the catalogue yet, I want a page for my
  province anyway.
- As the owner, I want every figure checked against the official tables by an automated test.

## 3. Scope

### In scope

- **Content:** each `src/data/regions/<slug>.yaml` gets an optional `profile` (filled for all 28):
  ```yaml
  profile:
    utilisedAreaHa: 257175 # ИЗП 2025, source A
    arableHa: 195490 # source A
    grasslandHa: 47201 # permanent grassland, source A
    topFruits: # the two species with the largest area, source B, descending
      - { name: черешите, areaHa: 1676 }
      - { name: сливите, areaHa: 1551 }
    sources:
      - { name: 'МЗХ, Агростатистика – БАНСИК 2025: …', url: 'https://…' }
      - { name: 'МЗХ, Агростатистика – Структура на основни овощни видове …', url: 'https://…' }
  ```
  - Fruit names are Bulgarian plurals with the definite article, so they read inside a sentence:
    черешите, сливите, орехите, ябълките, прасковите и нектарините, кайсиите, бадемите, малините,
    вишните, лешниците, крушите.
  - A species whose cell is confidential („с“) in source B is never a top fruit.
- **Reference table:** `tests/fixtures/regions/province-profile-2025.csv`, the researched
  per-province table plus a `grassland_ha` column read from source A, Table 2. A content test
  compares every YAML profile with it.
- **Domain:** `RegionProfile` value object in geography, held by `Region.profile` (optional), and
  a typed error `InvalidRegionProfileError`.
- **Application:** `utilisedAreaRank(regions, slug)` in geography `application/`: the rank of the
  region's utilised area among the regions with a profile (1 = largest), with the number of
  ranked regions.
- **Read model:** `RegionPagesQuery`
  - `hasPage` is true for a region with a profile, as well as for one with produce or farms;
  - `forSlug` returns `areaRank` (`{ rank, total }`) for a region with a profile.
- **Region page:** a section `h2` „Земеделие в областта“ after the map and before
  „Какво расте тук“, with the sentences built by `ui.regions.profile.summary` and the two sources
  as links under it.
- **Meta:** `ui.regions.pageDescription` takes the utilised area and describes the agricultural
  data when the page lists no produce and no farm.
- **Overview:** `/regioni` links all 28 provinces. A province with no produce and no farm shows its
  utilised area instead of counts.
- **Methodology:** the „Области“ text names the two МЗХ publications behind the province data.

### Out of scope

- Other figures from the bulletins (cereals, vegetables, ranks of orchards).
- Narrative descriptions (climate, history): no single official source covers them.
- Changing the title pattern of region pages (spec 029).

## 4. Domain model

**`RegionProfile`** (value object, `src/contexts/geography/domain/RegionProfile.ts`):

- `utilisedAreaHa`, `arableHa`, `grasslandHa`: hectares;
- `topFruits: ReadonlyArray<TopFruit>` with `TopFruit { name, areaHa }`;
- `sources: ReadonlyArray<RegionSource>` with `RegionSource { name, url }` (structurally the same
  as catalog's `Source`; geography has no upstream context, so it declares its own);
- `arableShare` and `grasslandShare`: the fractions of the utilised area (0–1).

Invariants (`RegionProfile.create` throws `InvalidRegionProfileError`):

1. every area (the three totals and each fruit area) is a finite number greater than zero;
2. `arableHa + grasslandHa ≤ utilisedAreaHa`;
3. one or two top fruits, each with a non-empty name, in descending order of area (equal areas
   allowed);
4. at least one source, and every source URL is HTTPS with a dotted hostname.

**`Region`** gains `profile?: RegionProfile`.

**`utilisedAreaRank(regions, slug)`** (`application/utilisedAreaRank.ts`) returns
`{ rank, total } | undefined`:

- `total` is the number of regions with a profile;
- `rank` is 1 plus the number of regions with a strictly larger utilised area (ties share a rank);
- `undefined` when the region does not exist or has no profile.

## 5. Behaviour and edge cases

- **Sentences** (`ui.regions.profile.summary(profile, rank)`), e.g. Plovdiv:
  „Използваната земеделска площ е 257 175 ха (2025 г.) – пета по големина сред 28-те области.
  Обработваемата земя е 76% от нея, а постоянните пасища и ливади – 18%. С най-голяма площ от
  овощните видове са черешите (1 676 ха) и сливите (1 551 ха, 2023 г.).“
  - Areas use a non-breaking space as the thousands separator for every number of four digits or
    more (`1 676`), like the region notes of spec 033.
  - Percentages are rounded to whole numbers and written without a space, like the nutrient
    tables. A share that rounds to 0 reads „под 1%“ (Silistra's grassland is 0.4%).
  - The rank is an ordinal word in the feminine form: „първа“ … „двадесет и осма“. Numbers outside
    1–99 fall back to digits with „-а“ (never needed for 28 provinces).
  - With one top fruit the last sentence names only that one.
- **Ties:** in Sofia city, plums and walnuts both have 10 ha after sweet cherries (11 ha). The
  researched table lists plums second; the data keeps that choice and the sentence stays true
  („черешите (11 ха) и сливите (10 ха, 2023 г.)“).
- **Description** for a page without produce and farms: „<В/Във place> използваната земеделска
  площ е N ха (2025 г.). Виж колко от нея е обработваема земя и кои овощни видове заемат най-голяма
  площ.“ It follows the „във“ and „Софийска област“ rules of spec 029. With produce or farms, the
  description stays as in spec 029. With neither and no area, the builder throws
  `InvalidPageMetaError`.
- **Overview item** for a region with a page but no produce and no farm: „N ха земеделска площ“.
- **Without CSS:** the section is a heading, a paragraph and a list of links in source order.
- No JavaScript.

## 6. Accessibility requirements

- The new section is an `h2` under the page `h1`, labelled by its heading (`aria-labelledby`);
  no level is skipped (1.3.1, 2.4.6).
- Sources are a list of links whose text is the publication name (2.4.4).
- Text uses the existing colour tokens (body and muted text), so contrast stays ≥ 4.5:1 (1.4.3).
- The province map now links every province; each link keeps the focus ring from spec 029 (2.4.7)
  and the overview list repeats every link (2.5.8 equivalent control).
- Zero axe violations in light and dark mode on the Plovdiv page and on a profile-only page.

## 7. SEO requirements

- Titles stay „<Име>: какво расте и местни ферми“ (≤ 60, spec 029).
- Descriptions are 70–160 characters for every province, including the profile-only form.
- 15 new region pages enter the sitemap automatically; `/regioni` `CollectionPage` lists all 28.
- Internal links: every province page is linked from the map and the list on `/regioni` and from
  the maps of the other region pages.
- YMYL: every figure on the page has its source listed under the section.

## 8. Acceptance criteria

1. **AC1:** Given a valid profile, when `RegionProfile.create`, then it keeps the figures and
   `arableShare`/`grasslandShare` are the fractions of the utilised area.
2. **AC2:** Given an area that is zero, negative or not finite, then it throws
   `InvalidRegionProfileError`.
3. **AC3:** Given arable land plus grassland larger than the utilised area, then it throws
   `InvalidRegionProfileError`.
4. **AC4:** Given zero or three top fruits, or two in ascending order, then it throws
   `InvalidRegionProfileError`; given one fruit, or two with equal areas, it is valid.
5. **AC5:** Given no source, or a source that is not HTTPS, then it throws
   `InvalidRegionProfileError`.
6. **AC6:** Given a region record with a profile, when mapped, then `region.profile` holds it;
   given none, `region.profile` is `undefined`.
7. **AC7:** Given regions with and without profiles, when `utilisedAreaRank`, then the largest is
   1, ties share a rank, `total` counts only regions with a profile, and a region without a
   profile or an unknown slug gives `undefined`.
8. **AC8:** Given a region with a profile but no produce and no farm, when `overview()`, then
   `hasPage` is true and `pageSlugs()` includes it; when `forSlug`, then it returns `areaRank`.
9. **AC9:** Given ranks 1–28, then the feminine ordinal is „първа“, „втора“, …, „двадесет и осма“
   (each checked).
10. **AC10:** Given the Plovdiv profile and rank 5 of 28, then the summary is the sentence in
    section 5, with non-breaking thousands separators; given a share under 0.5%, it reads
    „под 1%“; given one top fruit, only that one is named.
11. **AC11:** Given every province with no produce and no farm, then the description is 70–160
    characters, mentions the utilised area and keeps the „във“ and „Софийска област“ rules; given
    no counts and no area, it throws `InvalidPageMetaError`.
12. **AC12:** Given the content, then each of the 28 region files has a profile whose figures equal
    the reference CSV (utilised, arable and grassland hectares, the two top fruits with their
    areas and names), whose top fruits are never confidential cells, and whose sources are the two
    МЗХ bulletins.
13. **AC13:** Given the built site, then every province has a page, and `/regioni` links all 28.
14. **AC14:** Given the Plovdiv page, then „Земеделие в областта“ is an `h2` after the map and
    before „Какво расте тук“, its text has the Plovdiv figures and rank, and it lists the two
    sources as links.
15. **AC15:** Given the Smolyan page (no produce and no farm), then it exists, shows the section
    and the produce and farm empty states, and has no axe violations in light and dark mode.

## 9. Test plan

| AC   | Test type | Test file                                                            |
| ---- | --------- | -------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/contexts/geography/domain/RegionProfile.test.ts`         |
| AC2  | unit      | `tests/unit/contexts/geography/domain/RegionProfile.test.ts`         |
| AC3  | unit      | `tests/unit/contexts/geography/domain/RegionProfile.test.ts`         |
| AC4  | unit      | `tests/unit/contexts/geography/domain/RegionProfile.test.ts`         |
| AC5  | unit      | `tests/unit/contexts/geography/domain/RegionProfile.test.ts`         |
| AC6  | unit      | `tests/unit/contexts/geography/infrastructure/mappers.test.ts`       |
| AC7  | unit      | `tests/unit/contexts/geography/application/utilisedAreaRank.test.ts` |
| AC8  | unit      | `tests/unit/composition/RegionPagesQuery-038.test.ts`                |
| AC9  | unit      | `tests/unit/i18n/regionProfile.test.ts`                              |
| AC10 | unit      | `tests/unit/i18n/regionProfile.test.ts`                              |
| AC11 | unit      | `tests/unit/i18n/regionProfile.test.ts`                              |
| AC12 | unit      | `tests/unit/content/province-profiles.test.ts`                       |
| AC13 | e2e       | `tests/e2e/region-pages.spec.ts` (spec 029 AC7, updated)             |
| AC14 | e2e       | `tests/e2e/province-profiles.spec.ts`                                |
| AC15 | e2e       | `tests/e2e/province-profiles.spec.ts`                                |

The spec 029 tests that assumed pages only for regions with produce or farms (e2e AC7) now treat a
profile as data too; their intent (no thin pages, the overview links exactly the existing pages)
is unchanged.

## 10. Third-party documentation consulted

| Source                                                                                                              | Version / edition            | URL or Context7 ID                                                                                                       | Topic                                                                                                |
| ------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- |
| A. МЗХ, Агростатистика: „БАНСИК 2025: Заетост и използване на територията през 2025 година – окончателни резултати“ | бюлетин № 465, декември 2025 | https://www.mzh.government.bg/media/filer_public/2025/12/04/ra_465_publicationbancik2025.pdf                             | Table 2 (p. 17): utilised agricultural area, arable land and permanent grassland per province, in ha |
| B. МЗХ, Агростатистика: „Структура на основни овощни видове в България през 2023 година (предварителни резултати)“  | бюлетин № 448                | https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448_publicationstructureorchard2023-preliminaryresults.pdf | Tables 1–2: area per fruit species per province; „с“ marks confidential cells                        |
| Zod                                                                                                                 | 4.6.7 (via `astro/zod`)      | `/colinhacks/zod/v4.3.6` (Context7, nearest indexed version)                                                             | `z.array().min().max()`, number checks                                                               |
| MDN `Intl.NumberFormat()`                                                                                           | –                            | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat/NumberFormat          | `useGrouping: 'always'` groups four-digit numbers (the Bulgarian locale default `auto` does not)     |
| Astro                                                                                                               | 7.4.8                        | `/withastro/docs` (Context7), as recorded in spec 029                                                                    | `getStaticPaths` for the region pages (no API change)                                                |
