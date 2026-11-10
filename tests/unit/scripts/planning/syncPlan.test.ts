import { describe, expect, it } from 'vitest';
import {
  parsePlan,
  PlanningFieldError,
  type FieldUpdate,
  type MilestonePlan,
  type ProjectField,
} from '../../../../scripts/planning/plan.ts';
import {
  syncPlan,
  type IssueItem,
  type Milestone,
  type PlanningClient,
} from '../../../../scripts/planning/syncPlan.ts';

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

interface ClientState {
  readonly closed?: ReadonlySet<number>;
  readonly archived?: ReadonlySet<number>;
  readonly current?: ReadonlyMap<number, ReadonlyArray<FieldUpdate>>;
  readonly milestoneOf?: ReadonlyMap<number, number>;
  readonly milestones?: ReadonlyArray<Milestone>;
}

function recordingClient(state: ClientState = {}): { client: PlanningClient; calls: string[] } {
  const calls: string[] = [];
  const client: PlanningClient = {
    findProject: async (owner, title) => {
      calls.push(`findProject ${owner}/${title}`);
      return { id: 'P', fields };
    },
    listMilestones: async () => {
      calls.push('listMilestones');
      return (
        state.milestones ?? [
          { number: 1, title: 'Phase 2', due: '2026-12-31', description: 'Catalog' },
        ]
      );
    },
    createMilestone: async (milestone: MilestonePlan) => {
      calls.push(`createMilestone ${milestone.title}`);
      return {
        number: 2,
        title: milestone.title,
        due: milestone.due,
        description: milestone.description,
      };
    },
    updateMilestone: async (number: number, milestone: MilestonePlan) => {
      calls.push(`updateMilestone ${number} ${milestone.due}`);
    },
    issueItem: async (projectId, issueNumber): Promise<IssueItem> => {
      calls.push(`issueItem ${projectId} #${issueNumber}`);
      if (state.closed?.has(issueNumber) === true) return { closed: true };
      return {
        closed: false,
        itemId: `item-${issueNumber}`,
        archived: state.archived?.has(issueNumber) === true,
        values: state.current?.get(issueNumber) ?? [],
        milestoneNumber: state.milestoneOf?.get(issueNumber),
      };
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

const allFields = (item: string) =>
  ['F_status', 'F_priority', 'F_impact', 'F_estimate', 'F_start', 'F_target'].map(
    (field) => `updateField ${item} ${field}`,
  );

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
      'issueItem P #13',
      ...allFields('item-13'),
      'setMilestone #13 2',
      'issueItem P #35',
      ...allFields('item-35'),
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

  it('skips closed issues without touching their fields or milestone', async () => {
    const { client, calls } = recordingClient({ closed: new Set([13]) });
    const logged: string[] = [];

    await syncPlan(plan({ '13': issue({ milestone: 'Phase 2' }) }), client, (line) =>
      logged.push(line),
    );

    expect(calls.filter((call) => call.includes('#13') || call.includes('item-13'))).toEqual([
      'issueItem P #13',
    ]);
    expect(logged.join('\n')).toMatch(/#13.*closed.*skipped/i);
  });

  it('writes only changed fields and skips an unchanged milestone', async () => {
    const { client, calls } = recordingClient({
      current: new Map([
        [
          35,
          [
            { fieldId: 'F_status', value: { singleSelectOptionId: 'o_b' } },
            { fieldId: 'F_priority', value: { singleSelectOptionId: 'o_p1' } },
            { fieldId: 'F_impact', value: { singleSelectOptionId: 'o_h' } },
            { fieldId: 'F_estimate', value: { number: 2 } },
            { fieldId: 'F_start', value: { date: '2027-01-11' } },
          ],
        ],
      ]),
      milestoneOf: new Map([[35, 1]]),
    });

    await syncPlan(plan({ '35': issue({ milestone: 'Phase 2' }) }), client, () => {});

    expect(calls.slice(-2)).toEqual(['issueItem P #35', 'updateField item-35 F_target']);
  });

  it('updates an existing milestone whose due date differs', async () => {
    const { client, calls } = recordingClient({
      milestones: [
        { number: 1, title: 'Phase 2', due: '2026-12-31', description: 'Catalog' },
        { number: 2, title: 'Phase 3', due: '2027-01-15', description: 'Regions' },
      ],
    });

    await syncPlan(plan({ '13': issue() }), client, () => {});

    expect(calls).toContain('updateMilestone 2 2027-01-29');
    expect(calls).not.toContain('createMilestone Phase 3');
  });

  it('logs a warning for an archived project item', async () => {
    const { client } = recordingClient({ archived: new Set([13]) });
    const logged: string[] = [];

    await syncPlan(plan({ '13': issue() }), client, (line) => logged.push(line));

    expect(logged.join('\n')).toMatch(/#13.*archived/i);
  });
});
