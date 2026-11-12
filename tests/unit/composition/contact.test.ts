import { describe, expect, it } from 'vitest';
import {
  CONTACT_EMAIL,
  contactEmail,
  correctionLinks,
  farmIssueLink,
  farmSubmissionLink,
} from '@composition/contact';
import { InvalidConfigurationError } from '@shared/domain/errors';

const PAGE = 'https://sezon.example/plodove/yabalki';
const queryOf = (url: string) => new URL(url).searchParams;
const mailParts = (mailto: string) => {
  const [address = '', query = ''] = mailto.replace(/^mailto:/, '').split('?');
  return { address, params: new URLSearchParams(query) };
};

describe('contact configuration (spec 031)', () => {
  it('AC1: validates the contact email', () => {
    expect(contactEmail(' info@sezon.bg ')).toBe('info@sezon.bg');
    expect(() => contactEmail('')).toThrow(InvalidConfigurationError);
    expect(() => contactEmail('not-an-email')).toThrow(InvalidConfigurationError);
  });

  it('AC2: links the GitHub correction form with the page filled in', () => {
    const links = correctionLinks(PAGE, 'info@sezon.bg');
    const url = new URL(links.github);
    expect(`${url.origin}${url.pathname}`).toBe('https://github.com/desig9stein/sezon/issues/new');
    expect(queryOf(links.github).get('template')).toBe('correction.yml');
    expect(queryOf(links.github).get('page')).toBe(PAGE);
  });

  it('AC2: adds a mailto with the page and the four items', () => {
    const { email } = correctionLinks(PAGE, 'info@sezon.bg');
    const { address, params } = mailParts(email);
    expect(address).toBe('info@sezon.bg');
    expect(params.get('subject')).toContain(PAGE);
    const body = params.get('body') ?? '';
    for (const part of [PAGE, 'Какво е грешно', 'Кое е вярното', 'Доказателство']) {
      expect(body).toContain(part);
    }
  });

  it('AC3: builds a farm submission mailto', () => {
    const { address, params } = mailParts(farmSubmissionLink('info@sezon.bg'));
    expect(address).toBe('info@sezon.bg');
    const body = params.get('body') ?? '';
    for (const part of [
      'Име на фермата',
      'Област и населено място',
      'Продукти',
      'Връзка',
      'Източник',
    ]) {
      expect(body).toContain(part);
    }
  });
});

describe('contact QA (spec 031)', () => {
  it('AC12: writes mailto line breaks as CRLF', () => {
    const { email } = correctionLinks(PAGE, 'info@sezon.bg');
    expect(email).toContain('%0D%0A');
    expect(email.replace(/%0D%0A/g, '')).not.toContain('%0A');
  });

  it('AC13: links the Bulgarian farm form in GitHub', () => {
    const url = new URL(farmIssueLink());
    expect(`${url.origin}${url.pathname}`).toBe('https://github.com/desig9stein/sezon/issues/new');
    expect(url.searchParams.get('template')).toBe('farm.yml');
  });
});

describe('contact email (spec 031)', () => {
  it('AC17: the site publishes the owner-provided contact email', () => {
    expect(CONTACT_EMAIL).toBe('mspopovv@gmail.com');
  });
});
