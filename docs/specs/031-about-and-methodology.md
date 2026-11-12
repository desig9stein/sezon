# 031. About, methodology, error reports and licence

- **Status:** Approved
- **Bounded context(s):** UI, composition (site configuration), repository (licence, issue form)
- **Related:** issues #9 (about and methodology) and #15 (add your farm), ADR-0003 (advertising),
  `docs/CONTENT-GUIDE.md`, owner decisions of 2026-11-12

## 1. Goal

Health and food content needs trust (E-E-A-T). Readers should be able to see:

- who runs Sezon and why;
- how the data is sourced and checked;
- that the code and content are open;
- how to report a mistake with evidence;
- how a farm gets listed.

The owner's brief (2026-11-12):

- A single developer builds the site with the help of AI agents, to give the public reliable
  information about edible produce.
- It is open source and reliable because it links to its sources.
- Farms join by email.
- A button on the site lets anyone report incorrect information. The report says where it is, what
  is correct, and gives evidence as a document or a link.

## 2. User stories

- As a reader, I want to know who is behind the site and how the information is checked.
- As a reader who spots a mistake, I want a quick way to report it from the page I am on.
- As a farmer, I want to know what to send to have my farm listed.
- As a developer or journalist, I want to know the licence before reusing the data.

## 3. Scope

### In scope

- **`/za-nas`** (`AboutPage`), with `h2` sections in this order:
  1. what Сезон is;
  2. who is behind it: a single developer with the help of AI agents, with the GitHub profile, and
     the name and LinkedIn once configured;
  3. how AI is used;
  4. sources and transparency, with a link to the methodology;
  5. open code and licence (MIT and CC BY 4.0, link to the repository);
  6. „Видя грешка?“ (`#greshka`): what to send (page, what is wrong, what is correct, evidence as a
     link or document), the channels, and what happens next;
  7. „Добави своята ферма“ (`#dobavi-ferma`): the required information and the process;
  8. advertising;
  9. privacy;
  10. health note.
- **`/metodologiya`** (`WebPage`), with `h2` sections:
  1. nutrition values (per 100 g raw, USDA FoodData Central or EFSA, % of the reference intake per
     Regulation (EU) No 1169/2011, the vitamin A note);
  2. season levels (the four levels in words);
  3. growing regions;
  4. traditional use (wording and Regulation (EC) No 1924/2006);
  5. growing guides;
  6. farms („По данни на фермата“, certificate dates);
  7. review status (draft and reviewed);
  8. corrections (link to `/za-nas#greshka`).
- **Report links:**
  - Every page footer has „Съобщи за грешка“, a link to the GitHub issue form `correction.yml`
    with the page URL filled in.
  - When a contact email is configured, a mailto link sits beside it, with the subject and body
    template filled in.
  - The footer also links „За нас“ and „Методология“.
- **Contact email:** `PUBLIC_CONTACT_EMAIL` (optional, documented in `.env.example`).
  - Without it, no email address or mailto link appears anywhere.
  - The about page then names GitHub as the channel and says that an email address will follow.
  - An invalid value fails the build with `InvalidConfigurationError`.
- **Owner details:** `SITE_OWNER` in `src/composition/site.ts`. It holds the GitHub profile; the
  name and LinkedIn URL stay `undefined` until the owner provides them and are not rendered while
  missing.
- **Issue form:** `.github/ISSUE_TEMPLATE/correction.yml` with required fields `page`, `wrong`,
  `correct` and `evidence`; documents can be attached in the text area.
- **Issue form language:** the readers who report errors read Bulgarian, so the form's labels are
  in Bulgarian. This is an exception to the English-only rule for repository files, limited to
  this form.
- **Produce page:** the sources section links to the methodology.
- **Licence:**
  - `LICENSE`: MIT, official SPDX text, holder `desig9stein` until the owner gives a name.
  - `LICENSE-CONTENT`: CC BY 4.0 legal code, the official text from creativecommons.org.
  - `package.json` gets `"license": "MIT"`, and the README has a licence section.

### Out of scope

- A server-side form or file upload (the site is static).
- A separate `/dobavi-ferma` page: the about page section serves #15, and farm lists link to it.
- The owner's name, LinkedIn and email values themselves (to be provided).

## 4. Domain model

No domain change. Composition:

- `contactEmail(env)` validates the optional address with the shared `EMAIL` pattern.
- `correctionLinks(pageUrl, email)` returns the GitHub issue URL and an optional mailto URL.
- `farmSubmissionLink(email)` returns an optional mailto URL with the farm template.

All three are pure functions with unit tests.

## 5. Behaviour and edge cases

- The GitHub URL uses `template=correction.yml` and the field id `page`, filled with the absolute
  page URL. This follows GitHub's documented query parameters for issue forms.
- mailto bodies are URL-encoded and list the same four items as the issue form.
- No email is ever invented: missing configuration hides the mailto links.
- Statements on the pages are limited to what the site does today:
  - there are no cookies, analytics or ads today;
  - drafts are marked;
  - sources are required by tests.
- Readable without CSS and without JavaScript.

## 6. Accessibility requirements

- One `h1`; `h2` sections; no skipped levels.
- Report links have names that say what opens („… в GitHub (нужен е профил)“, „… по имейл“).
- External links are recognisable from their text.
- Zero axe violations in light and dark mode; no horizontal scroll at 320 px.

## 7. SEO requirements

- `/za-nas`: title „За Сезон: кой стои зад сайта и как работи“, `AboutPage` JSON-LD.
- `/metodologiya`: title „Методология: откъде идват данните в Сезон“, `WebPage` JSON-LD.
- Descriptions are 70–160 characters, and the pages are in the sitemap.

## 8. Acceptance criteria

1. **AC1:** Given no `PUBLIC_CONTACT_EMAIL`, `contactEmail` returns `undefined`; given a valid
   address, it returns it; given an invalid one, it throws `InvalidConfigurationError`.
2. **AC2:** Given a page URL, `correctionLinks` returns a GitHub URL to
   `issues/new?template=correction.yml` with `page` set to that URL, and a mailto only when an email
   is given, with a subject naming the page and a body listing page, wrong, correct and evidence.
3. **AC3:** Given an email, `farmSubmissionLink` returns a mailto whose body lists the required farm
   information; without an email, it returns `undefined`.
4. **AC4:** Given `correction.yml`, it is a valid issue form with required fields `page`, `wrong`,
   `correct`, `evidence` and labels `type:content`, `area:content`.
5. **AC5:** Given the built `/za-nas` without an email, it has the ten sections in order and links
   to the GitHub profile, the repository, `/metodologiya` and the correction form. It names MIT and
   CC BY 4.0 and contains no `mailto:`.
6. **AC6:** Given the built `/metodologiya`, it has the eight sections and links to USDA
   FoodData Central, EFSA and `/za-nas#greshka`.
7. **AC7:** Given any page, its footer links „За нас“, „Методология“ and „Съобщи за грешка“ with
   that page's URL in the form link.
8. **AC8:** Given a produce page, its sources section links to `/metodologiya`.
9. **AC9:** Given the two pages, they carry `AboutPage` and `WebPage` JSON-LD and
   `BreadcrumbList`, with titles ≤ 60 (with the suffix) and descriptions of 70–160 characters.
10. **AC10:** Given the repository, `LICENSE` is the MIT text, `LICENSE-CONTENT` is the CC BY 4.0
    legal code, and `package.json` declares MIT.
11. **AC11:** Given both pages in light and dark mode, axe reports no violations, there is no
    horizontal scroll at 320 px, and they read in order without CSS.

## 9. Test plan

| AC   | Test type | Test file                                                            |
| ---- | --------- | -------------------------------------------------------------------- |
| AC1  | unit      | `tests/unit/composition/contact.test.ts`                             |
| AC2  | unit      | `tests/unit/composition/contact.test.ts`                             |
| AC3  | unit      | `tests/unit/composition/contact.test.ts`                             |
| AC4  | unit      | `tests/unit/repo/correctionForm.test.ts`                             |
| AC5  | e2e       | `tests/e2e/about-pages.spec.ts`                                      |
| AC6  | e2e       | `tests/e2e/about-pages.spec.ts`                                      |
| AC7  | e2e       | `tests/e2e/about-pages.spec.ts`                                      |
| AC8  | e2e       | `tests/e2e/about-pages.spec.ts`                                      |
| AC9  | e2e, unit | `tests/e2e/about-pages.spec.ts`, `tests/unit/i18n/aboutMeta.test.ts` |
| AC10 | unit      | `tests/unit/repo/license.test.ts`                                    |
| AC11 | e2e       | `tests/e2e/about-pages.spec.ts`                                      |

## 10. Third-party documentation consulted

| Package / source  | Version | Source (URL or Context7 ID)                                                                     | Topic                                                                                |
| ----------------- | ------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| GitHub Docs       | main    | `/github/docs` (Context7): `creating-an-issue.md`, `syntax-for-issue-forms.md`                  | `issues/new` query parameters (`template`, form field ids), issue form keys          |
| Creative Commons  | 4.0     | https://creativecommons.org/licenses/by/4.0/legalcode.txt (fetched 2026-11-12)                  | CC BY 4.0 legal code                                                                 |
| SPDX license list | main    | https://raw.githubusercontent.com/spdx/license-list-data/main/text/MIT.txt (fetched 2026-11-12) | MIT text                                                                             |
| schema.org        | main    | `/schemaorg/schemaorg` (Context7)                                                               | `AboutPage`, `WebPage`; to be confirmed in the Rich Results Test before launch (#34) |
