import { ui } from '@i18n/bg';
import { EMAIL } from '@shared/domain/contact';
import { InvalidConfigurationError } from '@shared/domain/errors';

/** The public repository that holds the site's code and content. */
export const REPOSITORY_URL = 'https://github.com/desig9stein/sezon';

/** The issue form used to report incorrect content. */
const CORRECTION_TEMPLATE = 'correction.yml';
/** The issue form used to submit a farm. */
const FARM_TEMPLATE = 'farm.yml';
/** Line break required in mailto bodies (RFC 6068). */
const MAIL_LINE_BREAK = '\r\n';
/** Id of the page field in the correction form, used to prefill it. */
const CORRECTION_PAGE_FIELD = 'page';

/** Who runs the site and checks its data. */
export interface SiteOwner {
  readonly githubHandle: string;
  readonly githubUrl: string;
  readonly name: string;
  readonly linkedinUrl: string;
}

/** The site owner. */
export const SITE_OWNER: SiteOwner = Object.freeze({
  githubHandle: 'desig9stein',
  githubUrl: 'https://github.com/desig9stein',
  name: 'Марин Попов',
  linkedinUrl: 'https://www.linkedin.com/in/marin-popov-65829244',
});

/** Links for reporting an error on one page: the GitHub form and a prefilled email. */
export interface CorrectionLinks {
  readonly github: string;
  readonly email: string;
}

/**
 * Returns the contact email, trimmed.
 * @throws InvalidConfigurationError when the value is not an email address.
 */
export function contactEmail(value: string): string {
  const trimmed = value.trim();
  if (!EMAIL.test(trimmed)) {
    throw new InvalidConfigurationError(`Contact email is not an email address: ${trimmed}`);
  }
  return trimmed;
}

const mailto = (email: string, subject: string, body: string): string =>
  `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
    body.replace(/\r?\n/g, MAIL_LINE_BREAK),
  )}`;

const issueForm = (template: string): URL => {
  const url = new URL(`${REPOSITORY_URL}/issues/new`);
  url.searchParams.set('template', template);
  return url;
};

/**
 * Returns the links for reporting an error on the page at `pageUrl`: the GitHub correction form
 * with the page filled in, and an email to `email` with the report template filled in.
 */
export function correctionLinks(pageUrl: string, email: string): CorrectionLinks {
  const github = issueForm(CORRECTION_TEMPLATE);
  github.searchParams.set(CORRECTION_PAGE_FIELD, pageUrl);
  const labels = ui.corrections;
  return Object.freeze({
    github: github.toString(),
    email: mailto(email, labels.mailSubject(pageUrl), labels.mailBody(pageUrl)),
  });
}

/** Returns the GitHub issue form for submitting a farm. */
export function farmIssueLink(): string {
  return issueForm(FARM_TEMPLATE).toString();
}

/** The owner's public contact email for error reports and farm submissions. */
const OWNER_EMAIL = 'mspopovv@gmail.com';

/** The validated public contact email. */
export const CONTACT_EMAIL: string = contactEmail(OWNER_EMAIL);

/** Returns an email to `email` with the farm submission template filled in. */
export function farmSubmissionLink(email: string): string {
  const labels = ui.farmSubmission;
  return mailto(email, labels.mailSubject, labels.mailBody);
}
