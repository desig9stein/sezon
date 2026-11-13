import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = process.cwd();
const PROJECT_SKILLS = ['sezon-add-produce', 'sezon-feature'] as const;
const DESCRIPTION_MAX_LENGTH = 1024;
const FRONTMATTER = /^---\n([\s\S]*?)\n---\n/;
const MARKDOWN_LINK = /\]\(([^)\s]+)\)/g;
const CODE_SPAN = /`([^`\n]+)`/g;
const REPO_PATH = /^(?:(?:\.claude|\.github|docs|src|tests|scripts)\/[^\s]+|[A-Z]+\.md)$/;
const PLACEHOLDER = /[<>*]|NNN/;

interface Frontmatter {
  readonly name?: unknown;
  readonly description?: unknown;
}

interface EvalSet {
  readonly skill_name: string;
  readonly evals: ReadonlyArray<{ readonly id: number; readonly prompt: string }>;
}

interface TriggerQuery {
  readonly query: string;
  readonly should_trigger: boolean;
}

const skillPath = (skill: string): string => join(ROOT, '.claude/skills', skill, 'SKILL.md');
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T;

/** Returns the parsed YAML frontmatter of a skill file, or an empty object when it has none. */
function frontmatter(source: string): Frontmatter {
  const block = FRONTMATTER.exec(source)?.[1];
  return block === undefined ? {} : (parse(block) as Frontmatter);
}

/** Returns the absolute paths of the local files a skill links to or names in code spans. */
function referencedPaths(skill: string): string[] {
  const file = skillPath(skill);
  const source = readFileSync(file, 'utf8');
  const links = [...source.matchAll(MARKDOWN_LINK)]
    .map((match) => match[1] ?? '')
    .filter((target) => !target.startsWith('http'))
    .map((target) => join(dirname(file), target.split('#')[0] ?? ''));
  const codePaths = [...source.matchAll(CODE_SPAN)]
    .map((match) => (match[1] ?? '').trim())
    .filter((span) => REPO_PATH.test(span) && !PLACEHOLDER.test(span))
    .map((span) => join(ROOT, span));
  return [...links, ...codePaths];
}

describe.each(PROJECT_SKILLS)('project skill %s', (skill) => {
  it('has a SKILL.md with a name equal to its folder and a description', () => {
    const meta = frontmatter(readFileSync(skillPath(skill), 'utf8'));

    expect(meta.name).toBe(skill);
    expect(typeof meta.description).toBe('string');
    expect(String(meta.description).length).toBeGreaterThan(0);
    expect(String(meta.description).length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
  });

  it('references only files that exist', () => {
    const paths = referencedPaths(skill);

    expect(paths.length).toBeGreaterThan(0);
    expect(paths.filter((path) => !existsSync(path))).toEqual([]);
  });

  it('has skill-creator evals and a trigger eval set with both outcomes', () => {
    const folder = join(ROOT, '.claude/skills', skill, 'evals');
    const evals = readJson<EvalSet>(join(folder, 'evals.json'));
    const triggers = readJson<TriggerQuery[]>(join(folder, 'trigger-evals.json'));

    expect(evals.skill_name).toBe(skill);
    expect(evals.evals.length).toBeGreaterThan(0);
    expect(triggers.some((query) => query.should_trigger)).toBe(true);
    expect(triggers.some((query) => !query.should_trigger)).toBe(true);
  });
});
