# ADR-0008: Keystatic in local mode as a development-only CMS

- **Status:** Accepted
- **Date:** 2026-11-13

## Context

Issue #23 asks for a way for the owner to edit content (produce, farms, groups, regions, recipes,
sponsors) in a form instead of in YAML. `docs/PLAN.md` planned for this from the start: content
lives in `src/data/<collection>/<id>.yaml`, one file per entry, read by Astro content collections
and validated by the Zod schemas in `src/contexts/*/infrastructure/schemas.ts`. A CMS that writes
the same files to git needs no data migration.

Constraints:

- Production is `output: 'static'` on Cloudflare Pages (ADR-0001), with Lighthouse 100 and no
  client JavaScript by default (ADR-0005). The production build must not change: no admin route,
  no React bundle, no CSP change.
- Every change still goes through a pull request (AGENTS.md section 12), so the CMS must write
  files to the working tree, not to `main`.
- No data loss: saving an entry must not drop or change a value the CMS does not edit.

Options considered:

1. **Keystatic, local mode, dev only.** `@keystatic/astro` adds `/keystatic` (React admin) and
   `/api/keystatic` (file API). In local mode the API reads and writes files in the working tree.
2. **Keystatic, GitHub mode.** The admin commits to GitHub through a GitHub App. The routes are
   on-demand (`prerender: false`), so production would need a server adapter (Cloudflare Workers),
   a GitHub App and secrets (`KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`,
   `KEYSTATIC_SECRET`).
3. **Decap CMS.** Also git-based, but it needs a hosted admin page and an auth backend (Netlify
   Identity or an OAuth proxy) to write to GitHub, and has no local mode without a proxy server.
4. **No CMS.** Keep editing YAML by hand following `docs/CONTENT-GUIDE.md`.

Compatibility was checked for the installed versions before deciding:

- `@keystatic/astro@6.0.0` declares the peer `astro: '5 || 6 || 7'` and `react`/`react-dom`
  `^18.2.0 || ^19.0.0` (npm registry and its `package.json`).
- `@keystatic/core@0.6.9` reads and writes `format: { data: 'yaml' }` with `js-yaml@4.3.2`.
- `@astrojs/react@7.1.8` (React 19.3.1) is the React renderer the admin page needs.
- `astro dev` with these versions serves `/keystatic`, lists all seven collections and saves
  entries (checked with Playwright on 2026-11-13). One fix was needed: the React renderer's
  `react-dom/client` include did not reach Vite's dependency optimizer, so the browser loaded the
  raw CommonJS file and the admin did not hydrate. The same happened with the integrations
  registered statically, so it is not caused by registering them only in dev. Adding
  `react-dom/client` to `vite.optimizeDeps.include` in dev fixes it.

## Decision

Sezon uses **Keystatic in local mode, enabled only by `astro dev`** (option 1).

- **Dev only:** a small integration (`scripts/cms/localCms.mjs`) adds `@astrojs/react` and
  `@keystatic/astro` in `astro:config:setup` only when the command is `dev`. It imports them
  lazily, so `astro build`, `astro preview`, `astro check` and `astro sync` never load them. All
  four packages are `devDependencies`. No environment variable is needed.
- **Same files:** `keystatic.config.ts` at the repository root defines one Keystatic collection per
  content collection, with `path: 'src/data/<collection>/*'`, `format: { data: 'yaml' }` and a slug
  field whose name is the entry's `name` (`title` for recipes) and whose slug is the file name,
  generated with `Slug.fromBulgarian`.
- **No data loss:** every key of every Zod schema has a Keystatic field. Keystatic always writes an
  object field, even as `{}`, and the strict Zod schemas reject a partial optional block, so
  optional nested blocks Keystatic cannot leave out (`nutrition`, `photo`, `growing`, `organic`,
  `regions[].source`, a region's `profile`, a farm's `organic`) use `fields.ignored()`: Keystatic
  keeps them exactly as they are and they are edited in YAML. A unit test saves every entry
  through Keystatic's own field parsers and serializers and compares the Zod-parsed result with
  the original.
- **Workflow unchanged:** the owner runs `pnpm dev`, edits in `/keystatic`, and commits the
  changed YAML through a pull request. CI validates it as before.
- **Boundary:** `src/` must not import `keystatic.config.ts` or `@keystatic/*` (ESLint
  `no-restricted-imports`).

GitHub mode (option 2) stays a later option, for editing without a local checkout. It needs its own
ADR because it adds a server adapter, secrets and on-demand routes to production.

## Consequences

- The owner gets forms with validation (required fields, lengths, month range, select lists,
  references to other entries) without any change to the production site.
- **Formatting churn:** Keystatic rewrites a saved file in `js-yaml` block style: flow maps such as
  `{ month: 7, level: peak }` become block maps, long strings are folded (`>-`) and needless quotes
  go. Values do not change. The first save of a file therefore shows a larger diff than the edit.
  Farms gain an explicit `sponsored: false`, which is the schema default.
- Optional nested blocks (nutrition, photo, growing guide, organic production, region sources and
  profiles, farm certificates) are not editable in Keystatic. They stay editable in YAML.
- Sponsor banners are a text path (`../../assets/sponsors/<id>.jpg`), not a Keystatic image field,
  because that field stores files in a per-entry folder and would drop a banner kept elsewhere.
- React, Keystatic and their dependencies are added to `devDependencies` (larger install, not a
  larger site). A major upgrade of any of them needs an ADR (AGENTS.md section 2).
- React's types (`@types/react`, a dependency of `@keystatic/core`) are now in the dependency
  tree, so libraries with optional React types, such as satori for the OG images (spec 050),
  type-check against them.
- The dev server binds to `127.0.0.1` unless `server.host` is set, because the Keystatic
  integration sets it.

## Sources

- Keystatic docs, Context7 `/thinkmill/keystatic` (fetched 2026-11-13): Astro integration,
  `collection` (`path`, `format`, `slugField`), `fields.ignored`, `createReader`.
- `node_modules/@keystatic/astro@6.0.0/dist/keystatic-astro.js`: injected routes and Vite config.
- `node_modules/@keystatic/core@0.6.9/dist`: field `parse`/`serialize`, `serializeEntryToFiles`
  (`js-yaml` `dump`).
- `node_modules/@astrojs/react@7.1.8` and `@astrojs/react-renderer@0.1.2`: renderer and
  `optimizeDeps`.
