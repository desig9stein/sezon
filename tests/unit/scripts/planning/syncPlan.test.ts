import { describe, expect, it } from 'vitest';
import {
  parsePlan,
  PlanningFieldError,
  type FieldUpdate,
  type ProjectField,
} from '../../../../scripts/planning/plan.ts';
import {
  syncPlan,
  type IssueItem,
  type PlanningClient,
} from '../../../../scripts/planning/syncPlan.ts';

const issue = (overrides: Record<string, unknown> = {}) => ({
  status: 'Backlog',
  priority: 'Medium',
  impact: 'Big',
  estimate: 2,
  start: '2027-01-11',
  target: '2027-01-13',
  ...overrides,
});

const plan = (issues: Record<string, unknown>) =>
  parsePlan({ project: { owner: 'desig9stein', title: 'Planing' }, issues });

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
    options: [{ id: 'o_m', name: 'Medium' }],
  },
  {
    id: 'F_impact',
    name: 'Impact',
    dataType: 'SINGLE_SELECT',
    options: [{ id: 'o_big', name: 'Big' }],
  },
  { id: 'F_estimate', name: 'Estimate', dataType: 'NUMBER' },
  { id: 'F_start', name: 'Start date', dataType: 'DATE' },
  { id: 'F_target', name: 'Target date', dataType: 'DATE' },
];

interface ClientState {
  readonly closed?: ReadonlySet<number>;
  readonly archived?: ReadonlySet<number>;
  readonly current?: ReadonlyMap<number, ReadonlyArray<FieldUpdate>>;
}

function recordingClient(state: ClientState = {}): { client: PlanningClient; calls: string[] } {
  const calls: string[] = [];
  const client: PlanningClient = {
    findProject: async (owner, title) => {
      calls.push(`findProject ${owner}/${title}`);
      return { id: 'P', fields };
    },
    issueItem: async (projectId, issueNumber): Promise<IssueItem> => {
      calls.push(`issueItem ${projectId} #${issueNumber}`);
      if (state.closed?.has(issueNumber) === true) return { closed: true };
      return {
        closed: false,
        itemId: `item-${issueNumber}`,
        archived: state.archived?.has(issueNumber) === true,
        values: state.current?.get(issueNumber) ?? [],
      };
    },
    updateField: async (_projectId, itemId, update: FieldUpdate) => {
      calls.push(`updateField ${itemId} ${update.fieldId}`);
    },
  };
  return { client, calls };
}

const allFields = (item: string) =>
  ['F_status', 'F_priority', 'F_impact', 'F_estimate', 'F_start', 'F_target'].map(
    (field) => `updateField ${item} ${field}`,
  );

describe('syncPlan', () => {
  it('AC8: ensures each project item and writes every field', async () => {
    const { client, calls } = recordingClient();
    const logged: string[] = [];

    await syncPlan(plan({ '13': issue(), '35': issue() }), client, (line) => logged.push(line));

    expect(calls).toEqual([
      'findProject desig9stein/Planing',
      'issueItem P #13',
      ...allFields('item-13'),
      'issueItem P #35',
      ...allFields('item-35'),
    ]);
    expect(logged).toHaveLength(2);
    expect(logged.join('\n')).toMatch(/#13.*6 field/);
  });

  it('AC8: throws before the first write when any issue has an invalid field', async () => {
    const { client, calls } = recordingClient();

    await expect(
      syncPlan(plan({ '13': issue(), '35': issue({ impact: 'Huge' }) }), client, () => {}),
    ).rejects.toThrow(PlanningFieldError);
    expect(calls).toEqual(['findProject desig9stein/Planing']);
  });

  it('skips closed issues without touching their fields', async () => {
    const { client, calls } = recordingClient({ closed: new Set([13]) });
    const logged: string[] = [];

    await syncPlan(plan({ '13': issue() }), client, (line) => logged.push(line));

    expect(calls).toEqual(['findProject desig9stein/Planing', 'issueItem P #13']);
    expect(logged.join('\n')).toMatch(/#13.*closed.*skipped/i);
  });

  it('writes only changed fields', async () => {
    const { client, calls } = recordingClient({
      current: new Map([
        [
          35,
          [
            { fieldId: 'F_status', value: { singleSelectOptionId: 'o_b' } },
            { fieldId: 'F_priority', value: { singleSelectOptionId: 'o_m' } },
            { fieldId: 'F_impact', value: { singleSelectOptionId: 'o_big' } },
            { fieldId: 'F_estimate', value: { number: 2 } },
            { fieldId: 'F_start', value: { date: '2027-01-11' } },
          ],
        ],
      ]),
    });

    await syncPlan(plan({ '35': issue() }), client, () => {});

    expect(calls.slice(-2)).toEqual(['issueItem P #35', 'updateField item-35 F_target']);
  });

  it('logs a warning for an archived project item', async () => {
    const { client } = recordingClient({ archived: new Set([13]) });
    const logged: string[] = [];

    await syncPlan(plan({ '13': issue() }), client, (line) => logged.push(line));

    expect(logged.join('\n')).toMatch(/#13.*archived/i);
  });
});
