const TRAILING_SLASH = /\/$/;

/** Returns `path` with its escapes decoded, or unchanged when an escape is malformed. */
function decodePath(path: string): string {
  try {
    return decodeURI(path);
  } catch {
    return path;
  }
}

/**
 * Returns a readable label for a source URL: its host and decoded path, without the protocol and
 * without a lone trailing slash. A URL with a malformed escape keeps its stored path.
 * @param url - Absolute URL.
 */
export function sourceLabel(url: string): string {
  const { host, pathname, search } = new URL(url);
  const decoded = decodePath(`${pathname}${search}`);
  return decoded === '/' ? host : `${host}${decoded}`.replace(TRAILING_SLASH, '/');
}
