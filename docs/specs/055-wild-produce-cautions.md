# 055. Wild produce and cautions

- **Status:** Implemented
- **Bounded context(s):** catalog (content model, `Produce`), composition (produce details), UI
  (produce page, produce lists, methodology page), CMS (Keystatic config)
- **Related:** spec 002 (content model), spec 025 (produce page groups), spec 049 (season-only
  produce, the component-test approach), spec 052 and 053 (wild plants left out because the page
  could not show a caution), spec 054 (Keystatic), ADR-0006 (design direction), `DESIGN.md`

## 1. Goal

Owner decision (2026-11-13): add wild-gathered plants (nettle, dandelion, ramsons, elder,
hawthorn, sloe, wild strawberry …). Specs 052 and 053 left them out because a produce page could
not warn about toxic look-alikes, toxic parts, allergies, protected species or plants that must be
cooked. This spec builds that capability: a `wild` flag and sourced `cautions` in the content
model, a „Внимание“ section near the top of the produce page, a „Диворастящ“ label on the page and
in produce lists, a general gathering note, Keystatic fields and a methodology paragraph. It adds
**no produce**: the content is a later spec, and every test here uses test-only fixtures.

## 2. User stories

- As a forager reading a wild plant's page, I want the cautions (look-alikes, toxic parts,
  allergies, protection, preparation) before anything about eating it, so that I do not pick or eat
  the wrong plant.
- As a reader of a list, I want to see which produce is wild-gathered, so that I know it is not
  sold at every stall.
- As a screen-reader user, I want the cautions as a heading in the outline and as plain text, not
  as an interrupting announcement.
- As a content author, I want the schema to reject a wild plant without a sourced caution, so that
  no wild plant is published without one.
- As the editor, I want to set `wild` and edit cautions in Keystatic.

## 3. Scope

### In scope

- **Schema (`produceSchema`, catalog infrastructure):**
  - `wild`: optional boolean, default `false`. It marks a produce gathered from the wild
    („диворастящ“); a plant that is also cultivated may still be marked wild when the page is
    about the wild-gathered plant.
  - `cautions`: optional list, default `[]`, of strict objects
    `{ kind, text, source: { name, url } }`:
    - `kind`: one of `look-alike` (toxic look-alikes), `toxic-part` (a part of the plant is toxic
      or must be cooked), `allergy`, `protected` (protected species or gathering restrictions under
      the Medicinal Plants Act / Закон за лечебните растения or the Biological Diversity Act /
      Закон за биологичното разнообразие), `preparation` (must be blanched or cooked).
    - `text`: single-line Bulgarian text of 20–200 characters after trimming.
    - `source`: the shared `sourceSchema` (`name` and an `https` URL), the same shape as every other
      citation in the content model. The brief named the keys `title` and `url`; `name` is used
      instead so that cautions, traditional uses, nutrition, regions and growing guides share one
      citation shape, one Keystatic `source` field and one `SourceList`.
  - Rule: a produce with `wild: true` must have at least one caution (schema refinement on the
    whole entry, and a `Produce.create` invariant). Cautions are also allowed on a cultivated
    produce (e.g. an allergy).
  - `produceSchemaWith` keeps the refinement (Zod `safeExtend`).
- **Domain (`Produce`):** `wild: boolean` and `cautions: ReadonlyArray<Caution>` (frozen).
  `Caution` and `CAUTION_KINDS`, `CAUTION_TEXT_MIN_LENGTH`, `CAUTION_TEXT_MAX_LENGTH` live in
  `domain/Caution.ts` and are exported from the catalog `index.ts`. `ProduceInput.wild` and
  `ProduceInput.cautions` are optional (default `false` and `[]`), so existing callers are
  unchanged. `Produce.create` throws `InvalidProduceError` for a wild produce without a caution.
- **Mapper (`toProduce`):** maps `wild` and `cautions`.
- **Produce details (`ProduceDetailsQuery`):** caution sources are added to `sources`, after the
  traditional-use sources and deduplicated as before, so they appear in the page's „Източници“ list
  and as `citation` in the `Article` JSON-LD.
- **Produce page `src/pages/[section]/[slug].astro`:**
  - Header meta list: an item „Диворастящ“ (an outlined text tag) after the kind, only when
    `wild`.
  - „На сергията“ (`#stall`): when the produce has cautions, an `h3#cautions` „Внимание“ section
    right after the current-level line and before „Сезон по месеци“, i.e. before every other
    section of the group and before „Яж“. It contains:
    - for wild produce, the gathering note (`ui.produce.wild.gatheringNote`), a UI string, not a
      health claim;
    - a list with one item per caution in content order: a decorative warning icon (inline SVG,
      `aria-hidden`), the kind label in bold followed by a colon, the text, and the source as a
      link in parentheses with the prefix „източник:“ (the same pattern as `TraditionalUses`).
  - Table of contents: an entry „Внимание“ → `#cautions`, right after „На сергията“, only when the
    section is rendered.
- **Produce lists:** `ProduceCard` (plate and index) shows „Диворастящ“ in its meta row and
  `SeasonList` appends „ · Диворастящ“ to the row meta, only for wild produce.
- **UI strings (`src/i18n/bg.ts`):** `ui.produce.headings.cautions`, `ui.produce.wild.label`,
  `ui.produce.wild.gatheringNote`, `ui.produce.cautions.kinds.<kind>`,
  `ui.produce.cautions.sourcePrefix`, and the methodology heading and paragraph.
- **Methodology (`/metodologiya`):** a new `h2` section „Диворастящи растения“ after „Традиционна
  употреба“, saying how wild plants are marked and how cautions are sourced.
- **Keystatic (`keystatic.config.ts`):** `wild` as a checkbox and `cautions` as an editable list
  (kind select, text with the 20–200 length rule, source name and URL).
- **Content guide:** documents `wild` and `cautions`, the rule that wild produce needs at least one
  sourced caution (look-alikes at minimum whenever a source names any), and the Keystatic fields.

### Out of scope

- Adding any wild produce (nettle, dandelion, ramsons, elder, hawthorn, sloe, wild strawberry):
  a later content spec.
- Filtering lists by wild or cultivated, or a wild-plants index page.
- Showing cautions on cards, month pages or the Open Graph image.
- A distinct warning colour: the design system reserves stamp red for „Разгар“ and marker yellow
  for the current month (`DESIGN.md`), so the section uses tested ink-on-surface pairs.

## 4. Domain model

```ts
// catalog/domain/Caution.ts
export const CAUTION_KINDS = [
  'look-alike',
  'toxic-part',
  'allergy',
  'protected',
  'preparation',
] as const;
export type CautionKind = (typeof CAUTION_KINDS)[number];
export const CAUTION_TEXT_MIN_LENGTH = 20;
export const CAUTION_TEXT_MAX_LENGTH = 200;
export interface Caution {
  readonly kind: CautionKind;
  readonly text: string;
  readonly source: Source;
}
```

`Produce` gains `wild: boolean` and `cautions: ReadonlyArray<Caution>`.

Invariants:

- A wild produce has at least one caution (`InvalidProduceError` otherwise).
- Cautions and their sources are frozen.

## 5. Behaviour and edge cases

- Omitted `wild` is `false`; omitted `cautions` is `[]`. Every existing entry stays valid and
  renders unchanged (no label, no section, no table-of-contents entry).
- `wild: true` with `cautions: []` or without `cautions` is rejected by the schema, with the issue
  on the `cautions` path.
- Unknown keys inside a caution or its source are rejected (strict objects). An unknown `kind`, a
  text under 20 or over 200 characters, a multi-line text, or a source without an `https` URL is
  rejected.
- A non-wild produce with cautions shows the „Внимание“ section without the gathering note and
  without the „Диворастящ“ label.
- Several cautions of the same kind are allowed and shown in content order.
- Two cautions citing the same source list it once in „Източници“.
- The section is not a live region (`role="alert"`, `role="status"`, `aria-live` are not used): it
  is static content read in order.
- Heading outline with cautions: `h1` → `h2` „На сергията“ → `h3` „Внимание“ → `h3` „Сезон по
  месеци“ …; no level is skipped.

## 6. Accessibility requirements

- WCAG 2.2 AA: 1.3.1 (info and relationships: a heading and a list), 1.3.2 (meaningful sequence:
  the cautions come before the season and before „Яж“ in source order), 1.4.1 (use of colour: the
  caution is carried by the heading, the kind label and the icon, not by colour), 1.4.3 (contrast:
  `text` on `surface` and `border` on `surface`, both tested pairs), 2.4.6 (headings), 2.4.1 (the
  table-of-contents entry points to an existing id), 4.1.2 (the icon is hidden from assistive
  technology; the kind label is text).
- Exactly one `h1`; the section heading is an `h3` inside the `h2` group; no skipped levels.
- Not a live region; no `hidden` attribute or inline style hides content.
- Without CSS the order reads: heading „Внимание“, gathering note, list of cautions; the icon has
  `width` and `height` attributes of 16, so it never renders oversized.
- Without JavaScript: static HTML.
- Dark mode: only colour tokens (`--color-text`, `--color-surface`, `--color-border`,
  `--color-text-muted`), which have dark values.
- Print: the panel prints without its fill, with the bar and text in `--print-ink`.
- The „Диворастящ“ label is text, at the size of the meta row.
- Zero axe violations on a wild produce page (axe-core in happy-dom, as in spec 049).

## 7. SEO requirements

- Title and description are unchanged (`produceTitle` / `produceSeasonTitle`, `summary`).
- `Article` JSON-LD stays truthful: caution sources appear only in `citation`, next to the other
  sources; no caution text is put into `about`, nutrition or any claim. `FAQPage` is unchanged.
- Canonical, Open Graph and Twitter tags are unchanged.
- The methodology page keeps its title, description and `WebPage` JSON-LD.

## 8. Acceptance criteria

1. **AC1:** Given a produce record without `wild` and `cautions`, when parsed, then `wild` is
   `false` and `cautions` is `[]`.
2. **AC2:** Given a record with `wild: true` and one caution of each kind with an https source,
   when parsed, then it is valid.
3. **AC3:** Given a record with `wild: true` and no cautions (key absent or empty list), when
   parsed, then it is rejected with an issue on `cautions`, both with `produceSchema` and with
   `produceSchemaWith`.
4. **AC4:** Given a caution with an unknown kind, a text shorter than 20 or longer than 200
   characters, a multi-line text, a source without a URL or with an `http` URL, or an unknown key,
   when parsed, then the record is rejected.
5. **AC5:** Given a non-wild record with one caution, when parsed, then it is valid.
6. **AC6:** Given a wild record, when mapped, then the `Produce` has `wild === true` and the
   cautions with their sources, frozen; given an existing record, `wild === false` and no
   cautions.
7. **AC7:** Given `Produce.create` with `wild: true` and no cautions, then it throws
   `InvalidProduceError`.
8. **AC8:** Given a produce with cautions, when `ProduceDetailsQuery.forSlug` runs, then the caution
   sources are among `sources`, each once.
9. **AC9:** Given a produce with cautions, when the table of contents is built, then `cautions`
   follows `stall`; without cautions it is absent.
10. **AC10:** Given a wild produce page, when rendered, then `#stall` contains an `h3#cautions`
    „Внимание“ after the current-level line and before `#season`, and the section comes before
    `#eat`.
11. **AC11:** Given a wild produce page, then the cautions section shows the gathering note and
    one list item per caution with the kind label, the text, a decorative icon hidden from
    assistive technology and the source link; the caution sources are in „Източници“.
12. **AC12:** Given a wild produce page, then it has one `h1`, never skips a heading level, has a
    table of contents whose links all resolve, no live region, no `hidden` attribute or inline
    style, and no axe violations.
13. **AC13:** Given a wild produce page, then the header meta shows „Диворастящ“; given a
    non-wild produce with a caution, the section has no gathering note and the header has no
    label; given a produce without cautions, there is no `#cautions` and no label.
14. **AC14:** Given a wild produce page, then its title and meta description are unchanged, and
    its `Article` JSON-LD cites the caution sources and contains no caution text.
15. **AC15:** Given a `ProduceCard` (plate and index) and a `SeasonList` row for a wild produce,
    then each shows „Диворастящ“ as text; for a non-wild produce, none does.
16. **AC16:** Given the methodology page, then it has a „Диворастящи растения“ `h2` after
    „Традиционна употреба“ with the paragraph on how wild plants and cautions are sourced.
17. **AC17:** Given the Keystatic config, then the produce collection has a `wild` checkbox and a
    `cautions` list whose kind options are `CAUTION_KINDS`; a wild produce with cautions saved
    through Keystatic parses to the same Zod entry; the config/round-trip tests stay green.
18. **AC18:** Given the content guide, then it documents `wild`, `cautions` and the rule that wild
    produce needs at least one sourced caution; and every produce in `src/data` with `wild: true`
    has at least one caution.

## 9. Test plan

| AC   | Test type | Test file                                                          |
| ---- | --------- | ------------------------------------------------------------------ |
| AC1  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-055.test.ts`   |
| AC2  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-055.test.ts`   |
| AC3  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-055.test.ts`   |
| AC4  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-055.test.ts`   |
| AC5  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-055.test.ts`   |
| AC6  | unit      | `tests/unit/contexts/catalog/infrastructure/schemas-055.test.ts`   |
| AC7  | unit      | `tests/unit/contexts/catalog/domain/Produce-055.test.ts`           |
| AC8  | unit      | `tests/unit/composition/ProduceDetailsQuery-055.test.ts`           |
| AC9  | unit      | `tests/unit/components/produce/produceToc.test.ts`                 |
| AC10 | component | `tests/components/ProducePage-055.test.ts`                         |
| AC11 | component | `tests/components/ProducePage-055.test.ts`                         |
| AC12 | component | `tests/components/ProducePage-055.test.ts` (axe-core in happy-dom) |
| AC13 | component | `tests/components/ProducePage-055.test.ts`                         |
| AC14 | component | `tests/components/ProducePage-055.test.ts`                         |
| AC15 | component | `tests/components/ProducePage-055.test.ts`                         |
| AC16 | e2e       | `tests/e2e/about-pages.spec.ts` (methodology headings)             |
| AC17 | unit      | `tests/unit/cms/keystatic-055.test.ts`                             |
| AC18 | unit      | `tests/unit/content/wild-055.test.ts`                              |

e2e cannot reach a wild produce page: the built site has only the produce in `src/data`, none of
them wild, and test produce must not be added there. As in spec 049, the page is rendered through
the Astro Container API with `@composition/index` mocked to in-memory repositories holding
test-only fixtures (`WILD_PRODUCE_INPUT` in `tests/fixtures/records.ts`, whose caution texts say
they are test text and whose sources point to `example.org`), and checked with axe-core in
happy-dom. The methodology section is checked by the existing e2e heading test, updated for the new
`h2`. The existing seed, Keystatic and page tests stay green.

## 10. Third-party documentation consulted

| Package         | Version | Source (URL or Context7 ID)                                          | Topic                                                                    |
| --------------- | ------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| zod             | 4.6.7   | Context7 `/colinhacks/zod/v4.6.7` (`api.mdx`, `.safeExtend()`)       | `.extend()` throws on refined objects; `.safeExtend()` keeps refinements |
| zod             | 4.6.7   | Context7 `/colinhacks/zod/v4.6.7` (`api.mdx`, refinements)           | `superRefine` with `ctx.addIssue({ code: 'custom', path })`              |
| @keystatic/core | 0.6.9   | `node_modules/@keystatic/core/dist/declarations/src/form/fields/*`   | `fields.checkbox`, `fields.array`, `fields.select`, `fields.text` length |
| astro           | 7.4.8   | `node_modules/astro/dist/container/index.d.ts`                       | `experimental_AstroContainer.renderToString` with `params` (as in 049)   |
| axe-core        | 4.14.0  | `node_modules/axe-core/axe.d.ts`                                     | `axe.run(context, options)`, `runOnly` / `rules` options, `violations`   |
| happy-dom       | 21.0.4  | `node_modules/happy-dom/lib/window/Window.d.ts`                      | `Window`, `document.write`, `window.eval` to load the axe source         |
| WAI-ARIA / WCAG | 2.2     | WCAG 2.2 Understanding 1.4.1, 1.3.2; WAI-ARIA 1.2 `alert` / `status` | Not using a live region for static warnings; icon plus text, not colour  |
