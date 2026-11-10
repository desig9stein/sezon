# CLAUDE.md

@AGENTS.md

## Claude-specific instructions

- Follow the workflow in `AGENTS.md` section 4 for every feature: Spec → Tests (red) →
  Implementation (green) → QA. Do not skip the spec step.
- Before writing code that uses a third-party API, query Context7 (`resolve-library-id`,
  then `query-docs`) for the installed version, and check the type definitions in
  `node_modules/<package>` when Context7 is ambiguous. Record the sources in the spec.
- At the end of every feature, launch the `qa-reviewer` subagent with the spec path and
  the changed files. Fix confirmed findings before reporting the feature as done.
- Track multi-step work with the task list. Mark a task completed only after QA passes.
- When a request is ambiguous, ask clarifying questions before writing code.
- Never include model identifiers in code, docs or commit message bodies. The only exception is
  the attribution trailer that the Claude Code harness requires at the end of commit messages.
