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
  display:
    fontFamily: "'Sofia Sans Extra Condensed', 'Arial Narrow', sans-serif"
    fontSize: 'min(clamp(4.5rem, 1rem + 15vw, 13.5rem), 16.5vw)'
    fontWeight: 800
    lineHeight: 0.85
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
  season-badge-peak:
    backgroundColor: '{colors.peak}'
    textColor: '{colors.on-peak}'
    typography: '{typography.label}'
    rounded: '{rounded.radius-sm}'
    padding: '0.25rem 0.5rem'
  season-badge-available:
    backgroundColor: '{colors.available}'
    textColor: '{colors.on-badge}'
    typography: '{typography.label}'
    rounded: '{rounded.radius-sm}'
    padding: '0.25rem 0.5rem'
  season-badge-storage:
    backgroundColor: '{colors.storage}'
    textColor: '{colors.on-badge}'
    typography: '{typography.label}'
    rounded: '{rounded.radius-sm}'
    padding: '0.25rem 0.5rem'
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
  year-ribbon-month:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text-muted}'
    height: '2.75rem'
  year-ribbon-month-current:
    backgroundColor: '{colors.accent}'
    textColor: '{colors.accent-text}'
    height: '2.75rem'
  month-pager-link:
    textColor: '{colors.accent}'
    rounded: '{rounded.radius-sm}'
    padding: '0.5rem 1rem'
    height: '2.75rem'
  site-header:
    backgroundColor: '{colors.background}'
    textColor: '{colors.text}'
  site-footer:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-muted}'
    padding: '2rem 0'
---

# Design System: Sezon

## Overview

**Creative North Star: "The Stamp of Origin"**

The north star is the owner's chosen direction recorded in ADR-0006: stencilled produce crates and the rubber stamps of origin and grade on them, translated into a working interface for a shopper at the stall, on a phone. The world is ultramarine stamp ink on near-white label paper, stencil-black text, condensed heavy capitals for names and headings, and a plain humanist sans for everything that is read or operated. Stamp red is spent on one thing, the „Разгар“ (peak) level, and one marker yellow is reserved for the current month. Dark mode is its own scale, a deep ink-blue ground with lighter stamp inks, not an inversion.

The world is calm by decision. Capitals appear only in headings and (once built) stamps, the surfaces are flat, separation comes from hairline rules, and there is no motion beyond the global reduced-motion guard. Density is moderate: the content column is capped at 72rem, prose at 42rem, and sections are separated by 2–4rem.

This file describes the system as built after slice 1 (spec 022, tokens and typography). The palette, the faces and the global heading styles are shipped. The components below still carry their pre-redesign layouts, now rendered in the new tokens; the shell (#92), the season stamp and year strip (#93), the produce page (#94) and the data visuals (#95) are later slices. Anything marked **planned** is decided in ADR-0006 but not yet in the code. Tokens are generated from `src/design/tokens.ts` and inlined as CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`, `--radius-*`, and others); light values sit on `:root` and dark values override them under `prefers-color-scheme: dark`.

**Key Characteristics:**

- Sofia Sans Extra Condensed 800 in capitals for headings; Sofia Sans for body, navigation, lists and tables.
- Latin names in Sofia Sans italic 400, through the global `[lang='la']` rule.
- Ultramarine ink on label paper; stamp red only for „Разгар“; marker yellow only for the current month.
- Season level = fill + SVG mark + Bulgarian text label, never colour alone.
- Flat surfaces and hairline rules, no shadows, no motion.
- One small corner radius (0.375rem) on every rounded element.
- Touch targets of at least 2.75rem on primary links and controls.

## Colors

Stamp inks on label paper: one ultramarine for the shell, links and actions, one stamp red for the peak level, one marker yellow for "now", and cool blue-grey neutrals. The `-dark` keys in the frontmatter are the `prefers-color-scheme: dark` overrides of the same role.

### Primary

- **Stamp Ultramarine** (`accent`): links (the base `a` colour), the search submit button, the skip link, the active header navigation item, the current month in the year ribbon and the calendar table header, the current-month ring in a produce's calendar, and the 4px bar of the traditional-uses disclaimer. In dark mode it becomes a light periwinkle ink.
- **On Ultramarine** (`accent-text`): text on ultramarine fills; white in light mode, ink-blue ground in dark mode.
- **Shell Ultramarine** (`shell`), **On Shell** (`on-shell`), **Focus On Shell** (`focus-on-shell`): the stamp-blue header bar, its text and its focus ring. In light mode `shell` equals `accent`; in dark mode it is a deeper blue so white text stays strong. **Planned in #92:** the tokens exist and are contrast-tested, but the header still renders on `background`.

### Secondary

- **Stamp Red** (`peak`): the „Разгар“ level only: season badges, produce-calendar tiles and calendar-table cells at peak. In dark mode it lightens to a coral red.
- **On Stamp Red** (`on-peak`): text and the `LevelMark` on stamp red; white in light mode, ink-blue ground in dark mode.

### Tertiary

- **Marker Yellow** (`marker`), **On Marker** (`on-marker`): the highlight reserved for the current month. **Planned in #93:** no component uses it yet; the current month is still marked with ultramarine. It is a fill under `on-marker` text only, never a line on the light page (1.69:1 against `background`).
- **Blue Wash** (`available`): the light tint for „В сезон“ (badges, calendar tiles and cells) and the highlight behind matched terms in search results.
- **Lilac Wash** (`storage`): the light tint for „От хранилище“.
- **On Wash** (`on-badge`): text on either wash; equals `text`.

The two washes are interim: spec 022 keeps them as light tints with ink text until the season stamp (#93) replaces them with outlined and hatched forms.

### Neutral

- **Label Paper** (`background`): the page, sticky row headers in the calendar table, the header bar (until #92), the year ribbon and the search input field.
- **Label White** (`surface`): plates, the produce photo frame, farm cards, empty calendar tiles, the disclaimer callout and the footer. In light mode it is brighter than the page; in dark mode it is a lifted ink-blue.
- **Stencil Black** (`text`): body text, headings, the logo, navigation and produce-name links.
- **Faded Ink** (`text-muted`): meta lines, captions, hints, breadcrumbs, the footer body, out-of-season calendar cells and non-current ribbon months.
- **Pad Grey** (`border`): control and data boundaries (inputs, pager links, farm tags, table row rules); at least 3:1 against page and surface.
- **Hairline** (`rule`): decorative hairlines only (header and footer edges, ribbon dividers, index-row separators). Never text or a control boundary.
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

`rule` has no minimum because it is decorative only. Every pair above is in `tests/fixtures/contrastPairs.ts` and checked in both schemes.

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

- **Display** (condensed 800, `display` token capped at `min(…, 16.5vw)`, line-height 0.85): appears once, as the month word in the home hero `h1`, with a Sofia Sans `lg` 500 lead line ("В сезон през") above it in the same heading.
- **Headline** (condensed 800 capitals, `3xl`, line-height 0.95): the produce name on a produce page.
- **Title-lg** (condensed 800 capitals, `2xl`, 1.15, tracking 0.02em, `text-wrap: balance`): every other `h1`.
- **Title** (condensed 800 capitals, `xl`, 1.15, tracking 0.02em): `h2`, and produce-plate names.
- **Title-sm** (condensed 800 capitals, `lg`, 1.15, tracking 0.02em): `h3`, index-row names.
- **Lede** (Sofia Sans 400, `lg`): page intros, produce summaries, group descriptions; capped at the 42rem reading width.
- **Body** (Sofia Sans 400, 1.0625rem / 1.55, `text-wrap: pretty`): running text, capped at `--reading-width` (42rem); plate summaries at 42ch.
- **Label** (Sofia Sans, `sm` 0.9375rem): meta lines, captions, hints, breadcrumbs, footer. Weight 600 on season badges, pager links and the search button; navigation 500; captions and the current month 700.
- **Latin name** (Sofia Sans italic 400, through `[lang='la']`): wherever a Latin name appears, often one step larger (`lg`) than its meta line.

### Named Rules

**The Capitals Are Headings Rule.** Sofia Sans Extra Condensed in capitals is for the logo, `h1`–`h3` and (planned, #93) stamps. Capitals come from `text-transform`, so the source text and reading order are unchanged without CSS. Body, navigation, lists and tables stay in Sofia Sans, in sentence case.

**The One Weight Rule.** The condensed face exists at 800 only. Never set it at another weight or in italic; the browser would synthesise it.

**The Tabular Rule.** Every table uses `font-variant-numeric: tabular-nums`.

**Known drift, not part of the system:** the muted "Табло XI от XII" line above the home heading is a leftover eyebrow from the old design. The page slice (#94) removes it; it is not a pattern to copy.

## Layout

- **Container:** one centred column, `min(100% − 2rem, 72rem)`. Header, breadcrumbs, main and footer all use it; there is no sidebar.
- **Reading width:** 42rem for prose, ledes, search and the footer disclaimer. Tables and calendars opt out.
- **Spacing rhythm:** a rem scale of steps 1, 2, 3, 4, 6, 8, 12, 16 (0.25–4rem). Within a block 0.25–0.75rem; between sections 1.5–2rem; before group headings and the month pager 3rem; before the footer 4rem.
- **Grids:** produce plates use `auto-fill, minmax(min(100%, 20rem), 1fr)` with a 1rem gap; farm cards the same at 18rem. Index lists are one column, two from 40rem. The footer month list is `auto-fill, minmax(7.5rem, 1fr)`.
- **Year ribbon:** 12 equal columns, 6 under 40rem. The produce calendar: 12, 6 under 60rem, 4 under 40rem, 2px gaps.
- **Produce page header:** one column; from 48rem, with a photo, a 3fr/2fr grid with the photo on the right.
- **Breakpoints in use:** 40rem, 48rem and 60rem, as literals in each component.
- **Wide tables** scroll horizontally inside `ScrollTable`; the calendar table's row headers are sticky on the inline start.
- **Print:** header, footer, skip link and breadcrumbs are hidden; the calendar prints in black ink without fills, with the current month underlined.

## Elevation & Depth

The system is flat, like ink on paper. No element casts a shadow. Depth is two tonal layers, the label-paper page and the `surface` panels (plates, photo frame, farm cards, disclaimer, footer), plus 1px `rule` hairlines. The only `box-shadow` is a structural inset double ring (`inset 0 0 0 2px background, inset 0 0 0 5px accent`) that outlines the current month in a produce's calendar; it draws a line, not elevation.

**The Ink On Paper Rule.** Surfaces never lift. A panel is set apart by its tone or a hairline, never by a shadow or gradient.

## Shapes

All rounded elements use one small radius, `radius-sm` (0.375rem): plates and their photos, farm cards and tags, season badges, pager links, the search input and button, and the skip link. Plate photos are cropped 4:3; the produce-page photo keeps its ratio inside a 0.75rem mat. Rules are 1px; the disclaimer has a 4px ultramarine inline-start bar. Season marks are 16×16 viewBox SVGs at 1em: a five-point star (peak), a filled circle (available), a half-filled circle (storage), an empty circle (out of season).

**Planned in #93, not yet built:** the season stamp form language (solid, outlined, hatched) described under Components.

## Components

Every component below is built and renders in the new tokens; layouts are unchanged from before the redesign until their slice ships.

### Season badge

The current level signal: an inline pill holding a `LevelMark` and the Bulgarian label.

- **Shape:** `radius-sm`, padding 0.25rem 0.5rem, gap 0.25rem; label style 600, line-height 1.2.
- **Colour:** „Разгар“ is solid stamp red with `on-peak` text and mark; „В сезон“ and „От хранилище“ are the blue and lilac washes with `on-badge` text.
- **Variant:** with `fromMonth`, the label reads "from <month>: <level>".

### Season stamp (signature, planned in #93, not yet built)

ADR-0006's signature move. The level becomes a stamp whose form carries the meaning: **solid** „Разгар“, **outlined** „В сезон“, **hatched** „От хранилище“; out of season has no stamp, only the words. The text label is always present. Stamps stand upright in lists; only the large stamp at the top of the produce page is tilted. It will replace the season badge and the two washes.

### Year strip (planned in #93, not yet built)

A 12-month strip using the same three stamp forms, with the current month outlined in marker yellow. Until then the year ribbon and the produce calendar below remain.

### Produce plate (card)

- **Plate variant:** `surface` panel, `radius-sm`, padding 1.5rem 1rem 1rem, min-height 13rem: a 4:3 decorative photo, the name (condensed capitals `xl`, `text`, underlined link at least 2.75rem tall), a meta row (Latin name italic, kind, badge), and a muted summary capped at 42ch.
- **Index variant:** no panel; a name | badge row over a 1px `rule` hairline, name at `lg`.

### Produce photo (plate frame)

A `figure` on `surface` with a 0.75rem mat and `radius-sm` on frame and image; the muted `sm` caption holds the Latin name at body size and the credit link.

### Season calendar

- **Calendar table (`/kalendar`):** a full-year table in `ScrollTable` with a legend above. The current-month column header is filled ultramarine. Level cells take the level fill (stamp red with `on-peak`, or a wash with `on-badge`); out-of-season cells are `text-muted`.
- **Produce calendar list:** 12 linked tiles (at least 2.75rem) with 2px gaps: underlined month abbreviation, mark, `sm` level label. Out-of-season tiles use `surface`. The current month gets the inset ultramarine ring and weight 700.

### Year ribbon (home)

A 12-cell strip between `rule` hairlines with `rule` dividers. Months are `text-muted` without underline, turning `text` with an underline on hover. The current month is a solid ultramarine cell, weight 700, in `accent-text`.

### Month pager

Previous and next links on opposite sides, each with a 1px `border` outline, `radius-sm`, padding 0.5rem 1rem, a muted `sm` direction label above the 600-weight month name.

### Farm card

A `surface` card, `radius-sm`, padding 1rem, in an 18rem auto-fill grid: name, a meta row of outlined tags (1px `border`, `radius-sm`), description, and contact links at least 2.75rem tall. Phone numbers do not wrap.

### Search

A no-JS form capped at the reading width: bold label, muted hint, then a wrapping row of input and button. The input has a 1px `border`, `background` fill, `radius-sm`, min-height 2.75rem. The button is solid ultramarine with `accent-text`, weight 600. Results have muted snippets with matched terms on the blue wash, followed by a browse list.

### Data tables

`ScrollTable` wraps every table: full width, collapsed borders, tabular figures, 0.5rem 0.75rem cell padding, a 1px `border` rule under each row, start-aligned headers, end-aligned numbers, bold start-aligned captions.

### Navigation

- **Header (as built):** a `background` bar with a `rule` bottom hairline, the logo "Сезон" in upright condensed capitals at `xl` (800, tracking 0.06em), and a wrapping list of underlined `text` links (500). The current page is ultramarine with a 3px underline; a section ancestor gets a dotted underline. Under 60rem the nav drops to `sm` with 2.25rem links. **Planned in #92:** the bar moves to `shell` with `on-shell` text and `focus-on-shell` focus rings.
- **Breadcrumbs:** `sm` muted trail with "/" separators.
- **Footer:** `surface` band with a top `rule`, holding the month grid of ultramarine links, the calendar link, the disclaimer and the copyright in muted `sm`.

### Links and focus

Links are ultramarine and underlined (offset 0.2em); hover thickens the underline to 2px. Every focusable element shows a 3px solid `focus` outline at 2px offset. The skip link is an ultramarine pill that slides in on focus.

### Callout

The traditional-uses disclaimer: a `surface` panel with a 4px ultramarine inline-start bar, padding 0.75rem 1rem.

## Do's and Don'ts

### Do:

- **Do** take every colour, space step, font size and radius from the custom properties generated by `src/design/tokens.ts`, and add every new colour pair to `tests/fixtures/contrastPairs.ts`.
- **Do** show the season level as fill (or, from #93, stamp form) + `LevelMark` + text label; use `on-peak` on stamp red and `on-badge` on the washes.
- **Do** set headings in Sofia Sans Extra Condensed 800 through the global `h1`–`h3` rule, and mark Latin names with `lang="la"` so they render in Sofia Sans italic.
- **Do** keep links and controls at least 2.75rem tall (`--target-min`), with the 3px `focus` outline (`focus-on-shell` inside the shell).
- **Do** cap prose at `--reading-width` (42rem) and the page at `--content-width` (72rem).
- **Do** use `rule` for decorative hairlines and `border` for control and data boundaries.

### Don't:

- **Don't** use stamp red for anything but „Разгар“, or marker yellow for anything but the current month.
- **Don't** set body text, navigation, lists or tables in the condensed face or in capitals.
- **Don't** add shadows, gradients or elevated surfaces, and don't add motion beyond the reduced-motion guard.
- **Don't** tilt stamps in lists; only the large stamp at the top of the produce page is tilted.
- **Don't** convey the season level by colour alone.
- **Don't** add prices, calls to buy or shop styling to produce; the stamps mark origin and season, not a sale.
- **Don't** use `rule` for text or control boundaries; it is below 3:1 by design.
- **Don't** reorder content with CSS. Pages must read in source order without styles.
