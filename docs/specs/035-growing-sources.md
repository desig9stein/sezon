# 035. Growing guides without gradinata.bg

- **Status:** Approved
- **Bounded context(s):** catalog (content data), tooling (content tests)
- **Related:** issue #10, spec 018 (growing guide), spec 034 (leek), owner decision of 2026-11-12
  (gradinata.bg „не е надежден и има информация за цветя, не за зеленчуци и плодове“)

## 1. Goal

Ten growing guides cite gradinata.bg: дюли, копър, круши, магданоз, орехи, тиква, целина, цвекло,
ябълки and зеле. The owner judged the site unreliable, so this step removes it as a source.

- Each month, planting note and tip stays only if another cited source states it. The sources
  are Български фермер, Agrozona, the Bulgarian Wikipedia, or a Bulgarian institute or university.
- A tip that a source states only in part is reworded to what the source says.
- A tip or month with no other source is removed.
- A growing guide needs a month or a planting note and at least three tips (spec 018). If too little
  is left, the whole growing guide is removed.

## 2. User stories

- As a gardener, I want planting months and tips only from sources about growing vegetables and
  fruit.
- As the owner, I want a test to stop anyone from citing gradinata.bg again.

## 3. Scope

### In scope

- **Data:** the `growing` block of the ten produce. Each kept item has a verbatim quote from its
  source, recorded during the check (section 10). Each changed produce gets `updatedAt: 2026-11-12`.
- **Test:** no source anywhere in the produce data (nutrition, regions, uses, growing, organic) is
  on gradinata.bg.
- **Docs:** the checklist rows no longer mention gradinata.bg.

### Out of scope

- New growing guides for produce without one.
- Re-checking guides that never cited gradinata.bg (моркови, спанак, праз).

## 4. Domain model

No change.

## 5. Behaviour and edge cases

- A removed month disappears from the garden row and the month pages' „В градината“ list
  (existing behaviour).
- A removed growing guide removes the produce's growing section (existing behaviour for produce
  without `growing`).

## 6. Accessibility requirements

No markup change. The existing e2e and axe tests cover produce and month pages.

## 7. SEO requirements

No title or description change.

## 8. Acceptance criteria

1. **AC1:** Given every produce file, then no URL in it is on `gradinata.bg`.
2. **AC2:** Given the ten produce, then every growing guide that remains still meets spec 018: a
   month or a planting note, three to five tips of at most 140 characters, and at least one source.
3. **AC3:** Given the ten produce, then each one that changed has `updatedAt` 2026-11-12.
4. **AC4:** Given the checklist, then no row mentions gradinata.bg.

## 9. Test plan

| AC  | Test type | Test file                                        |
| --- | --------- | ------------------------------------------------ |
| AC1 | unit      | `tests/unit/content/growing-sources-035.test.ts` |
| AC2 | unit      | existing schema and seed-data tests (spec 018)   |
| AC3 | unit      | `tests/unit/content/growing-sources-035.test.ts` |
| AC4 | unit      | `tests/unit/content/growing-sources-035.test.ts` |

## 10. Third-party documentation consulted

Every page was fetched on 2026-11-12. Each item below was compared with the page text. A tip is
kept only where the page states it, and the quotes were checked during the review.

| Produce  | Changes                                                                                                                                                                                                                                                                                              | New sources (Български фермер unless noted)                                                                      |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| дюли     | Altitude: „до 600 м“ (not „над 500–600 м трудно узряват“); soils: dry and limy; watering: July–August (not August–September); varieties: Асеница is self-pollinating, Хемус needs a pollinator (Пловдивска and Тримонциум unsupported); harvest at half or full yellow, keeps until January–February | 7917753, 1563329, 11089809                                                                                       |
| копър    | September sowing removed (sources say only „есента“); successive sowings every 3–4 weeks (not 7–8 days); cut at 10–15 cm, 20–30 days after emergence; watering wording                                                                                                                               | Agrozona: „Разсадите…“, „Тайните на ароматния копър“, „Какво може да посеем…“; 6232301, 21103497                 |
| круши    | Planting note: tender varieties not in autumn; soil: no „1 м“ or salinity; pollination: a second variety for a richer crop                                                                                                                                                                           | Agrozona „4 каприза управляват крушата“; 22875890, 5757684, 8928600                                              |
| магданоз | Shade: tolerated but less aroma (the old tip said sun only); predecessors: early tomatoes, cucumbers or courgettes manured before (the old „no fresh manure“ contradicted the source); rows 20 cm; cut at 12–15 cm                                                                                   | 1116457, 10167505                                                                                                |
| орехи    | Grafted trees bear after 3–6 years, seedlings after 12–15; height 15–20 m without „north part of the yard“; one title corrected to „Ореховото дърво - гигантът в градината“                                                                                                                          | –                                                                                                                |
| тиква    | Planting note: seeds sprout above 15 °C (the 12–14 °C soil figure is unsupported)                                                                                                                                                                                                                    | –                                                                                                                |
| целина   | Transplant at 6–7 leaves (not 4–5); no 3–4-year rotation; manure in autumn with deep ploughing; harvest late in autumn                                                                                                                                                                               | 9230195, 9670112                                                                                                 |
| цвекло   | Unchanged apart from the removed source                                                                                                                                                                                                                                                              | –                                                                                                                |
| ябълки   | Soil without „поне 1 м“; planting: only frozen soil is supported („суха“ and „подгизнала“ removed)                                                                                                                                                                                                   | 7672729, 9358613, 8259961                                                                                        |
| зеле     | Planting note: late cabbage sown in early June (not mid-June); watering every 7–10 days; spacing 50–60 × 35–40 cm early and 70 × 45–50 cm late (the old 70 × 45 was given for middle-early); late harvest October–November                                                                           | Agrozona „Отглеждане на зеле - 12 важни правила за богата реколта“; 9517929, 6193091, 7467908, 11980623, 7749654 |
