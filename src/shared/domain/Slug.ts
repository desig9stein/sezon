import { InvalidSlugError } from './errors';
import { transliterate } from './transliterate';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const NON_SLUG_CHARACTERS = /[^a-z0-9]+/g;
const EDGE_HYPHENS = /^-+|-+$/g;

/** A lowercase, hyphen-separated Latin identifier used in URLs and as content entry ids. */
export class Slug {
  private constructor(readonly value: string) {
    Object.freeze(this);
  }

  /**
   * Creates a slug from Bulgarian text by transliterating it, lowercasing it and joining
   * alphanumeric runs with single hyphens.
   * @throws InvalidSlugError when the text contains no transliterable letters or digits.
   */
  static fromBulgarian(text: string): Slug {
    const candidate = transliterate(text)
      .toLowerCase()
      .replace(NON_SLUG_CHARACTERS, '-')
      .replace(EDGE_HYPHENS, '');
    if (candidate === '') {
      throw new InvalidSlugError(`Cannot create a slug from "${text}".`);
    }
    return new Slug(candidate);
  }

  /**
   * Wraps an existing slug string.
   * @throws InvalidSlugError when the value does not match `^[a-z0-9]+(-[a-z0-9]+)*$`.
   */
  static parse(value: string): Slug {
    if (!SLUG_PATTERN.test(value)) {
      throw new InvalidSlugError(`"${value}" is not a valid slug.`);
    }
    return new Slug(value);
  }

  /** Returns `true` when both slugs have the same value. */
  equals(other: Slug): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
