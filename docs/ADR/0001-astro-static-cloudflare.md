# ADR-0001: Astro 7 static site on Cloudflare Pages

- **Status:** Accepted
- **Date:** 2026-11-10

## Context

The site is content-driven, read-only for visitors, and must score 100 in all Lighthouse
categories. Content changes are infrequent (seasonal) and are edited as files in git.
The "current season" depends on today's date.

## Decision

- Use **Astro 7.4.8** with `output: 'static'`, deployed to **Cloudflare Pages**.
- Ship zero client JavaScript by default; small vanilla `<script>` islands only when a spec requires it.
- Keep the home page current by **rebuilding daily** (GitHub Actions cron → Cloudflare Pages deploy hook).
- Use **TypeScript 6.0.x**. TypeScript 7 is released, but `@astrojs/check@0.9.12` and
  `typescript-eslint@8.72.2` declare peer support only up to 6.x. Revisit when they support 7.
- Use **pnpm** with an override `@puppeteer/browsers: 3.2.6`, because the 3.2.7 tarball
  required by `@lhci/cli@0.16.0` is not downloadable from the registry.

## Consequences

- Fast, cacheable pages from a CDN; no server to maintain.
- A server-side feature (e.g. a form) later needs a Cloudflare Pages Function or Worker.
- The home page reflects the build date; between builds a small inline script shows a link
  to the correct month if the visitor's month differs from the build month.
