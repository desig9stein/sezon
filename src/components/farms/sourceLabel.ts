/** Returns `path` with its escapes decoded, or unchanged when an escape is malformed. */
function decodePath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/**
 * Returns a readable label for a source URL: its host and decoded path, query and fragment, without
 * the protocol; a bare host has no trailing slash. A URL with a malformed escape keeps its stored path.
 * @param url - Absolute URL.
 */
export function sourceLabel(url: string): string {
  const { host, pathname, search, hash } = new URL(url);
  const decoded = decodePath(`${pathname}${search}${hash}`);
  return decoded === '/' ? host : `${host}${decoded}`;
}
