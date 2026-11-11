# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary:** a shopper at a market stall or in a shop in Bulgaria, on a phone, often with one
  hand free. Their job: find out what is in season right now, whether the produce in front of
  them is local and fresh or from storage, and how to pick a good one.
- **Secondary (served by the same pages):** home cooks planning meals or winter preserves, and
  home gardeners checking when to sow and plant. They read the same produce pages at home, on a
  phone or a laptop.
- All users read Bulgarian; the interface and content are Bulgarian only.

## Product Purpose

Sezon tells people in Bulgaria which fruits, vegetables, herbs and nuts are in season each month,
where in Bulgaria they grow best, what nutrients they bring, how to choose, store and prepare
them, and which local farms sell them. Success is a shopper who buys local produce at its best,
and a reader who trusts the figures because every one of them is sourced.

## Positioning

- **Only local and seasonal:** the site is built around the Bulgarian growing season, its 28
  provinces and local farms, not around imported produce or generic recipes.
- **Sourced, never promised:** every nutrition value, claim and traditional use cites a primary
  source (USDA FoodData Central, EFSA, EU regulations, Bulgarian institutes). Wording follows EU
  Regulation 1924/2006: no health promises.
- **Usable by everyone:** WCAG 2.2 AA, readable without CSS and without JavaScript, fast on a
  weak mobile connection.
- **Calm:** no pop-ups, interstitials or noisy ads. Advertising is direct sponsorship, clearly
  labelled, with consent-gated AdSense only as a lazy fallback (ADR-0003).

## Operating Context

- Used standing at a market or shop on a mid-range Android phone over mobile data, and at home
  when planning cooking, preserving or gardening.
- The home page shows the current month; every page links to month, produce, section, group,
  nutrient and farm pages. A printable year calendar exists for the kitchen wall.
- Content is edited as YAML in the repository and reviewed by the owner before entries are
  marked `reviewed`.

## Capabilities and Constraints

- Static site (Astro, Cloudflare Pages), zero JavaScript except the search page.
- Lighthouse: Accessibility, Best Practices and SEO at 100, Performance at least 95, CLS 0
  (ADR-0005).
- Every page must stay readable and usable without CSS: source order is the reading order and
  CSS never hides or reorders content (spec 009).
- Season level is never shown by colour alone (text + mark + colour).
- Content model, rules and sources: `AGENTS.md`, `docs/CONTENT-GUIDE.md`.
- Open: the domain name and the consent management platform.
- Decided: farms are real growers with sourced facts (spec 021); the „От хранилище“ season level
  stays, in plain words (redesign brief, #80).

## Brand Commitments

- Name: **Сезон**, written as a typographic wordmark.
- Voice: **informal „ти“, friendly and plain** (owner decision 2026-11-11). Existing UI strings
  still use „Вие“ forms („Вижте…“) and are to be migrated.
- Visual identity: the „stamp of origin“ direction in
  `docs/ADR/0006-visual-direction-stamp-of-origin.md` (stamp-blue shell, red only for „Разгар“,
  Sofia Sans with Sofia Sans Extra Condensed capitals for headings and stamps), replacing the
  botanical atlas of ADR-0004.

## Evidence on Hand

- Nutrition values for 13 seed produce, checked against USDA SR Legacy (`src/data/produce/`).
- One Unsplash photo per seed produce with credits (`src/assets/produce/`).
- Farms are placeholders (`isPlaceholder: true`); there are no real farms, testimonials, user
  numbers or press. Do not invent any.

## Product Principles

1. The season comes first: every page answers „what is good now“ before anything else.
2. No claim without a source, and no health promise.
3. Works for everyone, on any phone, with or without CSS and JavaScript.
4. Local over generic: Bulgarian months, provinces and farms, not a translated global guide.
5. Calm over attention-grabbing: content leads, sponsorship is labelled and never interrupts.

## Accessibility & Inclusion

WCAG 2.2 AA, zero axe violations, `lang="bg"` with Latin names in `lang="la"`, targets at least
24 × 24 px, `prefers-reduced-motion` and `prefers-color-scheme` respected, every page usable
without CSS and without JavaScript.
