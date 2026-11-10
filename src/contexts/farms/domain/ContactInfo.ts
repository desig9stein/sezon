import { InvalidContactInfoError } from '@shared/domain/errors';

/** Input for {@link ContactInfo.create}. */
export interface ContactInfoInput {
  readonly website?: string | undefined;
  readonly email?: string | undefined;
  readonly phone?: string | undefined;
}

/** Ways to contact a farm. At least one is always present. */
export class ContactInfo {
  readonly website: string | undefined;
  readonly email: string | undefined;
  readonly phone: string | undefined;

  private constructor(input: ContactInfoInput) {
    this.website = input.website;
    this.email = input.email;
    this.phone = input.phone;
    Object.freeze(this);
  }

  /**
   * Creates contact information.
   * @throws InvalidContactInfoError when no website, email or phone is given.
   */
  static create(input: ContactInfoInput): ContactInfo {
    if (input.website === undefined && input.email === undefined && input.phone === undefined) {
      throw new InvalidContactInfoError('A farm needs a website, an email or a phone number.');
    }
    return new ContactInfo(input);
  }
}
