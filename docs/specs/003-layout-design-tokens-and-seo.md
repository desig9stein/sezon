# 003. Layout, design tokens and SEO foundation

- **Status:** Approved
- **Bounded context(s):** shared (seo), UI
- **Related:** ADR-0001, spec 001

## 1. Goal

Provide the page shell every route uses: an accessible base layout (skip link, header,
navigation, main, footer), a design-token system with guaranteed WCAG AA contrast in light and
dark mode, all UI strings in one Bulgarian dictionary, and SEO building blocks (meta tags,
canonical URL, Open Graph, JSON-LD) that make every page valid and consistent by construction.

## 2. User stories

- As a keyboard or screen-reader user, I want to skip straight to the main content and move
  through clear landmarks, so that I do not tab through the header on every page.
- As a visitor using dark mode, I want the site to follow my system theme with readable contrast.
- As a search engine, I want each page to declare its canonical URL, language, title,
  description and structured data, so that the page is indexed correctly.
- As a developer, I want to add a page by passing a title and description to one layout,
  so that SEO and accessibility are not re-implemented per page.

## 3. Scope

### In scope

- `src/i18n/bg.ts`: UI dictionary (site name, navigation, skip link, footer, month names,
  season-level labels, produce-kind labels, disclaimers).
- `src/design/tokens.ts`: colour palettes (light, dark), spacing, typography, radii;
  `tokensToCss()` renders them as CSS custom properties; `src/design/contrast.ts` computes
  WCAG contrast ratios.
- `src/styles/base.css`: reset, base typography, focus style, `.visually-hidden`, reduced motion.
- `src/shared/seo/`: `buildPageMeta`, `serializeJsonLd`, `websiteJsonLd`, `breadcrumbListJsonLd`.
- Components: `BaseLayout`, `Seo`, `JsonLd`, `SkipLink`, `SiteHeader`, `SiteFooter`, `Breadcrumbs`.

### Out of scope

- Page content (specs 004, 005), images and Open Graph image generation (Phase 5), search.

## 4. Domain model

No domain entities. Pure modules:

- `PageMetaInput { title, description, path, siteUrl, type?: 'website' | 'article' }`.
- `PageMeta { title (with site suffix), description, canonicalUrl, ogType, locale: 'bg_BG', siteName }`.
- `BreadcrumbItem { name, path }`.

## 5. Behaviour and edge cases

### Page meta

- `buildPageMeta` returns `title` as `"<title> | Сезон"`. When `title` already equals the site
  name („Сезон“), it is returned unchanged (no duplicated suffix).
- The full title must be ≤ 60 characters; the description 70–160 characters after trimming.
  Violations throw `InvalidPageMetaError` (fails the build, never silently truncates).
- `path` must start with `/`, contain no trailing slash except the root `/`, and no query or
  hash; otherwise `InvalidPageMetaError`.
- `canonicalUrl` = `siteUrl` (without trailing slash) + `path`; the root is `siteUrl + "/"`.

### JSON-LD

- `serializeJsonLd(value)` returns JSON with `<`, `>`, `&`, U+2028 and U+2029 escaped as
  `<`, `>`, `&`, ` `, ` `, so content cannot close the `<script>` tag.
- `websiteJsonLd({ siteUrl, name, description })` → `@type: WebSite`, `inLanguage: bg`.
- `breadcrumbListJsonLd(items, siteUrl)` → `@type: BreadcrumbList` with `ListItem`s at
  positions 1..n and absolute `item` URLs. An empty list throws `InvalidPageMetaError`.

### Design tokens

- Light and dark palettes define: `background`, `surface`, `text`, `textMuted`, `accent`,
  `accentText` (text on accent), `border`, `focus`, `peak`, `available`, `storage`
  (season level badge backgrounds) and `onBadge` (text on badges).
- Contrast requirements per palette: `text`, `textMuted`, `accent` on `background` and on
  `surface` ≥ 4.5:1; `accentText` on `accent` ≥ 4.5:1; `onBadge` on `peak`/`available`/`storage`
  ≥ 4.5:1; `focus` and `border` on `background` ≥ 3:1.
- `tokensToCss()` emits `:root { … }` with light values plus
  `@media (prefers-color-scheme: dark) { :root { … } }`, and `color-scheme: light dark`.

### Layout

- `BaseLayout` props: `title`, `description`, `path`, `type?`, `breadcrumbs?`, `jsonLd?` (extra objects).
- Renders `<html lang="bg">`, `<meta charset>`, viewport, `Seo`, inline token CSS, then body:
  `SkipLink` (first focusable element, target `#main`), `SiteHeader`, optional `Breadcrumbs`,
  `<main id="main" tabindex="-1">`, `SiteFooter`.
- Site navigation lists `/` („Сезонът сега“) and the current month page; the current page link
  has `aria-current="page"`.
- Footer lists links to all 12 month pages, the health disclaimer and the copyright year.
- No client-side JavaScript.

## 6. Accessibility requirements

- WCAG 2.2 AA: 1.3.1 (landmarks, lists, headings), 1.4.3 / 1.4.11 (contrast, enforced by tests),
  1.4.4 / 1.4.10 (rem-based type, reflow at 320 px), 2.1.1 (keyboard), 2.4.1 (skip link),
  2.4.3 (focus order = DOM order), 2.4.7 / 2.4.11 (visible, unobscured focus),
  2.5.8 (targets ≥ 24 × 24 px), 3.1.1 (`lang="bg"`).
- Landmarks: `header` (banner), `nav aria-label="Основна навигация"`, `main`, `footer`
  (contentinfo), breadcrumbs `nav aria-label="Път до страницата"` with an ordered list and
  `aria-current="page"` on the last item.
- Skip link is visually hidden until focused, then visible on top of the header.
- `:focus-visible` outline ≥ 2 px in the `focus` token colour with offset.
- `prefers-reduced-motion: reduce` disables transitions and smooth scrolling.
- Works without JavaScript (there is none).

## 7. SEO requirements

- Every page: unique `<title>`, `meta description`, `link rel="canonical"`, `og:title`,
  `og:description`, `og:url`, `og:type`, `og:locale=bg_BG`, `og:site_name`,
  `twitter:card=summary`, `meta name="robots" content="index, follow"`.
- Home page: `WebSite` JSON-LD. Pages with breadcrumbs: `BreadcrumbList` JSON-LD.
- `meta name="theme-color"` for light and dark.

## 8. Acceptance criteria

1. **AC1:** Given valid input, `buildPageMeta` returns the suffixed title, trimmed description, canonical URL and OG fields.
2. **AC2:** Given a full title over 60 characters, a description outside 70–160, or an invalid path, `buildPageMeta` throws `InvalidPageMetaError`.
3. **AC3:** Given a string containing `</script>` or U+2028, `serializeJsonLd` output contains no `<` and parses back to the same value.
4. **AC4:** `websiteJsonLd` and `breadcrumbListJsonLd` return the schema.org shapes in section 5; an empty breadcrumb list throws.
5. **AC5:** For both palettes, every contrast pair in section 5 meets its minimum ratio.
6. **AC6:** `contrastRatio` returns 21 for black/white and 1 for identical colours.
7. **AC7:** `tokensToCss()` contains every token as a custom property for light and dark.
8. **AC8:** `BaseLayout` renders `lang="bg"`, the skip link as the first link pointing to `#main`, landmarks with Bulgarian labels, `main#main`, all SEO tags of section 7, and valid JSON-LD.
9. **AC9:** `Breadcrumbs` renders an ordered list, links for all but the last item, `aria-current="page"` on the last, and emits `BreadcrumbList` JSON-LD.
10. **AC10:** `SiteFooter` renders links to all 12 month pages with Bulgarian month names.
11. **AC11:** No UI string is hard-coded in components; every visible string comes from `src/i18n/bg.ts` or props.

## 9. Test plan

| AC      | Type      | Test file                                |
| ------- | --------- | ---------------------------------------- |
| AC1–AC2 | unit      | `tests/unit/shared/seo/pageMeta.test.ts` |
| AC3–AC4 | unit      | `tests/unit/shared/seo/jsonLd.test.ts`   |
| AC5–AC7 | unit      | `tests/unit/design/tokens.test.ts`       |
| AC8     | component | `tests/components/BaseLayout.test.ts`    |
| AC9     | component | `tests/components/Breadcrumbs.test.ts`   |
| AC10    | component | `tests/components/SiteFooter.test.ts`    |
| AC11    | review    | QA checklist                             |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                     | Topic                                  |
| ---------------- | ------- | -------------------------------------------------------------------------- | -------------------------------------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (reference/container-reference, guides/testing) | Container API `renderToString`, props  |
| astro            | 7.4.8   | Context7 `/withastro/docs` (guides/styling)                                | Scoped styles, `is:inline`, `set:html` |
| WCAG 2.2         | 2023    | https://www.w3.org/TR/WCAG22/ (relative luminance, contrast ratio)         | Contrast formula and thresholds        |
| schema.org       | current | https://schema.org/WebSite, https://schema.org/BreadcrumbList              | JSON-LD shapes                         |
| Open Graph       | current | https://ogp.me/                                                            | `og:*` properties                      |
