---
name: sezon-feature
description: Run the Sezon feature workflow from AGENTS.md end to end, spec from the template, red tests commit, implementation, qa-reviewer, regression-tested fixes and a pull request from a correctly named branch. Use this whenever someone asks to implement, build or fix something with a behaviour change in the Sezon repository, picks up a GitHub issue ("do #57", "implement the monthly RSS feed", "add a page for…", "fix the calendar focus bug"), or asks how to take a change from spec to PR, even if they do not mention specs or QA. Not for pure questions about the code, CI debugging alone, or content-only edits covered by sezon-add-produce.
---

# Sezon feature workflow

[`AGENTS.md`](../../../AGENTS.md) section 4 is the workflow and section 11 the Definition of Done;
[`CLAUDE.md`](../../../CLAUDE.md) adds the Claude rules. This skill is the checklist for running
them in order. Do not skip a step because the change looks small. Track the steps in the task
list and mark a step done only when its commit exists.

## 0. Start

1. Read the issue. If the request is ambiguous, ask before writing anything.
2. Branch from fresh `main`, named `<type>/<NNN>-<kebab-feature>` (e.g. `feat/047-monthly-rss`),
   or `<type>/<kebab-topic>` for work without a spec:

   ```bash
   git fetch origin main && git checkout -b feat/NNN-short-name origin/main
   ```

3. Pick `NNN`: the next free number in `docs/specs/`, also checking open branches
   (`git ls-remote --heads origin`) so two worktrees do not take the same number.

## 1. Spec

- Copy `docs/specs/_TEMPLATE.md` to `docs/specs/NNN-<kebab-feature>.md` and fill every section
  in English, including Accessibility and SEO requirements, numbered Given/When/Then acceptance
  criteria and a test plan that maps each criterion to a test.
- Before using a third-party API, read the docs for the installed version (Context7, then the
  types in `node_modules`) and list each source in „Third-party documentation consulted“.
- For new UI, use `frontend-design` and `impeccable` first (see `docs/SKILLS.md`).
- For content, quote each source verbatim in the spec (titles as published, the supporting
  sentence or table row) so QA can check it.
- Commit: `docs(spec): NNN <feature>`.

## 2. Tests (red)

- Write one test per acceptance criterion, named after it: `it('AC3: …')`.
- Run only those tests and confirm they fail for the right reason (missing behaviour, not a typo
  or an import error).
- Commit: `test(<context>): <feature> (red)`.

## 3. Implementation (green, then refactor)

- Write the minimum code that passes, then refactor with the tests green. Follow AGENTS.md
  sections 6–10 (architecture, dependency rules, comments, a11y, SEO, content).
- Commit: `feat(<context>): <feature>`.

## 4. QA

1. Launch the `qa-reviewer` subagent (`.claude/agents/qa-reviewer.md`) with the spec path and the
   changed files.
2. **Use a fresh preview on your own port.** Port 4322 may be serving another worktree's build,
   and Playwright reuses an existing server outside CI. Run e2e as `CI=1 pnpm test:e2e` so it
   starts its own preview, and for manual checks run `pnpm build` and then
   `pnpm astro preview --port <free port>`. If 4322 is taken, find out by whom before trusting
   any result.
3. For each confirmed finding, write a failing regression test first, commit it
   (`test(<context>): QA findings for NNN (red)`), then fix
   (`fix(<context>): QA findings for NNN`).
4. Do not run the whole CI suite locally; CI runs Prettier, ESLint, types, unit, build,
   html-validate, e2e with axe and Lighthouse. Run locally only what you need, or what reproduces
   a red check.

## 5. Pull request

1. **Merge `main` first:** `git fetch origin main && git merge origin/main`. Resolve conflicts
   (spec numbers, `docs/content-review/README.md`, `src/i18n/bg.ts` are the usual ones) and re-run
   the affected tests.
2. Push: `git push -u origin <branch>`. Never `--no-verify`.
3. Open the PR into `main` with a Conventional Commits title and
   `.github/pull_request_template.md` as the body: `Closes #<n>`, the spec, the changes and how
   they were verified (CI checks, `qa-reviewer`).
4. Read the CI result and fix red checks on the same branch. The owner reviews and merges.

Commit messages are English, imperative, one logical change each, and contain no model
identifiers except the required attribution trailer.
