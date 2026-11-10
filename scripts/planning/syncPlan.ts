import {
  changedUpdates,
  fieldUpdatesFor,
  milestoneChanges,
  milestonesToCreate,
  PlanningFieldError,
  sameMilestoneTitle,
  type ExistingMilestone,
  type FieldUpdate,
  type MilestonePlan,
  type Plan,
  type ProjectField,
} from './plan.ts';

/** A repository milestone. */
export type Milestone = ExistingMilestone;

/** The state of an issue relative to the project. */
export type IssueItem =
  | { readonly closed: true }
  | {
      readonly closed: false;
      readonly itemId: string;
      readonly archived: boolean;
      readonly values: ReadonlyArray<FieldUpdate>;
      readonly milestoneNumber: number | undefined;
    };

/** The GitHub operations the planning sync needs. */
export interface PlanningClient {
  findProject(
    owner: string,
    title: string,
  ): Promise<{ readonly id: string; readonly fields: ReadonlyArray<ProjectField> }>;
  listMilestones(): Promise<ReadonlyArray<Milestone>>;
  createMilestone(milestone: MilestonePlan): Promise<Milestone>;
  updateMilestone(number: number, milestone: MilestonePlan): Promise<void>;
  issueItem(projectId: string, issueNumber: number): Promise<IssueItem>;
  updateField(projectId: string, itemId: string, update: FieldUpdate): Promise<void>;
  setMilestone(issueNumber: number, milestoneNumber: number): Promise<void>;
}

async function syncMilestones(
  plan: Plan,
  client: PlanningClient,
  log: (line: string) => void,
): Promise<ReadonlyArray<Milestone>> {
  const existing = await client.listMilestones();
  for (const change of milestoneChanges(plan, existing)) {
    await client.updateMilestone(change.number, change.milestone);
    log(`Updated milestone "${change.milestone.title}" (#${change.number})`);
  }
  const created: Milestone[] = [];
  for (const milestone of milestonesToCreate(
    plan,
    existing.map((candidate) => candidate.title),
  )) {
    const milestoneCreated = await client.createMilestone(milestone);
    created.push(milestoneCreated);
    log(`Created milestone "${milestoneCreated.title}" (#${milestoneCreated.number})`);
  }
  return [...existing, ...created];
}

function milestoneNumberFor(
  issueNumber: number,
  title: string,
  milestones: ReadonlyArray<Milestone>,
): number {
  const milestone = milestones.find((candidate) => sameMilestoneTitle(candidate.title, title));
  if (milestone === undefined) {
    throw new PlanningFieldError(`#${issueNumber}: milestone "${title}" does not exist on GitHub`);
  }
  return milestone.number;
}

/**
 * Applies a plan to GitHub: creates or updates milestones, adds every open issue to the project,
 * and writes the planning fields and milestone that differ from the current values. Closed
 * issues are skipped. All field updates are computed before the first write, so a plan that
 * does not match the project's fields changes nothing.
 * @param plan - The validated plan.
 * @param client - GitHub adapter.
 * @param log - Receives one line per changed milestone and per issue.
 * @throws {PlanningFieldError} When a plan value does not match the project's fields.
 */
export async function syncPlan(
  plan: Plan,
  client: PlanningClient,
  log: (line: string) => void,
): Promise<void> {
  const project = await client.findProject(plan.project.owner, plan.project.title);
  const updates = plan.issues.map((issue) => fieldUpdatesFor(issue, project.fields));
  const milestones = await syncMilestones(plan, client, log);

  for (const [index, issue] of plan.issues.entries()) {
    const item = await client.issueItem(project.id, issue.number);
    if (item.closed) {
      log(`#${issue.number}: closed, skipped`);
      continue;
    }
    if (item.archived) log(`#${issue.number}: warning, the project item is archived`);
    const changes = changedUpdates(updates[index] ?? [], item.values);
    for (const update of changes) await client.updateField(project.id, item.itemId, update);
    const milestoneNumber = milestoneNumberFor(issue.number, issue.milestone, milestones);
    const milestoneChanged = item.milestoneNumber !== milestoneNumber;
    if (milestoneChanged) await client.setMilestone(issue.number, milestoneNumber);
    log(
      `#${issue.number}: ${changes.length} field(s)${milestoneChanged ? ' and milestone' : ''} updated ` +
        `(${issue.status}, ${issue.priority}, ${issue.impact}, ${issue.estimate} d, ` +
        `${issue.start} → ${issue.target}, ${issue.milestone})`,
    );
  }
}
