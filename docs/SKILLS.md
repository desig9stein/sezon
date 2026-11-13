# Skills for this project

The official skills that help with Sezon are vendored in `.claude/skills/` (see its README).
This page says when to use each one.

## Project skills

Two skills written for this repository live next to the vendored ones. They link to `AGENTS.md`
and `docs/CONTENT-GUIDE.md` instead of repeating them, so those files stay the source of truth.

| Skill               | What it does                                                                                                                                                                                                | When                                                                |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| `sezon-add-produce` | Adds or reworks a produce YAML per `docs/CONTENT-GUIDE.md`: slug, a source per fact, no health claims, the schema on `main`, USDA via `pnpm content:usda`, МЗХ regions, Unsplash photo, never gradinata.bg. | Any new produce, a catalog batch, or a fix to its sources or photo. |
| `sezon-feature`     | Runs the AGENTS.md section 4 workflow: spec from the template, red tests commit, implementation, `qa-reviewer`, regression-tested fixes, merge `main`, PR from a correctly named branch.                    | Any feature or behaviour-changing fix, from the issue to the PR.    |

Each has `evals/evals.json` (task prompts with expectations) and `evals/trigger-evals.json`
(should and should-not trigger queries) in the `skill-creator` format. To check triggering, copy
the repository without the skill's folder (so the installed copy does not compete), then from that
copy run, for each skill:

```bash
PYTHONPATH=.claude/skills/skill-creator python3 -m scripts.run_eval \
  --eval-set <repo>/.claude/skills/<skill>/evals/trigger-evals.json \
  --skill-path <repo>/.claude/skills/<skill> --timeout 120 --num-workers 1
```

It needs the `claude` CLI. Keep `--num-workers 1`: each worker installs the skill under its own
random name and counts only a call to that name, so parallel workers pick each other's copies and
report false misses. The script also stops at the first tool call that is not the skill, so a
request that starts by reading files counts as a miss.

Last run (2026-11-13, three runs per query, a local copy of `run_eval.py` patched to accept any
worker's copy of the skill and to look past other tool calls): `sezon-add-produce` passed 18 of 18
queries; `sezon-feature` passed 16 of 18, missing the „quick one-liner“ skip-link fix and, in two
of three runs, the RSS question. The task evals in `evals/evals.json` have not been run yet. The task evals run as `skill-creator` describes (with-skill and
baseline subagents, then `eval-viewer/generate_review.py`).

## Vendored skills

| Skill             | Use in Sezon                                                                                                                                                                                     | When                                                                                                                                                                                                                             |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `impeccable`      | Design vocabulary and reviews (`init`, `document`, `critique`, `audit`, `polish`, `typeset`, `layout`…) and a deterministic slop detector. It reads `PRODUCT.md` (and `DESIGN.md` once written). | `critique` and `audit` on every UI change before QA; `detect --json <changed files>` once a UI change is finished. AGENTS.md (WCAG, no-CSS reading, ADR-0004, ADR-0005) always wins; never use `live` mode with permissions off. |
| `frontend-design` | Visual direction, typography and layout for new pages and the redesign. Its own checklist flags the current look (warm cream background, identical rounded cards) as generic defaults.           | Before the spec of any new UI and for the visual redesign issue. Combine with AGENTS.md section 8: the a11y and Lighthouse rules always win.                                                                                     |
| `webapp-testing`  | Ad-hoc Playwright checks against `pnpm preview` (screenshots, console logs, keyboard flows) while building UI.                                                                                   | During implementation and QA. Permanent checks still go into `tests/e2e/`.                                                                                                                                                       |
| `skill-creator`   | Create and improve project skills such as the two above, and run their evals.                                                                                                                    | When a workflow repeats or a project skill misfires.                                                                                                                                                                             |
| `doc-coauthoring` | Writing specs, ADRs and content guides with the owner.                                                                                                                                           | Step 1 (Spec) of the workflow, ADRs.                                                                                                                                                                                             |
| `canvas-design`   | Static visuals: Open Graph image templates, printable seasonal posters.                                                                                                                          | Phase 5 OG images issue; printable calendar.                                                                                                                                                                                     |
| `pdf`             | A printable PDF of the seasonal calendar; reading source PDFs (e.g. EU regulations, agrarian reports) while reviewing content.                                                                   | Calendar and content-review issues.                                                                                                                                                                                              |
| `xlsx`            | Importing or exporting produce data and nutrition tables from spreadsheets during content work.                                                                                                  | Catalog expansion and content review.                                                                                                                                                                                            |
| `theme-factory`   | Quick theme variations of artifacts and mock pages when exploring the redesign.                                                                                                                  | Design exploration only; final tokens live in `src/design/tokens.ts`.                                                                                                                                                            |

Only these skills are kept in the repository; other official skills were removed as not
relevant to this project.
