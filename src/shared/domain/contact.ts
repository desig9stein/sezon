/** Hostname with at least one dot (e.g. `example.com`); rejects single-label hosts. */
export const DOTTED_HOSTNAME =
  /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z][a-z0-9-]{0,61}[a-z0-9]$/i;
/** Bulgarian phone number in E.164 form. */
export const BULGARIAN_PHONE = /^\+359\d{8,9}$/;
/** Minimal email shape: one `@`, a non-empty local part and a dotted domain. */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Returns `true` when `value` is an absolute `https:` URL with a dotted hostname. */
export function isHttpsUrl(value: string): boolean {
  if (!URL.canParse(value)) {
    return false;
  }
  const url = new URL(value);
  return (
    url.protocol === 'https:' && value.startsWith('https://') && DOTTED_HOSTNAME.test(url.hostname)
  );
}
