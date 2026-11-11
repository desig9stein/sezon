# 023. Site shell: four-link navigation, catalogue page and compact footer

- **Status:** Approved
- **Bounded context(s):** catalog (`CatalogIndexService`), UI (layout, new page)
- **Related:** issue #92 (slice 2 of #82), brief `docs/design/brief.md` §3, ADR-0006, specs 010,
  014, 016, 017, 022

## 1. Goal

Give every page the stamp-of-origin shell: a stamp-blue header with four links that fit one row
on a phone, a catalogue page that collects what the old header listed (sections), plus the
groups and nutrients, and a footer whose month list becomes a compact year strip. The shopper
reaches what is in season faster because the header takes less of the first screen.

## 2. User stories

- As a shopper on a phone, I want the header to be one short bar, so that the produce list starts
  higher on the screen.
- As a reader, I want one place that lists every section, botanical family and nutrient.
- As anyone, I want to jump to any month from the bottom of any page.

## 3. Scope

### In scope

- **Header (`SiteHeader`):** `shell` background, `onShell` text, `focusOnShell` focus ring; the
  logo and four links: Сега (`/`), Каталог (`/katalog`), Календар (`/kalendar`), Търсене
  (`/tarsene`).
  - Current page: `aria-current="page"`.
  - Containing area: `aria-current="true"` for Каталог on section, produce, group and nutrient
    pages, and for Календар on month pages.
- **Catalogue page `/katalog`:**
  - an `h1` „Каталог“ and a short intro;
  - sections, each with its number of produce;
  - botanical families, each with its number of produce;
  - nutrients;
  - breadcrumbs, a `CollectionPage` JSON-LD listing the sections and families, and an entry in
    the sitemap.
- **Footer (`SiteFooter`):**
  - the month list becomes a year strip of 12 month links in one row from 48rem (6 per row
    from 30rem, 4 below, so 320 px does not scroll sideways), with the build month marked (`aria-current="date"`, marker fill with `onMarker`
    text and an ink border);
  - then the calendar link, the disclaimer and the copyright.
- **Strings:** new strings in `bg.ts`; the „Какво идва“ header link goes (the next month stays
  reachable from the year strip and the month pager).

### Out of scope

- The home list and season stamp (#93), the produce page (#94), data visuals (#95).
- Legal pages (Phase 4); the footer has none yet.

## 4. Domain model

- `CatalogIndexService` (catalog, application): `index()` returns
  - `sections`: every `ProduceKind` in `PRODUCE_KINDS` order with its produce count;
  - `groups`: every group, sorted by name, with its produce count;
  - `nutrients`: every nutrient, sorted by name.

  It is built from the produce, group and nutrient repositories.

## 5. Behaviour and edge cases

- A section or group with no produce still appears, with the count 0.
- The header's area marking never marks Сега for nested pages.
- At 320 px the four links may wrap to a second row; at 390 px and wider, the logo and the four
  links share one row.
- The footer's current month uses the marker only as a fill under dark text, with an ink border
  (spec 022: marker is not a boundary colour).

## 6. Accessibility requirements

- The header nav keeps `aria-label` „Основна навигация“; the footer year strip is a `nav` with its
  own label; link targets stay at least 44 px high.
- Text and focus contrast use the tested pairs (`onShell`/`shell`, `focusOnShell`/`shell`,
  `onMarker`/`marker`).
- Readable without CSS: the source order is logo, nav, main, footer; lists stay lists.
- Zero axe violations in light and dark mode on `/katalog` and the existing templates.

## 7. SEO requirements

- `/katalog`: unique title (≤ 60 characters) and description (70–160), canonical URL,
  `CollectionPage` JSON-LD, breadcrumbs, sitemap entry.
- Internal links from the catalogue to every section, group and nutrient page.

## 8. Acceptance criteria

1. **AC1:** Given `CatalogIndexService.index()`, it returns the sections in kind order with their
   counts, the groups by name with their counts (0 included), and the nutrients by name.
2. **AC2:** Given the header on any path, it has exactly four nav links in the order Сега,
   Каталог, Календар, Търсене with the paths above.
3. **AC3:** Given the header on `/plodove/yabalki`, `/grupi/rozotsvetni` or `/nutrienti/kaliy`,
   Каталог has `aria-current="true"`; on `/sezon/noemvri`, Календар has `aria-current="true"`;
   on `/katalog`, Каталог has `aria-current="page"`; Сега is never marked on nested pages.
4. **AC4:** Given the footer, it renders a labelled nav with 12 month links in calendar order and
   marks the build month with `aria-current="date"`, followed by the calendar link and the
   disclaimer.
5. **AC5:** Given the built `/katalog` page, it has one `h1`, links to every section, group and
   nutrient page, a `CollectionPage` JSON-LD and breadcrumbs, and passes axe in light and dark
   mode.
6. **AC6:** Given a 390 px wide page, the header is one row no taller than 64 px, and its
   background is the `shell` colour.

## 9. Test plan

| AC  | Type      | Test file                                                             |
| --- | --------- | --------------------------------------------------------------------- |
| AC1 | unit      | `tests/unit/contexts/catalog/application/CatalogIndexService.test.ts` |
| AC2 | component | `tests/components/SiteHeader-023.test.ts`                             |
| AC3 | component | `tests/components/SiteHeader-023.test.ts`                             |
| AC4 | component | `tests/components/SiteFooter-023.test.ts`                             |
| AC5 | e2e       | `tests/e2e/site-shell.spec.ts`                                        |
| AC6 | e2e       | `tests/e2e/site-shell.spec.ts`                                        |

## 10. Third-party documentation consulted

| Package / source | Version | Source                                                  | Topic                    |
| ---------------- | ------- | ------------------------------------------------------- | ------------------------ |
| astro            | 7.4.8   | Context7 `/withastro/docs` (static routes, `Astro.url`) | New page                 |
| WAI-ARIA         | 1.2     | `aria-current` values (`page`, `true`, `date`)          | Current page and month   |
| WCAG 2.2         | current | Understanding 2.4.8, 2.5.8, 1.4.11                      | Location, targets, focus |
