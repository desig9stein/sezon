import type { FieldUpdate, ProjectField } from './plan.ts';
import type { IssueItem, PlanningClient } from './syncPlan.ts';

const API_URL = 'https://api.github.com';
const API_VERSION = '2022-11-28';
const USER_AGENT = 'sezon-planning-sync';
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
      projectItems(first: ${PAGE_SIZE}) {
        pageInfo { hasNextPage }
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
      readonly projectItems: {
        readonly pageInfo: { readonly hasNextPage: boolean };
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

/** GitHub GraphQL adapter for the planning sync (user-owned Projects v2). */
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
   * Returns the project item of an open issue with its current field values,
   * adding the issue to the project first when needed. Closed issues are not added.
   * @throws {GitHubApiError} When the issue does not exist, or its item may be on a later page.
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
    const existing = issue.projectItems.nodes.find((item) => item.project.id === projectId);
    if (existing === undefined && issue.projectItems.pageInfo.hasNextPage) {
      throw new GitHubApiError(
        `#${issueNumber} is in more than ${PAGE_SIZE} project items; pagination is not supported`,
      );
    }
    if (existing !== undefined) {
      return {
        closed: false,
        itemId: existing.id,
        archived: existing.isArchived,
        values: existing.fieldValues.nodes.flatMap((raw) => toFieldUpdate(raw) ?? []),
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
}
