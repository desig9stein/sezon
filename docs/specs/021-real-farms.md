# 021. Real farms instead of placeholders

- **Status:** Approved
- **Bounded context(s):** farms (`Farm`, content model), UI (farm cards), content
- **Related:** issue #16, specs 002, 005, 019

## 1. Goal

Replace the three invented example farms with real Bulgarian growers that sell the seed produce,
each fact backed by the farm's own published pages, and remove the placeholder concept so that
no invented data can appear on the site again (owner decision: „не искам никаква фалшива
информация никъде“).

## 2. User stories

- As a shopper, I want the farms on a produce page to be real growers I can contact.
- As a careful reader, I want to know that what a farm says about itself (e.g. organic) is its
  own statement, not a certificate the site has checked.
- As the owner, I want each farm entry to list where its facts come from, so I can review it.

## 3. Scope

### In scope

- **Content model:** remove `isPlaceholder` from the farm schema, `Farm` and the UI; add a
  required `sources` list (https URLs, at least one) with the pages the entry's facts come from.
  `sources` is review data and is not rendered.
- **UI:** remove the „Примерни данни“ label and string.
- **Data:** delete `zelena-dolina`, `slanchev-sad` and `orehova-gora`; add 10 real farms
  (research of 2026-11-11): Био-ферма Софина, Био ферма „Версол“, Био градина „Близнаци“, Био
  Гардън Терзиев, Яблена Натура, Венец, Био ферма „Поляна“, Ферма за аспержи и интересни
  зеленчуци, Био градини Алваново, Газянов.
  - `produce` lists only seed produce the farm's own pages say it grows or sells.
  - The description is factual and third person. An organic statement without a published
    certifier, number and expiry is written as the farm's own statement („По данни на фермата …“);
    no farm gets an `organic` block (spec 019) without a verified certificate.
  - Contacts are the farm's published website, email and first phone. No private flat numbers
    in addresses.
- **Docs:** CONTENT-GUIDE farm section.

### Out of scope

- Checking the official register of organic operators (possible follow-up).
- Farm pages (`/fermi/...`, Phase 3) and farm search.

## 4. Domain model

- `Farm`: loses `isPlaceholder`. No other change.
- Farm record: `sources: string[]` (https URL, min 1, unique), not mapped to the domain.

## 5. Behaviour and edge cases

- A produce with no real farm shows the existing empty message („Все още няма добавени ферми за
  този продукт.“).
- A farm whose sales are paused says so in its description, with the month of the check.
- Sponsored and organic labels keep working.

## 6. Accessibility requirements

- No markup change beyond removing one label; farm cards keep their heading levels (spec 019).
- Zero axe violations on produce pages in light and dark mode.

## 7. SEO requirements

- No change to titles or descriptions. Farm websites are plain external links (`rel="noopener"`),
  not `sponsored`, unless the farm is sponsored.

## 8. Acceptance criteria

1. **AC1:** The farm schema rejects an entry with `isPlaceholder`, without `sources`, with empty
   `sources`, or with a non-https source; it accepts a valid entry.
2. **AC2:** A farm card renders no „Примерни данни“ label, and `ui.produce.farms` has no
   `placeholder` string.
3. **AC3:** The seed has at least 10 farms; none uses an `example.com` address or a `+359000`
   phone; every farm sells at least one seed produce and references an existing region.
4. **AC4:** The built carrot page lists „Био-ферма Софина“ and passes axe (e2e).

## 9. Test plan

| AC  | Type      | Test file                                                     |
| --- | --------- | ------------------------------------------------------------- |
| AC1 | unit      | `tests/unit/contexts/farms/infrastructure/farmSchema.test.ts` |
| AC2 | component | `tests/components/FarmList-021.test.ts`                       |
| AC3 | unit      | `tests/unit/content/seed-farms.test.ts`                       |
| AC4 | e2e       | `tests/e2e/real-farms.spec.ts`                                |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                        | Topic      |
| ---------------- | ------- | ------------------------------------------------------------- | ---------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (content collections, `astro/zod`) | Schema     |
| Farm websites    | current | Cited per farm in `src/data/farms/*.yaml` (`sources`)         | Farm facts |
