import type { FieldUpdate, MilestonePlan, ProjectField } from './plan.ts';
import type { Milestone, PlanningClient } from './syncPlan.ts';

const API_URL = 'https://api.github.com';
const API_VERSION = '2022-11-28';
const USER_AGENT = 'sezon-planning-sync';
const END_OF_DAY = 'T23:59:59Z';

const FIND_PROJECT = `query($owner: String!) {
  user(login: $owner) {
    projectsV2(first: 100) {
      nodes {
        id
        title
        fields(first: 50) {
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
      projectItems(first: 50) { nodes { id project { id } } }
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
      readonly nodes: ReadonlyArray<{
        readonly id: string;
        readonly title: string;
        readonly fields: { readonly nodes: ReadonlyArray<RawField> };
      }>;
    };
  } | null;
}

interface FindIssueData {
  readonly repository: {
    readonly issue: {
      readonly id: string;
      readonly projectItems: {
        readonly nodes: ReadonlyArray<{
          readonly id: string;
          readonly project: { readonly id: string };
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

/** Thrown when the GitHub API returns an error. */
export class GitHubApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

function toProjectField(raw: RawField): ProjectField | undefined {
  if (raw.id === undefined || raw.name === undefined || raw.dataType === undefined)
    return undefined;
  const base = { id: raw.id, name: raw.name, dataType: raw.dataType };
  return raw.options === undefined ? base : { ...base, options: raw.options };
}

/** GitHub GraphQL (Projects v2) and REST (milestones) adapter for the planning sync. */
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
    const project = data.user?.projectsV2.nodes.find((node) => node.title === title);
    if (project === undefined) {
      throw new GitHubApiError(`No project "${title}" found for user ${owner}`);
    }
    const fields = project.fields.nodes.flatMap((raw) => toProjectField(raw) ?? []);
    return { id: project.id, fields };
  }

  /** Lists the repository's milestones, open and closed (first 100). */
  async listMilestones(): Promise<ReadonlyArray<Milestone>> {
    const milestones = await this.#rest<ReadonlyArray<Milestone>>(
      'GET',
      `/repos/${this.#owner}/${this.#name}/milestones?state=all&per_page=100`,
    );
    return milestones.map(({ number, title }) => ({ number, title }));
  }

  /** Creates a milestone due at the end of its due date (UTC). */
  async createMilestone(milestone: MilestonePlan): Promise<Milestone> {
    const created = await this.#rest<Milestone>(
      'POST',
      `/repos/${this.#owner}/${this.#name}/milestones`,
      {
        title: milestone.title,
        due_on: `${milestone.due}${END_OF_DAY}`,
        description: milestone.description,
      },
    );
    return { number: created.number, title: created.title };
  }

  /**
   * Returns the project item of an issue, adding the issue to the project first when needed.
   * @throws {GitHubApiError} When the issue does not exist.
   */
  async ensureProjectItem(projectId: string, issueNumber: number): Promise<string> {
    const data = await this.#graphql<FindIssueData>(FIND_ISSUE, {
      owner: this.#owner,
      name: this.#name,
      number: issueNumber,
    });
    const issue = data.repository?.issue;
    if (issue === null || issue === undefined) {
      throw new GitHubApiError(`Issue #${issueNumber} not found in ${this.#owner}/${this.#name}`);
    }
    const existing = issue.projectItems.nodes.find((item) => item.project.id === projectId);
    if (existing !== undefined) return existing.id;
    const added = await this.#graphql<{
      readonly addProjectV2ItemById: { readonly item: { readonly id: string } };
    }>(ADD_ITEM, { projectId, contentId: issue.id });
    return added.addProjectV2ItemById.item.id;
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
    const payload = (await response.json()) as {
      readonly data?: T;
      readonly errors?: ReadonlyArray<{ readonly message: string }>;
      readonly message?: string;
    };
    if (payload.errors !== undefined && payload.errors.length > 0) {
      throw new GitHubApiError(
        `GraphQL error: ${payload.errors.map((error) => error.message).join('; ')}`,
      );
    }
    if (!response.ok || payload.data === undefined) {
      throw new GitHubApiError(
        `GraphQL request failed: ${response.status} ${payload.message ?? ''}`.trim(),
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
    const payload = (await response.json()) as T & { readonly message?: string };
    if (!response.ok) {
      throw new GitHubApiError(
        `${method} ${path} failed: ${response.status} ${payload.message ?? ''}`.trim(),
      );
    }
    return payload;
  }
}
