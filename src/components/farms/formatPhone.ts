const COUNTRY_CODE = '+359';
const NATIONAL_NUMBER = /^\+359(\d{8,9})$/;
const SOFIA_AREA_CODE = '2';
/** Digit groups after the country code, by the shape of the national number. */
const MOBILE_GROUPS = [3, 3, 3];
const SOFIA_GROUPS = [1, 3, 4];
const OTHER_GROUPS = [2, 3, 3];
const MOBILE_LENGTH = 9;
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

/**
 * Returns a Bulgarian phone number in E.164 form grouped for reading, the groups joined by no-break
 * spaces: a mobile number as `+359 899 909 310`, a Sofia number as `+359 2 123 4567` and another
 * eight-digit number as `+359 32 123 456`.
 * @param phone - Number such as `+359899909310`.
 * @returns The grouped number, or `phone` unchanged when it is not a Bulgarian E.164 number.
 */
export function formatPhone(phone: string): string {
  const digits = NATIONAL_NUMBER.exec(phone)?.[1];
  if (digits === undefined) return phone;
  const sizes =
    digits.length === MOBILE_LENGTH
      ? MOBILE_GROUPS
      : digits.startsWith(SOFIA_AREA_CODE)
        ? SOFIA_GROUPS
        : OTHER_GROUPS;
  return [COUNTRY_CODE, ...grouped(digits, sizes)].join(NO_BREAK_SPACE);
}
