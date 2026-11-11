# Design critique of the current site (redesign evidence)

⚠️ DEGRADED: single-context (no sub-agent tool exposed to this run; Assessment A, the design
review, was finished and written down before the detector output was read, then Assessment B was
run).

- **Issue:** #79 (step 1 of the redesign epic #78)
- **Date:** 2026-11-11
- **Method:** impeccable `critique` (v4.8.2): heuristic scoring, cognitive load, personas,
  deterministic detector. The project context (`PRODUCT.md`) was loaded with `impeccable context`.
  DESIGN.md does not exist. The visual world in code is the "botanical atlas" from ADR-0004.
- **Target:** the static build served at `http://127.0.0.1:4399`, five templates:
  `/` (home), `/sezon/noemvri` (month), `/plodove/yabalki` (produce detail), `/plodove`
  (section index), `/grupi/krastotsvetni` (botanical group).
- **Constraints checked against:** `AGENTS.md` §8 (accessibility) and §9 (SEO), ADR-0005
  (Performance ≥ 95, other categories 100), `PRODUCT.md` (primary user: a shopper at a market,
  on a phone, one hand free).
- **Evidence:** screenshots in the session scratchpad folder `evidence/screenshots/`
  (`<template>-<mobile|desktop>-<light|dark>.png`, full page; `<template>-mobile-<scheme>-fold.png`,
  the first 390 × 844 viewport). Mobile crops are in `evidence/crops/` (`<file>-<n>.png`,
  1100 px slices). The screenshots are not committed. Re-create them with Playwright at 390 and
  1280 px wide, deviceScaleFactor 1.
- **Not done:** the detector overlay was not injected into the browser, because that needs the
  impeccable live server, and this run used no live mode. Instead, rendered contrast, overlap and
  target size were measured with Playwright (see Assessment B). The snapshot was not saved to
  `.impeccable/critique/`, because this task may write only this file.

---

## 1. Summary

The site is accessible, fast and honest, but it reads as a well-made content template rather
than as a tool for someone standing at a market stall. The atlas identity shows up in only two
places: the giant month name on the home page and the Latin names. Everything else is a
standard pattern: three image cards with pill badges, list rows, a long single-column article and
a 12-link footer. The shopper's three questions are what is in season now, whether this item is
local and fresh or from storage, and how to pick a good one. The answer to the first is visible
but takes too long to reach on a phone. The second is answered only by the "От хранилище"
section, and the third is buried 3,000 px down the produce page.

**Overall score: 19/32 (59 %, Acceptable).** Heuristics 5 (error prevention) and 9 (error
recovery) are `n/a`: these templates have no input, forms or error states (the 404 page was out
of scope).

---

## 2. Design specificity verdict

**LLM assessment (written before the detector ran):** partly specific, mostly
category-interchangeable.

- Specific to this product: the month as display typography (`home-desktop-light.png`), the
  "Табло XI от XII" plate counter, the Latin binomials in `lang="la"` italics, the season level
  carried by text, mark and tint (★ / ● / ◐ / ○), and the 12-cell season calendar on the produce
  page (`produce-desktop-light.png`). These are the best ideas on the site.
- Interchangeable: the three-up rounded image card (photo, title, meta row, green pill, blurb)
  on home, month and group (`month-desktop-light.png`, `group-desktop-light.png`) could belong
  to any recipe or e-commerce site. The produce page is a stack of thirteen `h2` sections of the
  same weight, like a CMS article (`produce-desktop-light.png`). The footer is a generic link farm.
- The photographs do not match the "herbarium plate" idea. The cabbage is in a field, the leeks
  are a tight crop, the celeriac sits on black and the apples on a white seamless background.
  Each has a different light, background and scale (`home-desktop-light.png`).
- Missed character: no regional map, no sense of Bulgarian place, no visual year (the ribbon
  is a row of buttons, not a seasonal shape), and no material or texture from markets or
  herbaria.

**Deterministic scan:** `impeccable detect --json` on `src/pages`, `src/components` and
`src/layouts` found **0 findings** (exit 0). On the five built HTML files in `dist/` it found
**21 findings** (exit 2):

| Rule              | Files                                                                                                  | Count | Verdict                                                                                                                                                                                                                                                                                                                                           |
| ----------------- | ------------------------------------------------------------------------------------------------------ | ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `low-contrast`    | `index.html`, `sezon/noemvri.html`, `plodove.html`, `plodove/yabalki.html`, `grupi/krastotsvetni.html` | 16    | **False positive.** The static scan pairs dark-mode tokens (`#a8b8ac`, `#f29ab2`, `#e7eee6`) with the light background `#ffffff`. A Playwright check of the computed foreground against the computed background of every text node on `/`, `/sezon/noemvri` and `/plodove/yabalki`, in both light and dark scheme, found **no text below 4.5:1**. |
| `cramped-padding` | `index.html`                                                                                           | 5     | **Real, but minor (P3).** The year-ribbon cells (`<li>`) have text flush against the top hairline. It is visible as a tight, form-like grid in `home-mobile-light-fold.png`.                                                                                                                                                                      |

The detector did not catch the most serious visual defect found in the review: text overlap in
the list rows on mobile (see P1-2).

---

## 3. Design health score (Nielsen heuristics, per template)

Scale 0–4. 5 and 9 are `n/a` (no input or error states). Maximum 32.

| #         | Heuristic                       | Home (`/`) | Month     | Produce   | Section   | Group     | Key issue                                                                                                                                              |
| --------- | ------------------------------- | ---------- | --------- | --------- | --------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1         | Visibility of system status     | 3          | 3         | 3         | 2         | 2         | The current month is clear on home and in the produce calendar. The section and group pages say "now" only in a sentence of intro text.                |
| 2         | Match with the real world       | 3          | 3         | 3         | 3         | 2         | "Табло XI от XII", "РСП" and "От хранилище" need explaining. The group intro lists broccoli, cauliflower and radishes, which are not in the catalogue. |
| 3         | User control and freedom        | 3          | 3         | 3         | 3         | 3         | Breadcrumbs, previous/next month, plain links. Nothing traps the user.                                                                                 |
| 4         | Consistency and standards       | 2          | 2         | 2         | 2         | 2         | The home page and the month page show the same month differently. Card vs row for the same item. Mixed "Вие"/"ти" voice.                               |
| 5         | Error prevention                | n/a        | n/a       | n/a       | n/a       | n/a       | No input.                                                                                                                                              |
| 6         | Recognition rather than recall  | 3          | 3         | 2         | 3         | 3         | The produce page has no table of contents. The reader has to remember what is further down a 5,200 px page.                                            |
| 7         | Flexibility and efficiency      | 2          | 2         | 1         | 2         | 1         | No jump links, no filter by section on the month page, and the group page lists a single item.                                                         |
| 8         | Aesthetic and minimalist design | 2          | 2         | 2         | 2         | 2         | The hero eats the first mobile viewport, and the cards are tall. All produce sections have equal weight.                                               |
| 9         | Error recovery                  | n/a        | n/a       | n/a       | n/a       | n/a       | No error states in scope.                                                                                                                              |
| 10        | Help and documentation          | 2          | 2         | 3         | 2         | 2         | Sources and the FAQ are good on the produce page. The season legend and "РСП" are never explained in place.                                            |
| **Total** |                                 | **20/32**  | **20/32** | **19/32** | **19/32** | **17/32** | **Site: 19/32 (59 %), Acceptable**                                                                                                                     |

Rating bands by percentage: 90 %+ Excellent, 70 %+ Good, 50 %+ Acceptable, 30 %+ Poor.

### Cognitive load (checklist of 8)

| Check                  | Result   | Note                                                                                                                                     |
| ---------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Single focus           | Pass     | Calm pages, no ads or pop-ups.                                                                                                           |
| Chunking (≤ 4)         | **Fail** | Header nav has 8 items, and the footer has 13 links on every page. The produce page has 11 `h2` sections in one flat column.             |
| Grouping               | **Fail** | Produce sections are not grouped by job (buy / eat / grow / evidence), and "how to choose" sits after the farms.                         |
| Visual hierarchy       | **Fail** | On the produce page every `h2` has the same weight. "Сезон по месеци" and "Източници" look equally important.                            |
| One thing at a time    | Pass     |                                                                                                                                          |
| Minimal choices (≤ 4)  | **Fail** | 8 navigation links in two wrapped rows at 390 px (`home-mobile-light-fold.png`), 12 month cells, 12 footer months.                       |
| Working memory         | Pass     | Season level is repeated on each row.                                                                                                    |
| Progressive disclosure | **Fail** | The produce page shows everything at once (varieties, nutrition, preparation, regions, farms, choosing, storing, growing, FAQ, sources). |

**5 failures: high cognitive load**, driven by the produce page and the global navigation.

### Emotional journey

- **Peak:** the home page opens with the month in big type. It is the one confident, memorable
  moment (`home-desktop-light.png`).
- **Valley:** on mobile that moment fills the whole first screen, and the first produce item
  (`h3` "Зеле") starts at 961 px, below the 844 px fold (`home-mobile-light-fold.png`). After
  that the site turns into a long, uniform scroll.
- **End:** every page ends in the same green footer of month links and a disclaimer. The
  produce page ends on a list of seven source links and "Данните очакват редакторска проверка"
  (`produce-mobile-light-4.png`). That builds trust, but it is a flat ending with no next step
  ("what else is good now", "related produce").

---

## 4. What is working

1. **The season level system.** Four levels, each shown with text, a mark (★ ● ◐ ○) and a tint.
   It works in light and dark mode, does not depend on colour, and the current month has a
   carmine frame (`produce-mobile-light-0.png`, `produce-mobile-dark-1.png`). It is the strongest
   reusable element on the site and worth keeping in any redesign.
2. **Trust apparatus.** The nutrition table has a caption, a per-100 g basis, a USDA source link
   and a regulatory note for %РСП. Placeholder farms are labelled "Примерни данни". There is a
   source list and an "updated on" line (`produce-mobile-light-1.png`, `produce-mobile-light-3.png`).
   This matches "sourced, never promised" in PRODUCT.md exactly.
3. **Robust base.** No horizontal scroll at 390 px. All five pages measured 390 px scrollWidth.
   No text below 4.5:1 in either scheme (measured). A correct heading tree and breadcrumbs.
   The pages are small: 21–43 KB of HTML.

---

## 5. Findings by template (ranked by severity)

Severity: **P0** blocks the task, **P1** major, **P2** minor, **P3** polish.

### 5.1 Produce detail `/plodove/yabalki` (19/32)

| Sev    | Finding                                                                                                                                                                                                                                                                                                                                                                                      | Evidence                                                   |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------- |
| **P1** | **The shopper's "how to choose" answer is buried.** "Как да изберем" starts at 3,031 px of a 5,202 px page on mobile (about 3.6 screens down), after varieties, nutrition, preparation, regions and farms. "Как да съхраняваме" follows at 3,158 px. At the stall these are the first things needed.                                                                                         | `produce-mobile-light-2.png`, measured heading offsets     |
| **P1** | **"Is this fresh or from storage?" is not answered at the point of decision.** The only status near the top is a small bold line, "През ноември: В сезон". The calendar shows storage in Dec–Apr, but the page never says what that means for the apple in your hand (e.g. that from December apples come from storage, or how to tell). The season level is shown as a fact, not as advice. | `produce-mobile-light-0.png`                               |
| **P1** | **No in-page navigation on an 11-section page.** No table of contents and no jump links. Gardeners must scroll past nutrition and farms to reach "Отглеждане в градината" (3,311 px). Cooks must scroll past the calendar and varieties to reach preparation.                                                                                                                                | `produce-desktop-light.png`, `produce-mobile-light-*.png`  |
| **P2** | **Flat hierarchy.** All 11 `h2`s have the same size and weight. Nothing separates the "at the market" content from the "at home" or "evidence" content. The long heading "Как да го приготвим, за да запази хранителните си вещества" wraps to three lines at 390 px.                                                                                                                        | `produce-mobile-light-1.png`, `produce-mobile-light-2.png` |
| **P2** | **Regions are a bare bullet list.** "Кюстендил", "Пловдив" are bold text, not links, and there is no map or province context, although "local" is the product's main differentiator. No region route exists (`src/pages` has none).                                                                                                                                                          | `produce-mobile-light-2.png`                               |
| **P2** | **Growing months are one inline sentence of links** ("Засаждане март, октомври — декември"). The season calendar already shows harvest, but planting is not on the same timeline, so the gardener cannot compare sowing with harvest at a glance.                                                                                                                                            | `produce-mobile-light-3.png`                               |
| **P2** | **Desktop wastes the right column.** After the hero, all content runs in a column about 720 px wide, and the right ~45 % of the 1,280 px canvas is empty for about 3,500 px.                                                                                                                                                                                                                 | `produce-desktop-light.png`                                |
| **P2** | **Nutrition table:** the visible heading "Хранителни стойности" is repeated by the caption "Хранителни стойности на 100 г". "% РСП" is not explained until a small note below the table, and the "Фибри" row shows "—" without saying why. The numbers are accurate but not comparative: there is no visual scale and no comparison with other produce.                                      | `produce-mobile-light-1.png`                               |
| **P2** | **Traditional uses do not appear on this page** (apples have none in data). The section silently disappears, so the richest-page template has no example of how that section looks next to the others.                                                                                                                                                                                       | heading list of `/plodove/yabalki`                         |
| **P2** | **Voice is mixed:** the growing guide uses "ти" ("Засаждай", "Избери"), while other UI strings use "Вие" ("Вижте…"). PRODUCT.md sets "ти".                                                                                                                                                                                                                                                   | `produce-mobile-light-3.png`, `home-mobile-light-2.png`    |
| **P3** | The FAQ section holds a single question under two headings (`h2` + `h3`).                                                                                                                                                                                                                                                                                                                    | `produce-mobile-light-3.png`                               |
| **P3** | The photo caption repeats the Latin name already shown 300 px above.                                                                                                                                                                                                                                                                                                                         | `produce-mobile-light-0.png`                               |

### 5.2 Home `/` (20/32)

| Sev    | Finding                                                                                                                                                                                                                                                                                                                                                    | Evidence                                                  |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| **P1** | **The first screen on a phone shows no produce.** The masthead, 8 nav links in two rows, the "Табло XI от XII" counter, the "Ноември" display word, the intro text and the 12-cell ribbon fill the 844 px viewport. The first produce card (`h3` "Зеле") starts at 961 px. The principle "the season comes first" is met in typography but not in content. | `home-mobile-light-fold.png`, `home-mobile-dark-fold.png` |
| **P1** | **Only the three peak items are shown.** 12 items are in season in November (3 peak, 8 in season, 1 from storage), but home shows 3 large cards and then three text links. Carrots, spinach, apples and walnuts are one tap and one page away. Each card is about 530 px tall on mobile, so the three cards take about 1,600 px.                           | `home-mobile-light-1.png`, `month-desktop-light.png`      |
| **P2** | **"Табло XI от XII"** (Plate XI of XII) is an atlas in-joke that a shopper will not understand. It costs a line above the fold.                                                                                                                                                                                                                            | `home-mobile-light-0.png`                                 |
| **P2** | **The month ribbon is a 6 × 2 grid of buttons on mobile** (12 equal choices). It reads like a form control and has the `cramped-padding` detector finding (text flush with the top rule).                                                                                                                                                                  | `home-mobile-light-fold.png`                              |
| **P3** | The three end links ("Вижте всичко…", "Вижте какво идва…", "Целогодишен…") are the same carmine underlined style as body links. The main next step, "see everything in season", has no more weight than the others.                                                                                                                                        | `home-desktop-light.png`                                  |

### 5.3 Month `/sezon/noemvri` (20/32)

| Sev    | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Evidence                                                                             |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| **P1** | **Text overlaps in the list rows on mobile.** The produce name collides with its Latin name: "Магданоз" × "Petroselinum crispum" (50 px overlap), "Моркови" × "Daucus carota subsp. sativus" (75 px), and "Круши" × "Pyrus communis". In the Моркови row the badge wraps to a second line. The same row component is used on the section index ("Круши" in `section-mobile-light-0.png`). It is legible to no one, and it is a WCAG 1.4.10 reflow risk. | `month-mobile-light-1.png`, `month-mobile-light-2.png`, `section-mobile-light-0.png` |
| **P1** | **The full in-season list starts at 1,932 px** ("Също в сезон") on mobile. Three large cards come first. A shopper scanning for "what can I buy" has to scroll more than two screens to see 9 of the 12 items.                                                                                                                                                                                                                                          | `month-mobile-light-0.png`, `month-mobile-light-1.png`                               |
| **P2** | **The month page and the home page present the same month differently.** Home has the giant month word and the year ribbon. `/sezon/noemvri` has a small `h1` ("Какво е в сезон през ноември"), no ribbon and no plate counter. Its only month navigation is the previous/next boxes at the bottom. Users moving from home to a month lose the year context.                                                                                            | `home-desktop-light.png`, `month-desktop-light.png`                                  |
| **P2** | **No grouping or filtering by section.** Fruit, vegetables, herbs and nuts are mixed in one alphabetical list. The section is shown only as a small grey word ("Плод", "Зеленчук").                                                                                                                                                                                                                                                                     | `month-desktop-light.png`                                                            |
| **P2** | **No "coming next / ending soon" signal.** The data has month-by-month levels, but the page does not say what is ending this month or arriving next, which is what a planner (preserves, garden) needs.                                                                                                                                                                                                                                                 | `month-desktop-light.png`                                                            |
| **P3** | The previous/next month boxes are the only bordered buttons on the site, a one-off style.                                                                                                                                                                                                                                                                                                                                                               | `month-mobile-light-2.png`                                                           |

### 5.4 Section index `/plodove` (19/32)

| Sev    | Finding                                                                                                                                                                                                                                                                                                                                     | Evidence                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| **P2** | **An orphaned heading.** The first section is "Също в сезон" ("Also in season") with nothing before it (no fruit is at peak in November). "Also" refers to a section that is not there.                                                                                                                                                     | `section-desktop-light.png`  |
| **P2** | **The intro promises "all fruits in the catalogue"**, but the page groups them by November's level only. A fruit that is out of season would appear only under an out-of-season heading, which is not visible here. There is no year view per fruit (e.g. mini season bars per row), so the index cannot answer "when is the season for X". | `section-desktop-light.png`  |
| **P2** | **No images and no summaries.** The section index is the only list template without photographs, while home and month lead with large photos. Same items, different presentation.                                                                                                                                                           | `section-mobile-light-0.png` |
| **P2** | **Desktop leaves half the canvas empty.** Three rows sit in a two-column grid, then the footer.                                                                                                                                                                                                                                             | `section-desktop-light.png`  |

### 5.5 Botanical group `/grupi/krastotsvetni` (17/32)

| Sev    | Finding                                                                                                                                                                                  | Evidence                                              |
| ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **P2** | **The intro names produce that the page does not list.** "зелето, броколите, карфиолът и репичките", but only "Зеле" exists in the catalogue. A reader expects four items and finds one. | `group-desktop-light.png`, `group-mobile-light-0.png` |
| **P2** | **One card on a three-column grid.** On desktop the single card takes the left third, and two-thirds of the page is empty.                                                               | `group-desktop-light.png`                             |
| **P2** | **Two stacked intro paragraphs say similar things** ("Семейство, към което спадат…" and "Продуктите от семейство Кръстоцветни, подредени по сезона…").                                   | `group-mobile-light-0.png`                            |
| **P3** | Botany is the atlas direction's natural home, but the group page has no botanical content (family traits, a shared plate, how members relate). It is the most generic template.          | `group-desktop-light.png`                             |

### 5.6 Cross-template (global)

| Sev    | Finding                                                                                                                                                                                                                                                              | Evidence                                                |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| **P1** | **Mobile header uses about 136 px for 8 text links in two wrapped rows.** There is no single primary action, and "Сезонът сега" and "Какво идва: Декември" compete with five catalogue links and "Търсене". The search link sits last, at the end of the second row. | `*-mobile-light-fold.png`                               |
| **P2** | **Footer link farm.** 12 month links in a two-column grid plus "Сезонен календар". The block takes about 400 px on mobile and repeats on every page.                                                                                                                 | `home-mobile-light-2.png`, `produce-mobile-light-4.png` |
| **P2** | **One item, three looks.** Large photo card (home, month peak, group), text row with badge (month "also", section), and a full page. The same season badge appears as a pill in the cards and a pill in the rows, but the calendar cell uses a different layout.     | `month-desktop-light.png`, `section-desktop-light.png`  |
| **P2** | **Photography is inconsistent** in background, lighting and crop. It weakens the "specimen plate" promise of ADR-0004.                                                                                                                                               | `home-desktop-light.png`                                |
| **P3** | The season-level legend is never shown in place. "От хранилище" and the ◐ mark are left to interpretation (whether the level stays is still open, issue #62).                                                                                                        | `month-desktop-light.png`                               |
| **P3** | Dark mode is coherent. The carmine accent turns pink (`#f29ab2`), which is softer than the light theme's carmine. The calendar's storage cells (`#4a4560`) read as a separate, cool violet block.                                                                    | `produce-mobile-dark-0.png`, `home-desktop-dark.png`    |

---

## 6. Persona red flags

**Casey (distracted mobile user), and the project persona "Маргарита, the shopper at the
stall".** Маргарита holds a bag in one hand and the phone in the other, on mobile data in the
Женски пазар. She wants to know: are these apples local and fresh now, and how do I pick
good ones?

- On `/` she sees no produce in the first screen (`home-mobile-light-fold.png`). The first card
  is at 961 px.
- Apples are not on the home page at all. She must find "Вижте всичко в сезон през ноември" at
  the bottom (about 2,300 px down) or use "Плодове" in the nav.
- On `/plodove/yabalki` "how to choose" is 3.6 screens down, after nutrition and farms.
- The storage question (fresh vs. stored) is never answered as advice.
- All navigation is at the top of the screen, out of thumb reach. There is no "back to the
  month" link near the content she is reading.
- Inline text links are about 19–20 px tall (e.g. "Сезонен календар" 120 × 19). They pass WCAG
  2.5.8 as inline links but are fiddly with one thumb.

**Jordan (first-timer).**

- "Табло XI от XII", "РСП", "От хранилище" and the ◐ mark are unexplained at the point of use.
- The section index opens with "Също в сезон" ("Also in season"), which reads as an error.
- The group page names four vegetables and shows one.

**Sam (accessibility-dependent user).**

- Good: one `h1`, logical `h2`/`h3`, breadcrumbs, `lang="la"` names, table with caption and
  `th scope`, season level as text, no contrast failures in either scheme (measured).
- Red flag: the overlapping name and Latin text in month and section rows on mobile at 390 px
  (and so at 200 % zoom on wider screens). This is a likely WCAG 1.4.10 / 1.4.12 issue.
- Red flag: the produce page is 13 headings long and has no skip-to-section links. Screen-reader
  heading navigation works, but sighted keyboard users must tab through 55 links.

**Project persona "Иван, home gardener" (secondary user from PRODUCT.md).**

- He opens the produce page to find when to plant. "Отглеждане в градината" is at 3,311 px.
- Planting months are a sentence ("март, октомври — декември"), not a row on the season
  calendar, so sowing cannot be compared with harvest.
- Nothing on the month page says "plant this month".

---

## 7. Minor observations

- On desktop home, the descender of "р" in "Ноември" ends close to the intro paragraph. Tight
  but not colliding (`home-desktop-light.png`).
- The intro text on home is set at a larger size than body text but in the sans face. The serif
  is used only for headings. Long-form content (preparation, growing) would read better with a
  more distinct text style.
- "Подправки" (spices) is the nav label for parsley and dill, which PRODUCT.md calls herbs.
- The placeholder farm shows a working `tel:` link to "+359000000002". It is labelled
  "Примерни данни", but a tappable fake phone number on a phone is easy to hit by mistake.
- The produce page's "Семейство: Розоцветни (Rosaceae)" link is the only way to reach group
  pages. Groups are not in the header navigation.
- Measured page heights at 390 px: home 3,040 px, month 3,342 px, produce 5,202 px,
  section 1,265 px, group 1,691 px.

---

## 8. Questions to consider

- What if the home page's first screen were the list of what is good now (12 small items with
  their season mark), with the month name as the frame instead of the content?
- What if the produce page opened with a "at the stall" block (status this month, fresh or
  stored, how to choose, how to store) and moved nutrition, growing and sources below it?
- Does every template need its own way of showing an item, or can one "specimen" unit work in
  a card, a row and a page?
- What would a botanical atlas of Bulgaria look like if the regions were a map and the year
  were a wheel or band, rather than a list and a row of buttons?
- Should the month page, not the home page, be the place for the big typographic month, so that
  every month gets the same treatment?

### Questions for the owner (not asked in this run)

The critique flow asks the user these questions at the end. This run was a sub-task with no way
to ask, so they are listed for the brief:

1. **Priority:** which problem comes first for the redesign: (a) mobile speed to "what is in
   season now" on home and month, (b) the produce page's structure (order, in-page navigation,
   "at the stall" block), or (c) visual distinctiveness (cards, photography, map, calendar)?
2. **Tone:** should the botanical atlas stay (ADR-0004), with the redesign pushing it further
   (plates, consistent specimen photography, maps), or should it give way to a warmer
   "market" direction?
3. **Scope:** all five templates at once, or home, month and produce first (the shopper's path)?

---

## 9. Opportunities for the redesign brief

1. **Answer the shopper in the first mobile viewport.** On home and month, show the full list of
   what is in season now (all levels, compact, with mark and section) above or beside the month
   title. Keep the giant month word, but do not let it fill the screen.
2. **Add an "at the stall" block to the top of the produce page.** It holds this month's level
   in words ("fresh from the field" / "from storage since …"), how to choose, how to store, and
   whether it is local (regions). Nutrition, preparation, growing, FAQ and sources follow in
   clearly separated groups (buy, eat, grow, evidence).
3. **Add in-page navigation for long produce pages.** A compact table of contents or sticky
   section chips. No JavaScript is needed; anchor links are enough.
4. **Make one "specimen" unit that works at three sizes** (row, card, page header), with the same
   order everywhere: name, Latin name, section, season mark. Fix the row overlap at 390 px as part
   of it (names and Latin on separate lines on narrow screens).
5. **Make the year visual.** Reuse the strong 12-cell season calendar as a compact strip in list
   rows (section index, group, search results), and add planting months as a second row, so
   harvest and sowing can be compared.
6. **Make "local" visible.** A small map of Bulgaria's 28 provinces with the producing regions
   marked, on the produce page and later on region pages. Link region names.
7. **Make the month page consistent with home.** Same month title treatment, same year ribbon,
   plus "starts this month / ends this month / plant this month" sections.
8. **Lighten global navigation on mobile.** Fewer top-level items (e.g. Now, Catalogue,
   Calendar, Search), a single row, and consider a bottom-reachable "this month" link. Replace
   the 13-link footer with a compact year strip.
9. **Commission or edit consistent specimen photography** (same background, light and crop) so
   the atlas idea holds across all produce, or move to a drawn or cut-out plate style.
10. **Explain the vocabulary in place.** A one-line season legend next to the first badge on each
    page. Expand "РСП" at first use. Drop or explain "Табло XI от XII".
11. **Fill or redesign the thin templates.** Group and section pages need a layout that looks
    intentional with one to three items, and botanical content of their own. Do not name
    produce in group intros that the catalogue does not have.
12. **Unify voice to "ти"** across UI strings as PRODUCT.md decides.
13. **Keep what works:** the four-level season system (text + mark + tint), the sourced
    nutrition table with caption and regulatory note, placeholder labelling, the no-JS and
    no-CSS robustness, and the Lighthouse / WCAG budget (ADR-0005, `AGENTS.md` §8–9). Any new
    map or calendar must be static SVG or HTML, readable without CSS, and must not shift layout
    (CLS 0).
