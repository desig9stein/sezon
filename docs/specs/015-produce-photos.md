# 015. Optimised, accessible produce photos

- **Status:** Approved
- **Bounded context(s):** catalog (content model, `Produce`), UI (produce page, plate cards)
- **Related:** ADR-0004 (imagery), specs 005, 009, 012, 013, issue #56

## 1. Goal

Give every produce a photograph, as ADR-0004 asks: a close-up of the produce, framed as a plate
on its page and on the peak plates of the home and section pages. The photos come from Unsplash
for now, and the owner can replace any of them. They are self-hosted and processed at build time,
so they cost no Lighthouse points, need no CSP change and cause no layout shift. Each photo has a
Bulgarian `alt` text and credits its photographer.

## 2. User stories

- As a visitor, I want to see what the produce looks like, so that I recognise it at the market.
- As a screen-reader user, I want a description of the photo on the produce page, and no
  repeated noise on cards whose name already says what the photo shows.
- As a visitor on a slow phone, I want the page to load fast and not jump when photos arrive.
- As the owner, I want to replace a photo by changing one file and four lines of YAML.

## 3. Scope

### In scope

- **Content model.** An optional `photo` field on a produce: `src` (local image through the
  Astro `image()` helper), `alt`, and `credit` with `author`, `authorUrl`, `sourceName` and
  `sourceUrl`. The schema rejects a photo without `alt` or a complete credit.
- **Seed content.** One Unsplash photo per seed produce in `src/assets/produce/<slug>.jpg`,
  cropped to 4:3 at 1600 × 1200 px, with `alt` and credit in the produce YAML.
- **Domain.** A `ProducePhoto` read model on `Produce` (`produce.photo`, `undefined` when there
  is none). It stays free of Astro: the image is described by its `src`, `width`, `height` and
  `format`.
- **`ProducePhoto` component** (produce page): a `<figure>` with a `<picture>` (AVIF and WebP,
  JPEG fallback, responsive `srcset` and `sizes`, explicit `width` and `height`), and a
  `<figcaption>` with the Latin name and the credit line „Снимка: <автор> / <източник>“, both
  linked.
- **Plate cards** (`ProduceCard`, variant `plate`): the photo above the name, decorative
  (`alt=""`), because the card's name link already names the produce.
- **Content guide.** How to add or replace a photo.

### Out of scope

- Photos in index rows, the calendar, month pages beyond their plates, and farm or region pages.
- Open Graph images per produce (Phase 5).
- Art direction (different crops per breakpoint).

## 4. Domain model

- `ImageAsset` (interface, catalog domain): `src`, `width`, `height`, `format` (one of the
  formats Astro's `image()` returns). Structurally compatible with Astro's `ImageMetadata`, so
  components can pass it to `<Picture>` without the domain importing Astro.
- `PhotoCredit` (interface): `author`, `authorUrl`, `sourceName`, `sourceUrl`.
- `ProducePhoto` (interface): `image: ImageAsset`, `alt`, `credit: PhotoCredit`.
- `Produce.photo: ProducePhoto | undefined`. `Produce.create` freezes it and rejects an empty
  `alt` with `InvalidProduceError`.

## 5. Behaviour and edge cases

- **Formats and sizes.**
  - `<Picture formats={['avif', 'webp']}>` with a JPEG fallback.
  - Produce page widths: 320, 480, 640, 800 and 1200 px; `sizes` matches the figure column
    (two fifths of the content width from 48 rem, the full width less the page and plate padding
    below).
  - Plate widths: 320, 480, 640, 720 and 960 px, with one `sizes` for every plate.
  - AVIF and WebP at quality 40, which keeps the eager photo near 20 KB.
  - The domain keeps Astro's image metadata object as it is (no copy), because reading its `src`
    marks the 1600 px original as used and the build would then emit 13 unused originals.
  - The `img` `width` and `height` attributes give the 4:3 ratio at a display size of at most
    800 px, so without CSS the photo never overflows a desktop page (spec 009).
- **Loading.**
  - The produce page photo is the LCP candidate: `loading="eager"` and `fetchpriority="high"`.
  - The first plate on a page is eager; every other plate photo is lazy.
- **Without a photo.** The produce page shows no figure, and the plate shows no image area. No
  broken image, no placeholder box.
- **Alt text.** It describes what the photo shows (for example „Две жълти дюли с мъх по кората
  върху дървена маса“), not only the produce name. On plates the image is decorative (`alt=""`),
  so screen readers do not hear the name twice.
- **Credit.** „Снимка: Natasha Skov / Unsplash“: the author links to `authorUrl` and the source
  name to `sourceUrl`. Links to `unsplash.com` get `utm_source=sezon&utm_medium=referral`, the
  referral parameters of Unsplash's API attribution guideline for photos fetched through the
  API. The guideline page (help.unsplash.com) was not reachable from the build environment, so
  the owner confirms the wording when reviewing. The links have no `target`.
- **Layout.**
  - Produce page: from 48 rem the name and the facts row span the full width (so the facts stay on one row, spec 009 AC8), and below them the summary and the current-season line sit in the left column (3 fr) beside the figure (2 fr). Below 48 rem the
    figure follows the text. Source order is the reading order (spec 009): `h1`, meta, summary,
    the current-season line, then the figure.
  - Plates: the photo sits at the top of the plate in source order, in a 4:3 frame
    (`aspect-ratio`, `object-fit: cover`), with the plate's small radius.
  - All plates have the same size (owner decision): every produce in the group is at its peak and
    none is promoted, so the first plate no longer spans two columns (this replaces spec 013's
    "the first one is larger"). The grid has 20 rem columns: three on wide screens, two on
    medium, one on phones.
- **Font payload (QA 015).** With a photo as the LCP element, the four preloaded font files
  (118 KB) delayed it to about 2.2 s in Lighthouse's mobile simulation (Performance 0.98–0.99).
  The fonts are now generated by `pnpm fonts:build` (`scripts/fonts/build.ts`, `subset-font`)
  from the Fontsource packages into `src/assets/fonts/`:
  - instanced to the weights in use (Piazzolla 400–600, Sofia Sans 400–700);
  - subset to the characters in `src/design/fontSubsets.mjs` (ASCII, the Latin-1 symbols,
    general punctuation, €, the minus; the basic Cyrillic block and №), which are also their
    `unicode-range`; rare accented Latin letters (the „ö“ in one photo credit) use the
    metric-adjusted system fallback;
  - only the layout features the site needs (`ccmp`, `locl`, `mark`, `mkmk`, `kern`, `liga`,
    `calt`, `tnum`, `lnum`); `locl` keeps the Bulgarian letterforms.

  The italic faces (Latin names, the wordmark) use `font-display: optional`: they are not
  preloaded, and swapping them in after the first paint moved the Latin name by a fraction of a
  pixel (CLS 0.00026 in CI). A first visit may show the metric-adjusted fallback italic; later
  visits use the cached face.

  The preloaded files now total about 71 KB, with a unit-tested budget of 75 KB. Lighthouse
  mobile LCP on the photo pages is about 1.8 s and Performance 100.

- **Dark mode.** The photos are unchanged; the plate surface frames them.

## 6. Accessibility requirements

- WCAG 1.1.1: the produce page photo has a meaningful Bulgarian `alt`; plate photos are
  decorative (`alt=""`).
- WCAG 1.3.1: the photo is a `<figure>` with a `<figcaption>`; the Latin name keeps
  `lang="la"`.
- WCAG 1.4.3: the caption and credit use `textMuted` on `background` (≥ 4.5:1, tested in
  spec 012).
- WCAG 2.4.4: credit links have names that make sense in context („Natasha Skov“, „Unsplash“)
  inside the caption „Снимка: …“.
- WCAG 2.5.8: credit links are inline text links (exempt as inline), and the caption line height
  keeps them apart.
- Spec 009: no CSS reordering; without CSS the photo shows at its attribute size (≤ 800 px).
- Zero axe violations in light and dark mode, and at 320 px.

## 7. SEO requirements

- Titles, descriptions and canonical URLs are unchanged.
- Image `alt` texts give search engines a description of each photo.
- `Article` JSON-LD on the produce page gets `image` with the absolute URL of the 1200 px
  JPEG.
- Lighthouse 100 in all four categories on the home, section and produce pages, with CLS 0.

## 8. Acceptance criteria

1. **AC1:** Given a produce record with a `photo`, when `alt`, `author`, `authorUrl`,
   `sourceName` or `sourceUrl` is missing or empty, or a URL is not `https`, then the schema
   rejects it; a record without `photo` is valid.
2. **AC2:** Given the seed data, then every produce has a photo with an `alt` of 10–120
   characters that is not only the produce name, and a credit, and its image file exists.
3. **AC3:** `toProduce` maps the record's photo to `produce.photo`; `Produce.create` rejects an
   empty `alt`, and `produce.photo` is `undefined` when the record has none.
4. **AC4:** `ProducePhoto` renders a `figure` with a `picture` that has AVIF and WebP sources
   with `srcset` and `sizes`, an `img` with the `alt`, numeric `width` and `height` ≤ 800,
   `loading="eager"` and `fetchpriority="high"`, and a `figcaption` with the Latin name in
   `lang="la"` and the linked credit.
5. **AC5:** `ProduceCard` in the plate variant renders a decorative `img` (`alt=""`) before the
   name when the produce has a photo, eager only when `priority` is set; the index variant and a
   produce without a photo render no `img`.
6. **AC6:** The built produce page's `Article` JSON-LD has an absolute `image` URL.
7. **AC7:** On the built produce and home pages: the photo loads as AVIF in Chromium, no image
   is broken, there are zero axe violations, and the spec 009 checks pass (e2e).
8. **AC8:** Lighthouse scores 100 × 4 and CLS is 0 on the home, section and produce pages
   (LHCI).

## 9. Test plan

| AC  | Type      | Test file                                                          |
| --- | --------- | ------------------------------------------------------------------ |
| AC1 | unit      | `tests/unit/contexts/catalog/infrastructure/photoSchema.test.ts`   |
| AC2 | unit      | `tests/unit/content/seed-photos.test.ts`                           |
| AC3 | unit      | `tests/unit/contexts/catalog/domain/ProducePhoto.test.ts`          |
| AC4 | component | `tests/components/ProducePhoto.test.ts`                            |
| AC5 | component | `tests/components/ProduceCard-015.test.ts`                         |
| AC6 | e2e       | `tests/e2e/produce-photos.spec.ts`                                 |
| AC7 | e2e       | `tests/e2e/produce-photos.spec.ts`, `readable-without-css.spec.ts` |
| AC8 | LHCI      | `lighthouserc.cjs` (CI)                                            |

QA regression tests (`QA 015`): image metadata kept as is (`ProducePhoto.test.ts`), plate
`sizes` (`ProduceCard-015.test.ts`), referral links (`ProducePhoto.test.ts` component), home
AVIF (`produce-photos.spec.ts`), font files and preload budget
(`tests/unit/design/fontSubsets.test.ts`).

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                                                                                                                                  | Topic                                  |
| ---------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| astro            | 7.4.8   | Context7 `/withastro/docs` (reference/modules/astro-content: `SchemaContext`, `image()`; guides/images; reference/modules/astro-assets: `<Picture>`, `widths`, `sizes`) | Image schema, Picture output           |
| astro            | 7.4.8   | `node_modules/astro/dist/content/config.d.ts` (`ImageFunction`, `SchemaContext`)                                                                                        | Image metadata shape and formats       |
| astro            | 7.4.8   | Context7 `/withastro/docs` (reference/content-loader-reference: `DataEntry.filePath`)                                                                                   | Image paths relative to the YAML entry |
| Unsplash         | current | Unsplash connector (`search_photos`, `download_asset`, `search_users`); Unsplash License; API attribution guideline (not reachable, see §5)                             | Sourcing, download tracking, credit    |
| subset-font      | 2.9.0   | `node_modules/subset-font/README.md` (`variationAxes`, `keepFeatures`, `targetFormat`)                                                                                  | Font instancing and subsetting         |
| lighthouse       | 13.6.0  | Local runs with the `lighthouserc.cjs` settings (mobile, simulated throttling)                                                                                          | LCP with photos and preloaded fonts    |
| WCAG 2.2         | 2023    | Understanding 1.1.1 (decorative images), 2.4.4, H67                                                                                                                     | Alt text, decorative images, links     |
