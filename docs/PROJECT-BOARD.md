# Project board

Work is tracked with GitHub Issues, Pull Requests and one GitHub Projects board.
The repository provides issue forms, a PR template, labels (`.github/labels.yml`) and CI;
the board and branch rules are set once in the GitHub UI by the owner.

## Flow

1. **Issue.** Open an issue from a form: Feature, Bug or Content. Add a `phase:*` label for
   roadmap work.
2. **Branch.** `<type>/<NNN>-<kebab-feature>` for spec-driven work, `<type>/<kebab-topic>`
   otherwise (see AGENTS.md section 12).
3. **Pull request** into `main` using the template; write `Closes #<issue>` in it.
4. **Review and merge** by the owner. The branch is deleted after the merge; the issue closes.

## Create the board (once)

1. GitHub → your profile → **Projects** → **New project** → template **Board**.
   Name it „Сезон“.
2. Rename/create the **Status** options, in this order:
   - **Backlog** – accepted ideas, not yet specified.
   - **Ready** – issue has acceptance criteria and can be started.
   - **In progress** – a branch exists.
   - **In review** – a pull request is open.
   - **Done** – merged into `main`.
3. Project → **⋯** → **Workflows**:
   - **Auto-add to project**: enable, filter `repo:desig9stein/sezon is:issue,pr is:open`.
     New issues and PRs appear in **Backlog**.
   - **Item added to project** → set Status **Backlog**.
   - **Pull request linked to issue** → set Status **In review**.
   - **Item closed** and **Pull request merged** → set Status **Done**.
4. Optional fields: **Phase** (single select: 2, 3, 4, 5) and **Size** (S, M, L).
   Add a **Roadmap** view grouped by Phase.
5. Repository → **Projects** tab → **Link a project** → choose „Сезон“.

## Labels

Labels are defined in `.github/labels.yml`. After the first merge into `main`, run
**Actions → Labels → Run workflow** once; later changes to the file sync automatically.

## Protect `main` (once)

Repository → **Settings → Rules → Rulesets → New branch ruleset**:

- Target: default branch (`main`).
- Enable **Restrict deletions**, **Block force pushes**, **Require a pull request before merging**
  (0 required approvals is fine for a single maintainer).
- **Require status checks to pass**, add: `Prettier`, `ESLint`, `Types`,
  `Unit tests and coverage`, `Build and HTML validation`, `E2E and accessibility (axe)`,
  `Lighthouse 100`. The checks appear in the list after CI has run once on a pull request.
- Optional: **Require branches to be up to date before merging**.
- Settings → General: enable **Automatically delete head branches**.
