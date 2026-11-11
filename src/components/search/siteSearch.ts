/** URL of the Pagefind browser bundle written by `pagefind --site dist`. */
const PAGEFIND_URL = '/pagefind/pagefind.js';
const MAX_RESULTS = 10;
const DEBOUNCE_MS = 200;
const HTML_SUFFIX = /\.html$/;
const QUERY_PARAM = 'q';

/** The parts of a Pagefind result's data that the search page shows. */
interface PagefindResultData {
  readonly url: string;
  readonly excerpt: string;
  readonly meta: { readonly title?: string; readonly latin?: string };
}

/** The parts of the Pagefind browser API that the search page uses. */
export interface PagefindApi {
  init(): Promise<void>;
  search(query: string): Promise<{
    readonly results: ReadonlyArray<{ data(): Promise<PagefindResultData> }>;
  } | null>;
}

/**
 * Replaces `{name}` placeholders in a status template.
 * @param template - Text such as „Резултати: {count} за „{query}“.“.
 * @param values - Placeholder values by name.
 */
export function fillTemplate(template: string, values: Readonly<Record<string, string>>): string {
  return template.replace(/\{(\w+)\}/g, (match, name: string) => values[name] ?? match);
}

/**
 * Returns the site URL of a result: Pagefind reports the built `name.html` file, the site
 * serves it without the suffix.
 * @param url - Result URL from Pagefind.
 */
export function canonicalResultUrl(url: string): string {
  return url.replace(HTML_SUFFIX, '');
}

/** Loads the Pagefind browser API. */
export type PagefindLoader = () => Promise<PagefindApi>;

const loadPagefind: PagefindLoader = () => import(/* @vite-ignore */ PAGEFIND_URL);

/**
 * Removes the indexed Latin label (e.g. „yabalki. “) that Pagefind puts at the start of a page's
 * content, with or without `<mark>` tags around its words.
 * @param excerpt - Pagefind excerpt (HTML-encoded, with `<mark>` tags).
 * @param latin - The page's `latin` metadata.
 */
export function withoutLatinLabel(excerpt: string, latin: string | undefined): string {
  if (latin === undefined || latin === '') return excerpt;
  const words = latin.split(' ').map((word) => `(?:<mark>)?${word}(?:</mark>)?`);
  return excerpt.replace(new RegExp(`^\\s*${words.join('\\s+')}\\.\\s*`), '');
}

/**
 * Wires the search form inside `root` to the Pagefind index: loads Pagefind on the first focus,
 * input or `?q=` query, searches while typing, keeps `?q=` in the address bar and announces the
 * outcome in the status line.
 * @param root - Element rendered by `SiteSearch.astro`, with the status templates as data attributes.
 * @param loader - Loads the Pagefind API; a failed load is retried on the next query.
 */
export function initSiteSearch(root: HTMLElement, loader: PagefindLoader = loadPagefind): void {
  const form = root.querySelector('form');
  const input = root.querySelector<HTMLInputElement>('input[type="search"]');
  const status = root.querySelector<HTMLElement>('[role="status"]');
  const list = root.querySelector<HTMLOListElement>('[data-search-results]');
  if (form === null || input === null || status === null || list === null) return;

  const text = {
    loading: root.dataset.loading ?? '',
    found: root.dataset.found ?? '',
    none: root.dataset.none ?? '',
    failed: root.dataset.failed ?? '',
  };
  let pagefind: Promise<PagefindApi> | undefined;
  let latest = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const load = (): Promise<PagefindApi> => {
    pagefind ??= loader()
      .then(async (api) => {
        await api.init();
        return api;
      })
      .catch((error: unknown) => {
        pagefind = undefined;
        throw error;
      });
    return pagefind;
  };

  const render = (items: ReadonlyArray<PagefindResultData>): void => {
    list.replaceChildren(
      ...items.map((item) => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.href = canonicalResultUrl(item.url);
        link.textContent = item.meta.title ?? link.href;
        const excerpt = document.createElement('p');
        excerpt.innerHTML = withoutLatinLabel(item.excerpt, item.meta.latin);
        li.append(link, excerpt);
        return li;
      }),
    );
  };

  const run = async (raw: string): Promise<void> => {
    const query = raw.trim();
    const id = ++latest;
    const url = new URL(window.location.href);
    if (query === '') url.searchParams.delete(QUERY_PARAM);
    else url.searchParams.set(QUERY_PARAM, query);
    window.history.replaceState(null, '', url);
    if (query === '') {
      status.textContent = '';
      list.replaceChildren();
      return;
    }
    status.textContent = text.loading;
    try {
      const api = await load();
      const search = await api.search(query);
      const results = search?.results ?? [];
      const items = await Promise.all(results.slice(0, MAX_RESULTS).map((result) => result.data()));
      if (id !== latest) return;
      render(items);
      status.textContent =
        items.length === 0
          ? fillTemplate(text.none, { query })
          : fillTemplate(text.found, { count: String(items.length), query });
    } catch {
      if (id !== latest) return;
      list.replaceChildren();
      status.textContent = text.failed;
    }
  };

  input.addEventListener('focus', () => void load().catch(() => undefined), { once: true });
  input.addEventListener('input', () => {
    clearTimeout(timer);
    timer = setTimeout(() => void run(input.value), DEBOUNCE_MS);
  });
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    clearTimeout(timer);
    void run(input.value);
  });

  const initial = new URL(window.location.href).searchParams.get(QUERY_PARAM) ?? '';
  if (initial.trim() !== '') {
    input.value = initial;
    void run(initial);
  }
}
