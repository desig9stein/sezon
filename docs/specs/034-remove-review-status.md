# 034. Remove the review status; drop an unreliable growing source

- **Status:** Approved
- **Bounded context(s):** catalog (content model and data), UI (produce page, methodology, about)
- **Related:** issue #10, specs 031 (methodology), 032 and 033 (content review), owner decisions of
  2026-11-12

## 1. Goal

The owner made two decisions on 2026-11-12:

- „Няма нужда от такова нещо, махни изобщо опцията за одобрение и проверка“. Every produce
  carries `reviewStatus` (`draft` | `reviewed`). Each produce page says „Данните очакват редакторска
  проверка“, and the methodology has a „Проверка“ section. All of this is removed. The site still
  says which facts are sourced and which are editorial.
- gradinata.bg „не е надежден и има информация за цветя, не за зеленчуци и плодове“. Leek
  (`praz`) cites it as a growing source, so it is removed. Leek keeps only what its remaining
  source, the Bulgarian Wikipedia article „Праз“ (section „Отглеждане“), supports.

## 2. User stories

- As a reader, I do not want a warning that the data waits for a check that will not happen.
- As the owner, I do not want a sign-off step in the content workflow.
- As a reader, I want growing advice only from sources about growing vegetables.

## 3. Scope

### In scope

- **Content model:**
  - Remove `reviewStatus` from the schema, the record, the `Produce` entity and the public
    `ReviewStatus` type.
  - Remove the field from the 13 produce files and the test fixtures.
  - The schema is strict, so a leftover `reviewStatus` fails the build.
- **Produce page:** `SourceList` loses `isDraft` and the draft note. The update date and the
  methodology link stay.
- **Methodology:** the „Проверка“ section is removed (seven sections remain). The season text no
  longer mentions the draft note.
- **About:** the AI section no longer mentions the draft note. „Данните проверява Марин Попов.“
  stays: it is the owner's own statement (spec 031, AC16), not a site feature.
- **Docs:**
  - `docs/content-review/README.md` becomes a record of what is sourced, with no sign-off column.
  - CONTENT-GUIDE drops the `reviewStatus` field and the sign-off rule.
  - CONTENT-GUIDE no longer suggests gradinata.bg.
- **Leek:**
  - Remove the gradinata.bg source.
  - Wikipedia supports sowing in March–April and every tip. It does not give a transplant month,
    so `transplant` becomes empty.

### Out of scope

- The owner sentence on the about page.
- The other 11 produce that cite gradinata.bg in their growing guides. They need new sources
  for each month and tip, so a follow-up spec (035) re-sources or removes them.

## 4. Domain model

`Produce` loses `reviewStatus`. Nothing else changes.

## 5. Behaviour and edge cases

- A produce file that still has `reviewStatus` is rejected by the strict schema.
- Leek without a transplant month: the garden row and the growing section show only sowing
  (existing behaviour for an empty list).

## 6. Accessibility requirements

Removing a sentence and a section does not change the heading order: the methodology keeps `h1` →
`h2`. The existing axe tests cover the produce and methodology pages.

## 7. SEO requirements

No title or description change.

## 8. Acceptance criteria

1. **AC1:** Given a produce record with `reviewStatus`, when parsed, then the schema rejects it;
   given the seed data, then no produce file has `reviewStatus`.
2. **AC2:** Given `SourceList`, then it renders the sources, the update date and the methodology
   link, and no „редакторска проверка“ text.
3. **AC3:** Given the UI strings, then no string contains „редакторска проверка“, and the
   methodology has no review section.
4. **AC4:** Given the built `/metodologiya`, then it has seven `h2` sections and no „Проверка“
   heading.
5. **AC5:** Given leek, then it does not cite `gradinata.bg`, has no transplant month, and its
   only growing source is the Wikipedia article „Праз“.
6. **AC6:** Given `docs/content-review/README.md` and CONTENT-GUIDE, then neither mentions
   `reviewStatus` or a sign-off.

## 9. Test plan

| AC  | Test type | Test file                                                    |
| --- | --------- | ------------------------------------------------------------ |
| AC1 | unit      | `tests/unit/contexts/catalog/infrastructure/schemas.test.ts` |
| AC1 | unit      | `tests/unit/content/seed-data.test.ts`                       |
| AC2 | component | `tests/components/SourceList.test.ts`                        |
| AC3 | unit      | `tests/unit/content/review-status-034.test.ts`               |
| AC4 | e2e       | `tests/e2e/about-pages.spec.ts`                              |
| AC5 | unit      | `tests/unit/content/review-status-034.test.ts`               |
| AC6 | unit      | `tests/unit/content/review-status-034.test.ts`               |

## 10. Third-party documentation consulted

| Source            | Edition                     | URL                                                    | Topic                                                                                          |
| ----------------- | --------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------- |
| Уикипедия, „Праз“ | raw text fetched 2026-11-12 | https://bg.wikipedia.org/wiki/%D0%9F%D1%80%D0%B0%D0%B7 | Section „Отглеждане“: soil, seedling size, sowing March–mid-April, thinning, watering, harvest |
