const COUNTRY_CODE = '+359';
const NATIONAL_NUMBER = /^\+359(\d{8,9})$/;
/** A mobile number: nine digits in the 8x or 9x range. */
const MOBILE = /^[89]\d{8}$/;
/** A Sofia landline: area code 2 and seven digits. */
const SOFIA = /^2\d{7}$/;
/** Digit groups after the country code. */
const MOBILE_GROUPS = [3, 3, 3];
const SOFIA_GROUPS = [1, 3, 4];
/** Keeps the groups on one line (html-validate `tel-non-breaking`). */
const NO_BREAK_SPACE = '\u00a0';

/** Splits `digits` into consecutive groups of the given sizes. */
function grouped(digits: string, sizes: ReadonlyArray<number>): string[] {
  let start = 0;
  return sizes.map((size) => {
    const group = digits.slice(start, start + size);
    start += size;
    return group;
  });
}

/** Returns the digit groups of a national number whose grouping is known, or one group. */
function groupsOf(digits: string): string[] {
  if (MOBILE.test(digits)) return grouped(digits, MOBILE_GROUPS);
  if (SOFIA.test(digits)) return grouped(digits, SOFIA_GROUPS);
  return [digits];
}

/**
 * Returns a Bulgarian phone number in E.164 form grouped for reading, the groups joined by no-break
 * spaces: a mobile number (8x, 9x) as `+359 899 909 310` and a Sofia number as `+359 2 123 4567`.
 * Other numbers keep their national digits in one group (`+359 30112345`), because their area
 * code may have two or three digits.
 * @param phone - Number such as `+359899909310`.
 * @returns The grouped number, or `phone` unchanged when it is not a Bulgarian E.164 number.
 */
export function formatPhone(phone: string): string {
  const digits = NATIONAL_NUMBER.exec(phone)?.[1];
  if (digits === undefined) return phone;
  return [COUNTRY_CODE, ...groupsOf(digits)].join(NO_BREAK_SPACE);
}
