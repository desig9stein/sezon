import type { AstroIntegration } from 'astro';
import { describe, expect, it, vi } from 'vitest';
import { localCms } from '../../../scripts/cms/localCms.mjs';

type SetupHook = NonNullable<AstroIntegration['hooks']['astro:config:setup']>;
type SetupParams = Parameters<SetupHook>[0];

const FAKE_INTEGRATIONS: AstroIntegration[] = [
  { name: '@astrojs/react', hooks: {} },
  { name: 'keystatic', hooks: {} },
];

/** Runs the integration's setup hook for `command` and returns what it did. */
async function setUp(command: SetupParams['command']) {
  const load = vi.fn(async () => FAKE_INTEGRATIONS);
  const updateConfig = vi.fn();
  const hook = localCms({ load }).hooks['astro:config:setup'];
  await hook?.({ command, updateConfig } as unknown as SetupParams);
  return { load, updateConfig };
}

describe('localCms (spec 054)', () => {
  it('AC8: adds React, Keystatic and the react-dom/client pre-bundle in astro dev', async () => {
    const { load, updateConfig } = await setUp('dev');
    expect(load).toHaveBeenCalledOnce();
    expect(updateConfig).toHaveBeenCalledWith({
      integrations: FAKE_INTEGRATIONS,
      vite: { optimizeDeps: { include: ['react-dom/client'] } },
    });
  });

  for (const command of ['build', 'preview', 'sync'] as const) {
    it(`AC8: adds and imports nothing in astro ${command}`, async () => {
      const { load, updateConfig } = await setUp(command);
      expect(load).not.toHaveBeenCalled();
      expect(updateConfig).not.toHaveBeenCalled();
    });
  }

  it('AC8: loads the real React and Keystatic integrations by default', async () => {
    const updateConfig = vi.fn();
    await localCms().hooks['astro:config:setup']?.({
      command: 'dev',
      updateConfig,
    } as unknown as SetupParams);
    const [[{ integrations }]] = updateConfig.mock.calls as [
      [{ integrations: AstroIntegration[] }],
    ];
    expect(integrations.map((integration) => integration.name)).toEqual([
      '@astrojs/react',
      'keystatic',
    ]);
  });
});
