import { describe, expect, it } from 'vitest';
import { routes } from '@components/layout/routes';
import { SITE_NAME, ui } from '@i18n/bg';
import {
  characterCount,
  DESCRIPTION_MAX_LENGTH,
  DESCRIPTION_MIN_LENGTH,
  TITLE_MAX_LENGTH,
} from '@shared/seo';

describe('calendar page texts', () => {
  it('AC2: has the route, a title within 60 characters and a 70–160 character description', () => {
    expect(routes.calendar).toBe('/kalendar');
    expect(characterCount(`${ui.calendar.title} | ${SITE_NAME}`)).toBeLessThanOrEqual(
      TITLE_MAX_LENGTH,
    );
    const length = characterCount(ui.calendar.description);
    expect(length).toBeGreaterThanOrEqual(DESCRIPTION_MIN_LENGTH);
    expect(length).toBeLessThanOrEqual(DESCRIPTION_MAX_LENGTH);
  });
});
