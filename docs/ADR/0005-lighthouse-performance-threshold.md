# ADR-0005: Lighthouse Performance threshold of 95

- **Status:** Accepted
- **Date:** 2026-11-11

## Context

Since Phase 0, every audited page has had to score 1.0 in all four Lighthouse categories. Produce
photos (spec 015) made a photo the largest contentful paint on the produce, section and month
pages. In Lighthouse's mobile simulation (slow 4G, 4× CPU) the photo competes with the preloaded
web fonts. It took subsetting the fonts, re-encoding the photos at a lower quality and correcting
`sizes` to bring Performance back from 0.98–0.99 to 1.0, with LCP near 1.8 s. That is close to
the edge: one more image, font or script can drop a page to 0.99 again, and Performance also
varies by a point on shared CI runners.

Accessibility, Best Practices and SEO do not depend on content weight or runner speed, and
accessibility is a core promise of the site (WCAG 2.2 AA).

## Decision

The owner accepts a **Performance** score of at least **0.95** on every audited page.
**Accessibility, Best Practices and SEO stay at 1.0**, and the `cumulative-layout-shift`
assertion stays at 0.

- `lighthouserc.cjs` asserts `categories:performance` with `minScore: 0.95`.
- `AGENTS.md`, the pull request template and the Definition of Done state the same thresholds.
- The CI job keeps its name, `Lighthouse 100`, because branch protection may require it by name.

## Consequences

- Rich content (photos, later the region map and ads) no longer needs trade-offs whose only goal
  is the last Performance point.
- Performance work still matters: a drop below 0.95 fails CI, and specs keep measuring LCP and
  CLS.
- A regression from 1.0 to 0.95–0.99 no longer fails CI, so reviewers watch the Lighthouse
  report in PRs that add weight.
