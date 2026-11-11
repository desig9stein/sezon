# ADR-0006: Visual direction, the stamp of origin

- **Status:** Accepted
- **Date:** 2026-11-11
- **Issue:** #81 (redesign epic #78; brief `docs/design/brief.md`; evidence `docs/design/evidence/`)
- **Supersedes:** the visual parts of ADR-0004 (palette, typography roles, home opener). Its
  decisions on self-hosted fonts and real photographs stay.

## Context

The design critique (#79) found the botanical-atlas look generic: its identity showed only in the
month word and the Latin names. Its home page also hid the produce below a full-screen month.
The brief (#80) fixed the job (the shopper at the stall, on a phone), the information
architecture, the season levels in plain words, four data visuals, real photos only, and three
anti-goals: no shop look, nothing heavy or slow, no dated folklore.

Four directions were sketched on the real November data (`docs/design/directions/`). The owner
hesitated between A (stamp of origin) and B (tear-off calendar), and chose A in a calmer variant.

## Decision

The site's visual world is **the stamp of origin**: stencilled produce crates and the rubber
stamps of origin and grade on them, translated into a working interface.

- **Palette (Committed):** stamp ultramarine owns the shell (header, navigation, key rules);
  near-white label paper for surfaces; stencil-black text; stamp red only for „Разгар“; one
  marker yellow only for the current month. Dark mode is its own scale (deep ink-blue ground,
  lighter stamp inks), not an inversion.
- **Type:** Sofia Sans Extra Condensed, in capitals, for the logo, headings and stamps only;
  Sofia Sans for body, navigation, lists and tables. Both are self-hosted subsets of the family
  already in use, so the font budget (≤ 110 KB) is kept.
- **Signature move:** the season stamp. The level is a stamp whose form carries the meaning:
  solid „Разгар“, outlined „В сезон“, hatched „От хранилище“; out of season has no stamp, only
  the words. The 12-month strip uses the same three forms, with the current month outlined in
  marker yellow. The text label is always present (WCAG 1.4.1).
- **Calm:** capitals only in headings and stamps; stamps upright in lists (only the large stamp at
  the top of the produce page is tilted); hairline rules, no shadows; no motion beyond the
  existing reduced-motion rules.

## Consequences

- The redesign slices (#82) implement this world on top of the brief's structure: tokens and
  type first, then the shell, the home list, the produce page and the data visuals.
- `DESIGN.md` describes the built system; it is rewritten when the tokens slice ships, not before.
- Contrast for every new token pair is checked by `src/design/contrast.ts` tests, in both modes.
- Risk: stamps on produce can read as a shop. The calmer variant, the absence of prices or
  calls to buy, and the anti-goals in the brief guard against it; each slice's QA checks it.
- B (tear-off calendar) remains the documented runner-up if A fails in implementation.
