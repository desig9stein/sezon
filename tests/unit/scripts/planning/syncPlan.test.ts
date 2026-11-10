import { describe, expect, it } from 'vitest';
import {
  parsePlan,
  PlanningFieldError,
  type FieldUpdate,
  type MilestonePlan,
  type ProjectField,
} from '../../../../scripts/planning/plan.ts';
import { syncPlan, type PlanningClient } from '../../../../scripts/planning/syncPlan.ts';

const issue = (overrides: Record<string, unknown> = {}) => ({
  status: 'Backlog',
  priority: 'P1',
  impact: 'High',
  estimate: 2,
  start: '2027-01-11',
  target: '2027-01-13',
  milestone: 'Phase 3',
  ...overrides,
});

const plan = (issues: Record<string, unknown>) =>
  parsePlan({
    project: { owner: 'desig9stein', title: 'Planing' },
    milestones: [
      { title: 'Phase 2', due: '2026-12-31', description: 'Catalog' },
      { title: 'Phase 3', due: '2027-01-29', description: 'Regions' },
    ],
    issues,
  });

const fields: ReadonlyArray<ProjectField> = [
  {
    id: 'F_status',
    name: 'Status',
    dataType: 'SINGLE_SELECT',
    options: [{ id: 'o_b', name: 'Backlog' }],
  },
  {
    id: 'F_priority',
    name: 'Priority',
    dataType: 'SINGLE_SELECT',
    options: [{ id: 'o_p1', name: 'P1' }],
  },
  {
    id: 'F_impact',
    name: 'Impact',
    dataType: 'SINGLE_SELECT',
    options: [{ id: 'o_h', name: 'High' }],
  },
  { id: 'F_estimate', name: 'Estimate', dataType: 'NUMBER' },
  { id: 'F_start', name: 'Start date', dataType: 'DATE' },
  { id: 'F_target', name: 'Target date', dataType: 'DATE' },
];

function recordingClient(): { client: PlanningClient; calls: string[] } {
  const calls: string[] = [];
  const client: PlanningClient = {
    findProject: async (owner, title) => {
      calls.push(`findProject ${owner}/${title}`);
      return { id: 'P', fields };
    },
    listMilestones: async () => {
      calls.push('listMilestones');
      return [{ number: 1, title: 'Phase 2' }];
    },
    createMilestone: async (milestone: MilestonePlan) => {
      calls.push(`createMilestone ${milestone.title}`);
      return { number: 2, title: milestone.title };
    },
    ensureProjectItem: async (projectId, issueNumber) => {
      calls.push(`ensureProjectItem ${projectId} #${issueNumber}`);
      return `item-${issueNumber}`;
    },
    updateField: async (_projectId, itemId, update: FieldUpdate) => {
      calls.push(`updateField ${itemId} ${update.fieldId}`);
    },
    setMilestone: async (issueNumber, milestoneNumber) => {
      calls.push(`setMilestone #${issueNumber} ${milestoneNumber}`);
    },
  };
  return { client, calls };
}

describe('syncPlan', () => {
  it('AC8: creates missing milestones, then updates every issue', async () => {
    const { client, calls } = recordingClient();
    const logged: string[] = [];

    await syncPlan(plan({ '13': issue(), '35': issue({ milestone: 'Phase 2' }) }), client, (line) =>
      logged.push(line),
    );

    expect(calls).toEqual([
      'findProject desig9stein/Planing',
      'listMilestones',
      'createMilestone Phase 3',
      'ensureProjectItem P #13',
      'updateField item-13 F_status',
      'updateField item-13 F_priority',
      'updateField item-13 F_impact',
      'updateField item-13 F_estimate',
      'updateField item-13 F_start',
      'updateField item-13 F_target',
      'setMilestone #13 2',
      'ensureProjectItem P #35',
      'updateField item-35 F_status',
      'updateField item-35 F_priority',
      'updateField item-35 F_impact',
      'updateField item-35 F_estimate',
      'updateField item-35 F_start',
      'updateField item-35 F_target',
      'setMilestone #35 1',
    ]);
    expect(logged).toHaveLength(3);
    expect(logged.join('\n')).toMatch(/#13/);
    expect(logged.join('\n')).toMatch(/#35/);
  });

  it('AC8: throws before the first write when any issue has an invalid field', async () => {
    const { client, calls } = recordingClient();

    await expect(
      syncPlan(plan({ '13': issue(), '35': issue({ impact: 'Huge' }) }), client, () => {}),
    ).rejects.toThrow(PlanningFieldError);
    expect(calls).toEqual(['findProject desig9stein/Planing']);
  });
});
