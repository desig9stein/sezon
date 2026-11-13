import { describe, expect, it } from 'vitest';
import FarmContacts from '@components/farms/FarmContacts.astro';
import { toFarm } from '@contexts/farms/infrastructure/mappers';
import { farmRecord } from '@tests/fixtures/records';
import { render } from './render';

const renderWith = (website: string) =>
  render(FarmContacts, {
    farm: toFarm('venets', farmRecord({ name: 'Венец', contact: { website } })),
  });

describe('FarmContacts, spec 051 QA', () => {
  it('AC10: a directory profile link is labelled as a profile in that directory', async () => {
    const localStore = await renderWith('https://localstore.bg/producer/venets');
    expect(localStore).toContain('Профил на Венец в LocalStore.bg');
    expect(localStore).not.toContain('Уебсайт на Венец');
    const hrankoop = await renderWith('https://coop.hrankoop.com/producer/venets');
    expect(hrankoop).toContain('Профил на Венец в Хранкооп');
  });

  it('AC10: a farm’s own website keeps the website label', async () => {
    expect(await renderWith('https://venets.co/')).toContain('Уебсайт на Венец');
  });
});
