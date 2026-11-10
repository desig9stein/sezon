import type { FieldUpdate, MilestonePlan, ProjectField } from './plan.ts';
import type { IssueItem, Milestone, PlanningClient } from './syncPlan.ts';

const API_URL = 'https://api.github.com';
const API_VERSION = '2022-11-28';
const USER_AGENT = 'sezon-planning-sync';
const END_OF_DAY = 'T23:59:59Z';
const PAGE_SIZE = 100;

const FIND_PROJECT = `query($owner: String!) {
  user(login: $owner) {
    projectsV2(first: ${PAGE_SIZE}) {
      pageInfo { hasNextPage }
      nodes {
        id
        title
        fields(first: ${PAGE_SIZE}) {
          nodes {
            ... on ProjectV2FieldCommon { id name dataType }
            ... on ProjectV2SingleSelectField { options { id name } }
          }
        }
      }
    }
  }
}`;

const FIND_ISSUE = `query($owner: String!, $name: String!, $number: Int!) {
  repository(owner: $owner, name: $name) {
    issue(number: $number) {
      id
      state
      milestone { number }
      projectItems(first: ${PAGE_SIZE}) {
        nodes {
          id
          isArchived
          project { id }
          fieldValues(first: ${PAGE_SIZE}) {
            nodes {
              ... on ProjectV2ItemFieldSingleSelectValue { optionId field { ... on ProjectV2FieldCommon { id } } }
              ... on ProjectV2ItemFieldNumberValue { number field { ... on ProjectV2FieldCommon { id } } }
              ... on ProjectV2ItemFieldDateValue { date field { ... on ProjectV2FieldCommon { id } } }
            }
          }
        }
      }
    }
  }
}`;

const ADD_ITEM = `mutation($projectId: ID!, $contentId: ID!) {
  addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) { item { id } }
}`;

const UPDATE_FIELD = `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $value: ProjectV2FieldValue!) {
  updateProjectV2ItemFieldValue(
    input: { projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: $value }
  ) { projectV2Item { id } }
}`;

interface RawField {
  readonly id?: string;
  readonly name?: string;
  readonly dataType?: string;
  readonly options?: ReadonlyArray<{ readonly id: string; readonly name: string }>;
}

interface FindProjectData {
  readonly user: {
    readonly projectsV2: {
      readonly pageInfo: { readonly hasNextPage: boolean };
      readonly nodes: ReadonlyArray<{
        readonly id: string;
        readonly title: string;
        readonly fields: { readonly nodes: ReadonlyArray<RawField> };
      }>;
    };
  } | null;
}

interface RawFieldValue {
  readonly optionId?: string;
  readonly number?: number;
  readonly date?: string;
  readonly field?: { readonly id?: string };
}

interface FindIssueData {
  readonly repository: {
    readonly issue: {
      readonly id: string;
      readonly state: string;
      readonly milestone: { readonly number: number } | null;
      readonly projectItems: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly isArchived: boolean;
          readonly project: { readonly id: string };
          readonly fieldValues: { readonly nodes: ReadonlyArray<RawFieldValue> };
        }>;
      };
    } | null;
  } | null;
}

interface RawMilestone {
  readonly number: number;
  readonly title: string;
  readonly due_on: string | null;
  readonly description: string | null;
}

/** Options for {@link GitHubPlanningClient}. */
export interface GitHubPlanningClientOptions {
  readonly token: string;
  readonly fetch: typeof fetch;
  readonly repository: { readonly owner: string; readonly name: string };
}

/** Thrown when the GitHub API returns an error or an unexpected response. */
export class GitHubApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

function toProjectField(raw: RawField): ProjectField | undefined {
  if (raw.id === undefined || raw.name === undefined || raw.dataType === undefined) {
    return undefined;
  }
  const base = { id: raw.id, name: raw.name, dataType: raw.dataType };
  return raw.options === undefined ? base : { ...base, options: raw.options };
}

function toFieldUpdate(raw: RawFieldValue): FieldUpdate | undefined {
  const fieldId = raw.field?.id;
  if (fieldId === undefined) return undefined;
  if (raw.optionId !== undefined) return { fieldId, value: { singleSelectOptionId: raw.optionId } };
  if (raw.number !== undefined) return { fieldId, value: { number: raw.number } };
  if (raw.date !== undefined) return { fieldId, value: { date: raw.date } };
  return undefined;
}

const toMilestone = (raw: RawMilestone): Milestone => ({
  number: raw.number,
  title: raw.title,
  due: raw.due_on === null ? undefined : raw.due_on.slice(0, 10),
  description: raw.description ?? '',
});

async function readJson(response: Response): Promise<unknown> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    return undefined;
  }
}

const messageOf = (payload: unknown): string =>
  typeof payload === 'object' && payload !== null && 'message' in payload
    ? String(payload.message)
    : '';

/** GitHub GraphQL (user-owned Projects v2) and REST (milestones) adapter for the planning sync. */
export class GitHubPlanningClient implements PlanningClient {
  readonly #token: string;
  readonly #fetch: typeof fetch;
  readonly #owner: string;
  readonly #name: string;

  constructor(options: GitHubPlanningClientOptions) {
    this.#token = options.token;
    this.#fetch = options.fetch;
    this.#owner = options.repository.owner;
    this.#name = options.repository.name;
  }

  /**
   * Finds a user-owned project by title and reads its fields.
   * @throws {GitHubApiError} When the user has no project with that title.
   */
  async findProject(
    owner: string,
    title: string,
  ): Promise<{ readonly id: string; readonly fields: ReadonlyArray<ProjectField> }> {
    const data = await this.#graphql<FindProjectData>(FIND_PROJECT, { owner });
    const projects = data.user?.projectsV2;
    const project = projects?.nodes.find((node) => node.title === title);
    if (project === undefined) {
      const more =
        projects?.pageInfo.hasNextPage === true ? ' (the user has more than 100 projects)' : '';
      throw new GitHubApiError(`No project "${title}" found for user ${owner}${more}`);
    }
    const fields = project.fields.nodes.flatMap((raw) => toProjectField(raw) ?? []);
    return { id: project.id, fields };
  }

  /**
   * Lists the repository's milestones, open and closed.
   * @throws {GitHubApiError} When the list may be truncated (100 or more milestones).
   */
  async listMilestones(): Promise<ReadonlyArray<Milestone>> {
    const milestones = await this.#rest<ReadonlyArray<RawMilestone>>(
      'GET',
      `/repos/${this.#owner}/${this.#name}/milestones?state=all&per_page=${PAGE_SIZE}`,
    );
    if (milestones.length >= PAGE_SIZE) {
      throw new GitHubApiError(
        `The repository has ${PAGE_SIZE} milestones or more; pagination is not supported`,
      );
    }
    return milestones.map(toMilestone);
  }

  /** Creates a milestone due at the end of its due date (UTC). */
  async createMilestone(milestone: MilestonePlan): Promise<Milestone> {
    const created = await this.#rest<RawMilestone>(
      'POST',
      `/repos/${this.#owner}/${this.#name}/milestones`,
      {
        title: milestone.title,
        due_on: `${milestone.due}${END_OF_DAY}`,
        description: milestone.description,
      },
    );
    return toMilestone(created);
  }

  /** Sets the due date and description of an existing milestone. */
  async updateMilestone(number: number, milestone: MilestonePlan): Promise<void> {
    await this.#rest('PATCH', `/repos/${this.#owner}/${this.#name}/milestones/${number}`, {
      due_on: `${milestone.due}${END_OF_DAY}`,
      description: milestone.description,
    });
  }

  /**
   * Returns the project item of an open issue with its current field values and milestone,
   * adding the issue to the project first when needed. Closed issues are not added.
   * @throws {GitHubApiError} When the issue does not exist.
   */
  async issueItem(projectId: string, issueNumber: number): Promise<IssueItem> {
    const data = await this.#graphql<FindIssueData>(FIND_ISSUE, {
      owner: this.#owner,
      name: this.#name,
      number: issueNumber,
    });
    const issue = data.repository?.issue;
    if (issue === null || issue === undefined) {
      throw new GitHubApiError(`Issue #${issueNumber} not found in ${this.#owner}/${this.#name}`);
    }
    if (issue.state !== 'OPEN') return { closed: true };
    const milestoneNumber = issue.milestone?.number;
    const existing = issue.projectItems.nodes.find((item) => item.project.id === projectId);
    if (existing !== undefined) {
      return {
        closed: false,
        itemId: existing.id,
        archived: existing.isArchived,
        values: existing.fieldValues.nodes.flatMap((raw) => toFieldUpdate(raw) ?? []),
        milestoneNumber,
      };
    }
    const added = await this.#graphql<{
      readonly addProjectV2ItemById: { readonly item: { readonly id: string } };
    }>(ADD_ITEM, { projectId, contentId: issue.id });
    return {
      closed: false,
      itemId: added.addProjectV2ItemById.item.id,
      archived: false,
      values: [],
      milestoneNumber,
    };
  }

  /** Sets one field of a project item. */
  async updateField(projectId: string, itemId: string, update: FieldUpdate): Promise<void> {
    await this.#graphql(UPDATE_FIELD, {
      projectId,
      itemId,
      fieldId: update.fieldId,
      value: update.value,
    });
  }

  /** Assigns a milestone to an issue. */
  async setMilestone(issueNumber: number, milestoneNumber: number): Promise<void> {
    await this.#rest('PATCH', `/repos/${this.#owner}/${this.#name}/issues/${issueNumber}`, {
      milestone: milestoneNumber,
    });
  }

  #headers(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.#token}`,
      Accept: 'application/vnd.github+json',
      'Content-Type': 'application/json',
      'User-Agent': USER_AGENT,
      'X-GitHub-Api-Version': API_VERSION,
    };
  }

  async #graphql<T>(query: string, variables: Record<string, unknown>): Promise<T> {
    const response = await this.#fetch(`${API_URL}/graphql`, {
      method: 'POST',
      headers: this.#headers(),
      body: JSON.stringify({ query, variables }),
    });
    const payload = (await readJson(response)) as
      | { readonly data?: T; readonly errors?: ReadonlyArray<{ readonly message: string }> }
      | undefined;
    const errors = payload?.errors ?? [];
    if (errors.length > 0) {
      throw new GitHubApiError(`GraphQL error: ${errors.map((error) => error.message).join('; ')}`);
    }
    if (!response.ok || payload?.data === undefined) {
      throw new GitHubApiError(
        `GraphQL request failed: ${response.status} ${messageOf(payload)}`.trim(),
      );
    }
    return payload.data;
  }

  async #rest<T>(method: string, path: string, body?: Record<string, unknown>): Promise<T> {
    const response = await this.#fetch(`${API_URL}${path}`, {
      method,
      headers: this.#headers(),
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });
    const payload = await readJson(response);
    if (!response.ok || payload === undefined) {
      throw new GitHubApiError(
        `${method} ${path} failed: ${response.status} ${messageOf(payload)}`.trim(),
      );
    }
    return payload as T;
  }
}
