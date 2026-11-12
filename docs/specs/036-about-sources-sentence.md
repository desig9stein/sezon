# 036. About page: sources instead of a reviewer

- **Status:** Approved
- **Bounded context(s):** UI (about page)
- **Related:** spec 031 (AC16), spec 034, owner decision of 2026-11-12 („No, don't keep it, just
  mention that the data sources are under each data“)

## 1. Goal

The about page says „Данните проверява Марин Попов.“ Spec 034 removed the review step, so the
sentence promises a check that the site no longer describes. The owner asked to remove it and say
instead that the sources are shown under the data.

## 2. User stories

- As a reader, I want to know where to find the source of a fact.

## 3. Scope

### In scope

- „Кой стои зад сайта“: replace the reviewer sentence with „Източниците са посочени на страниците на продуктите и фермите – под данните или в раздел „Източници“ в края на страницата.“ It follows the owner's links.
  It names only produce and farm pages, because other pages (months, regions, nutrients) show
  editorial levels or link back to produce pages, and it does not claim that every statement has a
  source (spec 031, AC15).
- Remove the `about.reviewer` string.
- The methodology „Отглеждане“ text says that growing sources are in the produce page's
  „Източници“ section, not under the guide (QA finding).

### Out of scope

- Other about-page sections.

## 4. Domain model

No change.

## 5. Behaviour and edge cases

None: one paragraph's text changes.

## 6. Accessibility requirements

No markup change beyond the text. The existing axe tests cover `/za-nas`.

## 7. SEO requirements

No title or description change.

## 8. Acceptance criteria

1. **AC1:** Given `/za-nas`, then „Кой стои зад сайта“ ends with the sentence that sources are on
   the produce and farm pages, it does not say „на всяка страница“, and no text says that Марин
   Попов checks the data.
2. **AC2:** Given the UI strings, then there is no `about.reviewer` string.

## 9. Test plan

| AC  | Test type | Test file                                      |
| --- | --------- | ---------------------------------------------- |
| AC1 | e2e       | `tests/e2e/about-pages.spec.ts`                |
| AC2 | unit      | `tests/unit/content/review-status-034.test.ts` |

## 10. Third-party documentation consulted

None: no third-party API is used.
