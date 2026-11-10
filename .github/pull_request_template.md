## Summary

<!-- What does this PR change and why? One short paragraph. -->

## Linked issue and spec

- Closes #
- Spec: `docs/specs/NNN-….md`

## Changes

-

## Verification

- [ ] Spec exists in `docs/specs/` with all sections filled, including accessibility and SEO.
- [ ] Tests were committed red before the implementation.
- [ ] All acceptance criteria have a passing test.
- [ ] `qa-reviewer` ran and every confirmed finding is fixed.
- [ ] `pnpm verify` passes (lint, types, unit, build, html-validate, e2e + axe).
- [ ] `pnpm lhci` reports 100 in all four categories (UI changes only).
- [ ] No UI string outside `src/i18n/bg.ts` or `src/data/**`.
- [ ] Comments follow the comment policy.

### UI changes

- [ ] Keyboard and visible focus checked (Tab through the page, skip link, no traps).
- [ ] Contrast uses design tokens; information is not conveyed by colour alone.
- [ ] Title ≤ 60 and description 70–160 characters, unique per page.
- [ ] JSON-LD is valid and matches the visible content.

## Screenshots

<!-- UI changes: before/after, mobile and desktop, light and dark. Delete for non-UI changes. -->

## Notes for the reviewer

<!-- Decisions, trade-offs, follow-ups, anything that needs attention. -->
