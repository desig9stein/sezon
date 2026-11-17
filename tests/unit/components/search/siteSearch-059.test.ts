// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initSiteSearch } from '@components/search/siteSearch';

interface FakeResult {
  url: string;
  excerpt: string;
  content?: string;
  meta: { title?: string; latin?: string; type?: string };
}

const page = (index: number): FakeResult => ({
  url: `/fermi/ferma-${index}.html`,
  excerpt: `<mark>Ферма</mark> ${index}`,
  content: `Ферма ${index}. Фермата продава ябълки.`,
  meta: { title: `Ферма ${index}`, type: 'Ферма' },
});

/** Builds a fake Pagefind API whose search returns `results` and records its queries. */
function fakePagefind(results: ReadonlyArray<FakeResult>) {
  return {
    init: vi.fn(async () => undefined),
    search: vi.fn(async (query: string) => ({
      query,
      results: results.map((result) => ({ data: async () => result })),
    })),
  };
}

/** Renders the markup that `SiteSearch.astro` produces and returns its parts. */
function mount() {
  document.body.innerHTML = `
    <div data-site-search data-loading="Търсене…" data-found="Резултати: {count} за „{query}“."
      data-none="Няма резултати за „{query}“." data-failed="Грешка."
      data-first-shown="Показани са първите {shown}." data-shown-of="Показани са {shown} от {count}.">
      <form><input type="search" name="q" /><button type="submit">Търси</button></form>
      <p role="status"></p><ol data-search-results></ol>
      <button type="button" data-search-more hidden>Покажи още</button>
    </div>`;
  const root = document.querySelector<HTMLElement>('[data-site-search]');
  const input = document.querySelector<HTMLInputElement>('input');
  const form = document.querySelector<HTMLFormElement>('form');
  const status = document.querySelector<HTMLElement>('[role="status"]');
  const list = document.querySelector<HTMLElement>('[data-search-results]');
  const more = document.querySelector<HTMLButtonElement>('[data-search-more]');
  if (!root || !input || !form || !status || !list || !more) throw new Error('markup missing');
  return { root, input, form, status, list, more };
}

async function submit(parts: ReturnType<typeof mount>, query: string) {
  parts.input.value = query;
  parts.form.dispatchEvent(new Event('submit', { cancelable: true }));
  await vi.waitFor(() => expect(parts.status.textContent).not.toBe('Търсене…'));
}

beforeEach(() => {
  window.history.replaceState(null, '', '/tarsene');
});

describe('site search (spec 059)', () => {
  it('AC9: sends the normalised query to Pagefind and keeps the typed one in the status and URL', async () => {
    const parts = mount();
    const api = fakePagefind([
      {
        url: '/nutrienti/vitamin-c.html',
        excerpt: 'Витамин C',
        content: 'vitamin c. Витамин C в сезонните храни',
        meta: { title: 'Витамин C в сезонните храни', type: 'Хранително вещество' },
      },
    ]);
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'витамин С');
    expect(api.search).toHaveBeenCalledWith('витамин c');
    expect(parts.status.textContent).toBe('Резултати: 1 за „витамин С“.');
    expect(new URL(window.location.href).searchParams.get('q')).toBe('витамин С');
  });

  it('AC12: shows the type label as its own paragraph before the result link', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () => fakePagefind([page(1)]));
    await submit(parts, 'ферма');
    const item = parts.list.querySelector('li');
    expect(item?.firstElementChild?.tagName).toBe('P');
    expect(item?.firstElementChild?.textContent).toBe('Ферма');
    expect(item?.querySelector('a')?.textContent).toBe('Ферма 1');
  });

  it('AC13: reports no results when the best result does not contain every query word', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () =>
      fakePagefind([
        {
          url: '/plodove/nektarini.html',
          excerpt: 'Белтъчини 1,06 <mark>г.</mark>',
          content: 'Нектарини. Белтъчини 1,06 г. Мазнини 0,32 г.',
          meta: { title: 'Нектарини', type: 'Плод' },
        },
      ]),
    );
    await submit(parts, 'гъби');
    expect(parts.status.textContent).toBe('Няма резултати за „гъби“.');
    expect(parts.list.children).toHaveLength(0);
    expect(parts.more.hidden).toBe(true);
  });

  it('AC14: announces the full count, shows 10 and adds 10 more on „Покажи още“', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () =>
      fakePagefind(Array.from({ length: 25 }, (_, index) => page(index + 1))),
    );
    await submit(parts, 'ферма');
    expect(parts.list.querySelectorAll('a')).toHaveLength(10);
    expect(parts.status.textContent).toBe('Резултати: 25 за „ферма“. Показани са първите 10.');
    expect(parts.more.hidden).toBe(false);

    parts.more.click();
    await vi.waitFor(() => expect(parts.list.querySelectorAll('a')).toHaveLength(20));
    expect(document.activeElement?.textContent).toBe('Ферма 11');
    expect(parts.status.textContent).toBe('Показани са 20 от 25.');
    expect(parts.more.hidden).toBe(false);

    parts.more.click();
    await vi.waitFor(() => expect(parts.list.querySelectorAll('a')).toHaveLength(25));
    expect(parts.status.textContent).toBe('Показани са 25 от 25.');
    expect(parts.more.hidden).toBe(true);
  });

  it('AC14: a new query resets the list and hides „Покажи още“ when everything is shown', async () => {
    const parts = mount();
    const many = Array.from({ length: 12 }, (_, index) => page(index + 1));
    const api = {
      init: async () => undefined,
      search: vi.fn(async (query: string) => ({
        results: (query === 'ферм' ? many : many.slice(0, 2)).map((result) => ({
          data: async () => result,
        })),
      })),
    };
    initSiteSearch(parts.root, async () => api);
    await submit(parts, 'ферма');
    expect(parts.more.hidden).toBe(false);
    await submit(parts, 'ферма 1');
    expect(parts.list.querySelectorAll('a')).toHaveLength(2);
    expect(parts.status.textContent).toBe('Резултати: 2 за „ферма 1“.');
    expect(parts.more.hidden).toBe(true);
  });
});
