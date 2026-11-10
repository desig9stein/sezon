# 001. Shared kernel and seasonality domain

- **Status:** Approved
- **Bounded context(s):** shared, seasonality
- **Related:** ADR-0002

## 1. Goal

Provide the core value objects every other feature depends on: Latin slugs generated from
Bulgarian names (official transliteration), calendar months that respect the Europe/Sofia
timezone, season levels, and a season calendar that answers "how available is this produce
in a given month". Without these, URLs, the "current season" and every list are impossible.

## 2. User stories

- As a visitor, I want readable Latin URLs such as `/zelenchutsi/zele`, so that links are
  easy to share and do not turn into `%D0%B7...`.
- As a visitor in Bulgaria, I want "this month" to mean the month in Bulgaria, so that the
  season is correct around midnight on the last day of a month.
- As a content editor, I want invalid months, levels or slugs to fail the build with a clear
  error, so that broken data never reaches the site.

## 3. Scope

### In scope

- `transliterate(text)`: Bulgarian Cyrillic → Latin using the Streamlined System
  (Bulgarian Transliteration Act, 2009).
- `Slug` value object.
- `Month` value object (1–12) with Sofia-time construction, navigation and Latin slugs.
- `SeasonLevel` value object: `peak`, `available`, `storage`.
- `SeasonCalendar` value object: a set of (month, level) pairs.
- Typed domain errors.

### Out of scope

- Bulgarian month names for display (UI strings, spec 003 / `src/i18n/bg.ts`).
- Querying produce by season (spec 004).

## 4. Domain model

| Type             | Kind         | Location                             | Invariants                                                                       |
| ---------------- | ------------ | ------------------------------------ | -------------------------------------------------------------------------------- |
| `DomainError`    | error base   | `src/shared/domain/errors.ts`        | Has a stable `code` string.                                                      |
| `transliterate`  | function     | `src/shared/domain/transliterate.ts` | Pure; non-Cyrillic characters pass through unchanged.                            |
| `Slug`           | value object | `src/shared/domain/Slug.ts`          | Matches `^[a-z0-9]+(-[a-z0-9]+)*$`.                                              |
| `Month`          | value object | `src/contexts/seasonality/domain/`   | Integer 1–12. Instances are shared flyweights (`Month.of(11) === Month.of(11)`). |
| `SeasonLevel`    | value object | `src/contexts/seasonality/domain/`   | One of `peak`, `available`, `storage`; ordered peak > available > storage.       |
| `SeasonCalendar` | value object | `src/contexts/seasonality/domain/`   | At least one entry; no month appears twice.                                      |

## 5. Behaviour and edge cases

### Transliteration (Streamlined System)

| Cyr | Lat | Cyr | Lat | Cyr | Lat | Cyr | Lat |
| --- | --- | --- | --- | --- | --- | --- | --- |
| а   | a   | ж   | zh  | н   | n   | ф   | f   |
| б   | b   | з   | z   | о   | o   | х   | h   |
| в   | v   | и   | i   | п   | p   | ц   | ts  |
| г   | g   | й   | y   | р   | r   | ч   | ch  |
| д   | d   | к   | k   | с   | s   | ш   | sh  |
| е   | e   | л   | l   | т   | t   | щ   | sht |
|     |     | м   | m   | у   | u   | ъ   | a   |
| ь   | y   | ю   | yu  | я   | ya  |     |     |

- The letter sequence `ия` at the **end of a word** is transliterated as `ia`
  (`България` → `Bulgaria`, `София` → `Sofia`).
- Case: an uppercase Cyrillic letter produces a Latin string whose first letter is uppercase
  (`Щ` → `Sht`); if the whole word is uppercase, the output is fully uppercase (`ЩИТ` → `SHTIT`).
- Characters that are not Bulgarian Cyrillic (Latin letters, digits, punctuation, spaces)
  are returned unchanged.

### Slug

- `Slug.fromBulgarian(text)`: transliterate, lowercase, replace every run of characters
  outside `[a-z0-9]` with a single `-`, trim leading/trailing `-`.
  Example: `„Зелен лук“ (пресен)` → `zelen-luk-presen`.
- Throws `InvalidSlugError` when the result is empty (e.g. input `"  —  "`).
- `Slug.parse(value)` accepts an already-formed slug; throws `InvalidSlugError` if it does not
  match the pattern (uppercase, spaces, leading/trailing/double hyphens, Cyrillic).
- `slug.value` returns the string; `slug.equals(other)` compares by value; `toString()` returns the value.

### Month

- `Month.of(n)`: `n` must be an integer 1–12, otherwise `InvalidMonthError`.
- `Month.fromDate(date, timeZone = 'Europe/Sofia')`: the calendar month of `date` in that
  timezone. Example: `2026-10-31T22:30:00Z` → November (00:30 EET on 1 November).
- `Month.fromSlug(slug)`: inverse of `month.slug`; unknown slug → `InvalidMonthError`.
- `month.next()` / `month.previous()` wrap around (December → January, January → December).
- `month.slug`: Latin slugs from the transliterated Bulgarian names:
  `yanuari, fevruari, mart, april, may, yuni, yuli, avgust, septemvri, oktomvri, noemvri, dekemvri`.
- `Month.all()` returns the 12 months in calendar order.
- `month.number` returns 1–12.

### SeasonLevel

- `SeasonLevel.of(value)`: `peak` | `available` | `storage`; anything else → `InvalidSeasonLevelError`.
- `SeasonLevel.PEAK`, `.AVAILABLE`, `.STORAGE` constants; `level.value`.
- `level.isHigherThan(other)` follows the order peak > available > storage.
- `level.isFresh()` is `true` for `peak` and `available`, `false` for `storage`.

### SeasonCalendar

- `SeasonCalendar.from(entries)` where `entries` is `{ month: number; level: string }[]`.
  Empty list → `InvalidSeasonCalendarError`. Duplicate month → `InvalidSeasonCalendarError`.
  Invalid month or level → the corresponding value-object error.
- `calendar.levelIn(month)` returns the `SeasonLevel` or `undefined`.
- `calendar.isFreshIn(month)` is `true` when the level in that month is fresh.
- `calendar.months()` returns the months with an entry, in calendar order.
- `calendar.freshMonths()` returns months with a fresh level, in calendar order.

## 6. Accessibility requirements

Not applicable (no UI). The month slugs feed URLs; the readable Bulgarian labels are UI strings
handled in spec 003.

## 7. SEO requirements

- Slugs are lowercase Latin and hyphenated, which keeps URLs short, readable and shareable.
- Month slugs are the transliterated Bulgarian month names, so URLs match how users search
  (`/sezon/noemvri`).

## 8. Acceptance criteria

1. **AC1:** Given each Bulgarian letter, when transliterated, then the Latin output matches the table.
2. **AC2:** Given a word ending in `ия`, when transliterated, then it ends in `ia`; `ия` inside a word becomes `iya`.
3. **AC3:** Given capitalised or fully uppercase words, when transliterated, then case follows section 5.
4. **AC4:** Given non-Cyrillic characters, when transliterated, then they are unchanged.
5. **AC5:** Given a Bulgarian name with spaces and punctuation, when `Slug.fromBulgarian` runs, then it returns a valid hyphenated lowercase slug.
6. **AC6:** Given input that yields an empty slug, or an invalid string to `Slug.parse`, then `InvalidSlugError` is thrown.
7. **AC7:** Given an integer outside 1–12 or a non-integer, when `Month.of` runs, then `InvalidMonthError` is thrown.
8. **AC8:** Given an instant near a month boundary, when `Month.fromDate` runs with Europe/Sofia, then the Sofia calendar month is returned (both EET and EEST).
9. **AC9:** Given December, `next()` is January; given January, `previous()` is December.
10. **AC10:** Given each month, `Month.fromSlug(month.slug)` returns the same month; unknown slug throws.
11. **AC11:** Given an unknown level string, `SeasonLevel.of` throws `InvalidSeasonLevelError`; ordering and freshness follow section 5.
12. **AC12:** Given an empty or duplicate-month entry list, `SeasonCalendar.from` throws `InvalidSeasonCalendarError`.
13. **AC13:** Given a valid calendar, `levelIn`, `isFreshIn`, `months` and `freshMonths` return values per section 5.
14. **AC14:** All errors extend `DomainError` and expose a stable `code`.

## 9. Test plan

| AC        | Type | Test file                                                       |
| --------- | ---- | --------------------------------------------------------------- |
| AC1–AC4   | unit | `tests/unit/shared/domain/transliterate.test.ts`                |
| AC5–AC6   | unit | `tests/unit/shared/domain/Slug.test.ts`                         |
| AC7–AC10  | unit | `tests/unit/contexts/seasonality/domain/Month.test.ts`          |
| AC11      | unit | `tests/unit/contexts/seasonality/domain/SeasonLevel.test.ts`    |
| AC12–AC13 | unit | `tests/unit/contexts/seasonality/domain/SeasonCalendar.test.ts` |
| AC14      | unit | `tests/unit/shared/domain/errors.test.ts`                       |

## 10. Third-party documentation consulted

| Package / source                 | Version | Source                                                      | Topic                                |
| -------------------------------- | ------- | ----------------------------------------------------------- | ------------------------------------ |
| Bulgarian Transliteration Act    | 2009    | State Gazette No. 19/13.03.2009 (Закон за транслитерацията) | Streamlined System table, `-ия` rule |
| ECMAScript `Intl.DateTimeFormat` | Node 22 | MDN: `Intl.DateTimeFormat` `timeZone` option                | Month in a given timezone            |
| Vitest                           | 5.1.0   | Context7 `/vitest-dev/vitest`                               | `describe`/`it`/`expect`, `it.each`  |
