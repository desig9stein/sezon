import { readFile } from 'node:fs/promises';
import { GitHubPlanningClient } from './GitHubPlanningClient.ts';
import { parsePlan } from './plan.ts';
import { syncPlan } from './syncPlan.ts';

/**
 * Command-line entry point: `node scripts/planning/sync.ts <plan.json>`.
 * Reads the token from `PROJECT_TOKEN` and the repository (`owner/name`) from `GITHUB_REPOSITORY`.
 */
async function main(): Promise<void> {
  const [planPath] = process.argv.slice(2);
  const token = process.env['PROJECT_TOKEN'];
  const [owner, name] = (process.env['GITHUB_REPOSITORY'] ?? '').split('/');
  if (planPath === undefined) throw new Error('Usage: node scripts/planning/sync.ts <plan.json>');
  if (token === undefined || token === '') throw new Error('PROJECT_TOKEN is not set');
  if (owner === undefined || owner === '' || name === undefined || name === '') {
    throw new Error('GITHUB_REPOSITORY must be "owner/name"');
  }

  const plan = parsePlan(JSON.parse(await readFile(planPath, 'utf8')));
  const client = new GitHubPlanningClient({ token, fetch, repository: { owner, name } });
  await syncPlan(plan, client, (line) => console.log(line));
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
