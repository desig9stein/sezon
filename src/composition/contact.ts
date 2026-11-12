import { ui } from '@i18n/bg';
import { EMAIL } from '@shared/domain/contact';
import { InvalidConfigurationError } from '@shared/domain/errors';

/** The public repository that holds the site's code and content. */
export const REPOSITORY_URL = 'https://github.com/desig9stein/sezon';

/** The issue form used to report incorrect content. */
const CORRECTION_TEMPLATE = 'correction.yml';
/** Id of the page field in the correction form, used to prefill it. */
const CORRECTION_PAGE_FIELD = 'page';

/** Who runs the site; the name and LinkedIn profile are shown only once they are configured. */
export interface SiteOwner {
  readonly githubHandle: string;
  readonly githubUrl: string;
  readonly name: string | undefined;
  readonly linkedinUrl: string | undefined;
}

/** The site owner. */
export const SITE_OWNER: SiteOwner = Object.freeze({
  githubHandle: 'desig9stein',
  githubUrl: 'https://github.com/desig9stein',
  name: undefined,
  linkedinUrl: undefined,
});

/** Links for reporting an error on one page: the GitHub form, and an email when configured. */
export interface CorrectionLinks {
  readonly github: string;
  readonly email: string | undefined;
}

/**
 * Returns the configured contact email, or `undefined` when it is not set.
 * @param value - `PUBLIC_CONTACT_EMAIL`.
 * @throws InvalidConfigurationError when the value is set but is not an email address.
 */
export function contactEmail(value: string | undefined): string | undefined {
  const trimmed = value?.trim() ?? '';
  if (trimmed === '') return undefined;
  if (!EMAIL.test(trimmed)) {
    throw new InvalidConfigurationError(`PUBLIC_CONTACT_EMAIL is not an email address: ${trimmed}`);
  }
  return trimmed;
}

const mailto = (email: string, subject: string, body: string): string =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

/**
 * Returns the links for reporting an error on the page at `pageUrl`: the GitHub correction form
 * with the page filled in, and a prefilled email when `email` is set.
 */
export function correctionLinks(pageUrl: string, email: string | undefined): CorrectionLinks {
  const github = new URL(`${REPOSITORY_URL}/issues/new`);
  github.searchParams.set('template', CORRECTION_TEMPLATE);
  github.searchParams.set(CORRECTION_PAGE_FIELD, pageUrl);
  const labels = ui.corrections;
  return Object.freeze({
    github: github.toString(),
    email:
      email === undefined
        ? undefined
        : mailto(email, labels.mailSubject(pageUrl), labels.mailBody(pageUrl)),
  });
}

/** Returns a prefilled email for submitting a farm, or `undefined` when no email is configured. */
export function farmSubmissionLink(email: string | undefined): string | undefined {
  const labels = ui.farmSubmission;
  return email === undefined ? undefined : mailto(email, labels.mailSubject, labels.mailBody);
}
