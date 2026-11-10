# Claude skills (vendored)

Official skills from [anthropics/skills](https://github.com/anthropics/skills), copied into the
repository so every Claude Code session on this project (local or cloud) loads them.

- Source commit: `2c5958ecac7cee2b583967a2c4981d0f4a75c579` (2026-11-06)
- License: Apache 2.0 (see each skill's `LICENSE.txt`; `doc-coauthoring` is covered by the
  repository README's statement). Third-party notices: `THIRD_PARTY_NOTICES.md`.
- The folder is excluded from ESLint, Prettier and TypeScript checks. Do not edit skills here;
  update them from upstream instead.

## Update

```bash
git clone --depth 1 https://github.com/anthropics/skills /tmp/anthropic-skills
rm -rf .claude/skills/*/ && cp -r /tmp/anthropic-skills/skills/* .claude/skills/
cp /tmp/anthropic-skills/THIRD_PARTY_NOTICES.md .claude/skills/
```

Then update the source commit above and review the diff before committing: skills can run
scripts. Which skill to use for which task in this project: `docs/SKILLS.md`.
