# ADR-0007: Google Privacy & messaging as the consent management platform

- **Status:** Accepted
- **Date:** 2026-11-13

## Context

ADR-0003 makes AdSense the fallback for ad slots without a direct sponsor. In the EEA, Google
requires consent collected by a Google-certified consent management platform (CMP) before it
serves personalised ads. The CMP had to be chosen before the consent banner and the lazy AdSense
fallback (#19) could be built. The options were:

- Google's own Privacy & messaging;
- a third-party certified CMP such as Cookiebot;
- dropping AdSense.

The owner chose Google Privacy & messaging on 2026-11-13 (issue #18).

## Decision

Sezon uses **Google Privacy & messaging** (the European regulations message, configured in the
owner's AdSense account) as its CMP.

- **Loading:**
  - The consent message is delivered by the AdSense tag itself. Google's Privacy & Messaging
    JavaScript API notes that „user messaging functionality can be deployed using existing Google
    Publisher or AdSense tags“.
  - Sezon therefore loads no separate CMP script. The AdSense tag, and with it the consent message,
    loads only when `PUBLIC_ADSENSE_CLIENT` is set.
  - It loads only when an empty ad slot nears the viewport (`IntersectionObserver`), never on page
    load.
- **Reopening the choice:** the cookies page offers a „Настройки за поверителност“ button. The
  button queues `googlefc.showRevocationMessage` on `googlefc.callbackQueue`, the only supported
  way to call the API. Without JavaScript, or when AdSense is off, the page explains that no
  cookies are set.
- **Configuration:** the message text, its languages and the vendors are configured in AdSense by
  the owner, not in the repository.

## Consequences

- There is no extra vendor or cost, and Google maintains the IAB TCF certification.
- Lighthouse never sees the tag or the message: the audit does not scroll to an ad slot.
- A reader sees the consent message only when they first scroll near an empty ad slot, not on
  arrival. Pages with a direct sponsor in every slot never load it.
- **Dependency on Google:** the message design is limited to what Google offers. Changing the CMP
  later means a new ADR and a change to the AdSense loader only.

## Sources

- Google, „Privacy & Messaging JavaScript API“,
  https://developers.google.com/funding-choices/fc-api-docs (fetched 2026-11-13): `callbackQueue`,
  `showRevocationMessage`, `CONSENT_DATA_READY`, deployment through AdSense tags.
