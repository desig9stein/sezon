# 033. Content review, step 2: growing regions from official statistics

- **Status:** Approved
- **Bounded context(s):** catalog (content model and data), composition (produce details)
- **Related:** issue #10, spec 032 (step 1), `docs/content-review/README.md`, owner decision of
  2026-11-12 („You do it“)

## 1. Goal

Each produce lists the provinces where it grows well, with a short note, but neither is sourced.
The Ministry of Agriculture and Food (МЗХ), department „Агростатистика“, publishes official
surveys:

- „Структура на овощните видове – 2023“ gives planted areas **by province** for apples, pears and
  walnuts.
- „Производство на зеленчуци – реколта 2022“ gives areas by statistical region (NUTS2) for
  head cabbage.

This step:

- adds an optional source to a growing region;
- aligns the regions of apples, pears, walnuts and cabbage with that data, with notes that quote
  the figures;
- records in the checklist which products have no official regional data, so their notes remain
  editorial.

## 2. User stories

- As a reader, I want to know why a province is named and where that comes from.
- As the reviewer, I want regions that match official statistics, so I can sign them off.

## 3. Scope

### In scope

- **Content model:** `regions[].source` (optional `{ name, url }`, like other sources), mapped to
  `GrowingRegion.source` and resolved by `ProduceDetailsQuery`. A region source is listed in the
  produce page's sources, de-duplicated with the others.
- **Data:** all figures are from the МЗХ publications (planted area in hectares):
  - **Ябълки:** Пловдив (822 ха, first in the country) and Кюстендил (436 ха, second).
  - **Круши:** Хасково (82 ха, first) and Пловдив (64 ха, second). Кюстендил (47 ха, about sixth: two cells are confidential) is
    removed.
  - **Орехи:** Стара Загора (1 504 ха, first), Пловдив (1 132 ха, second) and Шумен (1 021 ха,
    third). Велико Търново and Ловеч, which the data does not support as leading areas, are
    removed.
  - **Зеле:** Пловдив and Пазарджик. They stay, with notes saying that the South Central region,
    to which both belong, had more than half of the country's open-field head cabbage area in 2022
    (963 of 1 774 ха).
- **Public texts:** the methodology („Области“) and about („Източници и прозрачност“, „Как
  използваме изкуствен интелект“) say which region notes are sourced; the region page description
  no longer promises reasons („защо растат добре“).
- **Checklist:**
  - regions are verified for these four;
  - the other nine are „no official provincial data (МЗХ surveys group them nationally or under
    other vegetables); notes are editorial“;
  - seasons stay open for all.

### Out of scope

- Season months (step 3).
- Province descriptions (#105).
- Changing notes of products without official regional data.

## 4. Domain model

`GrowingRegion` gains `source?: Source`. No invariants change. A region without a source stays
valid (editorial note).

## 5. Behaviour and edge cases

- Removing Ловеч and Велико Търново from walnuts changes the region pages:
  - Ловеч loses its only produce and keeps a page only if it has a farm. It has none, so its page
    disappears from the build and the overview lists it without a link.
  - Велико Търново keeps its page, because it has a farm.
- New region pages appear for Хасково (pears) and Шумен (walnuts).
- Region notes stay short and quote only figures from the cited publication.

## 6. Accessibility requirements

No markup change: notes stay text after the region link, and sources appear in the existing source
list. The existing e2e and axe suites cover produce and region pages.

## 7. SEO requirements

- No title or description changes; region page descriptions follow their counts (spec 029).
- The new region pages are added to the sitemap automatically.

## 8. Acceptance criteria

1. **AC1:** Given a region entry with a source, when mapped and resolved, then
   `growingRegions[i].source` is that source and the produce details list it once among the
   sources.
2. **AC2:** Given a region entry without a source, it stays valid.
3. **AC3:** Given apples, pears, walnuts and cabbage, every growing region has a source on
   `mzh.government.bg`. The regions are exactly:
   - apples: Пловдив, Кюстендил;
   - pears: Хасково, Пловдив;
   - walnuts: Стара Загора, Пловдив, Шумен;
   - cabbage: Пловдив, Пазарджик.
4. **AC4:** Given the checklist, the four products are marked as regions verified, and the other
   nine as having no official provincial data.

5. **AC5:** Given the four sourced products, no note starts with „Също“ (each note reads on its own,
   e.g. on a region page), and the fruit sources cite the exact МЗХ title.
6. **AC6:** Given the methodology and about texts, they say that the region notes of apples, pears,
   walnuts and cabbage follow МЗХ statistics and that the others are editorial.

## 9. Test plan

| AC  | Test type | Test file                                                |
| --- | --------- | -------------------------------------------------------- |
| AC1 | unit      | `tests/unit/composition/ProduceDetailsQuery-033.test.ts` |
| AC2 | unit      | `tests/unit/composition/ProduceDetailsQuery-033.test.ts` |
| AC3 | unit      | `tests/unit/content/region-sources.test.ts`              |
| AC4 | unit      | `tests/unit/content/region-sources.test.ts`              |
| AC5 | unit      | `tests/unit/content/region-sources.test.ts`              |
| AC6 | unit      | `tests/unit/content/region-sources.test.ts`              |

## 10. Third-party documentation consulted

| Source                                                                                                          | Edition                      | URL                                                                                                                      | Topic                                                                                                            |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- |
| МЗХ, Агростатистика: „Структура на основни овощни видове в България през 2023 година (предварителни резултати)“ | бюлетин № 448, декември 2024 | https://www.mzh.government.bg/media/filer_public/2025/01/17/ra448_publicationstructureorchard2023-preliminaryresults.pdf | Tables 1–2: planted areas by province (apples, pears, walnuts); column sums checked against the published totals |
| МЗХ, Агростатистика: „Производство на зеленчуци – реколта 2022“, бюлетин RA 423                                 | 2023-04-11                   | https://www.mzh.government.bg/media/filer_public/2023/04/11/ra423_publicationvegetables2022.pdf                          | Table 3: open-field head cabbage area by NUTS2 region                                                            |
