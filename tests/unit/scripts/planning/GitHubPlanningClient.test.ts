import { describe, expect, it } from 'vitest';
import { GitHubPlanningClient } from '../../../../scripts/planning/GitHubPlanningClient.ts';

const TOKEN = 'test-token-123';

interface RecordedRequest {
  readonly url: string;
  readonly method: string;
  readonly headers: Readonly<Record<string, string>>;
  readonly body: unknown;
}

type Responder = (request: RecordedRequest) => { status?: number; json: unknown };

function fakeFetch(respond: Responder) {
  const requests: RecordedRequest[] = [];
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    const headers = Object.fromEntries(new Headers(init?.headers).entries());
    const body: unknown = typeof init?.body === 'string' ? JSON.parse(init.body) : undefined;
    const request = { url: String(input), method: init?.method ?? 'GET', headers, body };
    requests.push(request);
    const { status = 200, json } = respond(request);
    return new Response(JSON.stringify(json), { status });
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

const issueResponse = (items: ReadonlyArray<{ id: string; projectId: string }>) => ({
  data: {
    repository: {
      issue: {
        id: 'I_35',
        projectItems: {
          nodes: items.map((item) => ({ id: item.id, project: { id: item.projectId } })),
        },
      },
    },
  },
});

describe('GitHubPlanningClient', () => {
  it('AC6: finds the project by owner and title and reads its fields', async () => {
    const { fetchImpl } = fakeFetch(() => ({
      json: {
        data: {
          user: {
            projectsV2: {
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
      },
    }));

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

  it('AC6: throws when no project has the title', async () => {
    const { fetchImpl } = fakeFetch(() => ({
      json: { data: { user: { projectsV2: { nodes: [] } } } },
    }));

    await expect(client(fetchImpl).findProject('desig9stein', 'Planing')).rejects.toThrow(
      /project "Planing".*desig9stein/,
    );
  });

  it('AC6: adds the issue to the project when it is not an item yet', async () => {
    const { fetchImpl, requests } = fakeFetch((request) =>
      graphqlQuery(request).includes('addProjectV2ItemById')
        ? { json: { data: { addProjectV2ItemById: { item: { id: 'PVTI_new' } } } } }
        : { json: issueResponse([{ id: 'PVTI_elsewhere', projectId: 'P_other' }]) },
    );

    const itemId = await client(fetchImpl).ensureProjectItem('P_plan', 35);

    expect(itemId).toBe('PVTI_new');
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

  it('AC6: reuses the existing item without adding it again', async () => {
    const { fetchImpl, requests } = fakeFetch(() => ({
      json: issueResponse([{ id: 'PVTI_existing', projectId: 'P_plan' }]),
    }));

    expect(await client(fetchImpl).ensureProjectItem('P_plan', 35)).toBe('PVTI_existing');
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

  it('AC6: lists, creates and assigns milestones through the REST API', async () => {
    const { fetchImpl, requests } = fakeFetch((request) => {
      if (request.method === 'GET') return { json: [{ number: 1, title: 'Phase 2' }] };
      if (request.method === 'POST') return { status: 201, json: { number: 2, title: 'Phase 3' } };
      return { json: { number: 35 } };
    });
    const github = client(fetchImpl);

    expect(await github.listMilestones()).toEqual([{ number: 1, title: 'Phase 2' }]);
    expect(
      await github.createMilestone({ title: 'Phase 3', due: '2027-01-29', description: 'Regions' }),
    ).toEqual({ number: 2, title: 'Phase 3' });
    await github.setMilestone(35, 2);

    expect(requests.map((request) => `${request.method} ${request.url}`)).toEqual([
      'GET https://api.github.com/repos/desig9stein/sezon/milestones?state=all&per_page=100',
      'POST https://api.github.com/repos/desig9stein/sezon/milestones',
      'PATCH https://api.github.com/repos/desig9stein/sezon/issues/35',
    ]);
    expect(requests[1]?.body).toEqual({
      title: 'Phase 3',
      due_on: '2027-01-29T23:59:59Z',
      description: 'Regions',
    });
    expect(requests[2]?.body).toEqual({ milestone: 2 });
  });

  it('AC6: sends the token only in the Authorization header', async () => {
    const { fetchImpl, requests } = fakeFetch(() => ({ json: [] }));

    await client(fetchImpl).listMilestones();

    const request = requests[0] as RecordedRequest;
    expect(request.headers['authorization']).toBe(`Bearer ${TOKEN}`);
    const elsewhere = JSON.stringify({
      ...request,
      headers: { ...request.headers, authorization: '' },
    });
    expect(elsewhere).not.toContain(TOKEN);
  });

  it('AC7: throws the GraphQL error message', async () => {
    const { fetchImpl } = fakeFetch(() => ({
      json: { errors: [{ message: 'Field value is invalid' }, { message: 'Second' }] },
    }));

    await expect(
      client(fetchImpl).updateField('P', 'I', { fieldId: 'F', value: { number: 1 } }),
    ).rejects.toThrow(/Field value is invalid; Second/);
  });

  it('AC7: throws the REST status and message', async () => {
    const { fetchImpl } = fakeFetch(() => ({
      status: 422,
      json: { message: 'Validation Failed' },
    }));

    await expect(client(fetchImpl).setMilestone(35, 9)).rejects.toThrow(/422.*Validation Failed/);
  });
});
