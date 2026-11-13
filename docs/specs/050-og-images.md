# 050. Generated Open Graph images

- **Status:** Approved
- **Bounded context(s):** shared (SEO), composition, UI
- **Related:** issue #21, spec 003 (SEO tags), spec 012 (typography), spec 015 (photos and
  self-hosted fonts), spec 047 (monthly RSS),
  ADR-0005 (Lighthouse), ADR-0006 (stamp-of-origin identity)

## 1. Goal

A link to Sezon shared in a messenger or on social media shows only a title and a description,
because no page has an image. This feature generates, at build time, a 1200×630 PNG share card for
the site (used by the home page and as the default for every other page), for each of the 12 month
pages and for every produce page, in the site's stamp-of-origin identity and with the self-hosted
Sofia Sans fonts. Every page links its card through `og:image` and the related tags, and
`twitter:card` becomes `summary_large_image`, so the shared link shows a large Bulgarian card that
says what the page is about.

## 2. User stories

- As a reader sharing a produce page, I want the preview to show the produce name and whether it is
  in season now, so that my friends see the point without opening the link.
- As a reader sharing a month page, I want the preview to say „Какво е в сезон през <месец>“ and
  name a few things in season.
- As a reader sharing the home page or any other page, I want a branded preview with the site name
  and tagline instead of a bare text link.
- As a screen-reader user of a social network, I want each card to have a Bulgarian `og:image:alt`
  text that says what the image shows.

## 3. Scope

### In scope

- Dependencies (exact versions, dev): `satori` 0.63.2 (element tree → SVG) and
  `@resvg/resvg-js` 2.6.2 (SVG → PNG, native binary installed through pnpm optional
  dependencies). `subset-font` (already a dev dependency, spec 015) instances the variable font.
  `fontkitten` 1.0.3 (already installed by Astro's font pipeline, now a direct dev dependency)
  reads the glyph advance widths that size the heading.
- `src/components/seo/ogImage.ts`: the pure card model, its texts and alt text, heading size,
  image paths and the meta builder.
- `src/components/seo/ogRenderer.ts`: loads the fonts and renders a card to PNG (satori + resvg).
- `src/pages/og/[...slug].png.ts`: static endpoint that writes every card at build time.
- `routes.ogImage` (`site`, `month(month)`, `produce(produce)`) in `routes.ts`.
- `ui.ogImage` strings in `src/i18n/bg.ts`.
- `Seo.astro` renders `og:image`, `og:image:type`, `og:image:width`, `og:image:height`,
  `og:image:alt`, `twitter:card=summary_large_image` and `twitter:image:alt`.
- `BaseLayout` gains an optional `ogImage` prop (`{ path, alt, version? }`), defaulting to the site card;
  the home, month and produce pages pass their own card.

### Out of scope

- Cards for regions, farms, groups, nutrients, recipes and other pages (they use the site card).
- Produce photos on the cards (see decision below).
- Dark-mode cards (social networks show one image; the light palette is used).
- Runtime or on-demand image generation.

**Photo decision.** The produce pages already show Unsplash photos, and the Unsplash licence would
allow reuse without credit. The cards stay text only: the site credits every photographer next to
the photo (spec 015) and a card has no room for a legible credit, so adding the photo would break
the site's own credit rule; it would also roughly triple the build cost per card (JPEG decode and
resize) and the PNG size. This can be revisited with a credit line on the card.

## 4. Domain model

No domain change. The read model lives in `src/components/seo/ogImage.ts`:

- `OG_IMAGE = { width: 1200, height: 630, type: 'image/png' }`.
- `OgStampTone = 'peak' | 'available' | 'storage' | 'out'`.
- `OgCard { path, alt, version?, kicker?, heading, stamp?: { text, tone }, detail, brand? }`:
  - `path`: site-relative path of the PNG (`/og/...png`);
  - `alt`: Bulgarian alternative text;
  - `version`: cache key added to the meta URL as `?m=<version>` (produce cards: the month slug);
  - `kicker`: small line above the heading; `heading`: the large name, shown in capitals;
  - `stamp`: the season stamp (produce cards only); `detail`: the line under the heading;
  - `brand`: the site name in the bottom band, left out on the site card whose heading is the
    site name already.
- `siteOgCard()`, `monthOgCard(overview)`, `produceOgCard(produce, month)`: build the cards.
- `OG_HEADING = { widthPx: 1056, maxPx: 200, minPx: 96, maxLines: 2 }`.
- `headingFontSize({ lineEm, longestWordEm })`: the heading size in px from the measured width of
  the heading in capitals (`lineEm`) and of its widest word (`longestWordEm`), both in em:
  - one line when `⌊1056 / lineEm⌋ ≥ 96`: `min(200, ⌊1056 / lineEm⌋)`;
  - otherwise wrapped: `min(96, ⌊1056 / longestWordEm⌋, ⌊2 × 1056 / (lineEm × 1.2)⌋)`, so no
    word is wider than the content and the heading needs two lines at most (1.2 allows for
    imperfect line breaks).
- `ogImageSlug(path)`: the endpoint's `slug` param of an image path (`/og/sezon/noemvri.png` →
  `sezon/noemvri`); throws `InvalidPageMetaError` when the path does not start with `/og/`, does not
  end in `.png` or has nothing in between.
- `ogImageMeta(siteUrl, { path, alt, version? })`: `{ url, alt, width, height, type }` with the
  absolute URL, followed by `?m=<version>` when the card has a version.

`ogRenderer.ts`: `measureHeading(text): Promise<{ lineEm, longestWordEm }>` (advance widths of the
capitals in Sofia Sans Extra Condensed 800, Cyrillic glyphs first, Latin as fallback, read with
`fontkitten`), `renderOgRaster(card, siteUrl)` (RGBA pixels, used by tests),
`renderOgImage(card, siteUrl): Promise<Uint8Array>` and the font loader (cached once per build).
The renderer computes the heading size from `measureHeading` and `headingFontSize`.

## 5. Behaviour and edge cases

- **Paths:** `/og/site.png`; `/og/sezon/<month-slug>.png` (12); `/og/<section>/<produce-slug>.png`
  (one per produce, `<section>` as in `routes.produce`). Latin, lowercase, no trailing slash.
- **Site card** (home and default): heading `ui.siteName` („Сезон“), detail `ui.siteDescription`
  (the tagline), no kicker, no stamp, no brand in the band. Alt: „Сезон: <tagline>“.
- **Month card:** kicker „Какво е в сезон през“, heading the month name („Ноември“), detail the
  names of the first 5 fresh produce (peak, then available, in repository order), the first as
  written and the rest in lower case. When more remain, the names are joined with „, “ and „ и още
  N“ is appended („Зеле, праз, ябълки, круши, тиква и още 2“); otherwise the last two are joined
  with „и“ („Зеле, праз и тиква“). When nothing is fresh, the detail is „Нищо прясно този месец –
  виж какво има от хранилище.“. Alt: „Какво е в сезон през <месец>: <names in lower case>. Сезон“,
  or „Какво е в сезон през <месец>: нищо прясно. Сезон“ when nothing is fresh.
- **Produce card:** kicker the produce kind (`ui.produceKinds`, e.g. „Плод“), heading the name,
  stamp the level in the build month (Europe/Sofia, `buildMonth`) with the same word as the
  produce page's stamp in „На сергията“ (`ui.stamp`): peak „Разгар“, available „В сезон“, storage
  „От хранилище“; out of season „Извън сезона“ (`ui.produce.outOfSeason`, the page's words);
  detail „през <месец>“ (`ui.produce.nowIn`). The card therefore reads like the page:
  „РАЗГАР през ноември“. Alt: „<Име> – <дума с малка буква> през <месец>. Сезон“, e.g. „Ябълки –
  разгар през ноември. Сезон“. The site rebuilds daily, so the card follows the month.
- **Social caches:** the produce card's file stays `/og/<section>/<slug>.png` (one file per
  produce, always the build month's content), and its meta URL carries the month:
  `/og/plodove/yabalki.png?m=noemvri`. Facebook, X and messengers cache an image per URL, so the
  new month is a new URL and the card is fetched again. The query keeps one plain static file on
  Cloudflare Pages (static hosts ignore the query string), so no extra files and no redirects are
  needed. The site and month cards change only with the content and keep plain URLs.
- **Heading fit:** the heading is sized from the real advance widths of the capitals (see
  `headingFontSize`). Every current catalogue name fits on one line. A longer name wraps to at most
  two lines at 96 px or less, and a single long word is shrunk until it fits the 1056 px content
  width. The main column has `min-height: 0` and `overflow: hidden`, so content can never reach the
  bottom band; two lines at 96 px plus kicker and stamp need about 410 of the 526 px above the band.
- **Visual identity** (DESIGN.md, light palette from `src/design/tokens.ts`): label-paper
  background (`background`); kicker in Sofia Sans 600, `textMuted`; heading in Sofia Sans Extra
  Condensed 800, capitals, stamp-ink `accent`; stamp rotated −3° in Sofia Sans Extra Condensed 800
  capitals: peak solid `peak` with `onPeak` text, available outlined in `accent`, storage outlined
  dashed in `text`, out of season outlined in `border` with `textMuted` text; detail in Sofia Sans
  400, `text`; a bottom band in `shell` with `onShell` text: the site name in capitals (Extra
  Condensed 800) on the left and the site host on the right (Sofia Sans 600). Flat, no shadows.
- **Fonts:** the self-hosted files in `src/assets/fonts` (spec 015), Latin and Cyrillic subsets,
  imported with Vite's `?inline` suffix so the bundler resolves them from the module, not from the
  working directory.
  Sofia Sans is variable (wght 400–700); satori renders only the default instance, so the renderer
  pins it to 400 and 600 with `subset-font` (`keepAllGlyphs`, `variationAxes`, `sfnt`) once per
  build. Sofia Sans Extra Condensed is already static at 800 and is used as shipped. Each subset is
  registered as its own family and styles list the Cyrillic family first, then the Latin one,
  because satori falls back between families (not between files of one family) for missing glyphs.
- **Endpoint:** `getStaticPaths` lists the site card, the 12 month cards and one card per produce;
  `GET` returns the PNG with `Content-Type: image/png`. Static output only.
- **Meta:** every page (including the 404 page) renders, after `og:site_name`: `og:image` (absolute
  URL), `og:image:type` `image/png`, `og:image:width` `1200`, `og:image:height` `630`,
  `og:image:alt`; then `twitter:card` `summary_large_image` and `twitter:image:alt` (the same
  alt). X falls back to `og:image` for the image itself.
- **Errors:** a missing font file or a satori/resvg failure fails the build; a missing `site`
  throws `InvalidConfigurationError` (`requireSiteUrl`).
- **Build time:** about 50 cards; the budget is under 10 s added on CI.

## 6. Accessibility requirements

- No visible page UI changes; the cards are not shown on the site. Zero axe violations stays.
- WCAG 2.2 AA 1.1.1 (non-text content) for the shared card: `og:image:alt` gives every card a
  Bulgarian text alternative that contains the same words as the image.
- On the card, the season level is carried by words, not only colour (as on the site): the stamp
  says „Разгар“, „В сезон“, „От хранилище“ or „Извън сезона“, as on the produce page.
- Card text contrast uses the token pairs already verified by the contrast tests (text, accent and
  textMuted on background; onPeak on peak; onShell on shell).
- Behaviour without JavaScript and without CSS: unchanged (meta tags only).

## 7. SEO requirements

- `og:image` is absolute, on the canonical origin, and points to an existing 1200×630 PNG (the
  size the Open Graph and X large-card guidance recommend: 1.91:1, at least 600 px wide).
- `twitter:card=summary_large_image` and `twitter:image:alt` on every page.
- The produce card's meta URL changes with the month (`?m=<month>`), so social caches refresh.
- Titles, descriptions, canonicals and structured data do not change. The Article JSON-LD keeps
  the produce photo as its `image`.
- The PNGs are not added to the sitemap.
- Lighthouse SEO and Best Practices stay at 100 (meta tags only; no new requests from the page).

## 8. Acceptance criteria

1. **AC1:** Given the site card, when `siteOgCard()` runs, then its path is `/og/site.png`, its
   heading is „Сезон“, its detail is the tagline, it has no stamp, kicker or brand, and its alt is
   „Сезон: <tagline>“.
2. **AC2:** Given a month overview with more than 5 fresh produce, when `monthOgCard` runs, then the
   path is `/og/sezon/<slug>.png`, the kicker is „Какво е в сезон през“, the heading is the month
   name, the detail names the first 5 fresh produce (peak first) followed by „и още N“, and the alt
   is „Какво е в сезон през <месец>: <names in lower case> и още N. Сезон“; with 5 or fewer, the
   names end with „и <last>“ and there is no „и още“; with none, the empty-month detail and alt.
3. **AC3:** Given a produce and a month, when `produceOgCard` runs, then the path is
   `routes.ogImage.produce(produce)`, the kicker is the kind, the heading is the name, the stamp
   text is the produce page's word for the level in that month (`ui.stamp`, or „Извън сезона“) with
   the matching tone, the detail is „през <месец>“, the brand is „Сезон“, and the alt is
   „<Име> – <дума> през <месец>. Сезон“.
4. **AC4:** Given measured heading widths, when `headingFontSize` runs, then it returns 200 for
   short headings, `⌊1056 / lineEm⌋` when that is at least 96, and otherwise the smallest of 96,
   `⌊1056 / longestWordEm⌋` and `⌊2 × 1056 / (lineEm × 1.2)⌋`.
5. **AC5:** Given an image path, when `ogImageSlug` runs, then it returns the path without `/og/`
   and `.png`, and throws `InvalidPageMetaError` for any other path; and when `ogImageMeta(siteUrl, image)` runs, then it returns the absolute URL, the
   alt, 1200, 630 and `image/png`.
6. **AC6:** Given a card, when `renderOgImage` runs, then it returns a PNG of 1200×630.
7. **AC7:** Given `BaseLayout` without `ogImage`, when it renders, then the head has `og:image`
   with the absolute URL of `/og/site.png`, `og:image:type`, `og:image:width` 1200,
   `og:image:height` 630, `og:image:alt` and `twitter:image:alt` with the site alt text, and
   `twitter:card` `summary_large_image`; given an `ogImage`, then its absolute URL and alt are used.
8. **AC8:** Given the built site, when the home, a month and a produce page are read, then their
   `og:image` is respectively `/og/site.png`, `/og/sezon/<slug>.png` and
   `/og/<section>/<slug>.png` (e2e).
9. **AC9:** Given the built site, when every HTML page in `dist` is read, then each has exactly one
   `og:image` whose file exists in `dist` as a PNG of 1200×630 and whose `og:image:alt` is not
   empty, and `dist/og` has the site card, 12 month cards and one card per produce page (e2e).
10. **AC10:** Pages keep zero axe violations and their Lighthouse scores (existing e2e axe tests
    and `pnpm lhci`).
11. **AC11:** Given a produce and a month, when its card's meta is built, then the URL ends in
    `?m=<month slug>`; site and month cards have no query; and in the built site a produce page's
    `og:image` carries the build month (e2e).
12. **AC12:** Given the catalogue, when each name is measured, then it fits on one line of the
    heading; given the worst cases „Щъркелов шипок“, „Брюкселско зеле“, „ЖЖЖЖЖЖЖЖЖЖЖ“ and a
    two-line name, when their produce cards are rendered, then no word is wider than 1056 px,
    nothing is drawn in the right padding, the band stays clear and the stamp stays visible.

## 9. Test plan

| AC      | Test type            | Test file                                                        |
| ------- | -------------------- | ---------------------------------------------------------------- |
| AC1–AC5 | unit                 | `tests/unit/components/seo/ogImage.test.ts`                      |
| AC11    | unit, component, e2e | `ogImage.test.ts`, `BaseLayout-050.test.ts`, `og-images.spec.ts` |
| AC12    | unit                 | `tests/unit/components/seo/ogRenderer.test.ts`                   |
| AC6     | unit                 | `tests/unit/components/seo/ogRenderer.test.ts`                   |
| AC7     | component            | `tests/components/BaseLayout-050.test.ts`                        |
| AC8–AC9 | e2e                  | `tests/e2e/og-images.spec.ts`                                    |
| AC10    | e2e, LHCI            | existing axe specs, `lighthouserc.cjs` (`lhci`)                  |

`tests/components/BaseLayout.test.ts` (spec 003) changes its `twitter:card` expectation from
`summary` to `summary_large_image`, as this spec requires.

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                                                                                     | Topic                                                                                                         |
| ---------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------- |
| satori           | 0.63.2  | Context7 `/vercel/satori` (README: fonts, usage without JSX; `_autodocs/api-reference/font.md`)                                            | Plain-object elements, `fonts` (`name`, `data`, `weight`, `style`), TTF/OTF/WOFF/WOFF2                        |
| satori           | 0.63.2  | `node_modules/satori/dist/index.d.ts`, `wasm-*.d.ts`; `dist/index.js` (`getEngine`)                                                        | `SatoriOptions`, `Font`; fallback between families for missing glyphs, default instance of variable fonts     |
| @resvg/resvg-js  | 2.6.2   | Context7 `/thx/resvg-js/v2.6.2` (README: Node.js usage)                                                                                    | `new Resvg(svg, { fitTo })`, `render().asPng()`                                                               |
| @resvg/resvg-js  | 2.6.2   | `node_modules/@resvg/resvg-js/index.d.ts`                                                                                                  | `ResvgRenderOptions`, `fitTo`, `font.loadSystemFonts`                                                         |
| fontkitten       | 1.0.3   | `node_modules/fontkitten/dist/index.d.ts`                                                                                                  | `create(buffer)` (TTF, WOFF, WOFF2), `unitsPerEm`, `hasGlyphForCodePoint`, `glyphForCodePoint().advanceWidth` |
| vite             | 8.3.7   | Context7 `/vitejs/vite` (`guide/assets.md`: explicit inline handling), `vite/client.d.ts`                                                  | `?inline` asset imports as base64 data URLs                                                                   |
| subset-font      | 2.9.0   | `node_modules/subset-font/README.md`                                                                                                       | Instancing without subsetting: `keepAllGlyphs`, `variationAxes`, `targetFormat: 'sfnt'`                       |
| astro            | 7.4.8   | Context7 `/withastro/docs` (`guides/endpoints.mdx`: static file endpoints, params and props, binary PNG response; `routing-reference.mdx`) | `getStaticPaths` in endpoints, `[...slug].png.ts`, `Response` with `image/png`                                |
| Open Graph       | current | https://ogp.me/ (structured properties `og:image:*`)                                                                                       | `og:image`, `og:image:type`, `og:image:width`, `og:image:height`, `og:image:alt`                              |
| X Cards          | current | https://developer.x.com/en/docs/x-for-websites/cards/overview/summary-card-with-large-image and `.../markup`                               | `summary_large_image`, fallback to `og:image`, aspect ratio 2:1, minimum 300×157                              |
