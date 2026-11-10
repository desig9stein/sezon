import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import type { AstroComponentFactory } from 'astro/runtime/server/index.js';

/** Site URL used when rendering components in tests. */
export const TEST_SITE = 'https://sezon.example';

/** Renders an Astro component to an HTML string with the test site configuration. */
export async function render(
  component: AstroComponentFactory,
  props: Record<string, unknown> = {},
  slots: Record<string, string> = {},
): Promise<string> {
  const container = await AstroContainer.create({ astroConfig: { site: TEST_SITE } });
  return container.renderToString(component, { props, slots });
}

/** Parses every JSON-LD script in `html`. */
export function jsonLdBlocks(html: string): unknown[] {
  return [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map((match) =>
    JSON.parse(match[1] ?? 'null'),
  );
}
