// @ts-check
import process from 'node:process';

/** Astro command that serves the Keystatic admin; every other command leaves it out. */
export const CMS_COMMAND = 'dev';

/** Environment variable Vitest sets in every test run. */
const VITEST_FLAG = 'VITEST';

/**
 * CommonJS modules the admin imports that Vite must pre-bundle in dev. The React renderer's own
 * `react-dom/client` include does not reach Vite's optimizer, so the browser would otherwise load
 * the raw CommonJS file and the admin would not hydrate.
 */
export const CMS_PREBUNDLED_DEPENDENCIES = Object.freeze(['react-dom/client']);

/**
 * Imports the React and Keystatic integrations. They are imported only when the admin is served,
 * so `astro build` never loads them.
 * @returns {Promise<ReadonlyArray<import('astro').AstroIntegration>>}
 */
async function loadCmsIntegrations() {
  const [{ default: react }, { default: keystatic }] = await Promise.all([
    import('@astrojs/react'),
    import('@keystatic/astro'),
  ]);
  return [react(), keystatic()];
}

/**
 * Astro integration that adds the Keystatic admin (`/keystatic`, local storage) and the React
 * renderer it needs to `astro dev` only (ADR-0008, spec 054). Builds, previews and `astro sync`
 * get neither, so the static output has no admin route, no React and no CSP change. Vitest is
 * skipped too: its `getViteConfig` runs the Astro config as `dev`, and the admin is not needed
 * in tests.
 * @param {{
 *   load?: () => Promise<ReadonlyArray<import('astro').AstroIntegration>>,
 *   env?: Readonly<Record<string, string | undefined>>,
 * }} [options] - `load` returns the integrations to add and `env` holds the environment
 *   variables (default `process.env`); tests replace both.
 * @returns {import('astro').AstroIntegration}
 */
export function localCms({ load = loadCmsIntegrations, env = process.env } = {}) {
  return {
    name: 'sezon:local-cms',
    hooks: {
      'astro:config:setup': async ({ command, updateConfig }) => {
        if (command !== CMS_COMMAND || env[VITEST_FLAG] !== undefined) {
          return;
        }
        updateConfig({
          integrations: [...(await load())],
          vite: { optimizeDeps: { include: [...CMS_PREBUNDLED_DEPENDENCIES] } },
        });
      },
    },
  };
}
