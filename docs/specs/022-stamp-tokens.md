# 022. Stamp-of-origin tokens and typography

- **Status:** Approved
- **Bounded context(s):** design system (`src/design/`, `src/styles/base.css`, layout fonts)
- **Related:** issue #91 (slice 1 of #82), ADR-0006, ADR-0005, specs 012, 015

## 1. Goal

Replace the botanical-atlas palette and type with the stamp-of-origin world chosen in ADR-0006,
as tokens and global styles only, so the later slices (shell, list, produce page, visuals)
build on it. The site stays WCAG AA in both colour schemes and within the font budget.

## 2. User stories

- As a shopper, I want the site to read clearly in daylight and in dark mode, with headings that
  stand out and body text that stays easy to read.
- As a contributor, I want every colour role and face defined once, with contrast checked by
  tests.

## 3. Scope

### In scope

- **Palettes (light and dark):** the existing roles retuned, plus new roles:
  - `shell`, `onShell`, `focusOnShell`: the stamp-blue header bar, its text and its focus ring;
  - `onPeak`: text on the stamp-red „Разгар“ fill (the `peak` role becomes stamp red);
  - `marker`, `onMarker`: the marker-yellow highlight reserved for the current month.
- **Faces:**
  - Sofia Sans, upright, 400–700, Latin and Cyrillic (unchanged);
  - Sofia Sans italic, 400, Latin only, for Latin names;
  - Sofia Sans Extra Condensed, upright, 800, Latin and Cyrillic, for the logo, headings and
    stamps.

  Piazzolla is removed. Both upright families are preloaded.

- **Global styles:** headings use the display face in capitals; Latin names use Sofia Sans
  italic; components that set text on the `peak` fill use `onPeak`.
- **Docs:** `DESIGN.md` and `.impeccable/design.json` describe the new system.

### Out of scope

- Header layout and navigation (#92), the season stamp and year strip (#93), page structure
  (#94), data visuals (#95).

## 4. Domain model

No domain change. `Palette` gains `shell`, `onShell`, `focusOnShell`, `onPeak`, `marker`,
`onMarker`. `FONT_FACES` entries gain `subsets`, the subsets each face is generated for.

## 5. Behaviour and edge cases

- The values are the ADR-0006 palette; the season tints for „В сезон“ and „От хранилище“ stay
  light tints with ink text until the stamp slice (#93) replaces them.
- A face without a Cyrillic subset (the italic) falls back to synthesised italic for Cyrillic
  text; it is used for Latin names only.
- The condensed face's metric fallback (Arial) needs a smaller `size-adjust` (about 69 %); the
  spec 012 fallback check allows 55–100 % for it and keeps 85–115 % for Sofia Sans.
- `marker` is only a fill under `onMarker` text; it is not a 3:1 boundary on light surfaces
  (1.7:1), so the stamp slice (#93) must pair any marker outline with an ink edge.
- `focus` on a `peak` tile is below 3:1 (1.2:1 light); the calendar tile's focus ring therefore
  carries a 2px background halo, so the ring always borders the background.
- In print, „Разгар“ badges and calendar tiles drop their fill and use print ink with a border.
- Italic loads with `font-display: optional` (no layout shift); upright faces with `swap`, sized
  fallbacks from Astro's font API.

## 6. Accessibility requirements

- Every text pair ≥ 4.5:1 and every UI boundary or focus pair ≥ 3:1 in both schemes, verified by
  unit tests over the contrast pair list.
- Capitals are applied with `text-transform`, so the source text and its reading order are
  unchanged without CSS; headings keep their levels.
- Zero axe violations on every template in light and dark mode (existing e2e).

## 7. SEO requirements

No change to titles, descriptions or structured data.

## 8. Acceptance criteria

1. **AC1:** Given the design tokens, the light and dark palettes equal the values set by this spec
   (derived from the ADR-0006 sketch and recorded in `DESIGN.md`).
2. **AC2:** Given each palette, every pair in the required contrast list meets its minimum,
   including `onShell` on `shell`, `focusOnShell` on `shell`, `onPeak` on `peak` and `onMarker`
   on `marker`.
3. **AC3:** Given `tokensToCss()`, the display family is Sofia Sans Extra Condensed with
   condensed fallbacks and the base family is Sofia Sans.
4. **AC4:** Given the font configuration, the faces are exactly the three above with their
   subsets, every generated file exists, all files together are ≤ 110 000 bytes, the preloaded
   upright files are ≤ 75 000 bytes, and no Piazzolla file remains.
5. **AC5:** Given a built produce page, the `h1` is set in Sofia Sans Extra Condensed in capitals
   and the Latin name in Sofia Sans italic (e2e).
6. **AC6:** Given `DESIGN.md`, it lists every light and dark palette value.

## 9. Test plan

| AC  | Type | Test file                                  |
| --- | ---- | ------------------------------------------ |
| AC1 | unit | `tests/unit/design/tokens-022.test.ts`     |
| AC2 | unit | `tests/unit/design/tokens-022.test.ts`     |
| AC3 | unit | `tests/unit/design/tokens-022.test.ts`     |
| AC4 | unit | `tests/unit/design/fontSubsets.test.ts`    |
| AC5 | e2e  | `tests/e2e/stamp-typography.spec.ts`       |
| AC6 | unit | `tests/unit/design/design-doc-022.test.ts` |

## 10. Third-party documentation consulted

| Package / source                                | Version | Source                                                               | Topic                     |
| ----------------------------------------------- | ------- | -------------------------------------------------------------------- | ------------------------- |
| astro                                           | 7.4.8   | `node_modules/astro` types (`fontProviders.local`, `<Font preload>`) | Local font variants       |
| @fontsource-variable/sofia-sans-extra-condensed | 5.3.0   | npm registry, package `files/`                                       | Variable WOFF2 sources    |
| subset-font                                     | 2.9.0   | package README (`variationAxes`, `targetFormat`)                     | Instancing and subsetting |
| WCAG 2.2                                        | current | Understanding 1.4.3, 1.4.11, 2.4.7                                   | Contrast and focus        |
