# 008. Planning sync: project fields and milestones from a file in the repository

- **Status:** Approved
- **Bounded context(s):** tooling (no runtime code)
- **Related:** AGENTS.md section 12, spec 007, issue #25

## 1. Goal

Keep the planning metadata of every issue (Planning project fields and milestone) in one
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

- `.github/planning.yml`: the project (owner and title), milestones (title, due date,
  description) and, per issue number, `status`, `priority`, `impact`, `estimate`, `start`,
  `target` and `milestone`.
- `scripts/planning/plan.ts`: pure functions that validate the plan and compute changes.
- `scripts/planning/GitHubPlanningClient.ts`: GraphQL and REST adapter (injected `fetch`).
- `scripts/planning/syncPlan.ts`: orchestration over a client interface.
- `scripts/planning/sync.ts`: entry point that reads the plan as JSON and calls `syncPlan`.
- `.github/workflows/planning.yml`: runs the sync on push to `main` when the plan or the
  scripts change, and on manual dispatch. Uses the `PROJECT_TOKEN` secret.

### Out of scope

- Labels and assignees (managed with `.github/labels.yml` and on the issue itself).
- Removing items from the project or deleting milestones.
- Pull-request items on the board.

## 4. Domain model

`Plan` (validated, frozen):

| Field        | Content                                                                               |
| ------------ | ------------------------------------------------------------------------------------- |
| `project`    | `{ owner: string; title: string }`.                                                   |
| `milestones` | `{ title: string; due: IsoDate; description: string }[]`, unique titles.              |
| `issues`     | `{ number: number; status; priority; impact; estimate; start; target; milestone }[]`. |

`IsoDate` is a `YYYY-MM-DD` string that is a real calendar date.

`ProjectField` (read from GitHub): `{ id, name, dataType: 'SINGLE_SELECT' | 'NUMBER' | 'DATE' | string, options?: { id, name }[] }`.

`FieldUpdate`: `{ fieldId, value: { singleSelectOptionId } | { number } | { date } }`.

## 5. Behaviour and edge cases

- `parsePlan(raw)` collects every problem and throws one `PlanValidationError` that lists them
  all. Problems: a missing or wrong-typed key, an invalid date, `start` after `target`, a
  negative or non-finite estimate, a non-positive or non-integer issue number, a duplicate issue
  number, a duplicate milestone title, or an issue milestone that is not declared.
- The plan's issue keys are issue numbers (YAML map keys arrive as strings and are converted).
- `fieldUpdatesFor(entry, fields)` maps plan keys to project fields by name, case-insensitively:
  `status` → „Status“, `priority` → „Priority“, `impact` → „Impact“, `estimate` → „Estimate“,
  `start` → „Start date“, `target` → „Target date“. Single-select options also match
  case-insensitively. A missing field, a missing option, or a field of an unexpected type throws
  `PlanningFieldError` naming the issue, the field and the available options.
- `milestonesToCreate(plan, existingTitles)` returns the plan milestones whose titles do not
  exist yet, in plan order.
- Sync order: resolve the project by owner and title (`PlanningFieldError` if not found) →
  read fields → create missing milestones → for each issue: add it to the project if it is not
  an item yet, update every field, set the milestone. All field updates are computed (and so
  validated) before the first write.
- The sync logs one line per issue and exits non-zero on the first API error, printing the
  GraphQL or REST message. The token is never logged.

## 6. Accessibility requirements

None. No user interface is produced.

## 7. SEO requirements

None. No page is produced.

## 8. Acceptance criteria

1. **AC1:** Given a valid plan, `parsePlan` returns a frozen plan with numeric issue numbers in file order.
2. **AC2:** Given a plan with several problems (invalid date, start after target, negative estimate, undeclared milestone, duplicate milestone), `parsePlan` throws one `PlanValidationError` that lists each problem.
3. **AC3:** Given project fields, `fieldUpdatesFor` returns six updates with the matching option ids, number and dates, matching names and options case-insensitively.
4. **AC4:** Given a missing option or a missing field, `fieldUpdatesFor` throws `PlanningFieldError` that names the issue, the field and the available options.
5. **AC5:** `milestonesToCreate` returns only the missing milestones, in plan order.
6. **AC6:** Given a fake `fetch`, `GitHubPlanningClient` adds an issue to the project when it is not an item, updates its fields, and sets its milestone, sending the token only in the `Authorization` header.
7. **AC7:** Given a GraphQL `errors` response, the client throws an error with the GraphQL message.
8. **AC8:** `syncPlan` creates missing milestones, then for each issue ensures the project item, applies every field update and sets the milestone; when any issue has an invalid field it throws before the first write.

## 9. Test plan

| AC      | Type | Test file                                                  |
| ------- | ---- | ---------------------------------------------------------- |
| AC1–AC5 | unit | `tests/unit/scripts/planning/plan.test.ts`                 |
| AC6–AC7 | unit | `tests/unit/scripts/planning/GitHubPlanningClient.test.ts` |
| AC8     | unit | `tests/unit/scripts/planning/syncPlan.test.ts`             |

## 10. Third-party documentation consulted

| Package / source   | Version | Source                                                                                                                        | Topic                                                                                         |
| ------------------ | ------- | ----------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| GitHub GraphQL API | current | Context7 `/github/docs` (issues/planning-and-tracking-with-projects/automating-your-project/using-the-api-to-manage-projects) | `user.projectV2`, fields and options, `addProjectV2ItemById`, `updateProjectV2ItemFieldValue` |
| GitHub REST API    | current | Context7 `/github/docs` (rest/issues/milestones, rest/issues/issues)                                                          | List and create milestones, set an issue's milestone                                          |
| Node.js            | 22.23.4 | nodejs.org/api/typescript.html                                                                                                | Running `.ts` files with type stripping                                                       |
