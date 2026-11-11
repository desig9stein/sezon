# 012. Design tokens and self-hosted Cyrillic typography

- **Status:** Approved
- **Bounded context(s):** UI (design tokens, layout head, base styles)
- **Related:** ADR-0004, spec 003 (tokens), spec 009, issue #36, redesign #28

## 1. Goal

Implement the colours and typography approved in ADR-0004:

- the botanical-atlas palette in light and dark mode;
- Piazzolla for display text and Latin names;
- Sofia Sans for text and data.

Both fonts are self-hosted, subset to Cyrillic and Latin, and render the Bulgarian letterforms.
Every colour pair in use meets WCAG AA. Fonts must not cause layout shift, and Lighthouse stays
at 100. Layout and component restyling are #37 and out of scope here.

## 2. User stories

- As a Bulgarian reader, I want text set in a typeface with Bulgarian Cyrillic forms, so that the
  site reads naturally.
- As a reader with low vision, I want every text and control colour to keep AA contrast in light
  and dark mode.
- As a visitor on a slow connection, I want text to appear at once and not jump when the fonts
  arrive.

## 3. Scope

### In scope

- `src/design/tokens.ts`:
  - the ADR-0004 palette for light and dark;
  - a new `rule` colour for hairlines;
  - font-family tokens `font-family-display` and `font-family-base`;
  - the type scale (`sm`, `base`, `lg`, `xl`, `2xl`, `3xl`, `display`) and line heights.
- `astro.config.mjs`: the Astro Fonts API with the local provider, loading files from the
  `@fontsource-variable/piazzolla` and `@fontsource-variable/sofia-sans` packages.
- `src/layouts/BaseLayout.astro`: one `<Font>` per family, preloading only the Cyrillic
  upright files.
- `src/styles/base.css`:
  - body text in the base family;
  - headings and `[lang="la"]` text in the display family;
  - tabular figures in tables.
- Contrast unit tests for every pair in use.

### Out of scope

- Layout, spacing and component changes. These include the month word, the year ribbon, the
  plates and the header, all in #37.
- Photos.

## 4. Domain model

None. Design tokens only.

| Family     | Files (Fontsource 5.3.0)                                                                 | `unicode-range`                        |
| ---------- | ---------------------------------------------------------------------------------------- | -------------------------------------- |
| Piazzolla  | `cyrillic-opsz-normal`, `latin-opsz-normal`, `cyrillic-wght-italic`, `latin-wght-italic` | Fontsource's Cyrillic and Latin ranges |
| Sofia Sans | `cyrillic-wght-normal`, `latin-wght-normal`                                              | Fontsource's Cyrillic and Latin ranges |

## 5. Behaviour and edge cases

- **Font loading:**
  - Every face uses `font-display: swap`.
  - Variable weight ranges are 100–900 for Piazzolla and 1–1000 for Sofia Sans.
  - A subset downloads only when the page uses characters in its range.
- **Preload:** only `piazzolla-cyrillic-opsz-normal` and `sofia-sans-cyrillic-wght-normal`,
  which every page uses.
- **Fallbacks:**
  - Piazzolla: `Georgia, serif`. Sofia Sans: `system-ui, sans-serif`.
  - Astro generates metric-adjusted fallback faces (`size-adjust`), so swapping in the real
    font moves no text and CLS stays 0.
- **Font files:**
  - All fonts are served from the site's own origin under `/_astro/fonts/`.
  - The CSP `default-src 'self'` covers them, and the existing immutable cache rule for
    `/_astro/*` applies.
- **Typography in `base.css`:**
  - Headings (`h1`–`h3`) use the display family with weight 600.
  - Latin names (`[lang="la"]`) use the display family in italic.
  - Body, navigation and tables use the base family, and tables use `tabular-nums`.
- **Colour tokens:**
  - `rule` is a decorative hairline colour. It is not used for text or control boundaries, so
    it has no contrast minimum. Boundaries keep using `border` (≥ 3:1).
  - Season tints carry text in `onBadge`.

## 6. Accessibility requirements

- WCAG 1.4.3 and 1.4.11. Every text pair meets AA (≥ 4.5:1), and focus and borders meet ≥ 3:1,
  in both themes. The table in section 8 lists the pairs.
- WCAG 1.4.4 and 1.4.12. Sizes are in rem, and nothing clips when users change text spacing.
- WCAG 3.1.1. The fonts render Bulgarian forms under `lang="bg"`.
- The page stays readable without CSS and without the web fonts (spec 009). Fallbacks are
  system fonts.
- `prefers-reduced-motion`: fonts swap without any animation.

## 7. SEO requirements

- No change to content or metadata. Lighthouse SEO stays at 100.

## 8. Acceptance criteria

1. **AC1:** The light and dark palettes equal the values in ADR-0004, including `rule`.
2. **AC2:** Every required pair meets its minimum in both palettes:
   - text, textMuted and accent on background and surface: 4.5;
   - accentText on accent: 4.5;
   - onBadge on peak, available and storage: 4.5;
   - focus on background and surface: 3;
   - border on background: 3.
3. **AC3:** `tokensToCss()` emits the font-family tokens, which reference the font CSS variables with the system fallbacks, the type scale including `3xl` and `display`, and every colour for both schemes.
4. **AC4:** `BaseLayout` renders the font styles and exactly two font preload links (`as="font"`, `type="font/woff2"`, `crossorigin`).
5. **AC5:** In the built site:
   - `h1` computes to the Piazzolla family and `body` to Sofia Sans;
   - `document.fonts.check` confirms the Bulgarian text renders with the loaded faces;
   - every font request is same-origin under `/_astro/fonts/` (e2e).
6. **AC6:** Lighthouse scores 100 in all four categories, with CLS 0 (LHCI, existing gate).

## 9. Test plan

| AC      | Type      | Test file                                 |
| ------- | --------- | ----------------------------------------- |
| AC1–AC3 | unit      | `tests/unit/design/tokens-012.test.ts`    |
| AC4     | component | `tests/components/BaseLayout-012.test.ts` |
| AC5     | e2e       | `tests/e2e/typography.spec.ts`            |
| AC6     | LHCI      | `lighthouserc.cjs` (CI)                   |

## 10. Third-party documentation consulted

| Package / source                | Version | Source                                                                                                                                                                                                                                          | Topic                             |
| ------------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| astro                           | 7.4.8   | Context7 `/withastro/docs` (guides/fonts; reference/font-provider-reference: local provider, variants, `unicodeRange`, `display`; reference/modules/astro-assets: `<Font preload>`; configuration-reference: `fallbacks`, `optimizedFallbacks`) | Fonts API                         |
| @fontsource-variable/piazzolla  | 5.3.0   | `node_modules/@fontsource-variable/piazzolla/{opsz,wght-italic}.css`                                                                                                                                                                            | File names, axes, `unicode-range` |
| @fontsource-variable/sofia-sans | 5.3.0   | `node_modules/@fontsource-variable/sofia-sans/wght.css`                                                                                                                                                                                         | File names, axes, `unicode-range` |
| WCAG 2.2                        | 2023    | Understanding 1.4.3, 1.4.11, 1.4.12                                                                                                                                                                                                             | Contrast, text spacing            |
