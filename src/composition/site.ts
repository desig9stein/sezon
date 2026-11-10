import { InvalidConfigurationError } from '@shared/domain/errors';

/**
 * Returns the configured site origin as a string.
 * @param site - `Astro.site`.
 * @throws InvalidConfigurationError when `site` is not configured.
 */
export function requireSiteUrl(site: URL | undefined): string {
  if (site === undefined) {
    throw new InvalidConfigurationError('Astro `site` must be configured in astro.config.mjs.');
  }
  return site.toString();
}
