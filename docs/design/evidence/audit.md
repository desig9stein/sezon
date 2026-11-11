# Technical audit of the current site (redesign evidence)

- **Issue:** #79 (step 1 of redesign epic #78)
- **Date:** 2026-11-11
- **Method:** impeccable `audit` flow (`.claude/skills/impeccable/reference/audit.md`), run against
  the built site (`pnpm build` output served at `http://127.0.0.1:4399`), commit `1086f95`.
- **Pages audited (one per template):** `/` (home), `/sezon/noemvri` (month), `/plodove/yabalki`
  (produce), `/plodove` (section index), `/grupi/krastotsvetni` (group).
- **Quality bar:** `AGENTS.md` sections 8–9, ADR-0005 (Performance ≥ 95, Accessibility, Best
  Practices and SEO = 100, CLS = 0), WCAG 2.2 AA, readable without CSS and without JavaScript.
- **Scope:** findings only. No fixes were made.
- **Note on the flow:** the impeccable flow asks the user to confirm direction where needed. This
  audit ran as a delegated task with no way to ask, so it follows the brief (PRODUCT.md, ADR-0004,
  ADR-0005) without interview questions. An audit needs no direction decisions.

## Tools and commands

| Check                                      | Tool                                                                                                                                                |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Anti-patterns                              | `.claude/skills/impeccable/scripts/impeccable detect --json <url>` (5 URLs) and `... detect --json src/components src/layouts src/styles src/pages` |
| axe (WCAG 2.0/2.1/2.2 A+AA, best practice) | Playwright Chromium + `@axe-core/playwright`, light and dark scheme, at 390 × 844 and 1280 × 900                                                    |
| Contrast                                   | axe `color-contrast` (both schemes), plus palette pairs in `src/design/tokens.ts`                                                                   |
| Target size                                | Bounding boxes of every focusable element at 390 px; SC 2.5.8 spacing test (24 px circle)                                                           |
| Focus visibility                           | 40 Tab presses per page; computed `outline` on `document.activeElement`                                                                             |
| Heading outline                            | `h1–h6` order, level skips and computed font size at 390 and 1280 px                                                                                |
| Reflow                                     | 320 and 360 px viewports: document `scrollWidth`, elements past the right edge, inner scrollers                                                     |
| Text spacing (SC 1.4.12)                   | Injected `line-height:1.5; letter-spacing:.12em; word-spacing:.16em; p{margin-bottom:2em}`, then overflow/clipping check                            |
| Reduced motion                             | Computed `animation-name` / `transition-*` on every element; review of `src/styles/base.css`                                                        |
| No-CSS reading order                       | All stylesheets disabled, inline `style` removed: element order, media sizes, `[hidden]`                                                            |
| Lighthouse                                 | Lighthouse 13.6.0 CLI, default mobile config (simulated slow 4G, 4× CPU), headless Chromium 1243                                                    |
| Bytes                                      | Playwright response bodies per resource type; Lighthouse `resource-summary`                                                                         |
| Hard-coded values                          | `grep` for colours, `px/rem/vw` literals, `font-weight`, media queries outside `src/design/tokens.ts`                                               |

## Score table per template

Lighthouse, mobile, single run each. Bytes are Lighthouse transfer sizes.

| Template | Page                   | Perf | A11y | BP  | SEO | FCP    | LCP        | LCP element              | TBT        | CLS | Total    | Fonts        | Images      | axe (light/dark, 390/1280) |
| -------- | ---------------------- | ---- | ---- | --- | --- | ------ | ---------- | ------------------------ | ---------- | --- | -------- | ------------ | ----------- | -------------------------- |
| Home     | `/`                    | 100  | 100  | 100 | 100 | 0.62 s | 0.62 s     | `p.hero__intro` (text)   | 0 ms       | 0   | 163.0 KB | 6 / 110.0 KB | 3 / 45.1 KB | 0 / 0 / 0 / 0              |
| Month    | `/sezon/noemvri`       | 99   | 100  | 100 | 100 | 0.62 s | **1.81 s** | `img` zele (plate)       | **104 ms** | 0   | 162.9 KB | 6 / 110.0 KB | 3 / 45.1 KB | 0 / 0 / 0 / 0              |
| Produce  | `/plodove/yabalki`     | 100  | 100  | 100 | 100 | 0.61 s | 1.65 s     | `img` yabalki (photo)    | 0 ms       | 0   | 129.3 KB | 6 / 110.0 KB | 1 / 8.5 KB  | 0 / 0 / 0 / 0              |
| Index    | `/plodove`             | 100  | 100  | 100 | 100 | 0.61 s | 0.61 s     | `p.season-groups__intro` | 17 ms      | 0   | 116.1 KB | 6 / 110.0 KB | 0           | 0 / 0 / 0 / 0              |
| Group    | `/grupi/krastotsvetni` | 100  | 100  | 100 | 100 | 0.62 s | **1.80 s** | `img` zele (plate)       | 4 ms       | 0   | 137.1 KB | 6 / 110.0 KB | 1 / 20.5 KB | 0 / 0 / 0 / 0              |

Other per-template measurements:

| Template | `<h1>` | Heading skips | Focus stops checked / without visible focus | Reflow 320 px                                                                          | Text spacing | JS           | Inline CSS |
| -------- | ------ | ------------- | ------------------------------------------- | -------------------------------------------------------------------------------------- | ------------ | ------------ | ---------- |
| Home     | 1      | 0             | 40 / 0                                      | no page scroll                                                                         | no clipping  | JSON-LD only | 13.4 KB    |
| Month    | 1      | 0             | 39 / 0                                      | no page scroll                                                                         | no clipping  | JSON-LD only | 11.9 KB    |
| Produce  | 1      | 0             | 40 / 0                                      | no page scroll; nutrition table scrolls in its labelled, focusable region (319/288 px) | no clipping  | JSON-LD only | 15.6 KB    |
| Index    | 1      | 0             | 39 / 0                                      | no page scroll                                                                         | no clipping  | JSON-LD only | 11.4 KB    |
| Group    | 1      | 0             | 39 / 0                                      | no page scroll                                                                         | no clipping  | JSON-LD only | 11.8 KB    |

## Audit Health Score

| #         | Dimension                | Score     | Key finding                                                                                                  |
| --------- | ------------------------ | --------- | ------------------------------------------------------------------------------------------------------------ |
| 1         | Accessibility            | 4         | Zero axe violations in 20 runs; focus always visible; reflow and text spacing pass. Only polish-level gaps.  |
| 2         | Performance              | 3         | Fonts are 67–95 % of every page's bytes; photo LCP at 1.65–1.81 s leaves little room before the score drops. |
| 3         | Theming                  | 3         | Every colour is a token and dark mode passes axe; sizes, breakpoints and weights are still literals.         |
| 4         | Responsive Design        | 3         | No horizontal scroll at 320 px; the mobile header is two rows (137 px) and pushes the season answer down.    |
| 5         | Implementation Integrity | 3         | Detector clean (3 advisory stragglers); flat heading scale and a context-free "Също в сезон" label.          |
| **Total** |                          | **17/20** | **Good (address weak dimensions)**                                                                           |

## Implementation Integrity Verdict

**Pass.** The implementation expresses a coherent, product-specific system: a typed token module
(`src/design/tokens.ts`) inlined as custom properties, light/dark palettes whose contrast pairs are
unit-tested, the botanical-atlas vocabulary of ADR-0004 (plates, "Табло XI от XII", Latin names in
`lang="la"` italics, wordmark), and a season level that is always text + mark + colour. The
impeccable detector found **no** anti-patterns on four of five pages and in the source scan; the
produce page has three advisory "straggler" findings only. The weaknesses are a type scale that
does not separate heading levels, layout literals outside the token module, and a few labels that
lose their meaning out of context. None of them is a WCAG failure.

Detector output (complete):

```text
/, /sezon/noemvri, /plodove, /grupi/krastotsvetni           []
src/components src/layouts src/styles src/pages              []
/plodove/yabalki  straggler (advisory) dl.preparation > dd:nth-of-type(1)         "белете." alone on the last of 2 lines (10% of the measure)
                  straggler (advisory) section.growing > ul > li:nth-of-type(3)   "самоопрашват." alone on the last of 2 lines (20% of the measure)
                  straggler (advisory) section.growing > ul > li:nth-of-type(5)   "°C." alone on the last of 2 lines (3% of the measure)
```

## Executive Summary

- Audit Health Score: **17/20 (Good)**.
- Issues found: **P0: 0, P1: 0, P2: 6, P3: 6**.
- The current site meets its hard quality bar on every audited template: Lighthouse A11y, BP and
  SEO 100, Performance 99–100, CLS 0, zero axe violations in light and dark at two widths, no
  horizontal scroll at 320 px, visible focus everywhere, readable without CSS, no JavaScript.
- Top issues for the redesign:
  1. Heading levels are visually indistinguishable: `h1` and `h2` render at the same size on the
     month, index and group pages (P2).
  2. The mobile header takes 137 px (16 % of an 844 px viewport) in two rows of 8 links; on the
     home page the first in-season photo starts at y = 700 px (P2).
  3. Web fonts are 110 KB of 116–163 KB per page; the photo LCP (1.65–1.81 s) is already the
     only metric below a perfect score (P2).
  4. Layout literals (`2.75rem` ×4 while `--target-min` exists, 7 unshared breakpoints,
     `16.5vw`, raw font weights) live outside the token module (P2).
  5. The "Също в сезон" ("Also in season") heading appears on `/plodove` with no peak group
     above it (P2).
- Next steps: carry these as constraints into `/impeccable shape` for the redesign, rather than
  fixing them on the current look (see "Constraints and risks").

## Detailed Findings by Severity

### P2 (minor, fix in the redesign)

**[P2] Flat heading scale: `h1` = `h2`, and `h3` almost equal**

- **Location:** `src/styles/base.css:57-67` (`h1` and `h2` both use `--font-size-2xl`, `h3` uses
  `--font-size-xl`); `src/design/tokens.ts:70-71` (`xl` = `clamp(1.5rem, 1.25rem + 1vw, 2.1rem)`,
  `2xl` = `clamp(1.6rem, 1.3rem + 1.4vw, 2.2rem)`).
- **Category:** Implementation Integrity (visual hierarchy)
- **Evidence:** computed sizes:

  ```text
  390 px:  /sezon/noemvri  h1 26.26px | h2 26.26px | h3 24px
           /plodove         h1 26.26px | h2 26.26px | h3 20px
  1280 px: /sezon/noemvri  H1 35.2px  | H2 35.2px  | H3 32.8px
           /plodove        H1 35.2px  | H2 35.2px  | H3 25.28px
           /grupi/...      H1 35.2px  | H2 35.2px  | H3 32.8px
  ```

  Only the home hero (`.hero__month` 208 px) and the produce `h1` (`--font-size-3xl`, 104 px)
  escape the base scale. On the produce page all 12 section `h2`s and the FAQ `h3` share one
  visual weight, so the page reads as an even list of equal blocks.

- **Impact:** sighted users cannot tell the page title from a section title on three of five
  templates; scanning on a phone is slower. The DOM outline is correct (one `h1`, no skips), so
  screen-reader users are not affected.
- **Recommendation:** a type scale with a clear step between levels (ratio ≥ 1.25) and distinct
  page-title treatment on every template.
- **Suggested command:** `/impeccable typeset`

**[P2] Mobile header consumes the first screen**

- **Location:** `src/components/layout/SiteHeader.astro:99-112`
- **Category:** Responsive
- **Evidence (390 × 844):** header height 137 px; 8 nav links wrap into two rows
  (`95x36 147x36 57x36 71x36 74x36 33x36 63x36 55x36`). On `/` the first `h2` starts at y = 630
  and the first in-season photo at y = 700; on `/plodove/yabalki` the "Сезон по месеци" grid
  starts at y = 878 (below the fold).
- **Impact:** PRODUCT.md's primary user is a shopper at a stall with one hand free. The answer
  "what is good now" (principle 1) is pushed below the fold by navigation chrome and the hero.
- **Recommendation:** shorter mobile navigation (fewer top-level items, or a no-JS disclosure
  that keeps every link in source order) and a hero that shows the first in-season item in the
  first viewport.
- **Suggested command:** `/impeccable adapt`, then `/impeccable layout`

**[P2] Font bytes dominate page weight; photo LCP close to the edge**

- **Location:** `src/layouts/BaseLayout.astro:50-51` (`<Font … preload>`), font files in
  `src/assets/fonts` (spec 015).
- **Category:** Performance
- **Evidence:**

  ```text
  fonts (every page): e07ea938 20.6 KB  3fbccbf8 16.0 KB  (Piazzolla upright, Latin + Cyrillic, preloaded)
                      9fc6e34b 19.4 KB  7ae36039 14.9 KB  (Sofia Sans, Latin + Cyrillic, preloaded)
                      4f23d191 21.0 KB  cf398ce9 16.2 KB  (Piazzolla italic, font-display: optional)
  resource-summary /plodove:  total 8 / 116102 B, font 6 / 109992 B   (95 %)
  resource-summary /:          total 11 / 163033 B, font 6 / 109992 B (67 %)
  LCP /sezon/noemvri 1805 ms (score 0.98), /grupi/krastotsvetni 1802 ms (0.98), /plodove/yabalki 1654 ms (0.99)
  ```

  Four fonts (~71 KB) are preloaded and compete with the LCP photo, as ADR-0005 already notes.
  The italic is only used for Latin names but costs 37 KB on every page.

- **Impact:** low today (Performance 99–100), but every added face, weight or image eats directly
  into the LCP budget on slow mobile data.
- **Recommendation:** in the redesign, budget fonts explicitly (count of faces × subsets), and
  consider whether the italic face is needed or can be synthesised/subset to Latin only.
- **Suggested command:** `/impeccable optimize`

**[P2] Main-thread spike on the month page**

- **Location:** `/sezon/noemvri` (largest DOM of the list pages: 12 cards + calendar)
- **Category:** Performance
- **Evidence:** `TBT 104 ms (score 0.98)`, `max-potential-fid 150 ms (0.82)`, long tasks
  `Unattributable: 154 ms, 51 ms`, bootup `Unattributable 349 ms`. No script runs on the page
  (only two JSON-LD blocks), so the cost is style/layout/paint. Single run; may be runner noise,
  but it is the only page that lost a Performance point.
- **Impact:** small now; a heavier card design (shadows, filters, more images) on this template
  would grow it.
- **Recommendation:** re-measure over 3+ runs; keep the month template's card count and effects
  lean.
- **Suggested command:** `/impeccable optimize`

**[P2] Layout values hard-coded outside the token module**

- **Location / evidence:**
  - `2.75rem` written as a literal although `--target-min: 2.75rem` exists
    (`src/design/tokens.ts:87`): `src/components/produce/SeasonCalendarList.astro:56`,
    `src/components/season/YearRibbon.astro:49`, `src/components/search/SiteSearch.astro:100`,
    `src/components/search/SiteSearch.astro:110`.
  - Header links use `min-height: 2.25rem` (36 px), below the project's own `--target-min`:
    `src/components/layout/SiteHeader.astro:110`.
  - Seven breakpoint literals with five different values and no token: `40rem`
    (`YearRibbon.astro:65`, `SeasonCalendarList.astro:108`, `ProduceGroupList.astro:61`), `44rem`
    and `66rem` (`ProduceCard.astro:28`), `48rem` (`ProducePhoto.astro:19`,
    `[section]/[slug].astro:208`), `60rem` (`SiteHeader.astro:99`, `SeasonCalendarList.astro:102`).
  - `font-size: min(var(--font-size-display), 16.5vw)` in `src/pages/index.astro:81`.
  - Raw `font-weight` 500/600/700 in 12 places (e.g. `SiteHeader.astro:69,87`,
    `SeasonCalendarList.astro:83,92`, `ScrollTable.astro:31`); no weight tokens.
  - Card/grid minimums `13rem`, `18rem`, `20rem`, `36rem`, `40rem`, `42ch` per component.
  - Colours: **none** hard-coded (only `--print-ink: #000` / `--print-paper: #fff` in the print
    block, `src/styles/base.css:127-128`). 266 `var(--…)` uses across components.
- **Category:** Theming
- **Impact:** the redesign cannot change the grid or density from one place; `sizes` attributes
  and media queries can drift apart (they already use 44/48/66 rem independently).
- **Recommendation:** add breakpoint, weight and layout tokens, and generate `sizes` strings from
  the same breakpoint constants.
- **Suggested command:** `/impeccable layout` (with the redesign's `/impeccable shape`)

**[P2] "Също в сезон" heading without its context**

- **Location:** `src/i18n/bg.ts:165` (`available: 'Също в сезон'`), used by
  `src/components/produce/SeasonGroupsList.astro:30` for every list.
- **Category:** Implementation Integrity (content structure)
- **Evidence:** `/plodove` headings: `h1 Плодове | h2 Също в сезон | h3 Дюли | h3 Ябълки | h2 От
хранилище | h3 Круши`. There is no peak group on the page, so "also" refers to nothing.
- **Impact:** confusing label on section, group and nutrient pages whenever no item is at peak.
- **Recommendation:** a label that stands alone ("В сезон"), or switch the label when the peak
  group is empty.
- **Suggested command:** `/impeccable clarify`

### P3 (polish)

**[P3] Global reduced-motion kill switch** (`src/styles/base.css:114-122`). Sets every
animation and transition to `0.01ms !important`. No element currently animates (computed
`animation-name`/`transition` empty on all five pages), so there is no user impact today, but the
audit reference flags this pattern: any motion the redesign adds would lose its state feedback
instead of getting a reduced alternative. Command: `/impeccable animate` (when motion is added).

**[P3] Oversized plate image candidate in Lighthouse's mobile emulation.**
`image-delivery-insight` on `/` and `/grupi/krastotsvetni`: "This image file is larger than it
needs to be (640x480) for its displayed dimensions (348x261)", est. savings 14 KB
(`/_astro/zele.BopBvP1h_KVphM.avif`, 20.3 KB). At DPR 1 the browser picks the 326 px candidate
(13.5 KB), so the issue is the AVIF `srcset` steps at DPR 1.75. `ProduceCard.astro:28`. Command:
`/impeccable optimize`.

**[P3] Header nav targets below the project's 44 px standard.** All header links are 36 px tall
at ≤ 60 rem (above, they are 44 px). They pass WCAG 2.5.8 (≥ 24 px) but not the
`--target-min` the project set for itself; "Ядки" is 33 × 36 px. `SiteHeader.astro:110`.
Command: `/impeccable adapt`.

**[P3] Straggler words on the produce page** (detector, advisory): `dl.preparation dd`,
`section.growing li` (3 and 5). `text-wrap: pretty` is set only on `p` (`base.css:69-71`), not
on `li`/`dd`. Command: `/impeccable typeset`.

**[P3] Italic face uses `font-display: optional`.** Latin names may render in the Times New
Roman fallback on a cold load; the month page measured 3364 px tall in one run and 3342 px in
another (the only difference was font timing). CLS stays 0 because the swap never happens after
first paint, but the botanical-atlas Latin names (ADR-0004) are not guaranteed to show in
Piazzolla. Command: `/impeccable typeset`.

**[P3] UI voice still uses „Вие“ forms.** `src/i18n/bg.ts:100,154-156,242` ("Вижте…"), while
PRODUCT.md sets the voice to informal „ти“. Known migration. Command: `/impeccable clarify`.

### Checked and passing (no finding)

- **axe:** 0 violations, 0 incomplete in all 20 runs (5 pages × light/dark × 390/1280).
- **Contrast:** axe `color-contrast` passes in both schemes; palette pairs are covered by unit
  tests (`src/design/contrast.ts`).
- **Target size:** the only sub-24 px targets are inline text links (exempt: "Сезонен календар",
  month links in the growing guide, links inside table cells, photo credits). The script flagged
  "Витамин C" and "Калий" (20 px tall) as spacing failures, but the overlap was with their own
  focusable `section.table-scroll` container; they are links inside table cells (inline
  exception). **False positive**, not reported.
- **Focus:** every Tab stop shows `solid 3px rgb(31, 95, 168)` (light); skip link is the first
  stop; no invisible focus in 197 stops checked.
- **Headings:** exactly one `h1` per page, no skipped levels.
- **Reflow:** no page-level horizontal scroll at 320 px or 360 px; the nutrition table scrolls
  inside a labelled, focusable region (`ScrollTable.astro:13`).
- **Text spacing (SC 1.4.12):** no horizontal scroll and no clipped containers.
- **No CSS:** source order is header → nav → breadcrumbs → `h1` → intro → content → footer on
  every template; no `[hidden]` content; the only SVGs render at 14 × 14 px; photos render at
  their `width`/`height` attributes (640 × 480, 800 × 600), not oversized.
- **No JS:** the only `<script>` elements are `application/ld+json`.
- **Dark mode:** works through `prefers-color-scheme`; same axe result; season colours keep text +
  mark (screenshots reviewed).

## Patterns & Systemic Issues

- **One base size for two heading levels** across all list templates: hierarchy relies on
  position and spacing, not type.
- **Layout constants live in components.** Colour is fully tokenized, but breakpoints, target
  sizes, weights and grid minimums are repeated literals; the token that exists for targets
  (`--target-min`) is not used where it applies.
- **Fonts are the page weight.** With zero JS and small AVIF photos, 110 KB of fonts is the
  single largest cost on every page.
- **Long single-column produce page.** At 1280 px the produce page is a 4048 px stack of 12
  equal-weight sections in a ~42 rem column with empty space to the right; "Как да изберем" (the
  shopper's main question) is section 8 of 12.

## Positive Findings

- Accessibility is a real strength: zero axe violations, correct landmarks, skip link, visible
  focus, `lang="la"` on Latin names, season level never shown by colour alone, focusable labelled
  scroll regions for wide tables.
- No JavaScript on content pages; CLS 0 everywhere; FCP ≈ 0.6 s.
- A typed, tested token module with light and dark palettes; zero hard-coded colours.
- Font subsetting with metric-matched fallbacks (`size-adjust`, `ascent-override`) prevents
  layout shift.
- Responsive images with `width`/`height`, `fetchpriority="high"` on the LCP photo and `lazy`
  on the rest.
- Pages remain fully readable with CSS disabled, in source order.

## Recommended Actions

1. **[P2] `/impeccable typeset`**: a heading scale with distinct `h1`/`h2`/`h3` steps on every
   template; `text-wrap: pretty` for list items and definitions; a decision on the italic face.
2. **[P2] `/impeccable adapt`**: a compact mobile header with ≥ 44 px targets that keeps the
   season answer in the first viewport, without JS and without CSS-only hiding.
3. **[P2] `/impeccable layout`**: tokens for breakpoints, weights and layout widths; reuse
   `--target-min`; derive `sizes` from shared breakpoints; reorder the produce page so the
   shopper's questions come first (within the no-CSS source-order rule).
4. **[P2] `/impeccable optimize`**: explicit font and image budget; re-measure the month page TBT
   over several runs; fix the AVIF `srcset` steps.
5. **[P2] `/impeccable clarify`**: standalone "available" group label; migrate „Вие“ strings to
   „ти“.
6. **[P3] `/impeccable animate`**: only if the redesign adds motion; replace the global kill with
   per-effect reduced alternatives.
7. **`/impeccable polish`**: final pass after the redesign.

Because this is evidence for a full redesign (epic #78), these items should feed
`/impeccable shape` and the new DESIGN.md rather than be patched on the current look.

## Constraints and risks for the redesign

1. **Performance headroom is small.** Perf is 99–100 today with LCP 1.65–1.81 s on photo pages.
   In Lighthouse's mobile scoring, LCP (weight 25 %) scores 0.98 at 1.8 s and about 0.90 at
   2.5 s; TBT (30 %) already lost 2 points on the month page at 104 ms. A redesign that adds a
   larger hero photo, a second display face or any script can drop below the CI floor of 95.
   Treat ~2.2 s LCP and ~150 ms TBT as the working ceilings.
2. **Font budget.** Today: 2 families, 3 faces, 6 subset files, 110 KB, 4 preloaded. Any new face
   or weight axis adds ~15–21 KB per script subset (Latin + Cyrillic). Preloads compete with the
   LCP image (ADR-0005). Keep total font transfer at or below today's 110 KB unless an ADR accepts
   more.
3. **Page weight baseline.** 116–163 KB total transfer, HTML 21–44 KB uncompressed, inline CSS
   11–16 KB per page. All CSS is inlined; a much larger stylesheet inflates every HTML response.
4. **CLS must stay 0** (ADR-0005). Every image needs intrinsic dimensions; fonts need metric
   fallbacks; no late-inserted content (ad slots in Phase 4 need reserved space).
5. **No JavaScript** outside the search page (PRODUCT.md). Navigation, disclosure and filters
   must work with HTML/CSS only (`<details>`, anchors, separate pages).
6. **Readable without CSS** (spec 009): the redesign cannot reorder content visually (no `order`,
   no grid placement that differs from source order) and cannot hide content except
   `.visually-hidden`. Reordering the produce page must happen in the source.
7. **Season level: text + mark + colour** in both schemes; dark-mode season fills (`peak
#446f3b`, `available #3f5a3a`, `storage #4a4560`) are already low-chroma, so new colour roles
   need fresh contrast tests in `src/design/contrast.ts`.
8. **Targets ≥ 24 px (WCAG) and ≥ 44 px (`--target-min`)** for non-inline controls, including the
   12-month ribbon at 320 px (today it wraps 6 × 2 at 390 px).
9. **Reflow at 320 px** must keep working; wide tables need the labelled scroll region pattern.
10. **Binding identity until replaced:** ADR-0004 (botanical atlas, Piazzolla + Sofia Sans,
    plates, Latin names) is binding; a redesign that changes palette or typefaces needs a new ADR
    that supersedes it.
11. **Token-only styling:** `AGENTS.md` section 8 requires colours from tokens; the redesign
    should extend the same rule to breakpoints, weights and spacing so `src/design/tokens.ts`
    stays the single source.

---

You can ask me to run these one at a time, all at once, or in any order you prefer.

Re-run `/impeccable audit` after fixes to see your score improve.

## Raw evidence

Kept outside the repository (session scratchpad): Lighthouse JSON per page, the Playwright/axe
result file, detector JSON, and full-page screenshots (light/dark at 390 px, 1280 px, no-CSS,
320/360 px viewport captures). Re-create them with the commands in "Tools and commands".
