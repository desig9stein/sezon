---
name: Sezon
description: What grows in Bulgaria this month, stamped like a crate of origin.
colors:
  background: '#f4f6fb'
  surface: '#ffffff'
  text: '#141a2e'
  text-muted: '#4a5270'
  accent: '#1c3faa'
  accent-text: '#ffffff'
  border: '#6b7395'
  rule: '#c9cfe2'
  focus: '#b45309'
  peak: '#c8102e'
  on-peak: '#ffffff'
  available: '#e3e9fb'
  storage: '#ebe6f5'
  on-badge: '#141a2e'
  shell: '#1c3faa'
  on-shell: '#ffffff'
  focus-on-shell: '#ffb000'
  marker: '#ffb000'
  on-marker: '#141a2e'
  background-dark: '#0d1430'
  surface-dark: '#141c3d'
  text-dark: '#eef1fb'
  text-muted-dark: '#a9b1d1'
  accent-dark: '#9db3ff'
  accent-text-dark: '#0d1430'
  border-dark: '#7480ad'
  rule-dark: '#2b3666'
  focus-dark: '#ffc23d'
  peak-dark: '#ff6b7f'
  on-peak-dark: '#0d1430'
  available-dark: '#26346e'
  storage-dark: '#352d5c'
  on-badge-dark: '#eef1fb'
  shell-dark: '#22337a'
  on-shell-dark: '#ffffff'
  focus-on-shell-dark: '#ffc23d'
  marker-dark: '#ffc23d'
  on-marker-dark: '#0d1430'
typography:
  headline:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: 'clamp(3.5rem, 2rem + 6vw, 6.5rem)'
    fontWeight: 800
    lineHeight: 0.95
  title-lg:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: 'clamp(1.6rem, 1.3rem + 1.4vw, 2.2rem)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '0.02em'
  title:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2.1rem)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '0.02em'
  title-sm:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.6rem)'
    fontWeight: 800
    lineHeight: 1.15
    letterSpacing: '0.02em'
  stamp:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: '0.9375rem'
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: '0.06em'
  lede:
    fontFamily: "'Sofia Sans', system-ui, sans-serif"
    fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.6rem)'
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "'Sofia Sans', system-ui, sans-serif"
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "'Sofia Sans', system-ui, sans-serif"
    fontSize: '0.9375rem'
    fontWeight: 600
    lineHeight: 1.2
  latin-name:
    fontFamily: "'Sofia Sans', system-ui, sans-serif"
    fontSize: '1.0625rem'
    fontWeight: 400
rounded:
  radius-sm: '0.375rem'
spacing:
  '1': '0.25rem'
  '2': '0.5rem'
  '3': '0.75rem'
  '4': '1rem'
  '6': '1.5rem'
  '8': '2rem'
  '12': '3rem'
  '16': '4rem'
components:
  season-stamp-peak:
    backgroundColor: '{colors.peak}'
    textColor: '{colors.on-peak}'
    typography: '{typography.stamp}'
    padding: '0.2em 0.5em'
  season-stamp-available:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.accent}'
    typography: '{typography.stamp}'
    padding: '0.2em 0.5em'
  season-stamp-storage:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    typography: '{typography.stamp}'
    padding: '0.2em'
  year-strip:
    width: '133px'
    height: '16px'
  season-list-row:
    textColor: '{colors.text}'
    padding: '0.25rem 0'
  produce-plate:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.radius-sm}'
    padding: '1.5rem 1rem 1rem'
  produce-photo-plate:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.radius-sm}'
    padding: '0.75rem'
  farm-card:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text}'
    rounded: '{rounded.radius-sm}'
    padding: '1rem'
  button-primary:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-text}'
    rounded: '{rounded.radius-sm}'
    padding: '0.5rem 1rem'
    height: '2.75rem'
  input-search:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
    rounded: '{rounded.radius-sm}'
    padding: '0.5rem 0.75rem'
    height: '2.75rem'
  calendar-cell-peak:
    backgroundColor: '{colors.peak}'
    textColor: '{colors.on-peak}'
  calendar-cell-available:
    backgroundColor: '{colors.available}'
    textColor: '{colors.on-badge}'
  calendar-cell-storage:
    backgroundColor: '{colors.storage}'
    textColor: '{colors.on-badge}'
  footer-month-current:
    backgroundColor: '{colors.marker}'
    textColor: '{colors.on-marker}'
    height: '2.75rem'
  month-pager-link:
    textColor: '{colors.accent}'
    rounded: '{rounded.radius-sm}'
    padding: '0.5rem 1rem'
    height: '2.75rem'
  site-header:
    backgroundColor: '{colors.shell}'
    textColor: '{colors.on-shell}'
  site-footer:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-muted}'
    padding: '2rem 0'
---

# Design System: Sezon

## Overview

**Creative North Star: "The Stamp of Origin"**

The north star is the owner's chosen direction recorded in ADR-0006: stencilled produce crates and the rubber stamps of origin and grade on them, translated into a working interface for a shopper at the stall, on a phone. The world is ultramarine stamp ink on near-white label paper, stencil-black text, condensed heavy capitals for names, headings and stamps, and a plain humanist sans for everything that is read or operated. Stamp red is spent on one thing, the „Разгар“ (peak) level, and one marker yellow is reserved for the current month in the footer's month links. Dark mode is its own scale, a deep ink-blue ground with lighter stamp inks, not an inversion.

The world is calm by decision. Capitals appear only in the logo, headings and stamps, the surfaces are flat, separation comes from hairline rules, and there is no motion beyond the global reduced-motion guard. Density is moderate on reading pages (content column capped at 72rem, prose at 42rem, sections 2–4rem apart) and deliberately compact in the in-season list, which fits about ten rows on the first screen of a phone.

This file describes the system as built after spec 024 (#93): the tokens and typography (spec 022), the shell header and footer (spec 023, #92), and the season stamp, year strip, legend and in-season list (spec 024). The produce page is grouped (spec 025, #94) and carries the data visuals (spec 026, #95): the province map, the garden row and the nutrition bars; anything marked **planned** is decided in ADR-0006 but not yet in the code. Tokens are generated from `src/design/tokens.ts` and inlined as CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`, `--radius-*`, and others); light values sit on `:root` and dark values override them under `prefers-color-scheme: dark`. Print uses its own `--print-*` set from `src/styles/base.css` (black ink on white paper).

**Key Characteristics:**

- Sofia Sans Extra Condensed 800 in capitals for the logo, headings and stamps; Sofia Sans for body, navigation, lists and tables.
- Latin names in Sofia Sans italic 400, through the global `[lang='la']` rule.
- Ultramarine ink on label paper; stamp red only for „Разгар“; marker yellow only for the current month.
- The season level is carried by form and word: a solid, outlined or hatched stamp with its short Bulgarian word, and the same three forms in the year strip. Never colour alone.
- Flat surfaces and hairline rules, no shadows, no motion.
- One small corner radius (0.375rem) on panels and controls; stamps and strip cells are square-cornered.
- Touch targets of at least 2.75rem on primary links and controls; at least 24px in compact list rows.

## Colors

Stamp inks on label paper: one ultramarine for the shell, links, actions and the outlined stamps, one stamp red for the peak level, one marker yellow for "now", and cool blue-grey neutrals. The `-dark` keys in the frontmatter are the `prefers-color-scheme: dark` overrides of the same role.

### Primary

- **Stamp Ultramarine** (`accent`): links (the base `a` colour), the search submit button, the outline and word of the „В сезон“ stamp, the outline and hatch of the „От хранилище“ stamp, the outlines and hatch lines of available and storage cells in the year strip, the current month in the calendar table header, the current-month ring in a produce's calendar, and the 4px bar of the traditional-uses disclaimer. In dark mode it becomes a light periwinkle ink.
- **On Ultramarine** (`accent-text`): text on ultramarine fills; white in light mode, ink-blue ground in dark mode.
- **Shell Ultramarine** (`shell`), **On Shell** (`on-shell`), **Focus On Shell** (`focus-on-shell`): the stamp-blue header bar, its text and its focus ring. In light mode `shell` equals `accent`; in dark mode it is a deeper blue so white text stays strong.

### Secondary

- **Stamp Red** (`peak`): the „Разгар“ level only: the solid peak stamp, solid peak cells in the year strip, produce-calendar tiles and calendar-table cells at peak. In dark mode it lightens to a coral red.
- **On Stamp Red** (`on-peak`): the word on the peak stamp, and text and the `LevelMark` on red calendar fills; white in light mode, ink-blue ground in dark mode.

### Tertiary

- **Marker Yellow** (`marker`), **On Marker** (`on-marker`): the highlight reserved for the current month, used as the fill of the build month in the footer's month links. It is a fill under `on-marker` text only, never a line on the light page (1.69:1 against `background`); for that reason the year strip frames the current month in `text`, not in marker yellow as ADR-0006 first proposed.
- **Blue Wash** (`available`): the level fill for „В сезон“ in the calendar table and the produce calendar, and the highlight behind matched terms in search results.
- **Lilac Wash** (`storage`): the level fill for „От хранилище“ in the calendar table and the produce calendar.
- **On Wash** (`on-badge`): text on either wash; equals `text`.

The season stamp does not use the washes; it carries the level by form on `surface`. The washes remain the fills of the two calendars, which still pair fill with a `LevelMark` and a text label.

### Neutral

- **Label Paper** (`background`): the page, sticky row headers in the calendar table, the footer's month cells and the search input field.
- **Label White** (`surface`): plates, the produce photo frame, farm cards, empty calendar tiles, the disclaimer callout, the footer, the ground of the outlined stamp and the pad under the hatched stamp's word. In light mode it is brighter than the page; in dark mode it is a lifted ink-blue.
- **Stencil Black** (`text`): body text, headings, produce-name links, the word on the hatched stamp, the 2px rule above the in-season list and the current-month frame in the year strip (the logo and navigation sit on the shell in `on-shell`).
- **Faded Ink** (`text-muted`): meta lines, captions, hints, breadcrumbs, legend explanations, the home intro, the footer body and out-of-season calendar cells.
- **Pad Grey** (`border`): control and data boundaries (inputs, pager links, farm tags, footer month cells, table row rules) and the out-of-season baseline in the year strip and legend; at least 3:1 against page and surface.
- **Hairline** (`rule`): decorative hairlines only (header and footer edges, row separators in the in-season list and index rows). Never text or a control boundary.
- **Focus Amber** (`focus`): the 3px focus outline on the page; burnt amber in light mode, bright amber in dark mode, distinct from ultramarine and stamp red.

### Contrast (computed with `contrastRatio` from `src/design/contrast.ts`)

| Pair                    | Light | Dark  | Minimum |
| ----------------------- | ----- | ----- | ------- |
| text on background      | 15.96 | 16.05 | 4.5     |
| text on surface         | 17.26 | 14.73 | 4.5     |
| textMuted on background | 7.11  | 8.53  | 4.5     |
| textMuted on surface    | 7.69  | 7.83  | 4.5     |
| accent on background    | 8.30  | 8.90  | 4.5     |
| accent on surface       | 8.97  | 8.17  | 4.5     |
| accentText on accent    | 8.97  | 8.90  | 4.5     |
| onPeak on peak          | 5.88  | 6.61  | 4.5     |
| onBadge on available    | 14.23 | 10.35 | 4.5     |
| onBadge on storage      | 14.11 | 11.07 | 4.5     |
| onShell on shell        | 8.97  | 11.52 | 4.5     |
| onMarker on marker      | 9.42  | 11.24 | 4.5     |
| focusOnShell on shell   | 4.90  | 7.15  | 3       |
| focus on background     | 4.64  | 11.24 | 3       |
| focus on surface        | 5.02  | 10.32 | 3       |
| border on background    | 4.31  | 4.68  | 3       |
| border on surface       | 4.65  | 4.30  | 3       |
| peak on background      | 5.44  | 6.61  | 3       |
| peak on surface         | 5.88  | 6.07  | 3       |
| rule on background      | 1.44  | 1.57  | none    |

`rule` has no minimum against the page because it is decorative only; as the fill of unmarked provinces it must stay at least 3:1 against `accent` (the marked ones). Every pair above is in `tests/fixtures/contrastPairs.ts` and checked in both schemes. The stamps and the year strip use only tested pairs: `on-peak` on `peak`, `accent` and `text` on `surface`, and `peak`, `accent`, `border` and `text` as marks on the page.

### Named Rules

**The Red Means Разгар Rule.** Stamp red is the „Разгар“ level and nothing else: not errors, not links, not emphasis. Text on it is always `on-peak`.

**The One Marker Rule.** Marker yellow marks the current month and nothing else. It is a fill with `on-marker` text, never a line or a text colour on the light page.

**The Tested Pair Rule.** A colour is used on a background only when that pair is in the tested contrast set. Components take colours from tokens only and contain no literal colours.

## Typography

**Display Font:** Sofia Sans Extra Condensed, upright 800 (with Arial Narrow, sans-serif-condensed, sans-serif)
**Body Font:** Sofia Sans, upright 400–700 and italic 400 (with system-ui, sans-serif)

**Character:** Two members of one Bulgarian-designed family. The extra-condensed heavy cut, set in capitals, reads like stencilled crate lettering and stamp type; the regular Sofia Sans is a quiet humanist sans with Bulgarian Cyrillic letterforms by default, used for everything read or operated.

Both are self-hosted through the Astro Fonts API (`fontProviders.local()`) as WOFF2 subsets generated by `pnpm fonts:build` from `src/design/fontSubsets.mjs`, instanced to the weights in use. Sofia Sans upright and the condensed face have Latin and Cyrillic subsets; the italic is Latin only (Cyrillic italic is synthesised, and the italic is meant for Latin names). The two upright families are preloaded; the italic loads with `font-display: optional`. All five files total about 65 KB, inside the 110 KB font budget. The condensed face's Arial fallback is metric-adjusted to about 69 %.

### Hierarchy

- **Headline** (condensed 800 capitals, `3xl`, line-height 0.95): the produce name on a produce page, and the month word of the home `h1` (line-height 0.9 there), under a Sofia Sans `base` 600 lead line ("В сезон през") in sentence case inside the same heading.
- **Title-lg** (condensed 800 capitals, `2xl`, 1.15, tracking 0.02em, `text-wrap: balance`): every other `h1`.
- **Title** (condensed 800 capitals, `xl`, 1.15, tracking 0.02em): `h2`, and produce-plate names. The in-season list's `h2` („Всичко в сезон (N)“, „В сезон през <месец> (N)“) is set one step down, at `lg`.
- **Title-sm** (condensed 800 capitals, `lg`, 1.15, tracking 0.02em): `h3`, index-row names.
- **Stamp** (condensed 800 capitals, `sm` 0.9375rem, line-height 1.1, tracking 0.06em, no wrap): the word on every season stamp: „Разгар“, „В сезон“, „От хранилище“, or „От <месец>: …“ on coming-soon rows.
- **Lede** (Sofia Sans 400, `lg`): page intros, produce summaries, group descriptions; capped at the 42rem reading width.
- **Body** (Sofia Sans 400, 1.0625rem / 1.55, `text-wrap: pretty`): running text, capped at `--reading-width` (42rem); plate summaries at 42ch. In-season list names are body size at 700, line-height 1.3.
- **Label** (Sofia Sans, `sm` 0.9375rem): meta lines, captions, hints, breadcrumbs, the legend, footer. Weight 600 on pager links, the search button and the home "more" links; navigation 600; captions and the current month 700.
- **Latin name** (Sofia Sans italic 400, through `[lang='la']`): wherever a Latin name appears, often one step larger (`lg`) than its meta line.

`src/design/tokens.ts` still generates `--font-size-display` (`clamp(4.5rem, 1rem + 15vw, 13.5rem)`) for the old home hero; nothing uses it since spec 024, so it is not part of the hierarchy.

### Named Rules

**The Capitals Are Headings Rule.** Sofia Sans Extra Condensed in capitals is for the logo, `h1`–`h3` and the season stamps. Capitals come from `text-transform`, so the source text and reading order are unchanged without CSS. Body, navigation, lists and tables stay in Sofia Sans, in sentence case.

**The One Weight Rule.** The condensed face exists at 800 only. Never set it at another weight or in italic; the browser would synthesise it.

**The Tabular Rule.** Every table uses `font-variant-numeric: tabular-nums`.

## Layout

- **Container:** one centred column, `min(100% − 2rem, 72rem)`. Header, breadcrumbs, main and footer all use it; there is no sidebar.
- **Reading width:** 42rem for prose, ledes, the home intro, search and the footer disclaimer. Tables, calendars and the in-season list opt out.
- **Spacing rhythm:** a rem scale of steps 1, 2, 3, 4, 6, 8, 12, 16 (0.25–4rem). Within a block 0.25–0.75rem; between sections 1.5–2rem; before group headings, the month pager and the home links 3rem; before the footer 4rem.
- **Home (`/`):** a compact two-line `h1` (margins 0.75rem above, 0.5rem below), then the in-season list „Всичко в сезон (N)“, the legend, the muted intro, the coming-soon index rows with year strips, and a wrapping row of links (this month, next month, calendar). No photos and no hero ribbon: the list starts on the first screen.
- **Month pages (`/sezon/<месец>`):** `h1`, the in-season list „В сезон през <месец> (N)“, the legend, the „what changes“ block, coming-soon rows with year strips, then the month pager.
- **In-season list:** a 2px `text` rule on top, then rows on 1px `rule` hairlines with 0.25rem block padding. Each row is a grid `minmax(0, 1fr) auto 7rem` with a 0.75rem column gap: name, year strip, stamp (end-aligned in a fixed 7rem column so stamps line up), then the meta line (Latin name · kind) across the full row. Below 23rem the row becomes two columns: name and stamp on line 1, meta and strip on line 2. From 48rem the rows flow into two columns with a 2rem gap.
- **Grids:** produce plates (section and group pages) use `auto-fill, minmax(min(100%, 20rem), 1fr)` with a 1rem gap; farm cards the same at 18rem. Index lists are one column, two from 40rem. The footer's month links are 3, 4, 6 or 12 equal columns (see Components).
- **Produce calendar:** 12 columns, 6 under 60rem, 4 under 40rem, 2px gaps.
- **Produce page header:** one column; from 48rem, with a photo, a 3fr/2fr grid with the photo on the right.
- **Breakpoints in use:** 23rem, 40rem, 48rem and 60rem (plus 36rem and 64rem in the footer), as literals in each component.
- **Wide tables** scroll horizontally inside `ScrollTable`; the calendar table's row headers are sticky on the inline start.
- **Print:** header, footer, skip link and breadcrumbs are hidden; everything prints in `--print-ink` on `--print-paper`. The calendar prints without fills with the current month underlined; stamps and strips keep their forms in ink (see Components).

## Elevation & Depth

The system is flat, like ink on paper. No element casts a shadow. Depth is two tonal layers, the label-paper page and the `surface` panels (plates, photo frame, farm cards, disclaimer, footer), plus 1px `rule` hairlines. The only `box-shadow` is a structural inset double ring (`inset 0 0 0 2px background, inset 0 0 0 5px accent`) that outlines the current month in a produce's calendar; it draws a line, not elevation. The only gradient is the storage stamp's hard-stop hatch (`repeating-linear-gradient(135deg, accent 0 1px, surface 1px 5px)`), which draws ink lines, not shading.

**The Ink On Paper Rule.** Surfaces never lift. A panel is set apart by its tone or a hairline, never by a shadow or a tonal gradient.

## Shapes

Panels and controls use one small radius, `radius-sm` (0.375rem): plates and their photos, farm cards and tags, pager links, the search input and button, and the skip link. Stamps and year-strip cells are square-cornered, like a rubber stamp's frame. Plate photos are cropped 4:3; the produce-page photo keeps its ratio inside a 0.75rem mat. Rules are 1px, except the 2px stamp outline and the 2px `text` rule over the in-season list; the disclaimer has a 4px ultramarine inline-start bar.

The level forms are one language across stamp and strip: **solid** for „Разгар“, **outlined** for „В сезон“, **outlined and hatched** (diagonal lines at 135°) for „От хранилище“, and a thin **baseline** for out of season. The calendars still use `LevelMark`, 16×16 viewBox SVGs at 1em: a five-point star (peak), a filled circle (available), a half-filled circle (storage), an empty circle (out of season; also in the nutrient ranking table).

## Components

The season components and the shell are in their ADR-0006 form. The produce page is grouped (spec 025) and has its data visuals (spec 026). Plates, farm cards and search keep their earlier layouts in the new tokens.

### Season stamp (signature)

ADR-0006's signature move, built in `SeasonBadge`: the level as a stamp whose form carries the meaning, with the short word always present. It is used in the in-season list, the legend, plates and index rows, and the nutrient ranking table.

- **Type:** the `stamp` style (condensed 800 capitals, `sm`, line-height 1.1, tracking 0.06em), no wrap.
- **Frame:** 2px solid outline, square corners, padding 0.2em 0.5em, upright.
- **„Разгар“:** solid `peak` fill and outline with the word in `on-peak`.
- **„В сезон“:** `surface` ground with an `accent` outline and `accent` word.
- **„От хранилище“:** `accent` outline over a 135° `accent` hatch on `surface` (1px lines every 5px); the word sits on a solid `surface` pad (0.3em inline padding, 0.2em frame padding) in `text`, so the hatch never runs under the letters.
- **Out of season:** no stamp; the row or table says so in words.
- **Coming soon:** with `fromMonth`, the word reads „От <месец>: <word>“ in the same stamp.
- **Print:** fills dropped, outline and word in `--print-ink`; peak keeps the form with a 3px outline, storage with a dashed outline.
- **Without CSS:** the stamp reads as its word.

### Year strip (signature)

A produce's year as an inline SVG, 133×16px, of 12 cells (8×12px, 11px step), January to December, in the stamp forms: peak a solid `peak` cell, available a 1.5px `accent` outline, storage the outline plus three diagonal `accent` hatch lines, out of season a 2px `border` baseline at the cell's foot. The current month is framed with a 1.5px `text` rectangle around its cell. The SVG has `role="img"`, a `<title>` and a matching `aria-label` listing the months of each level in ranges („Разгар: юни – юли; В сезон: …“), or „Извън сезона през цялата година“. Presentation attributes carry the light palette from `src/design/tokens.ts`, so the strip keeps its size and forms without CSS; CSS rebinds the colours to the custom properties for dark mode and to `--print-ink` in print. Used in in-season rows and coming-soon rows.

### In-season list

`SeasonList`: everything in season in one month, peak first, then available, then storage, under an `h2` with the count. Each row is a list item: the produce name as a link (body size, 700, `text`, at least 24px tall), the year strip, the stamp, and a muted `sm` meta line with the Latin name in italic and the kind. Layout in the Layout section. An empty month shows the plain empty text instead.

### What changes this month (spec 027)

On month pages after the legend: a 2px `text` rule, the `h2` „Какво се променя през <месец>“, then `h3` groups in an auto-fit grid (min 14rem, one column on phones): „Навлизат в разгара си“, „Още са в разгара си“, „Отминава им разгарът, …“ (one group per level now: още са в сезон, вече от хранилище, вече извън сезона), „Вече от хранилище“ and „В градината“. Groups without details are one wrapping line of 700-weight `text` links (at least 1.5rem tall); garden items are rows on 1px `rule` hairlines with the activities in `text-muted` after a dash. Empty groups, and an empty block, are not rendered. Everything comes from the season and growing data.

### Season legend

An `aside` labelled „Какво значат печатите“, 1.5rem below the list: a `sm` list with each stamp followed by its plain-words meaning in `text-muted`, the out-of-season baseline (a 12×16 SVG with the `border` bar) with „Извън сезона: вероятно е внос“, and a line on how to read the strip.

### Produce plate (card)

- **Plate variant (section and group pages, peak group):** `surface` panel, `radius-sm`, padding 1.5rem 1rem 1rem, min-height 13rem: a 4:3 decorative photo, the name (condensed capitals `xl`, `text`, underlined link at least 2.75rem tall), a meta row (Latin name italic, kind, stamp), and a muted summary capped at 42ch.
- **Index variant:** no panel; a name | meta row over a 1px `rule` hairline, name at `lg`, the meta (Latin name, kind, stamp and, with `stripMonth`, the year strip) pushed to the inline end.

### Produce photo (plate frame)

A `figure` on `surface` with a 0.75rem mat and `radius-sm` on frame and image; the muted `sm` caption holds the Latin name at body size and the credit link.

### Season calendar

- **Calendar table (`/kalendar`):** a full-year table in `ScrollTable` with a legend above. The current-month column header is filled ultramarine. Level cells take the level fill (stamp red with `on-peak`, or a wash with `on-badge`) with a `LevelMark`; out-of-season cells are `text-muted`.
- **Produce calendar list:** 12 linked tiles (at least 2.75rem) with 2px gaps: underlined month abbreviation, mark, `sm` level label. Out-of-season tiles use `surface`. The current month gets the inset ultramarine ring and weight 700.
- **Garden row (spec 026):** under the produce calendar, when the growing guide names a month: a bold label „В градината“, then 12 unlinked cells on the same grid (12, 6 or 4 columns) with the month abbreviation and the activities („Сеитба“, „Разсаждане“, „Засаждане“) or a dash. Active cells take the `available` wash with `on-badge` text and a bold activity; never a frame, which means the current month one row above. Print: ink outlines, no wash.

### Province map (spec 026)

Under „Откъде“ on produce pages, and on the region pages (spec 029): a `figure` (max 30rem) with an inline SVG of the 28 provinces from Natural Earth (public domain), built by `scripts/map/build.ts`.

- **Fills:** marked provinces get a dense `accent` hatch with `surface` lines, so they are not marked by colour alone. Linked provinces that are not marked get a light hatch of thin `accent` lines on `rule`. The rest are plain `rule`. Borders are 1px `border`, so the country outline is at least 3:1 against the page.
- **Without links:** the SVG is an image named by its `<title>`.
- **With links:** the SVG is a named group, and the drawn provinces are hidden from assistive technology. The links are a separate layer drawn above every province, in Bulgarian name order. Hovering a link draws a 2px `text` outline; focusing it draws a 7px `surface` ring with a 3px `focus` ring inside, so focus is never covered by a neighbour.
- **Size and caption:** the SVG keeps a 320px attribute size without CSS. A muted `sm` caption says what is marked and credits Natural Earth.
- **Print:** marked provinces are printed in ink; the rest are unfilled, with ink borders.

### Farm pages (spec 030)

`/fermi` shows the `h1`, an intro and „Всички ферми (N)“, with the farm cards grouped organic first when any farm is certified. A farm card's name is a link to its page. A farm page is a single reading column:

- the `h1`;
- a muted meta row: the province as a link, plus outlined `border` tags for organic (with the certifier) and sponsored;
- the description at `lg`;
- „Какво продава“: rows on `rule` hairlines, each a bold `text` produce link with the season stamp for the build month (or muted „Извън сезона“) at the end;
- „Контакти“: links at least 2.75rem tall, then the address;
- „Източници“: host plus decoded path, wrapping anywhere.

### Region pages (spec 029)

`/regioni` shows the `h1`, an intro, the map with every province that has a page hatched and linked, and „Всички области“: an auto-fill grid (min 16rem) listing all 28 provinces on `rule` hairlines. Linked names are bold; provinces without data are muted, with „Още няма данни“. Counts are muted `sm`. A region page has the `h1` (the full name, e.g. „Софийска област“), the map with that province marked, then „Какво расте тук“ (bold `text` produce links, then „ – “ and the muted note) and „Местни ферми“ (farm cards). Page-level `h2`s use the shared `.section-heading` class: a 2px `text` rule under the heading, 2rem above it.

### Month pager

Previous and next links on opposite sides, each with a 1px `border` outline, `radius-sm`, padding 0.5rem 1rem, a muted `sm` direction label above the 600-weight month name.

### Farm card

A `surface` card, `radius-sm`, padding 1rem, in an 18rem auto-fill grid: name, a meta row of outlined tags (1px `border`, `radius-sm`), description, and contact links at least 2.75rem tall. Phone numbers do not wrap.

### Search

A no-JS form capped at the reading width: bold label, muted hint, then a wrapping row of input and button. The input has a 1px `border`, `background` fill, `radius-sm`, min-height 2.75rem. The button is solid ultramarine with `accent-text`, weight 600. Results have muted snippets with matched terms on the blue wash, followed by a browse list.

### Data tables

`ScrollTable` wraps every table: full width, collapsed borders, tabular figures, 0.5rem 0.75rem cell padding, a 1px `border` rule under each row, start-aligned headers, end-aligned numbers, bold start-aligned captions.

- **Nutrition bars (spec 026):** in the „% РСП“ column, a decorative 64 × 8px SVG bar after the percentage: a `rule` track filled `accent` up to the percentage, capped at 100. No bar without a reference intake. Print: outlined track with an ink fill.

### Navigation

- **Header (spec 023):** a `shell` bar with `on-shell` text: the logo "Сезон" in upright condensed capitals at `xl` (800, tracking 0.06em) and four links (600): Сега, Каталог, Календар, Търсене. Links are 44px tall; the current page has a 3px `focus-on-shell` underline, the area containing the page (Каталог for sections, produce, groups and nutrients; Календар for month pages) a dotted one. Focus rings on the shell use `focus-on-shell`. Logo and links share one row from about 380px; below, the nav wraps under the logo.
- **Skip link:** a `surface` box with a `text` border and text, shown on focus over the shell with a `focus-on-shell` ring.
- **Catalogue page (`/katalog`):** section cards on `shell` with `on-shell` text and a `border` edge (condensed capitals name, count below), then chip links for the botanical families (with counts) and the nutrients.
- **Breadcrumbs:** `sm` muted trail with "/" separators.
- **Footer:** `surface` band with a top `rule`. First the month links: 12 bordered cells (`border` edge, `background` fill, `text`), 3 per row, 4 from 23rem, 6 from 36rem, 12 from 64rem; the build month is `marker` with `on-marker` text, a `text` border and `aria-current="date"`; a focused cell rises above its neighbours so its ring shows. Then the calendar link, the disclaimer and the copyright in muted `sm`.

### Links and focus

Links are ultramarine and underlined (offset 0.2em); hover thickens the underline to 2px. Every focusable element shows a 3px solid `focus` outline at 2px offset. The skip link is a `surface` box with a `text` border that slides in on focus over the shell, with a `focus-on-shell` ring.

### Callout

The traditional-uses disclaimer: a `surface` panel with a 4px ultramarine inline-start bar, padding 0.75rem 1rem.

### Produce page (spec 025)

- **Table of contents:** a labelled `nav` („На тази страница“) under the header, linking the `h2` groups (and the `h3` „Внимание“ when present, spec 055), a wrapping row of chip links: 44px tall, `surface` fill, 1px `text` border, `text` colour, semibold, no underline (underline on hover). It is hidden in print.
- **Groups:** „На сергията“, „Яж“ and „Отгледай“ are `h2` groups with a 2px `text` top rule, full container width; their `h3` subsections keep the 42rem reading width.
- **Level now:** one large stamp (`lg`, tilted −3°, the only tilted stamp in the system) followed by „през <месец>“; out of season it is plain text „Извън сезона през <месец>“ with no stamp.
- **Farms link:** „На сергията“ ends with an in-page link to the farms section.
- **Cautions (spec 055):** when a produce has cautions, a „Внимание“ callout follows the level line, before „Сезон по месеци“. The whole section is one `surface` panel with a 4px `text` inline-start bar (the callout form in stencil ink, not ultramarine, so it is not read as the traditional-uses disclaimer), padding 0.75rem 1rem 1rem, capped at the reading width: inside it the `h3` „Внимание“, for wild produce the 600-weight gathering note, then the cautions under a 1px `rule` hairline. Each item is a 1.1em warning-triangle icon in `currentColor` (decorative, `aria-hidden`, 16px attributes so it stays small without CSS), the bold kind label with a colon, the text and the muted `sm` source in parentheses. No red or yellow: stamp red means „Разгар“ and marker yellow the current month. Not a live region. Print: no fill, ink bar, hairline and text. The table of contents lists this `h3` beside the `h2` groups on purpose, as safety content.
- **Wild label (spec 055):** „Диворастящо“ (neuter, for an implied „растение“) as an outlined tag (1px `border`, `radius-sm`, `text`) in the header meta and the card meta row; in the in-season list it is plain text after the kind („ · Диворастящо“).

## Do's and Don'ts

### Do:

- **Do** take every colour, space step, font size and radius from the custom properties generated by `src/design/tokens.ts`, and add every new colour pair to `tests/fixtures/contrastPairs.ts`.
- **Do** show the season level as a stamp (solid, outlined or hatched, always with its word) or a year-strip cell in the same forms; in the calendars, as fill + `LevelMark` + text label.
- **Do** set headings in Sofia Sans Extra Condensed 800 through the global `h1`–`h3` rule, and mark Latin names with `lang="la"` so they render in Sofia Sans italic.
- **Do** keep links and controls at least 2.75rem tall (`--target-min`), and never under 24px in compact list rows, with the 3px `focus` outline (`focus-on-shell` inside the shell).
- **Do** cap prose at `--reading-width` (42rem) and the page at `--content-width` (72rem).
- **Do** use `rule` for decorative hairlines and `border` for control and data boundaries.
- **Do** give every season graphic a print form in `--print-ink` that keeps the level legible without fills.

### Don't:

- **Don't** use stamp red for anything but „Разгар“, or marker yellow for anything but the current month.
- **Don't** set body text, navigation, lists or tables in the condensed face or in capitals.
- **Don't** add shadows, tonal gradients or elevated surfaces, and don't add motion beyond the reduced-motion guard.
- **Don't** tilt stamps in lists; only the large stamp at the top of the produce page is tilted.
- **Don't** convey the season level by colour alone.
- **Don't** run the hatch under a stamp's word; the word always sits on a solid ground.
- **Don't** add prices, calls to buy or shop styling to produce; the stamps mark origin and season, not a sale.
- **Don't** use `rule` for text or control boundaries; it is below 3:1 by design.
- **Don't** reorder content with CSS. Pages must read in source order without styles.
