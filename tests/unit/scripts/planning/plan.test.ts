import { describe, expect, it } from 'vitest';
import {
  changedUpdates,
  fieldUpdatesFor,
  parsePlan,
  PlanningFieldError,
  PlanValidationError,
  type ProjectField,
} from '../../../../scripts/planning/plan.ts';

const validIssue = () => ({
  status: 'In development',
  priority: 'High',
  impact: 'Big',
  estimate: 1,
  start: '2026-11-10',
  target: '2026-11-12',
});

const validRaw = () => ({
  project: { owner: 'desig9stein', title: 'Planing' },
  issues: {
    '35': validIssue(),
    '13': {
      status: 'Backlog',
      priority: 'Medium',
      impact: 'Big',
      estimate: 2.5,
      start: '2027-01-11',
      target: '2027-01-11',
    },
  } as Record<string, Record<string, unknown>>,
});

const fields: ReadonlyArray<ProjectField> = [
  { id: 'F_title', name: 'Title', dataType: 'TITLE' },
  {
    id: 'F_status',
    name: 'Status',
    dataType: 'SINGLE_SELECT',
    options: [
      { id: 'o_backlog', name: 'Backlog' },
      { id: 'o_dev', name: 'In Development' },
    ],
  },
  {
    id: 'F_priority',
    name: 'Priority',
    dataType: 'SINGLE_SELECT',
    options: [
      { id: 'o_high', name: 'High' },
      { id: 'o_medium', name: 'Medium' },
    ],
  },
  {
    id: 'F_impact',
    name: 'impact',
    dataType: 'SINGLE_SELECT',
    options: [{ id: 'o_big', name: 'Big' }],
  },
  { id: 'F_estimate', name: 'Estimate', dataType: 'NUMBER' },
  { id: 'F_start', name: 'Start date', dataType: 'DATE' },
  { id: 'F_target', name: 'Target Date', dataType: 'DATE' },
];

const problemsOf = (raw: unknown): string => {
  try {
    parsePlan(raw);
  } catch (error) {
    expect(error).toBeInstanceOf(PlanValidationError);
    return (error as PlanValidationError).problems.join('\n');
  }
  throw new Error('expected parsePlan to throw');
};

describe('parsePlan', () => {
  it('AC1: returns a frozen plan with numeric issue numbers sorted by issue number', () => {
    const plan = parsePlan(validRaw());

    expect(plan.project).toEqual({ owner: 'desig9stein', title: 'Planing' });
    expect(plan.issues.map((issue) => issue.number)).toEqual([13, 35]);
    expect(plan.issues[1]).toEqual({ number: 35, ...validIssue() });
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.issues)).toBe(true);
    expect(Object.isFrozen(plan.issues[0])).toBe(true);
  });

  it('AC2: lists every problem in one PlanValidationError', () => {
    const raw = validRaw();
    raw.issues['35'] = { ...validIssue(), start: '2026-11-20', target: '2026-11-12', estimate: -1 };
    raw.issues['13'] = { ...validIssue(), start: '2027-13-01' };
    raw.issues['0'] = validIssue();

    const problems = problemsOf(raw);

    expect(problems).toMatch(/#35.*start.*after.*target/i);
    expect(problems).toMatch(/#35.*estimate/i);
    expect(problems).toMatch(/#13.*start.*2027-13-01/i);
    expect(problems).toMatch(/issue number "0"/);
  });

  it('AC2: rejects missing sections, wrong types and invalid issue numbers', () => {
    expect(() => parsePlan(null)).toThrow(PlanValidationError);
    expect(() => parsePlan({ ...validRaw(), project: { owner: 'x' } })).toThrow(/project\.title/);
    expect(() => parsePlan({ ...validRaw(), issues: { abc: validIssue() } })).toThrow(
      /issue number "abc"/,
    );
    expect(() =>
      parsePlan({ ...validRaw(), issues: { '35': { ...validIssue(), priority: 3 } } }),
    ).toThrow(/#35.*priority/);
    expect(() =>
      parsePlan({ ...validRaw(), issues: { '35': { ...validIssue(), estimate: Number.NaN } } }),
    ).toThrow(/#35.*estimate/);
  });

  it('AC5: reports unknown keys such as leftover milestones', () => {
    const raw = {
      ...validRaw(),
      milestones: [{ title: 'Phase 2', due: '2026-12-31' }],
      issues: { '35': { ...validIssue(), milestone: 'Phase 2' } },
      project: { owner: 'desig9stein', title: 'Planing', number: 8 },
    };

    const problems = problemsOf(raw);

    expect(problems).toMatch(/unknown key "milestones"/);
    expect(problems).toMatch(/#35: unknown key "milestone"/);
    expect(problems).toMatch(/project: unknown key "number"/);
  });
});

describe('fieldUpdatesFor', () => {
  it('AC3: maps every planning key to its field, case-insensitively', () => {
    const entry = parsePlan(validRaw()).issues[1];
    if (entry === undefined) throw new Error('fixture');

    expect(fieldUpdatesFor(entry, fields)).toEqual([
      { fieldId: 'F_status', value: { singleSelectOptionId: 'o_dev' } },
      { fieldId: 'F_priority', value: { singleSelectOptionId: 'o_high' } },
      { fieldId: 'F_impact', value: { singleSelectOptionId: 'o_big' } },
      { fieldId: 'F_estimate', value: { number: 1 } },
      { fieldId: 'F_start', value: { date: '2026-11-10' } },
      { fieldId: 'F_target', value: { date: '2026-11-12' } },
    ]);
  });

  it('AC4: names the issue, field and available options for an unknown option', () => {
    const entry = parsePlan({
      ...validRaw(),
      issues: { '35': { ...validIssue(), priority: 'Urgent' } },
    }).issues[0];
    if (entry === undefined) throw new Error('fixture');

    expect(() => fieldUpdatesFor(entry, fields)).toThrow(PlanningFieldError);
    expect(() => fieldUpdatesFor(entry, fields)).toThrow(/#35.*Priority.*"Urgent".*High, Medium/);
  });

  it('AC4: names the missing field and rejects a field of the wrong type', () => {
    const entry = parsePlan(validRaw()).issues[0];
    if (entry === undefined) throw new Error('fixture');
    const withoutImpact = fields.filter((field) => field.name !== 'impact');
    const estimateAsText = fields.map((field) =>
      field.name === 'Estimate' ? { ...field, dataType: 'TEXT' } : field,
    );

    expect(() => fieldUpdatesFor(entry, withoutImpact)).toThrow(/#13.*field "Impact"/);
    expect(() => fieldUpdatesFor(entry, estimateAsText)).toThrow(/#13.*Estimate.*NUMBER/);
  });
});

describe('changedUpdates', () => {
  it('keeps only updates whose value differs from the current one', () => {
    const desired = [
      { fieldId: 'F_status', value: { singleSelectOptionId: 'o_b' } },
      { fieldId: 'F_estimate', value: { number: 2 } },
      { fieldId: 'F_start', value: { date: '2027-01-11' } },
    ];
    const current = [
      { fieldId: 'F_status', value: { singleSelectOptionId: 'o_b' } },
      { fieldId: 'F_estimate', value: { number: 3 } },
    ];

    expect(changedUpdates(desired, current)).toEqual([desired[1], desired[2]]);
  });
});
