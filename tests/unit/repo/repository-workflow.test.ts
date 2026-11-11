import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = process.cwd();
const read = (path: string): string => readFileSync(join(ROOT, path), 'utf8');
const readYaml = <T>(path: string): T => parse(read(path)) as T;

interface Step {
  readonly run?: string;
  readonly uses?: string;
  readonly with?: Record<string, unknown>;
}
interface Job {
  readonly needs?: string | string[];
  readonly steps: Step[];
}
interface Workflow {
  readonly on: Record<string, unknown>;
  readonly permissions?: Record<string, string>;
  readonly concurrency?: { group: string; 'cancel-in-progress': boolean };
  readonly jobs: Record<string, Job>;
}

const runs = (job: Job | undefined): string =>
  (job?.steps ?? []).map((step) => step.run ?? '').join('\n');

describe('CI workflow', () => {
  const ci = readYaml<Workflow>('.github/workflows/ci.yml');

  it.each([
    ['format', 'pnpm format:check'],
    ['lint', 'pnpm lint'],
    ['typecheck', 'pnpm check'],
    ['unit', 'pnpm test:coverage'],
    ['build', 'pnpm build'],
    ['build', 'pnpm validate:html'],
    ['e2e', 'pnpm test:e2e'],
    ['lighthouse', 'pnpm lhci'],
  ])('AC1: job %s runs %s', (job, command) => {
    expect(runs(ci.jobs[job])).toContain(command);
  });

  it('AC1: every job sets up pnpm, Node and dependencies with pnpm/setup and its cache', () => {
    for (const job of Object.values(ci.jobs)) {
      const setup = job.steps.find((step) => step.uses?.startsWith('pnpm/setup@'));
      expect(setup?.uses).toBe('pnpm/setup@v3');
      expect(setup?.with?.cache).toBe(true);
    }
  });

  it('AC1: e2e and lighthouse download exactly what build uploads', () => {
    const upload = ci.jobs.build?.steps.find((step) =>
      step.uses?.startsWith('actions/upload-artifact'),
    );
    for (const name of ['e2e', 'lighthouse']) {
      const download = ci.jobs[name]?.steps.find((step) =>
        step.uses?.startsWith('actions/download-artifact'),
      );
      expect(download?.with?.name).toBe(upload?.with?.name);
      expect(download?.with?.path).toBe(upload?.with?.path);
    }
  });

  it('AC1: uploads hidden Lighthouse reports on failure', () => {
    const reports = ci.jobs.lighthouse?.steps.find(
      (step) =>
        step.uses?.startsWith('actions/upload-artifact') &&
        step.with?.path === '.lighthouseci/reports',
    );
    expect(reports?.with?.['include-hidden-files']).toBe(true);
    expect(reports?.with?.['if-no-files-found']).toBe('error');
  });

  it('AC1: e2e and lighthouse reuse the build output', () => {
    for (const name of ['e2e', 'lighthouse']) {
      expect(ci.jobs[name]?.needs).toBe('build');
      expect(
        ci.jobs[name]?.steps.some((step) => step.uses?.startsWith('actions/download-artifact')),
      ).toBe(true);
    }
    expect(
      ci.jobs.build?.steps.some((step) => step.uses?.startsWith('actions/upload-artifact')),
    ).toBe(true);
  });

  it('AC2: runs on pull requests and pushes to main with read-only permissions', () => {
    expect(ci.on).toEqual({ pull_request: null, push: { branches: ['main'] } });
    expect(ci.permissions).toEqual({ contents: 'read' });
    expect(ci.concurrency?.['cancel-in-progress']).toBe(true);
    expect(ci.concurrency?.group).toContain('github.ref');
  });
});

describe('pull request template', () => {
  const template = read('.github/pull_request_template.md');

  it.each([
    '## Summary',
    '## Linked issue and spec',
    '## Changes',
    '## Verification',
    '## Screenshots',
    '## Notes for the reviewer',
  ])('AC3: has section %s', (section) => {
    expect(template).toContain(section);
  });

  it.each([
    'Spec exists in `docs/specs/`',
    'Tests were committed red',
    'All acceptance criteria have a passing test',
    '`qa-reviewer` ran',
    '`pnpm verify` passes',
    '`pnpm lhci` reports Performance ≥ 95',
    'No UI string outside `src/i18n/bg.ts`',
    'Comments follow the comment policy',
  ])('AC3: has Definition of Done item "%s"', (item) => {
    expect(template).toContain(`- [ ] ${item}`);
  });
});

interface IssueForm {
  readonly name: string;
  readonly description: string;
  readonly labels: string[];
  readonly body: { type: string; validations?: { required?: boolean } }[];
}

describe('pull request template UI checklist', () => {
  const template = read('.github/pull_request_template.md');

  it.each([
    'Keyboard and visible focus',
    'Contrast uses design tokens',
    'Title ≤ 60 and description 70–160 characters',
    'JSON-LD is valid',
  ])('AC3: has UI item "%s"', (item) => {
    expect(template).toContain(item);
  });
});

describe('issue forms', () => {
  it.each(['feature', 'bug', 'content'])(
    'AC4: %s.yml is a valid form with a required field',
    (name) => {
      const form = readYaml<IssueForm>(`.github/ISSUE_TEMPLATE/${name}.yml`);
      expect(form.name).toBeTruthy();
      expect(form.description).toBeTruthy();
      expect(form.labels.length).toBeGreaterThan(0);
      expect(form.body.some((field) => field.validations?.required === true)).toBe(true);
    },
  );

  it('AC4: disables blank issues', () => {
    expect(
      readYaml<{ blank_issues_enabled: boolean }>('.github/ISSUE_TEMPLATE/config.yml')
        .blank_issues_enabled,
    ).toBe(false);
  });
});

describe('labels', () => {
  const labels =
    readYaml<{ name: string; color: string; description: string }[]>('.github/labels.yml');
  const REQUIRED = [
    'type:feature',
    'type:bug',
    'type:content',
    'type:docs',
    'type:chore',
    'area:seo',
    'area:a11y',
    'area:performance',
    'area:content',
    'area:ci',
    'area:design',
    'phase:2',
    'phase:3',
    'phase:4',
    'phase:5',
    'phase:launch',
    'epic',
    'status:blocked',
  ];

  it('AC5: lists every label with a hex colour and a description', () => {
    expect(labels.map((label) => label.name).sort()).toEqual([...REQUIRED].sort());
    for (const label of labels) {
      expect(label.color).toMatch(/^[0-9a-f]{6}$/);
      expect(label.description.length).toBeGreaterThan(0);
    }
  });

  it('AC5: labels are referenced by issue forms only if they exist', () => {
    const names = new Set(labels.map((label) => label.name));
    for (const form of ['feature', 'bug', 'content']) {
      for (const label of readYaml<IssueForm>(`.github/ISSUE_TEMPLATE/${form}.yml`).labels) {
        expect(names.has(label)).toBe(true);
      }
    }
  });

  it('AC5: a workflow syncs labels with the GitHub CLI', () => {
    const workflow = read('.github/workflows/labels.yml');
    expect(workflow).toContain('gh label create');
    expect(workflow).toContain('--force');
    expect(workflow).toContain('.github/labels.yml');
    const parsed = parse(workflow) as { permissions: Record<string, string> };
    expect(parsed.permissions).toEqual({ contents: 'read', issues: 'write' });
  });
});

describe('pre-commit hook', () => {
  const pkg = JSON.parse(read('package.json')) as {
    scripts: Record<string, string>;
    'simple-git-hooks': Record<string, string>;
    'lint-staged': Record<string, string | string[]>;
  };

  it('AC6: runs lint-staged before each commit and installs on prepare', () => {
    expect(pkg['simple-git-hooks']['pre-commit']).toContain('lint-staged');
    expect(pkg.scripts.prepare).toContain('simple-git-hooks');
  });

  it('AC6: formats and lints staged files', () => {
    const commands = Object.values(pkg['lint-staged']).flat().join('\n');
    expect(commands).toContain('prettier --write');
    expect(commands).toContain('eslint --fix');
  });
});

describe('project board guide', () => {
  it('AC7: documents columns, auto-add and branch protection', () => {
    expect(existsSync(join(ROOT, 'docs/PROJECT-BOARD.md'))).toBe(true);
    const guide = read('docs/PROJECT-BOARD.md');
    for (const column of ['Backlog', 'Ready', 'In progress', 'In review', 'Done']) {
      expect(guide).toContain(column);
    }
    expect(guide).toMatch(/auto-add/i);
    expect(guide).toMatch(/branch protection|ruleset/i);
    expect(guide).toMatch(/private repositor.*(Pro|Team|paid)/i);
  });
});

describe('package manager', () => {
  it('AC8: uses pnpm 12 with settings in pnpm-workspace.yaml', () => {
    const pkg = JSON.parse(read('package.json')) as { packageManager: string; pnpm?: unknown };
    expect(pkg.packageManager).toMatch(/^pnpm@12\./);
    expect(pkg.pnpm).toBeUndefined();
    const workspace = readYaml<{
      overrides: Record<string, string>;
      allowBuilds: Record<string, boolean>;
    }>('pnpm-workspace.yaml');
    expect(workspace.overrides['@puppeteer/browsers']).toBeDefined();
    expect(workspace.allowBuilds['simple-git-hooks']).toBe(false);
  });
});
