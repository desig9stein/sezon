---
name: Sezon
description: What grows in Bulgaria this month, set as a botanical atlas.
colors:
  background: '#ffffff'
  surface: '#eef3ea'
  text: '#16241b'
  text-muted: '#4a5b50'
  accent: '#8a1c3f'
  accent-text: '#ffffff'
  border: '#7c8c80'
  rule: '#c9d2c6'
  focus: '#1f5fa8'
  peak: '#b9dca3'
  available: '#dfe9c8'
  storage: '#dcd6e6'
  on-badge: '#16241b'
  background-dark: '#111a14'
  surface-dark: '#1a251e'
  text-dark: '#e7eee6'
  text-muted-dark: '#a8b8ac'
  accent-dark: '#f29ab2'
  accent-text-dark: '#2a0b16'
  border-dark: '#6f8174'
  rule-dark: '#2c3a31'
  focus-dark: '#8cc2ff'
  peak-dark: '#446f3b'
  available-dark: '#3f5a3a'
  storage-dark: '#4a4560'
  on-badge-dark: '#f1f5ef'
typography:
  display:
    fontFamily: 'Piazzolla, Georgia, serif'
    fontSize: 'clamp(4.5rem, 1rem + 15vw, 13.5rem)'
    fontWeight: 600
    lineHeight: 0.82
    letterSpacing: '-0.035em'
  headline:
    fontFamily: 'Piazzolla, Georgia, serif'
    fontSize: 'clamp(3.5rem, 2rem + 6vw, 6.5rem)'
    fontWeight: 600
    lineHeight: 0.95
    letterSpacing: '-0.03em'
  title-lg:
    fontFamily: 'Piazzolla, Georgia, serif'
    fontSize: 'clamp(1.6rem, 1.3rem + 1.4vw, 2.2rem)'
    fontWeight: 600
    lineHeight: 1.15
  title:
    fontFamily: 'Piazzolla, Georgia, serif'
    fontSize: 'clamp(1.5rem, 1.25rem + 1vw, 2.1rem)'
    fontWeight: 600
    lineHeight: 1.15
  lede:
    fontFamily: 'Sofia Sans, system-ui, sans-serif'
    fontSize: 'clamp(1.25rem, 1.1rem + 0.6vw, 1.6rem)'
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: 'Sofia Sans, system-ui, sans-serif'
    fontSize: '1.0625rem'
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: 'Sofia Sans, system-ui, sans-serif'
    fontSize: '0.9375rem'
    fontWeight: 600
    lineHeight: 1.2
  latin-binomial:
    fontFamily: 'Piazzolla, Georgia, serif'
    fontSize: '1.0625rem'
    fontWeight: 400
rounded:
  radius-sm: '0.375rem'
  radius-md: '0.75rem'
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
    textColor: '{colors.on-badge}'
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
  site-footer:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.text-muted}'
    padding: '2rem 0'
---

# Design System: Sezon

## Overview

**Creative North Star: "The Botanical Atlas"**

The north star is the owner's chosen direction recorded in ADR-0004: each page is a plate in an atlas. A large serif name sits over its italic Latin binomial, with a photograph mounted on a pale sage panel and precise tabular data below. The home page carries the system's one loud gesture: the current month name set as a giant Piazzolla display word over a twelve-cell year ribbon. Everything else is quiet. The sheet is white (or deep forest green in dark mode), the type is dark green ink, and the hairlines are pale.

Density is moderate and editorial. The content column is capped at 72rem, prose at 42rem, and sections are separated by generous vertical space (3rem between groups, 4rem before the footer). There are no shadows, gradients or motion. Depth comes from two tonal layers, the page and the sage plate. Colour carries meaning in two places only: carmine marks "now" and links, and three pale season tints carry the season level, always alongside a text label and an SVG mark.

Light and dark palettes are both first-class. They switch with `prefers-color-scheme` and nothing else. Every text, focus and border pair is unit-tested for WCAG AA contrast with `src/design/contrast.ts`. Tokens are generated from `src/design/tokens.ts` and inlined as CSS custom properties (`--color-*`, `--space-*`, `--font-size-*`, `--radius-*`, and others).

**Key Characteristics:**

- Serif display (Piazzolla) for names and headings; humanist sans (Sofia Sans) for everything read or operated.
- Latin binomials are always Piazzolla italic, through the global `[lang='la']` rule.
- Flat surfaces: white page, sage plates, pale hairline rules, no shadows.
- One accent (carmine) for links, the current month and primary actions.
- Season level = tint + SVG mark + Bulgarian text label, never colour alone.
- Small, uniform corner radius (0.375rem) on every rounded element.
- Touch targets of at least 2.75rem on primary links and controls.

## Colors

A green-ink-on-white herbarium palette with a single carmine accent and three pale season tints. Every colour has a light and a dark value. The `-dark` keys in the frontmatter are the `prefers-color-scheme: dark` overrides of the same role.

### Primary

- **Carmine** (`accent`): the only accent. Used for links (the base `a` colour), the current month in the year ribbon and the calendar table header, the current-month ring in a produce's calendar, the search submit button, the skip link, the active header nav item, and the left rule of the traditional-uses disclaimer. In dark mode it becomes a light rose, and text on it becomes near-black wine (`accent-text-dark`).
- **On Carmine** (`accent-text`): text on carmine fills (white in light mode, wine in dark mode).

### Tertiary (season tints)

- **Peak** (`peak`): sage green tint for "в разгара на сезона"; badges, calendar cells and table cells.
- **Available** (`available`): pale lime tint for "в сезон"; also the highlight behind matched terms in search results (`<mark>`).
- **Storage** (`storage`): pale lavender tint for "от хранилище" (from storage).
- **On Badge** (`on-badge`): text on any season tint. Same as ink in light mode, `#f1f5ef` in dark mode.

### Neutral

- **Herbarium** (`background`): the page sheet, sticky row headers in the calendar table, and the search input field.
- **Plate** (`surface`): sage panel behind produce plates, the produce photo frame, farm cards, empty calendar cells, the traditional-uses disclaimer and the footer.
- **Ink** (`text`): body text, headings, the logo and produce-name links.
- **Graphite** (`text-muted`): meta lines, captions, hints, breadcrumbs, the footer body, and non-current year-ribbon months.
- **Border** (`border`): control and data boundaries (inputs, month-pager links, farm tags, table row rules). At least 3:1 against the page.
- **Rule** (`rule`): decorative hairlines only (header and footer edges, ribbon dividers, index-row separators). Never used for text or control boundaries.
- **Focus** (`focus`): the 3px focus outline, in blue so it stays distinct from carmine.

### Contrast (computed with `contrastRatio` from `src/design/contrast.ts`)

| Pair                    | Light | Dark  |
| ----------------------- | ----- | ----- |
| text on background      | 16.13 | 15.04 |
| text on surface         | 14.32 | 13.39 |
| textMuted on background | 7.23  | 8.56  |
| textMuted on surface    | 6.42  | 7.62  |
| accent on background    | 9.06  | 8.50  |
| accent on surface       | 8.04  | 7.56  |
| accentText on accent    | 9.06  | 8.67  |
| onBadge on peak         | 10.62 | 5.32  |
| onBadge on available    | 12.77 | 6.96  |
| onBadge on storage      | 11.37 | 8.24  |
| focus on background     | 6.44  | 9.54  |
| focus on surface        | 5.72  | 8.50  |
| border on background    | 3.55  | 4.29  |
| border on surface       | 3.15  | 3.82  |
| rule on background      | 1.55  | 1.49  |

`rule` has no contrast minimum because it is decorative only.

### Named Rules

**The Carmine Means Now Rule.** Carmine marks links, the current month and primary actions (plus the disclaimer bar). Green is reserved for the season tints and is never used as a site-wide brand tint.

**The Three Signals Rule.** A season level is always shown as tint, `LevelMark` SVG (star for peak, filled circle for available, half-filled circle for storage, empty circle for out of season) and a text label together.

**The Tested Pair Rule.** A colour is used on a background only when that pair is in the tested contrast set above. Use tokens only; components contain no literal colours.

## Typography

**Display Font:** Piazzolla variable (wght 400–600, roman and italic), with Georgia, serif
**Body Font:** Sofia Sans variable (wght 400–700, roman only), with system-ui, sans-serif

**Character:** Piazzolla is a sturdy text serif. At display sizes it reads like engraved plate titles, and its italic carries Latin names. Sofia Sans is a Bulgarian-designed humanist sans and uses Bulgarian Cyrillic letterforms by default (Piazzolla switches to them through `locl` under `lang="bg"`).

Both families are self-hosted through the Astro Fonts API (`fontProviders.local()`), as WOFF2 subsets generated by `pnpm fonts:build` from `src/design/fontSubsets.mjs`. There are two subsets per face. Latin: ASCII, Latin-1 symbols, general punctuation, € and minus. Cyrillic: U+0400–045F and №. Accented Latin letters fall back to the system font. Only the upright faces are preloaded. Metric-adjusted fallbacks come from the Fonts API.

### Hierarchy

- **Display** (Piazzolla 600, `display` token capped at `min(…, 16.5vw)`, line-height 0.82, tracking −0.035em, capitalised): appears only once, as the month word in the home hero. A Sofia Sans `lg` 500 lead line ("В сезон през") sits above it inside the same `h1`.
- **Headline** (Piazzolla 600, `3xl`, line-height 0.95, tracking −0.03em): the produce name on a produce page.
- **Title-lg** (Piazzolla 600, `2xl`, 1.15, `text-wrap: balance`): every other `h1` and all `h2`.
- **Title** (Piazzolla 600, `xl`, 1.15): `h3`, produce-plate names, the logo (italic). Index-row names and calendar row-group headers use `lg`.
- **Lede** (Sofia Sans 400, `lg`): page intros, produce summaries, group descriptions. The home intro is capped at 34ch, other ledes at the 42rem reading width.
- **Body** (Sofia Sans 400, 1.0625rem / 1.55, `text-wrap: pretty`): running text. Prose blocks are capped at `--reading-width` (42rem), plate summaries at 42ch.
- **Label** (Sofia Sans, `sm` 0.9375rem): meta lines, captions, hints, breadcrumbs, footer. Weight 600 on season badges and pager links. Navigation uses 500. Captions, `dt` and the current ribbon month use 700.
- **Latin binomial** (Piazzolla italic 400, through `[lang='la']`): wherever a Latin name appears, often one step larger (`lg`) than its meta line.

### Named Rules

**The Two Voices Rule.** Piazzolla names things (headings, produce names, the month, Latin binomials, search-result titles). Sofia Sans says and operates everything else.

**The Tabular Rule.** Every table uses `font-variant-numeric: tabular-nums`.

## Layout

- **Container:** one centred column, `min(100% − 2rem, 72rem)` (`.container`). The header, breadcrumbs, main and footer all use it. The layout has no sidebar.
- **Reading width:** 42rem for prose sections, ledes, search and the footer disclaimer. Wide sections (tables, calendars) opt out.
- **Spacing rhythm:** a rem scale of steps 1, 2, 3, 4, 6, 8, 12, 16 (0.25–4rem). Within a block: 0.25–0.75rem. Between sections on a page: 2rem (produce page) or 1.5rem (nutrient page). Before group headings and the month pager: 3rem. Before the footer: 4rem.
- **Grids:** produce plates use `auto-fill, minmax(min(100%, 20rem), 1fr)` with a 1rem gap (three columns at desktop, one on mobile). Farm cards use the same pattern at 18rem. Index lists are one column, or two columns (2rem gutter) from 40rem. The footer month list is `auto-fill, minmax(7.5rem, 1fr)`.
- **Year ribbon:** 12 equal columns, 6 under 40rem. The produce calendar uses 12, 6 under 60rem and 4 under 40rem, with a 2px gap.
- **Produce page header:** single column. From 48rem, when a photo exists, it becomes a 3fr/2fr grid with the title and meta full-width and the photo in the right column.
- **Breakpoints in use:** 40rem, 48rem and 60rem, written as literals in each component (max-width in header, ribbon and calendars; min-width in group lists and the produce header).
- **Wide tables** scroll horizontally inside `ScrollTable` (calendar table `min-width` 40rem, ranking table 36rem, nutrition table 18rem). The calendar table's row headers are sticky on the inline start.
- **Print:** header, footer, skip link and breadcrumbs are hidden. The calendar prints on A4 landscape with black ink, no tints, and the current month underlined.

## Elevation & Depth

The system is flat. No element casts a shadow. Depth is tonal: the white (or forest) page, and sage `surface` panels for plates, the photo frame, farm cards, the disclaimer callout and the footer. Separation otherwise comes from 1px `rule` hairlines. The only `box-shadow` in the codebase is a structural inset double ring (`inset 0 0 0 2px background, inset 0 0 0 5px accent`) that marks the current month in a produce's season calendar. It draws an outline, not elevation.

**The Flat Plate Rule.** Surfaces never lift. A panel is distinguished only by the `surface` tint, never by shadow.

## Shapes

All rounded elements use one small radius: `radius-sm` (0.375rem). This covers plates, photos inside plates, farm cards, farm tags, season badges, pager links, the search input and button, and the skip link. `radius-md` (0.75rem) is defined but not used anywhere. Photographs are cropped 4:3 (`object-fit: cover`) in plates. The produce page photo keeps its own ratio inside a 0.75rem sage mat. Rules are 1px. The traditional-uses disclaimer has a 4px carmine inline-start bar. Season marks are 16×16 viewBox SVGs sized at 1em: a five-point star, a filled circle, a half-filled circle and an empty circle.

## Components

### Season badge

The core signal of the system. An inline pill holding a `LevelMark` and the Bulgarian label.

- **Shape:** `radius-sm`, padding 0.25rem 0.5rem, gap 0.25rem.
- **Colour:** tint by `data-level` (peak / available / storage), text `on-badge`. Label style, 600, line-height 1.2.
- **Variant:** with `fromMonth`, the label reads "from <month>: <level>".

### Produce plate (card)

- **Plate variant:** sage `surface` panel, `radius-sm`, padding 1.5rem 1rem 1rem, min-height 13rem. Contents in order: a 4:3 photo (decorative, `radius-sm`), the name (Piazzolla `xl`, ink, underlined link, at least 2.75rem tall), a meta row (Latin binomial italic, kind, badge), and a muted summary capped at 42ch.
- **Index variant:** no panel. A two-column row (name | badge) separated by a 1px `rule` bottom hairline. The name is `lg`.

### Produce photo (plate frame)

A `figure` on sage `surface` with a 0.75rem mat and `radius-sm` on both frame and image. The caption row (muted, `sm`) holds the Latin name at body size and the photo credit link in graphite.

### Season calendar

- **Calendar table (`/kalendar`):** a full-year table in `ScrollTable`. Row groups (produce groups) have Piazzolla `lg` headers. The current-month column header is filled carmine. Level cells are filled with the season tint, and out-of-season cells are graphite. A legend list sits above the table.
- **Produce calendar list:** 12 tiles with 2px gaps. Each tile is a link (at least 2.75rem) with an underlined month abbreviation, a mark and the level label at `sm`. Out-of-season tiles use `surface`. The current month gets the inset carmine ring and weight 700.

### Year ribbon (home)

A 12-cell strip between top and bottom `rule` hairlines with `rule` dividers. Months are graphite with no underline and turn ink with an underline on hover. The current month is a solid carmine cell with weight 700 in `accent-text`.

### Month pager

Previous and next links on opposite sides. Each link has a 1px `border` outline, `radius-sm` and padding 0.5rem 1rem, with a muted `sm` direction label above the 600-weight month name.

### Farm card

A sage `surface` card, `radius-sm`, padding 1rem, in an 18rem auto-fill grid. Inside: the farm name, a meta row with outlined tags (1px `border`, `radius-sm`; placeholder farms carry a visible tag), a description, and contact links at least 2.75rem tall. Phone numbers do not wrap.

### Search

A no-JS form (`/tarsene`) capped at the reading width. Elements in order: a bold label, a muted hint, then a wrapping row of an input and a button. The input has a 1px `border`, `background` fill, `radius-sm` and min-height 2.75rem. The button is solid carmine with `accent-text`, weight 600 and `radius-sm`. In results, titles are Piazzolla `lg` links, snippets are muted, and matched terms are highlighted with the `available` tint. A browse list of section links follows.

### Data tables

`ScrollTable` wraps every table: full width, collapsed borders, tabular figures, 0.5rem 0.75rem cell padding, a 1px `border` bottom rule per row, start-aligned headers and end-aligned numeric cells. Captions are bold and start-aligned.

### Navigation

- **Header:** white bar with a `rule` bottom hairline. The logo "Сезон" is Piazzolla italic 600 at `xl` in ink, not underlined. The nav is a wrapping list of underlined ink links (500). The current page is carmine with a 3px underline, and a section ancestor (`aria-current="true"`) gets a dotted underline. Under 60rem the nav drops to `sm`, with 2.25rem link height.
- **Breadcrumbs:** `sm` muted trail with "/" separators.
- **Footer:** sage `surface` band with a top `rule`. It holds the "Какво е в сезон през" month grid of carmine links, the calendar link, the disclaimer at reading width and the copyright, all in muted `sm`.

### Links and focus

Links are carmine and underlined (offset 0.2em). Hover thickens the underline to 2px. Every focusable element shows a 3px solid `focus` outline at 2px offset. The skip link is a carmine pill that slides in on focus.

### Callout

The traditional-uses disclaimer is the system's one callout: a `surface` panel with a 4px carmine inline-start bar and padding 0.75rem 1rem.

## Do's and Don'ts

### Do:

- **Do** take every colour, space step, font size and radius from the custom properties generated by `src/design/tokens.ts`, and add any new colour pair to the contrast tests.
- **Do** show season level as tint + `LevelMark` + text label, using `on-badge` text on the tint.
- **Do** set produce and section names in Piazzolla 600, and Latin binomials with `lang="la"` so they render in Piazzolla italic.
- **Do** frame produce imagery as a plate: sage `surface` panel, `radius-sm`, photo inside.
- **Do** keep links and controls at least 2.75rem tall (`--target-min`), with the 3px `focus` outline.
- **Do** cap prose at `--reading-width` (42rem) and the page at `--content-width` (72rem).
- **Do** use `rule` for decorative hairlines and `border` for control and data boundaries.

### Don't:

- **Don't** add shadows, gradients or elevated surfaces. The system is flat and tonal.
- **Don't** use carmine beyond its incumbent roles: links, the current month, primary actions (search button, skip link) and the disclaimer bar.
- **Don't** convey season level by colour alone.
- **Don't** use `rule` for text or for control boundaries. It is below 3:1 by design.
- **Don't** introduce a second display moment like the home month word. The display size appears once.
- **Don't** use radii other than `radius-sm`.
- **Don't** reorder content with CSS. Pages must read in source order without styles.
