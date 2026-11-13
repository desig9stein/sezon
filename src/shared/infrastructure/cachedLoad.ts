/**
 * Wraps an asynchronous load so that a successful result is cached and shared by every caller,
 * including concurrent ones, while a failed load is forgotten and retried on the next call.
 * @param load - Produces the value.
 * @returns A function that returns the cached or freshly loaded value.
 */
export function cachedLoad<T>(load: () => Promise<T>): () => Promise<T> {
  let cached: Promise<T> | undefined;
  return () => {
    cached ??= load().catch((error: unknown) => {
      cached = undefined;
      throw error;
    });
    return cached;
  };
}
