/** A calendar date in `YYYY-MM-DD` form. */
export type IsoDate = string;

/** The GitHub Projects (v2) project that holds the planning fields. */
export interface ProjectRef {
  readonly owner: string;
  readonly title: string;
}

/** A milestone declared in the planning file. */
export interface MilestonePlan {
  readonly title: string;
  readonly due: IsoDate;
  readonly description: string;
}

/** Planning metadata of one issue. */
export interface IssuePlan {
  readonly number: number;
  readonly status: string;
  readonly priority: string;
  readonly impact: string;
  readonly estimate: number;
  readonly start: IsoDate;
  readonly target: IsoDate;
  readonly milestone: string;
}

/** A validated planning file. */
export interface Plan {
  readonly project: ProjectRef;
  readonly milestones: ReadonlyArray<MilestonePlan>;
  readonly issues: ReadonlyArray<IssuePlan>;
}

/** A project field as read from GitHub. */
export interface ProjectField {
  readonly id: string;
  readonly name: string;
  readonly dataType: string;
  readonly options?: ReadonlyArray<{ readonly id: string; readonly name: string }>;
}

/** The value of one project field update, in the shape of `ProjectV2FieldValue`. */
export type FieldValue =
  | { readonly singleSelectOptionId: string }
  | { readonly number: number }
  | { readonly date: IsoDate };

/** One field to set on a project item. */
export interface FieldUpdate {
  readonly fieldId: string;
  readonly value: FieldValue;
}

/** Thrown by {@link parsePlan} with every problem found in the planning file. */
export class PlanValidationError extends Error {
  readonly problems: ReadonlyArray<string>;

  constructor(problems: ReadonlyArray<string>) {
    super(`Invalid planning file:\n${problems.map((problem) => `- ${problem}`).join('\n')}`);
    this.name = 'PlanValidationError';
    this.problems = Object.freeze([...problems]);
  }
}

/** Thrown when a plan value cannot be mapped to a field or option of the project. */
export class PlanningFieldError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PlanningFieldError';
  }
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISSUE_NUMBER = /^[1-9]\d*$/;
const TEXT_KEYS = ['status', 'priority', 'impact', 'milestone'] as const;
const DATE_KEYS = ['start', 'target'] as const;

type FieldKind = 'SINGLE_SELECT' | 'NUMBER' | 'DATE';

const FIELD_MAP: ReadonlyArray<{
  readonly key: 'status' | 'priority' | 'impact' | 'estimate' | 'start' | 'target';
  readonly name: string;
  readonly kind: FieldKind;
}> = [
  { key: 'status', name: 'Status', kind: 'SINGLE_SELECT' },
  { key: 'priority', name: 'Priority', kind: 'SINGLE_SELECT' },
  { key: 'impact', name: 'Impact', kind: 'SINGLE_SELECT' },
  { key: 'estimate', name: 'Estimate', kind: 'NUMBER' },
  { key: 'start', name: 'Start date', kind: 'DATE' },
  { key: 'target', name: 'Target date', kind: 'DATE' },
];

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim() !== '';

/**
 * Returns whether the value is a `YYYY-MM-DD` string naming a real calendar date.
 * @param value - Value to check.
 */
export function isIsoDate(value: unknown): value is IsoDate {
  if (typeof value !== 'string' || !ISO_DATE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function parseProject(raw: unknown, problems: string[]): ProjectRef {
  const project = isRecord(raw) ? raw : {};
  if (!isRecord(raw)) problems.push('project must be a map with owner and title');
  const { owner, title } = project;
  if (!isNonEmptyString(owner)) problems.push('project.owner must be a non-empty string');
  if (!isNonEmptyString(title)) problems.push('project.title must be a non-empty string');
  return Object.freeze({ owner: String(owner ?? ''), title: String(title ?? '') });
}

function parseMilestones(raw: unknown, problems: string[]): ReadonlyArray<MilestonePlan> {
  if (!Array.isArray(raw)) {
    problems.push('milestones must be a list');
    return Object.freeze([]);
  }
  const seen = new Set<string>();
  const milestones = raw.map((entry: unknown, index): MilestonePlan => {
    const milestone = isRecord(entry) ? entry : {};
    const { title, due, description = '' } = milestone;
    const label = isNonEmptyString(title) ? `milestone "${title}"` : `milestone ${index + 1}`;
    if (!isNonEmptyString(title)) problems.push(`${label}: title must be a non-empty string`);
    if (!isIsoDate(due)) {
      problems.push(`${label}: due must be a YYYY-MM-DD date, got "${String(due)}"`);
    }
    if (typeof description !== 'string') problems.push(`${label}: description must be a string`);
    if (isNonEmptyString(title)) {
      if (seen.has(title)) problems.push(`duplicate milestone "${title}"`);
      seen.add(title);
    }
    return Object.freeze({
      title: String(title ?? ''),
      due: String(due ?? ''),
      description: String(description),
    });
  });
  return Object.freeze(milestones);
}

function parseIssue(
  key: string,
  raw: unknown,
  milestoneTitles: ReadonlySet<string>,
  problems: string[],
): IssuePlan {
  const label = `#${key}`;
  const entry = isRecord(raw) ? raw : {};
  if (!isRecord(raw)) problems.push(`${label}: must be a map of planning fields`);
  for (const name of TEXT_KEYS) {
    if (!isNonEmptyString(entry[name]))
      problems.push(`${label}: ${name} must be a non-empty string`);
  }
  for (const name of DATE_KEYS) {
    if (!isIsoDate(entry[name])) {
      problems.push(`${label}: ${name} must be a YYYY-MM-DD date, got "${String(entry[name])}"`);
    }
  }
  const { estimate, start, target, milestone } = entry;
  if (typeof estimate !== 'number' || !Number.isFinite(estimate) || estimate < 0) {
    problems.push(`${label}: estimate must be a finite number ≥ 0, got ${String(estimate)}`);
  }
  if (isIsoDate(start) && isIsoDate(target) && start > target) {
    problems.push(`${label}: start ${start} is after target ${target}`);
  }
  if (isNonEmptyString(milestone) && !milestoneTitles.has(milestone)) {
    problems.push(`${label}: milestone "${milestone}" is not declared under milestones`);
  }
  return Object.freeze({
    number: Number(key),
    status: String(entry['status'] ?? ''),
    priority: String(entry['priority'] ?? ''),
    impact: String(entry['impact'] ?? ''),
    estimate: Number(estimate),
    start: String(start ?? ''),
    target: String(target ?? ''),
    milestone: String(milestone ?? ''),
  });
}

function parseIssues(
  raw: unknown,
  milestones: ReadonlyArray<MilestonePlan>,
  problems: string[],
): ReadonlyArray<IssuePlan> {
  if (!isRecord(raw)) {
    problems.push('issues must be a map from issue number to planning fields');
    return Object.freeze([]);
  }
  const titles = new Set(milestones.map((milestone) => milestone.title));
  const issues = Object.entries(raw).flatMap(([key, entry]) => {
    if (!ISSUE_NUMBER.test(key)) {
      problems.push(`issue number "${key}" must be a positive integer`);
      return [];
    }
    return [parseIssue(key, entry, titles, problems)];
  });
  return Object.freeze(issues.sort((a, b) => a.number - b.number));
}

/**
 * Validates a planning file parsed from YAML or JSON.
 * @param raw - The parsed file.
 * @returns The frozen plan, issues sorted by number.
 * @throws {PlanValidationError} Listing every problem found.
 */
export function parsePlan(raw: unknown): Plan {
  const problems: string[] = [];
  const root = isRecord(raw) ? raw : {};
  if (!isRecord(raw)) problems.push('the planning file must be a map');
  const project = parseProject(root['project'], problems);
  const milestones = parseMilestones(root['milestones'], problems);
  const issues = parseIssues(root['issues'], milestones, problems);
  if (problems.length > 0) throw new PlanValidationError(problems);
  return Object.freeze({ project, milestones, issues });
}

const sameName = (a: string, b: string): boolean =>
  a.localeCompare(b, undefined, { sensitivity: 'accent' }) === 0;

function fieldValue(
  entry: IssuePlan,
  field: ProjectField,
  key: string,
  kind: FieldKind,
): FieldValue {
  if (kind === 'NUMBER') return { number: entry.estimate };
  if (kind === 'DATE') return { date: key === 'start' ? entry.start : entry.target };
  const wanted = String(entry[key as 'status' | 'priority' | 'impact']);
  const options = field.options ?? [];
  const option = options.find((candidate) => sameName(candidate.name, wanted));
  if (option === undefined) {
    const available = options.map((candidate) => candidate.name).join(', ');
    throw new PlanningFieldError(
      `#${entry.number}: field "${field.name}" has no option "${wanted}" (available: ${available})`,
    );
  }
  return { singleSelectOptionId: option.id };
}

/**
 * Maps an issue's planning values to project field updates.
 * Field names and option names match case-insensitively.
 * @param entry - The issue's planning values.
 * @param fields - The project's fields.
 * @returns One update per planning key, in the order status, priority, impact, estimate, start, target.
 * @throws {PlanningFieldError} When a field or option is missing, or a field has another type.
 */
export function fieldUpdatesFor(
  entry: IssuePlan,
  fields: ReadonlyArray<ProjectField>,
): ReadonlyArray<FieldUpdate> {
  return Object.freeze(
    FIELD_MAP.map(({ key, name, kind }) => {
      const field = fields.find((candidate) => sameName(candidate.name, name));
      if (field === undefined) {
        throw new PlanningFieldError(`#${entry.number}: the project has no field "${name}"`);
      }
      if (field.dataType !== kind) {
        throw new PlanningFieldError(
          `#${entry.number}: field "${field.name}" must be ${kind}, got ${field.dataType}`,
        );
      }
      return Object.freeze({ fieldId: field.id, value: fieldValue(entry, field, key, kind) });
    }),
  );
}

/**
 * Returns the plan's milestones that do not exist on GitHub yet.
 * @param plan - The validated plan.
 * @param existingTitles - Titles of the repository's milestones (open and closed).
 * @returns The missing milestones, in plan order.
 */
export function milestonesToCreate(
  plan: Plan,
  existingTitles: ReadonlyArray<string>,
): ReadonlyArray<MilestonePlan> {
  const existing = new Set(existingTitles);
  return Object.freeze(plan.milestones.filter((milestone) => !existing.has(milestone.title)));
}
