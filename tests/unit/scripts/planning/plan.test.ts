import { describe, expect, it } from 'vitest';
import {
  changedUpdates,
  fieldUpdatesFor,
  milestoneChanges,
  milestonesToCreate,
  parsePlan,
  PlanningFieldError,
  PlanValidationError,
  type ProjectField,
} from '../../../../scripts/planning/plan.ts';

const validRaw = () => ({
  project: { owner: 'desig9stein', title: 'Planing' },
  milestones: [
    { title: 'Phase 2', due: '2026-12-31', description: 'Visual identity and catalog' },
    { title: 'Phase 3', due: '2027-01-29', description: 'Regions and farms' },
  ],
  issues: {
    '35': {
      status: 'In progress',
      priority: 'P0',
      impact: 'High',
      estimate: 1,
      start: '2026-11-10',
      target: '2026-11-12',
      milestone: 'Phase 2',
    },
    '13': {
      status: 'Backlog',
      priority: 'P1',
      impact: 'High',
      estimate: 2.5,
      start: '2027-01-11',
      target: '2027-01-11',
      milestone: 'Phase 3',
    },
  },
});

const fields: ReadonlyArray<ProjectField> = [
  { id: 'F_title', name: 'Title', dataType: 'TITLE' },
  {
    id: 'F_status',
    name: 'Status',
    dataType: 'SINGLE_SELECT',
    options: [
      { id: 'o_backlog', name: 'Backlog' },
      { id: 'o_progress', name: 'In Progress' },
    ],
  },
  {
    id: 'F_priority',
    name: 'Priority',
    dataType: 'SINGLE_SELECT',
    options: [
      { id: 'o_p0', name: 'P0' },
      { id: 'o_p1', name: 'P1' },
    ],
  },
  {
    id: 'F_impact',
    name: 'impact',
    dataType: 'SINGLE_SELECT',
    options: [{ id: 'o_high', name: 'High' }],
  },
  { id: 'F_estimate', name: 'Estimate', dataType: 'NUMBER' },
  { id: 'F_start', name: 'Start date', dataType: 'DATE' },
  { id: 'F_target', name: 'Target Date', dataType: 'DATE' },
];

describe('parsePlan', () => {
  it('AC1: returns a frozen plan with numeric issue numbers sorted by issue number', () => {
    const plan = parsePlan(validRaw());

    expect(plan.project).toEqual({ owner: 'desig9stein', title: 'Planing' });
    expect(plan.issues.map((issue) => issue.number)).toEqual([13, 35]);
    expect(plan.issues[1]).toEqual({
      number: 35,
      status: 'In progress',
      priority: 'P0',
      impact: 'High',
      estimate: 1,
      start: '2026-11-10',
      target: '2026-11-12',
      milestone: 'Phase 2',
    });
    expect(Object.isFrozen(plan)).toBe(true);
    expect(Object.isFrozen(plan.issues)).toBe(true);
    expect(Object.isFrozen(plan.issues[0])).toBe(true);
    expect(Object.isFrozen(plan.milestones[0])).toBe(true);
  });

  it('AC2: lists every problem in one PlanValidationError', () => {
    const raw = validRaw();
    raw.milestones.push({ title: 'Phase 2', due: '2027-02-30', description: '' });
    raw.issues['35'] = {
      ...raw.issues['35'],
      start: '2026-11-20',
      target: '2026-11-12',
      estimate: -1,
      milestone: 'Phase 9',
    };
    raw.issues['13'] = { ...raw.issues['13'], start: '2027-13-01' };

    let error: unknown;
    try {
      parsePlan(raw);
    } catch (caught) {
      error = caught;
    }

    expect(error).toBeInstanceOf(PlanValidationError);
    const problems = (error as PlanValidationError).problems.join('\n');
    expect(problems).toMatch(/duplicate milestone "Phase 2"/i);
    expect(problems).toMatch(/milestone "Phase 2".*due.*2027-02-30/i);
    expect(problems).toMatch(/#35.*start.*after.*target/i);
    expect(problems).toMatch(/#35.*estimate/i);
    expect(problems).toMatch(/#35.*milestone "Phase 9"/i);
    expect(problems).toMatch(/#13.*start.*2027-13-01/i);
  });

  it('AC2: rejects missing sections, wrong types and invalid issue numbers', () => {
    expect(() => parsePlan(null)).toThrow(PlanValidationError);
    expect(() => parsePlan({ ...validRaw(), project: { owner: 'x' } })).toThrow(/project\.title/);
    expect(() => parsePlan({ ...validRaw(), issues: { '0': validRaw().issues['35'] } })).toThrow(
      /issue number "0"/,
    );
    expect(() => parsePlan({ ...validRaw(), issues: { abc: validRaw().issues['35'] } })).toThrow(
      /issue number "abc"/,
    );
    expect(() =>
      parsePlan({
        ...validRaw(),
        issues: { '35': { ...validRaw().issues['35'], priority: 3 } },
      }),
    ).toThrow(/#35.*priority/);
    expect(() =>
      parsePlan({
        ...validRaw(),
        issues: { '35': { ...validRaw().issues['35'], estimate: Number.NaN } },
      }),
    ).toThrow(/#35.*estimate/);
  });
});

describe('fieldUpdatesFor', () => {
  it('AC3: maps every planning key to its field, case-insensitively', () => {
    const plan = parsePlan(validRaw());
    const entry = plan.issues[1];
    if (entry === undefined) throw new Error('fixture');

    expect(fieldUpdatesFor(entry, fields)).toEqual([
      { fieldId: 'F_status', value: { singleSelectOptionId: 'o_progress' } },
      { fieldId: 'F_priority', value: { singleSelectOptionId: 'o_p0' } },
      { fieldId: 'F_impact', value: { singleSelectOptionId: 'o_high' } },
      { fieldId: 'F_estimate', value: { number: 1 } },
      { fieldId: 'F_start', value: { date: '2026-11-10' } },
      { fieldId: 'F_target', value: { date: '2026-11-12' } },
    ]);
  });

  it('AC4: names the issue, field and available options for an unknown option', () => {
    const plan = parsePlan({
      ...validRaw(),
      issues: { '35': { ...validRaw().issues['35'], priority: 'Urgent' } },
    });
    const entry = plan.issues[0];
    if (entry === undefined) throw new Error('fixture');

    expect(() => fieldUpdatesFor(entry, fields)).toThrow(PlanningFieldError);
    expect(() => fieldUpdatesFor(entry, fields)).toThrow(/#35.*Priority.*"Urgent".*P0, P1/);
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

describe('milestonesToCreate', () => {
  it('AC5: returns only missing milestones, in plan order', () => {
    const plan = parsePlan(validRaw());

    expect(milestonesToCreate(plan, ['Phase 2']).map((m) => m.title)).toEqual(['Phase 3']);
    expect(milestonesToCreate(plan, []).map((m) => m.title)).toEqual(['Phase 2', 'Phase 3']);
    expect(milestonesToCreate(plan, ['Phase 2', 'Phase 3'])).toEqual([]);
  });
});

describe('QA regressions', () => {
  it('trims milestone titles and issue milestone references', () => {
    const raw = validRaw();
    raw.milestones[1] = { title: ' Phase 3 ', due: '2027-01-29', description: 'Regions and farms' };
    raw.issues['13'] = { ...raw.issues['13'], milestone: 'Phase 3 ' };

    const plan = parsePlan(raw);

    expect(plan.milestones[1]?.title).toBe('Phase 3');
    expect(plan.issues[0]?.milestone).toBe('Phase 3');
  });

  it('matches existing milestones case-insensitively', () => {
    const plan = parsePlan(validRaw());

    expect(milestonesToCreate(plan, ['phase 2', 'PHASE 3'])).toEqual([]);
  });

  it('changedUpdates keeps only updates whose value differs from the current one', () => {
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

  it('milestoneChanges returns existing milestones whose due date or description differ', () => {
    const plan = parsePlan(validRaw());
    const existing = [
      {
        number: 1,
        title: 'phase 2',
        due: '2026-12-31',
        description: 'Visual identity and catalog',
      },
      { number: 2, title: 'Phase 3', due: '2027-01-15', description: 'Regions and farms' },
    ];

    expect(milestoneChanges(plan, existing)).toEqual([
      { number: 2, milestone: plan.milestones[1] },
    ]);
  });
});
