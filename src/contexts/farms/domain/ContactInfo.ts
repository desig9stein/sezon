import { BULGARIAN_PHONE, EMAIL, isHttpsUrl } from '@shared/domain/contact';
import { InvalidContactInfoError } from '@shared/domain/errors';

declare const nominal: unique symbol;

/** Message used when no contact method is given. */
export const CONTACT_REQUIRED_MESSAGE = 'A farm needs a website, an email or a phone number.';

/** Input for {@link ContactInfo.create}. */
export interface ContactInfoInput {
  readonly website?: string | undefined;
  readonly email?: string | undefined;
  readonly phone?: string | undefined;
}

/** Ways to contact a farm. At least one is always present and every present value is valid. */
export class ContactInfo {
  readonly website: string | undefined;
  readonly email: string | undefined;
  readonly phone: string | undefined;
  declare private readonly [nominal]: 'ContactInfo';

  private constructor(input: ContactInfoInput) {
    this.website = input.website;
    this.email = input.email;
    this.phone = input.phone;
    Object.freeze(this);
  }

  /**
   * Creates contact information.
   * @throws InvalidContactInfoError when no method is given, or the website is not an https URL,
   * the email is malformed, or the phone is not a Bulgarian E.164 number.
   */
  static create(input: ContactInfoInput): ContactInfo {
    const { website, email, phone } = input;
    if (website === undefined && email === undefined && phone === undefined) {
      throw new InvalidContactInfoError(CONTACT_REQUIRED_MESSAGE);
    }
    if (website !== undefined && !isHttpsUrl(website)) {
      throw new InvalidContactInfoError(`"${website}" is not an https URL.`);
    }
    if (email !== undefined && !EMAIL.test(email)) {
      throw new InvalidContactInfoError(`"${email}" is not an email address.`);
    }
    if (phone !== undefined && !BULGARIAN_PHONE.test(phone)) {
      throw new InvalidContactInfoError(`"${phone}" is not a Bulgarian phone number.`);
    }
    return new ContactInfo(input);
  }
}
