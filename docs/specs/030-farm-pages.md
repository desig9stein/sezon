# 030. Farm pages

- **Status:** Approved
- **Bounded context(s):** farms (domain), composition (read model), UI
- **Related:** issue #14, epic #31 (Phase 3), specs 019, 021 (real farms), 029 (region pages)

## 1. Goal

The site lists ten real farms, but only as cards on produce and region pages. A reader who finds
a farm cannot open a page about it, and search engines cannot see it as a local business. This
feature adds `/fermi` with every farm and a page per farm with what it sells (and the level of each
produce this month), its province, contacts, address and the sources the facts come from.

## 2. User stories

- As a reader, I want one page per farm with everything it sells and how to reach it.
- As a reader, I want to see which of the farm's produce is in season now.
- As a reader who doubts a claim, I want the farm page to list where its facts come from.

## 3. Scope

### In scope

- **Domain:** `Farm.sources` (the `sources` URLs already in the content), mapped from the record.
- **`FarmPagesQuery`** (composition root):
  - `all(on)` returns every farm with its region and its organic status on `on`, in Bulgarian name
    order.
  - `forSlug(slug, on)` returns the farm, its region, its organic status and the produce it sells,
    in Bulgarian name order.
  - Throws `FarmNotFoundError` for an unknown slug and `BrokenReferenceError` for an unknown produce
    or region.
- **`/fermi`:** `h1` „Местни ферми“, an intro, and every farm as a card whose name links to its page.
- **`/fermi/<slug>`:**
  - `h1` with the farm name, then a meta line: the province (a link to the region page), the
    organic label with the certifier when certified on the build date, and „Спонсорирано“.
  - The description.
  - „Какво предлага“: the produce, each linked and followed by its season stamp for the build month,
    or „Извън сезона“.
  - „Контакти“: website, email, phone, and the address when known.
  - „Източници“: the source URLs.
- **Farm cards** on produce and region pages: the farm name links to the farm page.
- **Navigation:** `/katalog` gets a „Местни ферми“ link, and `/fermi` counts as part of the catalogue
  area.
- **Structured data:**
  - Farm pages: `LocalBusiness` with `name`, `description`, `url`, `telephone`, `email`, `address`
    (text) and `sameAs` (website), plus `BreadcrumbList`.
  - `/fermi`: `CollectionPage`.

### Out of scope

- **Placeholder farms:** issue #14 asks for `noindex` on them, but they no longer exist (spec 021
  removed them; every farm is real).
- „Добави ферма“ (#15).
- A map of farm locations (no coordinates in the data).

## 4. Domain model

- `Farm.sources: ReadonlyArray<string>`: HTTPS URLs of the pages the farm's facts come from. It is
  frozen, and an empty list is allowed in the input (the content schema requires at least one).
- New error `FarmNotFoundError` in `src/shared/domain/errors.ts`.
- Read model `FarmPagesQuery` with `FarmPage { farm, region, certifiedOrganic, produce }`.

## 5. Behaviour and edge cases

- Sponsored farms keep their label; order on `/fermi` is by name only, with no paid ranking.
- A farm without an address shows no address line. A farm without some contact method shows only
  the ones it has.
- Source links show the host and the decoded path, so a Cyrillic percent-encoded URL is readable.
  Long URLs wrap anywhere. A malformed escape (`decodeURI` throws `URIError`) shows the URL as
  stored.
- Produce out of season in the build month shows „Извън сезона“ as text.
- Readable without CSS and without JavaScript.

## 6. Accessibility requirements

- One `h1`; `h2` sections; no skipped levels.
- Season level is a stamp with a word (never colour alone).
- Contact links have accessible names that include the farm name (as on farm cards).
- Source URLs wrap (1.4.10, no horizontal scroll at 320 px).
- Zero axe violations in light and dark mode.

## 7. SEO requirements

- **Titles:** farm page „<Име> – местна ферма“ (≤ 60); `/fermi` „Местни ферми, които продават
  сезонни продукти“.
- **Farm page description:** „<Име> е местна ферма в/във <област>, която предлага <продукти> (names in lower case). …“,
  70–160 characters. The produce list is shortened to fit.
- **JSON-LD:** as in scope.
- **Internal links:** farm ↔ produce, farm → region.

## 8. Acceptance criteria

1. **AC1:** Given a farm record with sources, when mapped, then `farm.sources` equals them, in
   order, frozen.
2. **AC2:** Given farms, when `all(on)`, then every farm is returned in Bulgarian name order with
   its region and organic status on `on`.
3. **AC3:** Given a farm, when `forSlug(slug, on)`, then it returns the farm, region, organic status
   and its produce in name order.
4. **AC4:** Given an unknown slug, when `forSlug`, then it throws `FarmNotFoundError`; given a farm
   selling an unknown produce, it throws `BrokenReferenceError`.
5. **AC5:** Given farm data, when `localBusinessJsonLd` builds it, then it has `@type`
   `LocalBusiness`, `name`, `description`, absolute `url`, and `telephone`, `email`, `address`,
   `sameAs` only when known.
6. **AC6:** Given a farm card, then the farm name is a link to `/fermi/<slug>`.
7. **AC7:** Given every farm name and produce list, then the title is ≤ 60 and the description is
   70–160 characters, and it uses „във“ before в/ф.
8. **AC8:** Given the built site, then `/fermi` lists every farm with a link to its page, and every
   farm page exists.
9. **AC9:** Given the Венец page, then it shows the `h1`, the province link to `/regioni/pleven`, the
   produce links with a stamp each, contacts, address and sources, and `LocalBusiness` and
   `BreadcrumbList` JSON-LD.
10. **AC10:** Given a produce page, then its farm cards link to the farm pages; given `/katalog`,
    then it links to `/fermi`; on `/fermi/*`, the header marks „Каталог“.
11. **AC11:** Given `/fermi` and a farm page in light and dark mode, then axe reports no violations,
    and at 320 px there is no horizontal scroll.

12. **AC12:** Given a farm source that is not an HTTPS URL, when the farm is created, then it throws
    `InvalidFarmError`.
13. **AC13:** Given a source URL with a fragment, then its label keeps the fragment.
14. **AC14:** Given a farm page without CSS, then each produce name is followed by „ – “ before its
    stamp.

## 9. Test plan

| AC   | Test type | Test file                                       |
| ---- | --------- | ----------------------------------------------- |
| AC1  | unit      | `tests/unit/contexts/farms/farmSources.test.ts` |
| AC2  | unit      | `tests/unit/composition/FarmPagesQuery.test.ts` |
| AC3  | unit      | `tests/unit/composition/FarmPagesQuery.test.ts` |
| AC4  | unit      | `tests/unit/composition/FarmPagesQuery.test.ts` |
| AC5  | unit      | `tests/unit/shared/seo/localBusiness.test.ts`   |
| AC6  | component | `tests/components/FarmCard-030.test.ts`         |
| AC7  | unit      | `tests/unit/i18n/farmMeta.test.ts`              |
| AC8  | e2e       | `tests/e2e/farm-pages.spec.ts`                  |
| AC9  | e2e       | `tests/e2e/farm-pages.spec.ts`                  |
| AC10 | e2e       | `tests/e2e/farm-pages.spec.ts`                  |
| AC11 | e2e       | `tests/e2e/farm-pages.spec.ts`                  |

## 10. Third-party documentation consulted

| Package / source | Version | Source (URL or Context7 ID)                                                                | Topic                                                                                                                                                                                                                                                               |
| ---------------- | ------- | ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| schema.org       | main    | `/schemaorg/schemaorg` (Context7), `data/examples.txt`, `sdo-identifier-examples.txt`      | `LocalBusiness` with `name`, `description`, `telephone`; `address` may be plain text; `url` applies to any Thing. schema.org itself is not reachable from the build session; `email` and `sameAs` are to be confirmed in the Rich Results Test before launch (#34). |
| MDN              | –       | https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/decodeURI | Decoding percent-encoded source URLs for display                                                                                                                                                                                                                    |
