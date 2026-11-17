// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initSiteSearch } from '@components/search/siteSearch';

interface FakeResult {
  url: string;
  excerpt: string;
  content?: string;
  meta: { title?: string; latin?: string; alias?: string; members?: string; type?: string };
}

const SCOPE = 'Сайтът покрива пресни плодове, зеленчуци, билки и ядки от България.';
const PAGE_TITLE = 'Търсене – Сезон';

function fakePagefind(results: ReadonlyArray<FakeResult>) {
  return {
    init: vi.fn(async () => undefined),
    search: vi.fn(
      async (
        _query: string,
        options?: { filters?: { type?: { any: ReadonlyArray<string> } } },
      ) => ({
        results: results
          .map((result, index) => ({ id: String(index), data: async () => result, result }))
          .filter(
            ({ result }) =>
              options?.filters?.type === undefined ||
              options.filters.type.any.includes(result.meta.type ?? ''),
          ),
      }),
    ),
  };
}

function mount() {
  document.title = PAGE_TITLE;
  document.body.innerHTML = `
    <div data-site-search data-loading="Търсене…" data-found="Резултати: {count} за „{query}“."
      data-none="Няма резултати за „{query}“." data-scope="${SCOPE}" data-failed="Грешка."
      data-first-shown="Показани са първите {shown}." data-shown-of="Показани са {shown} от {count}."
      data-title="Търсене: {query} – Сезон">
      <form><input type="search" name="q" /><button type="submit">Търси</button></form>
      <p role="status"></p>
      <h2 data-search-heading hidden>Резултати</h2>
      <ol data-search-results></ol>
      <button type="button" data-search-more hidden>Покажи още</button>
    </div>`;
  const root = document.querySelector<HTMLElement>('[data-site-search]');
  const input = document.querySelector<HTMLInputElement>('input');
  const form = document.querySelector<HTMLFormElement>('form');
  const status = document.querySelector<HTMLElement>('[role="status"]');
  const list = document.querySelector<HTMLElement>('[data-search-results]');
  const heading = document.querySelector<HTMLElement>('[data-search-heading]');
  if (!root || !input || !form || !status || !list || !heading) throw new Error('markup missing');
  return { root, input, form, status, list, heading };
}

async function submit(parts: ReturnType<typeof mount>, query: string) {
  parts.input.value = query;
  parts.form.dispatchEvent(new Event('submit', { cancelable: true }));
  await vi.waitFor(() => expect(parts.status.textContent).not.toBe('Търсене…'));
  await vi.waitFor(() => expect(parts.status.textContent).not.toBe(''));
}

const result = (slug: string, title: string, content: string): FakeResult => ({
  url: `/${slug}.html`,
  excerpt: content,
  content,
  meta: { title },
});

beforeEach(() => {
  window.history.replaceState(null, '', '/tarsene');
});

describe('site search (spec 062)', () => {
  it('AC6: shows the results heading and names the query in the page title', async () => {
    const parts = mount();
    const api = fakePagefind([result('plodove/yabalki', 'Ябълки', 'Ябълки. Ябълката е плод.')]);
    initSiteSearch(parts.root, async () => api);
    expect(parts.heading.hidden).toBe(true);
    await submit(parts, 'ябълка');
    expect(parts.heading.hidden).toBe(false);
    expect(document.title).toBe('Търсене: ябълка – Сезон');
  });

  it('AC6: restores the page title and hides the heading for an empty query', async () => {
    const parts = mount();
    const api = fakePagefind([result('plodove/yabalki', 'Ябълки', 'Ябълки. Ябълката е плод.')]);
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'ябълка');
    parts.input.value = '';
    parts.form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(document.title).toBe(PAGE_TITLE));
    expect(parts.heading.hidden).toBe(true);
  });

  it('AC13: adds the scope of the site when nothing is found', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () => fakePagefind([]));
    await submit(parts, 'гъби');
    expect(parts.status.textContent).toBe(`Няма резултати за „гъби“. ${SCOPE}`);
    expect(parts.heading.hidden).toBe(true);
  });

  it('AC10: keeps only results that use a short query word as a word form', async () => {
    const parts = mount();
    const api = fakePagefind([
      result('plodove/yabalki', 'Ябълки', 'Ябълки. Нарязани ябълки по народна рецепта.'),
      result('plodove/nar', 'Нар', 'Нар. Зърната на нара са сочни.'),
    ]);
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'нар');
    const links = [...parts.list.querySelectorAll('a')].map((link) => link.getAttribute('href'));
    expect(links).toEqual(['/plodove/nar']);
    expect(parts.status.textContent).toBe('Резултати: 1 за „нар“.');
  });

  it('AC12: lists the family page named by „семейство <продукт>“ first', async () => {
    const parts = mount();
    parts.root.dataset.groupType = 'Ботаническо семейство';
    const api = fakePagefind([
      result('zelenchutsi/domati', 'Домати', 'Домати. Семейство: Картофови.'),
      {
        ...result('grupi/kartofovi', 'Картофови', 'Продуктите от семейство Картофови.'),
        meta: { title: 'Картофови', members: 'Домати, Пипер', type: 'Ботаническо семейство' },
      },
    ]);
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'семейство домати');
    expect(parts.list.querySelector('a')?.getAttribute('href')).toBe('/grupi/kartofovi');
  });

  it('AC12: without the family word, lists a family page after the produce it names', async () => {
    const parts = mount();
    parts.root.dataset.groupType = 'Ботаническо семейство';
    const api = fakePagefind([
      {
        ...result('grupi/tikvovi', 'Тиквови', 'Тиквови.'),
        meta: { title: 'Тиквови', type: 'Ботаническо семейство' },
      },
      result('zelenchutsi/tikvichki', 'Тиквички', 'Тиквички. Тиквичките се берат млади.'),
    ]);
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'тикв');
    expect(parts.list.querySelector('a')?.getAttribute('href')).toBe('/zelenchutsi/tikvichki');
  });

  it('AC11: ranks a result whose alias names the query before other results', async () => {
    const parts = mount();
    const api = fakePagefind([
      result('fermi/lyuta', 'Люта ферма', 'Люта ферма. Отглежда люти чушки.'),
      {
        ...result('zelenchutsi/piper', 'Пипер', 'Пипер. Изпечи чушките цели.'),
        meta: { title: 'Пипер', alias: 'чушки' },
      },
    ]);
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'чушки');
    expect(parts.list.querySelector('a')?.getAttribute('href')).toBe('/zelenchutsi/piper');
  });
});
