// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  canonicalResultUrl,
  fillTemplate,
  initSiteSearch,
  withoutLatinLabel,
} from '@components/search/siteSearch';

interface FakeResult {
  url: string;
  excerpt: string;
  meta: { title?: string; latin?: string };
}

const APPLE: FakeResult = {
  url: '/plodove/yabalki.html',
  excerpt: 'yabalki. <mark>Ябълки</mark> Malus domestica',
  meta: { title: 'Ябълки', latin: 'yabalki' },
};

/** Builds a fake Pagefind API whose search returns `count` copies of `result`. */
function fakePagefind(result: FakeResult, count = 1) {
  return {
    init: vi.fn(async () => undefined),
    search: vi.fn(async () => ({
      results: Array.from({ length: count }, () => ({ data: async () => result })),
    })),
  };
}

/** Renders the markup that `SiteSearch.astro` produces and returns its parts. */
function mount() {
  document.body.innerHTML = `
    <div data-site-search data-loading="Търсене…" data-found="Резултати: {count} за „{query}“."
      data-none="Няма резултати за „{query}“." data-failed="Грешка.">
      <form><input type="search" name="q" /><button type="submit">Търси</button></form>
      <p role="status"></p><ol data-search-results></ol>
    </div>`;
  const root = document.querySelector<HTMLElement>('[data-site-search]');
  const input = document.querySelector<HTMLInputElement>('input');
  const form = document.querySelector<HTMLFormElement>('form');
  const status = document.querySelector<HTMLElement>('[role="status"]');
  const list = document.querySelector<HTMLElement>('[data-search-results]');
  if (!root || !input || !form || !status || !list) throw new Error('markup missing');
  return { root, input, form, status, list };
}

/** Submits the form with `query` and waits for the search to settle. */
async function submit(parts: ReturnType<typeof mount>, query: string) {
  parts.input.value = query;
  parts.form.dispatchEvent(new Event('submit', { cancelable: true }));
  await vi.waitFor(() => expect(parts.status.textContent).not.toBe('Търсене…'));
}

beforeEach(() => {
  window.history.replaceState(null, '', '/tarsene');
});

describe('site search helpers', () => {
  it('QA 016: fills status templates and keeps unknown placeholders', () => {
    expect(fillTemplate('{count} за „{query}“ {x}', { count: '3', query: 'круши' })).toBe(
      '3 за „круши“ {x}',
    );
  });

  it('QA 016: removes the .html suffix of result URLs', () => {
    expect(canonicalResultUrl('/plodove/yabalki.html')).toBe('/plodove/yabalki');
    expect(canonicalResultUrl('/plodove')).toBe('/plodove');
  });

  it('QA 016: removes the indexed Latin label from an excerpt, marked or not', () => {
    expect(withoutLatinLabel('yabalki. <mark>Ябълки</mark> Malus', 'yabalki')).toBe(
      '<mark>Ябълки</mark> Malus',
    );
    expect(withoutLatinLabel('<mark>vitamin</mark> c. Витамин C', 'vitamin c')).toBe('Витамин C');
    expect(withoutLatinLabel('Текст без етикет', 'yabalki')).toBe('Текст без етикет');
    expect(withoutLatinLabel('Текст', undefined)).toBe('Текст');
  });
});

describe('initSiteSearch', () => {
  it('QA 016: renders results with clean links and excerpts and announces the shown count', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () => fakePagefind(APPLE, 15));
    await submit(parts, 'ябълки');
    const links = [...parts.list.querySelectorAll('a')];
    expect(links).toHaveLength(10);
    expect(links[0]?.getAttribute('href')).toBe('/plodove/yabalki');
    expect(links[0]?.textContent).toBe('Ябълки');
    expect(parts.list.querySelector('p')?.innerHTML).toBe('<mark>Ябълки</mark> Malus domestica');
    expect(parts.status.textContent).toBe('Резултати: 10 за „ябълки“.');
    expect(new URL(window.location.href).searchParams.get('q')).toBe('ябълки');
  });

  it('QA 016: an empty query clears the results, the status and the URL', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () => fakePagefind(APPLE));
    await submit(parts, 'ябълки');
    parts.input.value = '  ';
    parts.form.dispatchEvent(new Event('submit', { cancelable: true }));
    await vi.waitFor(() => expect(parts.status.textContent).toBe(''));
    expect(parts.list.children).toHaveLength(0);
    expect(window.location.search).toBe('');
  });

  it('QA 016: reports no results', async () => {
    const parts = mount();
    initSiteSearch(parts.root, async () => fakePagefind(APPLE, 0));
    await submit(parts, 'щзх');
    expect(parts.status.textContent).toBe('Няма резултати за „щзх“.');
  });

  it('QA 016: reports a load failure and retries on the next query', async () => {
    const parts = mount();
    const loader = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue(fakePagefind(APPLE));
    initSiteSearch(parts.root, loader);
    await submit(parts, 'ябълки');
    expect(parts.status.textContent).toBe('Грешка.');
    await submit(parts, 'ябълки');
    expect(parts.status.textContent).toBe('Резултати: 1 за „ябълки“.');
    expect(loader).toHaveBeenCalledTimes(2);
  });

  it('QA 016: a newer query wins over a slower earlier one', async () => {
    const parts = mount();
    let release: () => void = () => undefined;
    const slow = new Promise<void>((resolve) => {
      release = resolve;
    });
    const api = {
      init: async () => undefined,
      search: vi.fn(async (query: string) => {
        if (query === 'бавно') await slow;
        return { results: [{ data: async () => ({ ...APPLE, meta: { title: query } }) }] };
      }),
    };
    initSiteSearch(parts.root, async () => api);
    parts.input.value = 'бавно';
    parts.form.dispatchEvent(new Event('submit', { cancelable: true }));
    await submit(parts, 'круши');
    release();
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(parts.list.querySelector('a')?.textContent).toBe('круши');
    expect(parts.status.textContent).toContain('круши');
  });

  it('QA 016: runs the ?q= query on start and fills the field', async () => {
    window.history.replaceState(null, '', '/tarsene?q=praz');
    const parts = mount();
    initSiteSearch(parts.root, async () => fakePagefind(APPLE));
    await vi.waitFor(() => expect(parts.status.textContent).toContain('praz'));
    expect(parts.input.value).toBe('praz');
  });
});
