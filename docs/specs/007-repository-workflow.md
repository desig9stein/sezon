# 007. Repository workflow: templates, CI checks, hooks and project board

- **Status:** Approved
- **Bounded context(s):** tooling (no runtime code)
- **Related:** AGENTS.md sections 4 and 12, ADR-0001

## 1. Goal

Make the single-maintainer workflow (issue → branch → PR → review → merge into `main`) explicit
and enforced by tooling: issue and pull-request templates that mirror the spec-driven process,
separate CI checks that show exactly what failed, a pre-commit hook that formats and lints
changed files, a shared label set, and a GitHub Projects board fed by issues and PRs.

## 2. User stories

- As the owner, I want to open an issue from a form (feature, bug, content), so that every task
  has the information an agent needs to start.
- As the owner reviewing a PR, I want a template that shows the spec, the changes and a
  completed Definition of Done checklist, so that review is quick.
- As the owner, I want each CI check (format, lint, types, tests, build, e2e, Lighthouse) to be a
  separate status, so that I see at a glance what broke and can make checks required.
- As a contributor, I want formatting and lint fixes applied before each commit, so that CI does
  not fail on style.
- As the owner, I want a board with the phases and statuses, so that I can track progress.

## 3. Scope

### In scope

- `.github/pull_request_template.md`.
- Issue forms in `.github/ISSUE_TEMPLATE/`: `feature.yml`, `bug.yml`, `content.yml`, and
  `config.yml` (blank issues disabled).
- `.github/labels.yml` and a `labels` workflow that syncs them with the GitHub CLI (no
  third-party action).
- `ci.yml` split into jobs: `format`, `lint`, `typecheck`, `unit`, `build`, `e2e`, `lighthouse`
  (the last two download the `build` artifact).
- `simple-git-hooks` + `lint-staged` pre-commit hook.
- `docs/PROJECT-BOARD.md`: how to create the GitHub Projects board, its columns and the
  built-in auto-add workflow.
- Issues for the remaining roadmap phases (2–5), labelled by phase.

### Out of scope

- Creating the GitHub Project itself (requires the owner's account; no API is available to the
  agent) and branch protection rules (repository settings; documented as steps).

## 4. Domain model

None.

## 5. Behaviour and edge cases

- **CI triggers:** every `pull_request` (including stacked PRs) and `push` to `main`. Concurrency cancels outdated
  runs of the same ref. Permissions: `contents: read`.
- **Package manager:** pnpm 12 (latest). Settings live in `pnpm-workspace.yaml` (`overrides`,
  `allowBuilds`); pnpm 12's default `minimumReleaseAge` (1 day) rejects packages published in the
  last 24 hours, which protects against compromised releases.
- **Jobs:** each job checks out and runs `pnpm/setup@v3` with `cache: true`, which installs pnpm
  (from `packageManager`), Node (from `.nvmrc`) and runs a frozen `pnpm install`.
  `format` → `pnpm format:check`; `lint` → `pnpm lint`; `typecheck` → `pnpm check`;
  `unit` → `pnpm test:coverage`; `build` → `pnpm build` + `pnpm validate:html` and uploads
  `dist/`; `e2e` (needs `build`) downloads `dist/`, installs Chromium and runs `pnpm test:e2e`;
  `lighthouse` (needs `build`) downloads `dist/` and runs `pnpm lhci`, uploading
  `.lighthouseci/reports` on failure (`include-hidden-files: true`, `if-no-files-found: error`).
  Upload and download use the same artifact name and path.
- **Pre-commit:** `lint-staged` runs `prettier --write` on staged supported files and
  `eslint --fix` on staged `*.{ts,astro,js,mjs,cjs}`. The hook installs on `pnpm install`
  (`prepare` script). It never runs tests (fast commits); CI runs them.
- **Labels:** types (`type:feature`, `type:bug`, `type:content`, `type:docs`, `type:chore`),
  areas (`area:seo`, `area:a11y`, `area:performance`, `area:content`, `area:ci`), phases
  (`phase:2` … `phase:5`) and `status:blocked`. The sync workflow runs on changes to
  `.github/labels.yml` and on demand with `contents: read` and `issues: write`; it creates or
  updates labels and never deletes others.
- **Templates:** issue forms require a summary and acceptance criteria (feature), steps to
  reproduce and expected/actual result (bug), or the produce/farm and sources (content).
  The PR template contains Summary, Linked issue and spec, Changes, Verification checklist
  (Definition of Done items from AGENTS.md section 11), UI checklist (keyboard and focus,
  contrast tokens, title ≤ 60 and description 70–160, valid JSON-LD), Screenshots, Notes for the
  reviewer. The content form's Sources field is optional (required only for health content,
  enforced in review and by the schema).

## 6. Accessibility requirements

Not applicable (no UI). The PR template's checklist includes the accessibility items of the
Definition of Done (axe, keyboard, contrast) so every UI change is checked.

## 7. SEO requirements

Not applicable (no UI). The PR template's checklist includes the SEO items (unique title and
description, JSON-LD, Lighthouse SEO = 100).

## 8. Acceptance criteria

1. **AC1:** `ci.yml` defines the jobs `format`, `lint`, `typecheck`, `unit`, `build`, `e2e`, `lighthouse`; every job uses `pnpm/setup@v3` with the cache; `e2e` and `lighthouse` need `build` and download the same artifact name/path that `build` uploads; each job runs its commands from section 5; the Lighthouse report upload includes hidden files.
2. **AC2:** `ci.yml` runs on every pull request and on pushes to `main` with `contents: read` permissions and per-ref concurrency.
3. **AC3:** The PR template contains every section from section 5, every Definition of Done item from AGENTS.md section 11 and the UI checklist items.
4. **AC4:** Each issue form is valid YAML with `name`, `description`, `labels` and at least one required field; `config.yml` disables blank issues.
5. **AC5:** `labels.yml` lists every label from section 5 with a 6-digit hex colour and a description; the `labels` workflow syncs them with `gh label create --force` and has `contents: read` and `issues: write` permissions.
6. **AC6:** `package.json` configures a `pre-commit` hook that runs `lint-staged`, a `prepare` script that installs it, and `lint-staged` rules for Prettier and ESLint.
7. **AC8:** `packageManager` is pnpm 12; `pnpm-workspace.yaml` holds the overrides and `allowBuilds`; `package.json` has no `pnpm` field.
8. **AC7:** `docs/PROJECT-BOARD.md` notes that rulesets on private repositories need a paid plan and describes the columns (Backlog, Ready, In progress, In review, Done), the auto-add workflow and the branch-protection steps.

## 9. Test plan

| AC      | Type | Test file                                     |
| ------- | ---- | --------------------------------------------- |
| AC1–AC8 | unit | `tests/unit/repo/repository-workflow.test.ts` |

## 10. Third-party documentation consulted

| Package / source          | Version | Source                                                               | Topic                                                     |
| ------------------------- | ------- | -------------------------------------------------------------------- | --------------------------------------------------------- |
| actions/checkout          | v7      | `git ls-remote` tags; README                                         | Checkout                                                  |
| actions/setup-node        | v7      | raw.githubusercontent.com/actions/setup-node README                  | `node-version-file`, `cache: pnpm`                        |
| pnpm/setup                | v3.1.2  | raw.githubusercontent.com/pnpm/setup README                          | pnpm + Node from `.nvmrc`, automatic install, cache       |
| pnpm                      | 12.18.0 | Context7 `/pnpm/pnpm/v12.15.0` (migration, settings/build, lockfile) | `pnpm-workspace.yaml`, `allowBuilds`, `minimumReleaseAge` |
| actions/upload-artifact   | v7      | README                                                               | `if-no-files-found`, `retention-days`                     |
| actions/download-artifact | v8      | `git ls-remote` tags                                                 | Downloading `dist/`                                       |
| simple-git-hooks          | 2.14.0  | npm README                                                           | `simple-git-hooks` config in package.json                 |
| lint-staged               | 17.6.0  | npm README                                                           | Config in package.json                                    |
| GitHub issue forms        | current | docs.github.com: syntax for issue forms, `config.yml`                | Form schema                                               |
| GitHub Projects           | current | docs.github.com: built-in automations, auto-add workflow             | Board setup                                               |
| GitHub CLI                | current | `gh label create --force`                                            | Label sync                                                |
