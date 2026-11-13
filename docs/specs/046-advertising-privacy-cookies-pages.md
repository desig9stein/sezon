# 046. Advertising, privacy and cookies pages

- **Status:** Approved (legal text pending the owner's review, see below)
- **Bounded context(s):** UI, composition (site configuration)
- **Related:** issue #20, ADR-0003 (hybrid advertising), ADR-0007 (Google Privacy & messaging),
  spec 031 (about and methodology), spec 037 (sponsors and ad slot), spec 045 (consent and lazy
  AdSense)

> **Owner review required.** The privacy policy and the cookies page are legal text. Issue #20
> says legal text is not final until the owner reviews it. The pages state only what the site does
> today and claim nothing that has not been decided (for example, no retention period). The owner
> reviews the wording before the pull request is merged.

## 1. Goal

A site that may show sponsored content and Google ads needs three plain pages:

- `/reklama`: what Sezon offers sponsors and farms, and the rules that keep advertising apart from
  the data;
- `/poveritelnost`: the privacy policy, limited to what the site actually does;
- `/biskvitki`: the cookies in use (none from Sezon today) and, when AdSense is on, a button that
  reopens Google's consent message (ADR-0007).

The footer links all three, and the about page's privacy section links the privacy and cookies
pages.

## 2. User stories

- As a business or farm, I want to know how advertising on Sezon works and whom to write to.
- As a reader, I want to know what data the site collects, who is responsible for it and which
  cookies are set.
- As a reader who accepted or refused Google's cookies, I want to change my choice.

## 3. Scope

### In scope

- **Routes** in `src/components/layout/routes.ts`: `advertising` `/reklama`, `privacy`
  `/poveritelnost`, `cookies` `/biskvitki`. The route-key test is updated.
- **Pages** `src/pages/reklama.astro`, `src/pages/poveritelnost.astro`,
  `src/pages/biskvitki.astro`: `BaseLayout` with breadcrumbs (Начало → page) and `WebPage`
  JSON-LD, one `h1`, `h2` sections, the shared `info-page` styles.
- **Component** `src/components/ads/PrivacySettings.astro` and its island
  `src/components/ads/privacySettings.ts`.
- **i18n:** `ui.advertising`, `ui.privacy`, `ui.cookies`, new footer labels, new about link labels.
- **Footer:** links to the three pages.
- **About page:** the privacy section links `/poveritelnost` and `/biskvitki`; the advertising
  section links `/reklama`.

### Out of scope

- Prices, audience numbers or media kits (none are decided).
- Data retention periods, legal bases beyond what the site does, data processing agreements.
- Any change to the consent message itself (configured in AdSense, ADR-0007).
- Lighthouse URLs: the other info pages (`/za-nas`, `/metodologiya`) are not in
  `lighthouserc.cjs`, so these are not added either.

## 4. Domain model

No domain change. The pages read:

- `CONTACT_EMAIL` and `SITE_OWNER` from `src/composition/contact.ts`;
- `ADSENSE` from `src/composition/adsense.ts` (spec 045);
- `GOOGLE_PARTNER_SITES_URL = 'https://policies.google.com/technologies/partner-sites'`, Google's
  page „How Google uses information from sites or apps that use our services“, as a named constant
  in `src/components/ads/googlePolicies.ts`.

Island logic (`src/components/ads/privacySettings.ts`):

- `queueRevocationMessage(target)`: creates `googlefc` and `googlefc.callbackQueue` when missing,
  then pushes a function that calls `googlefc.showRevocationMessage()`. A bare function in the queue
  runs when consent data is ready (Privacy & Messaging JavaScript API). The function is a wrapper,
  not `googlefc.showRevocationMessage` itself, because that method exists only after Google's
  script has loaded.
- `ensureAdSenseScript(document, client)`: appends the AdSense tag (spec 045's
  `appendAdSenseScript`) unless a tag script is already on the page. The cookies page has no ad
  slot, so without this the message script would never load and the button would do nothing.
- `initPrivacySettings(target)`: finds `button[data-privacy-settings]`, removes its `hidden`
  attribute and, on click, ensures the tag and queues the revocation message.

## 5. Behaviour and edge cases

- **`/reklama`** (`h2` sections, in this order):
  1. „Какво предлагаме“: a sponsored banner on produce and month pages, after the main content and
     never at the top of the page; a sponsored farm, listed first among the farms on produce and
     region pages (as `ProduceDetailsQuery` and `RegionPagesQuery` do today). A farm must still
     meet the content rules (real, with sources).
  2. „Как отбелязваме рекламата“: banners are labelled „Реклама“, sponsored farms „Спонсорирано“,
     and sponsor links carry `rel="sponsored"`.
  3. „Рекламата не променя данните“: a sponsor cannot change seasons, nutrition values, regions,
     traditional uses or the facts about a farm.
  4. „Връзка“: a `mailto:` link to `CONTACT_EMAIL`.
     No prices and no audience numbers.
- **`/poveritelnost`** (`h2` sections, in this order):
  1. „Кой отговаря за данните“: the controller is `SITE_OWNER.name`, with a `mailto:` link to
     `CONTACT_EMAIL`.
  2. „Какво събира сайтът“: no cookies and no analytics from Sezon.
  3. „Имейл“: an email and its content are used only to answer.
  4. „Сигнали в GitHub“: reports in GitHub are public, with the profile name.
  5. „Реклами от Google“: with AdSense off, the site shows no Google ads, so Google sets no cookies
     through it. With AdSense on, slots without a sponsor may show Google ads, and Google may set
     cookies only after consent given in Google's privacy message. Both states link the cookies
     page.
- **`/biskvitki`** (`h2` sections, in this order):
  1. „Бисквитки на Сезон“: Sezon sets none.
  2. „Бисквитки на Google“: AdSense off: none, because no Google ads load. AdSense on: Google's
     cookies only after consent, through the Privacy & messaging message, which appears when the
     reader first nears an ad slot. Both states link Google's partner-sites page.
  3. „Настройки за поверителност“:
     - AdSense off: a sentence that no consent is stored, because there is nothing to consent to;
       no button and no script.
     - AdSense on: a `<button type="button" data-privacy-settings data-ad-client="…" hidden>`
       „Настройки за поверителност“, revealed by the island; and a sentence for readers without
       JavaScript: without JavaScript Google's ads and message do not load and no cookies are set,
       so there is no choice to change. The sentence is always visible (nothing is hidden or
       revealed by CSS).
- **Footer:** after „Добави своята ферма“, links „Реклама“ `/reklama`, „Поверителност“
  `/poveritelnost`, „Бисквитки“ `/biskvitki`.
- **About page:** the privacy section gets links „Политика за поверителност“ and „Бисквитки“; the
  advertising section gets „Реклама в Сезон“ to `/reklama`.
- **Meta:** titles at most 60 characters with the ` | Сезон` suffix, descriptions 70–160
  characters.

## 6. Accessibility requirements

- **1.3.1 / 2.4.6:** one `h1` per page, then `h2` sections each labelled by its heading
  (`aria-labelledby`), as on the methodology page.
- **2.4.4:** link texts name their target („Политика за поверителност“, „Бисквитки“, the email
  address, Google's page title in Bulgarian).
- **2.1.1 / 2.4.7 / 2.5.8:** the privacy settings control is a native `<button>`, keyboard
  operable, with the global `:focus-visible` outline and at least `--target-min` high.
- **4.1.2:** the button's name is its visible text.
- **1.4.3:** body text and links use the existing tokens; the button uses the accent pair already
  used by the search button.
- **Without JavaScript:** the button stays `hidden`; the explanatory sentence is shown.
- **Without CSS:** headings and paragraphs read in source order; nothing is hidden by CSS.
- **1.4.10:** no horizontal scroll at 320 px.
- **Light and dark mode:** no axe violations in either.

## 7. SEO requirements

- Unique titles and descriptions (section 5, „Meta“); canonical, Open Graph and Twitter tags from
  `BaseLayout`.
- `WebPage` JSON-LD and a `BreadcrumbList` (Начало → page).
- Internal links: footer on every page, about ↔ privacy, cookies and advertising pages, privacy →
  cookies.
- The pages are in the sitemap (static routes).

## 8. Acceptance criteria

1. **AC1:** Given the routes helper, then `advertising`, `privacy` and `cookies` are `/reklama`,
   `/poveritelnost` and `/biskvitki`, and the sorted key list includes them.
2. **AC2:** Given the three pages' strings, then each title with ` | Сезон` is at most 60
   characters and each description is 70–160 characters.
3. **AC3:** Given a page that has loaded no Google script, when `queueRevocationMessage` runs, then
   `googlefc.callbackQueue` holds one function that calls `googlefc.showRevocationMessage` once
   it is run after Google's script defines it; an existing queue is kept.
4. **AC4:** Given the cookies page with AdSense on, when `initPrivacySettings` runs, then the button
   is revealed; when it is clicked twice, the AdSense tag is appended once and two revocation
   calls are queued. Given no button, it does nothing.
5. **AC5:** Given AdSense on, when `PrivacySettings` is rendered, then it has a hidden
   `<button type="button" data-privacy-settings>` „Настройки за поверителност“ with the client and
   the no-JavaScript sentence; given AdSense off, it has the no-consent sentence, no button and no
   script.
6. **AC6:** Given the built site, when `/reklama`, `/poveritelnost` and `/biskvitki` load, then each
   returns 200 and has one `h1` and its `h2` sections in order.
7. **AC7:** Given `/reklama`, then it labels banners „Реклама“ and farms „Спонсорирано“, says
   sponsors do not change the data, links `mailto:` the contact email, and contains no price
   (`лв`, `€`, `EUR`).
8. **AC8:** Given `/poveritelnost`, then it names the owner as controller with the contact email,
   says there are no cookies or analytics, that email is used only to answer, that GitHub reports
   are public, and links `/biskvitki`.
9. **AC9:** Given `/biskvitki` with AdSense off (CI), then it says Sezon sets no cookies, links
   Google's partner-sites page, says no consent is stored, and has no privacy settings button.
10. **AC10:** Given any page, then the footer links `/reklama`, `/poveritelnost` and `/biskvitki`.
11. **AC11:** Given `/za-nas`, then its privacy section links `/poveritelnost` and `/biskvitki` and
    its advertising section links `/reklama`.
12. **AC12:** Given each new page, then its JSON-LD includes `WebPage` and `BreadcrumbList`.
13. **AC13:** Given each new page in light and dark mode, then axe reports no violation; at 320 px
    it does not scroll sideways; without CSS its headings read `h1` then `h2`s.

## 9. Test plan

| AC   | Test type | Test file                                                               |
| ---- | --------- | ----------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/components/routes-046.test.ts`, `qa004-regressions.test.ts` |
| AC2  | unit      | `tests/unit/i18n/legalMeta.test.ts`                                     |
| AC3  | unit      | `tests/unit/components/ads/privacySettings.test.ts`                     |
| AC4  | unit      | `tests/unit/components/ads/privacySettings.test.ts`                     |
| AC5  | component | `tests/components/PrivacySettings.test.ts`                              |
| AC6  | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC7  | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC8  | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC9  | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC10 | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC11 | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC12 | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |
| AC13 | e2e       | `tests/e2e/legal-pages.spec.ts`                                         |

## 10. Third-party documentation consulted

| Package / source           | Version | Source (URL or Context7 ID)                                                         | Topic                                                                                                                                                                                                               |
| -------------------------- | ------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google Privacy & messaging | –       | https://developers.google.com/funding-choices/fc-api-docs (fetched 2026-11-13)      | `window.googlefc = window.googlefc \|\| {}`, `callbackQueue` (functions or event maps; „the only supported way to invoke any function“; a bare function runs when consent data is ready), `showRevocationMessage()` |
| Google                     | –       | https://policies.google.com/technologies/partner-sites (link target, per issue #20) | How Google uses information from sites that use its services                                                                                                                                                        |
| Google AdSense             | –       | `/websites/support_google_adsense` (Context7, 2026-11-13)                           | The AdSense tag URL loaded by the button (as in spec 045)                                                                                                                                                           |
| astro                      | 7.4.8   | `/withastro/docs` (Context7): `guides/client-side-scripts.mdx`                      | Processed scripts rendered only with the component that declares them                                                                                                                                               |
| happy-dom                  | 21.0.4  | `node_modules/happy-dom` type definitions (`Window`)                                | A DOM for the island's unit test                                                                                                                                                                                    |
