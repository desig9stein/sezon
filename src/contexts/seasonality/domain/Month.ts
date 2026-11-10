import { InvalidMonthError } from '@shared/domain/errors';

const MONTH_SLUGS = [
  'yanuari',
  'fevruari',
  'mart',
  'april',
  'may',
  'yuni',
  'yuli',
  'avgust',
  'septemvri',
  'oktomvri',
  'noemvri',
  'dekemvri',
] as const;

const MONTHS_IN_YEAR = 12;

/** Time zone used to decide the current month for visitors in Bulgaria. */
export const DEFAULT_TIME_ZONE = 'Europe/Sofia';

/** A calendar month (1 = January … 12 = December). Instances are shared and immutable. */
export class Month {
  private static readonly instances: ReadonlyArray<Month> = MONTH_SLUGS.map(
    (slug, index) => new Month(index + 1, slug),
  );

  private constructor(
    readonly number: number,
    readonly slug: string,
  ) {}

  /**
   * Returns the month with the given number.
   * @throws InvalidMonthError when `value` is not an integer from 1 to 12.
   */
  static of(value: number): Month {
    const month = Number.isInteger(value) ? Month.instances[value - 1] : undefined;
    if (month === undefined) {
      throw new InvalidMonthError(`${value} is not a month number (1–12).`);
    }
    return month;
  }

  /**
   * Returns the calendar month of `date` in `timeZone`.
   * @throws InvalidMonthError when `date` is not a valid date.
   */
  static fromDate(date: Date, timeZone: string = DEFAULT_TIME_ZONE): Month {
    if (Number.isNaN(date.getTime())) {
      throw new InvalidMonthError('Cannot determine the month of an invalid date.');
    }
    const monthNumber = new Intl.DateTimeFormat('en-US', { timeZone, month: 'numeric' }).format(
      date,
    );
    return Month.of(Number(monthNumber));
  }

  /**
   * Returns the month whose Latin slug equals `slug`.
   * @throws InvalidMonthError when no month has that slug.
   */
  static fromSlug(slug: string): Month {
    const month = Month.instances.find((candidate) => candidate.slug === slug);
    if (month === undefined) {
      throw new InvalidMonthError(`"${slug}" is not a month slug.`);
    }
    return month;
  }

  /** Returns all twelve months in calendar order. */
  static all(): Month[] {
    return [...Month.instances];
  }

  /** Returns the following month; December is followed by January. */
  next(): Month {
    return Month.of((this.number % MONTHS_IN_YEAR) + 1);
  }

  /** Returns the preceding month; January is preceded by December. */
  previous(): Month {
    return Month.of(((this.number + MONTHS_IN_YEAR - 2) % MONTHS_IN_YEAR) + 1);
  }
}
