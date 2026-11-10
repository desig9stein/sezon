import { describe, expect, it } from 'vitest';
import { GitHubPlanningClient } from '../../../../scripts/planning/GitHubPlanningClient.ts';

const TOKEN = 'test-token-123';

interface RecordedRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
}

type Responder = (request: RecordedRequest) => { status?: number; json?: unknown; text?: string };

function fakeFetch(respond: Responder) {
  const requests: RecordedRequest[] = [];
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const request = { url: String(input), method: init?.method ?? 'GET', headers, body };
    requests.push(request);
    const { status = 200, json, text } = respond(request);
    return new Response(text ?? JSON.stringify(json), { status });
  };
  return { fetchImpl: fetchImpl as typeof fetch, requests };
}

const graphqlQuery = (request: RecordedRequest): string =>
  (request.body as { query: string }).query;

const graphqlVariables = (request: RecordedRequest): Record<string, unknown> =>
  (request.body as { variables: Record<string, unknown> }).variables;

const client = (fetchImpl: typeof fetch) =>
  new GitHubPlanningClient({
    token: TOKEN,
    fetch: fetchImpl,
    repository: { owner: 'desig9stein', name: 'sezon' },
  });

interface ItemFixture {
  readonly id: string;
  readonly projectId: string;
  readonly isArchived?: boolean;
  readonly fieldValues?: ReadonlyArray<unknown>;
}

const issueResponse = (items: ReadonlyArray<ItemFixture>, extra: { state?: string } = {}) => ({
  data: {
    repository: {
      issue: {
        id: 'I_35',
        state: extra.state ?? 'OPEN',
        projectItems: {
          nodes: items.map((item) => ({
            id: item.id,
            isArchived: item.isArchived ?? false,
            project: { id: item.projectId },
            fieldValues: { nodes: item.fieldValues ?? [] },
          })),
        },
      },
    },
  },
});

const projectsResponse = (hasNextPage = false) => ({
  data: {
    user: {
      projectsV2: {
        pageInfo: { hasNextPage },
        nodes: [
          { id: 'P_other', title: 'Other', fields: { nodes: [] } },
          {
            id: 'P_plan',
            title: 'Planing',
            fields: {
              nodes: [
                { id: 'F_est', name: 'Estimate', dataType: 'NUMBER' },
                {
                  id: 'F_pri',
                  name: 'Priority',
                  dataType: 'SINGLE_SELECT',
                  options: [{ id: 'o1', name: 'P0' }],
                },
              ],
            },
          },
        ],
      },
    },
  },
});

describe('GitHubPlanningClient', () => {
  it('AC6: finds the user-owned project by title and reads its fields', async () => {
    const { fetchImpl } = fakeFetch(() => ({ json: projectsResponse() }));

    const project = await client(fetchImpl).findProject('desig9stein', 'Planing');

    expect(project).toEqual({
      id: 'P_plan',
      fields: [
        { id: 'F_est', name: 'Estimate', dataType: 'NUMBER' },
        {
          id: 'F_pri',
          name: 'Priority',
          dataType: 'SINGLE_SELECT',
          options: [{ id: 'o1', name: 'P0' }],
        },
      ],
    });
  });

  it('AC6: throws when no project has the title, mentioning more pages when there are any', async () => {
    const empty = fakeFetch(() => ({
      json: { data: { user: { projectsV2: { pageInfo: { hasNextPage: false }, nodes: [] } } } },
    }));
    const paged = fakeFetch(() => ({ json: projectsResponse(true) }));

    await expect(client(empty.fetchImpl).findProject('desig9stein', 'Planing')).rejects.toThrow(
      /project "Planing".*desig9stein/,
    );
    await expect(client(paged.fetchImpl).findProject('desig9stein', 'Missing')).rejects.toThrow(
      /more than 100 projects/,
    );
  });

  it('AC6: sends every request to the GraphQL endpoint', async () => {
    const { fetchImpl, requests } = fakeFetch((request) => {
      const query = graphqlQuery(request);
      if (query.includes('projectsV2')) return { json: projectsResponse() };
      if (query.includes('addProjectV2ItemById')) {
        return { json: { data: { addProjectV2ItemById: { item: { id: 'PVTI_new' } } } } };
      }
      if (query.includes('updateProjectV2ItemFieldValue')) {
        return {
          json: { data: { updateProjectV2ItemFieldValue: { projectV2Item: { id: 'x' } } } },
        };
      }
      return { json: issueResponse([]) };
    });
    const github = client(fetchImpl);

    await github.findProject('desig9stein', 'Planing');
    await github.issueItem('P_plan', 35);
    await github.updateField('P_plan', 'PVTI_new', { fieldId: 'F', value: { number: 1 } });

    expect(requests).toHaveLength(4);
    for (const request of requests) {
      expect(`${request.method} ${request.url}`).toBe('POST https://api.github.com/graphql');
    }
  });

  it('throws instead of adding a duplicate item when the issue has more than 100 project items', async () => {
    const { fetchImpl, requests } = fakeFetch(() => {
      const response = issueResponse([{ id: 'PVTI_elsewhere', projectId: 'P_other' }]);
      const issue = response.data.repository.issue as Record<string, unknown>;
      issue['projectItems'] = {
        ...(issue['projectItems'] as object),
        pageInfo: { hasNextPage: true },
      };
      return { json: response };
    });

    await expect(client(fetchImpl).issueItem('P_plan', 35)).rejects.toThrow(
      /#35.*more than 100 project items/,
    );
    expect(requests).toHaveLength(1);
  });
  it('AC6: adds an open issue to the project when it is not an item yet', async () => {
    const { fetchImpl, requests } = fakeFetch((request) =>
      graphqlQuery(request).includes('addProjectV2ItemById')
        ? { json: { data: { addProjectV2ItemById: { item: { id: 'PVTI_new' } } } } }
        : {
            json: issueResponse([{ id: 'PVTI_elsewhere', projectId: 'P_other' }]),
          },
    );

    const item = await client(fetchImpl).issueItem('P_plan', 35);

    expect(item).toEqual({
      closed: false,
      itemId: 'PVTI_new',
      archived: false,
      values: [],
    });
    expect(requests).toHaveLength(2);
    expect(graphqlVariables(requests[0] as RecordedRequest)).toEqual({
      owner: 'desig9stein',
      name: 'sezon',
      number: 35,
    });
    expect(graphqlVariables(requests[1] as RecordedRequest)).toEqual({
      projectId: 'P_plan',
      contentId: 'I_35',
    });
  });

  it('AC6: reuses the existing item and reads its current field values', async () => {
    const { fetchImpl, requests } = fakeFetch(() => ({
      json: issueResponse([
        {
          id: 'PVTI_existing',
          projectId: 'P_plan',
          isArchived: true,
          fieldValues: [
            {},
            { optionId: 'o1', field: { id: 'F_pri' } },
            { number: 2, field: { id: 'F_est' } },
            { date: '2026-11-10', field: { id: 'F_start' } },
          ],
        },
      ]),
    }));

    expect(await client(fetchImpl).issueItem('P_plan', 35)).toEqual({
      closed: false,
      itemId: 'PVTI_existing',
      archived: true,
      values: [
        { fieldId: 'F_pri', value: { singleSelectOptionId: 'o1' } },
        { fieldId: 'F_est', value: { number: 2 } },
        { fieldId: 'F_start', value: { date: '2026-11-10' } },
      ],
    });
    expect(requests).toHaveLength(1);
  });

  it('reports a closed issue without adding it to the project', async () => {
    const { fetchImpl, requests } = fakeFetch(() => ({
      json: issueResponse([], { state: 'CLOSED' }),
    }));

    expect(await client(fetchImpl).issueItem('P_plan', 35)).toEqual({ closed: true });
    expect(requests).toHaveLength(1);
  });

  it('AC6: updates a field value with GraphQL variables', async () => {
    const { fetchImpl, requests } = fakeFetch(() => ({
      json: { data: { updateProjectV2ItemFieldValue: { projectV2Item: { id: 'PVTI_1' } } } },
    }));

    await client(fetchImpl).updateField('P_plan', 'PVTI_1', {
      fieldId: 'F_start',
      value: { date: '2026-11-10' },
    });

    const request = requests[0] as RecordedRequest;
    expect(request.url).toBe('https://api.github.com/graphql');
    expect(request.method).toBe('POST');
    expect(graphqlQuery(request)).toContain('updateProjectV2ItemFieldValue');
    expect(graphqlVariables(request)).toEqual({
      projectId: 'P_plan',
      itemId: 'PVTI_1',
      fieldId: 'F_start',
      value: { date: '2026-11-10' },
    });
  });

  it('AC6: sends the token only in the Authorization header, also on errors', async () => {
    const { fetchImpl, requests } = fakeFetch((request) =>
      graphqlQuery(request).includes('projectsV2')
        ? { json: projectsResponse() }
        : { status: 401, json: { message: 'Bad credentials' } },
    );
    const github = client(fetchImpl);

    await github.findProject('desig9stein', 'Planing');
    const error = await github
      .updateField('P', 'I', { fieldId: 'F', value: { number: 1 } })
      .catch((caught: unknown) => caught);

    for (const request of requests) {
      expect(request.headers['authorization']).toBe(`Bearer ${TOKEN}`);
      const elsewhere = JSON.stringify({
        ...request,
        headers: { ...request.headers, authorization: '' },
      });
      expect(elsewhere).not.toContain(TOKEN);
    }
    expect(requests).toHaveLength(2);
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toMatch(/401.*Bad credentials/);
    expect((error as Error).message).not.toContain(TOKEN);
  });

  it('AC7: throws the GraphQL error message', async () => {
    const { fetchImpl } = fakeFetch(() => ({
      json: { errors: [{ message: 'Field value is invalid' }, { message: 'Second' }] },
    }));

    await expect(
      client(fetchImpl).updateField('P', 'I', { fieldId: 'F', value: { number: 1 } }),
    ).rejects.toThrow(/Field value is invalid; Second/);
  });

  it('AC7: reports the HTTP status for a non-JSON error body', async () => {
    const { fetchImpl } = fakeFetch(() => ({ status: 502, text: '<html>502 Bad Gateway</html>' }));
    const github = client(fetchImpl);

    await expect(
      github.updateField('P', 'I', { fieldId: 'F', value: { number: 1 } }),
    ).rejects.toThrow(/GraphQL request failed: 502/);
  });
});
