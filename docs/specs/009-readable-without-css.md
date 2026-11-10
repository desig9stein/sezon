# 009. Every page is readable and usable without CSS

- **Status:** Approved
- **Bounded context(s):** UI (all page templates)
- **Related:** AGENTS.md section 8, specs 003–006, issue #43, redesign #28

## 1. Goal

Guarantee that every page stays readable and usable when CSS does not apply: user style sheets,
text browsers, reader modes, high-contrast modes and failed style loads. The semantic HTML alone
must give a logical reading order, and CSS may only decorate, never hide, reveal or reorder
content. Automated checks make this a quality gate for every page template, so the redesign
(#37) cannot break it.

## 2. User stories

- As a reader with my own style sheet or a text browser, I want the page to read in a sensible
  order, so that I understand it without the site's styles.
- As a screen-reader user, I want the reading order to match what sighted users see, so that we
  experience the same content in the same sequence.
- As the owner, I want CI to fail when a change hides content with CSS or reorders it, so that
  the rule in AGENTS.md is enforced, not just written down.

## 3. Scope

### In scope

- `tests/e2e/noCss.ts`: helpers that remove every style sheet, `<style>` element and `style`
  attribute from the loaded page, and that inspect computed styles.
- `tests/e2e/readable-without-css.spec.ts`: checks for every page template
  (home `/`, month `/sezon/noemvri`, produce `/zelenchutsi/zele`, not found `/404`) in the
  desktop and mobile Playwright projects.
- `.claude/agents/qa-reviewer.md`: a checklist item for readability without CSS.
- Fixes for any violation found, each with a regression test first.

### Out of scope

- Explicit grid placement (`grid-row`, `grid-column`, `grid-area`) that could reorder content:
  reviewed by the QA checklist, not detected automatically, because it is also used without
  reordering.
- Print styles (the printable calendar, #7).

## 4. Domain model

None. Test helpers only:

- `removeAllCss(page)`: deletes `link[rel~="stylesheet"]`, `<style>` and every `style`
  attribute, then waits for layout.
- `hiddenByCss(page)`: CSS selectors of elements in `<body>` whose computed `display` is `none`
  or `visibility` is `hidden`, excluding `script`, `style`, `template`, `noscript`, elements
  with the `hidden` attribute and `.visually-hidden` elements, and their descendants.
- `reorderedByCss(page)`: selectors of elements with a non-zero `order`, a `*-reverse` flex
  direction, `wrap-reverse`, or a `dense` grid auto-flow.

## 5. Behaviour and edge cases

- **With CSS (the site as shipped):**
  - No content is hidden by CSS alone. Exceptions are `.visually-hidden` text, elements with
    the `hidden` attribute, and the skip link, which is moved off screen with a transform and
    is not hidden.
  - No element is reordered by CSS.
  - No element has a positive `tabindex`, so the keyboard order is the DOM order.
- **Without CSS:**
  - The first focusable element is the skip link to `#main`.
  - Landmarks appear in this order: `header`, then the main navigation, then `main`, then
    `footer`.
  - The first heading inside `main` is the only `h1`.
  - Heading levels never skip a level.
  - Every `img`, `svg`, `video` and `iframe` either has `width` and `height` attributes
    (content media) or renders at most 128 × 128 CSS px (icons), so no icon fills the screen.
  - The desktop page has no horizontal scroll.
  - axe reports zero violations.
- `.visually-hidden` text becomes visible without CSS. That is accepted: the text is written
  to read naturally in place (e.g. „Сезон:“ before a badge).

## 6. Accessibility requirements

- WCAG 2.2 SC 1.3.1 Info and Relationships: structure comes from HTML, not presentation.
- SC 1.3.2 Meaningful Sequence: DOM order is the reading order; CSS does not reorder content.
- SC 2.4.3 Focus Order: no positive `tabindex`; focus follows the DOM.
- SC 1.4.12 Text Spacing and user style sheets: content survives the author styles being
  replaced.
- Zero axe violations with and without CSS.

## 7. SEO requirements

None directly. Crawlers read the same HTML; a logical source order also helps them.

## 8. Acceptance criteria

1. **AC1:** Given any page template with CSS, no element is hidden by CSS except `.visually-hidden`, `[hidden]`, non-rendered elements and their descendants.
2. **AC2:** Given any page template with CSS, no element uses `order`, a reversed flex direction, `wrap-reverse` or `dense` grid auto-flow.
3. **AC3:** Given any page template, no element has a positive `tabindex`.
4. **AC4:** Given any page template without CSS, the skip link to `#main` is the first focusable element, landmarks follow header → main navigation → main → footer, the first heading in `main` is the only `h1`, and heading levels never skip.
5. **AC5:** Given any page template without CSS, every image, SVG, video and iframe has `width` and `height` attributes or renders within 128 × 128 px, and on desktop the page does not scroll horizontally.
6. **AC6:** Given any page template without CSS, axe reports zero WCAG violations.
7. **AC7:** The `qa-reviewer` checklist includes readability without CSS.

## 9. Test plan

| AC      | Type | Test file                                                     |
| ------- | ---- | ------------------------------------------------------------- |
| AC1–AC6 | e2e  | `tests/e2e/readable-without-css.spec.ts` (desktop and mobile) |
| AC7     | unit | `tests/unit/repo/qa-checklist.test.ts`                        |

## 10. Third-party documentation consulted

| Package / source     | Version | Source                                                                    | Topic                                           |
| -------------------- | ------- | ------------------------------------------------------------------------- | ----------------------------------------------- |
| @playwright/test     | 1.63.0  | Context7 `/microsoft/playwright` (`page.evaluate`, `locator.boundingBox`) | Removing styles in the page, measuring elements |
| @axe-core/playwright | 4.14.0  | `node_modules/@axe-core/playwright` README (`AxeBuilder.analyze`)         | Scanning the page after styles are removed      |
| WCAG 2.2             | 2023    | Understanding 1.3.1, 1.3.2, 2.4.3 (w3.org/WAI/WCAG22/Understanding)       | Meaningful sequence, focus order                |
| MDN                  | current | `getComputedStyle`, CSS `order`, `flex-direction`, `grid-auto-flow`       | Detecting CSS that hides or reorders content    |
