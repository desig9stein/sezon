# 008. Planning sync: project fields from a file in the repository

- **Status:** Approved
- **Bounded context(s):** tooling (no runtime code)
- **Related:** AGENTS.md section 12, spec 007, issue #25

## 1. Goal

Keep the planning metadata of every issue (Planning project fields) in one
reviewed file, `.github/planning.yml`, and apply it to GitHub with a workflow. Planning changes
then go through pull requests like code, and agents without direct access to GitHub Projects can
maintain the plan.

## 2. User stories

- As the owner, I want every issue to show its status, priority, impact, estimate, start and
  target dates in the Planning project, so that I can track the roadmap.
- As the owner, I want to review planning changes in a pull request, so that nothing changes
  on the board without my approval.
- As an agent, I want to edit one YAML file and trigger a sync, so that I can keep the plan
  current without access to the Projects API.

## 3. Scope

### In scope

- `.github/planning.yml`: the user-owned project (owner and title) and, per issue number,
  `status`, `priority`, `impact`, `estimate`, `start` and `target`.
- `scripts/planning/plan.ts`: pure functions that validate the plan and compute changes.
- `scripts/planning/GitHubPlanningClient.ts`: GraphQL adapter (injected `fetch`).
- `scripts/planning/syncPlan.ts`: orchestration over a client interface.
- `scripts/planning/sync.ts`: entry point that reads the plan as JSON and calls `syncPlan`.
- `.github/workflows/planning.yml`: runs the sync on push to `main` when the plan, the workflow
  or the scripts change, and on manual dispatch. The job runs only on `main`, so the
  `PROJECT_TOKEN` secret is never used for an unreviewed branch.

Only projects owned by a user account are supported (`user(login:)` in GraphQL).

### Out of scope

- Labels and assignees (managed with `.github/labels.yml` and on the issue itself).
- Milestones. Epics group the work by phase and the Planning dates carry the deadlines, so
  the repository does not use milestones (owner decision, 2026-11-10).
- Removing items from the project.
- Organization-owned projects; more than 100 projects or project items per issue (the sync
  stops with a clear error instead of paginating).
- Pull-request items on the board.

## 4. Domain model

`Plan` (validated, frozen):

| Field     | Content                                                                    |
| --------- | -------------------------------------------------------------------------- |
| `project` | `{ owner: string; title: string }`.                                        |
| `issues`  | `{ number: number; status; priority; impact; estimate; start; target }[]`. |

`IsoDate` is a `YYYY-MM-DD` string that is a real calendar date.

`ProjectField` (read from GitHub): `{ id, name, dataType: 'SINGLE_SELECT' | 'NUMBER' | 'DATE' | string, options?: { id, name }[] }`.

`FieldUpdate`: `{ fieldId, value: { singleSelectOptionId } | { number } | { date } }`.

## 5. Behaviour and edge cases

- `parsePlan(raw)` collects every problem and throws one `PlanValidationError` that lists them
  all. Problems: a missing or wrong-typed key, an invalid date, `start` after `target`, a
  negative or non-finite estimate, a non-positive or non-integer issue number, or an unknown
  key at the top level, in `project` or in an issue (for example a leftover `milestone`).
  Duplicate issue numbers are rejected by the YAML parser.
- The plan's issue keys are issue numbers (YAML map keys arrive as strings and are converted).
- `fieldUpdatesFor(entry, fields)` maps plan keys to project fields by name, case-insensitively:
  `status` → „Status“, `priority` → „Priority“, `impact` → „Impact“, `estimate` → „Estimate“,
  `start` → „Start date“, `target` → „Target date“. Single-select options also match
  case-insensitively. A missing field, a missing option, or a field of an unexpected type throws
  `PlanningFieldError` naming the issue, the field and the available options.
- `changedUpdates(desired, current)` keeps only the updates whose value differs from the item's
  current value, so re-runs write nothing when nothing changed.
- Sync order: resolve the project by owner and title (`GitHubApiError` if not found) → read
  fields → compute every field update (so a plan that does not match the project fails before
  the first write) → for each issue: skip it with a log line when it is closed (its board
  status is left to the project's own workflows); add it to the project if it is not an item
  yet; warn when the item is archived; write the changed fields.
- The sync needs only the `project` scope on `PROJECT_TOKEN`; it never writes to the repository.
- The sync logs one line per issue and exits non-zero on the first API error, printing the
  GraphQL message, or the HTTP status when the body is not JSON. The
  token is sent only in the `Authorization` header and never logged.

## 6. Accessibility requirements

None. No user interface is produced.

## 7. SEO requirements

None. No page is produced.

## 8. Acceptance criteria

1. **AC1:** Given a valid plan, `parsePlan` returns a frozen plan with numeric issue numbers, sorted by issue number.
2. **AC2:** Given a plan with several problems (invalid date, start after target, negative estimate, invalid issue number), `parsePlan` throws one `PlanValidationError` that lists each problem.
3. **AC3:** Given project fields, `fieldUpdatesFor` returns six updates with the matching option ids, number and dates, matching names and options case-insensitively.
4. **AC4:** Given a missing option or a missing field, `fieldUpdatesFor` throws `PlanningFieldError` that names the issue, the field and the available options.
5. **AC5:** Given unknown keys (a top-level `milestones` list or an issue `milestone`), `parsePlan` reports each one.
6. **AC6:** Given a fake `fetch`, `GitHubPlanningClient` adds an issue to the project when it is not an item, and updates its fields, sending the token only in the `Authorization` header.
7. **AC7:** Given a GraphQL `errors` response, the client throws an error with the GraphQL message.
8. **AC8:** `syncPlan` ensures the project item of each open issue and applies the changed field updates; when any issue has an invalid field it throws before the first write.
9. **AC9:** `.github/planning.yml` in the repository is a valid plan (checked by the unit tests in CI, so an invalid plan fails the pull request).

## 9. Test plan

| AC      | Type | Test file                                                  |
| ------- | ---- | ---------------------------------------------------------- |
| AC1–AC5 | unit | `tests/unit/scripts/planning/plan.test.ts`                 |
| AC6–AC7 | unit | `tests/unit/scripts/planning/GitHubPlanningClient.test.ts` |
| AC8     | unit | `tests/unit/scripts/planning/syncPlan.test.ts`             |
| AC9     | unit | `tests/unit/scripts/planning/planningFile.test.ts`         |

## 10. Third-party documentation consulted

| Package / source   | Version | Source                                                                                                                        | Topic                                                                                         |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GitHub GraphQL API | current | Context7 `/github/docs` (issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects) | `user.projectV2`, fields and options, `addProjectV2ItemById`, `updateProjectV2ItemFieldValue` |
| Node.js            | 22.23.4 | nodejs.org/api/typescript.html                                                                                                | Running `.ts` files with type stripping                                                       |
