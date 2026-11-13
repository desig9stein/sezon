# ADR-0003: Hybrid, non-intrusive advertising

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

The site earns from advertising but must keep Lighthouse at 100 and must not annoy users.
Third-party ad scripts (AdSense) hurt performance, layout stability and sometimes accessibility,
and in the EEA require consent (GDPR, Google Consent Mode v2 with a certified CMP).

## Decision

- **Direct sponsors first:** sponsor banners and sponsored farm cards are content entries,
  rendered as static HTML with `rel="sponsored"` and a visible „Реклама“ / „Спонсорирано“ label.
- **AdSense as fallback** for slots without a sponsor: loaded only after consent and only
  when the slot nears the viewport (`IntersectionObserver`), into a slot with reserved size.
- AdSense is disabled unless `PUBLIC_ADSENSE_CLIENT` is set.
- No ads above the fold on mobile; no interstitials, pop-ups or sticky ads.

## Consequences

- Lighthouse measures pages without third-party ad code, so scores stay at 100.
- Real users see AdSense only after consent and scrolling, which lowers ad revenue per view.
- The certified CMP is Google Privacy & messaging (ADR-0007).
