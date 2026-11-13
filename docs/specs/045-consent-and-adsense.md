# 045. Consent and lazy AdSense fallback

- **Status:** Approved
- **Bounded context(s):** composition (site configuration), UI (advertising components)
- **Related:** issue #19, ADR-0003 (hybrid advertising), ADR-0007 (Google Privacy & messaging),
  ADR-0005 (Lighthouse), spec 037 (sponsors and ad slot), spec 046 (privacy and cookies pages)

## 1. Goal

ADR-0003 makes Google AdSense the fallback for ad slots that have no direct sponsor, and ADR-0007
makes Google Privacy & messaging, delivered by the AdSense tag itself, the consent management
platform. This feature lets the owner switch AdSense on with environment variables. When it is on,
an ad slot without a sponsor renders an empty, size-reserved box with an AdSense ad unit, and a
small script loads the AdSense tag (and with it the consent message) only when such a slot nears the
viewport. When it is off, which is the default and today's state, nothing AdSense-related is
rendered or requested.

## 2. User stories

- As a reader, I want no third-party code to load when I open a page, so that the site stays fast
  and private until I scroll to an ad.
- As a reader in the EEA, I want to be asked for consent before Google uses cookies for ads.
- As the site owner, I want to turn AdSense on or off with environment variables, and have the build
  fail on a mistyped publisher id.

## 3. Scope

### In scope

- **Configuration** (`src/composition/adsense.ts`):
  - `PUBLIC_ADSENSE_CLIENT`: the publisher id, `ca-pub-` followed by 10–20 digits. Blank or unset
    turns AdSense off.
  - `PUBLIC_ADSENSE_SLOT`: the ad unit id from the AdSense ad code (`data-ad-slot`), digits only.
    Every ad unit code in Google's documentation carries a `data-ad-slot`, so it is required when
    the client is set.
  - Both documented in `.env.example`.
- **UI:**
  - `AdSlot` takes an optional `adsense` configuration. Without a sponsor and with AdSense on, it
    renders the reserved box with an `<ins class="adsbygoogle">`.
  - `AdSenseLoader.astro`: renders only the island `<script>`, and `AdSlot` renders it only in the
    AdSense branch, so pages without an AdSense box get no script.
  - `adsenseLoader.ts`: the island's logic, with pure, testable parts.
- **Pages:** the produce and month pages pass the configuration to `AdSlot`.
- **CSP** (`public/_headers`): the hosts the AdSense tag and the consent message are known to use.

### Out of scope

- The privacy, cookies and advertising pages and the „Настройки за поверителност“ button (spec 046).
- Message text, languages and vendors: configured in the AdSense account (ADR-0007).
- Auto ads, ad blocking recovery messages, analytics.
- A nonce-based CSP (see section 5, „CSP“).

## 4. Domain model

No domain change. Configuration lives in the composition root:

- `interface AdSenseConfig { readonly client: string; readonly slot: string }`.
- `adsenseConfig(client: string | undefined, slot: string | undefined): AdSenseConfig | undefined`:
  - trims both values;
  - returns `undefined` when the client is blank or unset (AdSense off), whatever the slot;
  - throws `InvalidConfigurationError` when the client does not match `/^ca-pub-\d{10,20}$/`;
  - throws `InvalidConfigurationError` when the client is set and the slot is blank or not digits
    only (`/^\d+$/`);
  - otherwise returns a frozen `{ client, slot }`.
- `ADSENSE: AdSenseConfig | undefined`: `adsenseConfig` applied to
  `import.meta.env.PUBLIC_ADSENSE_CLIENT` and `PUBLIC_ADSENSE_SLOT`, evaluated once at build time.

Island logic (`src/components/ads/adsenseLoader.ts`):

- `ADSENSE_SCRIPT_URL = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js'`.
- `LOAD_ROOT_MARGIN = '200px 0px'`: the slot counts as near the viewport 200 px before it enters.
- `adsenseScriptUrl(client)`: the tag URL with `?client=<client>` (as in Google's ad code).
- `nearTargets(entries)`: the targets of the entries that intersect (pure).
- `loadOnce(load)`: returns a function that calls `load` on its first call only.
- `initAdSense(environment)`: the side-effecting entry point, with `document`, the
  `IntersectionObserver` constructor (may be missing) and the `adsbygoogle` queue holder injected.

## 5. Behaviour and edge cases

- **AdSense off** (client blank or unset, the CI default):
  - `AdSlot` without a sponsor renders nothing, as in spec 037: no `<aside>`, no `<ins>`, no
    script.
  - No page requests `googlesyndication` or `fundingchoicesmessages` hosts.
- **AdSense on, sponsor active:** the sponsor wins (ADR-0003); the slot is the spec 037 banner and no
  `<ins>` or script is rendered for that slot.
- **AdSense on, no sponsor:** the slot renders
  `<aside class="ad-slot ad-slot--adsense" aria-labelledby="ad-slot-<placement>-label" data-placement="…">`
  with the visible „Реклама“ label, then a box `<div class="ad-slot__box">` with the 4:1
  `aspect-ratio`, holding Google's ad unit markup:
  `<ins class="adsbygoogle" style="display:block" data-ad-client="<client>" data-ad-slot="<slot>">`.
  The `<ins>` fills the box through CSS (`width: 100%; height: 100%`), which Google's ad code
  policy allows („ad sizes adjusted through CSS“), so the ad unit is sized by the reserved box and
  there is no layout shift. No `data-ad-format="auto"`: a responsive unit may resize itself and
  shift the layout.
- **Island:**
  - Runs once per page (Astro deduplicates processed scripts).
  - Finds every `ins.adsbygoogle` that has a `data-ad-client` and no `data-sezon-requested`.
    None: does nothing.
  - `IntersectionObserver` missing: does nothing (no ads, no consent message, no requests).
  - Observes the slots with `rootMargin` `200px 0px`. Never loads anything on page load.
  - When a slot is near: loads the tag once per page (an `async` `<script>` with
    `crossorigin="anonymous"` and the `client` query, appended to `<head>`), pushes `{}` onto
    `window.adsbygoogle` (creating the array when missing), marks the slot
    `data-sezon-requested`, and stops observing it.
  - Further near slots push again, but never append a second tag.
- **Without JavaScript:** the empty box and its label stay; no ad and no consent message load. The
  label is accurate: the space is reserved for advertising.
- **Without CSS:** the `<ins>` is empty and takes no space; the label reads „Реклама“.
- **Lighthouse:** the audit does not scroll, and the slots sit below the fold (spec 037), so the
  audit never loads the tag. CI builds with AdSense off in any case.
- **Configuration errors fail the build** with `InvalidConfigurationError`: a client such as
  `pub-123`, `ca-pub-12`, or a slot with letters.
- **CSP:** Google's AdSense help page „Integrate the AdSense ad code with a Content Security Policy“
  supports only a strict, nonce-based policy with `'strict-dynamic'`, because the hosts the ad code
  uses change over time. A static Cloudflare Pages site cannot issue a fresh nonce per response
  without a Pages Function. This feature therefore adds a host allowlist, limited to hosts named in
  Google documentation or observed for the consent message:
  - `script-src`: `https://pagead2.googlesyndication.com` (the AdSense tag) and
    `https://fundingchoicesmessages.google.com` (the Privacy & messaging script);
  - `img-src` and `connect-src`: `https://pagead2.googlesyndication.com`,
    `https://googleads.g.doubleclick.net`, `https://www.google.com` (Google tag platform CSP guide);
    `connect-src` also `https://fundingchoicesmessages.google.com`;
  - `frame-src`: `https://googleads.g.doubleclick.net` and
    `https://fundingchoicesmessages.google.com`.
  - **Owner action before enabling AdSense:** load a page with AdSense on, scroll to a slot, and
    check the browser console for CSP violations; add exactly the reported hosts, or move to a
    nonce-based policy with a Pages Function (new ADR). While AdSense is off these hosts are never
    contacted.

## 6. Accessibility requirements

- **1.3.1 / 1.3.2:** the AdSense slot is the same `<aside>` landmark as a sponsor slot, named by its
  visible „Реклама“ label through `aria-labelledby`; the label precedes the box. It stays a direct
  child of the `<article>` (produce) or of `<main>` (month), never inside a labelled section
  (`landmark-complementary-is-top-level`).
- **1.4.3:** the label uses `--color-text-muted` on `--color-background` (an already required
  pair).
- **2.4.3 / 2.1.1:** the box adds no focusable element of its own; the ad iframe Google inserts is
  outside the site's control.
- **Without JavaScript:** the page is complete; only the ad is missing.
- **Reduced motion:** the site adds no animation.
- The consent message is Google's (ADR-0007); its accessibility is Google's responsibility.

## 7. SEO requirements

- No change to titles, descriptions, canonicals or structured data.
- No third-party request on load, so LCP, CLS and TBT stay as measured today (ADR-0005).
- The `<ins>` has no text, so it adds nothing to the indexed content.

## 8. Acceptance criteria

1. **AC1:** Given a blank or unset client, when `adsenseConfig` is called, then it returns
   `undefined`, whatever the slot.
2. **AC2:** Given `ca-pub-` plus 16 digits and a digit-only slot (with surrounding spaces), when
   `adsenseConfig` is called, then it returns a frozen config with the trimmed values.
3. **AC3:** Given a client that does not match `/^ca-pub-\d{10,20}$/`, or a valid client with a blank
   or non-digit slot, when `adsenseConfig` is called, then it throws `InvalidConfigurationError`.
4. **AC4:** Given AdSense on and no sponsor, when `AdSlot` is rendered, then it renders the labelled
   `<aside>` with the 4:1 box holding `<ins class="adsbygoogle" style="display:block">` with the
   client and slot, and the island script.
5. **AC5:** Given AdSense off and no sponsor, when `AdSlot` is rendered, then the output is empty.
6. **AC6:** Given AdSense on and a sponsor, when `AdSlot` is rendered, then it renders the sponsor
   banner and no `<ins>` and no script.
7. **AC7:** Given entries of which some intersect, when `nearTargets` is called, then it returns the
   intersecting targets only.
8. **AC8:** Given a function wrapped by `loadOnce`, when the wrapper is called three times, then the
   function runs once.
9. **AC9:** Given a page with an AdSense slot and a fake observer, when `initAdSense` runs, then it
   observes the slot with `rootMargin` `200px 0px` and appends no script before the slot is near.
10. **AC10:** Given the slot comes near (twice, and a second slot after it), when the observer
    reports it, then exactly one tag script with the client URL, `async` and
    `crossorigin="anonymous"` is appended, one `{}` is pushed per slot, and each slot is unobserved.
11. **AC11:** Given no `IntersectionObserver`, or no AdSense slot, when `initAdSense` runs, then it
    appends no script and pushes nothing.
12. **AC12:** Given the default build (AdSense off), when produce and month pages load and are
    scrolled to the bottom, then no request goes to `googlesyndication` or
    `fundingchoicesmessages` and there is no `adsbygoogle` markup.
13. **AC13:** Given the built `_headers`, then the CSP allows the AdSense and Funding Choices script
    hosts in `script-src` and still forbids framing the site (`frame-ancestors 'none'`).
14. **AC14:** Given `.env.example`, then it documents `PUBLIC_ADSENSE_CLIENT` and
    `PUBLIC_ADSENSE_SLOT`.

## 9. Test plan

| AC   | Test type | Test file                                                 |
| ---- | --------- | --------------------------------------------------------- |
| AC1  | unit      | `tests/unit/composition/adsense.test.ts`                  |
| AC2  | unit      | `tests/unit/composition/adsense.test.ts`                  |
| AC3  | unit      | `tests/unit/composition/adsense.test.ts`                  |
| AC4  | component | `tests/components/AdSlot-045.test.ts`                     |
| AC5  | component | `tests/components/AdSlot-045.test.ts`                     |
| AC6  | component | `tests/components/AdSlot-045.test.ts`                     |
| AC7  | unit      | `tests/unit/components/ads/adsenseLoader.test.ts`         |
| AC8  | unit      | `tests/unit/components/ads/adsenseLoader.test.ts`         |
| AC9  | unit      | `tests/unit/components/ads/adsenseLoader.test.ts`         |
| AC10 | unit      | `tests/unit/components/ads/adsenseLoader.test.ts`         |
| AC11 | unit      | `tests/unit/components/ads/adsenseLoader.test.ts`         |
| AC12 | e2e       | `tests/e2e/adsense.spec.ts`                               |
| AC13 | e2e       | `tests/e2e/adsense.spec.ts` (reads `dist/_headers`)       |
| AC14 | unit      | `tests/unit/composition/adsense.test.ts` (reads the file) |

## 10. Third-party documentation consulted

| Package / source           | Version | Source (URL or Context7 ID)                                                                                                                                                                     | Topic                                                                                                                                                                                                                                                    |
| -------------------------- | ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Google AdSense             | –       | `/websites/support_google_adsense` (Context7, 2026-11-13): answers 105516, 10078316, 10762946, 1354736                                                                                          | Ad unit markup: `adsbygoogle.js?client=…` with `async` and `crossorigin="anonymous"`, `<ins class="adsbygoogle" style="display:block" data-ad-client data-ad-slot>`, `(adsbygoogle = window.adsbygoogle \|\| []).push({})`                               |
| Google AdSense             | –       | `/websites/support_google_adsense` (Context7, 2026-11-13): answers 10734935, 1354736                                                                                                            | Responsive units resize; ad sizes may be set through CSS; a parent without width breaks responsive units                                                                                                                                                 |
| Google AdSense             | –       | https://support.google.com/adsense/answer/16283098 (search result summary, 2026-11-13; the page itself is not reachable from the build session's network)                                       | AdSense supports only a strict CSP: a nonce, `'strict-dynamic'`, `https:` fallback; no host allowlist is published                                                                                                                                       |
| Google Tag Platform        | –       | https://developers.google.com/tag-platform/security/guides/csp (fetched 2026-11-13)                                                                                                             | Hosts for Google Ads tags: `pagead2.googlesyndication.com`, `googleads.g.doubleclick.net`, `www.google.com` in `img-src` and `connect-src`                                                                                                               |
| Google Privacy & messaging | –       | https://developers.google.com/funding-choices/fc-api-docs (fetched 2026-11-13)                                                                                                                  | Messages are deployed by the existing AdSense tag; `googlefc.callbackQueue`                                                                                                                                                                              |
| Cloudflare Radar           | –       | https://v2.radar.cfdata.org/ko-kr/scan/beeef79d-314e-46f7-a436-018a9e9392cc/summary, a scan listing `fundingchoicesmessages.google.com` as an AdSense script source (search result, 2026-11-13) | The Privacy & messaging script host (confirmed on 2026-11-13: in a local build with a test publisher id, the AdSense tag requested `https://fundingchoicesmessages.google.com/i/<client>` and further scripts from `pagead2.googlesyndication.com` only) |
| astro                      | 7.4.8   | `/withastro/docs` (Context7): `guides/client-side-scripts.mdx`, `guides/upgrade-to/v5.mdx`                                                                                                      | Processed `<script>` tags are bundled, deduplicated, `type="module"`, and rendered only where the component that declares them is rendered                                                                                                               |
| happy-dom                  | 21.0.4  | `node_modules/happy-dom` type definitions (`Window`)                                                                                                                                            | A DOM for the island's unit test                                                                                                                                                                                                                         |
