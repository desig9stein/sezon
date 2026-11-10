import {
  fieldUpdatesFor,
  milestonesToCreate,
  type FieldUpdate,
  type MilestonePlan,
  type Plan,
  type ProjectField,
} from './plan.ts';

/** A repository milestone. */
export interface Milestone {
  readonly number: number;
  readonly title: string;
}

/** The GitHub operations the planning sync needs. */
export interface PlanningClient {
  findProject(
    owner: string,
    title: string,
  ): Promise<{ readonly id: string; readonly fields: ReadonlyArray<ProjectField> }>;
  listMilestones(): Promise<ReadonlyArray<Milestone>>;
  createMilestone(milestone: MilestonePlan): Promise<Milestone>;
  ensureProjectItem(projectId: string, issueNumber: number): Promise<string>;
  updateField(projectId: string, itemId: string, update: FieldUpdate): Promise<void>;
  setMilestone(issueNumber: number, milestoneNumber: number): Promise<void>;
}

/**
 * Applies a plan to GitHub: creates missing milestones, adds every issue to the project,
 * sets its planning fields and its milestone. All field updates are computed before the
 * first write, so an invalid plan changes nothing.
 * @param plan - The validated plan.
 * @param client - GitHub adapter.
 * @param log - Receives one line per created milestone and per synced issue.
 * @throws {PlanningFieldError} When a plan value does not match the project's fields.
 */
export async function syncPlan(
  plan: Plan,
  client: PlanningClient,
  log: (line: string) => void,
): Promise<void> {
  const project = await client.findProject(plan.project.owner, plan.project.title);
  const updates = plan.issues.map((issue) => fieldUpdatesFor(issue, project.fields));

  const milestoneNumbers = new Map<string, number>();
  const existing = await client.listMilestones();
  for (const milestone of existing) milestoneNumbers.set(milestone.title, milestone.number);
  const missing = milestonesToCreate(
    plan,
    existing.map((milestone) => milestone.title),
  );
  for (const milestone of missing) {
    const created = await client.createMilestone(milestone);
    milestoneNumbers.set(created.title, created.number);
    log(`Created milestone "${created.title}" (#${created.number})`);
  }

  for (const [index, issue] of plan.issues.entries()) {
    const itemId = await client.ensureProjectItem(project.id, issue.number);
    for (const update of updates[index] ?? []) {
      await client.updateField(project.id, itemId, update);
    }
    const milestoneNumber = milestoneNumbers.get(issue.milestone);
    if (milestoneNumber !== undefined) await client.setMilestone(issue.number, milestoneNumber);
    log(
      `#${issue.number}: ${issue.status}, ${issue.priority}, ${issue.impact}, ${issue.estimate} d, ` +
        `${issue.start} → ${issue.target}, ${issue.milestone}`,
    );
  }
}
