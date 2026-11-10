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
- Use **pnpm 12** (latest). Settings live in `pnpm-workspace.yaml`: an override
  `@puppeteer/browsers: 3.2.6` (the 3.2.7 tarball required by `@lhci/cli@0.16.0` is not
  downloadable) and `allowBuilds`. pnpm's default `minimumReleaseAge` (1 day) rejects packages
  published in the last 24 hours. CI uses `pnpm/setup@v3`.

## Consequences

- Fast, cacheable pages from a CDN; no server to maintain.
- A server-side feature (e.g. a form) later needs a Cloudflare Pages Function or Worker.
- The home page reflects the build date. There is no client-side fallback script (spec 004);
  the daily rebuild keeps the month current.
- GitHub runs `schedule` workflows only from the default branch and may disable them after 60
  days without repository activity. If that becomes a risk, move the trigger to a Cloudflare
  Cron Trigger (Worker) that calls the deploy hook.
- Lighthouse CI uses the best of three runs (`aggregationMethod: 'optimistic'`): Performance
  varies by about one point on shared runners even without JavaScript, while Accessibility,
  Best Practices and SEO are deterministic.
- `PUBLIC_SITE_URL` must be a real environment variable at build time (e.g. Cloudflare Pages
  settings); `astro.config.mjs` is evaluated before `.env` files are loaded.
