# Claude skills (vendored)

The official skills from [anthropics/skills](https://github.com/anthropics/skills) that this
project uses, copied into the repository so every Claude Code session on it (local or cloud)
loads them: canvas-design, doc-coauthoring, frontend-design, pdf, skill-creator, theme-factory,
webapp-testing, xlsx.

- Source commit: `2c5958ecac7cee2b583967a2c4981d0f4a75c579` (2026-11-06)
- License: Apache 2.0 (see each skill's `LICENSE.txt`; `doc-coauthoring` is covered by the
  repository README's statement). Third-party notices: `THIRD_PARTY_NOTICES.md`.
- The folder is excluded from ESLint, Prettier and TypeScript checks. Do not edit skills here;
  update them from upstream instead.

## Update

```bash
git clone --depth 1 https://github.com/anthropics/skills /tmp/anthropic-skills
for skill in canvas-design doc-coauthoring frontend-design pdf skill-creator theme-factory webapp-testing xlsx; do
  rm -rf ".claude/skills/$skill" && cp -r "/tmp/anthropic-skills/skills/$skill" .claude/skills/
done
cp /tmp/anthropic-skills/THIRD_PARTY_NOTICES.md .claude/skills/
```

Then update the source commit above and review the diff before committing: skills can run
scripts. Which skill to use for which task in this project: `docs/SKILLS.md`.
