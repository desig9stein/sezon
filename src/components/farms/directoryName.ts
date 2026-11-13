/** Display names of the producer directories whose profile pages a farm may link as its website. */
export const DIRECTORY_NAMES: Readonly<Record<string, string>> = Object.freeze({
  'localstore.bg': 'LocalStore.bg',
  'coop.hrankoop.com': 'Хранкооп',
});

/**
 * Returns the name of the producer directory a URL belongs to.
 * @param url - Absolute URL of a farm's website link.
 * @returns The directory name, or `undefined` when the host is not a known directory.
 */
export function directoryName(url: string): string | undefined {
  const host = new URL(url).hostname.replace(/^www\./, '');
  return Object.hasOwn(DIRECTORY_NAMES, host) ? DIRECTORY_NAMES[host] : undefined;
}
