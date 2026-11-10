import {
  changedUpdates,
  fieldUpdatesFor,
  type FieldUpdate,
  type Plan,
  type ProjectField,
} from './plan.ts';

/** The state of an issue relative to the project. */
export type IssueItem =
  | { readonly closed: true }
  | {
      readonly closed: false;
      readonly itemId: string;
      readonly archived: boolean;
      readonly values: ReadonlyArray<FieldUpdate>;
    };

/** The GitHub operations the planning sync needs. */
export interface PlanningClient {
  findProject(
    owner: string,
    title: string,
  ): Promise<{ readonly id: string; readonly fields: ReadonlyArray<ProjectField> }>;
  issueItem(projectId: string, issueNumber: number): Promise<IssueItem>;
  updateField(projectId: string, itemId: string, update: FieldUpdate): Promise<void>;
}

/**
 * Applies a plan to the project: adds every open issue to it and writes the planning fields
 * that differ from the current values. Closed issues are skipped. All field updates are
 * computed before the first write, so a plan that does not match the project's fields
 * changes nothing.
 * @param plan - The validated plan.
 * @param client - GitHub adapter.
 * @param log - Receives one line per issue.
 * @throws {PlanningFieldError} When a plan value does not match the project's fields.
 */
export async function syncPlan(
  plan: Plan,
  client: PlanningClient,
  log: (line: string) => void,
): Promise<void> {
  const project = await client.findProject(plan.project.owner, plan.project.title);
  const updates = plan.issues.map((issue) => fieldUpdatesFor(issue, project.fields));

  for (const [index, issue] of plan.issues.entries()) {
    const item = await client.issueItem(project.id, issue.number);
    if (item.closed) {
      log(`#${issue.number}: closed, skipped`);
      continue;
    }
    if (item.archived) log(`#${issue.number}: warning, the project item is archived`);
    const changes = changedUpdates(updates[index] ?? [], item.values);
    for (const update of changes) await client.updateField(project.id, item.itemId, update);
    log(
      `#${issue.number}: ${changes.length} field(s) updated ` +
        `(${issue.status}, ${issue.priority}, ${issue.impact}, ${issue.estimate} d, ` +
        `${issue.start} → ${issue.target})`,
    );
  }
}
